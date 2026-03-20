import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_URL || 'https://laaldeatala.com.uy';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/checkout',
          '/cart',
          '/wishlist',
          '/pedido/',
          '/gracias',
          '/pendiente',
          '/procesando',
          '/error',
        ],
      },
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: ['/admin/', '/api/', '/checkout', '/cart', '/wishlist', '/pedido/'],
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
        disallow: ['/admin/', '/api/', '/checkout', '/cart', '/wishlist', '/pedido/'],
      },
      {
        userAgent: 'Claude-Web',
        allow: '/',
        disallow: ['/admin/', '/api/', '/checkout', '/cart', '/wishlist', '/pedido/'],
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: ['/admin/', '/api/', '/checkout', '/cart', '/wishlist', '/pedido/'],
      },
      {
        userAgent: 'Anthropic-AI',
        allow: '/',
        disallow: ['/admin/', '/api/', '/checkout', '/cart', '/wishlist', '/pedido/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}