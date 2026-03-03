const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function sendTelegramAlert(message: string): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    // Silently skip if not configured
    return false;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!res.ok) {
      console.error('Telegram API error:', res.status);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Telegram send error:', err);
    return false;
  }
}

// Pre-built alert messages

export function alertNewOrder(orderNumber: string, total: number, customerName: string, currency: string = 'UYU') {
  const prefix = currency === 'USD' ? 'US$' : '$';
  return sendTelegramAlert(
    `<b>Nuevo pedido #${orderNumber}</b>\n` +
    `${prefix} ${total.toLocaleString('es-UY')}\n` +
    `${customerName}`
  );
}

export function alertPaymentApproved(orderNumber: string, total: number, customerName: string, currency: string = 'UYU') {
  const prefix = currency === 'USD' ? 'US$' : '$';
  return sendTelegramAlert(
    `<b>Pago aprobado #${orderNumber}</b>\n` +
    `${prefix} ${total.toLocaleString('es-UY')}\n` +
    `${customerName}`
  );
}

export function alertPaymentFailed(orderNumber: string, customerName: string, reason: string) {
  return sendTelegramAlert(
    `<b>Pago rechazado #${orderNumber}</b>\n` +
    `${customerName}\n` +
    `Motivo: ${reason}`
  );
}

export function alertOutOfStock(productName: string, sku: string) {
  return sendTelegramAlert(
    `<b>Sin stock: ${productName}</b>\n` +
    `SKU: ${sku}\n` +
    `El producto se quedó sin stock.`
  );
}

export function alertFraudAttempt(orderNumber: string, expected: number, paid: number, currency: string = 'UYU') {
  const prefix = currency === 'USD' ? 'US$' : '$';
  return sendTelegramAlert(
    `<b>ALERTA FRAUDE #${orderNumber}</b>\n` +
    `Esperado: ${prefix} ${expected.toLocaleString('es-UY')}\n` +
    `Pagado: ${prefix} ${paid.toLocaleString('es-UY')}\n` +
    `Orden cancelada automaticamente.`
  );
}

export function alertNewTransferOrder(orderNumber: string, total: number, customerName: string, currency: string = 'UYU') {
  const prefix = currency === 'USD' ? 'US$' : '$';
  return sendTelegramAlert(
    `<b>Transferencia pendiente #${orderNumber}</b>\n` +
    `${prefix} ${total.toLocaleString('es-UY')}\n` +
    `${customerName}\n` +
    `Moneda: ${currency}\n` +
    `Verificar pago en la cuenta bancaria.`
  );
}

export function alertOrderStatusChanged(orderNumber: string, oldStatus: string, newStatus: string, customerName: string) {
  const labels: Record<string, string> = {
    pending: 'Pendiente', paid: 'Pagado', paid_pending_verification: 'Por verificar',
    awaiting_stock: 'Sin stock', ready_to_invoice: 'Por facturar', invoiced: 'Facturado',
    processing: 'En preparación', shipped: 'Enviado', delivered: 'Entregado',
    cancelled: 'Cancelado', refunded: 'Reembolsado',
  };
  return sendTelegramAlert(
    `<b>Pedido #${orderNumber} actualizado</b>\n` +
    `${labels[oldStatus] || oldStatus} → ${labels[newStatus] || newStatus}\n` +
    `${customerName}`
  );
}

export function alertRefundProcessed(orderNumber: string, amount: number, success: boolean, customerName: string, currency: string = 'UYU') {
  const prefix = currency === 'USD' ? 'US$' : '$';
  return sendTelegramAlert(
    success
      ? `<b>Reembolso exitoso #${orderNumber}</b>\n${prefix} ${amount.toLocaleString('es-UY')}\n${customerName}`
      : `<b>Reembolso fallido #${orderNumber}</b>\n${prefix} ${amount.toLocaleString('es-UY')}\n${customerName}\nRevisar manualmente.`
  );
}

export function alertOutOfStockAfterPayment(orderNumber: string, customerName: string, failedProducts: string[]) {
  return sendTelegramAlert(
    `<b>SIN STOCK tras pago #${orderNumber}</b>\n` +
    `${customerName}\n` +
    `Productos:\n${failedProducts.map(p => `  - ${p}`).join('\n')}\n` +
    `Contactar al cliente.`
  );
}

export function alertLowStock(productName: string, sku: string, currentStock: number) {
  return sendTelegramAlert(
    `<b>Stock bajo: ${productName}</b>\n` +
    `SKU: ${sku}\n` +
    `Quedan: ${currentStock} unidades`
  );
}
