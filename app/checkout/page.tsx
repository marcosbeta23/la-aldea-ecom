'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, CreditCard, Truck, MapPin, Phone, Mail, User, ShieldCheck, Tag, X, Check, AlertCircle, Building2, Banknote, Receipt, FileText, MessageCircle, Info, ArrowRightLeft } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import Header from '@/components/Header';
import { trackBeginCheckout } from '@/components/Analytics';
import { getCartShippingType, getShippingOptions, getShippingZone, SHIPPING_CONFIG, DAC_RATES } from '@/lib/shipping';
import { CheckoutFormSchema, type CheckoutFormData } from '@/lib/validators';

interface CouponData {
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  discount_amount: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, getCartCurrency, getSubtotalByCurrency, hasMultipleCurrencies, getCurrenciesInCart, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponData | null>(null);
  const [submitError, setSubmitError] = useState('');
  const [freightConfirmed, setFreightConfirmed] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);

  // React Hook Form with Zod validation
  const {
    register,
    handleSubmit: rhfHandleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(CheckoutFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      department: '',
      notes: '',
      shippingMethod: 'pickup',
      paymentMethod: 'mercadopago',
      paymentCurrency: 'UYU' as const,
      invoiceType: 'consumer_final',
      invoiceTaxId: '',
      invoiceBusinessName: '',
      acceptedTerms: undefined as unknown as true,
    },
    mode: 'onBlur',
  });

  // Watch form values for conditional rendering
  const shippingMethod = watch('shippingMethod');
  const paymentMethod = watch('paymentMethod');
  const paymentCurrency = watch('paymentCurrency');
  const invoiceType = watch('invoiceType');
  const department = watch('department');
  const city = watch('city');
  const acceptedTerms = watch('acceptedTerms');
  const watchedEmail = watch('email');
  const watchedName = watch('name');
  const watchedPhone = watch('phone');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Refresh product data from API on mount to get latest shipping_type, stock, etc.
  const updateProductData = useCartStore((s) => s.updateProductData);
  const [productDataRefreshed, setProductDataRefreshed] = useState(false);
  useEffect(() => {
    if (!mounted || items.length === 0 || productDataRefreshed) return;
    const ids = items.map(item => item.product.id).join(',');
    fetch(`/api/products?ids=${ids}`)
      .then(res => res.json())
      .then(data => {
        if (data.products && Array.isArray(data.products)) {
          for (const freshProduct of data.products) {
            updateProductData(freshProduct.id, freshProduct);
          }
        }
        setProductDataRefreshed(true);
      })
      .catch(err => console.error('Failed to refresh product data:', err));
  }, [mounted, items.length, productDataRefreshed, updateProductData]); // eslint-disable-line react-hooks/exhaustive-deps

  // Track begin_checkout event once items are loaded
  useEffect(() => {
    if (mounted && items.length > 0) {
      trackBeginCheckout(
        items.map((item) => ({
          id: item.product.id,
          name: item.product.name,
          price: item.product.price_numeric,
          quantity: item.quantity,
        })),
        getSubtotal()
      );
    }
  }, [mounted, items.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Set initial paymentCurrency based on cart contents
  const isMixed = mounted ? hasMultipleCurrencies() : false;
  useEffect(() => {
    if (!mounted) return;
    const currencies = getCurrenciesInCart();
    if (currencies.length === 1) {
      setValue('paymentCurrency', currencies[0] as 'UYU' | 'USD');
    }
  }, [mounted]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch exchange rate — always needed since customer can pick USD or UYU
  useEffect(() => {
    if (!mounted) return;
    fetch('/api/exchange-rate')
      .then(res => res.json())
      .then(data => {
        if (data.rate) setExchangeRate(data.rate);
      })
      .catch(() => {});
  }, [mounted]);

  // Track checkout attempt for abandoned cart recovery
  const checkoutAttemptSent = useRef(false);
  const mountTimestamp = useRef(Date.now());
  useEffect(() => {
    if (!mounted || checkoutAttemptSent.current || items.length === 0) return;
    if (!watchedEmail || !watchedEmail.includes('@')) return;

    // Wait at least 30 seconds on the checkout page
    const elapsed = Date.now() - mountTimestamp.current;
    if (elapsed < 30_000) {
      const timer = setTimeout(() => {
        // Re-check conditions after delay
        if (!checkoutAttemptSent.current && watchedEmail && watchedEmail.includes('@') && items.length > 0) {
          sendCheckoutAttempt();
        }
      }, 30_000 - elapsed);
      return () => clearTimeout(timer);
    }

    sendCheckoutAttempt();

    function sendCheckoutAttempt() {
      checkoutAttemptSent.current = true;
      fetch('/api/checkout-attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: watchedEmail,
          phone: watchedPhone || undefined,
          customer_name: watchedName || undefined,
          items: items.map(item => ({
            product_name: item.product.name,
            quantity: item.quantity,
            unit_price: item.product.price_numeric,
          })),
          subtotal: getSubtotal(),
          currency: getCartCurrency(),
        }),
      }).catch(() => {}); // Non-blocking
    }
  }, [mounted, watchedEmail, items.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Format price
  const formatPrice = (price: number, currency: string = 'UYU') => {
    if (currency === 'USD') {
      return `US$ ${price.toLocaleString('es-UY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$ ${price.toLocaleString('es-UY', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  // Calculate shipping based on cart contents
  const cartShippingType = useMemo(() => {
    if (!mounted) return 'dac';
    return getCartShippingType(
      items.map(item => ({ shippingType: item.product.shipping_type || 'dac' }))
    );
  }, [mounted, items]);

  const shippingZone = useMemo(() => {
    if (!department) return 'interior';
    return getShippingZone(department, city || '');
  }, [department, city]);

  const shippingOptions = useMemo(() => {
    return getShippingOptions(cartShippingType, shippingZone);
  }, [cartShippingType, shippingZone]);

  // Cart currency (may be 'mixed' if multiple currencies)
  const cartCurrency = mounted ? getCartCurrency() : 'UYU';

  // Auto-reset shipping method when delivery isn't available
  useEffect(() => {
    const canDeliver = shippingOptions.canDeliver || (cartShippingType !== 'pickup_only' && freightConfirmed);
    if (mounted && !canDeliver && (shippingMethod === 'delivery' || shippingMethod === 'freight')) {
      setValue('shippingMethod', 'pickup');
    }
  }, [mounted, shippingOptions.canDeliver, cartShippingType, freightConfirmed, shippingMethod, setValue]);

  // Calculate totals — convert to payment currency when needed
  const subtotal = useMemo(() => {
    if (!mounted) return 0;
    const byCur = getSubtotalByCurrency();
    // If no exchange rate and currencies differ, show raw subtotal as fallback
    if (!exchangeRate) {
      if (paymentCurrency === 'USD') return byCur.USD + (byCur.UYU > 0 ? byCur.UYU : 0);
      return byCur.UYU + (byCur.USD > 0 ? byCur.USD : 0);
    }
    // Convert everything to payment currency
    if (paymentCurrency === 'UYU') {
      return byCur.UYU + byCur.USD * exchangeRate;
    }
    return byCur.USD + byCur.UYU / exchangeRate;
  }, [mounted, exchangeRate, paymentCurrency, items]); // eslint-disable-line react-hooks/exhaustive-deps
  const discount = appliedCoupon?.discount_amount || 0;
  // Shipping cost: 0 for pickup, actual cost if known, or 0 if paid on delivery
  const shippingCost = shippingMethod === 'delivery' && shippingOptions.deliveryCost !== null
    ? shippingOptions.deliveryCost
    : 0;
  const shippingPaidOnDelivery = shippingMethod === 'delivery' && shippingOptions.deliveryCost === null;
  const total = subtotal - discount + shippingCost;
  // Display currency for totals — always the selected payment currency
  const displayCurrency = paymentCurrency;


  // Apply coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    setCouponError('');

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.toUpperCase(),
          subtotal,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setCouponError(data.error || 'Cupón inválido');
        return;
      }

      setAppliedCoupon(data.coupon);
    } catch (error) {
      setCouponError('Error al validar el cupón');
    } finally {
      setCouponLoading(false);
    }
  };

  // Remove coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  // Scroll to first error when RHF validation fails
  const onError = useCallback(() => {
    // Find the first visible error element and scroll to it
    setTimeout(() => {
      const firstError = document.querySelector('.text-red-500');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }, []);

  // Submit order — called by react-hook-form after Zod validation passes
  const onSubmit = async (formData: CheckoutFormData) => {
    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Create order (matching server Zod schema structure)
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            name: formData.name,
            email: formData.email || undefined,
            phone: formData.phone.replace(/[\s\-().]/g, ''),
            shipping_address: formData.shippingMethod !== 'pickup' ? formData.address : undefined,
            shipping_city: formData.shippingMethod !== 'pickup' ? formData.city : undefined,
            shipping_department: formData.department,
            shipping_type: formData.shippingMethod === 'pickup'
              ? 'pickup'
              : formData.shippingMethod === 'freight'
                ? 'freight'
                : cartShippingType,
            shipping_cost: shippingCost,
            notes: formData.notes || undefined,
            payment_method: formData.paymentMethod,
            payment_currency: formData.paymentCurrency,
            invoice_type: formData.invoiceType,
            invoice_tax_id: formData.invoiceType === 'invoice_rut' ? (formData.invoiceTaxId || '').replace(/\D/g, '') : undefined,
            invoice_business_name: formData.invoiceType === 'invoice_rut' ? formData.invoiceBusinessName : undefined,
          },
          items: items.map((item) => ({
            id: item.product.id,
            quantity: item.quantity,
          })),
          couponCode: appliedCoupon?.code,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Build a detailed error message from server response
        let errorMsg = data.error || 'Error al crear el pedido';
        if (data.details) {
          const fieldErrors = Object.entries(data.details)
            .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(', ')}`)
            .join('. ');
          if (fieldErrors) errorMsg += ` (${fieldErrors})`;
        }
        throw new Error(errorMsg);
      }

      // Handle redirect based on payment method
      if (formData.paymentMethod === 'transfer') {
        clearCart();
        router.push(`/pendiente?order=${data.order_number}&method=transfer&currency=${formData.paymentCurrency}`);
      } else if (data.init_point) {
        // Do NOT clear cart here — user may cancel payment and come back.
        // Cart is cleared on the /gracias page after confirmed payment.
        const processingUrl = `/procesando?redirect=${encodeURIComponent(data.init_point)}&order=${data.order_number}&method=mercadopago`;
        router.push(processingUrl);
      } else {
        clearCart();
        router.push(`/pedido/${data.order_number}?success=true`);
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      setSubmitError(error.message || 'Error al procesar el pedido. Intentá de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
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
              <div className="h-96 bg-slate-200 rounded-2xl" />
            </div>
          </div>
        </main>
      </>
    );
  }

  // Empty cart - redirect
  if (items.length === 0) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-slate-50 pt-20 lg:pt-24">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-md mx-auto text-center">
              <AlertCircle className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-slate-900 mb-4">Tu carrito está vacío</h1>
              <p className="text-slate-500 mb-8">
                Agregá productos a tu carrito para continuar con la compra.
              </p>
              <Link
                href="/productos"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
              >
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
            <Link
              href="/cart"
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </Link>
            <h1 className="text-3xl font-bold text-slate-900">Finalizar compra</h1>
          </div>

          <form onSubmit={rhfHandleSubmit(onSubmit, onError)}>
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Form Section */}
              <div className="lg:col-span-2 space-y-6">
                {/* Contact Information */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    Información de contacto
                  </h2>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Nombre completo *
                      </label>
                      <input
                        type="text"
                        {...register('name')}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 placeholder:text-slate-400 ${
                          errors.name ? 'border-red-500' : 'border-slate-300'
                        }`}
                        placeholder="Juan Pérez"
                      />
                      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        <Mail className="inline h-4 w-4 mr-1" />
                        Email
                      </label>
                      <input
                        type="email"
                        {...register('email')}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 placeholder:text-slate-400 ${
                          errors.email ? 'border-red-500' : 'border-slate-300'
                        }`}
                        placeholder="juan@email.com"
                      />
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        <Phone className="inline h-4 w-4 mr-1" />
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        {...register('phone')}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 placeholder:text-slate-400 ${
                          errors.phone ? 'border-red-500' : 'border-slate-300'
                        }`}
                        placeholder="099 123 456"
                      />
                      {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        <MapPin className="inline h-4 w-4 mr-1" />
                        Departamento *
                      </label>
                      <select
                        {...register('department')}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 ${
                          errors.department ? 'border-red-500' : 'border-slate-300'
                        }`}
                      >
                        <option value="">Seleccionar...</option>
                        <option value="Montevideo">Montevideo</option>
                        <option value="Canelones">Canelones</option>
                        <option value="Maldonado">Maldonado</option>
                        <option value="Colonia">Colonia</option>
                        <option value="San José">San José</option>
                        <option value="Florida">Florida</option>
                        <option value="Lavalleja">Lavalleja</option>
                        <option value="Rocha">Rocha</option>
                        <option value="Treinta y Tres">Treinta y Tres</option>
                        <option value="Cerro Largo">Cerro Largo</option>
                        <option value="Rivera">Rivera</option>
                        <option value="Tacuarembó">Tacuarembó</option>
                        <option value="Durazno">Durazno</option>
                        <option value="Flores">Flores</option>
                        <option value="Soriano">Soriano</option>
                        <option value="Río Negro">Río Negro</option>
                        <option value="Paysandú">Paysandú</option>
                        <option value="Salto">Salto</option>
                        <option value="Artigas">Artigas</option>
                      </select>
                      {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department.message}</p>}
                    </div>
                  </div>
                </div>

                {/* Shipping Method */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Truck className="h-5 w-5 text-blue-600" />
                    Método de entrega
                  </h2>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Pickup option - always available */}
                    {shippingOptions.canPickup && (
                      <button
                        type="button"
                        onClick={() => setValue('shippingMethod', 'pickup')}
                        className={`p-4 rounded-xl border-2 text-left transition-colors ${
                          shippingMethod === 'pickup'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-slate-900">Retiro en local</span>
                          <span className="text-green-600 font-semibold">Gratis</span>
                        </div>
                        <p className="text-sm text-slate-500">
                          {SHIPPING_CONFIG.pickupAddress}
                        </p>
                      </button>
                    )}

                    {/* Delivery option - conditional based on cart */}
                    {shippingOptions.canDeliver && (
                      <button
                        type="button"
                        onClick={() => setValue('shippingMethod', 'delivery')}
                        className={`p-4 rounded-xl border-2 text-left transition-colors ${
                          shippingMethod === 'delivery'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-slate-900">{shippingOptions.deliveryLabel}</span>
                          {shippingOptions.deliveryCost !== null ? (
                            <span className={shippingOptions.deliveryCost === 0 ? 'text-green-600 font-semibold' : 'text-slate-900 font-semibold'}>
                              {shippingOptions.deliveryCost === 0 ? 'Gratis' : formatPrice(shippingOptions.deliveryCost, cartCurrency)}
                            </span>
                          ) : (
                            <span className="text-amber-600 text-sm font-medium">A pagar en destino</span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500">
                          {shippingOptions.deliveryNote}
                        </p>
                      </button>
                    )}

                    {/* Freight delivery option — visible after WhatsApp confirmation */}
                    {cartShippingType !== 'pickup_only' && freightConfirmed && (
                      <button
                        type="button"
                        onClick={() => setValue('shippingMethod', 'freight')}
                        className={`p-4 rounded-xl border-2 text-left transition-colors ${
                          shippingMethod === 'freight'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-slate-900">Coordinar flete/envío</span>
                          <span className="text-amber-600 text-sm font-medium">Acordado por WhatsApp</span>
                        </div>
                        <p className="text-sm text-slate-500">
                          Envío coordinado previamente con La Aldea
                        </p>
                      </button>
                    )}
                  </div>

                  {/* Freight consultation card — always available (except pickup_only) */}
                  {cartShippingType !== 'pickup_only' && (
                    <div className={`mt-4 p-4 border rounded-xl ${
                      freightConfirmed
                        ? 'bg-green-50 border-green-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="flex items-start gap-3">
                        <Truck className={`h-5 w-5 mt-0.5 shrink-0 ${
                          freightConfirmed ? 'text-green-600' : 'text-slate-500'
                        }`} />
                        <div className="flex-1">
                          {!freightConfirmed ? (
                            <>
                              <p className="text-sm font-medium text-slate-700">
                                {cartShippingType === 'freight'
                                  ? 'Tu pedido incluye productos que requieren flete'
                                  : '¿Necesitás coordinar el envío?'}
                              </p>
                              <p className="text-sm text-slate-500 mt-1">
                                Coordiná el envío por WhatsApp
                              </p>
                              <a
                                href={`https://wa.me/59892744725?text=${encodeURIComponent('Hola! Quiero consultar por el costo de flete para un pedido.')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
                              >
                                <MessageCircle className="h-4 w-4" />
                                Consultar por flete/envío en WhatsApp
                              </a>
                            </>
                          ) : (
                            <p className="text-sm font-medium text-green-800">
                              Envío coordinado — ya podés seleccionar &quot;Coordinar flete/envío&quot; como método de entrega.
                            </p>
                          )}

                          {/* Confirmation checkbox */}
                          <label className="flex items-center gap-2 mt-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={freightConfirmed}
                              onChange={(e) => {
                                setFreightConfirmed(e.target.checked);
                                if (!e.target.checked && shippingMethod === 'freight') {
                                  setValue('shippingMethod', 'pickup');
                                }
                              }}
                              className={`h-4 w-4 rounded border-slate-300 focus:ring-2 ${
                                freightConfirmed
                                  ? 'text-green-600 focus:ring-green-500'
                                  : 'text-slate-400 focus:ring-slate-400'
                              }`}
                            />
                            <span className={`text-sm font-medium ${
                              freightConfirmed ? 'text-green-700' : 'text-slate-600'
                            }`}>
                              Ya coordiné el envío/flete por WhatsApp
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pickup-only notice */}
                  {cartShippingType === 'pickup_only' && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                        <p className="text-sm text-blue-800">
                          Algunos productos de tu carrito solo están disponibles para retiro en local.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* DAC shipping info - show rates table */}
                  {cartShippingType === 'dac' && shippingMethod === 'delivery' && shippingOptions.deliveryCost === null && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-blue-800 font-medium">
                            El envío se paga al recibir ({SHIPPING_CONFIG.dacDeliveryTime})
                          </p>
                          <p className="text-xs text-blue-700 mt-1 mb-2">
                            Tarifas DAC según tamaño del paquete:
                          </p>
                          <div className="space-y-1 text-xs">
                            {DAC_RATES.slice(0, 4).map((rate, i) => (
                              <div key={i} className="flex items-center justify-between py-0.5 border-b border-blue-100 last:border-0">
                                <span className="text-blue-700">{rate.label}</span>
                                <span className="text-blue-800 font-semibold">${rate.price}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Shipping Address */}
                  {shippingMethod !== 'pickup' && (
                    <div className="mt-6 pt-6 border-t border-slate-200">
                      <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Dirección de envío
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Dirección *
                          </label>
                          <input
                            type="text"
                            {...register('address')}
                            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 placeholder:text-slate-400 ${
                              errors.address ? 'border-red-500' : 'border-slate-300'
                            }`}
                            placeholder="Av. Principal 1234"
                          />
                          {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Ciudad *
                          </label>
                          <input
                            type="text"
                            {...register('city')}
                            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 placeholder:text-slate-400 ${
                              errors.city ? 'border-red-500' : 'border-slate-300'
                            }`}
                            placeholder="Montevideo"
                          />
                          {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Notas adicionales (opcional)
                  </label>
                  <textarea
                    {...register('notes')}
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 placeholder:text-slate-400"
                    placeholder="Instrucciones especiales, horarios de entrega, etc."
                  />
                </div>

                {/* Billing / Invoice Type */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-blue-600" />
                    Tipo de comprobante
                  </h2>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => { setValue('invoiceType', 'consumer_final'); setValue('invoiceTaxId', ''); setValue('invoiceBusinessName', ''); }}
                      className={`p-4 rounded-xl border-2 text-left transition-colors ${
                        invoiceType === 'consumer_final'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Receipt className={`h-5 w-5 ${invoiceType === 'consumer_final' ? 'text-blue-600' : 'text-slate-400'}`} />
                        <div>
                          <p className="font-medium text-slate-900">Consumidor Final</p>
                          <p className="text-xs text-slate-500">Sin RUT (boleta/ticket)</p>
                        </div>
                      </div>
                      {invoiceType === 'consumer_final' && (
                        <Check className="h-5 w-5 text-blue-600 mt-2" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setValue('invoiceType', 'invoice_rut')}
                      className={`p-4 rounded-xl border-2 text-left transition-colors ${
                        invoiceType === 'invoice_rut'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <FileText className={`h-5 w-5 ${invoiceType === 'invoice_rut' ? 'text-blue-600' : 'text-slate-400'}`} />
                        <div>
                          <p className="font-medium text-slate-900">Factura con RUT</p>
                          <p className="text-xs text-slate-500">Con crédito fiscal</p>
                        </div>
                      </div>
                      {invoiceType === 'invoice_rut' && (
                        <Check className="h-5 w-5 text-blue-600 mt-2" />
                      )}
                    </button>
                  </div>

                  {/* RUT Invoice Fields */}
                  {invoiceType === 'invoice_rut' && (
                    <div className="mt-6 pt-6 border-t border-slate-200">
                      <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Datos de facturación
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            RUT *
                          </label>
                          <input
                            type="text"
                            {...register('invoiceTaxId', {
                              onChange: (e) => {
                                // Format RUT: XX XXXXXX XXXX XX
                                const digits = e.target.value.replace(/\D/g, '').slice(0, 12);
                                let formatted = digits;
                                if (digits.length > 2) formatted = digits.slice(0, 2) + ' ' + digits.slice(2);
                                if (digits.length > 8) formatted = digits.slice(0, 2) + ' ' + digits.slice(2, 8) + ' ' + digits.slice(8);
                                if (digits.length > 12) formatted = digits.slice(0, 2) + ' ' + digits.slice(2, 8) + ' ' + digits.slice(8, 12) + ' ' + digits.slice(12);
                                setValue('invoiceTaxId', formatted);
                              },
                            })}
                            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 placeholder:text-slate-400 ${
                              errors.invoiceTaxId ? 'border-red-500' : 'border-slate-300'
                            }`}
                            placeholder="21 123456 0001 19"
                          />
                          {errors.invoiceTaxId && <p className="text-red-500 text-sm mt-1">{errors.invoiceTaxId.message}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Razón Social *
                          </label>
                          <input
                            type="text"
                            {...register('invoiceBusinessName')}
                            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 placeholder:text-slate-400 ${
                              errors.invoiceBusinessName ? 'border-red-500' : 'border-slate-300'
                            }`}
                            placeholder="Nombre de la empresa o persona"
                          />
                          {errors.invoiceBusinessName && <p className="text-red-500 text-sm mt-1">{errors.invoiceBusinessName.message}</p>}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Invoice Info Note */}
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-800 mb-1">Sobre la facturación</p>
                        <p className="text-blue-700">
                          La factura se genera una vez confirmado el pago y será enviada a tu email. 
                          Si necesitás factura con RUT, seleccioná esa opción y completá los datos.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    Método de pago
                  </h2>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setValue('paymentMethod', 'mercadopago')}
                      className={`p-4 rounded-xl border-2 text-left transition-colors ${
                        paymentMethod === 'mercadopago'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className={`h-5 w-5 ${paymentMethod === 'mercadopago' ? 'text-blue-600' : 'text-slate-400'}`} />
                        <div>
                          <p className="font-medium text-slate-900">MercadoPago</p>
                          <p className="text-xs text-slate-500">Tarjeta, débito o billetera (en UYU)</p>
                        </div>
                      </div>
                      {paymentMethod === 'mercadopago' && (
                        <Check className="h-5 w-5 text-blue-600 mt-2" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setValue('paymentMethod', 'transfer')}
                      className={`p-4 rounded-xl border-2 text-left transition-colors ${
                        paymentMethod === 'transfer'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Building2 className={`h-5 w-5 ${paymentMethod === 'transfer' ? 'text-blue-600' : 'text-slate-400'}`} />
                        <div>
                          <p className="font-medium text-slate-900">Transferencia</p>
                          <p className="text-xs text-slate-500">Bancaria en UYU o USD</p>
                        </div>
                      </div>
                      {paymentMethod === 'transfer' && (
                        <Check className="h-5 w-5 text-blue-600 mt-2" />
                      )}
                    </button>
                  </div>

                  {/* MercadoPago Info */}
                  {paymentMethod === 'mercadopago' && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-blue-800 mb-1">Sobre MercadoPago</p>
                          <p className="text-blue-700">
                            MercadoPago procesa todos los pagos en <span className="font-semibold">pesos uruguayos (UYU)</span>.
                            Si tu carrito incluye productos en USD, se convertirán a UYU usando el tipo de cambio de MercadoPago.
                          </p>
                          <p className="text-blue-700 mt-2">
                            Si preferís pagar en dólares sin conversión, elegí <span className="font-semibold">transferencia bancaria</span>.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bank Transfer Info */}
                  {paymentMethod === 'transfer' && (
                    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-amber-800 mb-2">Datos para transferencia:</p>
                          <div className="space-y-1 text-amber-700">
                            <p><span className="font-medium">Banco:</span> BROU</p>
                            <p><span className="font-medium">Cuenta Pesos:</span> 001532748-00001</p>
                            <p><span className="font-medium">Cuenta Dolares:</span> 001532748-00002</p>
                            <p><span className="font-medium">Titular:</span> Martin Betancor</p>
                          </div>
                          <p className="mt-3 text-amber-800">
                            Aceptamos transferencias en <span className="font-semibold">UYU o USD</span>. Al pagar por transferencia no hay comisiones ni conversión de moneda.
                          </p>
                          <p className="mt-2 text-amber-800">
                            <strong>Importante:</strong> Tu pedido quedará en estado pendiente hasta que confirmemos el pago.
                            Enviá el comprobante por WhatsApp al <span className="font-medium">092 744 725</span>.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-24">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Resumen del pedido</h2>

                  {/* Items */}
                  <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.product.id} className="flex gap-3">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                          {item.product.images?.[0] ? (
                            <Image
                              src={item.product.images[0]}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                              Sin img
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 line-clamp-1">
                            {item.product.name}
                          </p>
                          <p className="text-xs text-slate-500">x{item.quantity}</p>
                          <p className="text-sm font-semibold text-slate-900">
                            {formatPrice(item.product.price_numeric * item.quantity, item.product.currency)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Coupon */}
                  <div className="mb-6">
                    {!appliedCoupon ? (
                      <div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            placeholder="Código de descuento"
                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 placeholder:text-slate-400"
                          />
                          <button
                            type="button"
                            onClick={handleApplyCoupon}
                            disabled={couponLoading || !couponCode.trim()}
                            className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg text-sm font-medium hover:bg-slate-300 transition-colors disabled:opacity-50"
                          >
                            {couponLoading ? '...' : 'Aplicar'}
                          </button>
                        </div>
                        {couponError && (
                          <p className="text-red-500 text-xs mt-1">{couponError}</p>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-700">
                            {appliedCoupon.code}
                          </span>
                          <span className="text-xs text-green-600">
                            (-{formatPrice(appliedCoupon.discount_amount)})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="text-green-600 hover:text-green-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Totals */}
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal</span>
                      <span>{formatPrice(subtotal, displayCurrency)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Descuento</span>
                        <span>-{formatPrice(discount, displayCurrency)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-600">
                      <span>Envío</span>
                      <span>
                        {shippingMethod === 'pickup' ? (
                          'Gratis (retiro)'
                        ) : shippingMethod === 'freight' ? (
                          <span className="text-amber-600">Según lo acordado</span>
                        ) : shippingPaidOnDelivery ? (
                          <span className="text-amber-600">A pagar en destino</span>
                        ) : (
                          formatPrice(shippingCost, displayCurrency)
                        )}
                      </span>
                    </div>
                    <hr className="border-slate-200" />
                    <div className="flex justify-between text-xl font-bold text-slate-900">
                      <span>Total</span>
                      <span>{formatPrice(total, displayCurrency)}</span>
                    </div>
                  </div>

                  {/* Currency Selector — always available */}
                  <div className="mb-6 p-4 bg-slate-50 rounded-xl">
                    <p className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1.5">
                      <ArrowRightLeft className="h-3.5 w-3.5" />
                      Moneda de pago
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setValue('paymentCurrency', 'UYU')}
                        className={`py-2 rounded-lg border-2 text-center text-sm font-semibold transition-colors ${
                          paymentCurrency === 'UYU'
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        $ UYU
                      </button>
                      <button
                        type="button"
                        onClick={() => setValue('paymentCurrency', 'USD')}
                        className={`py-2 rounded-lg border-2 text-center text-sm font-semibold transition-colors ${
                          paymentCurrency === 'USD'
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        US$ USD
                      </button>
                    </div>
                    {paymentMethod === 'mercadopago' && paymentCurrency === 'USD' && (
                      <p className="text-xs text-slate-500 mt-2">
                        MercadoPago procesará el cobro en pesos (UYU) al tipo de cambio del día.
                      </p>
                    )}
                  </div>

                  {/* Terms */}
                  <div className="mb-6">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register('acceptedTerms')}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-600">
                        Acepto los{' '}
                        <Link href="/terminos" className="text-blue-600 hover:underline">
                          términos y condiciones
                        </Link>{' '}
                        y la{' '}
                        <Link href="/privacidad" className="text-blue-600 hover:underline">
                          política de privacidad
                        </Link>
                      </span>
                    </label>
                    {errors.acceptedTerms && <p className="text-red-500 text-xs mt-1">{errors.acceptedTerms.message}</p>}
                  </div>

                  {/* Submit */}
                  {submitError && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                      {submitError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
                  >
                    {paymentMethod === 'transfer' ? (
                      <Banknote className="h-5 w-5" />
                    ) : (
                      <CreditCard className="h-5 w-5" />
                    )}
                    {isSubmitting
                      ? 'Procesando...'
                      : paymentMethod === 'transfer'
                        ? 'Confirmar pedido'
                        : 'Continuar al pago'}
                  </button>

                  {/* Trust badges */}
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
                    <ShieldCheck className="h-4 w-4 text-green-500" />
                    {paymentMethod === 'transfer'
                      ? 'Pedido seguro • Confirmación por WhatsApp' 
                      : 'Pago seguro con MercadoPago'}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
