// app/api/admin/reports/insights/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyOwnerAuth } from '@/lib/admin-auth';

// ─── Rate limiter en memoria ──────────────────────────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = { maxRequests: 5, windowMs: 60 * 1000 };

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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtUYU(v: number) {
  return `$${v.toLocaleString('es-UY', { maximumFractionDigits: 0 })}`;
}

function topEntries<T extends Record<string, any>>(
  dist: Record<string, T>,
  sortKey: string,
  limit = 5,
): Array<[string, T]> {
  return Object.entries(dist)
    .sort((a, b) => (b[1][sortKey] || 0) - (a[1][sortKey] || 0))
    .slice(0, limit);
}

function peakHours(hourlyStats: Array<{ hour: number; orders: number }>): string {
  if (!hourlyStats?.length) return 'sin datos';
  const active = [...hourlyStats]
    .sort((a, b) => b.orders - a.orders)
    .slice(0, 3)
    .filter(h => h.orders > 0);
  if (!active.length) return 'sin actividad registrada hoy';
  return active.map(h => `${h.hour}:00hs (${h.orders} pedidos)`).join(', ');
}

function trendSummary(dailySales: Array<{ revenueUYU: number }>): string {
  if (!dailySales || dailySales.length < 4) return 'período muy corto para calcular tendencia';
  const half = Math.floor(dailySales.length / 2);
  const avgFirst = dailySales.slice(0, half).reduce((s, d) => s + d.revenueUYU, 0) / half;
  const avgSecond = dailySales.slice(half).reduce((s, d) => s + d.revenueUYU, 0) / (dailySales.length - half);
  const pct = avgFirst > 0 ? Math.round(((avgSecond - avgFirst) / avgFirst) * 100) : 0;
  if (pct > 5) return `aceleración +${pct}% en la segunda mitad del período`;
  if (pct < -5) return `desaceleración ${pct}% en la segunda mitad del período`;
  return `ritmo estable a lo largo del período (${pct > 0 ? '+' : ''}${pct}%)`;
}

// ─── Constructor del prompt ───────────────────────────────────────────────────
function buildPrompt(d: Record<string, any>, period: string): string {
  const periodoLabels: Record<string, string> = {
    week: 'última semana',
    month: 'último mes',
    semester: 'último semestre',
    year: 'último año',
  };

  const s = d.summary || {};
  const pp = d.previousPeriod || {};
  const topProducts: any[] = d.topProducts || [];
  const inventoryHealth: any[] = d.inventoryHealth || [];
  const statusDist: Record<string, number> = d.statusDistribution || {};
  const deptDist: Record<string, { orders: number; revenue: number }> = d.departmentDistribution || {};
  const shippingDist: Record<string, { orders: number; revenue: number }> = d.shippingTypeDistribution || {};
  const paymentDist: Record<string, { count: number; revenue: number }> = d.paymentMethodDistribution || {};
  const hourlyStats: Array<{ hour: number; orders: number }> = d.hourlyStats || [];
  const dailySales: Array<{ revenueUYU: number; orders: number }> = d.dailySales || [];
  const exchangeRate: number = d.exchangeRate || 0;
  const paidOrders: number = s.paidOrders || 0;

  // Geografía — top departamentos por ingresos
  const topDepts = topEntries(deptDist, 'revenue', 6);
  const totalDeptRevenue = topDepts.reduce((s, [, v]) => s + v.revenue, 0);
  const geoLines = topDepts.length
    ? topDepts.map(([dept, v]) => {
      const pct = totalDeptRevenue > 0 ? Math.round((v.revenue / totalDeptRevenue) * 100) : 0;
      return `  · ${dept}: ${v.orders} pedidos — ${fmtUYU(v.revenue)} (${pct}% del ingreso)`;
    }).join('\n')
    : '  Sin datos geográficos';

  // Envíos
  const topShipping = topEntries(shippingDist, 'orders', 4);
  const totalShippingOrders = topShipping.reduce((s, [, v]) => s + v.orders, 0);
  const shippingLines = topShipping.length
    ? topShipping.map(([type, v]) => {
      const pct = totalShippingOrders > 0 ? Math.round((v.orders / totalShippingOrders) * 100) : 0;
      return `  · ${type}: ${v.orders} pedidos (${pct}%) — ${fmtUYU(v.revenue)}`;
    }).join('\n')
    : '  Sin datos de envío';

  // Medios de pago
  const topPayments = topEntries(paymentDist, 'revenue', 5);
  const totalPaymentRev = topPayments.reduce((s, [, v]) => s + v.revenue, 0);
  const paymentLines = topPayments.length
    ? topPayments.map(([method, v]) => {
      const pct = totalPaymentRev > 0 ? Math.round((v.revenue / totalPaymentRev) * 100) : 0;
      return `  · ${method}: ${v.count} pedidos — ${fmtUYU(v.revenue)} (${pct}%)`;
    }).join('\n')
    : '  Sin datos de pagos';

  // Inventario crítico con detalle
  const criticalLines = inventoryHealth.length
    ? inventoryHealth.slice(0, 6).map(p =>
      `  · ${p.name} (SKU ${p.sku}): ${p.stock} uds en stock, ~${p.avgDailySales ?? '?'} ventas/día → ${p.daysRemaining >= 999 ? 'sin ventas recientes' : `~${p.daysRemaining} días de stock restante`
      }`
    ).join('\n')
    : '  Sin productos en estado crítico';

  // Estados de pedidos
  const estadosLine = Object.entries(statusDist)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([k, v]) => `${k}: ${v}`)
    .join(', ');

  // Cupones
  const topCoupon = s.topCoupons?.[0]?.code;
  const couponLine = topCoupon
    ? `${s.couponUsageRate || 0}% de pedidos usaron cupón (más usado: "${topCoupon}")`
    : `${s.couponUsageRate || 0}% de pedidos usaron cupón`;

  const contexto = `
PERÍODO: ${periodoLabels[period]}
MODELO DE NEGOCIO: La Aldea — ecommerce 100% online, Uruguay (sin canal físico)

━━━ INGRESOS ━━━
- UYU: ${fmtUYU(s.totalRevenueUYU || 0)} (${pp.revenueChangeUYU >= 0 ? '+' : ''}${pp.revenueChangeUYU || 0}% vs período anterior)
- USD: US$${(s.totalRevenueUSD || 0).toFixed(2)} (${pp.revenueChangeUSD >= 0 ? '+' : ''}${pp.revenueChangeUSD || 0}% vs período anterior)
- Combinado en UYU: ${fmtUYU(s.combinedRevenueUYU || 0)}
- Tipo de cambio: ${fmtUYU(exchangeRate)} / USD
- Tendencia intrapéríodo: ${trendSummary(dailySales)}

━━━ PEDIDOS ━━━
- Total: ${s.totalOrders || 0} | Pagados: ${paidOrders} (${pp.ordersChange >= 0 ? '+' : ''}${pp.ordersChange || 0}% vs anterior)
- En UYU: ${s.paidOrdersUYU || 0} pedidos | En USD: ${s.paidOrdersUSD || 0} pedidos
- Pendientes: ${s.pendingOrders || 0}
- Ticket promedio UYU: ${fmtUYU(s.avgOrderValueUYU || 0)} (${pp.aovChange >= 0 ? '+' : ''}${pp.aovChange || 0}% vs anterior)
- Ticket promedio USD: US$${(s.avgOrderValueUSD || 0).toFixed(2)}
- Estados: ${estadosLine}

━━━ CLIENTES ━━━
- Únicos en el período: ${s.uniqueCustomers || 0}
- Nuevos: ${s.newCustomers || 0} | Recurrentes: ${s.returningCustomers || 0}
- Tasa de conversión: ${s.conversionRate || 0}%
- Abandono de carrito: ${s.cartAbandonmentRate || 0}%
- ${couponLine}

━━━ OPERACIONES ━━━
- Fulfillment promedio: ${s.avgFulfillmentDays || 0} días (pago → entrega)
- Hora pico de compras (hoy): ${peakHours(hourlyStats)}

━━━ GEOGRAFÍA — DÓNDE COMPRAN LOS CLIENTES ━━━
${geoLines}

━━━ TIPO DE ENVÍO ━━━
${shippingLines}

━━━ MEDIOS DE PAGO ━━━
${paymentLines}

━━━ TOP 8 PRODUCTOS ━━━
${topProducts.slice(0, 8).map((p: any) =>
    `  · ${p.name}: ${p.sold} uds vendidas — ${fmtUYU(p.revenue || 0)} ingresos`
  ).join('\n') || '  Sin datos de productos'}

━━━ INVENTARIO EN RIESGO ━━━
${criticalLines}
`.trim();

  return `Sos un consultor senior especializado en ecommerce para La Aldea (Uruguay).
La Aldea es una tienda 100% online. No existe canal físico ni mostrador.
Tenés acceso a datos ricos del período: geografía de los clientes, horarios de compra, métodos de pago, tipo de envío e inventario detallado. Usá TODOS los datos relevantes para dar insights específicos y accionables.

Generá un reporte ejecutivo con estas 4 secciones, en español:

**DESEMPEÑO GENERAL**
[2-3 oraciones con cifras clave, tendencia del período y comparativa vs anterior. Incluí ingresos, pedidos y ticket promedio con números concretos.]

**FORTALEZAS DEL PERÍODO**
- [fortaleza con métrica específica — podés destacar departamentos top, productos estrella, método de pago dominante, horario pico u otro dato relevante]
- [fortaleza con métrica específica]
- [fortaleza con métrica específica]

**OPORTUNIDADES Y RECOMENDACIONES**
- [acción concreta priorizada, justificada con datos — puede ser sobre geografía sin explotar, stock crítico, abandono de carrito, tipo de envío, cupones u horario de campañas]
- [acción concreta priorizada]
- [acción concreta priorizada]

**PROYECCIÓN Y PRÓXIMOS PASOS**
[2-3 oraciones con proyección basada en la tendencia intrapéríodo y 1-2 prioridades concretas para el siguiente período.]

DATOS DEL PERÍODO:
${contexto}

Respondé ÚNICAMENTE con las 4 secciones. Usá números exactos del dataset. Tono ejecutivo profesional. Todo en español.`;
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
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Anthropic error (${res.status}): ${txt.slice(0, 100)}`);
    }

    const data = await res.json();
    return NextResponse.json({
      analysis: data.content?.[0]?.text || 'No se recibió análisis de Claude.',
      provider: 'claude',
    });
  } catch (err: any) {
    if (err.name === 'AbortError') throw new Error('Timeout: el análisis de Claude tomó más de 30s');
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
        max_tokens: 1000,
        temperature: 0.3,
        messages: [
          {
            role: 'system',
            content: 'Sos un consultor senior de ecommerce para una tienda uruguaya 100% online. No existe canal físico ni mostrador. Siempre respondé en español con tono ejecutivo. Usá los datos exactos que se te proporcionan y referenciá la geografía, horarios y métodos de pago cuando sean relevantes.',
          },
          { role: 'user', content: prompt },
        ],
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Groq error (${res.status}): ${txt.slice(0, 100)}`);
    }

    const data = await res.json();
    return NextResponse.json({
      analysis: data.choices?.[0]?.message?.content || 'No se recibió análisis de Groq.',
      provider: 'groq',
    });
  } catch (err: any) {
    if (err.name === 'AbortError') throw new Error('Timeout: el análisis de Groq tomó más de 30s');
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}