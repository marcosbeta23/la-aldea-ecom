'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Printer, ArrowLeft, RefreshCw, TrendingUp, TrendingDown,
  Minus, ShoppingCart, Users, DollarSign, Globe,
  Package, AlertTriangle, Calendar, Sparkles, Zap, Target,
  ArrowUpRight, ChevronRight, BarChart2, Tag, UserCheck, Truck,
} from 'lucide-react';

const ChartPlaceholder = ({ height = 200 }: { height?: number }) => (
  <div className="animate-pulse bg-slate-100 rounded-lg w-full" style={{ height }} />
);

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface DatosAnalytics {
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
const fmtFecha = (d: string) =>
  new Date(d + 'T12:00:00').toLocaleDateString('es-UY', { day: '2-digit', month: 'short' });
const fmtCompacto = (v: number) =>
  v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M`
    : v >= 1000 ? `$${(v / 1000).toFixed(0)}k`
      : `$${v}`;

const PERIODO_LABEL: Record<string, string> = {
  week: 'Última semana',
  month: 'Último mes',
  semester: 'Último semestre',
  year: 'Último año',
};

const COLORES = ['#2563eb', '#16a34a', '#d97706', '#9333ea', '#dc2626', '#0891b2'];
const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const ESTADO_LABELS: Record<string, string> = {
  pending: 'Pendiente', paid: 'Pagado', paid_pending_verification: 'Por verificar',
  processing: 'Preparando', shipped: 'Enviado', delivered: 'Entregado',
  cancelled: 'Cancelado', refunded: 'Reembolsado', invoiced: 'Facturado',
  ready_to_invoice: 'Por facturar',
};

const ESTADO_COLORES: Record<string, string> = {
  paid: '#16a34a', processing: '#2563eb', shipped: '#9333ea',
  delivered: '#059669', pending: '#d97706', cancelled: '#dc2626',
  refunded: '#6b7280', invoiced: '#0891b2', ready_to_invoice: '#0891b2',
  paid_pending_verification: '#f59e0b',
};

type MonedaDataPoint = {
  name: 'UYU' | 'USD';
  value: number;
  pedidos: number;
  valorOriginal?: number;
};

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function TarjetaKpi({ label, value, sub, change, icon: Icono, color }: {
  label: string; value: string; sub?: string; change?: number;
  icon: React.ElementType; color: string;
}) {
  const tendencia = change === undefined ? null : change > 0 ? 'sube' : change < 0 ? 'baja' : 'igual';
  return (
    <div className="rounded-xl border border-slate-200 p-4 bg-white flex flex-col gap-1 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}18` }}>
          <Icono className="h-4 w-4" style={{ color }} />
        </div>
        {tendencia !== null && (
          <span className={`text-xs font-semibold flex items-center gap-0.5 ${tendencia === 'sube' ? 'text-green-600' : tendencia === 'baja' ? 'text-red-500' : 'text-slate-400'
            }`}>
            {tendencia === 'sube' ? <TrendingUp className="h-3 w-3" /> :
              tendencia === 'baja' ? <TrendingDown className="h-3 w-3" /> :
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

function TituloSeccion({ children, icon: Icono }: { children: React.ReactNode; icon?: React.ElementType }) {
  return (
    <div className="flex items-center gap-2 mb-4 pb-2" style={{ borderBottom: '2px solid #1e3a8a' }}>
      {Icono && <Icono className="h-4 w-4 text-blue-800 flex-shrink-0" />}
      <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider" style={{ fontFamily: 'system-ui, sans-serif' }}>
        {children}
      </h2>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function ReporteAnalisisPage() {
  const router = useRouter();
  const [periodo, setPeriodo] = useState('month');
  const [data, setData] = useState<DatosAnalytics | null>(null);
  const [cargando, setCargando] = useState(false);
  const [generadoEn, setGeneradoEn] = useState('');
  const [rechartsLib, setRechartsLib] = useState<typeof import('recharts') | null>(null);

  const {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
  } = rechartsLib ?? ({} as typeof import('recharts'));
  const graficosListos = !!rechartsLib;

  const [analisisIA, setAnalisisIA] = useState('');
  const [cargandoIA, setCargandoIA] = useState(false);
  const [errorIA, setErrorIA] = useState('');
  const [proveedor, setProveedor] = useState<'groq' | 'claude'>('groq');
  const [estadoProveedor, setEstadoProveedor] = useState<{ claude: boolean; groq: boolean } | null>(null);

  useEffect(() => {
    import('recharts').then(setRechartsLib).catch(() => { });
  }, []);

  useEffect(() => {
    fetch('/api/admin/reports/insights')
      .then(r => r.json())
      .then(setEstadoProveedor)
      .catch(() => setEstadoProveedor({ claude: false, groq: false }));
  }, []);

  const cargarDatos = useCallback(async (p: string) => {
    setCargando(true);
    setAnalisisIA('');
    setErrorIA('');
    try {
      const res = await fetch(`/api/admin/analytics?period=${p}`);
      const json = await res.json();
      setData(json);
      setGeneradoEn(new Date().toLocaleString('es-UY'));
    } catch {
      alert('Error al cargar los datos');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargarDatos(periodo); }, [periodo, cargarDatos]);

  const generarAnalisisIA = async () => {
    if (!data) return;
    setCargandoIA(true);
    setErrorIA('');
    setAnalisisIA('');
    try {
      const res = await fetch('/api/admin/reports/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analyticsData: data, period: periodo, provider: proveedor }),
      });
      if (!res.ok) throw new Error('Error en la respuesta');
      const json = await res.json();
      setAnalisisIA(json.analysis || '');
    } catch {
      setErrorIA('No se pudo generar el análisis. Verificá la configuración de la API.');
    } finally {
      setCargandoIA(false);
    }
  };

  const imprimir = () => window.print();

  // ── Datos derivados ───────────────────────────────────────────────────────

  const dataDiaSemana = useMemo(() => {
    if (!data) return [];
    const totales = Array(7).fill(null).map(() => ({ pedidos: 0, ingresos: 0, dias: 0 }));
    data.dailySales.forEach(d => {
      const idx = new Date(d.date + 'T12:00:00').getDay();
      totales[idx].pedidos += d.orders;
      totales[idx].ingresos += d.revenueUYU;
      totales[idx].dias += 1;
    });
    return DIAS.map((name, i) => ({
      name,
      promedioIngresos: totales[i].dias > 0 ? Math.round(totales[i].ingresos / totales[i].dias) : 0,
      promedioPedidos: totales[i].dias > 0 ? +(totales[i].pedidos / totales[i].dias).toFixed(1) : 0,
    }));
  }, [data]);

  const velocidadIngresos = useMemo(() => {
    if (!data || data.dailySales.length < 6) return null;
    const mitad = Math.floor(data.dailySales.length / 2);
    const primera = data.dailySales.slice(0, mitad);
    const segunda = data.dailySales.slice(mitad);
    const promPrimera = primera.reduce((s, d) => s + d.revenueUYU, 0) / primera.length;
    const promSegunda = segunda.reduce((s, d) => s + d.revenueUYU, 0) / segunda.length;
    const cambio = promPrimera > 0 ? Math.round(((promSegunda - promPrimera) / promPrimera) * 100) : 0;
    return { promPrimera: Math.round(promPrimera), promSegunda: Math.round(promSegunda), cambio };
  }, [data]);

  const dataEmbudo = useMemo(() => {
    if (!data) return [];
    const total = data.summary.totalOrders;
    const pagados = data.summary.paidOrders;
    const entregados = data.statusDistribution['delivered'] || 0;
    return [
      { label: 'Total de pedidos', count: total, color: '#2563eb', pct: 100 },
      { label: 'Pagados', count: pagados, color: '#16a34a', pct: total > 0 ? Math.round((pagados / total) * 100) : 0 },
      { label: 'Entregados', count: entregados, color: '#059669', pct: total > 0 ? Math.round((entregados / total) * 100) : 0 },
    ];
  }, [data]);

  const dataMoneda = useMemo<MonedaDataPoint[]>(() => data ? [
    { name: 'UYU', value: data.summary.totalRevenueUYU, pedidos: data.summary.paidOrdersUYU },
    { name: 'USD', value: data.summary.totalRevenueUSD * data.exchangeRate, pedidos: data.summary.paidOrdersUSD, valorOriginal: data.summary.totalRevenueUSD },
  ] : [], [data]);

  const dataPago = useMemo(() => data
    ? Object.entries(data.paymentMethodDistribution)
      .map(([metodo, v]) => ({ name: metodo, count: v.count, ingresos: v.revenue }))
      .sort((a, b) => b.ingresos - a.ingresos)
    : [], [data]);

  const dataDepartamento = useMemo(() => data
    ? Object.entries(data.departmentDistribution)
      .map(([dept, v]) => ({ name: dept || 'Sin datos', pedidos: v.orders, ingresos: v.revenue }))
      .sort((a, b) => b.ingresos - a.ingresos)
      .slice(0, 8)
    : [], [data]);

  const dataTopProductos = useMemo(() => data?.topProducts.slice(0, 6).map(p => ({
    name: p.name.length > 22 ? p.name.slice(0, 20) + '…' : p.name,
    vendidos: p.sold,
    ingresos: Math.round(p.revenue),
  })) || [], [data]);

  const dataTendencia = useMemo(() => data?.dailySales.map(d => ({
    fecha: fmtFecha(d.date),
    UYU: d.revenueUYU,
    Pedidos: d.orders,
  })) || [], [data]);

  const promedioIngresoDiario = useMemo(() => {
    if (!data || data.dailySales.length === 0) return 0;
    return Math.round(data.dailySales.reduce((s, d) => s + d.revenueUYU, 0) / data.dailySales.length);
  }, [data]);

  const mejorDia = useMemo(() => {
    if (!data || data.dailySales.length === 0) return null;
    return data.dailySales.reduce((mejor, d) => d.revenueUYU > mejor.revenueUYU ? d : mejor);
  }, [data]);

  const seccionesIA = useMemo(() => {
    if (!analisisIA) return [];
    return analisisIA
      .split(/\*\*(.+?)\*\*/)
      .reduce<Array<{ titulo: string; cuerpo: string }>>((acc, parte, i, arr) => {
        if (i % 2 === 1) acc.push({ titulo: parte.trim(), cuerpo: (arr[i + 1] || '').trim() });
        return acc;
      }, []);
  }, [analisisIA]);

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .salto-pagina { page-break-before: always; break-before: page; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          @page { size: A4; margin: 12mm 14mm; }

          /* ── Prevent sections from splitting across pages ── */
          section {
            page-break-inside: avoid;
            break-inside: avoid;
          }

          /* ── Keep entire two-column layout blocks together ── */
          .columnas-dos {
            page-break-inside: avoid;
            break-inside: avoid;
          }

          /* ── Recharts: keep the full chart on one page ── */
          .recharts-wrapper,
          .recharts-responsive-container {
            page-break-inside: avoid;
            break-inside: avoid;
          }

          /* ── KPI grids stay together ── */
          .kpi-grid {
            page-break-inside: avoid;
            break-inside: avoid;
          }

          /* ── Individual cards/boxes never split ── */
          .rounded-xl {
            page-break-inside: avoid;
            break-inside: avoid;
          }

          /* ── Tables: avoid mid-row splits ── */
          table { page-break-inside: avoid; break-inside: avoid; }
          tr    { page-break-inside: avoid; break-inside: avoid; }

          /* ── Portada + velocity banner ── */
          .portada     { page-break-inside: avoid; break-inside: avoid; }
          .velocidad   { page-break-inside: avoid; break-inside: avoid; }

          /* ── AI analysis cards ── */
          .ia-tarjeta  { page-break-inside: avoid; break-inside: avoid; }

          /* ── Widow/orphan control ── */
          p { orphans: 3; widows: 3; }
        }

        @media screen { .solo-impresion { display: none; } }
      `}</style>

      {/* ════════════════════════════════════════════════════
          BARRA DE HERRAMIENTAS
      ════════════════════════════════════════════════════ */}
      <div className="no-print sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
        {/* Fila 1: navegación + imprimir */}
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
          <button
            onClick={imprimir}
            disabled={cargando || !data}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-blue-700 text-white rounded-lg hover:bg-blue-800 disabled:bg-slate-300 font-medium transition-colors flex-shrink-0"
          >
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Imprimir / PDF</span>
          </button>
        </div>

        {/* Fila 2: controles */}
        <div className="flex items-center gap-2 px-4 sm:px-6 pb-2.5 overflow-x-auto scrollbar-none border-t border-slate-100">
          <select
            value={periodo}
            onChange={e => setPeriodo(e.target.value)}
            className="text-xs sm:text-sm border border-slate-200 rounded-lg px-2 sm:px-3 py-1.5 bg-white text-slate-700 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="week">Última semana</option>
            <option value="month">Último mes</option>
            <option value="semester">Último semestre</option>
            <option value="year">Último año</option>
          </select>

          <button
            onClick={() => cargarDatos(periodo)}
            disabled={cargando}
            className="flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3 py-1.5 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors flex-shrink-0"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${cargando ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>

          {/* Selector de proveedor IA */}
          <div className="flex items-center gap-1 border border-slate-200 rounded-lg overflow-hidden flex-shrink-0">
            <div className="flex items-center px-1.5 gap-1 border-r border-slate-200 bg-slate-50">
              <button
                onClick={() => setProveedor('groq')}
                disabled={estadoProveedor?.groq === false}
                title={estadoProveedor?.groq === false ? 'GROQ_API_KEY no configurada' : 'Gratis · Llama 3.3 70B'}
                className={`text-[11px] px-1.5 py-1 rounded transition-colors ${proveedor === 'groq' ? 'bg-green-600 text-white font-semibold'
                    : estadoProveedor?.groq === false ? 'text-slate-300 cursor-not-allowed'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
              >
                Groq{estadoProveedor?.groq ? ' ✓' : ' ✗'}
              </button>
              <button
                onClick={() => setProveedor('claude')}
                disabled={estadoProveedor?.claude === false}
                title={estadoProveedor?.claude === false ? 'ANTHROPIC_API_KEY no configurada' : '~$0.004/análisis · Claude'}
                className={`text-[11px] px-1.5 py-1 rounded transition-colors ${proveedor === 'claude' ? 'bg-blue-700 text-white font-semibold'
                    : estadoProveedor?.claude === false ? 'text-slate-300 cursor-not-allowed'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
              >
                Claude{estadoProveedor?.claude ? ' ✓' : ' ✗'}
              </button>
            </div>
            <button
              onClick={generarAnalisisIA}
              disabled={cargandoIA || cargando || !data || (estadoProveedor !== null && !estadoProveedor.groq && !estadoProveedor.claude)}
              className="flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3 py-1.5 bg-violet-600 text-white hover:bg-violet-700 disabled:bg-slate-300 font-medium transition-colors"
            >
              <Sparkles className={`h-3.5 w-3.5 ${cargandoIA ? 'animate-pulse' : ''}`} />
              <span>{cargandoIA ? 'Analizando…' : 'Análisis IA'}</span>
            </button>
          </div>

          {estadoProveedor && !estadoProveedor.groq && !estadoProveedor.claude && (
            <p className="text-xs text-red-500 flex-shrink-0">
              Configurá GROQ_API_KEY o ANTHROPIC_API_KEY para habilitar el análisis IA
            </p>
          )}
        </div>
      </div>

      {/* Estado de carga */}
      {cargando && (
        <div className="no-print flex items-center justify-center h-64 sm:h-96">
          <div className="text-center space-y-3">
            <RefreshCw className="h-7 w-7 animate-spin text-blue-600 mx-auto" />
            <p className="text-slate-500 text-sm">Cargando datos del período…</p>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          CONTENIDO DEL REPORTE
      ════════════════════════════════════════════════════ */}
      {data && !cargando && (
        <div
          className="report-body max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 sm:space-y-10"
          style={{ fontFamily: 'system-ui, sans-serif', color: '#1e293b' }}
        >

          {/* ── PORTADA ─────────────────────────────────────────────────── */}
          <div className="portada flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-6" style={{ borderBottom: '3px solid #1e3a8a' }}>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-xl bg-blue-800 flex items-center justify-center shadow-md flex-shrink-0">
                  <span className="text-white font-bold text-sm">LA</span>
                </div>
                <span className="text-lg font-bold text-blue-900">La Aldea</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1 tracking-tight">Reporte de Ventas</h1>
              <p className="text-slate-500 text-sm">{PERIODO_LABEL[periodo] || periodo}</p>
            </div>
            <div className="text-left sm:text-right text-xs text-slate-500 space-y-1">
              <div className="flex items-center gap-1.5 sm:justify-end">
                <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                <span>Generado: {generadoEn}</span>
              </div>
              <div>Tipo de cambio: {fmt(data.exchangeRate)} / USD</div>
              <div>Pedidos analizados: {data.summary.totalOrders}</div>
              <div>Días en período: {data.dailySales.length}</div>
            </div>
          </div>

          {/* ── RESUMEN EJECUTIVO ──────────────────────────────────────── */}
          <section>
            <TituloSeccion icon={Target}>Resumen Ejecutivo</TituloSeccion>

            {/* Ingresos */}
            <div className="kpi-grid grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <TarjetaKpi label="Ingresos UYU" value={fmt(data.summary.totalRevenueUYU)}
                sub={`${data.previousPeriod.revenueChangeUYU > 0 ? '+' : ''}${data.previousPeriod.revenueChangeUYU}% vs período anterior`}
                change={data.previousPeriod.revenueChangeUYU} icon={DollarSign} color="#16a34a" />
              <TarjetaKpi label="Ingresos USD" value={fmtUSD(data.summary.totalRevenueUSD)}
                sub={`${data.summary.paidOrdersUSD} pedidos en dólares`}
                change={data.previousPeriod.revenueChangeUSD} icon={Globe} color="#2563eb" />
              <TarjetaKpi label="Ingreso combinado (UYU)" value={fmt(data.summary.combinedRevenueUYU)}
                sub="USD convertido a tipo de cambio BCU" icon={DollarSign} color="#1e3a8a" />
            </div>

            {/* Operaciones */}
            <div className="kpi-grid grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
              <TarjetaKpi label="Pedidos pagados" value={String(data.summary.paidOrders)}
                sub={`${data.previousPeriod.ordersChange > 0 ? '+' : ''}${data.previousPeriod.ordersChange}% vs período anterior`}
                change={data.previousPeriod.ordersChange} icon={ShoppingCart} color="#9333ea" />
              <TarjetaKpi label="Ticket promedio UYU" value={fmt(data.summary.avgOrderValueUYU)}
                sub={`${data.previousPeriod.aovChange > 0 ? '+' : ''}${data.previousPeriod.aovChange}% vs período anterior`}
                change={data.previousPeriod.aovChange} icon={TrendingUp} color="#d97706" />
              <TarjetaKpi label="Promedio diario UYU" value={fmt(promedioIngresoDiario)}
                sub={`En ${data.dailySales.length} días de actividad`} icon={Zap} color="#0891b2" />
              <TarjetaKpi label="Clientes únicos" value={String(data.summary.uniqueCustomers)}
                sub={`${data.summary.conversionRate}% tasa de conversión`} icon={Users} color="#dc2626" />
            </div>

            {/* Métricas avanzadas */}
            <div className="kpi-grid grid grid-cols-2 lg:grid-cols-4 gap-3">
              <TarjetaKpi label="Uso de cupones" value={`${data.summary.couponUsageRate}%`}
                sub={`${data.summary.topCoupons?.[0]?.code || 'N/A'} más usado`} icon={Tag} color="#ec4899" />
              <TarjetaKpi label="Clientes recurrentes" value={String(data.summary.returningCustomers)}
                sub={`${data.summary.newCustomers} clientes nuevos`} icon={UserCheck} color="#8b5cf6" />
              <TarjetaKpi label="Días de fulfillment" value={`${data.summary.avgFulfillmentDays} días`}
                sub="Promedio pago → entrega" icon={Truck} color="#f59e0b" />
              <TarjetaKpi label="Abandono de carrito" value={`${data.summary.cartAbandonmentRate}%`}
                sub="Checkouts no finalizados" icon={ShoppingCart} color="#ef4444" />
            </div>

            {/* Velocidad de ingresos */}
            {velocidadIngresos && (
              <div className="velocidad mt-3 flex items-start gap-3 px-4 py-3 rounded-xl"
                style={{
                  background: velocidadIngresos.cambio >= 0 ? '#f0fdf4' : '#fef2f2',
                  border: `1px solid ${velocidadIngresos.cambio >= 0 ? '#bbf7d0' : '#fecaca'}`,
                }}>
                {velocidadIngresos.cambio >= 0
                  ? <TrendingUp className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  : <TrendingDown className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />}
                <span className="text-sm font-medium" style={{ color: velocidadIngresos.cambio >= 0 ? '#166534' : '#991b1b' }}>
                  Velocidad de ingresos: <strong>{velocidadIngresos.cambio > 0 ? '+' : ''}{velocidadIngresos.cambio}%</strong>{' '}
                  en la segunda mitad del período ({fmt(velocidadIngresos.promPrimera)}/día → {fmt(velocidadIngresos.promSegunda)}/día)
                </span>
              </div>
            )}
          </section>

          {/* ── TENDENCIA DE VENTAS ───────────────────────────────────── */}
          <section>
            <TituloSeccion icon={TrendingUp}>Tendencia de Ventas — Ingresos UYU Diarios</TituloSeccion>
            <div className="bg-white rounded-xl p-4" style={{ border: '1px solid #e2e8f0' }}>
              {mejorDia && (
                <div className="flex items-center gap-2 mb-3 text-xs px-3 py-1.5 rounded-lg w-fit" style={{ background: '#eff6ff' }}>
                  <ArrowUpRight className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
                  <span className="text-blue-700">
                    <strong>Mejor día:</strong> {fmtFecha(mejorDia.date)} — {fmt(mejorDia.revenueUYU)} en {mejorDia.orders} pedidos
                  </span>
                </div>
              )}
              {graficosListos ? (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={dataTendencia} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradUYU" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="fecha" tick={{ fontSize: 10 }} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={fmtCompacto} />
                    <Tooltip formatter={(v: number | undefined) => [fmt(v ?? 0), 'Ingresos UYU']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Area type="monotone" dataKey="UYU" stroke="#2563eb" strokeWidth={2} fill="url(#gradUYU)" dot={false} name="Ingresos UYU" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : <ChartPlaceholder height={220} />}
            </div>
          </section>

          {/* ── ANÁLISIS INTELIGENTE ──────────────────────────────────── */}
          <section>
            <div className="flex items-center justify-between mb-4 pb-2" style={{ borderBottom: '2px solid #7c3aed' }}>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-700 flex-shrink-0" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Análisis Inteligente</h2>
              </div>
              {analisisIA && !cargandoIA && (
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full hidden sm:inline ${proveedor === 'groq' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                  {proveedor === 'groq' ? '⚡ Groq · Llama 3.3 70B' : '✦ Claude · Anthropic'}
                </span>
              )}
            </div>

            {/* CTA — sin análisis aún */}
            {!analisisIA && !cargandoIA && !errorIA && (
              <div
                className="rounded-xl p-6 flex flex-col sm:flex-row items-center gap-4 cursor-pointer hover:bg-violet-50 transition-colors"
                style={{ border: '2px dashed #c4b5fd', background: '#faf5ff' }}
                onClick={generarAnalisisIA}
              >
                <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-6 w-6 text-violet-500" />
                </div>
                <div className="text-center sm:text-left flex-1">
                  <p className="text-base font-semibold text-violet-900">Generar análisis con inteligencia artificial</p>
                  <p className="text-sm text-violet-600 mt-1">
                    Recibí insights ejecutivos sobre el período: fortalezas, oportunidades y próximos pasos basados en los datos.
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-violet-400 flex-shrink-0" />
              </div>
            )}

            {/* Cargando */}
            {cargandoIA && (
              <div className="bg-violet-50 rounded-xl p-6 flex items-center gap-4" style={{ border: '1px solid #ddd6fe' }}>
                <Sparkles className="h-6 w-6 text-violet-500 animate-pulse flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-violet-900">Generando análisis de negocio…</p>
                  <p className="text-xs text-violet-600 mt-0.5">
                    Procesando los datos con {proveedor === 'groq' ? 'Groq · Llama 3.3 70B' : 'Claude · Anthropic'}
                  </p>
                </div>
              </div>
            )}

            {/* Error */}
            {errorIA && (
              <div className="bg-red-50 rounded-xl p-4 flex items-start gap-3" style={{ border: '1px solid #fecaca' }}>
                <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{errorIA}</p>
              </div>
            )}

            {/* Análisis renderizado en tarjetas */}
            {analisisIA && !cargandoIA && (
              <div className="space-y-3">
                {seccionesIA.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {seccionesIA.map((seccion, i) => (
                      <div key={i} className="ia-tarjeta bg-white rounded-xl p-5" style={{ border: '1px solid #e2e8f0' }}>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-1.5 h-5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORES[i % COLORES.length] }} />
                          <h3 className="text-xs font-bold uppercase tracking-wide text-slate-600">{seccion.titulo}</h3>
                        </div>
                        <div className="text-sm text-slate-700 leading-relaxed">
                          {seccion.cuerpo.split('\n').map((linea, j) => {
                            const t = linea.trim();
                            if (!t) return null;
                            if (t.startsWith('•') || t.startsWith('-')) {
                              return (
                                <div key={j} className="flex gap-2 py-0.5">
                                  <span className="text-violet-500 font-bold flex-shrink-0">•</span>
                                  <span>{t.replace(/^[•\-]\s*/, '')}</span>
                                </div>
                              );
                            }
                            return <p key={j} className="mb-1">{t}</p>;
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-violet-50/50 rounded-xl p-5" style={{ border: '1px solid #ede9fe' }}>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{analisisIA}</p>
                  </div>
                )}
                <button
                  onClick={generarAnalisisIA}
                  disabled={cargandoIA}
                  className="text-xs text-slate-400 hover:text-violet-600 transition-colors flex items-center gap-1 mt-1"
                >
                  <RefreshCw className="h-3 w-3" /> Regenerar análisis
                </button>
              </div>
            )}
          </section>

          {/* ── SALTO DE PÁGINA ───────────────────────────────────────── */}
          <div className="salto-pagina" />

          {/* ── EMBUDO + MONEDA ───────────────────────────────────────── */}
          <div className="columnas-dos grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Embudo */}
            <section>
              <TituloSeccion icon={Target}>Embudo de Conversión</TituloSeccion>
              <div className="grid grid-cols-3 gap-2">
                {dataEmbudo.map((paso) => {
                  const pct = Math.round((paso.count / (dataEmbudo[0]?.count || 1)) * 100);
                  return (
                    <div key={paso.label} className="bg-white rounded-xl p-3 relative overflow-hidden text-center" style={{ border: '1px solid #e2e8f0' }}>
                      <div className="absolute bottom-0 left-0 right-0 rounded-b-xl" style={{ height: `${pct}%`, backgroundColor: `${paso.color}12` }} />
                      <p className="text-[11px] text-slate-500 mb-1 relative">{paso.label}</p>
                      <p className="text-2xl font-bold relative" style={{ color: paso.color }}>{paso.count}</p>
                      <div className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full w-fit mx-auto mt-1 relative"
                        style={{ backgroundColor: `${paso.color}15`, color: paso.color }}>
                        {paso.pct}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Moneda */}
            <section>
              <TituloSeccion icon={DollarSign}>Distribución por Moneda</TituloSeccion>
              <div className="bg-white rounded-xl p-4" style={{ border: '1px solid #e2e8f0' }}>
                <div className="grid grid-cols-2 gap-4 items-center">
                  <div>
                    {graficosListos ? (
                      <ResponsiveContainer width="100%" height={140}>
                        <PieChart>
                          <Pie data={dataMoneda} cx="50%" cy="50%" innerRadius={38} outerRadius={58}
                            paddingAngle={4} dataKey="value"
                            label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} ${(((percent ?? 0) * 100).toFixed(0))}%`}
                            labelLine={false}>
                            {dataMoneda.map((_, i) => <Cell key={i} fill={COLORES[i % COLORES.length]} />)}
                          </Pie>
                          <Tooltip
                            formatter={(value: number | undefined, _name: string | undefined, props: { payload?: { name?: string; valorOriginal?: number } }) => {
                              const item = props.payload;
                              const v = value ?? 0;
                              if (item?.name === 'USD') return [`${fmtUSD(item.valorOriginal ?? 0)} (${fmt(v)})`, 'Ingresos'];
                              return [fmt(v), 'Ingresos'];
                            }}
                            contentStyle={{ fontSize: 11, borderRadius: 8 }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : <ChartPlaceholder height={140} />}
                  </div>
                  <div className="space-y-3">
                    {dataMoneda.map((item, i) => (
                      <div key={item.name} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORES[i % COLORES.length] }} />
                          <span className="text-sm font-bold text-slate-700">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-900">
                            {item.name === 'USD' ? fmtUSD(item.valorOriginal ?? 0) : fmt(item.value)}
                          </p>
                          <p className="text-xs text-slate-500">{item.pedidos} pedidos</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* ── DÍA DE SEMANA + MEDIOS DE PAGO ───────────────────────── */}
          <div className="columnas-dos grid grid-cols-1 lg:grid-cols-2 gap-6">
            {dataDiaSemana.some(d => d.promedioIngresos > 0) && (
              <section>
                <TituloSeccion icon={Calendar}>Rendimiento por Día de la Semana</TituloSeccion>
                <div className="bg-white rounded-xl p-4" style={{ border: '1px solid #e2e8f0' }}>
                  {graficosListos ? (
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={dataDiaSemana} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} />
                        <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={fmtCompacto} />
                        <Tooltip formatter={(v: number | undefined, name: string | undefined) => [
                          name === 'promedioIngresos' ? fmt(v ?? 0) : (v ?? 0),
                          name === 'promedioIngresos' ? 'Ingreso promedio' : 'Pedidos'
                        ]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                        <Bar dataKey="promedioIngresos" radius={[4, 4, 0, 0]} name="promedioIngresos">
                          {dataDiaSemana.map((entry, i) => {
                            const max = Math.max(...dataDiaSemana.map(d => d.promedioIngresos));
                            return <Cell key={i} fill={entry.promedioIngresos === max ? '#1e3a8a' : '#93c5fd'} />;
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <ChartPlaceholder height={160} />}
                </div>
              </section>
            )}

            {dataPago.length > 0 && (
              <section>
                <TituloSeccion icon={DollarSign}>Medios de Pago</TituloSeccion>
                <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #e2e8f0' }}>
                  <div className="grid grid-cols-2">
                    <div className="p-3 flex items-center justify-center">
                      {graficosListos ? (
                        <ResponsiveContainer width="100%" height={150}>
                          <PieChart>
                            <Pie data={dataPago} dataKey="ingresos" nameKey="name" cx="50%" cy="50%"
                              outerRadius={65} innerRadius={28}
                              label={({ percent }: { percent?: number }) => `${(((percent ?? 0) * 100).toFixed(0))}%`}
                              labelLine={false}>
                              {dataPago.map((_, i) => <Cell key={i} fill={COLORES[i % COLORES.length]} />)}
                            </Pie>
                            <Tooltip formatter={(v: number | undefined) => [fmt(v ?? 0), 'Ingresos']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : <ChartPlaceholder height={150} />}
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wide">
                            <th className="text-left px-3 py-2.5 font-semibold">Método</th>
                            <th className="text-right px-3 py-2.5 font-semibold">Ingresos</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dataPago.map((pm, i) => (
                            <tr key={pm.name} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                              <td className="px-3 py-2 text-slate-700 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: COLORES[i % COLORES.length] }} />
                                <span className="truncate max-w-[80px]">{pm.name}</span>
                              </td>
                              <td className="px-3 py-2 text-right text-slate-900 font-semibold whitespace-nowrap">{fmt(pm.ingresos)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* ── PRODUCTOS MÁS VENDIDOS ────────────────────────────────── */}
          <section>
            <TituloSeccion icon={Package}>Productos Más Vendidos</TituloSeccion>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4" style={{ border: '1px solid #e2e8f0' }}>
                <p className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wide">
                  Unidades vendidas (Top 6)
                </p>
                {graficosListos ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={dataTopProductos} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} tickLine={false} width={105} />
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                      <Bar dataKey="vendidos" fill="#2563eb" radius={[0, 4, 4, 0]} name="Vendidos" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <ChartPlaceholder height={200} />}
              </div>
              <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #e2e8f0' }}>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs min-w-[280px]">
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

          {/* ── DISTRIBUCIÓN GEOGRÁFICA ───────────────────────────────── */}
          {dataDepartamento.length > 0 && (
            <section>
              <TituloSeccion icon={Globe}>Distribución Geográfica — Departamentos</TituloSeccion>
              <div className="bg-white rounded-xl p-4" style={{ border: '1px solid #e2e8f0' }}>
                {graficosListos ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={dataDepartamento} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} />
                      <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={fmtCompacto} />
                      <Tooltip formatter={(v: number | undefined, name: string | undefined) => [
                        name === 'ingresos' ? fmt(v ?? 0) : String(v ?? 0),
                        name === 'ingresos' ? 'Ingresos UYU' : 'Pedidos'
                      ]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                      <Bar dataKey="ingresos" fill="#2563eb" radius={[4, 4, 0, 0]} name="ingresos" />
                      <Bar dataKey="pedidos" fill="#bfdbfe" radius={[4, 4, 0, 0]} name="pedidos" />
                      <Legend formatter={(v) => v === 'ingresos' ? 'Ingresos' : 'Pedidos'} wrapperStyle={{ fontSize: 11 }} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <ChartPlaceholder height={200} />}
              </div>
            </section>
          )}

          {/* ── ESTADO DE PEDIDOS + INVENTARIO ───────────────────────── */}
          <div className={`columnas-dos grid grid-cols-1 ${data.inventoryHealth.length > 0 ? 'lg:grid-cols-2' : ''} gap-6`}>
            <section>
              <TituloSeccion icon={ShoppingCart}>Estado de Pedidos del Período</TituloSeccion>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.entries(data.statusDistribution)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 8)
                  .map(([estado, cantidad]) => {
                    const total = Object.values(data.statusDistribution).reduce((s, v) => s + v, 0);
                    const pct = total > 0 ? Math.round((cantidad / total) * 100) : 0;
                    const color = ESTADO_COLORES[estado] || '#64748b';
                    return (
                      <div key={estado} className="bg-white rounded-xl p-3 text-center relative overflow-hidden" style={{ border: '1px solid #e2e8f0' }}>
                        <div className="absolute bottom-0 left-0 right-0" style={{ height: `${pct}%`, backgroundColor: `${color}10` }} />
                        <p className="text-2xl font-bold relative" style={{ color }}>{cantidad}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5 relative">{ESTADO_LABELS[estado] || estado}</p>
                        <p className="text-[10px] text-slate-400 relative">{pct}%</p>
                      </div>
                    );
                  })}
              </div>
            </section>

            {data.inventoryHealth.length > 0 && (
              <section>
                <TituloSeccion icon={AlertTriangle}>Alertas de Inventario</TituloSeccion>
                <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #e2e8f0' }}>
                  <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 bg-amber-50" style={{ borderBottom: '1px solid #fde68a' }}>
                    <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                    <span className="text-sm font-semibold text-amber-800">
                      {data.inventoryHealth.length} productos con stock crítico
                    </span>
                    <div className="flex gap-3 text-xs ml-auto">
                      {[{ color: 'bg-red-500', label: '≤7 días' }, { color: 'bg-amber-500', label: '≤14 días' }, { color: 'bg-blue-500', label: '>14 días' }].map(({ color, label }) => (
                        <span key={label} className="flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${color} inline-block`} />
                          <span className="text-slate-500">{label}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wide">
                          <th className="text-left px-4 py-2 font-semibold">Producto</th>
                          <th className="text-right px-4 py-2 font-semibold">Stock</th>
                          <th className="text-right px-4 py-2 font-semibold">Días</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.inventoryHealth.map((p, i) => {
                          const urgencia = p.daysRemaining <= 7 ? 'text-red-600' : p.daysRemaining <= 14 ? 'text-amber-600' : 'text-blue-600';
                          return (
                            <tr key={p.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                              <td className="px-4 py-1.5 text-slate-700 max-w-[140px] truncate">{p.name}</td>
                              <td className="px-4 py-1.5 text-right text-slate-700 font-medium">{p.stock}</td>
                              <td className={`px-4 py-1.5 text-right font-bold ${urgencia}`}>
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
          </div>

          {/* ── PIE DE PÁGINA ─────────────────────────────────────────── */}
          <div className="pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs text-slate-400"
            style={{ borderTop: '1px solid #e2e8f0' }}>
            <span>La Aldea — Reporte confidencial · {PERIODO_LABEL[periodo] || periodo}</span>
            <span>Generado el {generadoEn}</span>
          </div>

        </div>
      )}
    </>
  );
}