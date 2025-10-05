-- Make user_id nullable to allow anonymous likes
ALTER TABLE public.ae_votes ALTER COLUMN user_id DROP NOT NULL;

-- Drop the old unique constraint
ALTER TABLE public.ae_votes DROP CONSTRAINT IF EXISTS ae_votes_ae_id_user_id_key;

-- Update policies to allow anonymous votes
DROP POLICY IF EXISTS "Authenticated users can insert their own vote" ON public.ae_votes;
DROP POLICY IF EXISTS "Users can delete their own vote" ON public.ae_votes;

-- Allow anyone to insert votes
CREATE POLICY "Anyone can insert votes" 
ON public.ae_votes 
FOR INSERT 
WITH CHECK (true);

-- Users can delete their own authenticated votes or any vote (for anonymous cleanup)
CREATE POLICY "Users can delete votes" 
ON public.ae_votes 
FOR DELETE 
USING (auth.uid() = user_id OR user_id IS NULL);