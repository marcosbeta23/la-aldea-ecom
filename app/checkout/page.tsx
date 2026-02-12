'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, CreditCard, Truck, MapPin, Phone, Mail, User, ShieldCheck, Tag, X, Check, AlertCircle, Building2, Banknote, Receipt, FileText, MessageCircle, Info } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import Header from '@/components/Header';
import { trackBeginCheckout } from '@/components/Analytics';
import { getCartShippingType, getShippingOptions, getShippingZone, SHIPPING_CONFIG, DAC_RATES } from '@/lib/shipping';

interface CouponData {
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  discount_amount: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponData | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    department: '',
    notes: '',
    shippingMethod: 'pickup' as 'pickup' | 'delivery',
    paymentMethod: 'mercadopago' as 'mercadopago' | 'transfer',
    // Billing/Invoice fields
    invoiceType: 'consumer_final' as 'consumer_final' | 'invoice_rut',
    invoiceTaxId: '',
    invoiceBusinessName: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

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
    if (!formData.department) return 'interior';
    return getShippingZone(formData.department, formData.city);
  }, [formData.department, formData.city]);

  const shippingOptions = useMemo(() => {
    return getShippingOptions(cartShippingType, shippingZone);
  }, [cartShippingType, shippingZone]);

  // Calculate totals
  const subtotal = mounted ? getSubtotal() : 0;
  const discount = appliedCoupon?.discount_amount || 0;
  // Shipping cost: 0 for pickup, actual cost if known, or 0 if paid on delivery
  const shippingCost = formData.shippingMethod === 'delivery' && shippingOptions.deliveryCost !== null 
    ? shippingOptions.deliveryCost 
    : 0;
  const shippingPaidOnDelivery = formData.shippingMethod === 'delivery' && shippingOptions.deliveryCost === null;
  const total = subtotal - discount + shippingCost;

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    }

    if (formData.shippingMethod === 'delivery') {
      if (!formData.address.trim()) {
        newErrors.address = 'La dirección es requerida para envío';
      }
      if (!formData.city.trim()) {
        newErrors.city = 'La ciudad es requerida';
      }
      if (!formData.department.trim()) {
        newErrors.department = 'El departamento es requerido';
      }
    }

    // Validate invoice fields when RUT invoice is selected
    if (formData.invoiceType === 'invoice_rut') {
      if (!formData.invoiceTaxId.trim()) {
        newErrors.invoiceTaxId = 'El RUT es requerido para factura con crédito fiscal';
      } else if (!/^\d{12}$/.test(formData.invoiceTaxId.replace(/\D/g, ''))) {
        newErrors.invoiceTaxId = 'RUT inválido (debe tener 12 dígitos)';
      }
      if (!formData.invoiceBusinessName.trim()) {
        newErrors.invoiceBusinessName = 'La razón social es requerida';
      }
    }

    if (!acceptedTerms) {
      newErrors.terms = 'Debés aceptar los términos y condiciones';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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

  // Submit order
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Create order (matching Zod schema structure)
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            name: formData.name,
            email: formData.email || undefined,
            phone: formData.phone,
            shipping_address: formData.shippingMethod === 'delivery' ? formData.address : undefined,
            shipping_city: formData.shippingMethod === 'delivery' ? formData.city : undefined,
            shipping_department: formData.shippingMethod === 'delivery' ? formData.department : undefined,
            shipping_type: formData.shippingMethod,
            shipping_cost: shippingCost,
            notes: formData.notes || undefined,
            payment_method: formData.paymentMethod,
            // Billing/Invoice fields
            invoice_type: formData.invoiceType,
            invoice_tax_id: formData.invoiceType === 'invoice_rut' ? formData.invoiceTaxId.replace(/\D/g, '') : undefined,
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
        throw new Error(data.error || 'Error al crear el pedido');
      }

      // Handle redirect based on payment method
      if (formData.paymentMethod === 'transfer') {
        // Bank transfer: redirect to pending page with order info
        clearCart();
        router.push(`/pendiente?order=${data.order_number}&method=transfer`);
      } else if (data.init_point) {
        // MercadoPago: redirect to processing page first
        clearCart();
        const processingUrl = `/procesando?redirect=${encodeURIComponent(data.init_point)}&order=${data.order_number}&method=mercadopago`;
        router.push(processingUrl);
      } else {
        // Fallback: redirect to success page
        clearCart();
        router.push(`/pedido/${data.order_number}?success=true`);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setErrors({ submit: 'Error al procesar el pedido. Intentá de nuevo.' });
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

          <form onSubmit={handleSubmit}>
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
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 placeholder:text-slate-400 ${
                          errors.name ? 'border-red-500' : 'border-slate-300'
                        }`}
                        placeholder="Juan Pérez"
                      />
                      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        <Mail className="inline h-4 w-4 mr-1" />
                        Email *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 placeholder:text-slate-400 ${
                          errors.email ? 'border-red-500' : 'border-slate-300'
                        }`}
                        placeholder="juan@email.com"
                      />
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        <Phone className="inline h-4 w-4 mr-1" />
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 placeholder:text-slate-400 ${
                          errors.phone ? 'border-red-500' : 'border-slate-300'
                        }`}
                        placeholder="099 123 456"
                      />
                      {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
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
                        onClick={() => setFormData({ ...formData, shippingMethod: 'pickup' })}
                        className={`p-4 rounded-xl border-2 text-left transition-colors ${
                          formData.shippingMethod === 'pickup'
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
                        onClick={() => setFormData({ ...formData, shippingMethod: 'delivery' })}
                        className={`p-4 rounded-xl border-2 text-left transition-colors ${
                          formData.shippingMethod === 'delivery'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-slate-900">{shippingOptions.deliveryLabel}</span>
                          {shippingOptions.deliveryCost !== null ? (
                            <span className={shippingOptions.deliveryCost === 0 ? 'text-green-600 font-semibold' : 'text-slate-900 font-semibold'}>
                              {shippingOptions.deliveryCost === 0 ? 'Gratis' : formatPrice(shippingOptions.deliveryCost)}
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
                  </div>

                  {/* Freight quote message */}
                  {shippingOptions.requiresQuote && formData.shippingMethod === 'delivery' && (
                    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm text-amber-800 font-medium">
                            Tu pedido incluye productos grandes que requieren flete
                          </p>
                          <p className="text-sm text-amber-700 mt-1">
                            Te contactaremos por WhatsApp para coordinar fecha y costo del envío.
                          </p>
                          <a
                            href={`https://wa.me/59892744725?text=${encodeURIComponent('Hola! Quiero consultar por el costo de flete para un pedido.')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 mt-2 text-sm text-green-700 hover:text-green-800 font-medium"
                          >
                            <MessageCircle className="h-4 w-4" />
                            Consultar ahora por WhatsApp
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* DAC shipping info - show rates table */}
                  {cartShippingType === 'dac' && formData.shippingMethod === 'delivery' && shippingOptions.deliveryCost === null && (
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
                  {formData.shippingMethod === 'delivery' && (
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
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 placeholder:text-slate-400 ${
                              errors.address ? 'border-red-500' : 'border-slate-300'
                            }`}
                            placeholder="Av. Principal 1234"
                          />
                          {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Ciudad *
                            </label>
                            <input
                              type="text"
                              value={formData.city}
                              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 placeholder:text-slate-400 ${
                                errors.city ? 'border-red-500' : 'border-slate-300'
                              }`}
                              placeholder="Montevideo"
                            />
                            {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Departamento *
                            </label>
                            <select
                              value={formData.department}
                              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
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
                            {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department}</p>}
                          </div>
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
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
                      onClick={() => setFormData({ ...formData, invoiceType: 'consumer_final', invoiceTaxId: '', invoiceBusinessName: '' })}
                      className={`p-4 rounded-xl border-2 text-left transition-colors ${
                        formData.invoiceType === 'consumer_final'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Receipt className={`h-5 w-5 ${formData.invoiceType === 'consumer_final' ? 'text-blue-600' : 'text-slate-400'}`} />
                        <div>
                          <p className="font-medium text-slate-900">Consumidor Final</p>
                          <p className="text-xs text-slate-500">Sin RUT (boleta/ticket)</p>
                        </div>
                      </div>
                      {formData.invoiceType === 'consumer_final' && (
                        <Check className="h-5 w-5 text-blue-600 mt-2" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, invoiceType: 'invoice_rut' })}
                      className={`p-4 rounded-xl border-2 text-left transition-colors ${
                        formData.invoiceType === 'invoice_rut'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <FileText className={`h-5 w-5 ${formData.invoiceType === 'invoice_rut' ? 'text-blue-600' : 'text-slate-400'}`} />
                        <div>
                          <p className="font-medium text-slate-900">Factura con RUT</p>
                          <p className="text-xs text-slate-500">Con crédito fiscal</p>
                        </div>
                      </div>
                      {formData.invoiceType === 'invoice_rut' && (
                        <Check className="h-5 w-5 text-blue-600 mt-2" />
                      )}
                    </button>
                  </div>

                  {/* RUT Invoice Fields */}
                  {formData.invoiceType === 'invoice_rut' && (
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
                            value={formData.invoiceTaxId}
                            onChange={(e) => {
                              // Format RUT: XX XXXXXX XXXX XX
                              const digits = e.target.value.replace(/\D/g, '').slice(0, 12);
                              let formatted = digits;
                              if (digits.length > 2) formatted = digits.slice(0, 2) + ' ' + digits.slice(2);
                              if (digits.length > 8) formatted = digits.slice(0, 2) + ' ' + digits.slice(2, 8) + ' ' + digits.slice(8);
                              if (digits.length > 12) formatted = digits.slice(0, 2) + ' ' + digits.slice(2, 8) + ' ' + digits.slice(8, 12) + ' ' + digits.slice(12);
                              setFormData({ ...formData, invoiceTaxId: formatted });
                            }}
                            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 placeholder:text-slate-400 ${
                              errors.invoiceTaxId ? 'border-red-500' : 'border-slate-300'
                            }`}
                            placeholder="21 123456 0001 19"
                          />
                          {errors.invoiceTaxId && <p className="text-red-500 text-sm mt-1">{errors.invoiceTaxId}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Razón Social *
                          </label>
                          <input
                            type="text"
                            value={formData.invoiceBusinessName}
                            onChange={(e) => setFormData({ ...formData, invoiceBusinessName: e.target.value })}
                            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 placeholder:text-slate-400 ${
                              errors.invoiceBusinessName ? 'border-red-500' : 'border-slate-300'
                            }`}
                            placeholder="Nombre de la empresa o persona"
                          />
                          {errors.invoiceBusinessName && <p className="text-red-500 text-sm mt-1">{errors.invoiceBusinessName}</p>}
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
                      onClick={() => setFormData({ ...formData, paymentMethod: 'mercadopago' })}
                      className={`p-4 rounded-xl border-2 text-left transition-colors ${
                        formData.paymentMethod === 'mercadopago'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className={`h-5 w-5 ${formData.paymentMethod === 'mercadopago' ? 'text-blue-600' : 'text-slate-400'}`} />
                        <div>
                          <p className="font-medium text-slate-900">MercadoPago</p>
                          <p className="text-xs text-slate-500">Tarjeta, débito o billetera</p>
                        </div>
                      </div>
                      {formData.paymentMethod === 'mercadopago' && (
                        <Check className="h-5 w-5 text-blue-600 mt-2" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, paymentMethod: 'transfer' })}
                      className={`p-4 rounded-xl border-2 text-left transition-colors ${
                        formData.paymentMethod === 'transfer'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Building2 className={`h-5 w-5 ${formData.paymentMethod === 'transfer' ? 'text-blue-600' : 'text-slate-400'}`} />
                        <div>
                          <p className="font-medium text-slate-900">Transferencia</p>
                          <p className="text-xs text-slate-500">Transferencia bancaria</p>
                        </div>
                      </div>
                      {formData.paymentMethod === 'transfer' && (
                        <Check className="h-5 w-5 text-blue-600 mt-2" />
                      )}
                    </button>
                  </div>

                  {/* Bank Transfer Info */}
                  {formData.paymentMethod === 'transfer' && (
                    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-amber-800 mb-2">Datos para transferencia:</p>
                          <div className="space-y-1 text-amber-700">
                            <p><span className="font-medium">Banco:</span> BROU</p>
                            <p><span className="font-medium">Cuenta:</span> 001234567-00001</p>
                            <p><span className="font-medium">Titular:</span> La Aldea</p>
                            <p><span className="font-medium">RUT:</span> 21 123456 0001 19</p>
                          </div>
                          <p className="mt-3 text-amber-800">
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
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Descuento</span>
                        <span>-{formatPrice(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-600">
                      <span>Envío</span>
                      <span>
                        {formData.shippingMethod === 'pickup' ? (
                          'Gratis (retiro)'
                        ) : shippingPaidOnDelivery ? (
                          <span className="text-amber-600">A pagar en destino</span>
                        ) : shippingCost === 0 ? (
                          'Gratis'
                        ) : (
                          formatPrice(shippingCost)
                        )}
                      </span>
                    </div>
                    <hr className="border-slate-200" />
                    <div className="flex justify-between text-xl font-bold text-slate-900">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="mb-6">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
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
                    {errors.terms && <p className="text-red-500 text-xs mt-1">{errors.terms}</p>}
                  </div>

                  {/* Submit */}
                  {errors.submit && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                      {errors.submit}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
                  >
                    {formData.paymentMethod === 'transfer' ? (
                      <Banknote className="h-5 w-5" />
                    ) : (
                      <CreditCard className="h-5 w-5" />
                    )}
                    {isSubmitting 
                      ? 'Procesando...' 
                      : formData.paymentMethod === 'transfer' 
                        ? 'Confirmar pedido'
                        : 'Continuar al pago'}
                  </button>

                  {/* Trust badges */}
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
                    <ShieldCheck className="h-4 w-4 text-green-500" />
                    {formData.paymentMethod === 'transfer' 
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
