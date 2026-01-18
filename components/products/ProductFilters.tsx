'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { X, Filter, ChevronDown } from 'lucide-react';
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
    
    // Reset to page 1 when filters change
    params.delete('page');
    
    router.push(`/productos?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push('/productos');
  };

  const hasActiveFilters = currentCategory || currentBrand || currentStock;

  return (
    <div className={className}>
      {/* Mobile Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors w-full justify-center mb-4"
      >
        <Filter className="h-4 w-4" />
        Filtros
        {hasActiveFilters && (
          <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
            Activos
          </span>
        )}
      </button>

      {/* Filters Container */}
      <div className={`${isOpen ? 'block' : 'hidden'} lg:block space-y-6`}>
        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <X className="h-4 w-4" />
            Limpiar filtros
          </button>
        )}

        {/* Category Filter */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <ChevronDown className="h-4 w-4" />
            Categoría
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => updateFilter('categoria', '')}
              className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                !currentCategory
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Todas las categorías
            </button>
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => updateFilter('categoria', cat.value)}
                className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  currentCategory === cat.value
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat.label}
                {cat.count !== undefined && (
                  <span className="text-slate-400 ml-1">({cat.count})</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Brand Filter */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <ChevronDown className="h-4 w-4" />
            Marca
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            <button
              onClick={() => updateFilter('marca', '')}
              className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                !currentBrand
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Todas las marcas
            </button>
            {brands.map((brand) => (
              <button
                key={brand.value}
                onClick={() => updateFilter('marca', brand.value)}
                className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  currentBrand === brand.value
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {brand.label}
                {brand.count !== undefined && (
                  <span className="text-slate-400 ml-1">({brand.count})</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Stock Filter */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <ChevronDown className="h-4 w-4" />
            Disponibilidad
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => updateFilter('stock', '')}
              className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                !currentStock
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => updateFilter('stock', 'disponible')}
              className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                currentStock === 'disponible'
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              En stock
            </button>
          </div>
        </div>

        {/* Sort */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Ordenar por</h3>
          <select
            value={currentSort}
            onChange={(e) => updateFilter('orden', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="name">Nombre A-Z</option>
            <option value="name-desc">Nombre Z-A</option>
            <option value="price">Menor precio</option>
            <option value="price-desc">Mayor precio</option>
            <option value="newest">Más recientes</option>
          </select>
        </div>
      </div>
    </div>
  );
}
