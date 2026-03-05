// lib/faq-articles.ts
// FAQ article data for /faq/[slug] pages
// All guides have been migrated to Supabase — this array is intentionally empty.

export interface ArticleSection {
  title: string;
  content: string; // HTML-safe string (rendered with dangerouslySetInnerHTML)
  type: 'text' | 'list' | 'steps' | 'stats' | 'table' | 'comparison';
}

export interface FaqArticle {
  slug: string;
  title: string;
  description: string; // SEO meta description
  breadcrumbLabel: string;
  category: string; // display category
  keywords: string[];
  relatedCategories: Array<{ label: string; value: string }>; // link to /productos?categoria=X
  relatedArticles: string[]; // other article slugs
  sections: ArticleSection[];
  datePublished?: string; // 'YYYY-MM-DD'
  dateModified?: string; // 'YYYY-MM-DD'
}

export const FAQ_ARTICLES: FaqArticle[] = [];

// ── Helpers ──────────────────────────────────────────────────────────────────

export function getArticleBySlug(slug: string): FaqArticle | undefined {
  return FAQ_ARTICLES.find(a => a.slug === slug);
}

export function getAllSlugs(): string[] {
  return FAQ_ARTICLES.map(a => a.slug);
}

/**
 * Get articles related to a product category.
 * Returns articles whose relatedCategories include that category value.
 */
export function getArticlesForCategory(categoryValue: string): FaqArticle[] {
  return FAQ_ARTICLES.filter(a =>
    a.relatedCategories.some(rc => rc.value === categoryValue)
  );
}
