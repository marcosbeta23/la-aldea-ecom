// lib/coupon-utils.ts
// Utility for generating opaque coupon codes that are hard to enumerate.
// Format: PREFIX-XXXXXXXX (hex, uppercase)
// Example: ALDEA-A3F2B1C4

import crypto from 'crypto';

/**
 * Generates a new opaque coupon code.
 * @param prefix - Custom prefix (default: 'ALDEA')
 * @returns e.g. "ALDEA-A3F2B1C4"
 */
export function generateCouponCode(prefix = 'ALDEA'): string {
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `${prefix}-${random}`;
}
