import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { cacheGet, cacheSet, searchRatelimit, getClientIp } from '@/lib/redis';
import { getCachedQueryEmbedding } from '@/lib/search/embedding-cache';
import { expandQuery } from '@/lib/search/query-expansion';
import { getSearchFallback } from '@/lib/search/ai-fallback';
import { CATEGORY_HIERARCHY } from '@/lib/categories';
import type { Database } from '@/types/database';

const MIN_SEARCH_QUERY_LENGTH = 2;
const MAX_SEARCH_QUERY_LENGTH = 100;

type SearchProductRpcRow = Database['public']['Functions']['search_products_fuzzy']['Returns'][number];
type SearchSemanticRpcRow = Database['public']['Functions']['search_products_semantic']['Returns'][number];
type ProductResult = Omit<SearchProductRpcRow, 'similarity'>;

type SynonymLookupResponse = {
  data: { maps_to: string } | null;
  error: { message: string } | null;
};

type FuzzySearchResponse = {
  data: SearchProductRpcRow[] | null;
  error: { message: string } | null;
};

type SemanticSearchResponse = {
  data: SearchSemanticRpcRow[] | null;
  error: { message: string } | null;
};

const synonymBridge = supabaseAdmin as unknown as {
  from: (table: 'search_synonyms') => {
    select: (columns: 'maps_to') => {
      eq: (column: 'is_active', value: boolean) => {
        ilike: (column: 'term', value: string) => {
          limit: (count: number) => {
            maybeSingle: () => Promise<SynonymLookupResponse>;
          };
        };
      };
    };
  };
};

const searchRpcBridge = supabaseAdmin as unknown as {
  rpc: {
    (
      fn: 'search_products_fuzzy',
      args: {
        search_query: string;
        similarity_threshold: number;
        result_limit: number;
      }
    ): Promise<FuzzySearchResponse>;
    (
      fn: 'search_products_semantic',
      args: {
        query_embedding: string;
        similarity_threshold: number;
        result_limit: number;
      }
    ): Promise<SemanticSearchResponse>;
  };
};

const searchAnalyticsBridge = supabaseAdmin as unknown as {
  from: (table: 'search_analytics') => {
    insert: (values: {
      query: string;
      results_count: number;
      source: string;
      metadata: {
        is_ai_expanded: boolean;
        has_fallback: boolean;
      };
    }) => Promise<unknown>;
  };
};

function toProductResult(product: SearchProductRpcRow): ProductResult {
  return {
    id: product.id,
    slug: product.slug,
    sku: product.sku,
    name: product.name,
    category: product.category,
    brand: product.brand,
    price_numeric: product.price_numeric,
    currency: product.currency,
    images: product.images,
    availability_type: product.availability_type,
  };
}

// ── Synonym resolver ──────────────────────────────────────────────────────────
async function resolveQuery(query: string): Promise<string> {
  const normalized = stripAccents(query.toLowerCase().trim());
  // .maybeSingle() returns null (not an error) when no row matches
  const { data, error } = await synonymBridge
    .from('search_synonyms')
    .select('maps_to')
    .eq('is_active', true)
    .ilike('term', normalized)
    .limit(1)
    .maybeSingle();

  if (error) {
    return query;
  }

  return data?.maps_to ?? query;
}

// GET - Search suggestions for autocomplete
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawQuery = searchParams.get('q') ?? '';
    const trimmedQuery = rawQuery.trim();

    if (!trimmedQuery || trimmedQuery.length < MIN_SEARCH_QUERY_LENGTH) {
      return NextResponse.json({ suggestions: [] });
    }

    if (trimmedQuery.length > MAX_SEARCH_QUERY_LENGTH) {
      return NextResponse.json({ suggestions: [] });
    }

    const sanitizedQuery = sanitizeSearchQuery(trimmedQuery);
    if (!sanitizedQuery || sanitizedQuery.length < MIN_SEARCH_QUERY_LENGTH) {
      return NextResponse.json({ suggestions: [] });
    }

    // Rate limiting (falls back gracefully if Redis unavailable)
    if (searchRatelimit) {
      const ip = getClientIp(request);
      const { success } = await searchRatelimit.limit(ip);
      if (!success) {
        return NextResponse.json(
          { suggestions: [], error: 'Too many requests' },
          { status: 429 }
        );
      }
    }

    // Cache keyed on raw query — synonym resolution is inside the cache miss
    const cacheKey = `search:v2:${sanitizedQuery.toLowerCase()}`;
    const cached = await cacheGet<{ suggestions: unknown[]; query: string }>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Only hit the DB for synonym + search on cache miss
    const resolvedQuery = sanitizeSearchQuery(await resolveQuery(sanitizedQuery));
    const normalizedQuery = stripAccents(resolvedQuery.trim());

    if (
      normalizedQuery.length < MIN_SEARCH_QUERY_LENGTH ||
      normalizedQuery.length > MAX_SEARCH_QUERY_LENGTH
    ) {
      return NextResponse.json({ suggestions: [] });
    }

    let products: ProductResult[] | null = null;

    // ── Step 1: Full-text search (accent-insensitive via 'simple' config + unaccent) ──
    const { data: ftsProducts, error: ftsError } = await supabaseAdmin
      .from('products')
        .select('id, sku, slug, name, category, brand, price_numeric, currency, images, availability_type')
        .eq('is_active', true)
        .textSearch('search_vector', normalizedQuery, {
          type: 'websearch',
          config: 'simple',
      })
      .limit(8);

    if (!ftsError && ftsProducts && ftsProducts.length > 0) {
      products = ftsProducts;
    }

    // Fuzzy trigram fallback (handles typos like "pisinas" → "piscinas")
    if (!products || products.length === 0) {
      const { data: fuzzyProducts, error: fuzzyError } = await searchRpcBridge.rpc(
        'search_products_fuzzy',
        {
          search_query: normalizedQuery,
          similarity_threshold: 0.2,
          result_limit: 8,
        }
      );

      if (!fuzzyError && fuzzyProducts && fuzzyProducts.length > 0) {
        products = fuzzyProducts.map(toProductResult);
      }
    }

    // ── Step 3: Last resort ILIKE on unaccented data (broad catch-all) ──
    if (!products || products.length === 0) {
      const { data: ilikeProducts } = await supabaseAdmin
        .from('products')
        .select('id, sku, slug, name, category, brand, price_numeric, currency, images, availability_type')
        .eq('is_active', true)
        .or(
          `name.ilike.%${normalizedQuery}%,` +
          `brand.ilike.%${normalizedQuery}%,` +
          `sku.ilike.%${normalizedQuery}%,` +
          `slug.ilike.%${normalizedQuery}%`
        )
        .limit(8);

      products = ilikeProducts;
    }

    // ── Step 4: Semantic search via pgvector (if available) ──
    if (!products || products.length === 0) {
      try {
        const qEmbed = await getCachedQueryEmbedding(normalizedQuery);
        if (qEmbed) {
          const { data: semanticResults } = await searchRpcBridge.rpc(
            'search_products_semantic',
            {
              query_embedding: `[${qEmbed.join(',')}]`,
              similarity_threshold: 0.70,
              result_limit: 8,
            }
          );

          if (semanticResults?.length) {
            const ids = semanticResults.map((result) => result.id);
            const { data: fullProducts } = await supabaseAdmin
              .from('products')
              .select('id, sku, slug, name, category, brand, price_numeric, currency, images, availability_type')
              .in('id', ids)
              .eq('is_active', true);

            if (fullProducts?.length) products = fullProducts;
          }
        }
      } catch {
        // Semantic search is non-critical — skip silently
      }
    }

    // ── Step 5: AI Query Expansion Fallback ──
    if ((!products || products.length === 0) && normalizedQuery.length >= 3) {
      try {
        const expandedTerms = await expandQuery(normalizedQuery);
        // Remove the original query since we already tried it
        const newTerms = expandedTerms.filter(t => stripAccents(t.toLowerCase()) !== normalizedQuery);
        
        if (newTerms.length > 0) {
          // Try fuzzy search with expanded terms
          for (const term of newTerms) {
            const { data: expandedResults } = await searchRpcBridge.rpc(
              'search_products_fuzzy',
              {
                search_query: stripAccents(term),
                similarity_threshold: 0.3, // Slightly stricter for expansion
                result_limit: 5,
              }
            );
            
            if (expandedResults?.length) {
              const ids = expandedResults.map((result) => result.id);
              const { data: fullProducts } = await supabaseAdmin
                .from('products')
                .select('id, sku, slug, name, category, brand, price_numeric, currency, images, availability_type')
                .in('id', ids)
                .eq('is_active', true);

              if (fullProducts?.length) {
                products = [...(products || []), ...fullProducts];
                if (products.length >= 8) break;
              }
            }
          }
        }
      } catch (err) {
        console.error('Expansion error:', err);
      }
    }

    // ── Step 6: Final AI Fallback (Category Suggestions) ──
    let fallbackData: { message: string, suggestions: string[] } | null = null;
    if (!products || products.length === 0) {
      try {
        const availableCats = CATEGORY_HIERARCHY.map(c => c.value);
        fallbackData = await getSearchFallback(sanitizedQuery, availableCats);
      } catch { /* silent */ }
    }

    // Boost: products whose name starts with the query come first
    if (products && products.length > 1) {
      const qLower = normalizedQuery.toLowerCase();
      products.sort((a, b) => {
        const aStarts = stripAccents(a.name.toLowerCase()).startsWith(qLower);
        const bStarts = stripAccents(b.name.toLowerCase()).startsWith(qLower);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return 0;
      });
    }

    // ── Suggestions: categories + brands + products ──

    // Categories that match (accent-insensitive)
    const { data: allCatProducts } = await supabaseAdmin
      .from('products')
      .select('category')
      .eq('is_active', true) as { data: Array<{ category: string[] }> | null };

    const qNorm = normalizedQuery.toLowerCase();
    const matchingCategories = [...new Set(
      (allCatProducts || [])
        .flatMap(p => p.category || [])
        .filter(c => stripAccents(c.toLowerCase()).includes(qNorm))
    )].slice(0, 3);

    // Brands that match (accent-insensitive)
    const { data: allBrands } = await supabaseAdmin
      .from('products')
      .select('brand')
      .eq('is_active', true)
      .limit(500) as { data: Array<{ brand: string | null }> | null };

    const matchingBrands = [...new Set(
      (allBrands || [])
        .map(b => b.brand)
        .filter((b): b is string => !!b && stripAccents(b.toLowerCase()).includes(qNorm))
    )].slice(0, 3);

    // Build suggestions array
    const suggestions: Array<{
      type: 'product' | 'category' | 'brand';
      id?: string;
      sku?: string;
      slug?: string | null;
      name: string;
      image?: string;
      price?: number;
      currency?: string;
      availability_type?: string;
    }> = [];

    matchingCategories.forEach(cat => {
      suggestions.push({ type: 'category', name: cat });
    });

    matchingBrands.forEach(brand => {
      suggestions.push({ type: 'brand', name: brand });
    });

    products?.forEach(product => {
      // Safety override: if price is 0 or 9999, it MUST be on_request
      const effectiveAvailabilityType = (product.price_numeric === 0 || product.price_numeric === 9999)
        ? 'on_request'
        : product.availability_type;

      suggestions.push({
        type: 'product',
        id: product.id,
        sku: product.sku,
        slug: product.slug,
        name: product.name,
        image: product.images?.[0] || undefined,
        price: product.price_numeric,
        currency: product.currency,
        availability_type: effectiveAvailabilityType,
      });
    });

    // Log search analytics (fire-and-forget)
    const productCount = products?.length || 0;
    const isAiExpanded = productCount > 0 && products?.some(p => !stripAccents(p.name.toLowerCase()).includes(normalizedQuery));
    
    void (async () => {
      try {
        await searchAnalyticsBridge.from('search_analytics').insert({
          query: resolvedQuery.toLowerCase(),
          results_count: productCount,
          source: 'suggestions',
          metadata: {
            is_ai_expanded: Boolean(isAiExpanded),
            has_fallback: Boolean(fallbackData),
          },
        });
      } catch {
        // Analytics write failure should not fail the request.
      }
    })();

    const result = {
      suggestions: suggestions.slice(0, 10),
      query: resolvedQuery,
      fallback: fallbackData,
    };

    // Cache for 60 seconds
    await cacheSet(cacheKey, result, 60);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Search suggestions error:', error);
    return NextResponse.json({ suggestions: [] });
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Strip diacritics/accents from a string.
 * "piscína" → "piscina", "Bomba centrífuga" → "Bomba centrifuga"
 * Mirrors what immutable_unaccent() does on the Postgres side.
 */
function stripAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Remove control/syntax characters that can interfere with PostgREST filters
 * while preserving readable user terms for search.
 */
function sanitizeSearchQuery(query: string): string {
  return query
    .normalize('NFKC')
    .replace(/[<>'"`;%_,(){}\[\]\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}