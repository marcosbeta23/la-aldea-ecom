// inngest/functions/review-request.tsx
// Sends a review request email 7 days after order is delivered

import { inngest } from '@/lib/inngest';
import { supabaseAdmin } from '@/lib/supabase';
import { sendEmail } from '@/lib/email';
import { ReviewRequest } from '@/emails/ReviewRequest';
import { render } from '@react-email/render';

export const reviewRequest = inngest.createFunction(
  { id: 'review-request', name: 'Review Request' },
  { event: 'order/status.changed' },
  async ({ event, step }) => {
    const { newStatus, customerEmail, orderId } = event.data;

    // Only trigger on delivered status
    if (newStatus !== 'delivered' || !customerEmail) return;

    // Wait 7 days
    await step.sleep('wait-for-review-window', '7d');

    // Check order is still delivered (not returned/cancelled)
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
      // Render the React email template to HTML
      const htmlContent = await render(<ReviewRequest orderId={orderId} />);
      await sendEmail({
        to: customerEmail,
        subject: '¿Cómo resultó tu compra en La Aldea? 🌟',
        htmlContent,
      });
    });
  }
);
