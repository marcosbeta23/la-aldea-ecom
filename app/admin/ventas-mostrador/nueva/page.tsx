'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, Minus, Trash2, ArrowLeft, Loader2, Check } from 'lucide-react';
import Link from 'next/link';
import { PAYMENT_METHOD_LABELS } from '@/types/database';

interface Product {
  id: string;
  name: string;
  sku: string;
  price_numeric: number;
  stock: number;
  brand: string | null;
}

interface CartItem {
  product: Product;
  quantity: number;
}

const COUNTER_PAYMENT_METHODS = ['efectivo', 'pos_debito', 'pos_credito', 'transfer'] as const;

export default function NuevaVentaMostradorPage() {
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);

  // Product search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);

  // Form
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<typeof COUNTER_PAYMENT_METHODS[number]>('efectivo');
  const [notes, setNotes] = useState('');

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ order_number: string; total: number } | null>(null);
  const [error, setError] = useState('');

  // Product search with debounce
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `/api/admin/products?search=${encodeURIComponent(searchQuery)}&limit=8&fields=id,name,sku,price_numeric,stock,brand`
        );
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.products || data || []);
        }
      } catch {
        // Ignore search errors
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close search results on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.closest('.search-container')?.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.product.id === product.id);
      if (exists) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, item.product.stock) }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setSearchQuery('');
    setShowResults(false);
    searchRef.current?.focus();
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id !== productId) return item;
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null as unknown as CartItem;
          return { ...item, quantity: Math.min(newQty, item.product.stock) };
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.product.price_numeric * item.quantity, 0);

  const handleSubmit = async () => {
    if (cart.length === 0) {
      setError('Agregá al menos un producto');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/admin/ventas-mostrador', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName || undefined,
          customer_phone: customerPhone || undefined,
          payment_method: paymentMethod,
          notes: notes || undefined,
          items: cart.map((item) => ({
            product_id: item.product.id,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al registrar la venta');
        return;
      }

      setSuccess({ order_number: data.order_number, total: data.total });
    } catch {
      setError('Error de conexión');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewSale = () => {
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setPaymentMethod('efectivo');
    setNotes('');
    setSuccess(null);
    setError('');
    searchRef.current?.focus();
  };

  // Success screen
  if (success) {
    return (
      <div className="max-w-md mx-auto mt-12 text-center">
        <div className="bg-emerald-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <Check className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-1">Venta Registrada</h2>
        <p className="text-slate-600 mb-2">
          <span className="font-mono font-medium">{success.order_number}</span>
        </p>
        <p className="text-2xl font-bold text-emerald-600 mb-6">
          ${success.total.toLocaleString('es-UY')}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={handleNewSale}
            className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
          >
            Nueva Venta
          </button>
          <Link
            href="/admin/ventas-mostrador"
            className="border border-slate-200 text-slate-700 px-5 py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Ver Ventas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/ventas-mostrador"
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Nueva Venta Mostrador</h1>
          <p className="text-sm text-slate-500">Registrar venta en local</p>
        </div>
      </div>

      {/* Product Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Buscar producto
        </label>
        <div className="relative search-container">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            placeholder="Nombre o SKU del producto..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            autoComplete="off"
          />
          {searching && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 animate-spin" />
          )}

          {/* Search dropdown */}
          {showResults && searchResults.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
              {searchResults.map((product) => {
                const inCart = cart.some((item) => item.product.id === product.id);
                return (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{product.name}</p>
                        <p className="text-xs text-slate-500">
                          {product.sku} {product.brand ? `· ${product.brand}` : ''} · Stock: {product.stock}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-900">
                          ${product.price_numeric.toLocaleString('es-UY')}
                        </p>
                        {inCart && (
                          <p className="text-xs text-emerald-600">En carrito</p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Cart */}
      {cart.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
            <h3 className="text-sm font-medium text-slate-700">
              Productos ({cart.length})
            </h3>
          </div>
          <div className="divide-y divide-slate-100">
            {cart.map((item) => (
              <div key={item.product.id} className="px-5 py-3 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {item.product.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    ${item.product.price_numeric.toLocaleString('es-UY')} c/u
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.product.id, -1)}
                    className="p-1 rounded hover:bg-slate-100"
                  >
                    <Minus className="h-4 w-4 text-slate-600" />
                  </button>
                  <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product.id, 1)}
                    disabled={item.quantity >= item.product.stock}
                    className="p-1 rounded hover:bg-slate-100 disabled:opacity-30"
                  >
                    <Plus className="h-4 w-4 text-slate-600" />
                  </button>
                </div>
                <p className="text-sm font-semibold text-slate-900 w-24 text-right">
                  ${(item.product.price_numeric * item.quantity).toLocaleString('es-UY')}
                </p>
                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="p-1.5 rounded hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">Total</span>
            <span className="text-lg font-bold text-slate-900">
              ${subtotal.toLocaleString('es-UY')}
            </span>
          </div>
        </div>
      )}

      {/* Customer & Payment */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Cliente <span className="text-slate-400">(opcional)</span>
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Nombre del cliente"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Teléfono <span className="text-slate-400">(opcional)</span>
            </label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="099 123 456"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Medio de pago
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {COUNTER_PAYMENT_METHODS.map((method) => (
              <button
                key={method}
                onClick={() => setPaymentMethod(method)}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                  paymentMethod === method
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                {PAYMENT_METHOD_LABELS[method]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Notas <span className="text-slate-400">(opcional)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notas sobre la venta..."
            rows={2}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={submitting || cart.length === 0}
        className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Registrando...
          </>
        ) : (
          <>
            Registrar Venta — ${subtotal.toLocaleString('es-UY')}
          </>
        )}
      </button>
    </div>
  );
}
