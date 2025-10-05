-- Drop and recreate os_onze table with proper structure
DROP TABLE IF EXISTS public.os_onze;

-- Create the updated os_onze table with roles and AE connection
CREATE TABLE public.os_onze (
  id bigint primary key generated always as identity,
  ae_id bigint references public.AEs(id) on delete cascade not null,
  nome text not null,
  cargo text not null,
  orgao text not null check (orgao in ('DIREÇÃO', 'MESA DE ASSEMBLEIA GERAL', 'CONSELHO FISCAL')),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Enable RLS
ALTER TABLE public.os_onze ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Os onze are viewable by everyone" 
ON public.os_onze 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert os onze" 
ON public.os_onze 
FOR INSERT 
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update os onze" 
ON public.os_onze 
FOR UPDATE 
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete os onze" 
ON public.os_onze 
FOR DELETE 
USING (public.is_admin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_os_onze_updated_at
BEFORE UPDATE ON public.os_onze
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_os_onze_ae_id ON public.os_onze(ae_id);
CREATE INDEX idx_os_onze_orgao ON public.os_onze(orgao);