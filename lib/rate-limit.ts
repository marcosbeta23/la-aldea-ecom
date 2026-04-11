// lib/rate-limit.ts
// Rate limiting implementation using LRU cache
import { LRUCache } from 'lru-cache';

type Options = {
  uniqueTokenPerInterval?: number; // Max unique IPs to track
  interval?: number; // Time window in milliseconds
};

export function getClientIP(req: Request): string {
  return (
    req.headers.get("CF-Connecting-IP") ??       // real IP when behind Cloudflare
    req.headers.get("X-Forwarded-For")?.split(",")[0].trim() ??
    "unknown"
  );
}

export default function rateLimit(options?: Options) {
  const tokenCache = new LRUCache({
    max: options?.uniqueTokenPerInterval || 500,
    ttl: options?.interval || 60000, // Default 1 minute
  });

  return {
    check: (limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = (tokenCache.get(token) as number[]) || [0];
        if (tokenCount[0] === 0) {
          tokenCache.set(token, tokenCount);
        }
        tokenCount[0] += 1;

        const currentUsage = tokenCount[0];
        const isRateLimited = currentUsage >= limit;

        return isRateLimited ? reject() : resolve();
      }),
  };
}

