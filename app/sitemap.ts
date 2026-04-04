import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";
import { CATEGORY_HIERARCHY } from "@/lib/categories";
import { FAQ_ARTICLES } from "@/lib/faq-articles";

const siteUrl = process.env.NEXT_PUBLIC_URL || "https://laaldeatala.com.uy";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/productos`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/servicios`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/contacto`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/nosotros`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.65,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/terminos`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/privacidad`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: "https://laaldeatala.com.uy/politica-de-devoluciones",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  // Reglas de exclusión lógicas anotadas
  const EXCLUDED_PATHS = [
    '/gracias',
    '/procesando',
    '/pendiente',
    '/error',
    '/cart',
    '/checkout',
    '/wishlist',
    '/pedido',
  ];

  const categoryLastModified = new Date();
  const day = categoryLastModified.getDay();
  const diff = categoryLastModified.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
  categoryLastModified.setDate(diff);

  // Category landing pages — one per main category
  const categoryPages: MetadataRoute.Sitemap = CATEGORY_HIERARCHY.map((cat) => ({
    url: `${siteUrl}/productos?${new URLSearchParams({ categoria: cat.value }).toString()}`,
    lastModified: categoryLastModified,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  // Guide pages — dynamically from FAQ_ARTICLES
  const guidePages: MetadataRoute.Sitemap = FAQ_ARTICLES.map((article) => ({
    url: `${siteUrl}/guias/${article.slug}`,
    lastModified: article.dateModified ? new Date(article.dateModified) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  // DB-managed guide pages from Supabase
  let dbGuidePages: MetadataRoute.Sitemap = [];
  try {
    const { data: dbGuides, error: dbGuidesError } = await supabase
      .from("guides")
      .select("slug, date_modified")
      .eq("is_published", true) as { data: any[] | null; error: any };

    if (!dbGuidesError && dbGuides && Array.isArray(dbGuides)) {
      const staticSlugs = new Set(FAQ_ARTICLES.map(a => a.slug));
      dbGuidePages = dbGuides
        .filter((g: { slug: string }) => !staticSlugs.has(g.slug))
        .map((g: { slug: string; date_modified: string | null }) => ({
          url: `${siteUrl}/guias/${g.slug}`,
          lastModified: g.date_modified ? new Date(g.date_modified) : new Date(),
          changeFrequency: "monthly" as const,
          priority: 0.75,
        }));
    }
  } catch {
    // If guides table doesn't exist yet, continue without DB guides
  }

  // Dynamic product pages from Supabase
  let productPages: MetadataRoute.Sitemap = [];

  try {
    const { data: products, error } = await supabase
      .from("products")
      .select("slug, updated_at")
      .eq("is_active", true)
      .order("updated_at", { ascending: false }) as { data: any[] | null; error: any };

    if (!error && products && Array.isArray(products)) {
      productPages = products
        .filter((product: { slug: string; updated_at: string | null }) => product.slug && product.slug.length > 0)
        .map((product: { slug: string; updated_at: string | null }) => ({
          url: `${siteUrl}/productos/${product.slug}`,
          lastModified: product.updated_at
            ? new Date(product.updated_at)
            : new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.8,
        }));
    }
  } catch (error) {
    // If Supabase fails, continue with static pages only
    console.error("Error fetching products for sitemap:", error);
  }

  return [...staticPages, ...categoryPages, ...guidePages, ...dbGuidePages, ...productPages];
}