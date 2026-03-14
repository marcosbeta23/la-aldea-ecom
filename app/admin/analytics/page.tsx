'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  TrendingDown,
  Package,
  RefreshCw,
  BarChart3,
  Store,
  Globe,
  CreditCard,
  MapPin,
  AlertTriangle,
  Eye,
  ExternalLink,
  LucideIcon,
  Zap,
  Truck,
} from 'lucide-react';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const RevenueChart = dynamic(() => import('@/components/admin/AnalyticsCharts').then(mod => ({ default: mod.RevenueChart })), { ssr: false });
const DepartmentDonutChart = dynamic(() => import('@/components/admin/AnalyticsCharts').then(mod => ({ default: mod.DepartmentDonutChart })), { ssr: false });
const PaymentMethodChart = dynamic(() => import('@/components/admin/AnalyticsCharts').then(mod => ({ default: mod.PaymentMethodChart })), { ssr: false });
const ShippingTypeChart = dynamic(() => import('@/components/admin/AnalyticsCharts').then(mod => ({ default: mod.ShippingTypeChart })), { ssr: false });

interface AnalyticsData {
  summary: {
    totalOrders: number;
    paidOrders: number;
    paidOrdersUYU: number;
    paidOrdersUSD: number;
    pendingOrders: number;
    totalRevenue: number;
    totalRevenueUYU: number;
    totalRevenueUSD: number;
    combinedRevenueUYU: number;
    todayRevenue: number;
    todayRevenueUYU: number;
    todayRevenueUSD: number;
    todayCombinedRevenueUYU: number;
    todayOrders: number;
    avgOrderValue: number;
    avgOrderValueUYU: number;
    avgOrderValueUSD: number;
    uniqueCustomers: number;
    conversionRate: number;
    onlineRevenue: number;
    onlineRevenueUYU: number;
    onlineRevenueUSD: number;
    mostradorRevenue: number;
    mostradorRevenueUYU: number;
    mostradorRevenueUSD: number;
    onlineOrders: number;
    mostradorOrders: number;
  };
  previousPeriod: {
    totalRevenue: number;
    totalRevenueUYU: number;
    totalRevenueUSD: number;
    paidOrders: number;
    avgOrderValue: number;
    revenueChange: number;
    revenueChangeUYU: number;
    revenueChangeUSD: number;
    ordersChange: number;
    aovChange: number;
  };
  paymentMethodDistribution: Record<string, { count: number; revenue: number }>;
  exchangeRate: number;
  departmentDistribution: Record<string, { orders: number; revenue: number }>;
  shippingTypeDistribution: Record<string, { orders: number; revenue: number }>;
  inventoryHealth: Array<{
    id: string;
    name: string;
    sku: string;
    stock: number;
    avgDailySales: number;
    daysRemaining: number;
    image: string | null;
  }>;
  dailySales: Array<{ date: string; orders: number; revenueUYU: number; revenueUSD: number; onlineRevenue: number; mostradorRevenue: number }>;
  hourlyStats: Array<{ hour: number; orders: number }>;
  topProducts: Array<{
    id: string;
    name: string;
    sku: string;
    sold: number;
    revenue: number;
    image: string | null;
  }>;
  statusDistribution: Record<string, number>;
  period: string;
}

interface PostHogData {
  configured: boolean;
  error?: string;
  visitors?: {
    total: number;
    today: number;
    pageviews: number;
    todayPageviews: number;
  };
  topPages?: Array<{ page: string; views: number }>;
  topReferrers?: Array<{ referrer: string; visits: number }>;
  funnel?: Array<{ step: string; label: string; visitors: number; rate: number }>;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const PAYMENT_LABELS: Record<string, string> = {
  mercadopago: 'MercadoPago',
  transfer: 'Transferencia',
  efectivo: 'Efectivo',
  credito: 'Crédito',
  pos_debito: 'POS Débito',
  pos_credito: 'POS Crédito',
  unknown: 'Sin especificar',
};

const PAYMENT_COLORS: Record<string, string> = {
  mercadopago: 'bg-blue-500',
  transfer: 'bg-amber-500',
  efectivo: 'bg-green-500',
  credito: 'bg-indigo-500',
  pos_debito: 'bg-purple-500',
  pos_credito: 'bg-violet-500',
  unknown: 'bg-slate-400',
};

const PAYMENT_HEX_COLORS: Record<string, string> = {
  mercadopago: '#3b82f6',
  transfer: '#f59e0b',
  efectivo: '#22c55e',
  credito: '#6366f1',
  pos_debito: '#a855f7',
  pos_credito: '#8b5cf6',
  unknown: '#94a3b8',
};

const SHIPPING_LABELS: Record<string, string> = {
  pickup: 'Retiro en local',
  dac: 'Encomienda DAC',
  freight: 'Flete propio',
  'Sin especificar': 'Sin especificar',
};

const SHIPPING_HEX_COLORS: Record<string, string> = {
  pickup: '#22c55e',
  dac: '#3b82f6',
  freight: '#f97316',
  'Sin especificar': '#94a3b8',
};

const DEPT_COLORS = [
  '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#6366f1',
  '#84cc16', '#64748b',
];

// ── Components ────────────────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  subValue,
  icon: Icon,
  trend,
  color = 'blue',
}: {
  title: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'blue' | 'green' | 'amber' | 'purple' | 'red';
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    red: 'bg-red-50 text-red-600 border-red-100',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
          {subValue && (
            <div className="mt-1 flex items-center gap-1">
              {trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
              {trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
              <span className={`text-xs ${
                trend === 'up' ? 'text-green-600' :
                trend === 'down' ? 'text-red-600' :
                'text-slate-500'
              }`}>
                {subValue}
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl border ${colors[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

// Extracted to AnalyticsCharts.tsx

function HourlyChart({ data }: { data: Array<{ hour: number; orders: number }> }) {
  const maxOrders = Math.max(...data.map(d => d.orders), 1);
  const totalToday = data.reduce((sum, d) => sum + d.orders, 0);
  const peakHour = data.reduce((max, d) => d.orders > max.orders ? d : max, data[0]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-lg font-semibold text-slate-900">Actividad Hoy</h3>
        {totalToday > 0 && (
          <span className="text-xs text-slate-500">
            Pico: {peakHour.hour}:00 ({peakHour.orders} ped.)
          </span>
        )}
      </div>
      <p className="text-sm text-slate-500 mb-4">{totalToday} pedidos registrados hoy</p>

      <div className="h-32 flex items-end gap-0.5">
        {data.map((hour) => {
          const height = (hour.orders / maxOrders) * 100;
          return (
            <div key={hour.hour} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-blue-500 rounded-t-sm transition-all hover:bg-blue-600 cursor-pointer min-h-0.5"
                style={{ height: `${Math.max(2, height)}%` }}
                title={`${hour.hour}:00 — ${hour.orders} pedidos`}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
        <span>00:00</span>
        <span>12:00</span>
        <span>23:00</span>
      </div>
    </div>
  );
}

function TopProductsList({ products, formatCurrency }: { products: AnalyticsData['topProducts']; formatCurrency: (v: number) => string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Productos Más Vendidos</h3>

      {products.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-8">Sin ventas en el período</p>
      ) : (
        <div className="space-y-3">
          {products.map((product, index) => (
            <div key={product.id} className="flex items-center gap-3">
              <span className="text-sm font-bold text-slate-300 w-5">{index + 1}</span>

              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-lg object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <Package className="h-5 w-5 text-slate-400" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{product.name}</p>
                <p className="text-xs text-slate-500">{product.sold} vendidos · {product.sku}</p>
              </div>

              <p className="text-sm font-semibold text-green-600 shrink-0">{formatCurrency(product.revenue)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusDistribution({ data }: { data: Record<string, number> }) {
  const statusLabels: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pendiente', color: 'bg-amber-400' },
    paid: { label: 'Pagado', color: 'bg-green-500' },
    paid_pending_verification: { label: 'Por verificar', color: 'bg-blue-500' },
    processing: { label: 'Procesando', color: 'bg-indigo-500' },
    shipped: { label: 'Enviado', color: 'bg-purple-500' },
    delivered: { label: 'Entregado', color: 'bg-slate-400' },
    cancelled: { label: 'Cancelado', color: 'bg-red-500' },
    refunded: { label: 'Reembolsado', color: 'bg-red-400' },
    ready_to_invoice: { label: 'Por facturar', color: 'bg-teal-500' },
    invoiced: { label: 'Facturado', color: 'bg-teal-600' },
  };

  const total = Object.values(data).reduce((sum, v) => sum + v, 0);
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Estado de Pedidos</h3>

      {entries.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-8">Sin pedidos</p>
      ) : (
        <div className="space-y-3">
          {entries.map(([status, count]) => {
            const config = statusLabels[status] || { label: status, color: 'bg-slate-400' };
            const percentage = total > 0 ? (count / total) * 100 : 0;

            return (
              <div key={status}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-600">{config.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{percentage.toFixed(0)}%</span>
                    <span className="text-slate-900 font-medium w-6 text-right">{count}</span>
                  </div>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${config.color} rounded-full transition-all`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Extracted to AnalyticsCharts.tsx

// ── Conversion Funnel ───────────────────────────────────────────────────────

const FUNNEL_COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#22c55e'];

function ConversionFunnel({ funnel }: { funnel: PostHogData['funnel'] }) {
  if (!funnel || funnel.length === 0) return null;

  const maxVisitors = funnel[0]?.visitors || 1;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-5">
        <Zap className="h-5 w-5 text-purple-500" />
        <h3 className="text-lg font-semibold text-slate-900">Embudo de Conversión</h3>
      </div>

      <div className="space-y-3">
        {funnel.map((step, i) => {
          const widthPct = maxVisitors > 0 ? Math.max((step.visitors / maxVisitors) * 100, 4) : 4;
          const prevVisitors = i > 0 ? funnel[i - 1].visitors : step.visitors;
          const dropOff = prevVisitors > 0 ? Math.round(((prevVisitors - step.visitors) / prevVisitors) * 100) : 0;

          return (
            <div key={step.step}>
              {i > 0 && dropOff > 0 && (
                <div className="flex items-center gap-2 py-1 pl-3">
                  <TrendingDown className="h-3 w-3 text-red-400" />
                  <span className="text-xs text-red-500">-{dropOff}% abandono</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-600 w-20 shrink-0">{step.label}</span>
                <div className="flex-1 relative">
                  <div
                    className="h-9 rounded-lg flex items-center px-3 transition-all"
                    style={{
                      width: `${widthPct}%`,
                      backgroundColor: FUNNEL_COLORS[i] || FUNNEL_COLORS[0],
                      minWidth: '60px',
                    }}
                  >
                    <span className="text-white text-sm font-bold whitespace-nowrap">
                      {step.visitors}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-slate-400 w-14 text-right shrink-0">{step.rate}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {funnel.length >= 2 && (
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400">Conversión total</span>
          <span className="text-sm font-bold text-green-600">
            {funnel[0].visitors > 0
              ? `${((funnel[funnel.length - 1].visitors / funnel[0].visitors) * 100).toFixed(1)}%`
              : '0%'}
          </span>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [posthogData, setPosthogData] = useState<PostHogData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState('7d');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [revenueType, setRevenueType] = useState<'uyu' | 'usd' | 'canal'>('uyu');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [analyticsRes, posthogRes] = await Promise.all([
        fetch(`/api/admin/analytics?period=${period}`),
        fetch(`/api/admin/posthog-insights?period=${period}`),
      ]);
      if (analyticsRes.ok) {
        const json = await analyticsRes.json();
        setData(json);
        setLastUpdated(new Date());
      }
      if (posthogRes.ok) {
        const json = await posthogRes.json();
        setPosthogData(json);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const formatCurrency = (value: number) =>
    `$ ${value.toLocaleString('es-UY', { maximumFractionDigits: 0 })}`;
  const formatUSD = (value: number) =>
    `US$ ${value.toLocaleString('es-UY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
          <p className="text-slate-500 text-sm">
            Datos en tiempo real
            {lastUpdated && (
              <span className="ml-2 text-xs text-slate-400">
                • {lastUpdated.toLocaleTimeString('es-UY')}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="90d">Últimos 90 días</option>
          </select>

          <button
            onClick={fetchData}
            disabled={isLoading}
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {data && (
        <>
          {/* Today banner — show only if there's activity today */}
          {(data.summary.todayOrders > 0 || data.summary.todayRevenueUYU > 0 || data.summary.todayRevenueUSD > 0) && (
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-5 text-white">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-semibold text-slate-300">Hoy</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <div>
                  <p className="text-slate-400 text-xs">Pedidos</p>
                  <p className="text-2xl font-bold">{data.summary.todayOrders}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Ingresos UYU</p>
                  <p className="text-2xl font-bold">{formatCurrency(data.summary.todayRevenueUYU)}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Ingresos USD</p>
                  <p className="text-2xl font-bold">{formatUSD(data.summary.todayRevenueUSD)}</p>
                </div>
                {data.summary.pendingOrders > 0 && (
                  <div>
                    <p className="text-slate-400 text-xs">Pendientes</p>
                    <p className="text-2xl font-bold text-amber-400">{data.summary.pendingOrders}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Summary Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title={`Ingresos UYU (${period})`}
              value={formatCurrency(data.summary.totalRevenueUYU)}
              subValue={`${data.previousPeriod.revenueChangeUYU >= 0 ? '+' : ''}${data.previousPeriod.revenueChangeUYU}% vs período anterior`}
              icon={DollarSign}
              trend={data.previousPeriod.revenueChangeUYU > 0 ? 'up' : data.previousPeriod.revenueChangeUYU < 0 ? 'down' : 'neutral'}
              color="green"
            />
            <StatCard
              title={`Ingresos USD (${period})`}
              value={formatUSD(data.summary.totalRevenueUSD)}
              subValue={data.summary.paidOrdersUSD > 0
                ? `${data.previousPeriod.revenueChangeUSD >= 0 ? '+' : ''}${data.previousPeriod.revenueChangeUSD}% vs período anterior`
                : `${data.summary.paidOrdersUSD} pedidos USD`}
              icon={Globe}
              trend={data.previousPeriod.revenueChangeUSD > 0 ? 'up' : data.previousPeriod.revenueChangeUSD < 0 ? 'down' : 'neutral'}
              color="blue"
            />
            <StatCard
              title="Pedidos Pagados"
              value={data.summary.paidOrders}
              subValue={`${data.previousPeriod.ordersChange >= 0 ? '+' : ''}${data.previousPeriod.ordersChange}% vs período anterior`}
              icon={ShoppingCart}
              trend={data.previousPeriod.ordersChange > 0 ? 'up' : data.previousPeriod.ordersChange < 0 ? 'down' : 'neutral'}
              color="blue"
            />
            <StatCard
              title="Ticket Promedio UYU"
              value={formatCurrency(data.summary.avgOrderValue)}
              subValue={`${data.previousPeriod.aovChange >= 0 ? '+' : ''}${data.previousPeriod.aovChange}% vs período anterior`}
              icon={TrendingUp}
              trend={data.previousPeriod.aovChange > 0 ? 'up' : data.previousPeriod.aovChange < 0 ? 'down' : 'neutral'}
              color="purple"
            />
          </div>

          {/* Second stats row */}
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              title="Clientes Únicos"
              value={data.summary.uniqueCustomers}
              subValue={`${data.summary.conversionRate}% tasa de conversión`}
              icon={Users}
              color="amber"
            />
            <StatCard
              title="Online"
              value={formatCurrency(data.summary.onlineRevenueUYU)}
              subValue={data.summary.onlineRevenueUSD > 0
                ? `${formatUSD(data.summary.onlineRevenueUSD)} · ${data.summary.onlineOrders} pedidos`
                : `${data.summary.onlineOrders} pedidos online`}
              icon={Globe}
              color="blue"
            />
            <StatCard
              title="Mostrador"
              value={formatCurrency(data.summary.mostradorRevenueUYU)}
              subValue={data.summary.mostradorRevenueUSD > 0
                ? `${formatUSD(data.summary.mostradorRevenueUSD)} · ${data.summary.mostradorOrders} ventas`
                : `${data.summary.mostradorOrders} ventas en local`}
              icon={Store}
              color="green"
            />
          </div>

          {/* Revenue Chart (full width) */}
          <RevenueChart
            data={data.dailySales}
            chartType={chartType}
            setChartType={setChartType}
            revenueType={revenueType}
            setRevenueType={setRevenueType}
          />

          {/* Geographic + Payment side by side */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Department Donut */}
            <DepartmentDonutChart
              distribution={data.departmentDistribution}
              formatCurrency={formatCurrency}
            />

            {/* Payment Method Distribution — PieChart */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="h-5 w-5 text-slate-400" />
                <h3 className="text-lg font-semibold text-slate-900">Métodos de Pago</h3>
              </div>
              {Object.keys(data.paymentMethodDistribution).length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-8">Sin pagos registrados</p>
              ) : (() => {
                const paymentData = Object.entries(data.paymentMethodDistribution)
                  .sort((a, b) => b[1].revenue - a[1].revenue)
                  .map(([method, stats]) => ({
                    name: PAYMENT_LABELS[method] || method,
                    value: stats.revenue,
                    count: stats.count,
                    method,
                  }));
                const totalRevenue = paymentData.reduce((s, d) => s + d.value, 0);
                const totalCount = paymentData.reduce((s, d) => s + d.count, 0);

                return (
                  <PaymentMethodChart
                    data={paymentData}
                    formatCurrency={formatCurrency}
                    colors={PAYMENT_HEX_COLORS}
                  />
                );
              })()}
            </div>
          </div>

          {/* Shipping Distribution + Top products */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Shipping Type Distribution */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Truck className="h-5 w-5 text-slate-400" />
                <h3 className="text-lg font-semibold text-slate-900">Tipo de Envío</h3>
              </div>
              {Object.keys(data.shippingTypeDistribution).length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-8">Sin datos de envío</p>
              ) : (() => {
                const shippingData = Object.entries(data.shippingTypeDistribution)
                  .sort((a, b) => b[1].orders - a[1].orders)
                  .map(([type, stats]) => ({
                    name: SHIPPING_LABELS[type] || type,
                    value: stats.orders,
                    revenue: stats.revenue,
                    type,
                  }));
                const totalOrders = shippingData.reduce((s, d) => s + d.value, 0);

                return (
                  <ShippingTypeChart
                    data={shippingData}
                    formatCurrency={formatCurrency}
                    colors={SHIPPING_HEX_COLORS}
                  />
                );
              })()}
            </div>

            {/* Status Distribution */}
            <StatusDistribution data={data.statusDistribution} />
          </div>

          {/* Top products (full width) */}
          <TopProductsList products={data.topProducts} formatCurrency={formatCurrency} />

          {/* Inventory Health */}
          {data.inventoryHealth.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <h3 className="text-lg font-semibold text-slate-900">Inventario Crítico</h3>
                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                  {data.inventoryHealth.length} productos
                </span>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {data.inventoryHealth.map((product) => {
                  const urgency = product.daysRemaining <= 7
                    ? 'text-red-600 bg-red-50 border-red-200'
                    : product.daysRemaining <= 14
                      ? 'text-amber-600 bg-amber-50 border-amber-200'
                      : 'text-blue-600 bg-blue-50 border-blue-200';

                  return (
                    <div key={product.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                      {product.image ? (
                        <Image src={product.image} alt={product.name} width={36} height={36} className="w-9 h-9 rounded-lg object-cover" />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-slate-200 flex items-center justify-center shrink-0">
                          <Package className="h-4 w-4 text-slate-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{product.name}</p>
                        <p className="text-xs text-slate-500">
                          Stock: <span className="font-semibold">{product.stock}</span>
                          {product.avgDailySales > 0 && ` · ${product.avgDailySales}/día`}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold border shrink-0 ${urgency}`}>
                        {product.daysRemaining}d
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Hourly chart */}
          <HourlyChart data={data.hourlyStats} />

          {/* PostHog Conversion Funnel */}
          {posthogData?.configured && posthogData.funnel && posthogData.funnel.length > 0 && (
            <ConversionFunnel funnel={posthogData.funnel} />
          )}

          {/* PostHog Web Traffic */}
          {posthogData?.configured && posthogData.visitors && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="h-5 w-5 text-slate-400" />
                <h3 className="text-lg font-semibold text-slate-900">Tráfico Web</h3>
              </div>

              <div className="grid sm:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Visitantes únicos', value: posthogData.visitors.total.toLocaleString() },
                  { label: 'Visitantes hoy', value: posthogData.visitors.today.toLocaleString() },
                  { label: 'Páginas vistas', value: posthogData.visitors.pageviews.toLocaleString() },
                  { label: 'Vistas hoy', value: posthogData.visitors.todayPageviews.toLocaleString() },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center p-3 bg-slate-50 rounded-lg">
                    <p className="text-2xl font-bold text-slate-900">{value}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                {posthogData.topPages && posthogData.topPages.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-2">Páginas más visitadas</h4>
                    <div className="space-y-1.5">
                      {posthogData.topPages.slice(0, 8).map((page) => (
                        <div key={page.page} className="flex items-center justify-between text-sm">
                          <span className="text-slate-600 truncate mr-2">{page.page}</span>
                          <span className="text-slate-900 font-medium shrink-0">{page.views}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {posthogData.topReferrers && posthogData.topReferrers.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-2">Fuentes de tráfico</h4>
                    <div className="space-y-1.5">
                      {posthogData.topReferrers.slice(0, 8).map((ref) => (
                        <div key={ref.referrer} className="flex items-center justify-between text-sm">
                          <span className="text-slate-600 truncate mr-2 flex items-center gap-1">
                            <ExternalLink className="h-3 w-3 shrink-0" />
                            {ref.referrer}
                          </span>
                          <span className="text-slate-900 font-medium shrink-0">{ref.visits}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Period Summary Banner */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5" />
              <h3 className="font-semibold">Resumen del Período ({period})</h3>
            </div>
            <div className="grid sm:grid-cols-4 gap-4">
              <div>
                <p className="text-blue-200 text-sm">Total Pedidos</p>
                <p className="text-2xl font-bold">{data.summary.totalOrders}</p>
                <p className="text-xs text-blue-300 mt-0.5">{data.summary.pendingOrders} pendientes</p>
              </div>
              <div>
                <p className="text-blue-200 text-sm">Tasa de Pagos</p>
                <p className="text-2xl font-bold">{data.summary.conversionRate}%</p>
                <p className="text-xs text-blue-300 mt-0.5">{data.summary.paidOrders} pagados</p>
              </div>
              <div>
                <p className="text-blue-200 text-sm">Ingresos UYU</p>
                <p className="text-2xl font-bold">{formatCurrency(data.summary.totalRevenueUYU)}</p>
                {data.summary.totalRevenueUSD > 0 && (
                  <p className="text-xs text-blue-300 mt-0.5">{formatUSD(data.summary.totalRevenueUSD)} USD</p>
                )}
              </div>
              <div>
                <p className="text-blue-200 text-sm">Clientes Únicos</p>
                <p className="text-2xl font-bold">{data.summary.uniqueCustomers}</p>
                <p className="text-xs text-blue-300 mt-0.5">Ticket prom. {formatCurrency(data.summary.avgOrderValue)}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
