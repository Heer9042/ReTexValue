-- Update Profiles Table to Add Verification Fields
-- This migration adds verification status to the existing profiles table

-- Add verification fields to profiles table if they don't exist
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS verification_documents JSONB,
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_transactions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;

-- Create index for verification queries
CREATE INDEX IF NOT EXISTS idx_profiles_is_verified ON profiles(is_verified);
CREATE INDEX IF NOT EXISTS idx_profiles_verification_status ON profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_profiles_rating ON profiles(average_rating DESC);

-- Auto-update timestamp trigger (if not exists)
CREATE OR REPLACE FUNCTION update_profiles_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_timestamp
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_profiles_timestamp();

-- Update sample users with verification data
UPDATE profiles
SET 
  is_verified = true,
  verification_status = 'verified',
  verified_at = NOW(),
  average_rating = 4.8,
  total_reviews = 156,
  total_transactions = 45,
  bio = 'Leading textile waste processor in South India. Specializing in cotton and polyester waste classification.'
WHERE id = '550e8400-e29b-41d4-a716-446655440001'::UUID;

UPDATE profiles
SET 
  is_verified = true,
  verification_status = 'verified',
  verified_at = NOW(),
  average_rating = 4.9,
  total_reviews = 342,
  total_transactions = 89,
  bio = 'Certified international textile recycler. ISO 14001 compliant.'
WHERE id = '550e8400-e29b-41d4-a716-446655440002'::UUID;

UPDATE profiles
SET 
  is_verified = true,
  verification_status = 'verified',
  verified_at = NOW(),
  average_rating = 4.7,
  total_reviews = 89,
  total_transactions = 34,
  bio = 'Cotton and silk waste specialist. Eco-friendly processing methods.'
WHERE id = '550e8400-e29b-41d4-a716-446655440003'::UUID;

UPDATE profiles
SET 
  is_verified = true,
  verification_status = 'verified',
  verified_at = NOW(),
  average_rating = 4.6,
  total_reviews = 214,
  total_transactions = 67,
  bio = 'European textile recycling leader. Fast turnaround times.'
WHERE id = '550e8400-e29b-41d4-a716-446655440004'::UUID;

UPDATE profiles
SET 
  is_verified = false,
  verification_status = 'pending',
  bio = 'New member - Awaiting verification'
WHERE id = '550e8400-e29b-41d4-a716-446655440005'::UUID;

UPDATE profiles
SET 
  is_verified = false,
  verification_status = 'unverified',
  bio = 'Building our network in Southeast Asia'
WHERE id = '550e8400-e29b-41d4-a716-446655440006'::UUID;

-- Create a view for community members statistics
CREATE OR REPLACE VIEW community_stats AS
SELECT 
  COUNT(*) as total_members,
  COUNT(CASE WHEN role = 'Factory' THEN 1 END) as total_factories,
  COUNT(CASE WHEN role = 'Buyer' THEN 1 END) as total_buyers,
  COUNT(CASE WHEN is_verified = true THEN 1 END) as verified_members,
  COUNT(CASE WHEN verification_status = 'pending' THEN 1 END) as pending_verifications,
  ROUND(AVG(average_rating)::numeric, 2) as avg_platform_rating
FROM profiles
WHERE status = 'active';

-- Grant permissions
GRANT SELECT ON community_stats TO authenticated;
