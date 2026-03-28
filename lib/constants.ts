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
 * Bank Account Details Switcher
 * Returns the correct account based on currency
 */
export const getBankDetails = (currency: string = 'UYU') => {
  const isUSD = currency.toUpperCase() === 'USD';
  return {
    banco: process.env.NEXT_PUBLIC_BANK_NAME || 'BROU',
    cuenta: isUSD 
      ? (process.env.NEXT_PUBLIC_BANK_ACCOUNT_USD || '001532748-00002')
      : (process.env.NEXT_PUBLIC_BANK_ACCOUNT_UYU || '001532748-00001'),
    titular: process.env.NEXT_PUBLIC_BANK_HOLDER || 'Martin Betancor',
    rut: process.env.NEXT_PUBLIC_BANK_RUT || '21 123456 0001 19',
    moneda: isUSD ? 'Dólares Americanos (USD)' : 'Pesos Uruguayos (UYU)',
  };
};
