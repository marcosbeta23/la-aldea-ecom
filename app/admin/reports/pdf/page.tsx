'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  Printer, ArrowLeft, RefreshCw, TrendingUp, TrendingDown,
  Minus, ShoppingCart, Users, DollarSign, Globe,
  Package, AlertTriangle, Calendar, Sparkles, Zap, Target,
  ArrowUpRight, ChevronRight, BarChart2, Tag, UserCheck, Truck,
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

// Fallback if recharts hasn't loaded yet (SSR / first paint)
const ChartPlaceholder = ({ height = 200 }: { height?: number }) => (
  <div
    className="animate-pulse bg-slate-100 rounded-lg w-full"
    style={{ height }}
  />
);

// ─── Types ────────────────────────────────────────────────────────────────────

interface AnalyticsData {
  summary: {
    totalOrders: number;
    paidOrders: number;
    paidOrdersUYU: number;
    paidOrdersUSD: number;
    pendingOrders: number;
    totalRevenueUYU: number;
    totalRevenueUSD: number;
    combinedRevenueUYU: number;
    avgOrderValueUYU: number;
    avgOrderValueUSD: number;
    uniqueCustomers: number;
    conversionRate: number;
    onlineRevenueUYU: number;
    onlineOrders: number;
    couponUsageRate: number;
    avgFulfillmentDays: number;
    cartAbandonmentRate: number;
    newCustomers: number;
    returningCustomers: number;
    topCoupons: Array<{ code: string; current_uses: number }>;
  };
  previousPeriod: {
    revenueChangeUYU: number;
    revenueChangeUSD: number;
    ordersChange: number;
    aovChange: number;
  };
  dailySales: Array<{
    date: string;
    orders: number;
    revenueUYU: number;
    revenueUSD: number;
    onlineRevenue: number;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    sku: string;
    sold: number;
    revenue: number;
    image: string | null;
  }>;
  departmentDistribution: Record<string, { orders: number; revenue: number }>;
  paymentMethodDistribution: Record<string, { count: number; revenue: number }>;
  inventoryHealth: Array<{
    id: string;
    name: string;
    sku: string;
    stock: number;
    daysRemaining: number;
  }>;
  statusDistribution: Record<string, number>;
  exchangeRate: number;
  period: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (v: number) =>
  `$ ${v.toLocaleString('es-UY', { maximumFractionDigits: 0 })}`;
const fmtUSD = (v: number) =>
  `US$ ${v.toLocaleString('es-UY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtDate = (d: string) =>
  new Date(d + 'T12:00:00').toLocaleDateString('es-UY', { day: '2-digit', month: 'short' });
const fmtCompact = (v: number) =>
  v >= 1_000_000
    ? `$${(v / 1_000_000).toFixed(1)}M`
    : v >= 1000
      ? `$${(v / 1000).toFixed(0)}k`
      : `$${v}`;

const periodLabel: Record<string, string> = {
  week: 'Última semana',
  month: 'Último mes',
  semester: 'Último semestre',
  year: 'Último año',
};

const CHART_COLORS = ['#2563eb', '#16a34a', '#d97706', '#9333ea', '#dc2626', '#0891b2'];

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente', paid: 'Pagado', paid_pending_verification: 'Por verificar',
  processing: 'Preparando', shipped: 'Enviado', delivered: 'Entregado',
  cancelled: 'Cancelado', refunded: 'Reembolsado', invoiced: 'Facturado',
  ready_to_invoice: 'Por facturar',
};

const STATUS_COLORS: Record<string, string> = {
  paid: '#16a34a', processing: '#2563eb', shipped: '#9333ea',
  delivered: '#059669', pending: '#d97706', cancelled: '#dc2626',
  refunded: '#6b7280', invoiced: '#0891b2', ready_to_invoice: '#0891b2',
  paid_pending_verification: '#f59e0b',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, change, icon: Icon, color }: {
  label: string; value: string; sub?: string; change?: number;
  icon: React.ElementType; color: string;
}) {
  const trend = change === undefined ? null : change > 0 ? 'up' : change < 0 ? 'down' : 'flat';
  return (
    <div className="rounded-xl border border-slate-200 p-4 bg-white flex flex-col gap-1">
      <div className="flex items-start justify-between">
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}18` }}>
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
        {trend !== null && (
          <span className={`text-xs font-semibold flex items-center gap-0.5 ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-500' : 'text-slate-400'
            }`}>
            {trend === 'up' ? <TrendingUp className="h-3 w-3" /> :
              trend === 'down' ? <TrendingDown className="h-3 w-3" /> :
                <Minus className="h-3 w-3" />}
            {change !== undefined ? `${change > 0 ? '+' : ''}${change}%` : ''}
          </span>
        )}
      </div>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
      <p className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">{value}</p>
      {sub && <p className="text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

function SectionTitle({ children, icon: Icon }: { children: React.ReactNode; icon?: React.ElementType }) {
  return (
    <div className="flex items-center gap-2 mb-4 pb-2" style={{ borderBottom: '2px solid #1e3a8a' }}>
      {Icon && <Icon className="h-4 w-4 text-blue-800 flex-shrink-0" />}
      <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider" style={{ fontFamily: 'system-ui, sans-serif' }}>
        {children}
      </h2>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PdfReportPage() {
  const router = useRouter();
  const [period, setPeriod] = useState('month');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatedAt, setGeneratedAt] = useState('');
  const [chartsReady, setChartsReady] = useState(false);

  // AI state
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [provider, setProvider] = useState<'groq' | 'claude'>('groq');
  const [providerStatus, setProviderStatus] = useState<{ claude: boolean; groq: boolean } | null>(null);

  // ── Check recharts loaded ──────────────────────────────────────────────────
  useEffect(() => {
    import('recharts').then(() => setChartsReady(true)).catch(() => { });
  }, []);

  // ── Check provider status ──────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/admin/reports/insights')
      .then(r => r.json())
      .then(setProviderStatus)
      .catch(() => setProviderStatus({ claude: false, groq: false }));
  }, []);

  // ── Fetch analytics ──────────────────────────────────────────────────────
  const fetchData = useCallback(async (p: string) => {
    setLoading(true);
    setAiAnalysis('');
    setAiError('');
    try {
      const res = await fetch(`/api/admin/analytics?period=${p}`);
      const json = await res.json();
      setData(json);
      setGeneratedAt(new Date().toLocaleString('es-UY'));
    } catch {
      alert('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(period); }, [period, fetchData]);

  // ── AI Analysis ──────────────────────────────────────────────────────────
  const generateAiAnalysis = async () => {
    if (!data) return;
    setAiLoading(true);
    setAiError('');
    setAiAnalysis('');
    try {
      const res = await fetch('/api/admin/reports/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analyticsData: data, period, provider }),
      });
      if (!res.ok) throw new Error('Error en la respuesta');
      const json = await res.json();
      setAiAnalysis(json.analysis || '');
    } catch {
      setAiError('No se pudo generar el análisis. Verificá la configuración de la API.');
    } finally {
      setAiLoading(false);
    }
  };

  const handlePrint = () => window.print();

  // ── Derived data (all memoized) ───────────────────────────────────────────
  const dayOfWeekData = useMemo(() => {
    if (!data) return [];
    const totals = Array(7).fill(null).map(() => ({ orders: 0, revenue: 0, days: 0 }));
    data.dailySales.forEach(d => {
      const idx = new Date(d.date + 'T12:00:00').getDay();
      totals[idx].orders += d.orders;
      totals[idx].revenue += d.revenueUYU;
      totals[idx].days += 1;
    });
    return DAY_NAMES.map((name, i) => ({
      name,
      avgRevenue: totals[i].days > 0 ? Math.round(totals[i].revenue / totals[i].days) : 0,
      avgOrders: totals[i].days > 0 ? +(totals[i].orders / totals[i].days).toFixed(1) : 0,
    }));
  }, [data]);

  const revenueVelocity = useMemo(() => {
    if (!data || data.dailySales.length < 6) return null;
    const half = Math.floor(data.dailySales.length / 2);
    const first = data.dailySales.slice(0, half);
    const second = data.dailySales.slice(half);
    const avgFirst = first.reduce((s, d) => s + d.revenueUYU, 0) / first.length;
    const avgSecond = second.reduce((s, d) => s + d.revenueUYU, 0) / second.length;
    const change = avgFirst > 0 ? Math.round(((avgSecond - avgFirst) / avgFirst) * 100) : 0;
    return { avgFirst: Math.round(avgFirst), avgSecond: Math.round(avgSecond), change };
  }, [data]);

  const funnelData = useMemo(() => {
    if (!data) return [];
    const total = data.summary.totalOrders;
    const paid = data.summary.paidOrders;
    const delivered = data.statusDistribution['delivered'] || 0;
    return [
      { label: 'Pedidos totales', count: total, color: '#2563eb', pct: 100 },
      { label: 'Pagados', count: paid, color: '#16a34a', pct: total > 0 ? Math.round((paid / total) * 100) : 0 },
      { label: 'Entregados', count: delivered, color: '#059669', pct: total > 0 ? Math.round((delivered / total) * 100) : 0 },
    ];
  }, [data]);

  const currencyData = useMemo(() => data ? [
    { name: 'UYU', value: data.summary.totalRevenueUYU, orders: data.summary.paidOrdersUYU },
    { name: 'USD', value: data.summary.totalRevenueUSD * data.exchangeRate, orders: data.summary.paidOrdersUSD, originalValue: data.summary.totalRevenueUSD },
  ] : [], [data]);

  const paymentData = useMemo(() => data
    ? Object.entries(data.paymentMethodDistribution)
      .map(([method, v]) => ({ name: method, count: v.count, revenue: v.revenue }))
      .sort((a, b) => b.revenue - a.revenue)
    : [], [data]);

  const deptData = useMemo(() => data
    ? Object.entries(data.departmentDistribution)
      .map(([dept, v]) => ({ name: dept || 'Sin datos', orders: v.orders, revenue: v.revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8)
    : [], [data]);

  const topProductsChart = useMemo(() => data?.topProducts.slice(0, 6).map(p => ({
    name: p.name.length > 22 ? p.name.slice(0, 20) + '…' : p.name,
    vendidos: p.sold,
    ingresos: Math.round(p.revenue),
  })) || [], [data]);

  const dailyChartData = useMemo(() => data?.dailySales.map(d => ({
    date: fmtDate(d.date),
    UYU: d.revenueUYU,
    USD: d.revenueUSD * (data.exchangeRate || 40),
    Pedidos: d.orders,
  })) || [], [data]);

  const dailyAvgRevenue = useMemo(() => {
    if (!data || data.dailySales.length === 0) return 0;
    return Math.round(data.dailySales.reduce((s, d) => s + d.revenueUYU, 0) / data.dailySales.length);
  }, [data]);

  const bestDay = useMemo(() => {
    if (!data || data.dailySales.length === 0) return null;
    return data.dailySales.reduce((best, d) => d.revenueUYU > best.revenueUYU ? d : best);
  }, [data]);

  const aiSections = useMemo(() => {
    if (!aiAnalysis) return [];
    return aiAnalysis
      .split(/\*\*(.+?)\*\*/)
      .reduce<Array<{ title: string; body: string }>>((acc, part, i, arr) => {
        if (i % 2 === 1) acc.push({ title: part.trim(), body: (arr[i + 1] || '').trim() });
        return acc;
      }, []);
  }, [aiAnalysis]);

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Print CSS ── */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-break { page-break-before: always; break-before: page; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          @page { size: A4; margin: 12mm 14mm; }
        }
        @media screen { .print-only { display: none; } }
        .ai-section-body p { margin-bottom: 0.5rem; }
      `}</style>

      {/* ══════════════════════════════════════════════════════
          TOOLBAR — responsive two-row on mobile
      ══════════════════════════════════════════════════════ */}
      <div className="no-print sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">

        {/* Row 1: navigation + print (always visible) */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => router.push('/admin/reports')}
              className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 transition-colors flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Volver</span>
            </button>
            <span className="hidden sm:inline text-slate-200 mx-1">|</span>
            <BarChart2 className="h-4 w-4 text-blue-700 flex-shrink-0" />
            <h1 className="font-semibold text-slate-900 text-sm truncate">Reporte de Análisis</h1>
          </div>

          {/* Print — always in top row, icon-only on mobile */}
          <button
            onClick={handlePrint}
            disabled={loading || !data}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-blue-700 text-white rounded-lg hover:bg-blue-800 disabled:bg-slate-300 font-medium transition-colors flex-shrink-0"
          >
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Imprimir / PDF</span>
          </button>
        </div>

        {/* Row 2: controls — scrollable on very small screens */}
        <div className="flex items-center gap-2 px-4 sm:px-6 pb-2.5 overflow-x-auto scrollbar-none border-t border-slate-100">
          {/* Period selector */}
          <select
            value={period}
            onChange={e => setPeriod(e.target.value)}
            className="text-xs sm:text-sm border border-slate-200 rounded-lg px-2 sm:px-3 py-1.5 bg-white text-slate-700 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="week">Última semana</option>
            <option value="month">Último mes</option>
            <option value="semester">Último semestre</option>
            <option value="year">Último año</option>
          </select>

          {/* Refresh */}
          <button
            onClick={() => fetchData(period)}
            disabled={loading}
            className="flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3 py-1.5 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors flex-shrink-0"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>

          {/* AI provider toggle + button */}
          <div className="flex items-center gap-1 border border-slate-200 rounded-lg overflow-hidden flex-shrink-0">
            <div className="flex items-center px-1.5 gap-1 border-r border-slate-200 bg-slate-50">
              <button
                onClick={() => setProvider('groq')}
                disabled={providerStatus?.groq === false}
                title={providerStatus?.groq === false ? 'GROQ_API_KEY no configurada' : 'Gratis · Llama 3.3 70B'}
                className={`text-[11px] px-1.5 py-1 rounded transition-colors ${provider === 'groq'
                  ? 'bg-green-600 text-white font-semibold'
                  : providerStatus?.groq === false
                    ? 'text-slate-300 cursor-not-allowed'
                    : 'text-slate-600 hover:bg-slate-100'
                  }`}
              >
                Groq{providerStatus?.groq ? ' ✓' : ' ✗'}
              </button>
              <button
                onClick={() => setProvider('claude')}
                disabled={providerStatus?.claude === false}
                title={providerStatus?.claude === false ? 'ANTHROPIC_API_KEY no configurada' : '~$0.004/análisis · Claude Haiku'}
                className={`text-[11px] px-1.5 py-1 rounded transition-colors ${provider === 'claude'
                  ? 'bg-blue-700 text-white font-semibold'
                  : providerStatus?.claude === false
                    ? 'text-slate-300 cursor-not-allowed'
                    : 'text-slate-600 hover:bg-slate-100'
                  }`}
              >
                Claude{providerStatus?.claude ? ' ✓' : ' ✗'}
              </button>
            </div>
            <button
              onClick={generateAiAnalysis}
              disabled={aiLoading || loading || !data || (providerStatus !== null && !providerStatus.groq && !providerStatus.claude)}
              className="flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3 py-1.5 bg-violet-600 text-white hover:bg-violet-700 disabled:bg-slate-300 font-medium transition-colors"
            >
              <Sparkles className={`h-3.5 w-3.5 ${aiLoading ? 'animate-pulse' : ''}`} />
              <span>{aiLoading ? 'Analizando…' : 'Análisis IA'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Loading state ── */}
      {loading && (
        <div className="no-print flex items-center justify-center h-64 sm:h-96">
          <div className="text-center space-y-3">
            <RefreshCw className="h-7 w-7 animate-spin text-blue-600 mx-auto" />
            <p className="text-slate-500 text-sm">Cargando datos del período…</p>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          REPORT CONTENT
      ══════════════════════════════════════════════════════ */}
      {data && !loading && (
        <div
          className="report-body max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 sm:space-y-9"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: '#1e293b' }}
        >

          {/* ── COVER ── */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-6" style={{ borderBottom: '3px solid #1e3a8a' }}>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-xl bg-blue-800 flex items-center justify-center shadow-md flex-shrink-0">
                  <span className="text-white font-bold text-sm" style={{ fontFamily: 'system-ui' }}>LA</span>
                </div>
                <span className="text-lg font-bold text-blue-900" style={{ fontFamily: 'system-ui, sans-serif' }}>La Aldea</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1 tracking-tight">Reporte de Ventas</h1>
              <p className="text-slate-500 text-sm" style={{ fontFamily: 'system-ui' }}>{periodLabel[period] || period}</p>
            </div>
            <div className="text-left sm:text-right text-xs text-slate-500 space-y-1" style={{ fontFamily: 'system-ui, sans-serif' }}>
              <div className="flex items-center gap-1.5 sm:justify-end">
                <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                <span>Generado: {generatedAt}</span>
              </div>
              <div>Tipo de cambio: {fmt(data.exchangeRate)} / USD</div>
              <div>Pedidos analizados: {data.summary.totalOrders}</div>
              <div>Días en período: {data.dailySales.length}</div>
            </div>
          </div>

          {/* ── RESUMEN EJECUTIVO ── */}
          <section>
            <SectionTitle icon={Target}>Resumen Ejecutivo</SectionTitle>

            {/* Revenue row: 1 col on xs, 3 on sm+ */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <KpiCard label="Ingresos UYU" value={fmt(data.summary.totalRevenueUYU)}
                sub={`${data.previousPeriod.revenueChangeUYU > 0 ? '+' : ''}${data.previousPeriod.revenueChangeUYU}% vs período ant.`}
                change={data.previousPeriod.revenueChangeUYU} icon={DollarSign} color="#16a34a" />
              <KpiCard label="Ingresos USD" value={fmtUSD(data.summary.totalRevenueUSD)}
                sub={`${data.summary.paidOrdersUSD} pedidos en USD`}
                change={data.previousPeriod.revenueChangeUSD} icon={Globe} color="#2563eb" />
              <KpiCard label="Ingreso Combinado (UYU)" value={fmt(data.summary.combinedRevenueUYU)}
                sub="USD convertido a tipo de cambio BCU" icon={DollarSign} color="#1e3a8a" />
            </div>

            {/* Operations row: 2 col on xs, 4 on lg */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <KpiCard label="Pedidos Pagados" value={String(data.summary.paidOrders)}
                sub={`${data.previousPeriod.ordersChange > 0 ? '+' : ''}${data.previousPeriod.ordersChange}% vs período ant.`}
                change={data.previousPeriod.ordersChange} icon={ShoppingCart} color="#9333ea" />
              <KpiCard label="Ticket Promedio UYU" value={fmt(data.summary.avgOrderValueUYU)}
                sub={`${data.previousPeriod.aovChange > 0 ? '+' : ''}${data.previousPeriod.aovChange}% vs período ant.`}
                change={data.previousPeriod.aovChange} icon={TrendingUp} color="#d97706" />
              <KpiCard label="Promedio Diario UYU" value={fmt(dailyAvgRevenue)}
                sub={`En ${data.dailySales.length} días de actividad`} icon={Zap} color="#0891b2" />
              <KpiCard label="Clientes Únicos" value={String(data.summary.uniqueCustomers)}
                sub={`${data.summary.conversionRate}% tasa de conversión`} icon={Users} color="#dc2626" />
            </div>

            {/* NEW: Insights row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
              <KpiCard label="Uso de Cupones" value={`${data.summary.couponUsageRate}%`}
                sub={`${data.summary.topCoupons?.[0]?.code || 'N/A'} más usado`} icon={Tag} color="#ec4899" />
              <KpiCard label="Retención" value={`${data.summary.returningCustomers}`}
                sub={`${data.summary.newCustomers} clientes nuevos`} icon={UserCheck} color="#8b5cf6" />
              <KpiCard label="Fulfillment" value={`${data.summary.avgFulfillmentDays} días`}
                sub="Promedio pago → entrega" icon={Truck} color="#f59e0b" />
              <KpiCard label="Abandono" value={`${data.summary.cartAbandonmentRate}%`}
                sub="Checkouts no finalizados" icon={ShoppingCart} color="#ef4444" />
            </div>

            {/* Velocity */}
            {revenueVelocity && (
              <div className="mt-3 flex items-start gap-3 px-4 py-3 rounded-xl"
                style={{
                  background: revenueVelocity.change >= 0 ? '#f0fdf4' : '#fef2f2',
                  border: `1px solid ${revenueVelocity.change >= 0 ? '#bbf7d0' : '#fecaca'}`,
                  fontFamily: 'system-ui, sans-serif',
                }}>
                {revenueVelocity.change >= 0
                  ? <TrendingUp className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  : <TrendingDown className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />}
                <span className="text-sm font-medium" style={{ color: revenueVelocity.change >= 0 ? '#166534' : '#991b1b' }}>
                  Velocidad de ingresos: <strong>{revenueVelocity.change > 0 ? '+' : ''}{revenueVelocity.change}%</strong>{' '}
                  en la segunda mitad del período ({fmt(revenueVelocity.avgFirst)}/día → {fmt(revenueVelocity.avgSecond)}/día)
                </span>
              </div>
            )}
          </section>

          {/* ── AI ANALYSIS ── */}
          {(aiLoading || aiAnalysis || aiError) && (
            <section>
              <div className="flex items-center justify-between mb-4 pb-2" style={{ borderBottom: '2px solid #1e3a8a' }}>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-800" />
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider" style={{ fontFamily: 'system-ui' }}>
                    Análisis Inteligente — IA
                  </h2>
                </div>
                {aiAnalysis && !aiLoading && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full hidden sm:inline ${provider === 'groq' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`} style={{ fontFamily: 'system-ui' }}>
                    {provider === 'groq' ? '⚡ Groq · Llama 3.3 70B · Gratis' : '✦ Claude Haiku · ~$0.004'}
                  </span>
                )}
              </div>

              {aiLoading && (
                <div className="bg-violet-50 rounded-xl p-5 flex items-center gap-4" style={{ border: '1px solid #ddd6fe' }}>
                  <Sparkles className="h-5 w-5 text-violet-500 animate-pulse flex-shrink-0" />
                  <div style={{ fontFamily: 'system-ui' }}>
                    <p className="text-sm font-medium text-violet-900">Generando análisis de negocio…</p>
                    <p className="text-xs text-violet-600 mt-0.5">Procesando los datos del período</p>
                  </div>
                </div>
              )}

              {aiError && (
                <div className="bg-red-50 rounded-xl p-4 flex items-start gap-3" style={{ border: '1px solid #fecaca' }}>
                  <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700" style={{ fontFamily: 'system-ui' }}>{aiError}</p>
                </div>
              )}

              {aiAnalysis && !aiLoading && (
                <div className="space-y-4">
                  {aiSections.length > 0 ? (
                    /* 1 col on mobile, 2 on md+ */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {aiSections.map((section, i) => (
                        <div key={i} className="bg-white rounded-xl p-4" style={{ border: '1px solid #e2e8f0' }}>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-1.5 h-5 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-600" style={{ fontFamily: 'system-ui' }}>
                              {section.title}
                            </h3>
                          </div>
                          <div className="text-sm text-slate-700 leading-relaxed" style={{ fontFamily: 'system-ui, sans-serif' }}>
                            {section.body.split('\n').map((line, j) => {
                              const trimmed = line.trim();
                              if (!trimmed) return null;
                              if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
                                return (
                                  <div key={j} className="flex gap-2 py-0.5">
                                    <span className="text-blue-600 font-bold flex-shrink-0">•</span>
                                    <span>{trimmed.replace(/^[•\-]\s*/, '')}</span>
                                  </div>
                                );
                              }
                              return <p key={j} className="mb-1">{trimmed}</p>;
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-violet-50/50 rounded-xl p-5" style={{ border: '1px solid #ede9fe' }}>
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap" style={{ fontFamily: 'system-ui, sans-serif' }}>
                        {aiAnalysis}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {!aiAnalysis && !aiLoading && !aiError && (
                <div className="bg-slate-50 rounded-xl p-5 flex items-center gap-4 cursor-pointer hover:bg-violet-50 transition-colors"
                  style={{ border: '1px dashed #c7d2fe' }} onClick={generateAiAnalysis}>
                  <Sparkles className="h-5 w-5 text-violet-400 flex-shrink-0" />
                  <div style={{ fontFamily: 'system-ui' }}>
                    <p className="text-sm font-medium text-slate-700">Generar análisis con IA</p>
                    <p className="text-xs text-slate-400 mt-0.5">Insights accionables basados en los datos del período</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 ml-auto flex-shrink-0" />
                </div>
              )}
            </section>
          )}

          {/* ── TENDENCIA DE VENTAS ── */}
          <section>
            <SectionTitle icon={TrendingUp}>Tendencia de Ventas — Ingresos UYU Diarios</SectionTitle>
            <div className="bg-white rounded-xl p-4" style={{ border: '1px solid #e2e8f0' }}>
              {bestDay && (
                <div className="flex items-center gap-2 mb-3 text-xs px-3 py-1.5 rounded-lg w-fit" style={{ background: '#eff6ff', fontFamily: 'system-ui' }}>
                  <ArrowUpRight className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
                  <span className="text-blue-700">
                    <strong>Mejor día:</strong> {fmtDate(bestDay.date)} — {fmt(bestDay.revenueUYU)} en {bestDay.orders} pedidos
                  </span>
                </div>
              )}
              {chartsReady ? (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={dailyChartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradUYU" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fontFamily: 'system-ui' }} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fontFamily: 'system-ui' }} tickLine={false} axisLine={false} tickFormatter={fmtCompact} />
                    <Tooltip formatter={(v: number | undefined) => [fmt(v ?? 0), 'Ingresos UYU']} contentStyle={{ fontSize: 12, fontFamily: 'system-ui', borderRadius: 8 }} />
                    <Area type="monotone" dataKey="UYU" stroke="#2563eb" strokeWidth={2} fill="url(#gradUYU)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : <ChartPlaceholder height={200} />}
            </div>
          </section>

          {/* ── DISTRIBUCIÓN POR MONEDA ── */}
          <section>
            <SectionTitle icon={DollarSign}>Distribución por Moneda (UYU vs USD)</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-xl p-6" style={{ border: '1px solid #e2e8f0' }}>
              <div>
                <div className="h-64">
                  {!chartsReady ? <ChartPlaceholder height={256} /> : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={currencyData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {currencyData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number | undefined, name: string, props: any) => {
                            const item = props.payload;
                            const v = value ?? 0;
                            if (item.name === 'USD') {
                              return [`${fmtUSD(item.originalValue)} (${fmt(v)})`, 'Ingresos'];
                            }
                            return [fmt(v), 'Ingresos'];
                          }}
                          contentStyle={{ fontSize: 11, fontFamily: 'system-ui', borderRadius: 8 }}
                        />
                        <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'system-ui' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                {currencyData.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="text-sm font-bold text-slate-700">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">
                        {item.name === 'USD' ? fmtUSD(item.originalValue || 0) : fmt(item.value)}
                      </p>
                      <p className="text-xs text-slate-500">{item.orders} pedidos</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── RENDIMIENTO POR DÍA DE SEMANA ── */}
          {dayOfWeekData.some(d => d.avgRevenue > 0) && (
            <section>
              <SectionTitle icon={Calendar}>Rendimiento por Día de la Semana</SectionTitle>
              <div className="bg-white rounded-xl p-4" style={{ border: '1px solid #e2e8f0' }}>
                {chartsReady ? (
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={dayOfWeekData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: 'system-ui' }} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fontFamily: 'system-ui' }} tickLine={false} axisLine={false} tickFormatter={fmtCompact} />
                      <Tooltip formatter={(v: number | undefined, name: string) => [name === 'avgRevenue' ? fmt(v ?? 0) : (v ?? 0), name === 'avgRevenue' ? 'Ingreso promedio' : 'Pedidos']}
                        contentStyle={{ fontSize: 11, fontFamily: 'system-ui', borderRadius: 8 }} />
                      <Bar dataKey="avgRevenue" radius={[4, 4, 0, 0]} name="avgRevenue">
                        {dayOfWeekData.map((entry, i) => {
                          const max = Math.max(...dayOfWeekData.map(d => d.avgRevenue));
                          return <Cell key={i} fill={entry.avgRevenue === max ? '#1e3a8a' : '#93c5fd'} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : <ChartPlaceholder height={160} />}
              </div>
            </section>
          )}

          {/* ── PAGE BREAK ── */}
          <div className="print-break" />

          {/* ── TOP PRODUCTOS ── */}
          <section>
            <SectionTitle icon={Package}>Top Productos</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4" style={{ border: '1px solid #e2e8f0' }}>
                <p className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wide" style={{ fontFamily: 'system-ui' }}>
                  Unidades Vendidas (Top 6)
                </p>
                {chartsReady ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={topProductsChart} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 10, fontFamily: 'system-ui' }} tickLine={false} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fontFamily: 'system-ui' }} tickLine={false} width={105} />
                      <Tooltip contentStyle={{ fontSize: 11, fontFamily: 'system-ui', borderRadius: 8 }} />
                      <Bar dataKey="vendidos" fill="#2563eb" radius={[0, 4, 4, 0]} name="Vendidos" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <ChartPlaceholder height={200} />}
              </div>

              {/* Table with scroll wrapper */}
              <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #e2e8f0' }}>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs min-w-[280px]" style={{ fontFamily: 'system-ui' }}>
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wide">
                        <th className="text-left px-3 py-2.5 font-semibold">Producto</th>
                        <th className="text-right px-3 py-2.5 font-semibold">Uds.</th>
                        <th className="text-right px-3 py-2.5 font-semibold">Ingresos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.topProducts.slice(0, 10).map((p, i) => (
                        <tr key={p.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                          <td className="px-3 py-2 text-slate-700">
                            <span className="font-semibold text-slate-300 mr-1.5">{i + 1}.</span>
                            {p.name.length > 26 ? p.name.slice(0, 24) + '…' : p.name}
                          </td>
                          <td className="px-3 py-2 text-right text-slate-600 font-medium">{p.sold}</td>
                          <td className="px-3 py-2 text-right text-slate-900 font-semibold whitespace-nowrap">{fmt(p.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          {/* ── DISTRIBUCIÓN GEOGRÁFICA ── */}
          {deptData.length > 0 && (
            <section>
              <SectionTitle icon={Globe}>Distribución Geográfica (Departamentos)</SectionTitle>
              <div className="bg-white rounded-xl p-4" style={{ border: '1px solid #e2e8f0' }}>
                {chartsReady ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={deptData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fontFamily: 'system-ui' }} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fontFamily: 'system-ui' }} tickLine={false} axisLine={false} tickFormatter={fmtCompact} />
                      <Tooltip formatter={(v: number | undefined, name: string) => [name === 'revenue' ? fmt(v ?? 0) : String(v ?? 0), name === 'revenue' ? 'Ingresos UYU' : 'Pedidos']}
                        contentStyle={{ fontSize: 11, fontFamily: 'system-ui', borderRadius: 8 }} />
                      <Bar dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} name="revenue" />
                      <Bar dataKey="orders" fill="#bfdbfe" radius={[4, 4, 0, 0]} name="orders" />
                      <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'system-ui' }} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <ChartPlaceholder height={200} />}
              </div>
            </section>
          )}

          {/* ── EMBUDO DE CONVERSIÓN ── */}
          <section>
            <SectionTitle icon={Target}>Embudo de Pedidos</SectionTitle>
            {/* 1 col on mobile, 3 on sm+ */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {funnelData.map((step) => {
                const maxCount = funnelData[0]?.count || 1;
                const barPct = Math.round((step.count / maxCount) * 100);
                return (
                  <div key={step.label} className="bg-white rounded-xl p-4 relative overflow-hidden" style={{ border: '1px solid #e2e8f0' }}>
                    <div className="absolute bottom-0 left-0 right-0 rounded-b-xl" style={{ height: `${barPct}%`, backgroundColor: `${step.color}10` }} />
                    <div className="relative">
                      <p className="text-xs text-slate-500 mb-1" style={{ fontFamily: 'system-ui' }}>{step.label}</p>
                      <p className="text-3xl font-bold mb-1" style={{ color: step.color, fontFamily: 'system-ui' }}>{step.count}</p>
                      <div className="text-xs font-semibold px-2 py-0.5 rounded-full w-fit" style={{ backgroundColor: `${step.color}15`, color: step.color, fontFamily: 'system-ui' }}>
                        {step.pct}% del total
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── MEDIOS DE PAGO ── */}
          {paymentData.length > 0 && (
            <section>
              <SectionTitle icon={DollarSign}>Medios de Pago</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-4" style={{ border: '1px solid #e2e8f0' }}>
                  {chartsReady ? (
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie data={paymentData} dataKey="revenue" nameKey="name" cx="50%" cy="50%"
                          outerRadius={70} innerRadius={30}
                          label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}>
                          {paymentData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(v: number | undefined) => [fmt(v ?? 0), 'Ingresos']} contentStyle={{ fontSize: 11, fontFamily: 'system-ui' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : <ChartPlaceholder height={160} />}
                </div>
                <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #e2e8f0' }}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs min-w-[240px]" style={{ fontFamily: 'system-ui' }}>
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wide">
                          <th className="text-left px-3 py-2.5 font-semibold">Método</th>
                          <th className="text-right px-3 py-2.5 font-semibold">Pedidos</th>
                          <th className="text-right px-3 py-2.5 font-semibold">Ingresos</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paymentData.map((pm, i) => (
                          <tr key={pm.name} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                            <td className="px-3 py-2 text-slate-700 flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                              {pm.name}
                            </td>
                            <td className="px-3 py-2 text-right text-slate-600">{pm.count}</td>
                            <td className="px-3 py-2 text-right text-slate-900 font-semibold whitespace-nowrap">{fmt(pm.revenue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ── INVENTARIO CRÍTICO ── */}
          {data.inventoryHealth.length > 0 && (
            <section>
              <SectionTitle icon={AlertTriangle}>Alertas de Inventario</SectionTitle>
              <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #e2e8f0' }}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-3 bg-amber-50" style={{ borderBottom: '1px solid #fde68a' }}>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                    <span className="text-sm font-semibold text-amber-800" style={{ fontFamily: 'system-ui' }}>
                      {data.inventoryHealth.length} productos con stock crítico
                    </span>
                  </div>
                  <div className="flex gap-3 text-xs" style={{ fontFamily: 'system-ui' }}>
                    {[{ color: 'bg-red-500', label: '≤7 días' }, { color: 'bg-amber-500', label: '≤14 días' }, { color: 'bg-blue-500', label: '>14 días' }].map(({ color, label }) => (
                      <span key={label} className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${color} inline-block`} />
                        <span className="text-slate-500">{label}</span>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs min-w-[360px]" style={{ fontFamily: 'system-ui' }}>
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wide">
                        <th className="text-left px-4 py-2.5 font-semibold">Producto</th>
                        <th className="text-left px-4 py-2.5 font-semibold">SKU</th>
                        <th className="text-right px-4 py-2.5 font-semibold">Stock</th>
                        <th className="text-right px-4 py-2.5 font-semibold">Días</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.inventoryHealth.map((p, i) => {
                        const urgency = p.daysRemaining <= 7 ? 'text-red-600' : p.daysRemaining <= 14 ? 'text-amber-600' : 'text-blue-600';
                        return (
                          <tr key={p.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                            <td className="px-4 py-2 text-slate-700 max-w-[160px] truncate">{p.name}</td>
                            <td className="px-4 py-2 text-slate-400">{p.sku}</td>
                            <td className="px-4 py-2 text-right text-slate-700 font-medium">{p.stock}</td>
                            <td className={`px-4 py-2 text-right font-bold ${urgency}`}>
                              {p.daysRemaining >= 999 ? '∞' : `${p.daysRemaining}d`}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* ── ESTADO DE PEDIDOS ── */}
          <section>
            <SectionTitle icon={ShoppingCart}>Estado de Pedidos (Período)</SectionTitle>
            {/* 2 cols on mobile, 4 on sm+ */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(data.statusDistribution)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 8)
                .map(([status, count]) => {
                  const total = Object.values(data.statusDistribution).reduce((s, v) => s + v, 0);
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  const color = STATUS_COLORS[status] || '#64748b';
                  return (
                    <div key={status} className="bg-white rounded-xl p-3 text-center relative overflow-hidden" style={{ border: '1px solid #e2e8f0', fontFamily: 'system-ui' }}>
                      <div className="absolute bottom-0 left-0 right-0" style={{ height: `${pct}%`, backgroundColor: `${color}10` }} />
                      <p className="text-2xl font-bold relative" style={{ color }}>{count}</p>
                      <p className="text-xs text-slate-500 mt-0.5 relative">{STATUS_LABELS[status] || status}</p>
                      <p className="text-xs text-slate-400 relative">{pct}%</p>
                    </div>
                  );
                })}
            </div>
          </section>

          {/* ── FOOTER ── */}
          <div className="pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs text-slate-400"
            style={{ borderTop: '1px solid #e2e8f0', fontFamily: 'system-ui, sans-serif' }}>
            <span>La Aldea — Reporte confidencial · {periodLabel[period] || period}</span>
            <span>Generado el {generatedAt}</span>
          </div>

        </div>
      )}
    </>
  );
}