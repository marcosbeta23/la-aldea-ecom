import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET - Search suggestions for autocomplete
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    // Fetch matching products
    const { data: products } = await supabaseAdmin
      .from('products')
      .select('id, sku, name, category, brand, price_numeric, currency, images')
      .eq('is_active', true)
      .or(`name.ilike.%${query}%,brand.ilike.%${query}%,sku.ilike.%${query}%`)
      .limit(8) as { data: Array<{ id: string; sku: string; name: string; category: string[]; brand: string | null; price_numeric: number; currency: string; images: string[] | null }> | null };

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
        name: product.name,
        image: product.images?.[0] || undefined,
        price: product.price_numeric,
        currency: product.currency,
      });
    });

    return NextResponse.json({ 
      suggestions: suggestions.slice(0, 10),
      query 
    });

  } catch (error) {
    console.error('Search suggestions error:', error);
    return NextResponse.json({ suggestions: [] });
  }
}
