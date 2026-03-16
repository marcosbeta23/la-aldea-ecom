'use client';

import { useState } from 'react';
import { Globe } from 'lucide-react';
import { formatUYU, formatUSD } from '@/lib/admin-utils';

export default function CombinedRevenueCard({ 
  combinedRevenueUYU, 
  revenueUYU, 
  revenueUSD, 
  exchangeRate 
}: { 
  combinedRevenueUYU: number, 
  revenueUYU: number, 
  revenueUSD: number, 
  exchangeRate: number 
}) {
  const [combinedCurrency, setCombinedCurrency] = useState<'UYU' | 'USD'>('UYU');

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Ingresos Brutos (30d)</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Moneda:</span>
            <button
              onClick={() => setCombinedCurrency(c => c === 'UYU' ? 'USD' : 'UYU')}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${combinedCurrency === 'USD' ? 'bg-blue-600' : 'bg-slate-300'}`}
              aria-label={`Cambiar a ${combinedCurrency === 'USD' ? 'UYU' : 'USD'}`}
            >
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${combinedCurrency === 'USD' ? 'translate-x-5' : 'translate-x-1'}`} />
            </button>
            <span className="text-xs font-bold text-slate-600 w-8">{combinedCurrency}</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900 leading-none">
            {combinedCurrency === 'UYU'
              ? formatUYU(combinedRevenueUYU)
              : formatUSD(combinedRevenueUYU / (exchangeRate || 1))}
          </p>
          <p className="mt-2 text-xs text-slate-400 font-medium">
            {formatUYU(revenueUYU)} + {formatUSD(revenueUSD)}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
          <Globe className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
