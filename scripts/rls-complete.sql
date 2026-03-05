-- =====================================================
-- LA ALDEA E-COMMERCE - COMPLETE RLS + INDEXES MIGRATION
-- Run this in Supabase SQL Editor
-- =====================================================


-- ─────────────────────────────────────────────────────
-- HELPER: wrap all RLS in a single transaction
-- ─────────────────────────────────────────────────────


-- =====================================================
-- SECTION 1: CRITICAL — service_role-only tables
-- (contain PII or sensitive business data)
-- =====================================================

-- 1a. admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access on admin_users" ON public.admin_users;
CREATE POLICY "Service role full access on admin_users"
  ON public.admin_users FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 1b. admin_audit_log
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access on admin_audit_log" ON public.admin_audit_log;
CREATE POLICY "Service role full access on admin_audit_log"
  ON public.admin_audit_log FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 1c. orders  (PII, payment IDs — most critical)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access on orders" ON public.orders;
CREATE POLICY "Service role full access on orders"
  ON public.orders FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 1d. order_items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access on order_items" ON public.order_items;
CREATE POLICY "Service role full access on order_items"
  ON public.order_items FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 1e. addresses
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access on addresses" ON public.addresses;
CREATE POLICY "Service role full access on addresses"
  ON public.addresses FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 1f. discount_coupons
ALTER TABLE public.discount_coupons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access on discount_coupons" ON public.discount_coupons;
CREATE POLICY "Service role full access on discount_coupons"
  ON public.discount_coupons FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 1g. inventory_log
ALTER TABLE public.inventory_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access on inventory_log" ON public.inventory_log;
CREATE POLICY "Service role full access on inventory_log"
  ON public.inventory_log FOR ALL TO service_role
  USING (true) WITH CHECK (true);


-- =====================================================
-- SECTION 2: service_role-only (all queries via API)
-- =====================================================

-- 2a. product_reviews (submissions and reads all go through API routes using supabaseAdmin)
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access on product_reviews" ON public.product_reviews;
CREATE POLICY "Service role full access on product_reviews"
  ON public.product_reviews FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 2b. partners
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access on partners" ON public.partners;
CREATE POLICY "Service role full access on partners"
  ON public.partners FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 2c. related_products
ALTER TABLE public.related_products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access on related_products" ON public.related_products;
CREATE POLICY "Service role full access on related_products"
  ON public.related_products FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 2d. search_analytics
ALTER TABLE public.search_analytics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access on search_analytics" ON public.search_analytics;
CREATE POLICY "Service role full access on search_analytics"
  ON public.search_analytics FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 2e. product_images (currently unused — lock it down)
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access on product_images" ON public.product_images;
CREATE POLICY "Service role full access on product_images"
  ON public.product_images FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 2f. wishlist_items (currently unused — lock it down)
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access on wishlist_items" ON public.wishlist_items;
CREATE POLICY "Service role full access on wishlist_items"
  ON public.wishlist_items FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 2g. cms_content (currently unused — lock it down)
ALTER TABLE public.cms_content ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access on cms_content" ON public.cms_content;
CREATE POLICY "Service role full access on cms_content"
  ON public.cms_content FOR ALL TO service_role
  USING (true) WITH CHECK (true);


-- =====================================================
-- SECTION 3: products — special case
-- sitemap.ts uses the ANON key directly, so we need
-- a public SELECT policy for active products.
-- All writes still go through service_role only.
-- =====================================================

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Public: read active products only (needed for sitemap.ts)
DROP POLICY IF EXISTS "Public SELECT on active products" ON public.products;
CREATE POLICY "Public SELECT on active products"
  ON public.products FOR SELECT TO anon
  USING (is_active = true);

-- Service role: full access (all API routes use supabaseAdmin)
DROP POLICY IF EXISTS "Service role full access on products" ON public.products;
CREATE POLICY "Service role full access on products"
  ON public.products FOR ALL TO service_role
  USING (true) WITH CHECK (true);


-- =====================================================
-- SECTION 4: MISSING INDEXES
-- =====================================================

-- order_items: joins on order_id in every order detail query (CRITICAL)
CREATE INDEX IF NOT EXISTS idx_order_items_order_id
  ON public.order_items (order_id);

CREATE INDEX IF NOT EXISTS idx_order_items_product_id
  ON public.order_items (product_id);

-- orders: common admin lookups
CREATE INDEX IF NOT EXISTS idx_orders_customer_email
  ON public.orders (customer_email);

CREATE INDEX IF NOT EXISTS idx_orders_customer_phone
  ON public.orders (customer_phone);

CREATE INDEX IF NOT EXISTS idx_orders_updated_at
  ON public.orders (updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_created_at
  ON public.orders (created_at DESC);

-- addresses: always looked up by customer_email at checkout
CREATE INDEX IF NOT EXISTS idx_addresses_customer_email
  ON public.addresses (customer_email);

-- checkout_attempts: abandoned cart recovery queries
CREATE INDEX IF NOT EXISTS idx_checkout_attempts_email
  ON public.checkout_attempts (email);

CREATE INDEX IF NOT EXISTS idx_checkout_attempts_created_at
  ON public.checkout_attempts (created_at DESC)
  WHERE recovered = false;

-- product_reviews: product page loads filter by product + approval status
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_approved
  ON public.product_reviews (product_id, is_approved)
  WHERE is_approved = true;

-- admin_audit_log: log queries by admin + time range
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_email_time
  ON public.admin_audit_log (admin_email, created_at DESC);

-- search_analytics: analytics dashboard queries
CREATE INDEX IF NOT EXISTS idx_search_analytics_query
  ON public.search_analytics (query);

CREATE INDEX IF NOT EXISTS idx_search_analytics_created_at
  ON public.search_analytics (created_at DESC);

-- wishlist_items: will be needed when feature is activated
CREATE INDEX IF NOT EXISTS idx_wishlist_items_customer_email
  ON public.wishlist_items (customer_email);

-- inventory_log: product history lookups
CREATE INDEX IF NOT EXISTS idx_inventory_log_product_id
  ON public.inventory_log (product_id, created_at DESC);


-- =====================================================
-- SECTION 5: DATA INTEGRITY — nullable FKs that
-- should be NOT NULL. Only safe to apply if no
-- existing NULL rows exist. Check first:
--   SELECT COUNT(*) FROM order_items WHERE order_id IS NULL;
--   SELECT COUNT(*) FROM order_items WHERE product_id IS NULL;
-- =====================================================

DO $$
BEGIN
  -- order_items.order_id
  IF NOT EXISTS (SELECT 1 FROM public.order_items WHERE order_id IS NULL) THEN
    ALTER TABLE public.order_items ALTER COLUMN order_id SET NOT NULL;
    RAISE NOTICE 'order_items.order_id set to NOT NULL';
  ELSE
    RAISE WARNING 'order_items has NULL order_id values — NOT NULL not applied. Clean up first.';
  END IF;

  -- order_items.product_id
  IF NOT EXISTS (SELECT 1 FROM public.order_items WHERE product_id IS NULL) THEN
    ALTER TABLE public.order_items ALTER COLUMN product_id SET NOT NULL;
    RAISE NOTICE 'order_items.product_id set to NOT NULL';
  ELSE
    RAISE WARNING 'order_items has NULL product_id values — NOT NULL not applied. Clean up first.';
  END IF;
END $$;


-- =====================================================
-- VERIFICATION
-- =====================================================
-- Check which tables have RLS enabled:
--   SELECT tablename, rowsecurity FROM pg_tables
--   WHERE schemaname = 'public' ORDER BY tablename;
--
-- Check policies per table:
--   SELECT tablename, policyname, roles, cmd, qual
--   FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename;
--
-- Check indexes:
--   SELECT indexname, tablename FROM pg_indexes
--   WHERE schemaname = 'public' AND indexname LIKE 'idx_%'
--   ORDER BY tablename;
