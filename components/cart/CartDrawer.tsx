'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { usePathname } from 'next/navigation';

export default function CartDrawer() {
  const { items, isOpen, setCartOpen, removeItem, updateQuantity, getSubtotal, getCartCurrency, getSubtotalByCurrency, hasMultipleCurrencies } = useCartStore();
  const pathname = usePathname();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close drawer on route change
  useEffect(() => {
    setCartOpen(false);
  }, [pathname, setCartOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCartOpen(false);
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, setCartOpen]);

  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const isMixed = hasMultipleCurrencies();

  // Fetch exchange rate when cart has mixed currencies
  useEffect(() => {
    if (!isOpen || !isMixed) return;
    fetch('/api/exchange-rate')
      .then(r => r.json())
      .then(data => { if (data.rate) setExchangeRate(data.rate); })
      .catch(() => {});
  }, [isOpen, isMixed]);

  const formatPrice = (price: number, currency: string = 'UYU') => {
    if (currency === 'USD') {
      return `US$ ${price.toLocaleString('es-UY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$ ${price.toLocaleString('es-UY', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const subtotal = getSubtotal();
  const subtotals = getSubtotalByCurrency();
  const cartCurrency = getCartCurrency();
  const itemCount = items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[90] transition-opacity"
          onClick={() => setCartOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`
          fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[100]
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          flex flex-col
        `}
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Carrito
            {itemCount > 0 && (
              <span className="text-sm font-normal text-slate-500">
                ({itemCount} {itemCount === 1 ? 'producto' : 'productos'})
              </span>
            )}
          </h2>
          <button
            onClick={() => setCartOpen(false)}
            className="p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
            aria-label="Cerrar carrito"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <ShoppingBag className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-slate-900 font-semibold mb-1">Tu carrito está vacío</p>
              <p className="text-sm text-slate-500 mb-6">Agregá productos para empezar</p>
              <button
                onClick={() => setCartOpen(false)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Seguir comprando
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {items.map((item) => (
                <li key={item.product.id} className="flex gap-3 px-5 py-4">
                  {/* Image */}
                  <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100">
                    {item.product.images && item.product.images.length > 0 ? (
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-400 text-[10px]">
                        Sin img
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/productos/${item.product.sku}`}
                      onClick={() => setCartOpen(false)}
                      className="text-sm font-medium text-slate-900 hover:text-blue-600 transition-colors line-clamp-1"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">
                      {formatPrice(item.product.price_numeric, item.product.currency)}
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex items-center bg-slate-100 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors"
                          aria-label="Reducir cantidad"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                          className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          aria-label="Aumentar cantidad"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                        aria-label="Eliminar producto"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Line total */}
                  <div className="text-right shrink-0">
                    <span className="text-sm font-semibold text-slate-900">
                      {formatPrice(item.product.price_numeric * item.quantity, item.product.currency)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-slate-200 px-5 py-4 space-y-3 bg-white">
            {isMixed ? (
              <div className="space-y-1.5">
                {subtotals.UYU > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Subtotal UYU</span>
                    <span className="text-sm font-bold text-slate-900">{formatPrice(subtotals.UYU, 'UYU')}</span>
                  </div>
                )}
                {subtotals.USD > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Subtotal USD</span>
                    <span className="text-sm font-bold text-slate-900">{formatPrice(subtotals.USD, 'USD')}</span>
                  </div>
                )}
                {exchangeRate && (
                  <>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <span className="text-sm text-slate-600">Total UYU</span>
                      <span className="text-lg font-bold text-slate-900">
                        {formatPrice(subtotals.UYU + subtotals.USD * exchangeRate, 'UYU')}
                      </span>
                    </div>
                  </>
                )}
                <p className="text-xs text-slate-400">Elegís la moneda de pago en el checkout</p>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Subtotal</span>
                <span className="text-lg font-bold text-slate-900">
                  {formatPrice(subtotal, cartCurrency)}
                </span>
              </div>
            )}
            <p className="text-xs text-slate-500">Envío se calcula al finalizar la compra</p>
            <Link
              href="/checkout"
              onClick={() => setCartOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors"
            >
              Finalizar compra
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              onClick={() => setCartOpen(false)}
              className="w-full py-2.5 text-sm text-slate-600 font-medium hover:text-blue-600 transition-colors"
            >
              Seguir comprando
            </button>
          </div>
        )}
      </div>
    </>
  );
}
