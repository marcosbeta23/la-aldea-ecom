import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { DiscountCoupon } from '@/types/database';
import { ValidateCouponSchema } from '@/lib/validators';
import { couponsLimiter } from '@/lib/rate-limit';
import { couponsRatelimit, couponsGlobalRatelimit, getClientIp } from '@/lib/redis';

export async function POST(request: NextRequest) {
  // ⚡ RATE LIMITING — global check first (prevents enumeration via rotating IPs)
  const ip = getClientIp(request);

  // Fix #4 — Global rate limit: 100 total coupon checks/min across ALL IPs
  if (couponsGlobalRatelimit) {
    const { success } = await couponsGlobalRatelimit.limit('global');
    if (!success) {
      return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
    }
  }

  // Per-IP rate limit (existing: 10/min per IP)
  if (couponsRatelimit) {
    const { success } = await couponsRatelimit.limit(ip);
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again in a minute.' },
        { status: 429 }
      );
    }
  } else {
    try {
      await couponsLimiter.check(10, ip);
    } catch {
      return NextResponse.json(
        { error: 'Too many requests. Please try again in a minute.' },
        { status: 429 }
      );
    }
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
    const { data, error } = await supabaseAdmin
      .from('discount_coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single() as { data: any; error: any };

    if (error || !data) {
      // Fix #4 — Always return same message for invalid/non-existent codes (prevents enumeration)
      return NextResponse.json(
        { valid: false, error: 'Código no válido o expirado.' },
        { status: 200 }
      );
    }

    const coupon = data as DiscountCoupon;

    // Check expiration
    if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
      // Fix #4 — Uniform error message (don't reveal whether code exists vs expired)
      return NextResponse.json(
        { valid: false, error: 'Código no válido o expirado.' },
        { status: 200 }
      );
    }

    // Check usage limit
    if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
      // Fix #4 — Uniform error message
      return NextResponse.json(
        { valid: false, error: 'Código no válido o expirado.' },
        { status: 200 }
      );
    }

    // Check minimum purchase
    if (coupon.min_purchase_amount && subtotal < coupon.min_purchase_amount) {
      return NextResponse.json(
        { error: `Compra mínima: $${coupon.min_purchase_amount.toLocaleString()}` },
        { status: 400 }
      );
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      discountAmount = (subtotal * coupon.discount_value) / 100;
    } else {
      // Fixed discount
      discountAmount = Math.min(coupon.discount_value, subtotal);
    }

    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
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
