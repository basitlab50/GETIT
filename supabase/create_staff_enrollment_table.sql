-- =========================================================================
-- GETIT CENTRAL MANAGEMENT SYSTEM — STAFF & MANAGEMENT ENROLLMENT TABLE
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/pqekoqryvpfomexmptik/sql/new
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.staff_enrollment (
    id TEXT PRIMARY KEY,
    application_ref TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING_REVIEW', -- 'PENDING_REVIEW' | 'SHORTLISTED' | 'APPROVED_ONBOARDED' | 'REJECTED'
    assigned_staff_id TEXT, -- e.g. 'GET-015' once approved & onboarded

    -- Section 1: Personal & Professional Information (Q1 - Q7)
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    state_and_city TEXT NOT NULL,
    highest_education TEXT,
    employment_status TEXT,
    resumption_availability TEXT,

    -- Section 2: Management & Leadership Experience (Q8 - Q11)
    previously_managed_team TEXT,
    team_size_managed TEXT,
    leadership_experience_summary TEXT,
    recruited_team_from_scratch TEXT,

    -- Section 3: Practical Leadership Questions (Q12 - Q16)
    plan_for_team_of_20 TEXT,
    turnaround_underperforming_15 TEXT,
    plan_for_200_business_relationships TEXT,
    daily_monitoring_accountability TEXT,
    difficult_situation_handled TEXT,

    -- Section 4: Availability & Commitment (Q17 - Q19)
    comfortable_with_fieldwork TEXT,
    comfortable_with_targets_and_reports TEXT,
    why_suitable_for_management TEXT,

    -- Section 5: Supporting Documents & Declaration (Q20 - Q21)
    cv_file_name TEXT,
    cv_file_size INTEGER,
    cv_mime_type TEXT,
    cv_data_url TEXT,
    professional_referee TEXT,
    declaration_confirmed BOOLEAN DEFAULT TRUE,

    -- Full JSON payload & audit metadata
    payload JSONB,
    reviewed_by TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) with open client policy for Website & Admin Portal
ALTER TABLE public.staff_enrollment ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Public staff_enrollment access" ON public.staff_enrollment;
    CREATE POLICY "Public staff_enrollment access"
        ON public.staff_enrollment
        FOR ALL
        USING (true)
        WITH CHECK (true);
END $$;
