// inngest/functions/order-confirmation.ts
// Sends all payment-approved notifications with retries per channel.
// Replaces inline fire-and-forget email/WhatsApp/Telegram in the webhook handler.
// Trigger: fired from MercadoPago webhook on payment approval.
// Each step retries independently (WhatsApp failure doesn't re-send email).

import { inngest } from '@/lib/inngest';
import { supabaseAdmin } from '@/lib/supabase';
import { sendOrderConfirmation, sendAdminOrderNotification } from '@/lib/email';
import { alertPaymentApproved } from '@/lib/telegram';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import { getPaymentReceivedMessage } from '@/lib/notifications';

export const orderConfirmation = inngest.createFunction(
  {
    id: 'order-confirmation',
    name: 'Order Confirmation Notifications',
    retries: 3,
  },
  { event: 'order/payment.approved' },
  async ({ event, step }) => {
    const { orderId, orderNumber, customerName, customerEmail, customerPhone, total, currency } = event.data;

    // Step 0: Fetch full order + items from DB (always use latest data)
    const { order, items } = await step.run('fetch-order-data', async () => {
      const { data: orderData } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single() as { data: any };

      const { data: orderItems } = await supabaseAdmin
        .from('order_items')
        .select('*')
        .eq('order_id', orderId) as { data: any[] | null };

      if (!orderData) {
        throw new Error(`Order ${orderId} not found`);
      }

      return { order: orderData, items: orderItems || [] };
    });

    const results: Record<string, unknown> = {};

    // Step 1: Send customer confirmation email
    if (customerEmail && items.length > 0) {
      results.customerEmail = await step.run('send-customer-email', async () => {
        const sent = await sendOrderConfirmation({ order, items });
        if (sent) {
          await (supabaseAdmin as any)
            .from('orders')
            .update({ confirmation_email_sent_at: new Date().toISOString() })
            .eq('id', orderId);
        }
        if (!sent) {
          throw new Error('Failed to send customer confirmation email');
        }
        return { sent: true };
      });
    }

    // Step 2: Send admin notification email
    if (items.length > 0) {
      results.adminEmail = await step.run('send-admin-email', async () => {
        const sent = await sendAdminOrderNotification({ order, items });
        if (sent) {
          await (supabaseAdmin as any)
            .from('orders')
            .update({ admin_notified_at: new Date().toISOString() })
            .eq('id', orderId);
        }
        if (!sent) {
          throw new Error('Failed to send admin notification email');
        }
        return { sent: true };
      });
    }

    // Step 3: Send Telegram alert
    results.telegram = await step.run('send-telegram-alert', async () => {
      await alertPaymentApproved(
        orderNumber,
        total,
        customerName,
        currency
      );
      return { sent: true };
    });

    // Step 4: Send WhatsApp message to customer
    if (customerPhone) {
      results.whatsapp = await step.run('send-whatsapp-message', async () => {
        const message = getPaymentReceivedMessage({ order });
        const result = await sendWhatsAppMessage(customerPhone, message);
        if (!result.success) {
          throw new Error(`WhatsApp failed: ${result.error}`);
        }
        return { sent: true, messageId: result.messageId };
      });
    }

    return { status: 'completed', results };
  }
);
