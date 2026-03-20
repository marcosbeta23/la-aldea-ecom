const GROQ_API_KEY = process.env.GROQ_API_KEY;

interface GeneratedKeywords {
  category: string;
  primaryKeywords: string[];
  longTailKeywords: string[];
  uruguayanVariants: string[];
  ruralVariants: string[];
}

async function generateKeywordsForCategory(
  category: string,
  topProducts: string[],
  brands: string[]
): Promise<GeneratedKeywords> {

  const prompt = `Eres un experto en SEO para e-commerce en Uruguay.

La tienda "La Aldea" en Tala, Canelones, Uruguay vende productos de la categoría: "${category}".
Productos destacados: ${topProducts.join(', ')}.
Marcas: ${brands.join(', ')}.

Genera keywords en español (castellano rioplatense/uruguayo) que los usuarios uruguayos buscarían en Google para encontrar estos productos.

Responde SOLO con JSON válido, sin texto adicional:
{
  "primaryKeywords": ["keyword1", "keyword2"],
  "longTailKeywords": ["keyword long tail 1", "keyword long tail 2"],
  "uruguayanVariants": ["variante típica uruguaya 1"],
  "ruralVariants": ["variante rural/campo 1"]
}

Incluir:
- Términos en castellano rioplatense (caño en vez de tubo, llave de paso en vez de válvula, etc.)
- Variantes con "Uruguay", "Tala", "Canelones", "campo", "chacra"
- Long tails informativos ("cómo", "qué", "cuánto", "cuál es mejor")
- Máximo 8 keywords por sección`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 500,
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || '{}';

  try {
    const parsed = JSON.parse(text);
    return {
      category,
      primaryKeywords: parsed.primaryKeywords || [],
      longTailKeywords: parsed.longTailKeywords || [],
      uruguayanVariants: parsed.uruguayanVariants || [],
      ruralVariants: parsed.ruralVariants || [],
    };
  } catch {
    console.error(`Error parseando respuesta para ${category}:`, text);
    return {
      category,
      primaryKeywords: [],
      longTailKeywords: [],
      uruguayanVariants: [],
      ruralVariants: [],
    };
  }
}

async function generateAllKeywords() {
  const categories = [
    {
      name: 'Bombas',
      products: ['Bomba Centrífuga 1HP', 'Bomba Sumergible', 'Presurizadora'],
      brands: ['Gianni', 'DIU', 'Lusqtoff'],
    },
    {
      name: 'Riego',
      products: ['Gotero', 'Aspersor', 'Cinta de riego', 'Filtro de disco'],
      brands: ['Gianni', 'Nicoll', 'Tigre'],
    },
    {
      name: 'Piscinas',
      products: ['Cloro granulado', 'Algicida', 'pH regulator'],
      brands: ['Hidroservice'],
    },
  ];

  console.log('🤖 Generando keywords con Groq AI...\n');

  const results: GeneratedKeywords[] = [];

  for (const cat of categories) {
    console.log(`Procesando: ${cat.name}...`);
    const keywords = await generateKeywordsForCategory(cat.name, cat.products, cat.brands);
    results.push(keywords);

    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  const output = `// lib/seo-clusters-generated.ts
// AUTO-GENERADO por scripts/generate-keywords-ai.ts
// Revisar y validar antes de incorporar a seo-clusters.ts

export const AI_GENERATED_KEYWORDS = ${JSON.stringify(results, null, 2)};
`;

  const fs = await import('fs');
  fs.writeFileSync('lib/seo-clusters-generated.ts', output);

  console.log('\n✅ Keywords generadas en lib/seo-clusters-generated.ts');
  console.log('📋 Revisar el archivo antes de incorporar a seo-clusters.ts');
}

generateAllKeywords().catch(console.error);
