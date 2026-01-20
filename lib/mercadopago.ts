// lib/mercadopago.ts
// MercadoPago webhook signature verification
import crypto from 'crypto';

/**
 * Verifies MercadoPago webhook signature to ensure authenticity
 * @param xSignature - The x-signature header from MercadoPago
 * @param xRequestId - The x-request-id header
 * @param body - The webhook request body
 * @returns boolean - true if signature is valid
 */
export function verifyMPSignature(
  xSignature: string,
  xRequestId: string,
  body: any
): boolean {
  try {
    // MercadoPago sends signature in format: "ts=123456789,v1=abc123..."
    const parts = xSignature.split(',');
    
    let ts: string | undefined;
    let hash: string | undefined;
    
    for (const part of parts) {
      const [key, value] = part.split('=');
      if (key === 'ts') ts = value;
      if (key === 'v1') hash = value;
    }
    
    if (!ts || !hash) {
      console.error('Missing ts or v1 in signature');
      return false;
    }
    
    // Get webhook secret from environment
    const secret = process.env.MP_WEBHOOK_SECRET;
    
    if (!secret) {
      console.error('MP_WEBHOOK_SECRET not configured');
      return false;
    }
    
    // Build manifest: id + request-id + ts
    const dataId = body?.data?.id || '';
    const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
    
    // Calculate HMAC SHA256
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(manifest);
    const calculatedHash = hmac.digest('hex');
    
    // Compare hashes (constant time comparison)
    const isValid = crypto.timingSafeEqual(
      Buffer.from(hash),
      Buffer.from(calculatedHash)
    );
    
    if (!isValid) {
      console.error('Invalid signature:', { 
        expected: calculatedHash, 
        received: hash,
        manifest 
      });
    }
    
    return isValid;
  } catch (error) {
    console.error('Error verifying MP signature:', error);
    return false;
  }
}

/**
 * Helper to get MercadoPago payment details
 * @param paymentId - The payment ID from the webhook
 * @returns Payment data from MercadoPago API
 */
export async function getMPPayment(paymentId: string) {
  const accessToken = process.env.MP_ACCESS_TOKEN;
  
  if (!accessToken) {
    throw new Error('MP_ACCESS_TOKEN not configured');
  }
  
  const response = await fetch(
    `https://api.mercadopago.com/v1/payments/${paymentId}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );
  
  if (!response.ok) {
    throw new Error(`MercadoPago API error: ${response.statusText}`);
  }
  
  return response.json();
}
