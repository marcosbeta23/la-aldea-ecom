import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { normalizeCategory, normalizeBrand } from '@/lib/validators';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Single query to get all categories and brands from ALL products
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('category, brand');

    if (error) throw error;

    const cats = new Set<string>();
    const brands = new Set<string>();

    (data || []).forEach((p: { category: string[]; brand: string | null }) => {
      (p.category || []).forEach((c: string) => { 
        if (c) {
          const normalized = normalizeCategory(c);
          if (normalized) cats.add(normalized);
        }
      });
      if (p.brand) {
        const normalized = normalizeBrand(p.brand);
        if (normalized) brands.add(normalized);
      }
    });

    return NextResponse.json({
      categories: [...cats].sort((a, b) => a.localeCompare(b)),
      brands: [...brands].sort((a, b) => a.localeCompare(b)),
    });
  } catch (error: any) {
    console.error('Error fetching filter options:', error);
    return NextResponse.json({ error: 'Error al cargar filtros' }, { status: 500 });
  }
}
