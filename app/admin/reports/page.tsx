// app/admin/reports/page.tsx
'use client';

import { useState } from 'react';
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
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Eye className="h-5 w-5 text-slate-400" />
              Preview
            </h3>
            {preview.summary && (
              <div className="flex items-center gap-4 text-sm text-slate-500">
                {preview.summary.totalOrders !== undefined && (
                  <span>{preview.summary.totalOrders} pedidos</span>
                )}
                {preview.summary.paidOrders !== undefined && (
                  <span>{preview.summary.paidOrders} pagados</span>
                )}
                {preview.summary.totalRevenue !== undefined && (
                  <span className="font-semibold text-slate-900">{formatCurrency(preview.summary.totalRevenue)}</span>
                )}
                {preview.summary.totalCustomers !== undefined && (
                  <span>{preview.summary.totalCustomers} clientes</span>
                )}
              </div>
            )}
          </div>

          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            {/* Sales preview */}
            {reportType === 'sales' && preview.orders && (
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-slate-50 z-10">
                  <tr>
                    <th className="text-left py-2 px-3 text-slate-600 font-medium">Fecha</th>
                    <th className="text-left py-2 px-3 text-slate-600 font-medium">Pedido</th>
                    <th className="text-left py-2 px-3 text-slate-600 font-medium">Cliente</th>
                    <th className="text-right py-2 px-3 text-slate-600 font-medium">Total</th>
                    <th className="text-center py-2 px-3 text-slate-600 font-medium">Estado</th>
                    <th className="text-left py-2 px-3 text-slate-600 font-medium">Canal</th>
                    <th className="text-left py-2 px-3 text-slate-600 font-medium">Depto.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {preview.orders.slice(0, 50).map((order: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="py-2 px-3 text-slate-500 whitespace-nowrap">
                        {new Date(order.created_at).toLocaleDateString('es-UY')}
                      </td>
                      <td className="py-2 px-3 font-medium text-slate-900">{order.order_number}</td>
                      <td className="py-2 px-3 text-slate-700 truncate max-w-[160px]">{order.customer_name}</td>
                      <td className="py-2 px-3 text-right font-semibold text-slate-900 whitespace-nowrap">
                        {formatCurrency(order.total || 0, order.currency || 'UYU')}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          order.status === 'paid' || order.status === 'delivered'
                            ? 'bg-green-100 text-green-700'
                            : order.status === 'cancelled'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                        }`}>
                          {statusLabel(order.status)}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-500 text-xs">
                        {order.order_source === 'mostrador' ? 'Local' : 'Online'}
                      </td>
                      <td className="py-2 px-3 text-slate-500 text-xs truncate max-w-[120px]">
                        {order.shipping_department || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Products preview */}
            {reportType === 'products' && preview.products && (
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-slate-50 z-10">
                  <tr>
                    <th className="text-left py-2 px-3 text-slate-600 font-medium">SKU</th>
                    <th className="text-left py-2 px-3 text-slate-600 font-medium">Nombre</th>
                    <th className="text-right py-2 px-3 text-slate-600 font-medium">Precio</th>
                    <th className="text-right py-2 px-3 text-slate-600 font-medium">Stock</th>
                    <th className="text-right py-2 px-3 text-slate-600 font-medium">Vendidos</th>
                    <th className="text-right py-2 px-3 text-slate-600 font-medium">Ingresos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {preview.products.slice(0, 50).map((p: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="py-2 px-3 text-slate-500 font-mono text-xs">{p.sku}</td>
                      <td className="py-2 px-3 text-slate-900 truncate max-w-[200px]">{p.name}</td>
                      <td className="py-2 px-3 text-right text-slate-900">{formatCurrency(p.price_numeric || 0)}</td>
                      <td className={`py-2 px-3 text-right font-medium ${p.stock <= 5 ? 'text-red-600' : 'text-slate-900'}`}>
                        {p.stock}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-700">{p.totalSales || p.sold_count || 0}</td>
                      <td className="py-2 px-3 text-right font-semibold text-green-600">
                        {formatCurrency(p.totalRevenue || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Customers preview */}
            {reportType === 'customers' && preview.customers && (
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-slate-50 z-10">
                  <tr>
                    <th className="text-left py-2 px-3 text-slate-600 font-medium">Nombre</th>
                    <th className="text-left py-2 px-3 text-slate-600 font-medium">Email</th>
                    <th className="text-right py-2 px-3 text-slate-600 font-medium">Pedidos</th>
                    <th className="text-right py-2 px-3 text-slate-600 font-medium">Total</th>
                    <th className="text-left py-2 px-3 text-slate-600 font-medium">Ultima compra</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {preview.customers.slice(0, 50).map((c: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="py-2 px-3 text-slate-900 font-medium truncate max-w-[160px]">{c.name}</td>
                      <td className="py-2 px-3 text-slate-500 truncate max-w-[180px]">{c.email || '-'}</td>
                      <td className="py-2 px-3 text-right text-slate-700">{c.totalOrders}</td>
                      <td className="py-2 px-3 text-right font-semibold text-slate-900">{formatCurrency(c.totalSpent)}</td>
                      <td className="py-2 px-3 text-slate-500 text-xs whitespace-nowrap">
                        {c.lastOrder ? new Date(c.lastOrder).toLocaleDateString('es-UY') : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {preview.orders?.length === 0 && preview.products?.length === 0 && preview.customers?.length === 0 && (
              <p className="text-center text-slate-500 py-8">Sin datos para el periodo seleccionado</p>
            )}
          </div>

          {((preview.orders && preview.orders.length > 50) ||
            (preview.products && preview.products.length > 50) ||
            (preview.customers && preview.customers.length > 50)) && (
            <p className="text-xs text-slate-400 mt-3 text-center">
              Mostrando primeros 50 registros. Descarga el reporte completo para ver todos.
            </p>
          )}
        </div>
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
