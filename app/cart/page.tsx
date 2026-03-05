'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import Header from '@/components/Header';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, getSubtotalByCurrency, getCartCurrency } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Format price
  const formatPrice = (price: number, currency: string = 'UYU') => {
    if (currency === 'USD') {
      return `US$ ${price.toLocaleString('es-UY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$ ${price.toLocaleString('es-UY', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
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
              <div className="h-64 bg-slate-200 rounded-2xl" />
            </div>
          </div>
        </main>
      </>
    );
  }

  const subtotals = mounted ? getSubtotalByCurrency() : { UYU: 0, USD: 0 };
  const cartCurrency = getCartCurrency();
  const isMixed = cartCurrency === 'mixed';
  const shipping = 0; // Will be calculated at checkout

  // Empty cart state
  if (items.length === 0) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-slate-50 pt-20 lg:pt-24">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-md mx-auto text-center">
              <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="h-12 w-12 text-slate-400" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-4">Tu carrito está vacío</h1>
              <p className="text-slate-500 mb-8">
                Parece que todavía no agregaste ningún producto. ¡Explorá nuestro catálogo!
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
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Tu Carrito</h1>
            <button
              onClick={clearCart}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Vaciar carrito
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-4 bg-white rounded-2xl p-4 border border-slate-200"
                >
                  {/* Image */}
                  <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100">
                    {item.product.images && item.product.images.length > 0 ? (
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                        Sin imagen
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/productos/${item.product.sku}`}
                      className="font-semibold text-slate-900 hover:text-blue-600 transition-colors line-clamp-2"
                    >
                      {item.product.name}
                    </Link>
                    {item.product.brand && (
                      <p className="text-sm text-slate-500 mt-1">{item.product.brand}</p>
                    )}
                    <p className="text-lg font-bold text-slate-900 mt-2">
                      {formatPrice(item.product.price_numeric, item.product.currency)}
                    </p>
                  </div>

                  {/* Quantity & Actions */}
                  <div className="flex flex-col items-end justify-between">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white transition-colors text-slate-700"
                        aria-label="Reducir cantidad"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center font-bold text-slate-900">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-slate-700"
                        aria-label="Aumentar cantidad"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Subtotal & Remove */}
                    <div className="text-right">
                      <p className="text-sm text-slate-500">
                        Subtotal: {formatPrice(item.product.price_numeric * item.quantity, item.product.currency)}
                      </p>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="text-red-500 hover:text-red-600 text-sm font-medium mt-1 flex items-center gap-1"
                      >
                        <Trash2 className="h-4 w-4" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Resumen del pedido</h2>

                <div className="space-y-3 mb-6">
                  {isMixed ? (
                    <>
                      {subtotals.UYU > 0 && (
                        <div className="flex justify-between text-slate-600">
                          <span>Subtotal UYU</span>
                          <span className="font-semibold">{formatPrice(subtotals.UYU, 'UYU')}</span>
                        </div>
                      )}
                      {subtotals.USD > 0 && (
                        <div className="flex justify-between text-slate-600">
                          <span>Subtotal USD</span>
                          <span className="font-semibold">{formatPrice(subtotals.USD, 'USD')}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal ({items.reduce((acc, i) => acc + i.quantity, 0)} productos)</span>
                      <span>{formatPrice(subtotals.UYU + subtotals.USD, cartCurrency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>Envío</span>
                    <span className="text-sm text-slate-400">Se calcula al finalizar</span>
                  </div>
                  <hr className="border-slate-200" />
                  {isMixed ? (
                    <div className="space-y-1">
                      <div className="flex justify-between text-lg font-bold text-slate-900">
                        <span>Total UYU</span>
                        <span>{formatPrice(subtotals.UYU, 'UYU')}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold text-slate-900">
                        <span>Total USD</span>
                        <span>{formatPrice(subtotals.USD, 'USD')}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">Elegís la moneda de pago en el checkout</p>
                    </div>
                  ) : (
                    <div className="flex justify-between text-lg font-bold text-slate-900">
                      <span>Total</span>
                      <span>{formatPrice(subtotals.UYU + subtotals.USD, cartCurrency)}</span>
                    </div>
                  )}
                </div>

                <Link
                  href="/checkout"
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors"
                >
                  Finalizar compra
                  <ArrowRight className="h-5 w-5" />
                </Link>

                <Link
                  href="/productos"
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 mt-3 text-slate-600 font-medium hover:text-blue-600 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                  Seguir comprando
                </Link>

                {/* Trust badges */}
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                    <span className="text-green-500">✓</span>
                    Pago seguro con MercadoPago
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                    <span className="text-green-500">✓</span>
                    Envíos a todo Uruguay
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span className="text-green-500">✓</span>
                    Garantía en todos los productos
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
