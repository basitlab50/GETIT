-- =========================================================================
-- GETIT Luxury Grocery & Concierge Platform - Master Database Setup
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/pqekoqryvpfomexmptik/sql/new
-- =========================================================================

-- 1. USERS & ACCOUNTS TABLE (Shoppers & Merchants)
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    role TEXT NOT NULL DEFAULT 'buyer', -- 'buyer' or 'seller'
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    address TEXT,
    business_name TEXT,
    store_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. AUDIT LOGS & EVENT TRACKING TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    action TEXT NOT NULL,
    user_identifier TEXT,
    payload TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 4. OPEN POLICIES FOR APP CLIENT AUTH & LOGGING
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public users access" ON public.users;
    CREATE POLICY "Public users access" ON public.users FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public audit_logs access" ON public.audit_logs;
    CREATE POLICY "Public audit_logs access" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);
END $$;

-- 5. SEED INITIAL VERIFIED DEMO ACCOUNTS
INSERT INTO public.users (id, role, full_name, email, phone, password_hash, address, business_name, store_id)
VALUES
    ('user-shopper-amina', 'buyer', 'Amina Bello', 'amina@getit.ng', '08032941194', 'password123', 'Plot 14 Gana Street, Maitama, Abuja', NULL, NULL),
    ('user-merchant-emeka', 'seller', 'Emeka Okafor', 'emeka@freshmart.ng', '08031112233', 'password123', 'Adetokunbo Ademola Crescent, Wuse 2, Abuja', 'The Gourmet Emporium', 's1')
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    password_hash = EXCLUDED.password_hash;
