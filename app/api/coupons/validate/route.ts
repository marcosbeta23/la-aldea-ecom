import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { DiscountCoupon } from '@/types/database';
import { ValidateCouponSchema } from '@/lib/validators';
import { couponsLimiter } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  // ⚡ RATE LIMITING - Max 10 validations per minute per IP
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() ?? request.headers.get('x-real-ip') ?? 'anonymous';
  
  try {
    await couponsLimiter.check(10, ip);
  } catch {
    return NextResponse.json(
      { error: 'Too many requests. Please try again in a minute.' },
      { status: 429 }
    );
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
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Cupón no válido' },
        { status: 404 }
      );
    }

    const coupon = data as DiscountCoupon;

    // Check expiration
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Este cupón ha expirado' },
        { status: 400 }
      );
    }

    // Check usage limit
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return NextResponse.json(
        { error: 'Este cupón ya alcanzó su límite de uso' },
        { status: 400 }
      );
    }

    // Check minimum purchase
    if (coupon.minimum_purchase && subtotal < coupon.minimum_purchase) {
      return NextResponse.json(
        { error: `Compra mínima: $${coupon.minimum_purchase.toLocaleString()}` },
        { status: 400 }
      );
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      discountAmount = (subtotal * coupon.discount_value) / 100;
      // Apply max discount if set
      if (coupon.max_discount && discountAmount > coupon.max_discount) {
        discountAmount = coupon.max_discount;
      }
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
