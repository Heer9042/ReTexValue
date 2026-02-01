-- ==========================================================
-- ReTexValue Status Constraint Update
-- ==========================================================
-- This script updates the 'listings' table to allow 'Rejected' status.

-- 1. Parse and Drop the existing constraint
-- Note: usage of specific constraint name 'listings_status_check'
ALTER TABLE public.listings 
DROP CONSTRAINT IF EXISTS listings_status_check;

-- 2. Add the updated constraint including 'Rejected'
ALTER TABLE public.listings
ADD CONSTRAINT listings_status_check 
CHECK (status IN ('Pending', 'Live', 'Sold', 'Rejected'));

-- 3. Verify the change (optional comment)
-- Listing statuses can now be: Pending, Live, Sold, Rejected.
