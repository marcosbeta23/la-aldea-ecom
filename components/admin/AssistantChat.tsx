'use client';
import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, RefreshCw } from 'lucide-react';

interface Message { role: 'user' | 'assistant'; content: string }

const STARTERS = [
  '¿Cómo vamos hoy?',
  '¿Qué pedidos están en paid_pending_verification?',
  '¿Qué productos tienen poco stock?',
  '¿Qué se busca y no encontramos esta semana?',
  '¿Cuántos carritos abandonados hay en las últimas 24h?',
];

export function AssistantChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send(text: string) {
    const userMsg: Message = { role: 'user', content: text };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? 'Error');
      }

      const data = await res.json();
      setMessages([...history, { role: 'assistant', content: data.reply }]);
    } catch (err: any) {
      setMessages([...history, {
        role: 'assistant',
        content: `Error: ${err.message ?? 'No se pudo conectar. Intentá de vuelta.'}`,
      }]);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 w-full px-4 py-3 rounded-lg
                   text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
      >
        <Sparkles className="h-5 w-5 text-violet-400" />
        <span className="text-sm">Asistente AI</span>
      </button>
    );
  }

  return (
    <div className="flex flex-col border rounded-xl bg-white shadow-sm overflow-hidden"
         style={{ height: '400px' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50 shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-violet-600" />
          <span className="text-sm font-semibold text-slate-800">Asistente Admin</span>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              title="Nueva conversación"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 text-xs"
            title="Minimizar"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
        {messages.length === 0 && (
          <div className="text-center py-6">
            <p className="text-xs text-slate-500 mb-3">
              Preguntá sobre pedidos, stock, ventas o clientes
            </p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-xs px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200
                             text-slate-600 rounded-full transition-colors text-left"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[90%] rounded-xl px-3 py-2 text-xs whitespace-pre-wrap leading-relaxed ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-800'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 rounded-xl px-3 py-2 text-xs text-slate-500">
              Consultando datos…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t p-2 flex gap-1.5 shrink-0">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && input.trim() && !loading) {
              e.preventDefault();
              send(input.trim());
            }
          }}
          placeholder="Preguntá sobre pedidos, stock…"
          className="flex-1 text-xs border rounded-lg px-3 py-2 focus:outline-none
                     focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          disabled={loading}
        />
        <button
          onClick={() => input.trim() && !loading && send(input.trim())}
          disabled={loading || !input.trim()}
          className="bg-violet-600 hover:bg-violet-700 text-white p-2 rounded-lg
                     disabled:opacity-40 transition-colors"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
