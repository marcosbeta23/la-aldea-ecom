import Link from 'next/link';
import { Package, Truck, AlertTriangle } from 'lucide-react';

export default function DashboardSidebar({ lowStock }: { lowStock: any[] }) {
  return (
    <div className="space-y-4">
      {/* Quick actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider">Acciones Rápidas</h3>
        <div className="space-y-2">
          <Link
            href="/admin/products/new"
            className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors group"
          >
            <Package className="h-4 w-4 text-blue-600 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-blue-800">Agregar Producto</span>
          </Link>
          <Link
            href="/admin/orders"
            className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors group"
          >
            <Truck className="h-4 w-4 text-slate-600 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-slate-700">Gestionar Pedidos</span>
          </Link>
        </div>
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Stock Bajo</h3>
            <span className="ml-auto text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
              {lowStock.length}
            </span>
          </div>
          <div className="space-y-2">
            {lowStock.map((p) => (
              <Link
                key={p.id}
                href={`/admin/products/${p.id}`}
                className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0 hover:bg-slate-50 -mx-2 px-2 rounded transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm text-slate-800 truncate font-medium">{p.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono uppercase tracking-tight">{p.sku}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ml-2 shrink-0 ${
                  p.stock <= 2 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {p.stock} ud.
                </span>
              </Link>
            ))}
          </div>
          <Link
            href="/admin/inventory"
            className="block mt-4 text-xs text-blue-600 hover:text-blue-700 text-center font-bold uppercase tracking-wider transition-colors"
          >
            Ver inventario completo
          </Link>
        </div>
      )}
    </div>
  );
}
