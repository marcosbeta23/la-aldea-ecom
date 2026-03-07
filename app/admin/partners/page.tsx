'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Pencil, Trash2, X, Check, Building2, ExternalLink, GripVertical } from 'lucide-react';
import ImageUpload from '@/components/admin/ImageUpload';

interface Partner {
  id: string;
  name: string;
  logo_url: string;
  website_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface PartnerForm {
  name: string;
  logo_url: string;
  website_url: string;
  display_order: string;
  is_active: boolean;
}

const emptyForm: PartnerForm = {
  name: '',
  logo_url: '',
  website_url: '',
  display_order: '0',
  is_active: true,
};

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [form, setForm] = useState<PartnerForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPartners();
  }, []);

  async function fetchPartners() {
    try {
      const res = await fetch('/api/admin/partners');
      const data = await res.json();
      if (res.ok) {
        setPartners(data.partners || []);
      }
    } catch (err) {
      console.error('Error fetching partners:', err);
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingPartner(null);
    const nextOrder = partners.length > 0
      ? Math.max(...partners.map(p => p.display_order)) + 1
      : 1;
    setForm({ ...emptyForm, display_order: String(nextOrder) });
    setError(null);
    setShowModal(true);
  }

  function openEditModal(partner: Partner) {
    setEditingPartner(partner);
    setForm({
      name: partner.name,
      logo_url: partner.logo_url,
      website_url: partner.website_url || '',
      display_order: String(partner.display_order),
      is_active: partner.is_active,
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
        name: form.name,
        logo_url: form.logo_url,
        website_url: form.website_url || null,
        display_order: Number(form.display_order) || 0,
        is_active: form.is_active,
      };

      const url = editingPartner
        ? `/api/admin/partners/${editingPartner.id}`
        : '/api/admin/partners';
      const method = editingPartner ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al guardar marca');
      }

      setShowModal(false);
      fetchPartners();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar marca');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Estás seguro de eliminar esta marca?')) return;

    try {
      const res = await fetch(`/api/admin/partners/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        fetchPartners();
      } else {
        alert(data.error || 'Error al eliminar la marca');
      }
    } catch (err) {
      console.error('Error deleting partner:', err);
      alert('Error de conexión al eliminar la marca');
    }
  }

  async function toggleActive(partner: Partner) {
    try {
      await fetch(`/api/admin/partners/${partner.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !partner.is_active }),
      });
      fetchPartners();
    } catch (err) {
      console.error('Error toggling partner:', err);
    }
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
          <h1 className="text-2xl font-bold text-slate-900">Marcas / Partners</h1>
          <p className="text-slate-500">Gestiona las marcas que aparecen en la página principal</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Nueva Marca
        </button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{partners.length}</p>
              <p className="text-sm text-slate-500">Total marcas</p>
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
                {partners.filter(p => p.is_active).length}
              </p>
              <p className="text-sm text-slate-500">Activas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Partners List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {partners.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No hay marcas</h3>
            <p className="text-slate-500 mb-4">Agrega tu primera marca asociada</p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-5 w-5" />
              Agregar Marca
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Orden</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Logo</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Nombre</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">Web</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {partners.map((partner) => (
                <tr key={partner.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-slate-400">
                      <GripVertical className="h-4 w-4" />
                      {partner.display_order}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-15 w-30 relative bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center">
                      <Image
                        src={partner.logo_url}
                        alt={partner.name}
                        width={120}
                        height={60}
                        className="object-contain grayscale hover:grayscale-0 transition"
                        style={{ width: 120, height: 60 }}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-900">{partner.name}</span>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    {partner.website_url ? (
                      <a
                        href={partner.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Visitar
                      </a>
                    ) : (
                      <span className="text-slate-400 text-sm">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {partner.is_active ? (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                        Activa
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">
                        Inactiva
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleActive(partner)}
                        className={`p-2 rounded-lg transition-colors ${
                          partner.is_active
                            ? 'text-amber-600 hover:bg-amber-50'
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={partner.is_active ? 'Desactivar' : 'Activar'}
                      >
                        {partner.is_active ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => openEditModal(partner)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(partner.id)}
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
                  {editingPartner ? 'Editar Marca' : 'Nueva Marca'}
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

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nombre de la marca *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Gianni"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Logo *
                </label>
                <ImageUpload
                  images={form.logo_url ? [form.logo_url] : []}
                  onChange={(imgs) => setForm({ ...form, logo_url: imgs[0] || '' })}
                  maxImages={1}
                />
                {!form.logo_url && (
                  <p className="text-xs text-slate-400 mt-1">
                    O ingresá la URL directamente:
                  </p>
                )}
                <input
                  type="text"
                  value={form.logo_url}
                  onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="/assets/images/partners/nombre.webp"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Sitio web (opcional)
                </label>
                <input
                  type="url"
                  value={form.website_url}
                  onChange={(e) => setForm({ ...form, website_url: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://www.ejemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Orden de visualización
                </label>
                <input
                  type="number"
                  value={form.display_order}
                  onChange={(e) => setForm({ ...form, display_order: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">Marca activa (visible en la web)</span>
                </label>
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
                  disabled={submitting || !form.name || !form.logo_url}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-300"
                >
                  {submitting ? 'Guardando...' : editingPartner ? 'Guardar Cambios' : 'Crear Marca'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
