import { supabaseAdmin } from '@/lib/supabase';
import { 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Truck
} from 'lucide-react';
import Link from 'next/link';

interface OrderStat {
  id: string;
  status: string;
  total: number;
  created_at: string;
}

interface RecentOrder {
  id: string;
  order_number: string;
  customer_name: string;
  total: number;
  status: string;
  created_at: string;
}

// Stats card component
function StatsCard({ 
  title, 
  value, 
  subValue, 
  icon: Icon, 
  color 
}: {
  title: string;
  value: string | number;
  subValue?: string;
  icon: any;
  color: 'blue' | 'green' | 'amber' | 'purple';
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
  };
  
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
          {subValue && (
            <p className="mt-1 text-sm text-slate-500">{subValue}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colors[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

// Order status badge
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800',
    paid: 'bg-green-100 text-green-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-slate-100 text-slate-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  
  const labels: Record<string, string> = {
    pending: 'Pendiente',
    paid: 'Pagado',
    processing: 'En proceso',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
  };
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
      {labels[status] || status}
    </span>
  );
}

export default async function AdminDashboard() {
  // Fetch stats from database
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
  
  // Get orders count by status
  const { data: ordersData } = await supabaseAdmin
    .from('orders')
    .select('id, status, total, created_at');
  
  const orders = (ordersData || []) as OrderStat[];
  
  // Get products count
  const { count: productsCount } = await supabaseAdmin
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);
  
  // Get recent orders
  const { data: recentOrdersData } = await supabaseAdmin
    .from('orders')
    .select('id, order_number, customer_name, total, status, created_at')
    .order('created_at', { ascending: false })
    .limit(5);
  
  const recentOrders = (recentOrdersData || []) as RecentOrder[];
  
  // Calculate stats
  const ordersArray = orders;
  const totalOrders = ordersArray.length;
  const pendingOrders = ordersArray.filter(o => o.status === 'pending').length;
  const paidOrders = ordersArray.filter(o => o.status === 'paid' || o.status === 'processing').length;
  const totalRevenue = ordersArray
    .filter(o => o.status === 'paid' || o.status === 'processing' || o.status === 'shipped' || o.status === 'delivered')
    .reduce((sum, o) => sum + (o.total || 0), 0);
  
  const todayOrders = ordersArray.filter(o => o.created_at >= startOfDay).length;
  const monthOrders = ordersArray.filter(o => o.created_at >= startOfMonth).length;
  
  const formatCurrency = (value: number) => 
    `UYU ${value.toLocaleString('es-UY', { maximumFractionDigits: 0 })}`;
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-UY', { 
      day: '2-digit', 
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500">Resumen de tu tienda</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Pedidos Pendientes"
          value={pendingOrders}
          subValue={`${todayOrders} hoy`}
          icon={Clock}
          color="amber"
        />
        <StatsCard
          title="Pedidos Pagados"
          value={paidOrders}
          subValue={`${monthOrders} este mes`}
          icon={CheckCircle2}
          color="green"
        />
        <StatsCard
          title="Ingresos"
          value={formatCurrency(totalRevenue)}
          subValue="Total confirmado"
          icon={DollarSign}
          color="blue"
        />
        <StatsCard
          title="Productos Activos"
          value={productsCount || 0}
          icon={Package}
          color="purple"
        />
      </div>
      
      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/admin/orders?status=pending"
          className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors"
        >
          <Clock className="h-8 w-8 text-amber-600" />
          <div>
            <p className="font-semibold text-amber-900">Pedidos Pendientes</p>
            <p className="text-sm text-amber-600">{pendingOrders} pedidos por revisar</p>
          </div>
        </Link>
        
        <Link
          href="/admin/products"
          className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors"
        >
          <Package className="h-8 w-8 text-blue-600" />
          <div>
            <p className="font-semibold text-blue-900">Gestionar Productos</p>
            <p className="text-sm text-blue-600">{productsCount || 0} productos activos</p>
          </div>
        </Link>
        
        <Link
          href="/admin/orders"
          className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-colors"
        >
          <Truck className="h-8 w-8 text-green-600" />
          <div>
            <p className="font-semibold text-green-900">Todos los Pedidos</p>
            <p className="text-sm text-green-600">{totalOrders} pedidos totales</p>
          </div>
        </Link>
      </div>
      
      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-900">Pedidos Recientes</h2>
          <Link
            href="/admin/orders"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Ver todos →
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Pedido</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {(recentOrders || []).map((order: any) => (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <Link 
                      href={`/admin/orders/${order.id}`}
                      className="font-mono text-sm text-blue-600 hover:text-blue-700"
                    >
                      #{order.order_number}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900">
                    {order.customer_name}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {formatDate(order.created_at)}
                  </td>
                </tr>
              ))}
              
              {(!recentOrders || recentOrders.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No hay pedidos todavía
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
