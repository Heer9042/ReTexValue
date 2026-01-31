-- Enable CASCADE DELETE for critical relational tables
-- This allows deleting a User/Profile to automatically remove their associated data without errors.

-- 1. Modify LISTINGS table constraint
ALTER TABLE public.listings
DROP CONSTRAINT IF EXISTS listings_factory_id_fkey;

ALTER TABLE public.listings
ADD CONSTRAINT listings_factory_id_fkey
FOREIGN KEY (factory_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- 2. Modify PROPOSALS table constraints
ALTER TABLE public.proposals
DROP CONSTRAINT IF EXISTS proposals_factory_id_fkey;

ALTER TABLE public.proposals
ADD CONSTRAINT proposals_factory_id_fkey
FOREIGN KEY (factory_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;

ALTER TABLE public.proposals
DROP CONSTRAINT IF EXISTS proposals_buyer_id_fkey;

ALTER TABLE public.proposals
ADD CONSTRAINT proposals_buyer_id_fkey
FOREIGN KEY (buyer_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- 3. Modify BULK REQUESTS table constraint
ALTER TABLE public.bulk_requests
DROP CONSTRAINT IF EXISTS bulk_requests_buyer_id_fkey;

ALTER TABLE public.bulk_requests
ADD CONSTRAINT bulk_requests_buyer_id_fkey
FOREIGN KEY (buyer_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- 4. Modify TRANSACTIONS table constraints
-- Only buyer_id exists in standard schema, listing_id links to seller implicitly
ALTER TABLE public.transactions
DROP CONSTRAINT IF EXISTS transactions_buyer_id_fkey;

ALTER TABLE public.transactions
ADD CONSTRAINT transactions_buyer_id_fkey
FOREIGN KEY (buyer_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- 5. Modify SETTINGS table constraint
ALTER TABLE public.settings
DROP CONSTRAINT IF EXISTS settings_user_id_fkey;

ALTER TABLE public.settings
ADD CONSTRAINT settings_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;
