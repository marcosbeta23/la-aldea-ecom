// app/admin/loading.tsx
//
// Next.js route segment loading UI â€” renders INSTANTLY on navigation to any
// /admin/* page while the actual page component fetches data.
// This alone can cut perceived LCP by 2-3s by showing content immediately
// instead of a blank screen.
//
// Place this file at: app/admin/loading.tsx

export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-40 bg-slate-200 rounded-lg" />
          <div className="h-4 w-64 bg-slate-100 rounded" />
        </div>
        <div className="h-9 w-32 bg-slate-200 rounded-xl" />
      </div>

      {/* KPI cards skeleton â€” 4 cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-100 p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="w-8 h-8 bg-slate-100 rounded-lg" />
              <div className="w-12 h-4 bg-slate-100 rounded" />
            </div>
            <div className="h-3 w-20 bg-slate-100 rounded" />
            <div className="h-6 w-28 bg-slate-200 rounded" />
            <div className="h-3 w-24 bg-slate-100 rounded" />
          </div>
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="bg-white rounded-xl border border-slate-100 p-4">
        <div className="h-4 w-48 bg-slate-100 rounded mb-4" />
        <div className="h-52 bg-slate-100 rounded-lg" />
      </div>

      {/* Two-col skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-100 p-4">
          <div className="h-4 w-32 bg-slate-100 rounded mb-4" />
          <div className="h-44 bg-slate-100 rounded-lg" />
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-4">
          <div className="h-4 w-32 bg-slate-100 rounded mb-4" />
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-8 bg-slate-100 rounded" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
