import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { supabaseAdmin } from '@/lib/supabase';
import { Product, ProductReview } from '@/types/database';
import Header from '@/components/Header';
import BackToProductsLink from '@/components/products/BackToProductsLink';
import ProductGallery from '@/components/products/ProductGallery';
import ProductInfo from '@/components/products/ProductInfo';
import ProductReviews from '@/components/products/ProductReviews';
import RelatedProducts from '@/components/products/RelatedProducts';
import { productBreadcrumb } from '@/lib/schema';
import { WHATSAPP_PHONE } from '@/lib/constants';
import { getCategoryPath } from '@/lib/category-slugs';

export const dynamicParams = true; // explicitly allow on-demand slugs

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

const siteUrl = process.env.NEXT_PUBLIC_URL || 'https://laaldeatala.com.uy';

// Generate metadata for SEO + Open Graph + Twitter Cards
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    
    const { data } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('slug', slug)
      .single();

    const product = data as Product | null;

    if (!product) {
      return { title: 'Producto no encontrado' };
    }

    const productUrl = `${siteUrl}/productos/${slug}`;
    const productImage = product.images?.length > 0 
      ? product.images[0].startsWith('http') 
        ? product.images[0] 
        : `${siteUrl}${product.images[0]}`
      : `${siteUrl}/assets/images/og-image.webp`;

    // Keep room for the global title template suffix: " | La Aldea" (11 chars)
    const maxNameLength = 49;
    const seoTitle = product.name.length > maxNameLength
      ? `${product.name.slice(0, maxNameLength - 3)}...`
      : product.name;
    
    // Create SEO-optimized description
    const seoDescription = product.description 
      ? product.description.slice(0, 155) + (product.description.length > 155 ? '...' : '')
      : [
          `Comprá ${product.name}`,
          product.brand ? `marca ${product.brand}` : null,
          'en La Aldea Agroinsumos, Tala, Canelones.',
          'Stock disponible, envíos a todo Uruguay.',
          typeof product.price_numeric === 'number' && product.price_numeric > 0
            ? `Precio: $${product.price_numeric.toLocaleString('es-UY')} UYU.`
            : 'Consultá precio y disponibilidad.',
        ].filter(Boolean).join(' ');

    return {
      title: seoTitle,
      description: seoDescription,
      
      // Open Graph (Facebook, LinkedIn, WhatsApp)
      openGraph: {
        title: `${product.name} | La Aldea`,
        description: seoDescription,
        url: productUrl,
        siteName: 'La Aldea Tala',
        locale: 'es_UY',
        type: 'article',
        images: [
          {
            url: productImage,
            width: 1200,
            height: 630,
            alt: product.name,
          },
        ],
      },
      
      // Twitter Cards
      twitter: {
        card: 'summary_large_image',
        title: `${product.name} | La Aldea`,
        description: seoDescription,
        images: [productImage],
      },
      
      // Canonical URL
      alternates: {
        canonical: productUrl,
      },
      
      // Additional SEO
      keywords: [
        product.name,
        product.brand || '',
        ...(Array.isArray(product.category) ? product.category : [product.category || '']),
        'La Aldea',
        'Tala',
        'Uruguay',
        'comprar',
        'precio',
      ].filter(Boolean),
      
      robots: {
        index: true,
        follow: true,
      },
    };
  } catch {
    return { title: 'Producto no encontrado' };
  }
}

// Generate static paths for top products (ISR)
export async function generateStaticParams() {
  const { data: products } = await supabaseAdmin
    .from('products')
    .select('slug')
    .eq('is_active', true)
    .not('slug', 'is', null)
    .limit(500);  // cover all active products for full SSG

  return (
    (products as { slug: string }[] | null)?.map((product) => ({
      slug: product.slug,
    })) || []
  );
}

// Revalidate every hour
export const revalidate = 3600;

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  
  // Fetch product with reviews
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single();

  const product = data as Product | null;

  if (error || !product || !product.is_active) {
    notFound();
  }

  // Fetch approved reviews
  const { data: reviewsData } = await supabaseAdmin
    .from('product_reviews')
    .select('*')
    .eq('product_id', product.id)
    .eq('is_approved', true)
    .order('created_at', { ascending: false });

  const reviews = (reviewsData || []) as ProductReview[];

  // Fetch related products (same category) — limit 8 for better internal link coverage
  let relatedProducts: Product[] = [];
  if (product.category && product.category.length > 0) {
    const { data: relatedData } = await supabaseAdmin
      .from('products')
      .select('*')
      .overlaps('category', product.category)
      .eq('is_active', true)
      .neq('id', product.id)
      .limit(8);
    relatedProducts = (relatedData || []) as Product[];
  }

  // Calculate average rating
  const avgRating =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  // ─── Category-based FAQ for AEO (Fix #10) ───
  const PRODUCT_FAQS: Record<string, Array<{q: string; a: (p: Product) => string}>> = {
    "Bombas": [
      {
        q: "¿Hacen envíos de bombas de agua a todo Uruguay?",
        a: () => "Sí, enviamos bombas a todo Uruguay. Para bombas grandes coordinamos flete especializado. Consultá disponibilidad por WhatsApp."
      },
      {
        q: "¿Tienen servicio técnico para bombas?",
        a: () => "Sí, contamos con servicio técnico para reparación y mantenimiento de bombas de todas las marcas que vendemos."
      },
      {
        q: "¿Cómo elijo la bomba adecuada para mi proyecto?",
        a: () => "Considerá profundidad del agua, caudal necesario, presión requerida y alimentación eléctrica. Ofrecemos asesoramiento técnico sin cargo."
      }
    ],
    "Sumergibles": [
      {
        q: "¿Qué profundidad máxima cubre una bomba sumergible?",
        a: (p) => `La ${p.name} es una bomba sumergible${p.brand ? ` marca ${p.brand}` : ''}. Consultá la ficha técnica o escribinos por WhatsApp para el dimensionamiento exacto según tu pozo.`
      },
      {
        q: "¿Se pueden instalar bombas sumergibles con energía solar?",
        a: () => "Sí, ofrecemos kits de bombeo solar con bomba sumergible incluida. Es la solución ideal para zonas rurales sin red eléctrica."
      }
    ],
    "Hidráulica": [
      {
        q: "¿Qué materiales de cañería manejan?",
        a: () => "Trabajamos con cañerías PVC Tigre y Nicoll, conectores, válvulas y accesorios hidráulicos para todo tipo de instalación."
      },
      {
        q: "¿Hacen instalaciones hidráulicas a medida?",
        a: () => "Sí, diseñamos e instalamos sistemas hidráulicos completos para uso doméstico, agrícola e industrial en todo Uruguay."
      }
    ],
    "Piscinas": [
      {
        q: "¿Qué productos necesito para el mantenimiento de mi piscina?",
        a: () => "Los básicos son cloro granulado o en pastillas, algicida, clarificante y un kit de análisis de pH. Te asesoramos según el tamaño de tu piscina."
      },
      {
        q: "¿Cada cuánto hay que tratar el agua de la piscina?",
        a: () => "En verano con uso frecuente, chequeá cloro y pH cada 2-3 días. En invierno, una vez por semana es suficiente."
      }
    ],
    "Droguería": [
      {
        q: "¿Los productos de droguería son aptos para uso agropecuario?",
        a: () => "Sí, contamos con productos específicos para la industria agropecuaria: desinfectantes, detergentes, hipoclorito y más."
      },
      {
        q: "¿Envían productos al interior del país?",
        a: () => "Sí, coordinamos envíos especiales con embalaje adecuado para transporte seguro de productos."
      }
    ],
    "Herramientas": [
      {
        q: "¿Las herramientas tienen garantía?",
        a: () => "Sí, todas las herramientas tienen garantía del fabricante. El período varía según la marca y el tipo de herramienta."
      },
      {
        q: "¿Qué marcas de herramientas manejan?",
        a: () => "Trabajamos con marcas líderes como Lusqtoff y otras marcas profesionales seleccionadas por su calidad y durabilidad."
      }
    ],
    "Filtros": [
      {
        q: "¿Cada cuánto hay que cambiar el filtro de agua?",
        a: () => "Depende del modelo y la calidad del agua. Los filtros Gianni suelen requerir cambio de cartucho cada 3-6 meses. Te asesoramos según tu caso."
      },
      {
        q: "¿Los filtros Gianni sirven para agua de pozo?",
        a: () => "Sí, los filtros Gianni están diseñados para tratar agua de pozo, red y cisternas. Consultá el modelo adecuado según la dureza de tu agua."
      }
    ],
    "Energía Solar": [
      {
        q: "¿Los paneles solares sirven para alimentar bombas de agua?",
        a: () => "Sí, ofrecemos kits completos de bombeo solar con paneles e inversores. Es la solución ideal para zonas rurales sin conexión a la red."
      },
      {
        q: "¿Cuántos paneles solares necesito para mi bomba?",
        a: () => "Depende de la potencia de la bomba y las horas solares de tu zona. Hacemos el dimensionamiento exacto sin cargo."
      }
    ],
    "Agroquímicos": [
      {
        q: "¿Envían agroquímicos al interior de Uruguay?",
        a: () => "Sí, enviamos con embalaje adecuado para transporte seguro de productos químicos. Cumplimos con todas las normas de seguridad."
      },
      {
        q: "¿Ofrecen asesoramiento técnico sobre dosis y aplicación?",
        a: () => "Sí, el asesoramiento es sin costo. Te orientamos sobre dosis, momento de aplicación y compatibilidad según tu cultivo."
      }
    ],
  };

  const categoryFaqs = product.category
    ?.flatMap(cat => PRODUCT_FAQS[cat] || [])
    .slice(0, 3) // Max 3 questions per product
    ?? [];

  const productFaqLd = categoryFaqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: categoryFaqs.map(faq => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a(product),
      }
    }))
  } : null;

  // JSON-LD Schema — Product (consolidated offers, no more duplicate spread)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    sku: product.sku,
    mpn: product.sku,
    category: product.category?.[0] || undefined,
    brand: {
      "@type": "Brand",
      name: product.brand || "La Aldea",
    },
    manufacturer: {
      "@type": "Organization",
      "@id": "https://laaldeatala.com.uy/#business",
      name: "La Aldea",
    },
    // ✅ Single unified offers object — no more duplicate spread
    offers: {
      "@type": "Offer",
      price: product.price_numeric,
      priceCurrency: product.currency || "UYU",
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${siteUrl}/productos/${slug}`,
      priceValidUntil: new Date(Date.now() + 30 * 86400000)
        .toISOString()
        .split("T")[0],
      // ✅ priceSpecification only when there's a discount — inside offers, not overwriting it
      ...(product.original_price_numeric &&
        product.discount_percentage && {
          priceSpecification: {
            "@type": "PriceSpecification",
            price: product.price_numeric,
            priceCurrency: product.currency || "UYU",
            valueAddedTaxIncluded: true,
          },
        }),
      ...(product.stock > 0 &&
        product.stock <= 3 && {
          inventoryLevel: {
            "@type": "QuantitativeValue",
            value: product.stock,
          },
        }),
      seller: {
        "@type": "Organization",
        "@id": "https://laaldeatala.com.uy/#business",
        name: "La Aldea",
        telephone: `+${WHATSAPP_PHONE}`,
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: "0",
          currency: "UYU",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "UY",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 1,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: product.shipping_type === "freight" ? 3 : 2,
            maxValue: product.shipping_type === "freight" ? 7 : 5,
            unitCode: "DAY",
          },
        },
      },
      availableAtOrFrom: {
        "@type": "Place",
        name: "La Aldea — Tala",
        address: {
          "@type": "PostalAddress",
          streetAddress: "José Alonso y Trelles y Av Artigas",
          addressLocality: "Tala",
          addressRegion: "Canelones",
          postalCode: "91800",
          addressCountry: "UY",
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
      },
    },
    ...(reviews && reviews.length > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: avgRating.toFixed(1),
        reviewCount: reviews.length,
        bestRating: 5,
        worstRating: 1,
      },
      review: reviews.slice(0, 3).map(r => ({
        "@type": "Review",
        author: { "@type": "Person", name: r.customer_name },
        reviewRating: {
          "@type": "Rating",
          ratingValue: r.rating,
          bestRating: 5,
        },
        reviewBody: r.comment || undefined,
        datePublished: r.created_at.split("T")[0],
      })),
    }),
  };

  // JSON-LD Schema — BreadcrumbList
  const breadcrumbLd = productBreadcrumb(product.name, slug, product.category?.[0]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      {productFaqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productFaqLd) }}
        />
      )}

      <Header />

      <main className="min-h-screen bg-slate-50 pt-20 lg:pt-24">
        {/* Breadcrumbs — with filter-preserving back link */}
        <div className="container mx-auto px-4 py-4">
          <nav aria-label="Breadcrumb" className="text-sm">
            <ol className="flex items-center flex-wrap gap-1">
              <li className="flex items-center">
                <Link href="/" className="flex items-center gap-1 text-slate-600 hover:text-blue-600 hover:underline transition-colors">
                  Inicio
                </Link>
              </li>
              <li className="flex items-center">
                <span className="mx-1 text-slate-400">/</span>
                <BackToProductsLink className="text-slate-600 hover:text-blue-600 hover:underline transition-colors">
                  Productos
                </BackToProductsLink>
              </li>
              {product.category && product.category.length > 0 && (
                <li className="flex items-center">
                  <span className="mx-1 text-slate-400">/</span>
                  <Link
                    href={getCategoryPath(product.category[0])}
                    className="text-slate-600 hover:text-blue-600 hover:underline transition-colors"
                  >
                    {product.category[0]}
                  </Link>
                </li>
              )}
              <li className="flex items-center">
                <span className="mx-1 text-slate-400">/</span>
                <span className="text-slate-900 font-medium truncate max-w-[200px]">{product.name}</span>
              </li>
            </ol>
          </nav>
        </div>

        {/* Product Section */}
        <section className="container mx-auto px-4 pb-8">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-0">
              {/* Image Gallery */}
              <ProductGallery images={product.images || []} name={product.name} />

              {/* Product Info */}
              <ProductInfo
                product={product}
                avgRating={avgRating}
                reviewCount={reviews?.length || 0}
              />
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="container mx-auto px-4 py-8">
          <ProductReviews
            productId={product.id}
            reviews={reviews || []}
            avgRating={avgRating}
          />
        </section>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <section className="container mx-auto px-4 py-8">
            <RelatedProducts products={relatedProducts} />
          </section>
        )}
      </main>
    </>
  );
}
