import { NextRequest, NextResponse } from 'next/server';
import { verifyOwnerAuth } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase';
import type { Database } from '@/types/database';

type GuideRow = Database['public']['Tables']['guides']['Row'];
type GuideInsert = Database['public']['Tables']['guides']['Insert'];

const GUIDE_SELECT_COLUMNS =
  'id, slug, title, description, breadcrumb_label, category, keywords, related_categories, related_articles, sections, is_published, date_published, date_modified, created_at, updated_at';

type GuideInsertResponse = {
  data: GuideRow | null;
  error: { code?: string; message: string } | null;
};

const guidesInsertBridge = supabaseAdmin as unknown as {
  from: (table: 'guides') => {
    insert: (values: GuideInsert) => {
      select: (columns: string) => {
        single: () => Promise<GuideInsertResponse>;
      };
    };
  };
};


// GET all guides (admin sees all, public would see published only)
export async function GET(request: NextRequest) {

  const authResult = await verifyOwnerAuth();
  if (!authResult.authorized) return authResult.response;

  const { searchParams } = new URL(request.url);
  const publishedOnly = searchParams.get('published') === 'true';

  let query = supabaseAdmin
    .from('guides')
    .select(GUIDE_SELECT_COLUMNS)
    .order('updated_at', { ascending: false });

  if (publishedOnly) {
    query = query.eq('is_published', true);
  }

  const { data: guides, error } = await query.returns<GuideRow[]>();

  if (error) {
    console.error('Error fetching guides:', error);
    return NextResponse.json({ error: 'Failed to fetch guides' }, { status: 500 });
  }

  return NextResponse.json({ guides: guides || [] });
}

// POST create new guide
export async function POST(request: NextRequest) {

  const authResult = await verifyOwnerAuth();
  if (!authResult.authorized) return authResult.response;

  try {
    const body = await request.json();
    const {
      slug,
      title,
      description,
      breadcrumb_label,
      category,
      keywords,
      related_categories,
      related_articles,
      sections,
      is_published,
    } = body;

    if (!slug || !title) {
      return NextResponse.json({ error: 'slug and title are required' }, { status: 400 });
    }

    // Validate slug format
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return NextResponse.json({ error: 'slug must be lowercase with hyphens only' }, { status: 400 });
    }

    const guideInsert: GuideInsert = {
      slug,
      title,
      description: description || '',
      breadcrumb_label: breadcrumb_label || title,
      category: category || '',
      keywords: keywords || [],
      related_categories: related_categories || [],
      related_articles: related_articles || [],
      sections: sections || [],
      is_published: is_published || false,
      date_published: new Date().toISOString().split('T')[0],
      date_modified: new Date().toISOString().split('T')[0],
    };

    const { data: guide, error } = await guidesInsertBridge
      .from('guides')
      .insert(guideInsert)
      .select(GUIDE_SELECT_COLUMNS)
      .single();

    if (error) {
      console.error('Error creating guide:', error);
      if (error.code === '23505') {
        return NextResponse.json({ error: 'A guide with this slug already exists' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Failed to create guide' }, { status: 500 });
    }

    return NextResponse.json({ guide }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
