
-- Fix Status and Verification Updates in Profiles Table
-- This ensures the columns exist and RLS policies allow updates

-- 1. Ensure columns exist with proper constraints
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Pending' CHECK (status IN ('Verified', 'Pending', 'Rejected', 'Blocked', 'Active'));

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected'));

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP;

-- 2. Create or replace RLS policies for role-based access control
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admin can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin can delete profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Buyers can update own profile" ON profiles;
DROP POLICY IF EXISTS "Factories can update own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- READ POLICIES: Allow all authenticated users to read all profiles
CREATE POLICY "Enable read access for all users" ON profiles
FOR SELECT
USING (true);

-- INSERT POLICIES: Allow authenticated users to insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- UPDATE POLICIES

-- Admin can update ALL profiles (including status and verification)
CREATE POLICY "Admin can update all profiles" ON profiles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() 
    AND LOWER(role) = 'admin'
  )
);

-- Buyer can update ONLY their own profile (excluding status and verification_status)
CREATE POLICY "Buyers can update own profile" ON profiles
FOR UPDATE
USING (
  auth.uid() = id 
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() 
    AND LOWER(role) = 'buyer'
  )
)
WITH CHECK (
  auth.uid() = id 
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() 
    AND LOWER(role) = 'buyer'
  )
);

-- Factory can update ONLY their own profile (excluding status and verification_status)
CREATE POLICY "Factories can update own profile" ON profiles
FOR UPDATE
USING (
  auth.uid() = id 
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() 
    AND LOWER(role) = 'factory'
  )
)
WITH CHECK (
  auth.uid() = id 
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() 
    AND LOWER(role) = 'factory'
  )
);

-- DELETE POLICIES

-- Only Admin can delete profiles
CREATE POLICY "Admin can delete profiles" ON profiles
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() 
    AND LOWER(role) = 'admin'
  )
);

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_verification_status ON profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- 4. Grant necessary permissions
GRANT ALL ON profiles TO authenticated;
GRANT SELECT ON profiles TO anon;

-- 5. Verify the setup
DO $$
BEGIN
    RAISE NOTICE '=== Column Verification ===';
    RAISE NOTICE 'Status column exists: %', 
        (SELECT column_name FROM information_schema.columns 
         WHERE table_name = 'profiles' AND column_name = 'status');
    
    RAISE NOTICE 'Verification_status column exists: %', 
        (SELECT column_name FROM information_schema.columns 
         WHERE table_name = 'profiles' AND column_name = 'verification_status');
    
    RAISE NOTICE 'Is_verified column exists: %', 
        (SELECT column_name FROM information_schema.columns 
         WHERE table_name = 'profiles' AND column_name = 'is_verified');
    
    RAISE NOTICE 'Role column exists: %', 
        (SELECT column_name FROM information_schema.columns 
         WHERE table_name = 'profiles' AND column_name = 'role');
    
    RAISE NOTICE '=== RLS Policies ===';
    RAISE NOTICE 'Policies created: %', 
        (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'profiles');
END $$;

-- 6. Summary of Permissions
-- 
-- ADMIN (role = 'admin'):
--   ✓ Can view all profiles
--   ✓ Can update ALL profiles (including status, verification_status)
--   ✓ Can delete any profile
--   ✓ Can insert profiles
--
-- BUYER (role = 'buyer'):
--   ✓ Can view all profiles
--   ✓ Can update ONLY their own profile (personal info)
--   ✗ Cannot update status or verification_status
--   ✗ Cannot delete profiles
--   ✓ Can insert their own profile
--
-- FACTORY (role = 'factory'):
--   ✓ Can view all profiles
--   ✓ Can update ONLY their own profile (personal info)
--   ✗ Cannot update status or verification_status
--   ✗ Cannot delete profiles
--   ✓ Can insert their own profile

-- 7. Test updates (replace with your actual user IDs to test)
-- Admin updating any user's status:
-- UPDATE profiles SET status = 'Verified' WHERE id = 'target-user-id';
-- 
-- Buyer updating own profile:
-- UPDATE profiles SET full_name = 'Updated Name' WHERE id = auth.uid();
--
-- Factory updating own profile:
-- UPDATE profiles SET company_name = 'Updated Company' WHERE id = auth.uid();

COMMIT;
