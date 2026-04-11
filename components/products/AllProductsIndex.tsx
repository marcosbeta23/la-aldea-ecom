// components/products/AllProductsIndex.tsx
// Renders a compact text-link index of ALL products in a category.
// Purpose: SEO internal linking — prevents orphan pages caused by pagination.
// Products on page 2+ of category listings have noindex, so they get zero
// incoming links from indexed pages. This section gives every product at
// least one dofollow link from the canonical, indexed category page (page 1).
import { supabaseAdmin } from '@/lib/supabase';
import Link from 'next/link';

interface AllProductsIndexProps {
  categoria: string;
  currentPage?: number;
}

export default async function AllProductsIndex({
  categoria,
  currentPage = 1,
}: AllProductsIndexProps) {
  // Only render on page 1 — that's the indexed, canonical page
  if (currentPage > 1) return null;

  let products: { slug: string; name: string }[] = [];

  try {
    const { data } = await supabaseAdmin
      .from('products')
      .select('slug, name')
      .eq('is_active', true)
      .contains('category', [categoria])
      .order('name', { ascending: true });
    products = data || [];
  } catch {
    return null;
  }

  // Only show when category has more than one page worth of products
  if (products.length <= 24) return null;

  return (
    <section className="container mx-auto px-4 pb-10">
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 sm:p-6">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
          Índice completo — {categoria} ({products.length} productos)
        </h2>
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-1">
          {products.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/productos/${p.slug}`}
                className="text-xs text-blue-600 hover:text-blue-800 hover:underline leading-relaxed block truncate"
                title={p.name}
              >
                {p.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
