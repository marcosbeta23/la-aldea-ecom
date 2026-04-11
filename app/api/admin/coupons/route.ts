import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { Database } from '@/types/database';

type CouponRow = Database['public']['Tables']['discount_coupons']['Row'];
type CouponInsert = Database['public']['Tables']['discount_coupons']['Insert'];

const COUPON_SELECT_COLUMNS =
  'id, code, description, discount_type, discount_value, min_purchase_amount, max_uses, current_uses, valid_from, valid_until, is_active, created_at, updated_at';

type CouponWriteResponse = {
  data: CouponRow | null;
  error: { code?: string; message: string } | null;
};

const couponsWriteBridge = supabaseAdmin as unknown as {
  from: (table: 'discount_coupons') => {
    insert: (values: CouponInsert) => {
      select: (columns: string) => {
        single: () => Promise<CouponWriteResponse>;
      };
    };
  };
};

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
    .select(COUPON_SELECT_COLUMNS)
    .order('created_at', { ascending: false })
    .returns<CouponRow[]>();

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
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 });
    }

    const couponInsert: CouponInsert = {
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
    };

    const { data: coupon, error } = await couponsWriteBridge
      .from('discount_coupons')
      .insert(couponInsert)
      .select(COUPON_SELECT_COLUMNS)
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
