import { supabaseAdmin } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import {
  Package,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowUpDown,
  ExternalLink,
  TrendingDown,
  Boxes,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

interface ProductInventory {
  id: string;
  name: string;
  sku: string;
  stock: number;
  sold_count: number;
  is_active: boolean;
  images: string[] | null;
  price_numeric: number;
  category: string[];
  avgDailySales: number;
  daysRemaining: number;
  totalSold30d: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getStockStatus(product: ProductInventory): {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
} {
  if (product.stock === 0) {
    return { label: 'Agotado', color: 'text-red-700', bgColor: 'bg-red-50', borderColor: 'border-red-200' };
  }
  if (product.daysRemaining <= 7) {
    return { label: 'Critico', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' };
  }
  if (product.daysRemaining <= 14) {
    return { label: 'Bajo', color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' };
  }
  if (product.daysRemaining <= 30) {
    return { label: 'Moderado', color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' };
  }
  if (product.avgDailySales === 0) {
    return { label: 'Sin ventas', color: 'text-slate-500', bgColor: 'bg-slate-50', borderColor: 'border-slate-200' };
  }
  return { label: 'Saludable', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' };
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  subtitle?: string;
  icon: typeof Package;
  color: 'blue' | 'green' | 'amber' | 'red' | 'slate';
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    slate: 'bg-slate-50 text-slate-600 border-slate-100',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl border ${colors[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const sortBy = typeof params.sort === 'string' ? params.sort : 'days';
  const filterStatus = typeof params.status === 'string' ? params.status : '';

  // Fetch all active products
  const { data: productsData } = await (supabaseAdmin as any)
    .from('products')
    .select('id, name, sku, stock, sold_count, is_active, images, price_numeric, category')
    .eq('is_active', true)
    .order('name', { ascending: true });

  const allProducts = (productsData || []) as Array<{
    id: string; name: string; sku: string; stock: number;
    sold_count: number; is_active: boolean; images: string[] | null;
    price_numeric: number; category: string[];
  }>;

  // Fetch recent order items for avg daily sales calculation (last 30 days)
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const paidStatuses = ['paid', 'processing', 'shipped', 'delivered', 'paid_pending_verification', 'ready_to_invoice', 'invoiced'];

  const { data: recentOrdersData } = await supabaseAdmin
    .from('orders')
    .select('id')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .in('status', paidStatuses) as { data: Array<{ id: string }> | null };

  const recentOrderIds = (recentOrdersData || []).map(o => o.id);

  const { data: recentItemsData } = await supabaseAdmin
    .from('order_items')
    .select('product_id, quantity')
    .in('order_id', recentOrderIds.length > 0 ? recentOrderIds : ['none']) as {
      data: Array<{ product_id: string; quantity: number }> | null;
    };

  const recentItems = recentItemsData || [];

  // Build daily sales map
  const salesMap = new Map<string, number>();
  for (const item of recentItems) {
    salesMap.set(item.product_id, (salesMap.get(item.product_id) || 0) + item.quantity);
  }

  // Enrich products with inventory metrics
  const products: ProductInventory[] = allProducts.map(p => {
    const totalSold30d = salesMap.get(p.id) || 0;
    const avgDailySales = totalSold30d / 30;
    const daysRemaining = avgDailySales > 0
      ? Math.round(p.stock / avgDailySales)
      : p.stock > 0 ? 999 : 0;

    return {
      ...p,
      avgDailySales: Math.round(avgDailySales * 100) / 100,
      daysRemaining,
      totalSold30d,
    };
  });

  // Sort products
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'stock_asc': return a.stock - b.stock;
      case 'stock_desc': return b.stock - a.stock;
      case 'sales': return b.totalSold30d - a.totalSold30d;
      case 'name': return a.name.localeCompare(b.name);
      case 'days':
      default:
        // Out of stock first, then by days remaining ascending
        if (a.stock === 0 && b.stock > 0) return -1;
        if (a.stock > 0 && b.stock === 0) return 1;
        return a.daysRemaining - b.daysRemaining;
    }
  });

  // Filter by status
  const filteredProducts = filterStatus
    ? sortedProducts.filter(p => {
        const status = getStockStatus(p);
        switch (filterStatus) {
          case 'out': return p.stock === 0;
          case 'critical': return p.stock > 0 && p.daysRemaining <= 7;
          case 'low': return p.stock > 0 && p.daysRemaining > 7 && p.daysRemaining <= 14;
          case 'healthy': return p.stock > 0 && p.daysRemaining > 14 && p.avgDailySales > 0;
          case 'no_sales': return p.stock > 0 && p.avgDailySales === 0;
          default: return true;
        }
      })
    : sortedProducts;

  // Stats
  const outOfStock = products.filter(p => p.stock === 0).length;
  const critical = products.filter(p => p.stock > 0 && p.daysRemaining <= 7).length;
  const low = products.filter(p => p.stock > 0 && p.daysRemaining > 7 && p.daysRemaining <= 14).length;
  const healthy = products.filter(p => p.stock > 0 && p.daysRemaining > 14 && p.avgDailySales > 0).length;
  const noSales = products.filter(p => p.stock > 0 && p.avgDailySales === 0).length;
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);

  // Sort options
  const sortOptions = [
    { value: 'days', label: 'Dias restantes' },
    { value: 'stock_asc', label: 'Stock (menor)' },
    { value: 'stock_desc', label: 'Stock (mayor)' },
    { value: 'sales', label: 'Ventas (30d)' },
    { value: 'name', label: 'Nombre' },
  ];

  const filterOptions = [
    { value: '', label: 'Todos', count: products.length },
    { value: 'out', label: 'Agotados', count: outOfStock },
    { value: 'critical', label: 'Critico', count: critical },
    { value: 'low', label: 'Bajo', count: low },
    { value: 'healthy', label: 'Saludable', count: healthy },
    { value: 'no_sales', label: 'Sin ventas', count: noSales },
  ];

  const buildUrl = (newSort?: string, newStatus?: string) => {
    const p = new URLSearchParams();
    const s = newSort ?? sortBy;
    const st = newStatus ?? filterStatus;
    if (s && s !== 'days') p.set('sort', s);
    if (st) p.set('status', st);
    const qs = p.toString();
    return `/admin/inventory${qs ? `?${qs}` : ''}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Inventario</h1>
        <p className="text-slate-500 text-sm">
          {products.length} productos activos &middot; {totalStock} unidades en stock
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total Productos"
          value={products.length}
          subtitle={`${totalStock} unidades`}
          icon={Boxes}
          color="blue"
        />
        <StatCard
          title="Agotados"
          value={outOfStock}
          subtitle="Stock = 0"
          icon={XCircle}
          color="red"
        />
        <StatCard
          title="Stock Critico"
          value={critical}
          subtitle="< 7 dias"
          icon={AlertTriangle}
          color="amber"
        />
        <StatCard
          title="Stock Bajo"
          value={low}
          subtitle="7-14 dias"
          icon={TrendingDown}
          color="amber"
        />
        <StatCard
          title="Saludable"
          value={healthy}
          subtitle="> 14 dias"
          icon={CheckCircle2}
          color="green"
        />
      </div>

      {/* Filters & Sort */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Status Filter */}
        <div className="flex flex-wrap gap-2 flex-1">
          {filterOptions.map(opt => {
            const isActive = filterStatus === opt.value;
            return (
              <Link
                key={opt.value}
                href={buildUrl(undefined, opt.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : opt.value === 'out' && opt.count > 0
                      ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                      : opt.value === 'critical' && opt.count > 0
                        ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {opt.label}
                {opt.count > 0 && opt.value && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20' : 'bg-slate-200/60'
                  }`}>
                    {opt.count}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-slate-400" />
          <div className="flex gap-1">
            {sortOptions.map(opt => (
              <Link
                key={opt.value}
                href={buildUrl(opt.value, undefined)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  sortBy === opt.value
                    ? 'bg-slate-800 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {opt.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Producto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">SKU</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Stock</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Ventas/dia</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Vendidos 30d</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Dias restantes</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredProducts.map(product => {
                const status = getStockStatus(product);
                const rowBg =
                  product.stock === 0 ? 'bg-red-50/40' :
                  product.daysRemaining <= 7 ? 'bg-red-50/20' :
                  product.daysRemaining <= 14 ? 'bg-amber-50/20' :
                  '';

                return (
                  <tr key={product.id} className={`hover:bg-slate-50 transition-colors ${rowBg}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.images?.[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            width={36}
                            height={36}
                            className="w-9 h-9 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                            <Package className="h-4 w-4 text-slate-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate max-w-[200px]">
                            {product.name}
                          </p>
                          {product.category.length > 0 && (
                            <p className="text-xs text-slate-400 truncate max-w-[200px]">
                              {product.category.join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-slate-600">{product.sku}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`text-sm font-bold ${
                        product.stock === 0 ? 'text-red-600' :
                        product.stock <= 5 ? 'text-amber-600' :
                        'text-slate-900'
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm text-slate-600">
                        {product.avgDailySales > 0 ? product.avgDailySales.toFixed(1) : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm text-slate-600">
                        {product.totalSold30d > 0 ? product.totalSold30d : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`text-sm font-bold ${
                        product.stock === 0 ? 'text-red-600' :
                        product.daysRemaining <= 7 ? 'text-red-600' :
                        product.daysRemaining <= 14 ? 'text-amber-600' :
                        product.daysRemaining >= 999 ? 'text-slate-400' :
                        'text-green-600'
                      }`}>
                        {product.stock === 0 ? '0' :
                         product.daysRemaining >= 999 ? '-' :
                         `${product.daysRemaining}d`}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${status.bgColor} ${status.color} ${status.borderColor}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Editar
                      </Link>
                    </td>
                  </tr>
                );
              })}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    No hay productos con este filtro
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50">
          <p className="text-xs text-slate-500">
            Mostrando {filteredProducts.length} de {products.length} productos &middot;
            Ventas calculadas sobre los ultimos 30 dias
          </p>
        </div>
      </div>
    </div>
  );
}
