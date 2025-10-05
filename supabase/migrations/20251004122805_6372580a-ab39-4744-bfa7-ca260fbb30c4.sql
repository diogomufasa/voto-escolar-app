-- Create table for AE votes/likes
CREATE TABLE public.ae_votes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ae_id bigint NOT NULL REFERENCES public."AEs"(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(ae_id, user_id)
);

-- Enable RLS
ALTER TABLE public.ae_votes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view votes" 
ON public.ae_votes 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert their own vote" 
ON public.ae_votes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vote" 
ON public.ae_votes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_ae_votes_ae_id ON public.ae_votes(ae_id);
CREATE INDEX idx_ae_votes_user_id ON public.ae_votes(user_id);