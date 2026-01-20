-- Eliminar la foreign key constraint de user_roles.user_id a auth.users para permitir datos de prueba
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;