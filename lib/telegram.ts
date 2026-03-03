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

export function alertFraudAttempt(orderNumber: string, expected: number, paid: number) {
  return sendTelegramAlert(
    `<b>ALERTA FRAUDE #${orderNumber}</b>\n` +
    `Esperado: $${expected}\n` +
    `Pagado: $${paid}\n` +
    `Orden cancelada automaticamente.`
  );
}
