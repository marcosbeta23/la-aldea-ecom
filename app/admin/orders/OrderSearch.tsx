'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';

export default function OrderSearch({
  initialQuery,
  statusFilter,
}: {
  initialQuery: string;
  statusFilter?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (statusFilter) params.set('status', statusFilter);
    const qs = params.toString();
    router.push(`/admin/orders${qs ? `?${qs}` : ''}`);
  };

  const handleClear = () => {
    setQuery('');
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    const qs = params.toString();
    router.push(`/admin/orders${qs ? `?${qs}` : ''}`);
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por # pedido, nombre, teléfono o email..."
          className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <button
        type="submit"
        className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        Buscar
      </button>
    </form>
  );
}
