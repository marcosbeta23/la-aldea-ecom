import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Single query to get all counts efficiently
    const [allRes, activeRes, inactiveRes] = await Promise.all([
      supabaseAdmin.from('products').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabaseAdmin.from('products').select('id', { count: 'exact', head: true }).eq('is_active', false),
    ]);

    return NextResponse.json({
      total: allRes.count || 0,
      active: activeRes.count || 0,
      inactive: inactiveRes.count || 0,
    });
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Error al cargar estadísticas' }, { status: 500 });
  }
}
