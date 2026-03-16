// app/api/admin/reports/insights/route.ts
//
// Versión segura con:
//   ✓ Autenticación de sesión (verifyOwnerAuth)
//   ✓ Verificación de rol admin (implícita en verifyOwnerAuth)
//   ✓ Rate limiting por IP (en memoria)
//   ✓ Límite de tamaño de payload
//   ✓ Validación de campos requeridos
//   ✓ Timeout en llamadas a APIs externas (30s)
//   ✓ Manejo explícito de errores de API (res.ok)
//   ✓ Optimización de parámetros IA (max_tokens, temperature)

import { NextRequest, NextResponse } from 'next/server';
import { verifyOwnerAuth } from '@/lib/admin-auth';

// ─── Rate limiter en memoria ──────────────────────────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT = {
  maxRequests: 5,      // máximo 5 análisis
  windowMs: 60 * 1000, // por minuto por IP
};

function checkRateLimit(ip: string): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT.windowMs });
    return { allowed: true, retryAfterSec: 0 };
  }

  if (entry.count >= RATE_LIMIT.maxRequests) {
    return {
      allowed: false,
      retryAfterSec: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  entry.count++;
  return { allowed: true, retryAfterSec: 0 };
}

// Limpiar entradas viejas cada 5 minutos
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rateLimitMap.entries()) {
    if (now > val.resetAt) rateLimitMap.delete(key);
  }
}, 5 * 60 * 1000);

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

const MAX_BODY_BYTES = 50 * 1024;

// ─── GET: status de providers ─────────
export async function GET() {
  return NextResponse.json({
    claude: !!process.env.ANTHROPIC_API_KEY,
    groq: !!process.env.GROQ_API_KEY,
  });
}

// ─── POST: generate analysis ──────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  // ── 1. Autenticación (verifyOwnerAuth de la tienda)
  const authResult = await verifyOwnerAuth();
  if (!authResult.authorized) {
      return authResult.response;
  }

  // ── 2. Rate limiting ──────────────────────────────────────────────────────
  const ip = getClientIp(request);
  const rateCheck = checkRateLimit(ip);

  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: `Demasiadas solicitudes. Esperá ${rateCheck.retryAfterSec} segundos.` },
      {
        status: 429,
        headers: { 'Retry-After': String(rateCheck.retryAfterSec) },
      },
    );
  }

  // ── 3. Validar tamaño del body ────────────────────────────────────────────
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Payload demasiado grande' }, { status: 413 });
  }

  // ── 4. Parsear y validar body ─────────────────────────────────────────────
  let body: { analyticsData?: unknown; period?: string; provider?: string };
  try {
    const rawText = await request.text();
    if (rawText.length > MAX_BODY_BYTES) {
      return NextResponse.json({ error: 'Payload demasiado grande' }, { status: 413 });
    }
    body = JSON.parse(rawText);
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const { analyticsData, period, provider = 'groq' } = body;

  if (!analyticsData || typeof analyticsData !== 'object') {
    return NextResponse.json({ error: 'analyticsData requerido y debe ser un objeto' }, { status: 400 });
  }

  if (!period || !['week', 'month', 'semester', 'year'].includes(period)) {
    return NextResponse.json({ error: 'period inválido' }, { status: 400 });
  }

  if (!['groq', 'claude'].includes(provider)) {
    return NextResponse.json({ error: 'provider inválido' }, { status: 400 });
  }

  // ── 5. Generar análisis ───────────────────────────────────────────────────
  try {
    const prompt = buildPrompt(analyticsData as Record<string, any>, period);

    if (provider === 'claude') {
      return await callClaude(prompt);
    } else {
      return await callGroq(prompt);
    }
  } catch (error) {
    console.error('Error generando análisis IA:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 },
    );
  }
}

// ─── Prompt ───────────────────────────────────────────────────────────────────
function buildPrompt(analyticsData: Record<string, any>, period: string): string {
  const periodLabels: Record<string, string> = {
    week: 'última semana',
    month: 'último mes',
    semester: 'último semestre',
    year: 'último año',
  };

  const s = analyticsData.summary || {};
  const pp = analyticsData.previousPeriod || {};
  const topProducts = analyticsData.topProducts || [];
  const inventoryHealth = analyticsData.inventoryHealth || [];
  const statusDistribution = analyticsData.statusDistribution || {};
  const exchangeRate = analyticsData.exchangeRate || 0;
  const onlineOrders = s.onlineOrders || 0;
  const paidOrders = s.paidOrders || 0;
  const onlinePct = paidOrders > 0 ? Math.round((onlineOrders / paidOrders) * 100) : 0;

  const dataContext = `
PERÍODO: ${periodLabels[period]}

INGRESOS
- UYU: $${(s.totalRevenueUYU || 0).toLocaleString('es-UY')} (${pp.revenueChangeUYU > 0 ? '+' : ''}${pp.revenueChangeUYU || 0}% vs período anterior)
- USD: US$${(s.totalRevenueUSD || 0).toFixed(2)} (${pp.revenueChangeUSD > 0 ? '+' : ''}${pp.revenueChangeUSD || 0}% vs período anterior)
- Combinado UYU: $${(s.combinedRevenueUYU || 0).toLocaleString('es-UY')}
- Tipo de cambio: $${exchangeRate.toLocaleString('es-UY')} / USD

PEDIDOS
- Total: ${s.totalOrders || 0} | Pagados: ${paidOrders} (${pp.ordersChange > 0 ? '+' : ''}${pp.ordersChange || 0}% vs período anterior)
- Pendientes: ${s.pendingOrders || 0}
- Ticket promedio UYU: $${(s.avgOrderValueUYU || 0).toLocaleString('es-UY')} (${pp.aovChange > 0 ? '+' : ''}${pp.aovChange || 0}% vs período anterior)

CANALES
- Online: ${onlineOrders} pedidos — $${(s.onlineRevenueUYU || 0).toLocaleString('es-UY')} UYU (${onlinePct}%)
- Mostrador: ${s.mostradorOrders || 0} pedidos — $${(s.mostradorRevenueUYU || 0).toLocaleString('es-UY')} UYU (${100 - onlinePct}%)

CONVERSIÓN: ${s.conversionRate || 0}% | Clientes únicos: ${s.uniqueCustomers || 0}

TOP PRODUCTOS:
${topProducts.slice(0, 5).map((p: any) => `- ${p.name}: ${p.sold} uds ($${(p.revenue || 0).toLocaleString('es-UY')})`).join('\n')}

ESTADOS: ${Object.entries(statusDistribution).slice(0, 5).map(([k, v]) => `${k}: ${v}`).join(', ')}

STOCK CRÍTICO: ${inventoryHealth.length} productos detectados.
`.trim();

  return `Eres un consultor senior especializado en ecommerce para "La Aldea" (Uruguay). 
Analiza los datos y genera un reporte corporativo ejecutivo con estas 4 secciones fijas:
**DESEMPEÑO GENERAL**
[2-3 oraciones con cifras clave y contexto.]

**FORTALEZAS DEL PERÍODO**
- [fortaleza con métrica específica]
- [fortaleza con métrica específica]
- [fortaleza con métrica específica]

**OPORTUNIDADES Y RECOMENDACIONES**  
- [acción concreta justificada con datos]
- [acción concreta justificada con datos]
- [acción concreta justificada con datos]

**PROYECCIÓN Y PRÓXIMOS PASOS**
[2-3 oraciones con proyección y prioridades.]

DATOS:
${dataContext}

Responde SOLO con las 4 secciones en español. Usa números específicos y sé profesional.`;
}

// ─── AI Clients ──────────────────────────────────────────────────────────────
async function callClaude(prompt: string) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'ANTHROPIC_API_KEY no configurada' }, { status: 503 });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 900,
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Anthropic API error:', res.status, errorText);
      throw new Error(`Anthropic error (${res.status}): ${errorText.slice(0, 100)}`);
    }

    const data = await res.json();
    return NextResponse.json({ 
      analysis: data.content?.[0]?.text || 'No se recibió análisis de Claude.', 
      provider: 'claude' 
    });
  } catch (err: any) {
    if (err.name === 'AbortError') throw new Error('Timeout: El análisis de Claude tomó demasiado tiempo (30s)');
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

async function callGroq(prompt: string) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'GROQ_API_KEY no configurada' }, { status: 503 });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 900,
        temperature: 0.4,
        messages: [
          { role: 'system', content: 'Eres un consultor senior de ecommerce. Responde siempre en español, tono ejecutivo.' },
          { role: 'user', content: prompt }
        ],
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Groq API error:', res.status, errorText);
      throw new Error(`Groq error (${res.status}): ${errorText.slice(0, 100)}`);
    }

    const data = await res.json();
    return NextResponse.json({ 
      analysis: data.choices?.[0]?.message?.content || 'No se recibió análisis de Groq.', 
      provider: 'groq' 
    });
  } catch (err: any) {
    if (err.name === 'AbortError') throw new Error('Timeout: El análisis de Groq tomó demasiado tiempo (30s)');
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}
