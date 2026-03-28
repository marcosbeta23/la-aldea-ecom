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
  const [priceOpen, setPriceOpen] = useState(true);
  const [priceMin, setPriceMin] = useState(searchParams.get('precio_min') || '');
  const [priceMax, setPriceMax] = useState(searchParams.get('precio_max') || '');

  const currentCategory = searchParams.get('categoria') || '';
  const currentBrand = searchParams.get('marca') || '';
  const currentStock = searchParams.get('stock') || '';
  const currentSort = searchParams.get('orden') || 'popular';
  const currentPriceMin = searchParams.get('precio_min') || '';
  const currentPriceMax = searchParams.get('precio_max') || '';

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // When changing category, clear subcategory
    if (key === 'categoria') {
      params.delete('sub');
    }
    params.delete('page');
    router.push(`/productos?${params.toString()}`);
  };

  const applyPriceFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (priceMin) {
      params.set('precio_min', priceMin);
    } else {
      params.delete('precio_min');
    }
    if (priceMax) {
      params.set('precio_max', priceMax);
    } else {
      params.delete('precio_max');
    }
    params.delete('page');
    router.push(`/productos?${params.toString()}`);
  };

  const clearAllFilters = () => {
    setPriceMin('');
    setPriceMax('');
    router.push('/productos');
  };

  const hasActiveFilters = !!(currentCategory || currentBrand || currentStock || currentPriceMin || currentPriceMax);
  const activeCount = [currentCategory, currentBrand, currentStock, currentPriceMin || currentPriceMax].filter(Boolean).length;

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
          className="lg:hidden fixed inset-0 bg-black/50 z-60"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Filters panel — mobile: slide-up drawer, desktop: inline */}
      <div
        className={`
          lg:block!
          ${isOpen
            ? 'fixed inset-x-0 bottom-0 z-70 bg-white rounded-t-2xl shadow-2xl max-h-[85vh] overflow-y-auto p-5 pb-8 lg:relative lg:inset-auto lg:z-auto lg:shadow-none lg:rounded-none lg:p-0 lg:max-h-none'
            : 'hidden'
          }
        `}
        style={isOpen ? { animation: 'slideUp 0.25s ease-out' } : undefined}
      >
        {/* Mobile drawer handle + close */}
        <div className="lg:hidden flex items-center justify-between mb-4">
          <div className="w-10 h-1 rounded-full bg-slate-300" />
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-lg"
            aria-label="Cerrar filtros"
          >
            <X className="h-5 w-5" />
          </button>
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
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50/80 border border-blue-100 text-blue-700 rounded-lg text-xs font-semibold shadow-sm">
                {currentCategory}
                <button onClick={() => updateFilter('categoria', '')} className="hover:text-blue-900 ml-0.5" aria-label="Quitar filtro categoría">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {currentBrand && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50/80 border border-blue-100 text-blue-700 rounded-lg text-xs font-semibold shadow-sm">
                {currentBrand}
                <button onClick={() => updateFilter('marca', '')} className="hover:text-blue-900 ml-0.5" aria-label="Quitar filtro marca">
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
            {(currentPriceMin || currentPriceMax) && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium">
                {currentPriceMin && currentPriceMax
                  ? `$${currentPriceMin} - $${currentPriceMax}`
                  : currentPriceMin
                    ? `Desde $${currentPriceMin}`
                    : `Hasta $${currentPriceMax}`}
                <button
                  onClick={() => {
                    setPriceMin('');
                    setPriceMax('');
                    const params = new URLSearchParams(searchParams.toString());
                    params.delete('precio_min');
                    params.delete('precio_max');
                    params.delete('page');
                    router.push(`/productos?${params.toString()}`);
                  }}
                  className="hover:text-purple-900"
                  aria-label="Quitar filtro precio"
                >
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
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200/60 shadow-sm text-sm bg-slate-50/50 hover:bg-white transition-colors focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 cursor-pointer"
                aria-label="Ordenar productos"
              >
                <option value="popular">Más populares</option>
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
                  className={`block w-full text-left px-3 py-2 rounded-xl text-sm transition-all duration-200 border ${
                    !currentCategory
                      ? 'bg-blue-50/80 border-blue-100 text-blue-700 font-semibold shadow-sm'
                      : 'border-transparent text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Todas
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => updateFilter('categoria', cat.value)}
                    className={`flex items-center justify-between w-full text-left px-3 py-2 rounded-xl text-sm transition-all duration-200 border ${
                      currentCategory === cat.value
                        ? 'bg-blue-50/80 border-blue-100 text-blue-700 font-semibold shadow-sm'
                        : 'border-transparent text-slate-600 hover:bg-slate-50'
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
                  className={`block w-full text-left px-3 py-2 rounded-xl text-sm transition-all duration-200 border ${
                    !currentBrand
                      ? 'bg-blue-50/80 border-blue-100 text-blue-700 font-semibold shadow-sm'
                      : 'border-transparent text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Todas
                </button>
                {visibleBrands.map((brand) => (
                  <button
                    key={brand.value}
                    onClick={() => updateFilter('marca', brand.value)}
                    className={`flex items-center justify-between w-full text-left px-3 py-2 rounded-xl text-sm transition-all duration-200 border ${
                      currentBrand === brand.value
                        ? 'bg-blue-50/80 border-blue-100 text-blue-700 font-semibold shadow-sm'
                        : 'border-transparent text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate mr-2">{brand.label}</span>
                    {brand.count !== undefined && (
                      <span className="text-xs text-slate-400 tabular-nums shrink-0">{brand.count}</span>
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

          {/* ── Price Range ─────────────────── */}
          <div className="py-3 border-b border-slate-100">
            <button
              onClick={() => setPriceOpen(!priceOpen)}
              className="flex items-center justify-between w-full py-1 text-sm font-semibold text-slate-900"
            >
              Precio
              {priceOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
            </button>
            {priceOpen && (
              <div className="mt-2 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="Mín"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && applyPriceFilter()}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200/60 shadow-sm text-sm bg-slate-50/50 hover:bg-white transition-colors focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    aria-label="Precio mínimo"
                  />
                  <span className="text-slate-400 self-center text-xs shrink-0">—</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Máx"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && applyPriceFilter()}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200/60 shadow-sm text-sm bg-slate-50/50 hover:bg-white transition-colors focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    aria-label="Precio máximo"
                  />
                </div>
                <button
                  onClick={applyPriceFilter}
                  className="w-full py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  Aplicar
                </button>
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
