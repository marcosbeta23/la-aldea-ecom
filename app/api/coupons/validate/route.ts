import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { DiscountCoupon } from '@/types/database';
import { ValidateCouponSchema } from '@/lib/validators';
import rateLimit from '@/lib/rate-limit';
import { couponsRatelimit, couponsGlobalRatelimit, getClientIp } from '@/lib/redis';

type CouponLookup = Pick<
  DiscountCoupon,
  'code' | 'discount_type' | 'discount_value' | 'min_purchase_amount' | 'valid_until' | 'max_uses' | 'current_uses'
>;

const couponsDevLimiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
});

export async function POST(request: NextRequest) {
  // ⚡ RATE LIMITING — global check first (prevents enumeration via rotating IPs)
  const ip = getClientIp(request);

  // Fix #4 — Global rate limit: 100 total coupon checks/min across ALL IPs
  if (couponsGlobalRatelimit) {
    try {
      const { success } = await couponsGlobalRatelimit.limit('global');
      if (!success) {
        return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
      }
    } catch {
      return NextResponse.json({ error: 'Service temporarily unavailable.' }, { status: 503 });
    }
  } else if (process.env.NODE_ENV === 'production') {
    console.error('couponsGlobalRatelimit unavailable in production');
    return NextResponse.json({ error: 'Service temporarily unavailable.' }, { status: 503 });
  }

  // Per-IP rate limit (existing: 10/min per IP)
  if (couponsRatelimit) {
    try {
      const { success } = await couponsRatelimit.limit(ip);
      if (!success) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again in a minute.' },
          { status: 429 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: 'Service temporarily unavailable.' },
        { status: 503 }
      );
    }
  } else if (process.env.NODE_ENV !== 'production') {
    try {
      await couponsDevLimiter.check(10, ip);
    } catch {
      return NextResponse.json(
        { error: 'Too many requests. Please try again in a minute.' },
        { status: 429 }
      );
    }
  } else {
    console.error('couponsRatelimit unavailable in production');
    return NextResponse.json({ error: 'Service temporarily unavailable.' }, { status: 503 });
  }
  
  try {
    const body = await request.json();
    
    // Validate with Zod
    const validation = ValidateCouponSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validation.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }
    
    const { code, subtotal } = validation.data;

    // Fetch coupon
    const { data: coupon, error } = await supabaseAdmin
      .from('discount_coupons')
      .select('code, discount_type, discount_value, min_purchase_amount, valid_until, max_uses, current_uses')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error || !coupon) {
      // Fix #4 — Always return same message for invalid/non-existent codes (prevents enumeration)
      return NextResponse.json(
        { valid: false, error: 'Código no válido o expirado.' },
        { status: 200 }
      );
    }

    const typedCoupon = coupon as CouponLookup;

    // Check expiration
    if (typedCoupon.valid_until && new Date(typedCoupon.valid_until) < new Date()) {
      // Fix #4 — Uniform error message (don't reveal whether code exists vs expired)
      return NextResponse.json(
        { valid: false, error: 'Código no válido o expirado.' },
        { status: 200 }
      );
    }

    // Check usage limit
    const currentUses = typedCoupon.current_uses ?? 0;
    if (typedCoupon.max_uses !== null && currentUses >= typedCoupon.max_uses) {
      // Fix #4 — Uniform error message
      return NextResponse.json(
        { valid: false, error: 'Código no válido o expirado.' },
        { status: 200 }
      );
    }

    // Check minimum purchase
    if (typedCoupon.min_purchase_amount !== null && subtotal < typedCoupon.min_purchase_amount) {
      return NextResponse.json(
        { error: `Compra mínima: $${typedCoupon.min_purchase_amount.toLocaleString()}` },
        { status: 400 }
      );
    }

    // Calculate discount
    let discountAmount = 0;
    if (typedCoupon.discount_type === 'percentage') {
      discountAmount = (subtotal * typedCoupon.discount_value) / 100;
    } else {
      // Fixed discount
      discountAmount = Math.min(typedCoupon.discount_value, subtotal);
    }

    return NextResponse.json({
      success: true,
      coupon: {
        code: typedCoupon.code,
        discount_type: typedCoupon.discount_type,
        discount_value: typedCoupon.discount_value,
        discount_amount: Math.round(discountAmount),
      },
    });
  } catch (error) {
    console.error('Coupon validation error:', error);
    return NextResponse.json(
      { error: 'Error al validar el cupón' },
      { status: 500 }
    );
  }
}
