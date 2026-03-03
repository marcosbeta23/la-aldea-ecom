import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

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
      (p.category || []).forEach((c: string) => { if (c) cats.add(c); });
      if (p.brand) brands.add(p.brand);
    });

    return NextResponse.json({
      categories: [...cats].sort(),
      brands: [...brands].sort(),
    });
  } catch (error: any) {
    console.error('Error fetching filter options:', error);
    return NextResponse.json({ error: 'Error al cargar filtros' }, { status: 500 });
  }
}
