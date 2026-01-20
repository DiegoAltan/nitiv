-- Drop existing policies
DROP POLICY IF EXISTS "Dupla can view all case records" ON public.student_case_records;
DROP POLICY IF EXISTS "Dupla can insert case records" ON public.student_case_records;
DROP POLICY IF EXISTS "Dupla can update case records" ON public.student_case_records;
DROP POLICY IF EXISTS "Dupla can delete case records" ON public.student_case_records;
DROP POLICY IF EXISTS "Users with shared access can view case records" ON public.student_case_records;

-- Recreate policies including admins
CREATE POLICY "Dupla and admin can view all case records"
ON public.student_case_records
FOR SELECT
TO authenticated
USING (public.is_dupla(auth.uid()) OR public.is_admin(auth.uid()));

CREATE POLICY "Dupla and admin can insert case records"
ON public.student_case_records
FOR INSERT
TO authenticated
WITH CHECK (public.is_dupla(auth.uid()) OR public.is_admin(auth.uid()));

CREATE POLICY "Dupla and admin can update case records"
ON public.student_case_records
FOR UPDATE
TO authenticated
USING (public.is_dupla(auth.uid()) OR public.is_admin(auth.uid()));

CREATE POLICY "Dupla and admin can delete case records"
ON public.student_case_records
FOR DELETE
TO authenticated
USING (public.is_dupla(auth.uid()) OR public.is_admin(auth.uid()));

-- Keep shared access policy for teachers
CREATE POLICY "Users with shared access can view case records"
ON public.student_case_records
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.shared_case_access
    WHERE shared_case_access.student_id = student_case_records.student_id
    AND shared_case_access.granted_to = public.get_profile_id(auth.uid())
    AND (shared_case_access.expires_at IS NULL OR shared_case_access.expires_at > now())
  )
);

-- Update shared_case_access policies to include admin
DROP POLICY IF EXISTS "Dupla can view shared access" ON public.shared_case_access;
DROP POLICY IF EXISTS "Dupla can insert shared access" ON public.shared_case_access;
DROP POLICY IF EXISTS "Dupla can update shared access" ON public.shared_case_access;
DROP POLICY IF EXISTS "Dupla can delete shared access" ON public.shared_case_access;

CREATE POLICY "Dupla and admin can view shared access"
ON public.shared_case_access
FOR SELECT
TO authenticated
USING (public.is_dupla(auth.uid()) OR public.is_admin(auth.uid()) OR granted_to = public.get_profile_id(auth.uid()));

CREATE POLICY "Dupla and admin can insert shared access"
ON public.shared_case_access
FOR INSERT
TO authenticated
WITH CHECK (public.is_dupla(auth.uid()) OR public.is_admin(auth.uid()));

CREATE POLICY "Dupla and admin can update shared access"
ON public.shared_case_access
FOR UPDATE
TO authenticated
USING (public.is_dupla(auth.uid()) OR public.is_admin(auth.uid()));

CREATE POLICY "Dupla and admin can delete shared access"
ON public.shared_case_access
FOR DELETE
TO authenticated
USING (public.is_dupla(auth.uid()) OR public.is_admin(auth.uid()));