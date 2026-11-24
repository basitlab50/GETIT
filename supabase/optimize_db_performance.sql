-- =============================================================================
-- GETIT DATABASE PERFORMANCE & REALTIME OPTIMIZATION SCRIPT (ZERO DOWNTIME)
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/pqekoqryvpfomexmptik/sql/new
-- =============================================================================

-- 1. Add missing indexes so Postgres stops doing full sequential table scans
--    (Eliminates CPU spikes, Disk I/O burn, and slow ORDER BY queries)
CREATE INDEX IF NOT EXISTS idx_staff_enrollment_created_at
  ON public.staff_enrollment (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_staff_enrollment_status_created_at
  ON public.staff_enrollment (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action_created_at
  ON public.audit_logs (action, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_created_at
  ON public.orders (created_at DESC);

-- 2. Enable Supabase Realtime on public.staff_enrollment
--    So new applications push instantly to Admin Dashboard with ZERO polling!
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'staff_enrollment'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.staff_enrollment;
  END IF;
END $$;

-- 3. Refresh Postgres query planner statistics (non-blocking)
ANALYZE public.staff_enrollment;
ANALYZE public.audit_logs;
ANALYZE public.orders;

-- 4. Optional Verification Query: Check largest tables & index status
SELECT
  relname AS table_name,
  pg_size_pretty(pg_total_relation_size(relid)) AS total_size,
  pg_size_pretty(pg_relation_size(relid)) AS table_size,
  pg_size_pretty(pg_indexes_size(relid)) AS index_size,
  n_live_tup AS live_rows
FROM pg_stat_user_tables
ORDER BY pg_total_relation_size(relid) DESC
LIMIT 10;
