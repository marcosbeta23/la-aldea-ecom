import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { Database } from '@/types/database';

type ProductRow = Database['public']['Tables']['products']['Row'];

const PRODUCT_SELECT_COLUMNS =
  'id, sku, slug, name, description, category, brand, price_numeric, currency, stock, sold_count, images, is_active, created_at, updated_at, availability_type, show_price_on_request, shipping_type, weight_kg, requires_quote, is_featured, featured_order, original_price, original_price_numeric, discount_percentage, discount_ends_at';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get('ids');

    if (!ids) {
      return NextResponse.json(
        { error: 'Missing ids parameter' },
        { status: 400 }
      );
    }

    const productIds = ids.split(',').filter(Boolean);

    if (productIds.length === 0) {
      return NextResponse.json({ products: [] });
    }

    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select(PRODUCT_SELECT_COLUMNS)
      .in('id', productIds)
      .eq('is_active', true)
      .returns<ProductRow[]>();

    if (error) {
      console.error('Error fetching products:', error);
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      );
    }

    return NextResponse.json({ products: products || [] });
  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
