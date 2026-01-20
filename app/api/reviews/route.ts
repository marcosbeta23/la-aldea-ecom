import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ProductReview } from '@/types/database';
import { CreateReviewSchema } from '@/lib/validators';
import { reviewsLimiter } from '@/lib/rate-limit';

// POST - Submit a new review
export async function POST(request: NextRequest) {
  // ⚡ RATE LIMITING - Max 3 reviews per minute per IP
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() ?? request.headers.get('x-real-ip') ?? 'anonymous';
  
  try {
    await reviewsLimiter.check(3, ip);
  } catch {
    return NextResponse.json(
      { error: 'Too many reviews submitted. Please try again in a minute.' },
      { status: 429 }
    );
  }
  
  try {
    const body = await request.json();
    
    // Validate with Zod
    const validation = CreateReviewSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validation.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }
    
    const { product_id, customer_name, customer_email, rating, comment } = validation.data;

    // Insert review (not approved by default)
    const { data: review, error } = await supabaseAdmin
      .from('product_reviews')
      .insert({
        product_id,
        customer_name,
        customer_email: customer_email || null,
        rating,
        comment: comment || null,
        is_approved: false, // Requires admin approval
      } as any)
      .select()
      .single();

    if (error) {
      console.error('Error creating review:', error);
      return NextResponse.json(
        { error: 'Failed to submit review' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully. It will be published after approval.',
      review,
    });
  } catch (error) {
    console.error('Reviews API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Fetch reviews for a product
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product_id');

    if (!productId) {
      return NextResponse.json(
        { error: 'Missing product_id parameter' },
        { status: 400 }
      );
    }

    const { data: reviews, error } = await supabaseAdmin
      .from('product_reviews')
      .select('*')
      .eq('product_id', productId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      return NextResponse.json(
        { error: 'Failed to fetch reviews' },
        { status: 500 }
      );
    }

    return NextResponse.json({ reviews: reviews || [] });
  } catch (error) {
    console.error('Reviews API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
