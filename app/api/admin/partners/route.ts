import { NextRequest, NextResponse } from 'next/server';
import { verifyOwnerAuth } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase';
import type { Database } from '@/types/database';

type PartnerRow = Database['public']['Tables']['partners']['Row'];
type PartnerInsert = Database['public']['Tables']['partners']['Insert'];

const PARTNER_SELECT_COLUMNS =
  'id, name, logo_url, website_url, display_order, is_active, created_at, updated_at';

type PartnerWriteResponse = {
  data: PartnerRow | null;
  error: { message: string } | null;
};

const partnersWriteBridge = supabaseAdmin as unknown as {
  from: (table: 'partners') => {
    insert: (values: PartnerInsert) => {
      select: (columns: string) => {
        single: () => Promise<PartnerWriteResponse>;
      };
    };
  };
};


// GET all partners (no auth — needed for homepage)
export async function GET() {
  const { data: partners, error } = await supabaseAdmin
    .from('partners')
    .select(PARTNER_SELECT_COLUMNS)
    .order('display_order', { ascending: true })
    .returns<PartnerRow[]>();

  if (error) {
    console.error('Error fetching partners:', error);
    return NextResponse.json({ error: 'Failed to fetch partners' }, { status: 500 });
  }

  return NextResponse.json({ partners });
}

// POST create new partner (admin only)
export async function POST(request: NextRequest) {

  const authResult = await verifyOwnerAuth();
  if (!authResult.authorized) return authResult.response;

  try {
    const body = await request.json();
    const { name, logo_url, website_url, display_order, is_active } = body;

    if (!name || !logo_url) {
      return NextResponse.json({ error: 'Name and logo_url are required' }, { status: 400 });
    }

    const partnerInsert: PartnerInsert = {
      name,
      logo_url,
      website_url: website_url || null,
      display_order: Number(display_order) || 0,
      is_active: is_active !== false,
    };

    const { data: partner, error } = await partnersWriteBridge
      .from('partners')
      .insert(partnerInsert)
      .select(PARTNER_SELECT_COLUMNS)
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
