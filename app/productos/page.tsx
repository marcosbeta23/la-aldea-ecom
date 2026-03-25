import type { Metadata } from 'next';
import { Suspense, cache } from 'react';
import { supabaseAdmin } from '@/lib/supabase';
import { normalizeCategory } from '@/lib/validators';
import { CATEGORY_HIERARCHY, getSubcategories, isMainCategory } from '@/lib/categories';
import { getArticlesForCategory } from '@/lib/faq-articles';
import { Product } from '@/types/database';
import ProductGrid from '@/components/products/ProductGrid';
import SearchAnalytics from '@/components/products/SearchAnalytics';
import ProductFilters from '@/components/products/ProductFilters';
import ProductSearch from '@/components/products/ProductSearch';
import FilterPersistence from '@/components/products/FilterPersistence';
import { SubcategoryChips } from '@/components/products/SubcategoryChips';
import Header from '@/components/Header';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductsPageProps {
  searchParams: Promise<{
    categoria?: string;
    sub?: string;
    marca?: string;
    stock?: string;
    orden?: string;
    page?: string;
    q?: string;
    precio_min?: string;
    precio_max?: string;
  }>;
}

const siteUrl = process.env.NEXT_PUBLIC_URL || 'https://laaldeatala.com.uy';
const PER_PAGE = 24;

export async function generateMetadata({ searchParams }: ProductsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const cat = params.categoria;
  const sub = params.sub;
  const catConfig = cat ? CATEGORY_HIERARCHY.find(c => c.value === cat) : null;

  // Obtener conteo real para totalPages
  const { total, page: currentPage } = await cachedGetProducts(params);
  const totalPages = Math.ceil(total / PER_PAGE);

  // Determinar si hay filtros de refinamiento que deben ser noindex
  const hasRefinementFilters = !!(
    params.marca ||
    params.stock ||
    params.orden ||
    params.precio_min ||
    params.precio_max ||
    params.q ||
    (params.page && params.page !== '1')
  );

  // Canonical SIEMPRE apunta solo a categoria + sub (sin filtros de refinamiento)
  const canonicalParams = new URLSearchParams();
  if (cat) canonicalParams.set('categoria', cat);
  if (sub) canonicalParams.set('sub', sub);
  const canonicalQs = canonicalParams.toString();
  const canonical = `${siteUrl}/productos${canonicalQs ? `?${canonicalQs}` : ''}`;

  const title = cat
    ? sub ? `${sub} — ${cat}` : cat
    : 'Productos';

  const description = cat
    ? catConfig?.description
      ? `${catConfig.description}. Compra ${cat.toLowerCase()}${sub ? ` ${sub.toLowerCase()}` : ''} en La Aldea, Tala. Envíos a todo Uruguay.`
      : `Compra ${cat.toLowerCase()} en La Aldea, Tala. Envíos a todo Uruguay.`
    : 'Catálogo completo de bombas de agua, sistemas de riego, insumos agrícolas, herramientas y más. Envíos a todo Uruguay.';

  return {
    title,
    description,
    openGraph: {
      title: `${title} | La Aldea`,
      description,
      type: 'website',
      url: canonical,
    },
    alternates: {
      canonical,
      // Solo cuando hay página anterior o siguiente
      ...(currentPage > 1 && {
        prev: `${siteUrl}/productos?${new URLSearchParams({
          ...(cat && { categoria: cat }),
          ...(sub && { sub }),
          ...(currentPage - 1 > 1 && { page: String(currentPage - 1) }),
        }).toString()}`,
      }),
      ...(currentPage < totalPages && {
        next: `${siteUrl}/productos?${new URLSearchParams({
          ...(cat && { categoria: cat }),
          ...(sub && { sub }),
          page: String(currentPage + 1),
        }).toString()}`,
      }),
    },
    // Si hay filtros de refinamiento, noindex pero follow para pasar equity
    robots: hasRefinementFilters
      ? { index: false, follow: true }
      : { index: true, follow: true },
  };
}

// Revalidate every 5 minutes
export const revalidate = 300;


async function resolveQuery(query: string): Promise<string> {
  const normalized = stripAccents(query.toLowerCase().trim());
  const { data } = await (supabaseAdmin as any)
    .from('search_synonyms')
    .select('maps_to')
    .eq('is_active', true)
    .ilike('term', normalized)
    .limit(1)
    .maybeSingle() as { data: { maps_to: string } | null };
  return data?.maps_to ?? query;
}

const cachedGetProducts = cache(async function getProducts(searchParams: {
  categoria?: string;
  sub?: string;
  marca?: string;
  stock?: string;
  orden?: string;
  page?: string;
  q?: string;
  precio_min?: string;
  precio_max?: string;
}) {
  let query = (supabaseAdmin
    .from('products')
    .select('*', { count: 'exact' })
    .eq('is_active', true)) as any;

  // Category filter
  if (searchParams.categoria) {
    query = query.contains('category', [searchParams.categoria]);
  }

  // Subcategory filter
  if (searchParams.sub) {
    query = query.contains('category', [searchParams.sub]);
  }

  // Brand filter
  if (searchParams.marca) {
    query = query.eq('brand', searchParams.marca);
  }

  // Stock filter
  if (searchParams.stock === 'disponible') {
    query = query.gt('stock', 0);
  }

  // Search query — accent-insensitive + fuzzy typo tolerance
  if (searchParams.q) {
    const rawQuery = searchParams.q;
    const resolvedQuery = await resolveQuery(rawQuery);
    const normalizedQuery = stripAccents(resolvedQuery.trim());

    // Step 1: Full-text search on the unaccented search_vector
    const { data: ftsIds, error: ftsError } = await supabaseAdmin
      .from('products')
      .select('id')
      .eq('is_active', true)
      .textSearch('search_vector', normalizedQuery, { type: 'websearch', config: 'simple' })
      .limit(1);

    if (!ftsError && ftsIds && ftsIds.length > 0) {
      query = query.textSearch('search_vector', normalizedQuery, { type: 'websearch', config: 'simple' });
    } else {
      // Step 2: Fuzzy trigram via RPC (handles typos like "pisinas" → "piscinas")
      const { data: fuzzyIds, error: fuzzyError } = await (supabaseAdmin as any)
        .rpc('search_products_fuzzy', {
          search_query: normalizedQuery,
          similarity_threshold: 0.2,
          result_limit: 100,
        }) as { data: Array<{ id: string }> | null; error: any };

      if (!fuzzyError && fuzzyIds && fuzzyIds.length > 0) {
        const ids = fuzzyIds.map((r: { id: string }) => r.id);
        query = query.in('id', ids);
      } else {
        // Step 3: Last resort — unaccented ILIKE substring match
        query = query.or(
          `name.ilike.%${normalizedQuery}%,` +
          `description.ilike.%${normalizedQuery}%,` +
          `sku.ilike.%${normalizedQuery}%`
        );
      }
    }
  }

  // Price range filter
  if (searchParams.precio_min) {
    const min = parseFloat(searchParams.precio_min);
    if (!isNaN(min) && min >= 0) {
      query = query.gte('price_numeric', min);
    }
  }
  if (searchParams.precio_max) {
    const max = parseFloat(searchParams.precio_max);
    if (!isNaN(max) && max > 0) {
      query = query.lte('price_numeric', max);
    }
  }

  // Sorting — default is now "popular" (featured first, then sold_count desc)
  const orden = searchParams.orden || 'popular';
  switch (orden) {
    case 'popular':
      query = query
        .order('is_featured', { ascending: false })
        .order('sold_count', { ascending: false });
      break;
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
      query = query
        .order('is_featured', { ascending: false })
        .order('sold_count', { ascending: false });
  }

  // Pagination
  const page = parseInt(searchParams.page || '1', 10);
  const from = (page - 1) * PER_PAGE;
  const to = from + PER_PAGE - 1;

  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching products:', error);
    return { products: [], total: 0, page, perPage: PER_PAGE };
  }

  return {
    products: data || [],
    total: count || 0,
    page,
    perPage: PER_PAGE,
  };
});

/**
 * Strip diacritics/accents from a string.
 * "piscína" → "piscina", "Bomba centrífuga" → "Bomba centrifuga"
 * Mirrors what immutable_unaccent() does on the Postgres side.
 */
function stripAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

async function getFilterOptions(currentCategory?: string) {
  // Get unique categories with counts (case-insensitive dedup)
  const { data: categoriesData } = await supabaseAdmin
    .from('products')
    .select('category')
    .eq('is_active', true);

  const categoryCounts: Record<string, number> = {};
  const subcategoryCounts: Record<string, number> = {};

  ((categoriesData || []) as Pick<Product, 'category'>[]).forEach(item => {
    const cats = item.category || [];
    cats.forEach((cat: string) => {
      if (!cat) return;
      const normalized = normalizeCategory(cat);
      if (isMainCategory(normalized)) {
        categoryCounts[normalized] = (categoryCounts[normalized] || 0) + 1;
      } else {
        subcategoryCounts[normalized] = (subcategoryCounts[normalized] || 0) + 1;
      }
    });
  });

  const categories = Object.entries(categoryCounts)
    .map(([value, count]) => ({ value, label: value, count }))
    .sort((a, b) => b.count - a.count); // Sort by product count, most products first

  // If a category is selected, compute subcategory counts for it
  let subcategories: { value: string; label: string; count: number }[] = [];
  if (currentCategory) {
    const definedSubs = getSubcategories(currentCategory);

    // Count how many products in this category have each subcategory tag
    const catProducts = (categoriesData || []) as Pick<Product, 'category'>[];
    const subCounts: Record<string, number> = {};

    catProducts.forEach(item => {
      const cats = item.category || [];
      // Only count if product is in the selected main category
      if (!cats.some((c: string) => normalizeCategory(c) === currentCategory)) return;
      cats.forEach((c: string) => {
        const normalized = normalizeCategory(c);
        if (normalized !== currentCategory && !isMainCategory(normalized)) {
          subCounts[normalized] = (subCounts[normalized] || 0) + 1;
        }
      });
    });

    // Include defined subcategories (even if count is 0 for discovery)
    // plus any actual tags found in the data
    const seenValues = new Set<string>();
    definedSubs.forEach(sub => {
      const count = subCounts[sub.value] || 0;
      if (count > 0) {
        subcategories.push({ value: sub.value, label: sub.label, count });
        seenValues.add(sub.value);
      }
    });

    // Add any data-driven subcategories not in the hierarchy
    Object.entries(subCounts).forEach(([value, count]) => {
      if (!seenValues.has(value)) {
        subcategories.push({ value, label: value, count });
      }
    });

    subcategories.sort((a, b) => b.count - a.count);
  }

  // Get unique brands with counts (case-insensitive dedup)
  let brandsQuery = supabaseAdmin
    .from('products')
    .select('brand')
    .eq('is_active', true)
    .not('brand', 'is', null);

  // If category is selected, only show brands within that category
  if (currentCategory) {
    brandsQuery = brandsQuery.contains('category', [currentCategory]);
  }

  const { data: brandsData } = await brandsQuery;

  const brandCounts = ((brandsData || []) as Pick<Product, 'brand'>[]).reduce((acc: Record<string, number>, item) => {
    if (!item.brand) return acc;
    const trimmed = item.brand.trim();
    if (!trimmed) return acc;
    const existing = Object.keys(acc).find(k => k.toLowerCase() === trimmed.toLowerCase());
    const key = existing || trimmed;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const brands = Object.entries(brandCounts)
    .map(([value, count]) => ({ value, label: value, count }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return { categories, subcategories, brands };
}


/** Check if the user has any active browsing filters */
function hasActiveFilters(params: Record<string, string | undefined>): boolean {
  return !!(params.categoria || params.sub || params.marca || params.stock || params.q || params.precio_min || params.precio_max || params.orden);
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const browsing = hasActiveFilters(params);

  // If user is just landing on /productos with no filters, show category browsing
  // Otherwise show filtered product grid
  const [productResult, filterResult] = await Promise.all([
    browsing ? cachedGetProducts(params) : cachedGetProducts({ ...params, orden: 'popular' }),
    getFilterOptions(params.categoria),
  ]);

  const { products, total, page, perPage } = productResult;
  const { categories, subcategories, brands } = filterResult;
  const totalPages = Math.ceil(total / perPage);

  return (
    <>
      <Header />
      <FilterPersistence />

      <main className="min-h-screen bg-slate-50 pt-20 lg:pt-24 overflow-x-hidden">
        {/* Hero Banner — compact */}
        <section className="bg-gradient-to-br from-blue-600 to-blue-700 text-white py-8 lg:py-10">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold">
                  {params.categoria
                    ? params.sub
                      ? `${params.categoria} — ${params.sub}`
                      : params.categoria
                    : 'Nuestros Productos'}
                </h1>
                <p className="text-blue-100 text-sm mt-1 max-w-xl">
                  {params.categoria
                    ? CATEGORY_HIERARCHY.find(c => c.value === params.categoria)?.description ||
                    `Todos los productos de ${params.categoria}`
                    : 'Bombas de agua, riego, insumos agrícolas, herramientas y más. Envíos a todo Uruguay.'}
                </p>
              </div>
              <div className="flex items-center gap-3 text-sm flex-wrap">
                <span className="bg-white/15 backdrop-blur px-3 py-1 rounded-full">
                  {total.toLocaleString()} productos
                </span>
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

            {/* Quick category pills */}
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <Link
                href="/productos"
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${!params.categoria
                  ? 'bg-white text-blue-700'
                  : 'bg-white/15 text-white hover:bg-white/25'
                  }`}
              >
                Todos
              </Link>
              {categories.map(cat => (
                <Link
                  key={cat.value}
                  href={`/productos?categoria=${encodeURIComponent(cat.value)}`}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${params.categoria === cat.value
                    ? 'bg-white text-blue-700'
                    : 'bg-white/15 text-white hover:bg-white/25'
                    }`}
                >
                  {cat.value} ({cat.count})
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Subcategory chips — shown when a main category is selected */}
        {params.categoria && subcategories.length > 0 && (
          <section className="bg-white border-b border-slate-200">
            <div className="container mx-auto px-4 py-3">
              <SubcategoryChips
                subcategories={subcategories}
                categoria={params.categoria}
                currentSub={params.sub}
              />
            </div>
          </section>
        )}


        {/* Products Section */}
        <section className="container mx-auto px-4 py-6 lg:py-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar Filters — mobile: sticky toggle, desktop: sidebar with scroll */}
            <aside className="lg:w-60 shrink-0">
              <div className="sticky top-18 z-30 lg:relative lg:top-0 lg:z-auto">
                <div className="lg:bg-white lg:rounded-2xl lg:shadow-sm lg:border lg:border-slate-200 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:overflow-x-hidden">
                  <div className="lg:p-5">
                    <Suspense fallback={<div className="animate-pulse h-64 bg-slate-100 rounded-lg" />}>
                      <ProductFilters categories={categories} brands={brands} />
                    </Suspense>
                  </div>
                </div>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1 min-w-0">
              {/* PostHog search analytics: fire only if search query present */}
              {params.q && (
                <SearchAnalytics query={params.q} resultCount={total} />
              )}
              <ProductGrid products={products} />

              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="mt-10 flex justify-center" aria-label="Paginación de productos">
                  <div className="inline-flex items-center gap-1 bg-white rounded-xl border border-slate-200 p-1.5 shadow-sm">
                    {/* Prev */}
                    {page > 1 ? (
                      <Link
                        href={`/productos?${new URLSearchParams({ ...params, page: String(page - 1) } as Record<string, string>).toString()}`}
                        className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                        aria-label="Página anterior"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Link>
                    ) : (
                      <span className="p-2 rounded-lg text-slate-300 cursor-not-allowed">
                        <ChevronLeft className="h-4 w-4" />
                      </span>
                    )}

                    {/* Page 1 */}
                    <Link
                      href={`/productos?${new URLSearchParams({ ...params, page: '1' } as Record<string, string>).toString()}`}
                      className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${page === 1 ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                      1
                    </Link>

                    {page > 3 && <span className="text-slate-300 text-xs px-1">&hellip;</span>}

                    {/* Pages around current */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const p = Math.max(2, page - 2) + i;
                      if (p >= totalPages || p <= 1) return null;
                      return (
                        <Link
                          key={p}
                          href={`/productos?${new URLSearchParams({ ...params, page: String(p) } as Record<string, string>).toString()}`}
                          className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                          {p}
                        </Link>
                      );
                    })}

                    {page < totalPages - 2 && <span className="text-slate-300 text-xs px-1">&hellip;</span>}

                    {/* Last page */}
                    {totalPages > 1 && (
                      <Link
                        href={`/productos?${new URLSearchParams({ ...params, page: String(totalPages) } as Record<string, string>).toString()}`}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${page === totalPages ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                          }`}
                      >
                        {totalPages}
                      </Link>
                    )}

                    {/* Next */}
                    {page < totalPages ? (
                      <Link
                        href={`/productos?${new URLSearchParams({ ...params, page: String(page + 1) } as Record<string, string>).toString()}`}
                        className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                        aria-label="Página siguiente"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Link>
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

        {/* Related guides — shown when a category filter is active */}
        {params.categoria && await (async () => {
          // Get guides from static + DB
          const categoria = params.categoria!;
          const staticGuides = getArticlesForCategory(categoria);
          const staticSlugs = new Set(staticGuides.map(g => g.slug));

          let dbGuides: { slug: string; title: string; category: string }[] = [];
          try {
            const { data, error } = await (supabaseAdmin as any)
              .from('guides')
              .select('slug, title, category, related_categories')
              .eq('is_published', true);

            if (!error && data && Array.isArray(data)) {
              dbGuides = data
                .filter((g: any) =>
                  !staticSlugs.has(g.slug) &&
                  Array.isArray(g.related_categories) &&
                  g.related_categories.some((rc: { value: string }) => rc.value === categoria)
                );
            }
          } catch { /* continue */ }

          const allGuides = [
            ...staticGuides.map(g => ({ slug: g.slug, title: g.title, category: g.category })),
            ...dbGuides,
          ];
          if (allGuides.length === 0) return null;
          return (
            <section className="container mx-auto px-4 pb-8 overflow-hidden">
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3">Guías relacionadas</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                  {allGuides.map((g) => (
                    <Link
                      key={g.slug}
                      href={`/guias/${g.slug}`}
                      className="flex items-center justify-between p-2.5 sm:p-3 bg-slate-50 rounded-lg border border-transparent hover:border-blue-200 hover:bg-blue-50 transition-all group"
                    >
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-slate-800 group-hover:text-blue-700 truncate">
                          {g.title}
                        </p>
                        <p className="text-[10px] sm:text-xs text-slate-400">{g.category}</p>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 sm:h-4 w-4 text-slate-400 group-hover:text-blue-600 shrink-0 ml-2" />
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          );
        })()}
      </main>
    </>
  );
}
