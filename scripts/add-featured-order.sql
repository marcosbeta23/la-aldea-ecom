-- Add featured_order column to products table
-- This column controls the display order of featured products in the homepage carousel.
-- NULL means no specific order (sorted last). Lower numbers appear first.

ALTER TABLE products ADD COLUMN IF NOT EXISTS featured_order integer DEFAULT NULL;

-- Optional: set initial order for existing featured products based on name
-- UPDATE products
-- SET featured_order = sub.rn
-- FROM (
--   SELECT id, ROW_NUMBER() OVER (ORDER BY name) - 1 AS rn
--   FROM products
--   WHERE is_featured = true
-- ) sub
-- WHERE products.id = sub.id;
