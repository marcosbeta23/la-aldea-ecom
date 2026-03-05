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
      {
        userAgent: 'GPTBot',
        allow: ['/', '/llms.txt'],
      },
      {
        userAgent: 'ChatGPT-User',
        allow: ['/', '/llms.txt'],
      },
      {
        userAgent: 'Claude-Web',
        allow: ['/', '/llms.txt'],
      },
      {
        userAgent: 'PerplexityBot',
        allow: ['/', '/llms.txt'],
      },
      {
        userAgent: 'Anthropic-AI',
        allow: ['/', '/llms.txt'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
