import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { normalizeCategory } from '@/lib/validators';

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { products } = body;

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: 'No se enviaron productos' }, { status: 400 });
    }

    if (products.length > 500) {
      return NextResponse.json({ error: 'Máximo 500 productos por lote' }, { status: 400 });
    }

    const results = {
      created: 0,
      skipped: 0,
      errors: [] as string[],
    };

    // Get all existing SKUs to check for duplicates
    const skus = products.map((p: any) => p.sku).filter(Boolean);
    const { data: existingProducts } = await supabaseAdmin
      .from('products')
      .select('sku')
      .in('sku', skus);

    const existingSKUs = new Set((existingProducts || []).map((p: any) => p.sku));

    // Process in batches of 50
    const BATCH_SIZE = 50;
    const toInsert: any[] = [];

    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      const rowNum = i + 2; // +2 because row 1 is header, arrays are 0-indexed

      // Validate required fields
      if (!p.sku || !p.name) {
        results.errors.push(`Fila ${rowNum}: SKU y nombre son requeridos`);
        results.skipped++;
        continue;
      }

      // Skip duplicates
      if (existingSKUs.has(p.sku)) {
        results.errors.push(`Fila ${rowNum}: SKU "${p.sku}" ya existe`);
        results.skipped++;
        continue;
      }

      // Check for duplicate SKU within the CSV itself
      if (toInsert.some(item => item.sku === p.sku)) {
        results.errors.push(`Fila ${rowNum}: SKU "${p.sku}" duplicado en CSV`);
        results.skipped++;
        continue;
      }

      const price = parseFloat(p.price_numeric) || 0;
      const stock = parseInt(p.stock) || 0;
      const currency = (p.currency || 'UYU').toUpperCase();

      if (!['UYU', 'USD'].includes(currency)) {
        results.errors.push(`Fila ${rowNum}: Moneda "${p.currency}" inválida (usar UYU o USD)`);
        results.skipped++;
        continue;
      }

      toInsert.push({
        sku: p.sku.trim(),
        name: p.name.trim(),
        description: (p.description || p.name).trim() || null,
        category: p.category
          ? (typeof p.category === 'string' ? p.category.split(',').map((c: string) => c.trim()).filter(Boolean).map((c: string) => normalizeCategory(c)) : Array.isArray(p.category) ? p.category.map((c: string) => normalizeCategory(c)) : [])
          : [],
        brand: (p.brand || '').trim() || null,
        price_numeric: price,
        currency,
        stock,
        sold_count: 0,
        images: [],
        is_active: p.is_active === 'False' || p.is_active === false || p.is_active === '0' ? false : true,
        availability_type: p.availability_type === 'on_request' ? 'on_request' : 'regular',
        shipping_type: p.shipping_type || 'dac',
        weight_kg: p.weight_kg ? parseFloat(p.weight_kg) : null,
        requires_quote: p.requires_quote === 'true' || p.requires_quote === true,
        is_featured: p.is_featured === 'true' || p.is_featured === true,
        original_price_numeric: p.original_price_numeric ? parseFloat(p.original_price_numeric) : null,
        discount_percentage: p.discount_percentage ? parseInt(p.discount_percentage) : null,
      });
    }

    // Insert in batches
    for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
      const batch = toInsert.slice(i, i + BATCH_SIZE);
      const { error } = await (supabaseAdmin as any)
        .from('products')
        .insert(batch);

      if (error) {
        results.errors.push(`Error en lote ${Math.floor(i / BATCH_SIZE) + 1}: ${error.message}`);
      } else {
        results.created += batch.length;
      }
    }

    // Bust ISR cache for product listings
    if (results.created > 0) {
      revalidatePath('/productos');
    }

    return NextResponse.json({
      success: true,
      results,
      message: `${results.created} productos creados, ${results.skipped} omitidos`,
    });
  } catch (error: any) {
    console.error('Bulk import error:', error);
    return NextResponse.json(
      { error: error.message || 'Error en la importación' },
      { status: 500 }
    );
  }
}
