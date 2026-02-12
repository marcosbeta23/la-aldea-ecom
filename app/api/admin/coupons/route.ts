import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

// Verify admin authentication via Clerk
async function verifyAdmin() {
  const { userId } = await auth();
  return !!userId;
}

// GET all coupons
export async function GET() {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: coupons, error } = await supabaseAdmin
    .from('discount_coupons')
    .select('*')
    .order('created_at', { ascending: false }) as { data: any[] | null; error: any };

  if (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
  }

  return NextResponse.json({ coupons });
}

// POST create new coupon
export async function POST(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    const { code, description, discount_type, discount_value, min_purchase_amount, max_uses, valid_from, valid_until, is_active } = body;

    // Validate required fields
    if (!code || !discount_type || !discount_value) {
      return NextResponse.json({ error: 'Code, discount_type, and discount_value are required' }, { status: 400 });
    }

    // Check if code already exists
    const { data: existing } = await supabaseAdmin
      .from('discount_coupons')
      .select('id')
      .eq('code', code.toUpperCase())
      .single() as { data: { id: string } | null };

    if (existing) {
      return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 });
    }

    const { data: coupon, error } = await (supabaseAdmin as any)
      .from('discount_coupons')
      .insert({
        code: code.toUpperCase(),
        description: description || null,
        discount_type,
        discount_value: Number(discount_value),
        min_purchase_amount: Number(min_purchase_amount) || 0,
        max_uses: max_uses ? Number(max_uses) : null,
        current_uses: 0,
        valid_from: valid_from || new Date().toISOString(),
        valid_until: valid_until || null,
        is_active: is_active !== false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating coupon:', error);
      return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 });
    }

    return NextResponse.json({ coupon }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
