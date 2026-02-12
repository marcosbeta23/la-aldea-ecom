'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2 } from 'lucide-react';

const statusOptions = [
  { value: 'pending', label: '⏳ Pendiente', color: 'bg-amber-100 text-amber-800 border-amber-300', description: 'Esperando pago' },
  { value: 'paid', label: '💳 Pagado', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', description: 'Listo para facturar' },
  { value: 'invoiced', label: '📄 Facturado', color: 'bg-blue-100 text-blue-800 border-blue-300', description: 'Factura emitida' },
  { value: 'shipped', label: '🚚 Enviado', color: 'bg-purple-100 text-purple-800 border-purple-300', description: 'En camino' },
  { value: 'delivered', label: '✅ Entregado', color: 'bg-slate-100 text-slate-800 border-slate-300', description: 'Pedido completado' },
  { value: 'out_of_stock', label: '⚠️ Sin Stock', color: 'bg-orange-100 text-orange-800 border-orange-300', description: 'Producto no disponible' },
  { value: 'refunded', label: '↩️ Reembolsado', color: 'bg-rose-100 text-rose-800 border-rose-300', description: 'Dinero devuelto' },
  { value: 'cancelled', label: '❌ Cancelado', color: 'bg-red-100 text-red-800 border-red-300', description: 'Pedido cancelado' },
];

export default function OrderStatusForm({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const hasChanged = status !== currentStatus;
  
  const handleUpdate = async () => {
    if (!hasChanged) return;
    
    setIsUpdating(true);
    setMessage(null);
    
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Error al actualizar');
      }
      
      setMessage({ type: 'success', text: 'Estado actualizado correctamente' });
      router.refresh();
      
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error al actualizar' });
      setStatus(currentStatus); // Revert
    } finally {
      setIsUpdating(false);
    }
  };
  
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Estado del pedido</h2>
      
      <div className="space-y-3">
        {statusOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setStatus(option.value)}
            className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-colors ${
              status === option.value
                ? option.color + ' border-current'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className={`font-medium ${status === option.value ? '' : 'text-slate-700'}`}>
              {option.label}
            </span>
            {status === option.value && (
              <CheckCircle2 className="h-5 w-5" />
            )}
          </button>
        ))}
      </div>
      
      {message && (
        <div className={`mt-4 p-3 rounded-lg text-sm ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700' 
            : 'bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}
      
      {hasChanged && (
        <button
          onClick={handleUpdate}
          disabled={isUpdating}
          className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          {isUpdating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Actualizando...
            </>
          ) : (
            'Guardar cambios'
          )}
        </button>
      )}
    </div>
  );
}
