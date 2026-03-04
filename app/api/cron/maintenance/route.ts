import { NextRequest, NextResponse } from 'next/server';

// Unified daily maintenance cron — replaces two separate cron entries
// to stay within Vercel Hobby's 2-cron limit.
//
// Runs daily at 3am (UTC):
//   - release_expired_reservations: always
//   - weekly report: only on Mondays
//
// The original routes (/api/cron/release-stock, /api/cron/weekly-report)
// still work and can be called manually for testing.

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

  // 2. Weekly report — only on Mondays (UTC)
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
