-- Migration: Update packages table schema with all required fields
-- Date: 2026-02-07
-- Description: Updates the packages table to include all fields needed for subscription management:
--              max_listings, max_bulk_requests, priority_support, ai_credits, badge_color, 
--              is_featured, and status. Replaces is_active with status column.

-- Step 1: Create new packages table with complete schema
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

-- Step 2: Add missing columns to existing packages table
DO $$ 
BEGIN
    -- Add each missing column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'packages' 
                   AND column_name = 'max_listings') THEN
        ALTER TABLE public.packages ADD COLUMN max_listings INTEGER DEFAULT 10;
        RAISE NOTICE 'Added max_listings column';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'packages' 
                   AND column_name = 'max_bulk_requests') THEN
        ALTER TABLE public.packages ADD COLUMN max_bulk_requests INTEGER DEFAULT 5;
        RAISE NOTICE 'Added max_bulk_requests column';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'packages' 
                   AND column_name = 'priority_support') THEN
        ALTER TABLE public.packages ADD COLUMN priority_support BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added priority_support column';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'packages' 
                   AND column_name = 'ai_credits') THEN
        ALTER TABLE public.packages ADD COLUMN ai_credits INTEGER DEFAULT 100;
        RAISE NOTICE 'Added ai_credits column';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'packages' 
                   AND column_name = 'badge_color') THEN
        ALTER TABLE public.packages ADD COLUMN badge_color VARCHAR(50) DEFAULT 'blue';
        RAISE NOTICE 'Added badge_color column';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'packages' 
                   AND column_name = 'is_featured') THEN
        ALTER TABLE public.packages ADD COLUMN is_featured BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added is_featured column';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'packages' 
                   AND column_name = 'status') THEN
        ALTER TABLE public.packages ADD COLUMN status VARCHAR(50) DEFAULT 'active';
        RAISE NOTICE 'Added status column';
    END IF;
    
    -- Drop is_active column if it exists (replaced by status)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' AND table_name = 'packages' 
               AND column_name = 'is_active') THEN
        ALTER TABLE public.packages DROP COLUMN is_active;
        RAISE NOTICE 'Dropped is_active column (replaced by status)';
    END IF;
    
    RAISE NOTICE 'Packages table schema updated successfully';
END $$;

-- Step 3: Update RLS policies
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active packages" ON public.packages;
DROP POLICY IF EXISTS "Admin can view all packages" ON public.packages;
DROP POLICY IF EXISTS "Admin can insert packages" ON public.packages;
DROP POLICY IF EXISTS "Admin can update packages" ON public.packages;
DROP POLICY IF EXISTS "Admin can delete packages" ON public.packages;

-- Create new policies
CREATE POLICY "Anyone can view active packages"
ON public.packages FOR SELECT
USING (status = 'active');

CREATE POLICY "Admin can view all packages"
ON public.packages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admin can insert packages"
ON public.packages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

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

CREATE POLICY "Admin can delete packages"
ON public.packages FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Step 4: Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.packages TO authenticated;


-- Verification log
DO $$
DECLARE
    package_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO package_count FROM public.packages;
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Packages Migration Complete!';
    RAISE NOTICE 'Total packages in database: %', package_count;
    RAISE NOTICE '========================================';
END $$;
