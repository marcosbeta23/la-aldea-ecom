// app/api/admin/reports/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

async function checkAdminAuth(): Promise<boolean> {
  const { userId } = await auth();
  return !!userId;
}

export async function GET(request: NextRequest) {
  if (!(await checkAdminAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'sales';
  const period = searchParams.get('period') || 'month';
  const format = searchParams.get('format') || 'json';
  const startDate = searchParams.get('start');
  const endDate = searchParams.get('end');

  try {
    let data;
    let filename = '';

    switch (type) {
      case 'sales':
        data = await generateSalesReport(period, startDate, endDate);
        filename = `ventas-${period}`;
        break;
      case 'products':
        data = await generateProductsReport();
        filename = `productos`;
        break;
      case 'customers':
        data = await generateCustomersReport(period, startDate, endDate);
        filename = `clientes-${period}`;
        break;
      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }

    if (format === 'csv') {
      const csv = convertToCSV(data, type);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}.csv"`,
        },
      });
    }

    return NextResponse.json({ success: true, data, filename });
  } catch (error) {
    console.error('Report generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

function getDateRange(period: string, startDate?: string | null, endDate?: string | null) {
  const now = new Date();
  let start: Date;
  let end: Date = now;

  if (period === 'custom' && startDate && endDate) {
    start = new Date(startDate);
    end = new Date(endDate);
  } else {
    switch (period) {
      case 'week':
        start = new Date(now);
        start.setDate(start.getDate() - 7);
        break;
      case 'year':
        start = new Date(now);
        start.setFullYear(start.getFullYear() - 1);
        break;
      case 'month':
      default:
        start = new Date(now);
        start.setMonth(start.getMonth() - 1);
        break;
    }
  }

  return { start, end };
}

async function generateSalesReport(period: string, startDate?: string | null, endDate?: string | null) {
  const { start, end } = getDateRange(period, startDate, endDate);

  const { data: orders } = await (supabaseAdmin as any)
    .from('orders')
    .select('id, order_number, customer_name, customer_email, total, status, payment_method, created_at')
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString())
    .order('created_at', { ascending: false });

  const { data: items } = await (supabaseAdmin as any)
    .from('order_items')
    .select('order_id, product_name, quantity, unit_price, subtotal');

  const itemsByOrder = (items || []).reduce((acc: Record<string, any[]>, item: any) => {
    if (!acc[item.order_id]) acc[item.order_id] = [];
    acc[item.order_id].push(item);
    return acc;
  }, {});

  const paidStatuses = ['paid', 'processing', 'shipped', 'delivered', 'invoiced', 'ready_to_invoice'];
  
  const ordersArray = (orders || []) as any[];
  const totalRevenue = ordersArray
    .filter((o: any) => paidStatuses.includes(o.status))
    .reduce((sum: number, o: any) => sum + (o.total || 0), 0);

  const totalOrders = orders?.length || 0;
  const paidOrders = ordersArray.filter((o: any) => paidStatuses.includes(o.status)).length;

  return {
    summary: {
      period,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      totalOrders,
      paidOrders,
      totalRevenue,
      averageOrderValue: paidOrders > 0 ? totalRevenue / paidOrders : 0,
    },
    orders: ordersArray.map((order: any) => ({
      ...order,
      items: itemsByOrder[order.id] || [],
    })),
  };
}

async function generateProductsReport() {
  const { data: products } = await (supabaseAdmin as any)
    .from('products')
    .select('id, sku, name, category, brand, price_numeric, stock, sold_count, is_active')
    .order('sold_count', { ascending: false });

  const { data: orderItems } = await (supabaseAdmin as any)
    .from('order_items')
    .select('product_id, quantity, subtotal');

  const salesByProduct = ((orderItems || []) as any[]).reduce((acc: Record<string, { quantity: number; revenue: number }>, item: any) => {
    if (!acc[item.product_id]) {
      acc[item.product_id] = { quantity: 0, revenue: 0 };
    }
    acc[item.product_id].quantity += item.quantity;
    acc[item.product_id].revenue += item.subtotal || 0;
    return acc;
  }, {});

  return {
    products: ((products || []) as any[]).map((product: any) => ({
      ...product,
      totalSales: salesByProduct[product.id]?.quantity || 0,
      totalRevenue: salesByProduct[product.id]?.revenue || 0,
      stockValue: (product.price_numeric || 0) * (product.stock || 0),
    })),
  };
}

async function generateCustomersReport(period: string, startDate?: string | null, endDate?: string | null) {
  const { start, end } = getDateRange(period, startDate, endDate);

  const { data: orders } = await (supabaseAdmin as any)
    .from('orders')
    .select('customer_name, customer_email, customer_phone, total, status, created_at')
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString());

  const paidStatuses = ['paid', 'processing', 'shipped', 'delivered', 'invoiced', 'ready_to_invoice'];

  const customerMap = ((orders || []) as any[]).reduce((acc: Record<string, {
    name: string;
    email: string;
    phone: string;
    totalOrders: number;
    paidOrders: number;
    totalSpent: number;
    lastOrder: string;
  }>, order: any) => {
    const key = order.customer_email || order.customer_phone || order.customer_name;
    if (!acc[key]) {
      acc[key] = {
        name: order.customer_name,
        email: order.customer_email || '',
        phone: order.customer_phone || '',
        totalOrders: 0,
        paidOrders: 0,
        totalSpent: 0,
        lastOrder: order.created_at,
      };
    }
    acc[key].totalOrders++;
    if (paidStatuses.includes(order.status)) {
      acc[key].paidOrders++;
      acc[key].totalSpent += order.total || 0;
    }
    if (new Date(order.created_at) > new Date(acc[key].lastOrder)) {
      acc[key].lastOrder = order.created_at;
    }
    return acc;
  }, {});

  const customers = Object.values(customerMap).sort((a, b) => b.totalSpent - a.totalSpent);

  return {
    summary: {
      totalCustomers: customers.length,
      totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
    },
    customers,
  };
}

function convertToCSV(data: any, type: string): string {
  if (type === 'sales' && data.orders) {
    const headers = ['Fecha', 'Nº Pedido', 'Cliente', 'Email', 'Total', 'Estado', 'Método Pago'];
    const rows = (data.orders || []).map((order: any) => [
      new Date(order.created_at).toLocaleDateString('es-UY'),
      order.order_number,
      order.customer_name,
      order.customer_email || '',
      (order.total || 0).toFixed(2),
      order.status,
      order.payment_method || '',
    ]);
    return [headers.join(','), ...rows.map((row: any[]) => row.map((cell) => `"${cell}"`).join(','))].join('\n');
  }

  if (type === 'products' && data.products) {
    const headers = ['SKU', 'Nombre', 'Categoría', 'Marca', 'Precio', 'Stock', 'Vendidos', 'Activo'];
    const rows = (data.products || []).map((p: any) => [
      p.sku || '',
      p.name,
      p.category || '',
      p.brand || '',
      (p.price_numeric || 0).toFixed(2),
      p.stock,
      p.sold_count || 0,
      p.is_active ? 'Sí' : 'No',
    ]);
    return [headers.join(','), ...rows.map((row: any[]) => row.map((cell) => `"${cell}"`).join(','))].join('\n');
  }

  if (type === 'customers' && data.customers) {
    const headers = ['Nombre', 'Email', 'Teléfono', 'Pedidos', 'Total Gastado', 'Último Pedido'];
    const rows = (data.customers || []).map((c: any) => [
      c.name,
      c.email || '',
      c.phone || '',
      c.totalOrders,
      (c.totalSpent || 0).toFixed(2),
      new Date(c.lastOrder).toLocaleDateString('es-UY'),
    ]);
    return [headers.join(','), ...rows.map((row: any[]) => row.map((cell) => `"${cell}"`).join(','))].join('\n');
  }

  return '';
}
