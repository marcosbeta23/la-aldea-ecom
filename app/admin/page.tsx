'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  Truck,
  Store,
  Globe,
  AlertTriangle,
  Zap,
  BarChart3,
  ArrowRight,
  Plus,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

// ── Types ────────────────────────────────────────────────────────────────────

interface DashboardData {
  today: {
    orders: number;
    paidOrders: number;
    revenueUYU: number;
    revenueUSD: number;
    combinedRevenueUYU: number;
    pending: number;
  };
  period30d: {
    totalOrders: number;
    paidOrders: number;
    revenueUYU: number;
    revenueUSD: number;
    combinedRevenueUYU: number;
    paidOrdersUYU: number;
    paidOrdersUSD: number;
    avgTicketUYU: number;
    avgTicketUSD: number;
    pendingOrders: number;
    toVerify: number;
    toInvoice: number;
  };
  channels: {
    onlineRevenueUYU: number;
    onlineRevenueUSD: number;
    onlineOrders: number;
    mostradorRevenueUYU: number;
    mostradorRevenueUSD: number;
    mostradorOrders: number;
  };
  exchangeRate: number;
  productsCount: number;
  lowStock: Array<{ id: string; name: string; sku: string; stock: number }>;
  recentOrders: Array<{
    id: string;
    order_number: string;
    status: string;
    total: number;
    currency: string | null;
    created_at: string;
    customer_name: string;
    customer_phone: string | null;
    order_source: string | null;
    payment_method: string | null;
    shipping_department: string | null;
  }>;
  attention: {
    pending: Array<{ id: string; order_number: string }>;
    toVerify: Array<{ id: string; order_number: string }>;
    toInvoice: Array<{ id: string; order_number: string }>;
  };
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
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

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || { label: status, classes: 'bg-slate-100 text-slate-700' };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.classes}`}>
      {cfg.label}
    </span>
  );
}

function formatUYU(v: number) {
  return `$ ${v.toLocaleString('es-UY', { maximumFractionDigits: 0 })}`;
}
function formatUSD(v: number) {
  return `US$ ${v.toLocaleString('es-UY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-UY', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getCurrency(o: { currency: string | null }) {
  return o.currency || 'UYU';
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [onlineCurrency, setOnlineCurrency] = useState<'UYU' | 'USD'>('UYU');

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/dashboard');
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Auto-refresh every 30 seconds for real-time data
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Error al cargar el dashboard</p>
        <button onClick={fetchData} className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium">
          Reintentar
        </button>
      </div>
    );
  }

  const now = new Date();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm">
            Ultimos 30 dias
            {lastUpdated && (
              <span className="ml-2 text-xs text-slate-400">
                · {lastUpdated.toLocaleTimeString('es-UY')}
              </span>
            )}
            {' · '}
            <span className="text-slate-400">
              {now.toLocaleDateString('es-UY', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
            title="Actualizar datos"
          >
            <RefreshCw className={`h-4 w-4 text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            href="/admin/analytics"
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors"
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </Link>
        </div>
      </div>

      {/* Today banner — only if there's activity */}
      {(data.today.orders > 0 || data.today.revenueUYU > 0 || data.today.revenueUSD > 0) && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-5 text-white">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-4 w-4 text-yellow-400" />
            <span className="text-sm font-semibold text-slate-300">Hoy</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div>
              <p className="text-slate-400 text-xs">Pedidos</p>
              <p className="text-2xl font-bold">{data.today.orders}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Ingresos UYU</p>
              <p className="text-2xl font-bold">{formatUYU(data.today.revenueUYU)}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Ingresos USD</p>
              <p className="text-2xl font-bold">{formatUSD(data.today.revenueUSD)}</p>
            </div>
            {data.today.paidOrders > 0 && (
              <div>
                <p className="text-slate-400 text-xs">Confirmados</p>
                <p className="text-2xl font-bold text-green-400">{data.today.paidOrders}</p>
              </div>
            )}
            {data.today.pending > 0 && (
              <div>
                <p className="text-slate-400 text-xs">Pendientes</p>
                <p className="text-2xl font-bold text-amber-400">{data.today.pending}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Attention required */}
      {(data.period30d.pendingOrders > 0 || data.period30d.toVerify > 0 || data.period30d.toInvoice > 0) && (
        <div className="grid sm:grid-cols-3 gap-3">
          {data.period30d.pendingOrders > 0 && (
            <Link
              href="/admin/orders?status=pending"
              className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="font-semibold text-amber-900 text-sm">Pendientes</p>
                  <p className="text-xs text-amber-700">{data.period30d.pendingOrders} pedido{data.period30d.pendingOrders !== 1 ? 's' : ''} sin confirmar</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-amber-500 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          )}
          {data.period30d.toVerify > 0 && (
            <Link
              href="/admin/orders?status=paid_pending_verification"
              className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-semibold text-blue-900 text-sm">Por verificar</p>
                  <p className="text-xs text-blue-700">{data.period30d.toVerify} transferencia{data.period30d.toVerify !== 1 ? 's' : ''} pendiente{data.period30d.toVerify !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-blue-500 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          )}
          {data.period30d.toInvoice > 0 && (
            <Link
              href="/admin/orders?status=ready_to_invoice"
              className="flex items-center justify-between p-4 bg-teal-50 border border-teal-200 rounded-xl hover:bg-teal-100 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-teal-600" />
                <div>
                  <p className="font-semibold text-teal-900 text-sm">Por facturar</p>
                  <p className="text-xs text-teal-700">{data.period30d.toInvoice} pedido{data.period30d.toInvoice !== 1 ? 's' : ''} listos</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-teal-500 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          )}
        </div>
      )}

      {/* KPI row — 4 cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Ingresos UYU (30d)</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{formatUYU(data.period30d.revenueUYU)}</p>
              <p className="mt-1 text-xs text-slate-400">{data.period30d.paidOrdersUYU} pedidos pagados</p>
            </div>
            <div className="p-3 rounded-xl bg-green-50 text-green-600 border border-green-100">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Ingresos USD (30d)</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{formatUSD(data.period30d.revenueUSD)}</p>
              <p className="mt-1 text-xs text-slate-400">{data.period30d.paidOrdersUSD} pedidos USD</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Globe className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Pedidos (30d)</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{data.period30d.totalOrders}</p>
              <p className="mt-1 text-xs text-slate-400">{data.period30d.paidOrders} confirmados · {data.period30d.pendingOrders} pendientes</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <ShoppingCart className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Ticket Prom. UYU</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{formatUYU(data.period30d.avgTicketUYU)}</p>
              <p className="mt-1 text-xs text-slate-400">{data.productsCount} productos activos</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Revenue by channel — currency-aware */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-slate-500">Online (30d)</p>
                <button
                  onClick={() => setOnlineCurrency(onlineCurrency === 'UYU' ? 'USD' : 'UYU')}
                  className="relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none"
                  style={{ backgroundColor: onlineCurrency === 'USD' ? '#3b82f6' : '#94a3b8' }}
                  title={`Mostrar en ${onlineCurrency === 'UYU' ? 'USD' : 'UYU'}`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      onlineCurrency === 'USD' ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="text-xs font-medium text-slate-400">{onlineCurrency}</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {onlineCurrency === 'UYU'
                  ? formatUYU(data.channels.onlineRevenueUYU)
                  : formatUSD(data.channels.onlineRevenueUSD)}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {data.channels.onlineOrders} pedidos online
              </p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Globe className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Mostrador (30d)</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{formatUYU(data.channels.mostradorRevenueUYU)}</p>
              {data.channels.mostradorRevenueUSD > 0 && (
                <p className="mt-0.5 text-sm font-semibold text-blue-600">{formatUSD(data.channels.mostradorRevenueUSD)}</p>
              )}
              <p className="mt-1 text-xs text-slate-400">
                {data.channels.mostradorOrders} ventas en local
              </p>
            </div>
            <div className="p-3 rounded-xl bg-green-50 text-green-600 border border-green-100">
              <Store className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Main content: recent orders + sidebar */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Pedidos Recientes</h2>
            <Link
              href="/admin/orders"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              Ver todos <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {data.recentOrders.length === 0 ? (
              <p className="px-5 py-10 text-center text-slate-400 text-sm">Sin pedidos en los ultimos 30 dias</p>
            ) : (
              data.recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono text-sm font-medium text-blue-600">#{order.order_number}</span>
                      <StatusBadge status={order.status} />
                      {order.order_source === 'mostrador' && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">mostrador</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-700 truncate">{order.customer_name}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-slate-900">
                      {getCurrency(order) === 'USD' ? formatUSD(order.total) : formatUYU(order.total)}
                    </p>
                    <p className="text-xs text-slate-400">{formatDate(order.created_at)}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick actions */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Acciones Rapidas</h3>
            <div className="space-y-2">
              <Link
                href="/admin/ventas-mostrador/nueva"
                className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
              >
                <Plus className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-800">Nueva Venta Mostrador</span>
              </Link>
              <Link
                href="/admin/products/new"
                className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Package className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Agregar Producto</span>
              </Link>
              <Link
                href="/admin/orders"
                className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <Truck className="h-4 w-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Gestionar Pedidos</span>
              </Link>
            </div>
          </div>

          {/* Low stock alert */}
          {data.lowStock.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-slate-700">Stock Bajo</h3>
                <span className="ml-auto text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                  {data.lowStock.length}
                </span>
              </div>
              <div className="space-y-2">
                {data.lowStock.map((p) => (
                  <Link
                    key={p.id}
                    href={`/admin/products/${p.id}`}
                    className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0 hover:bg-slate-50 -mx-1 px-1 rounded transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-slate-800 truncate">{p.name}</p>
                      <p className="text-xs text-slate-400">{p.sku}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ml-2 shrink-0 ${
                      p.stock <= 2 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {p.stock} ud.
                    </span>
                  </Link>
                ))}
              </div>
              <Link
                href="/admin/products"
                className="block mt-3 text-xs text-blue-600 hover:text-blue-700 text-center font-medium"
              >
                Ver todos los productos
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
