-- Add missing factory columns to profiles table
-- This migration adds columns needed to store complete factory registration data

DO $$
BEGIN
    -- Add missing columns for factory data
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS state TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pincode TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS waste_types TEXT[];
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS certifications TEXT[];
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS description TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS factory_approved_at TIMESTAMP WITH TIME ZONE;
END $$;