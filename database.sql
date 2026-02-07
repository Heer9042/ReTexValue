-- =====================================================
-- ReTexValue - Complete Database Setup
-- =====================================================
-- This file contains all database migrations for the ReTexValue platform
-- Run this in your Supabase SQL Editor

-- =====================================================
-- 1. Factory Registration Approval System
-- =====================================================

-- Add verification_status column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'verification_status'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN verification_status VARCHAR(50) DEFAULT 'verified' 
        CHECK (verification_status IN ('unverified', 'verified', 'rejected'));
        RAISE NOTICE 'Added verification_status column';
    ELSE
        ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_verification_status_check;
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_verification_status_check 
        CHECK (verification_status IN ('unverified', 'verified', 'rejected'));
        RAISE NOTICE 'verification_status column already exists - updated constraint';
    END IF;
END $$;

-- Add is_verified column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'is_verified'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN is_verified BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added is_verified column';
    ELSE
        RAISE NOTICE 'is_verified column already exists';
    END IF;
END $$;

-- Add verified_at column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'verified_at'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN verified_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added verified_at column';
    ELSE
        RAISE NOTICE 'verified_at column already exists';
    END IF;
END $$;

-- Create indexes for verification_status
CREATE INDEX IF NOT EXISTS idx_profiles_verification_status 
ON public.profiles(verification_status);

CREATE INDEX IF NOT EXISTS idx_profiles_role_verification 
ON public.profiles(role, verification_status) 
WHERE role = 'factory';

-- Set default verification status for existing users
UPDATE public.profiles 
SET 
    verification_status = 'verified',
    is_verified = true,
    verified_at = COALESCE(verified_at, created_at)
WHERE role IN ('buyer', 'admin') 
AND verification_status != 'verified';

UPDATE public.profiles 
SET 
    verification_status = 'verified',
    is_verified = true,
    verified_at = COALESCE(verified_at, created_at)
WHERE role = 'factory' 
AND status = 'Verified'
AND verification_status != 'verified';

UPDATE public.profiles 
SET 
    verification_status = 'unverified',
    is_verified = false
WHERE role = 'factory' 
AND status = 'Pending'
AND verification_status = 'verified';

-- =====================================================
-- 2. Row Level Security Policies
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile (not status/verification)" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins have full access" ON public.profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- =====================================================
-- 3. Verification Trigger Function
-- =====================================================

CREATE OR REPLACE FUNCTION public.set_new_user_verification()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role = 'factory' THEN
        NEW.verification_status := 'unverified';
        NEW.is_verified := false;
        NEW.status := 'Pending';
    ELSE
        NEW.verification_status := 'verified';
        NEW.is_verified := true;
        NEW.verified_at := NOW();
        IF NEW.status IS NULL OR NEW.status = 'Pending' THEN
            NEW.status := 'Active';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_set_new_user_verification ON public.profiles;

CREATE TRIGGER trigger_set_new_user_verification
    BEFORE INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.set_new_user_verification();

-- =====================================================
-- 4. Packages Table Setup
-- =====================================================

CREATE TABLE IF NOT EXISTS public.packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    duration_days INTEGER DEFAULT 30,
    max_listings INTEGER DEFAULT 10,
    max_bulk_requests INTEGER DEFAULT 5,
    priority_support BOOLEAN DEFAULT false,
    ai_credits INTEGER DEFAULT 100,
    badge_color VARCHAR(50) DEFAULT 'blue',
    is_featured BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update existing columns if table exists
DO $$ 
BEGIN
    -- Add missing columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'packages' 
                   AND column_name = 'max_listings') THEN
        ALTER TABLE public.packages ADD COLUMN max_listings INTEGER DEFAULT 10;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'packages' 
                   AND column_name = 'max_bulk_requests') THEN
        ALTER TABLE public.packages ADD COLUMN max_bulk_requests INTEGER DEFAULT 5;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'packages' 
                   AND column_name = 'priority_support') THEN
        ALTER TABLE public.packages ADD COLUMN priority_support BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'packages' 
                   AND column_name = 'ai_credits') THEN
        ALTER TABLE public.packages ADD COLUMN ai_credits INTEGER DEFAULT 100;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'packages' 
                   AND column_name = 'badge_color') THEN
        ALTER TABLE public.packages ADD COLUMN badge_color VARCHAR(50) DEFAULT 'blue';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'packages' 
                   AND column_name = 'is_featured') THEN
        ALTER TABLE public.packages ADD COLUMN is_featured BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'packages' 
                   AND column_name = 'status') THEN
        ALTER TABLE public.packages ADD COLUMN status VARCHAR(50) DEFAULT 'active';
    END IF;
    
    -- Drop is_active column if it exists (replace with status)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' AND table_name = 'packages' 
               AND column_name = 'is_active') THEN
        ALTER TABLE public.packages DROP COLUMN is_active;
    END IF;
    
    RAISE NOTICE 'Packages table schema updated successfully';
END $$;

-- Enable RLS on packages
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active packages" ON public.packages;
DROP POLICY IF EXISTS "Admin can insert packages" ON public.packages;
DROP POLICY IF EXISTS "Admin can update packages" ON public.packages;
DROP POLICY IF EXISTS "Admin can delete packages" ON public.packages;

-- Allow everyone to view active packages
CREATE POLICY "Anyone can view active packages"
ON public.packages FOR SELECT
USING (status = 'active');

-- Allow admins to view all packages
CREATE POLICY "Admin can view all packages"
ON public.packages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Allow only admins to insert packages
CREATE POLICY "Admin can insert packages"
ON public.packages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Allow only admins to update packages
CREATE POLICY "Admin can update packages"
ON public.packages FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Allow only admins to delete packages
CREATE POLICY "Admin can delete packages"
ON public.packages FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- =====================================================
-- 5. Transactions Table Setup
-- =====================================================

CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    commission DECIMAL(10, 2) DEFAULT 0,
    payment_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Buyers can view their own transactions
CREATE POLICY "Buyers can view own transactions"
ON public.transactions FOR SELECT
USING (auth.uid() = buyer_id);

-- Factories can view transactions for their listings
CREATE POLICY "Factories can view their transactions"
ON public.transactions FOR SELECT
USING (auth.uid() = seller_id);

-- Buyers can insert their own transactions
CREATE POLICY "Buyers can insert own transactions"
ON public.transactions FOR INSERT
WITH CHECK (auth.uid() = buyer_id);

-- =====================================================
-- 6. Bulk Requests Table with Fabric Category
-- =====================================================

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'bulk_requests' 
        AND column_name = 'fabric_category'
    ) THEN
        ALTER TABLE public.bulk_requests 
        ADD COLUMN fabric_category VARCHAR(100);
        RAISE NOTICE 'Added fabric_category column to bulk_requests';
    ELSE
        RAISE NOTICE 'fabric_category column already exists';
    END IF;
END $$;

-- =====================================================
-- 7. Storage Bucket Setup
-- =====================================================

-- Create storage bucket for textile images
INSERT INTO storage.buckets (id, name, public)
VALUES ('textile-images', 'textile-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can view textile images"
ON storage.objects FOR SELECT
USING (bucket_id = 'textile-images');

CREATE POLICY "Authenticated users can upload textile images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'textile-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'textile-images' AND auth.uid()::text = owner);

CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
USING (bucket_id = 'textile-images' AND auth.uid()::text = owner);

-- =====================================================
-- 8. Grant Permissions
-- =====================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bulk_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.packages TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_new_user_verification() TO authenticated;

-- =====================================================
-- Sample Packages Data
-- =====================================================

-- Insert sample packages if they don't exist
INSERT INTO public.packages (
    name, description, price, duration_days, max_listings, 
    max_bulk_requests, priority_support, ai_credits, 
    badge_color, is_featured, status, features
) VALUES 
(
    'Starter',
    'Perfect for new textile sellers getting started with our platform',
    999,
    30,
    5,
    2,
    false,
    100,
    'blue',
    false,
    'active',
    '["5 Active Listings", "2 Bulk Requests/month", "Basic Support", "100 AI Credits"]'
),
(
    'Professional',
    'Ideal for growing textile businesses looking to scale',
    2999,
    30,
    25,
    10,
    true,
    500,
    'purple',
    true,
    'active',
    '["25 Active Listings", "10 Bulk Requests/month", "Priority Support", "500 AI Credits", "Advanced Analytics"]'
),
(
    'Enterprise',
    'Complete solution for large-scale textile operations',
    9999,
    30,
    999999,
    999999,
    true,
    999999,
    'rose',
    false,
    'active',
    '["Unlimited Listings", "Unlimited Bulk Requests", "24/7 Priority Support", "Unlimited AI Credits", "Dedicated Account Manager", "Custom Integration"]'
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 9. Verification Summary
-- =====================================================

DO $$
DECLARE
    unverified_count INTEGER;
    verified_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO unverified_count FROM public.profiles 
    WHERE role = 'factory' AND verification_status = 'unverified';
    
    SELECT COUNT(*) INTO verified_count FROM public.profiles 
    WHERE role = 'factory' AND verification_status = 'verified';
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Database Setup Complete!';
    RAISE NOTICE 'Factory Verification Summary:';
    RAISE NOTICE '  Unverified (Pending Approval): %', unverified_count;
    RAISE NOTICE '  Verified (Approved): %', verified_count;
    RAISE NOTICE '========================================';
END $$;

-- =====================================================
-- Setup Complete!
-- =====================================================
