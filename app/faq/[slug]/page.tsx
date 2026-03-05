import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import ArticleSectionBlock from '@/components/faq/ArticleSection';
import RelatedLinks from '@/components/faq/RelatedLinks';
import { getArticleBySlug, getAllSlugs } from '@/lib/faq-articles';
import type { FaqArticle } from '@/lib/faq-articles';
import { supabaseAdmin } from '@/lib/supabase';
import { BookOpen } from 'lucide-react';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_URL || 'https://laaldeatala.com.uy';

export const revalidate = 300;

interface FaqArticlePageProps {
  params: Promise<{ slug: string }>;
}

async function resolveArticle(slug: string): Promise<FaqArticle | null> {
  const staticArticle = getArticleBySlug(slug);
  if (staticArticle) return staticArticle;

  const { data, error } = await (supabaseAdmin as any)
    .from('guides')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error || !data) return null;

  return {
    slug: data.slug,
    title: data.title,
    description: data.description || '',
    breadcrumbLabel: data.breadcrumb_label || data.title,
    category: data.category || '',
    keywords: data.keywords || [],
    relatedCategories: data.related_categories || [],
    relatedArticles: data.related_articles || [],
    sections: data.sections || [],
    datePublished: data.date_published || undefined,
    dateModified: data.date_modified || undefined,
  };
}

async function resolveArticlesBySlugs(slugs: string[]): Promise<FaqArticle[]> {
  if (slugs.length === 0) return [];

  const resolved: FaqArticle[] = [];
  for (const slug of slugs) {
    const s = getArticleBySlug(slug);
    if (s) resolved.push(s);
  }

  const resolvedSlugs = new Set(resolved.map((a) => a.slug));
  const remaining = slugs.filter((s) => !resolvedSlugs.has(s));

  if (remaining.length > 0) {
    const { data, error } = await (supabaseAdmin as any)
      .from('guides')
      .select('*')
      .in('slug', remaining)
      .eq('is_published', true);

    if (!error && data && Array.isArray(data)) {
      for (const row of data) {
        resolved.push({
          slug: row.slug,
          title: row.title,
          description: row.description || '',
          breadcrumbLabel: row.breadcrumb_label || row.title,
          category: row.category || '',
          keywords: row.keywords || [],
          relatedCategories: row.related_categories || [],
          relatedArticles: row.related_articles || [],
          sections: row.sections || [],
          datePublished: row.date_published || undefined,
          dateModified: row.date_modified || undefined,
        });
      }
    }
  }

  return resolved;
}

export async function generateStaticParams() {
  const staticSlugs = getAllSlugs();
  let dbSlugs: string[] = [];
  try {
    const { data, error } = await (supabaseAdmin as any)
      .from('guides')
      .select('slug')
      .eq('is_published', true);
    if (!error && data && Array.isArray(data)) {
      dbSlugs = data.map((g: { slug: string }) => g.slug);
    }
  } catch { /* continue */ }

  return [...new Set([...staticSlugs, ...dbSlugs])].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: FaqArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await resolveArticle(slug);

  if (!article) {
    return { title: 'Articulo no encontrado' };
  }

  const url = `${siteUrl}/faq/${slug}`;

  return {
    title: article.title,
    description: article.description,
    openGraph: {
      title: `${article.title} | La Aldea`,
      description: article.description,
      url,
      siteName: 'La Aldea Tala',
      locale: 'es_UY',
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title: `${article.title} | La Aldea`,
      description: article.description,
    },
    alternates: { canonical: url },
    keywords: [...article.keywords, 'La Aldea', 'Tala', 'Uruguay'],
    robots: { index: true, follow: true },
  };
}

export default async function FaqArticlePage({ params }: FaqArticlePageProps) {
  const { slug } = await params;
  const article = await resolveArticle(slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = await resolveArticlesBySlugs(article.relatedArticles);

  // JSON-LD Article schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    author: {
      '@type': 'Organization',
      name: 'La Aldea',
      url: siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'La Aldea',
      url: siteUrl,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/faq/${slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header />

      <main className="min-h-screen bg-slate-50 pt-20 lg:pt-24">
        {/* Hero */}
        <section className="bg-gradient-to-br from-blue-600 to-blue-700 text-white py-10 lg:py-14">
          <div className="container mx-auto px-4">
            <Breadcrumbs
              items={[
                { name: 'Inicio', url: '/' },
                { name: 'Preguntas Frecuentes', url: '/faq' },
                { name: article.breadcrumbLabel },
              ]}
              className="mb-6 text-blue-200"
            />

            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 bg-white/15 rounded-full text-xs font-medium">
                {article.category}
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold max-w-3xl">
              {article.title}
            </h1>
            <p className="mt-3 text-blue-100 max-w-2xl text-sm lg:text-base">
              {article.description}
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="container mx-auto px-4 py-8 lg:py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Article body */}
            <article className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 lg:p-8">
              {article.sections.map((section, i) => (
                <ArticleSectionBlock key={i} section={section} index={i} />
              ))}

              {/* Back to FAQ */}
              <div className="mt-10 pt-6 border-t border-slate-200">
                <Link
                  href="/faq"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  <BookOpen className="h-4 w-4" />
                  Ver todas las preguntas frecuentes
                </Link>
              </div>
            </article>

            {/* Sidebar */}
            <RelatedLinks article={article} relatedArticles={relatedArticles} />
          </div>
        </section>
      </main>

      {/* Styles for article content */}
      <style>{`
        .faq-content ul, .faq-content ol { margin: 0.5rem 0; padding-left: 1.5rem; }
        .faq-content li { margin-bottom: 0.5rem; line-height: 1.6; }
        .faq-content p { margin-bottom: 0.75rem; }
        .faq-content code { background: #f1f5f9; padding: 0.15rem 0.5rem; border-radius: 0.25rem; font-size: 0.9em; }
        .faq-table table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
        .faq-table th { background: #f1f5f9; text-align: left; padding: 0.75rem; font-weight: 600; color: #1e293b; border-bottom: 2px solid #e2e8f0; }
        .faq-table td { padding: 0.75rem; border-bottom: 1px solid #f1f5f9; color: #475569; }
        .faq-table tr:hover td { background: #f8fafc; }
        .faq-table p { margin-top: 1rem; font-size: 0.875rem; color: #64748b; }
        .faq-comparison > div { background: #f8fafc; border-radius: 0.75rem; padding: 1.25rem; }
        .faq-comparison h4 { font-weight: 700; color: #1e293b; margin-bottom: 0.75rem; font-size: 0.95rem; }
        .faq-comparison ul { padding-left: 1.25rem; margin: 0; }
        .faq-comparison li { margin-bottom: 0.35rem; color: #475569; font-size: 0.875rem; }
      `}</style>
    </>
  );
}
