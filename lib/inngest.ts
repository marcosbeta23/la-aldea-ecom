// lib/inngest.ts
// Inngest client + typed event definitions for La Aldea e-commerce
// Docs: https://www.inngest.com/docs

import { EventSchemas, Inngest } from 'inngest';

// =====================================================
// EVENT TYPE DEFINITIONS
// =====================================================

type Events = {
  // Fired from /api/checkout-attempt when a checkout attempt is saved
  'checkout/attempt.created': {
    data: {
      attemptId: string;
      email: string;
      customerName: string | null;
      phone: string | null;
      items: Array<{
        product_name: string;
        quantity: number;
        unit_price: number;
      }>;
      subtotal: number;
      currency: string;
    };
  };

  // Fired from MercadoPago webhook on payment approval
  'order/payment.approved': {
    data: {
      orderId: string;
      orderNumber: string;
      customerName: string;
      customerEmail: string | null;
      customerPhone: string | null;
      total: number;
      currency: string;
      paymentId: string;
      status: string;
      stockReserved: boolean;
    };
  };

  // Fired from MercadoPago webhook after stock is reserved
  'order/stock.reserved': {
    data: {
      orderId: string;
      orderNumber: string;
      reservedUntil: string; // ISO timestamp
    };
  };

  // Fired from admin PATCH /api/admin/orders/[id] on status change
  'order/status.changed': {
    data: {
      orderId: string;
      orderNumber: string;
      oldStatus: string;
      newStatus: string;
      customerName: string;
      customerEmail: string | null;
      customerPhone: string | null;
      total: number;
      currency: string;
    };
  };
};

// =====================================================
// INNGEST CLIENT
// =====================================================

export const inngest = new Inngest({
  id: 'la-aldea-ecom',
  schemas: new EventSchemas().fromRecord<Events>(),
});
