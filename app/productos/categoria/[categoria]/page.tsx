import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import ProductsPage from '@/app/productos/page';
import { CATEGORY_HIERARCHY } from '@/lib/categories';
import { getCategoryFromSlug, getCategoryPath, getCategorySlug } from '@/lib/category-slugs';
import AllProductsIndex from '@/components/products/AllProductsIndex';
import { getCategoryMeta } from '@/lib/seo-metadata';

interface CategoryProductsPageProps {
  params: Promise<{ categoria: string }>;
  searchParams: Promise<{
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

export const revalidate = 300;

export async function generateStaticParams() {
  return CATEGORY_HIERARCHY
    .map((category) => getCategorySlug(category.value))
    .filter((slug): slug is string => Boolean(slug))
    .map((categoria) => ({ categoria }));
}

export async function generateMetadata({
  params,
  searchParams,
}: CategoryProductsPageProps): Promise<Metadata> {
  const { categoria: slug } = await params;
  const query = await searchParams;
  const categoryValue = getCategoryFromSlug(slug);

  if (!categoryValue) {
    return {
      title: 'Categoría no encontrada',
      robots: { index: false, follow: false },
    };
  }

  const sub = typeof query.sub === 'string' ? query.sub : undefined;
  const { title, description } = getCategoryMeta(categoryValue, sub);

  const refinementFilters = Boolean(
    query.marca ||
      query.stock ||
      query.orden ||
      query.precio_min ||
      query.precio_max ||
      query.q ||
      (query.page && query.page !== '1')
  );

  const categoryPath = getCategoryPath(categoryValue);
  const canonicalBase = `${siteUrl}${categoryPath}`;
  const canonical = sub
    ? `${canonicalBase}?sub=${encodeURIComponent(sub)}`
    : canonicalBase;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    robots: refinementFilters
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonical,
      siteName: 'La Aldea',
      locale: 'es_UY',
      images: [
        {
          url: `${siteUrl}/assets/images/og-image.webp`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
  };
}

export default async function CategoryProductsPage({
  params,
  searchParams,
}: CategoryProductsPageProps) {
  const { categoria: slug } = await params;
  const query = await searchParams;
  const categoryValue = getCategoryFromSlug(slug);

  if (!categoryValue) notFound();

  const canonicalSlug = getCategorySlug(categoryValue);
  if (canonicalSlug && canonicalSlug !== slug) {
    const redirectParams = new URLSearchParams();
    if (query.sub) redirectParams.set('sub', query.sub);
    if (query.marca) redirectParams.set('marca', query.marca);
    if (query.stock) redirectParams.set('stock', query.stock);
    if (query.orden) redirectParams.set('orden', query.orden);
    if (query.page && query.page !== '1') redirectParams.set('page', query.page);
    if (query.q) redirectParams.set('q', query.q);
    if (query.precio_min) redirectParams.set('precio_min', query.precio_min);
    if (query.precio_max) redirectParams.set('precio_max', query.precio_max);
    const qs = redirectParams.toString();
    permanentRedirect(
      qs
        ? `/productos/categoria/${canonicalSlug}?${qs}`
        : `/productos/categoria/${canonicalSlug}`
    );
  }

  // Only inject the full index on the canonical, indexed page (page 1).
  // Page 2+ already has noindex — no point adding the index there.
  const currentPage = parseInt(query.page || '1', 10);

  return (
    <>
      <ProductsPage
        routeCategory={categoryValue}
        searchParams={Promise.resolve({
          ...query,
          categoria: categoryValue,
        })}
      />
      {/* AllProductsIndex: links every product in this category as plain text.
          Reason: categories with >24 products paginate. Pages 2+ are noindex,
          so products that only appear there have zero incoming indexed links —
          Ahrefs flags them as orphan pages. By listing every product here on
          page 1 (which IS indexed), every product gets at least one dofollow
          internal link from a fully crawlable, canonical source. */}
      {currentPage === 1 && (
        <AllProductsIndex categoria={categoryValue} currentPage={1} />
      )}
    </>
  );
}
