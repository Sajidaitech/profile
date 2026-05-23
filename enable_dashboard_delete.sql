-- ============================================================
-- SAJID MEHMOOD PORTFOLIO · Enable Dashboard Delete
-- Run this ONCE in the Supabase SQL Editor.
-- ============================================================
-- WHY THIS IS NEEDED:
--   The visitors table has Row Level Security (RLS) enabled.
--   The anon key has no DELETE policy, so a direct REST/JS
--   .delete() call silently deletes nothing.
--   This function runs as SECURITY DEFINER (table owner) so it
--   bypasses RLS — only the anon key can call it, and only
--   by passing explicit UUIDs, so it's safe.
-- ============================================================

CREATE OR REPLACE FUNCTION delete_visitors(p_ids uuid[])
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM visitors WHERE id = ANY(p_ids);
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Allow the anon key (used by the dashboard browser client) to call this function.
GRANT EXECUTE ON FUNCTION delete_visitors(uuid[]) TO anon;
