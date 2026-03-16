// components/admin/ReportsTable.tsx
'use client';

import { Eye } from 'lucide-react';

interface PreviewData {
  summary?: Record<string, any>;
  orders?: any[];
  products?: any[];
  customers?: any[];
}

interface ReportsTableProps {
  preview: PreviewData;
  reportType: string;
  formatCurrency: (v: number, currency?: string) => string;
  statusLabel: (s: string) => string;
}

export default function ReportsTable({
  preview,
  reportType,
  formatCurrency,
  statusLabel,
}: ReportsTableProps) {
  return (
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
              <span className="font-semibold text-slate-900">
                {formatCurrency(preview.summary.totalRevenue)}
              </span>
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
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        order.status === 'paid' || order.status === 'delivered'
                          ? 'bg-green-100 text-green-700'
                          : order.status === 'cancelled'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {statusLabel(order.status)}
                    </span>
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
                  <td className="py-2 px-3 text-right text-slate-900">
                    {formatCurrency(p.price_numeric || 0)}
                  </td>
                  <td
                    className={`py-2 px-3 text-right font-medium ${
                      p.stock <= 5 ? 'text-red-600' : 'text-slate-900'
                    }`}
                  >
                    {p.stock}
                  </td>
                  <td className="py-2 px-3 text-right text-slate-700">
                    {p.totalSales || p.sold_count || 0}
                  </td>
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
                  <td className="py-2 px-3 text-slate-900 font-medium truncate max-w-[160px]">
                    {c.name}
                  </td>
                  <td className="py-2 px-3 text-slate-500 truncate max-w-[180px]">
                    {c.email || '-'}
                  </td>
                  <td className="py-2 px-3 text-right text-slate-700">{c.totalOrders}</td>
                  <td className="py-2 px-3 text-right font-semibold text-slate-900">
                    {formatCurrency(c.totalSpent)}
                  </td>
                  <td className="py-2 px-3 text-slate-500 text-xs whitespace-nowrap">
                    {c.lastOrder ? new Date(c.lastOrder).toLocaleDateString('es-UY') : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {preview.orders?.length === 0 &&
          preview.products?.length === 0 &&
          preview.customers?.length === 0 && (
            <p className="text-center text-slate-500 py-8">
              Sin datos para el periodo seleccionado
            </p>
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
  );
}
