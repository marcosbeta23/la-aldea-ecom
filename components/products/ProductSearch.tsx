'use client';

import { useState, useTransition, useRef, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, Loader2, Tag, Layers, Package } from 'lucide-react';
import Image from 'next/image';
import { trackSearch } from '@/lib/analytics';

interface Suggestion {
  type: 'product' | 'category' | 'brand';
  id?: string;
  sku?: string;
  slug?: string;
  name: string;
  image?: string;
  price?: number;
  currency?: string;
  availability_type?: string;
}

interface ProductSearchProps {
  initialQuery?: string;
  theme?: 'light' | 'dark';
}

export default function ProductSearch({ initialQuery = '', theme = 'dark' }: ProductSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch suggestions with debounce
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(query);
    }, 200);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, fetchSuggestions]);

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);

    const params = new URLSearchParams(searchParams.toString());

    const trimmed = query.trim();
    if (trimmed) {
      params.set('q', trimmed);
    } else {
      params.delete('q');
    }

    params.delete('page');

    // Fire PostHog search event (resultCount unknown here, clickedResult false)
    trackSearch(trimmed, 0, false);

    startTransition(() => {
      router.push(`/productos?${params.toString()}`);
    });
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('q');
    params.delete('page');

    startTransition(() => {
      router.push(`/productos?${params.toString()}`);
    });
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setShowSuggestions(false);

    // Fire PostHog search event for suggestion click (clickedResult true)
    trackSearch(query.trim(), 0, true);

    if (suggestion.type === 'product' && suggestion.sku) {
      router.push(`/productos/${suggestion.slug ?? suggestion.sku}`);
    } else if (suggestion.type === 'category') {
      router.push(`/productos?categoria=${encodeURIComponent(suggestion.name)}`);
    } else if (suggestion.type === 'brand') {
      router.push(`/productos?marca=${encodeURIComponent(suggestion.name)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          e.preventDefault();
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const formatPrice = (price: number, currency: string = 'UYU') => {
    if (currency === 'USD') {
      return `U$S ${price.toLocaleString('es-UY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$ ${price.toLocaleString('es-UY', { maximumFractionDigits: 0 })}`;
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'category':
        return <Layers className="h-4 w-4 text-blue-500" />;
      case 'brand':
        return <Tag className="h-4 w-4 text-green-500" />;
      default:
        return <Package className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="relative max-w-xl">
      <form onSubmit={handleSearch}>
        <div className="relative">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${theme === 'light' ? 'text-slate-400' : 'text-white/50'}`} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
              setSelectedIndex(-1);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar productos, marcas o categorías..."
            className={`w-full pl-12 pr-24 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
              theme === 'light'
                ? 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 shadow-sm'
                : 'bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/60 focus:ring-white/30 focus:bg-white/15'
            }`}
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className={`absolute right-24 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${
                theme === 'light' 
                  ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
              aria-label="Limpiar búsqueda"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-white text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-70"
            aria-label="Buscar productos"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Buscar'
            )}
          </button>
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && (suggestions.length > 0 || isLoadingSuggestions) && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 origin-top"
        >
          <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
            {isLoadingSuggestions && suggestions.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-500" />
                <p className="text-sm font-medium">Buscando...</p>
              </div>
            ) : suggestions.length === 0 && query.length >= 2 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Search className="h-6 w-6 text-slate-300" />
                </div>
                <p className="text-sm font-bold text-slate-900 mb-1">No se encontraron resultados</p>
                <p className="text-xs text-slate-500">Probá con otros términos o revisá la ortografía.</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-50">
                {suggestions.map((suggestion, index) => (
                <li key={`${suggestion.type}-${suggestion.name}-${index}`}>
                  <button
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-all duration-200 ${selectedIndex === index ? 'bg-blue-50/80 pl-7' : 'hover:bg-slate-50'
                      }`}
                  >
                    {suggestion.type === 'product' && suggestion.image ? (
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                        <Image
                          src={suggestion.image}
                          alt={suggestion.name}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                        {getSuggestionIcon(suggestion.type)}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {suggestion.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {suggestion.type === 'category' && 'Categoría'}
                        {suggestion.type === 'brand' && 'Marca'}
                        {suggestion.type === 'product' && (
                          (suggestion.availability_type === 'on_request' || suggestion.price === 0 || suggestion.price === 9999)
                            ? 'Consulta'
                            : suggestion.price && formatPrice(suggestion.price, suggestion.currency)
                        )}
                      </p>
                    </div>

                    {suggestion.type !== 'product' && (
                      <span className="text-xs text-blue-600 font-medium">
                        Ver todos →
                      </span>
                    )}
                  </button>
                </li>
              ))}
              </ul>
            )}
          </div>
          
          {query.trim() && (
            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Presiona <span className="text-blue-600 px-1">Enter</span> para buscar todo
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
