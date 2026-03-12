// lib/order-token.ts
// HMAC-signed tokens for secure order tracking links.
// Prevents IDOR: anyone with the UUID can no longer read PII
// unless they also have the email that belongs to that order.

import crypto from 'crypto';

const SECRET = process.env.ORDER_TOKEN_SECRET;

/**
 * Generates a short-lived HMAC token for an order + email pair.
 * Embed in confirmation email as ?email=...&token=...
 */
export function generateOrderToken(orderId: string, email: string): string {
  if (!SECRET) {
    throw new Error('ORDER_TOKEN_SECRET is not configured');
  }
  const payload = `${orderId}:${email.toLowerCase().trim()}`;
  return crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
}

/**
 * Verifies the HMAC token.  Uses timing-safe comparison to prevent
 * timing-oracle attacks.  Returns false (not throws) on any mismatch.
 */
export function verifyOrderToken(
  orderId: string,
  email: string,
  token: string
): boolean {
  if (!SECRET) return false;
  try {
    const expected = generateOrderToken(orderId, email);
    // Both buffers must be the same length for timingSafeEqual
    if (token.length !== expected.length) return false;
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  } catch {
    return false;
  }
}
