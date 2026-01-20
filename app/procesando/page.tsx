'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CreditCard, Loader2, Shield, CheckCircle2 } from 'lucide-react';
import Header from '@/components/Header';

function ProcessingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [stage, setStage] = useState(0);
  const [dots, setDots] = useState('');
  
  const redirectUrl = searchParams.get('redirect');
  const orderNumber = searchParams.get('order');
  const method = searchParams.get('method') || 'mercadopago';
  
  // Animated dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 400);
    return () => clearInterval(interval);
  }, []);
  
  // Stage progression
  useEffect(() => {
    const stages = [
      { delay: 500, stage: 1 },   // Verificando pedido
      { delay: 1200, stage: 2 },  // Preparando pago seguro
      { delay: 2000, stage: 3 },  // Redirigiendo
    ];
    
    stages.forEach(({ delay, stage: s }) => {
      setTimeout(() => setStage(s), delay);
    });
  }, []);
  
  // Redirect after showing all stages
  useEffect(() => {
    if (stage === 3 && redirectUrl) {
      const timer = setTimeout(() => {
        window.location.href = redirectUrl;
      }, 800);
      return () => clearTimeout(timer);
    }
    
    // Fallback if no redirect URL after 10 seconds
    if (!redirectUrl) {
      const fallback = setTimeout(() => {
        router.push('/');
      }, 10000);
      return () => clearTimeout(fallback);
    }
  }, [stage, redirectUrl, router]);
  
  const steps = [
    { 
      icon: CheckCircle2, 
      label: 'Pedido verificado',
      active: stage >= 1 
    },
    { 
      icon: Shield, 
      label: 'Conexión segura',
      active: stage >= 2 
    },
    { 
      icon: CreditCard, 
      label: method === 'mercadopago' ? 'Redirigiendo a MercadoPago' : 'Procesando',
      active: stage >= 3 
    },
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-20 lg:pt-24">
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-lg">
            {/* Main Card */}
            <div className="rounded-2xl bg-white p-8 shadow-xl shadow-slate-200/50">
              {/* Animated Icon */}
              <div className="mx-auto mb-8 relative">
                <div className="w-24 h-24 mx-auto relative">
                  {/* Outer rotating ring */}
                  <div className="absolute inset-0 rounded-full border-4 border-blue-100 animate-pulse" />
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin" />
                  
                  {/* Inner icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <CreditCard className="h-10 w-10 text-blue-600" />
                  </div>
                </div>
              </div>
              
              {/* Title */}
              <h1 className="text-center text-2xl font-bold text-slate-900 mb-2">
                Procesando tu pedido{dots}
              </h1>
              
              {orderNumber && (
                <p className="text-center text-sm text-slate-500 mb-8">
                  Pedido #{orderNumber}
                </p>
              )}
              
              {/* Progress Steps */}
              <div className="space-y-4 mb-8">
                {steps.map((step, i) => (
                  <div 
                    key={i}
                    className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-500 ${
                      step.active 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'bg-slate-50 text-slate-400'
                    }`}
                  >
                    {step.active ? (
                      <step.icon className="h-5 w-5 flex-shrink-0" />
                    ) : (
                      <Loader2 className="h-5 w-5 flex-shrink-0 animate-spin" />
                    )}
                    <span className={`text-sm font-medium ${step.active ? '' : 'opacity-60'}`}>
                      {step.label}
                    </span>
                    {step.active && (
                      <CheckCircle2 className="h-4 w-4 ml-auto text-green-500" />
                    )}
                  </div>
                ))}
              </div>
              
              {/* Security Badge */}
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                <Shield className="h-4 w-4" />
                <span>Transacción segura • Datos encriptados</span>
              </div>
            </div>
            
            {/* Help Text */}
            <p className="mt-6 text-center text-sm text-slate-500">
              No cierres esta ventana. Serás redirigido automáticamente.
            </p>
            
            {/* Fallback Link */}
            {redirectUrl && stage >= 3 && (
              <p className="mt-4 text-center">
                <a 
                  href={redirectUrl}
                  className="text-sm text-blue-600 hover:text-blue-700 underline"
                >
                  Si no sos redirigido, hacé clic aquí
                </a>
              </p>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export default function ProcesandoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    }>
      <ProcessingContent />
    </Suspense>
  );
}
