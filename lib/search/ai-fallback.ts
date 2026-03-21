// lib/search/ai-fallback.ts
// Zero-result fallback — suggests categories via Groq when 3-layer search returns nothing
import { callGroq } from '@/lib/ai';

export async function getSearchFallback(
  query: string,
  availableCategories: string[]
): Promise<{ message: string; suggestions: string[] }> {
  try {
    const raw = await callGroq({
      systemPrompt: `Sos un asistente de búsqueda para La Aldea, ferretería en Uruguay.
Categorías disponibles: ${availableCategories.join(', ')}.
Respondé SOLO con JSON válido, sin markdown ni texto adicional.`,
      userPrompt: `El cliente buscó "${query}" y no encontró resultados.
Sugerí 2-3 categorías del catálogo que podrían ser lo que busca.
Formato: {"message": "texto corto amigable en español rioplatense", "suggestions": ["cat1", "cat2"]}`,
      max_tokens: 150,
      temperature: 0.3,
      jsonMode: true,
    });

    return JSON.parse(raw);
  } catch {
    // Always silent fail — never break search
    return { message: 'No encontramos resultados exactos.', suggestions: [] };
  }
}
