import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

async function checkAdminAuth(): Promise<boolean> {
  const { userId } = await auth();
  return !!userId;
}

// GET — list all featured products in order
export async function GET() {
  if (!(await checkAdminAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('id, sku, name, brand, images, category, price_numeric, currency, stock, is_active, is_featured, featured_order')
      .eq('is_featured', true)
      .order('featured_order', { ascending: true, nullsFirst: false })
      .order('name', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ products: data || [] });
  } catch (error: any) {
    console.error('Error fetching featured products:', error);
    return NextResponse.json({ error: 'Error al cargar productos destacados' }, { status: 500 });
  }
}

// PUT — save the ordered list of featured product IDs
// Body: { productIds: string[] } — ordered list, first = position 0
export async function PUT(request: NextRequest) {
  if (!(await checkAdminAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { productIds } = await request.json();

    if (!Array.isArray(productIds)) {
      return NextResponse.json({ error: 'productIds debe ser un array' }, { status: 400 });
    }

    // Update each product's featured_order
    const updates: Promise<any>[] = productIds.map((id: string, index: number) =>
      (supabaseAdmin as any)
        .from('products')
        .update({ featured_order: index, is_featured: true, updated_at: new Date().toISOString() })
        .eq('id', id)
    );

    // Also un-feature products that were removed from the list
    // First get all currently featured products
    const { data: currentFeatured } = await (supabaseAdmin as any)
      .from('products')
      .select('id')
      .eq('is_featured', true);

    const newFeaturedSet = new Set(productIds);
    const toUnfeature = (currentFeatured || [])
      .filter((p: any) => !newFeaturedSet.has(p.id))
      .map((p: any) => p.id);

    if (toUnfeature.length > 0) {
      updates.push(
        (supabaseAdmin as any)
          .from('products')
          .update({ is_featured: false, featured_order: null, updated_at: new Date().toISOString() })
          .in('id', toUnfeature)
      );
    }

    await Promise.all(updates);

    // Bust cache
    revalidatePath('/');
    revalidatePath('/productos');

    return NextResponse.json({ success: true, count: productIds.length });
  } catch (error: any) {
    console.error('Error updating featured products:', error);
    return NextResponse.json({ error: 'Error al actualizar productos destacados' }, { status: 500 });
  }
}
