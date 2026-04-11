import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { normalizeCategory, normalizeBrand } from '@/lib/validators';
import { inngest } from '@/lib/inngest';
import type { Database } from '@/types/database';

type ProductRow = Database['public']['Tables']['products']['Row'];
type ProductInsert = Database['public']['Tables']['products']['Insert'];

type ProductInsertResponse = {
  data: ProductRow | null;
  error: { code?: string; message: string } | null;
};

const productsInsertBridge = supabaseAdmin as unknown as {
  from: (table: 'products') => {
    insert: (values: ProductInsert) => {
      select: (columns: string) => {
        single: () => Promise<ProductInsertResponse>;
      };
    };
  };
};

const PRODUCT_SELECT_COLUMNS =
  'id, sku, slug, name, description, category, brand, price_numeric, currency, stock, sold_count, images, is_active, created_at, updated_at, availability_type, show_price_on_request, shipping_type, weight_kg, requires_quote, is_featured, featured_order, original_price, original_price_numeric, discount_percentage, discount_ends_at';

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'object' && error && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  return fallback;
}

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
    let query = supabaseAdmin
      .from('products')
      .select(PRODUCT_SELECT_COLUMNS, { count: 'exact' })
      .order(sort, { ascending: order === 'asc' })
      .range(offset, offset + perPage - 1);

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
    let filtered = (products || []) as ProductRow[];
    if (hasImages === 'yes') {
      filtered = filtered.filter((product) => product.images && product.images.length > 0);
    } else if (hasImages === 'no') {
      filtered = filtered.filter((product) => !product.images || product.images.length === 0);
    }

    return NextResponse.json({ 
      products: filtered, 
      total: count || 0,
      page,
      perPage,
      totalPages: Math.ceil((count || 0) / perPage),
    });
  } catch (error: unknown) {
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
      show_price_on_request = false,
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
    const { data: existing, error: existingError } = await supabaseAdmin
      .from('products')
      .select('id')
      .eq('sku', sku)
      .maybeSingle();

    if (existingError) throw existingError;

    if (existing) {
      return NextResponse.json({ 
        error: 'Ya existe un producto con este SKU' 
      }, { status: 400 });
    }

    const normalizedAvailabilityType: ProductRow['availability_type'] =
      availability_type === 'on_request' ? 'on_request' : 'regular';
    const normalizedShippingType: ProductRow['shipping_type'] =
      shipping_type === 'freight' || shipping_type === 'pickup_only' ? shipping_type : 'dac';

    const insertPayload: ProductInsert = {
      sku,
      name,
      description: description || null,
      category: Array.isArray(category)
        ? category.map((c: string) => c.trim()).filter(Boolean).map((c: string) => normalizeCategory(c))
        : (category ? [normalizeCategory(category.trim())] : []),
      brand: brand ? normalizeBrand(brand) : null,
      price_numeric,
      currency,
      stock,
      sold_count: 0,
      images,
      is_active,
      availability_type: normalizedAvailabilityType,
      show_price_on_request,
      shipping_type: normalizedShippingType,
      weight_kg,
      requires_quote,
      is_featured,
      featured_order: null,
      original_price: original_price_numeric ? `$${original_price_numeric.toLocaleString()}` : null,
      original_price_numeric,
      discount_percentage,
      discount_ends_at: null,
      slug: slug || null,
    };

    const { data: product, error } = await productsInsertBridge
      .from('products')
      .insert(insertPayload)
      .select(PRODUCT_SELECT_COLUMNS)
      .single();

    if (error) throw error;
    if (!product) {
      return NextResponse.json({ error: 'No se pudo crear el producto' }, { status: 500 });
    }

    // Bust ISR cache
    revalidatePath('/productos');
    revalidatePath('/');

    // Fire embedding generation (fire-and-forget)
    inngest.send({
      name: 'product/embedding.needed',
      data: { productId: product.id },
    }).catch(() => {});

    return NextResponse.json({ success: true, product });
  } catch (error: unknown) {
    console.error('Error creating product:', error);
    return NextResponse.json({ 
      error: getErrorMessage(error, 'Error al crear producto') 
    }, { status: 500 });
  }
}
