'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const COOKIE_CONSENT_KEY = 'laaldea_cookie_consent';
const MAX_GTAG_RETRIES = 8;

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      const timer = setTimeout(() => setShowBanner(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(
      COOKIE_CONSENT_KEY,
      JSON.stringify({
        essential: true,
        analytics: true,
        timestamp: new Date().toISOString(),
      })
    );
    setShowBanner(false);

    // Enable GA4 analytics storage
    const fireConsent = (attempt = 0) => {
      const gtag = (window as Window & {
        gtag?: (action: string, command: string, params: { analytics_storage: string }) => void;
      }).gtag;

      if (typeof window !== 'undefined' && typeof gtag === 'function') {
        gtag('consent', 'update', { analytics_storage: 'granted' });
      } else if (typeof window !== 'undefined' && attempt < MAX_GTAG_RETRIES) {
        setTimeout(() => fireConsent(attempt + 1), 500);
      }
    };
    fireConsent();

    // Notify deferred analytics loaders that consent is now granted.
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('laaldea:analytics-consent-granted'));
    }
  };

  if (!showBanner) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 w-72 animate-in slide-in-from-bottom-2 fade-in duration-300"
      role="dialog"
      aria-label="Aviso de cookies"
    >
      <div className="bg-slate-800 text-white rounded-xl shadow-xl p-4 border border-slate-700">
        <div className="flex items-start justify-between gap-3 mb-3">
          <p className="text-sm text-slate-200 leading-snug">
            Usamos cookies para el funcionamiento del sitio y análisis de uso.{' '}
            <Link
              href="/privacidad#cookies"
              className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
            >
              Más info
            </Link>
          </p>
          <button
            onClick={accept}
            className="shrink-0 p-1 text-slate-400 hover:text-white transition-colors rounded"
            aria-label="Cerrar y aceptar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <button
          onClick={accept}
          className="w-full py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}