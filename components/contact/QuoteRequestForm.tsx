'use client';

import { FormEvent, useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import { trackQuoteSubmitted, trackUiInteraction } from '@/lib/analytics';

type QuoteCategory = 'general' | 'quote' | 'wholesale' | 'custom';

type QuoteFormState = {
  name: string;
  email: string;
  phone: string;
  message: string;
  category: QuoteCategory;
};

const INITIAL_FORM: QuoteFormState = {
  name: '',
  email: '',
  phone: '',
  message: '',
  category: 'quote',
};

function normalizePhone(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';

  if (trimmed.startsWith('+')) {
    return `+${trimmed.slice(1).replace(/\D/g, '')}`;
  }

  return trimmed.replace(/\D/g, '');
}

export default function QuoteRequestForm() {
  const [form, setForm] = useState<QuoteFormState>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSubmitting(true);
    setStatus('idle');
    setStatusMessage('');

    trackUiInteraction('quote_form_submit_attempt', {
      source: 'contact_page_form',
      category: form.category,
    });

    try {
      const payload = {
        ...form,
        phone: normalizePhone(form.phone),
      };

      const response = await fetch('/api/quote-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const message = typeof data?.error === 'string'
          ? data.error
          : 'No pudimos enviar tu consulta. Intentá nuevamente.';
        throw new Error(message);
      }

      trackQuoteSubmitted(form.category, 'contact_page_form');
      setStatus('success');
      setStatusMessage('Consulta enviada. Te vamos a responder a la brevedad.');
      setForm(INITIAL_FORM);
    } catch (error) {
      setStatus('error');
      setStatusMessage(error instanceof Error ? error.message : 'Error enviando la consulta.');
      trackUiInteraction('quote_form_submit_error', {
        source: 'contact_page_form',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-4xl border border-slate-200 p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-slate-900">Solicitar presupuesto</h3>
      <p className="mt-2 text-sm text-slate-600">
        Contanos qué necesitás y te contactamos con una propuesta a medida.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm font-medium text-slate-700">Nombre</span>
            <input
              required
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
              placeholder="Tu nombre"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
              placeholder="tu@email.com"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm font-medium text-slate-700">Teléfono</span>
            <input
              required
              value={form.phone}
              onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
              placeholder="099123456 o +59899123456"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium text-slate-700">Tipo de consulta</span>
            <select
              value={form.category}
              onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value as QuoteCategory }))}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
            >
              <option value="quote">Presupuesto</option>
              <option value="general">Consulta general</option>
              <option value="wholesale">Mayorista</option>
              <option value="custom">Proyecto personalizado</option>
            </select>
          </label>
        </div>

        <label className="space-y-1 block">
          <span className="text-sm font-medium text-slate-700">Mensaje</span>
          <textarea
            required
            minLength={10}
            value={form.message}
            onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
            className="w-full min-h-30 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
            placeholder="Ej: Necesito riego por goteo para 2 hectáreas en Canelones..."
          />
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Enviar consulta
            </>
          )}
        </button>
      </form>

      {status !== 'idle' && (
        <p
          className={`mt-4 text-sm ${status === 'success' ? 'text-green-700' : 'text-red-600'}`}
          role="status"
        >
          {statusMessage}
        </p>
      )}
    </div>
  );
}
