import { NextRequest, NextResponse } from 'next/server';

// Unified daily maintenance cron — single cron entry for Vercel Hobby plan.
// Hobby plans only allow cron jobs that run once per day.
//
// Runs daily at 3am (UTC):
//   1. release_expired_reservations: always
//   2. abandoned cart recovery: always
//   3. weekly report: only on Mondays
//
// The original routes (/api/cron/release-stock, /api/cron/weekly-report,
// /api/cron/abandoned-carts) still work and can be called manually for testing.

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

  console.log('🔧 Maintenance cron complete:', JSON.stringify(results));

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    ...results,
  });
}
