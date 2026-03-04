import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Release expired stock reservations
// Called by /api/cron/maintenance daily, or manually for testing

export async function GET(request: NextRequest) {
  // Verify cron secret (optional but recommended)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.error('Unauthorized cron request');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  console.log('🕐 Running stock release cron job...');
  
  try {
    // Call the RPC function to release expired reservations
    const { data, error } = await supabaseAdmin.rpc('release_expired_reservations');
    
    if (error) {
      console.error('Error releasing expired stock:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    }
    
    const releasedCount = data || 0;
    
    if (releasedCount > 0) {
      console.log(`✅ Released ${releasedCount} expired stock reservations`);
      
      // TODO: Send notification to admin about released reservations
      // This could be Slack, email, or push notification
    } else {
      console.log('✅ No expired reservations to release');
    }
    
    return NextResponse.json({ 
      success: true, 
      released: releasedCount,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('Cron job error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
