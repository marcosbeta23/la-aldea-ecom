// app/api/admin/assistant/tools.ts
// Supabase tool executors for the admin assistant
import { supabaseAdmin } from '@/lib/supabase';
import type { Database } from '@/types/database';

type Input = Record<string, unknown>;

type OrderListRow = Pick<
  Database['public']['Tables']['orders']['Row'],
  | 'order_number'
  | 'status'
  | 'total'
  | 'currency'
  | 'shipping_type'
  | 'payment_method'
  | 'customer_name'
  | 'customer_email'
  | 'order_source'
  | 'created_at'
>;

type SalesSummaryRow = Pick<
  Database['public']['Tables']['orders']['Row'],
  'total' | 'currency' | 'status' | 'order_source'
>;

type LowStockRow = Pick<
  Database['public']['Tables']['products']['Row'],
  'name' | 'sku' | 'stock' | 'category' | 'price_numeric'
>;

type ProductLookupRow = Pick<
  Database['public']['Tables']['products']['Row'],
  'name' | 'sku' | 'stock' | 'price_numeric' | 'category' | 'is_active' | 'currency'
>;

type CustomerHistoryItem = {
  product_name: string;
  quantity: number;
  unit_price: number;
};

type CustomerHistoryRow = Pick<
  Database['public']['Tables']['orders']['Row'],
  'order_number' | 'status' | 'total' | 'currency' | 'created_at' | 'customer_email'
> & {
  order_items: CustomerHistoryItem[] | null;
};

type AbandonedCartRow = Pick<
  Database['public']['Tables']['checkout_attempts']['Row'],
  'customer_name' | 'email' | 'subtotal' | 'currency' | 'created_at' | 'items'
>;

type SearchGapRow = Pick<
  Database['public']['Tables']['search_analytics']['Row'],
  'query'
>;

function getText(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function getNumber(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return value;
}

function sanitizeLikeTerm(value: string): string {
  return value.replace(/[%,]/g, '').trim();
}

/** Mask email to protect PII before sending to AI: marco@gmail.com → m***o@gmail.com */
function maskEmail(email: string | null | undefined): string {
  if (!email || typeof email !== 'string') return '';
  const [local, domain] = email.split('@');
  if (!domain || local.length < 2) return '***@' + (domain || 'redacted');
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

/** Anonymize PII fields in tool results */
function anonymizeOrders<T extends { customer_email: string | null }>(rows: T[]) {
  return rows.map(r => ({
    ...r,
    customer_email: r.customer_email ? maskEmail(r.customer_email) : undefined,
  }));
}

export async function executeTool(name: string, input: Input): Promise<unknown> {
  switch (name) {
    case 'get_orders': {
      const limit = getNumber(input.limit, 10);
      const daysAgo = getNumber(input.days_ago, 0);
      const statusFilter = getText(input.status);
      const customerName = getText(input.customer_name);
      const paymentMethod = getText(input.payment_method);
      const shippingType = getText(input.shipping_type);
      const orderSource = getText(input.order_source);

      let query = supabaseAdmin
        .from('orders')
        .select('order_number, status, total, currency, shipping_type, payment_method, customer_name, customer_email, order_source, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (statusFilter) query = query.filter('status', 'eq', statusFilter);
      if (daysAgo > 0) {
        const since = new Date(Date.now() - daysAgo * 86400000).toISOString();
        query = query.gte('created_at', since);
      }
      if (customerName) query = query.ilike('customer_name', `%${sanitizeLikeTerm(customerName)}%`);
      if (paymentMethod) query = query.filter('payment_method', 'eq', paymentMethod);
      if (shippingType) query = query.filter('shipping_type', 'eq', shippingType);
      if (orderSource) query = query.filter('order_source', 'eq', orderSource);

      const { data, error } = await query.returns<OrderListRow[]>();
      if (error) return { error: error.message };
      return anonymizeOrders(data ?? []);
    }

    case 'get_sales_summary': {
      const period = getText(input.period) ?? 'week';
      const days = { today: 1, week: 7, month: 30 }[period] ?? 7;
      const since = new Date(Date.now() - days * 86400000).toISOString();

      const revenueStatuses: Array<Database['public']['Tables']['orders']['Row']['status']> = [
        'paid',
        'paid_pending_verification',
        'ready_to_invoice',
        'invoiced',
        'processing',
        'shipped',
        'delivered',
      ];

      const { data, error } = await supabaseAdmin
        .from('orders')
        .select('total, currency, status, order_source')
        .gte('created_at', since)
        .in('status', revenueStatuses)
        .returns<SalesSummaryRow[]>();

      if (error) return { error: error.message };

      const rows = data ?? [];
      const uyu = rows.filter((o) => (o.currency ?? 'UYU') === 'UYU');
      const usd = rows.filter((o) => o.currency === 'USD');
      const totalUYU = uyu.reduce((sum, o) => sum + (o.total ?? 0), 0);
      const totalUSD = usd.reduce((sum, o) => sum + (o.total ?? 0), 0);
      const online = rows.filter((o) => String(o.order_source ?? '') !== 'mostrador');
      const mostrador = rows.filter((o) => String(o.order_source ?? '') === 'mostrador');

      return {
        period,
        total_orders: rows.length,
        online_orders: online.length,
        mostrador_orders: mostrador.length,
        revenue_uyu: Math.round(totalUYU),
        revenue_usd: parseFloat(totalUSD.toFixed(2)),
        avg_ticket_uyu: uyu.length > 0 ? Math.round(totalUYU / uyu.length) : 0,
      };
    }

    case 'get_low_stock_products': {
      const threshold = getNumber(input.threshold, 5);
      const categoryFilter = getText(input.category);

      let query = supabaseAdmin
        .from('products')
        .select('name, sku, stock, category, price_numeric')
        .lte('stock', threshold)
        .eq('is_active', true)
        .order('stock', { ascending: true });

      if (categoryFilter) query = query.contains('category', [categoryFilter]);

      const { data, error } = await query.returns<LowStockRow[]>();
      return error ? { error: error.message } : data;
    }

    case 'get_product_by_name_or_sku': {
      const lookup = getText(input.query);
      if (!lookup) return [];

      const safeLookup = sanitizeLikeTerm(lookup);

      const { data, error } = await supabaseAdmin
        .from('products')
        .select('name, sku, stock, price_numeric, category, is_active, currency')
        .or(`name.ilike.%${safeLookup}%,sku.eq.${lookup}`)
        .limit(5)
        .returns<ProductLookupRow[]>();
      return error ? { error: error.message } : data;
    }

    case 'get_customer_history': {
      const emailFilter = getText(input.email);
      const nameFilter = getText(input.name);

      let query = supabaseAdmin
        .from('orders')
        .select('order_number, status, total, currency, created_at, order_items(product_name, quantity, unit_price)')
        .order('created_at', { ascending: false })
        .limit(10);

      if (emailFilter) query = query.eq('customer_email', emailFilter);
      if (nameFilter) query = query.ilike('customer_name', `%${sanitizeLikeTerm(nameFilter)}%`);

      const { data, error } = await query.returns<CustomerHistoryRow[]>();
      if (error) return { error: error.message };
      return anonymizeOrders(data ?? []);
    }

    case 'get_abandoned_carts': {
      const hoursAgo = getNumber(input.hours_ago, 24);
      const since = new Date(Date.now() - hoursAgo * 3600000).toISOString();

      const { data, error } = await supabaseAdmin
        .from('checkout_attempts')
        .select('customer_name, email, subtotal, currency, created_at, items')
        .gte('created_at', since)
        .eq('recovered', false)
        .is('order_id', null)
        .order('subtotal', { ascending: false })
        .limit(10)
        .returns<AbandonedCartRow[]>();

      if (error) return { error: error.message };
      return (data ?? []).map((r) => ({
        ...r,
        email: maskEmail(r.email),
      }));
    }

    case 'get_search_gaps': {
      const daysAgo = getNumber(input.days_ago, 7);
      const since = new Date(Date.now() - daysAgo * 86400000).toISOString();
      const limit = getNumber(input.limit, 10);

      const { data, error } = await supabaseAdmin
        .from('search_analytics')
        .select('query')
        .eq('results_count', 0)
        .gte('created_at', since)
        .returns<SearchGapRow[]>();

      if (error) return { error: error.message };

      const freq: Record<string, number> = {};
      for (const row of data ?? []) {
        freq[row.query] = (freq[row.query] ?? 0) + 1;
      }

      return Object.entries(freq)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)
        .map(([query, count]) => ({ query, count }));
    }

    default:
      return { error: `Unknown tool: ${name}` };
  }
}
