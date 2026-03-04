'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RotateCcw, Loader2, AlertTriangle } from 'lucide-react';
import type { Order } from '@/types/database';

interface RefundButtonProps {
  order: Order;
  currency?: string;
}

export default function RefundButton({ order, currency = 'UYU' }: RefundButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [refundData, setRefundData] = useState({
    amount: order.total,
    reason: '',
    restoreStock: true,
  });
  
  // Can only refund orders that have been paid
  const canRefund = 
    order.mp_payment_id && 
    !['cancelled', 'refunded', 'pending', 'draft'].includes(order.status);
  
  const isRefunded = order.status === 'refunded' || !!order.refund_id;

  const formatAmount = (v: number) => {
    if (currency === 'USD') return `US$ ${v.toLocaleString('es-UY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    return `$ ${v.toLocaleString('es-UY', { maximumFractionDigits: 0 })}`;
  };
  const currencyLabel = currency === 'USD' ? 'USD' : 'UYU';
  
  const handleRefund = async () => {
    if (!refundData.reason.trim()) {
      setMessage({ type: 'error', text: 'Debes indicar un motivo' });
      return;
    }
    
    if (!confirm('¿Estás seguro de procesar este reembolso? Esta acción no se puede deshacer.')) {
      return;
    }
    
    setIsProcessing(true);
    setMessage(null);
    
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(refundData),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Error al procesar reembolso');
      }
      
      setMessage({ type: 'success', text: 'Reembolso procesado correctamente' });
      setIsOpen(false);
      router.refresh();
      
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error al procesar reembolso' });
    } finally {
      setIsProcessing(false);
    }
  };
  
  if (isRefunded) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-rose-700">
          <RotateCcw className="h-5 w-5" />
          <span className="font-medium">Pedido reembolsado</span>
        </div>
        {order.refund_amount && (
          <p className="text-sm text-rose-600 mt-1">
            Monto: {formatAmount(order.refund_amount)}
          </p>
        )}
        {order.refund_reason && (
          <p className="text-sm text-rose-600/80 mt-1">
            Motivo: {order.refund_reason}
          </p>
        )}
      </div>
    );
  }
  
  if (!canRefund) {
    return null;
  }
  
  return (
    <div className="mt-4">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-rose-300 text-rose-700 font-medium rounded-lg hover:bg-rose-50 transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          Procesar Reembolso
        </button>
      ) : (
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 space-y-4">
          <div className="flex items-start gap-2 text-rose-700">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Confirmar reembolso</p>
              <p className="text-sm text-rose-600">
                Esta acción iniciará el reembolso en MercadoPago
              </p>
            </div>
          </div>
          
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Monto a reembolsar ({currencyLabel})
            </label>
            <input
              type="number"
              value={refundData.amount}
              onChange={(e) => setRefundData({ ...refundData, amount: Number(e.target.value) })}
              max={order.total}
              min={1}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
            />
            <p className="mt-1 text-xs text-slate-500">
              Máximo: {formatAmount(order.total)}
            </p>
          </div>
          
          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Motivo del reembolso *
            </label>
            <textarea
              value={refundData.reason}
              onChange={(e) => setRefundData({ ...refundData, reason: e.target.value })}
              rows={2}
              placeholder="Ej: Producto sin stock, cliente solicitó cancelación..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
            />
          </div>
          
          {/* Restore Stock */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={refundData.restoreStock}
              onChange={(e) => setRefundData({ ...refundData, restoreStock: e.target.checked })}
              className="w-4 h-4 text-rose-600 border-slate-300 rounded focus:ring-rose-500"
            />
            <span className="text-sm text-slate-700">
              Reingresar stock de los productos
            </span>
          </label>
          
          {message && (
            <div className={`p-3 rounded-lg text-sm ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-700' 
                : 'bg-red-50 text-red-700'
            }`}>
              {message.text}
            </div>
          )}
          
          <div className="flex gap-2">
            <button
              onClick={() => setIsOpen(false)}
              disabled={isProcessing}
              className="flex-1 py-2 text-slate-600 font-medium rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleRefund}
              disabled={isProcessing}
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-rose-600 text-white font-medium rounded-lg hover:bg-rose-700 transition-colors disabled:bg-slate-300"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                'Confirmar Reembolso'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
