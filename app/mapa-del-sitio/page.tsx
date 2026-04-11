// app/mapa-del-sitio/page.tsx
// HTML sitemap — crawled daily by Ahrefs and Google.
// Every active product appears here as a plain text link.
// This is the safety net: if AllProductsIndex on category pages ever
// misses a product (e.g. uncategorised), it will still have a link here.
import { supabaseAdmin } from '@/lib/supabase';
import { CATEGORY_HIERARCHY } from '@/lib/categories';
import { getCategoryPath } from '@/lib/category-slugs';
import Link from 'next/link';
import Header from '@/components/Header';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mapa del Sitio | La Aldea — Bombas, Riego e Insumos en Tala, Uruguay',
  description:
    'Mapa completo del sitio de La Aldea. Encontrá todos los productos, categorías y secciones: bombas de agua, riego, insumos agrícolas, herramientas y piscinas en Tala, Uruguay.',
  robots: { index: true, follow: true },
};

// Revalidar cada hora — garantiza que productos nuevos aparezcan rápido
export const revalidate = 3600;

type ProductRow = { slug: string; name: string; category: string[] | string | null };

export default async function SitemapPage() {
  // Fetch all active products — wrapped in try/catch so the page
  // never crashes or renders empty when supabaseAdmin has issues.
  let products: ProductRow[] = [];
  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('slug, name, category')
      .eq('is_active', true)
      .not('slug', 'is', null)
      .order('name', { ascending: true });
    if (!error && Array.isArray(data)) {
      products = data as ProductRow[];
    }
  } catch {
    // supabaseAdmin failed (e.g. missing service role key in this env).
    // Render the page with an empty product list — at least the category
    // and static links will be crawlable.
    products = [];
  }

  // Group by first category value
  const byCategory: Record<string, { name: string; slug: string }[]> = {};
  for (const product of products) {
    const cat = Array.isArray(product.category)
      ? product.category[0]
      : product.category;
    const key = cat || 'Sin categoría';
    if (!byCategory[key]) byCategory[key] = [];
    byCategory[key].push({ name: product.name, slug: product.slug });
  }

  const staticLinks = [
    { href: '/', label: 'Inicio' },
    { href: '/productos', label: 'Catálogo de productos' },
    { href: '/servicios', label: 'Servicios de riego e hidráulica' },
    { href: '/nosotros', label: 'Sobre La Aldea' },
    { href: '/contacto', label: 'Contacto' },
    { href: '/blog', label: 'Blog y guías técnicas' },
    { href: '/guias', label: 'Guías técnicas' },
    { href: '/faq', label: 'Preguntas frecuentes' },
    { href: '/terminos', label: 'Términos y condiciones' },
    { href: '/privacidad', label: 'Política de privacidad' },
    { href: '/politica-de-devoluciones', label: 'Política de devoluciones' },
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 pt-8">Mapa del Sitio</h1>
          <p className="text-slate-500 mb-10">
            Encontrá cualquier sección o producto de La Aldea.
          </p>

          {/* Páginas principales */}
          <section className="mb-10">
            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">
              Páginas principales
            </h2>
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {staticLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-blue-600 hover:underline text-sm">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* Categorías con link directo a cada página de categoría */}
          <section className="mb-10">
            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">
              Categorías de productos
            </h2>
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORY_HIERARCHY.map((cat) => (
                <li key={cat.value}>
                  <Link
                    href={getCategoryPath(cat.value)}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* Todos los productos agrupados por categoría */}
          {products.length > 0 ? (
            Object.entries(byCategory)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([cat, prods]) => (
                <section key={cat} className="mb-8">
                  <h2 className="text-base font-bold text-slate-700 mb-3 border-b border-slate-100 pb-1">
                    {cat} ({prods.length} productos)
                  </h2>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
                    {prods.map((p) => (
                      <li key={p.slug}>
                        <Link
                          href={`/productos/${p.slug}`}
                          className="text-blue-600 hover:underline text-sm leading-relaxed"
                        >
                          {p.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))
          ) : (
            // Fallback visible cuando supabaseAdmin no devuelve datos
            <p className="text-slate-400 text-sm">
              Los productos se están cargando. Visitá el{' '}
              <Link href="/productos" className="text-blue-600 hover:underline">
                catálogo completo
              </Link>
              .
            </p>
          )}
        </div>
      </main>
    </>
  );
}
