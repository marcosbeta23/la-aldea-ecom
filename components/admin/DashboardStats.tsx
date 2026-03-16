import Link from 'next/link';
import { 
  Package, ShoppingCart, DollarSign, TrendingUp, Clock, 
  CheckCircle2, Zap, ArrowRight, Globe 
} from 'lucide-react';
import { getDashboardData } from '@/lib/admin-data';
import { formatUYU, formatUSD } from '@/lib/admin-utils';
import CombinedRevenueCard from '@/components/admin/CombinedRevenueCard';

export default async function DashboardStats() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      {/* Today banner */}
      {(data.today.orders > 0 || data.today.revenueUYU > 0 || data.today.revenueUSD > 0) && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-4 w-4 text-yellow-400" />
            <span className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Hoy</span>
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
              className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-all group"
            >
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="font-semibold text-amber-900 text-sm">Pendientes</p>
                  <p className="text-xs text-amber-700">{data.period30d.pendingOrders} pedido{data.period30d.pendingOrders !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-amber-600 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
          {data.period30d.toVerify > 0 && (
            <Link
              href="/admin/orders?status=paid_pending_verification"
              className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-all group"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-semibold text-blue-900 text-sm">Por verificar</p>
                  <p className="text-xs text-blue-700">{data.period30d.toVerify} pedido{data.period30d.toVerify !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
          {data.period30d.toInvoice > 0 && (
            <Link
              href="/admin/orders?status=ready_to_invoice"
              className="flex items-center justify-between p-4 bg-teal-50 border border-teal-200 rounded-xl hover:bg-teal-100 transition-all group"
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-teal-600" />
                <div>
                  <p className="font-semibold text-teal-900 text-sm">Por facturar</p>
                  <p className="text-xs text-teal-700">{data.period30d.toInvoice} pedido{data.period30d.toInvoice !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-teal-600 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Pedidos (30d)</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{data.period30d.totalOrders}</p>
              <p className="mt-1 text-xs text-slate-400">{data.period30d.paidOrders} confirmados</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <ShoppingCart className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Ingresos UYU (30d)</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{formatUYU(data.period30d.revenueUYU)}</p>
              <p className="mt-1 text-xs text-slate-400">Ticket prom: {formatUYU(data.period30d.avgTicketUYU)}</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Ingresos USD (30d)</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{formatUSD(data.period30d.revenueUSD)}</p>
              <p className="mt-1 text-xs text-slate-400">Ticket prom: {formatUSD(data.period30d.avgTicketUSD)}</p>
            </div>
            <div className="p-3 rounded-xl bg-violet-50 text-violet-600 border border-violet-100">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Productos activos</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{data.productsCount}</p>
              {data.lowStock.length > 0 && (
                <p className="mt-1 text-xs text-amber-600">{data.lowStock.length} con stock bajo</p>
              )}
            </div>
            <div className="p-3 rounded-xl bg-slate-50 text-slate-600 border border-slate-200">
              <Package className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Combined Revenue Card */}
      <CombinedRevenueCard 
        combinedRevenueUYU={data.period30d.combinedRevenueUYU}
        revenueUYU={data.period30d.revenueUYU}
        revenueUSD={data.period30d.revenueUSD}
        exchangeRate={data.exchangeRate}
      />
    </div>
  );
}
