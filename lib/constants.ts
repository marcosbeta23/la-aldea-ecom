// lib/constants.ts

/**
 * Public WhatsApp phone number for customer inquiries
 * Format: CountryCode + AreaCode + Number (no + or spaces)
 */
export const WHATSAPP_PHONE = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '59892744725';

/**
 * WhatsApp display number (formatted for UI)
 */
export const WHATSAPP_DISPLAY = '+598 92 744 725';

/**
 * Build a safe wa.me URL, encoding only the text payload.
 */
export function buildWhatsAppUrl(phone: string, text?: string): string {
  const normalizedPhone = phone.replace(/\D/g, '');
  if (!text) return `https://wa.me/${normalizedPhone}`;
  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(text)}`;
}

/**
 * Common storefront WhatsApp CTAs.
 */
export const WHATSAPP_LINKS = {
  general: buildWhatsAppUrl(
    WHATSAPP_PHONE,
    'Hola, quisiera consultar sobre un producto'
  ),
  visitaTecnica: buildWhatsAppUrl(
    WHATSAPP_PHONE,
    'Hola, me gustaría agendar una visita técnica'
  ),
  cotizacion: buildWhatsAppUrl(
    WHATSAPP_PHONE,
    'Hola, me gustaría solicitar una cotización'
  ),
  riego: buildWhatsAppUrl(
    WHATSAPP_PHONE,
    'Hola, me gustaría consultar sobre sistemas de riego'
  ),
  piscinas: buildWhatsAppUrl(
    WHATSAPP_PHONE,
    'Hola, tengo una consulta sobre productos para piscinas'
  ),
} as const;

/**
 * Google Business Profile aggregate rating
 * Update NEXT_PUBLIC_GOOGLE_RATING and NEXT_PUBLIC_GOOGLE_REVIEW_COUNT
 * in your .env.local (and Vercel env vars) whenever you get new reviews.
 * No code changes needed.
 */
export const GOOGLE_RATING = process.env.NEXT_PUBLIC_GOOGLE_RATING || '4.3';
export const GOOGLE_REVIEW_COUNT = process.env.NEXT_PUBLIC_GOOGLE_REVIEW_COUNT || '7';

/**
 * Bank Account Details Switcher
 * Returns the correct account based on currency
 */
export const getBankDetails = (currency: string = 'UYU') => {
  const isUSD = currency.toUpperCase() === 'USD';
  return {
    banco: process.env.NEXT_PUBLIC_BANK_NAME || 'BROU',
    cuenta: isUSD
      ? (process.env.NEXT_PUBLIC_BANK_ACCOUNT_USD || '')
      : (process.env.NEXT_PUBLIC_BANK_ACCOUNT_UYU || ''),
    titular: process.env.NEXT_PUBLIC_BANK_HOLDER || '',
    rut: process.env.NEXT_PUBLIC_BANK_RUT || '',
    moneda: isUSD ? 'Dólares Americanos (USD)' : 'Pesos Uruguayos (UYU)',
  };
};
