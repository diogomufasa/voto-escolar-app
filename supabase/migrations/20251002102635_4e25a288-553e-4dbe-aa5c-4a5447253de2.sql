-- Add user_id to AEs table to track ownership
ALTER TABLE public."AEs"
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for user_id
CREATE INDEX idx_aes_user_id ON public."AEs" USING btree (user_id);

-- Create function to check if user already has an AE
CREATE OR REPLACE FUNCTION public.user_has_ae(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public."AEs"
    WHERE user_id = _user_id
  )
$$;

-- Create function to check if user owns an AE
CREATE OR REPLACE FUNCTION public.user_owns_ae(_user_id uuid, _ae_id bigint)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public."AEs"
    WHERE id = _ae_id AND user_id = _user_id
  )
$$;

-- Drop existing policies on AEs
DROP POLICY IF EXISTS "Admins can insert AEs" ON public."AEs";
DROP POLICY IF EXISTS "Admins can update AEs" ON public."AEs";

-- Create new policies for AEs
CREATE POLICY "Users can insert one AE"
ON public."AEs"
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND NOT user_has_ae(auth.uid())
);

CREATE POLICY "Admins can insert AEs"
ON public."AEs"
FOR INSERT
TO authenticated
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Users can update their own AE"
ON public."AEs"
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Users can delete their own AE"
ON public."AEs"
FOR DELETE
TO authenticated
USING (auth.uid() = user_id OR is_admin(auth.uid()));

-- Update os_onze policies to allow users to manage their own AE's members
DROP POLICY IF EXISTS "Admins can insert os onze" ON public.os_onze;
DROP POLICY IF EXISTS "Admins can update os onze" ON public.os_onze;
DROP POLICY IF EXISTS "Admins can delete os onze" ON public.os_onze;

CREATE POLICY "Users can insert os onze for their AE"
ON public.os_onze
FOR INSERT
TO authenticated
WITH CHECK (
  user_owns_ae(auth.uid(), ae_id) OR is_admin(auth.uid())
);

CREATE POLICY "Users can update os onze for their AE"
ON public.os_onze
FOR UPDATE
TO authenticated
USING (
  user_owns_ae(auth.uid(), ae_id) OR is_admin(auth.uid())
);

CREATE POLICY "Users can delete os onze for their AE"
ON public.os_onze
FOR DELETE
TO authenticated
USING (
  user_owns_ae(auth.uid(), ae_id) OR is_admin(auth.uid())
);