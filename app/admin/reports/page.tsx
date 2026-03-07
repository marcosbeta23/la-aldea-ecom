// app/admin/reports/page.tsx
'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
// Lazy-load the heavy data table
const ReportsTable = dynamic(() => import('@/components/admin/ReportsTable'), {
  loading: () => (
    <div className="space-y-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-10 animate-pulse bg-slate-100 rounded" />
      ))}
    </div>
  ),
});
import { Download, FileText, TrendingUp, Users, Package, Eye, Store, Globe, Filter } from 'lucide-react';

interface PreviewData {
  summary?: Record<string, any>;
  orders?: any[];
  products?: any[];
  customers?: any[];
}


export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [reportType, setReportType] = useState('sales');
  const [period, setPeriod] = useState('month');
  const [source, setSource] = useState('');
  const [customDates, setCustomDates] = useState({ start: '', end: '' });
  const [preview, setPreview] = useState<PreviewData | null>(null);

  const buildParams = (format?: string) => {
    const params = new URLSearchParams({ type: reportType, period });
    if (format) params.append('format', format);
    if (source) params.append('source', source);
    if (period === 'custom') {
      params.append('start', customDates.start);
      params.append('end', customDates.end);
    }
    return params;
  };

  const handlePreview = async () => {
    setPreviewLoading(true);
    try {
      const response = await fetch(`/api/admin/reports?${buildParams('json')}`);
      const json = await response.json();
      setPreview(json.data || json);
    } catch {
      alert('Error al cargar preview');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDownload = async (format: 'json' | 'csv') => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/reports?${buildParams(format)}`);

      if (format === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte-${reportType}-${period}${source ? `-${source}` : ''}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte-${reportType}-${period}${source ? `-${source}` : ''}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch {
      alert('Error al descargar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (v: number, currency: string = 'UYU') =>
    currency === 'USD'
      ? `US$ ${v.toLocaleString('es-UY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : `$ ${v.toLocaleString('es-UY', { maximumFractionDigits: 0 })}`;

  const statusLabel = (s: string) => {
    const map: Record<string, string> = {
      pending: 'Pendiente', paid: 'Pagado', paid_pending_verification: 'Por verificar',
      processing: 'Preparando', shipped: 'Enviado', delivered: 'Entregado',
      cancelled: 'Cancelado', refunded: 'Reembolsado', invoiced: 'Facturado',
      ready_to_invoice: 'Por facturar',
    };
    return map[s] || s;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reportes</h1>
        <p className="text-slate-500">Generá y descargá reportes de ventas, productos y clientes</p>
      </div>

      {/* Report Configuration */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-6">Configuración del reporte</h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Report Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tipo de reporte
            </label>
            <div className="space-y-2">
              {[
                { key: 'sales', label: 'Ventas', desc: 'Órdenes, ingresos, moneda', icon: TrendingUp },
                { key: 'products', label: 'Productos', desc: 'Stock e inventario', icon: Package },
                { key: 'customers', label: 'Clientes', desc: 'Base de clientes', icon: Users },
              ].map(({ key, label, desc, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => { setReportType(key); setPreview(null); }}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-colors ${
                    reportType === key
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-medium">{label}</p>
                    <p className="text-xs opacity-70">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Period + Source */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Periodo
              </label>
              <select
                value={period}
                onChange={(e) => { setPeriod(e.target.value); setPreview(null); }}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="week">Ultima semana</option>
                <option value="month">Ultimo mes</option>
                <option value="year">Ultimo año</option>
                <option value="custom">Personalizado</option>
              </select>

              {period === 'custom' && (
                <div className="mt-3 space-y-2">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Desde</label>
                    <input
                      type="date"
                      value={customDates.start}
                      onChange={(e) => { setCustomDates({ ...customDates, start: e.target.value }); setPreview(null); }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Hasta</label>
                    <input
                      type="date"
                      value={customDates.end}
                      onChange={(e) => { setCustomDates({ ...customDates, end: e.target.value }); setPreview(null); }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Source filter — only for sales */}
            {reportType === 'sales' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5">
                  <Filter className="h-4 w-4" />
                  Canal
                </label>
                <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs font-medium">
                  <button
                    onClick={() => { setSource(''); setPreview(null); }}
                    className={`flex-1 px-3 py-2 transition-colors ${!source ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => { setSource('online'); setPreview(null); }}
                    className={`flex-1 px-3 py-2 transition-colors flex items-center justify-center gap-1 ${source === 'online' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                  >
                    <Globe className="h-3 w-3" />
                    Online
                  </button>
                  <button
                    onClick={() => { setSource('mostrador'); setPreview(null); }}
                    className={`flex-1 px-3 py-2 transition-colors flex items-center justify-center gap-1 ${source === 'mostrador' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                  >
                    <Store className="h-3 w-3" />
                    Local
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Acciones
            </label>
            <div className="grid sm:grid-cols-3 gap-2">
              <button
                onClick={handlePreview}
                disabled={previewLoading}
                className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 font-medium"
              >
                <Eye className="h-5 w-5" />
                {previewLoading ? 'Cargando...' : 'Preview'}
              </button>
              <button
                onClick={() => handleDownload('csv')}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-300 font-medium"
              >
                <Download className="h-5 w-5" />
                {loading ? '...' : 'CSV'}
              </button>
              <button
                onClick={() => handleDownload('json')}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 font-medium"
              >
                <FileText className="h-5 w-5" />
                JSON
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Table */}
      {preview && (
        <ReportsTable
          preview={preview}
          reportType={reportType}
          formatCurrency={formatCurrency}
          statusLabel={statusLabel}
        />
      )}

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Consejos</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>Los reportes CSV pueden abrirse en Excel o Google Sheets</li>
          <li>Los reportes de ventas incluyen moneda y departamento por orden</li>
          <li>Usa el filtro de canal para separar ventas online de mostrador</li>
          <li>El preview muestra los primeros 50 registros del reporte</li>
        </ul>
      </div>
    </div>
  );
}
