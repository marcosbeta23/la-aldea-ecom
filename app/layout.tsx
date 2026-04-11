import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Fraunces, Epilogue, DM_Mono } from "next/font/google";
import { headers } from "next/headers";
import { WHATSAPP_PHONE } from "@/lib/constants";
import "./globals.css";
import { Analytics } from "@/components/Analytics";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import { PostHogProvider } from "@/components/PostHogProvider";
import ClientLayoutElements from "@/components/layout/ClientLayoutElements";
import ConditionalFooter from "@/components/layout/ConditionalFooter";

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["700", "900"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
  display: "swap",
});

const epilogue = Epilogue({
  variable: "--font-epilogue",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

// Base URL for production
const siteUrl = process.env.NEXT_PUBLIC_URL || "https://laaldeatala.com.uy";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#1e40af",
};

export const metadata: Metadata = {
  // Basic metadata
  title: {
    default: "La Aldea | Bombas, Riego e Hidráulica Uruguay",
    template: "%s | La Aldea",
  },
  description:
    "Bombas de agua y sistemas de riego en Tala y Canelones. Instalaciones hidráulicas, insumos agrícolas, droguería y herramientas. Envíos e instalaciones en todo Uruguay.",

  // Keywords (60+ terms)
  keywords: [
    // Primary keywords
    "bombas de agua Tala",
    "bombas de agua Canelones",
    "riego Tala",
    "riego Canelones",
    "insumos agrícolas Tala",
    "sistemas de riego",
    "instalaciones hidráulicas",
    // Business keywords
    "droguería",
    "agropecuaria",
    "filtros de agua",
    "tanques de agua",
    "piscinas",
    "mantenimiento de piscinas",
    "energías renovables",
    "paneles solares",
    "ferretería",
    "herramientas",
    // Brand keywords
    "La Aldea",
    "Martín Betancor",
    "Gianni",
    "DIU",
    "Tigre",
    "Nicoll",
    "Hidroservice",
    "Pacifil",
    "Cablinur",
    "Lesa",
    "Ramasil",
    "Balaguer",
    "Armco",
    "droguería Industrial Uruguaya",
    "Uruguay",
    // Technical/long-tail keywords
    "cómo elegir bomba agua",
    "criterios selección bomba",
    "cálculo caudal bomba",
    "cálculo presión agua",
    "profundidad pozo",
    "selección bomba para riego",
    "guía compra bomba agua",
    "tipos bombas agua comparativa",
    "bombas sumergibles vs superficie",
    "características bombas centrífugas",
    "diferencias bombas agua",
    "ventajas bombas sumergibles",
    "diseño riego agrícola Canelones",
    "instalación riego para cultivos",
    "planificación riego profesional",
    "diseño riego por goteo",
    "diseño riego por aspersión",
    "sistemas riego para agricultura",
    "proyectos riego agrícola",
    "optimización agua agricultura",
    "beneficios sistemas riego",
    "ahorro agua riego",
    "productividad agrícola",
    "eficiencia hídrica",
    "automatización riego",
    "mantenimiento piscinas",
    "filtros piscinas",
    "bombas piscinas",
    "cloro",
    "clarificante",
    "alguicida",
  ],

  // Authors and creator
  authors: [{ name: "La Aldea", url: siteUrl }],
  creator: "La Aldea",
  publisher: "La Aldea",

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Canonical URL
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },

  // Open Graph
  openGraph: {
    type: "website",
    locale: "es_UY",
    url: siteUrl,
    siteName: "La Aldea Tala",
    title: "La Aldea Tala — Riego, Bombas e Hidráulica en Uruguay",
    description: "Todo lo que necesitas para tu campo, hogar y piscina en un solo lugar.",
    images: [
      {
        url: `${siteUrl}/assets/images/og-image.webp`,
        width: 1200,
        height: 630,
        alt: "La Aldea - Tala, Uruguay",
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "La Aldea - Insumos agrícolas y más en Tala",
    description: "Todo lo que necesitas para tu campo, hogar y piscina en un solo lugar.",
    images: [`${siteUrl}/assets/images/og-image.webp`],
  },

  // Verification codes
  verification: {
    google: "lYJjPHSWvPfp-ESChiwEme_s9RdmfrhvfC5fI2fISAM",
    other: {
      "apple-domain-verification": "Vo2ZeNKsls8_cQR8YtG5xHrrsJ23CVo4iKlzltep5LQ",
    },
  },

  // Icons
  icons: {
    icon: [
      { url: "/assets/images/favicon/favicon.ico", sizes: "any" },
      { url: "/assets/images/favicon/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [{ url: "/assets/images/favicon/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: "/assets/images/favicon/favicon.ico",
  },

  // Manifest
  manifest: "/site.webmanifest",

  // Category
  category: "E-commerce",

  // Other metadata
  other: {
    // Geographic meta tags
    "geo.region": "UY",
    "geo.placename": "Tala, Canelones, Uruguay",
    "geo.position": "-34.346943768995686;-55.76359424741334",
    ICBM: "-34.346943768995686, -55.76359424741334",
    "DC.coverage": "Uruguay",
    distribution: "global",

    // Business contact data (Facebook)
    "business:contact_data:street_address": "José Alonso y Trelles y Av Artigas",
    "business:contact_data:locality": "Tala",
    "business:contact_data:region": "Canelones",
    "business:contact_data:postal_code": "91800",
    "business:contact_data:country_name": "Uruguay",
    "business:contact_data:phone_number": `+${WHATSAPP_PHONE}`,
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://laaldeatala.com.uy/#website",
  name: "La Aldea",
  url: "https://laaldeatala.com.uy",
  description: "Bombas de agua, riego, herramientas e insumos agrícolas en Tala, Uruguay",
  publisher: {
    "@id": "https://laaldeatala.com.uy/#business",
  },
  inLanguage: "es-UY",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://laaldeatala.com.uy/productos?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "Store", "HardwareStore"],
  "@id": "https://laaldeatala.com.uy/#business",
  name: "La Aldea",
  description:
    "Bombas de agua, sistemas de riego, instalaciones hidráulicas, insumos agrícolas y droguería en Tala, Canelones, Uruguay. Más de 25 años de experiencia.",
  url: "https://laaldeatala.com.uy",
  telephone: `+${WHATSAPP_PHONE}`,
  email: "contacto@laaldeatala.com.uy",
  foundingDate: "1999",
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
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday"],
      opens: "08:00",
      closes: "18:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "08:30",
      closes: "12:00",
    },
  ],
  priceRange: "$$",
  areaServed: { "@type": "Country", name: "Uruguay" },
  sameAs: [
    "https://www.facebook.com/laaldeatala",
    "https://www.instagram.com/laaldeatala/",
    "https://maps.app.goo.gl/4oUish4o13iMrJ2c9",
  ],
  hasMap: "https://www.google.com/maps?q=-34.346943768995686,-55.76359424741334",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  return (
    <html lang="es">
      <head>
        <Script
          id="crazy-egg"
          type="text/javascript"
          src="//script.crazyegg.com/pages/scripts/0132/5723.js"
          async
          strategy="lazyOnload"
          nonce={nonce}
        />

        {/* DNS prefetch for performance */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://supabase.co" />
        <link rel="dns-prefetch" href="https://api.mercadopago.com" />
        <link rel="dns-prefetch" href="https://us.i.posthog.com" />

        {/* Cloudflare Web Analytics */}
        <Script
          strategy="lazyOnload"
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "21ea1d19b9c54b8c9007050f4de4edc8"}'
          nonce={nonce}
        />
        {/* End Cloudflare Web Analytics */}

      </head>
      <body className={`${barlowCondensed.variable} ${fraunces.variable} ${epilogue.variable} ${dmMono.variable} font-sans antialiased`}>
        {/* WebSite schema with SearchAction for Google sitelinks searchbox */}
        <script
          type="application/ld+json"
          nonce={nonce}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        {/* LocalBusiness schema — global for Knowledge Panel & Google Maps */}
        <script
          type="application/ld+json"
          nonce={nonce}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        {children}
        <ConditionalFooter />
        <ClientLayoutElements />
        <PostHogProvider />
        <Analytics nonce={nonce} />
        <VercelAnalytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
