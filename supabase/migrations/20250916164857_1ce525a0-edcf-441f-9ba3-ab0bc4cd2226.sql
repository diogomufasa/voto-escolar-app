-- Add columns to AEs table for VotoMarista platform
ALTER TABLE public.AEs 
ADD COLUMN os_onze TEXT[], -- Array to store the 11 main members
ADD COLUMN comissoes TEXT[], -- Array to store committees
ADD COLUMN num_colaboradores INTEGER DEFAULT 0, -- Number of collaborators
ADD COLUMN propostas TEXT[], -- Array to store main proposals
ADD COLUMN video_url TEXT, -- URL for promotional video
ADD COLUMN descricao TEXT, -- Description of the list
ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Enable Row Level Security
ALTER TABLE public.AEs ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (for the feed)
CREATE POLICY "AEs are viewable by everyone" 
ON public.AEs 
FOR SELECT 
USING (true);

-- Create policies for admin insert/update access
-- Note: These policies will need authentication to work properly
CREATE POLICY "Admins can insert AEs" 
ON public.AEs 
FOR INSERT 
WITH CHECK (true); -- This should be restricted to admin users when auth is implemented

CREATE POLICY "Admins can update AEs" 
ON public.AEs 
FOR UPDATE 
USING (true); -- This should be restricted to admin users when auth is implemented

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_aes_updated_at
    BEFORE UPDATE ON public.AEs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();