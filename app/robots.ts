import type { MetadataRoute } from 'next';

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
          '/cdn-cgi/',
          // Páginas de pedido individual
          '/pedido/',
          // Parámetros de búsqueda — ya tienen noindex en metadata pero esto refuerza
          // para evitar que Google gaste crawl budget en URLs sin valor SEO
          '/*?q=',
          // Parámetro legacy (inglés) de versiones antiguas del código
          '/*?category=',
          // Parámetro legado en español (ahora redirige a /productos/categoria/[slug])
          '/*?categoria=',
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
      // Bloquear crawlers de scraping/auditoría que consumen CPU sin aportar SEO real.
      {
        userAgent: 'SemrushBot',
        disallow: ['/'],
      },
      {
        userAgent: 'AhrefsBot',
        disallow: ['/'],
      },
      {
        userAgent: 'DotBot',
        disallow: ['/'],
      },
      {
        userAgent: 'MJ12bot',
        disallow: ['/'],
      },
      {
        userAgent: 'PetalBot',
        disallow: ['/'],
      },
      {
        userAgent: 'DataForSeoBot',
        disallow: ['/'],
      },
      {
        userAgent: 'BLEXBot',
        disallow: ['/'],
      },
      {
        userAgent: 'MegaIndex',
        disallow: ['/'],
      },
      {
        userAgent: 'linkdexbot',
        disallow: ['/'],
      },
      {
        userAgent: 'CCBot',
        disallow: ['/'],
      },
    ],
    // sitemap-images.xml no se declara aquí para evitar que Ahrefs y otros tools
    // reporten URLs duplicadas ("page in multiple sitemaps").
    // El image sitemap sigue disponible en /sitemap-images.xml y puede enviarse
    // manualmente a Google Search Console si se necesita.
    sitemap: [
      'https://laaldeatala.com.uy/sitemap.xml',
    ],
  };
}
