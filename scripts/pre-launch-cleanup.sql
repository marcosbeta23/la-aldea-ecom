-- =====================================================
-- LA ALDEA E-COMMERCE - PRE-LAUNCH DATA CLEANUP
-- Run this in Supabase SQL Editor
--
-- Deletes ALL test/transactional data while preserving
-- catalog data (products, brands, images, etc.)
-- =====================================================

-- ─────────────────────────────────────────────────────
-- WHAT THIS SCRIPT DOES:
--
-- DELETES (test transactional data):
--   - orders, order_items, order_logs, inventory_locks
--   - checkout_attempts, addresses
--   - search_analytics, admin_audit_log, inventory_log
--   - wishlist_items, product_reviews
--
-- RESETS (counters affected by test orders):
--   - products.sold_count → 0
--   - discount_coupons.current_uses → 0
--
-- KEEPS INTACT:
--   - products (catalog)
--   - product_images
--   - related_products
--   - partners
--   - admin_users
--   - discount_coupons (structure kept, usage counter reset)
--   - cms_content
-- ─────────────────────────────────────────────────────


BEGIN;

-- ═══════════════════════════════════════════════════════
-- PHASE 1: Delete child tables that reference orders
-- (must go first due to FK constraints)
-- ═══════════════════════════════════════════════════════

-- order_items → FK to orders(id) and products(id)
TRUNCATE TABLE public.order_items CASCADE;

-- order_logs → FK to orders(id) ON DELETE CASCADE
TRUNCATE TABLE public.order_logs CASCADE;

-- inventory_locks → FK to orders(id) and products(id) ON DELETE CASCADE
TRUNCATE TABLE public.inventory_locks CASCADE;


-- ═══════════════════════════════════════════════════════
-- PHASE 2: Delete the orders table
-- ═══════════════════════════════════════════════════════

TRUNCATE TABLE public.orders CASCADE;


-- ═══════════════════════════════════════════════════════
-- PHASE 3: Delete other transactional/test data tables
-- (no FK dependencies on each other)
-- ═══════════════════════════════════════════════════════

-- Checkout attempts (abandoned carts from testing)
TRUNCATE TABLE public.checkout_attempts;

-- Customer addresses saved during test checkouts
TRUNCATE TABLE public.addresses;

-- Search analytics gathered during testing
TRUNCATE TABLE public.search_analytics;

-- Admin audit log from test operations
TRUNCATE TABLE public.admin_audit_log;

-- Inventory change log from test orders
TRUNCATE TABLE public.inventory_log;

-- Test wishlist entries
TRUNCATE TABLE public.wishlist_items;

-- Test product reviews
TRUNCATE TABLE public.product_reviews;


-- ═══════════════════════════════════════════════════════
-- PHASE 4: Reset counters on preserved tables
-- ═══════════════════════════════════════════════════════

-- Reset sold_count on all products (all sales were test orders)
UPDATE public.products SET sold_count = 0 WHERE sold_count > 0;

-- Reset coupon usage counters (all uses were from test orders)
UPDATE public.discount_coupons SET current_uses = 0 WHERE current_uses > 0;


COMMIT;


-- ═══════════════════════════════════════════════════════
-- VERIFICATION (run after cleanup)
-- ═══════════════════════════════════════════════════════
-- Check all transactional tables are empty:
--   SELECT 'orders' AS tbl, COUNT(*) FROM orders
--   UNION ALL SELECT 'order_items', COUNT(*) FROM order_items
--   UNION ALL SELECT 'order_logs', COUNT(*) FROM order_logs
--   UNION ALL SELECT 'inventory_locks', COUNT(*) FROM inventory_locks
--   UNION ALL SELECT 'checkout_attempts', COUNT(*) FROM checkout_attempts
--   UNION ALL SELECT 'addresses', COUNT(*) FROM addresses
--   UNION ALL SELECT 'search_analytics', COUNT(*) FROM search_analytics
--   UNION ALL SELECT 'admin_audit_log', COUNT(*) FROM admin_audit_log
--   UNION ALL SELECT 'inventory_log', COUNT(*) FROM inventory_log
--   UNION ALL SELECT 'wishlist_items', COUNT(*) FROM wishlist_items
--   UNION ALL SELECT 'product_reviews', COUNT(*) FROM product_reviews;
--
-- Check counters were reset:
--   SELECT COUNT(*) AS products_with_sales FROM products WHERE sold_count > 0;
--   SELECT COUNT(*) AS coupons_with_uses FROM discount_coupons WHERE current_uses > 0;
--
-- Check catalog data is intact:
--   SELECT COUNT(*) AS total_products FROM products;
--   SELECT COUNT(*) AS total_partners FROM partners;
--   SELECT COUNT(*) AS total_admins FROM admin_users;
