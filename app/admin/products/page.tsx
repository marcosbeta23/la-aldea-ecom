'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { normalizeCategory } from '@/lib/validators';
import { CATEGORY_HIERARCHY } from '@/lib/categories';
import {
  Plus,
  Search,
  Edit2,
  Eye,
  Package,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Upload,
  X,
  ImageOff,
  CheckSquare,
  Square,
  ToggleLeft,
  ToggleRight,
  Loader2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  LayoutGrid,
  List,
  SlidersHorizontal,
  PackageCheck,
  PackageX,
  Camera,
  RefreshCw,
  Trash2,
  Tag,
  Star,
  GripVertical,
  Download,
  ChevronDown,
} from 'lucide-react';

// ── Known Categories ───────────────────────────────────────────────────

const KNOWN_CATEGORIES = CATEGORY_HIERARCHY.map(c => c.value);
// All options including subcategories for the bulk category modal
const ALL_CATEGORY_OPTIONS = CATEGORY_HIERARCHY.flatMap(c => [
  c.value,
  ...c.subcategories.map(s => s.value),
]);


// ── Types ──────────────────────────────────────────────────────────────

interface Product {
  id: string;
  sku: string;
  slug: string | null;
  name: string;
  description: string | null;
  category: string[];
  brand: string | null;
  price_numeric: number;
  currency: string;
  stock: number;
  sold_count: number;
  images: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  is_featured: boolean;
  availability_type: string;
  shipping_type?: string;
  weight_kg?: number | null;
  requires_quote?: boolean;
  original_price_numeric?: number | null;
  discount_percentage?: number | null;
  show_price_on_request?: boolean;
}

interface Filters {
  search: string;
  category: string;
  brand: string;
  status: string;
  hasImages: string;
  sort: string;
  order: string;
  perPage: number;
}

// ── Helpers ────────────────────────────────────────────────────────────

const formatCurrency = (value: number, currency: string = 'UYU') => {
  const prefix = currency === 'USD' ? 'U$S' : '$';
  const decimals = currency === 'USD' ? 2 : 0;
  return `${prefix} ${value.toLocaleString('es-UY', { maximumFractionDigits: decimals })}`;
};

// ── Main Component ─────────────────────────────────────────────────────

export default function ProductsPage() {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem('la-aldea-admin-product-page');
        if (saved) return parseInt(saved, 10) || 1;
      } catch { }
    }
    return 1;
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [showBulkCategoryModal, setShowBulkCategoryModal] = useState(false);
  const [bulkCategories, setBulkCategories] = useState<string[]>([]);
  const [bulkCategoryInput, setBulkCategoryInput] = useState('');
  const [bulkCategoryMode, setBulkCategoryMode] = useState<'replace' | 'add' | 'remove'>('add');
  const [showBulkCatSuggestions, setShowBulkCatSuggestions] = useState(false);
  const bulkCatInputRef = useRef<HTMLInputElement>(null);

  // Featured modal state
  const [showFeaturedModal, setShowFeaturedModal] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(false);
  const [featuredSaving, setFeaturedSaving] = useState(false);
  const [featuredSearch, setFeaturedSearch] = useState('');
  const [featuredSearchResults, setFeaturedSearchResults] = useState<Product[]>([]);
  const [featuredSearchLoading, setFeaturedSearchLoading] = useState(false);
  const featuredSearchRef = useRef<HTMLInputElement>(null);
  const featuredDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Stats
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, noImage: 0 });

  const [filters, setFilters] = useState<Filters>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem('la-aldea-admin-product-filters');
        if (saved) return JSON.parse(saved);
      } catch { }
    }
    return {
      search: '',
      category: '',
      brand: '',
      status: '',
      hasImages: '',
      sort: 'created_at',
      order: 'desc',
      perPage: 50,
    };
  });

  // ── Fetch products ──────────────────────────────────────────────────

  const fetchProducts = useCallback(async (currentFilters: Filters, currentPage: number, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams();
      params.set('page', String(currentPage));
      params.set('perPage', String(currentFilters.perPage));
      if (currentFilters.search) params.set('search', currentFilters.search);
      if (currentFilters.category) params.set('category', currentFilters.category);
      if (currentFilters.brand) params.set('brand', currentFilters.brand);
      if (currentFilters.status) params.set('status', currentFilters.status);
      if (currentFilters.hasImages) params.set('hasImages', currentFilters.hasImages);
      params.set('sort', currentFilters.sort);
      params.set('order', currentFilters.order);

      const res = await fetch(`/api/admin/products?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setProducts(data.products || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 0);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ── Fetch categories & brands for filters ──────────────────────────

  const fetchFilterOptions = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/products/filters');
      const data = await res.json();
      setCategories(data.categories || []);
      setBrands(data.brands || []);
    } catch (err) {
      console.error('Error fetching filter options:', err);
    }
  }, []);

  // ── Fetch stats ────────────────────────────────────────────────────

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/products/stats');
      const data = await res.json();
      setStats({
        total: data.total || 0,
        active: data.active || 0,
        inactive: data.inactive || 0,
        noImage: 0,
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, []);

  // ── Effects ─────────────────────────────────────────────────────────

  // Persist filters & page to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem('la-aldea-admin-product-filters', JSON.stringify(filters));
      sessionStorage.setItem('la-aldea-admin-product-page', String(page));
    } catch { }
  }, [filters, page]);

  useEffect(() => {
    fetchFilterOptions();
    fetchStats();
  }, [fetchFilterOptions, fetchStats]);

  useEffect(() => {
    fetchProducts(filters, page);
  }, [filters, page, fetchProducts]);

  // Count no-image products from current view
  useEffect(() => {
    const noImg = products.filter(p => !p.images || p.images.length === 0).length;
    setStats(prev => ({ ...prev, noImage: noImg }));
  }, [products]);

  // ── Handlers ────────────────────────────────────────────────────────

  const handleSearchChange = (value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: value }));
      setPage(1);
    }, 200);
  };

  const updateFilter = (key: keyof Filters, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
    setSelectedIds(new Set());
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      brand: '',
      status: '',
      hasImages: '',
      sort: 'created_at',
      order: 'desc',
      perPage: 50,
    });
    setPage(1);
    setSelectedIds(new Set());
    if (searchInputRef.current) searchInputRef.current.value = '';
  };

  const toggleSort = (field: string) => {
    setFilters(prev => ({
      ...prev,
      sort: field,
      order: prev.sort === field && prev.order === 'asc' ? 'desc' : 'asc',
    }));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map(p => p.id)));
    }
  };

  // ── Bulk actions ───────────────────────────────────────────────────

  const bulkToggleActive = async (activate: boolean) => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);

    try {
      const promises = [...selectedIds].map(id => {
        const product = products.find(p => p.id === id);
        if (!product) return Promise.resolve();
        return fetch(`/api/admin/products/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sku: product.sku,
            name: product.name,
            description: product.description,
            category: product.category,
            brand: product.brand,
            price_numeric: product.price_numeric,
            currency: product.currency,
            stock: product.stock,
            images: product.images,
            is_active: activate,
            availability_type: product.availability_type || 'regular',
            shipping_type: product.shipping_type || 'dac',
            weight_kg: product.weight_kg ?? null,
            requires_quote: product.requires_quote ?? false,
            is_featured: product.is_featured,
            original_price_numeric: product.original_price_numeric ?? null,
            discount_percentage: product.discount_percentage ?? null,
            slug: product.slug,
          }),
        });
      });
      await Promise.all(promises);
      setSelectedIds(new Set());
      fetchProducts(filters, page, true);
      fetchStats();
    } catch (err) {
      console.error('Bulk update error:', err);
    } finally {
      setBulkLoading(false);
    }
  };

  const bulkDelete = async () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    const confirmed = window.confirm(
      `¿Estás seguro de que querés eliminar ${count} producto${count > 1 ? 's' : ''}? Esta acción no se puede deshacer.`
    );
    if (!confirmed) return;

    setBulkLoading(true);
    try {
      const promises = [...selectedIds].map(id =>
        fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
      );
      await Promise.all(promises);
      setSelectedIds(new Set());
      fetchProducts(filters, page, true);
      fetchStats();
    } catch (err) {
      console.error('Bulk delete error:', err);
    } finally {
      setBulkLoading(false);
    }
  };

  const bulkTogglePriceOnRequest = async (showPrice: boolean) => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);

    try {
      const promises = [...selectedIds].map(id => {
        const product = products.find(p => p.id === id);
        if (!product) return Promise.resolve();
        return fetch(`/api/admin/products/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sku: product.sku,
            name: product.name,
            description: product.description,
            category: product.category,
            brand: product.brand,
            price_numeric: product.price_numeric,
            currency: product.currency,
            stock: product.stock,
            images: product.images,
            is_active: product.is_active,
            availability_type: product.availability_type || 'regular',
            show_price_on_request: showPrice,
            shipping_type: product.shipping_type || 'dac',
            weight_kg: product.weight_kg ?? null,
            requires_quote: product.requires_quote ?? false,
            is_featured: product.is_featured,
            original_price_numeric: product.original_price_numeric ?? null,
            discount_percentage: product.discount_percentage ?? null,
            slug: product.slug,
          }),
        });
      });
      await Promise.all(promises);
      setSelectedIds(new Set());
      fetchProducts(filters, page, true);
      fetchStats();
    } catch (err) {
      console.error('Bulk price toggle error:', err);
    } finally {
      setBulkLoading(false);
    }
  };

  // ── Bulk category edit ─────────────────────────────────────────────

  const openBulkCategoryModal = () => {
    setBulkCategories([]);
    setBulkCategoryInput('');
    setBulkCategoryMode('add');
    setShowBulkCategoryModal(true);
  };

  const addBulkCategory = (cat: string) => {
    const normalized = normalizeCategory(cat);
    if (normalized && !bulkCategories.some(c => c.toLowerCase() === normalized.toLowerCase())) {
      setBulkCategories(prev => [...prev, normalized]);
    }
    setBulkCategoryInput('');
    setShowBulkCatSuggestions(false);
    bulkCatInputRef.current?.focus();
  };

  const removeBulkCategory = (cat: string) => {
    setBulkCategories(prev => prev.filter(c => c !== cat));
  };

  const bulkEditCategories = async () => {
    if (selectedIds.size === 0 || bulkCategories.length === 0) return;
    setBulkLoading(true);

    try {
      const promises = [...selectedIds].map(async (id) => {
        const product = products.find(p => p.id === id);
        if (!product) return;

        let newCategories: string[];
        const current = product.category || [];

        if (bulkCategoryMode === 'replace') {
          newCategories = [...bulkCategories];
        } else if (bulkCategoryMode === 'add') {
          // Case-insensitive merge: keep existing casing, add only truly new ones
          const currentLower = current.map(c => c.toLowerCase());
          const toAdd = bulkCategories.filter(c => !currentLower.includes(c.toLowerCase()));
          newCategories = [...current, ...toAdd];
        } else {
          // remove — case-insensitive
          const removeLower = bulkCategories.map(c => c.toLowerCase());
          newCategories = current.filter(c => !removeLower.includes(c.toLowerCase()));
        }

        return fetch(`/api/admin/products/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sku: product.sku,
            name: product.name,
            description: product.description,
            category: newCategories,
            brand: product.brand,
            price_numeric: product.price_numeric,
            currency: product.currency,
            stock: product.stock,
            images: product.images,
            is_active: product.is_active,
            availability_type: product.availability_type || 'regular',
            shipping_type: product.shipping_type || 'dac',
            weight_kg: product.weight_kg ?? null,
            requires_quote: product.requires_quote ?? false,
            is_featured: product.is_featured,
            original_price_numeric: product.original_price_numeric ?? null,
            discount_percentage: product.discount_percentage ?? null,
            slug: product.slug,
          }),
        });
      });

      await Promise.all(promises);
      setShowBulkCategoryModal(false);
      setSelectedIds(new Set());
      fetchProducts(filters, page, true);
      fetchFilterOptions();
    } catch (err) {
      console.error('Bulk category edit error:', err);
    } finally {
      setBulkLoading(false);
    }
  };

  // ── Quick availability toggle ──────────────────────────────────────

  const quickToggleAvailability = async (product: Product) => {
    const newType = product.availability_type === 'on_request' ? 'regular' : 'on_request';
    // Optimistically update UI
    setProducts(prev => prev.map(p =>
      p.id === product.id ? { ...p, availability_type: newType } : p
    ));
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku: product.sku,
          name: product.name,
          description: product.description,
          category: product.category,
          brand: product.brand,
          price_numeric: product.price_numeric,
          currency: product.currency,
          stock: product.stock,
          images: product.images,
          is_active: product.is_active,
          availability_type: newType,
          shipping_type: product.shipping_type || 'dac',
          weight_kg: product.weight_kg ?? null,
          requires_quote: product.requires_quote ?? false,
          is_featured: product.is_featured,
          original_price_numeric: product.original_price_numeric ?? null,
          discount_percentage: product.discount_percentage ?? null,
          slug: product.slug,
        }),
      });
      if (!res.ok) throw new Error('Failed');
    } catch (err) {
      console.error('Toggle availability error:', err);
      // Revert on error
      setProducts(prev => prev.map(p =>
        p.id === product.id ? { ...p, availability_type: product.availability_type } : p
      ));
    }
  };

  // ── Featured products modal ─────────────────────────────────────────

  const openFeaturedModal = async () => {
    setShowFeaturedModal(true);
    setFeaturedLoading(true);
    setFeaturedSearch('');
    setFeaturedSearchResults([]);
    try {
      const res = await fetch('/api/admin/products/featured');
      const data = await res.json();
      setFeaturedProducts(data.products || []);
    } catch (err) {
      console.error('Error loading featured products:', err);
    } finally {
      setFeaturedLoading(false);
    }
  };

  const searchProductsForFeatured = useCallback(async (query: string) => {
    if (!query.trim()) {
      setFeaturedSearchResults([]);
      return;
    }
    setFeaturedSearchLoading(true);
    try {
      const res = await fetch(`/api/admin/products?search=${encodeURIComponent(query)}&perPage=10&sort=name&order=asc`);
      const data = await res.json();
      // Filter out already featured
      const featuredIds = new Set(featuredProducts.map(p => p.id));
      setFeaturedSearchResults(
        (data.products || []).filter((p: Product) => !featuredIds.has(p.id) && p.is_active)
      );
    } catch (err) {
      console.error('Error searching products:', err);
    } finally {
      setFeaturedSearchLoading(false);
    }
  }, [featuredProducts]);

  const handleFeaturedSearchChange = (value: string) => {
    setFeaturedSearch(value);
    if (featuredDebounceRef.current) clearTimeout(featuredDebounceRef.current);
    featuredDebounceRef.current = setTimeout(() => searchProductsForFeatured(value), 300);
  };

  const addToFeatured = (product: Product) => {
    setFeaturedProducts(prev => [...prev, { ...product, is_featured: true }]);
    setFeaturedSearchResults(prev => prev.filter(p => p.id !== product.id));
    setFeaturedSearch('');
  };

  const removeFromFeatured = (productId: string) => {
    setFeaturedProducts(prev => prev.filter(p => p.id !== productId));
  };

  const handleFeaturedDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleFeaturedDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleFeaturedDrop = (index: number) => {
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    setFeaturedProducts(prev => {
      const updated = [...prev];
      const [moved] = updated.splice(dragIndex, 1);
      updated.splice(index, 0, moved);
      return updated;
    });
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const moveFeatured = (from: number, direction: 'up' | 'down') => {
    const to = direction === 'up' ? from - 1 : from + 1;
    if (to < 0 || to >= featuredProducts.length) return;
    setFeaturedProducts(prev => {
      const updated = [...prev];
      [updated[from], updated[to]] = [updated[to], updated[from]];
      return updated;
    });
  };

  const saveFeaturedOrder = async () => {
    setFeaturedSaving(true);
    try {
      const res = await fetch('/api/admin/products/featured', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds: featuredProducts.map(p => p.id) }),
      });
      if (!res.ok) throw new Error('Failed to save');
      setShowFeaturedModal(false);
      fetchProducts(filters, page, true);
    } catch (err) {
      console.error('Error saving featured order:', err);
    } finally {
      setFeaturedSaving(false);
    }
  };

  // ── Active filter count ──────────────────────────────────────────

  const activeFilterCount = [
    filters.category,
    filters.brand,
    filters.status,
    filters.hasImages,
  ].filter(Boolean).length;

  const hasActiveFilters = activeFilterCount > 0 || filters.search;

  // ── Sort Button ────────────────────────────────────────────────────

  const SortButton = ({ field, label }: { field: string; label: string }) => (
    <button
      onClick={() => toggleSort(field)}
      className="flex items-center gap-1 text-xs font-medium text-slate-500 uppercase hover:text-slate-700 transition-colors"
    >
      {label}
      {filters.sort === field ? (
        filters.order === 'asc' ? (
          <ArrowUp className="h-3 w-3" />
        ) : (
          <ArrowDown className="h-3 w-3" />
        )
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-40" />
      )}
    </button>
  );

  return (
    <div className="space-y-4">
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Productos</h1>
          <p className="text-sm text-slate-500">
            {total.toLocaleString()} productos en total
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={openFeaturedModal}
            className="inline-flex items-center gap-2 px-3 py-2 border border-amber-300 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors text-sm font-medium"
          >
            <Star className="h-4 w-4" />
            <span className="hidden sm:inline">Destacados</span>
          </button>
          <a
            href="/api/admin/export?type=products"
            className="inline-flex items-center gap-2 px-3 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </a>
          <Link
            href="/admin/products/import"
            className="inline-flex items-center gap-2 px-3 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
          >
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Importar CSV</span>
          </Link>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            Nuevo
          </Link>
        </div>
      </div>

      {/* ── Stats Cards ──────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={() => { clearFilters(); }}
          className={`bg-white rounded-xl border p-4 text-left transition-all hover:shadow-sm ${
            !filters.status && !filters.hasImages ? 'border-blue-300 ring-1 ring-blue-100' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <Package className="h-5 w-5 text-slate-400" />
            <span className="text-2xl font-bold text-slate-900">{stats.total.toLocaleString()}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Total</p>
        </button>

        <button
          onClick={() => updateFilter('status', filters.status === 'active' ? '' : 'active')}
          className={`bg-white rounded-xl border p-4 text-left transition-all hover:shadow-sm ${
            filters.status === 'active' ? 'border-green-300 ring-1 ring-green-100' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <PackageCheck className="h-5 w-5 text-green-500" />
            <span className="text-2xl font-bold text-green-600">{stats.active.toLocaleString()}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Activos</p>
        </button>

        <button
          onClick={() => updateFilter('status', filters.status === 'inactive' ? '' : 'inactive')}
          className={`bg-white rounded-xl border p-4 text-left transition-all hover:shadow-sm ${
            filters.status === 'inactive' ? 'border-amber-300 ring-1 ring-amber-100' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <PackageX className="h-5 w-5 text-amber-500" />
            <span className="text-2xl font-bold text-amber-600">{stats.inactive.toLocaleString()}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Inactivos</p>
        </button>

        <button
          onClick={() => updateFilter('hasImages', filters.hasImages === 'no' ? '' : 'no')}
          className={`bg-white rounded-xl border p-4 text-left transition-all hover:shadow-sm ${
            filters.hasImages === 'no' ? 'border-red-300 ring-1 ring-red-100' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <ImageOff className="h-5 w-5 text-red-400" />
            <span className="text-2xl font-bold text-red-500">{stats.noImage}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Sin imagen (pág.)</p>
        </button>
      </div>

      {/* ── Search & Filters Bar ─────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 p-3">
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              defaultValue={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Buscar por nombre, SKU o marca..."
              className="w-full pl-9 pr-10 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-slate-300"
            />
            {filters.search && (
              <button
                onClick={() => { updateFilter('search', ''); if (searchInputRef.current) searchInputRef.current.value = ''; }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 hover:bg-slate-100 rounded-full transition-colors"
                title="Limpiar búsqueda"
              >
                <X className="h-4 w-4" />
              </button>
            )}

          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm border rounded-lg transition-colors ${
              showFilters || activeFilterCount > 0
                ? 'border-blue-300 bg-blue-50 text-blue-700'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filtros</span>
            {activeFilterCount > 0 && (
              <span className="ml-1 w-5 h-5 flex items-center justify-center bg-blue-600 text-white text-xs rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* View toggle */}
          <div className="hidden sm:flex items-center border border-slate-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 transition-colors ${viewMode === 'table' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
              title="Vista tabla"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
              title="Vista grilla"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>

          {/* Refresh */}
          <button
            onClick={() => { fetchProducts(filters, page, true); fetchStats(); }}
            className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors"
            title="Actualizar"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* ── Expanded Filters ──────────────────────────── */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider ml-1">Categoría</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <select
                    value={filters.category}
                    onChange={(e) => updateFilter('category', e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none hover:border-slate-300 transition-colors"
                    title="Filtrar por categoría"
                  >
                    <option value="">Todas las categorías</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Brand */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider ml-1">Marca</label>
                <div className="relative">
                  <Star className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <select
                    value={filters.brand}
                    onChange={(e) => updateFilter('brand', e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none hover:border-slate-300 transition-colors"
                    title="Filtrar por marca"
                  >
                    <option value="">Todas las marcas</option>
                    {brands.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider ml-1">Estado</label>
                <div className="relative">
                  <PackageCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <select
                    value={filters.status}
                    onChange={(e) => updateFilter('status', e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none hover:border-slate-300 transition-colors"
                    title="Filtrar por estado"
                  >
                    <option value="">Todos los estados</option>
                    <option value="active">Activos</option>
                    <option value="inactive">Inactivos</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Has Images */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider ml-1">Imágenes</label>
                <div className="relative">
                  <Camera className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <select
                    value={filters.hasImages}
                    onChange={(e) => updateFilter('hasImages', e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none hover:border-slate-300 transition-colors"
                    title="Filtrar por imágenes"
                  >
                    <option value="">Todas</option>
                    <option value="yes">Con imágenes</option>
                    <option value="no">Sin imágenes</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Pagination settings in filters */}
            <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Mostrar</span>
                  <select
                    value={filters.perPage}
                    onChange={(e) => updateFilter('perPage', parseInt(e.target.value, 10))}
                    className="px-2 py-1 text-xs border border-slate-200 rounded bg-white focus:outline-none"
                    title="Productos por página"
                  >
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={200}>200</option>
                  </select>
                  <span className="text-xs text-slate-500">por página</span>
                </div>
              </div>

              <button
                onClick={clearFilters}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 px-2 py-1 hover:bg-blue-50 rounded transition-colors"
                title="Limpiar todos los filtros"
              >
                <RefreshCw className="h-3 w-3" />
                Limpiar filtros
              </button>
            </div>
          </div>
        )}

        {/* ── Active filter tags ──────────────────────────── */}
        {hasActiveFilters && !showFilters && (
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {filters.search && (
              <FilterTag label={`"${filters.search}"`} onRemove={() => { updateFilter('search', ''); if (searchInputRef.current) searchInputRef.current.value = ''; }} />
            )}
            {filters.category && (
              <FilterTag label={filters.category} onRemove={() => updateFilter('category', '')} />
            )}
            {filters.brand && (
              <FilterTag label={filters.brand} onRemove={() => updateFilter('brand', '')} />
            )}
            {filters.status && (
              <FilterTag label={filters.status === 'active' ? 'Activos' : 'Inactivos'} onRemove={() => updateFilter('status', '')} />
            )}
            {filters.hasImages && (
              <FilterTag label={filters.hasImages === 'yes' ? 'Con imagen' : 'Sin imagen'} onRemove={() => updateFilter('hasImages', '')} />
            )}
            <button onClick={clearFilters} className="text-xs text-slate-500 hover:text-blue-600 ml-1">
              Limpiar todo
            </button>
          </div>
        )}
      </div>

      {/* ── Bulk Actions Bar ───────────────────────────── */}
      {selectedIds.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between animate-in slide-in-from-top-2">
          <span className="text-sm font-medium text-blue-800">
            {selectedIds.size} producto{selectedIds.size > 1 ? 's' : ''} seleccionado{selectedIds.size > 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => bulkToggleActive(true)}
              disabled={bulkLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {bulkLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ToggleRight className="h-3.5 w-3.5" />}
              Activar
            </button>
            <button
              onClick={() => bulkToggleActive(false)}
              disabled={bulkLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
            >
              {bulkLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ToggleLeft className="h-3.5 w-3.5" />}
              Desactivar
            </button>
            <button
              onClick={openBulkCategoryModal}
              disabled={bulkLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {bulkLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Tag className="h-3.5 w-3.5" />}
              Categorías
            </button>
            <button
              onClick={bulkDelete}
              disabled={bulkLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {bulkLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              Eliminar
            </button>
 
            <div className="h-6 w-px bg-blue-200 mx-1" />
 
            <button
              onClick={() => bulkTogglePriceOnRequest(true)}
              disabled={bulkLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white text-blue-700 border border-blue-200 rounded-lg hover:bg-white/80 transition-colors disabled:opacity-50"
              title="Mostrar precio aunque esté en modo Consulta"
            >
              {bulkLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5" />}
              Mostrar Precio
            </button>
            <button
              onClick={() => bulkTogglePriceOnRequest(false)}
              disabled={bulkLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              title="Ocultar precio en modo Consulta"
            >
              {bulkLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5" opacity={0.5} />}
              Ocultar Precio
            </button>
 
            <button
              onClick={() => setSelectedIds(new Set())}
              className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
              title="Deseleccionar todo"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Loading State ──────────────────────────────────── */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )}

      {/* ── Table View ───────────────────────────────────────── */}
      {!loading && viewMode === 'table' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] table-fixed">
              <colgroup>
                <col className="w-10" />
                <col className="w-56" />
                <col className="w-32" />
                <col className="w-36" />
                <col className="w-28" />
                <col className="w-16" />
                <col className="w-14" />
                <col className="w-28" />
                <col className="w-20" />
              </colgroup>
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-3 py-3 w-10">
                    <button onClick={toggleSelectAll} className="text-slate-400 hover:text-slate-600" title="Seleccionar todos">
                      {selectedIds.size === products.length && products.length > 0 ? (
                        <CheckSquare className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <SortButton field="name" label="Producto" />
                  </th>
                  <th className="px-4 py-3 text-left">
                    <SortButton field="sku" label="SKU" />
                  </th>
                  <th className="px-4 py-3 text-left">
                    <SortButton field="category" label="Categoría" />
                  </th>
                  <th className="px-4 py-3 text-left">
                    <SortButton field="price_numeric" label="Precio" />
                  </th>
                  <th className="px-4 py-3 text-left">
                    <SortButton field="stock" label="Stock" />
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">
                    Img
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      selectedIds.has(product.id) ? 'bg-blue-50/50' : ''
                    } ${!product.is_active ? 'opacity-60' : ''}`}
                  >
                    {/* Checkbox */}
                    <td className="px-3 py-3">
                      <button onClick={() => toggleSelect(product.id)} className="text-slate-400 hover:text-slate-600" title="Seleccionar producto">
                        {selectedIds.has(product.id) ? (
                          <CheckSquare className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>
                    </td>

                    {/* Product Name + Image */}
                    <td className="px-4 py-3">
                      <Link href={`/admin/products/${product.id}`} className="flex items-center gap-3 group">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                          {product.images?.[0] ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Package className="h-4 w-4 text-slate-300" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                            {product.name}
                          </p>
                          {product.brand && (
                            <p className="text-xs text-slate-400">{product.brand}</p>
                          )}
                        </div>
                      </Link>
                    </td>

                    {/* SKU */}
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-slate-500">{product.sku}</span>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3 max-w-[140px]">
                      {product.category && product.category.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {product.category.slice(0, 2).map((cat: string) => (
                            <button
                              key={cat}
                              onClick={() => updateFilter('category', cat)}
                              className="text-xs font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200 transition-colors whitespace-nowrap"
                            >
                              {cat}
                            </button>
                          ))}
                          {product.category.length > 2 && (
                            <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 text-slate-400 rounded-md whitespace-nowrap">
                              +{product.category.length - 2}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-300">&mdash;</span>
                      )}
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-slate-900">
                        {product.availability_type === 'on_request'
                          ? <span className="text-purple-600 text-xs font-semibold">Consultar</span>
                          : formatCurrency(product.price_numeric, product.currency)
                        }
                      </span>
                    </td>

                    {/* Stock */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {product.stock === 0 ? (
                          <span className="text-xs font-medium text-red-600 bg-red-50 px-1.5 py-0.5 rounded">0</span>
                        ) : product.stock <= 5 ? (
                          <>
                            <AlertTriangle className="h-3 w-3 text-amber-500" />
                            <span className="text-xs font-medium text-amber-600">{product.stock}</span>
                          </>
                        ) : (
                          <span className="text-xs font-medium text-slate-700">{product.stock}</span>
                        )}
                      </div>
                    </td>

                    {/* Image indicator */}
                    <td className="px-4 py-3 text-center">
                      {product.images && product.images.length > 0 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-green-50 text-green-600 rounded-full text-xs font-medium">
                          {product.images.length}
                        </span>
                      ) : (
                        <ImageOff className="h-4 w-4 text-slate-300 mx-auto" />
                      )}
                    </td>

                    {/* Status + Availability */}
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        product.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {product.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                      {/* Availability toggle — clic to switch between Consultar and regular */}
                      <button
                        onClick={(e) => { e.stopPropagation(); quickToggleAvailability(product); }}
                        title={product.availability_type === 'on_request'
                          ? 'Modo Consultar — clic para habilitar compra directa'
                          : 'Modo compra directa — clic para cambiar a Consultar'
                        }
                        className={`mt-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold transition-colors w-full justify-center ${
                          product.availability_type === 'on_request'
                            ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        {product.availability_type === 'on_request' ? 'Consultar' : 'Comprable'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/productos/${product.slug ?? product.sku}`}
                          target="_blank"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Ver en tienda"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Link>
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}

                {products.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-6 py-16 text-center">
                      <Package className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 font-medium">
                        {hasActiveFilters ? 'No hay productos que coincidan' : 'No hay productos'}
                      </p>
                      {hasActiveFilters && (
                        <button onClick={clearFilters} className="mt-2 text-sm text-blue-600 hover:text-blue-800">
                          Limpiar filtros
                        </button>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Grid View ────────────────────────────────────────── */}
      {!loading && viewMode === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/admin/products/${product.id}`}
              className={`bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-all group ${
                !product.is_active ? 'opacity-60' : ''
              }`}
            >
              {/* Image */}
              <div className="relative aspect-square bg-slate-100">
                {product.images?.[0] ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Package className="h-8 w-8 text-slate-300" />
                  </div>
                )}
                {/* Status badge */}
                <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    product.is_active ? 'bg-green-500 text-white' : 'bg-slate-500 text-white'
                  }`}>
                    {product.is_active ? 'ON' : 'OFF'}
                  </span>
                  {product.availability_type === 'on_request' && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500 text-white">
                      C
                    </span>
                  )}
                </div>
                {/* Image count */}
                {product.images && product.images.length > 1 && (
                  <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    <Camera className="h-3 w-3" />
                    {product.images.length}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="text-xs font-mono text-slate-400 mb-0.5">{product.sku}</p>
                <p className="text-sm font-medium text-slate-900 line-clamp-2 leading-tight">{product.name}</p>
                {product.category && product.category.length > 0 && (
                  <p className="text-[10px] font-medium text-slate-400 uppercase mt-1">{product.category.join(', ')}</p>
                )}
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-bold text-slate-900">
                    {product.availability_type === 'on_request'
                      ? <span className="text-purple-600 text-xs">Consultar</span>
                      : formatCurrency(product.price_numeric, product.currency)
                    }
                  </span>
                  <span className={`text-xs ${
                    product.stock === 0 ? 'text-red-500' : 'text-slate-400'
                  }`}>
                    Stock: {product.stock}
                  </span>
                </div>
              </div>
            </Link>
          ))}

          {products.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-16">
              <Package className="h-10 w-10 text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">
                {hasActiveFilters ? 'No hay productos que coincidan' : 'No hay productos'}
              </p>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="mt-2 text-sm text-blue-600 hover:text-blue-800">
                  Limpiar filtros
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Pagination ────────────────────────────────────────── */}
      {!loading && totalPages > 1 && (
        <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Página <span className="font-medium text-slate-900">{page}</span> de{' '}
            <span className="font-medium text-slate-900">{totalPages}</span>
            <span className="hidden sm:inline text-slate-400 ml-2">
              ({total.toLocaleString()} productos)
            </span>
          </p>
          <div className="flex items-center gap-1">
            {/* First page */}
            <button
              onClick={() => setPage(1)}
              disabled={page <= 1}
              className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                page <= 1
                  ? 'text-slate-300 cursor-not-allowed'
                  : page === 1 ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              1
            </button>

            {page > 3 && <span className="text-slate-300 text-xs">&hellip;</span>}

            {/* Pages around current */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(2, page - 2) + i;
              if (p >= totalPages || p <= 1) return null;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    p === page
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {p}
                </button>
              );
            })}

            {page < totalPages - 2 && <span className="text-slate-300 text-xs">&hellip;</span>}

            {/* Last page */}
            {totalPages > 1 && (
              <button
                onClick={() => setPage(totalPages)}
                className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  page === totalPages
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {totalPages}
              </button>
            )}

            {/* Prev/Next arrows */}
            <div className="ml-2 flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                title="Página anterior"
                className={`p-1.5 rounded-lg border transition-colors ${
                  page <= 1
                    ? 'border-slate-100 text-slate-300 cursor-not-allowed'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                title="Página siguiente"
                className={`p-1.5 rounded-lg border transition-colors ${
                  page >= totalPages
                    ? 'border-slate-100 text-slate-300 cursor-not-allowed'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── Bulk Category Edit Modal ──────────────────────────── */}
      {showBulkCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Editar Categorías</h3>
                <p className="text-sm text-slate-500">
                  {selectedIds.size} producto{selectedIds.size > 1 ? 's' : ''} seleccionado{selectedIds.size > 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => setShowBulkCategoryModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                title="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-4 space-y-4">
              {/* Mode selector */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Acción</label>
                <div className="flex gap-2">
                  {[
                    { value: 'add' as const, label: 'Agregar', desc: 'Añadir a las existentes' },
                    { value: 'replace' as const, label: 'Reemplazar', desc: 'Reemplazar todas' },
                    { value: 'remove' as const, label: 'Quitar', desc: 'Quitar de las existentes' },
                  ].map((mode) => (
                    <button
                      key={mode.value}
                      onClick={() => setBulkCategoryMode(mode.value)}
                      className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        bulkCategoryMode === mode.value
                          ? mode.value === 'remove'
                            ? 'border-red-300 bg-red-50 text-red-700'
                            : mode.value === 'replace'
                              ? 'border-amber-300 bg-amber-50 text-amber-700'
                              : 'border-blue-300 bg-blue-50 text-blue-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div>{mode.label}</div>
                      <div className="text-[10px] font-normal opacity-70 mt-0.5">{mode.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Category tags */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Categorías</label>
                <div className="border border-slate-200 rounded-lg p-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                  {/* Selected tags */}
                  {bulkCategories.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {bulkCategories.map((cat) => (
                        <span
                          key={cat}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                            bulkCategoryMode === 'remove'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {cat}
                          <button
                            onClick={() => removeBulkCategory(cat)}
                            className={`hover:${bulkCategoryMode === 'remove' ? 'text-red-900' : 'text-blue-900'}`}
                            title={`Quitar ${cat}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Input */}
                  <div className="relative">
                    <input
                      ref={bulkCatInputRef}
                      type="text"
                      value={bulkCategoryInput}
                      onChange={(e) => {
                        setBulkCategoryInput(e.target.value);
                        setShowBulkCatSuggestions(true);
                      }}
                      onFocus={() => setShowBulkCatSuggestions(true)}
                      onBlur={() => {
                        // Delay to allow button clicks to register
                        setTimeout(() => setShowBulkCatSuggestions(false), 150);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (bulkCategoryInput.trim()) addBulkCategory(bulkCategoryInput);
                        }
                        if (e.key === 'Backspace' && !bulkCategoryInput && bulkCategories.length > 0) {
                          removeBulkCategory(bulkCategories[bulkCategories.length - 1]);
                        }
                        if (e.key === 'Escape') {
                          setShowBulkCatSuggestions(false);
                        }
                      }}
                      placeholder={bulkCategories.length === 0 ? 'Escribí o elegí una categoría...' : 'Agregar otra...'}
                      className="w-full text-sm border-0 outline-none focus:ring-0 p-1 bg-transparent placeholder:text-slate-400"
                    />

                    {/* Suggestions dropdown — includes main categories AND all subcategories */}
                    {showBulkCatSuggestions && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 max-h-56 overflow-y-auto">
                        {ALL_CATEGORY_OPTIONS
                          .filter(c =>
                            !bulkCategories.some(bc => bc.toLowerCase() === c.toLowerCase()) &&
                            (!bulkCategoryInput || c.toLowerCase().includes(bulkCategoryInput.toLowerCase()))
                          )
                          .map((cat) => {
                            const isSub = !KNOWN_CATEGORIES.includes(cat);
                            return (
                              <button
                                key={cat}
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  addBulkCategory(cat);
                                }}
                                className={`w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors ${
                                  isSub ? 'pl-7' : 'font-medium'
                                }`}
                              >
                                {isSub && <span className="text-slate-400 mr-1">↳</span>}
                                {cat}
                              </button>
                            );
                          })
                        }
                        {bulkCategoryInput.trim() &&
                          !ALL_CATEGORY_OPTIONS.some(c => c.toLowerCase() === bulkCategoryInput.trim().toLowerCase()) &&
                          !bulkCategories.some(c => c.toLowerCase() === bulkCategoryInput.trim().toLowerCase()) && (
                            <button
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                addBulkCategory(bulkCategoryInput);
                              }}
                              className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-1.5"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              Crear &ldquo;{bulkCategoryInput.trim()}&rdquo;
                            </button>
                          )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Hint */}
              <p className="text-xs text-slate-400">
                {bulkCategoryMode === 'add' && 'Las categorías seleccionadas se agregarán a las existentes de cada producto.'}
                {bulkCategoryMode === 'replace' && 'Las categorías existentes serán reemplazadas por las seleccionadas.'}
                {bulkCategoryMode === 'remove' && 'Las categorías seleccionadas se quitarán de cada producto.'}
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
              <button
                onClick={() => setShowBulkCategoryModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={bulkEditCategories}
                disabled={bulkLoading || bulkCategories.length === 0}
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 ${
                  bulkCategoryMode === 'remove'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {bulkLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {bulkCategoryMode === 'add' && 'Agregar categorías'}
                {bulkCategoryMode === 'replace' && 'Reemplazar categorías'}
                {bulkCategoryMode === 'remove' && 'Quitar categorías'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Featured Products Modal ──────────────────────────── */}
      {showFeaturedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-500" />
                  Productos Destacados
                </h3>
                <p className="text-sm text-slate-500">
                  Arrastrá para reordenar. Aparecen en el carrusel de la página principal.
                </p>
              </div>
              <button
                onClick={() => setShowFeaturedModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                title="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {/* Search to add products */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  ref={featuredSearchRef}
                  type="text"
                  value={featuredSearch}
                  onChange={(e) => handleFeaturedSearchChange(e.target.value)}
                  placeholder="Buscar producto para agregar..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                {featuredSearchLoading && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 animate-spin" />
                )}

                {/* Search Results Dropdown */}
                {featuredSearchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                    {featuredSearchResults.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => addToFeatured(product)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-amber-50 transition-colors border-b border-slate-100 last:border-0"
                      >
                        <div className="h-10 w-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                          {product.images?.[0] ? (
                            <Image src={product.images[0]} alt="" width={40} height={40} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <Package className="h-4 w-4 text-slate-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{product.name}</p>
                          <p className="text-xs text-slate-500">{product.sku} · {formatCurrency(product.price_numeric, product.currency)}</p>
                        </div>
                        <Plus className="h-4 w-4 text-amber-600 shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
                {featuredSearch.trim() && !featuredSearchLoading && featuredSearchResults.length === 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 p-4 text-center text-sm text-slate-500">
                    No se encontraron productos
                  </div>
                )}
              </div>

              {/* Featured Products List */}
              {featuredLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
                </div>
              ) : featuredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <Star className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">No hay productos destacados.</p>
                  <p className="text-xs text-slate-400 mt-1">Usá la búsqueda de arriba para agregar productos.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">
                    {featuredProducts.length} producto{featuredProducts.length > 1 ? 's' : ''} en el carrusel
                  </p>
                  {featuredProducts.map((product, index) => (
                    <div
                      key={product.id}
                      draggable
                      onDragStart={() => handleFeaturedDragStart(index)}
                      onDragOver={(e) => handleFeaturedDragOver(e, index)}
                      onDrop={() => handleFeaturedDrop(index)}
                      onDragEnd={() => { setDragIndex(null); setDragOverIndex(null); }}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all cursor-grab active:cursor-grabbing ${
                        dragIndex === index
                          ? 'opacity-50 border-amber-300 bg-amber-50'
                          : dragOverIndex === index
                            ? 'border-amber-400 bg-amber-50 shadow-sm'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      {/* Drag handle */}
                      <GripVertical className="h-4 w-4 text-slate-400 shrink-0" />

                      {/* Position number */}
                      <span className="text-xs font-bold text-slate-400 w-5 text-center shrink-0">
                        {index + 1}
                      </span>

                      {/* Image */}
                      <div className="h-10 w-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                        {product.images?.[0] ? (
                          <Image src={product.images[0]} alt="" width={40} height={40} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Package className="h-4 w-4 text-slate-400" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{product.name}</p>
                        <p className="text-xs text-slate-500">{product.sku} · {formatCurrency(product.price_numeric, product.currency)}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => moveFeatured(index, 'up')}
                          disabled={index === 0}
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Mover arriba"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => moveFeatured(index, 'down')}
                          disabled={index === featuredProducts.length - 1}
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Mover abajo"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => removeFromFeatured(product.id)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Quitar de destacados"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
              <p className="text-xs text-slate-500">
                Los cambios se aplican al guardar
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFeaturedModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveFeaturedOrder}
                  disabled={featuredSaving}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
                >
                  {featuredSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Guardar orden
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Filter Tag Component ──────────────────────────────────────────────────

function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
      {label}
      <button onClick={onRemove} className="hover:text-blue-900" title="Quitar filtro">
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
