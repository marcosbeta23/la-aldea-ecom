import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { cacheGet, cacheSet, searchRatelimit, getClientIp } from '@/lib/redis';

// GET - Search suggestions for autocomplete
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();

    if (!query || query.length < 2) {
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

    // Check cache first (60s TTL)
    const cacheKey = `search:${query.toLowerCase()}`;
    const cached = await cacheGet<{ suggestions: unknown[]; query: string }>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    type ProductResult = {
      id: string;
      slug: string;
      sku: string;
      name: string;
      category: string[];
      brand: string | null;
      price_numeric: number;
      currency: string;
      images: string[] | null;
    };

    // Normalize query: strip accents so "piscina" matches "piscína" and vice versa
    // This mirrors what immutable_unaccent() does in Postgres
    const normalizedQuery = stripAccents(query);

    let products: ProductResult[] | null = null;

    // ── Step 1: Full-text search (accent-insensitive via 'simple' config + unaccent) ──
    const { data: ftsProducts, error: ftsError } = await supabaseAdmin
      .from('products')
      .select('id, sku, slug, name, category, brand, price_numeric, currency, images')
      .eq('is_active', true)
      .textSearch('search_vector', normalizedQuery, {
        type: 'websearch',
        config: 'simple',  // 'simple' works with our unaccented tsvector
      })
      .limit(8) as { data: ProductResult[] | null; error: any };

    if (!ftsError && ftsProducts && ftsProducts.length > 0) {
      products = ftsProducts;
    }

    // Fuzzy trigram fallback (handles typos like "pisinas" → "piscinas")
    if (!products || products.length === 0) {
      const { data: fuzzyProducts, error: fuzzyError } = await (supabaseAdmin as any)
        .rpc('search_products_fuzzy', {
          search_query: normalizedQuery,
          similarity_threshold: 0.2,
          result_limit: 8,
        }) as { data: ProductResult[] | null; error: any };

      if (!fuzzyError && fuzzyProducts && fuzzyProducts.length > 0) {
        products = fuzzyProducts;
      }
    }

    // ── Step 3: Last resort ILIKE on unaccented data (broad catch-all) ──
    if (!products || products.length === 0) {
      const { data: ilikeProducts } = await supabaseAdmin
        .from('products')
        .select('id, sku, slug, name, category, brand, price_numeric, currency, images')
        .eq('is_active', true)
        .or(
          `name.ilike.%${normalizedQuery}%,` +
          `brand.ilike.%${normalizedQuery}%,` +
          `sku.ilike.%${normalizedQuery}%,` +
          `slug.ilike.%${normalizedQuery}%`
        )
        .limit(8) as { data: ProductResult[] | null };

      products = ilikeProducts;
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
      slug?: string;
      name: string;
      image?: string;
      price?: number;
      currency?: string;
    }> = [];

    matchingCategories.forEach(cat => {
      suggestions.push({ type: 'category', name: cat });
    });

    matchingBrands.forEach(brand => {
      suggestions.push({ type: 'brand', name: brand });
    });

    products?.forEach(product => {
      suggestions.push({
        type: 'product',
        id: product.id,
        sku: product.sku,
        slug: product.slug,
        name: product.name,
        image: product.images?.[0] || undefined,
        price: product.price_numeric,
        currency: product.currency,
      });
    });

    const result = {
      suggestions: suggestions.slice(0, 10),
      query,
    };

    // Cache for 60 seconds
    await cacheSet(cacheKey, result, 60);

    // Log search analytics (fire-and-forget)
    const productCount = products?.length || 0;
    (supabaseAdmin as any)
      .from('search_analytics')
      .insert({
        query: query.toLowerCase(),
        results_count: productCount,
        source: 'suggestions',
      })
      .then(() => {})
      .catch(() => {});

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