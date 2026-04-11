import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { normalizeCategory, normalizeBrand } from '@/lib/validators';
import { alertOutOfStock, alertLowStock } from '@/lib/telegram';
import { inngest } from '@/lib/inngest';
import type { Database } from '@/types/database';

type ProductRow = Database['public']['Tables']['products']['Row'];
type ProductUpdate = Database['public']['Tables']['products']['Update'];

type ProductUpdateSelectResponse = {
  data: ProductRow | null;
  error: { code?: string; message: string } | null;
};

type ProductWriteResponse = {
  error: { code?: string; message: string } | null;
};

const productsUpdateSelectBridge = supabaseAdmin as unknown as {
  from: (table: 'products') => {
    update: (values: ProductUpdate) => {
      eq: (column: 'id', value: string) => {
        select: (columns: string) => {
          single: () => Promise<ProductUpdateSelectResponse>;
        };
      };
    };
  };
};

const productsUpdateBridge = supabaseAdmin as unknown as {
  from: (table: 'products') => {
    update: (values: ProductUpdate) => {
      eq: (column: 'id', value: string) => Promise<ProductWriteResponse>;
    };
  };
};

const productsSlugSelectBridge = supabaseAdmin as unknown as {
  from: (table: 'products') => {
    select: (columns: 'sku, slug') => {
      eq: (column: 'id', value: string) => {
        maybeSingle: () => Promise<{ data: { sku: string; slug: string | null } | null; error: { code?: string; message: string } | null }>;
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

// GET - Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdminAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const { data: product, error } = await supabaseAdmin
      .from('products')
      .select(PRODUCT_SELECT_COLUMNS)
      .eq('id', id)
      .single<ProductRow>();

    if (error || !product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error: unknown) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Error al cargar producto' }, { status: 500 });
  }
}

// PUT - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdminAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

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

    // Check SKU uniqueness (excluding current product)
    const { data: existing, error: existingError } = await supabaseAdmin
      .from('products')
      .select('id')
      .eq('sku', sku)
      .neq('id', id)
      .maybeSingle();

    if (existingError) throw existingError;

    if (existing) {
      return NextResponse.json({ 
        error: 'Ya existe otro producto con este SKU' 
      }, { status: 400 });
    }

    const normalizedAvailabilityType: ProductRow['availability_type'] =
      availability_type === 'on_request' ? 'on_request' : 'regular';
    const normalizedShippingType: ProductRow['shipping_type'] =
      shipping_type === 'freight' || shipping_type === 'pickup_only' ? shipping_type : 'dac';

    const updatePayload: ProductUpdate = {
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
      images,
      is_active,
      availability_type: normalizedAvailabilityType,
      show_price_on_request,
      shipping_type: normalizedShippingType,
      weight_kg,
      requires_quote,
      is_featured,
      original_price: original_price_numeric ? `$${original_price_numeric.toLocaleString()}` : null,
      original_price_numeric,
      discount_percentage,
      slug: slug || null,
    };

    const { data: product, error } = await productsUpdateSelectBridge
      .from('products')
      .update(updatePayload)
      .eq('id', id)
      .select(PRODUCT_SELECT_COLUMNS)
      .single();

    if (error) throw error;

    if (!product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    // Alert if product stock dropped to 0
    if (product.stock === 0 && product.is_active) {
      alertOutOfStock(product.name, product.sku).catch(() => {});
    } else if (product.stock > 0 && product.stock < 5 && product.is_active) {
      alertLowStock(product.name, product.sku, product.stock).catch(() => {});
    }

    // Bust ISR cache for this product's detail page, listings, and homepage
    revalidatePath(`/productos/${product.slug}`);
    revalidatePath('/productos');
    revalidatePath('/');

    // Fire embedding generation (fire-and-forget)
    inngest.send({
      name: 'product/embedding.needed',
      data: { productId: id },
    }).catch(() => {});

    return NextResponse.json({ success: true, product });
  } catch (error: unknown) {
    console.error('Error updating product:', error);
    return NextResponse.json({ 
      error: getErrorMessage(error, 'Error al actualizar producto') 
    }, { status: 500 });
  }
}

// DELETE - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdminAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Check if product exists
    const { data: product } = await supabaseAdmin
      .from('products')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (!product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    // Check if product has order items
    const { data: orderItems } = await supabaseAdmin
      .from('order_items')
      .select('id')
      .eq('product_id', id)
      .limit(1);

    if (orderItems && orderItems.length > 0) {
      // Instead of deleting, just deactivate
      await productsUpdateBridge
        .from('products')
        .update({ is_active: false })
        .eq('id', id);

      return NextResponse.json({ 
        success: true, 
        message: 'Producto desactivado (tiene pedidos asociados)' 
      });
    }

    // Get slug/SKU before deletion for cache busting
    const { data: productData } = await productsSlugSelectBridge
      .from('products')
      .select('sku, slug')
      .eq('id', id)
      .maybeSingle();

    // Delete product
    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Bust ISR cache
    if (productData) {
      revalidatePath(`/productos/${productData.slug ?? productData.sku}`);
    }
    revalidatePath('/productos');

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ 
      error: getErrorMessage(error, 'Error al eliminar producto') 
    }, { status: 500 });
  }
}
