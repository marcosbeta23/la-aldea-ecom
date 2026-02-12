import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';

// Check admin auth
async function checkAdminAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  return token === process.env.ADMIN_SESSION_SECRET;
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
      .select('*')
      .eq('id', id)
      .single();

    if (error || !product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error: any) {
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

    // Check SKU uniqueness (excluding current product)
    const { data: existing } = await supabaseAdmin
      .from('products')
      .select('id')
      .eq('sku', sku)
      .neq('id', id)
      .single();

    if (existing) {
      return NextResponse.json({ 
        error: 'Ya existe otro producto con este SKU' 
      }, { status: 400 });
    }

    const { data: product, error } = await (supabaseAdmin as any)
      .from('products')
      .update({
        sku,
        name,
        description: description || null,
        category: category || null,
        brand: brand || null,
        price_numeric,
        currency,
        stock,
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
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json({ 
      error: error.message || 'Error al actualizar producto' 
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
      .single();

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
      await (supabaseAdmin as any)
        .from('products')
        .update({ is_active: false })
        .eq('id', id);

      return NextResponse.json({ 
        success: true, 
        message: 'Producto desactivado (tiene pedidos asociados)' 
      });
    }

    // Delete product
    const { error } = await (supabaseAdmin as any)
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ 
      error: error.message || 'Error al eliminar producto' 
    }, { status: 500 });
  }
}
