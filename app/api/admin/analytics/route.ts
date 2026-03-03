import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

// Check admin auth via Clerk
async function checkAdminAuth(): Promise<boolean> {
  const { userId } = await auth();
  return !!userId;
}

interface DailySales {
  date: string;
  orders: number;
  revenue: number;
  onlineRevenue: number;
  mostradorRevenue: number;
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

export async function GET(request: NextRequest) {
  if (!(await checkAdminAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d'; // 7d, 30d, 90d

    // Calculate date range
    const now = new Date();
    const daysBack = period === '30d' ? 30 : period === '90d' ? 90 : 7;
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
    const prevStartDate = new Date(startDate.getTime() - daysBack * 24 * 60 * 60 * 1000);
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    // Fetch current period orders
    const { data: ordersData } = await supabaseAdmin
      .from('orders')
      .select('id, status, total, created_at, customer_email, order_source, payment_method, shipping_department')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false }) as { data: Array<{ id: string; status: string; total: number; created_at: string; customer_email: string | null; order_source: string | null; payment_method: string | null; shipping_department: string | null }> | null };

    const orders = ordersData || [];

    // Fetch previous period orders (for comparison)
    const { data: prevOrdersData } = await supabaseAdmin
      .from('orders')
      .select('id, status, total, payment_method')
      .gte('created_at', prevStartDate.toISOString())
      .lt('created_at', startDate.toISOString()) as { data: Array<{ id: string; status: string; total: number; payment_method: string | null }> | null };

    const prevOrders = prevOrdersData || [];

    // Fetch order items for product analytics
    const orderIds = orders.map(o => o.id);
    const { data: orderItemsData } = await supabaseAdmin
      .from('order_items')
      .select('order_id, product_id, product_name, quantity, unit_price, subtotal')
      .in('order_id', orderIds.length > 0 ? orderIds : ['none']) as { data: Array<{ order_id: string; product_id: string; product_name: string; quantity: number; unit_price: number; subtotal: number }> | null };

    const orderItems = orderItemsData || [];

    // Fetch products for images
    const productIds = [...new Set(orderItems.map(i => i.product_id).filter(Boolean))];
    const { data: productsData } = await supabaseAdmin
      .from('products')
      .select('id, name, sku, images')
      .in('id', productIds.length > 0 ? productIds : ['none']) as { data: Array<{ id: string; name: string; sku: string; images: string[] | null }> | null };

    const products = productsData || [];
    const productMap = new Map(products.map(p => [p.id, p]));

    // === Calculate Dashboard Stats ===

    // Filter paid orders
    const paidStatuses = ['paid', 'processing', 'shipped', 'delivered', 'paid_pending_verification', 'ready_to_invoice', 'invoiced'];
    const paidOrders = orders.filter(o => paidStatuses.includes(o.status));
    const todayOrders = orders.filter(o => new Date(o.created_at) >= startOfToday);
    const todayPaidOrders = paidOrders.filter(o => new Date(o.created_at) >= startOfToday);

    // Revenue calculations
    const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const todayRevenue = todayPaidOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const avgOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;

    // Unique customers
    const uniqueCustomers = new Set(orders.map(o => o.customer_email?.toLowerCase()).filter(Boolean)).size;

    // Revenue by source (online vs mostrador)
    const onlinePaidOrders = paidOrders.filter(o => (o.order_source || 'online') !== 'mostrador');
    const mostradorPaidOrders = paidOrders.filter(o => o.order_source === 'mostrador');
    const onlineRevenue = onlinePaidOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const mostradorRevenue = mostradorPaidOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    // === Previous Period Comparison ===
    const prevPaidOrders = prevOrders.filter(o => paidStatuses.includes(o.status));
    const prevTotalRevenue = prevPaidOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const prevAvgOrderValue = prevPaidOrders.length > 0 ? prevTotalRevenue / prevPaidOrders.length : 0;

    const revenueChange = prevTotalRevenue > 0
      ? ((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100
      : totalRevenue > 0 ? 100 : 0;
    const ordersChange = prevPaidOrders.length > 0
      ? ((paidOrders.length - prevPaidOrders.length) / prevPaidOrders.length) * 100
      : paidOrders.length > 0 ? 100 : 0;
    const aovChange = prevAvgOrderValue > 0
      ? ((avgOrderValue - prevAvgOrderValue) / prevAvgOrderValue) * 100
      : avgOrderValue > 0 ? 100 : 0;

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

    // === Inventory Health ===
    const { data: allProductsData } = await (supabaseAdmin as any)
      .from('products')
      .select('id, name, sku, stock, sold_count, is_active, images')
      .eq('is_active', true)
      .gt('stock', 0)
      .order('stock', { ascending: true });

    const allProducts = (allProductsData || []) as Array<{
      id: string; name: string; sku: string; stock: number;
      sold_count: number; is_active: boolean; images: string[] | null;
    }>;

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
        revenue: dayOrders.reduce((sum, o) => sum + (o.total || 0), 0),
        onlineRevenue: dayOrders.filter(o => (o.order_source || 'online') !== 'mostrador').reduce((sum, o) => sum + (o.total || 0), 0),
        mostradorRevenue: dayOrders.filter(o => o.order_source === 'mostrador').reduce((sum, o) => sum + (o.total || 0), 0),
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
      ? ((completedOrders / orders.length) * 100).toFixed(1)
      : '0';

    return NextResponse.json({
      summary: {
        totalOrders: orders.length,
        paidOrders: paidOrders.length,
        pendingOrders,
        totalRevenue,
        todayRevenue,
        todayOrders: todayOrders.length,
        avgOrderValue,
        uniqueCustomers,
        conversionRate: parseFloat(conversionRate),
        onlineRevenue,
        mostradorRevenue,
        onlineOrders: onlinePaidOrders.length,
        mostradorOrders: mostradorPaidOrders.length,
      },
      previousPeriod: {
        totalRevenue: prevTotalRevenue,
        paidOrders: prevPaidOrders.length,
        avgOrderValue: prevAvgOrderValue,
        revenueChange: Math.round(revenueChange * 10) / 10,
        ordersChange: Math.round(ordersChange * 10) / 10,
        aovChange: Math.round(aovChange * 10) / 10,
      },
      paymentMethodDistribution,
      departmentDistribution,
      inventoryHealth,
      dailySales,
      hourlyStats,
      topProducts,
      statusDistribution: statusCounts,
      period,
    });

  } catch (error: any) {
    console.error('Analytics error:', error);
    return NextResponse.json({ 
      error: error.message || 'Error fetching analytics' 
    }, { status: 500 });
  }
}
