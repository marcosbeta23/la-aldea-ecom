import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { inngest } from '@/lib/inngest';
import { withMinDelay } from '@/lib/utils';

// POST /api/checkout-attempt
// Saves a checkout attempt for abandoned cart recovery.
// Fix #7: Always returns same response shape regardless of whether email is known.
// withMinDelay normalises response timing to prevent email enumeration via timing attacks.

type CheckoutAttemptPayload = {
  email: string;
  phone?: string | null;
  customer_name?: string | null;
  items: unknown[];
  subtotal: number;
  currency?: string | null;
};

type NormalizedCheckoutItem = {
  product_name: string;
  quantity: number;
  unit_price: number;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Unknown error';
}

function normalizeCheckoutItems(items: unknown[]): NormalizedCheckoutItem[] {
  return items.map((item) => {
    const raw = typeof item === 'object' && item !== null
      ? (item as Record<string, unknown>)
      : {};

    const name = raw.product_name ?? raw.name;
    const quantity = raw.quantity;
    const unitPrice = raw.unit_price ?? raw.price;

    return {
      product_name: typeof name === 'string' && name.trim() ? name : 'Producto',
      quantity: typeof quantity === 'number' && Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
      unit_price: typeof unitPrice === 'number' && Number.isFinite(unitPrice) ? unitPrice : 0,
    };
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<CheckoutAttemptPayload>;

    const { email, phone, customer_name, items, subtotal, currency } = body;

    if (!email || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Email and items are required' },
        { status: 400 }
      );
    }

    if (!subtotal || typeof subtotal !== 'number') {
      return NextResponse.json(
        { error: 'Valid subtotal is required' },
        { status: 400 }
      );
    }

    const normalizedItems = normalizeCheckoutItems(items);

    const attemptData = {
      email: email.toLowerCase().trim(),
      phone: phone || null,
      customer_name: customer_name || null,
      items,
      subtotal,
      currency: currency || 'UYU',
    };

    // Fix #7: Always upsert — never reveal whether email exists via different code paths.
    // withMinDelay normalises wall-clock time regardless of DB hit/miss speed.
    let attemptId: string | undefined;

    await withMinDelay(
      (async () => {
        // Check for an existing attempt from this email within the last 2 hours
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

        const { data: existing, error: existingError } = await supabaseAdmin
          .from('checkout_attempts')
          .select('id')
          .eq('email', attemptData.email)
          .gte('created_at', twoHoursAgo)
          .eq('recovered', false)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (existingError) {
          throw new Error(existingError.message);
        }

        if (existing) {
          const { error: updateError } = await supabaseAdmin
            .from('checkout_attempts')
            .update({
              ...attemptData,
              created_at: new Date().toISOString(),
            })
            .eq('id', existing.id);

          if (updateError) {
            throw new Error(updateError.message);
          }

          attemptId = existing.id;
        } else {
          const { data: inserted, error: insertError } = await supabaseAdmin
            .from('checkout_attempts')
            .insert(attemptData)
            .select('id')
            .single();

          if (insertError) {
            throw new Error(insertError.message);
          }

          attemptId = inserted?.id;
        }
      })(),
      300 // minimum 300ms response time
    );

    // Fire Inngest event for abandoned cart recovery (non-blocking)
    if (attemptId) {
      inngest.send({
        name: 'checkout/attempt.created',
        data: {
          attemptId,
          email: attemptData.email,
          customerName: attemptData.customer_name,
          phone: attemptData.phone,
          items: normalizedItems,
          subtotal,
          currency: currency || 'UYU',
        },
      }).catch((err) => {
        console.error('[Inngest] Failed to send checkout/attempt.created:', err);
      });
    }

    // Fix #7: Always return success — same shape regardless of whether email existed
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Checkout attempt error:', error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
