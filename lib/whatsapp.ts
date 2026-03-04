// lib/whatsapp.ts
// WhatsApp Business API integration using Meta Cloud API
// Free tier: 1000 business-initiated conversations/month
// Docs: https://developers.facebook.com/docs/whatsapp/cloud-api

const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

interface WhatsAppResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Normalize a phone number for WhatsApp (Uruguay format).
 * Ensures the number starts with country code 598.
 */
function normalizePhone(phone: string): string {
  // Strip all non-digits
  let digits = phone.replace(/\D/g, '');

  // Handle Uruguay numbers
  if (digits.startsWith('0')) {
    // Local format: 099123456 → 59899123456
    digits = '598' + digits.slice(1);
  } else if (!digits.startsWith('598') && digits.length <= 9) {
    // Missing country code
    digits = '598' + digits;
  }

  return digits;
}

/**
 * Send a WhatsApp text message via Meta Cloud API.
 * Falls back gracefully if env vars are not configured.
 */
export async function sendWhatsAppMessage(
  phone: string,
  message: string
): Promise<WhatsAppResult> {
  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    return { success: false, error: 'WhatsApp API not configured' };
  }

  const normalizedPhone = normalizePhone(phone);

  try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: normalizedPhone,
          type: 'text',
          text: { body: message },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = (errorData as any)?.error?.message || `HTTP ${response.status}`;
      console.error('[WhatsApp] API error:', errorMsg);
      return { success: false, error: errorMsg };
    }

    const data = await response.json();
    const messageId = (data as any)?.messages?.[0]?.id;
    console.log(`[WhatsApp] Sent to ${normalizedPhone}, id: ${messageId}`);
    return { success: true, messageId };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[WhatsApp] Error:', errorMsg);
    return { success: false, error: errorMsg };
  }
}
