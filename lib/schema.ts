// lib/schema.ts
// Centralized schema.org JSON-LD helpers — import these instead of duplicating

const SITE_URL = process.env.NEXT_PUBLIC_URL || "https://laaldeatala.com.uy";
import { WHATSAPP_PHONE } from "./constants";

export const BUSINESS_ID = `${SITE_URL}/#business`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

// Shared business entity — referenced by @id in other schemas
export const businessEntity = {
  "@type": ["HardwareStore", "HomeAndConstructionBusiness"],
  "@id": BUSINESS_ID,
  name: "La Aldea",
  telephone: `+${WHATSAPP_PHONE}`,
  email: "la.aldeamartinbetancor@gmail.com",
  url: SITE_URL,
  address: {
    "@type": "PostalAddress",
    streetAddress: "José Alonso y Trelles y Av Artigas",
    addressLocality: "Tala",
    addressRegion: "Canelones",
    postalCode: "91800",
    addressCountry: "UY",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: -34.346943768995686,
    longitude: -55.76359424741334,
  },
};

// BreadcrumbList builder
export function breadcrumbSchema(items: { name: string; url?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.url && { item: `${SITE_URL}${item.url}` }),
    })),
  };
}

// Product breadcrumb shortcut
export function productBreadcrumb(
  productName: string,
  productSlug: string,
  mainCategory?: string | null
) {
  return breadcrumbSchema([
    { name: "Inicio", url: "/" },
    { name: "Productos", url: "/productos" },
    ...(mainCategory
      ? [
          { name: mainCategory, url: `/productos?category=${encodeURIComponent(mainCategory)}` },
          { name: productName, url: `/productos/${productSlug}` },
        ]
      : [{ name: productName, url: `/productos/${productSlug}` }]),
  ]);
}

// Category page breadcrumb
export function categoryBreadcrumb(categoryName: string) {
  return breadcrumbSchema([
    { name: "Inicio", url: "/" },
    { name: "Productos", url: "/productos" },
    { name: categoryName },
  ]);
}