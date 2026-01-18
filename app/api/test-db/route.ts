import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Test connection with a simple query
    const { data, error } = await supabase
      .from('products')
      .select('id, name')
      .limit(1);

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        hint: 'Check your Supabase credentials in .env.local',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful!',
      sample: data,
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    });
  }
}
