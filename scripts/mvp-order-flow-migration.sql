-- =====================================================
-- LA ALDEA E-COMMERCE - MVP ORDER FLOW MIGRATION
-- Run this in Supabase SQL Editor
-- =====================================================

-- 0. Ensure pgcrypto extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Add new order status and tracking columns
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS paid_at timestamptz,
ADD COLUMN IF NOT EXISTS reserved_until timestamptz,
ADD COLUMN IF NOT EXISTS stock_reserved boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS invoice_number text,
ADD COLUMN IF NOT EXISTS invoice_type text, -- 'consumer_final', 'invoice_rut'
ADD COLUMN IF NOT EXISTS invoice_tax_id text, -- RUT del cliente si aplica
ADD COLUMN IF NOT EXISTS invoice_business_name text, -- Razón social
ADD COLUMN IF NOT EXISTS invoiced_at timestamptz,
ADD COLUMN IF NOT EXISTS refund_id text,
ADD COLUMN IF NOT EXISTS refund_amount numeric(10,2),
ADD COLUMN IF NOT EXISTS refund_reason text,
ADD COLUMN IF NOT EXISTS refund_status text, -- 'pending', 'completed', 'failed'
ADD COLUMN IF NOT EXISTS refunded_at timestamptz;

-- 2. Update status CHECK constraint to include new statuses
-- First drop existing constraint if any
DO $$ 
BEGIN
  ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Add comment for status values
COMMENT ON COLUMN orders.status IS 'Order status: draft, pending, paid_pending_verification, awaiting_stock, ready_to_invoice, invoiced, processing, shipped, delivered, cancelled, refunded';

-- Recreate CHECK constraint with all valid status values
ALTER TABLE orders
  ADD CONSTRAINT orders_status_check CHECK (
    status IN (
      'draft','pending','paid','paid_pending_verification','awaiting_stock',
      'ready_to_invoice','invoiced','processing','shipped','delivered',
      'cancelled','refunded'
    )
  );

-- 2.5. Ensure products.stock cannot go negative
DO $$ 
BEGIN
  ALTER TABLE products ADD CONSTRAINT products_stock_nonnegative CHECK (stock >= 0);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 3. Create inventory_locks table for stock reservation
CREATE TABLE IF NOT EXISTS inventory_locks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL CHECK (quantity > 0),
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  released boolean DEFAULT false,
  released_at timestamptz,
  UNIQUE(order_id, product_id)
);

-- Add CHECK constraint if table already exists
DO $$ 
BEGIN
  ALTER TABLE inventory_locks ADD CONSTRAINT inventory_locks_quantity_positive CHECK (quantity > 0);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Index for finding expired locks
CREATE INDEX IF NOT EXISTS idx_inventory_locks_expires 
ON inventory_locks(expires_at) WHERE released = false;

-- 4. Create atomic stock reservation function (with FOR UPDATE locking)
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

  -- 1) Lock relevant product rows (FOR UPDATE) and check availability
  FOR v_item IN
    SELECT oi.product_id, oi.quantity, p.name, p.stock
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id = p_order_id
    FOR UPDATE OF p  -- Lock product rows to prevent race conditions
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
      -- Collect for later decrement (only if we can reserve ALL)
      arr_prod := arr_prod || v_item.product_id;
      arr_qty := arr_qty || v_item.quantity;
    END IF;
  END LOOP;

  -- 2) If any product failed, return failure (NO updates performed - atomic)
  IF NOT v_all_reserved THEN
    RETURN jsonb_build_object(
      'success', false,
      'expires_at', v_expires_at,
      'failed_products', v_failed_products
    );
  END IF;

  -- 3) All good: decrement stock and create locks (still within same TX)
  FOR i IN 1..array_length(arr_prod,1) LOOP
    UPDATE products
    SET stock = stock - arr_qty[i]
    WHERE id = arr_prod[i];
    
    -- Insert or update lock record
    INSERT INTO inventory_locks (order_id, product_id, quantity, expires_at)
    VALUES (p_order_id, arr_prod[i], arr_qty[i], v_expires_at)
    ON CONFLICT (order_id, product_id) DO UPDATE
      SET quantity = EXCLUDED.quantity,
          expires_at = EXCLUDED.expires_at,
          released = false;
  END LOOP;

  -- 4) Mark order as reserved
  UPDATE orders
  SET stock_reserved = true, reserved_until = v_expires_at
  WHERE id = p_order_id;

  -- 5) Log the event for audit trail
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
$$ LANGUAGE plpgsql;

-- 5. Function to release expired reservations (with audit logging)
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
    FOR UPDATE OF il  -- Lock rows being processed
  LOOP
    -- Restore stock
    UPDATE products 
    SET stock = stock + v_lock.quantity
    WHERE id = v_lock.product_id;
    
    -- Mark lock as released
    UPDATE inventory_locks 
    SET released = true, released_at = now()
    WHERE id = v_lock.id;
    
    -- Update order status (idempotent)
    UPDATE orders
    SET status = 'awaiting_stock', stock_reserved = false
    WHERE id = v_lock.order_id;
    
    -- Log the event for audit trail
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
$$ LANGUAGE plpgsql;

-- 6. Function to restore stock on refund (with audit logging)
CREATE OR REPLACE FUNCTION restore_stock_for_order(p_order_id uuid)
RETURNS void AS $$
DECLARE
  v_restored_count integer;
BEGIN
  -- Restore stock from inventory_locks
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
  
  -- Mark locks as released
  UPDATE inventory_locks
  SET released = true, released_at = now()
  WHERE order_id = p_order_id AND released = false;
  
  -- Update order
  UPDATE orders
  SET stock_reserved = false
  WHERE id = p_order_id;
  
  -- Log the event
  PERFORM log_order_event(
    p_order_id, 
    'stock_restored_refund', 
    NULL, 
    'refunded', 
    jsonb_build_object('items_restored', v_restored_count), 
    'admin'
  );
END;
$$ LANGUAGE plpgsql;

-- 7. Create order_logs table for audit trail
CREATE TABLE IF NOT EXISTS order_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  action text NOT NULL, -- 'payment_received', 'stock_reserved', 'invoice_generated', 'refund_initiated', etc.
  old_status text,
  new_status text,
  details jsonb,
  created_by text, -- 'system', 'admin', 'webhook'
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_logs_order_id ON order_logs(order_id);

-- 8. Helper function to log order events
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
$$ LANGUAGE plpgsql;

-- 9. Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_paid_at ON orders(paid_at) WHERE paid_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_reserved_until ON orders(reserved_until) WHERE reserved_until IS NOT NULL;

-- =====================================================
-- SUCCESS! Run these queries to verify:
-- =====================================================
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'orders';
-- SELECT * FROM pg_proc WHERE proname = 'reserve_stock_for_order';
