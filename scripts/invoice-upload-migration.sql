-- =====================================================
-- LA ALDEA E-COMMERCE - INVOICE FILE UPLOAD MIGRATION
-- Run this in Supabase SQL Editor
-- =====================================================
-- This migration adds support for uploading invoice PDFs
-- and storing them in Supabase Storage.

-- 1. Add invoice_file_url column to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS invoice_file_url text;

-- Add comment explaining the column
COMMENT ON COLUMN orders.invoice_file_url IS 'URL to the uploaded invoice PDF file in Supabase Storage';

-- 2. Create storage bucket for invoices (run in Supabase Dashboard > Storage OR via API)
-- Note: This needs to be done in the Supabase Dashboard if not using the API
-- The bucket should be named 'invoices' and can be public or private depending on needs

-- Via SQL (if storage extension is enabled):
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES (
--   'invoices',
--   'invoices',
--   true,  -- set to false for private bucket
--   5242880,  -- 5MB limit
--   ARRAY['application/pdf']
-- )
-- ON CONFLICT (id) DO NOTHING;

-- 3. Set up RLS policies for the invoices bucket (run in Supabase Dashboard)
-- These are example policies - adjust based on your auth setup

-- Allow authenticated users to upload (for admin uploads via service key, no policy needed)
-- CREATE POLICY "Allow admin uploads" ON storage.objects
--   FOR INSERT
--   WITH CHECK (bucket_id = 'invoices');

-- Allow public read access to invoices (so customers can download)
-- CREATE POLICY "Allow public reads" ON storage.objects
--   FOR SELECT
--   USING (bucket_id = 'invoices');

-- =====================================================
-- MANUAL STEPS IN SUPABASE DASHBOARD:
-- =====================================================
-- 1. Go to Storage in the Supabase Dashboard
-- 2. Create a new bucket called "invoices"
-- 3. Set it as Public if you want customers to access PDFs via direct URL
--    OR keep it Private and use signed URLs
-- 4. Set file size limit to 5MB
-- 5. Set allowed MIME types to only allow PDFs: application/pdf
-- =====================================================

-- =====================================================
-- EMAIL TRACKING FIELDS
-- =====================================================
-- These fields track when emails were sent to customers and admin

-- Add confirmation email tracking
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS confirmation_email_sent_at timestamptz;

COMMENT ON COLUMN orders.confirmation_email_sent_at IS 'Timestamp when order confirmation email was sent to customer';

-- Add invoice email tracking
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS invoice_email_sent_at timestamptz;

COMMENT ON COLUMN orders.invoice_email_sent_at IS 'Timestamp when invoice email was sent to customer';

-- Add admin notification tracking  
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS admin_notified_at timestamptz;

COMMENT ON COLUMN orders.admin_notified_at IS 'Timestamp when admin was notified of new order';

-- =====================================================
-- Done! The invoice upload feature is now ready to use.
