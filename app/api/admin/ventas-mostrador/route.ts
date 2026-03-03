import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { CounterSaleSchema } from '@/lib/validators';
import { sendTelegramAlert } from '@/lib/telegram';

// GET /api/admin/ventas-mostrador — List counter sales
export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 20;
  const offset = (page - 1) * limit;
  const search = searchParams.get('search') || '';
  const period = searchParams.get('period') || '30d';

  // Date filter
  let dateFilter = new Date();
  if (period === '7d') dateFilter.setDate(dateFilter.getDate() - 7);
  else if (period === '30d') dateFilter.setDate(dateFilter.getDate() - 30);
  else if (period === '90d') dateFilter.setDate(dateFilter.getDate() - 90);
  else dateFilter.setFullYear(dateFilter.getFullYear() - 1);

  let query = supabaseAdmin
    .from('orders')
    .select('*, order_items(*)', { count: 'exact' })
    .eq('order_source', 'mostrador')
    .gte('created_at', dateFilter.toISOString())
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) {
    query = query.or(
      `order_number.ilike.%${search}%,customer_name.ilike.%${search}%`
    );
  }

  const { data: orders, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch sales' }, { status: 500 });
  }

  // Today's stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: todayOrders } = await supabaseAdmin
    .from('orders')
    .select('total')
    .eq('order_source', 'mostrador')
    .gte('created_at', today.toISOString());

  const todayTotal = (todayOrders || []).reduce((sum: number, o: any) => sum + (o.total || 0), 0);
  const todayCount = (todayOrders || []).length;

  return NextResponse.json({
    orders,
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
    stats: {
      todayTotal,
      todayCount,
    },
  });
}

// POST /api/admin/ventas-mostrador — Create counter sale
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Validate input
    const validation = CounterSaleSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { items, customer_name, customer_phone, payment_method, notes } = validation.data;

    // Fetch products from DB (server-side price validation)
    const productIds = items.map((item) => item.product_id);
    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select('id, name, price_numeric, currency, stock, is_active')
      .in('id', productIds) as { data: Array<{ id: string; name: string; price_numeric: number; currency: string; stock: number; is_active: boolean }> | null; error: any };

    if (productsError || !products) {
      return NextResponse.json({ error: 'Error al buscar productos' }, { status: 500 });
    }

    // Build order items with DB prices
    let subtotal = 0;
    const orderItems: Array<{
      product_id: string;
      product_name: string;
      quantity: number;
      unit_price: number;
      currency: string;
      subtotal: number;
    }> = [];

    for (const item of items) {
      const product = products.find((p: any) => p.id === item.product_id);

      if (!product) {
        return NextResponse.json(
          { error: `Producto no encontrado: ${item.product_id}` },
          { status: 404 }
        );
      }

      if (!product.is_active) {
        return NextResponse.json(
          { error: `Producto inactivo: ${product.name}` },
          { status: 400 }
        );
      }

      if (!product.price_numeric || product.price_numeric <= 0) {
        return NextResponse.json(
          { error: `Precio inválido para: ${product.name}` },
          { status: 400 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Stock insuficiente para ${product.name}. Disponible: ${product.stock}` },
          { status: 400 }
        );
      }

      const itemSubtotal = product.price_numeric * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        quantity: item.quantity,
        unit_price: product.price_numeric,
        currency: product.currency || 'UYU',
        subtotal: itemSubtotal,
      });
    }

    // Generate order number with VM prefix (Venta Mostrador)
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const order_number = `VM-${timestamp}-${random}`;

    // Create order — status 'delivered' (already fulfilled in-store)
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        order_number,
        customer_name: customer_name || 'Cliente mostrador',
        customer_email: null,
        customer_phone: customer_phone || '',
        shipping_type: 'pickup',
        shipping_cost: 0,
        subtotal,
        discount_amount: 0,
        total: subtotal,
        status: 'delivered',
        payment_method,
        order_source: 'mostrador',
        notes: notes || null,
        meta: { created_by_admin: userId },
        paid_at: new Date().toISOString(),
        invoice_type: 'consumer_final',
      } as any)
      .select()
      .single();

    if (orderError || !order) {
      console.error('Counter sale creation failed:', orderError);
      return NextResponse.json({ error: 'Error al crear la venta' }, { status: 500 });
    }

    // Insert order items
    const itemsWithOrderId = orderItems.map((item) => ({
      ...item,
      order_id: (order as any).id,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(itemsWithOrderId as any);

    if (itemsError) {
      // Rollback
      await supabaseAdmin.from('orders').delete().eq('id', (order as any).id);
      console.error('Counter sale items failed:', itemsError);
      return NextResponse.json({ error: 'Error al guardar los productos' }, { status: 500 });
    }

    // Deduct stock immediately (counter sale = already fulfilled)
    for (const item of orderItems) {
      await (supabaseAdmin as any).rpc('decrement_stock', {
        p_product_id: item.product_id,
        p_quantity: item.quantity,
      }).then(async (res: any) => {
        // If RPC doesn't exist, fallback to manual update
        if (res.error) {
          const { data: current } = await supabaseAdmin
            .from('products')
            .select('stock')
            .eq('id', item.product_id)
            .single();
          if (current) {
            await (supabaseAdmin as any)
              .from('products')
              .update({ stock: Math.max(0, (current as any).stock - item.quantity) })
              .eq('id', item.product_id);
          }
        }
      });
    }

    // Telegram alert
    const itemsList = orderItems
      .map((i) => `  • ${i.product_name} x${i.quantity} — $${i.subtotal.toLocaleString('es-UY')}`)
      .join('\n');

    await sendTelegramAlert(
      `🏪 <b>Venta Mostrador</b> ${order_number}\n` +
      `💰 UYU $${subtotal.toLocaleString('es-UY')}\n` +
      `💳 ${payment_method}\n` +
      `👤 ${customer_name || 'Cliente mostrador'}\n` +
      `📦 Productos:\n${itemsList}`
    );

    return NextResponse.json({
      success: true,
      order_id: (order as any).id,
      order_number,
      total: subtotal,
    });
  } catch (error) {
    console.error('Counter sale error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
