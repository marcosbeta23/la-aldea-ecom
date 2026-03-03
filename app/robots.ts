import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_URL || 'https://laaldeatala.com.uy';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/checkout', '/gracias', '/pendiente', '/procesando', '/error'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
