// inngest/functions/maintenance.ts
// Fix #5: Migrate daily maintenance cron to Inngest scheduled function.
// Inngest functions are cryptographically signed by Inngest's servers — no shared secret needed.
// This replaces the /api/cron/maintenance secret-header approach.

import { inngest } from '@/lib/inngest';
import { supabaseAdmin } from '@/lib/supabase';

export const maintenanceCron = inngest.createFunction(
  { id: 'daily-maintenance', name: 'Daily Maintenance' },
  { cron: 'TZ=America/Montevideo 0 3 * * *' }, // 3am UY time daily
  async ({ step }) => {
    // Step 1: Release expired stock reservations
    const releaseResult = await step.run('release-expired-reservations', async () => {
      try {
        const { error } = await (supabaseAdmin as any).rpc('release_expired_reservations');
        if (error) {
          // Function may not exist if using column-based approach — log and continue
          console.warn('[Maintenance] release_expired_reservations RPC:', error.message);
          return { skipped: true, reason: error.message };
        }
        return { success: true };
      } catch (err: any) {
        console.warn('[Maintenance] release_expired_reservations failed:', err.message);
        return { skipped: true, reason: err.message };
      }
    });

    // Step 2: Cancel stale pending MercadoPago orders (older than 2 hours)
    // Prevents ghost MP orders from polluting the dashboard
    const cancelMpResult = await step.run('cancel-stale-mp-orders', async () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      const { data: cancelled, error } = await (supabaseAdmin as any)
        .from('orders')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('payment_method', 'mercadopago')
        .eq('status', 'pending')
        .lt('created_at', twoHoursAgo)
        .select('id, order_number');

      if (error) throw new Error(error.message);
      const count = cancelled?.length ?? 0;
      console.log(`[Maintenance] Cancelled ${count} stale MP pending orders`);
      return { cancelled: count };
    });

    // Step 3: Cancel very old pending transfer orders (older than 48h)
    const cancelTransferResult = await step.run('cancel-stale-transfer-orders', async () => {
      const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
      const { data: cancelled, error } = await (supabaseAdmin as any)
        .from('orders')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('payment_method', 'transfer')
        .eq('status', 'pending')
        .lt('created_at', fortyEightHoursAgo)
        .select('id, order_number');

      if (error) throw new Error(error.message);
      const count = cancelled?.length ?? 0;
      console.log(`[Maintenance] Cancelled ${count} stale transfer orders (48h+)`);
      return { cancelled: count };
    });

    return {
      ran_at: new Date().toISOString(),
      releaseResult,
      cancelMpResult,
      cancelTransferResult,
    };
  }
);
