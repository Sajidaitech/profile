-- ============================================================
-- SAJID MEHMOOD PORTFOLIO · Supabase Schema Update
-- Run this entire file in the Supabase SQL Editor once.
-- ============================================================


-- ── 1. Add new columns to the existing visitors table ────────
-- These columns link each session row back to its visitor profile
-- and carry denormalized visit_count so the dashboard query stays simple.

ALTER TABLE visitors
  ADD COLUMN IF NOT EXISTS fingerprint   TEXT,
  ADD COLUMN IF NOT EXISTS visit_count   INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS first_seen    TIMESTAMPTZ;

-- Index fingerprint for fast profile lookups
CREATE INDEX IF NOT EXISTS visitors_fingerprint_idx ON visitors (fingerprint);


-- ── 2. Create visitor_profiles table ─────────────────────────
-- One row per device/browser (keyed by persistent localStorage UUID).
-- Stores aggregated stats: total visits, total time, last active.

CREATE TABLE IF NOT EXISTS visitor_profiles (
  fingerprint     TEXT        PRIMARY KEY,
  visitor_name    TEXT,
  country         TEXT,
  city            TEXT,
  device          TEXT,
  browser         TEXT,
  os              TEXT,
  source          TEXT,
  first_seen      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  visit_count     INTEGER     NOT NULL DEFAULT 1,
  total_duration  INTEGER     NOT NULL DEFAULT 0   -- cumulative seconds across all visits
);

-- Allow the anon key to read/write this table (required for browser client)
ALTER TABLE visitor_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "anon_insert_profiles"
  ON visitor_profiles FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "anon_update_profiles"
  ON visitor_profiles FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "anon_select_profiles"
  ON visitor_profiles FOR SELECT TO anon USING (true);


-- ── 3. RPC: upsert_visitor_profile ───────────────────────────
-- Called once per page load. Atomically inserts or updates the
-- profile row — no read-modify-write race condition possible.
-- Returns the updated visit_count and first_seen so JS can
-- correctly set is_returning and display the count.

CREATE OR REPLACE FUNCTION upsert_visitor_profile(
  p_fingerprint   TEXT,
  p_visitor_name  TEXT,
  p_country       TEXT,
  p_city          TEXT,
  p_device        TEXT,
  p_browser       TEXT,
  p_os            TEXT,
  p_source        TEXT
)
RETURNS TABLE(visit_count INTEGER, first_seen TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO visitor_profiles
    (fingerprint, visitor_name, country, city, device, browser, os, source,
     first_seen, last_seen, visit_count, total_duration)
  VALUES
    (p_fingerprint, p_visitor_name, p_country, p_city, p_device, p_browser, p_os, p_source,
     NOW(), NOW(), 1, 0)
  ON CONFLICT (fingerprint) DO UPDATE
    SET last_seen    = NOW(),
        visit_count  = visitor_profiles.visit_count + 1,
        -- Update name only when a real name is provided; never overwrite with NULL
        visitor_name = COALESCE(NULLIF(TRIM(p_visitor_name), ''), visitor_profiles.visitor_name),
        -- Refresh context fields in case visitor switches device/browser
        country      = COALESCE(NULLIF(p_country, 'Unknown'), visitor_profiles.country),
        city         = COALESCE(NULLIF(p_city,    'Unknown'), visitor_profiles.city);

  RETURN QUERY
    SELECT vp.visit_count, vp.first_seen
    FROM   visitor_profiles vp
    WHERE  vp.fingerprint = p_fingerprint;
END;
$$;


-- ── 4. RPC: flush_visitor_duration ───────────────────────────
-- Called periodically and on pagehide to accumulate session time
-- into visitor_profiles.total_duration without double-counting.
-- The JS tracks how many seconds have already been flushed
-- (_lastFlushed) and only sends the new delta each call.

CREATE OR REPLACE FUNCTION flush_visitor_duration(
  p_fingerprint    TEXT,
  p_delta_seconds  INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE visitor_profiles
  SET    total_duration = total_duration + GREATEST(p_delta_seconds, 0),
         last_seen      = NOW()
  WHERE  fingerprint = p_fingerprint;
END;
$$;


-- ── 5. Optional helper view for the admin dashboard ──────────
-- Joins recent visitor sessions with their profile totals.
-- Not required — the dashboard reads visitors directly and
-- visit_count is denormalized there — but useful for raw queries.

CREATE OR REPLACE VIEW visitor_sessions_with_profile AS
  SELECT
    v.*,
    vp.visit_count        AS profile_visit_count,
    vp.total_duration     AS profile_total_duration,
    vp.first_seen         AS profile_first_seen,
    vp.last_seen          AS profile_last_seen
  FROM  visitors v
  LEFT  JOIN visitor_profiles vp ON vp.fingerprint = v.fingerprint;
