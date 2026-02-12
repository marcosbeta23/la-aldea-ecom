'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="es">
      <body>
        <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Algo salió mal
            </h1>
            
            <p className="text-slate-500 mb-6">
              Lo sentimos, ocurrió un error inesperado. 
              Nuestro equipo ha sido notificado.
            </p>
            
            {error.digest && (
              <p className="text-xs text-slate-400 mb-6 font-mono">
                Error ID: {error.digest}
              </p>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={reset}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Intentar de nuevo
              </button>
              
              <Link
                href="/"
                className="flex items-center justify-center gap-2 px-6 py-3 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Home className="h-4 w-4" />
                Ir al inicio
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
