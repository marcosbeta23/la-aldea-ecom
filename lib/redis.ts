// lib/redis.ts
// Upstash Redis client for caching and rate limiting
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

// Lazy-initialize to avoid errors when env vars aren't set
let _redis: Redis | null = null;

export function getRedis(): Redis | null {
  if (_redis) return _redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  _redis = new Redis({ url, token });
  return _redis;
}

// ── Cache helpers ─────────────────────────────────────────────────────

/** Get a cached value, returning null on miss or if Redis is unavailable */
export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = getRedis();
  if (!redis) return null;
  try {
    return await redis.get<T>(key);
  } catch {
    return null;
  }
}

/** Set a cached value with TTL in seconds. Silently fails if Redis unavailable */
export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  try {
    await redis.set(key, value, { ex: ttlSeconds });
  } catch {}
}

/** Delete a cached key */
export async function cacheDel(key: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  try {
    await redis.del(key);
  } catch {}
}

// ── Rate limiting ─────────────────────────────────────────────────────

/** Create an Upstash rate limiter. Returns null if Redis is not configured. */
export function createRatelimit(opts: {
  requests: number;
  window: `${number} ${'s' | 'ms' | 'm' | 'h' | 'd'}`;
  prefix?: string;
}): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(opts.requests, opts.window),
    prefix: opts.prefix || '@upstash/ratelimit',
    analytics: true,
  });
}

// Pre-built rate limiters for API routes
export const searchRatelimit = createRatelimit({
  requests: 30,
  window: '60 s',
  prefix: 'rl:search',
});

export const ordersRatelimit = createRatelimit({
  requests: 5,
  window: '60 s',
  prefix: 'rl:orders',
});

export const reviewsRatelimit = createRatelimit({
  requests: 3,
  window: '60 s',
  prefix: 'rl:reviews',
});

export const contactRatelimit = createRatelimit({
  requests: 3,
  window: '60 s',
  prefix: 'rl:contact',
});

export const couponsRatelimit = createRatelimit({
  requests: 10,
  window: '60 s',
  prefix: 'rl:coupons',
});

// Global coupon rate limit (across ALL IPs) — limits total enumeration attempts
// even when attackers rotate IP addresses.
export const couponsGlobalRatelimit = createRatelimit({
  requests: 100,
  window: '1 m',
  prefix: 'rl:coupons:global',
});

export const quoteRatelimit = createRatelimit({
  requests: 3,
  window: '60 s',
  prefix: 'rl:quote',
});

// ── Helper to get client IP ────────────────────────────────────────────

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const real = request.headers.get('x-real-ip');
  if (real) return real;
  return '127.0.0.1';
}
