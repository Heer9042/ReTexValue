-- ==========================================================
-- ReTexValue Packages Table Setup
-- ==========================================================
-- Ensures the packages table exists with proper schema

-- Drop existing table if needed (be careful!)
-- DROP TABLE IF EXISTS public.packages;

-- Create Packages Table
CREATE TABLE IF NOT EXISTS public.packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  duration_days INTEGER NOT NULL DEFAULT 30,
  features JSONB DEFAULT '[]'::jsonb,
  max_listings INTEGER DEFAULT 10,
  max_bulk_requests INTEGER DEFAULT 5,
  priority_support BOOLEAN DEFAULT false,
  ai_credits INTEGER DEFAULT 10,
  status VARCHAR(50) DEFAULT 'active',
  badge_color VARCHAR(50) DEFAULT 'blue',
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_packages_status ON public.packages(status);
CREATE INDEX IF NOT EXISTS idx_packages_is_featured ON public.packages(is_featured);
CREATE INDEX IF NOT EXISTS idx_packages_price ON public.packages(price);

-- Enable Row Level Security
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active packages
CREATE POLICY "Public read access to packages"
  ON public.packages
  FOR SELECT
  USING (status = 'active' OR status IS NULL);

-- Allow admins to read all packages
CREATE POLICY "Admin full access to packages"
  ON public.packages
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_packages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS packages_updated_at_trigger ON public.packages;

CREATE TRIGGER packages_updated_at_trigger
BEFORE UPDATE ON public.packages
FOR EACH ROW
EXECUTE FUNCTION update_packages_updated_at();

-- Sample Data (IMPORTANT: Add some test packages for the page to display)
INSERT INTO public.packages (name, description, price, duration_days, features, max_listings, max_bulk_requests, priority_support, ai_credits, status, badge_color, is_featured)
VALUES 
  (
    'Starter',
    'Perfect for individual factories and small operations',
    999,
    30,
    '["Up to 10 listings per month", "Basic AI classification", "Email support", "Weekly reports"]'::jsonb,
    10,
    3,
    false,
    10,
    'active',
    'slate',
    false
  ),
  (
    'Professional',
    'Ideal for growing textile waste businesses',
    4999,
    30,
    '["Unlimited listings", "Advanced AI classification", "Priority support", "Daily analytics", "Custom reporting", "API access"]'::jsonb,
    999999,
    50,
    true,
    100,
    'active',
    'blue',
    true
  ),
  (
    'Enterprise',
    'For large-scale operations and bulk buyers',
    9999,
    30,
    '["Unlimited everything", "Dedicated account manager", "24/7 support", "Real-time analytics", "Custom integrations", "Bulk pricing", "Factory verification"]'::jsonb,
    999999,
    999999,
    true,
    999999,
    'active',
    'emerald',
    true
  ),
  (
    'Premium Plus',
    'Extended enterprise features with advanced tools',
    14999,
    30,
    '["Everything in Enterprise", "White-label portal", "Advanced market intelligence", "Sustainability certifications", "Multi-region support", "Custom workflows"]'::jsonb,
    999999,
    999999,
    true,
    999999,
    'active',
    'purple',
    false
  )
ON CONFLICT DO NOTHING;

-- Verify the packages were inserted
SELECT * FROM public.packages;
