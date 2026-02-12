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
      .select('id, sku, name, category, brand, price_numeric, images')
      .eq('is_active', true)
      .or(`name.ilike.%${query}%,brand.ilike.%${query}%,category.ilike.%${query}%,sku.ilike.%${query}%`)
      .limit(8);

    // Get unique categories that match
    const { data: categories } = await supabaseAdmin
      .from('products')
      .select('category')
      .eq('is_active', true)
      .ilike('category', `%${query}%`)
      .limit(3);

    // Get unique brands that match
    const { data: brands } = await supabaseAdmin
      .from('products')
      .select('brand')
      .eq('is_active', true)
      .ilike('brand', `%${query}%`)
      .limit(3);

    // Build suggestions array
    const suggestions: Array<{
      type: 'product' | 'category' | 'brand';
      id?: string;
      sku?: string;
      name: string;
      image?: string;
      price?: number;
    }> = [];

    // Add category suggestions first
    const uniqueCategories = [...new Set(categories?.map(c => c.category).filter(Boolean))];
    uniqueCategories.forEach(cat => {
      suggestions.push({
        type: 'category',
        name: cat as string,
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
        image: product.images?.[0] || null,
        price: product.price_numeric,
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
