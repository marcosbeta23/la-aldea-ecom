import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { CreateOrderSchema } from '@/lib/validators';
import { ordersLimiter } from '@/lib/rate-limit';
import { ordersRatelimit, getClientIp } from '@/lib/redis';
import { alertNewOrder, alertNewTransferOrder } from '@/lib/telegram';
import { getExchangeRate, convertPrice } from '@/lib/exchange-rate';
import { sendTransferOrderConfirmation } from '@/lib/email';
import { verifyOrderToken } from '@/lib/order-token';
import { inngest } from '@/lib/inngest';

// Cloudflare Turnstile verification (skipped when env var not configured)
async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // graceful degradation if not configured
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, response: token }),
    });
    const data = await res.json();
    return data.success === true;
  } catch {
    // If Turnstile API is unreachable, allow through to avoid blocking real users
    return true;
  }
}

// SECURE ORDER CREATION
// This version NEVER trusts frontend prices
// All calculations done server-side using database as source of truth

export async function POST(request: NextRequest) {
  // RATE LIMITING - Max 5 orders per minute per IP
  const ip = getClientIp(request);

  // Prefer Upstash distributed rate limiter; fall back to in-memory LRU
  if (ordersRatelimit) {
    const { success } = await ordersRatelimit.limit(ip);
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again in a minute.' },
        { status: 429 }
      );
    }
  } else {
    try {
      await ordersLimiter.check(5, ip);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again in a minute.' },
        { status: 429 }
      );
    }
  }
  try {
    const body = await request.json();

    // VALIDATE INPUT WITH ZOD
    const validation = CreateOrderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validation.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const { items, couponCode, customer, turnstile_token } = validation.data;

    // Turnstile CAPTCHA (only enforced when TURNSTILE_SECRET_KEY is set)
    if (process.env.TURNSTILE_SECRET_KEY && turnstile_token) {
      const isHuman = await verifyTurnstile(turnstile_token);
      if (!isHuman) {
        return NextResponse.json(
          { success: false, error: 'Verificación de seguridad fallida. Recargá la página e intentá de nuevo.' },
          { status: 403 }
        );
      }
    }

    // Email-based rate limit (in addition to IP-based limit above)
    const emailKey = `order:email:${(customer.email || customer.phone).toLowerCase()}`;
    if (ordersRatelimit) {
      const { success } = await ordersRatelimit.limit(emailKey);
      if (!success) {
        return NextResponse.json(
          { success: false, error: 'Demasiados pedidos. Por favor esperá un momento antes de intentar nuevamente.' },
          { status: 429 }
        );
      }
    }

    // Pending order cap: max 5 pending orders per email in the last hour
    if (customer.email) {
      const { count } = await (supabaseAdmin as any)
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('customer_email', customer.email.toLowerCase())
        .eq('status', 'pending')
        .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());

      if ((count ?? 0) >= 5) {
        return NextResponse.json(
          {
            success: false,
            error: 'Tenés pedidos pendientes de pago. Completá uno o esperá unos minutos antes de crear otro.',
          },
          { status: 429 }
        );
      }
    }
    const paymentCurrency = customer.payment_currency || 'UYU';

    // FETCH PRODUCTS FROM DATABASE (source of truth)
    const productIds = items.map((item: any) => item.id);
    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select('id, sku, name, price_numeric, currency, stock, is_active, availability_type')
      .in('id', productIds) as { data: any[] | null; error: any };

    if (productsError || !products) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch products' },
        { status: 500 }
      );
    }

    // FETCH EXCHANGE RATE if needed
    // Always fetch rate when ANY product is USD or payment is USD,
    // since MercadoPago Uruguay only accepts UYU preferences.
    const productCurrencies = new Set(products.map((p: any) => p.currency || 'UYU'));
    const hasUSD = productCurrencies.has('USD') || paymentCurrency === 'USD';
    const needsConversion = productCurrencies.size > 1 || !productCurrencies.has(paymentCurrency) || hasUSD;
    let exchangeRate: number | null = null;

    if (needsConversion) {
      try {
        const rateData = await getExchangeRate();
        exchangeRate = rateData.rate;
      } catch {
        return NextResponse.json(
          { success: false, error: 'No se pudo obtener el tipo de cambio. Intentá nuevamente.' },
          { status: 503 }
        );
      }
    }

    // RECALCULATE TOTAL in payment currency (DO NOT trust frontend prices)
    let subtotal = 0;
    const orderItems: any[] = [];

    for (const item of items) {
      // Find product in database
      const product: any = products.find((p: any) => p.id === item.id);

      if (!product) {
        return NextResponse.json(
          { success: false, error: `Product ${item.id} not found` },
          { status: 404 }
        );
      }

      if (!product.is_active) {
        return NextResponse.json(
          { success: false, error: `Product ${product.name} is not available` },
          { status: 400 }
        );
      }

      // Block on_request products from checkout
      if (product.availability_type === 'on_request') {
        return NextResponse.json(
          { success: false, error: `${product.name} es solo bajo consulta` },
          { status: 400 }
        );
      }

      // Verify stock BEFORE creating order
      if (product.stock < item.quantity) {
        // PostHog stock collision event (client will track)
        return NextResponse.json(
          {
            success: false,
            error: 'stock_collision',
            productId: product.id,
            productName: product.name,
            available: product.stock
          },
          { status: 409 }
        );
      }

      // Validate price is valid (prevents MP rejection from null/0/NaN prices)
      if (!product.price_numeric || product.price_numeric <= 0 || isNaN(Number(product.price_numeric))) {
        return NextResponse.json(
          { success: false, error: `Precio inválido para ${product.name}` },
          { status: 400 }
        );
      }

      // Convert price to payment currency if needed
      const productCurrency = product.currency || 'UYU';
      const unitPriceConverted = exchangeRate && productCurrency !== paymentCurrency
        ? convertPrice(product.price_numeric, productCurrency, paymentCurrency, exchangeRate)
        : product.price_numeric;

      // Calculate with converted price in payment currency
      const itemSubtotal = unitPriceConverted * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        quantity: item.quantity,
        unit_price: product.price_numeric, // Original price from DB
        currency: productCurrency, // Original currency from DB
        unit_price_converted: productCurrency !== paymentCurrency ? unitPriceConverted : null,
        subtotal: itemSubtotal, // Subtotal in payment currency
      });
    }

    // VALIDATE COUPON (if provided)
    let discountAmount = 0;
    let validatedCoupon: any = null;

    if (couponCode) {
      const couponResult = await validateCoupon(couponCode, subtotal);

      if (!couponResult.valid) {
        return NextResponse.json(
          { success: false, error: couponResult.error || 'Invalid coupon' },
          { status: 400 }
        );
      }

      discountAmount = couponResult.discount_amount || 0;
      validatedCoupon = couponResult.coupon;
    }

    // CALCULATE FINAL TOTAL
    const finalTotal = subtotal - discountAmount;

    if (finalTotal <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid total amount' },
        { status: 400 }
      );
    }

    // GENERATE ORDER NUMBER
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const order_number = `LA-${timestamp}-${random}`;

    // Determine payment method
    const paymentMethod = customer.payment_method || 'mercadopago';

    // CREATE ORDER IN DATABASE
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        order_number: order_number,
        customer_name: customer.name,
        customer_email: customer.email || null,
        customer_phone: customer.phone,
        shipping_address: customer.shipping_address || null,
        shipping_city: customer.shipping_city || null,
        shipping_department: customer.shipping_department || null,
        shipping_type: customer.shipping_type || 'dac',
        shipping_cost: customer.shipping_cost || 0,
        notes: customer.notes || null,
        subtotal: subtotal,
        discount_amount: discountAmount,
        coupon_code: validatedCoupon?.code || null,
        total: finalTotal, // THIS is the amount in payment currency
        currency: paymentMethod === 'mercadopago' ? 'UYU' : paymentCurrency,
        exchange_rate_used: exchangeRate,
        status: 'pending',
        payment_method: paymentMethod,
        // Invoice/Billing fields
        invoice_type: customer.invoice_type || 'consumer_final',
        invoice_tax_id: customer.invoice_tax_id || null,
        invoice_business_name: customer.invoice_business_name || null,
      } as any)
      .select()
      .single();

    if (orderError || !order) {
      console.error('Order creation failed:', orderError);
      return NextResponse.json(
        { success: false, error: 'Failed to create order' },
        { status: 500 }
      );
    }

    // 8️⃣ INSERT ORDER ITEMS
    const itemsWithOrderId = orderItems.map((item: any) => ({
      ...item,
      order_id: (order as any).id,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(itemsWithOrderId as any);

    if (itemsError) {
      console.error('Order items creation failed:', itemsError);
      // Rollback: delete order
      await supabaseAdmin.from('orders').delete().eq('id', (order as any).id);
      return NextResponse.json(
        { success: false, error: 'Failed to create order items' },
        { status: 500 }
      );
    }

    // NOTE: For MercadoPago orders, coupon usage (current_uses) is incremented
    // in the webhook after payment is confirmed, to avoid counting abandoned payments.
    // For bank transfer orders, we increment here since there's no webhook.
    if (validatedCoupon && paymentMethod === 'transfer') {
      await (supabaseAdmin as any)
        .from('discount_coupons')
        .update({
          current_uses: (validatedCoupon.current_uses || 0) + 1
        })
        .eq('id', validatedCoupon.id);
    }

    // 9️⃣ HANDLE PAYMENT METHOD
    if (paymentMethod === 'transfer') {
      // Bank transfer: no MercadoPago, return order info only
      console.log('🏦 Bank transfer order created:', (order as any).order_number);

      // Telegram alerts (fire-and-forget)
      alertNewOrder((order as any).order_number, finalTotal, customer.name, paymentCurrency).catch(() => { });
      alertNewTransferOrder((order as any).order_number, finalTotal, customer.name, paymentCurrency).catch(() => { });

      // Send customer confirmation email with bank transfer details
      if (customer.email) {
        try {
          const emailSent = await sendTransferOrderConfirmation({
            order: order as any,
            items: orderItems.map((i: any) => ({
              product_name: i.product_name,
              quantity: i.quantity,
              unit_price: i.unit_price,
              subtotal: i.subtotal,
            })) as any,
          });
          if (!emailSent) {
            console.warn('[Email] Transfer confirmation returned false for order', (order as any).order_number);
          } else {
            console.log('[Email] Transfer confirmation sent for order', (order as any).order_number);
          }
        } catch (err) {
          console.error('[Email] Crash sending transfer confirmation:', err);
        }
      }

      // Fire bank transfer reminder event (24h delay handled by Inngest)
      inngest.send({
        name: 'order/transfer.created',
        data: {
          orderId: (order as any).id,
          orderNumber: (order as any).order_number,
          customerEmail: customer.email ?? null,
          customerName: customer.name,
          total: finalTotal,
          currency: paymentCurrency,
        },
      }).catch(() => {});

      return NextResponse.json({
        success: true,
        order_id: (order as any).id,
        order_number: (order as any).order_number,
        payment_method: 'transfer',
        currency: paymentCurrency,
      });
    }

    // MercadoPago flow
    // Final safety check: validate all order items have valid prices before MP payload
    for (const item of orderItems) {
      if (!item.unit_price || item.unit_price <= 0 || isNaN(Number(item.unit_price))) {
        return NextResponse.json(
          { success: false, error: `Precio inválido para ${item.product_name}` },
          { status: 400 }
        );
      }
    }

    // Use APP_URL for server-side (NEXT_PUBLIC_URL only works client-side)
    const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    const isLocalhost = appUrl.includes('localhost') || appUrl.includes('127.0.0.1');

    // MercadoPago Uruguay only supports UYU — convert all prices to UYU for MP
    const mpPayload: any = {
      items: orderItems.map((item: any) => {
        // Convert to UYU for MercadoPago if item is in a different currency
        let mpUnitPrice: number;
        if (paymentCurrency === 'UYU') {
          // Already in UYU (possibly converted earlier)
          mpUnitPrice = Number(item.unit_price_converted || item.unit_price);
        } else if (paymentCurrency === 'USD' && exchangeRate) {
          // Customer chose USD — convert to UYU for MP
          const priceInPaymentCurrency = Number(item.unit_price_converted || item.unit_price);
          mpUnitPrice = Math.round(priceInPaymentCurrency * exchangeRate * 100) / 100;
        } else {
          mpUnitPrice = Number(item.unit_price);
        }

        return {
          id: item.product_id,
          title: item.product_name,
          unit_price: mpUnitPrice,
          quantity: item.quantity,
          currency_id: 'UYU', // MercadoPago Uruguay only supports UYU
        };
      }),
      external_reference: (order as any).id, // To find order in webhook
      back_urls: {
        success: `${appUrl}/gracias?order_id=${(order as any).id}`,
        failure: `${appUrl}/error`,
        pending: `${appUrl}/pendiente`,
      },
      notification_url: `${appUrl}/api/webhooks/mercadopago`,
      payer: {
        name: customer.name,
        email: customer.email,
        phone: { number: customer.phone },
      },
    };

    // Only add auto_return for production URLs (MercadoPago rejects localhost)
    if (!isLocalhost) {
      mpPayload.auto_return = 'approved';
    }

    console.log('🔵 Creating MercadoPago preference with:', {
      appUrl,
      isLocalhost,
      auto_return: mpPayload.auto_return || 'DISABLED (localhost)',
      back_urls: mpPayload.back_urls,
      items_count: mpPayload.items.length,
      order_id: (order as any).id
    });

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mpPayload),
    });

    if (!mpResponse.ok) {
      const mpError = await mpResponse.json();
      console.error('❌ MercadoPago error:', JSON.stringify(mpError));
      console.error('❌ Request payload was:', JSON.stringify(mpPayload));

      // Rollback: delete order and items
      await supabaseAdmin.from('order_items').delete().eq('order_id', (order as any).id);
      await supabaseAdmin.from('orders').delete().eq('id', (order as any).id);

      return NextResponse.json(
        { success: false, error: 'Payment gateway error' },
        { status: 500 }
      );
    }

    const mpData = await mpResponse.json();
    console.log('✅ MercadoPago preference created:', mpData.id);

    // Telegram alert for new order (fire-and-forget)
    alertNewOrder((order as any).order_number, finalTotal, customer.name, paymentCurrency).catch(() => { });

    // 🔟 UPDATE ORDER WITH PREFERENCE ID
    const { error: updateError } = await (supabaseAdmin as any)
      .from('orders')
      .update({ mp_preference_id: mpData.id })
      .eq('id', (order as any).id);

    if (updateError) {
      console.error('Failed to update order with preference ID:', updateError);
    }

    // ✅ RETURN RESPONSE
    return NextResponse.json({
      success: true,
      order_id: (order as any).id,
      order_number: (order as any).order_number,
      init_point: mpData.init_point,
      preference_id: mpData.id,
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to validate coupon
async function validateCoupon(code: string, subtotal: number) {
  const { data: coupon } = await supabaseAdmin
    .from('discount_coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single() as { data: any };

  if (!coupon) {
    return { valid: false, error: 'Coupon not found' };
  }

  const couponData: any = coupon;

  // Check expiration
  if (couponData.valid_until && new Date(couponData.valid_until) < new Date()) {
    return { valid: false, error: 'Coupon expired' };
  }

  // Check minimum purchase
  if (subtotal < couponData.min_purchase_amount) {
    return {
      valid: false,
      error: `Minimum purchase amount: $${couponData.min_purchase_amount}`
    };
  }

  // Check usage limit
  if (couponData.max_uses && couponData.current_uses >= couponData.max_uses) {
    return { valid: false, error: 'Coupon usage limit reached' };
  }

  // Calculate discount
  let discount_amount = 0;
  if (couponData.discount_type === 'percentage') {
    discount_amount = (subtotal * couponData.discount_value) / 100;
  } else {
    discount_amount = couponData.discount_value;
  }

  // Don't allow discount greater than subtotal
  discount_amount = Math.min(discount_amount, subtotal);

  return {
    valid: true,
    discount_amount,
    coupon: couponData,
  };
}

// GET order — Fix #1: Require signed HMAC token to prevent IDOR
// Public (unauthenticated) access requires ?email=&token= query params.
// Admin-only routes (/api/admin/orders) bypass this and use Clerk auth.
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get('order_number');
    const orderId = searchParams.get('order_id');
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!orderNumber && !orderId) {
      return NextResponse.json(
        { error: 'Order number or ID required' },
        { status: 400 }
      );
    }

    // Require signed token + email for public order lookups
    if (!token || !email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch order first to get the orderId for token validation
    let query = (supabaseAdmin as any)
      .from('orders')
      .select('id, order_number, status, customer_name, shipping_address, total, created_at, customer_email')
      .eq('customer_email', email.toLowerCase().trim()); // DB-level ownership check

    if (orderId) {
      query = query.eq('id', orderId);
    } else {
      query = query.eq('order_number', orderNumber);
    }

    const { data: order, error } = await query.single();

    if (error || !order) {
      // Return 401 not 404 to avoid confirming/denying existence
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify HMAC token against the found order ID
    if (!verifyOrderToken(order.id, email.toLowerCase().trim(), token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return limited fields (never return full PII unnecessarily)
    const { customer_email: _omit, ...safeOrder } = order;
    return NextResponse.json({ order: safeOrder });
  } catch (error) {
    console.error('Get order error:', error);
    return NextResponse.json(
      { error: 'Failed to get order' },
      { status: 500 }
    );
  }
}
