// lib/search/embedding-cache.ts
// Upstash cache wrapper for OpenAI query embeddings (1h TTL)
import { cacheGet, cacheSet } from '@/lib/redis';

async function getQueryEmbedding(query: string): Promise<number[] | null> {
  if (!process.env.OPENAI_API_KEY) return null; // skip entirely if key not configured
  try {
    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: query,
        dimensions: 1536,
      }),
    });
    const data = await res.json();
    return data.data?.[0]?.embedding ?? null;
  } catch {
    return null; // never break search
  }
}

export async function getCachedQueryEmbedding(query: string): Promise<number[] | null> {
  const key = `embed:q:${query.toLowerCase().trim()}`;
  const cached = await cacheGet<number[]>(key);
  if (cached) return cached;

  const embedding = await getQueryEmbedding(query);
  if (embedding) await cacheSet(key, embedding, 3600); // 1 hour TTL
  return embedding;
}
