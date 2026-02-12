import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

// Check admin auth via Clerk
async function checkAdminAuth(): Promise<boolean> {
  const { userId } = await auth();
  return !!userId;
}

// GET - List products
export async function GET(request: NextRequest) {
  if (!(await checkAdminAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const perPage = 20;
  const offset = (page - 1) * perPage;

  try {
    let query = (supabaseAdmin
      .from('products')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + perPage - 1)) as any;

    if (search) {
      query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`);
    }

    const { data: products, count, error } = await query;

    if (error) throw error;

    return NextResponse.json({ 
      products, 
      total: count || 0,
      page,
      perPage,
      totalPages: Math.ceil((count || 0) / perPage),
    });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Error al cargar productos' }, { status: 500 });
  }
}

// POST - Create product
export async function POST(request: NextRequest) {
  if (!(await checkAdminAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    const { 
      sku, 
      name, 
      description, 
      category, 
      brand, 
      price_numeric, 
      currency = 'UYU', 
      stock, 
      images = [], 
      is_active = true,
      // Shipping fields
      shipping_type = 'dac',
      weight_kg = null,
      requires_quote = false,
      // Featured & Discount fields
      is_featured = false,
      original_price_numeric = null,
      discount_percentage = null,
    } = body;

    // Validate required fields
    if (!sku || !name || price_numeric === undefined || stock === undefined) {
      return NextResponse.json({ 
        error: 'SKU, nombre, precio y stock son requeridos' 
      }, { status: 400 });
    }

    // Check SKU uniqueness
    const { data: existing } = await supabaseAdmin
      .from('products')
      .select('id')
      .eq('sku', sku)
      .single() as { data: { id: string } | null };

    if (existing) {
      return NextResponse.json({ 
        error: 'Ya existe un producto con este SKU' 
      }, { status: 400 });
    }

    const { data: product, error } = await (supabaseAdmin as any)
      .from('products')
      .insert({
        sku,
        name,
        description: description || null,
        category: category || null,
        brand: brand || null,
        price_numeric,
        currency,
        stock,
        sold_count: 0,
        images,
        is_active,
        // Shipping fields
        shipping_type,
        weight_kg,
        requires_quote,
        // Featured & Discount fields
        is_featured,
        original_price: original_price_numeric ? `$${original_price_numeric.toLocaleString()}` : null,
        original_price_numeric,
        discount_percentage,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json({ 
      error: error.message || 'Error al crear producto' 
    }, { status: 500 });
  }
}
