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
