import { Suspense } from 'react';
import Link from 'next/link';
import { BarChart3 } from 'lucide-react';
import DashboardStats from '@/components/admin/DashboardStats';
import RecentOrdersClient from '@/components/admin/RecentOrdersClient';
import DashboardSidebar from '@/components/admin/DashboardSidebar';
import RefreshButton from '@/components/admin/RefreshButton';
import { getDashboardData } from '@/lib/admin-data';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  // Fetch initial data once for the page
  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 text-sm font-medium">Últimos 30 días</p>
        </div>
        <div className="flex items-center gap-3">
          <RefreshButton />
          <Link
            href="/admin/analytics"
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-lg transition-all border border-slate-200 shadow-sm"
          >
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </Link>
        </div>
      </div>

      <Suspense fallback={<StatsSkeleton />}>
        <DashboardStats />
      </Suspense>

      {/* Main content grid: recent orders + sidebar */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Suspense fallback={<OrdersSkeleton />}>
            <RecentOrdersClient orders={data.recentOrders} />
          </Suspense>
        </div>
        
        <div className="space-y-4">
          <Suspense fallback={<SidebarSkeleton />}>
            <DashboardSidebar lowStock={data.lowStock} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

// ── Skeletons for Suspense Boundaries ──────────────────────────────────────

function StatsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-32 bg-slate-200 rounded-xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 bg-slate-100 rounded-xl" />
        ))}
      </div>
      <div className="h-32 bg-slate-100 rounded-xl" />
    </div>
  );
}

function OrdersSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm animate-pulse">
      <div className="h-14 bg-slate-50 border-b border-slate-200" />
      <div className="p-5 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 bg-slate-100 rounded" />
              <div className="h-3 w-40 bg-slate-50 rounded" />
            </div>
            <div className="w-16 h-8 bg-slate-100 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-40 bg-white border border-slate-200 rounded-xl p-4">
        <div className="h-4 w-32 bg-slate-100 rounded mb-4" />
        <div className="space-y-2">
          <div className="h-10 bg-slate-50 rounded" />
          <div className="h-10 bg-slate-50 rounded" />
        </div>
      </div>
      <div className="h-56 bg-white border border-slate-200 rounded-xl p-4" />
    </div>
  );
}