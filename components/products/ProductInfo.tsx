'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Heart, Check, Minus, Plus, Truck, Shield, Star, AlertCircle, MessageCircle, Share2, CreditCard, RotateCcw, AlertTriangle } from 'lucide-react';
import { Product } from '@/types/database';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { trackViewItem, trackAddToCart as trackAddToCartGA4 } from '@/components/Analytics';
import { trackProductView, trackAddToCart as trackAddToCartPH } from '@/lib/analytics';

interface ProductInfoProps {
  product: Product;
  avgRating: number;
  reviewCount: number;
}

export default function ProductInfo({ product, avgRating, reviewCount }: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showStickyCart, setShowStickyCart] = useState(false);

  const { addItem, isInCart } = useCartStore();
  const { toggleItem, isInWishlist } = useWishlistStore();

  const inCart = isInCart(product.id);
  const inWishlist = isInWishlist(product.id);
  const inStock = product.stock > 0;
  const lowStock = product.stock > 0 && product.stock <= 5;
  const isOnRequest = product.availability_type === 'on_request';

  // Track view_item event (GA4) and product_view (PostHog) on mount
  useEffect(() => {
    trackViewItem({
      id: product.id,
      name: product.name,
      price: product.price_numeric,
      category: product.category?.[0] || undefined,
      brand: product.brand || undefined,
    });
    trackProductView(
      product.id,
      product.name,
      product.price_numeric,
      product.category?.[0] || ''
    );
  }, [product.id, product.name, product.price_numeric, product.category, product.brand]);

  // Show sticky cart button on mobile when scrolled past main CTA
  useEffect(() => {
    const handleScroll = () => {
      setShowStickyCart(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Limit quantity selector to available stock
  const maxQuantity = Math.min(product.stock, 10);

  const handleAddToCart = () => {
    if (!inStock) return;

    setError(null);
    const result = addItem(product, quantity);

    if (result.success) {
      setIsAdding(true);

      // Track add_to_cart event (GA4)
      trackAddToCartGA4({
        id: product.id,
        name: product.name,
        price: product.price_numeric,
        quantity: quantity,
        category: product.category?.[0] || undefined,
        brand: product.brand || undefined,
      });
      // Track add_to_cart event (PostHog)
      trackAddToCartPH(
        product.id,
        product.name,
        product.price_numeric,
        quantity
      );

      setTimeout(() => {
        setIsAdding(false);
        setQuantity(1);
      }, 1500);
    } else {
      setError(result.message || 'Error al agregar');
      setTimeout(() => setError(null), 4000);
    }
  };

  const handleQuantityChange = (delta: number) => {
    const newQty = quantity + delta;
    if (newQty >= 1 && newQty <= maxQuantity) {
      setQuantity(newQty);
      setError(null);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const text = `${product.name} - ${formatPrice(product.price_numeric, product.currency)}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, text, url });
      } catch { }
    } else {
      await navigator.clipboard.writeText(url);
      setError('Enlace copiado al portapapeles');
      setTimeout(() => setError(null), 2000);
    }
  };

  const formatPrice = (price: number, currency: string = 'UYU') => {
    if (currency === 'USD') {
      return `U$S ${price.toLocaleString('es-UY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$ ${price.toLocaleString('es-UY', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col">
      {/* Category & Brand */}
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 flex-wrap">
        {(product.category || []).map((cat: string) => (
          <span key={cat} className="px-2.5 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm font-medium bg-blue-50 text-blue-700 rounded-full">
            {cat}
          </span>
        ))}
        {product.brand && (
          <span className="text-xs sm:text-sm text-slate-500">Marca: {product.brand}</span>
        )}
      </div>

      {/* Name */}
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-3 sm:mb-4">
        {product.name}
      </h1>

      {/* Rating */}
      {reviewCount > 0 && (
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 sm:h-5 sm:w-5 ${star <= Math.round(avgRating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-slate-200 text-slate-200'
                  }`}
              />
            ))}
          </div>
          <span className="text-xs sm:text-sm text-slate-600">
            {avgRating.toFixed(1)} ({reviewCount} {reviewCount === 1 ? 'reseña' : 'reseñas'})
          </span>
        </div>
      )}

      {/* Price */}
      <div className="mb-4 sm:mb-6">
        {isOnRequest ? (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 sm:p-4">
            <p className="text-base sm:text-lg font-bold text-purple-700 mb-1">Consultar por este producto</p>
            <p className="text-xs sm:text-sm text-purple-600">
              No tenemos este producto en stock actualmente, pero lo podemos conseguir para vos. Contactanos para más información.
            </p>
          </div>
        ) : product.original_price_numeric && product.discount_percentage ? (
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className="text-lg sm:text-2xl text-slate-400 line-through">
              {formatPrice(product.original_price_numeric, product.currency)}
            </span>
            <span className="text-2xl sm:text-4xl font-bold text-green-600">
              {formatPrice(product.price_numeric, product.currency)}
            </span>
            <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-green-600 text-white text-xs sm:text-sm font-bold rounded-full">
              -{product.discount_percentage}% OFF
            </span>
          </div>
        ) : (
          <span className="text-2xl sm:text-4xl font-bold text-slate-900">
            {formatPrice(product.price_numeric, product.currency)}
          </span>
        )}
      </div>

      {/* Description */}
      {product.description && (
        <div className="mb-4 sm:mb-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-2">Descripción</h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">{product.description}</p>
        </div>
      )}

      {/* Stock Status */}
      <div className="mb-4 sm:mb-6">
        {isOnRequest ? (
          <div className="flex items-center gap-2 text-purple-600">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="text-sm font-medium">Disponible a pedido</span>
          </div>
        ) : inStock ? (
          lowStock ? (
            <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
              <span className="text-xs sm:text-sm font-semibold text-amber-800">
                ¡Solo quedan {product.stock} unidades!
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-green-600">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm font-medium">En stock</span>
            </div>
          )
        ) : (
          <div className="flex items-center gap-2 text-slate-500">
            <div className="w-2 h-2 rounded-full bg-slate-400" />
            <span className="text-sm font-medium">Sin stock</span>
          </div>
        )}

        {/* Stock inquiry link */}
        <a
          href={`https://wa.me/59892744725?text=${encodeURIComponent(`Hola! Consulto por la disponibilidad de: ${product.name} (SKU: ${product.sku})`)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Consultar disponibilidad por WhatsApp"
          className="inline-flex items-center gap-2 mt-2 text-xs sm:text-sm text-green-600 hover:text-green-700 transition-colors"
        >
          <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          Consultar disponibilidad por WhatsApp
        </a>
      </div>

      {/* Installment Display */}
      {inStock && !isOnRequest && product.price_numeric >= 1000 && (
        <div className="mb-4 sm:mb-6 flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2">
          <CreditCard className="h-4 w-4 text-green-600 shrink-0" />
          <span className="text-xs sm:text-sm text-green-800">
            <span className="font-semibold">Hasta 12 cuotas</span>
            {' '}de {formatPrice(Math.ceil(product.price_numeric / 12), product.currency)} con MercadoPago
          </span>
        </div>
      )}

      {/* Quantity Selector */}
      {inStock && !isOnRequest && (
        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <span className="text-xs sm:text-sm font-medium text-slate-700">Cantidad:</span>
          <div className="flex items-center gap-1.5 sm:gap-2 bg-white border-2 border-slate-200 rounded-xl p-1">
            <button
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
              className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-slate-700"
              aria-label="Reducir cantidad"
            >
              <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
            <span className="w-8 sm:w-12 text-center font-bold text-slate-900 text-base sm:text-lg">{quantity}</span>
            <button
              onClick={() => handleQuantityChange(1)}
              disabled={quantity >= maxQuantity}
              className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-slate-700"
              aria-label="Aumentar cantidad"
            >
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          </div>
          <span className="text-xs text-slate-500">Máx: {maxQuantity}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 flex items-center gap-2 text-xs sm:text-sm bg-red-50 text-red-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Action Buttons */}
      {isOnRequest ? (
        <div className="mb-4 sm:mb-6">
          <a
            href={`https://wa.me/59892744725?text=${encodeURIComponent(`Hola! Estoy interesado en: ${product.name} (SKU: ${product.sku}). ¿Lo pueden conseguir?`)}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Consultar por WhatsApp"
            className="flex-1 flex items-center justify-center gap-2 py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base bg-green-600 text-white hover:bg-green-700 transition-colors w-full"
          >
            <MessageCircle className="h-5 w-5" />
            Consultar por WhatsApp
          </a>
        </div>
      ) : (
        <div className="flex gap-2 sm:gap-3 mb-4 sm:mb-6">
          <button
            onClick={handleAddToCart}
            disabled={!inStock || isAdding || isOnRequest}
            className={`
            flex-1 flex items-center justify-center gap-2 py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base
            transition-all duration-200
            ${inStock
                ? isAdding || inCart
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-slate-200 text-slate-500 cursor-not-allowed'
              }
          `}
          >
            {isAdding ? (
              <>
                <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden xs:inline">¡Agregado!</span>
                <span className="xs:hidden">Agregado</span>
              </>
            ) : inCart ? (
              <>
                <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                En carrito
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                Agregar al carrito
              </>
            )}
          </button>

          <button
            onClick={() => toggleItem(product.id)}
            className={`
            p-3 sm:p-4 rounded-xl border-2 transition-colors shrink-0
            ${inWishlist
                ? 'border-red-500 bg-red-50 text-red-500'
                : 'border-slate-200 text-slate-400 hover:border-red-200 hover:text-red-400'
              }
          `}
            aria-label={inWishlist ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <Heart className={`h-5 w-5 sm:h-6 sm:w-6 ${inWishlist ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={handleShare}
            className="p-3 sm:p-4 rounded-xl border-2 border-slate-200 text-slate-400 hover:border-blue-200 hover:text-blue-500 transition-colors shrink-0"
            aria-label="Compartir producto"
          >
            <Share2 className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>
      )}

      {/* WhatsApp Buy Button */}
      {inStock && !isOnRequest && (
        <a
          href={`https://wa.me/59892744725?text=${encodeURIComponent(`Hola! Me interesa comprar: ${product.name} (SKU: ${product.sku}) - ${formatPrice(product.price_numeric, product.currency)}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Comprar por WhatsApp"
          className="flex items-center justify-center gap-2 mb-4 sm:mb-6 py-2.5 sm:py-3 rounded-xl font-medium text-xs sm:text-sm bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 transition-colors w-full"
        >
          <MessageCircle className="h-4 w-4" />
          Comprar por WhatsApp
        </a>
      )}

      {/* Trust Badges */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-auto pt-4 sm:pt-6 border-t border-slate-200">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-blue-50 rounded-lg shrink-0">
            <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-medium text-slate-900">Envío a Uruguay</p>
            <p className="text-[10px] sm:text-xs text-slate-500">19 departamentos</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-green-50 rounded-lg shrink-0">
            <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-medium text-slate-900">Compra Segura</p>
            <p className="text-[10px] sm:text-xs text-slate-500">MercadoPago</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-amber-50 rounded-lg shrink-0">
            <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-medium text-slate-900">Garantía</p>
            <p className="text-[10px] sm:text-xs text-slate-500">Según fabricante</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-purple-50 rounded-lg shrink-0">
            <Star className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-medium text-slate-900">25+ Años</p>
            <p className="text-[10px] sm:text-xs text-slate-500">De experiencia</p>
          </div>
        </div>
      </div>

      {/* Sticky Add to Cart — Mobile Only */}
      {showStickyCart && inStock && !isOnRequest && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-sm p-3 shadow-[0_-4px_12px_rgba(0,0,0,0.1)] lg:hidden">
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">{product.name}</p>
              <p className="text-sm sm:text-lg font-bold text-blue-600">{formatPrice(product.price_numeric, product.currency)}</p>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className={`shrink-0 flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all ${isAdding || inCart
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
            >
              {isAdding ? (
                <>
                  <Check className="h-4 w-4" />
                  Agregado
                </>
              ) : inCart ? (
                <>
                  <Check className="h-4 w-4" />
                  En carrito
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  Agregar
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
