import { supabaseAdmin } from '@/lib/supabase';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  Phone,
  Mail
} from 'lucide-react';

// Order status badge
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    paid: 'bg-green-100 text-green-800 border-green-200',
    processing: 'bg-blue-100 text-blue-800 border-blue-200',
    shipped: 'bg-purple-100 text-purple-800 border-purple-200',
    delivered: 'bg-slate-100 text-slate-800 border-slate-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
  };
  
  const labels: Record<string, string> = {
    pending: 'Pendiente',
    paid: 'Pagado',
    processing: 'En proceso',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
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
  };
  
  const labels: Record<string, string> = {
    mercadopago: 'MercadoPago',
    transfer: 'Transferencia',
  };
  
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[method] || 'bg-slate-50 text-slate-700'}`}>
      {labels[method] || method}
    </span>
  );
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const statusFilter = typeof params.status === 'string' ? params.status : undefined;
  const page = typeof params.page === 'string' ? parseInt(params.page) : 1;
  const perPage = 20;
  
  // Build query
  let query = supabaseAdmin
    .from('orders')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);
  
  if (statusFilter) {
    query = query.eq('status', statusFilter);
  }
  
  const { data: orders, count } = await query;
  
  const totalPages = Math.ceil((count || 0) / perPage);
  
  const formatCurrency = (value: number) => 
    `UYU ${value.toLocaleString('es-UY', { maximumFractionDigits: 0 })}`;
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-UY', { 
      day: '2-digit', 
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const statusOptions = [
    { value: '', label: 'Todos' },
    { value: 'pending', label: 'Pendientes' },
    { value: 'paid', label: 'Pagados' },
    { value: 'processing', label: 'En proceso' },
    { value: 'shipped', label: 'Enviados' },
    { value: 'delivered', label: 'Entregados' },
    { value: 'cancelled', label: 'Cancelados' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pedidos</h1>
          <p className="text-slate-500">{count || 0} pedidos en total</p>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((option) => (
            <Link
              key={option.value}
              href={option.value ? `/admin/orders?status=${option.value}` : '/admin/orders'}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                (statusFilter === option.value) || (!statusFilter && !option.value)
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {option.label}
            </Link>
          ))}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Fecha</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {(orders || []).map((order: any) => (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <Link 
                      href={`/admin/orders/${order.id}`}
                      className="font-mono text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      #{order.order_number}
                    </Link>
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
                            {order.customer_phone}
                          </a>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <PaymentBadge method={order.payment_method} />
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
              
              {(!orders || orders.length === 0) && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No hay pedidos {statusFilter ? 'con este estado' : ''}
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
              Página {page} de {totalPages}
            </p>
            <div className="flex gap-2">
              <Link
                href={`/admin/orders?page=${page - 1}${statusFilter ? `&status=${statusFilter}` : ''}`}
                className={`p-2 rounded-lg border ${
                  page <= 1 
                    ? 'border-slate-200 text-slate-300 pointer-events-none' 
                    : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ChevronLeft className="h-5 w-5" />
              </Link>
              <Link
                href={`/admin/orders?page=${page + 1}${statusFilter ? `&status=${statusFilter}` : ''}`}
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
