'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PendientePage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-yellow-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Pago Pendiente
        </h1>
        
        <p className="text-gray-600 mb-6">
          Tu pago está siendo procesado. Esto puede tomar algunos minutos.
        </p>
        
        {orderId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">ID de Pedido</p>
            <p className="font-mono text-sm text-gray-900">{orderId}</p>
          </div>
        )}
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            Te enviaremos un email cuando el pago sea confirmado. Por favor, no cierres esta ventana.
          </p>
        </div>
        
        <div className="space-y-3">
          <p className="text-xs text-gray-500">
            Los pagos con tarjeta de débito pueden tardar hasta 2 días hábiles en confirmarse.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Link
              href="/"
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Volver al inicio
            </Link>
            
            <Link
              href="/productos"
              className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Ver productos
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
