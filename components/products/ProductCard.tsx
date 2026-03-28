'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Check, AlertCircle, MessageCircle, CreditCard } from 'lucide-react';
import { Product } from '@/types/database';
import { useCartStore } from '@/stores/cartStore';
import { WHATSAPP_PHONE } from '@/lib/constants';
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
  const isOnRequest = product.availability_type === 'on_request' || product.price_numeric === 0 || product.price_numeric === 9999;
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
      return `U$S ${price.toLocaleString('es-UY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$ ${price.toLocaleString('es-UY', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return (
    <Link
      href={`/productos/${product.slug ?? product.sku}`}
      className="group relative flex flex-col bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 hover:border-blue-200"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-b from-slate-50 to-white">
        {product.images && product.images.length > 0 ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            priority={priority}
            quality={80}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-slate-100">
            <span className="text-slate-400">Sin imagen</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.discount_percentage && product.discount_percentage > 0 && (
            <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-wide bg-green-500/90 backdrop-blur-md text-white rounded-full shadow-sm">
              -{product.discount_percentage}%
            </span>
          )}
          {product.sold_count >= 10 && (
            <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-wide bg-amber-500/90 backdrop-blur-md text-white rounded-full shadow-sm">
              ✨ POPULAR
            </span>
          )}
          {!inStock && !isOnRequest && (
            <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-wide bg-slate-800/90 backdrop-blur-md text-white rounded-full shadow-sm">
              AGOTADO
            </span>
          )}
          {isOnRequest && (
            <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-wide bg-purple-600/90 backdrop-blur-md text-white rounded-full shadow-sm">
              CONSULTAR
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full shadow-lg">
          <WishlistButton productId={product.id} size="sm" />
        </div>

        {/* Quick Add to Cart - appears on hover (not for on_request) */}
        {!isOnRequest && (
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 via-black/40 to-transparent opacity-0 translate-y-2 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            {error && (
              <div className="mb-2 flex items-center gap-1.5 text-[11px] font-medium tracking-wide bg-red-500/90 backdrop-blur-sm text-white px-2.5 py-1.5 rounded-lg shadow-sm">
                <AlertCircle className="h-3.5 w-3.5" />
                {error}
              </div>
            )}
            <button
              onClick={handleAddToCart}
              disabled={!inStock || isAdding}
              className={`
              w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-xs tracking-wide shadow-sm
              transition-all duration-300 active:scale-[0.98]
              ${inStock
                  ? inCart || isAdding
                    ? 'bg-green-500 text-white border border-green-400'
                    : 'bg-white text-slate-800 hover:bg-blue-600 hover:text-white hover:border-transparent'
                  : 'bg-slate-100/80 backdrop-blur-md border border-white/20 text-slate-500 cursor-not-allowed'
                }
            `}
            >
              {isAdding ? (
                <>
                  <Check className="h-4 w-4" />
                  AGREGANDO...
                </>
              ) : inCart ? (
                <>
                  <Check className="h-4 w-4" />
                  EN EL CARRITO
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  AGREGAR AL CARRITO
                </>
              )}
            </button>
          </div>
        )}
      </div>


      {/* Content (fixed min/max height for consistency) */}
      <div className="flex flex-col flex-1 p-4 min-h-35 max-h-40 bg-white">
        {/* Category & Brand (show only first category) */}
        <div className="flex items-center gap-2 mb-2 flex-nowrap min-h-6">
          {(() => {
            const cats = Array.isArray(product.category) ? product.category : [product.category].filter(Boolean);
            return cats.length > 0 ? (
              <span key={cats[0]} className="text-[11px] font-bold tracking-wide text-blue-600 bg-blue-50/80 px-2 py-0.5 rounded-full max-w-22.5 truncate uppercase">
                {cats[0]}
              </span>
            ) : null;
          })()}
          {product.brand && (
            <span className="text-[11px] font-medium tracking-wide text-slate-400 max-w-17.5 truncate uppercase">
              {product.brand}
            </span>
          )}
        </div>

        {/* Name (clamp to 1 line) */}
        <h3 className="text-[15px] leading-tight font-bold text-slate-800 mb-1.5 truncate group-hover:text-blue-600 transition-colors max-w-full">
          {product.name}
        </h3>

        {/* Price & Stock */}
        <div className="mt-auto flex items-end justify-between">
          {isOnRequest && !product.show_price_on_request ? (
            <div className="flex items-center gap-1.5 text-purple-600">
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm font-bold tracking-wide">CONSULTAR</span>
            </div>
          ) : (
            <div>
              {product.original_price_numeric && product.discount_percentage ? (
                <div className="flex flex-col">
                  <span className="text-[11px] font-medium text-slate-400 line-through">
                    {formatPrice(product.original_price_numeric, product.currency)}
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[19px] font-black tracking-tight text-green-600 leading-none">
                      {formatPrice(product.price_numeric, product.currency)}
                    </span>
                    {isOnRequest && (
                      <span className="text-[9px] font-black text-purple-600 uppercase tracking-wider relative -top-1">CONSULTA</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col">
                  <span className="text-[19px] font-black tracking-tight text-slate-900 leading-none">
                    {formatPrice(product.price_numeric, product.currency)}
                  </span>
                  {isOnRequest && (
                    <span className="text-[9px] font-black text-purple-600 uppercase tracking-wider mt-1">CONSULTA</span>
                  )}
                </div>
              )}
            </div>
          )}

          {inStock && !isOnRequest && (
            <span className="text-xs font-medium text-green-600">
              En stock
            </span>
          )}
        </div>

        {/* Installment hint for higher-price items */}
        {inStock && !isOnRequest && product.price_numeric >= 3000 && (
          <div className="flex items-center gap-1 mt-1 text-[11px] text-green-700">
            <CreditCard className="h-3 w-3" />
            <span>12 cuotas de {formatPrice(Math.ceil(product.price_numeric / 12), product.currency)}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
