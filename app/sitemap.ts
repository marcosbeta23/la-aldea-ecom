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
      url: `${siteUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/contacto`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  // Category landing pages — one per main category
  const categoryPages: MetadataRoute.Sitemap = CATEGORY_HIERARCHY.map((cat) => ({
    url: `${siteUrl}/productos?categoria=${encodeURIComponent(cat.value)}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  // Guide pages — dynamically from FAQ_ARTICLES
  const guidePages: MetadataRoute.Sitemap = FAQ_ARTICLES.map((article) => ({
    url: `${siteUrl}/guias/${article.slug}`,
    lastModified: article.dateModified ? new Date(article.dateModified) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Dynamic product pages from Supabase
  let productPages: MetadataRoute.Sitemap = [];

  try {
    const { data: products, error } = await supabase
      .from("products")
      .select("slug, updated_at")
      .eq("is_active", true)
      .order("updated_at", { ascending: false }) as { data: any[] | null; error: any };

    if (!error && products && Array.isArray(products)) {
      productPages = products.map((product: { slug: string; updated_at: string | null }) => ({
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

  return [...staticPages, ...categoryPages, ...guidePages, ...productPages];
}
