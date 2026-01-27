-- Row Level Security Policies for Packages Table
-- This allows public read access and admin-only write access

-- Enable Row Level Security on packages table
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow PUBLIC users to READ active packages
-- This enables the /packages page to display packages to everyone
CREATE POLICY "Anyone can view active packages"
ON packages
FOR SELECT
USING (status = 'active');

-- Policy 2: Allow AUTHENTICATED users to view all packages (including inactive)
-- This is useful for admin preview
CREATE POLICY "Authenticated users can view all packages"
ON packages
FOR SELECT
TO authenticated
USING (true);

-- Policy 3: Allow ADMIN users to INSERT packages
-- Check if user has admin role from profiles table
CREATE POLICY "Admins can insert packages"
ON packages
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Policy 4: Allow ADMIN users to UPDATE packages
CREATE POLICY "Admins can update packages"
ON packages
FOR UPDATE
TO authenticated
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

-- Policy 5: Allow ADMIN users to DELETE packages
CREATE POLICY "Admins can delete packages"
ON packages
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Summary of Policies:
-- ✅ Public (unauthenticated) users can view active packages
-- ✅ Authenticated users can view all packages
-- ✅ Only admins can create, update, or delete packages
