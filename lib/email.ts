// lib/email.ts
// Email service using Brevo (Sendinblue) - Free up to 300 emails/day
// Docs: https://developers.brevo.com/docs/send-a-transactional-email

import type { Order, OrderItem } from '@/types/database';

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

    console.log(`[Email] ✅ Sent to ${to}: "${subject}"`);
    return true;
  } catch (error) {
    console.error('[Email] Error sending:', error);
    return false;
  }
}

// =====================================================
// EMAIL TEMPLATES
// =====================================================

function formatPrice(price: number): string {
  return `UYU ${price.toLocaleString('es-UY', { maximumFractionDigits: 0 })}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-UY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getOrderItemsHTML(items: OrderItem[]): string {
  return items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${item.product_name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right;">${formatPrice(item.unit_price)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right;">${formatPrice(item.subtotal)}</td>
    </tr>
  `).join('');
}

function getBaseEmailTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 32px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">La Aldea</h1>
      <p style="color: #bfdbfe; margin: 8px 0 0 0; font-size: 14px;">Agroinsumos y Riego - Tala, Canelones</p>
    </div>
    
    <!-- Content -->
    <div style="padding: 32px;">
      ${content}
    </div>
    
    <!-- Footer -->
    <div style="background-color: #f1f5f9; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="margin: 0 0 8px 0; color: #64748b; font-size: 14px;">
        <strong>La Aldea</strong> - Agroinsumos y Riego
      </p>
      <p style="margin: 0 0 8px 0; color: #94a3b8; font-size: 12px;">
        Tala, Canelones, Uruguay | Tel: 099 123 456
      </p>
      <p style="margin: 0; color: #94a3b8; font-size: 12px;">
        <a href="https://laaldeatala.com.uy" style="color: #3b82f6; text-decoration: none;">laaldeatala.com.uy</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

// =====================================================
// ORDER CONFIRMATION EMAIL (TO CUSTOMER)
// =====================================================

export async function sendOrderConfirmation({ order, items }: SendOrderConfirmationParams): Promise<boolean> {
  if (!order.customer_email) {
    console.warn('[Email] No customer email for order', order.order_number);
    return false;
  }

  const content = `
    <h2 style="color: #0f172a; margin: 0 0 8px 0; font-size: 24px;">¡Gracias por tu compra!</h2>
    <p style="color: #64748b; margin: 0 0 24px 0;">Recibimos tu pedido y estamos procesándolo.</p>
    
    <!-- Order Info -->
    <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="color: #64748b; padding: 4px 0;">Número de pedido:</td>
          <td style="color: #0f172a; font-weight: bold; text-align: right;">${order.order_number}</td>
        </tr>
        <tr>
          <td style="color: #64748b; padding: 4px 0;">Fecha:</td>
          <td style="color: #0f172a; text-align: right;">${formatDate(order.created_at)}</td>
        </tr>
        <tr>
          <td style="color: #64748b; padding: 4px 0;">Estado:</td>
          <td style="text-align: right;">
            <span style="background-color: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600;">
              ${order.status === 'paid' || order.status === 'invoiced' ? 'Pago Recibido' : 'Pendiente'}
            </span>
          </td>
        </tr>
      </table>
    </div>
    
    <!-- Products Table -->
    <h3 style="color: #0f172a; margin: 0 0 16px 0; font-size: 18px;">Productos</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
      <thead>
        <tr style="background-color: #f1f5f9;">
          <th style="padding: 12px; text-align: left; color: #475569; font-size: 12px; text-transform: uppercase;">Producto</th>
          <th style="padding: 12px; text-align: center; color: #475569; font-size: 12px; text-transform: uppercase;">Cant.</th>
          <th style="padding: 12px; text-align: right; color: #475569; font-size: 12px; text-transform: uppercase;">Precio</th>
          <th style="padding: 12px; text-align: right; color: #475569; font-size: 12px; text-transform: uppercase;">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${getOrderItemsHTML(items)}
      </tbody>
    </table>
    
    <!-- Totals -->
    <div style="background-color: #0f172a; border-radius: 12px; padding: 20px; color: #ffffff;">
      <table style="width: 100%; border-collapse: collapse;">
        ${order.discount_amount > 0 ? `
        <tr>
          <td style="color: #94a3b8; padding: 4px 0;">Subtotal:</td>
          <td style="text-align: right;">${formatPrice(order.subtotal)}</td>
        </tr>
        <tr>
          <td style="color: #4ade80; padding: 4px 0;">Descuento:</td>
          <td style="color: #4ade80; text-align: right;">-${formatPrice(order.discount_amount)}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="font-size: 20px; font-weight: bold; padding-top: 8px;">Total:</td>
          <td style="font-size: 20px; font-weight: bold; text-align: right; padding-top: 8px;">${formatPrice(order.total)}</td>
        </tr>
      </table>
    </div>
    
    <!-- Customer Info -->
    <div style="margin-top: 24px; padding: 20px; background-color: #f8fafc; border-radius: 12px;">
      <h3 style="color: #0f172a; margin: 0 0 12px 0; font-size: 16px;">Datos del cliente</h3>
      <p style="color: #475569; margin: 4px 0;"><strong>Nombre:</strong> ${order.customer_name}</p>
      <p style="color: #475569; margin: 4px 0;"><strong>Email:</strong> ${order.customer_email}</p>
      ${order.customer_phone ? `<p style="color: #475569; margin: 4px 0;"><strong>Teléfono:</strong> ${order.customer_phone}</p>` : ''}
      ${order.shipping_address ? `<p style="color: #475569; margin: 4px 0;"><strong>Dirección:</strong> ${order.shipping_address}</p>` : ''}
    </div>
    
    <!-- CTA -->
    <div style="margin-top: 32px; text-align: center;">
      <a href="${process.env.APP_URL || 'https://laaldeatala.com.uy'}/gracias?order_id=${order.id}" 
         style="display: inline-block; background-color: #3b82f6; color: #ffffff; padding: 14px 28px; border-radius: 9999px; text-decoration: none; font-weight: 600; margin-bottom: 12px;">
        📄 Ver Comprobante de Compra
      </a>
      <p style="color: #64748b; margin: 16px 0;">¿Tenés alguna consulta sobre tu pedido?</p>
      <a href="https://wa.me/59899123456?text=Hola! Consulto por mi pedido ${order.order_number}" 
         style="display: inline-block; background-color: #25d366; color: #ffffff; padding: 14px 28px; border-radius: 9999px; text-decoration: none; font-weight: 600;">
        Escribinos por WhatsApp
      </a>
    </div>
  `;

  return sendEmail({
    to: order.customer_email,
    toName: order.customer_name,
    subject: `Pedido Confirmado - ${order.order_number}`,
    htmlContent: getBaseEmailTemplate(content),
  });
}

// =====================================================
// ADMIN NOTIFICATION EMAIL
// =====================================================

export async function sendAdminOrderNotification({ order, items }: SendOrderConfirmationParams): Promise<boolean> {
  const content = `
    <h2 style="color: #0f172a; margin: 0 0 8px 0; font-size: 24px;">🛒 Nuevo Pedido Recibido</h2>
    <p style="color: #64748b; margin: 0 0 24px 0;">Se recibió un nuevo pedido en la tienda.</p>
    
    <!-- Order Summary -->
    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin-bottom: 24px;">
      <p style="margin: 0; color: #92400e;">
        <strong>Pedido:</strong> ${order.order_number}<br>
        <strong>Cliente:</strong> ${order.customer_name}<br>
        <strong>Total:</strong> ${formatPrice(order.total)}<br>
        <strong>Estado:</strong> ${order.status}
      </p>
    </div>
    
    <!-- Products -->
    <h3 style="color: #0f172a; margin: 0 0 16px 0; font-size: 18px;">Productos (${items.length})</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
      <thead>
        <tr style="background-color: #f1f5f9;">
          <th style="padding: 12px; text-align: left; color: #475569; font-size: 12px;">Producto</th>
          <th style="padding: 12px; text-align: center; color: #475569; font-size: 12px;">Cant.</th>
          <th style="padding: 12px; text-align: right; color: #475569; font-size: 12px;">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${items.map(item => `
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${item.product_name}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.quantity}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right;">${formatPrice(item.subtotal)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    
    <!-- Customer Details -->
    <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <h3 style="color: #0f172a; margin: 0 0 12px 0; font-size: 16px;">Datos del cliente</h3>
      <p style="color: #475569; margin: 4px 0;"><strong>Nombre:</strong> ${order.customer_name}</p>
      <p style="color: #475569; margin: 4px 0;"><strong>Email:</strong> ${order.customer_email || 'No proporcionado'}</p>
      <p style="color: #475569; margin: 4px 0;"><strong>Teléfono:</strong> ${order.customer_phone || 'No proporcionado'}</p>
      <p style="color: #475569; margin: 4px 0;"><strong>Dirección:</strong> ${order.shipping_address || 'No proporcionada'}</p>
    </div>
    
    <!-- CTA -->
    <div style="text-align: center;">
      <a href="https://laaldeatala.com.uy/admin/orders/${order.id}" 
         style="display: inline-block; background-color: #3b82f6; color: #ffffff; padding: 14px 28px; border-radius: 9999px; text-decoration: none; font-weight: 600;">
        Ver Pedido en Admin
      </a>
    </div>
  `;

  return sendEmail({
    to: ADMIN_EMAIL,
    toName: 'La Aldea Admin',
    subject: `🛒 Nuevo Pedido ${order.order_number} - ${formatPrice(order.total)}`,
    htmlContent: getBaseEmailTemplate(content),
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

  const statusMessages: Record<string, { title: string; message: string; color: string }> = {
    'paid': {
      title: '✅ Pago Confirmado',
      message: 'Tu pago ha sido confirmado y estamos preparando tu pedido.',
      color: '#22c55e',
    },
    'processing': {
      title: '📦 Preparando tu Pedido',
      message: 'Estamos preparando tu pedido para envío.',
      color: '#3b82f6',
    },
    'shipped': {
      title: '🚚 ¡Tu Pedido está en Camino!',
      message: trackingNumber 
        ? `Tu pedido ha sido enviado. Número de seguimiento: ${trackingNumber}`
        : 'Tu pedido ha sido enviado y pronto llegará a destino.',
      color: '#8b5cf6',
    },
    'delivered': {
      title: '🎉 ¡Pedido Entregado!',
      message: '¡Tu pedido ha sido entregado! Esperamos que disfrutes tu compra.',
      color: '#22c55e',
    },
    'refunded': {
      title: '💸 Reembolso Procesado',
      message: 'Tu reembolso ha sido procesado. El monto se acreditará en tu cuenta en los próximos días.',
      color: '#f59e0b',
    },
  };

  const statusInfo = statusMessages[newStatus];
  if (!statusInfo) return false;

  const content = `
    <div style="text-align: center; padding: 20px;">
      <div style="width: 80px; height: 80px; background-color: ${statusInfo.color}20; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 40px;">${statusInfo.title.split(' ')[0]}</span>
      </div>
      <h2 style="color: #0f172a; margin: 0 0 8px 0; font-size: 24px;">${statusInfo.title}</h2>
      <p style="color: #64748b; margin: 0 0 24px 0;">${statusInfo.message}</p>
    </div>
    
    <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; text-align: center;">
      <p style="color: #64748b; margin: 0;">
        <strong>Pedido:</strong> ${order.order_number}<br>
        <strong>Total:</strong> ${formatPrice(order.total)}
      </p>
    </div>
    
    <div style="margin-top: 32px; text-align: center;">
      <a href="https://wa.me/59899123456?text=Hola! Consulto por mi pedido ${order.order_number}" 
         style="display: inline-block; background-color: #25d366; color: #ffffff; padding: 14px 28px; border-radius: 9999px; text-decoration: none; font-weight: 600;">
        ¿Consultas? Escribinos
      </a>
    </div>
  `;

  return sendEmail({
    to: order.customer_email,
    toName: order.customer_name,
    subject: `${statusInfo.title} - Pedido ${order.order_number}`,
    htmlContent: getBaseEmailTemplate(content),
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

  const invoiceTypeName = order.invoice_type === 'invoice_rut' 
    ? 'Factura con RUT' 
    : 'Comprobante de Consumidor Final';

  const content = `
    <div style="text-align: center; padding: 20px;">
      <div style="width: 80px; height: 80px; background-color: #dcfce720; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 40px;">🧾</span>
      </div>
      <h2 style="color: #0f172a; margin: 0 0 8px 0; font-size: 24px;">Tu Factura está Lista</h2>
      <p style="color: #64748b; margin: 0 0 24px 0;">Adjuntamos el comprobante de tu compra.</p>
    </div>
    
    <!-- Invoice Info -->
    <div style="background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="color: #166534; padding: 4px 0;">Tipo:</td>
          <td style="color: #166534; font-weight: bold; text-align: right;">${invoiceTypeName}</td>
        </tr>
        <tr>
          <td style="color: #166534; padding: 4px 0;">Número:</td>
          <td style="color: #166534; font-weight: bold; text-align: right;">${order.invoice_number}</td>
        </tr>
        <tr>
          <td style="color: #166534; padding: 4px 0;">Pedido:</td>
          <td style="color: #166534; text-align: right;">${order.order_number}</td>
        </tr>
        <tr>
          <td style="color: #166534; padding: 4px 0;">Total:</td>
          <td style="color: #166534; font-weight: bold; text-align: right;">${formatPrice(order.total)}</td>
        </tr>
      </table>
    </div>
    
    ${invoiceFileUrl ? `
    <!-- Download Button -->
    <div style="text-align: center; margin-bottom: 24px;">
      <a href="${invoiceFileUrl}" 
         style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 14px 28px; border-radius: 9999px; text-decoration: none; font-weight: 600;">
        📄 Descargar Factura PDF
      </a>
    </div>
    ` : ''}
    
    <!-- Products Summary -->
    <h3 style="color: #0f172a; margin: 0 0 16px 0; font-size: 16px;">Detalle de la compra</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
      <thead>
        <tr style="background-color: #f1f5f9;">
          <th style="padding: 8px; text-align: left; color: #475569; font-size: 12px;">Producto</th>
          <th style="padding: 8px; text-align: center; color: #475569; font-size: 12px;">Cant.</th>
          <th style="padding: 8px; text-align: right; color: #475569; font-size: 12px;">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${items.map(item => `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 14px;">${item.product_name}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: center; font-size: 14px;">${item.quantity}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right; font-size: 14px;">${formatPrice(item.subtotal)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    
    <!-- Footer Note -->
    <div style="background-color: #f8fafc; border-radius: 12px; padding: 16px; text-align: center;">
      <p style="color: #64748b; margin: 0; font-size: 14px;">
        Guardá este comprobante para tus registros.<br>
        Si necesitás asistencia, no dudes en contactarnos.
      </p>
    </div>
    
    <!-- WhatsApp CTA -->
    <div style="margin-top: 24px; text-align: center;">
      <a href="https://wa.me/59899123456?text=Hola! Consulto por mi factura del pedido ${order.order_number}" 
         style="display: inline-block; background-color: #25d366; color: #ffffff; padding: 12px 24px; border-radius: 9999px; text-decoration: none; font-weight: 600; font-size: 14px;">
        ¿Consultas? Escribinos
      </a>
    </div>
  `;

  return sendEmail({
    to: order.customer_email,
    toName: order.customer_name,
    subject: `Tu Factura N° ${order.invoice_number} - Pedido ${order.order_number}`,
    htmlContent: getBaseEmailTemplate(content),
  });
}
