// app/admin/reports/page.tsx
'use client';

import { useState } from 'react';
import { Download, FileText, Calendar, TrendingUp, Users, Package } from 'lucide-react';

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('sales');
  const [period, setPeriod] = useState('month');
  const [customDates, setCustomDates] = useState({
    start: '',
    end: '',
  });

  const handleDownload = async (format: 'json' | 'csv') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: reportType,
        period,
        format,
      });

      if (period === 'custom') {
        params.append('start', customDates.start);
        params.append('end', customDates.end);
      }

      const response = await fetch(`/api/admin/reports?${params}`);
      
      if (format === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte-${reportType}-${period}.csv`;
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
        a.download = `reporte-${reportType}-${period}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Error al descargar el reporte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reportes</h1>
        <p className="text-slate-500">Descargá reportes de ventas, productos y clientes</p>
      </div>

      {/* Report Configuration */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-6">Configuración del reporte</h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Report Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tipo de reporte
            </label>
            <div className="space-y-2">
              <button
                onClick={() => setReportType('sales')}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-colors ${
                  reportType === 'sales'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <TrendingUp className="h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">Ventas</p>
                  <p className="text-xs opacity-70">Órdenes e ingresos</p>
                </div>
              </button>

              <button
                onClick={() => setReportType('products')}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-colors ${
                  reportType === 'products'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Package className="h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">Productos</p>
                  <p className="text-xs opacity-70">Stock e inventario</p>
                </div>
              </button>

              <button
                onClick={() => setReportType('customers')}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-colors ${
                  reportType === 'customers'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Users className="h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">Clientes</p>
                  <p className="text-xs opacity-70">Base de clientes</p>
                </div>
              </button>
            </div>
          </div>

          {/* Period */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Período
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">Última semana</option>
              <option value="month">Último mes</option>
              <option value="year">Último año</option>
              <option value="custom">Personalizado</option>
            </select>

            {period === 'custom' && (
              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Desde</label>
                  <input
                    type="date"
                    value={customDates.start}
                    onChange={(e) => setCustomDates({ ...customDates, start: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Hasta</label>
                  <input
                    type="date"
                    value={customDates.end}
                    onChange={(e) => setCustomDates({ ...customDates, end: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Download Options */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Formato
            </label>
            <div className="space-y-2">
              <button
                onClick={() => handleDownload('csv')}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-300"
              >
                <Download className="h-5 w-5" />
                {loading ? 'Descargando...' : 'Descargar CSV'}
              </button>

              <button
                onClick={() => handleDownload('json')}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                <FileText className="h-5 w-5" />
                Descargar JSON
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Reportes disponibles</span>
          </div>
          <p className="text-3xl font-bold text-blue-900">3</p>
          <p className="text-sm text-blue-700 mt-1">Ventas, Productos, Clientes</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">Formatos</span>
          </div>
          <p className="text-3xl font-bold text-green-900">2</p>
          <p className="text-sm text-green-700 mt-1">CSV y JSON</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Períodos</span>
          </div>
          <p className="text-3xl font-bold text-purple-900">4</p>
          <p className="text-sm text-purple-700 mt-1">Semana, Mes, Año, Custom</p>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Consejos</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Los reportes CSV pueden abrirse en Excel o Google Sheets</li>
          <li>• Los reportes JSON son útiles para integraciones y análisis programático</li>
          <li>• Los reportes de ventas incluyen detalle de productos por orden</li>
          <li>• Los reportes de productos muestran stock actual y valor de inventario</li>
        </ul>
      </div>
    </div>
  );
}
