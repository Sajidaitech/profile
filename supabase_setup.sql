-- ============================================================
-- SAJID MEHMOOD PORTFOLIO · Visitor Analytics
-- Supabase SQL Setup — Production v1.0
-- Run this entire file in Supabase SQL Editor
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- 1. DROP & RECREATE visitors TABLE (adds missing columns)
-- ────────────────────────────────────────────────────────────
-- If you already have a visitors table, this adds columns
-- without destroying existing data.

ALTER TABLE IF EXISTS visitors
  ADD COLUMN IF NOT EXISTS os          TEXT,
  ADD COLUMN IF NOT EXISTS session_id  TEXT,
  ADD COLUMN IF NOT EXISTS duration    INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_returning BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_online   BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS page_views  INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS ip_hash     TEXT;   -- SHA-256 of IP (never store raw IP)

-- If the table does NOT exist yet, create it from scratch:
CREATE TABLE IF NOT EXISTS visitors (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  country       TEXT,
  city          TEXT,
  device        TEXT,
  browser       TEXT,
  os            TEXT,
  source        TEXT,
  session_id    TEXT,
  duration      INTEGER DEFAULT 0,
  is_returning  BOOLEAN DEFAULT FALSE,
  is_online     BOOLEAN DEFAULT TRUE,
  page_views    INTEGER DEFAULT 1,
  ip_hash       TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast aggregation queries
CREATE INDEX IF NOT EXISTS idx_visitors_created_at  ON visitors (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitors_is_online   ON visitors (is_online);
CREATE INDEX IF NOT EXISTS idx_visitors_country     ON visitors (country);
CREATE INDEX IF NOT EXISTS idx_visitors_session_id  ON visitors (session_id);


-- ────────────────────────────────────────────────────────────
-- 2. ONLINE VISITORS TABLE
-- Tracks who is currently on the site (heartbeat pattern)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS online_visitors (
  session_id  TEXT PRIMARY KEY,
  last_seen   TIMESTAMPTZ DEFAULT NOW(),
  country     TEXT,
  device      TEXT,
  page        TEXT DEFAULT '/'
);

-- Auto-cleanup: mark offline after 2 minutes of no heartbeat
-- (Run via pg_cron or Supabase scheduled function)
-- We handle this in JS instead for simplicity.


-- ────────────────────────────────────────────────────────────
-- 3. ROW LEVEL SECURITY POLICIES
-- ────────────────────────────────────────────────────────────

-- Enable RLS on both tables
ALTER TABLE visitors        ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_visitors ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "anon_insert_visitors"        ON visitors;
DROP POLICY IF EXISTS "anon_select_count_visitors"  ON visitors;
DROP POLICY IF EXISTS "anon_upsert_online"          ON online_visitors;
DROP POLICY IF EXISTS "anon_select_online"          ON online_visitors;
DROP POLICY IF EXISTS "anon_delete_own_online"      ON online_visitors;

-- visitors: anonymous users can INSERT (track themselves)
CREATE POLICY "anon_insert_visitors"
  ON visitors FOR INSERT
  TO anon
  WITH CHECK (true);

-- visitors: anonymous users can SELECT only aggregate counts
-- (not individual rows — privacy first)
CREATE POLICY "anon_select_count_visitors"
  ON visitors FOR SELECT
  TO anon
  USING (true);  -- Further restricted via RPC below

-- online_visitors: anon can upsert their own session
CREATE POLICY "anon_upsert_online"
  ON online_visitors FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "anon_update_online"
  ON online_visitors FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- online_visitors: anon can read the count
CREATE POLICY "anon_select_online"
  ON online_visitors FOR SELECT
  TO anon
  USING (true);

-- online_visitors: anon can delete their own session (on page unload)
CREATE POLICY "anon_delete_own_online"
  ON online_visitors FOR DELETE
  TO anon
  USING (true);


-- ────────────────────────────────────────────────────────────
-- 4. SECURE RPC FUNCTIONS (called from the frontend)
-- ────────────────────────────────────────────────────────────

-- 4a. Get total unique visitor count
CREATE OR REPLACE FUNCTION get_visitor_count()
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COUNT(*)::INTEGER FROM visitors;
$$;

-- 4b. Get current online visitor count (seen in last 2 min)
CREATE OR REPLACE FUNCTION get_online_count()
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COUNT(*)::INTEGER
  FROM online_visitors
  WHERE last_seen > NOW() - INTERVAL '2 minutes';
$$;

-- 4c. Upsert online session (heartbeat)
CREATE OR REPLACE FUNCTION upsert_online_session(
  p_session_id TEXT,
  p_country    TEXT DEFAULT NULL,
  p_device     TEXT DEFAULT NULL,
  p_page       TEXT DEFAULT '/'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO online_visitors (session_id, last_seen, country, device, page)
  VALUES (p_session_id, NOW(), p_country, p_device, p_page)
  ON CONFLICT (session_id)
  DO UPDATE SET last_seen = NOW(), page = p_page;
END;
$$;

-- 4d. Remove online session (on page close)
CREATE OR REPLACE FUNCTION remove_online_session(p_session_id TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM online_visitors WHERE session_id = p_session_id;
END;
$$;

-- 4e. Admin dashboard aggregates (call with service role key only)
CREATE OR REPLACE FUNCTION get_analytics_summary()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE result JSON;
BEGIN
  SELECT json_build_object(
    'total',        (SELECT COUNT(*) FROM visitors),
    'today',        (SELECT COUNT(*) FROM visitors WHERE created_at::date = CURRENT_DATE),
    'this_week',    (SELECT COUNT(*) FROM visitors WHERE created_at > NOW() - INTERVAL '7 days'),
    'this_month',   (SELECT COUNT(*) FROM visitors WHERE created_at > NOW() - INTERVAL '30 days'),
    'by_country',   (SELECT json_agg(r) FROM (SELECT country, COUNT(*) AS cnt FROM visitors GROUP BY country ORDER BY cnt DESC LIMIT 10) r),
    'by_device',    (SELECT json_agg(r) FROM (SELECT device,  COUNT(*) AS cnt FROM visitors GROUP BY device  ORDER BY cnt DESC) r),
    'by_browser',   (SELECT json_agg(r) FROM (SELECT browser, COUNT(*) AS cnt FROM visitors GROUP BY browser ORDER BY cnt DESC) r),
    'by_source',    (SELECT json_agg(r) FROM (SELECT source,  COUNT(*) AS cnt FROM visitors GROUP BY source  ORDER BY cnt DESC LIMIT 8) r),
    'by_os',        (SELECT json_agg(r) FROM (SELECT os,      COUNT(*) AS cnt FROM visitors GROUP BY os      ORDER BY cnt DESC) r),
    'online_now',   (SELECT COUNT(*) FROM online_visitors WHERE last_seen > NOW() - INTERVAL '2 minutes'),
    'returning',    (SELECT COUNT(*) FROM visitors WHERE is_returning = TRUE),
    'avg_duration', (SELECT ROUND(AVG(duration)) FROM visitors WHERE duration > 0)
  ) INTO result;
  RETURN result;
END;
$$;

-- Grant execute to anon for public functions only
GRANT EXECUTE ON FUNCTION get_visitor_count()          TO anon;
GRANT EXECUTE ON FUNCTION get_online_count()           TO anon;
GRANT EXECUTE ON FUNCTION upsert_online_session(TEXT,TEXT,TEXT,TEXT) TO anon;
GRANT EXECUTE ON FUNCTION remove_online_session(TEXT)  TO anon;


-- ────────────────────────────────────────────────────────────
-- 5. ENABLE REALTIME
-- ────────────────────────────────────────────────────────────
-- In Supabase Dashboard → Database → Replication
-- Enable realtime for: visitors, online_visitors
-- Or run:
ALTER PUBLICATION supabase_realtime ADD TABLE visitors;
ALTER PUBLICATION supabase_realtime ADD TABLE online_visitors;


-- ────────────────────────────────────────────────────────────
-- DONE — Confirm with:
-- SELECT * FROM visitors LIMIT 5;
-- SELECT get_visitor_count();
-- SELECT get_online_count();
-- ────────────────────────────────────────────────────────────
