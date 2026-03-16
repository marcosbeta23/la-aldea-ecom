import { supabaseAdmin } from '@/lib/supabase';
import { getExchangeRate } from '@/lib/exchange-rate';

const PAID_STATUSES = [
  'paid',
  'processing',
  'shipped',
  'delivered',
  'paid_pending_verification',
  'ready_to_invoice',
  'invoiced',
];

export async function getDashboardData() {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOf30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Fetch exchange rate
  let exchangeRate = 0;
  try {
    const rateData = await getExchangeRate();
    exchangeRate = rateData.rate;
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
  }

  // Fetch last 30 days orders
  const { data: ordersData, error: ordersError } = await supabaseAdmin
    .from('orders')
    .select('id, order_number, status, total, currency, created_at, customer_name, customer_phone, order_source, payment_method, shipping_department')
    .gte('created_at', startOf30d.toISOString())
    .order('created_at', { ascending: false });

  if (ordersError) throw ordersError;

  const orders = (ordersData || []) as any[];

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

  const lowStock = lowStockData || [];

  // Calculate stats
  const getCurrency = (o: { currency: string | null }) => o.currency || 'UYU';
  const paidOrders = orders.filter((o) => PAID_STATUSES.includes(o.status));
  const todayOrders = orders.filter((o) => new Date(o.created_at) >= startOfToday);
  const todayPaid = paidOrders.filter((o) => new Date(o.created_at) >= startOfToday);

  const revenueUYU = paidOrders.filter((o) => getCurrency(o) === 'UYU').reduce((s, o) => s + (o.total || 0), 0);
  const revenueUSD = paidOrders.filter((o) => getCurrency(o) === 'USD').reduce((s, o) => s + (o.total || 0), 0);

  const todayRevenueUYU = todayPaid.filter((o) => getCurrency(o) === 'UYU').reduce((s, o) => s + (o.total || 0), 0);
  const todayRevenueUSD = todayPaid.filter((o) => getCurrency(o) === 'USD').reduce((s, o) => s + (o.total || 0), 0);

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const toVerify = orders.filter((o) => o.status === 'paid_pending_verification');
  const toInvoice = orders.filter((o) => o.status === 'ready_to_invoice');

  const todayPending = todayOrders.filter((o) => o.status === 'pending').length;

  const paidUYUCount = paidOrders.filter((o) => getCurrency(o) === 'UYU').length;
  const paidUSDCount = paidOrders.filter((o) => getCurrency(o) === 'USD').length;

  const avgTicketUYU = paidUYUCount > 0 ? revenueUYU / paidUYUCount : 0;
  const avgTicketUSD = paidUSDCount > 0 ? revenueUSD / paidUSDCount : 0;

  const combinedRevenueUYU = exchangeRate > 0 ? revenueUYU + revenueUSD * exchangeRate : revenueUYU;
  const todayCombinedRevenueUYU = exchangeRate > 0 ? todayRevenueUYU + todayRevenueUSD * exchangeRate : todayRevenueUYU;

  return {
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
      paidOrdersUYU: paidUYUCount,
      paidOrdersUSD: paidUSDCount,
      avgTicketUYU,
      avgTicketUSD,
      pendingOrders: pendingOrders.length,
      toVerify: toVerify.length,
      toInvoice: toInvoice.length,
    },
    exchangeRate,
    productsCount: productsCount || 0,
    lowStock,
    recentOrders: orders.slice(0, 15),
    attention: {
      pending: pendingOrders.map((o) => ({ id: o.id, order_number: o.order_number })),
      toVerify: toVerify.map((o) => ({ id: o.id, order_number: o.order_number })),
      toInvoice: toInvoice.map((o) => ({ id: o.id, order_number: o.order_number })),
    },
  };
}
