-- Migration: Convert category from text to text[] (array)
-- Run this in Supabase SQL Editor BEFORE deploying the code changes.
-- 
-- This converts single-category strings into arrays so products
-- can belong to multiple categories (e.g., a pool pump → ['Bombas', 'Piscinas']).

-- 1. Convert column type from text to text[]
ALTER TABLE products 
  ALTER COLUMN category TYPE text[] 
  USING CASE 
    WHEN category IS NOT NULL AND category != '' THEN ARRAY[category]::text[]
    ELSE ARRAY[]::text[]
  END;

-- 2. Set default to empty array (instead of NULL)
ALTER TABLE products ALTER COLUMN category SET DEFAULT ARRAY[]::text[];

-- 3. Replace any remaining NULLs with empty array
UPDATE products SET category = ARRAY[]::text[] WHERE category IS NULL;

-- 4. Normalize brand names: trim whitespace
UPDATE products SET brand = TRIM(brand) WHERE brand IS NOT NULL AND brand != TRIM(brand);

-- 5. Create GIN index for efficient array lookups
CREATE INDEX IF NOT EXISTS idx_products_category_gin ON products USING GIN (category);

-- Verify:
-- SELECT id, sku, name, category FROM products LIMIT 20;
