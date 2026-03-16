import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getExchangeRate } from '@/lib/exchange-rate';

export const dynamic = 'force-dynamic';

const PAID_STATUSES = [
  'paid',
  'processing',
  'shipped',
  'delivered',
  'paid_pending_verification',
  'ready_to_invoice',
  'invoiced',
];

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const startOf30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Fetch exchange rate for combined totals
    let exchangeRate = 0;
    try {
      const rateData = await getExchangeRate();
      exchangeRate = rateData.rate;
    } catch {
      // If exchange rate is unavailable, we still show individual currencies
    }

    // Fetch last 30 days orders (all statuses)
    const { data: ordersData } = await supabaseAdmin
      .from('orders')
      .select(
        'id, order_number, status, total, currency, created_at, customer_name, customer_phone, order_source, payment_method, shipping_department'
      )
      .gte('created_at', startOf30d.toISOString())
      .order('created_at', { ascending: false });

    const orders = (ordersData || []) as Array<{
      id: string;
      order_number: string;
      status: string;
      total: number;
      currency: string | null;
      created_at: string;
      customer_name: string;
      customer_phone: string | null;
      order_source: string | null;
      payment_method: string | null;
      shipping_department: string | null;
    }>;

    // Active products count
    const { count: productsCount } = await supabaseAdmin
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Low-stock products
    const { data: lowStockData } = await supabaseAdmin
      .from('products')
      .select('id, name, sku, stock')
      .eq('is_active', true)
      .lte('stock', 5)
      .gt('stock', 0)
      .order('stock', { ascending: true })
      .limit(6);

    const lowStock = (lowStockData || []) as Array<{
      id: string;
      name: string;
      sku: string;
      stock: number;
    }>;

    // --- Calculate stats ---
    const getCurrency = (o: { currency: string | null }) =>
      o.currency || 'UYU';

    const paidOrders = orders.filter((o) => PAID_STATUSES.includes(o.status));
    const todayOrders = orders.filter(
      (o) => new Date(o.created_at) >= startOfToday
    );
    const todayPaid = paidOrders.filter(
      (o) => new Date(o.created_at) >= startOfToday
    );

    // 30-day revenue per currency
    const revenueUYU = paidOrders
      .filter((o) => getCurrency(o) === 'UYU')
      .reduce((s, o) => s + (o.total || 0), 0);
    const revenueUSD = paidOrders
      .filter((o) => getCurrency(o) === 'USD')
      .reduce((s, o) => s + (o.total || 0), 0);

    // Today revenue per currency
    const todayRevenueUYU = todayPaid
      .filter((o) => getCurrency(o) === 'UYU')
      .reduce((s, o) => s + (o.total || 0), 0);
    const todayRevenueUSD = todayPaid
      .filter((o) => getCurrency(o) === 'USD')
      .reduce((s, o) => s + (o.total || 0), 0);

    // Status counts (across entire 30d period)
    const pendingOrders = orders.filter((o) => o.status === 'pending');
    const toVerify = orders.filter(
      (o) => o.status === 'paid_pending_verification'
    );
    const toInvoice = orders.filter((o) => o.status === 'ready_to_invoice');

    // Today pending
    const todayPending = todayOrders.filter(
      (o) => o.status === 'pending'
    ).length;

    // Avg ticket per currency
    const paidUYU = paidOrders.filter((o) => getCurrency(o) === 'UYU');
    const paidUSD = paidOrders.filter((o) => getCurrency(o) === 'USD');
    const avgTicketUYU = paidUYU.length > 0 ? revenueUYU / paidUYU.length : 0;
    const avgTicketUSD = paidUSD.length > 0 ? revenueUSD / paidUSD.length : 0;

    // Combined store total in UYU (USD converted at exchange rate)
    const combinedRevenueUYU =
      exchangeRate > 0
        ? revenueUYU + revenueUSD * exchangeRate
        : revenueUYU;
    const todayCombinedRevenueUYU =
      exchangeRate > 0
        ? todayRevenueUYU + todayRevenueUSD * exchangeRate
        : todayRevenueUYU;

    // Recent orders (top 15 — more than dashboard had before)
    const recentOrders = orders.slice(0, 15);

    return NextResponse.json({
      today: {
        orders: todayOrders.length,
        paidOrders: todayPaid.length,
        revenueUYU: todayRevenueUYU,
        revenueUSD: todayRevenueUSD,
        combinedRevenueUYU: todayCombinedRevenueUYU,
        pending: todayPending,
      },
      period30d: {
        totalOrders: orders.length,
        paidOrders: paidOrders.length,
        revenueUYU,
        revenueUSD,
        combinedRevenueUYU,
        paidOrdersUYU: paidUYU.length,
        paidOrdersUSD: paidUSD.length,
        avgTicketUYU,
        avgTicketUSD,
        pendingOrders: pendingOrders.length,
        toVerify: toVerify.length,
        toInvoice: toInvoice.length,
      },
      exchangeRate,
      productsCount: productsCount || 0,
      lowStock,
      recentOrders,
      // Pass pending/toVerify/toInvoice arrays for the attention section
      attention: {
        pending: pendingOrders.map((o) => ({
          id: o.id,
          order_number: o.order_number,
        })),
        toVerify: toVerify.map((o) => ({
          id: o.id,
          order_number: o.order_number,
        })),
        toInvoice: toInvoice.map((o) => ({
          id: o.id,
          order_number: o.order_number,
        })),
      },
    });
  } catch (error: any) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { error: error.message || 'Error fetching dashboard data' },
      { status: 500 }
    );
  }
}
