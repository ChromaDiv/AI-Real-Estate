-- ============================================================
-- Real Estate Lead Intelligence System — Supabase Schema
-- ============================================================

-- 1. Lead category enum
CREATE TYPE lead_category AS ENUM ('HOT', 'WARM', 'SPAM');

-- 2. Properties table
CREATE TABLE IF NOT EXISTS properties (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  address    TEXT NOT NULL,
  price      NUMERIC(12,2) NOT NULL DEFAULT 0,
  sqft       INTEGER,
  bedrooms   INTEGER,
  bathrooms  INTEGER,
  status     TEXT NOT NULL DEFAULT 'Available',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Leads table
CREATE TABLE IF NOT EXISTS leads (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name         TEXT NOT NULL,
  phone        TEXT,
  email        TEXT,
  category     lead_category NOT NULL DEFAULT 'WARM',
  call_summary TEXT,
  tags         TEXT[] DEFAULT '{}',
  property_id  UUID REFERENCES properties(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Enable Realtime on leads
ALTER PUBLICATION supabase_realtime ADD TABLE leads;

-- 5. Row-Level Security (permissive for now — tighten for production)
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads      ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on properties" ON properties FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on leads"      ON leads      FOR ALL USING (true) WITH CHECK (true);
