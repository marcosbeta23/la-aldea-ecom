import type { Metadata } from 'next';
import { Suspense } from 'react';
import { supabaseAdmin } from '@/lib/supabase';
import { normalizeCategory } from '@/lib/validators';
import { Product } from '@/types/database';
import ProductGrid from '@/components/products/ProductGrid';
import ProductFilters from '@/components/products/ProductFilters';
import ProductSearch from '@/components/products/ProductSearch';
import Header from '@/components/Header';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Productos',
  description: 'Catálogo completo de bombas de agua, sistemas de riego, insumos agrícolas, herramientas y más. Envíos a todo Uruguay.',
  openGraph: {
    title: 'Productos | La Aldea',
    description: 'Catálogo completo de bombas de agua, sistemas de riego, insumos agrícolas, herramientas y más.',
    type: 'website',
  },
  alternates: {
    canonical: 'https://laaldeatala.com.uy/productos',
  },
};

// Revalidate every 5 minutes
export const revalidate = 300;

interface ProductsPageProps {
  searchParams: Promise<{
    categoria?: string;
    marca?: string;
    stock?: string;
    orden?: string;
    page?: string;
    q?: string;
  }>;
}

async function getProducts(searchParams: {
  categoria?: string;
  marca?: string;
  stock?: string;
  orden?: string;
  page?: string;
  q?: string;
}) {
  let query = (supabaseAdmin
    .from('products')
    .select('*', { count: 'exact' })
    .eq('is_active', true)) as any;

  // Category filter
  if (searchParams.categoria) {
    query = query.contains('category', [searchParams.categoria]);
  }

  // Brand filter
  if (searchParams.marca) {
    query = query.eq('brand', searchParams.marca);
  }

  // Stock filter
  if (searchParams.stock === 'disponible') {
    query = query.gt('stock', 0);
  }

  // Search query
  if (searchParams.q) {
    query = query.or(`name.ilike.%${searchParams.q}%,description.ilike.%${searchParams.q}%`);
  }

  // Sorting
  const orden = searchParams.orden || 'name';
  switch (orden) {
    case 'name':
      query = query.order('name', { ascending: true });
      break;
    case 'name-desc':
      query = query.order('name', { ascending: false });
      break;
    case 'price':
      query = query.order('price_numeric', { ascending: true });
      break;
    case 'price-desc':
      query = query.order('price_numeric', { ascending: false });
      break;
    case 'newest':
      query = query.order('created_at', { ascending: false });
      break;
    default:
      query = query.order('name', { ascending: true });
  }

  // Pagination
  const page = parseInt(searchParams.page || '1', 10);
  const perPage = 20;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching products:', error);
    return { products: [], total: 0, page, perPage };
  }

  return {
    products: data || [],
    total: count || 0,
    page,
    perPage,
  };
}

async function getFilterOptions() {
  // Get unique categories with counts (case-insensitive dedup)
  const { data: categoriesData } = await supabaseAdmin
    .from('products')
    .select('category')
    .eq('is_active', true);

  const categoryCounts = ((categoriesData || []) as Pick<Product, 'category'>[]).reduce((acc: Record<string, number>, item) => {
    const cats = Array.isArray(item.category) ? item.category : (item.category ? [item.category] : []);
    cats.forEach((cat: string) => {
      if (!cat) return;
      // Normalize to canonical form so "RIEGO" and "Riego" merge
      const normalized = normalizeCategory(cat);
      acc[normalized] = (acc[normalized] || 0) + 1;
    });
    return acc;
  }, {});

  const categories = Object.entries(categoryCounts)
    .map(([value, count]) => ({ value, label: value, count }))
    .sort((a, b) => a.label.localeCompare(b.label));

  // Get unique brands with counts (case-insensitive dedup)
  const { data: brandsData } = await supabaseAdmin
    .from('products')
    .select('brand')
    .eq('is_active', true)
    .not('brand', 'is', null);

  const brandCounts = ((brandsData || []) as Pick<Product, 'brand'>[]).reduce((acc: Record<string, number>, item) => {
    if (!item.brand) return acc;
    const trimmed = item.brand.trim();
    if (!trimmed) return acc;
    // Normalize: find existing key case-insensitively, or use trimmed
    const existing = Object.keys(acc).find(k => k.toLowerCase() === trimmed.toLowerCase());
    const key = existing || trimmed;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const brands = Object.entries(brandCounts)
    .map(([value, count]) => ({ value, label: value, count }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return { categories, brands };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const [{ products, total, page, perPage }, { categories, brands }] = await Promise.all([
    getProducts(params),
    getFilterOptions(),
  ]);

  const totalPages = Math.ceil(total / perPage);

  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-slate-50 pt-20 lg:pt-24">
        {/* Hero Banner — compact */}
        <section className="bg-gradient-to-br from-blue-600 to-blue-700 text-white py-8 lg:py-10">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold">Nuestros Productos</h1>
                <p className="text-blue-100 text-sm mt-1 max-w-xl">
                  Bombas de agua, riego, insumos agrícolas, herramientas y más. Envíos a todo Uruguay.
                </p>
              </div>
              <div className="flex items-center gap-3 text-sm flex-wrap">
                <span className="bg-white/15 backdrop-blur px-3 py-1 rounded-full">
                  {total.toLocaleString()} productos
                </span>
                {params.categoria && (
                  <span className="bg-white/25 px-3 py-1 rounded-full font-medium">
                    {params.categoria}
                  </span>
                )}
                {params.marca && (
                  <span className="bg-white/25 px-3 py-1 rounded-full font-medium">
                    {params.marca}
                  </span>
                )}
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="mt-5">
              <ProductSearch initialQuery={params.q || ''} />
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="container mx-auto px-4 py-6 lg:py-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar Filters — sticky with own scroll */}
            <aside className="lg:w-60 flex-shrink-0">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 sticky top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:overflow-x-hidden">
                <div className="p-5">
                  <Suspense fallback={<div className="animate-pulse h-64 bg-slate-100 rounded-lg" />}>
                    <ProductFilters categories={categories} brands={brands} />
                  </Suspense>
                </div>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1 min-w-0">
              <ProductGrid products={products} />

              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="mt-10 flex justify-center">
                  <div className="inline-flex items-center gap-1 bg-white rounded-xl border border-slate-200 p-1.5 shadow-sm">
                    {/* Prev */}
                    {page > 1 ? (
                      <a
                        href={`/productos?${new URLSearchParams({ ...params, page: String(page - 1) }).toString()}`}
                        className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                        aria-label="Página anterior"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </a>
                    ) : (
                      <span className="p-2 rounded-lg text-slate-300 cursor-not-allowed">
                        <ChevronLeft className="h-4 w-4" />
                      </span>
                    )}

                    {/* Page 1 */}
                    <a
                      href={`/productos?${new URLSearchParams({ ...params, page: '1' }).toString()}`}
                      className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                        page === 1 ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      1
                    </a>

                    {page > 3 && <span className="text-slate-300 text-xs px-1">&hellip;</span>}

                    {/* Pages around current */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const p = Math.max(2, page - 2) + i;
                      if (p >= totalPages || p <= 1) return null;
                      return (
                        <a
                          key={p}
                          href={`/productos?${new URLSearchParams({ ...params, page: String(p) }).toString()}`}
                          className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                            p === page ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {p}
                        </a>
                      );
                    })}

                    {page < totalPages - 2 && <span className="text-slate-300 text-xs px-1">&hellip;</span>}

                    {/* Last page */}
                    {totalPages > 1 && (
                      <a
                        href={`/productos?${new URLSearchParams({ ...params, page: String(totalPages) }).toString()}`}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                          page === totalPages ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {totalPages}
                      </a>
                    )}

                    {/* Next */}
                    {page < totalPages ? (
                      <a
                        href={`/productos?${new URLSearchParams({ ...params, page: String(page + 1) }).toString()}`}
                        className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                        aria-label="Página siguiente"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </a>
                    ) : (
                      <span className="p-2 rounded-lg text-slate-300 cursor-not-allowed">
                        <ChevronRight className="h-4 w-4" />
                      </span>
                    )}
                  </div>
                </nav>
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
