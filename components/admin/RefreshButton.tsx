'use client';

import { RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RefreshButton() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // router.refresh() triggers a server-side re-render without losing client state
    router.refresh();
    // Synthetic delay for the icon animation
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={isRefreshing}
      className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-all active:scale-95 shadow-sm"
      aria-label="Actualizar Dashboard"
    >
      <RefreshCw className={`h-5 w-5 text-slate-600 ${isRefreshing ? 'animate-spin' : ''}`} />
    </button>
  );
}
