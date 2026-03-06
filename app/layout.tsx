import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import { ClerkProvider } from "@clerk/nextjs";
import { esES } from "@clerk/localizations";
import "./globals.css";
import { Analytics } from "@/components/Analytics";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import CookieConsent from "@/components/common/CookieConsent";
import CartDrawer from "@/components/cart/CartDrawer";
import FloatingWhatsApp from "@/components/common/FloatingWhatsApp";
import Footer from "@/components/Footer";
import { PostHogProvider } from "@/components/PostHogProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
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
    default: "La Aldea - Bombas de Agua, Riego e Instalaciones Hidráulicas | Tala, Uruguay",
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
    title: "La Aldea - Instalaciones Hidráulicas, bombas de agua, insumos agrícolas, Hidraulica, droguería, herramientas y más.",
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
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
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
    "business:contact_data:phone_number": "+59892744725",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  return (
    <ClerkProvider localization={esES}>
      <html lang="es">
        <head>
          {/* Preconnect to external origins */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://www.googletagmanager.com" />
          
          {/* DNS prefetch for performance */}
          <link rel="dns-prefetch" href="https://supabase.co" />
          <link rel="dns-prefetch" href="https://api.mercadopago.com" />
          <link rel="dns-prefetch" href="https://us.i.posthog.com" />
        </head>
        <body className={`${inter.variable} font-sans antialiased`}>
          {/* WebSite schema with SearchAction for Google sitelinks searchbox */}
          <script
            type="application/ld+json"
            nonce={nonce}
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "La Aldea",
                "url": siteUrl,
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": `${siteUrl}/productos?q={search_term_string}`,
                  },
                  "query-input": "required name=search_term_string",
                },
              }),
            }}
          />
          <PostHogProvider>
            {children}
            <Footer />
            <CartDrawer />
          </PostHogProvider>
          <Analytics nonce={nonce} />
          <VercelAnalytics />
          <SpeedInsights />
          <CookieConsent />
          <FloatingWhatsApp />
        </body>
      </html>
    </ClerkProvider>
  );
}
