import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';

// Verify admin authentication
async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  const secret = process.env.ADMIN_SESSION_SECRET;
  return token && secret && token === secret;
}

// GET single coupon
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const { data: coupon, error } = await supabaseAdmin
    .from('discount_coupons')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !coupon) {
    return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
  }

  return NextResponse.json({ coupon });
}

// PATCH update coupon
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
    
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    // Only update provided fields
    if (body.code !== undefined) updateData.code = body.code.toUpperCase();
    if (body.description !== undefined) updateData.description = body.description;
    if (body.discount_type !== undefined) updateData.discount_type = body.discount_type;
    if (body.discount_value !== undefined) updateData.discount_value = Number(body.discount_value);
    if (body.min_purchase_amount !== undefined) updateData.min_purchase_amount = Number(body.min_purchase_amount);
    if (body.max_uses !== undefined) updateData.max_uses = body.max_uses ? Number(body.max_uses) : null;
    if (body.valid_from !== undefined) updateData.valid_from = body.valid_from;
    if (body.valid_until !== undefined) updateData.valid_until = body.valid_until;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;

    const { data: coupon, error } = await supabaseAdmin
      .from('discount_coupons')
      // @ts-expect-error - Supabase type inference issue
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating coupon:', error);
      return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 });
    }

    return NextResponse.json({ coupon });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

// DELETE coupon
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const { error } = await supabaseAdmin
    .from('discount_coupons')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
