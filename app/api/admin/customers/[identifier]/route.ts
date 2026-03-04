import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/admin/customers/[identifier]
// Returns full customer profile by email or phone

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ identifier: string }> }
) {
  try {
    const { identifier } = await params;
    const decoded = decodeURIComponent(identifier);

    // Determine if identifier is email or phone
    const isEmail = decoded.includes('@');

    // Fetch all orders for this customer
    let query = (supabaseAdmin as any)
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (isEmail) {
      query = query.ilike('customer_email', decoded);
    } else {
      query = query.eq('customer_phone', decoded);
    }

    const { data: orders, error: ordersError } = await query;

    if (ordersError) {
      console.error('Error fetching customer orders:', ordersError);
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Get order items for all orders
    const orderIds = orders.map((o: any) => o.id);
    const { data: allItems } = await (supabaseAdmin as any)
      .from('order_items')
      .select('*')
      .in('order_id', orderIds);

    // Aggregate customer stats
    const paidStatuses = ['paid', 'processing', 'shipped', 'delivered', 'invoiced', 'ready_to_invoice'];
    const paidOrders = orders.filter((o: any) => paidStatuses.includes(o.status));

    let totalSpentUYU = 0;
    let totalSpentUSD = 0;
    for (const order of paidOrders) {
      const total = Number(order.total) || 0;
      if (order.currency === 'USD') {
        totalSpentUSD += total;
      } else {
        totalSpentUYU += total;
      }
    }

    // Most purchased products
    const productCounts = new Map<string, { name: string; quantity: number; revenue: number }>();
    if (allItems) {
      for (const item of allItems) {
        const existing = productCounts.get(item.product_id);
        if (existing) {
          existing.quantity += item.quantity;
          existing.revenue += Number(item.subtotal) || 0;
        } else {
          productCounts.set(item.product_id, {
            name: item.product_name,
            quantity: item.quantity,
            revenue: Number(item.subtotal) || 0,
          });
        }
      }
    }

    const topProducts = Array.from(productCounts.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    // Preferred payment method
    const paymentCounts: Record<string, number> = {};
    for (const order of paidOrders) {
      const method = order.payment_method || 'unknown';
      paymentCounts[method] = (paymentCounts[method] || 0) + 1;
    }
    const preferredPayment = Object.entries(paymentCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown';

    // Build customer profile
    const latestOrder = orders[0];
    const customer = {
      name: latestOrder.customer_name || '',
      email: latestOrder.customer_email || null,
      phone: latestOrder.customer_phone || null,
      identifier: decoded,
      totalOrders: orders.length,
      paidOrders: paidOrders.length,
      totalSpentUYU,
      totalSpentUSD,
      avgOrderValueUYU: paidOrders.length > 0 ? Math.round(totalSpentUYU / paidOrders.length) : 0,
      firstOrder: orders[orders.length - 1]?.created_at || null,
      lastOrder: latestOrder.created_at,
      preferredPayment,
      orders: orders.map((o: any) => ({
        id: o.id,
        order_number: o.order_number,
        status: o.status,
        total: o.total,
        currency: o.currency || 'UYU',
        payment_method: o.payment_method,
        created_at: o.created_at,
        items: (allItems || []).filter((i: any) => i.order_id === o.id).map((i: any) => ({
          product_name: i.product_name,
          quantity: i.quantity,
          subtotal: i.subtotal,
        })),
      })),
      topProducts,
    };

    return NextResponse.json(customer);
  } catch (error: any) {
    console.error('Customer detail API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
