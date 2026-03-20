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
          // Páginas de pedido individual (ya tienen noindex pero reforzar)
          '/pedido/',
          // Parámetros de refinamiento que generan duplicados
          // Nota: la sintaxis con * varía según el bot,
          // el noindex en metadata es el mecanismo principal.
          // Este bloque es refuerzo para bots que lo respetan (Googlebot sí lo hace).
        ],
      },
      // Permitir bots de AI ver contenido público (opcional — algunos lo bloquean todo)
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