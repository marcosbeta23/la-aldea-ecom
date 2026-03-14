'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Cookie } from 'lucide-react';
// posthog is imported dynamically in handlers to avoid bundle leak

const COOKIE_CONSENT_KEY = 'laaldea_cookie_consent';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if consent was already given
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Small delay to avoid layout shift on page load
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      essential: true,
      analytics: true,
      timestamp: new Date().toISOString(),
    }));
    setShowBanner(false);
    
    // Enable GTM Analytics with Partytown delay guard
    const fireConsent = () => {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('consent', 'update', {
          analytics_storage: 'granted',
        });
      } else if (typeof window !== 'undefined') {
        setTimeout(fireConsent, 500);
      }
    };
    fireConsent();

    // Enable PostHog persistent storage
    import('posthog-js').then(({ default: ph }) => {
      ph.set_config({ persistence: 'localStorage+cookie' });
    });
  };

  const acceptEssential = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      essential: true,
      analytics: false,
      timestamp: new Date().toISOString(),
    }));
    setShowBanner(false);
    
    // Disable Google Analytics with Partytown delay guard
    const fireConsent = () => {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('consent', 'update', {
          analytics_storage: 'denied',
        });
      } else if (typeof window !== 'undefined') {
        setTimeout(fireConsent, 500);
      }
    };
    fireConsent();

    // Opt out of PostHog tracking
    import('posthog-js').then(({ default: ph }) => {
      ph.opt_out_capturing();
    });
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom duration-300">
      <div className="max-w-4xl mx-auto bg-slate-900 text-white rounded-2xl shadow-2xl p-6 md:flex md:items-center md:gap-6">
        {/* Icon */}
        <div className="hidden md:block">
          <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
            <Cookie className="w-6 h-6 text-amber-400" />
          </div>
        </div>
        
        {/* Text */}
        <div className="flex-1 mb-4 md:mb-0">
          <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
            <Cookie className="w-5 h-5 text-amber-400 md:hidden" />
            Usamos cookies
          </h3>
          <p className="text-slate-300 text-sm">
            Utilizamos cookies esenciales para el funcionamiento del sitio y cookies de análisis 
            para entender cómo lo usás y mejorar tu experiencia.{' '}
            <Link href="/privacidad" className="text-blue-400 hover:text-blue-300 underline">
              Ver política de privacidad
            </Link>
          </p>
        </div>
        
        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={acceptEssential}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white border border-slate-600 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Solo esenciales
          </button>
          <button
            onClick={acceptAll}
            className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Aceptar todas
          </button>
        </div>
        
        {/* Close button (mobile) */}
        <button
          onClick={acceptEssential}
          className="absolute top-3 right-3 p-1 text-slate-400 hover:text-white md:hidden"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
