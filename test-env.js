#!/usr/bin/env node

/**
 * Test Environment Variables Loading
 * 
 * This script verifies that all required environment variables
 * are properly loaded and accessible.
 * 
 * Usage: node test-env.js
 */

console.log('\n🔍 Testing Environment Variables...\n');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const envVars = {
  '🗄️  Supabase': {
    'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    'SUPABASE_SERVICE_ROLE_KEY': process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  '💳 MercadoPago': {
    'MP_PUBLIC_KEY': process.env.MP_PUBLIC_KEY,
    'MP_ACCESS_TOKEN': process.env.MP_ACCESS_TOKEN,
  },
  '⚙️  App Config': {
    'NEXT_PUBLIC_URL': process.env.NEXT_PUBLIC_URL,
    'NODE_ENV': process.env.NODE_ENV,
  },
  '📊 Analytics': {
    'NEXT_PUBLIC_GA_ID': process.env.NEXT_PUBLIC_GA_ID,
  },
};

let allPassed = true;
let criticalMissing = false;

Object.keys(envVars).forEach(category => {
  console.log(`${category}:`);
  
  Object.entries(envVars[category]).forEach(([key, value]) => {
    const isCritical = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'MP_ACCESS_TOKEN',
    ].includes(key);
    
    if (value) {
      // Mask sensitive values
      let displayValue = value;
      if (key.includes('KEY') || key.includes('TOKEN')) {
        if (value.length > 20) {
          displayValue = `${value.substring(0, 15)}...${value.substring(value.length - 5)}`;
        } else {
          displayValue = value.substring(0, 8) + '...';
        }
      }
      
      console.log(`  ✅ ${key}: ${displayValue}`);
    } else {
      const status = isCritical ? '❌ CRITICAL' : '⚠️  Optional';
      console.log(`  ${status} ${key}: Not set`);
      allPassed = false;
      if (isCritical) criticalMissing = true;
    }
  });
  
  console.log('');
});

// Summary
console.log('━'.repeat(60));
if (allPassed) {
  console.log('✅ All environment variables loaded successfully!\n');
  process.exit(0);
} else if (criticalMissing) {
  console.log('❌ CRITICAL variables missing! Check .env.local file.\n');
  console.log('💡 Tip: Copy .env.example to .env.local and fill in real values.\n');
  process.exit(1);
} else {
  console.log('⚠️  Some optional variables missing, but OK to proceed.\n');
  process.exit(0);
}
