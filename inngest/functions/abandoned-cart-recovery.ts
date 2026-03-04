// inngest/functions/abandoned-cart-recovery.ts
// Event-driven abandoned cart recovery — replaces daily batch cron.
// Trigger: fired from /api/checkout-attempt when a checkout attempt is saved.
// Flow: sleep 2h → check if order placed → if not, send recovery email via Brevo.
// The daily cron at /api/cron/abandoned-carts remains as a safety net.

import { inngest } from '@/lib/inngest';
import { supabaseAdmin } from '@/lib/supabase';
import { render } from '@react-email/components';
import AbandonedCart from '@/emails/AbandonedCart';

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'no-reply@laaldeatala.com.uy';
const FROM_NAME = process.env.FROM_NAME || 'La Aldea';
const APP_URL = process.env.APP_URL || 'https://laaldeatala.com.uy';

export const abandonedCartRecovery = inngest.createFunction(
  {
    id: 'abandoned-cart-recovery',
    name: 'Abandoned Cart Recovery',
    retries: 3,
    // If the same email creates a new checkout attempt, cancel this run
    // (the new attempt triggers its own 2h timer)
    cancelOn: [
      {
        event: 'checkout/attempt.created',
        if: 'event.data.email == async.data.email',
      },
    ],
  },
  { event: 'checkout/attempt.created' },
  async ({ event, step }) => {
    // Step 1: Wait 2 hours
    await step.sleep('wait-2h-before-recovery', '2h');

    // Step 2: Check if customer completed purchase
    const shouldSendEmail = await step.run('check-if-order-placed', async () => {
      const { data: attempt } = await (supabaseAdmin as any)
        .from('checkout_attempts')
        .select('id, recovered, recovery_email_sent_at')
        .eq('id', event.data.attemptId)
        .single();

      // Already recovered or email already sent (e.g. by daily cron safety net)
      if (!attempt || attempt.recovered || attempt.recovery_email_sent_at) {
        return false;
      }

      // Check if a matching order was placed after the checkout attempt
      const { data: matchingOrder } = await (supabaseAdmin as any)
        .from('orders')
        .select('id')
        .eq('customer_email', event.data.email)
        .gte('created_at', new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString())
        .limit(1)
        .single();

      if (matchingOrder) {
        // Customer completed purchase — mark as recovered
        await (supabaseAdmin as any)
          .from('checkout_attempts')
          .update({
            recovered: true,
            order_id: matchingOrder.id,
          })
          .eq('id', event.data.attemptId);
        return false;
      }

      return true;
    });

    if (!shouldSendEmail) {
      return { status: 'skipped', reason: 'order placed or already processed' };
    }

    // Step 3: Send recovery email (retried independently by Inngest)
    const emailResult = await step.run('send-recovery-email', async () => {
      if (!BREVO_API_KEY) {
        throw new Error('BREVO_API_KEY not configured');
      }

      const items = event.data.items.map((item) => ({
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
      }));

      const htmlContent = await render(
        AbandonedCart({
          customerName: event.data.customerName || 'Cliente',
          items,
          subtotal: event.data.subtotal,
          currency: event.data.currency || 'UYU',
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
          to: [{ email: event.data.email, name: event.data.customerName || event.data.email }],
          subject: `${event.data.customerName || 'Hola'}, dejaste productos en tu carrito`,
          htmlContent,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(`Brevo API error: ${response.status} ${JSON.stringify(errData)}`);
      }

      // Mark email as sent in DB
      await (supabaseAdmin as any)
        .from('checkout_attempts')
        .update({ recovery_email_sent_at: new Date().toISOString() })
        .eq('id', event.data.attemptId);

      return { sent: true, email: event.data.email };
    });

    return { status: 'email_sent', ...emailResult };
  }
);
