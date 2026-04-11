import { NextRequest, NextResponse } from 'next/server';
import { verifyOwnerAuth } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase';


export async function GET(request: NextRequest) {

  const authResult = await verifyOwnerAuth();
  if (!authResult.authorized) return authResult.response;

  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || '7d';
  const daysBack = period === '30d' ? 30 : period === '90d' ? 90 : 7;

  const now = new Date();
  const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

  try {
    // Fetch all search analytics for the period
    const { data: searches, error: searchesError } = await supabaseAdmin
      .from('search_analytics')
      .select('query, results_count, clicked_product_id, source, created_at')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(10000);

    if (searchesError) {
      throw new Error(searchesError.message);
    }

    const searchesArray = (searches || []) as Array<{
      query: string;
      results_count: number;
      clicked_product_id: string | null;
      source: string;
      created_at: string;
    }>;

    // Total stats
    const totalSearches = searchesArray.length;
    const uniqueQueries = new Set(searchesArray.map(s => s.query)).size;
    const zeroResults = searchesArray.filter(s => s.results_count === 0).length;
    const withClicks = searchesArray.filter(s => s.clicked_product_id).length;
    const zeroResultRate = totalSearches > 0
      ? Math.round((zeroResults / totalSearches) * 100 * 10) / 10
      : 0;
    const clickRate = totalSearches > 0
      ? Math.round((withClicks / totalSearches) * 100 * 10) / 10
      : 0;

    // Top searches by frequency
    const queryCounts: Record<string, { count: number; totalResults: number }> = {};
    for (const s of searchesArray) {
      if (!queryCounts[s.query]) {
        queryCounts[s.query] = { count: 0, totalResults: 0 };
      }
      queryCounts[s.query].count++;
      queryCounts[s.query].totalResults += s.results_count;
    }

    const topSearches = Object.entries(queryCounts)
      .map(([query, data]) => ({
        query,
        count: data.count,
        avgResults: Math.round(data.totalResults / data.count),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    // Zero-result queries
    const zeroResultQueries: Record<string, number> = {};
    for (const s of searchesArray) {
      if (s.results_count === 0) {
        zeroResultQueries[s.query] = (zeroResultQueries[s.query] || 0) + 1;
      }
    }

    const topZeroResults = Object.entries(zeroResultQueries)
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    // Daily search volume
    const dailySearches: Record<string, number> = {};
    for (const s of searchesArray) {
      const dateStr = new Date(s.created_at).toISOString().split('T')[0];
      dailySearches[dateStr] = (dailySearches[dateStr] || 0) + 1;
    }

    return NextResponse.json({
      summary: {
        totalSearches,
        uniqueQueries,
        zeroResults,
        zeroResultRate,
        clickRate,
      },
      topSearches,
      topZeroResults,
      dailySearches,
      period,
    });
  } catch (error) {
    console.error('Search analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch search analytics' },
      { status: 500 }
    );
  }
}
