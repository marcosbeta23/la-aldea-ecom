-- Migration: Create guides table for CMS-managed articles
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS guides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  breadcrumb_label TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  keywords TEXT[] DEFAULT '{}',
  related_categories JSONB DEFAULT '[]',
  related_articles TEXT[] DEFAULT '{}',
  sections JSONB DEFAULT '[]',
  date_published DATE DEFAULT CURRENT_DATE,
  date_modified DATE DEFAULT CURRENT_DATE,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for slug lookups
CREATE INDEX IF NOT EXISTS idx_guides_slug ON guides (slug);
-- Index for published filter
CREATE INDEX IF NOT EXISTS idx_guides_published ON guides (is_published);

-- RLS policies
ALTER TABLE guides ENABLE ROW LEVEL SECURITY;

-- Anyone can read published guides
CREATE POLICY "Public can read published guides"
  ON guides FOR SELECT
  USING (is_published = true);

-- Service role can do everything (for admin API)
CREATE POLICY "Service role full access"
  ON guides FOR ALL
  USING (true)
  WITH CHECK (true);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_guides_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.date_modified = CURRENT_DATE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER guides_updated_at
  BEFORE UPDATE ON guides
  FOR EACH ROW
  EXECUTE FUNCTION update_guides_updated_at();
