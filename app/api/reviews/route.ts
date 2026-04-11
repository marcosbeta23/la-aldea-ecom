import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { CreateReviewSchema } from '@/lib/validators';
import rateLimit from '@/lib/rate-limit';
import { reviewsRatelimit, getClientIp } from '@/lib/redis';
import sanitizeHtml from 'sanitize-html';

const reviewsDevLimiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
});

type PublicReview = {
  id: string;
  customer_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

type ProductReviewsWriteTable = {
  insert: (values: {
    product_id: string;
    customer_name: string;
    customer_email: string | null;
    rating: number;
    comment: string | null;
    is_approved: boolean;
  }) => Promise<{ error: unknown }>;
};

const productReviewsWriteTable = supabaseAdmin.from('product_reviews') as unknown as ProductReviewsWriteTable;

// Strip ALL HTML — reviews are plain text only (Fix #2: XSS prevention)
function sanitizeText(input: string | undefined | null): string | null {
  if (!input) return null;
  return sanitizeHtml(input, { allowedTags: [], allowedAttributes: {} }).trim() || null;
}

// POST - Submit a new review
export async function POST(request: NextRequest) {
  // ⚡ RATE LIMITING - Max 3 reviews per minute per IP
  const ip = getClientIp(request);

  if (reviewsRatelimit) {
    try {
      const { success } = await reviewsRatelimit.limit(ip);
      if (!success) {
        return NextResponse.json(
          { error: 'Too many reviews submitted. Please try again in a minute.' },
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
      await reviewsDevLimiter.check(3, ip);
    } catch {
      return NextResponse.json(
        { error: 'Too many reviews submitted. Please try again in a minute.' },
        { status: 429 }
      );
    }
  } else {
    console.error('reviewsRatelimit unavailable in production');
    return NextResponse.json(
      { error: 'Service temporarily unavailable.' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();

    // Fix #2 — Honeypot: if the 'website' field is filled, silently accept and discard
    // Bots fill attractive-sounding fields; real users never see this hidden field.
    if (body.website) {
      return NextResponse.json({ success: true, message: 'Review submitted.' });
    }

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

    // Fix #2 — Email-based rate limit (in addition to IP rate limit)
    if (customer_email && reviewsRatelimit) {
      try {
        const { success } = await reviewsRatelimit.limit(`review:email:${customer_email.toLowerCase()}`);
        if (!success) {
          return NextResponse.json(
            { error: 'Demasiadas reseñas desde este email. Intentá más tarde.' },
            { status: 429 }
          );
        }
      } catch {
        return NextResponse.json(
          { error: 'Service temporarily unavailable.' },
          { status: 503 }
        );
      }
    }

    // Fix #2 — Sanitize all user content to prevent stored XSS
    const safeComment = sanitizeText(comment);
    const safeName = sanitizeText(customer_name) ?? customer_name; // name is required, keep original if sanitize returns null

    // Insert review (not approved by default)
    const { error } = await productReviewsWriteTable.insert({
      product_id,
      customer_name: safeName,
      customer_email: customer_email || null,
      rating,
      comment: safeComment,
      is_approved: false, // Requires admin approval
    });

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
      .select('id, customer_name, rating, comment, created_at')
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

    return NextResponse.json({ reviews: (reviews || []) as PublicReview[] });
  } catch (error) {
    console.error('Reviews API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
