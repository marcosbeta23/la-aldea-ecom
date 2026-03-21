// lib/ai.ts — Centralized AI helpers for La Aldea
// Matches existing raw-fetch pattern used in /api/admin/reports/insights

// ── Model constants — change in one place to upgrade everywhere ──────────
export const CLAUDE_MODEL = 'claude-sonnet-4-6';
export const GROQ_MODEL_FAST = 'llama-3.3-70b-versatile';
export const GROQ_MODEL_LIGHT = 'llama-3.1-8b-instant';

// ── Claude — reasoning, tool calls, business-critical output ─────────────

export async function callClaude(options: {
  system?: string;
  messages: { role: string; content: unknown }[];
  max_tokens?: number;
  tools?: object[];
}): Promise<{
  content: Array<{
    type: string;
    text?: string;
    id?: string;
    name?: string;
    input?: Record<string, unknown>;
  }>;
  stop_reason?: string;
}> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: options.max_tokens ?? 1024,
        ...(options.system && { system: options.system }),
        messages: options.messages,
        ...(options.tools && { tools: options.tools }),
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Claude error (${res.status}): ${txt.slice(0, 100)}`);
    }
    return res.json();
  } finally {
    clearTimeout(timeout);
  }
}

// ── Groq — fast structured JSON, high volume, no reasoning needed ────────

export async function callGroq(options: {
  systemPrompt?: string;
  userPrompt: string;
  max_tokens?: number;
  temperature?: number;
  jsonMode?: boolean;
}): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not set');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL_FAST,
        max_tokens: options.max_tokens ?? 150,
        temperature: options.temperature ?? 0.2,
        ...(options.jsonMode && { response_format: { type: 'json_object' } }),
        messages: [
          ...(options.systemPrompt
            ? [{ role: 'system' as const, content: options.systemPrompt }]
            : []),
          { role: 'user' as const, content: options.userPrompt },
        ],
      }),
      signal: controller.signal,
    });

    if (!res.ok) throw new Error(`Groq error (${res.status})`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? '';
  } finally {
    clearTimeout(timeout);
  }
}
