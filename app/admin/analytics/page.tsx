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
  LucideIcon
} from 'lucide-react';
import Image from 'next/image';

interface AnalyticsData {
  summary: {
    totalOrders: number;
    paidOrders: number;
    pendingOrders: number;
    totalRevenue: number;
    todayRevenue: number;
    todayOrders: number;
    avgOrderValue: number;
    uniqueCustomers: number;
    conversionRate: number;
  };
  dailySales: Array<{ date: string; orders: number; revenue: number }>;
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

function SalesChart({ data }: { data: Array<{ date: string; revenue: number; orders: number }> }) {
  const maxRevenue = Math.max(...data.map(d => d.revenue), 1);
  
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Ventas por Día</h3>
      
      <div className="h-48 flex items-end gap-1">
        {data.slice(-14).map((day) => {
          const height = (day.revenue / maxRevenue) * 100;
          const date = new Date(day.date);
          const dayLabel = date.toLocaleDateString('es-UY', { weekday: 'short' });
          
          return (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
              <div 
                className="w-full bg-blue-500 rounded-t-sm transition-all hover:bg-blue-600 cursor-pointer min-h-1"
                style={{ height: `${Math.max(2, height)}%` }}
                title={`${dayLabel}: UYU ${day.revenue.toLocaleString('es-UY')}`}
              />
              <span className="text-[10px] text-slate-400 truncate w-full text-center">
                {date.getDate()}
              </span>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <span>{data.length > 0 ? new Date(data[0].date).toLocaleDateString('es-UY', { month: 'short', day: 'numeric' }) : ''}</span>
        <span>{data.length > 0 ? new Date(data[data.length - 1].date).toLocaleDateString('es-UY', { month: 'short', day: 'numeric' }) : ''}</span>
      </div>
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
  const formatCurrency = (v: number) => `UYU ${v.toLocaleString('es-UY', { maximumFractionDigits: 0 })}`;
  
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
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState('7d');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?period=${period}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setLastUpdated(new Date());
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
    `UYU ${value.toLocaleString('es-UY', { maximumFractionDigits: 0 })}`;

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
              title="Ingresos Totales"
              value={formatCurrency(data.summary.totalRevenue)}
              subValue={`Hoy: ${formatCurrency(data.summary.todayRevenue)}`}
              icon={DollarSign}
              trend={data.summary.todayRevenue > 0 ? 'up' : 'neutral'}
              color="green"
            />
            <StatCard
              title="Pedidos Pagados"
              value={data.summary.paidOrders}
              subValue={`${data.summary.todayOrders} hoy`}
              icon={ShoppingCart}
              trend={data.summary.todayOrders > 0 ? 'up' : 'neutral'}
              color="blue"
            />
            <StatCard
              title="Ticket Promedio"
              value={formatCurrency(data.summary.avgOrderValue)}
              icon={TrendingUp}
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

          {/* Charts Row */}
          <div className="grid lg:grid-cols-2 gap-6">
            <SalesChart data={data.dailySales} />
            <HourlyChart data={data.hourlyStats} />
          </div>

          {/* Bottom Row */}
          <div className="grid lg:grid-cols-2 gap-6">
            <TopProductsList products={data.topProducts} />
            <StatusDistribution data={data.statusDistribution} />
          </div>

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
                <p className="text-blue-200 text-sm">Ingresos</p>
                <p className="text-2xl font-bold">{formatCurrency(data.summary.totalRevenue)}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
