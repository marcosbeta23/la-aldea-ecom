// lib/notifications.ts
// Customer notification templates for WhatsApp and Email

import type { Order, OrderItem } from '@/types/database';

// =====================================================
// MESSAGE TEMPLATES (Spanish - Uruguay)
// =====================================================

export interface NotificationContext {
  order: Order;
  items?: OrderItem[];
  failedProducts?: Array<{ name: string; requested: number; available: number }>;
  invoiceNumber?: string;
  refundAmount?: number;
}

/**
 * Payment received - stock reserved successfully
 */
export function getPaymentReceivedMessage(ctx: NotificationContext): string {
  const { order } = ctx;
  return `Hola ${order.customer_name} 👋

✅ *Recibimos tu pago* por el pedido *#${order.order_number}*

Estamos verificando el stock y en breve te confirmamos la factura y el envío.

Total: UYU ${order.total.toLocaleString('es-UY')}

Gracias por tu compra 🙏
— *La Aldea*`;
}

/**
 * Payment received but stock unavailable
 */
export function getAwaitingStockMessage(ctx: NotificationContext): string {
  const { order, failedProducts } = ctx;
  
  const productList = failedProducts?.map(p => 
    `• ${p.name} (pedido: ${p.requested}, disponible: ${p.available})`
  ).join('\n') || 'Algunos productos';
  
  return `Hola ${order.customer_name} 👋

⚠️ *Aviso sobre tu pedido #${order.order_number}*

Lamentablemente no tenemos stock suficiente de:
${productList}

*¿Qué preferís?*
1️⃣ Te hacemos el reembolso completo (1-15 días según el medio de pago)
2️⃣ Esperás hasta que tengamos stock (te avisamos)
3️⃣ Te ofrecemos un producto alternativo

Respondé a este mensaje indicando qué preferís.

— *La Aldea*`;
}

/**
 * Ready to invoice notification
 */
export function getReadyToInvoiceMessage(ctx: NotificationContext): string {
  const { order } = ctx;
  return `Hola ${order.customer_name} 👋

📦 *Tu pedido #${order.order_number} está listo*

El stock fue reservado y estamos preparando tu factura. Te avisamos cuando esté lista.

— *La Aldea*`;
}

/**
 * Invoice generated
 */
export function getInvoiceGeneratedMessage(ctx: NotificationContext): string {
  const { order, invoiceNumber } = ctx;
  return `Hola ${order.customer_name} 👋

📄 *Factura emitida*

Tu factura N° *${invoiceNumber || order.invoice_number}* para el pedido #${order.order_number} fue generada.

${order.shipping_type === 'pickup' 
  ? 'Podés pasar a retirar tu pedido cuando quieras.'
  : 'Te avisamos cuando despachemos tu pedido.'}

— *La Aldea*`;
}

/**
 * Order shipped
 */
export function getOrderShippedMessage(ctx: NotificationContext): string {
  const { order } = ctx;
  return `Hola ${order.customer_name} 👋

🚚 *Tu pedido #${order.order_number} fue despachado*

Está en camino a:
${order.shipping_address}${order.shipping_city ? `, ${order.shipping_city}` : ''}

Te avisamos cuando esté por llegar.

— *La Aldea*`;
}

/**
 * Refund initiated
 */
export function getRefundInitiatedMessage(ctx: NotificationContext): string {
  const { order, refundAmount } = ctx;
  const amount = refundAmount || order.refund_amount || order.total;
  
  return `Hola ${order.customer_name} 👋

💸 *Iniciamos tu reembolso*

Pedido: #${order.order_number}
Monto: UYU ${amount.toLocaleString('es-UY')}

El proceso puede tardar entre *1 y 15 días* según tu medio de pago. Te avisamos cuando se complete.

— *La Aldea*`;
}

/**
 * Refund completed
 */
export function getRefundCompletedMessage(ctx: NotificationContext): string {
  const { order, refundAmount } = ctx;
  const amount = refundAmount || order.refund_amount || order.total;
  
  return `Hola ${order.customer_name} 👋

✅ *Reembolso completado*

El reembolso de UYU ${amount.toLocaleString('es-UY')} por tu pedido #${order.order_number} fue procesado.

Dependiendo de tu banco/medio de pago, puede tardar unos días en reflejarse.

— *La Aldea*`;
}

// =====================================================
// WHATSAPP HELPERS
// =====================================================

/**
 * Generate WhatsApp click-to-chat URL
 */
export function getWhatsAppUrl(phone: string, message: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

/**
 * Get WhatsApp URL for order notification
 */
export function getOrderWhatsAppUrl(
  order: Order, 
  messageType: 'payment_received' | 'awaiting_stock' | 'invoice_generated' | 'shipped' | 'refund_initiated',
  ctx?: Partial<NotificationContext>
): string | null {
  if (!order.customer_phone) return null;
  
  const fullCtx: NotificationContext = { order, ...ctx };
  
  let message: string;
  switch (messageType) {
    case 'payment_received':
      message = getPaymentReceivedMessage(fullCtx);
      break;
    case 'awaiting_stock':
      message = getAwaitingStockMessage(fullCtx);
      break;
    case 'invoice_generated':
      message = getInvoiceGeneratedMessage(fullCtx);
      break;
    case 'shipped':
      message = getOrderShippedMessage(fullCtx);
      break;
    case 'refund_initiated':
      message = getRefundInitiatedMessage(fullCtx);
      break;
    default:
      return null;
  }
  
  return getWhatsAppUrl(order.customer_phone, message);
}

// =====================================================
// EMAIL TEMPLATES (HTML)
// =====================================================

export function getPaymentReceivedEmailHtml(ctx: NotificationContext): string {
  const { order } = ctx;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { color: #16a34a; margin: 0; }
    .content { background: #f8fafc; border-radius: 8px; padding: 24px; }
    .order-number { font-size: 18px; font-weight: bold; color: #0f172a; }
    .total { font-size: 24px; font-weight: bold; color: #16a34a; }
    .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Pago Recibido</h1>
    </div>
    <div class="content">
      <p>Hola <strong>${order.customer_name}</strong>,</p>
      <p>Recibimos tu pago por el pedido:</p>
      <p class="order-number">#${order.order_number}</p>
      <p class="total">UYU ${order.total.toLocaleString('es-UY')}</p>
      <p>Estamos verificando el stock y en breve te confirmamos la factura y el envío.</p>
    </div>
    <div class="footer">
      <p>Gracias por tu compra 🙏</p>
      <p><strong>La Aldea</strong></p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function getInvoiceEmailHtml(ctx: NotificationContext): string {
  const { order, invoiceNumber } = ctx;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { color: #4f46e5; margin: 0; }
    .content { background: #f8fafc; border-radius: 8px; padding: 24px; }
    .invoice-number { font-size: 18px; font-weight: bold; color: #4f46e5; background: #eef2ff; padding: 12px; border-radius: 6px; text-align: center; }
    .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📄 Factura Emitida</h1>
    </div>
    <div class="content">
      <p>Hola <strong>${order.customer_name}</strong>,</p>
      <p>Tu factura para el pedido #${order.order_number} fue generada:</p>
      <p class="invoice-number">Factura N° ${invoiceNumber || order.invoice_number}</p>
      <p>${order.shipping_type === 'pickup' 
        ? 'Podés pasar a retirar tu pedido cuando quieras.'
        : 'Te avisamos cuando despachemos tu pedido.'}</p>
    </div>
    <div class="footer">
      <p><strong>La Aldea</strong></p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// =====================================================
// ADMIN NOTIFICATIONS
// =====================================================

export function getAdminNewOrderMessage(ctx: NotificationContext): string {
  const { order, items } = ctx;
  
  const itemList = items?.map(i => 
    `• ${i.product_name} x${i.quantity} = UYU ${i.subtotal.toLocaleString('es-UY')}`
  ).join('\n') || '';
  
  return `🛒 *NUEVO PEDIDO*

Pedido: #${order.order_number}
Cliente: ${order.customer_name}
Tel: ${order.customer_phone}

*Productos:*
${itemList}

*Total: UYU ${order.total.toLocaleString('es-UY')}*

Estado: ${order.status}`;
}

export function getAdminRefundAlertMessage(ctx: NotificationContext): string {
  const { order, refundAmount } = ctx;
  
  return `💸 *REEMBOLSO PROCESADO*

Pedido: #${order.order_number}
Cliente: ${order.customer_name}
Monto: UYU ${(refundAmount || order.total).toLocaleString('es-UY')}
Motivo: ${order.refund_reason || 'No especificado'}`;
}
