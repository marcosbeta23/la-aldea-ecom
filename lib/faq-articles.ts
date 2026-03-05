// lib/faq-articles.ts
// Types and helpers for guide articles.
// Article data has been migrated to Supabase — use the admin panel to manage guides.
// This file is kept for type definitions and backward-compatible helper functions.

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

// All articles are now managed in Supabase. This array is kept empty for backward compatibility.
export const FAQ_ARTICLES: FaqArticle[] = [];

// ── Helpers (backward-compatible, return empty when static array is empty) ────

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
