import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { Database } from '@/types/database';

type ProductRow = Database['public']['Tables']['products']['Row'];
type ProductUpdate = Database['public']['Tables']['products']['Update'];

type ProductWriteResponse = {
  error: { code?: string; message: string } | null;
};

const featuredProductsWriteBridge = supabaseAdmin as unknown as {
  from: (table: 'products') => {
    update: (values: ProductUpdate) => {
      eq: (column: 'id', value: string) => Promise<ProductWriteResponse>;
      in: (column: 'id', values: string[]) => Promise<ProductWriteResponse>;
    };
  };
};

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
  } catch (error: unknown) {
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
    const body = await request.json();
    const productIds = body?.productIds;

    if (!Array.isArray(productIds) || !productIds.every((id) => typeof id === 'string')) {
      return NextResponse.json({ error: 'productIds debe ser un array' }, { status: 400 });
    }

    const normalizedProductIds = productIds as string[];

    // Update each product's featured_order
    const updates = normalizedProductIds.map((id, index) =>
      featuredProductsWriteBridge
        .from('products')
        .update({ featured_order: index, is_featured: true } satisfies ProductUpdate)
        .eq('id', id)
    );

    // Also un-feature products that were removed from the list
    // First get all currently featured products
    const { data: currentFeatured, error: currentFeaturedError } = await supabaseAdmin
      .from('products')
      .select('id')
      .eq('is_featured', true);

    if (currentFeaturedError) throw currentFeaturedError;

    const newFeaturedSet = new Set(normalizedProductIds);
    const toUnfeature = (currentFeatured || [])
      .filter((product: Pick<ProductRow, 'id'>) => !newFeaturedSet.has(product.id))
      .map((product: Pick<ProductRow, 'id'>) => product.id);

    if (toUnfeature.length > 0) {
      updates.push(
        featuredProductsWriteBridge
          .from('products')
          .update({ is_featured: false, featured_order: null } satisfies ProductUpdate)
          .in('id', toUnfeature)
      );
    }

    const updateResults = await Promise.all(updates);
    const updateError = updateResults.find((result) => result.error)?.error;
    if (updateError) throw updateError;

    // Bust cache
    revalidatePath('/');
    revalidatePath('/productos');

    return NextResponse.json({ success: true, count: normalizedProductIds.length });
  } catch (error: unknown) {
    console.error('Error updating featured products:', error);
    return NextResponse.json({ error: 'Error al actualizar productos destacados' }, { status: 500 });
  }
}
