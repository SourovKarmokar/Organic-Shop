-- Add admin role for webhutonline01@gmail.com
-- First, this user needs to be created in Supabase Auth
-- Then run this migration to assign them admin role

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE email = 'webhutonline01@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
