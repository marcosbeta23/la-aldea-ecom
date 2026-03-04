'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Calendar,
  CreditCard,
  Package,
  RefreshCw,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';

interface OrderItem {
  product_name: string;
  quantity: number;
  subtotal: number;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total: number;
  currency: string;
  payment_method: string;
  created_at: string;
  items: OrderItem[];
}

interface TopProduct {
  id: string;
  name: string;
  quantity: number;
  revenue: number;
}

interface CustomerDetail {
  name: string;
  email: string | null;
  phone: string | null;
  identifier: string;
  totalOrders: number;
  paidOrders: number;
  totalSpentUYU: number;
  totalSpentUSD: number;
  avgOrderValueUYU: number;
  firstOrder: string | null;
  lastOrder: string;
  preferredPayment: string;
  orders: Order[];
  topProducts: TopProduct[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendiente', color: 'bg-amber-100 text-amber-800' },
  paid: { label: 'Pagado', color: 'bg-green-100 text-green-800' },
  processing: { label: 'Procesando', color: 'bg-blue-100 text-blue-800' },
  shipped: { label: 'Enviado', color: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Entregado', color: 'bg-slate-100 text-slate-800' },
  invoiced: { label: 'Facturado', color: 'bg-teal-100 text-teal-800' },
  ready_to_invoice: { label: 'Por facturar', color: 'bg-teal-50 text-teal-700' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
  refunded: { label: 'Reembolsado', color: 'bg-red-50 text-red-700' },
};

const PAYMENT_LABELS: Record<string, string> = {
  mercadopago: 'MercadoPago',
  transfer: 'Transferencia',
  efectivo: 'Efectivo',
  credito: 'Crédito',
  pos_debito: 'POS Débito',
  pos_credito: 'POS Crédito',
  unknown: 'Sin datos',
};

export default function CustomerDetailPage() {
  const params = useParams();
  const identifier = decodeURIComponent(params.identifier as string);
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchCustomer() {
      setIsLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/admin/customers/${encodeURIComponent(identifier)}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Error fetching customer');
        }
        const data = await res.json();
        setCustomer(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCustomer();
  }, [identifier]);

  const formatCurrency = (value: number, currency: string = 'UYU') =>
    currency === 'USD'
      ? `US$ ${value.toLocaleString('es-UY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : `$ ${value.toLocaleString('es-UY', { maximumFractionDigits: 0 })}`;

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('es-UY', { day: '2-digit', month: '2-digit', year: 'numeric' });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="space-y-4">
        <Link href="/admin/customers" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft className="h-4 w-4" /> Volver a clientes
        </Link>
        <div className="bg-red-50 text-red-600 p-6 rounded-xl text-center">
          {error || 'Cliente no encontrado'}
        </div>
      </div>
    );
  }

  const whatsappNumber = customer.phone?.replace(/\D/g, '') || '';

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link href="/admin/customers" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" /> Volver a clientes
      </Link>

      {/* Customer header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="h-7 w-7 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{customer.name || 'Sin nombre'}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-1">
                {customer.email && (
                  <span className="text-sm text-slate-500 flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" /> {customer.email}
                  </span>
                )}
                {customer.phone && (
                  <span className="text-sm text-slate-500 flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" /> {customer.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex items-center gap-2">
            {whatsappNumber && (
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            )}
            {customer.email && (
              <a
                href={`mailto:${customer.email}`}
                className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Mail className="h-4 w-4" />
                Email
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-green-50 border border-green-100">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Gastado UYU</p>
              <p className="text-xl font-bold text-slate-900">{formatCurrency(customer.totalSpentUYU)}</p>
              {customer.totalSpentUSD > 0 && (
                <p className="text-xs text-slate-400">{formatCurrency(customer.totalSpentUSD, 'USD')}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Pedidos</p>
              <p className="text-xl font-bold text-slate-900">{customer.paidOrders}</p>
              {customer.totalOrders > customer.paidOrders && (
                <p className="text-xs text-slate-400">{customer.totalOrders} totales</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-100">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Ticket Promedio</p>
              <p className="text-xl font-bold text-slate-900">{formatCurrency(customer.avgOrderValueUYU)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100">
              <Calendar className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Cliente Desde</p>
              <p className="text-xl font-bold text-slate-900">
                {customer.firstOrder ? formatDate(customer.firstOrder) : '-'}
              </p>
              <p className="text-xs text-slate-400">Último: {formatDate(customer.lastOrder)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Order History */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Historial de Pedidos</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-2.5 font-semibold text-slate-600">Pedido</th>
                  <th className="text-center px-4 py-2.5 font-semibold text-slate-600">Estado</th>
                  <th className="text-right px-4 py-2.5 font-semibold text-slate-600">Total</th>
                  <th className="text-center px-4 py-2.5 font-semibold text-slate-600 hidden sm:table-cell">Pago</th>
                  <th className="text-right px-4 py-2.5 font-semibold text-slate-600">Fecha</th>
                  <th className="px-4 py-2.5 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customer.orders.map((order) => {
                  const statusConfig = STATUS_CONFIG[order.status] || { label: order.status, color: 'bg-slate-100 text-slate-700' };
                  return (
                    <tr key={order.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <p className="font-mono text-xs font-medium text-slate-900">{order.order_number}</p>
                        <p className="text-xs text-slate-400">{order.items.length} producto{order.items.length !== 1 ? 's' : ''}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900">
                        {formatCurrency(Number(order.total), order.currency)}
                      </td>
                      <td className="px-4 py-3 text-center hidden sm:table-cell">
                        <span className="text-xs text-slate-500">
                          {PAYMENT_LABELS[order.payment_method] || order.payment_method}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-slate-500">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/orders/${order.id}`} className="p-1 hover:bg-slate-100 rounded inline-flex">
                          <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-6">
          {/* Preferred Payment */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="h-5 w-5 text-slate-400" />
              <h3 className="font-semibold text-slate-900">Método Preferido</h3>
            </div>
            <p className="text-lg font-bold text-slate-900">
              {PAYMENT_LABELS[customer.preferredPayment] || customer.preferredPayment}
            </p>
          </div>

          {/* Top Products */}
          {customer.topProducts.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Package className="h-5 w-5 text-slate-400" />
                <h3 className="font-semibold text-slate-900">Productos Favoritos</h3>
              </div>
              <div className="space-y-3">
                {customer.topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-300 w-4">{index + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{product.name}</p>
                      <p className="text-xs text-slate-500">
                        {product.quantity} unidades · {formatCurrency(product.revenue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
