'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Heart, ShoppingCart, Trash2, ArrowLeft } from 'lucide-react';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useCartStore } from '@/stores/cartStore';
import Header from '@/components/Header';
import { Product } from '@/types/database';


export default function WishlistPage() {
  const { items: wishlistIds, removeItem } = useWishlistStore();
  const { addItem: addToCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch product details for wishlist items
  useEffect(() => {
    async function fetchProducts() {
      if (wishlistIds.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/products?ids=${wishlistIds.join(',')}`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data.products || []);
        }
      } catch (error) {
        console.error('Error fetching wishlist products:', error);
      } finally {
        setLoading(false);
      }
    }

    if (mounted) {
      fetchProducts();
    }
  }, [wishlistIds, mounted]);

  // Format price
  const formatPrice = (price: number) => {
    return price.toLocaleString('es-UY', {
      style: 'currency',
      currency: 'UYU',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    removeItem(product.id);
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-slate-50 pt-20 lg:pt-24">
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-slate-200 rounded w-48 mb-8" />
              <div className="aspect-[4/3] w-full max-h-[500px] bg-slate-200 rounded-2xl" />
            </div>
          </div>
        </main>
      </>
    );
  }

  // Empty wishlist state
  if (wishlistIds.length === 0) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-slate-50 pt-20 lg:pt-24">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-md mx-auto text-center">
              <div className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
                <Heart className="h-12 w-12 text-red-300" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-4">Tu lista de favoritos está vacía</h1>
              <p className="text-slate-500 mb-8">
                Guardá productos que te interesen haciendo clic en el corazón. ¡Así los encontrás fácil después!
              </p>
              <Link
                href="/productos"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                Ver productos
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 pt-20 lg:pt-24">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="p-2.5 sm:p-3 bg-red-50 rounded-2xl">
              <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-red-500" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Mis Favoritos</h1>
              <p className="text-sm sm:text-base text-slate-500">{wishlistIds.length} productos guardados</p>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {Array.from({ length: wishlistIds.length }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
                  <div className="aspect-square bg-slate-200" />
                  <div className="p-3 sm:p-4 space-y-3">
                    <div className="h-5 bg-slate-200 rounded w-3/4" />
                    <div className="h-4 bg-slate-200 rounded w-1/2" />
                    <div className="h-6 bg-slate-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
                >
                  {/* Image */}
                  <Link href={`/productos/${product.slug ?? product.sku}`} className="block relative aspect-square bg-slate-100">
                    {product.images && product.images.length > 0 ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                        className="object-cover hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-400">
                        Sin imagen
                      </div>
                    )}
                  </Link>

                  {/* Content */}
                  <div className="p-3 sm:p-4">
                    <Link
                      href={`/productos/${product.slug ?? product.sku}`}
                      className="font-semibold text-xs sm:text-sm text-slate-900 hover:text-blue-600 transition-colors line-clamp-2"
                    >
                      {product.name}
                    </Link>
                    {product.brand && (
                      <p className="text-xs text-slate-500 mt-0.5 sm:mt-1">{product.brand}</p>
                    )}
                    <p className="text-base sm:text-xl font-bold text-slate-900 mt-1 sm:mt-2">
                      {formatPrice(product.price_numeric)}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-1.5 sm:gap-2 mt-2 sm:mt-4">
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                        className="flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 bg-green-600 text-white text-xs sm:text-sm font-medium rounded-xl hover:bg-green-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
                      >
                        <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">{product.stock > 0 ? 'Agregar al carrito' : 'Sin stock'}</span>
                        <span className="sm:hidden">{product.stock > 0 ? 'Agregar' : 'Sin stock'}</span>
                      </button>
                      <button
                        onClick={() => removeItem(product.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                        aria-label="Eliminar de favoritos"
                      >
                        <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Continue Shopping */}
          <div className="mt-8 text-center">
            <Link
              href="/productos"
              className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Seguir explorando productos
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
