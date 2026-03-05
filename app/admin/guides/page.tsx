'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  FileText,
  ExternalLink,
  Loader2,
  BookOpen,
  AlertCircle,
} from 'lucide-react';

interface Guide {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  is_published: boolean;
  date_published: string;
  date_modified: string;
  updated_at: string;
  sections: Array<{ title: string; content: string; type: string }>;
}

export default function AdminGuidesPage() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGuides();
  }, []);

  async function fetchGuides() {
    try {
      const res = await fetch('/api/admin/guides');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setGuides(data.guides);
    } catch {
      setError('Error al cargar las guias');
    } finally {
      setLoading(false);
    }
  }

  async function togglePublish(guide: Guide) {
    try {
      const res = await fetch(`/api/admin/guides/${guide.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_published: !guide.is_published }),
      });
      if (!res.ok) throw new Error('Failed to update');
      setGuides(prev =>
        prev.map(g => (g.id === guide.id ? { ...g, is_published: !g.is_published } : g))
      );
    } catch {
      setError('Error al actualizar el estado');
    }
  }

  async function deleteGuide(id: string) {
    if (!confirm('¿Estas seguro de eliminar esta guia? Esta accion no se puede deshacer.')) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/guides/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setGuides(prev => prev.filter(g => g.id !== id));
    } catch {
      setError('Error al eliminar la guia');
    } finally {
      setDeleting(null);
    }
  }

  const filtered = guides.filter(g => {
    if (filter === 'published' && !g.is_published) return false;
    if (filter === 'draft' && g.is_published) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        g.title.toLowerCase().includes(q) ||
        g.slug.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const stats = {
    total: guides.length,
    published: guides.filter(g => g.is_published).length,
    draft: guides.filter(g => !g.is_published).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Guias y Articulos</h1>
          <p className="text-slate-500 text-sm mt-1">
            Crea y gestiona guias tecnicas sin tocar el codigo
          </p>
        </div>
        <Link
          href="/admin/guides/new"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
        >
          <Plus className="h-4 w-4" />
          Nueva Guia
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              <p className="text-xs text-slate-500">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <Eye className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.published}</p>
              <p className="text-xs text-slate-500">Publicadas</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
              <EyeOff className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.draft}</p>
              <p className="text-xs text-slate-500">Borradores</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">×</button>
        </div>
      )}

      {/* Search & Filter */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por titulo, slug o categoria..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'published', 'draft'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f === 'all' ? 'Todas' : f === 'published' ? 'Publicadas' : 'Borradores'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Guides List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-700 mb-1">
            {guides.length === 0 ? 'No hay guias todavia' : 'Sin resultados'}
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            {guides.length === 0
              ? 'Crea tu primera guia para aparecer en /guias/'
              : 'Intenta con otros terminos de busqueda'}
          </p>
          {guides.length === 0 && (
            <Link
              href="/admin/guides/new"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
            >
              <Plus className="h-4 w-4" />
              Crear primera guia
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(guide => (
            <div
              key={guide.id}
              className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-slate-900 truncate">{guide.title}</h3>
                    <span
                      className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${
                        guide.is_published
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {guide.is_published ? 'Publicada' : 'Borrador'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 truncate mb-2">{guide.description}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="bg-slate-100 px-2 py-0.5 rounded">/guias/{guide.slug}</span>
                    {guide.category && (
                      <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded">{guide.category}</span>
                    )}
                    <span>{guide.sections?.length || 0} secciones</span>
                    <span>Actualizada: {new Date(guide.updated_at).toLocaleDateString('es-UY')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => togglePublish(guide)}
                    className={`p-2 rounded-lg transition-colors ${
                      guide.is_published
                        ? 'text-green-600 hover:bg-green-50'
                        : 'text-slate-400 hover:bg-slate-100'
                    }`}
                    title={guide.is_published ? 'Despublicar' : 'Publicar'}
                  >
                    {guide.is_published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  {guide.is_published && (
                    <a
                      href={`/guias/${guide.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                      title="Ver en sitio"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  <Link
                    href={`/admin/guides/${guide.id}`}
                    className="p-2 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    title="Editar"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => deleteGuide(guide.id)}
                    disabled={deleting === guide.id}
                    className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                    title="Eliminar"
                  >
                    {deleting === guide.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info box about static guides */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex gap-3">
          <BookOpen className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 text-sm">Guias estaticas</h4>
            <p className="text-xs text-blue-700 mt-1">
              Ademas de las guias creadas aqui, hay{' '}
              <strong>22 guias integradas en el codigo</strong> que aparecen automaticamente en /guias/.
              Las guias creadas desde este panel se suman a las existentes en el sitio.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
