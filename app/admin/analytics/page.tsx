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
  LucideIcon
} from 'lucide-react';
import Image from 'next/image';
import {
  ResponsiveContainer,
  LineChart,
  BarChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

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
    todayRevenue: number;
    todayRevenueUYU: number;
    todayRevenueUSD: number;
    todayOrders: number;
    avgOrderValue: number;
    avgOrderValueUYU: number;
    avgOrderValueUSD: number;
    uniqueCustomers: number;
    conversionRate: number;
    onlineRevenue: number;
    mostradorRevenue: number;
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
  departmentDistribution: Record<string, { orders: number; revenue: number }>;
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
}

function StatCard({ 
  title, 
  value, 
  subValue, 
  icon: Icon, 
  trend,
  color = 'blue'
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

function RevenueChart({
  data,
  chartType,
  setChartType,
  revenueType,
  setRevenueType,
}: {
  data: AnalyticsData['dailySales'];
  chartType: 'line' | 'bar';
  setChartType: (v: 'line' | 'bar') => void;
  revenueType: 'uyu' | 'usd';
  setRevenueType: (v: 'uyu' | 'usd') => void;
}) {
  const formatAxis = (v: number) =>
    v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`;
  const formatTooltip = (v: number, currency: string) =>
    currency === 'USD'
      ? `US$ ${v.toLocaleString('es-UY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : `$ ${v.toLocaleString('es-UY', { maximumFractionDigits: 0 })}`;

  const dataKey = revenueType === 'usd' ? 'revenueUSD' : 'revenueUYU';
  const color = revenueType === 'usd' ? '#22c55e' : '#3b82f6';
  const currencyLabel = revenueType === 'usd' ? 'USD' : 'UYU';

  const formattedData = data.map(d => ({
    ...d,
    label: new Date(d.date + 'T12:00:00').toLocaleDateString('es-UY', { day: '2-digit', month: '2-digit' }),
  }));

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h3 className="text-lg font-semibold text-slate-900">Ingresos por Día</h3>
        <div className="flex flex-wrap gap-2">
          {/* Currency toggle */}
          <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs font-medium">
            <button
              onClick={() => setRevenueType('uyu')}
              className={`px-3 py-1.5 transition-colors ${revenueType === 'uyu' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
            >
              $ UYU
            </button>
            <button
              onClick={() => setRevenueType('usd')}
              className={`px-3 py-1.5 transition-colors ${revenueType === 'usd' ? 'bg-green-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
            >
              US$ USD
            </button>
          </div>
          {/* Chart type toggle */}
          <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs font-medium">
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1.5 transition-colors ${chartType === 'line' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
            >
              Línea
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1.5 transition-colors ${chartType === 'bar' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
            >
              Barras
            </button>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        {chartType === 'line' ? (
          <LineChart data={formattedData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
            <YAxis tickFormatter={formatAxis} tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={40} />
            <Tooltip
              formatter={(v) => [formatTooltip(Number(v ?? 0), currencyLabel), currencyLabel]}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
            />
            <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          </LineChart>
        ) : (
          <BarChart data={formattedData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
            <YAxis tickFormatter={formatAxis} tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={40} />
            <Tooltip
              formatter={(v) => [formatTooltip(Number(v ?? 0), currencyLabel), currencyLabel]}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
            />
            <Bar dataKey={dataKey} fill={color} radius={[3, 3, 0, 0]} maxBarSize={40} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

function HourlyChart({ data }: { data: Array<{ hour: number; orders: number }> }) {
  const maxOrders = Math.max(...data.map(d => d.orders), 1);
  
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Pedidos por Hora (Hoy)</h3>
      
      <div className="h-32 flex items-end gap-0.5">
        {data.map((hour) => {
          const height = (hour.orders / maxOrders) * 100;
          return (
            <div key={hour.hour} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-green-500 rounded-t-sm transition-all hover:bg-green-600 cursor-pointer min-h-0.5"
                style={{ height: `${Math.max(2, height)}%` }}
                title={`${hour.hour}:00 - ${hour.orders} pedidos`}
              />
            </div>
          );
        })}
      </div>
      
      <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
        <span>00:00</span>
        <span>12:00</span>
        <span>23:00</span>
      </div>
    </div>
  );
}

function TopProductsList({ products }: { products: AnalyticsData['topProducts'] }) {
  const formatCurrency = (v: number) => `$ ${v.toLocaleString('es-UY', { maximumFractionDigits: 0 })}`;
  
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Productos Más Vendidos</h3>
      
      {products.length === 0 ? (
        <p className="text-slate-500 text-sm text-center py-8">Sin datos de ventas</p>
      ) : (
        <div className="space-y-3">
          {products.map((product, index) => (
            <div key={product.id} className="flex items-center gap-3">
              <span className="text-sm font-bold text-slate-400 w-5">{index + 1}</span>
              
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-lg object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Package className="h-5 w-5 text-slate-400" />
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{product.name}</p>
                <p className="text-xs text-slate-500">{product.sold} vendidos</p>
              </div>
              
              <p className="text-sm font-semibold text-green-600">{formatCurrency(product.revenue)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusDistribution({ data }: { data: Record<string, number> }) {
  const statusLabels: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pendiente', color: 'bg-amber-500' },
    paid: { label: 'Pagado', color: 'bg-green-500' },
    paid_pending_verification: { label: 'Por verificar', color: 'bg-blue-500' },
    processing: { label: 'Procesando', color: 'bg-indigo-500' },
    shipped: { label: 'Enviado', color: 'bg-purple-500' },
    delivered: { label: 'Entregado', color: 'bg-slate-500' },
    cancelled: { label: 'Cancelado', color: 'bg-red-500' },
    refunded: { label: 'Reembolsado', color: 'bg-red-400' },
  };

  const total = Object.values(data).reduce((sum, v) => sum + v, 0);
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Estado de Pedidos</h3>
      
      {entries.length === 0 ? (
        <p className="text-slate-500 text-sm text-center py-8">Sin pedidos</p>
      ) : (
        <div className="space-y-3">
          {entries.map(([status, count]) => {
            const config = statusLabels[status] || { label: status, color: 'bg-slate-400' };
            const percentage = total > 0 ? (count / total) * 100 : 0;
            
            return (
              <div key={status}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-600">{config.label}</span>
                  <span className="text-slate-900 font-medium">{count}</span>
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

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [posthogData, setPosthogData] = useState<PostHogData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState('7d');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [revenueType, setRevenueType] = useState<'uyu' | 'usd'>('uyu');

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
    
    // Auto-refresh every 60 seconds
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
          <p className="text-slate-500">
            Datos en tiempo real
            {lastUpdated && (
              <span className="ml-2 text-xs">
                • Actualizado: {lastUpdated.toLocaleTimeString('es-UY')}
              </span>
            )}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            aria-label="Seleccionar período de tiempo"
          >
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="90d">Últimos 90 días</option>
          </select>
          
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
            aria-label="Actualizar datos"
          >
            <RefreshCw className={`h-5 w-5 text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {data && (
        <>
          {/* Summary Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Ingresos UYU"
              value={formatCurrency(data.summary.totalRevenueUYU)}
              subValue={`${data.previousPeriod.revenueChangeUYU >= 0 ? '+' : ''}${data.previousPeriod.revenueChangeUYU}% vs anterior`}
              icon={DollarSign}
              trend={data.previousPeriod.revenueChangeUYU > 0 ? 'up' : data.previousPeriod.revenueChangeUYU < 0 ? 'down' : 'neutral'}
              color="green"
            />
            <StatCard
              title="Ingresos USD"
              value={formatUSD(data.summary.totalRevenueUSD)}
              subValue={data.summary.paidOrdersUSD > 0
                ? `${data.previousPeriod.revenueChangeUSD >= 0 ? '+' : ''}${data.previousPeriod.revenueChangeUSD}% vs anterior`
                : `${data.summary.paidOrdersUSD} pedidos USD`}
              icon={Globe}
              trend={data.previousPeriod.revenueChangeUSD > 0 ? 'up' : data.previousPeriod.revenueChangeUSD < 0 ? 'down' : 'neutral'}
              color="blue"
            />
            <StatCard
              title="Pedidos Pagados"
              value={data.summary.paidOrders}
              subValue={`${data.previousPeriod.ordersChange >= 0 ? '+' : ''}${data.previousPeriod.ordersChange}% vs anterior`}
              icon={ShoppingCart}
              trend={data.previousPeriod.ordersChange > 0 ? 'up' : data.previousPeriod.ordersChange < 0 ? 'down' : 'neutral'}
              color="blue"
            />
            <StatCard
              title="Ticket Promedio"
              value={formatCurrency(data.summary.avgOrderValue)}
              subValue={`${data.previousPeriod.aovChange >= 0 ? '+' : ''}${data.previousPeriod.aovChange}% vs anterior`}
              icon={TrendingUp}
              trend={data.previousPeriod.aovChange > 0 ? 'up' : data.previousPeriod.aovChange < 0 ? 'down' : 'neutral'}
              color="purple"
            />
            <StatCard
              title="Clientes Únicos"
              value={data.summary.uniqueCustomers}
              subValue={`${data.summary.conversionRate}% conversión`}
              icon={Users}
              color="amber"
            />
          </div>

          {/* Revenue by Source */}
          {(data.summary.onlineRevenue > 0 || data.summary.mostradorRevenue > 0) && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Ingresos por Canal</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Globe className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-blue-600 font-medium">Online</p>
                    <p className="text-xl font-bold text-slate-900">{formatCurrency(data.summary.onlineRevenue)}</p>
                    <p className="text-xs text-slate-500">{data.summary.onlineOrders} pedidos</p>
                  </div>
                  {data.summary.totalRevenue > 0 && (
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">
                        {((data.summary.onlineRevenue / data.summary.totalRevenue) * 100).toFixed(0)}%
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="p-3 bg-emerald-100 rounded-xl">
                    <Store className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-emerald-600 font-medium">Mostrador</p>
                    <p className="text-xl font-bold text-slate-900">{formatCurrency(data.summary.mostradorRevenue)}</p>
                    <p className="text-xs text-slate-500">{data.summary.mostradorOrders} ventas</p>
                  </div>
                  {data.summary.totalRevenue > 0 && (
                    <div className="text-right">
                      <p className="text-lg font-bold text-emerald-600">
                        {((data.summary.mostradorRevenue / data.summary.totalRevenue) * 100).toFixed(0)}%
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Payment Method Distribution */}
          {Object.keys(data.paymentMethodDistribution).length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="h-5 w-5 text-slate-400" />
                <h3 className="text-lg font-semibold text-slate-900">Métodos de Pago</h3>
              </div>
              <div className="space-y-3">
                {Object.entries(data.paymentMethodDistribution)
                  .sort((a, b) => b[1].revenue - a[1].revenue)
                  .map(([method, stats]) => {
                    const labels: Record<string, string> = {
                      mercadopago: 'MercadoPago',
                      transfer: 'Transferencia',
                      efectivo: 'Efectivo',
                      pos_debito: 'POS Débito',
                      pos_credito: 'POS Crédito',
                      unknown: 'Sin especificar',
                    };
                    const colors: Record<string, string> = {
                      mercadopago: 'bg-blue-500',
                      transfer: 'bg-amber-500',
                      efectivo: 'bg-green-500',
                      pos_debito: 'bg-purple-500',
                      pos_credito: 'bg-indigo-500',
                      unknown: 'bg-slate-400',
                    };
                    const maxRevenue = Math.max(...Object.values(data.paymentMethodDistribution).map(s => s.revenue));
                    const pct = maxRevenue > 0 ? (stats.revenue / maxRevenue) * 100 : 0;

                    return (
                      <div key={method}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-slate-700 font-medium">{labels[method] || method}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-500">{stats.count} pedidos</span>
                            <span className="text-slate-900 font-semibold">{formatCurrency(stats.revenue)}</span>
                          </div>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${colors[method] || 'bg-slate-400'} rounded-full transition-all`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Geographic Breakdown + Inventory Health */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Geographic Breakdown */}
            {Object.keys(data.departmentDistribution).length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-5 w-5 text-slate-400" />
                  <h3 className="text-lg font-semibold text-slate-900">Ventas por Departamento</h3>
                </div>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {Object.entries(data.departmentDistribution)
                    .sort((a, b) => b[1].revenue - a[1].revenue)
                    .map(([dept, stats]) => {
                      const total = Object.values(data.departmentDistribution).reduce((s, d) => s + d.revenue, 0);
                      const pct = total > 0 ? ((stats.revenue / total) * 100).toFixed(0) : '0';
                      return (
                        <div key={dept} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-700">{dept}</span>
                            <span className="text-xs text-slate-400">{stats.orders} ped.</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">{pct}%</span>
                            <span className="text-sm font-semibold text-slate-900">{formatCurrency(stats.revenue)}</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Inventory Health */}
            {data.inventoryHealth.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <h3 className="text-lg font-semibold text-slate-900">Inventario Crítico</h3>
                </div>
                <div className="space-y-3">
                  {data.inventoryHealth.map((product) => {
                    const urgency = product.daysRemaining <= 7
                      ? 'text-red-600 bg-red-50 border-red-200'
                      : product.daysRemaining <= 14
                        ? 'text-amber-600 bg-amber-50 border-amber-200'
                        : 'text-blue-600 bg-blue-50 border-blue-200';

                    return (
                      <div key={product.id} className="flex items-center gap-3">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            width={36}
                            height={36}
                            className="w-9 h-9 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                            <Package className="h-4 w-4 text-slate-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{product.name}</p>
                          <p className="text-xs text-slate-500">
                            Stock: {product.stock} | Venta diaria: {product.avgDailySales}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${urgency}`}>
                          {product.daysRemaining}d
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Charts Row */}
          <div className="grid lg:grid-cols-2 gap-6">
            <RevenueChart
              data={data.dailySales}
              chartType={chartType}
              setChartType={setChartType}
              revenueType={revenueType}
              setRevenueType={setRevenueType}
            />
            <HourlyChart data={data.hourlyStats} />
          </div>

          {/* Bottom Row */}
          <div className="grid lg:grid-cols-2 gap-6">
            <TopProductsList products={data.topProducts} />
            <StatusDistribution data={data.statusDistribution} />
          </div>

          {/* PostHog Web Traffic */}
          {posthogData?.configured && posthogData.visitors && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="h-5 w-5 text-slate-400" />
                <h3 className="text-lg font-semibold text-slate-900">Tráfico Web</h3>
              </div>

              {/* Visitor Stats */}
              <div className="grid sm:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <p className="text-2xl font-bold text-slate-900">{posthogData.visitors.total.toLocaleString()}</p>
                  <p className="text-xs text-slate-500">Visitantes únicos</p>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <p className="text-2xl font-bold text-slate-900">{posthogData.visitors.today.toLocaleString()}</p>
                  <p className="text-xs text-slate-500">Visitantes hoy</p>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <p className="text-2xl font-bold text-slate-900">{posthogData.visitors.pageviews.toLocaleString()}</p>
                  <p className="text-xs text-slate-500">Páginas vistas</p>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <p className="text-2xl font-bold text-slate-900">{posthogData.visitors.todayPageviews.toLocaleString()}</p>
                  <p className="text-xs text-slate-500">Vistas hoy</p>
                </div>
              </div>

              {/* Top Pages + Referrers */}
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

          {/* Quick Stats */}
          <div className="bg-linear-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5" />
              <h3 className="font-semibold">Resumen del Período</h3>
            </div>
            <div className="grid sm:grid-cols-4 gap-4">
              <div>
                <p className="text-blue-200 text-sm">Total Pedidos</p>
                <p className="text-2xl font-bold">{data.summary.totalOrders}</p>
              </div>
              <div>
                <p className="text-blue-200 text-sm">Pendientes</p>
                <p className="text-2xl font-bold">{data.summary.pendingOrders}</p>
              </div>
              <div>
                <p className="text-blue-200 text-sm">Tasa Éxito</p>
                <p className="text-2xl font-bold">{data.summary.conversionRate}%</p>
              </div>
              <div>
                <p className="text-blue-200 text-sm">Ingresos UYU</p>
                <p className="text-2xl font-bold">{formatCurrency(data.summary.totalRevenueUYU)}</p>
                {data.summary.totalRevenueUSD > 0 && (
                  <p className="text-sm text-blue-200 mt-1">{formatUSD(data.summary.totalRevenueUSD)} USD</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
