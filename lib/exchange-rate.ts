import { cacheGet, cacheSet } from './redis';

const CACHE_KEY = 'exchange-rate:usd-uyu';
const CACHE_TTL = 4 * 60 * 60; // 4 hours
const DOLAR_API_URL = 'https://uy.dolarapi.com/v1/cotizaciones/usd';

export interface ExchangeRateData {
  rate: number;
  source: 'api' | 'cache' | 'fallback';
  updatedAt: string;
}

export async function getExchangeRate(): Promise<ExchangeRateData> {
  // 1. Try Redis cache
  const cached = await cacheGet<ExchangeRateData>(CACHE_KEY);
  if (cached && cached.rate > 0) {
    return { ...cached, source: 'cache' };
  }

  // 2. Try DolarAPI (BROU venta rate)
  try {
    const res = await fetch(DOLAR_API_URL, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      const rate = Number(data.venta);
      if (rate > 0) {
        const result: ExchangeRateData = {
          rate,
          source: 'api',
          updatedAt: data.fechaActualizacion || new Date().toISOString(),
        };
        await cacheSet(CACHE_KEY, result, CACHE_TTL);
        return result;
      }
    }
  } catch (err) {
    console.error('DolarAPI fetch failed:', err);
  }

  // 3. Fallback to env var
  const fallback = Number(process.env.USD_TO_UYU_FALLBACK);
  if (fallback > 0) {
    return { rate: fallback, source: 'fallback', updatedAt: new Date().toISOString() };
  }

  throw new Error('No exchange rate available');
}

/** Convert a price between currencies */
export function convertPrice(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rate: number
): number {
  if (fromCurrency === toCurrency) return amount;
  if (fromCurrency === 'USD' && toCurrency === 'UYU') {
    return Math.round(amount * rate * 100) / 100;
  }
  if (fromCurrency === 'UYU' && toCurrency === 'USD') {
    return Math.round((amount / rate) * 100) / 100;
  }
  return amount;
}
