// inngest/functions/low-stock-alert.ts
// Sends Telegram alert if any product in an order is low on stock after purchase

import { inngest } from '@/lib/inngest';
import { supabaseAdmin } from '@/lib/supabase';
import { sendTelegramAlert } from '@/lib/telegram';

export const lowStockAlert = inngest.createFunction(
  { id: 'low-stock-alert', name: 'Low Stock Alert' },
  { event: 'order/payment.approved' },
  async ({ event, step }) => {
    const { orderId } = event.data;

    // Step 1: Find low-stock items in the order
    const lowStockItems = await step.run('check-stock-levels', async () => {
      // Explicitly type the join result to avoid TS 'never' error
      type JoinedOrderItem = {
        product_id: string;
        quantity: number;
        products: { name: string; stock: number } | null;
      };
      const { data: items } = await supabaseAdmin
        .from('order_items')
        .select('product_id, quantity, products(name, stock)')
        .eq('order_id', orderId);

      return (
        (items as JoinedOrderItem[] | null)?.filter(item => {
          const product = item.products;
          return product && typeof product.stock === 'number' && product.stock <= 3;
        }) || []
      );
    });

    if (!lowStockItems || lowStockItems.length === 0) return;

    // Step 2: Send Telegram alerts for each low-stock product
    await step.run('send-telegram-alerts', async () => {
      for (const item of lowStockItems) {
        const product = item.products as any;
        await sendTelegramAlert(
          `⚠️ *Stock bajo* — ${product.name}\n` +
          `Stock actual: *${product.stock} unidades*\n` +
          `Pedido: #${orderId.slice(-6).toUpperCase()}`
        );
      }
    });
  }
);
