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

    // Try full-text search first, fall back to ILIKE
    type ProductResult = { id: string; slug: string; sku: string; name: string; category: string[]; brand: string | null; price_numeric: number; currency: string; images: string[] | null };
    let products: ProductResult[] | null = null;

    // Attempt tsvector search
    const { data: ftsProducts, error: ftsError } = await supabaseAdmin
      .from('products')
      .select('id, sku, slug, name, category, brand, price_numeric, currency, images')
      .eq('is_active', true)
      .textSearch('search_vector', query, { type: 'websearch', config: 'spanish' })
      .limit(8) as { data: ProductResult[] | null; error: any };

    if (!ftsError && ftsProducts && ftsProducts.length > 0) {
      products = ftsProducts;
    } else {
      // Fallback: try fuzzy matching with similarity
      const { data: fuzzyProducts } = await supabaseAdmin
        .from('products')
        .select('id, sku, slug, name, category, brand, price_numeric, currency, images')
        .eq('is_active', true)
        .or(`name.ilike.%${query}%,brand.ilike.%${query}%,sku.ilike.%${query}%,slug.ilike.%${query}%`)
        .limit(8) as { data: ProductResult[] | null };

      products = fuzzyProducts;
    }

    // Boost products where the name starts with the query
    if (products && products.length > 1) {
      const qLower = query.toLowerCase();
      products.sort((a, b) => {
        const aStarts = a.name.toLowerCase().startsWith(qLower);
        const bStarts = b.name.toLowerCase().startsWith(qLower);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return 0;
      });
    }

    // Get unique categories that match from all products (category is now an array)
    const { data: allCatProducts } = await supabaseAdmin
      .from('products')
      .select('category')
      .eq('is_active', true) as { data: Array<{ category: string[] }> | null };

    const queryLower = query.toLowerCase();
    const matchingCategories = [...new Set(
      (allCatProducts || [])
        .flatMap(p => p.category || [])
        .filter(c => c.toLowerCase().includes(queryLower))
    )].slice(0, 3);

    // Get unique brands that match
    const { data: brands } = await supabaseAdmin
      .from('products')
      .select('brand')
      .eq('is_active', true)
      .ilike('brand', `%${query}%`)
      .limit(3) as { data: Array<{ brand: string | null }> | null };

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

    // Add category suggestions first
    matchingCategories.forEach(cat => {
      suggestions.push({
        type: 'category',
        name: cat,
      });
    });

    // Add brand suggestions
    const uniqueBrands = [...new Set(brands?.map(b => b.brand).filter(Boolean))];
    uniqueBrands.forEach(brand => {
      suggestions.push({
        type: 'brand',
        name: brand as string,
      });
    });

    // Add product suggestions
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
      query
    };

    // Cache for 60 seconds
    await cacheSet(cacheKey, result, 60);

    // Log search analytics (fire-and-forget, non-blocking)
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
