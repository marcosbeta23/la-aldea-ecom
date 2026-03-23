// app/api/admin/assistant/route.ts
// Agentic Claude endpoint with tool loop — admin assistant
import { NextRequest, NextResponse } from 'next/server';
import { verifyOwnerAuth } from '@/lib/admin-auth';
import { callClaude } from '@/lib/ai';
import { executeTool } from './tools';

// ── System prompt ────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `
Sos el asistente de administración de La Aldea, ferretería en Tala, Uruguay.
Respondé siempre en español rioplatense. Sé conciso — el dueño es ocupado.

Reglas:
- Cuando necesités datos, usá las herramientas ANTES de responder.
- Nunca inventes datos ni estimes. Si no podés obtenerlos, decí exactamente eso.
- Las cifras monetarias siempre en UYU salvo que el pedido sea en USD.
- Si hay múltiples resultados, listá los más relevantes (máximo 5) salvo que te pidan todos.
- El negocio tiene ventas online y ventas mostrador (presenciales). Distinguilos cuando sea relevante.
`;

// ── Tool definitions (matching Supabase schema) ─────────────────────────

const TOOLS = [
  {
    name: 'get_orders',
    description: 'Busca pedidos por estado, fecha, cliente, método de pago o envío. Usá para responder sobre pedidos pendientes, de un cliente, o de un período.',
    input_schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['draft', 'pending', 'paid', 'paid_pending_verification', 'awaiting_stock',
                 'ready_to_invoice', 'invoiced', 'processing', 'shipped', 'delivered',
                 'cancelled', 'refunded'],
        },
        days_ago: { type: 'number', description: 'Pedidos de los últimos N días' },
        customer_name: { type: 'string' },
        payment_method: { type: 'string', enum: ['mercadopago', 'transfer'] },
        shipping_type: { type: 'string', enum: ['pickup', 'dac', 'freight'] },
        order_source: { type: 'string', enum: ['online', 'mostrador'] },
        limit: { type: 'number', default: 10 },
      },
    },
  },
  {
    name: 'get_sales_summary',
    description: 'Ingresos totales, cantidad de pedidos y ticket promedio para un período. Usá para responder "cómo vamos hoy/esta semana/este mes".',
    input_schema: {
      type: 'object',
      properties: {
        period: { type: 'string', enum: ['today', 'week', 'month'] },
      },
      required: ['period'],
    },
  },
  {
    name: 'get_low_stock_products',
    description: 'Productos con stock por debajo del umbral. Usá cuando preguntan qué hay que reponer.',
    input_schema: {
      type: 'object',
      properties: {
        threshold: { type: 'number', default: 5 },
        category: { type: 'string' },
      },
    },
  },
  {
    name: 'get_product_by_name_or_sku',
    description: 'Busca un producto por nombre aproximado o SKU exacto.',
    input_schema: {
      type: 'object',
      properties: { query: { type: 'string' } },
      required: ['query'],
    },
  },
  {
    name: 'get_customer_history',
    description: 'Historial de pedidos de un cliente por email o nombre.',
    input_schema: {
      type: 'object',
      properties: {
        email: { type: 'string' },
        name: { type: 'string' },
      },
    },
  },
  {
    name: 'get_abandoned_carts',
    description: 'Carritos de las últimas N horas que no convirtieron a pedido.',
    input_schema: {
      type: 'object',
      properties: { hours_ago: { type: 'number', default: 24 } },
    },
  },
  {
    name: 'get_search_gaps',
    description: 'Búsquedas sin resultados más frecuentes — indica qué productos agregar al catálogo.',
    input_schema: {
      type: 'object',
      properties: {
        days_ago: { type: 'number', default: 7 },
        limit: { type: 'number', default: 10 },
      },
    },
  },
];

// ── Rate limit (in-memory, 20 req/min for owner) ────────────────────────

const rl = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(ip: string) {
  const now = Date.now();
  const entry = rl.get(ip);
  if (!entry || now > entry.resetAt) {
    rl.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 20) return false;
  entry.count++;
  return true;
}

// ── POST handler ─────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const authResult = await verifyOwnerAuth();
  if (!authResult.authorized) return authResult.response;

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Demasiadas solicitudes. Esperá un minuto.' },
      { status: 429 }
    );
  }

  const { messages } = await req.json();

  // Trim context window — keeps costs bounded
  const MAX_HISTORY = 20;
  const trimmedMessages = messages.slice(-MAX_HISTORY);

  try {
    let response = await callClaude({
      system: SYSTEM_PROMPT,
      messages: trimmedMessages,
      tools: TOOLS,
      max_tokens: 1024,
    });

    // Agentic loop — keep running until Claude stops using tools
    let iterations = 0;
    const MAX_ITERATIONS = 5;

    while (response.stop_reason === 'tool_use' && iterations < MAX_ITERATIONS) {
      iterations++;
      const toolUses = response.content.filter((b: any) => b.type === 'tool_use');

      const toolResults = await Promise.all(
        toolUses.map(async (tu: any) => {
          try {
            return {
              type: 'tool_result' as const,
              tool_use_id: tu.id,
              content: JSON.stringify(await executeTool(tu.name, tu.input)),
            };
          } catch (toolErr: any) {
            return {
              type: 'tool_result' as const,
              tool_use_id: tu.id,
              content: JSON.stringify({ error: `Tool ${tu.name} failed: ${toolErr.message}` }),
              is_error: true,
            };
          }
        })
      );

      response = await callClaude({
        system: SYSTEM_PROMPT,
        messages: [
          ...trimmedMessages,
          { role: 'assistant', content: response.content },
          { role: 'user', content: toolResults },
        ],
        tools: TOOLS,
        max_tokens: 1024,
      });
    }

    const text = response.content
      .filter((b: any) => b.type === 'text')
      .map((b: any) => b.text)
      .join('');

    return NextResponse.json({ reply: text });
  } catch (err: any) {
    console.error('Assistant error:', err);
    return NextResponse.json(
      { error: err.message || 'Error al procesar la consulta. Intentá de nuevo.' },
      { status: 500 }
    );
  }
}
