// app/api/inngest/route.ts
// Inngest serve endpoint — registers all background functions
// Docs: https://www.inngest.com/docs/learn/serving-inngest-functions

import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest';
import { abandonedCartRecovery } from '@/inngest/functions/abandoned-cart-recovery';
import { orderConfirmation } from '@/inngest/functions/order-confirmation';
import { stockReservationExpiry } from '@/inngest/functions/stock-reservation-expiry';
import { orderStatusNotification } from '@/inngest/functions/order-status-notification';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    abandonedCartRecovery,
    orderConfirmation,
    stockReservationExpiry,
    orderStatusNotification,
  ],
});
