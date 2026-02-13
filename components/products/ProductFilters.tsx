'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { X, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface ProductFiltersProps {
  categories: FilterOption[];
  brands: FilterOption[];
  className?: string;
}

export default function ProductFilters({ categories, brands, className = '' }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(true);
  const [brandOpen, setBrandOpen] = useState(true);
  const [stockOpen, setStockOpen] = useState(true);
  const [sortOpen, setSortOpen] = useState(true);

  const currentCategory = searchParams.get('categoria') || '';
  const currentBrand = searchParams.get('marca') || '';
  const currentStock = searchParams.get('stock') || '';
  const currentSort = searchParams.get('orden') || 'name';

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');
    router.push(`/productos?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push('/productos');
  };

  const hasActiveFilters = !!(currentCategory || currentBrand || currentStock);
  const activeCount = [currentCategory, currentBrand, currentStock].filter(Boolean).length;

  // Show first 8 brands by default, expand to show all
  const BRAND_LIMIT = 8;
  const visibleBrands = showAllBrands ? brands : brands.slice(0, BRAND_LIMIT);
  const hasMoreBrands = brands.length > BRAND_LIMIT;

  return (
    <div className={className}>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden flex items-center justify-between w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
        </span>
        <span className="flex items-center gap-2">
          {activeCount > 0 && (
            <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeCount}
            </span>
          )}
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </span>
      </button>

      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Filters panel — mobile: slide-up drawer, desktop: inline */}
      <div className={`
        lg:block
        ${isOpen
          ? 'fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-2xl max-h-[80vh] overflow-y-auto p-5 pb-8 animate-in slide-in-from-bottom lg:relative lg:inset-auto lg:z-auto lg:shadow-none lg:rounded-none lg:p-0 lg:max-h-none lg:animate-none'
          : 'hidden'
        }
      `}>
        {/* Mobile drawer handle */}
        <div className="lg:hidden flex justify-center mb-4">
          <div className="w-10 h-1 rounded-full bg-slate-300" />
        </div>

        {/* Header with clear */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Filtros</h2>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              <X className="h-3 w-3" />
              Limpiar
            </button>
          )}
        </div>

        {/* Active filter tags */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-1.5 mb-4 pb-4 border-b border-slate-100">
            {currentCategory && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                {currentCategory}
                <button onClick={() => updateFilter('categoria', '')} className="hover:text-blue-900" aria-label="Quitar filtro categoría">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {currentBrand && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                {currentBrand}
                <button onClick={() => updateFilter('marca', '')} className="hover:text-blue-900" aria-label="Quitar filtro marca">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {currentStock && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-medium">
                En stock
                <button onClick={() => updateFilter('stock', '')} className="hover:text-green-900" aria-label="Quitar filtro stock">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        )}

        <div className="space-y-1">
          {/* ── Sort ──────────────────────────── */}
          <div className="pb-3 border-b border-slate-100">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center justify-between w-full py-2 text-sm font-semibold text-slate-900"
            >
              Ordenar por
              {sortOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
            </button>
            {sortOpen && (
              <select
                value={currentSort}
                onChange={(e) => updateFilter('orden', e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Ordenar productos"
              >
                <option value="name">Nombre A-Z</option>
                <option value="name-desc">Nombre Z-A</option>
                <option value="price">Menor precio</option>
                <option value="price-desc">Mayor precio</option>
                <option value="newest">Más recientes</option>
              </select>
            )}
          </div>

          {/* ── Category ─────────────────────── */}
          <div className="py-3 border-b border-slate-100">
            <button
              onClick={() => setCategoryOpen(!categoryOpen)}
              className="flex items-center justify-between w-full py-1 text-sm font-semibold text-slate-900"
            >
              Categoría
              {categoryOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
            </button>
            {categoryOpen && (
              <div className="mt-2 space-y-0.5">
                <button
                  onClick={() => updateFilter('categoria', '')}
                  className={`block w-full text-left px-2.5 py-1.5 rounded-lg text-sm transition-colors ${
                    !currentCategory
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Todas
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => updateFilter('categoria', cat.value)}
                    className={`flex items-center justify-between w-full text-left px-2.5 py-1.5 rounded-lg text-sm transition-colors ${
                      currentCategory === cat.value
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cat.label}</span>
                    {cat.count !== undefined && (
                      <span className="text-xs text-slate-400 tabular-nums">{cat.count}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Brand ────────────────────────── */}
          <div className="py-3 border-b border-slate-100">
            <button
              onClick={() => setBrandOpen(!brandOpen)}
              className="flex items-center justify-between w-full py-1 text-sm font-semibold text-slate-900"
            >
              Marca
              {brandOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
            </button>
            {brandOpen && (
              <div className="mt-2 space-y-0.5">
                <button
                  onClick={() => updateFilter('marca', '')}
                  className={`block w-full text-left px-2.5 py-1.5 rounded-lg text-sm transition-colors ${
                    !currentBrand
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Todas
                </button>
                {visibleBrands.map((brand) => (
                  <button
                    key={brand.value}
                    onClick={() => updateFilter('marca', brand.value)}
                    className={`flex items-center justify-between w-full text-left px-2.5 py-1.5 rounded-lg text-sm transition-colors ${
                      currentBrand === brand.value
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate mr-2">{brand.label}</span>
                    {brand.count !== undefined && (
                      <span className="text-xs text-slate-400 tabular-nums flex-shrink-0">{brand.count}</span>
                    )}
                  </button>
                ))}
                {hasMoreBrands && (
                  <button
                    onClick={() => setShowAllBrands(!showAllBrands)}
                    className="w-full text-left px-2.5 py-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {showAllBrands ? 'Ver menos' : `Ver todas (${brands.length})`}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ── Stock ────────────────────────── */}
          <div className="py-3">
            <button
              onClick={() => setStockOpen(!stockOpen)}
              className="flex items-center justify-between w-full py-1 text-sm font-semibold text-slate-900"
            >
              Disponibilidad
              {stockOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
            </button>
            {stockOpen && (
              <div className="mt-2 space-y-0.5">
                <button
                  onClick={() => updateFilter('stock', '')}
                  className={`block w-full text-left px-2.5 py-1.5 rounded-lg text-sm transition-colors ${
                    !currentStock
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => updateFilter('stock', 'disponible')}
                  className={`block w-full text-left px-2.5 py-1.5 rounded-lg text-sm transition-colors ${
                    currentStock === 'disponible'
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  En stock
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile apply button */}
        <div className="lg:hidden mt-6">
          <button
            onClick={() => setIsOpen(false)}
            className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Ver resultados
          </button>
        </div>
      </div>
    </div>
  );
}
