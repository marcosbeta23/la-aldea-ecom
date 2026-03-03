import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'products';

  if (type === 'products') {
    try {
      const { data, error } = await supabaseAdmin
        .from('products')
        .select('sku, name, description, category, brand, price_numeric, currency, stock, is_active, shipping_type, availability_type')
        .order('name');

      if (error) throw error;
      if (!data || data.length === 0) {
        return new Response('No hay productos para exportar', { status: 404 });
      }

      const headers = ['sku', 'name', 'description', 'category', 'brand', 'price_numeric', 'currency', 'stock', 'is_active', 'shipping_type', 'availability_type'];

      const escapeCSV = (value: unknown): string => {
        if (value === null || value === undefined) return '';
        if (Array.isArray(value)) {
          const joined = value.join(', ');
          return `"${joined.replace(/"/g, '""')}"`;
        }
        const str = String(value);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const rows = data.map(row =>
        headers.map(h => escapeCSV((row as Record<string, unknown>)[h])).join(',')
      );

      const csv = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');

      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="productos.csv"',
        },
      });
    } catch (error: any) {
      console.error('Export error:', error);
      return NextResponse.json({ error: 'Error al exportar' }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Tipo de exportación no válido' }, { status: 400 });
}
