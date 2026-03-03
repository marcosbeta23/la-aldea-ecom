export default function ProductCardSkeleton() {
  return (
    <div className="flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden animate-pulse">
      <div className="aspect-square bg-slate-200" />
      <div className="p-3 space-y-2">
        <div className="flex gap-2">
          <div className="h-5 bg-slate-200 rounded-full w-16" />
          <div className="h-5 bg-slate-200 rounded-full w-12" />
        </div>
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="h-4 bg-slate-200 rounded w-1/2" />
        <div className="flex items-end justify-between mt-auto">
          <div className="h-6 bg-slate-200 rounded w-20" />
          <div className="h-4 bg-slate-200 rounded w-14" />
        </div>
      </div>
    </div>
  );
}
