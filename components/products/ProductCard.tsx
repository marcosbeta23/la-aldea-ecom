'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Check, AlertCircle, MessageCircle } from 'lucide-react';
import { Product } from '@/types/database';
import { useCartStore } from '@/stores/cartStore';
import WishlistButton from '@/components/common/WishlistButton';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
  priority?: boolean; // For image loading priority
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addItem, isInCart } = useCartStore();
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const inCart = isInCart(product.id);
  const inStock = product.stock > 0;
  const isOnRequest = product.availability_type === 'on_request';
  // lowStock removed — most products have 1-10 stock, making the alert appear everywhere

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!inStock || isOnRequest) return;
    
    setError(null);
    const result = addItem(product, 1);
    
    if (result.success) {
      setIsAdding(true);
      setTimeout(() => setIsAdding(false), 1000);
    } else {
      setError(result.message || 'Error al agregar');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Format price for display
  const formatPrice = (price: number, currency: string = 'UYU') => {
    if (currency === 'USD') {
      return `US$ ${price.toLocaleString('es-UY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$ ${price.toLocaleString('es-UY', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return (
    <Link 
      href={`/productos/${product.sku}`}
      className="group relative flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-0.5"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        {product.images && product.images.length > 0 ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            priority={priority}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-slate-100">
            <span className="text-slate-400">Sin imagen</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.discount_percentage && product.discount_percentage > 0 && (
            <span className="px-2 py-0.5 text-[10px] font-bold bg-green-600 text-white rounded-full">
              -{product.discount_percentage}%
            </span>
          )}
          {product.sold_count >= 10 && (
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-500 text-white rounded-full">
              Popular
            </span>
          )}
          {!inStock && !isOnRequest && (
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-800 text-white rounded-full">
              Agotado
            </span>
          )}
          {isOnRequest && (
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-purple-600 text-white rounded-full">
              Consultar
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full shadow-lg">
          <WishlistButton productId={product.id} size="sm" />
        </div>

        {/* Quick Add to Cart - appears on hover (not for on_request) */}
        {!isOnRequest && (
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          {error && (
            <div className="mb-2 flex items-center gap-1 text-xs bg-red-500 text-white px-2 py-1 rounded-lg">
              <AlertCircle className="h-3 w-3" />
              {error}
            </div>
          )}
          <button
            onClick={handleAddToCart}
            disabled={!inStock || isAdding}
            className={`
              w-full flex items-center justify-center gap-1.5 py-2 rounded-lg font-medium text-xs
              transition-all duration-200
              ${inStock
                ? inCart || isAdding
                  ? 'bg-green-500 text-white'
                  : 'bg-white text-slate-900 hover:bg-green-500 hover:text-white'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }
            `}
          >
            {isAdding ? (
              <>
                <Check className="h-4 w-4" />
                ¡Agregado!
              </>
            ) : inCart ? (
              <>
                <Check className="h-4 w-4" />
                En el carrito
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" />
                Agregar al carrito
              </>
            )}
          </button>
        </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3">
        {/* Category & Brand */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {(Array.isArray(product.category) ? product.category : [product.category].filter(Boolean)).map((cat: string) => (
            <span key={cat} className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              {cat}
            </span>
          ))}
          {product.brand && (
            <span className="text-xs text-slate-500">
              {product.brand}
            </span>
          )}
        </div>

        {/* Name */}
        <h3 className="text-sm font-semibold text-slate-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>

        {/* Price & Stock */}
        <div className="mt-auto flex items-end justify-between">
          {isOnRequest ? (
            <div className="flex items-center gap-1.5 text-purple-600">
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm font-semibold">Consultar</span>
            </div>
          ) : (
          <div>
            {product.original_price_numeric && product.discount_percentage ? (
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 line-through">
                  {formatPrice(product.original_price_numeric, product.currency)}
                </span>
                <span className="text-lg font-bold text-green-600">
                  {formatPrice(product.price_numeric, product.currency)}
                </span>
              </div>
            ) : (
              <span className="text-lg font-bold text-slate-900">
                {formatPrice(product.price_numeric, product.currency)}
              </span>
            )}
          </div>
          )}
          
          {inStock && !isOnRequest && (
            <span className="text-xs font-medium text-green-600">
              En stock
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
