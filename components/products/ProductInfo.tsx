'use client';

import { useState } from 'react';
import { ShoppingCart, Heart, Check, Minus, Plus, Truck, Shield, Star } from 'lucide-react';
import { Product } from '@/types/database';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';

interface ProductInfoProps {
  product: Product;
  avgRating: number;
  reviewCount: number;
}

export default function ProductInfo({ product, avgRating, reviewCount }: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  
  const { addItem, isInCart } = useCartStore();
  const { toggleItem, isInWishlist } = useWishlistStore();

  const inCart = isInCart(product.id);
  const inWishlist = isInWishlist(product.id);
  const inStock = product.stock > 0;
  const lowStock = product.stock > 0 && product.stock <= 5;

  const handleAddToCart = () => {
    if (!inStock) return;
    
    setIsAdding(true);
    addItem(product, quantity);
    
    setTimeout(() => {
      setIsAdding(false);
      setQuantity(1);
    }, 1500);
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('es-UY', {
      style: 'currency',
      currency: 'UYU',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  return (
    <div className="p-6 lg:p-8 flex flex-col">
      {/* Category & Brand */}
      <div className="flex items-center gap-3 mb-4">
        <span className="px-3 py-1 text-sm font-medium bg-blue-50 text-blue-700 rounded-full">
          {product.category}
        </span>
        {product.brand && (
          <span className="text-sm text-slate-500">Marca: {product.brand}</span>
        )}
      </div>

      {/* Name */}
      <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-4">
        {product.name}
      </h1>

      {/* Rating */}
      {reviewCount > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-5 w-5 ${
                  star <= Math.round(avgRating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-slate-200 text-slate-200'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-slate-600">
            {avgRating.toFixed(1)} ({reviewCount} {reviewCount === 1 ? 'reseña' : 'reseñas'})
          </span>
        </div>
      )}

      {/* Price */}
      <div className="mb-6">
        <span className="text-4xl font-bold text-slate-900">
          {formatPrice(product.price_numeric)}
        </span>
      </div>

      {/* Description */}
      {product.description && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-2">Descripción</h2>
          <p className="text-slate-600 leading-relaxed">{product.description}</p>
        </div>
      )}

      {/* Specs */}
      {product.specs && Object.keys(product.specs).length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-2">Especificaciones</h2>
          <dl className="grid grid-cols-2 gap-2">
            {Object.entries(product.specs).map(([key, value]) => (
              <div key={key} className="flex flex-col">
                <dt className="text-xs text-slate-500">{key}</dt>
                <dd className="text-sm font-medium text-slate-900">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {/* Stock Status */}
      <div className="mb-6">
        {inStock ? (
          <div className={`flex items-center gap-2 ${lowStock ? 'text-orange-600' : 'text-green-600'}`}>
            <div className={`w-2 h-2 rounded-full ${lowStock ? 'bg-orange-500' : 'bg-green-500'}`} />
            <span className="text-sm font-medium">
              {lowStock ? `¡Últimas ${product.stock} unidades!` : `${product.stock} en stock`}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-500">
            <div className="w-2 h-2 rounded-full bg-slate-400" />
            <span className="text-sm font-medium">Sin stock</span>
          </div>
        )}
      </div>

      {/* Quantity Selector */}
      {inStock && (
        <div className="flex items-center gap-4 mb-6">
          <span className="text-sm font-medium text-slate-700">Cantidad:</span>
          <div className="flex items-center gap-2 bg-white border-2 border-slate-200 rounded-xl p-1">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-slate-700"
              aria-label="Reducir cantidad"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-12 text-center font-bold text-slate-900 text-lg">{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
              disabled={quantity >= product.stock}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-slate-700"
              aria-label="Aumentar cantidad"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={handleAddToCart}
          disabled={!inStock || isAdding}
          className={`
            flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-lg
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
              <Check className="h-5 w-5" />
              ¡Agregado al carrito!
            </>
          ) : inCart ? (
            <>
              <Check className="h-5 w-5" />
              Ya está en el carrito
            </>
          ) : (
            <>
              <ShoppingCart className="h-5 w-5" />
              Agregar al carrito
            </>
          )}
        </button>

        <button
          onClick={() => toggleItem(product.id)}
          className={`
            p-4 rounded-xl border-2 transition-colors
            ${inWishlist
              ? 'border-red-500 bg-red-50 text-red-500'
              : 'border-slate-200 text-slate-400 hover:border-red-200 hover:text-red-400'
            }
          `}
          aria-label={inWishlist ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          <Heart className={`h-6 w-6 ${inWishlist ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-2 gap-4 mt-auto pt-6 border-t border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Truck className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">Envío a todo Uruguay</p>
            <p className="text-xs text-slate-500">Consultar costos</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-50 rounded-lg">
            <Shield className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">Garantía incluida</p>
            <p className="text-xs text-slate-500">Según fabricante</p>
          </div>
        </div>
      </div>
    </div>
  );
}
