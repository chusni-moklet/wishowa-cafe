-- Jalankan HANYA kode di bawah ini di SQL Editor Anda

INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'kasir'::user_role FROM auth.users WHERE email = 'kasirwishowa@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'kasir'::user_role;

INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'admin'::user_role FROM auth.users WHERE email = 'adminwishowa@moklet.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin'::user_role;

INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'super_admin'::user_role FROM auth.users WHERE email = 'chusniarin12@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'super_admin'::user_role;
