// lib/email.ts
// Email service using Brevo (Sendinblue) + React Email templates
// Docs: https://developers.brevo.com/docs/send-a-transactional-email

import type { Order, OrderItem } from '@/types/database';
import { render } from '@react-email/components';
import OrderConfirmation from '@/emails/OrderConfirmation';
import AdminNotification from '@/emails/AdminNotification';
import StatusUpdate from '@/emails/StatusUpdate';
import InvoiceEmail from '@/emails/InvoiceEmail';

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'no-reply@laaldeatala.com.uy';
const FROM_NAME = process.env.FROM_NAME || 'La Aldea';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'info@laaldeatala.com.uy';

interface SendEmailParams {
  to: string;
  toName?: string;
  subject: string;
  htmlContent: string;
}

interface SendOrderConfirmationParams {
  order: Order;
  items: OrderItem[];
}

// =====================================================
// CORE EMAIL SENDER
// =====================================================

async function sendEmail({ to, toName, subject, htmlContent }: SendEmailParams): Promise<boolean> {
  if (!BREVO_API_KEY) {
    console.warn('[Email] BREVO_API_KEY not configured, skipping email');
    return false;
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: FROM_NAME, email: FROM_EMAIL },
        to: [{ email: to, name: toName || to }],
        subject,
        htmlContent,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[Email] Failed to send:', error);
      return false;
    }

    console.log(`[Email] Sent to ${to}: "${subject}"`);
    return true;
  } catch (error) {
    console.error('[Email] Error sending:', error);
    return false;
  }
}

// =====================================================
// HELPERS
// =====================================================

function formatPrice(price: number): string {
  return `UYU ${price.toLocaleString('es-UY', { maximumFractionDigits: 0 })}`;
}

// =====================================================
// ORDER CONFIRMATION EMAIL (TO CUSTOMER)
// =====================================================

export async function sendOrderConfirmation({ order, items }: SendOrderConfirmationParams): Promise<boolean> {
  if (!order.customer_email) {
    console.warn('[Email] No customer email for order', order.order_number);
    return false;
  }

  const htmlContent = await render(OrderConfirmation({
    orderNumber: order.order_number,
    createdAt: order.created_at,
    status: order.status,
    customerName: order.customer_name,
    customerEmail: order.customer_email,
    customerPhone: order.customer_phone || undefined,
    shippingAddress: order.shipping_address || undefined,
    items: items.map(i => ({
      product_name: i.product_name,
      quantity: i.quantity,
      unit_price: i.unit_price,
      subtotal: i.subtotal,
    })),
    subtotal: order.subtotal,
    discountAmount: order.discount_amount,
    total: order.total,
    orderId: order.id,
    appUrl: process.env.APP_URL || 'https://laaldeatala.com.uy',
    reviewUrl: process.env.GOOGLE_REVIEW_URL || undefined,
  }));

  return sendEmail({
    to: order.customer_email,
    toName: order.customer_name,
    subject: `Pedido Confirmado - ${order.order_number}`,
    htmlContent,
  });
}

// =====================================================
// ADMIN NOTIFICATION EMAIL
// =====================================================

export async function sendAdminOrderNotification({ order, items }: SendOrderConfirmationParams): Promise<boolean> {
  const htmlContent = await render(AdminNotification({
    orderNumber: order.order_number,
    customerName: order.customer_name,
    customerEmail: order.customer_email,
    customerPhone: order.customer_phone,
    shippingAddress: order.shipping_address,
    status: order.status,
    items: items.map(i => ({
      product_name: i.product_name,
      quantity: i.quantity,
      subtotal: i.subtotal,
    })),
    total: order.total,
    orderId: order.id,
  }));

  return sendEmail({
    to: ADMIN_EMAIL,
    toName: 'La Aldea Admin',
    subject: `Nuevo Pedido ${order.order_number} - ${formatPrice(order.total)}`,
    htmlContent,
  });
}

// =====================================================
// ORDER STATUS UPDATE EMAIL
// =====================================================

export async function sendOrderStatusUpdate(
  order: Order,
  newStatus: string,
  trackingNumber?: string
): Promise<boolean> {
  if (!order.customer_email) return false;

  const validStatuses = ['paid', 'processing', 'shipped', 'delivered', 'refunded'];
  if (!validStatuses.includes(newStatus)) return false;

  const statusTitles: Record<string, string> = {
    paid: 'Pago Confirmado',
    processing: 'Preparando tu Pedido',
    shipped: 'Tu Pedido esta en Camino!',
    delivered: 'Pedido Entregado!',
    refunded: 'Reembolso Procesado',
  };

  const htmlContent = await render(StatusUpdate({
    orderNumber: order.order_number,
    customerName: order.customer_name,
    newStatus,
    total: order.total,
    trackingNumber,
    reviewUrl: process.env.GOOGLE_REVIEW_URL || undefined,
  }));

  return sendEmail({
    to: order.customer_email,
    toName: order.customer_name,
    subject: `${statusTitles[newStatus] || newStatus} - Pedido ${order.order_number}`,
    htmlContent,
  });
}

// =====================================================
// INVOICE EMAIL (TO CUSTOMER)
// =====================================================

interface SendInvoiceEmailParams {
  order: Order;
  items: OrderItem[];
  invoiceFileUrl?: string;
}

export async function sendInvoiceEmail({ order, items, invoiceFileUrl }: SendInvoiceEmailParams): Promise<boolean> {
  if (!order.customer_email) {
    console.warn('[Email] No customer email for invoice', order.order_number);
    return false;
  }

  const htmlContent = await render(InvoiceEmail({
    orderNumber: order.order_number,
    customerName: order.customer_name,
    invoiceNumber: order.invoice_number || '',
    invoiceType: order.invoice_type,
    total: order.total,
    items: items.map(i => ({
      product_name: i.product_name,
      quantity: i.quantity,
      subtotal: i.subtotal,
    })),
    invoiceFileUrl,
  }));

  return sendEmail({
    to: order.customer_email,
    toName: order.customer_name,
    subject: `Tu Factura N\u00B0 ${order.invoice_number} - Pedido ${order.order_number}`,
    htmlContent,
  });
}
