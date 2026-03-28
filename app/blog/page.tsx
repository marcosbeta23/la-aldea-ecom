import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import { FAQ_ARTICLES } from '@/lib/faq-articles';
import { supabase } from '@/lib/supabase';
import { Calendar, ChevronRight, BookOpen, Tag } from 'lucide-react';
import { WHATSAPP_PHONE } from '@/lib/constants';
import PageHeader from '@/components/layout/PageHeader';

const siteUrl = process.env.NEXT_PUBLIC_URL || 'https://laaldeatala.com.uy';

// Revalidate every 5 minutes so new admin-created guides appear
export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Articulos, guias tecnicas y novedades sobre riego, bombas de agua, agroquimicos, piscinas y mas. Consejos practicos para productores y hogares en Uruguay.',
  openGraph: {
    title: 'Blog | La Aldea',
    description:
      'Articulos, guias tecnicas y novedades sobre riego, bombas de agua, agroquimicos, piscinas y mas.',
    type: 'website',
    url: `${siteUrl}/blog`,
  },
  alternates: { canonical: `${siteUrl}/blog` },
};

/** Minimal shape needed for the blog listing */
interface BlogArticle {
  slug: string;
  title: string;
  description: string;
  category: string;
  datePublished?: string;
  dateModified?: string;
}

/** Merge static FAQ_ARTICLES with published DB guides, deduplicating by slug */
async function getAllArticles(): Promise<BlogArticle[]> {
  const staticArticles: BlogArticle[] = FAQ_ARTICLES.map((a) => ({
    slug: a.slug,
    title: a.title,
    description: a.description,
    category: a.category,
    datePublished: a.datePublished,
    dateModified: a.dateModified,
  }));

  let dbArticles: BlogArticle[] = [];
  try {
    const { data, error } = await supabase
      .from('guides')
      .select('slug, title, description, category, date_published, date_modified')
      .eq('is_published', true) as { data: any[] | null; error: any };

    if (!error && data && Array.isArray(data)) {
      const staticSlugs = new Set(FAQ_ARTICLES.map((a) => a.slug));
      dbArticles = data
        .filter((g: { slug: string }) => !staticSlugs.has(g.slug))
        .map((g: { slug: string; title: string; description: string | null; category: string | null; date_published: string | null; date_modified: string | null }) => ({
          slug: g.slug,
          title: g.title,
          description: g.description || '',
          category: g.category || 'General',
          datePublished: g.date_published || undefined,
          dateModified: g.date_modified || undefined,
        }));
    }
  } catch {
    // If guides table doesn't exist yet, continue with static only
  }

  return [...staticArticles, ...dbArticles];
}

// Group articles by category for display
function groupByCategory(articles: BlogArticle[]) {
  const groups: Record<string, BlogArticle[]> = {};
  for (const article of articles) {
    const cat = article.category || 'General';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(article);
  }
  return groups;
}

// Category colors
const categoryColors: Record<string, string> = {
  'Sistemas de Riego': 'bg-green-100 text-green-700',
  'Bombas de Agua': 'bg-blue-100 text-blue-700',
  Agroquimicos: 'bg-amber-100 text-amber-700',
  Piscinas: 'bg-cyan-100 text-cyan-700',
  Drogueria: 'bg-purple-100 text-purple-700',
  Herramientas: 'bg-orange-100 text-orange-700',
  'Energia Solar': 'bg-yellow-100 text-yellow-700',
};

export default async function BlogPage() {

  const allArticles = await getAllArticles();

  // Sort articles newest first
  const articles = allArticles.sort((a, b) => {
    const da = a.dateModified || a.datePublished || '2025-01-01';
    const db = b.dateModified || b.datePublished || '2025-01-01';
    return db.localeCompare(da);
  });

  // --- SCHEMA.ORG JSON-LD ---
  // CollectionPage tells Google this is an article index
  const blogPageSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${siteUrl}/blog`,
    name: "Guías y Artículos Técnicos — La Aldea",
    description: "Artículos, guías técnicas y consejos sobre riego, bombas de agua, agroquímicos, piscinas y más. Para productores y hogares en Uruguay.",
    url: `${siteUrl}/blog`,
    inLanguage: "es-UY",
    isPartOf: {
      "@id": `${siteUrl}/#website`,
    },
    publisher: {
      "@id": "https://laaldeatala.com.uy/#business",
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Inicio", item: siteUrl },
        { "@type": "ListItem", position: 2, name: "Blog" },
      ],
    },
  };

  // ItemList — each article as a ListItem, Google uses this for rich carousels
  const articleListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Artículos técnicos de La Aldea",
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    numberOfItems: articles.length,
    itemListElement: articles.map((article, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${siteUrl}/guias/${article.slug}`,
      name: article.title,
      description: article.description,
    })),
  };

  const grouped = groupByCategory(articles);
  const categories = Object.keys(grouped);

  // Pick the 3 most recently modified articles for the featured section
  const featured = articles.slice(0, 3);

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Blog" },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPageSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleListSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <Header />

      <main className="min-h-screen bg-slate-50">
        {/* Hero */}
        <PageHeader
          badge="Guías y Artículos"
          title="Blog de La Aldea"
          description="Guías técnicas, consejos prácticos y novedades sobre riego, bombas de agua, agroquímicos, piscinas y más. Contenido creado por nuestro equipo técnico."
          className="text-center [&_div.max-w-4xl]:mx-auto [&_.inline-flex]:mx-auto [&_p]:mx-auto"
        />

        {/* Featured Articles */}
        <section className="container mx-auto px-4 -mt-6 relative z-10">
          <div className="grid gap-4 md:grid-cols-3">
            {featured.map((article) => (
              <Link
                key={article.slug}
                href={`/guias/${article.slug}`}
                className="group bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:border-blue-200 transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      categoryColors[article.category] || 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {article.category}
                  </span>
                  {article.dateModified && (
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(article.dateModified).toLocaleDateString('es-UY', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <p className="mt-2 text-sm text-slate-500 line-clamp-2">{article.description}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm text-blue-600 font-medium">
                  Leer guia <ChevronRight className="h-3 w-3" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Category filters + Article grid */}
        <section className="container mx-auto px-4 py-10 lg:py-14">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <aside className="lg:col-span-1 order-last lg:order-first">
              <div className="bg-white rounded-xl border border-slate-200 p-5 sticky top-24">
                <h2 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-blue-600" />
                  Categorias
                </h2>
                <ul className="space-y-1">
                  {categories.map((cat) => (
                    <li key={cat}>
                      <a
                        href={`#${cat.toLowerCase().replace(/\s+/g, '-')}`}
                        className="flex items-center justify-between py-1.5 px-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                      >
                        <span>{cat}</span>
                        <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          {grouped[cat].length}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>

                <div className="mt-5 pt-5 border-t border-slate-200">
                  <p className="text-xs text-slate-500 mb-2">
                    {articles.length} guias y articulos disponibles
                  </p>
                  <Link
                    href="/faq"
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    Ver preguntas frecuentes
                  </Link>
                </div>
              </div>
            </aside>

            {/* Articles by category */}
            <div className="lg:col-span-3 space-y-10">
              {categories.map((cat) => (
                <div key={cat} id={cat.toLowerCase().replace(/\s+/g, '-')}>
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-lg font-bold text-slate-900">{cat}</h2>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        categoryColors[cat] || 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {grouped[cat].length} articulo{grouped[cat].length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {grouped[cat].map((article) => (
                      <Link
                        key={article.slug}
                        href={`/guias/${article.slug}`}
                        className="group flex items-start gap-3 bg-white rounded-xl border border-slate-200 p-4 hover:border-blue-200 hover:shadow-sm transition-all"
                      >
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {article.title}
                          </h3>
                          <p className="mt-1 text-xs text-slate-500 line-clamp-2">{article.description}</p>
                          {article.datePublished && (
                            <span className="mt-2 inline-flex items-center gap-1 text-xs text-slate-400">
                              <Calendar className="h-3 w-3" />
                              {new Date(article.datePublished).toLocaleDateString('es-UY', {
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          )}
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600 shrink-0 mt-1 transition-colors" />
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="pb-16 lg:pb-20">
          <div className="container mx-auto px-4">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 md:p-12 text-center text-white">
              <h2 className="text-2xl font-bold md:text-3xl">¿Tenes una consulta tecnica?</h2>
              <p className="mt-3 text-blue-100 max-w-xl mx-auto">
                Si no encontras la respuesta en nuestras guias, escribinos y te asesoramos
                personalmente.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <a
                  href="https://wa.me/${WHATSAPP_PHONE}?text=Hola,%20tengo%20una%20consulta%20tecnica%20sobre..."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-blue-700 hover:bg-blue-50 transition-colors"
                >
                  <BookOpen className="h-5 w-5" />
                  Consultar por WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
