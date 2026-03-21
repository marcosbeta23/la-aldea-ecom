// app/api/inngest/route.ts
// Inngest serve endpoint — registers all background functions
// Docs: https://www.inngest.com/docs/learn/serving-inngest-functions

import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest';
import { abandonedCartRecovery } from '@/inngest/functions/abandoned-cart-recovery';
import { orderConfirmation } from '@/inngest/functions/order-confirmation';
import { stockReservationExpiry } from '@/inngest/functions/stock-reservation-expiry';
import { orderStatusNotification } from '@/inngest/functions/order-status-notification';
import { lowStockAlert } from "@/inngest/functions/low-stock-alert";
import { reviewRequest } from "@/inngest/functions/review-request";
// Fix #5: Maintenance cron via Inngest (cryptographically signed, no CRON_SECRET header needed)
import { maintenanceCron } from '@/inngest/functions/maintenance';
import { generateEmbedding } from '@/inngest/functions/generate-embedding';
import { bankTransferReminder } from '@/inngest/functions/bank-transfer-reminder';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    abandonedCartRecovery,
    orderConfirmation,
    stockReservationExpiry,
    orderStatusNotification,
    maintenanceCron,
    lowStockAlert,
    reviewRequest,
    generateEmbedding,
    bankTransferReminder,
  ],
});

