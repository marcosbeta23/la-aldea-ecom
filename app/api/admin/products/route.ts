import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { normalizeCategory, normalizeBrand } from '@/lib/validators';
import { inngest } from '@/lib/inngest';

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
  const category = searchParams.get('category') || '';
  const brand = searchParams.get('brand') || '';
  const status = searchParams.get('status') || ''; // 'active', 'inactive', ''
  const hasImages = searchParams.get('hasImages') || ''; // 'yes', 'no', ''
  const sort = searchParams.get('sort') || 'created_at';
  const order = searchParams.get('order') || 'desc';
  const perPage = Math.min(parseInt(searchParams.get('perPage') || '20'), 100);
  const offset = (page - 1) * perPage;

  try {
    let query = (supabaseAdmin
      .from('products')
      .select('*', { count: 'exact' })
      .order(sort, { ascending: order === 'asc' })
      .range(offset, offset + perPage - 1)) as any;

    if (search) {
      query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%,brand.ilike.%${search}%`);
    }
    if (category) {
      query = query.contains('category', [category]);
    }
    if (brand) {
      query = query.eq('brand', brand);
    }
    if (status === 'active') {
      query = query.eq('is_active', true);
    } else if (status === 'inactive') {
      query = query.eq('is_active', false);
    }

    const { data: products, count, error } = await query;

    if (error) throw error;

    // Filter by images client-side (Supabase doesn't support array length filters well)
    let filtered = products || [];
    if (hasImages === 'yes') {
      filtered = filtered.filter((p: any) => p.images && p.images.length > 0);
    } else if (hasImages === 'no') {
      filtered = filtered.filter((p: any) => !p.images || p.images.length === 0);
    }

    return NextResponse.json({ 
      products: filtered, 
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
      // Availability
      availability_type = 'regular',
      // Shipping fields
      shipping_type = 'dac',
      weight_kg = null,
      requires_quote = false,
      // Featured & Discount fields
      is_featured = false,
      original_price_numeric = null,
      discount_percentage = null,
      // Slug
      slug = null,
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
        category: Array.isArray(category) ? category.map((c: string) => c.trim()).filter(Boolean).map((c: string) => normalizeCategory(c)) : (category ? [normalizeCategory(category.trim())] : []),
        brand: brand ? normalizeBrand(brand) : null,
        price_numeric,
        currency,
        stock,
        sold_count: 0,
        images,
        is_active,
        // Availability
        availability_type,
        // Shipping fields
        shipping_type,
        weight_kg,
        requires_quote,
        // Featured & Discount fields
        is_featured,
        original_price: original_price_numeric ? `$${original_price_numeric.toLocaleString()}` : null,
        original_price_numeric,
        discount_percentage,
        slug: slug || null,
      })
      .select()
      .single();

    if (error) throw error;

    // Bust ISR cache
    revalidatePath('/productos');
    revalidatePath('/');

    // Fire embedding generation (fire-and-forget)
    inngest.send({
      name: 'product/embedding.needed',
      data: { productId: product.id },
    }).catch(() => {});

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json({ 
      error: error.message || 'Error al crear producto' 
    }, { status: 500 });
  }
}
