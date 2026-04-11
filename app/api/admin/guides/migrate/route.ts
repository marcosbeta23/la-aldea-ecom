import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { FAQ_ARTICLES } from '@/lib/faq-articles';
import type { Database } from '@/types/database';

type GuideInsert = Database['public']['Tables']['guides']['Insert'];

const guidesBridge = supabaseAdmin as unknown as {
  from: (table: 'guides') => {
    select: (columns: 'id') => {
      eq: (column: 'slug', value: string) => {
        maybeSingle: () => Promise<{ data: { id: string } | null; error: { message: string } | null }>;
      };
    };
    insert: (values: GuideInsert) => Promise<{ error: { message: string } | null }>;
  };
};

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results: { slug: string; status: 'inserted' | 'skipped' | 'error'; error?: string }[] = [];

  for (const article of FAQ_ARTICLES) {
    // Check if slug already exists
    const { data: existing } = await guidesBridge
      .from('guides')
      .select('id')
      .eq('slug', article.slug)
      .maybeSingle();

    if (existing) {
      results.push({ slug: article.slug, status: 'skipped' });
      continue;
    }

    const guideInsert: GuideInsert = {
      slug: article.slug,
      title: article.title,
      description: article.description,
      breadcrumb_label: article.breadcrumbLabel,
      category: article.category,
      keywords: article.keywords,
      related_categories: article.relatedCategories,
      related_articles: article.relatedArticles,
      sections: article.sections,
      date_published: article.datePublished || new Date().toISOString().split('T')[0],
      date_modified: article.dateModified || new Date().toISOString().split('T')[0],
      is_published: true,
    };

    const { error } = await guidesBridge
      .from('guides')
      .insert(guideInsert);

    if (error) {
      results.push({ slug: article.slug, status: 'error', error: error.message });
    } else {
      results.push({ slug: article.slug, status: 'inserted' });
    }
  }

  const inserted = results.filter((r) => r.status === 'inserted').length;
  const skipped = results.filter((r) => r.status === 'skipped').length;
  const errors = results.filter((r) => r.status === 'error').length;

  return NextResponse.json({
    message: `Migration complete: ${inserted} inserted, ${skipped} skipped (already exist), ${errors} errors`,
    results,
  });
}
