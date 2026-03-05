'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Loader2,
  AlertCircle,
  ExternalLink,
  BookOpen,
  Link as LinkIcon,
  List,
  Type,
  Table,
  Columns2,
  ListOrdered,
} from 'lucide-react';

interface Section {
  title: string;
  content: string;
  type: 'text' | 'list' | 'steps' | 'stats' | 'table' | 'comparison';
}

interface RelatedCategory {
  label: string;
  value: string;
}

interface GuideForm {
  slug: string;
  title: string;
  description: string;
  breadcrumb_label: string;
  category: string;
  keywords: string[];
  related_categories: RelatedCategory[];
  related_articles: string[];
  sections: Section[];
  is_published: boolean;
}

const EMPTY_GUIDE: GuideForm = {
  slug: '',
  title: '',
  description: '',
  breadcrumb_label: '',
  category: '',
  keywords: [],
  related_categories: [],
  related_articles: [],
  sections: [],
  is_published: false,
};

const CATEGORIES = [
  'Sistemas de Riego',
  'Bombas de Agua',
  'Agroquimicos',
  'Piscinas',
  'Drogueria',
  'Energia Solar',
  'Herramientas',
];

const PRODUCT_CATEGORIES = [
  { label: 'Sistemas de Riego', value: 'Riego' },
  { label: 'Bombas de Agua', value: 'Bombas' },
  { label: 'Agroquimicos', value: 'Quimicos' },
  { label: 'Productos para Piscinas', value: 'Piscinas' },
  { label: 'Drogueria', value: 'Drogueria' },
  { label: 'Energia Solar', value: 'Energia Solar' },
  { label: 'Herramientas', value: 'Herramientas' },
  { label: 'Accesorios', value: 'Accesorios' },
];

const SECTION_TYPES: { value: Section['type']; label: string; icon: typeof Type }[] = [
  { value: 'text', label: 'Texto', icon: Type },
  { value: 'list', label: 'Lista', icon: List },
  { value: 'steps', label: 'Pasos', icon: ListOrdered },
  { value: 'table', label: 'Tabla', icon: Table },
  { value: 'comparison', label: 'Comparacion', icon: Columns2 },
  { value: 'stats', label: 'Estadisticas', icon: BookOpen },
];

export default function GuideEditor({ guideId }: { guideId: string | null }) {
  const router = useRouter();
  const isNew = !guideId || guideId === 'new';
  const [form, setForm] = useState<GuideForm>(EMPTY_GUIDE);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [relatedArticleInput, setRelatedArticleInput] = useState('');
  const [activeSection, setActiveSection] = useState<number | null>(null);
  const [previewHtml, setPreviewHtml] = useState<number | null>(null);

  useEffect(() => {
    if (!isNew && guideId) {
      fetchGuide(guideId);
    }
  }, [isNew, guideId]);

  async function fetchGuide(id: string) {
    try {
      const res = await fetch(`/api/admin/guides/${id}`);
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      const g = data.guide;
      setForm({
        slug: g.slug || '',
        title: g.title || '',
        description: g.description || '',
        breadcrumb_label: g.breadcrumb_label || '',
        category: g.category || '',
        keywords: g.keywords || [],
        related_categories: g.related_categories || [],
        related_articles: g.related_articles || [],
        sections: g.sections || [],
        is_published: g.is_published || false,
      });
    } catch {
      setError('No se pudo cargar la guia');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setError('');
    setSuccess('');

    if (!form.slug || !form.title) {
      setError('Slug y titulo son obligatorios');
      return;
    }
    if (!form.description) {
      setError('La descripcion SEO es obligatoria');
      return;
    }
    if (form.sections.length === 0) {
      setError('Agrega al menos una seccion de contenido');
      return;
    }

    setSaving(true);

    try {
      const url = isNew ? '/api/admin/guides' : `/api/admin/guides/${guideId}`;
      const method = isNew ? 'POST' : 'PATCH';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save');
      }

      setSuccess(isNew ? 'Guia creada correctamente' : 'Guia guardada correctamente');

      if (isNew && data.guide?.id) {
        router.replace(`/admin/guides/${data.guide.id}`);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  function generateSlug(title: string) {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  // Section management
  function addSection() {
    setForm(prev => ({
      ...prev,
      sections: [...prev.sections, { title: '', content: '', type: 'text' }],
    }));
    setActiveSection(form.sections.length);
  }

  function updateSection(index: number, updates: Partial<Section>) {
    setForm(prev => ({
      ...prev,
      sections: prev.sections.map((s, i) => (i === index ? { ...s, ...updates } : s)),
    }));
  }

  function removeSection(index: number) {
    if (!confirm('¿Eliminar esta seccion?')) return;
    setForm(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index),
    }));
    setActiveSection(null);
  }

  function moveSection(index: number, direction: 'up' | 'down') {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= form.sections.length) return;
    setForm(prev => {
      const sections = [...prev.sections];
      [sections[index], sections[newIndex]] = [sections[newIndex], sections[index]];
      return { ...prev, sections };
    });
    setActiveSection(newIndex);
  }

  // Keywords management
  function addKeyword() {
    const kw = keywordInput.trim();
    if (kw && !form.keywords.includes(kw)) {
      setForm(prev => ({ ...prev, keywords: [...prev.keywords, kw] }));
      setKeywordInput('');
    }
  }

  function removeKeyword(kw: string) {
    setForm(prev => ({ ...prev, keywords: prev.keywords.filter(k => k !== kw) }));
  }

  // Related categories
  function toggleRelatedCategory(cat: RelatedCategory) {
    setForm(prev => {
      const exists = prev.related_categories.some(c => c.value === cat.value);
      return {
        ...prev,
        related_categories: exists
          ? prev.related_categories.filter(c => c.value !== cat.value)
          : [...prev.related_categories, cat],
      };
    });
  }

  // Related articles
  function addRelatedArticle() {
    const slug = relatedArticleInput.trim();
    if (slug && !form.related_articles.includes(slug)) {
      setForm(prev => ({ ...prev, related_articles: [...prev.related_articles, slug] }));
      setRelatedArticleInput('');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/guides"
            className="p-2 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {isNew ? 'Nueva Guia' : 'Editar Guia'}
            </h1>
            {!isNew && form.slug && (
              <p className="text-xs text-slate-500">/guias/{form.slug}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setForm(prev => ({ ...prev, is_published: !prev.is_published }))}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              form.is_published
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {form.is_published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            {form.is_published ? 'Publicada' : 'Borrador'}
          </button>
          {!isNew && form.is_published && (
            <a
              href={`/guias/${form.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-blue-600"
              title="Ver en sitio"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">×</button>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm">
          {success}
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Informacion Basica</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Titulo *</label>
            <input
              type="text"
              value={form.title}
              onChange={e => {
                const title = e.target.value;
                setForm(prev => ({
                  ...prev,
                  title,
                  slug: prev.slug || generateSlug(title),
                  breadcrumb_label: prev.breadcrumb_label || title,
                }));
              }}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Ej: Como Instalar Riego por Goteo"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Slug (URL) *</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">/guias/</span>
              <input
                type="text"
                value={form.slug}
                onChange={e => setForm(prev => ({ ...prev, slug: e.target.value }))}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                placeholder="instalar-riego-goteo"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Descripcion SEO * <span className="text-slate-400 font-normal">({form.description.length}/160 caracteres)</span>
          </label>
          <textarea
            value={form.description}
            onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
            rows={2}
            maxLength={200}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="Descripcion corta para Google y redes sociales (max 160 chars)"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Etiqueta Breadcrumb</label>
            <input
              type="text"
              value={form.breadcrumb_label}
              onChange={e => setForm(prev => ({ ...prev, breadcrumb_label: e.target.value }))}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Nombre corto para la ruta de navegacion"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
            <select
              value={form.category}
              onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
            >
              <option value="">Seleccionar...</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Keywords */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
        <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Keywords SEO</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={keywordInput}
            onChange={e => setKeywordInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="Agrega keyword y presiona Enter..."
          />
          <button
            onClick={addKeyword}
            className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        {form.keywords.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {form.keywords.map(kw => (
              <span key={kw} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-medium">
                {kw}
                <button onClick={() => removeKeyword(kw)} className="text-blue-400 hover:text-blue-600">×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Related Links */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <LinkIcon className="h-4 w-4" />
          Enlaces Internos
        </h2>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Categorias de producto relacionadas</label>
          <div className="flex flex-wrap gap-2">
            {PRODUCT_CATEGORIES.map(cat => {
              const selected = form.related_categories.some(c => c.value === cat.value);
              return (
                <button
                  key={cat.value}
                  onClick={() => toggleRelatedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selected
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Guias relacionadas (slugs)</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={relatedArticleInput}
              onChange={e => setRelatedArticleInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addRelatedArticle())}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
              placeholder="slug-de-otra-guia"
            />
            <button
              onClick={addRelatedArticle}
              className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {form.related_articles.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.related_articles.map(slug => (
                <span key={slug} className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-xs font-mono">
                  {slug}
                  <button
                    onClick={() => setForm(prev => ({ ...prev, related_articles: prev.related_articles.filter(s => s !== slug) }))}
                    className="text-slate-400 hover:text-red-600"
                  >×</button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sections Editor */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
            Contenido ({form.sections.length} secciones)
          </h2>
          <button
            onClick={addSection}
            className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            <Plus className="h-3.5 w-3.5" />
            Agregar Seccion
          </button>
        </div>

        {form.sections.length === 0 && (
          <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center">
            <BookOpen className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500 mb-3">
              Tu guia necesita al menos una seccion de contenido
            </p>
            <button
              onClick={addSection}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
            >
              <Plus className="h-4 w-4" />
              Agregar primera seccion
            </button>
          </div>
        )}

        <div className="space-y-3">
          {form.sections.map((section, index) => (
            <div
              key={index}
              className={`border rounded-lg transition-colors ${
                activeSection === index ? 'border-blue-300 bg-blue-50/50' : 'border-slate-200'
              }`}
            >
              {/* Section Header */}
              <div
                className="flex items-center gap-2 p-3 cursor-pointer"
                onClick={() => setActiveSection(activeSection === index ? null : index)}
              >
                <GripVertical className="h-4 w-4 text-slate-300" />
                <div className="flex items-center gap-1.5 shrink-0">
                  {(() => {
                    const typeInfo = SECTION_TYPES.find(t => t.value === section.type);
                    const Icon = typeInfo?.icon || Type;
                    return (
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-xs text-slate-500 flex items-center gap-1">
                        <Icon className="h-3 w-3" />
                        {typeInfo?.label || section.type}
                      </span>
                    );
                  })()}
                </div>
                <span className="flex-1 text-sm font-medium text-slate-700 truncate">
                  {section.title || `Seccion ${index + 1}`}
                </span>
                <div className="flex items-center gap-0.5 shrink-0" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => moveSection(index, 'up')}
                    disabled={index === 0}
                    className="p-1 rounded text-slate-400 hover:text-slate-600 disabled:opacity-30"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => moveSection(index, 'down')}
                    disabled={index === form.sections.length - 1}
                    className="p-1 rounded text-slate-400 hover:text-slate-600 disabled:opacity-30"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => removeSection(index)}
                    className="p-1 rounded text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Section Editor (expanded) */}
              {activeSection === index && (
                <div className="px-3 pb-3 space-y-3 border-t border-slate-200 pt-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-600 mb-1">Titulo de la seccion</label>
                      <input
                        type="text"
                        value={section.title}
                        onChange={e => updateSection(index, { title: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Ej: ¿Cuales son los beneficios...?"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Tipo</label>
                      <select
                        value={section.type}
                        onChange={e => updateSection(index, { type: e.target.value as Section['type'] })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                      >
                        {SECTION_TYPES.map(t => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-medium text-slate-600">
                        Contenido (HTML)
                      </label>
                      <button
                        onClick={() => setPreviewHtml(previewHtml === index ? null : index)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        {previewHtml === index ? 'Editor' : 'Vista previa'}
                      </button>
                    </div>
                    {previewHtml === index ? (
                      <div
                        className="w-full min-h-[200px] px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: section.content }}
                      />
                    ) : (
                      <textarea
                        value={section.content}
                        onChange={e => updateSection(index, { content: e.target.value })}
                        rows={8}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                        placeholder={
                          section.type === 'list'
                            ? '<ul>\n<li><strong>Item 1:</strong> Descripcion...</li>\n<li><strong>Item 2:</strong> Descripcion...</li>\n</ul>'
                            : section.type === 'steps'
                            ? '<ol>\n<li><strong>Paso 1:</strong> Descripcion...</li>\n<li><strong>Paso 2:</strong> Descripcion...</li>\n</ol>'
                            : section.type === 'table'
                            ? '<table>\n<thead><tr><th>Columna 1</th><th>Columna 2</th></tr></thead>\n<tbody>\n<tr><td>Dato 1</td><td>Dato 2</td></tr>\n</tbody>\n</table>'
                            : '<p>Escribe el contenido aqui. Podes usar <strong>negrita</strong>, <a href="/productos?categoria=Riego">enlaces internos</a> y mas HTML.</p>'
                        }
                      />
                    )}
                  </div>

                  {/* HTML helper tips */}
                  <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-500">
                    <p className="font-medium text-slate-600 mb-1">HTML rapido:</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <span><code>&lt;strong&gt;</code> = <strong>negrita</strong></span>
                      <span><code>&lt;em&gt;</code> = <em>italica</em></span>
                      <span><code>&lt;a href=&quot;...&quot;&gt;</code> = enlace</span>
                      <span><code>&lt;ul&gt;&lt;li&gt;</code> = lista</span>
                    </div>
                    <p className="mt-2">
                      Para enlaces internos usa: <code>&lt;a href=&quot;/productos?categoria=Riego&quot;&gt;Ver riego&lt;/a&gt;</code>
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom save bar */}
      <div className="sticky bottom-0 bg-white border-t border-slate-200 -mx-4 lg:-mx-8 px-4 lg:px-8 py-3 flex items-center justify-between">
        <Link href="/admin/guides" className="text-sm text-slate-500 hover:text-slate-700">
          Cancelar
        </Link>
        <div className="flex items-center gap-3">
          <span className={`text-xs ${form.is_published ? 'text-green-600' : 'text-amber-600'}`}>
            {form.is_published ? 'Se publicara al guardar' : 'Se guardara como borrador'}
          </span>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Guardando...' : 'Guardar Guia'}
          </button>
        </div>
      </div>
    </div>
  );
}
