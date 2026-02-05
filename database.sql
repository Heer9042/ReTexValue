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
        CHECK (verification_status IN ('unverified', 'verified'));
        RAISE NOTICE 'Added verification_status column';
    ELSE
        ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_verification_status_check;
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_verification_status_check 
        CHECK (verification_status IN ('unverified', 'verified'));
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
    features JSONB,
    duration_days INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on packages
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view active packages
CREATE POLICY "Anyone can view active packages"
ON public.packages FOR SELECT
USING (is_active = true);

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

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.transactions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.bulk_requests TO authenticated;
GRANT SELECT ON public.packages TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_new_user_verification() TO authenticated;

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
