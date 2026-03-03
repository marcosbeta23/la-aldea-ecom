// lib/cloudflare-images.ts
// Cloudflare Images integration for product image optimization
// Requires CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_IMAGES_TOKEN env vars

const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CF_IMAGES_TOKEN = process.env.CLOUDFLARE_IMAGES_TOKEN;
const CF_IMAGES_HASH = process.env.CLOUDFLARE_IMAGES_HASH; // Account hash for delivery URL

/** Check if Cloudflare Images is configured */
export function isCfImagesConfigured(): boolean {
  return !!(CF_ACCOUNT_ID && CF_IMAGES_TOKEN);
}

/** Upload an image to Cloudflare Images from a buffer */
export async function uploadToCfImages(
  buffer: Buffer,
  filename: string,
  metadata?: Record<string, string>
): Promise<{ id: string; url: string } | null> {
  if (!CF_ACCOUNT_ID || !CF_IMAGES_TOKEN) return null;

  const form = new FormData();
  form.append('file', new Blob([new Uint8Array(buffer)]), filename);
  if (metadata) {
    form.append('metadata', JSON.stringify(metadata));
  }

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/images/v1`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${CF_IMAGES_TOKEN}` },
      body: form,
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error('Cloudflare Images upload failed:', err);
    return null;
  }

  const data = await res.json();
  const imageId = data.result?.id;
  if (!imageId) return null;

  return {
    id: imageId,
    url: getCfImageUrl(imageId),
  };
}

/** Get the delivery URL for a Cloudflare Images image */
export function getCfImageUrl(imageId: string, variant: string = 'public'): string {
  if (CF_IMAGES_HASH) {
    return `https://imagedelivery.net/${CF_IMAGES_HASH}/${imageId}/${variant}`;
  }
  return `https://imagedelivery.net/${CF_ACCOUNT_ID}/${imageId}/${variant}`;
}

/** Delete an image from Cloudflare Images */
export async function deleteFromCfImages(imageId: string): Promise<boolean> {
  if (!CF_ACCOUNT_ID || !CF_IMAGES_TOKEN) return false;

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/images/v1/${imageId}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${CF_IMAGES_TOKEN}` },
    }
  );

  return res.ok;
}
