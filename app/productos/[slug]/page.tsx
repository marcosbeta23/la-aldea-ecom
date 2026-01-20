import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { supabaseAdmin } from '@/lib/supabase';
import { Product, ProductReview } from '@/types/database';
import Header from '@/components/Header';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import ProductGallery from '@/components/products/ProductGallery';
import ProductInfo from '@/components/products/ProductInfo';
import ProductReviews from '@/components/products/ProductReviews';
import RelatedProducts from '@/components/products/RelatedProducts';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

// Generate metadata for SEO
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

  return {
    title: product.name,
    description: product.description || `Compra ${product.name} en La Aldea. Envíos a todo Uruguay.`,
    openGraph: {
      title: `${product.name} | La Aldea`,
      description: product.description || `Compra ${product.name} en La Aldea`,
      images: product.images?.length > 0 ? [product.images[0]] : [],
      type: 'website',
    },
    alternates: {
      canonical: `/productos/${slug}`,
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
    .eq('is_active', true)
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
  if (product.category) {
    const { data: relatedData } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('category', product.category)
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

  // JSON-LD Schema
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
      url: `https://laaldeatala.com.uy/productos/${slug}`,
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header />

      <main className="min-h-screen bg-slate-50 pt-20 lg:pt-24">
        {/* Breadcrumbs */}
        <div className="container mx-auto px-4 py-4">
          <Breadcrumbs
            items={[
              { name: 'Inicio', url: '/' },
              { name: 'Productos', url: '/productos' },
              ...(product.category ? [{ name: product.category, url: `/productos?categoria=${encodeURIComponent(product.category)}` }] : []),
              { name: product.name },
            ]}
          />
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
