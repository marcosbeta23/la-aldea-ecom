import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Unified daily maintenance cron — single cron entry for Vercel Hobby plan.
// Hobby plans only allow cron jobs that run once per day.
//
// SAFETY NET: Inngest now handles abandoned carts and stock release in real-time
// (event-driven with precise timing). This cron is a daily fallback that catches
// anything Inngest might have missed.
//
// Runs daily at 3am (UTC):
//   1. release_expired_reservations: always (safety net for inngest/stock-reservation-expiry)
//   2. abandoned cart recovery: always (safety net for inngest/abandoned-cart-recovery)
//   3. weekly report: only on Mondays
//   4. data purge: always (trim search analytics & stale checkouts)
//   5. monthly snapshots: only on the 1st of each month

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results: Record<string, unknown> = {};
  const baseUrl = request.nextUrl.origin;
  const headers: Record<string, string> = {};
  if (cronSecret) {
    headers['authorization'] = `Bearer ${cronSecret}`;
  }

  // 1. Release expired stock — runs every day
  try {
    const res = await fetch(`${baseUrl}/api/cron/release-stock`, { headers });
    results.releaseStock = await res.json();
  } catch (err: any) {
    results.releaseStock = { success: false, error: err.message };
  }

  // 2. Abandoned cart recovery — runs every day
  // Catches all carts abandoned since last run (2+ hours old, no matching order)
  try {
    const res = await fetch(`${baseUrl}/api/cron/abandoned-carts`, { headers });
    results.abandonedCarts = await res.json();
  } catch (err: any) {
    results.abandonedCarts = { success: false, error: err.message };
  }

  // 3. Weekly report — only on Mondays (UTC)
  const dayOfWeek = new Date().getUTCDay(); // 0=Sun, 1=Mon
  if (dayOfWeek === 1) {
    try {
      const res = await fetch(`${baseUrl}/api/cron/weekly-report`, { headers });
      results.weeklyReport = await res.json();
    } catch (err: any) {
      results.weeklyReport = { success: false, error: err.message };
    }
  } else {
    results.weeklyReport = { skipped: true, reason: 'Not Monday' };
  }

  // 4. Cancel stale MercadoPago pending orders (older than 2 hours)
  // Prevents ghost MP orders from polluting the dashboard when a customer
  // starts checkout but abandons without paying.
  try {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const { data: cancelledOrders, error: cancelError } = await (supabaseAdmin as any)
      .from('orders')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('payment_method', 'mercadopago')
      .eq('status', 'pending')
      .lt('created_at', twoHoursAgo)
      .select('id, order_number');

    if (cancelError) {
      results.cancelAbandonedMp = { success: false, error: cancelError.message };
    } else {
      const count = cancelledOrders?.length ?? 0;
      console.log(`🧹 Cancelled ${count} stale MP pending orders`);
      results.cancelAbandonedMp = { success: true, cancelled: count };
    }
  } catch (err: any) {
    results.cancelAbandonedMp = { success: false, error: err.message };
  }

  // 5. Data Purge — trim search_analytics (>90d) and checkout_attempts (>6 months)
  try {
    const { error: purgeSearchError } = await supabaseAdmin.rpc('purge_old_data');
    if (purgeSearchError) {
      // Fallback if RPC doesn't exist yet
      await Promise.all([
        supabaseAdmin.from('search_analytics').delete().lt('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()),
        supabaseAdmin.from('checkout_attempts').delete().eq('recovered', false).lt('created_at', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()),
      ]);
      results.dataPurge = { success: true, method: 'fallback' };
    } else {
      results.dataPurge = { success: true, method: 'rpc' };
    }
  } catch (err: any) {
    results.dataPurge = { success: false, error: err.message };
  }

  // 6. Monthly Snapshots — only on the 1st of the month
  const dayOfMonth = new Date().getUTCDate();
  if (dayOfMonth === 1) {
    try {
      const { error: snapshotError } = await supabaseAdmin.rpc('generate_monthly_snapshot');
      if (snapshotError) {
        // Fallback manual logic if RPC not available
        const lastMonth = new Date();
        lastMonth.setUTCDate(0); // Last day of previous month
        const startOfMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1).toISOString();
        const endOfMonth = lastMonth.toISOString();

        const { data: snapshotData } = await supabaseAdmin
          .from('orders')
          .select('total, currency, status')
          .gte('created_at', startOfMonth)
          .lte('created_at', endOfMonth)
          .in('status', ['paid', 'invoiced', 'processing', 'shipped', 'delivered']) as { data: Array<{ total: number; currency: string; status: string }> | null };

        const totalUYU = snapshotData?.filter(o => o.currency === 'UYU').reduce((s, o) => s + (o.total || 0), 0) || 0;
        const totalUSD = snapshotData?.filter(o => o.currency === 'USD').reduce((s, o) => s + (o.total || 0), 0) || 0;
        
        await (supabaseAdmin.from('monthly_revenue_snapshots' as any) as any).upsert({
          month: startOfMonth.split('T')[0],
          revenue_uyu: totalUYU,
          revenue_usd: totalUSD,
          order_count: snapshotData?.length || 0,
        });
        results.monthlySnapshot = { success: true, method: 'fallback' };
      } else {
        results.monthlySnapshot = { success: true, method: 'rpc' };
      }
    } catch (err: any) {
      results.monthlySnapshot = { success: false, error: err.message };
    }
  }

  console.log('🔧 Maintenance cron complete:', JSON.stringify(results));

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    ...results,
  });
}
