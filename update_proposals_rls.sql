-- ==========================================================
-- ReTexValue Proposals RLS Policy Update
-- ==========================================================
-- This file defines the Row Level Security (RLS) policies 
-- for the 'proposals' table to ensure users can create and
-- view proposals according to their roles.
--
-- ❗ CRITICAL: This is a common cause of insert operations
-- hanging indefinitely if RLS is enabled on the table but
-- no policies are defined.
-- ==========================================================

-- 1. Enable RLS on the proposals table (if not already on)
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

-- 2. Allow factories to create proposals for any request.
--    The check ensures that the 'factory_id' in the new row
--    matches the ID of the user performing the action.
DROP POLICY IF EXISTS "Factories can create proposals" ON public.proposals;
CREATE POLICY "Factories can create proposals" ON public.proposals 
FOR INSERT TO authenticated 
WITH CHECK ( auth.uid() = factory_id );

-- 3. Allow factories to view the proposals they have submitted.
DROP POLICY IF EXISTS "Factories can view their own proposals" ON public.proposals;
CREATE POLICY "Factories can view their own proposals" ON public.proposals
FOR SELECT TO authenticated
USING ( auth.uid() = factory_id );

-- 4. Allow buyers to view proposals submitted for their own bulk requests.
--    This joins the proposals table with bulk_requests to check ownership.
DROP POLICY IF EXISTS "Buyers can view proposals for their requests" ON public.proposals;
CREATE POLICY "Buyers can view proposals for their requests" ON public.proposals
FOR SELECT TO authenticated
USING ( 
  EXISTS (
    SELECT 1 
    FROM public.bulk_requests br 
    WHERE br.id = proposals.request_id AND br.buyer_id = auth.uid()
  )
);

-- 5. Allow factories to update their own proposals (e.g., withdraw).
DROP POLICY IF EXISTS "Factories can update their own proposals" ON public.proposals;
CREATE POLICY "Factories can update their own proposals" ON public.proposals
FOR UPDATE TO authenticated
USING ( auth.uid() = factory_id );

-- 6. Allow Admins to have unrestricted access to all proposals.
--    This is crucial for administration and moderation.
DROP POLICY IF EXISTS "Admins have full access to proposals" ON public.proposals;
CREATE POLICY "Admins have full access to proposals" ON public.proposals
FOR ALL TO authenticated
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' )
WITH CHECK ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

-- ==========================================================
-- End of Proposals RLS Policy
-- ==========================================================
