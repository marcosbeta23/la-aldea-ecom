'use client';

import dynamic from 'next/dynamic';
import type { Product } from "@/types/database";

const FeaturedCarousel = dynamic(
  () => import('@/components/products/FeaturedCarousel'),
  {
    loading: () => (
      <div className="flex gap-4 overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="min-w-[220px] h-[280px] bg-slate-100 rounded-2xl animate-pulse shrink-0" />
        ))}
      </div>
    ),
  }
);

const LazyMap = dynamic(() => import("@/components/ui/LazyMap"), {
  ssr: false,
  loading: () => <div className="mt-8 h-[400px] w-full bg-slate-100 animate-pulse rounded-3xl" />,
});

export default function ClientHomePageElements({ featuredProducts }: { featuredProducts: Product[] }) {
  return (
    <>
      {featuredProducts.length > 0 && (
        <section className="relative z-10 bg-white py-12 md:py-14">
          <div className="container mx-auto px-4">
             {/* Header matches app/page.tsx logic */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
                  Productos Destacados
                </h2>
              </div>
            </div>
            <FeaturedCarousel products={featuredProducts} />
          </div>
        </section>
      )}
      
      <div className="container mx-auto px-4 pb-16">
        <LazyMap />
      </div>
    </>
  );
}
