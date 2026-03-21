// lib/search/intent-detection.ts
// Question vs product/category intent routing
// NOTE: Created but NOT wired into search yet — spec says "Week 2 after launch"
import { callGroq } from '@/lib/ai';

export type SearchIntent = 'product' | 'question' | 'category';

export async function detectIntent(query: string): Promise<SearchIntent> {
  // Cheap heuristic first — avoids Groq call entirely for obvious cases
  const questionWords = [
    'cómo', 'como', 'cuál', 'cual', 'qué', 'que', 'cuánto', 'cuanto',
    'dónde', 'donde', 'para qué', 'sirve', 'instalar', 'funciona',
  ];
  if (questionWords.some(w => query.toLowerCase().includes(w))) {
    return 'question';
  }

  // Only call Groq for ambiguous queries
  try {
    const raw = await callGroq({
      userPrompt: `Clasificá esta búsqueda en una ferretería uruguaya.
Query: "${query}"
- "product": busca un producto (bomba, manguera, filtro)  
- "question": hace una pregunta técnica o pide asesoramiento
- "category": busca una categoría (riego, piscinas, herramientas)
Respondé: {"intent": "product|question|category"}`,
      max_tokens: 20,
      temperature: 0,
      jsonMode: true,
    });
    const parsed = JSON.parse(raw);
    return parsed.intent ?? 'product';
  } catch {
    return 'product'; // Safe default
  }
}
