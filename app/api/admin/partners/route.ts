import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

async function verifyAdmin() {
  const { userId } = await auth();
  return !!userId;
}

// GET all partners (no auth — needed for homepage)
export async function GET() {
  const { data: partners, error } = await supabaseAdmin
    .from('partners')
    .select('*')
    .order('display_order', { ascending: true }) as { data: any[] | null; error: any };

  if (error) {
    console.error('Error fetching partners:', error);
    return NextResponse.json({ error: 'Failed to fetch partners' }, { status: 500 });
  }

  return NextResponse.json({ partners });
}

// POST create new partner (admin only)
export async function POST(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, logo_url, website_url, display_order, is_active } = body;

    if (!name || !logo_url) {
      return NextResponse.json({ error: 'Name and logo_url are required' }, { status: 400 });
    }

    const { data: partner, error } = await (supabaseAdmin as any)
      .from('partners')
      .insert({
        name,
        logo_url,
        website_url: website_url || null,
        display_order: Number(display_order) || 0,
        is_active: is_active !== false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating partner:', error);
      return NextResponse.json({ error: 'Failed to create partner' }, { status: 500 });
    }

    return NextResponse.json({ partner }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
