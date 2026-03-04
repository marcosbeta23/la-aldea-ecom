import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { render } from '@react-email/components';
import AbandonedCart from '@/emails/AbandonedCart';

// Abandoned cart recovery — detects and emails customers who left items in checkout
// Called by /api/cron/maintenance daily, or manually for testing
// Looks for checkout_attempts older than 2 hours with no matching order

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'no-reply@laaldeatala.com.uy';
const FROM_NAME = process.env.FROM_NAME || 'La Aldea';
const APP_URL = process.env.APP_URL || 'https://laaldeatala.com.uy';
const MAX_PER_RUN = 20;

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('🛒 Running abandoned cart recovery cron...');

  try {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

    // Find abandoned checkout attempts:
    // - Created more than 2 hours ago
    // - Not recovered
    // - No recovery email sent yet
    const { data: attempts, error: fetchError } = await (supabaseAdmin as any)
      .from('checkout_attempts')
      .select('*')
      .lt('created_at', twoHoursAgo)
      .eq('recovered', false)
      .is('recovery_email_sent_at', null)
      .order('created_at', { ascending: true })
      .limit(MAX_PER_RUN);

    if (fetchError) {
      console.error('Error fetching abandoned carts:', fetchError);
      return NextResponse.json({ success: false, error: fetchError.message }, { status: 500 });
    }

    if (!attempts || attempts.length === 0) {
      console.log('✅ No abandoned carts to process');
      return NextResponse.json({ success: true, processed: 0 });
    }

    console.log(`Found ${attempts.length} abandoned cart(s) to process`);

    let recovered = 0;
    let emailsSent = 0;

    for (const attempt of attempts) {
      // Check if a matching order was placed after the checkout attempt
      const { data: matchingOrder } = await (supabaseAdmin as any)
        .from('orders')
        .select('id')
        .eq('customer_email', attempt.email)
        .gte('created_at', attempt.created_at)
        .limit(1)
        .single();

      if (matchingOrder) {
        // Customer completed the purchase — mark as recovered
        await (supabaseAdmin as any)
          .from('checkout_attempts')
          .update({
            recovered: true,
            order_id: matchingOrder.id,
          })
          .eq('id', attempt.id);

        recovered++;
        continue;
      }

      // No matching order — send recovery email
      if (!BREVO_API_KEY) {
        console.warn('[AbandonedCart] BREVO_API_KEY not configured, skipping email');
        continue;
      }

      try {
        const items = (attempt.items as any[]).map((item: any) => ({
          product_name: item.product_name || item.name || 'Producto',
          quantity: item.quantity || 1,
          unit_price: item.unit_price || item.price || 0,
        }));

        const htmlContent = await render(
          AbandonedCart({
            customerName: attempt.customer_name || 'Cliente',
            items,
            subtotal: Number(attempt.subtotal),
            currency: attempt.currency || 'UYU',
            checkoutUrl: `${APP_URL}/checkout`,
          })
        );

        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            accept: 'application/json',
            'api-key': BREVO_API_KEY,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            sender: { name: FROM_NAME, email: FROM_EMAIL },
            to: [{ email: attempt.email, name: attempt.customer_name || attempt.email }],
            subject: `${attempt.customer_name || 'Hola'}, dejaste productos en tu carrito`,
            htmlContent,
          }),
        });

        if (response.ok) {
          await (supabaseAdmin as any)
            .from('checkout_attempts')
            .update({ recovery_email_sent_at: new Date().toISOString() })
            .eq('id', attempt.id);

          emailsSent++;
          console.log(`📧 Sent recovery email to ${attempt.email}`);
        } else {
          const errData = await response.json().catch(() => ({}));
          console.error(`Failed to send recovery email to ${attempt.email}:`, errData);
        }
      } catch (emailError) {
        console.error(`Error sending recovery email to ${attempt.email}:`, emailError);
      }
    }

    console.log(`✅ Abandoned cart cron complete: ${recovered} recovered, ${emailsSent} emails sent`);

    return NextResponse.json({
      success: true,
      processed: attempts.length,
      recovered,
      emailsSent,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Abandoned cart cron error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
