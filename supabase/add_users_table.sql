-- =========================================================================
-- GETIT Luxury Grocery & Concierge Platform - Users Table Migration
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/pqekoqryvpfomexmptik/sql/new
-- =========================================================================

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

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow public read/write access for authentication
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public users access" ON public.users;
    CREATE POLICY "Public users access" ON public.users FOR ALL USING (true) WITH CHECK (true);
END $$;

-- Seed Initial Demo Accounts (Amina Bello & Emeka Okafor)
INSERT INTO public.users (id, role, full_name, email, phone, password_hash, address, business_name, store_id)
VALUES
    ('user-shopper-amina', 'buyer', 'Amina Bello', 'amina@getit.ng', '08032941194', 'password123', 'Plot 14 Gana Street, Maitama, Abuja', NULL, NULL),
    ('user-merchant-emeka', 'seller', 'Emeka Okafor', 'emeka@freshmart.ng', '08031112233', 'password123', 'Adetokunbo Ademola Crescent, Wuse 2, Abuja', 'The Gourmet Emporium', 's1')
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    password_hash = EXCLUDED.password_hash;
