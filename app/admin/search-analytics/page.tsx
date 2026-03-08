'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, AlertCircle, TrendingUp, RefreshCw, BarChart3, ChevronDown, ChevronUp } from 'lucide-react';

interface SearchAnalyticsData {
  summary: {
    totalSearches: number;
    uniqueQueries: number;
    zeroResults: number;
    zeroResultRate: number;
    clickRate: number;
  };
  topSearches: Array<{ query: string; count: number; avgResults: number }>;
  topZeroResults: Array<{ query: string; count: number }>;
  dailySearches: Record<string, number>;
  period: string;
}

const TABLE_INITIAL = 10;

export default function SearchAnalyticsPage() {
  const [data, setData] = useState<SearchAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState('7d');

  // Pagination state for each table
  const [topSearchesVisible, setTopSearchesVisible] = useState(TABLE_INITIAL);
  const [zeroResultsVisible, setZeroResultsVisible] = useState(TABLE_INITIAL);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/search-analytics?period=${period}`);
      if (res.ok) {
        setData(await res.json());
        // Reset limits on new fetch
        setTopSearchesVisible(TABLE_INITIAL);
        setZeroResultsVisible(TABLE_INITIAL);
      }
    } catch (error) {
      console.error('Error fetching search analytics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Búsquedas</h1>
          <p className="text-slate-500">Análisis de búsquedas del sitio</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            aria-label="Seleccionar período"
          >
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="90d">Últimos 90 días</option>
          </select>
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
            aria-label="Actualizar"
          >
            <RefreshCw className={`h-5 w-5 text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {data && (
        <>
          {/* Summary Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-1">
                <Search className="h-4 w-4 text-blue-500" />
                <span className="text-xs font-medium text-slate-500">Total búsquedas</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{data.summary.totalSearches}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="h-4 w-4 text-purple-500" />
                <span className="text-xs font-medium text-slate-500">Búsquedas únicas</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{data.summary.uniqueQueries}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-xs font-medium text-slate-500">Sin resultados</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{data.summary.zeroResults}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-medium text-slate-500">Tasa sin resultado</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{data.summary.zeroResultRate}%</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-xs font-medium text-slate-500">Tasa de clics</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{data.summary.clickRate}%</p>
            </div>
          </div>

          {/* Tables */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Top Searches */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Top Búsquedas</h3>
                {data.topSearches.length > 0 && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                    {Math.min(topSearchesVisible, data.topSearches.length)} de {data.topSearches.length}
                  </span>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Búsqueda</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Veces</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Resultados</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {data.topSearches.slice(0, topSearchesVisible).map((search) => (
                      <tr key={search.query} className="hover:bg-slate-50">
                        <td className="px-6 py-3 text-sm text-slate-900 font-medium">{search.query}</td>
                        <td className="px-6 py-3 text-sm text-slate-600 text-right">{search.count}</td>
                        <td className="px-6 py-3 text-sm text-slate-600 text-right">
                          <span className={search.avgResults === 0 ? 'text-red-600 font-medium' : ''}>
                            {search.avgResults}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {data.topSearches.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-slate-500 text-sm">
                          Sin datos de búsquedas aún
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {/* Show more / less for top searches */}
              {data.topSearches.length > TABLE_INITIAL && (
                <div className="px-6 py-3 border-t border-slate-100 flex justify-center">
                  {topSearchesVisible < data.topSearches.length ? (
                    <button
                      onClick={() => setTopSearchesVisible(v => Math.min(v + 10, data.topSearches.length))}
                      className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium py-1 px-3 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <ChevronDown className="h-4 w-4" />
                      Mostrar más ({data.topSearches.length - topSearchesVisible} más)
                    </button>
                  ) : (
                    <button
                      onClick={() => setTopSearchesVisible(TABLE_INITIAL)}
                      className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 font-medium py-1 px-3 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <ChevronUp className="h-4 w-4" />
                      Mostrar menos
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Zero Results */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Búsquedas Sin Resultados</h3>
                  <p className="text-xs text-slate-500 mt-1">Considera agregar estos productos o sinónimos</p>
                </div>
                {data.topZeroResults.length > 0 && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-500 border border-red-100">
                    {Math.min(zeroResultsVisible, data.topZeroResults.length)} de {data.topZeroResults.length}
                  </span>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Búsqueda</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Veces</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {data.topZeroResults.slice(0, zeroResultsVisible).map((search) => (
                      <tr key={search.query} className="hover:bg-red-50">
                        <td className="px-6 py-3 text-sm text-red-700 font-medium">{search.query}</td>
                        <td className="px-6 py-3 text-sm text-red-600 text-right font-medium">{search.count}</td>
                      </tr>
                    ))}
                    {data.topZeroResults.length === 0 && (
                      <tr>
                        <td colSpan={2} className="px-6 py-8 text-center text-green-600 text-sm">
                          Todas las búsquedas devolvieron resultados
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {/* Show more / less for zero results */}
              {data.topZeroResults.length > TABLE_INITIAL && (
                <div className="px-6 py-3 border-t border-slate-100 flex justify-center">
                  {zeroResultsVisible < data.topZeroResults.length ? (
                    <button
                      onClick={() => setZeroResultsVisible(v => Math.min(v + 10, data.topZeroResults.length))}
                      className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 font-medium py-1 px-3 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <ChevronDown className="h-4 w-4" />
                      Mostrar más ({data.topZeroResults.length - zeroResultsVisible} más)
                    </button>
                  ) : (
                    <button
                      onClick={() => setZeroResultsVisible(TABLE_INITIAL)}
                      className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 font-medium py-1 px-3 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <ChevronUp className="h-4 w-4" />
                      Mostrar menos
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}