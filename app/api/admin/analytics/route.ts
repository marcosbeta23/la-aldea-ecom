import { NextRequest, NextResponse } from 'next/server';
import { verifyOwnerAuth } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase';
import { getExchangeRate } from '@/lib/exchange-rate';


interface DailySales {
  date: string;
  orders: number;
  revenueUYU: number;
  revenueUSD: number;
  onlineRevenue: number;
}

interface TopProduct {
  id: string;
  name: string;
  sku: string;
  sold: number;
  revenue: number;
  image: string | null;
}

interface HourlyStat {
  hour: number;
  orders: number;
}

interface AnalyticsOrderRow {
  id: string;
  status: string;
  total: number;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
  customer_email: string | null;
  order_source: string | null;
  payment_method: string | null;
  shipping_department: string | null;
  shipping_type: string | null;
  currency: string | null;
  coupon_code: string | null;
}

interface PrevOrderRow {
  id: string;
  status: string;
  total: number;
  currency: string | null;
  payment_method: string | null;
}

interface CouponUsageRow {
  code: string;
  current_uses: number | null;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'object' && error && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  return fallback;
}

export async function GET(request: NextRequest) {

  const authResult = await verifyOwnerAuth();
  if (!authResult.authorized) return authResult.response;

  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d'; // 7d, 30d, 90d

    // Calculate date range
    const now = new Date();
    const daysBack = period === '30d' ? 30 : period === '90d' ? 90 : period === 'semester' ? 180 : 7;
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
    const prevStartDate = new Date(startDate.getTime() - daysBack * 24 * 60 * 60 * 1000);
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    // Fetch exchange rate for combined totals
    let exchangeRate = 0;
    try {
      const rateData = await getExchangeRate();
      exchangeRate = rateData.rate;
    } catch {
      // If exchange rate is unavailable, we still show individual currencies
    }

    // Parallelize independent queries
    const [ordersResult, prevOrdersResult, checkoutAttemptsResult, allCouponsResult] = await Promise.all([
      supabaseAdmin
        .from('orders')
        .select('id, status, total, created_at, updated_at, paid_at, customer_email, order_source, payment_method, shipping_department, shipping_type, currency, coupon_code')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false }),
      supabaseAdmin
        .from('orders')
        .select('id, status, total, currency, payment_method')
        .gte('created_at', prevStartDate.toISOString())
        .lt('created_at', startDate.toISOString()),
      supabaseAdmin
        .from('checkout_attempts')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString())
        .eq('recovered', false),
      supabaseAdmin
        .from('discount_coupons')
        .select('code, current_uses')
    ]);

    const orders = (ordersResult.data || []) as AnalyticsOrderRow[];
    const prevOrders = (prevOrdersResult.data || []) as PrevOrderRow[];
    const abandonedCount = checkoutAttemptsResult.count || 0;
    const allCoupons = (allCouponsResult.data || []) as CouponUsageRow[];

    const orderIds = orders.map(o => o.id);

    // Fetch order items and products in parallel too
    const [orderItemsResult, allProductsResult] = await Promise.all([
      supabaseAdmin
        .from('order_items')
        .select('order_id, product_id, product_name, quantity, subtotal, currency')
        .in('order_id', orderIds.length > 0 ? orderIds : ['none']),
      supabaseAdmin
        .from('products')
        .select('id, name, sku, stock, sold_count, is_active, images')
        .eq('is_active', true)
        .gt('stock', 0)
        .order('stock', { ascending: true })
    ]);

    const orderItems = (orderItemsResult.data || []) as Array<{ order_id: string; product_id: string; product_name: string; quantity: number; subtotal: number; currency: string | null }>;
    const allProducts = (allProductsResult.data || []) as Array<{ id: string; name: string; sku: string; stock: number; sold_count: number; is_active: boolean; images: string[] | null }>;

    const productIds = [...new Set(orderItems.map(i => i.product_id).filter(Boolean))];
    const { data: productsData } = await supabaseAdmin
      .from('products')
      .select('id, name, sku, images')
      .in('id', productIds.length > 0 ? productIds : ['none']) as { data: Array<{ id: string; name: string; sku: string; images: string[] | null }> | null };

    const products = productsData || [];
    const productMap = new Map(products.map(p => [p.id, p]));

    // Filter paid orders
    const paidStatuses = ['paid', 'processing', 'shipped', 'delivered', 'paid_pending_verification', 'ready_to_invoice', 'invoiced'];
    const paidOrders = orders.filter(o => paidStatuses.includes(o.status));
    const todayOrders = orders.filter(o => new Date(o.created_at) >= startOfToday);
    const todayPaidOrders = paidOrders.filter(o => new Date(o.created_at) >= startOfToday);

    const orderCurrency = (order: { currency: string | null; payment_method?: string | null }) =>
      order.payment_method === 'mercadopago' ? 'UYU' : (order.currency || 'UYU');

    const paidOrdersUYU = paidOrders.filter(o => orderCurrency(o) === 'UYU');
    const paidOrdersUSD = paidOrders.filter(o => orderCurrency(o) === 'USD');
    const totalRevenueUYU = paidOrdersUYU.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalRevenueUSD = paidOrdersUSD.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalRevenue = totalRevenueUYU;

    const todayPaidOrdersUYU = todayPaidOrders.filter(o => orderCurrency(o) === 'UYU');
    const todayPaidOrdersUSD = todayPaidOrders.filter(o => orderCurrency(o) === 'USD');
    const todayRevenueUYU = todayPaidOrdersUYU.reduce((sum, o) => sum + (o.total || 0), 0);
    const todayRevenueUSD = todayPaidOrdersUSD.reduce((sum, o) => sum + (o.total || 0), 0);
    const todayRevenue = todayRevenueUYU;

    const avgOrderValueUYU = paidOrdersUYU.length > 0 ? totalRevenueUYU / paidOrdersUYU.length : 0;
    const avgOrderValueUSD = paidOrdersUSD.length > 0 ? totalRevenueUSD / paidOrdersUSD.length : 0;
    const avgOrderValue = avgOrderValueUYU;

    // Unique customers
    const uniqueCustomers = new Set(orders.map(o => o.customer_email?.toLowerCase()).filter(Boolean)).size;

    const onlineRevenueUYU = totalRevenueUYU;
    const onlineRevenueUSD = totalRevenueUSD;
    const onlineRevenue = totalRevenue;

    // === Previous Period Comparison (per currency) ===
    const prevPaidOrders = prevOrders.filter(o => paidStatuses.includes(o.status));
    const prevPaidOrdersUYU = prevPaidOrders.filter(o => orderCurrency(o) === 'UYU');
    const prevPaidOrdersUSD = prevPaidOrders.filter(o => orderCurrency(o) === 'USD');
    const prevTotalRevenue = prevPaidOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const prevTotalRevenueUYU = prevPaidOrdersUYU.reduce((sum, o) => sum + (o.total || 0), 0);
    const prevTotalRevenueUSD = prevPaidOrdersUSD.reduce((sum, o) => sum + (o.total || 0), 0);
    const prevAvgOrderValue = prevPaidOrders.length > 0 ? prevTotalRevenue / prevPaidOrders.length : 0;
    const prevAvgOrderValueUYU = prevPaidOrdersUYU.length > 0 ? prevTotalRevenueUYU / prevPaidOrdersUYU.length : 0;

    const revenueChange = prevTotalRevenue > 0
      ? ((totalRevenueUYU - prevTotalRevenue) / prevTotalRevenue) * 100
      : totalRevenueUYU > 0 ? 100 : 0;
    const revenueChangeUYU = prevTotalRevenueUYU > 0
      ? ((totalRevenueUYU - prevTotalRevenueUYU) / prevTotalRevenueUYU) * 100
      : totalRevenueUYU > 0 ? 100 : 0;
    const revenueChangeUSD = prevTotalRevenueUSD > 0
      ? ((totalRevenueUSD - prevTotalRevenueUSD) / prevTotalRevenueUSD) * 100
      : totalRevenueUSD > 0 ? 100 : 0;
    const ordersChange = prevPaidOrders.length > 0
      ? ((paidOrders.length - prevPaidOrders.length) / prevPaidOrders.length) * 100
      : paidOrders.length > 0 ? 100 : 0;
    const aovChange = prevAvgOrderValueUYU > 0
      ? ((avgOrderValueUYU - prevAvgOrderValueUYU) / prevAvgOrderValueUYU) * 100
      : avgOrderValueUYU > 0 ? 100 : 0;

    // === Payment Method Distribution ===
    const paymentMethodDistribution: Record<string, { count: number; revenue: number }> = {};
    for (const order of paidOrders) {
      const method = order.payment_method || 'unknown';
      if (!paymentMethodDistribution[method]) {
        paymentMethodDistribution[method] = { count: 0, revenue: 0 };
      }
      paymentMethodDistribution[method].count++;
      paymentMethodDistribution[method].revenue += order.total || 0;
    }

    // === Geographic Breakdown ===
    const departmentDistribution: Record<string, { orders: number; revenue: number }> = {};
    for (const order of paidOrders) {
      const dept = order.shipping_department || 'Sin especificar';
      if (!departmentDistribution[dept]) {
        departmentDistribution[dept] = { orders: 0, revenue: 0 };
      }
      departmentDistribution[dept].orders++;
      departmentDistribution[dept].revenue += order.total || 0;
    }

    // === Shipping Type Distribution ===
    const shippingTypeDistribution: Record<string, { orders: number; revenue: number }> = {};
    for (const order of paidOrders) {
      const type = order.shipping_type || 'Sin especificar';
      if (!shippingTypeDistribution[type]) {
        shippingTypeDistribution[type] = { orders: 0, revenue: 0 };
      }
      shippingTypeDistribution[type].orders++;
      shippingTypeDistribution[type].revenue += order.total || 0;
    }


    // Calculate avg daily sales from order items in the last 30 days
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentOrderIds = orders
      .filter(o => paidStatuses.includes(o.status) && new Date(o.created_at) >= thirtyDaysAgo)
      .map(o => o.id);

    const { data: recentItemsData } = await supabaseAdmin
      .from('order_items')
      .select('product_id, quantity')
      .in('order_id', recentOrderIds.length > 0 ? recentOrderIds : ['none']) as {
        data: Array<{ product_id: string; quantity: number }> | null;
      };

    const recentItems = recentItemsData || [];
    const dailySalesMap = new Map<string, number>();
    for (const item of recentItems) {
      dailySalesMap.set(item.product_id, (dailySalesMap.get(item.product_id) || 0) + item.quantity);
    }

    const inventoryHealth = allProducts
      .map(p => {
        const totalSold30d = dailySalesMap.get(p.id) || 0;
        const avgDailySales = totalSold30d / 30;
        const daysRemaining = avgDailySales > 0 ? Math.round(p.stock / avgDailySales) : p.stock > 0 ? 999 : 0;
        return {
          id: p.id,
          name: p.name,
          sku: p.sku,
          stock: p.stock,
          avgDailySales: Math.round(avgDailySales * 100) / 100,
          daysRemaining,
          image: p.images?.[0] || null,
        };
      })
      .filter(p => p.daysRemaining < 999)
      .sort((a, b) => a.daysRemaining - b.daysRemaining)
      .slice(0, 10);

    // === Daily Sales Chart Data ===
    const dailySales: DailySales[] = [];
    for (let i = daysBack - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const dayOrders = paidOrders.filter(o => {
        const oDate = new Date(o.created_at);
        return oDate >= dayStart && oDate <= dayEnd;
      });

      dailySales.push({
        date: dateStr,
        orders: dayOrders.length,
        revenueUYU: dayOrders.filter(o => orderCurrency(o) === 'UYU').reduce((sum, o) => sum + (o.total || 0), 0),
        revenueUSD: dayOrders.filter(o => orderCurrency(o) === 'USD').reduce((sum, o) => sum + (o.total || 0), 0),
        onlineRevenue: dayOrders.filter(o => orderCurrency(o) === 'UYU').reduce((sum, o) => sum + (o.total || 0), 0),
      });
    }

    // === Hourly Distribution (Today) ===
    const hourlyStats: HourlyStat[] = [];
    for (let h = 0; h < 24; h++) {
      const hourOrders = todayOrders.filter(o => {
        const oDate = new Date(o.created_at);
        return oDate.getHours() === h;
      });
      hourlyStats.push({ hour: h, orders: hourOrders.length });
    }

    // === Top Products ===
    const productSales = new Map<string, { sold: number; revenue: number; name: string }>();

    for (const item of orderItems) {
      const order = orders.find(o => o.id === item.order_id);
      if (order && paidStatuses.includes(order.status)) {
        const existing = productSales.get(item.product_id) || { sold: 0, revenue: 0, name: item.product_name };
        existing.sold += item.quantity;
        existing.revenue += item.subtotal;
        productSales.set(item.product_id, existing);
      }
    }

    const topProducts: TopProduct[] = Array.from(productSales.entries())
      .map(([id, data]) => {
        const product = productMap.get(id);
        return {
          id,
          name: data.name || product?.name || 'Producto',
          sku: product?.sku || '',
          sold: data.sold,
          revenue: data.revenue,
          image: product?.images?.[0] || null,
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // === Order Status Distribution ===
    const statusCounts: Record<string, number> = {};
    for (const order of orders) {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    }

    // === Conversion Rate (simplified) ===
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const completedOrders = paidOrders.length;
    const conversionRate = orders.length > 0
      ? ((completedOrders / (orders.length + abandonedCount)) * 100).toFixed(1)
      : '0';

    // Coupon Impact
    const couponOrders = paidOrders.filter(o => o.coupon_code);
    const couponUsageRate = paidOrders.length > 0
      ? ((couponOrders.length / paidOrders.length) * 100).toFixed(1)
      : '0';

    // Fulfillment (proxy using updated_at of delivered orders)
    const fulfilledOrders = orders.filter(o => o.status === 'delivered' && (o.paid_at || o.created_at));
    const avgFulfillmentDays = fulfilledOrders.length > 0
      ? (fulfilledOrders.reduce((acc, o) => {
        const start = new Date(o.paid_at || o.created_at).getTime();
        const end = new Date(o.updated_at).getTime();
        return acc + (end - start);
      }, 0) / fulfilledOrders.length / (1000 * 60 * 60 * 24)).toFixed(1)
      : '0';

    // Customer Retention
    const emails = orders.map(o => o.customer_email).filter(Boolean);
    const { data: pastOrdersCount } = await supabaseAdmin
      .from('orders')
      .select('customer_email')
      .in('customer_email', emails.length > 0 ? [...new Set(emails)] : ['none'])
      .lt('created_at', startDate.toISOString());

    const returningEmails = new Set(((pastOrdersCount || []) as Array<{ customer_email: string | null }>).map((order) => order.customer_email));
    const uniqueEmailsInPeriod = [...new Set(emails)];
    const returningCustomers = uniqueEmailsInPeriod.filter(email => returningEmails.has(email)).length;
    const newCustomers = uniqueEmailsInPeriod.length - returningCustomers;

    // Combined store total in UYU (USD converted at exchange rate)
    const combinedRevenueUYU = exchangeRate > 0
      ? totalRevenueUYU + totalRevenueUSD * exchangeRate
      : totalRevenueUYU;
    const todayCombinedRevenueUYU = exchangeRate > 0
      ? todayRevenueUYU + todayRevenueUSD * exchangeRate
      : todayRevenueUYU;

    return NextResponse.json({
      summary: {
        totalOrders: orders.length,
        paidOrders: paidOrders.length,
        paidOrdersUYU: paidOrdersUYU.length,
        paidOrdersUSD: paidOrdersUSD.length,
        pendingOrders,
        totalRevenue,
        totalRevenueUYU,
        totalRevenueUSD,
        combinedRevenueUYU,
        todayRevenue,
        todayRevenueUYU,
        todayRevenueUSD,
        todayCombinedRevenueUYU,
        todayOrders: todayOrders.length,
        avgOrderValue,
        avgOrderValueUYU,
        avgOrderValueUSD,
        uniqueCustomers,
        conversionRate: parseFloat(conversionRate),
        cartAbandonmentRate: abandonedCount > 0 ? parseFloat(((abandonedCount / (abandonedCount + orders.length)) * 100).toFixed(1)) : 0,
        onlineRevenue,
        onlineRevenueUYU,
        onlineRevenueUSD,
        onlineOrders: paidOrders.length,
        couponUsageRate: parseFloat(couponUsageRate),
        avgFulfillmentDays: parseFloat(avgFulfillmentDays),
        newCustomers,
        returningCustomers,
        topCoupons: allCoupons
          .sort((a, b) => (b.current_uses || 0) - (a.current_uses || 0))
          .slice(0, 5)
      },
      previousPeriod: {
        totalRevenue: prevTotalRevenue,
        totalRevenueUYU: prevTotalRevenueUYU,
        totalRevenueUSD: prevTotalRevenueUSD,
        paidOrders: prevPaidOrders.length,
        avgOrderValue: prevAvgOrderValue,
        revenueChange: Math.round(revenueChange * 10) / 10,
        revenueChangeUYU: Math.round(revenueChangeUYU * 10) / 10,
        revenueChangeUSD: Math.round(revenueChangeUSD * 10) / 10,
        ordersChange: Math.round(ordersChange * 10) / 10,
        aovChange: Math.round(aovChange * 10) / 10,
      },
      exchangeRate,
      paymentMethodDistribution,
      departmentDistribution,
      shippingTypeDistribution,
      inventoryHealth,
      dailySales,
      hourlyStats,
      topProducts,
      statusDistribution: statusCounts,
      period,
    });

  } catch (error: unknown) {
    console.error('Analytics error:', error);
    return NextResponse.json({
      error: getErrorMessage(error, 'Error fetching analytics')
    }, { status: 500 });
  }
}
