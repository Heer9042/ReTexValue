-- ==========================================================
-- ReTexValue Master Database Migration
-- ==========================================================
-- This file consolidates all schema, RLS, storage, and 
-- security policies for the ReTexValue platform.
-- ==========================================================

-- 1. CORE SCHEMA TABLES
-- ----------------------------------------------------------

-- Profiles table is assumed to exist as part of Supabase Auth integration,
-- but we ensure all custom columns are present.
DO $$ 
BEGIN
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Pending';
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS type TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_name TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gst TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS capacity NUMERIC;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_type TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

    -- Notification Preferences
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notifications_email BOOLEAN DEFAULT TRUE;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notifications_push BOOLEAN DEFAULT TRUE;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notifications_orders BOOLEAN DEFAULT TRUE;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notifications_listings BOOLEAN DEFAULT TRUE;
END $$;

-- Packages Table
CREATE TABLE IF NOT EXISTS public.packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  duration_days INTEGER NOT NULL,
  features JSONB,
  max_listings INTEGER,
  max_bulk_requests INTEGER,
  priority_support BOOLEAN DEFAULT false,
  ai_credits INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active',
  badge_color VARCHAR(50) DEFAULT 'blue',
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System Alerts Table
CREATE TABLE IF NOT EXISTS public.system_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info',
  priority VARCHAR(50) DEFAULT 'medium',
  target_audience VARCHAR(50) DEFAULT 'all',
  expires_at TIMESTAMP WITH TIME ZONE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Market Regions Table
CREATE TABLE IF NOT EXISTS public.market_regions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(10) NOT NULL UNIQUE,
  currency VARCHAR(10) NOT NULL DEFAULT 'INR',
  timezone VARCHAR(100) NOT NULL DEFAULT 'Asia/Kolkata',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. STORAGE SETUP
-- ----------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true), ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- 3. HELPER FUNCTIONS & TRIGGERS
-- ----------------------------------------------------------

-- Timestamp Update Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply Timestamp Triggers
DROP TRIGGER IF EXISTS packages_updated_at_trigger ON public.packages;
CREATE TRIGGER packages_updated_at_trigger BEFORE UPDATE ON public.packages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_system_alerts_updated_at ON public.system_alerts;
CREATE TRIGGER update_system_alerts_updated_at BEFORE UPDATE ON public.system_alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_market_regions_updated_at ON public.market_regions;
CREATE TRIGGER update_market_regions_updated_at BEFORE UPDATE ON public.market_regions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auth Signup Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username, role, email, phone, location, gst, capacity, company_name)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'username',
    COALESCE(new.raw_user_meta_data->>'role', 'buyer'),
    new.email,
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'location',
    new.raw_user_meta_data->>'gst',
    new.raw_user_meta_data->>'capacity',
    new.raw_user_meta_data->>'company_name'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    location = EXCLUDED.location;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. CASCADE DELETION POLICIES
-- ----------------------------------------------------------

-- Listings cascade delete when Factory is deleted
DO $$ BEGIN
    ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_factory_id_fkey;
    ALTER TABLE public.listings ADD CONSTRAINT listings_factory_id_fkey FOREIGN KEY (factory_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
END $$;

-- Bulk Requests cascade delete when Buyer is deleted
DO $$ BEGIN
    ALTER TABLE public.bulk_requests DROP CONSTRAINT IF EXISTS bulk_requests_buyer_id_fkey;
    ALTER TABLE public.bulk_requests ADD CONSTRAINT bulk_requests_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
END $$;

-- Proposals cascade delete when associated with a deleted User
DO $$ BEGIN
    ALTER TABLE public.proposals DROP CONSTRAINT IF EXISTS proposals_factory_id_fkey;
    ALTER TABLE public.proposals ADD CONSTRAINT proposals_factory_id_fkey FOREIGN KEY (factory_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    
    ALTER TABLE public.proposals DROP CONSTRAINT IF EXISTS proposals_buyer_id_fkey;
    ALTER TABLE public.proposals ADD CONSTRAINT proposals_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
END $$;

-- Transactions cascade delete when Buyer or Listing is deleted
DO $$ BEGIN
    ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_buyer_id_fkey;
    ALTER TABLE public.transactions ADD CONSTRAINT transactions_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

    ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_listing_id_fkey;
    ALTER TABLE public.transactions ADD CONSTRAINT transactions_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;
END $$;

-- Settings cascade delete
DO $$ BEGIN
    ALTER TABLE public.settings DROP CONSTRAINT IF EXISTS settings_user_id_fkey;
    ALTER TABLE public.settings ADD CONSTRAINT settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
END $$;

-- 5. ROW LEVEL SECURITY (RLS)
-- ----------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_regions ENABLE ROW LEVEL SECURITY;

-- Profile Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING ( true );

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ( auth.uid() = id );

DROP POLICY IF EXISTS "Admins can delete any profile" ON public.profiles;
CREATE POLICY "Admins can delete any profile" ON public.profiles FOR DELETE TO authenticated USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile" ON public.profiles FOR UPDATE TO authenticated USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

-- Package Policies
DROP POLICY IF EXISTS "Anyone can view active packages" ON public.packages;
CREATE POLICY "Anyone can view active packages" ON public.packages FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Admins can manage packages" ON public.packages;
CREATE POLICY "Admins can manage packages" ON public.packages FOR ALL TO authenticated 
USING ( EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin') );

-- Storage Policies
DROP POLICY IF EXISTS "Avatar Public Access" ON storage.objects;
CREATE POLICY "Avatar Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'avatars' );

DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );

DROP POLICY IF EXISTS "Products Public Access" ON storage.objects;
CREATE POLICY "Products Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'products' );

DROP POLICY IF EXISTS "Authenticated users can upload products" ON storage.objects;
CREATE POLICY "Authenticated users can upload products" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'products' AND auth.role() = 'authenticated' );
