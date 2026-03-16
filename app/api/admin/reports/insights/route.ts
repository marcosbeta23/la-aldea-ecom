// app/api/admin/reports/insights/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyOwnerAuth } from '@/lib/admin-auth';

// ─── Rate limiter en memoria ──────────────────────────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT = {
  maxRequests: 5,
  windowMs: 60 * 1000,
};

function checkRateLimit(ip: string): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT.windowMs });
    return { allowed: true, retryAfterSec: 0 };
  }

  if (entry.count >= RATE_LIMIT.maxRequests) {
    return { allowed: false, retryAfterSec: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count++;
  return { allowed: true, retryAfterSec: 0 };
}

setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rateLimitMap.entries()) {
    if (now > val.resetAt) rateLimitMap.delete(key);
  }
}, 5 * 60 * 1000);

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

const MAX_BODY_BYTES = 50 * 1024;

// ─── GET: estado de proveedores ───────────────────────────────────────────────
export async function GET() {
  return NextResponse.json({
    claude: !!process.env.ANTHROPIC_API_KEY,
    groq: !!process.env.GROQ_API_KEY,
  });
}

// ─── POST: generar análisis ───────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const authResult = await verifyOwnerAuth();
  if (!authResult.authorized) return authResult.response;

  const ip = getClientIp(request);
  const rateCheck = checkRateLimit(ip);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: `Demasiadas solicitudes. Esperá ${rateCheck.retryAfterSec} segundos.` },
      { status: 429, headers: { 'Retry-After': String(rateCheck.retryAfterSec) } },
    );
  }

  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Payload demasiado grande' }, { status: 413 });
  }

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

  try {
    const prompt = buildPrompt(analyticsData as Record<string, any>, period);
    if (provider === 'claude') return await callClaude(prompt);
    return await callGroq(prompt);
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
  const periodoLabels: Record<string, string> = {
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
  const paidOrders = s.paidOrders || 0;

  // Coupon info
  const topCoupon = s.topCoupons?.[0]?.code || null;
  const couponLine = topCoupon
    ? `- Cupones: ${s.couponUsageRate || 0}% de pedidos usaron cupón (más usado: ${topCoupon})`
    : `- Cupones: ${s.couponUsageRate || 0}% de pedidos usaron cupón`;

  const contexto = `
PERÍODO: ${periodoLabels[period]}
TIENDA: La Aldea — ecommerce online exclusivamente (no hay canal físico)

INGRESOS
- UYU: $${(s.totalRevenueUYU || 0).toLocaleString('es-UY')} (${pp.revenueChangeUYU > 0 ? '+' : ''}${pp.revenueChangeUYU || 0}% vs período anterior)
- USD: US$${(s.totalRevenueUSD || 0).toFixed(2)} (${pp.revenueChangeUSD > 0 ? '+' : ''}${pp.revenueChangeUSD || 0}% vs período anterior)
- Ingreso combinado UYU: $${(s.combinedRevenueUYU || 0).toLocaleString('es-UY')}
- Tipo de cambio: $${exchangeRate.toLocaleString('es-UY')} / USD

PEDIDOS
- Total: ${s.totalOrders || 0} | Pagados: ${paidOrders} (${pp.ordersChange > 0 ? '+' : ''}${pp.ordersChange || 0}% vs período anterior)
- Pendientes: ${s.pendingOrders || 0}
- Ticket promedio UYU: $${(s.avgOrderValueUYU || 0).toLocaleString('es-UY')} (${pp.aovChange > 0 ? '+' : ''}${pp.aovChange || 0}% vs período anterior)
- Ticket promedio USD: US$${(s.avgOrderValueUSD || 0).toFixed(2)}

CLIENTES
- Únicos: ${s.uniqueCustomers || 0} | Tasa de conversión: ${s.conversionRate || 0}%
- Nuevos: ${s.newCustomers || 0} | Recurrentes: ${s.returningCustomers || 0}
- Abandono de carrito: ${s.cartAbandonmentRate || 0}%

OPERACIONES
- Fulfillment promedio: ${s.avgFulfillmentDays || 0} días (pago → entrega)
${couponLine}

TOP PRODUCTOS:
${topProducts.slice(0, 5).map((p: any) => `- ${p.name}: ${p.sold} uds — $${(p.revenue || 0).toLocaleString('es-UY')} UYU`).join('\n')}

ESTADOS DE PEDIDOS: ${Object.entries(statusDistribution).slice(0, 6).map(([k, v]) => `${k}: ${v}`).join(', ')}

INVENTARIO CRÍTICO: ${inventoryHealth.length} productos con stock bajo detectados.
`.trim();

  return `Sos un consultor senior especializado en ecommerce para La Aldea (Uruguay).
La Aldea es una tienda 100% online — no existe canal físico ni mostrador — tenelo muy presente al analizar y redactar.
Analizá los datos y generá un reporte ejecutivo corporativo con estas 4 secciones fijas en español:

**DESEMPEÑO GENERAL**
[2-3 oraciones con las cifras clave y contexto del período. Usá números concretos.]

**FORTALEZAS DEL PERÍODO**
- [fortaleza con métrica específica]
- [fortaleza con métrica específica]
- [fortaleza con métrica específica]

**OPORTUNIDADES Y RECOMENDACIONES**
- [acción concreta justificada con datos del período]
- [acción concreta justificada con datos del período]
- [acción concreta justificada con datos del período]

**PROYECCIÓN Y PRÓXIMOS PASOS**
[2-3 oraciones con proyección realista y prioridades concretas para el próximo período.]

DATOS DEL PERÍODO:
${contexto}

Respondé ÚNICAMENTE con las 4 secciones. Usá números específicos, tono profesional ejecutivo, todo en español.`;
}

// ─── Clientes de IA ───────────────────────────────────────────────────────────
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
      provider: 'claude',
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
          {
            role: 'system',
            content: 'Sos un consultor senior de ecommerce. La tienda que analizás es 100% online, no tiene canal físico. Respondé siempre en español, tono ejecutivo. Nunca menciones "mostrador" ni canales físicos.',
          },
          { role: 'user', content: prompt },
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
      provider: 'groq',
    });
  } catch (err: any) {
    if (err.name === 'AbortError') throw new Error('Timeout: El análisis de Groq tomó demasiado tiempo (30s)');
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}