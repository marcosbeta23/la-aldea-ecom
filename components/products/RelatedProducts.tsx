import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/database';
import { ArrowRight } from 'lucide-react';

interface RelatedProductsProps {
  products: Product[];
}

export default function RelatedProducts({ products }: RelatedProductsProps) {
  const formatPrice = (price: number, currency: string = 'UYU') => {
    if (currency === 'USD') {
      return `US$ ${price.toLocaleString('es-UY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$ ${price.toLocaleString('es-UY', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Productos relacionados</h2>
          <Link
            href="/productos"
            className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            Ver más
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/productos/${product.sku}`}
              className="group"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 mb-3">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                    Sin imagen
                  </div>
                )}
              </div>
              <h3 className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">
                {product.name}
              </h3>
              <p className="text-lg font-bold text-slate-900">
                {formatPrice(product.price_numeric, product.currency)}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
