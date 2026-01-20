-- Eliminar la foreign key constraint de profiles.user_id a auth.users para permitir datos de prueba
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- Crear los cursos faltantes
INSERT INTO public.courses (id, name, level, institution_id)
VALUES 
  ('22222222-2222-2222-2222-222222222224', '6°A', 'Sexto Básico', '11111111-1111-1111-1111-111111111111'),
  ('22222222-2222-2222-2222-222222222225', '6°B', 'Sexto Básico', '11111111-1111-1111-1111-111111111111'),
  ('22222222-2222-2222-2222-222222222226', '7°B', 'Séptimo Básico', '11111111-1111-1111-1111-111111111111')
ON CONFLICT (id) DO NOTHING;