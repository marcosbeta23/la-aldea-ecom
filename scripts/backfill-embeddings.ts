// scripts/backfill-embeddings.ts
// Run locally: npx tsx scripts/backfill-embeddings.ts
// One-time bulk embed for existing ~400 products at ~$0.04 total cost

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getEmbedding(text: string): Promise<number[]> {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
      dimensions: 1536,
    }),
  });
  const data = await res.json();
  if (!data.data?.[0]?.embedding) {
    throw new Error(`No embedding returned: ${JSON.stringify(data).slice(0, 200)}`);
  }
  return data.data[0].embedding;
}

async function main() {
  console.log('Backfilling product embeddings...');
  console.log(`Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 30)}...`);

  // Only products missing embeddings — safe to re-run after interruption
  const { data: products, error } = await (supabase as any)
    .from('products')
    .select('id, name, description, brand, category, sku')
    .eq('is_active', true)
    .is('embedding', null)
    .order('created_at', { ascending: true });

  if (error || !products) {
    console.error('Failed to fetch products:', error);
    return;
  }

  console.log(`Found ${products.length} products without embeddings.`);

  let success = 0;
  let failed = 0;

  for (const p of products) {
    const text = [p.name, p.brand, p.sku, p.category?.join(' '), p.description?.slice(0, 500)]
      .filter(Boolean).join(' — ');

    try {
      const embedding = await getEmbedding(text);

      await (supabase as any)
        .from('products')
        .update({ embedding: `[${embedding.join(',')}]` })
        .eq('id', p.id);

      success++;
      if (success % 25 === 0) console.log(`  ${success}/${products.length} done...`);
    } catch (err) {
      failed++;
      console.error(`  ✗ Failed: ${p.name} (${p.id})`, err);
    }

    // 300ms gap — well within OpenAI's rate limits
    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\nDone. ${success} succeeded, ${failed} failed.`);
  if (failed > 0) console.log('Re-run to retry failed products (safe — skips already embedded).');
}

main();
