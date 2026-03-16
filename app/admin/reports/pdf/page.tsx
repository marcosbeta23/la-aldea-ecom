// app/admin/reports/pdf/page.tsx
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  Printer, ArrowLeft, RefreshCw, TrendingUp, TrendingDown,
  Minus, ShoppingCart, Users, DollarSign, Globe, Store,
  Package, AlertTriangle, Calendar, Sparkles, Zap, Target,
  ArrowUpRight, ChevronRight, BarChart2, Cpu, Lock
} from 'lucide-react';

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
    mostradorRevenueUYU: number;
    onlineOrders: number;
    mostradorOrders: number;
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
    mostradorRevenue: number;
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
  pending: 'Pendiente',
  paid: 'Pagado',
  paid_pending_verification: 'Por verificar',
  processing: 'Preparando',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
  invoiced: 'Facturado',
  ready_to_invoice: 'Por facturar',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({
  label, value, sub, change, icon: Icon, color, wide,
}: {
  label: string;
  value: string;
  sub?: string;
  change?: number;
  icon: React.ElementType;
  color: string;
  wide?: boolean;
}) {
  const trend =
    change === undefined ? null : change > 0 ? 'up' : change < 0 ? 'down' : 'flat';
  return (
    <div
      className={`rounded-xl border p-4 bg-white flex flex-col gap-1${wide ? ' col-span-2' : ''}`}
      style={{ borderColor: '#e2e8f0' }}
    >
      <div className="flex items-start justify-between">
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}18` }}>
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
        {trend !== null && (
          <span
            className={`text-xs font-semibold flex items-center gap-0.5 ${
              trend === 'up'
                ? 'text-green-600'
                : trend === 'down'
                ? 'text-red-500'
                : 'text-slate-400'
            }`}
          >
            {trend === 'up' ? (
              <TrendingUp className="h-3 w-3" />
            ) : trend === 'down' ? (
              <TrendingDown className="h-3 w-3" />
            ) : (
              <Minus className="h-3 w-3" />
            )}
            {change !== undefined
              ? `${change > 0 ? '+' : ''}${change}%`
              : ''}
          </span>
        )}
      </div>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
      <p className="text-xl font-bold text-slate-900 leading-tight">{value}</p>
      {sub && <p className="text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

function SectionTitle({ children, icon: Icon }: { children: React.ReactNode; icon?: React.ElementType }) {
  return (
    <div
      className="flex items-center gap-2 mb-4 pb-2"
      style={{ borderBottom: '2px solid #1e3a8a' }}
    >
      {Icon && <Icon className="h-4 w-4 text-blue-800" />}
      <h2
        className="text-sm font-bold text-slate-900 uppercase tracking-wider"
        style={{ fontFamily: 'system-ui, sans-serif' }}
      >
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

  // AI insights state
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [provider, setProvider] = useState<'groq' | 'claude'>('groq');
  const [providerStatus, setProviderStatus] = useState<{
    claude: boolean;
    groq: boolean;
  } | null>(null);

  // ── Fetch provider status ──────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/admin/reports/insights')
      .then((r) => r.json())
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
      setAiError('No se pudo generar el análisis IA. Verifique la configuración de la API.');
    } finally {
      setAiLoading(false);
    }
  };

  const handlePrint = () => window.print();

  // ── Derived Metrics ──────────────────────────────────────────────────────
  const dailyAvgRevenue = useMemo(() => {
    if (!data || data.dailySales.length === 0) return 0;
    return Math.round(data.dailySales.reduce((s, d) => s + d.revenueUYU, 0) / data.dailySales.length);
  }, [data]);

  const bestDay = useMemo(() => {
    if (!data || data.dailySales.length === 0) return null;
    return data.dailySales.reduce((best, d) => d.revenueUYU > best.revenueUYU ? d : best);
  }, [data]);

  const revenueVelocity = useMemo(() => {
    if (!data || data.dailySales.length < 6) return null;
    const half = Math.floor(data.dailySales.length / 2);
    const first = data.dailySales.slice(0, half);
    const second = data.dailySales.slice(half);
    const avgFirst = first.reduce((s, d) => s + d.revenueUYU, 0) / first.length;
    const avgSecond = second.reduce((s, d) => s + d.revenueUYU, 0) / second.length;
    return { change: avgFirst > 0 ? Math.round(((avgSecond - avgFirst) / avgFirst) * 100) : 0, avgFirst, avgSecond };
  }, [data]);

  const aiSections = useMemo(() => {
    if (!aiAnalysis) return [];
    return aiAnalysis
      .split(/\*\*(.+?)\*\*/)
      .reduce<Array<{ title: string; body: string }>>((acc, part, i, arr) => {
        if (i % 2 === 1) {
          acc.push({ title: part.trim(), body: (arr[i+1] || '').trim() });
        }
        return acc;
      }, []);
  }, [aiAnalysis]);

  const dailyChartData = useMemo(() => 
    data?.dailySales.map(d => ({
      date: fmtDate(d.date),
      UYU: d.revenueUYU,
    })) || [], [data]);

  const funnelData = useMemo(() => {
    if (!data) return [];
    return [
      { label: 'Pedidos', count: data.summary.totalOrders, color: '#2563eb', pct: 100 },
      { label: 'Pagados', count: data.summary.paidOrders, color: '#16a34a', pct: data.summary.totalOrders > 0 ? Math.round((data.summary.paidOrders/data.summary.totalOrders)*100) : 0 },
    ];
  }, [data]);

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          @page { size: A4; margin: 10mm; }
        }
      `}</style>

      {/* ── Toolbar ── */}
      <div className="no-print sticky top-0 z-20 bg-white border-b px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/admin/reports')} className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Volver
          </button>
          <span className="text-slate-200">|</span>
          <h1 className="font-semibold">Reporte Avanzado</h1>
        </div>

        <div className="flex items-center gap-2">
          <select value={period} onChange={(e) => setPeriod(e.target.value)} className="text-sm border rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-300">
            <option value="week">Semanas</option>
            <option value="month">Mes</option>
            <option value="semester">Semestre</option>
            <option value="year">Año</option>
          </select>

          <div className="flex items-center gap-1 border rounded-lg bg-slate-50 overflow-hidden">
             <button onClick={() => setProvider('groq')} disabled={providerStatus?.groq === false} className={`text-xs px-2 py-1.5 ${provider === 'groq' ? 'bg-green-600 text-white' : 'text-slate-500'}`}>
                Groq {providerStatus?.groq ? '✓' : '✗'}
             </button>
             <button onClick={() => setProvider('claude')} disabled={providerStatus?.claude === false} className={`text-xs px-2 py-1.5 ${provider === 'claude' ? 'bg-blue-700 text-white' : 'text-slate-500'}`}>
                Claude {providerStatus?.claude ? '✓' : '✗'}
             </button>
             <button onClick={generateAiAnalysis} disabled={aiLoading || !data || (providerStatus !== null && !providerStatus.groq && !providerStatus.claude)} 
                className="bg-violet-600 text-white text-sm px-3 py-1.5 hover:bg-violet-700 disabled:bg-slate-300 flex items-center gap-1.5 transition-colors">
                <Sparkles className={`h-4 w-4 ${aiLoading ? 'animate-pulse' : ''}`} />
                {aiLoading ? 'Analizando...' : 'Análisis IA'}
             </button>
          </div>

          <button onClick={handlePrint} disabled={!data} className="bg-blue-700 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-blue-800 disabled:bg-slate-300 flex items-center gap-1.5">
            <Printer className="h-4 w-4" /> Imprimir
          </button>
        </div>
      </div>

      {loading && <div className="no-print h-96 flex items-center justify-center"><RefreshCw className="h-8 w-8 animate-spin text-blue-600" /></div>}

      {data && !loading && (
        <div className="max-w-4xl mx-auto py-10 px-8 space-y-10 bg-white min-h-screen shadow-lg print:shadow-none">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-blue-900 pb-6">
            <div>
              <div className="bg-blue-900 text-white px-3 py-1 rounded font-bold inline-block mb-3">LA ALDEA</div>
              <h1 className="text-4xl font-extrabold text-slate-900">Reporte Ejecutivo</h1>
              <p className="text-slate-500 font-medium uppercase tracking-widest text-xs mt-1">{periodLabel[period]}</p>
            </div>
            <div className="text-right text-xs text-slate-400 space-y-1">
              <p>Generado: {generatedAt}</p>
              <p>Tipo de cambio: {fmt(data.exchangeRate)}</p>
            </div>
          </div>

          {/* KPIs */}
          <section>
            <SectionTitle icon={Target}>Métricas Clave</SectionTitle>
            <div className="grid grid-cols-4 gap-4">
               <KpiCard label="Ingresos Totales" value={fmt(data.summary.combinedRevenueUYU)} change={data.previousPeriod.revenueChangeUYU} icon={DollarSign} color="#16a34a" />
               <KpiCard label="Pedidos Pagados" value={String(data.summary.paidOrders)} change={data.previousPeriod.ordersChange} icon={ShoppingCart} color="#2563eb" />
               <KpiCard label="Ticket Promedio" value={fmt(data.summary.avgOrderValueUYU)} change={data.previousPeriod.aovChange} icon={Zap} color="#d97706" />
               <KpiCard label="Conversión" value={`${data.summary.conversionRate}%`} icon={TrendingUp} color="#9333ea" />
            </div>
          </section>

          {/* AI Analysis */}
          {(aiAnalysis || aiLoading) && (
            <section className="bg-slate-50 rounded-2xl p-6 border-2 border-violet-100">
               <div className="flex items-center justify-between mb-4 border-b-2 border-blue-900 pb-2">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-800" />
                    <h2 className="text-sm font-bold uppercase tracking-wider">Análisis Inteligente — IA</h2>
                </div>
                {aiAnalysis && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${provider === 'groq' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {provider === 'groq' ? '⚡ Groq · Llama 3.3' : '✦ Claude Sonnet'}
                  </span>
                )}
               </div>
               
               {aiLoading ? <div className="flex items-center gap-3 text-violet-600 animate-pulse"><Sparkles className="h-5 w-5" /> Generando insights estratégicos...</div> : (
                 <div className="grid grid-cols-2 gap-6">
                    {aiSections.map((s, i) => (
                      <div key={i} className="bg-white p-4 rounded-xl border">
                        <h3 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1.5">
                            <div className="w-1.5 h-3 bg-blue-600 rounded-full" /> {s.title}
                        </h3>
                        <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{s.body}</div>
                      </div>
                    ))}
                 </div>
               )}
            </section>
          )}

          {/* Trend Chart */}
          <section>
            <SectionTitle icon={BarChart2}>Tendencia del Período</SectionTitle>
            <div className="h-72 w-full bg-white border rounded-xl p-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyChartData}>
                  <defs>
                    <linearGradient id="colorUyu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false} tickFormatter={fmtCompact} />
                  <Tooltip labelStyle={{fontSize: 12}} contentStyle={{borderRadius: 12}} />
                  <Area type="monotone" dataKey="UYU" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorUyu)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {bestDay && (
              <div className="mt-4 bg-blue-50 p-3 rounded-lg flex items-center gap-3 text-blue-800 text-sm font-medium">
                <ArrowUpRight className="h-4 w-4" /> Mejor día: {fmtDate(bestDay.date)} con {fmt(bestDay.revenueUYU)}
              </div>
            )}
          </section>

          {/* Bottom Grid */}
          <div className="grid grid-cols-2 gap-8">
              <section>
                <SectionTitle icon={Users}>Embudo de Operaciones</SectionTitle>
                <div className="space-y-4">
                  {funnelData.map((f, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold uppercase">
                        <span>{f.label}</span>
                        <span>{f.count} ({f.pct}%)</span>
                      </div>
                      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full transition-all duration-1000" style={{ width: `${f.pct}%`, backgroundColor: f.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <SectionTitle icon={Package}>Top Productos (Ingresos)</SectionTitle>
                <div className="space-y-2">
                  {data.topProducts.slice(0, 5).map((p, i) => (
                    <div key={i} className="flex items-center justify-between text-sm py-1 border-b">
                      <span className="truncate max-w-[200px]">{p.name}</span>
                      <span className="font-bold">{fmt(p.revenue)}</span>
                    </div>
                  ))}
                </div>
              </section>
          </div>
        </div>
      )}
    </>
  );
}
