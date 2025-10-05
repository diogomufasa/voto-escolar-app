-- Add foto_url column to os_onze table
ALTER TABLE public.os_onze ADD COLUMN foto_url text;

-- Create storage bucket for member photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('member-photos', 'member-photos', true);

-- Create storage policies for member photos
CREATE POLICY "Member photos are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'member-photos');

CREATE POLICY "Users can upload member photos for their AE"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'member-photos' AND
  (
    EXISTS (
      SELECT 1 FROM public."AEs" ae
      WHERE ae.user_id = auth.uid()
    ) OR
    is_admin(auth.uid())
  )
);

CREATE POLICY "Users can update member photos for their AE"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'member-photos' AND
  (
    EXISTS (
      SELECT 1 FROM public."AEs" ae
      WHERE ae.user_id = auth.uid()
    ) OR
    is_admin(auth.uid())
  )
);

CREATE POLICY "Users can delete member photos for their AE"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'member-photos' AND
  (
    EXISTS (
      SELECT 1 FROM public."AEs" ae
      WHERE ae.user_id = auth.uid()
    ) OR
    is_admin(auth.uid())
  )
);