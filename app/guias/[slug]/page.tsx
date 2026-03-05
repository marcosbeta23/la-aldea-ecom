import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import ArticleSectionBlock from '@/components/faq/ArticleSection';
import RelatedLinks from '@/components/faq/RelatedLinks';
import { getArticleBySlug, getAllSlugs } from '@/lib/faq-articles';
import { BookOpen } from 'lucide-react';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_URL || 'https://laaldeatala.com.uy';

interface GuiaPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: GuiaPageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return { title: 'Guia no encontrada' };
  }

  const url = `${siteUrl}/guias/${slug}`;

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

export default async function GuiaPage({ params }: GuiaPageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  // JSON-LD TechArticle schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: article.title,
    description: article.description,
    datePublished: article.datePublished || '2025-01-01',
    dateModified: article.dateModified || '2025-01-01',
    author: {
      '@type': 'Organization',
      name: 'La Aldea',
      url: siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'La Aldea',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/assets/images/logo.webp`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/guias/${slug}`,
    },
  };

  // HowTo schema for articles with 'steps' sections
  const stepsSection = article.sections.find(s => s.type === 'steps');
  const howToJsonLd = stepsSection ? {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: article.title,
    description: article.description,
    step: (stepsSection.content.match(/<li>([\s\S]*?)<\/li>/gi) ?? []).map((li, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      text: li.replace(/<[^>]+>/g, '').trim(),
    })),
  } : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {howToJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
        />
      )}

      <Header />

      <main className="min-h-screen bg-slate-50 pt-20 lg:pt-24">
        {/* Hero */}
        <section className="bg-gradient-to-br from-blue-600 to-blue-700 text-white py-10 lg:py-14">
          <div className="container mx-auto px-4">
            <Breadcrumbs
              items={[
                { name: 'Inicio', url: '/' },
                { name: 'Guias', url: '/faq' },
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

              {/* Back to guides */}
              <div className="mt-10 pt-6 border-t border-slate-200">
                <Link
                  href="/faq"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  <BookOpen className="h-4 w-4" />
                  Ver todas las guias y articulos
                </Link>
              </div>
            </article>

            {/* Sidebar */}
            <RelatedLinks article={article} />
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
