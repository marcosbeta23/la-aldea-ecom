// inngest/functions/review-request.tsx
import { inngest } from '@/lib/inngest';
import { supabaseAdmin } from '@/lib/supabase';
import { sendEmail } from '@/lib/email';
import { ReviewRequest } from '@/emails/ReviewRequest';
import { render } from '@react-email/components'; // ← fixed

export const reviewRequest = inngest.createFunction(
  { id: 'review-request', name: 'Review Request' },
  { event: 'order/status.changed' },
  async ({ event, step }) => {
    const { newStatus, customerEmail, orderId, customerName } = event.data;

    if (newStatus !== 'delivered' || !customerEmail) return;

    await step.sleep('wait-for-review-window', '7d');

    const order = await step.run('verify-order-status', async () => {
      type OrderWithItems = {
        status: string;
        order_items: { product_id: string; product_name: string }[];
      };
      const { data } = await supabaseAdmin
        .from('orders')
        .select('status, order_items(product_id, product_name)')
        .eq('id', orderId)
        .single();
      return data as OrderWithItems | null;
    });

    if (!order || order.status !== 'delivered') return;

    await step.run('send-review-request-email', async () => {
      const htmlContent = await render(
        ReviewRequest({
          orderId,
          customerName,
          items: order.order_items,
        })
      );

      return sendEmail({
        to: customerEmail,
        toName: customerName,
        subject: '¿Cómo resultó tu compra en La Aldea? 🌟',
        htmlContent,
      });
    });
  }
);