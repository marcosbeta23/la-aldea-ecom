import { supabaseAdmin } from '../lib/supabase';

interface CategoryAnalysis {
  category: string;
  productCount: number;
  brands: string[];
  topProducts: string[];
  suggestedKeywords: string[];
}

async function detectKeywords() {
  console.log('🔍 Analizando categorías y keywords...\n');

  const { data: products, error } = await supabaseAdmin
    .from('products')
    .select('name, category, brand, sold_count, description')
    .eq('is_active', true)
    .order('sold_count', { ascending: false });

  if (error || !products) {
    console.error('Error:', error);
    process.exit(1);
  }

  const categoryMap = new Map<string, CategoryAnalysis>();

  for (const product of products) {
    const cats = product.category || [];
    for (const cat of cats) {
      if (!cat) continue;
      if (!categoryMap.has(cat)) {
        categoryMap.set(cat, {
          category: cat,
          productCount: 0,
          brands: [],
          topProducts: [],
          suggestedKeywords: [],
        });
      }

      const analysis = categoryMap.get(cat)!;
      analysis.productCount++;

      if (product.brand && !analysis.brands.includes(product.brand)) {
        analysis.brands.push(product.brand);
      }

      if (analysis.topProducts.length < 5) {
        analysis.topProducts.push(product.name);
      }
    }
  }

  for (const [cat, analysis] of categoryMap) {
    const keywords = [
      cat.toLowerCase(),
      `${cat.toLowerCase()} Uruguay`,
      `${cat.toLowerCase()} Tala`,
      `${cat.toLowerCase()} Canelones`,
      `comprar ${cat.toLowerCase()}`,
      ...analysis.brands.map(b => `${cat.toLowerCase()} ${b}`),
    ];
    analysis.suggestedKeywords = keywords;
  }

  console.log('='.repeat(60));
  for (const [cat, analysis] of [...categoryMap.entries()].sort(
    (a, b) => b[1].productCount - a[1].productCount
  )) {
    console.log(`\n📦 CATEGORÍA: ${cat} (${analysis.productCount} productos)`);
    console.log(`   Marcas: ${analysis.brands.slice(0, 5).join(', ')}`);
    console.log(`   Top productos: ${analysis.topProducts.slice(0, 3).join(' | ')}`);
    console.log(`   Keywords sugeridas:`);
    analysis.suggestedKeywords.forEach(kw => console.log(`     - ${kw}`));
  }

  console.log('\n='.repeat(60));
  console.log(`\nTotal categorías: ${categoryMap.size}`);
  console.log(`Total productos analizados: ${products.length}`);
}

detectKeywords().catch(console.error);
