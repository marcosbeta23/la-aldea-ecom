-- Migration: Add availability_type column to products table
-- Run this in Supabase SQL Editor BEFORE deploying the new code
-- This adds support for "Consultar por producto" products

-- 1. Add the availability_type column with default 'regular'
ALTER TABLE products
ADD COLUMN IF NOT EXISTS availability_type text NOT NULL DEFAULT 'regular';

-- 2. Add a check constraint for valid values
ALTER TABLE products
ADD CONSTRAINT check_availability_type
CHECK (availability_type IN ('regular', 'on_request'));

-- 3. Optional: Create an index if you want to filter by availability_type
CREATE INDEX IF NOT EXISTS idx_products_availability_type
ON products (availability_type)
WHERE availability_type = 'on_request';

-- Done! All existing products will default to 'regular'.
-- To mark a product as "Consultar":
-- UPDATE products SET availability_type = 'on_request' WHERE id = '...';
