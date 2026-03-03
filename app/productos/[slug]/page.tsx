import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { supabaseAdmin } from '@/lib/supabase';
import { Product, ProductReview } from '@/types/database';
import Header from '@/components/Header';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import BackToProductsLink from '@/components/products/BackToProductsLink';
import ProductGallery from '@/components/products/ProductGallery';
import ProductInfo from '@/components/products/ProductInfo';
import ProductReviews from '@/components/products/ProductReviews';
import RelatedProducts from '@/components/products/RelatedProducts';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

const siteUrl = process.env.NEXT_PUBLIC_URL || 'https://laaldeatala.com.uy';

// Generate metadata for SEO + Open Graph + Twitter Cards
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  
  const { data } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('sku', slug)
    .single();

  const product = data as Product | null;

  if (!product) {
    return {
      title: 'Producto no encontrado',
    };
  }

  const productUrl = `${siteUrl}/productos/${slug}`;
  const productImage = product.images?.length > 0 
    ? product.images[0].startsWith('http') 
      ? product.images[0] 
      : `${siteUrl}${product.images[0]}`
    : `${siteUrl}/assets/images/og-image.webp`;
  
  // Create SEO-optimized description
  const seoDescription = product.description 
    ? product.description.slice(0, 155) + (product.description.length > 155 ? '...' : '')
    : `Compra ${product.name} en La Aldea, Tala. ${product.brand ? `Marca ${product.brand}. ` : ''}Envíos a todo Uruguay. Precio: UYU ${product.price_numeric?.toLocaleString('es-UY')}`;

  return {
    title: product.name,
    description: seoDescription,
    
    // Open Graph (Facebook, LinkedIn, WhatsApp)
    openGraph: {
      title: `${product.name} | La Aldea`,
      description: seoDescription,
      url: productUrl,
      siteName: 'La Aldea Tala',
      locale: 'es_UY',
      type: 'website',
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
}

// Generate static paths for top products (ISR)
export async function generateStaticParams() {
  const { data: products } = await supabaseAdmin
    .from('products')
    .select('sku')
    .eq('is_active', true)
    .limit(50);

  return (
    (products as Pick<Product, 'sku'>[] | null)?.map((product) => ({
      slug: product.sku,
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
    .eq('sku', slug)
    .single();

  const product = data as Product | null;

  if (error || !product) {
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

  // Fetch related products (same category)
  let relatedProducts: Product[] = [];
  if (product.category && product.category.length > 0) {
    const { data: relatedData } = await supabaseAdmin
      .from('products')
      .select('*')
      .overlaps('category', product.category)
      .eq('is_active', true)
      .neq('id', product.id)
      .limit(4);
    relatedProducts = (relatedData || []) as Product[];
  }

  // Calculate average rating
  const avgRating =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  // JSON-LD Schema — Product
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'La Aldea',
    },
    offers: {
      '@type': 'Offer',
      price: product.price_numeric,
      priceCurrency: 'UYU',
      availability:
        product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      url: `${siteUrl}/productos/${slug}`,
      seller: {
        '@type': 'Organization',
        name: 'La Aldea',
        telephone: '+598-92-744-725',
      },
    },
    ...(reviews &&
      reviews.length > 0 && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: avgRating.toFixed(1),
          reviewCount: reviews.length,
          bestRating: 5,
          worstRating: 1,
        },
      }),
  };

  // JSON-LD Schema — BreadcrumbList
  const mainCategory = product.category?.[0] || null;
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Productos',
        item: `${siteUrl}/productos`,
      },
      ...(mainCategory
        ? [
            {
              '@type': 'ListItem',
              position: 3,
              name: mainCategory,
              item: `${siteUrl}/productos?categoria=${encodeURIComponent(mainCategory)}`,
            },
            {
              '@type': 'ListItem',
              position: 4,
              name: product.name,
              item: `${siteUrl}/productos/${slug}`,
            },
          ]
        : [
            {
              '@type': 'ListItem',
              position: 3,
              name: product.name,
              item: `${siteUrl}/productos/${slug}`,
            },
          ]),
    ],
  };

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

      <Header />

      <main className="min-h-screen bg-slate-50 pt-20 lg:pt-24">
        {/* Breadcrumbs — with filter-preserving back link */}
        <div className="container mx-auto px-4 py-4">
          <nav aria-label="Breadcrumb" className="text-sm">
            <ol className="flex items-center flex-wrap gap-1">
              <li className="flex items-center">
                <a href="/" className="flex items-center gap-1 text-slate-600 hover:text-blue-600 hover:underline transition-colors">
                  Inicio
                </a>
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
                  <a
                    href={`/productos?categoria=${encodeURIComponent(product.category[0])}`}
                    className="text-slate-600 hover:text-blue-600 hover:underline transition-colors"
                  >
                    {product.category[0]}
                  </a>
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
