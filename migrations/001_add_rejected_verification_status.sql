-- Migration: Add 'rejected' status to verification_status enum
-- Date: 2026-02-07
-- Description: Updates the profiles table to support 3-state verification workflow
--              (unverified -> verified/rejected)

-- Drop the existing CHECK constraint
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_verification_status_check;

-- Add the new CHECK constraint with 'rejected' status
ALTER TABLE profiles 
ADD CONSTRAINT profiles_verification_status_check 
CHECK (verification_status IN ('unverified', 'verified', 'rejected'));

-- Verify the change
COMMENT ON CONSTRAINT profiles_verification_status_check ON profiles IS 
'Ensures verification_status is one of: unverified (pending admin review), verified (approved), or rejected (admin rejected)';
