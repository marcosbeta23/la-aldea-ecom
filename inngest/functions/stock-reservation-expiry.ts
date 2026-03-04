// inngest/functions/stock-reservation-expiry.ts
// Precise per-order stock release — replaces daily batch cron.
// Trigger: fired from MercadoPago webhook after stock is reserved.
// Flow: sleepUntil(reserved_until) → check if order was processed → release if still pending.
// The daily cron at /api/cron/release-stock remains as a safety net.

import { inngest } from '@/lib/inngest';
import { supabaseAdmin } from '@/lib/supabase';

export const stockReservationExpiry = inngest.createFunction(
  {
    id: 'stock-reservation-expiry',
    name: 'Stock Reservation Expiry',
    retries: 3,
  },
  { event: 'order/stock.reserved' },
  async ({ event, step }) => {
    const { orderId, orderNumber, reservedUntil } = event.data;

    // Step 1: Sleep until the reservation expires
    await step.sleepUntil('wait-until-reservation-expires', new Date(reservedUntil));

    // Step 2: Check order status and release if needed
    const result = await step.run('check-and-release-stock', async () => {
      const { data: order } = await supabaseAdmin
        .from('orders')
        .select('id, status, stock_reserved')
        .eq('id', orderId)
        .single() as { data: any };

      if (!order) {
        return { action: 'skipped', reason: 'order not found' };
      }

      // Don't release stock if order has progressed past paid status
      const processedStatuses = ['invoiced', 'processing', 'shipped', 'delivered'];
      if (processedStatuses.includes(order.status)) {
        return { action: 'skipped', reason: `order already ${order.status}` };
      }

      // Don't release if stock is not currently reserved
      if (!order.stock_reserved) {
        return { action: 'skipped', reason: 'stock not reserved' };
      }

      // Release stock using the existing RPC function
      const { data, error } = await supabaseAdmin.rpc('release_expired_reservations');

      if (error) {
        throw new Error(`Stock release RPC error: ${error.message}`);
      }

      return {
        action: 'released',
        orderNumber,
        releasedCount: data || 0,
      };
    });

    return result;
  }
);
