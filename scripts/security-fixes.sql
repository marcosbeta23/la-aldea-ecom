-- =====================================================
-- LA ALDEA E-COMMERCE - SECURITY FIXES
-- Run this in Supabase SQL Editor
-- Fixes: RLS, function search_path, extension schema,
--         overly permissive policies
-- =====================================================

-- ─────────────────────────────────────────────────────
-- 1. Enable RLS on checkout_attempts
-- ─────────────────────────────────────────────────────
-- This table stores PII (email, phone, name). Without RLS,
-- the anon key could read/write all checkout attempts.
ALTER TABLE public.checkout_attempts ENABLE ROW LEVEL SECURITY;

-- Only the service_role (used by API routes) can access this table.
-- No anon or authenticated user should touch it directly.
CREATE POLICY "Service role full access on checkout_attempts"
  ON public.checkout_attempts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ─────────────────────────────────────────────────────
-- 2. Enable RLS on inventory_locks (fix: policy was always-true)
-- ─────────────────────────────────────────────────────
-- Drop the old overly permissive policy if it exists
DO $$
BEGIN
  DROP POLICY IF EXISTS "Enable access for all users" ON public.inventory_locks;
  DROP POLICY IF EXISTS "Allow all" ON public.inventory_locks;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

-- RLS should already be enabled; ensure it is
ALTER TABLE public.inventory_locks ENABLE ROW LEVEL SECURITY;

-- Only service_role should manage inventory locks
CREATE POLICY "Service role full access on inventory_locks"
  ON public.inventory_locks
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ─────────────────────────────────────────────────────
-- 3. Fix RLS on order_logs (fix: policy was always-true)
-- ─────────────────────────────────────────────────────
DO $$
BEGIN
  DROP POLICY IF EXISTS "Enable access for all users" ON public.order_logs;
  DROP POLICY IF EXISTS "Allow all" ON public.order_logs;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

ALTER TABLE public.order_logs ENABLE ROW LEVEL SECURITY;

-- Only service_role should read/write audit logs
CREATE POLICY "Service role full access on order_logs"
  ON public.order_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ─────────────────────────────────────────────────────
-- 4. Fix function search_path (prevents search path injection)
-- ─────────────────────────────────────────────────────
-- Re-create functions with SET search_path = public

-- 4a. reserve_stock_for_order
CREATE OR REPLACE FUNCTION reserve_stock_for_order(
  p_order_id uuid,
  p_reservation_hours integer DEFAULT 24
) RETURNS jsonb AS $$
DECLARE
  v_item record;
  v_all_reserved boolean := true;
  v_failed_products jsonb := '[]'::jsonb;
  v_expires_at timestamptz;
  arr_prod uuid[] := ARRAY[]::uuid[];
  arr_qty int[] := ARRAY[]::int[];
  i integer;
BEGIN
  v_expires_at := now() + (p_reservation_hours || ' hours')::interval;

  FOR v_item IN
    SELECT oi.product_id, oi.quantity, p.name, p.stock
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id = p_order_id
    FOR UPDATE OF p
  LOOP
    IF v_item.stock < v_item.quantity THEN
      v_all_reserved := false;
      v_failed_products := v_failed_products || jsonb_build_object(
        'product_id', v_item.product_id,
        'name', v_item.name,
        'requested', v_item.quantity,
        'available', v_item.stock
      );
    ELSE
      arr_prod := arr_prod || v_item.product_id;
      arr_qty := arr_qty || v_item.quantity;
    END IF;
  END LOOP;

  IF NOT v_all_reserved THEN
    RETURN jsonb_build_object(
      'success', false,
      'expires_at', v_expires_at,
      'failed_products', v_failed_products
    );
  END IF;

  FOR i IN 1..array_length(arr_prod,1) LOOP
    UPDATE products
    SET stock = stock - arr_qty[i]
    WHERE id = arr_prod[i];

    INSERT INTO inventory_locks (order_id, product_id, quantity, expires_at)
    VALUES (p_order_id, arr_prod[i], arr_qty[i], v_expires_at)
    ON CONFLICT (order_id, product_id) DO UPDATE
      SET quantity = EXCLUDED.quantity,
          expires_at = EXCLUDED.expires_at,
          released = false;
  END LOOP;

  UPDATE orders
  SET stock_reserved = true, reserved_until = v_expires_at
  WHERE id = p_order_id;

  PERFORM log_order_event(
    p_order_id,
    'stock_reserved',
    NULL,
    'paid_pending_verification',
    jsonb_build_object('expires_at', v_expires_at, 'items_count', array_length(arr_prod,1)),
    'system'
  );

  RETURN jsonb_build_object(
    'success', true,
    'expires_at', v_expires_at,
    'failed_products', '[]'::jsonb
  );
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 4b. release_expired_reservations
CREATE OR REPLACE FUNCTION release_expired_reservations()
RETURNS integer AS $$
DECLARE
  v_lock record;
  v_count integer := 0;
BEGIN
  FOR v_lock IN
    SELECT il.id, il.order_id, il.product_id, il.quantity
    FROM inventory_locks il
    JOIN orders o ON o.id = il.order_id
    WHERE il.expires_at < now()
    AND il.released = false
    AND o.status IN ('paid_pending_verification', 'awaiting_stock')
    FOR UPDATE OF il
  LOOP
    UPDATE products
    SET stock = stock + v_lock.quantity
    WHERE id = v_lock.product_id;

    UPDATE inventory_locks
    SET released = true, released_at = now()
    WHERE id = v_lock.id;

    UPDATE orders
    SET status = 'awaiting_stock', stock_reserved = false
    WHERE id = v_lock.order_id;

    PERFORM log_order_event(
      v_lock.order_id,
      'reservation_expired',
      'paid_pending_verification',
      'awaiting_stock',
      jsonb_build_object('lock_id', v_lock.id, 'quantity_restored', v_lock.quantity),
      'cron'
    );

    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 4c. restore_stock_for_order
CREATE OR REPLACE FUNCTION restore_stock_for_order(p_order_id uuid)
RETURNS void AS $$
DECLARE
  v_restored_count integer;
BEGIN
  WITH restored AS (
    UPDATE products p
    SET stock = p.stock + il.quantity
    FROM inventory_locks il
    WHERE il.order_id = p_order_id
    AND il.product_id = p.id
    AND il.released = false
    RETURNING il.id
  )
  SELECT count(*) INTO v_restored_count FROM restored;

  UPDATE inventory_locks
  SET released = true, released_at = now()
  WHERE order_id = p_order_id AND released = false;

  UPDATE orders
  SET stock_reserved = false
  WHERE id = p_order_id;

  PERFORM log_order_event(
    p_order_id,
    'stock_restored_refund',
    NULL,
    'refunded',
    jsonb_build_object('items_restored', v_restored_count),
    'admin'
  );
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 4d. log_order_event
CREATE OR REPLACE FUNCTION log_order_event(
  p_order_id uuid,
  p_action text,
  p_old_status text,
  p_new_status text,
  p_details jsonb DEFAULT NULL,
  p_created_by text DEFAULT 'system'
) RETURNS uuid AS $$
DECLARE
  v_log_id uuid;
BEGIN
  INSERT INTO order_logs (order_id, action, old_status, new_status, details, created_by)
  VALUES (p_order_id, p_action, p_old_status, p_new_status, p_details, p_created_by)
  RETURNING id INTO v_log_id;
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SET search_path = public;


-- ─────────────────────────────────────────────────────
-- 5. Move pg_trgm extension to 'extensions' schema
-- ─────────────────────────────────────────────────────
-- Supabase recommends extensions live in the 'extensions' schema.
-- First ensure the extensions schema exists (Supabase creates it by default).
CREATE SCHEMA IF NOT EXISTS extensions;

-- Drop from public and re-create in extensions
DROP EXTENSION IF EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS pg_trgm SCHEMA extensions;

-- Grant usage so queries using pg_trgm functions still work
GRANT USAGE ON SCHEMA extensions TO anon, authenticated, service_role;


-- =====================================================
-- VERIFICATION QUERIES (run after migration):
-- =====================================================
-- Check RLS is enabled:
--   SELECT tablename, rowsecurity FROM pg_tables
--   WHERE schemaname = 'public' AND tablename IN ('checkout_attempts', 'inventory_locks', 'order_logs');
--
-- Check function search_path:
--   SELECT proname, proconfig FROM pg_proc
--   WHERE proname IN ('reserve_stock_for_order', 'release_expired_reservations', 'restore_stock_for_order', 'log_order_event');
--
-- Check pg_trgm schema:
--   SELECT extname, nspname FROM pg_extension e JOIN pg_namespace n ON e.extnamespace = n.oid WHERE extname = 'pg_trgm';
