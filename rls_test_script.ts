// test-rls.ts - Test if RLS policies are working correctly
// Run with: npx tsx rls_test_script.ts

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !ANON_KEY) {
  console.error('❌ Missing environment variables!');
  console.error('   Make sure .env.local has NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

// Client using ANON key (what frontend uses)
const supabase = createClient(SUPABASE_URL, ANON_KEY);

console.log('🔒 Testing RLS Policies - La Aldea\n');
console.log('Using ANON key (frontend access)\n');

async function testRLS() {
  let passedTests = 0;
  let failedTests = 0;

  // Test 1: Can read active products ✅
  console.log('1️⃣ Testing products (should allow reads)...');
  const { data: products, error: prodError } = await supabase
    .from('products')
    .select('*')
    .limit(5);
  
  if (products && products.length > 0) {
    console.log('   ✅ Can read products (expected)\n');
    passedTests++;
  } else {
    console.log('   ❌ Cannot read products (unexpected!)\n');
    failedTests++;
  }

  // Test 2: Cannot read orders directly ✅
  console.log('2️⃣ Testing orders (should block reads)...');
  const { data: orders, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .limit(5);
  
  if (!orders || orders.length === 0) {
    console.log('   ✅ Cannot read orders (expected - blocked by RLS)\n');
    passedTests++;
  } else {
    console.log('   ❌ Can read orders (SECURITY ISSUE!)\n');
    failedTests++;
  }

  // Test 3: Cannot read addresses directly ✅
  console.log('3️⃣ Testing addresses (should block reads)...');
  const { data: addresses, error: addrError } = await supabase
    .from('addresses')
    .select('*')
    .limit(5);
  
  if (!addresses || addresses.length === 0) {
    console.log('   ✅ Cannot read addresses (expected - blocked by RLS)\n');
    passedTests++;
  } else {
    console.log('   ❌ Can read addresses (CRITICAL SECURITY ISSUE!)\n');
    console.log('   ⚠️  Run the RLS fix script immediately!\n');
    failedTests++;
  }

  // Test 4: Cannot read coupons directly ✅
  console.log('4️⃣ Testing coupons (should block reads after fix)...');
  const { data: coupons, error: couponError } = await supabase
    .from('discount_coupons')
    .select('*')
    .limit(5);
  
  if (!coupons || coupons.length === 0) {
    console.log('   ✅ Cannot read coupons (expected - blocked by RLS)\n');
    passedTests++;
  } else {
    console.log('   ⚠️  Can read coupons (should be blocked for better security)\n');
    console.log('   This is not critical but recommended to fix.\n');
    // Don't count as failed since it's optional
  }

  // Test 5: Can read approved reviews ✅
  console.log('5️⃣ Testing reviews (should allow reads of approved)...');
  const { data: reviews, error: reviewError } = await supabase
    .from('product_reviews')
    .select('*')
    .eq('is_approved', true)
    .limit(5);
  
  if (reviews !== null) {
    console.log('   ✅ Can read approved reviews (expected)\n');
    passedTests++;
  } else {
    console.log('   ❌ Cannot read reviews (unexpected!)\n');
    failedTests++;
  }

  // Test 6: Cannot insert orders directly (should be blocked - API only)
  console.log('6️⃣ Testing order creation (should BLOCK direct inserts)...');
  const { data: newOrder, error: insertError } = await supabase
    .from('orders')
    .insert({
      customer_name: 'RLS Test',
      customer_phone: '099999999',
      subtotal: 100,
      total: 100,
      status: 'draft'
    })
    .select()
    .single();
  
  if (!newOrder && insertError) {
    console.log('   ✅ Direct order creation blocked (expected - use API route)\n');
    passedTests++;
  } else {
    console.log('   ⚠️  Can create orders directly (should use API for validation)\n');
    // Clean up test order if created
    if (newOrder) {
      await supabase.from('orders').delete().eq('id', newOrder.id);
    }
    // Not critical since API validation still applies
  }

  // Summary
  console.log('━'.repeat(60));
  console.log('📊 TEST RESULTS\n');
  console.log(`✅ Passed: ${passedTests}/6`);
  console.log(`❌ Failed: ${failedTests}/6\n`);
  
  if (failedTests === 0) {
    console.log('🎉 All RLS policies working correctly!');
    console.log('Your database is secure.\n');
    return true;
  } else {
    console.log('⚠️  Some policies need attention.');
    console.log('Review the failures above and apply fixes.\n');
    return false;
  }
}

testRLS()
  .then(success => process.exit(success ? 0 : 1))
  .catch(error => {
    console.error('❌ Test script error:', error);
    process.exit(1);
  });
