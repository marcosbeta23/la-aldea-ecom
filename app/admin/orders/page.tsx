import { supabaseAdmin } from '@/lib/supabase';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Phone,
  Globe,
  MessageCircle,
  Truck,
  MapPin,
} from 'lucide-react';
import OrderSearch from './OrderSearch';

// Order status badge - full status set
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    paid: 'bg-green-100 text-green-800 border-green-200',
    paid_pending_verification: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    awaiting_stock: 'bg-orange-100 text-orange-800 border-orange-200',
    ready_to_invoice: 'bg-blue-100 text-blue-800 border-blue-200',
    invoiced: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    processing: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    shipped: 'bg-purple-100 text-purple-800 border-purple-200',
    delivered: 'bg-slate-100 text-slate-800 border-slate-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
    refunded: 'bg-rose-100 text-rose-800 border-rose-200',
  };

  const labels: Record<string, string> = {
    pending: 'Pendiente',
    paid: 'Pagado',
    paid_pending_verification: 'Verificar',
    awaiting_stock: 'Sin Stock',
    ready_to_invoice: 'Por Facturar',
    invoiced: 'Facturado',
    processing: 'En Preparación',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
    refunded: 'Reembolsado',
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`}>
      {labels[status] || status}
    </span>
  );
}

// Payment method badge
function PaymentBadge({ method }: { method: string | null }) {
  if (!method) return null;

  const styles: Record<string, string> = {
    mercadopago: 'bg-blue-50 text-blue-700',
    transfer: 'bg-amber-50 text-amber-700',
    efectivo: 'bg-green-50 text-green-700',
    credito: 'bg-indigo-50 text-indigo-700',
    pos_debito: 'bg-purple-50 text-purple-700',
    pos_credito: 'bg-purple-50 text-purple-700',
  };

  const labels: Record<string, string> = {
    mercadopago: 'MercadoPago',
    transfer: 'Transferencia',
    efectivo: 'Efectivo',
    credito: 'Crédito',
    pos_debito: 'POS Débito',
    pos_credito: 'POS Crédito',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[method] || 'bg-slate-50 text-slate-700'}`}>
      {labels[method] || method}
    </span>
  );
}

// Shipping type badge
function ShippingBadge({ type }: { type: string | null }) {
  if (!type) return null;

  const config: Record<string, { label: string; classes: string; icon: 'truck' | 'store' }> = {
    pickup: { label: 'Retiro en local', classes: 'bg-emerald-50 text-emerald-700', icon: 'store' },
    dac: { label: 'Encomienda DAC', classes: 'bg-blue-50 text-blue-700', icon: 'truck' },
    freight: { label: 'Flete propio', classes: 'bg-orange-50 text-orange-700', icon: 'truck' },
  };

  const cfg = config[type];
  if (!cfg) return <span className="text-xs text-slate-400">{type}</span>;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${cfg.classes}`}>
      {cfg.icon === 'store' ? <MapPin className="h-3 w-3" /> : <Truck className="h-3 w-3" />}
      {cfg.label}
    </span>
  );
}

// Format phone for display (Uruguayan format)
function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('598') && digits.length >= 11) {
    const local = digits.slice(3);
    return `0${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5)}`;
  }
  if (digits.length === 9 && digits.startsWith('0')) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }
  return phone;
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const statusFilter = typeof params.status === 'string' ? params.status : undefined;
  const sourceFilter = 'online';
  const searchQuery = typeof params.q === 'string' ? params.q.trim() : '';
  const page = typeof params.page === 'string' ? parseInt(params.page) : 1;
  const perPage = 20;

  // Build query
  let query = supabaseAdmin
    .from('orders')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1) as any;

  if (statusFilter) {
    query = query.eq('status', statusFilter);
  }

  if (sourceFilter === 'online' || sourceFilter === 'mostrador') {
    query = query.eq('order_source', sourceFilter);
  }

  // Search by order number, customer name, or phone
  if (searchQuery) {
    query = query.or(
      `order_number.ilike.%${searchQuery}%,customer_name.ilike.%${searchQuery}%,customer_phone.ilike.%${searchQuery}%,customer_email.ilike.%${searchQuery}%`
    );
  }

  const { data: orders, count } = await query as { data: any[] | null; count: number | null };

  // Get status counts for the filter badges (single lightweight query)
  const { data: allOrders } = await supabaseAdmin
    .from('orders')
    .select('status');

  const statusCounts: Record<string, number> = {};
  (allOrders || []).forEach((o: { status: string }) => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  });

  const totalPages = Math.ceil((count || 0) / perPage);

  const formatCurrency = (value: number, currency?: string | null) => {
    if (currency === 'USD') {
      return `US$ ${value.toLocaleString('es-UY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$ ${value.toLocaleString('es-UY', { maximumFractionDigits: 0 })}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    // Show time-only for today's orders (compare in es-UY locale which handles UY timezone)
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
  };

  // Priority statuses first (need attention), then workflow, then terminal
  const statusOptions = [
    { value: '', label: 'Todos', count: allOrders?.length || 0 },
    { value: 'pending', label: 'Pendientes', count: statusCounts.pending || 0, priority: true },
    { value: 'paid_pending_verification', label: 'Por Verificar', count: statusCounts.paid_pending_verification || 0, priority: true },
    { value: 'awaiting_stock', label: 'Sin Stock', count: statusCounts.awaiting_stock || 0, priority: true },
    { value: 'ready_to_invoice', label: 'Por Facturar', count: statusCounts.ready_to_invoice || 0, priority: true },
    { value: 'paid', label: 'Pagados', count: statusCounts.paid || 0 },
    { value: 'invoiced', label: 'Facturados', count: statusCounts.invoiced || 0 },
    { value: 'processing', label: 'En Preparación', count: statusCounts.processing || 0 },
    { value: 'shipped', label: 'Enviados', count: statusCounts.shipped || 0 },
    { value: 'delivered', label: 'Entregados', count: statusCounts.delivered || 0 },
    { value: 'refunded', label: 'Reembolsados', count: statusCounts.refunded || 0 },
    { value: 'cancelled', label: 'Cancelados', count: statusCounts.cancelled || 0 },
  ];

  // Build pagination URL helper
  const buildUrl = (p: number) => {
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    if (sourceFilter) params.set('source', sourceFilter);
    if (searchQuery) params.set('q', searchQuery);
    if (p > 1) params.set('page', String(p));
    const qs = params.toString();
    return `/admin/orders${qs ? `?${qs}` : ''}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pedidos</h1>
          <p className="text-slate-500">{count || 0} pedidos{statusFilter ? ` con estado "${statusOptions.find(o => o.value === statusFilter)?.label}"` : searchQuery ? ` para "${searchQuery}"` : ' en total'}</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <OrderSearch initialQuery={searchQuery} statusFilter={statusFilter} />
      </div>


      {/* Status Filters with counts */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((option) => {
            const isActive = (statusFilter === option.value) || (!statusFilter && !option.value);
            const isPriority = 'priority' in option && option.priority && option.count > 0;

            return (
              <Link
                key={option.value}
                href={option.value ? `/admin/orders?status=${option.value}${sourceFilter ? `&source=${sourceFilter}` : ''}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ''}` : `/admin/orders${sourceFilter ? `?source=${sourceFilter}` : ''}${searchQuery ? `${sourceFilter ? '&' : '?'}q=${encodeURIComponent(searchQuery)}` : ''}`}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : isPriority
                      ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {option.label}
                {option.count > 0 && option.value && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-white/20'
                      : isPriority
                        ? 'bg-amber-200/60'
                        : 'bg-slate-200'
                  }`}>
                    {option.count}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Pedido</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Pago</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Envío</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Fecha</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {(orders || []).map((order: any) => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-mono text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        #{order.order_number}
                      </Link>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{order.customer_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {order.customer_phone && (
                          <a
                            href={`tel:${order.customer_phone}`}
                            className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1"
                          >
                            <Phone className="h-3 w-3" />
                            {formatPhone(order.customer_phone)}
                          </a>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <PaymentBadge method={order.payment_method} />
                  </td>
                  <td className="px-6 py-4">
                    <ShippingBadge type={order.shipping_type} />
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                    {formatCurrency(order.total, order.currency)}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {order.customer_phone && (
                        <a
                          href={`https://wa.me/${order.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${order.customer_name}, te contactamos por tu pedido #${order.order_number}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="WhatsApp"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </a>
                      )}
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        Ver
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}

              {(!orders || orders.length === 0) && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    {searchQuery
                      ? `No se encontraron pedidos para "${searchQuery}"`
                      : `No hay pedidos ${statusFilter ? 'con este estado' : ''}`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              {Math.min((page - 1) * perPage + 1, count || 0)}–{Math.min(page * perPage, count || 0)} de {count || 0} pedidos
            </p>
            <div className="flex gap-2">
              <Link
                href={buildUrl(page - 1)}
                className={`p-2 rounded-lg border ${
                  page <= 1
                    ? 'border-slate-200 text-slate-300 pointer-events-none'
                    : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ChevronLeft className="h-5 w-5" />
              </Link>
              <Link
                href={buildUrl(page + 1)}
                className={`p-2 rounded-lg border ${
                  page >= totalPages
                    ? 'border-slate-200 text-slate-300 pointer-events-none'
                    : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ChevronRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
