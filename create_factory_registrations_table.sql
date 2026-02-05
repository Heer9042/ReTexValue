-- Factory Registrations Table Migration
-- This table stores detailed factory registration information for admin approval

CREATE TABLE IF NOT EXISTS public.factory_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  gst_number TEXT NOT NULL,
  company_type TEXT NOT NULL CHECK (company_type IN ('manufacturer', 'recycler', 'processor', 'distributor', 'other')),
  capacity INTEGER NOT NULL, -- Monthly capacity in kg
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  waste_types TEXT[] NOT NULL, -- Array of waste types they handle
  certifications TEXT[], -- Array of certifications (optional)
  description TEXT, -- Business description (optional)
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add updated_at trigger
DROP TRIGGER IF EXISTS factory_registrations_updated_at_trigger ON public.factory_registrations;
CREATE TRIGGER factory_registrations_updated_at_trigger
  BEFORE UPDATE ON public.factory_registrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.factory_registrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own factory registrations
DROP POLICY IF EXISTS "Users can view own factory registrations" ON public.factory_registrations;
CREATE POLICY "Users can view own factory registrations" ON public.factory_registrations
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own factory registrations
DROP POLICY IF EXISTS "Users can insert own factory registrations" ON public.factory_registrations;
CREATE POLICY "Users can insert own factory registrations" ON public.factory_registrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all factory registrations
DROP POLICY IF EXISTS "Admins can view all factory registrations" ON public.factory_registrations;
CREATE POLICY "Admins can view all factory registrations" ON public.factory_registrations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Admins can update factory registrations (for approval/rejection)
DROP POLICY IF EXISTS "Admins can update factory registrations" ON public.factory_registrations;
CREATE POLICY "Admins can update factory registrations" ON public.factory_registrations
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_factory_registrations_status ON public.factory_registrations(status);
CREATE INDEX IF NOT EXISTS idx_factory_registrations_user_id ON public.factory_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_factory_registrations_submitted_at ON public.factory_registrations(submitted_at DESC);