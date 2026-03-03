import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

async function checkAdminAuth(): Promise<boolean> {
  const { userId } = await auth();
  return !!userId;
}

const POSTHOG_API_KEY = process.env.POSTHOG_PERSONAL_API_KEY;
const POSTHOG_PROJECT_ID = process.env.POSTHOG_PROJECT_ID;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.posthog.com';

interface PostHogEvent {
  event: string;
  properties: Record<string, string | number | undefined>;
  timestamp: string;
}

export async function GET(request: NextRequest) {
  if (!(await checkAdminAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!POSTHOG_API_KEY || !POSTHOG_PROJECT_ID) {
    return NextResponse.json({
      error: 'PostHog API not configured',
      configured: false,
    }, { status: 200 });
  }

  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || '7d';
  const daysBack = period === '30d' ? 30 : period === '90d' ? 90 : 7;

  const now = new Date();
  const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  try {
    // Fetch pageview events for the period
    const eventsUrl = `${POSTHOG_HOST}/api/projects/${POSTHOG_PROJECT_ID}/events?event=$pageview&after=${startDate.toISOString()}&limit=10000`;

    const eventsRes = await fetch(eventsUrl, {
      headers: {
        Authorization: `Bearer ${POSTHOG_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!eventsRes.ok) {
      const errorText = await eventsRes.text();
      console.error('PostHog API error:', eventsRes.status, errorText);
      return NextResponse.json({
        error: 'PostHog API error',
        configured: true,
      }, { status: 200 });
    }

    const eventsData = await eventsRes.json();
    const events: PostHogEvent[] = eventsData.results || [];

    // Calculate unique visitors by distinct_id
    const allVisitors = new Set(events.map((e: PostHogEvent) => e.properties?.distinct_id).filter(Boolean));
    const todayEvents = events.filter((e: PostHogEvent) => new Date(e.timestamp) >= todayStart);
    const todayVisitors = new Set(todayEvents.map((e: PostHogEvent) => e.properties?.distinct_id).filter(Boolean));

    // Top pages
    const pageCounts: Record<string, number> = {};
    for (const event of events) {
      const url = event.properties?.$current_url || event.properties?.$pathname || '';
      if (typeof url === 'string') {
        // Extract pathname only
        let pathname: string;
        try {
          pathname = new URL(url).pathname;
        } catch {
          pathname = url;
        }
        // Skip admin pages
        if (pathname.startsWith('/admin')) continue;
        pageCounts[pathname] = (pageCounts[pathname] || 0) + 1;
      }
    }

    const topPages = Object.entries(pageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([page, views]) => ({ page, views }));

    // Top referrers
    const referrerCounts: Record<string, number> = {};
    for (const event of events) {
      const referrer = event.properties?.$referrer;
      if (referrer && typeof referrer === 'string' && referrer.length > 0) {
        try {
          const host = new URL(referrer).hostname;
          // Skip self-referrals
          if (host.includes('laaldea') || host.includes('localhost') || host.includes('vercel.app')) continue;
          referrerCounts[host] = (referrerCounts[host] || 0) + 1;
        } catch {
          referrerCounts[referrer] = (referrerCounts[referrer] || 0) + 1;
        }
      }
    }

    const topReferrers = Object.entries(referrerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([referrer, visits]) => ({ referrer, visits }));

    // Daily pageview counts
    const dailyViews: Record<string, number> = {};
    for (const event of events) {
      const dateStr = new Date(event.timestamp).toISOString().split('T')[0];
      dailyViews[dateStr] = (dailyViews[dateStr] || 0) + 1;
    }

    return NextResponse.json({
      configured: true,
      visitors: {
        total: allVisitors.size,
        today: todayVisitors.size,
        pageviews: events.length,
        todayPageviews: todayEvents.length,
      },
      topPages,
      topReferrers,
      dailyViews,
      period,
    });
  } catch (error) {
    console.error('PostHog insights error:', error);
    return NextResponse.json({
      error: 'Failed to fetch PostHog data',
      configured: true,
    }, { status: 200 });
  }
}
