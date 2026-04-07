import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { productBreadcrumb } from "@/lib/schema";
import ArticleSectionBlock from '@/components/faq/ArticleSection';
import RelatedLinks from '@/components/faq/RelatedLinks';
import { getArticleBySlug, getAllSlugs } from '@/lib/faq-articles';
import type { FaqArticle } from '@/lib/faq-articles';
import { supabase } from '@/lib/supabase';
import { BookOpen, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { FAQ_BY_GUIDE } from '@/lib/faq-by-guide';
import PageHeader from '@/components/layout/PageHeader';
import { autoLinkBlogContent } from '@/lib/auto-link';
import type { SeoCluster } from '@/lib/seo-clusters';

const siteUrl = process.env.NEXT_PUBLIC_URL || 'https://laaldeatala.com.uy';

// Revalidate DB guides every 5 minutes
export const revalidate = 300;

interface GuiaPageProps {
  params: Promise<{ slug: string }>;
}

/** Resolve article: check static first, then Supabase */
async function resolveArticle(slug: string): Promise<FaqArticle | null> {
  // 1. Check static articles (fallback for any that haven't been migrated yet)
  const staticArticle = getArticleBySlug(slug);
  if (staticArticle) return staticArticle;

  // 2. Check Supabase guides table
  const { data, error } = await supabase
    .from('guides')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error) {
    console.error(`[Guide SSR] Error fetching article "${slug}":`, error.message);
    return null;
  }

  if (!data) return null;

  return dbRowToArticle(data);
}

/** Resolve multiple articles by slug from DB */
async function resolveArticlesBySlugs(slugs: string[]): Promise<FaqArticle[]> {
  if (slugs.length === 0) return [];

  const resolved: FaqArticle[] = [];

  // Check static first
  for (const slug of slugs) {
    const staticArticle = getArticleBySlug(slug);
    if (staticArticle) {
      resolved.push(staticArticle);
    }
  }

  const resolvedSlugs = new Set(resolved.map((a) => a.slug));
  const remainingSlugs = slugs.filter((s) => !resolvedSlugs.has(s));

  if (remainingSlugs.length > 0) {
    const { data, error } = await supabase
      .from('guides')
      .select('*')
      .in('slug', remainingSlugs)
      .eq('is_published', true);

    if (error) {
      console.error(`[Guide SSR] Error fetching related articles for "${remainingSlugs.join(', ')}":`, error.message);
    }

    if (!error && data && Array.isArray(data)) {
      for (const row of data) {
        resolved.push(dbRowToArticle(row));
      }
    }
  }

  return resolved;
}

function dbRowToArticle(data: any): FaqArticle {
  const safeArray = (val: any): any[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        // Quick fallback for comma-separated or postgres array syntax
        const cleaned = val.replace(/^\{|\}$/g, '');
        // Correctly handle quoted strings in postgres arrays if they exist
        return cleaned.split(',')
          .map(s => s.trim().replace(/^"|"$/g, ''))
          .filter(Boolean);
      }
    }
    return [];
  };

  const sections = safeArray(data.sections).map(s => ({
    title: String(s?.title || ''),
    content: String(s?.content || ''),
    type: String(s?.type || 'text') as any
  }));

  const relatedCategories = safeArray(data.related_categories)
    .map(c => {
      if (typeof c === 'string') return { label: c, value: c };
      if (c && typeof c === 'object') {
        return {
          label: String(c.label || c.value || ''),
          value: String(c.value || c.label || '')
        };
      }
      return null;
    })
    .filter((c): c is { label: string; value: string } => !!c && !!c.label);

  return {
    slug: String(data.slug),
    title: String(data.title),
    description: String(data.description || ''),
    breadcrumbLabel: String(data.breadcrumb_label || data.title),
    category: String(data.category || ''),
    keywords: safeArray(data.keywords).map(k => String(k)),
    relatedCategories,
    relatedArticles: safeArray(data.related_articles).map(a => String(a)),
    sections,
    datePublished: data.date_published || undefined,
    dateModified: data.date_modified || undefined,
  };
}

/** Fetch all published guides to create dynamic SEO clusters */
async function getDynamicClusters(): Promise<SeoCluster[]> {
  const { data, error } = await supabase
    .from('guides')
    .select('slug, title, keywords, category')
    .eq('is_published', true);

  if (error || !data) {
    console.error('[SEO Clusters] Error fetching guides:', error?.message);
    return [];
  }

  return (data as any[]).map(guide => ({
    url: `/guias/${guide.slug}`,
    cluster: String(guide.category || 'general').toLowerCase(),
    type: 'guide',
    keywords: [
      { term: guide.title, weight: 10 },
      ...(Array.isArray(guide.keywords) ? guide.keywords : []).map((k: any) => ({
        term: String(k),
        weight: 9
      }))
    ]
  }));
}

export async function generateStaticParams() {
  // Include static slugs
  const staticSlugs = getAllSlugs();

  // Also include DB-published slugs for build-time pre-rendering
  let dbSlugs: string[] = [];
  try {
    const { data, error } = await supabase
      .from('guides')
      .select('slug')
      .eq('is_published', true);

    if (!error && data && Array.isArray(data)) {
      dbSlugs = (data as { slug: string }[]).map((g) => g.slug);
    }
  } catch (err) {
    console.error('[Guide build] Error in generateStaticParams:', err);
  }

  const allSlugs = [...new Set([...staticSlugs, ...dbSlugs])];
  return allSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: GuiaPageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await resolveArticle(slug);

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
      images: [
        {
          url: `${siteUrl}/assets/images/og-image.webp`,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${article.title} | La Aldea`,
      description: article.description,
      images: [`${siteUrl}/assets/images/og-image.webp`],
    },
    alternates: { canonical: url },
    keywords: [...article.keywords.filter(k => typeof k === 'string'), 'La Aldea', 'Tala', 'Uruguay'],
    robots: { index: true, follow: true },
  };
}

export default async function GuiaPage({ params }: GuiaPageProps) {
  const { slug } = await params;
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  const article = await resolveArticle(slug);

  if (!article) {
    notFound();
  }

  // Resolve related articles and dynamic clusters
  const [relatedArticles, dynamicClusters] = await Promise.all([
    resolveArticlesBySlugs(article.relatedArticles),
    getDynamicClusters()
  ]);

  const relatedFaqs = (FAQ_BY_GUIDE[slug] || []).map(faq => ({
    ...faq,
    answer: autoLinkBlogContent(faq.answer, slug, {
      maxLinks: 1,
      linkClass: 'text-blue-600 hover:text-blue-700 hover:underline',
      additionalClusters: dynamicClusters
    })
  }));

  // JSON-LD TechArticle schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "@id": `${siteUrl}/guias/${slug}`,
    headline: article.title,
    description: article.description,

    // REQUIRED by Google for Article rich results — use OG image or logo fallback
    image: {
      "@type": "ImageObject",
      url: `${siteUrl}/assets/images/og-image.webp`, // swap for article-specific image when available
      width: 1200,
      height: 630,
    },

    datePublished: article.datePublished || "2025-01-01",
    dateModified: article.dateModified || article.datePublished || "2025-01-01",

    // Person author gets more E-E-A-T weight than Organization
    author: {
      "@type": "Person",
      name: "Martín Betancor Peregalli",
      url: `${siteUrl}/nosotros`,
      jobTitle: "Especialista en Hidráulica y Riego",
      worksFor: {
        "@type": "Organization",
        "@id": "https://laaldeatala.com.uy/#business",
        name: "La Aldea",
      },
    },

    publisher: {
      "@type": "Organization",
      "@id": "https://laaldeatala.com.uy/#business",
      name: "La Aldea",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/assets/images/logo.webp`,
        width: 260,
        height: 80,
      },
    },

    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/guias/${slug}`,
    },

    // Links article to product categories — GEO/AEO signal
    about: article.relatedCategories.map(rc => ({
      "@type": "Thing",
      name: rc.label,
      url: `${siteUrl}/productos?category=${encodeURIComponent(rc.value)}`,
    })),

    keywords: article.keywords.join(", "),

    // Speakable — marks content suitable for voice assistants (Google Assistant etc.)
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "h2", ".article-description"],
    },

    isPartOf: {
      "@type": "Blog",
      "@id": `${siteUrl}/blog`,
      name: "Guías y Artículos — La Aldea",
      publisher: {
        "@id": "https://laaldeatala.com.uy/#business",
      },
    },
  };

  // Breadcrumb — replaces your current manual construction
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${siteUrl}/blog` },
      { "@type": "ListItem", position: 3, name: article.breadcrumbLabel, item: `${siteUrl}/guias/${slug}` },
    ],
  };

  // HowTo — fix the fragile regex with proper section content parsing
  const stepsSection = article.sections.find(s => s.type === "steps");
  const howToJsonLd = (stepsSection && typeof stepsSection.content === 'string') ? {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: article.title,
    description: article.description,
    image: `${siteUrl}/assets/images/og-image.webp`,
    // Parse steps from content — handle both <li> and numbered text strictly
    step: (stepsSection.content.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || [])
      .map(li => li.replace(/<[^>]*>/g, '').trim())
      .filter(text => text.length > 5)
      .map((text, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: String(text.split(".")[0]).trim().slice(0, 60),
        text: text,
      })),
  } : null;

  // FAQPage JSON-LD
  const faqJsonLd = relatedFaqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: relatedFaqs.map(faq => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer.replace(/<[^>]*>/g, ''), // Clean HTML for schema
      },
    })),
  } : null;

  return (
    <>
      <script
        type="application/ld+json"
        nonce={nonce}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        nonce={nonce}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      {howToJsonLd && (
        <script
          type="application/ld+json"
          nonce={nonce}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
        />
      )}
      {faqJsonLd && (
        <script
          type="application/ld+json"
          nonce={nonce}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <Header />

      <main className="min-h-screen bg-slate-50">
        {/* Hero */}
        <PageHeader
          badge={article.category}
          title={article.title}
          description={article.description}
        >
          <Breadcrumbs
            items={[
              { name: 'Inicio', url: '/' },
              { name: 'Blog', url: '/blog' },
              { name: article.breadcrumbLabel },
            ]}
            className="text-blue-200"
          />
        </PageHeader>

        {/* Content */}
        <section className="container mx-auto px-4 py-8 lg:py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Article body */}
            <article className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 lg:p-8 overflow-hidden">
              {article.sections.map((section, i) => (
                <ArticleSectionBlock
                  key={i}
                  section={section}
                  index={i}
                  currentSlug={slug}
                  additionalClusters={dynamicClusters}
                />
              ))}

              {/* FAQs relacionadas al final del artículo */}
              {relatedFaqs.length > 0 && (
                <section className="mt-10 pt-8 border-t border-slate-200">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">
                    Preguntas frecuentes
                  </h2>
                  <div className="space-y-2">
                    {relatedFaqs.map((faq, i) => (
                      <details
                        key={i}
                        className="group border border-slate-200 rounded-lg overflow-hidden"
                      >
                        <summary className="flex items-center justify-between p-4 cursor-pointer font-medium text-slate-900 list-none hover:bg-slate-50 transition-colors">
                          {faq.question}
                          <ChevronDown className="h-4 w-4 text-slate-400 group-open:rotate-180 transition-transform shrink-0 ml-2" />
                        </summary>
                        <div
                          className="px-4 pb-4 text-sm text-slate-700 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: faq.answer }}
                        />
                      </details>
                    ))}
                  </div>
                </section>
              )}

              {/* Back to guides */}
              <div className="mt-10 pt-6 border-t border-slate-200">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  <BookOpen className="h-4 w-4" />
                  Ver todas las guias y articulos
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
        .faq-table { overflow-x: auto; -webkit-overflow-scrolling: touch; max-width: 100%; }
        .faq-table table { width: 100%; border-collapse: collapse; font-size: 0.875rem; min-width: 400px; }
        .faq-table th { background: #f1f5f9; text-align: left; padding: 0.5rem 0.75rem; font-weight: 600; color: #1e293b; border-bottom: 2px solid #e2e8f0; white-space: nowrap; }
        .faq-table td { padding: 0.5rem 0.75rem; border-bottom: 1px solid #f1f5f9; color: #334155; }
        .faq-table tr:hover td { background: #f8fafc; }
        .faq-table p { margin-top: 1rem; font-size: 0.875rem; color: #475569; }
        .faq-comparison > div { background: #f8fafc; border-radius: 0.75rem; padding: 1.25rem; }
        .faq-comparison h4 { font-weight: 700; color: #1e293b; margin-bottom: 0.75rem; font-size: 0.95rem; }
        .faq-comparison ul { padding-left: 1.25rem; margin: 0; }
        .faq-comparison li { margin-bottom: 0.35rem; color: #334155; font-size: 0.875rem; }
      `}</style>
    </>
  );
}
