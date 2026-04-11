import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { CreateOrderSchema } from '@/lib/validators';
import rateLimit from '@/lib/rate-limit';
import { ordersRatelimit, getClientIp } from '@/lib/redis';
import { alertNewOrder, alertNewTransferOrder } from '@/lib/telegram';
import { getExchangeRate, convertPrice } from '@/lib/exchange-rate';
import { sendTransferOrderConfirmation } from '@/lib/email';
import { verifyOrderToken } from '@/lib/order-token';
import { inngest } from '@/lib/inngest';
import type { Order, OrderItem } from '@/types/database';

const ordersDevLimiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
});

type ProductRow = {
  id: string;
  sku: string;
  name: string;
  price_numeric: number;
  currency: string | null;
  stock: number;
  is_active: boolean;
  availability_type: string;
};

type DraftOrderItem = {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  currency: string;
  unit_price_converted: number | null;
  subtotal: number;
};

type CreatedOrder = {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  shipping_address: string | null;
  subtotal: number;
  discount_amount: number;
  total: number;
  currency: string | null;
  stock_reserved: boolean | null;
};

type CouponLookup = {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_purchase_amount: number | null;
  max_uses: number | null;
  current_uses: number | null;
  valid_until: string | null;
};

type PublicOrderLookup = {
  id: string;
  order_number: string;
  status: string;
  customer_name: string;
  shipping_address: string | null;
  total: number;
  created_at: string;
  customer_email: string | null;
};

type OrdersFilterQuery<T> = {
  eq: (column: string, value: unknown) => OrdersFilterQuery<T>;
  gte: (column: string, value: string) => Promise<{ count: number | null }>;
  single: () => Promise<{ data: T | null; error: unknown }>;
};

const ordersTable = supabaseAdmin.from('orders') as unknown as {
  select: (columns: string, options?: { count?: 'exact'; head?: boolean }) => OrdersFilterQuery<PublicOrderLookup>;
  insert: (values: Record<string, unknown>) => {
    select: (columns: string) => {
      single: () => Promise<{ data: CreatedOrder | null; error: unknown }>;
    };
  };
  update: (values: Record<string, unknown>) => {
    eq: (column: 'id', value: string) => Promise<{ error: unknown }>;
  };
  delete: () => {
    eq: (column: 'id', value: string) => Promise<unknown>;
  };
};

const orderItemsWriteTable = supabaseAdmin.from('order_items') as unknown as {
  insert: (values: Array<Record<string, unknown>>) => Promise<{ error: unknown }>;
};

const couponsWriteTable = supabaseAdmin.from('discount_coupons') as unknown as {
  update: (values: { current_uses: number }) => {
    eq: (column: 'id', value: string) => Promise<unknown>;
  };
};

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

  if (ordersRatelimit) {
    try {
      const { success } = await ordersRatelimit.limit(ip);
      if (!success) {
        return NextResponse.json(
          { success: false, error: 'Too many requests. Please try again in a minute.' },
          { status: 429 }
        );
      }
    } catch {
      return NextResponse.json(
        { success: false, error: 'Service temporarily unavailable.' },
        { status: 503 }
      );
    }
  } else if (process.env.NODE_ENV !== 'production') {
    try {
      await ordersDevLimiter.check(5, ip);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again in a minute.' },
        { status: 429 }
      );
    }
  } else {
    console.error('ordersRatelimit unavailable in production');
    return NextResponse.json(
      { success: false, error: 'Service temporarily unavailable.' },
      { status: 503 }
    );
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
      try {
        const { success } = await ordersRatelimit.limit(emailKey);
        if (!success) {
          return NextResponse.json(
            { success: false, error: 'Demasiados pedidos. Por favor esperá un momento antes de intentar nuevamente.' },
            { status: 429 }
          );
        }
      } catch {
        return NextResponse.json(
          { success: false, error: 'Service temporarily unavailable.' },
          { status: 503 }
        );
      }
    }

    // Pending order cap: max 5 pending orders per email in the last hour
    if (customer.email) {
      const { count } = await ordersTable
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
    const productIds = items.map((item) => item.id);
    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select('id, sku, name, price_numeric, currency, stock, is_active, availability_type')
      .in('id', productIds);

    if (productsError || !products) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch products' },
        { status: 500 }
      );
    }

    // FETCH EXCHANGE RATE if needed
    // Always fetch rate when ANY product is USD or payment is USD,
    // since MercadoPago Uruguay only accepts UYU preferences.
    const typedProducts = products as ProductRow[];
    const productCurrencies = new Set(typedProducts.map((p) => p.currency || 'UYU'));
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
    const orderItems: DraftOrderItem[] = [];

    for (const item of items) {
      // Find product in database
      const product = typedProducts.find((p) => p.id === item.id);

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
    let validatedCoupon: CouponLookup | null = null;

    if (couponCode) {
      const couponResult = await validateCoupon(couponCode, subtotal);

      if (!couponResult.valid) {
        return NextResponse.json(
          { success: false, error: couponResult.error || 'Invalid coupon' },
          { status: 400 }
        );
      }

      discountAmount = couponResult.discount_amount || 0;
      validatedCoupon = couponResult.coupon ?? null;
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
    const { data: order, error: orderError } = await ordersTable
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
      })
      .select('id, order_number, created_at, status, customer_name, customer_email, customer_phone, shipping_address, subtotal, discount_amount, total, currency, stock_reserved')
      .single() as { data: CreatedOrder | null; error: unknown };

    if (orderError || !order) {
      console.error('Order creation failed:', orderError);
      return NextResponse.json(
        { success: false, error: 'Failed to create order' },
        { status: 500 }
      );
    }

    const createdOrder = order;

    // 8️⃣ INSERT ORDER ITEMS
    const itemsWithOrderId = orderItems.map((item) => ({
      ...item,
      order_id: createdOrder.id,
    }));

    const { error: itemsError } = await orderItemsWriteTable.insert(itemsWithOrderId as Array<Record<string, unknown>>);

    if (itemsError) {
      console.error('Order items creation failed:', itemsError);
      // Rollback: delete order
      await ordersTable.delete().eq('id', createdOrder.id);
      return NextResponse.json(
        { success: false, error: 'Failed to create order items' },
        { status: 500 }
      );
    }

    // NOTE: For MercadoPago orders, coupon usage (current_uses) is incremented
    // in the webhook after payment is confirmed, to avoid counting abandoned payments.
    // For bank transfer orders, we increment here since there's no webhook.
    if (validatedCoupon && paymentMethod === 'transfer') {
      await couponsWriteTable
        .update({
          current_uses: (validatedCoupon.current_uses || 0) + 1,
        })
        .eq('id', validatedCoupon.id);
    }

    // 9️⃣ HANDLE PAYMENT METHOD
    if (paymentMethod === 'transfer') {
      // Bank transfer: no MercadoPago, return order info only
      console.log('🏦 Bank transfer order created:', createdOrder.order_number);

      // Telegram alerts (fire-and-forget)
      alertNewOrder(createdOrder.order_number, finalTotal, customer.name, paymentCurrency).catch(() => { });
      alertNewTransferOrder(createdOrder.order_number, finalTotal, customer.name, paymentCurrency).catch(() => { });

      // Send customer confirmation email with bank transfer details
      if (customer.email) {
        try {
          const emailSent = await sendTransferOrderConfirmation({
            order: createdOrder as unknown as Order,
            items: orderItems.map((i) => ({
              product_name: i.product_name,
              quantity: i.quantity,
              unit_price: i.unit_price,
              subtotal: i.subtotal,
            })) as unknown as OrderItem[],
          });
          if (!emailSent) {
            console.warn('[Email] Transfer confirmation returned false for order', createdOrder.order_number);
          } else {
            console.log('[Email] Transfer confirmation sent for order', createdOrder.order_number);
          }
        } catch (err) {
          console.error('[Email] Crash sending transfer confirmation:', err);
        }
      }

      // Fire bank transfer reminder event (24h delay handled by Inngest)
      inngest.send({
        name: 'order/transfer.created',
        data: {
          orderId: createdOrder.id,
          orderNumber: createdOrder.order_number,
          customerEmail: customer.email ?? null,
          customerName: customer.name,
          total: finalTotal,
          currency: paymentCurrency,
        },
      }).catch(() => {});

      return NextResponse.json({
        success: true,
        order_id: createdOrder.id,
        order_number: createdOrder.order_number,
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
    const mpPayload: {
      items: Array<{
        id: string;
        title: string;
        unit_price: number;
        quantity: number;
        currency_id: 'UYU';
      }>;
      external_reference: string;
      back_urls: {
        success: string;
        failure: string;
        pending: string;
      };
      notification_url: string;
      payer: {
        name: string;
        email?: string;
        phone: { number: string };
      };
      auto_return?: 'approved';
    } = {
      items: orderItems.map((item) => {
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
      external_reference: createdOrder.id, // To find order in webhook
      back_urls: {
        success: `${appUrl}/gracias?order_id=${createdOrder.id}`,
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
      order_id: createdOrder.id
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
      await supabaseAdmin.from('order_items').delete().eq('order_id', createdOrder.id);
      await supabaseAdmin.from('orders').delete().eq('id', createdOrder.id);

      return NextResponse.json(
        { success: false, error: 'Payment gateway error' },
        { status: 500 }
      );
    }

    const mpData = await mpResponse.json();
    console.log('✅ MercadoPago preference created:', mpData.id);

    // Telegram alert for new order (fire-and-forget)
    alertNewOrder(createdOrder.order_number, finalTotal, customer.name, paymentCurrency).catch(() => { });

    // 🔟 UPDATE ORDER WITH PREFERENCE ID
    const { error: updateError } = await ordersTable
      .update({ mp_preference_id: mpData.id })
      .eq('id', createdOrder.id);

    if (updateError) {
      console.error('Failed to update order with preference ID:', updateError);
    }

    // ✅ RETURN RESPONSE
    return NextResponse.json({
      success: true,
      order_id: createdOrder.id,
      order_number: createdOrder.order_number,
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
    .select('id, code, discount_type, discount_value, min_purchase_amount, max_uses, current_uses, valid_until')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single() as { data: CouponLookup | null };

  if (!coupon) {
    return { valid: false, error: 'Coupon not found' };
  }

  // Check expiration
  if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
    return { valid: false, error: 'Coupon expired' };
  }

  // Check minimum purchase
  if (coupon.min_purchase_amount !== null && subtotal < coupon.min_purchase_amount) {
    return {
      valid: false,
      error: `Minimum purchase amount: $${coupon.min_purchase_amount}`
    };
  }

  // Check usage limit
  const currentUses = coupon.current_uses ?? 0;
  if (coupon.max_uses !== null && currentUses >= coupon.max_uses) {
    return { valid: false, error: 'Coupon usage limit reached' };
  }

  // Calculate discount
  let discount_amount = 0;
  if (coupon.discount_type === 'percentage') {
    discount_amount = (subtotal * coupon.discount_value) / 100;
  } else {
    discount_amount = coupon.discount_value;
  }

  // Don't allow discount greater than subtotal
  discount_amount = Math.min(discount_amount, subtotal);

  return {
    valid: true,
    discount_amount,
    coupon,
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
    let query = ordersTable
      .select('id, order_number, status, customer_name, shipping_address, total, created_at, customer_email')
      .eq('customer_email', email.toLowerCase().trim()); // DB-level ownership check

    if (orderId) {
      query = query.eq('id', orderId);
    } else {
      query = query.eq('order_number', orderNumber || '');
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
    const { customer_email, ...safeOrder } = order;
    void customer_email;
    return NextResponse.json({ order: safeOrder });
  } catch (error) {
    console.error('Get order error:', error);
    return NextResponse.json(
      { error: 'Failed to get order' },
      { status: 500 }
    );
  }
}
