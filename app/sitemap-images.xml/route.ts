import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const siteUrl = process.env.NEXT_PUBLIC_URL || 'https://laaldeatala.com.uy';

export const revalidate = 3600;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toAbsoluteImageUrl(rawImageUrl: string): string {
  if (rawImageUrl.startsWith('http://') || rawImageUrl.startsWith('https://')) {
    return rawImageUrl;
  }
  if (rawImageUrl.startsWith('//')) {
    return `https:${rawImageUrl}`;
  }
  if (rawImageUrl.startsWith('/')) {
    return `${siteUrl}${rawImageUrl}`;
  }
  return `${siteUrl}/${rawImageUrl}`;
}

export async function GET() {
  try {
    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select('slug, name, updated_at, images')
      .eq('is_active', true)
      .not('slug', 'is', null)
      .order('updated_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    const imageUrlEntries = (products || [])
      .map((product: { slug: string | null; name: string; updated_at: string | null; images: string[] | null }) => {
        if (!product.slug || !Array.isArray(product.images) || product.images.length === 0) return null;

        const productUrl = `${siteUrl}/productos/${product.slug}`;
        const imageNodes = product.images
          .filter((image): image is string => typeof image === 'string' && image.length > 0)
          .slice(0, 10)
          .map((image) => {
            const absoluteUrl = toAbsoluteImageUrl(image);
            return `<image:image><image:loc>${escapeXml(absoluteUrl)}</image:loc><image:title>${escapeXml(product.name)}</image:title></image:image>`;
          })
          .join('');

        if (!imageNodes) return null;

        const lastModified = product.updated_at ? new Date(product.updated_at).toISOString() : new Date().toISOString();

        return `<url><loc>${escapeXml(productUrl)}</loc><lastmod>${lastModified}</lastmod>${imageNodes}</url>`;
      })
      .filter((entry): entry is string => Boolean(entry));

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${imageUrlEntries.join('\n')}
</urlset>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Image sitemap generation failed:', error);

    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"></urlset>`;

    return new NextResponse(fallbackXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    });
  }
}
