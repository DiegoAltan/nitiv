
-- Drop existing insert policy
DROP POLICY IF EXISTS "Teachers can insert climate records" ON public.classroom_climate;

-- Recreate with admin/moderador access too (for dev testing and moderador oversight)
CREATE POLICY "Teachers and staff can insert climate records"
ON public.classroom_climate FOR INSERT
TO authenticated
WITH CHECK (
  (teacher_id = get_profile_id(auth.uid())) 
  AND (is_teacher(auth.uid()) OR is_admin(auth.uid()) OR is_moderador(auth.uid()))
);

-- Also update the update policy
DROP POLICY IF EXISTS "Teachers can update climate records" ON public.classroom_climate;

CREATE POLICY "Teachers and staff can update climate records"
ON public.classroom_climate FOR UPDATE
TO authenticated
USING (
  teacher_id = get_profile_id(auth.uid()) 
  AND (is_teacher(auth.uid()) OR is_admin(auth.uid()) OR is_moderador(auth.uid()))
);
