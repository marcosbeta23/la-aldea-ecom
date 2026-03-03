'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';

/**
 * All status options with logical grouping and transition rules.
 * The `allowedFrom` array defines which statuses can transition TO this one.
 * If empty, it's reachable from any status (for initial/reset states).
 */
const statusOptions = [
  // ── Active workflow ──
  { value: 'pending', label: 'Pendiente', icon: '⏳', color: 'bg-amber-100 text-amber-800 border-amber-300', description: 'Esperando pago del cliente', group: 'workflow', allowedFrom: [] as string[] },
  { value: 'paid', label: 'Pagado', icon: '💳', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', description: 'Pago confirmado', group: 'workflow', allowedFrom: ['pending', 'paid_pending_verification'] },
  { value: 'paid_pending_verification', label: 'Por Verificar', icon: '🔔', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', description: 'Pago recibido, verificar monto', group: 'workflow', allowedFrom: ['pending'] },
  { value: 'ready_to_invoice', label: 'Por Facturar', icon: '📝', color: 'bg-blue-100 text-blue-800 border-blue-300', description: 'Listo para emitir factura', group: 'workflow', allowedFrom: ['paid', 'paid_pending_verification'] },
  { value: 'invoiced', label: 'Facturado', icon: '📄', color: 'bg-indigo-100 text-indigo-800 border-indigo-300', description: 'Factura emitida', group: 'workflow', allowedFrom: ['ready_to_invoice', 'paid'] },
  { value: 'processing', label: 'En Preparación', icon: '📦', color: 'bg-cyan-100 text-cyan-800 border-cyan-300', description: 'Preparando pedido', group: 'workflow', allowedFrom: ['invoiced', 'paid', 'ready_to_invoice'] },
  { value: 'shipped', label: 'Enviado', icon: '🚚', color: 'bg-purple-100 text-purple-800 border-purple-300', description: 'En camino al cliente', group: 'workflow', allowedFrom: ['invoiced', 'processing'] },
  { value: 'delivered', label: 'Entregado', icon: '✅', color: 'bg-green-100 text-green-800 border-green-300', description: 'Pedido completado', group: 'workflow', allowedFrom: ['shipped', 'processing', 'invoiced'] },
  // ── Problem states ──
  { value: 'awaiting_stock', label: 'Sin Stock', icon: '⚠️', color: 'bg-orange-100 text-orange-800 border-orange-300', description: 'Producto sin stock, contactar cliente', group: 'problem', allowedFrom: ['paid', 'paid_pending_verification', 'ready_to_invoice', 'processing'] },
  { value: 'refunded', label: 'Reembolsado', icon: '↩️', color: 'bg-rose-100 text-rose-800 border-rose-300', description: 'Dinero devuelto al cliente', group: 'problem', allowedFrom: ['paid', 'paid_pending_verification', 'awaiting_stock', 'ready_to_invoice', 'invoiced'] },
  { value: 'cancelled', label: 'Cancelado', icon: '❌', color: 'bg-red-100 text-red-800 border-red-300', description: 'Pedido cancelado', group: 'problem', allowedFrom: ['pending', 'paid', 'paid_pending_verification', 'awaiting_stock'] },
];

function getAvailableTransitions(currentStatus: string) {
  return statusOptions.filter(opt => {
    if (opt.value === currentStatus) return true; // Always show current
    if (opt.allowedFrom.length === 0) return true; // Reachable from anywhere
    return opt.allowedFrom.includes(currentStatus);
  });
}

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
  const [showAll, setShowAll] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const hasChanged = status !== currentStatus;
  const availableOptions = showAll ? statusOptions : getAvailableTransitions(currentStatus);
  const isForced = hasChanged && !getAvailableTransitions(currentStatus).some(o => o.value === status);

  const handleUpdate = async () => {
    if (!hasChanged) return;

    // Confirm dangerous transitions
    if (status === 'cancelled' || status === 'refunded') {
      if (!confirm(`¿Estás seguro de marcar este pedido como "${statusOptions.find(o => o.value === status)?.label}"? Esta acción es difícil de revertir.`)) {
        return;
      }
    }

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
      setStatus(currentStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  // Group workflow and problem states
  const workflowOptions = availableOptions.filter(o => o.group === 'workflow');
  const problemOptions = availableOptions.filter(o => o.group === 'problem');

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Estado del pedido</h2>
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
        >
          {showAll ? 'Ver sugeridos' : 'Ver todos'}
        </button>
      </div>

      {/* Workflow states */}
      <div className="space-y-2">
        {workflowOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setStatus(option.value)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
              status === option.value
                ? option.color + ' border-current shadow-sm'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="text-lg shrink-0">{option.icon}</span>
            <div className="flex-1 min-w-0">
              <span className={`font-medium text-sm ${status === option.value ? '' : 'text-slate-700'}`}>
                {option.label}
              </span>
              <p className={`text-xs mt-0.5 ${status === option.value ? 'opacity-80' : 'text-slate-400'}`}>
                {option.description}
              </p>
            </div>
            {status === option.value && (
              <CheckCircle2 className="h-5 w-5 shrink-0" />
            )}
          </button>
        ))}
      </div>

      {/* Problem states — visually separated */}
      {problemOptions.length > 0 && (
        <>
          <div className="my-3 border-t border-slate-200" />
          <p className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Problemas</p>
          <div className="space-y-2">
            {problemOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setStatus(option.value)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                  status === option.value
                    ? option.color + ' border-current shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="text-lg shrink-0">{option.icon}</span>
                <div className="flex-1 min-w-0">
                  <span className={`font-medium text-sm ${status === option.value ? '' : 'text-slate-700'}`}>
                    {option.label}
                  </span>
                  <p className={`text-xs mt-0.5 ${status === option.value ? 'opacity-80' : 'text-slate-400'}`}>
                    {option.description}
                  </p>
                </div>
                {status === option.value && (
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Forced transition warning */}
      {isForced && (
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">
            Este cambio de estado no sigue el flujo normal. Asegurate de que es correcto.
          </p>
        </div>
      )}

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
