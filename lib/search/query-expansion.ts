// lib/search/query-expansion.ts
// Expands search queries with synonyms via Groq when DB synonym lookup misses
import { callGroq } from '@/lib/ai';
import { cacheGet, cacheSet } from '@/lib/redis';

export async function expandQuery(query: string): Promise<string[]> {
  // Check Upstash cache first (uses existing cacheGet/cacheSet pattern)
  const cacheKey = `search:expand:${query.toLowerCase().trim()}`;
  const cached = await cacheGet<string[]>(cacheKey);
  if (cached) return cached;

  try {
    const raw = await callGroq({
      systemPrompt: `Sos un experto en productos de ferretería, hidráulica y agro en Uruguay.
Respondé SOLO con JSON. Sin texto adicional.`,
      userPrompt: `Para la búsqueda "${query}", generá términos alternativos en español rioplatense.
Incluí: sinónimos, nombres técnicos, nombres coloquiales, variaciones.
Máximo 4 términos. Formato: {"terms": ["term1", "term2"]}`,
      max_tokens: 80,
      temperature: 0.2,
      jsonMode: true,
    });

    const parsed = JSON.parse(raw);

    // SECURITY: sanitize before using
    const terms = [query, ...sanitizeExpansionTerms(parsed.terms ?? [])];

    // Cache 10 min — same TTL pattern as existing cacheSet
    await cacheSet(cacheKey, terms, 600);
    return terms;
  } catch {
    return [query]; // Always fall back — never break search
  }
}

/**
 * Validates terms returned by Groq before they're used in search or cached.
 * Guards against: HTML injection chars, empty strings, single chars, novels.
 */
function sanitizeExpansionTerms(terms: unknown[]): string[] {
  return terms
    .filter((t): t is string => typeof t === 'string')
    .map(t => t.trim())
    .filter(t => t.length > 1 && t.length < 60)      // no single chars, no novels
    .filter(t => !/[<>{}[\]\\]/.test(t))               // no HTML/JSON injection chars
    .slice(0, 4);                                       // hard cap
}
