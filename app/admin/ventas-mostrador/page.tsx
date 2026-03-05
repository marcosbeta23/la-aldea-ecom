'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search, Store, DollarSign, ShoppingBag } from 'lucide-react';
import { PAYMENT_METHOD_LABELS } from '@/types/database';

interface CounterSaleOrder {
  id: string;
  order_number: string;
  customer_name: string;
  total: number;
  payment_method: string | null;
  notes: string | null;
  created_at: string;
  order_items: Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
  }>;
}

export default function VentasMostradorPage() {
  const [orders, setOrders] = useState<CounterSaleOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState('30d');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ todayTotal: 0, todayTotalUSD: 0, todayCount: 0 });

  const fetchSales = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        period,
        ...(search && { search }),
      });
      const res = await fetch(`/api/admin/ventas-mostrador?${params}`);
      const data = await res.json();
      setOrders(data.orders || []);
      setTotalPages(data.totalPages || 1);
      setStats(data.stats || { todayTotal: 0, todayTotalUSD: 0, todayCount: 0 });
    } catch {
      console.error('Error fetching counter sales');
    } finally {
      setLoading(false);
    }
  }, [page, period, search]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-UY', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('es-UY')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ventas Mostrador</h1>
          <p className="text-sm text-slate-500 mt-1">
            Registrar ventas en local — separadas de las ventas online
          </p>
        </div>
        <Link
          href="/admin/ventas-mostrador/nueva"
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
        >
          <Plus className="h-4 w-4" />
          Nueva Venta
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Ventas hoy</p>
              <p className="text-xl font-bold text-slate-900">
                {formatCurrency(stats.todayTotal)}
                {stats.todayTotalUSD > 0 && (
                  <span className="text-sm font-normal text-slate-500 ml-2">
                    + US$ {stats.todayTotalUSD.toLocaleString('es-UY', { minimumFractionDigits: 2 })}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 rounded-lg">
              <ShoppingBag className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Transacciones hoy</p>
              <p className="text-xl font-bold text-slate-900">{stats.todayCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar por N° o nombre..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <select
          value={period}
          onChange={(e) => {
            setPeriod(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="7d">Últimos 7 días</option>
          <option value="30d">Últimos 30 días</option>
          <option value="90d">Últimos 90 días</option>
          <option value="all">Todo</option>
        </select>
      </div>

      {/* Sales List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Cargando...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <Store className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No hay ventas mostrador registradas</p>
            <Link
              href="/admin/ventas-mostrador/nueva"
              className="inline-flex items-center gap-1.5 mt-3 text-emerald-600 hover:text-emerald-700 font-medium text-sm"
            >
              <Plus className="h-4 w-4" />
              Registrar primera venta
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">N° Venta</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Fecha</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Cliente</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Productos</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Pago</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-sm font-mono text-emerald-600 hover:text-emerald-800"
                        >
                          {order.order_number}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {order.customer_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {order.order_items?.length || 0} producto(s)
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                          {(PAYMENT_METHOD_LABELS as Record<string, string>)[order.payment_method || ''] || order.payment_method}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-900 text-right">
                        {formatCurrency(order.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="block p-4 hover:bg-slate-50"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-mono text-emerald-600">{order.order_number}</span>
                    <span className="text-sm font-semibold text-slate-900">{formatCurrency(order.total)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{order.customer_name} · {(PAYMENT_METHOD_LABELS as Record<string, string>)[order.payment_method || ''] || order.payment_method}</span>
                    <span>{formatDate(order.created_at)}</span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="text-sm text-slate-600 hover:text-slate-900 disabled:opacity-40"
                >
                  Anterior
                </button>
                <span className="text-sm text-slate-500">
                  Página {page} de {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="text-sm text-slate-600 hover:text-slate-900 disabled:opacity-40"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
