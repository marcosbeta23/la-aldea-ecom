'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, Trash2, X, Plus, Truck, Star, Tag } from 'lucide-react';
import ImageUpload from '@/components/admin/ImageUpload';

import { SHIPPING_TYPE_LABELS } from '@/lib/shipping';
import type { ProductShippingType } from '@/types/database';

interface Product {
  id?: string;
  sku: string;
  name: string;
  description: string | null;
  category: string | null;
  brand: string | null;
  price_numeric: number;
  currency: string;
  stock: number;
  sold_count: number;
  images: string[];
  is_active: boolean;
  // Shipping fields
  shipping_type: ProductShippingType;
  weight_kg: number | null;
  requires_quote: boolean;
  // Featured & Discount fields
  is_featured: boolean;
  original_price_numeric: number | null;
  discount_percentage: number | null;
}

const categories = [
  'Bombas',
  'Riego',
  'Filtros',
  'Tanques',
  'Piscinas',
  'Químicos',
  'Herramientas',
  'Accesorios',
];

export default function ProductForm({ product }: { product?: any }) {
  const router = useRouter();
  const isEditing = !!product;
  
  const [formData, setFormData] = useState<Product>({
    sku: product?.sku || '',
    name: product?.name || '',
    description: product?.description || '',
    category: product?.category || '',
    brand: product?.brand || '',
    price_numeric: product?.price_numeric || 0,
    currency: product?.currency || 'UYU',
    stock: product?.stock || 0,
    sold_count: product?.sold_count || 0,
    images: product?.images || [],
    is_active: product?.is_active ?? true,
    // Shipping defaults
    shipping_type: product?.shipping_type || 'dac',
    weight_kg: product?.weight_kg || null,
    requires_quote: product?.requires_quote ?? false,
    // Featured & Discount defaults
    is_featured: product?.is_featured ?? false,
    original_price_numeric: product?.original_price_numeric || null,
    discount_percentage: product?.discount_percentage || null,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
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
      const url = isEditing 
        ? `/api/admin/products/${product.id}` 
        : '/api/admin/products';
      
      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
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
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tigre"
                  />
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
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="Bomba Centrífuga 1HP"
                />
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
                  Categoría
                </label>
                <select
                  name="category"
                  value={formData.category || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sin categoría</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
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
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Precio (UYU) *
                </label>
                <input
                  type="number"
                  name="price_numeric"
                  value={formData.price_numeric}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  min="0"
                  step="1"
                />
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
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleCheckbox}
                className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-slate-700">Producto activo</span>
            </label>
            <p className="text-sm text-slate-500 mt-2">
              Los productos inactivos no aparecen en la tienda
            </p>
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
                      step="1"
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
