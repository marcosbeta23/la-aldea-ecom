import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_URL || 'https://laaldeatala.com.uy';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Regla principal para todos los bots
      {
        userAgent: '*',
        allow: ['/'],
        disallow: [
          // Admin y API
          '/admin/',
          '/api/',
          // Páginas transaccionales
          '/checkout',
          '/cart',
          '/wishlist',
          '/gracias',
          '/pendiente',
          '/procesando',
          '/error',
          // Páginas de pedido individual
          '/pedido/',
          // Parámetros de búsqueda — ya tienen noindex en metadata pero esto refuerza
          // para evitar que Google gaste crawl budget en URLs sin valor SEO
          '/*?q=',
          // Parámetro legacy (inglés) de versiones antiguas del código
          '/*?category=',
          // Parámetros de refinamiento de filtros — generan URLs duplicadas sin valor
          '/*?marca=',
          '/*?stock=',
          '/*?orden=',
          '/*?precio_min=',
          '/*?precio_max=',
        ],
      },
      // Permitir bots de AI ver contenido público
      {
        userAgent: 'GPTBot',
        allow: ['/', '/productos', '/guias/', '/blog', '/nosotros', '/faq'],
        disallow: ['/admin/', '/api/', '/checkout', '/cart', '/wishlist', '/pedido/'],
      },
      {
        userAgent: 'ChatGPT-User',
        allow: ['/', '/productos', '/guias/', '/blog'],
        disallow: ['/admin/', '/api/', '/checkout'],
      },
      {
        userAgent: 'Claude-Web',
        allow: ['/', '/productos', '/guias/', '/blog'],
        disallow: ['/admin/', '/api/', '/checkout'],
      },
      {
        userAgent: 'PerplexityBot',
        allow: ['/', '/productos', '/guias/', '/blog'],
        disallow: ['/admin/', '/api/', '/checkout'],
      },
      {
        userAgent: 'Anthropic-AI',
        allow: ['/', '/productos', '/guias/', '/blog'],
        disallow: ['/admin/', '/api/', '/checkout'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}