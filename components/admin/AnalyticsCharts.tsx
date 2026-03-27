'use client';

import { useState } from 'react';
import { MapPin } from 'lucide-react';
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
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DailySale {
  date: string;
  orders: number;
  revenueUYU: number;
  revenueUSD: number;
  onlineRevenue: number;
}

interface Distribution {
  orders: number;
  revenue: number;
}

const DEPT_COLORS = [
  '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#6366f1',
  '#84cc16', '#64748b',
];

export function RevenueChart({
  data,
  chartType,
  setChartType,
  revenueType,
  setRevenueType,
}: {
  data: DailySale[];
  chartType: 'line' | 'bar';
  setChartType: (v: 'line' | 'bar') => void;
  revenueType: 'uyu' | 'usd';
  setRevenueType: (v: 'uyu' | 'usd') => void;
}) {
  const formatAxis = (v: number) =>
    v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`;
  const formatTooltipUYU = (v: number) => `$ ${v.toLocaleString('es-UY', { maximumFractionDigits: 0 })}`;
  const formatTooltipUSD = (v: number) => `U$S ${v.toLocaleString('es-UY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const formattedData = data.map(d => ({
    ...d,
    label: new Date(d.date + 'T12:00:00').toLocaleDateString('es-UY', { day: '2-digit', month: '2-digit' }),
  }));

  const isCanalView = false; // Canal view removed as it's only online now

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h3 className="text-lg font-semibold text-slate-900">Ingresos por Día</h3>
        <div className="flex flex-wrap gap-2">
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
              U$S
            </button>
          </div>
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
        {isCanalView ? (
          <BarChart data={formattedData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
            <YAxis tickFormatter={formatAxis} tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={40} />
            <Tooltip
              formatter={(v: any) => [formatTooltipUYU(Number(v ?? 0)), 'Online']}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
            />
            <Bar dataKey="onlineRevenue" name="Online" fill="#3b82f6" radius={[2, 2, 0, 0]} maxBarSize={32} />
          </BarChart>
        ) : chartType === 'line' ? (
          <LineChart data={formattedData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
            <YAxis tickFormatter={formatAxis} tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={40} />
            <Tooltip
              formatter={(v: any) => [revenueType === 'usd' ? formatTooltipUSD(Number(v ?? 0)) : formatTooltipUYU(Number(v ?? 0)), revenueType === 'usd' ? 'USD' : 'UYU']}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
            />
            <Line type="monotone" dataKey={revenueType === 'usd' ? 'revenueUSD' : 'revenueUYU'} stroke={revenueType === 'usd' ? '#22c55e' : '#3b82f6'} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          </LineChart>
        ) : (
          <BarChart data={formattedData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
            <YAxis tickFormatter={formatAxis} tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={40} />
            <Tooltip
              formatter={(v: any) => [revenueType === 'usd' ? formatTooltipUSD(Number(v ?? 0)) : formatTooltipUYU(Number(v ?? 0)), revenueType === 'usd' ? 'USD' : 'UYU']}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
            />
            <Bar dataKey={revenueType === 'usd' ? 'revenueUSD' : 'revenueUYU'} fill={revenueType === 'usd' ? '#22c55e' : '#3b82f6'} radius={[3, 3, 0, 0]} maxBarSize={40} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

export function DepartmentDonutChart({
  distribution,
  formatCurrency,
}: {
  distribution: Record<string, Distribution>;
  formatCurrency: (v: number) => string;
}) {
  const [metric, setMetric] = useState<'orders' | 'revenue'>('orders');

  const actual = Object.entries(distribution).filter(([dept]) => dept !== 'Sin especificar');
  const sinEsp = distribution['Sin especificar'];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-slate-400" />
          <h3 className="text-lg font-semibold text-slate-900">Envíos por Departamento</h3>
        </div>
        {actual.length > 0 && (
          <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs font-medium">
            <button
              onClick={() => setMetric('orders')}
              className={`px-3 py-1.5 transition-colors ${metric === 'orders' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
            >
              Pedidos
            </button>
            <button
              onClick={() => setMetric('revenue')}
              className={`px-3 py-1.5 transition-colors ${metric === 'revenue' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
            >
              Ingresos
            </button>
          </div>
        )}
      </div>

      {actual.length === 0 ? (
        <div className="text-center py-8">
          <MapPin className="h-10 w-10 text-slate-200 mx-auto mb-3" />
          <p className="text-sm text-slate-500">
            {sinEsp
              ? `${sinEsp.orders} pedido${sinEsp.orders !== 1 ? 's' : ''} sin departamento de envío (retiro en local o mostrador)`
              : 'Sin pedidos con departamento de envío en este período'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={actual.sort((a, b) => b[1].revenue - a[1].revenue).map(([dept, stats]) => ({
                      name: dept,
                      value: metric === 'orders' ? stats.orders : stats.revenue,
                      orders: stats.orders,
                      revenue: stats.revenue,
                    }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {actual.map((_, i) => (
                      <Cell key={i} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, _name: any, props: any) => {
                      const v = Number(value ?? 0);
                      const total = actual.reduce((s, [, st]) => s + (metric === 'orders' ? st.orders : st.revenue), 0);
                      const pct = total > 0 ? ((v / total) * 100).toFixed(1) : '0';
                      const label = metric === 'orders'
                        ? `${v} pedidos (${pct}%)`
                        : `${formatCurrency(v)} (${pct}%)`;
                      return [label, props?.payload?.name ?? ''];
                    }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {actual
                .sort((a, b) => b[1].revenue - a[1].revenue)
                .map(([dept, stats], i) => {
                  const total = actual.reduce((s, [, st]) => s + (metric === 'orders' ? st.orders : st.revenue), 0);
                  const val = metric === 'orders' ? stats.orders : stats.revenue;
                  const pct = total > 0 ? (val / total * 100).toFixed(0) : '0';
                  return (
                    <div key={dept} className="flex items-center gap-2 py-1.5 border-b border-slate-50 last:border-0">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: DEPT_COLORS[i % DEPT_COLORS.length] }} />
                      <span className="text-sm text-slate-700 flex-1 truncate">{dept}</span>
                      <span className="text-xs text-slate-400 shrink-0">{stats.orders} ped.</span>
                      <span className="text-xs text-slate-400 shrink-0 w-8 text-right">{pct}%</span>
                      <span className="text-sm font-semibold text-slate-900 shrink-0">{formatCurrency(stats.revenue)}</span>
                    </div>
                  );
                })}
            </div>
          </div>

          {sinEsp && (
            <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-100">
              + {sinEsp.orders} pedido{sinEsp.orders !== 1 ? 's' : ''} sin departamento de envío ({formatCurrency(sinEsp.revenue)})
            </p>
          )}
        </>
      )}
    </div>
  );
}

export function PaymentMethodChart({
  data,
  formatCurrency,
  colors
}: {
  data: Array<{ method: string; count: number; name: string; value: number }>;
  formatCurrency: (v: number) => string;
  colors: Record<string, string>;
}) {
  const totalCount = data.reduce((s, d) => s + d.count, 0);

  return (
    <div>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={85}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry) => (
              <Cell key={entry.method} fill={colors[entry.method] || '#94a3b8'} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v: any) => [formatCurrency(Number(v ?? 0)), 'Ingresos']}
            contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-2 mt-3">
        {data.map((entry) => {
          const pct = totalCount > 0 ? ((entry.count / totalCount) * 100).toFixed(0) : '0';
          return (
            <div key={entry.method} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: colors[entry.method] || '#94a3b8' }} />
                <span className="text-slate-700">{entry.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">{entry.count} ({pct}%)</span>
                <span className="text-slate-900 font-semibold">{formatCurrency(entry.value)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ShippingTypeChart({
  data,
  formatCurrency,
  colors
}: {
  data: Array<{ name: string; value: number; revenue: number; type: string }>;
  formatCurrency: (v: number) => string;
  colors: Record<string, string>;
}) {
  const totalOrders = data.reduce((s, d) => s + d.value, 0);

  return (
    <div>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={85}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry) => (
              <Cell key={entry.type} fill={colors[entry.type] || '#94a3b8'} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v: any) => {
              const pct = totalOrders > 0 ? ((Number(v ?? 0) / totalOrders) * 100).toFixed(0) : '0';
              return [`${v} pedidos (${pct}%)`, 'Pedidos'];
            }}
            contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-2 mt-3">
        {data.map((entry) => {
          const pct = totalOrders > 0 ? ((entry.value / totalOrders) * 100).toFixed(0) : '0';
          return (
            <div key={entry.type} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: colors[entry.type] || '#94a3b8' }} />
                <span className="text-slate-700">{entry.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">{entry.value} ped. ({pct}%)</span>
                <span className="text-slate-900 font-semibold">{formatCurrency(entry.revenue)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
