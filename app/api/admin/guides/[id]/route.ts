import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

async function verifyAdmin() {
  const { userId } = await auth();
  return !!userId;
}

// GET single guide
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const { data: guide, error } = await (supabaseAdmin as any)
    .from('guides')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !guide) {
    return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
  }

  return NextResponse.json({ guide });
}

// PATCH update guide
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    if (body.slug !== undefined) {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(body.slug)) {
        return NextResponse.json({ error: 'slug must be lowercase with hyphens only' }, { status: 400 });
      }
      updateData.slug = body.slug;
    }
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.breadcrumb_label !== undefined) updateData.breadcrumb_label = body.breadcrumb_label;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.keywords !== undefined) updateData.keywords = body.keywords;
    if (body.related_categories !== undefined) updateData.related_categories = body.related_categories;
    if (body.related_articles !== undefined) updateData.related_articles = body.related_articles;
    if (body.sections !== undefined) updateData.sections = body.sections;
    if (body.is_published !== undefined) updateData.is_published = body.is_published;

    const { data: guide, error } = await (supabaseAdmin as any)
      .from('guides')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating guide:', error);
      if (error.code === '23505') {
        return NextResponse.json({ error: 'A guide with this slug already exists' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Failed to update guide' }, { status: 500 });
    }

    return NextResponse.json({ guide });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

// DELETE guide
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const { error } = await (supabaseAdmin as any)
    .from('guides')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting guide:', error);
    return NextResponse.json({ error: 'Failed to delete guide' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
