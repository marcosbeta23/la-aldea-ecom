import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyOwnerAuth } from '@/lib/admin-auth';

type ReportType = 'sales' | 'products' | 'customers';

interface SalesOrderRow {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string | null;
  total: number;
  status: string;
  payment_method: string | null;
  order_source: string | null;
  currency: string | null;
  shipping_department: string | null;
  created_at: string;
}

interface SalesOrderItemRow {
  order_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

interface ProductReportRow {
  id: string;
  sku: string;
  name: string;
  category: string[] | null;
  brand: string | null;
  price_numeric: number;
  stock: number;
  sold_count: number;
  is_active: boolean;
}

interface ProductOrderItemRow {
  product_id: string;
  quantity: number;
  subtotal: number;
}

interface CustomerOrderRow {
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  total: number;
  status: string;
  created_at: string;
}

interface CustomerAggregate {
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  paidOrders: number;
  totalSpent: number;
  lastOrder: string;
}

type SalesReport = {
  summary: {
    period: string;
    startDate: string;
    endDate: string;
    totalOrders: number;
    paidOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
  };
  orders: Array<SalesOrderRow & { items: SalesOrderItemRow[] }>;
};

type ProductsReport = {
  products: Array<ProductReportRow & { totalSales: number; totalRevenue: number; stockValue: number }>;
};

type CustomersReport = {
  summary: {
    totalCustomers: number;
    totalRevenue: number;
  };
  customers: CustomerAggregate[];
};

type ReportData = SalesReport | ProductsReport | CustomersReport;

const PAID_STATUSES = ['paid', 'processing', 'shipped', 'delivered', 'invoiced', 'ready_to_invoice'];

function isPaidStatus(status: string): boolean {
  return PAID_STATUSES.includes(status);
}

function escapeCsvCell(value: string | number): string {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function csvFromRows(rows: Array<Array<string | number>>): string {
  return rows.map((row) => row.map((cell) => escapeCsvCell(cell)).join(',')).join('\n');
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

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'sales';
  const period = searchParams.get('period') || 'month';
  const format = searchParams.get('format') || 'json';
  const startDate = searchParams.get('start');
  const endDate = searchParams.get('end');
  const source = searchParams.get('source') || ''; // 'online' | '' (all)

  try {
    let data: ReportData;
    let reportType: ReportType;
    let filename = '';

    switch (type) {
      case 'sales':
        data = await generateSalesReport(period, startDate, endDate, source);
        reportType = 'sales';
        filename = `ventas-${period}${source ? `-${source}` : ''}`;
        break;
      case 'products':
        data = await generateProductsReport();
        reportType = 'products';
        filename = `productos`;
        break;
      case 'customers':
        data = await generateCustomersReport(period, startDate, endDate);
        reportType = 'customers';
        filename = `clientes-${period}`;
        break;
      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }

    if (format === 'csv') {
      const csv = convertToCSV(data, reportType);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}.csv"`,
        },
      });
    }

    return NextResponse.json({ success: true, data, filename });
  } catch (error: unknown) {
    console.error('Report generation error:', error);
    return NextResponse.json(
      { error: getErrorMessage(error, 'Failed to generate report') },
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

async function generateSalesReport(period: string, startDate?: string | null, endDate?: string | null, source?: string) {
  const { start, end } = getDateRange(period, startDate, endDate);

  let query = supabaseAdmin
    .from('orders')
    .select('id, order_number, customer_name, customer_email, total, status, payment_method, order_source, currency, shipping_department, created_at')
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString())
    .order('created_at', { ascending: false });

  if (source === 'online') {
    query = query.eq('order_source', 'online');
  }

  const { data: orders } = await query;

  const { data: items } = await supabaseAdmin
    .from('order_items')
    .select('order_id, product_name, quantity, unit_price, subtotal');

  const salesItems = (items || []) as SalesOrderItemRow[];

  const itemsByOrder = salesItems.reduce<Record<string, SalesOrderItemRow[]>>((acc, item) => {
    if (!acc[item.order_id]) acc[item.order_id] = [];
    acc[item.order_id].push(item);
    return acc;
  }, {});

  const ordersArray = (orders || []) as SalesOrderRow[];
  const totalRevenue = ordersArray
    .filter((order) => isPaidStatus(order.status))
    .reduce((sum, order) => sum + (order.total || 0), 0);

  const totalOrders = orders?.length || 0;
  const paidOrders = ordersArray.filter((order) => isPaidStatus(order.status)).length;

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
    orders: ordersArray.map((order) => ({
      ...order,
      items: itemsByOrder[order.id] || [],
    })),
  };
}

async function generateProductsReport() {
  const { data: products } = await supabaseAdmin
    .from('products')
    .select('id, sku, name, category, brand, price_numeric, stock, sold_count, is_active')
    .order('sold_count', { ascending: false });

  const { data: orderItems } = await supabaseAdmin
    .from('order_items')
    .select('product_id, quantity, subtotal');

  const productOrderItems = (orderItems || []) as ProductOrderItemRow[];
  const salesByProduct = productOrderItems.reduce<Record<string, { quantity: number; revenue: number }>>((acc, item) => {
    if (!acc[item.product_id]) {
      acc[item.product_id] = { quantity: 0, revenue: 0 };
    }
    acc[item.product_id].quantity += item.quantity;
    acc[item.product_id].revenue += item.subtotal || 0;
    return acc;
  }, {});

  const productsArray = (products || []) as ProductReportRow[];

  return {
    products: productsArray.map((product) => ({
      ...product,
      totalSales: salesByProduct[product.id]?.quantity || 0,
      totalRevenue: salesByProduct[product.id]?.revenue || 0,
      stockValue: (product.price_numeric || 0) * (product.stock || 0),
    })),
  };
}

async function generateCustomersReport(period: string, startDate?: string | null, endDate?: string | null) {
  const { start, end } = getDateRange(period, startDate, endDate);

  const { data: orders } = await supabaseAdmin
    .from('orders')
    .select('customer_name, customer_email, customer_phone, total, status, created_at')
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString());

  const ordersArray = (orders || []) as CustomerOrderRow[];
  const customerMap = ordersArray.reduce<Record<string, CustomerAggregate>>((acc, order) => {
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
    if (isPaidStatus(order.status)) {
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

function convertToCSV(data: ReportData, type: ReportType): string {
  if (type === 'sales' && 'orders' in data) {
    const headers = ['Fecha', 'Nº Pedido', 'Cliente', 'Email', 'Total', 'Moneda', 'Estado', 'Método Pago', 'Canal', 'Departamento'];
    const rows = data.orders.map((order) => [
      new Date(order.created_at).toLocaleDateString('es-UY'),
      order.order_number,
      order.customer_name,
      order.customer_email || '',
      (order.total || 0).toFixed(2),
      order.currency || 'UYU',
      order.status,
      order.payment_method || '',
      order.order_source === 'online' ? 'Online' : 'Venta',
      order.shipping_department || '',
    ]);
    return csvFromRows([headers, ...rows]);
  }

  if (type === 'products' && 'products' in data) {
    const headers = ['SKU', 'Nombre', 'Categoría', 'Marca', 'Precio', 'Stock', 'Vendidos', 'Activo'];
    const rows = data.products.map((product) => [
      product.sku || '',
      product.name,
      Array.isArray(product.category) ? product.category.join(', ') : (product.category || ''),
      product.brand || '',
      (product.price_numeric || 0).toFixed(2),
      product.stock,
      product.sold_count || 0,
      product.is_active ? 'Sí' : 'No',
    ]);
    return csvFromRows([headers, ...rows]);
  }

  if (type === 'customers' && 'customers' in data) {
    const headers = ['Nombre', 'Email', 'Teléfono', 'Pedidos', 'Total Gastado', 'Último Pedido'];
    const rows = data.customers.map((customer) => [
      customer.name,
      customer.email || '',
      customer.phone || '',
      customer.totalOrders,
      (customer.totalSpent || 0).toFixed(2),
      new Date(customer.lastOrder).toLocaleDateString('es-UY'),
    ]);
    return csvFromRows([headers, ...rows]);
  }

  return '';
}
