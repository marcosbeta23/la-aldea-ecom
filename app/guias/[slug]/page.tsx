import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { productBreadcrumb } from "@/lib/schema";
import ArticleSectionBlock from '@/components/faq/ArticleSection';
import RelatedLinks from '@/components/faq/RelatedLinks';
import { getArticleBySlug, getAllSlugs } from '@/lib/faq-articles';
import type { FaqArticle } from '@/lib/faq-articles';
import { supabaseAdmin } from '@/lib/supabase';
import { BookOpen, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { FAQ_BY_GUIDE } from '@/lib/faq-by-guide';

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
  const { data, error } = await (supabaseAdmin as any)
    .from('guides')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error || !data) return null;

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
    const { data, error } = await (supabaseAdmin as any)
      .from('guides')
      .select('*')
      .in('slug', remainingSlugs)
      .eq('is_published', true);

    if (!error && data && Array.isArray(data)) {
      for (const row of data) {
        resolved.push(dbRowToArticle(row));
      }
    }
  }

  return resolved;
}

function dbRowToArticle(data: any): FaqArticle {
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

export async function generateStaticParams() {
  // Include static slugs
  const staticSlugs = getAllSlugs();

  // Also include DB-published slugs for build-time pre-rendering
  let dbSlugs: string[] = [];
  try {
    const { data, error } = await (supabaseAdmin as any)
      .from('guides')
      .select('slug')
      .eq('is_published', true);

    if (!error && data && Array.isArray(data)) {
      dbSlugs = data.map((g: { slug: string }) => g.slug);
    }
  } catch {
    // Continue with static only
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
  const article = await resolveArticle(slug);

  if (!article) {
    notFound();
  }

  // Resolve related articles from DB for the sidebar
  const relatedArticles = await resolveArticlesBySlugs(article.relatedArticles);
  const relatedFaqs = FAQ_BY_GUIDE[slug] || [];

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
    { "@type": "ListItem", position: 3, name: article.breadcrumbLabel },
  ],
};

// HowTo — fix the fragile regex with proper section content parsing
const stepsSection = article.sections.find(s => s.type === "steps");
const howToJsonLd = stepsSection ? {
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
      name: text.split(".")[0].trim().slice(0, 60),
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
      text: faq.answer,
    },
  })),
} : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      {howToJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
        />
      )}
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
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
                { name: 'Blog', url: '/blog' },
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
            
            <div className="mt-6 flex items-center gap-3 border-b border-blue-500/30 pb-4">
              <div className="h-10 w-10 overflow-hidden rounded-full bg-blue-100 flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/images/martin-betancor.webp"
                  alt="Martín Betancor Peregalli"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    // Fallback to logo if author image missing
                    (e.target as HTMLImageElement).src = "/logo.svg";
                    (e.target as HTMLImageElement).className = "h-full w-full object-contain p-2";
                  }}
                />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Martín Betancor Peregalli</p>
                <p className="text-xs text-blue-200">Director Técnico — La Aldea</p>
              </div>
            </div>

            <p className="mt-4 text-blue-100 max-w-2xl text-sm lg:text-base">
              {article.description}
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="container mx-auto px-4 py-8 lg:py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Article body */}
            <article className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 lg:p-8 overflow-hidden">
              {article.sections.map((section, i) => (
                <ArticleSectionBlock key={i} section={section} index={i} currentSlug={slug} />
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
                        <div className="px-4 pb-4 text-sm text-slate-600 leading-relaxed">
                          <p>{faq.answer}</p>
                        </div>
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
        .faq-table td { padding: 0.5rem 0.75rem; border-bottom: 1px solid #f1f5f9; color: #475569; }
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
