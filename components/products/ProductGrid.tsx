import { Product } from '@/types/database';
import ProductCard from './ProductCard';
import ProductCardSkeleton from '@/components/ui/ProductCardSkeleton';
import { PackageX } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
}

export default function ProductGrid({ products, loading = false }: ProductGridProps) {
  // Loading skeleton
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Empty state
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <PackageX className="h-10 w-10 text-slate-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">
          No encontramos productos
        </h3>
        <p className="text-slate-500 max-w-md">
          Intentá cambiar los filtros o buscar con otros términos.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
      {products.map((product, index) => (
        <ProductCard 
          key={product.id} 
          product={product} 
          priority={index < 4}
        />
      ))}
    </div>
  );
}
