import type { Metadata } from 'next';
import { Suspense } from 'react';
import { supabaseAdmin } from '@/lib/supabase';
import { Product } from '@/types/database';
import ProductGrid from '@/components/products/ProductGrid';
import ProductFilters from '@/components/products/ProductFilters';
import ProductSearch from '@/components/products/ProductSearch';
import Header from '@/components/Header';
import { Package } from 'lucide-react';

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
    query = query.eq('category', searchParams.categoria);
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
  // Get unique categories with counts
  const { data: categoriesData } = await supabaseAdmin
    .from('products')
    .select('category')
    .eq('is_active', true);

  const categoryCounts = ((categoriesData || []) as Pick<Product, 'category'>[]).reduce((acc: Record<string, number>, item) => {
    if (item.category) {
      acc[item.category] = (acc[item.category] || 0) + 1;
    }
    return acc;
  }, {});

  const categories = Object.entries(categoryCounts).map(([value, count]) => ({
    value,
    label: value,
    count,
  }));

  // Get unique brands with counts
  const { data: brandsData } = await supabaseAdmin
    .from('products')
    .select('brand')
    .eq('is_active', true)
    .not('brand', 'is', null);

  const brandCounts = ((brandsData || []) as Pick<Product, 'brand'>[]).reduce((acc: Record<string, number>, item) => {
    if (item.brand) {
      acc[item.brand] = (acc[item.brand] || 0) + 1;
    }
    return acc;
  }, {});

  const brands = Object.entries(brandCounts).map(([value, count]) => ({
    value,
    label: value,
    count,
  }));

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
        {/* Hero Banner */}
        <section className="bg-gradient-to-br from-blue-600 to-blue-700 text-white py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/10 rounded-2xl">
                <Package className="h-8 w-8" />
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold">Nuestros Productos</h1>
            </div>
            <p className="text-blue-100 text-lg max-w-2xl">
              Encontrá bombas de agua, sistemas de riego, insumos agrícolas, herramientas y todo lo que necesitás para tu campo, hogar o piscina.
            </p>
            
            {/* Search Bar */}
            <div className="mt-6">
              <ProductSearch initialQuery={params.q || ''} />
            </div>
            
            <div className="mt-4 flex items-center gap-4 text-sm">
              <span className="bg-white/10 px-3 py-1 rounded-full">
                {total} productos
              </span>
              {params.categoria && (
                <span className="bg-white/20 px-3 py-1 rounded-full">
                  {params.categoria}
                </span>
              )}
              {params.marca && (
                <span className="bg-white/20 px-3 py-1 rounded-full">
                  {params.marca}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="container mx-auto px-4 py-8 lg:py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <aside className="lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 sticky top-24">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Filtros</h2>
                <Suspense fallback={<div className="animate-pulse h-64 bg-slate-100 rounded-lg" />}>
                  <ProductFilters categories={categories} brands={brands} />
                </Suspense>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              <ProductGrid products={products} />

              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="mt-12 flex justify-center">
                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <a
                        key={pageNum}
                        href={`/productos?${new URLSearchParams({
                          ...params,
                          page: pageNum.toString(),
                        }).toString()}`}
                        className={`
                          w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors
                          ${pageNum === page
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                          }
                        `}
                      >
                        {pageNum}
                      </a>
                    ))}
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
