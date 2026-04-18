'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { Clock, Building2, MessageCircle, Copy, Check, Phone, Home, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { WHATSAPP_PHONE, WHATSAPP_DISPLAY, buildWhatsAppUrl } from '@/lib/constants';


function PendienteContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');
  const method = searchParams.get('method');
  const currency = searchParams.get('currency') || 'UYU';
  const isBankTransfer = method === 'transfer';

  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const bankDetailsByCurrency: Record<string, { banco: string; cuenta: string; titular: string; rut: string; moneda: string }> = {
    UYU: {
      banco: 'BROU',
      cuenta: '001234567-00001',
      titular: 'La Aldea',
      rut: '21 123456 0001 19',
      moneda: 'Pesos Uruguayos (UYU)',
    },
    USD: {
      banco: 'BROU',
      cuenta: '001234567-00002', // TODO: Get actual USD account number from business owner
      titular: 'La Aldea',
      rut: '21 123456 0001 19',
      moneda: 'Dólares Americanos (USD)',
    },
  };
  const bankDetails = bankDetailsByCurrency[currency] || bankDetailsByCurrency.UYU;
  const whatsapp = WHATSAPP_PHONE;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-20 lg:pt-24">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-lg mx-auto">
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 text-center">
              {/* Icon */}
              <div className={`w-20 h-20 ${isBankTransfer ? 'bg-blue-100' : 'bg-amber-100'} rounded-full flex items-center justify-center mx-auto mb-6`}>
                {isBankTransfer ? (
                  <Building2 className="w-10 h-10 text-blue-600" />
                ) : (
                  <Clock className="w-10 h-10 text-amber-600" />
                )}
              </div>

              <h1 className="text-2xl font-bold text-slate-900 mb-2">
                {isBankTransfer ? 'Pedido Registrado' : 'Pago Pendiente'}
              </h1>

              {orderNumber && (
                <p className="text-sm text-slate-500 mb-4">
                  Pedido <span className="font-mono font-medium text-slate-700">#{orderNumber}</span>
                </p>
              )}

              <p className="text-slate-600 mb-6">
                {isBankTransfer
                  ? 'Tu pedido fue registrado. Realizá la transferencia y envianos el comprobante para confirmarlo.'
                  : 'Tu pago está siendo procesado. Esto puede tomar algunos minutos.'}
              </p>

              {/* Bank Transfer Details */}
              {isBankTransfer && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6 text-left">
                  <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    Datos para transferencia en {bankDetails.moneda}
                  </h2>

                  <div className="space-y-3 text-sm">
                    {[
                      { label: 'Banco', value: bankDetails.banco },
                      { label: 'Cuenta', value: bankDetails.cuenta },
                      { label: 'Titular', value: bankDetails.titular },
                      { label: 'RUT', value: bankDetails.rut },
                      { label: 'Moneda', value: bankDetails.moneda },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between items-center">
                        <span className="text-slate-600">{label}:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900">{value}</span>
                          <button
                            onClick={() => copyToClipboard(value, label)}
                            className="p-1 hover:bg-slate-200 rounded transition-colors"
                          >
                            {copied === label ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4 text-slate-400" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* WhatsApp CTA for bank transfer */}
              {isBankTransfer && (
                <a
                  href={buildWhatsAppUrl(
                    whatsapp,
                    `Hola! Realicé una transferencia para el pedido ${orderNumber || ''}`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors mb-4"
                >
                  <MessageCircle className="h-5 w-5" />
                  Enviar comprobante por WhatsApp
                </a>
              )}

              {/* Info Box */}
              <div className={`${isBankTransfer ? 'bg-blue-50 border-blue-200' : 'bg-amber-50 border-amber-200'} border rounded-xl p-4 mb-6`}>
                <p className={`text-sm ${isBankTransfer ? 'text-blue-800' : 'text-amber-800'}`}>
                  {isBankTransfer
                    ? 'Una vez confirmado el pago, te contactaremos para coordinar la entrega o retiro.'
                    : 'Te enviaremos un email cuando el pago sea confirmado. Los pagos con tarjeta de débito pueden tardar hasta 2 días hábiles.'}
                </p>
              </div>

              {/* Contact */}
              <div className="flex items-center justify-center gap-2 text-sm text-slate-500 mb-6">
                <Phone className="h-4 w-4" />
                <span>Consultas: <a href={`tel:+${WHATSAPP_PHONE}`} className="text-blue-600 hover:underline">{WHATSAPP_DISPLAY}</a></span>
              </div>

              {/* Navigation */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/"
                  className="flex-1 flex items-center justify-center gap-2 border border-slate-300 text-slate-700 px-6 py-3 rounded-xl hover:bg-slate-50 transition-colors font-medium"
                >
                  <Home className="h-4 w-4" />
                  Volver al inicio
                </Link>

                <Link
                  href="/productos"
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Ver productos
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default function PendientePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <PendienteContent />
    </Suspense>
  );
}
