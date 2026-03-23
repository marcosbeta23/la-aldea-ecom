// app/api/admin/assistant/tools.ts
// Supabase tool executors for the admin assistant
import { supabaseAdmin } from '@/lib/supabase';

type Input = Record<string, unknown>;

/** Mask email to protect PII before sending to AI: marco@gmail.com → m***o@gmail.com */
function maskEmail(email: string | null | undefined): string {
  if (!email || typeof email !== 'string') return '';
  const [local, domain] = email.split('@');
  if (!domain || local.length < 2) return '***@' + (domain || 'redacted');
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

/** Anonymize PII fields in tool results */
function anonymizeOrders(rows: any[]): any[] {
  return rows.map(r => ({
    ...r,
    customer_email: r.customer_email ? maskEmail(r.customer_email) : undefined,
  }));
}

export async function executeTool(name: string, input: Input): Promise<unknown> {
  switch (name) {
    case 'get_orders': {
      let query = (supabaseAdmin as any)
        .from('orders')
        .select('order_number, status, total, currency, shipping_type, payment_method, customer_name, customer_email, order_source, created_at')
        .order('created_at', { ascending: false })
        .limit((input.limit as number) ?? 10);

      if (input.status) query = query.eq('status', input.status);
      if (input.days_ago) {
        const since = new Date(Date.now() - (input.days_ago as number) * 86400000).toISOString();
        query = query.gte('created_at', since);
      }
      if (input.customer_name) query = query.ilike('customer_name', `%${input.customer_name}%`);
      if (input.payment_method) query = query.eq('payment_method', input.payment_method);
      if (input.shipping_type) query = query.eq('shipping_type', input.shipping_type);
      if (input.order_source) query = query.eq('order_source', input.order_source);

      const { data, error } = await query;
      if (error) return { error: error.message };
      return anonymizeOrders(data ?? []);
    }

    case 'get_sales_summary': {
      const days = { today: 1, week: 7, month: 30 }[input.period as string] ?? 7;
      const since = new Date(Date.now() - days * 86400000).toISOString();

      const { data, error } = await (supabaseAdmin as any)
        .from('orders')
        .select('total, currency, status, order_source')
        .gte('created_at', since)
        .in('status', ['paid', 'paid_pending_verification', 'ready_to_invoice',
                       'invoiced', 'processing', 'shipped', 'delivered']);

      if (error) return { error: error.message };

      const uyu = data?.filter((o: any) => (o.currency ?? 'UYU') === 'UYU') ?? [];
      const usd = data?.filter((o: any) => o.currency === 'USD') ?? [];
      const totalUYU = uyu.reduce((s: number, o: any) => s + (o.total ?? 0), 0);
      const totalUSD = usd.reduce((s: number, o: any) => s + (o.total ?? 0), 0);
      const online = data?.filter((o: any) => o.order_source !== 'mostrador') ?? [];
      const mostrador = data?.filter((o: any) => o.order_source === 'mostrador') ?? [];

      return {
        period: input.period,
        total_orders: data?.length ?? 0,
        online_orders: online.length,
        mostrador_orders: mostrador.length,
        revenue_uyu: Math.round(totalUYU),
        revenue_usd: parseFloat(totalUSD.toFixed(2)),
        avg_ticket_uyu: uyu.length > 0 ? Math.round(totalUYU / uyu.length) : 0,
      };
    }

    case 'get_low_stock_products': {
      const threshold = (input.threshold as number) ?? 5;
      let query = (supabaseAdmin as any)
        .from('products')
        .select('name, sku, stock, category, price_numeric')
        .lte('stock', threshold)
        .eq('is_active', true)
        .order('stock', { ascending: true });

      if (input.category) query = query.contains('category', [input.category]);

      const { data, error } = await query;
      return error ? { error: error.message } : data;
    }

    case 'get_product_by_name_or_sku': {
      const { data, error } = await (supabaseAdmin as any)
        .from('products')
        .select('name, sku, stock, price_numeric, category, is_active, currency')
        .or(`name.ilike.%${input.query}%,sku.eq.${input.query}`)
        .limit(5);
      return error ? { error: error.message } : data;
    }

    case 'get_customer_history': {
      let query = (supabaseAdmin as any)
        .from('orders')
        .select('order_number, status, total, currency, created_at, order_items(product_name, quantity, unit_price)')
        .order('created_at', { ascending: false })
        .limit(10);

      if (input.email) query = query.eq('customer_email', input.email);
      if (input.name) query = query.ilike('customer_name', `%${input.name}%`);

      const { data, error } = await query;
      if (error) return { error: error.message };
      return anonymizeOrders(data ?? []);
    }

    case 'get_abandoned_carts': {
      const hoursAgo = (input.hours_ago as number) ?? 24;
      const since = new Date(Date.now() - hoursAgo * 3600000).toISOString();

      const { data, error } = await (supabaseAdmin as any)
        .from('checkout_attempts')
        .select('customer_name, email, subtotal, currency, created_at, items')
        .gte('created_at', since)
        .eq('recovered', false)
        .is('order_id', null)
        .order('subtotal', { ascending: false })
        .limit(10);
      if (error) return { error: error.message };
      return (data ?? []).map((r: any) => ({
        ...r,
        email: maskEmail(r.email),
      }));
    }

    case 'get_search_gaps': {
      const daysAgo = (input.days_ago as number) ?? 7;
      const since = new Date(Date.now() - daysAgo * 86400000).toISOString();

      const { data, error } = await (supabaseAdmin as any)
        .from('search_analytics')
        .select('query')
        .eq('results_count', 0)
        .gte('created_at', since);

      if (error) return { error: error.message };

      const freq: Record<string, number> = {};
      for (const row of data ?? []) {
        freq[row.query] = (freq[row.query] ?? 0) + 1;
      }

      return Object.entries(freq)
        .sort(([, a], [, b]) => b - a)
        .slice(0, (input.limit as number) ?? 10)
        .map(([query, count]) => ({ query, count }));
    }

    default:
      return { error: `Unknown tool: ${name}` };
  }
}
