-- =============================================================================
-- GETIT 2-TIER MANAGER & AGENT REFERRAL CODES + COMMISSION LEDGER (ZERO DOWNTIME)
-- Code Format:
--   Managers: MG-<STATE>-<###>  (e.g., MG-ABJ-001, MG-LAG-001)
--   Agents:   AG-<STATE>-<###>  (e.g., AG-ABJ-001, AG-LAG-001)
--   Internal Link: Agents link to their Manager via parent_manager_code (Admin-only)
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/pqekoqryvpfomexmptik/sql/new
-- =============================================================================

-- 1. Referral Partners Registry (Managers & Field Agents)
CREATE TABLE IF NOT EXISTS public.referral_partners (
  code TEXT PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('MANAGER', 'AGENT')),
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  state_code TEXT NOT NULL DEFAULT 'ABJ',
  territory_name TEXT,
  parent_manager_code TEXT,
  parent_manager_name TEXT,
  commission_per_shop INTEGER NOT NULL DEFAULT 5000,
  manager_override_per_shop INTEGER NOT NULL DEFAULT 1500,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_partners_role
  ON public.referral_partners (role);

CREATE INDEX IF NOT EXISTS idx_referral_partners_parent_mgr
  ON public.referral_partners (parent_manager_code);

ALTER TABLE public.referral_partners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public referral_partners access" ON public.referral_partners;
CREATE POLICY "Public referral_partners access"
  ON public.referral_partners
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 2. 2-Tier Commission Ledger (Agent Direct + Manager Override + Manager Direct)
CREATE TABLE IF NOT EXISTS public.commission_ledger (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  store_name TEXT NOT NULL,
  onboarded_by_code TEXT NOT NULL,
  recipient_code TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  recipient_role TEXT NOT NULL CHECK (recipient_role IN ('MANAGER', 'AGENT')),
  commission_type TEXT NOT NULL CHECK (commission_type IN ('AGENT_DIRECT', 'MANAGER_OVERRIDE', 'MANAGER_DIRECT')),
  amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'PAID', 'VOID')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_commission_ledger_recipient
  ON public.commission_ledger (recipient_code, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_commission_ledger_store
  ON public.commission_ledger (store_id);

ALTER TABLE public.commission_ledger ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public commission_ledger access" ON public.commission_ledger;
CREATE POLICY "Public commission_ledger access"
  ON public.commission_ledger
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 3. Add Attribution Columns to public.stores (Non-breaking, nullable for existing stores)
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS onboarded_by_code TEXT;
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS onboarded_by_role TEXT;
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS onboarded_by_name TEXT;
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS onboarded_by_manager_code TEXT;

CREATE INDEX IF NOT EXISTS idx_stores_onboarded_by_code
  ON public.stores (onboarded_by_code);

CREATE INDEX IF NOT EXISTS idx_stores_onboarded_by_manager_code
  ON public.stores (onboarded_by_manager_code);
