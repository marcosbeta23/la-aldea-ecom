// inngest/functions/generate-embedding.ts
// Auto-embed products on create/update via OpenAI text-embedding-3-small
import { inngest } from '@/lib/inngest';
import { supabaseAdmin } from '@/lib/supabase';

export const generateEmbedding = inngest.createFunction(
  { id: 'generate-product-embedding', name: 'Generate Product Embedding', retries: 2 },
  { event: 'product/embedding.needed' },
  async ({ event, step }) => {
    const { productId } = event.data;

    const embedding = await step.run('build-and-embed', async () => {
      const { data: product } = await (supabaseAdmin as any)
        .from('products')
        .select('name, description, brand, category, sku')
        .eq('id', productId)
        .single();

      if (!product) throw new Error(`Product ${productId} not found`);

      // Build a rich text representation — more context = better semantic matching
      const text = [
        product.name,
        product.brand,
        product.sku,
        product.category?.join(' '),
        product.description?.slice(0, 500),
      ].filter(Boolean).join(' — ');

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

      if (!res.ok) throw new Error(`OpenAI embeddings error: ${res.status}`);
      const data = await res.json();
      return data.data[0].embedding as number[];
    });

    await step.run('save-embedding', async () => {
      await (supabaseAdmin as any)
        .from('products')
        .update({ embedding: `[${embedding.join(',')}]` })
        .eq('id', productId);
    });

    return { productId, success: true };
  }
);
