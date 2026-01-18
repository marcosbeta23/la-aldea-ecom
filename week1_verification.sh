#!/bin/bash
# Week 1 Verification Script
# Run this before starting Week 2

echo "🔍 WEEK 1 VERIFICATION - La Aldea E-Commerce"
echo "=============================================="
echo ""

# 1. Check environment
echo "1️⃣ Checking environment..."
if [ -f ".env.local" ]; then
    echo "   ✅ .env.local exists"
    
    # Check critical variables
    if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
        echo "   ✅ Supabase URL configured"
    else
        echo "   ❌ Missing NEXT_PUBLIC_SUPABASE_URL"
    fi
    
    if grep -q "SUPABASE_SERVICE_ROLE_KEY" .env.local; then
        echo "   ✅ Supabase service role key configured"
    else
        echo "   ❌ Missing SUPABASE_SERVICE_ROLE_KEY"
    fi
    
    if grep -q "MP_ACCESS_TOKEN" .env.local; then
        echo "   ✅ MercadoPago token configured"
    else
        echo "   ❌ Missing MP_ACCESS_TOKEN"
    fi
else
    echo "   ❌ .env.local not found!"
fi
echo ""

# 2. Check dependencies
echo "2️⃣ Checking dependencies..."
if [ -f "package.json" ]; then
    echo "   ✅ package.json exists"
    
    if grep -q "@supabase/supabase-js" package.json; then
        echo "   ✅ Supabase client installed"
    else
        echo "   ⚠️  Supabase client not installed - run: pnpm install @supabase/supabase-js"
    fi
    
    if grep -q "zustand" package.json; then
        echo "   ✅ Zustand installed"
    else
        echo "   ⚠️  Zustand not installed - run: pnpm install zustand"
    fi
else
    echo "   ❌ package.json not found!"
fi
echo ""

# 3. Check folder structure
echo "3️⃣ Checking folder structure..."
folders=("app" "components" "lib" "types" "hooks" "public")
for folder in "${folders[@]}"; do
    if [ -d "$folder" ]; then
        echo "   ✅ /$folder exists"
    else
        echo "   ⚠️  /$folder missing - create it: mkdir $folder"
    fi
done
echo ""

# 4. Check critical files
echo "4️⃣ Checking critical files..."
files=(
    "app/layout.tsx"
    "app/page.tsx"
    "lib/supabase.ts"
    "types/database.ts"
    "middleware.ts"
    ".gitignore"
)
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file exists"
    else
        echo "   ⚠️  $file missing"
    fi
done
echo ""

# 5. Check git setup
echo "5️⃣ Checking git setup..."
if [ -d ".git" ]; then
    echo "   ✅ Git initialized"
    
    if git remote -v | grep -q "origin"; then
        echo "   ✅ Remote origin set"
        git remote -v | head -n 1
    else
        echo "   ⚠️  No remote origin - connect to GitHub"
    fi
else
    echo "   ❌ Git not initialized - run: git init"
fi
echo ""

# 6. Test environment variables loading
echo "6️⃣ Testing environment variables..."
if command -v node &> /dev/null; then
    echo "   Running test-env.js..."
    if [ -f "test-env.js" ]; then
        node test-env.js
    else
        echo "   ⚠️  test-env.js not found (optional)"
    fi
else
    echo "   ⚠️  Node.js not found in PATH"
fi
echo ""

# 7. Check if dev server runs
echo "7️⃣ Testing dev server (will start and stop)..."
if command -v pnpm &> /dev/null; then
    echo "   ℹ️  Starting dev server for 5 seconds..."
    timeout 5s pnpm dev &> /dev/null
    if [ $? -eq 124 ]; then
        echo "   ✅ Dev server starts successfully"
    else
        echo "   ⚠️  Dev server may have issues - check manually with: pnpm dev"
    fi
else
    echo "   ⚠️  pnpm not found - install it: npm install -g pnpm"
fi
echo ""

# 8. Security check
echo "8️⃣ Security check..."
if grep -r "SUPABASE_SERVICE_ROLE_KEY\|MP_ACCESS_TOKEN" app/ components/ 2>/dev/null; then
    echo "   ❌ DANGER: Service keys found in frontend code!"
    echo "   These keys should ONLY be in lib/ and app/api/ files"
else
    echo "   ✅ No sensitive keys in frontend code"
fi

if [ -f ".env.local" ] && git ls-files --error-unmatch .env.local 2>/dev/null; then
    echo "   ❌ DANGER: .env.local is tracked by git!"
    echo "   Run: git rm --cached .env.local"
else
    echo "   ✅ .env.local not tracked by git"
fi
echo ""

# Summary
echo "=============================================="
echo "📊 VERIFICATION SUMMARY"
echo "=============================================="
echo ""
echo "If you see mostly ✅ above, you're ready for Week 2!"
echo ""
echo "⚠️  If you see ❌ or ⚠️  warnings, fix them first:"
echo "   1. Add missing environment variables to .env.local"
echo "   2. Install missing dependencies"
echo "   3. Create missing files/folders"
echo "   4. Fix security issues"
echo ""
echo "🎯 Next Steps:"
echo "   1. Fix RLS policies in Supabase (artifact: rls_security_audit)"
echo "   2. Test RLS with: npx tsx test-rls.ts (artifact: rls_test_script)"
echo "   3. Add security middleware (artifact: security_middleware)"
echo "   4. Start Week 2: Homepage + Services First"
echo ""
echo "Need help? Check the guide or ask!"
