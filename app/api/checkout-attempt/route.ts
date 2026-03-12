import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { inngest } from '@/lib/inngest';
import { withMinDelay } from '@/lib/utils';

// POST /api/checkout-attempt
// Saves a checkout attempt for abandoned cart recovery.
// Fix #7: Always returns same response shape regardless of whether email is known.
// withMinDelay normalises response timing to prevent email enumeration via timing attacks.

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

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

        const { data: existing } = await (supabaseAdmin as any)
          .from('checkout_attempts')
          .select('id')
          .eq('email', attemptData.email)
          .gte('created_at', twoHoursAgo)
          .eq('recovered', false)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (existing) {
          await (supabaseAdmin as any)
            .from('checkout_attempts')
            .update({
              ...attemptData,
              created_at: new Date().toISOString(),
            })
            .eq('id', existing.id);
          attemptId = existing.id;
        } else {
          const { data: inserted } = await (supabaseAdmin as any)
            .from('checkout_attempts')
            .insert(attemptData)
            .select('id')
            .single();
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
          items: items.map((item: any) => ({
            product_name: item.product_name || item.name || 'Producto',
            quantity: item.quantity || 1,
            unit_price: item.unit_price || item.price || 0,
          })),
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
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
