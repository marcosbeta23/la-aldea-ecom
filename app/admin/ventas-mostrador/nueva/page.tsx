'use client';

import { useState } from 'react';
import { ArrowLeft, Loader2, Check } from 'lucide-react';
import Link from 'next/link';

const PAYMENT_METHODS = [
  { key: 'efectivo', label: 'Efectivo' },
  { key: 'credito', label: 'Crédito' },
  { key: 'transfer', label: 'Transferencia' },
] as const;

type PaymentMethod = typeof PAYMENT_METHODS[number]['key'];

export default function NuevaVentaMostradorPage() {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'UYU' | 'USD'>('UYU');
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ order_number: string; total: number; currency: string } | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    const parsedAmount = parseFloat(amount.replace(',', '.'));

    if (!description.trim()) {
      setError('La descripción es requerida');
      return;
    }
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Ingresá un monto válido');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/admin/ventas-mostrador', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: description.trim(),
          amount: parsedAmount,
          currency,
          customer_name: customerName || undefined,
          payment_method: paymentMethod,
          notes: notes || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al registrar la venta');
        return;
      }

      setSuccess({ order_number: data.order_number, total: data.total, currency: data.currency });
    } catch {
      setError('Error de conexión');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewSale = () => {
    setDescription('');
    setAmount('');
    setCurrency('UYU');
    setCustomerName('');
    setPaymentMethod('efectivo');
    setNotes('');
    setSuccess(null);
    setError('');
  };

  // Success screen
  if (success) {
    const formattedTotal = success.currency === 'USD'
      ? `US$ ${success.total.toLocaleString('es-UY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : `$ ${success.total.toLocaleString('es-UY', { maximumFractionDigits: 0 })}`;

    return (
      <div className="max-w-md mx-auto mt-12 text-center">
        <div className="bg-emerald-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <Check className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-1">Venta Registrada</h2>
        <p className="text-slate-600 mb-2">
          <span className="font-mono font-medium">{success.order_number}</span>
        </p>
        <p className="text-2xl font-bold text-emerald-600 mb-6">{formattedTotal}</p>
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

  const parsedAmount = parseFloat(amount.replace(',', '.'));
  const validAmount = !isNaN(parsedAmount) && parsedAmount > 0;

  return (
    <div className="max-w-lg mx-auto space-y-6">
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

      {/* Main form */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-5">
        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Descripción <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej: Bomba de agua, Sale, Reparación..."
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            autoFocus
          />
        </div>

        {/* Amount + Currency */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Monto <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <div className="flex rounded-lg border border-slate-200 overflow-hidden text-sm font-medium shrink-0">
              <button
                onClick={() => setCurrency('UYU')}
                className={`px-3 py-2.5 transition-colors ${currency === 'UYU' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
              >
                $ UYU
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-3 py-2.5 transition-colors ${currency === 'USD' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
              >
                US$ USD
              </button>
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={currency === 'USD' ? '0.00' : '0'}
              min="0"
              step={currency === 'USD' ? '0.01' : '1'}
              className="flex-1 px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Payment method */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Medio de pago
          </label>
          <div className="flex gap-2">
            {PAYMENT_METHODS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setPaymentMethod(key)}
                className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                  paymentMethod === key
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Customer name (optional) */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Cliente <span className="text-slate-400 font-normal">(opcional)</span>
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Nombre del cliente"
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        {/* Notes (optional) */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Notas <span className="text-slate-400 font-normal">(opcional)</span>
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
        disabled={submitting || !description.trim() || !validAmount}
        className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Registrando...
          </>
        ) : validAmount ? (
          `Registrar — ${currency === 'USD' ? `US$ ${parsedAmount.toLocaleString('es-UY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `$ ${parsedAmount.toLocaleString('es-UY', { maximumFractionDigits: 0 })}`}`
        ) : (
          'Registrar Venta'
        )}
      </button>
    </div>
  );
}
