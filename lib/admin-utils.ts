export const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  pending: { label: 'Pendiente', classes: 'bg-amber-100 text-amber-800' },
  paid: { label: 'Pagado', classes: 'bg-green-100 text-green-800' },
  paid_pending_verification: { label: 'Por verificar', classes: 'bg-blue-100 text-blue-800' },
  processing: { label: 'En proceso', classes: 'bg-indigo-100 text-indigo-800' },
  shipped: { label: 'Enviado', classes: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Entregado', classes: 'bg-slate-100 text-slate-700' },
  cancelled: { label: 'Cancelado', classes: 'bg-red-100 text-red-800' },
  refunded: { label: 'Reembolsado', classes: 'bg-red-100 text-red-700' },
  ready_to_invoice: { label: 'Por facturar', classes: 'bg-teal-100 text-teal-800' },
  invoiced: { label: 'Facturado', classes: 'bg-teal-100 text-teal-700' },
};

export function formatUYU(v: number) {
  return `$ ${v.toLocaleString('es-UY', { maximumFractionDigits: 0 })}`;
}

export function formatUSD(v: number) {
  return `U$S ${v.toLocaleString('es-UY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const todayStr = new Date().toLocaleDateString('es-UY', { timeZone: 'America/Montevideo', day: '2-digit', month: '2-digit', year: 'numeric' });
  const orderDayStr = date.toLocaleDateString('es-UY', { timeZone: 'America/Montevideo', day: '2-digit', month: '2-digit', year: 'numeric' });
  if (todayStr === orderDayStr) {
    return date.toLocaleTimeString('es-UY', { timeZone: 'America/Montevideo', hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString('es-UY', {
    timeZone: 'America/Montevideo',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
