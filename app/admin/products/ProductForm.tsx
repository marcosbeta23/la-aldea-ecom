'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, Trash2, X, Plus, Truck, Star, Tag } from 'lucide-react';
import ImageUpload from '@/components/admin/ImageUpload';

import { SHIPPING_TYPE_LABELS } from '@/lib/shipping';
import { CATEGORY_HIERARCHY, getSubcategories, isMainCategory } from '@/lib/categories';
import { normalizeCategory, normalizeBrand } from '@/lib/validators';
import type { ProductShippingType, ProductAvailabilityType } from '@/types/database';

interface Product {
  id?: string;
  sku: string;
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
  // Availability
  availability_type: ProductAvailabilityType;
  // Shipping fields
  shipping_type: ProductShippingType;
  weight_kg: number | null;
  requires_quote: boolean;
  // Featured & Discount fields
  is_featured: boolean;
  original_price_numeric: number | null;
  discount_percentage: number | null;
  slug: string | null;
}

function generateSlug(name: string, sku: string): string {
  const base = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  return `${base}-${sku.slice(0, 6).toLowerCase()}`;
}

const KNOWN_CATEGORIES = CATEGORY_HIERARCHY.map(c => c.value);

export default function ProductForm({ product }: { product?: any }) {
  const router = useRouter();
  const isEditing = !!product;
  
  const [formData, setFormData] = useState<Product>({
    sku: product?.sku || '',
    name: product?.name || '',
    description: product?.description || '',
    category: product?.category || [],
    brand: product?.brand?.trim() || '',
    price_numeric: product?.price_numeric || 0,
    currency: product?.currency || 'UYU',
    stock: product?.stock || 0,
    sold_count: product?.sold_count || 0,
    images: product?.images || [],
    is_active: product?.is_active ?? true,
    // Availability
    availability_type: product?.availability_type || 'regular',
    // Shipping defaults
    shipping_type: product?.shipping_type || 'dac',
    weight_kg: product?.weight_kg || null,
    requires_quote: product?.requires_quote ?? false,
    // Featured & Discount defaults
    is_featured: product?.is_featured ?? false,
    original_price_numeric: product?.original_price_numeric || null,
    discount_percentage: product?.discount_percentage || null,
    slug: product?.slug || null,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Brand autocomplete
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [brandQuery, setBrandQuery] = useState(formData.brand || '');
  const [showBrandSuggestions, setShowBrandSuggestions] = useState(false);
  const brandRef = useRef<HTMLDivElement>(null);

  // Category tag input
  const [categoryInput, setCategoryInput] = useState('');
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);

  // Fetch existing brands for autocomplete
  useEffect(() => {
    fetch('/api/admin/products?perPage=100&sort=brand&order=asc')
      .then(res => res.json())
      .then(data => {
        const brands = new Set<string>();
        (data.products || []).forEach((p: any) => {
          if (p.brand) brands.add(p.brand.trim());
        });
        setAvailableBrands([...brands].sort());
      })
      .catch(() => {});
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (brandRef.current && !brandRef.current.contains(e.target as Node)) {
        setShowBrandSuggestions(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
        setShowCategorySuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filteredBrands = availableBrands.filter(b =>
    b.toLowerCase().includes(brandQuery.toLowerCase().trim()) && b.toLowerCase() !== brandQuery.toLowerCase().trim()
  );

  // Get subcategory suggestions based on selected main categories
  const selectedMainCats = formData.category.filter(c => isMainCategory(c));
  const subcategorySuggestions = selectedMainCats.flatMap(mc =>
    getSubcategories(mc).map(s => s.value)
  ).filter(s => !formData.category.some(fc => fc.toLowerCase() === s.toLowerCase()));

  // Combine main categories + subcategory suggestions for the dropdown
  const allSuggestions = [...KNOWN_CATEGORIES, ...subcategorySuggestions];

  const filteredCategories = allSuggestions.filter(c =>
    c.toLowerCase().includes(categoryInput.toLowerCase().trim()) &&
    !formData.category.some(fc => fc.toLowerCase() === c.toLowerCase())
  );

  const addCategory = (cat: string) => {
    const normalized = normalizeCategory(cat);
    if (normalized && !formData.category.some(c => c.toLowerCase() === normalized.toLowerCase())) {
      setFormData(prev => ({ ...prev, category: [...prev.category, normalized] }));
    }
    setCategoryInput('');
    setShowCategorySuggestions(false);
  };

  const removeCategory = (cat: string) => {
    setFormData(prev => ({ ...prev, category: prev.category.filter(c => c !== cat) }));
  };
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'number') {
      // Allow empty and intermediate decimal input (e.g. "204." while typing "204.54")
      const parsed = value === '' ? 0 : Number(value);
      setFormData(prev => ({
        ...prev,
        [name]: isNaN(parsed) ? prev[name as keyof Product] : parsed,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  
  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      // Auto-generate slug only for new products (no existing slug in DB)
      slug: !product?.slug ? generateSlug(name, prev.sku) : prev.slug,
    }));
  };

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);
    
    try {
      // Normalize brand before submit
      const submitData = {
        ...formData,
        brand: formData.brand ? normalizeBrand(formData.brand) : null,
        category: formData.category.map(c => normalizeCategory(c)).filter(Boolean),
      };

      const url = isEditing 
        ? `/api/admin/products/${product.id}` 
        : '/api/admin/products';
      
      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Error al guardar');
      }
      
      setSuccess(isEditing ? 'Producto actualizado' : 'Producto creado');
      
      if (!isEditing) {
        // Redirect to edit page for new products
        router.push(`/admin/products/${data.product.id}`);
      } else {
        router.refresh();
      }
      
    } catch (err: any) {
      setError(err.message || 'Error al guardar');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    
    setIsDeleting(true);
    
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al eliminar');
      }
      
      router.push('/admin/products');
      
    } catch (err: any) {
      setError(err.message || 'Error al eliminar');
      setIsDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Información básica</h2>
            
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    SKU *
                  </label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    placeholder="BOMBA-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Marca
                  </label>
                  <div ref={brandRef} className="relative">
                    <input
                      type="text"
                      value={brandQuery}
                      onChange={(e) => {
                        setBrandQuery(e.target.value);
                        setFormData(prev => ({ ...prev, brand: e.target.value }));
                        setShowBrandSuggestions(true);
                      }}
                      onFocus={() => setShowBrandSuggestions(true)}
                      onBlur={() => {
                        // Normalize brand on blur
                        const normalized = normalizeBrand(brandQuery);
                        setBrandQuery(normalized);
                        setFormData(prev => ({ ...prev, brand: normalized || null }));
                      }}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: Pedrollo"
                      autoComplete="off"
                    />
                    {showBrandSuggestions && filteredBrands.length > 0 && brandQuery.trim() && (
                      <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                        {filteredBrands.slice(0, 8).map(brand => (
                          <button
                            key={brand}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              setBrandQuery(brand);
                              setFormData(prev => ({ ...prev, brand }));
                              setShowBrandSuggestions(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 text-slate-700"
                          >
                            {brand}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="Bomba Centrífuga 1HP"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Slug URL
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="slug-del-producto-sku001"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Generado automáticamente al escribir el nombre. Editá solo si querés personalizar la URL.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Descripción
                </label>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descripción detallada del producto..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Categorías
                </label>
                {/* Selected tags */}
                <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px]">
                  {formData.category.map(cat => (
                    <span
                      key={cat}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full"
                    >
                      {cat}
                      <button
                        type="button"
                        onClick={() => removeCategory(cat)}
                        className="hover:text-blue-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                {/* Category input with suggestions */}
                <div ref={categoryRef} className="relative">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={categoryInput}
                      onChange={(e) => {
                        setCategoryInput(e.target.value);
                        setShowCategorySuggestions(true);
                      }}
                      onFocus={() => setShowCategorySuggestions(true)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (categoryInput.trim()) addCategory(categoryInput);
                        }
                      }}
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Escribí para buscar o agregar..."
                    />
                    {categoryInput.trim() && (
                      <button
                        type="button"
                        onClick={() => addCategory(categoryInput)}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  {showCategorySuggestions && filteredCategories.length > 0 && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredCategories.map(cat => {
                        const isSub = !isMainCategory(cat);
                        return (
                          <button
                            key={cat}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => addCategory(cat)}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 text-slate-700 ${isSub ? 'pl-8' : 'font-medium'}`}
                          >
                            {isSub && <span className="text-slate-400 mr-1">↳</span>}
                            {cat}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1.5">
                  Categoría principal + subcategoría. Ej: Bombas + Sumergibles. Las subcategorías aparecen al seleccionar una categoría principal.
                </p>
              </div>
            </div>
          </div>
          
          {/* Images */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Imágenes</h2>
            <ImageUpload
              images={formData.images}
              onChange={(images) => setFormData(prev => ({ ...prev, images }))}
            />
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price & Stock */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Precio y Stock</h2>
            
            <div className="space-y-4">
              {/* Currency selector */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Moneda
                </label>
                <div className="flex rounded-lg border border-slate-300 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, currency: 'UYU' }))}
                    className={`flex-1 py-2 text-sm font-medium transition-colors ${
                      formData.currency === 'UYU'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    🇺🇾 UYU
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, currency: 'USD' }))}
                    className={`flex-1 py-2 text-sm font-medium transition-colors border-l border-slate-300 ${
                      formData.currency === 'USD'
                        ? 'bg-green-600 text-white'
                        : 'bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    🇺🇸 USD
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Precio ({formData.currency}) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    {formData.currency === 'USD' ? 'US$' : '$'}
                  </span>
                  <input
                    type="number"
                    name="price_numeric"
                    value={formData.price_numeric}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Stock *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  min="0"
                />
              </div>
              
              {isEditing && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Vendidos
                  </label>
                  <input
                    type="number"
                    name="sold_count"
                    value={formData.sold_count}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                    min="0"
                    disabled
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* Status */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Estado</h2>
            
            <label className="flex items-center gap-3 cursor-pointer mb-4">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleCheckbox}
                className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-slate-700">Producto activo</span>
            </label>
            <p className="text-sm text-slate-500 mb-4">
              Los productos inactivos no aparecen en la tienda
            </p>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Disponibilidad</label>
              <select
                value={formData.availability_type}
                onChange={(e) => setFormData(prev => ({ ...prev, availability_type: e.target.value as ProductAvailabilityType }))}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="regular">Regular (con precio y stock)</option>
                <option value="on_request">Consultar por producto</option>
              </select>
              <p className="text-xs text-slate-500 mt-1">
                {formData.availability_type === 'on_request'
                  ? 'Se muestra "Consultar" en vez del precio. El cliente contacta por WhatsApp.'
                  : 'El producto se vende normalmente con precio y stock.'}
              </p>
            </div>
          </div>
          
          {/* Featured & Discount */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              Destacado y Ofertas
            </h2>
            
            <div className="space-y-4">
              {/* Featured checkbox */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleCheckbox}
                  className="h-5 w-5 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                />
                <span className="text-slate-700">Producto destacado</span>
              </label>
              <p className="text-xs text-slate-500 -mt-2">
                Aparece en la sección de destacados del homepage
              </p>
              
              {/* Discount section */}
              <div className="pt-3 border-t border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-slate-700">Descuento</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Precio original
                    </label>
                    <input
                      type="number"
                      value={formData.original_price_numeric || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        original_price_numeric: e.target.value ? parseFloat(e.target.value) : null
                      }))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      min="0"
                      step="0.01"
                      placeholder="Ej: 1500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      % Descuento
                    </label>
                    <input
                      type="number"
                      value={formData.discount_percentage || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        discount_percentage: e.target.value ? parseInt(e.target.value) : null
                      }))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      min="0"
                      max="100"
                      placeholder="Ej: 20"
                    />
                  </div>
                </div>
                
                {formData.original_price_numeric && formData.discount_percentage && (
                  <div className="mt-3 p-2 bg-green-50 rounded-lg">
                    <p className="text-xs text-green-700">
                      <span className="line-through text-slate-500">${formData.original_price_numeric.toLocaleString()}</span>
                      {' → '}
                      <span className="font-bold">${formData.price_numeric.toLocaleString()}</span>
                      <span className="ml-2 px-1.5 py-0.5 bg-green-600 text-white rounded text-xs">
                        -{formData.discount_percentage}%
                      </span>
                    </p>
                  </div>
                )}
                
                <p className="text-xs text-slate-500 mt-2">
                  Dejá vacío si no hay descuento. El precio actual es el precio de venta.
                </p>
              </div>
            </div>
          </div>
          
          {/* Shipping */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Truck className="h-5 w-5 text-blue-600" />
              Envío
            </h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="shipping_type" className="block text-sm font-medium text-slate-700 mb-1">
                  Tipo de envío
                </label>
                <select
                  id="shipping_type"
                  name="shipping_type"
                  value={formData.shipping_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(SHIPPING_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  {formData.shipping_type === 'dac' && 'Productos pequeños/medianos enviados por DAC'}
                  {formData.shipping_type === 'freight' && 'Productos grandes que requieren flete'}
                  {formData.shipping_type === 'pickup_only' && 'Solo disponible para retiro en local'}
                </p>
              </div>
              
              {formData.shipping_type !== 'pickup_only' && (
                <div>
                  <label htmlFor="weight_kg" className="block text-sm font-medium text-slate-700 mb-1">
                    Peso (kg)
                  </label>
                  <input
                    id="weight_kg"
                    type="number"
                    name="weight_kg"
                    value={formData.weight_kg || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      weight_kg: e.target.value ? parseFloat(e.target.value) : null
                    }))}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.1"
                    placeholder="Ej: 2.5"
                  />
                </div>
              )}
              
              {formData.shipping_type === 'freight' && (
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="requires_quote"
                    checked={formData.requires_quote}
                    onChange={handleCheckbox}
                    className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-slate-700 text-sm">Requiere cotización</span>
                </label>
              )}
            </div>
          </div>
          
          {/* Actions */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                {error}
              </div>
            )}
            
            {success && (
              <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg">
                {success}
              </div>
            )}
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  {isEditing ? 'Guardar cambios' : 'Crear producto'}
                </>
              )}
            </button>
            
            {isEditing && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full flex items-center justify-center gap-2 py-3 border border-red-300 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-5 w-5" />
                    Eliminar producto
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
