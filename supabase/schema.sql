-- =========================================================================
-- GETIT Luxury Grocery & Concierge Platform - Master Database Schema
-- Compatible with Supabase PostgreSQL
-- =========================================================================

-- 1. STORES / MERCHANTS TABLE
CREATE TABLE IF NOT EXISTS public.stores (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'Gourmet & Groceries',
    address TEXT NOT NULL,
    district TEXT DEFAULT 'Maitama, Abuja',
    city TEXT DEFAULT 'Abuja',
    latitude DOUBLE PRECISION DEFAULT 9.0882,
    longitude DOUBLE PRECISION DEFAULT 7.4933,
    phone TEXT,
    rating NUMERIC(3, 2) DEFAULT 4.90,
    is_open BOOLEAN DEFAULT true,
    delivery_fee NUMERIC(10, 2) DEFAULT 1200.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. MASTER CATALOG PRODUCTS (Universal Nigerian Groceries & Pharmacy Catalog)
CREATE TABLE IF NOT EXISTS public.master_catalog_products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- 'Drinks', 'Pantry', 'Biscuits', 'Produce', 'Pharmacy', 'Skincare', 'Baby Care', 'Household'
    subcategory TEXT,
    brand TEXT,
    icon TEXT DEFAULT '🛍️',
    suggested_price NUMERIC(10, 2) NOT NULL,
    price_range TEXT,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. STORE INVENTORY TABLE (Active products published by specific merchants)
CREATE TABLE IF NOT EXISTS public.store_inventory (
    id TEXT PRIMARY KEY,
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    icon TEXT DEFAULT '🛍️',
    image_url TEXT,
    out_of_stock BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ORDERS & DISPATCH TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    store_id TEXT REFERENCES public.stores(id),
    store_name TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    delivery_lat DOUBLE PRECISION,
    delivery_lng DOUBLE PRECISION,
    courier_notes TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    items_count INT DEFAULT 1,
    subtotal NUMERIC(10, 2) NOT NULL,
    total NUMERIC(10, 2) NOT NULL,
    vendor_payout NUMERIC(10, 2) NOT NULL,
    delivery_fee NUMERIC(10, 2) DEFAULT 1200.00,
    status TEXT DEFAULT 'New Order', -- 'New Order', 'Preparing', 'Ready for Pickup', 'On the Way', 'Delivered', 'Cancelled'
    delivery_partner TEXT DEFAULT 'bolt', -- 'bolt', 'concierge'
    bolt_status TEXT, -- 'PENDING_VENDOR', 'DISPATCHED', 'IN_TRANSIT', 'ARRIVED'
    bolt_tracking_code TEXT,
    bolt_rider JSONB, -- { name, phone, vehicle, plate, rating }
    bolt_coords JSONB, -- { latitude, longitude }
    delivery_pin TEXT NOT NULL,
    pickup_pin TEXT NOT NULL,
    eta TEXT DEFAULT '20 mins',
    payment_method TEXT DEFAULT 'Paystack',
    payment_reference TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. RIDERS DIRECTORY
CREATE TABLE IF NOT EXISTS public.riders (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    rating NUMERIC(3, 2) DEFAULT 4.95,
    trips INT DEFAULT 100,
    vehicle TEXT DEFAULT 'Bajaj Boxer 150',
    plate TEXT NOT NULL,
    avatar TEXT DEFAULT '🛵',
    current_lat DOUBLE PRECISION,
    current_lng DOUBLE PRECISION,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Ensures open access for the GETIT customer & merchant apps using anon key
-- =========================================================================

ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_catalog_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.riders ENABLE ROW LEVEL SECURITY;

-- Allow anon public full read/write for seamless app operations
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public stores access" ON public.stores;
    CREATE POLICY "Public stores access" ON public.stores FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public master_catalog_products access" ON public.master_catalog_products;
    CREATE POLICY "Public master_catalog_products access" ON public.master_catalog_products FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public store_inventory access" ON public.store_inventory;
    CREATE POLICY "Public store_inventory access" ON public.store_inventory FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public orders access" ON public.orders;
    CREATE POLICY "Public orders access" ON public.orders FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public riders access" ON public.riders;
    CREATE POLICY "Public riders access" ON public.riders FOR ALL USING (true) WITH CHECK (true);
END $$;

-- Enable Real-time publications for live order & inventory updates
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'orders'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'store_inventory'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.store_inventory;
    END IF;
END $$;
