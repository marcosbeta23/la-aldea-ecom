// app/mapa-del-sitio/page.tsx
import { supabaseAdmin } from '@/lib/supabase';
import { CATEGORY_HIERARCHY } from '@/lib/categories';
import Link from 'next/link';
import Header from '@/components/Header';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mapa del Sitio',
  description: 'Todos los productos y secciones de La Aldea Agroinsumos y Riego.',
  robots: { index: true, follow: true },
};

export const revalidate = 3600; // revalidar cada hora — reduce orphan pages

export default async function SitemapPage() {
  const { data: products } = await supabaseAdmin
    .from('products')
    .select('slug, name, category')
    .eq('is_active', true)
    .not('slug', 'is', null)
    .order('name', { ascending: true });

  // Agrupar por categoría principal
  const byCategory: Record<string, { name: string; slug: string }[]> = {};
  (products || []).forEach((p: any) => {
    const cat = Array.isArray(p.category) ? p.category[0] : p.category;
    const key = cat || 'Otros';
    if (!byCategory[key]) byCategory[key] = [];
    byCategory[key].push({ name: p.name, slug: p.slug });
  });

  const staticLinks = [
    { href: '/', label: 'Inicio' },
    { href: '/productos', label: 'Catálogo de productos' },
    { href: '/servicios', label: 'Servicios de riego e hidráulica' },
    { href: '/nosotros', label: 'Sobre La Aldea' },
    { href: '/contacto', label: 'Contacto' },
    { href: '/blog', label: 'Blog' },
    { href: '/guias', label: 'Guías técnicas' },
    { href: '/faq', label: 'Preguntas frecuentes' },
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 pt-8">Mapa del Sitio</h1>
          <p className="text-slate-500 mb-10">Encontrá cualquier sección o producto de La Aldea.</p>

          {/* Páginas principales */}
          <section className="mb-10">
            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">
              Páginas principales
            </h2>
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {staticLinks.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-blue-600 hover:underline text-sm">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* Categorías */}
          <section className="mb-10">
            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">
              Categorías de productos
            </h2>
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORY_HIERARCHY.map(cat => (
                <li key={cat.value}>
                  <Link
                    href={`/productos?categoria=${encodeURIComponent(cat.value)}`}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    {cat.value}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* Productos por categoría */}
          {Object.entries(byCategory).sort(([a], [b]) => a.localeCompare(b)).map(([cat, prods]) => (
            <section key={cat} className="mb-8">
              <h2 className="text-base font-bold text-slate-700 mb-3 border-b border-slate-100 pb-1">
                {cat} ({prods.length} productos)
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
                {prods.map(p => (
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
          ))}
        </div>
      </main>
    </>
  );
}