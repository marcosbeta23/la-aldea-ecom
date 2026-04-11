import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyOwnerAuth } from '@/lib/admin-auth';

// GET /api/admin/customers?page=1&search=&sort=totalSpent&dir=desc
// Aggregates customer data from orders table

const PER_PAGE = 20;

export async function GET(request: NextRequest) {
  const authResult = await verifyOwnerAuth();
  if (!authResult.authorized) {
    return authResult.response;
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const search = (searchParams.get('search') || '').trim().toLowerCase();
    const sort = searchParams.get('sort') || 'totalSpent';
    const dir = searchParams.get('dir') || 'desc';

    // Fetch all paid/completed orders
    const paidStatuses = ['paid', 'processing', 'shipped', 'delivered', 'invoiced', 'ready_to_invoice'];

    let query = supabaseAdmin
      .from('orders')
      .select('id, customer_name, customer_email, customer_phone, total, currency, payment_method, status, created_at')
      .in('status', paidStatuses);

    interface OrderRow { id: string; customer_name: string; customer_email: string; customer_phone: string; total: number; currency: string; payment_method: string; status: string; created_at: string; }
    const { data, error } = await query;
    const orders = (data || []) as OrderRow[];

    if (error) {
      console.error('Error fetching orders for customers:', error);
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }

    if (orders.length === 0) {
      return NextResponse.json({
        customers: [],
        pagination: { page: 1, totalPages: 0, totalCustomers: 0 },
      });
    }

    // Aggregate by customer_email (primary) or customer_phone (fallback)
    const customerMap = new Map<string, {
      identifier: string;
      name: string;
      email: string | null;
      phone: string | null;
      orderCount: number;
      totalSpentUYU: number;
      totalSpentUSD: number;
      firstOrder: string;
      lastOrder: string;
      paymentMethods: Record<string, number>;
      avgOrderValue: number;
    }>();

    for (const order of orders) {
      const key = order.customer_email
        ? order.customer_email.toLowerCase()
        : order.customer_phone || 'unknown';

      if (key === 'unknown') continue;

      const existing = customerMap.get(key);
      const orderTotal = Number(order.total) || 0;
      const currency = order.currency || 'UYU';
      const paymentMethod = order.payment_method || 'unknown';

      if (existing) {
        existing.orderCount++;
        if (currency === 'USD') {
          existing.totalSpentUSD += orderTotal;
        } else {
          existing.totalSpentUYU += orderTotal;
        }
        if (order.created_at < existing.firstOrder) existing.firstOrder = order.created_at;
        if (order.created_at > existing.lastOrder) existing.lastOrder = order.created_at;
        existing.paymentMethods[paymentMethod] = (existing.paymentMethods[paymentMethod] || 0) + 1;
        // Update name/phone/email if missing
        if (!existing.name && order.customer_name) existing.name = order.customer_name;
        if (!existing.email && order.customer_email) existing.email = order.customer_email;
        if (!existing.phone && order.customer_phone) existing.phone = order.customer_phone;
      } else {
        customerMap.set(key, {
          identifier: key,
          name: order.customer_name || '',
          email: order.customer_email || null,
          phone: order.customer_phone || null,
          orderCount: 1,
          totalSpentUYU: currency === 'UYU' ? orderTotal : 0,
          totalSpentUSD: currency === 'USD' ? orderTotal : 0,
          firstOrder: order.created_at,
          lastOrder: order.created_at,
          paymentMethods: { [paymentMethod]: 1 },
          avgOrderValue: 0,
        });
      }
    }

    // Calculate avg order value and preferred payment method
    let customers = Array.from(customerMap.values()).map(c => {
      const totalSpent = c.totalSpentUYU + c.totalSpentUSD; // Simplified for sorting
      c.avgOrderValue = c.orderCount > 0 ? Math.round(c.totalSpentUYU / c.orderCount) : 0;
      const preferredPayment = Object.entries(c.paymentMethods)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown';

      return {
        ...c,
        totalSpent,
        preferredPayment,
      };
    });

    // Filter by search
    if (search) {
      customers = customers.filter(c =>
        (c.name && c.name.toLowerCase().includes(search)) ||
        (c.email && c.email.toLowerCase().includes(search)) ||
        (c.phone && c.phone.includes(search))
      );
    }

    // Sort
    const sortKey = sort as keyof typeof customers[0];
    customers.sort((a, b) => {
      const aVal = a[sortKey] ?? '';
      const bVal = b[sortKey] ?? '';
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return dir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return dir === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

    const totalCustomers = customers.length;
    const totalPages = Math.ceil(totalCustomers / PER_PAGE);

    // Paginate
    const start = (page - 1) * PER_PAGE;
    const paginatedCustomers = customers.slice(start, start + PER_PAGE);

    return NextResponse.json({
      customers: paginatedCustomers,
      pagination: { page, totalPages, totalCustomers },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    console.error('Customers API error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
