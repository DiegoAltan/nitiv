-- Step 2: Create function to check if user is moderador
CREATE OR REPLACE FUNCTION public.is_moderador(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT public.has_role(_user_id, 'moderador')
$$;

-- Create function to auto-assign moderador role on signup for specific email
CREATE OR REPLACE FUNCTION public.auto_assign_moderador()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Auto-assign moderador role for the owner email
  IF NEW.email = 'diegoarancibia.b24@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'moderador')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for auto-assignment on profile creation
DROP TRIGGER IF EXISTS auto_assign_moderador_trigger ON public.profiles;
CREATE TRIGGER auto_assign_moderador_trigger
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.auto_assign_moderador();

-- Assign moderador role to existing user with this email (if exists)
INSERT INTO public.user_roles (user_id, role)
SELECT p.user_id, 'moderador'::app_role
FROM public.profiles p
WHERE p.email = 'diegoarancibia.b24@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;