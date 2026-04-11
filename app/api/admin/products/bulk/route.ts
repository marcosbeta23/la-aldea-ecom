import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { normalizeCategory, normalizeBrand } from '@/lib/validators';
import type { Database } from '@/types/database';

type ProductInsert = Database['public']['Tables']['products']['Insert'];

type ProductWriteResponse = {
  error: { code?: string; message: string } | null;
};

const productsBulkInsertBridge = supabaseAdmin as unknown as {
  from: (table: 'products') => {
    insert: (values: ProductInsert[]) => Promise<ProductWriteResponse>;
  };
};

type BulkProductInput = {
  sku?: unknown;
  name?: unknown;
  description?: unknown;
  category?: unknown;
  brand?: unknown;
  price_numeric?: unknown;
  currency?: unknown;
  stock?: unknown;
  is_active?: unknown;
  availability_type?: unknown;
  show_price_on_request?: unknown;
  shipping_type?: unknown;
  weight_kg?: unknown;
  requires_quote?: unknown;
  is_featured?: unknown;
  original_price_numeric?: unknown;
  discount_percentage?: unknown;
  slug?: unknown;
};

function parseString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function parseNumber(value: unknown, fallback = 0): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseBoolean(value: unknown, fallback: boolean): boolean {
  if (value === true || value === 'true' || value === 'True' || value === '1' || value === 1) return true;
  if (value === false || value === 'false' || value === 'False' || value === '0' || value === 0) return false;
  return fallback;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'object' && error && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  return fallback;
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const products = body?.products;

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: 'No se enviaron productos' }, { status: 400 });
    }

    const parsedProducts = products.filter(
      (product): product is BulkProductInput => typeof product === 'object' && product !== null
    );

    if (parsedProducts.length !== products.length) {
      return NextResponse.json({ error: 'Formato de productos inválido' }, { status: 400 });
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
    const skus = parsedProducts
      .map((product) => parseString(product.sku))
      .filter(Boolean);

    const { data: existingProducts } = await supabaseAdmin
      .from('products')
      .select('sku')
      .in('sku', skus);

    const existingProductRows = (existingProducts || []) as Array<{ sku: string }>;
    const existingSKUs = new Set(existingProductRows.map((product) => product.sku));

    // Process in batches of 50
    const BATCH_SIZE = 50;
    const toInsert: ProductInsert[] = [];

    for (let i = 0; i < parsedProducts.length; i++) {
      const p = parsedProducts[i];
      const rowNum = i + 2; // +2 because row 1 is header, arrays are 0-indexed
      const sku = parseString(p.sku);
      const name = parseString(p.name);

      // Validate required fields
      if (!sku || !name) {
        results.errors.push(`Fila ${rowNum}: SKU y nombre son requeridos`);
        results.skipped++;
        continue;
      }

      // Skip duplicates
      if (existingSKUs.has(sku)) {
        results.errors.push(`Fila ${rowNum}: SKU "${sku}" ya existe`);
        results.skipped++;
        continue;
      }

      // Check for duplicate SKU within the CSV itself
      if (toInsert.some((item) => item.sku === sku)) {
        results.errors.push(`Fila ${rowNum}: SKU "${sku}" duplicado en CSV`);
        results.skipped++;
        continue;
      }

      const price = parseNumber(p.price_numeric, 0);
      const stock = Math.max(0, Math.trunc(parseNumber(p.stock, 0)));
      const currencyRaw = parseString(p.currency);
      const currency = (currencyRaw || 'UYU').toUpperCase();

      if (!['UYU', 'USD'].includes(currency)) {
        results.errors.push(`Fila ${rowNum}: Moneda "${currencyRaw || 'vacía'}" inválida (usar UYU o USD)`);
        results.skipped++;
        continue;
      }

      const rawCategory = p.category;
      const normalizedCategory = rawCategory
        ? (typeof rawCategory === 'string'
            ? rawCategory
                .split(',')
                .map((category) => category.trim())
                .filter(Boolean)
                .map((category) => normalizeCategory(category))
            : Array.isArray(rawCategory)
              ? rawCategory
                  .filter((category): category is string => typeof category === 'string')
                  .map((category) => normalizeCategory(category.trim()))
              : [])
        : [];

      const availabilityType = p.availability_type === 'on_request' ? 'on_request' : 'regular';
      const rawShippingType = parseString(p.shipping_type);
      const shippingType = rawShippingType === 'freight' || rawShippingType === 'pickup_only' ? rawShippingType : 'dac';
      const originalPriceNumeric = parseNullableNumber(p.original_price_numeric);
      const discountPercentageRaw = parseNullableNumber(p.discount_percentage);
      const discountPercentage = discountPercentageRaw === null ? null : Math.trunc(discountPercentageRaw);

      toInsert.push({
        sku,
        name,
        description: parseString(p.description) || name || null,
        category: normalizedCategory,
        brand: parseString(p.brand) ? normalizeBrand(parseString(p.brand)) : null,
        price_numeric: price,
        currency,
        stock,
        sold_count: 0,
        images: [],
        is_active: parseBoolean(p.is_active, true),
        availability_type: availabilityType,
        show_price_on_request: parseBoolean(p.show_price_on_request, false),
        shipping_type: shippingType,
        weight_kg: parseNullableNumber(p.weight_kg),
        requires_quote: parseBoolean(p.requires_quote, false),
        is_featured: parseBoolean(p.is_featured, false),
        featured_order: null,
        original_price: originalPriceNumeric ? `$${originalPriceNumeric.toLocaleString()}` : null,
        original_price_numeric: originalPriceNumeric,
        discount_percentage: discountPercentage,
        discount_ends_at: null,
        slug: parseString(p.slug) || null,
      });
    }

    // Insert in batches
    for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
      const batch = toInsert.slice(i, i + BATCH_SIZE);
      const { error } = await productsBulkInsertBridge
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
  } catch (error: unknown) {
    console.error('Bulk import error:', error);
    return NextResponse.json(
      { error: getErrorMessage(error, 'Error en la importación') },
      { status: 500 }
    );
  }
}
