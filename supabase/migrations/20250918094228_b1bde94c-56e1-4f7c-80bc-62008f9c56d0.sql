-- Add your user as admin
INSERT INTO public.user_roles (user_id, role) VALUES 
  ('e0099cb6-14ad-42c8-9b44-d5816a35f0c7', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

-- Remove the placeholder admin user
DELETE FROM public.user_roles WHERE user_id = '00000000-0000-0000-0000-000000000000';