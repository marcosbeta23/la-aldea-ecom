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

    const { description, amount, currency, customer_name, customer_phone, payment_method, notes } = validation.data;

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
        subtotal: amount,
        discount_amount: 0,
        total: amount,
        currency: currency || 'UYU',
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

    // Insert a single line item representing the free-form sale
    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert({
        order_id: (order as any).id,
        product_id: null,
        product_name: description,
        quantity: 1,
        unit_price: amount,
        currency: currency || 'UYU',
        subtotal: amount,
      } as any);

    if (itemsError) {
      // Rollback
      await supabaseAdmin.from('orders').delete().eq('id', (order as any).id);
      console.error('Counter sale items failed:', itemsError);
      return NextResponse.json({ error: 'Error al guardar la venta' }, { status: 500 });
    }

    // Telegram alert
    const prefix = currency === 'USD' ? 'US$' : '$';
    await sendTelegramAlert(
      `🏪 <b>Venta Mostrador</b> ${order_number}\n` +
      `💰 ${prefix} ${amount.toLocaleString('es-UY')}\n` +
      `📝 ${description}\n` +
      `💳 ${payment_method}\n` +
      `👤 ${customer_name || 'Cliente mostrador'}`
    );

    return NextResponse.json({
      success: true,
      order_id: (order as any).id,
      order_number,
      total: amount,
      currency,
    });
  } catch (error) {
    console.error('Counter sale error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
