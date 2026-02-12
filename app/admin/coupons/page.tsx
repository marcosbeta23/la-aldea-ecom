'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Check, Tag, Percent, DollarSign, Users } from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_purchase_amount: number;
  max_uses: number | null;
  current_uses: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
}

interface CouponForm {
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: string;
  min_purchase_amount: string;
  max_uses: string;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
}

const emptyCouponForm: CouponForm = {
  code: '',
  description: '',
  discount_type: 'percentage',
  discount_value: '',
  min_purchase_amount: '0',
  max_uses: '',
  valid_from: new Date().toISOString().split('T')[0],
  valid_until: '',
  is_active: true,
};

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [form, setForm] = useState<CouponForm>(emptyCouponForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  async function fetchCoupons() {
    try {
      const res = await fetch('/api/admin/coupons');
      const data = await res.json();
      if (res.ok) {
        setCoupons(data.coupons || []);
      }
    } catch (err) {
      console.error('Error fetching coupons:', err);
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingCoupon(null);
    setForm(emptyCouponForm);
    setError(null);
    setShowModal(true);
  }

  function openEditModal(coupon: Coupon) {
    setEditingCoupon(coupon);
    setForm({
      code: coupon.code,
      description: coupon.description || '',
      discount_type: coupon.discount_type,
      discount_value: String(coupon.discount_value),
      min_purchase_amount: String(coupon.min_purchase_amount),
      max_uses: coupon.max_uses ? String(coupon.max_uses) : '',
      valid_from: coupon.valid_from.split('T')[0],
      valid_until: coupon.valid_until ? coupon.valid_until.split('T')[0] : '',
      is_active: coupon.is_active,
    });
    setError(null);
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        code: form.code,
        description: form.description || null,
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value),
        min_purchase_amount: Number(form.min_purchase_amount) || 0,
        max_uses: form.max_uses ? Number(form.max_uses) : null,
        valid_from: form.valid_from,
        valid_until: form.valid_until || null,
        is_active: form.is_active,
      };

      const url = editingCoupon
        ? `/api/admin/coupons/${editingCoupon.id}`
        : '/api/admin/coupons';
      const method = editingCoupon ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al guardar cupón');
      }

      setShowModal(false);
      fetchCoupons();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar cupón');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Estás seguro de eliminar este cupón?')) return;

    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchCoupons();
      }
    } catch (err) {
      console.error('Error deleting coupon:', err);
    }
  }

  async function toggleActive(coupon: Coupon) {
    try {
      await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !coupon.is_active }),
      });
      fetchCoupons();
    } catch (err) {
      console.error('Error toggling coupon:', err);
    }
  }

  function formatDiscount(coupon: Coupon) {
    return coupon.discount_type === 'percentage'
      ? `${coupon.discount_value}%`
      : `$${coupon.discount_value.toLocaleString('es-UY')}`;
  }

  function isExpired(coupon: Coupon) {
    return coupon.valid_until && new Date(coupon.valid_until) < new Date();
  }

  function isExhausted(coupon: Coupon) {
    return coupon.max_uses && coupon.current_uses >= coupon.max_uses;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cupones de Descuento</h1>
          <p className="text-slate-500">Gestiona los cupones de descuento de la tienda</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Nuevo Cupón
        </button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Tag className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{coupons.length}</p>
              <p className="text-sm text-slate-500">Total cupones</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {coupons.filter(c => c.is_active && !isExpired(c) && !isExhausted(c)).length}
              </p>
              <p className="text-sm text-slate-500">Activos</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {coupons.reduce((sum, c) => sum + c.current_uses, 0)}
              </p>
              <p className="text-sm text-slate-500">Usos totales</p>
            </div>
          </div>
        </div>
      </div>

      {/* Coupons List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {coupons.length === 0 ? (
          <div className="p-12 text-center">
            <Tag className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No hay cupones</h3>
            <p className="text-slate-500 mb-4">Crea tu primer cupón de descuento</p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-5 w-5" />
              Crear Cupón
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Código</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Descuento</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Mínimo</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Usos</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Válido hasta</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div>
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded">
                        {coupon.code}
                      </span>
                      {coupon.description && (
                        <p className="text-sm text-slate-500 mt-1">{coupon.description}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      {coupon.discount_type === 'percentage' ? (
                        <Percent className="h-4 w-4 text-blue-600" />
                      ) : (
                        <DollarSign className="h-4 w-4 text-green-600" />
                      )}
                      <span className="font-semibold">{formatDiscount(coupon)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    ${coupon.min_purchase_amount.toLocaleString('es-UY')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={coupon.max_uses && coupon.current_uses >= coupon.max_uses ? 'text-red-600 font-semibold' : ''}>
                      {coupon.current_uses}
                      {coupon.max_uses && ` / ${coupon.max_uses}`}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {coupon.valid_until ? (
                      <span className={isExpired(coupon) ? 'text-red-600' : 'text-slate-600'}>
                        {new Date(coupon.valid_until).toLocaleDateString('es-UY')}
                      </span>
                    ) : (
                      <span className="text-slate-400">Sin límite</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {isExpired(coupon) ? (
                      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                        Expirado
                      </span>
                    ) : isExhausted(coupon) ? (
                      <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">
                        Agotado
                      </span>
                    ) : coupon.is_active ? (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                        Activo
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">
                        Inactivo
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleActive(coupon)}
                        className={`p-2 rounded-lg transition-colors ${
                          coupon.is_active
                            ? 'text-amber-600 hover:bg-amber-50'
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={coupon.is_active ? 'Desactivar' : 'Activar'}
                      >
                        {coupon.is_active ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => openEditModal(coupon)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(coupon.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">
                  {editingCoupon ? 'Editar Cupón' : 'Nuevo Cupón'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Cerrar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Código del cupón *
                  </label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    placeholder="DESCUENTO20"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Descripción
                  </label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="20% de descuento en toda la tienda"
                  />
                </div>

                <div>
                  <label htmlFor="discount_type" className="block text-sm font-medium text-slate-700 mb-1">
                    Tipo de descuento *
                  </label>
                  <select
                    id="discount_type"
                    value={form.discount_type}
                    onChange={(e) => setForm({ ...form, discount_type: e.target.value as 'percentage' | 'fixed' })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="percentage">Porcentaje (%)</option>
                    <option value="fixed">Monto fijo ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Valor del descuento *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      {form.discount_type === 'percentage' ? '%' : '$'}
                    </span>
                    <input
                      type="number"
                      value={form.discount_value}
                      onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={form.discount_type === 'percentage' ? '20' : '500'}
                      min="0"
                      max={form.discount_type === 'percentage' ? '100' : undefined}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Compra mínima ($)
                  </label>
                  <input
                    type="number"
                    value={form.min_purchase_amount}
                    onChange={(e) => setForm({ ...form, min_purchase_amount: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Usos máximos
                  </label>
                  <input
                    type="number"
                    value={form.max_uses}
                    onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Sin límite"
                    min="1"
                  />
                </div>

                <div>
                  <label htmlFor="valid_from" className="block text-sm font-medium text-slate-700 mb-1">
                    Válido desde
                  </label>
                  <input
                    id="valid_from"
                    type="date"
                    value={form.valid_from}
                    onChange={(e) => setForm({ ...form, valid_from: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="valid_until" className="block text-sm font-medium text-slate-700 mb-1">
                    Válido hasta
                  </label>
                  <input
                    id="valid_until"
                    type="date"
                    value={form.valid_until}
                    onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">Cupón activo</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-300"
                >
                  {submitting ? 'Guardando...' : editingCoupon ? 'Guardar Cambios' : 'Crear Cupón'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
