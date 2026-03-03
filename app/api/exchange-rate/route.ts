import { NextResponse } from 'next/server';
import { getExchangeRate } from '@/lib/exchange-rate';

export async function GET() {
  try {
    const data = await getExchangeRate();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Exchange rate unavailable' },
      { status: 503 }
    );
  }
}
