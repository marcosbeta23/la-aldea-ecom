import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { callClaude } from '@/lib/ai';

export async function POST(request: NextRequest) {
  const authResult = await verifyAdminAuth();
  if (!authResult.authorized) {
    return authResult.response;
  }

  try {
    const body = await request.json();
    const { name, brand, sku, category } = body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 });
    }
    if (!sku || typeof sku !== 'string') {
      return NextResponse.json({ error: 'SKU requerido' }, { status: 400 });
    }

    // Sanitize inputs — hard caps on length to prevent prompt stuffing
    const safeName = name.slice(0, 150).trim();
    const safeBrand = (brand || '').slice(0, 60).trim();
    const safeSku = sku.slice(0, 30).trim();
    const safeCat = Array.isArray(category)
      ? category.slice(0, 4).map((c: string) => String(c).slice(0, 50)).join(', ')
      : '';

    const response = await callClaude({
      system: `Sos redactor de fichas de productos para La Aldea, ferretería e hidráulica en Tala, Uruguay (desde 1999).
Idioma: español rioplatense. Tono: profesional, confiable, sin exagerar.
REGLA CRÍTICA: Respondé SOLO con JSON válido. Sin markdown, sin texto extra.
NUNCA inventes especificaciones técnicas que no te proporcionaron.`,
      messages: [{
        role: 'user',
        content: `Generá contenido para este producto del catálogo:
Nombre: ${safeName}
Marca: ${safeBrand || 'sin especificar'}
SKU: ${safeSku}
Categorías: ${safeCat || 'sin especificar'}

Devolvé SOLO este JSON (sin backticks ni markdown):
{
  "description": "2 oraciones útiles para el comprador, máx 250 caracteres",
  "seo_title": "título SEO máx 65 caracteres con marca/categoría si aplica",
  "keywords": ["kw1", "kw2", "kw3"]
}`,
      }],
      max_tokens: 350,
    });

    const textBlock = response.content.find((b: any) => b.type === 'text');
    if (!textBlock?.text) {
      return NextResponse.json({ error: 'Sin respuesta de IA' }, { status: 500 });
    }

    // Strip accidental markdown fences
    const clean = textBlock.text
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();

    // Security: reject if output contains suspicious injection patterns
    if (/IDENTIDAD|system:|<script|SELECT\s+\*/i.test(clean)) {
      console.error('[generate-product] suspicious output blocked');
      return NextResponse.json({ error: 'Respuesta inválida' }, { status: 500 });
    }

    const generated = JSON.parse(clean);

    // Validate expected shape
    if (typeof generated.description !== 'string' || typeof generated.seo_title !== 'string') {
      return NextResponse.json({ error: 'Formato de respuesta inválido' }, { status: 500 });
    }

    return NextResponse.json({ generated });
  } catch (error: any) {
    console.error('[generate-product] error:', error?.message);
    return NextResponse.json({ error: 'Error al generar contenido' }, { status: 500 });
  }
}