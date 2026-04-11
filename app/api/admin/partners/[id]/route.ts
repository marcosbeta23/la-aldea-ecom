import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { Database } from '@/types/database';

type PartnerRow = Database['public']['Tables']['partners']['Row'];
type PartnerUpdate = Database['public']['Tables']['partners']['Update'];

const PARTNER_SELECT_COLUMNS =
  'id, name, logo_url, website_url, display_order, is_active, created_at, updated_at';

type PartnerUpdateResponse = {
  data: PartnerRow | null;
  error: { message: string } | null;
};

const partnersUpdateBridge = supabaseAdmin as unknown as {
  from: (table: 'partners') => {
    update: (values: PartnerUpdate) => {
      eq: (column: 'id', value: string) => {
        select: (columns: string) => {
          single: () => Promise<PartnerUpdateResponse>;
        };
      };
    };
  };
};

async function verifyAdmin() {
  const { userId } = await auth();
  return !!userId;
}

// GET single partner
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const { data: partner, error } = await supabaseAdmin
    .from('partners')
    .select(PARTNER_SELECT_COLUMNS)
    .eq('id', id)
    .single<PartnerRow>();

  if (error || !partner) {
    return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
  }

  return NextResponse.json({ partner });
}

// PATCH update partner
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
    const updateData: PartnerUpdate = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.logo_url !== undefined) updateData.logo_url = body.logo_url;
    if (body.website_url !== undefined) updateData.website_url = body.website_url;
    if (body.display_order !== undefined) updateData.display_order = Number(body.display_order);
    if (body.is_active !== undefined) updateData.is_active = body.is_active;

    const { data: partner, error } = await partnersUpdateBridge
      .from('partners')
      .update(updateData)
      .eq('id', id)
      .select(PARTNER_SELECT_COLUMNS)
      .single();

    if (error) {
      console.error('Error updating partner:', error);
      return NextResponse.json({ error: 'Failed to update partner' }, { status: 500 });
    }

    return NextResponse.json({ partner });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

// DELETE partner
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const { error } = await supabaseAdmin
    .from('partners')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting partner:', error);
    return NextResponse.json({ error: 'Failed to delete partner' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
