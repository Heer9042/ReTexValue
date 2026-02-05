-- Create transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL,
  buyer_id UUID NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  commission DECIMAL(10, 2) NOT NULL DEFAULT 0,
  status VARCHAR(50) DEFAULT 'Pending',
  payment_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraints
DO $$ BEGIN
    ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_buyer_id_fkey;
    ALTER TABLE public.transactions ADD CONSTRAINT transactions_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

    ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_listing_id_fkey;
    ALTER TABLE public.transactions ADD CONSTRAINT transactions_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;
END $$;

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
CREATE POLICY "Users can view their own transactions" ON public.transactions
FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() IN (
  SELECT factory_id FROM public.listings WHERE id = listing_id
));

DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.transactions;
CREATE POLICY "Users can insert their own transactions" ON public.transactions
FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Add updated_at trigger
DROP TRIGGER IF EXISTS transactions_updated_at_trigger ON public.transactions;
CREATE TRIGGER transactions_updated_at_trigger
BEFORE UPDATE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();