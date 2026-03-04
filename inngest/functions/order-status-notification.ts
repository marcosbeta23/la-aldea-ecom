// inngest/functions/order-status-notification.ts
// Sends notifications when admin changes order status, with retries per channel.
// Replaces inline fire-and-forget WhatsApp + Telegram in admin order update route.
// Trigger: fired from admin PATCH /api/admin/orders/[id] on status change.
// Each notification channel is a separate step for independent retries.

import { inngest } from '@/lib/inngest';
import { supabaseAdmin } from '@/lib/supabase';
import { sendOrderStatusUpdate } from '@/lib/email';
import { alertOrderStatusChanged } from '@/lib/telegram';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import {
  getPaymentReceivedMessage,
  getAwaitingStockMessage,
  getReadyToInvoiceMessage,
  getInvoiceGeneratedMessage,
  getOrderShippedMessage,
  getRefundCompletedMessage,
  type NotificationContext,
} from '@/lib/notifications';

// Statuses that trigger customer WhatsApp notifications
const WHATSAPP_STATUSES = ['paid', 'awaiting_stock', 'ready_to_invoice', 'invoiced', 'shipped', 'refunded'];
// Statuses that trigger admin Telegram alerts
const TELEGRAM_STATUSES = ['shipped', 'delivered', 'cancelled', 'invoiced', 'processing', 'paid'];
// Statuses that trigger customer email notifications
const EMAIL_STATUSES = ['paid', 'processing', 'shipped', 'delivered', 'refunded'];

function getWhatsAppMessageForStatus(ctx: NotificationContext, status: string): string | null {
  switch (status) {
    case 'paid': return getPaymentReceivedMessage(ctx);
    case 'awaiting_stock': return getAwaitingStockMessage(ctx);
    case 'ready_to_invoice': return getReadyToInvoiceMessage(ctx);
    case 'invoiced': return getInvoiceGeneratedMessage(ctx);
    case 'shipped': return getOrderShippedMessage(ctx);
    case 'refunded': return getRefundCompletedMessage(ctx);
    default: return null;
  }
}

export const orderStatusNotification = inngest.createFunction(
  {
    id: 'order-status-notification',
    name: 'Order Status Notification',
    retries: 3,
  },
  { event: 'order/status.changed' },
  async ({ event, step }) => {
    const { orderId, orderNumber, oldStatus, newStatus, customerName, customerEmail, customerPhone } = event.data;

    // Step 0: Fetch latest order data
    const order = await step.run('fetch-order', async () => {
      const { data } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single() as { data: any };

      if (!data) {
        throw new Error(`Order ${orderId} not found`);
      }
      return data;
    });

    const results: Record<string, unknown> = {};

    // Step 1: Send customer status email
    if (customerEmail && EMAIL_STATUSES.includes(newStatus)) {
      results.email = await step.run('send-status-email', async () => {
        const sent = await sendOrderStatusUpdate(order, newStatus);
        if (!sent) {
          throw new Error(`Failed to send status email for ${newStatus}`);
        }
        return { sent: true };
      });
    }

    // Step 2: Send WhatsApp notification
    if (customerPhone && WHATSAPP_STATUSES.includes(newStatus)) {
      results.whatsapp = await step.run('send-whatsapp', async () => {
        const ctx: NotificationContext = { order };
        const message = getWhatsAppMessageForStatus(ctx, newStatus);
        if (!message) {
          return { sent: false, reason: 'no template for status' };
        }

        const result = await sendWhatsAppMessage(customerPhone, message);

        // Log notification attempt (preserving existing behavior)
        await (supabaseAdmin as any)
          .from('order_logs')
          .insert({
            order_id: orderId,
            action: result.success ? 'whatsapp_sent' : 'whatsapp_failed',
            details: {
              status: newStatus,
              channel: 'whatsapp',
              whatsapp_sent: result.success,
              whatsapp_message_id: result.success ? result.messageId : undefined,
              whatsapp_error: result.success ? undefined : result.error,
              source: 'inngest',
            },
            created_by: 'system',
          });

        if (!result.success) {
          throw new Error(`WhatsApp failed: ${result.error}`);
        }
        return { sent: true, messageId: result.messageId };
      });
    }

    // Step 3: Send Telegram admin alert
    if (TELEGRAM_STATUSES.includes(newStatus) && oldStatus !== newStatus) {
      results.telegram = await step.run('send-telegram', async () => {
        await alertOrderStatusChanged(
          orderNumber,
          oldStatus,
          newStatus,
          customerName
        );
        return { sent: true };
      });
    }

    return { status: 'completed', results };
  }
);
