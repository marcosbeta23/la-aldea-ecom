import { supabaseAdmin } from '@/lib/supabase';
import {
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  Truck,
  Store,
  Globe,
  AlertTriangle,
  Zap,
  BarChart3,
  ArrowRight,
  Plus,
} from 'lucide-react';
import Link from 'next/link';

// ── Helpers ────────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  pending: { label: 'Pendiente', classes: 'bg-amber-100 text-amber-800' },
  paid: { label: 'Pagado', classes: 'bg-green-100 text-green-800' },
  paid_pending_verification: { label: 'Por verificar', classes: 'bg-blue-100 text-blue-800' },
  processing: { label: 'En proceso', classes: 'bg-indigo-100 text-indigo-800' },
  shipped: { label: 'Enviado', classes: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Entregado', classes: 'bg-slate-100 text-slate-700' },
  cancelled: { label: 'Cancelado', classes: 'bg-red-100 text-red-800' },
  refunded: { label: 'Reembolsado', classes: 'bg-red-100 text-red-700' },
  ready_to_invoice: { label: 'Por facturar', classes: 'bg-teal-100 text-teal-800' },
  invoiced: { label: 'Facturado', classes: 'bg-teal-100 text-teal-700' },
};

const PAYMENT_LABELS: Record<string, string> = {
  mercadopago: 'MP',
  transfer: 'Transfer.',
  efectivo: 'Efectivo',
  credito: 'Crédito',
  pos_debito: 'POS Déb.',
  pos_credito: 'POS Créd.',
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || { label: status, classes: 'bg-slate-100 text-slate-700' };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.classes}`}>
      {cfg.label}
    </span>
  );
}

function formatUYU(v: number) {
  return `$ ${v.toLocaleString('es-UY', { maximumFractionDigits: 0 })}`;
}
function formatUSD(v: number) {
  return `US$ ${v.toLocaleString('es-UY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-UY', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default async function AdminDashboard() {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOf30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const paidStatuses = ['paid', 'processing', 'shipped', 'delivered', 'paid_pending_verification', 'ready_to_invoice', 'invoiced'];

  // Fetch last 30 days orders
  const { data: ordersData } = await supabaseAdmin
    .from('orders')
    .select('id, order_number, status, total, currency, created_at, customer_name, customer_phone, order_source, payment_method, shipping_department')
    .gte('created_at', startOf30d.toISOString())
    .order('created_at', { ascending: false }) as {
      data: Array<{
        id: string;
        order_number: string;
        status: string;
        total: number;
        currency: string | null;
        created_at: string;
        customer_name: string;
        customer_phone: string | null;
        order_source: string | null;
        payment_method: string | null;
        shipping_department: string | null;
      }> | null;
    };

  const orders = ordersData || [];

  // Active products count
  const { count: productsCount } = await supabaseAdmin
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true) as { count: number | null };

  // Low-stock products
  const { data: lowStockData } = await supabaseAdmin
    .from('products')
    .select('id, name, sku, stock')
    .eq('is_active', true)
    .lte('stock', 5)
    .gt('stock', 0)
    .order('stock', { ascending: true })
    .limit(6) as {
      data: Array<{ id: string; name: string; sku: string; stock: number }> | null;
    };

  const lowStock = lowStockData || [];

  // ── Calculate stats ──────────────────────────────────────────────────────────

  const orderCurrency = (o: { currency: string | null }) => o.currency || 'UYU';

  const paidOrders = orders.filter(o => paidStatuses.includes(o.status));
  const todayOrders = orders.filter(o => new Date(o.created_at) >= startOfToday);
  const todayPaid = paidOrders.filter(o => new Date(o.created_at) >= startOfToday);

  const revenueUYU = paidOrders.filter(o => orderCurrency(o) === 'UYU').reduce((s, o) => s + (o.total || 0), 0);
  const revenueUSD = paidOrders.filter(o => orderCurrency(o) === 'USD').reduce((s, o) => s + (o.total || 0), 0);

  const todayRevenueUYU = todayPaid.filter(o => orderCurrency(o) === 'UYU').reduce((s, o) => s + (o.total || 0), 0);
  const todayRevenueUSD = todayPaid.filter(o => orderCurrency(o) === 'USD').reduce((s, o) => s + (o.total || 0), 0);

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const toVerify = orders.filter(o => o.status === 'paid_pending_verification');
  const toInvoice = orders.filter(o => o.status === 'ready_to_invoice');

  const onlineRevenue = paidOrders.filter(o => (o.order_source || 'online') !== 'mostrador').reduce((s, o) => s + (o.total || 0), 0);
  const mostradorRevenue = paidOrders.filter(o => o.order_source === 'mostrador').reduce((s, o) => s + (o.total || 0), 0);

  const avgTicket = paidOrders.filter(o => orderCurrency(o) === 'UYU').length > 0
    ? revenueUYU / paidOrders.filter(o => orderCurrency(o) === 'UYU').length
    : 0;

  // Recent orders (top 10)
  const recentOrders = orders.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm">
            Últimos 30 días ·{' '}
            <span className="text-slate-400">
              {now.toLocaleDateString('es-UY', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </p>
        </div>
        <Link
          href="/admin/analytics"
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors"
        >
          <BarChart3 className="h-4 w-4" />
          Analytics
        </Link>
      </div>

      {/* Today banner — only if there's activity */}
      {(todayOrders.length > 0 || todayRevenueUYU > 0) && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-5 text-white">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-4 w-4 text-yellow-400" />
            <span className="text-sm font-semibold text-slate-300">Hoy</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-slate-400 text-xs">Pedidos</p>
              <p className="text-2xl font-bold">{todayOrders.length}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Ingresos UYU</p>
              <p className="text-2xl font-bold">{formatUYU(todayRevenueUYU)}</p>
            </div>
            {todayRevenueUSD > 0 && (
              <div>
                <p className="text-slate-400 text-xs">Ingresos USD</p>
                <p className="text-2xl font-bold">{formatUSD(todayRevenueUSD)}</p>
              </div>
            )}
            {todayPaid.length > 0 && (
              <div>
                <p className="text-slate-400 text-xs">Confirmados</p>
                <p className="text-2xl font-bold text-green-400">{todayPaid.length}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Attention required */}
      {(pendingOrders.length > 0 || toVerify.length > 0 || toInvoice.length > 0) && (
        <div className="grid sm:grid-cols-3 gap-3">
          {pendingOrders.length > 0 && (
            <Link
              href="/admin/orders?status=pending"
              className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="font-semibold text-amber-900 text-sm">Pendientes</p>
                  <p className="text-xs text-amber-700">{pendingOrders.length} pedido{pendingOrders.length !== 1 ? 's' : ''} sin confirmar</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-amber-500 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          )}
          {toVerify.length > 0 && (
            <Link
              href="/admin/orders?status=paid_pending_verification"
              className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-semibold text-blue-900 text-sm">Por verificar</p>
                  <p className="text-xs text-blue-700">{toVerify.length} transferencia{toVerify.length !== 1 ? 's' : ''} pendiente{toVerify.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-blue-500 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          )}
          {toInvoice.length > 0 && (
            <Link
              href="/admin/orders?status=ready_to_invoice"
              className="flex items-center justify-between p-4 bg-teal-50 border border-teal-200 rounded-xl hover:bg-teal-100 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-teal-600" />
                <div>
                  <p className="font-semibold text-teal-900 text-sm">Por facturar</p>
                  <p className="text-xs text-teal-700">{toInvoice.length} pedido{toInvoice.length !== 1 ? 's' : ''} listos</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-teal-500 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          )}
        </div>
      )}

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Ingresos UYU (30d)</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{formatUYU(revenueUYU)}</p>
              <p className="mt-1 text-xs text-slate-400">{paidOrders.filter(o => orderCurrency(o) === 'UYU').length} pedidos pagados</p>
            </div>
            <div className="p-3 rounded-xl bg-green-50 text-green-600 border border-green-100">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Ingresos USD (30d)</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{formatUSD(revenueUSD)}</p>
              <p className="mt-1 text-xs text-slate-400">{paidOrders.filter(o => orderCurrency(o) === 'USD').length} pedidos USD</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Globe className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Pedidos (30d)</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{orders.length}</p>
              <p className="mt-1 text-xs text-slate-400">{paidOrders.length} confirmados · {pendingOrders.length} pendientes</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <ShoppingCart className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Ticket Prom. UYU</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{formatUYU(avgTicket)}</p>
              <p className="mt-1 text-xs text-slate-400">{productsCount || 0} productos activos</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Revenue by channel */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Online (30d)</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{formatUYU(onlineRevenue)}</p>
              <p className="mt-1 text-xs text-slate-400">
                {paidOrders.filter(o => (o.order_source || 'online') !== 'mostrador').length} pedidos online
              </p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Globe className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Mostrador (30d)</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{formatUYU(mostradorRevenue)}</p>
              <p className="mt-1 text-xs text-slate-400">
                {paidOrders.filter(o => o.order_source === 'mostrador').length} ventas en local
              </p>
            </div>
            <div className="p-3 rounded-xl bg-green-50 text-green-600 border border-green-100">
              <Store className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Main content: recent orders + sidebar */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Pedidos Recientes</h2>
            <Link
              href="/admin/orders"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              Ver todos <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentOrders.length === 0 ? (
              <p className="px-5 py-10 text-center text-slate-400 text-sm">Sin pedidos en los últimos 30 días</p>
            ) : (
              recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono text-sm font-medium text-blue-600">#{order.order_number}</span>
                      <StatusBadge status={order.status} />
                      {order.order_source === 'mostrador' && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">mostrador</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-700 truncate">{order.customer_name}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-slate-900">
                      {orderCurrency(order) === 'USD' ? formatUSD(order.total) : formatUYU(order.total)}
                    </p>
                    <p className="text-xs text-slate-400">{formatDate(order.created_at)}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick actions */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Acciones Rápidas</h3>
            <div className="space-y-2">
              <Link
                href="/admin/ventas-mostrador/nueva"
                className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
              >
                <Plus className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-800">Nueva Venta Mostrador</span>
              </Link>
              <Link
                href="/admin/products/new"
                className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Package className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Agregar Producto</span>
              </Link>
              <Link
                href="/admin/orders"
                className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <Truck className="h-4 w-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Gestionar Pedidos</span>
              </Link>
            </div>
          </div>

          {/* Low stock alert */}
          {lowStock.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-slate-700">Stock Bajo</h3>
                <span className="ml-auto text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                  {lowStock.length}
                </span>
              </div>
              <div className="space-y-2">
                {lowStock.map((p) => (
                  <Link
                    key={p.id}
                    href={`/admin/products/${p.id}`}
                    className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0 hover:bg-slate-50 -mx-1 px-1 rounded transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-slate-800 truncate">{p.name}</p>
                      <p className="text-xs text-slate-400">{p.sku}</p>
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
                href="/admin/products"
                className="block mt-3 text-xs text-blue-600 hover:text-blue-700 text-center font-medium"
              >
                Ver todos los productos →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
