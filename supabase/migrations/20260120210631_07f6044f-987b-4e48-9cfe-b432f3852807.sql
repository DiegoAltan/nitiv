-- Helper function: Check if user is inspector general
CREATE OR REPLACE FUNCTION public.is_inspector(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'inspector_general')
$$;

-- Helper function: Check if user is orientador
CREATE OR REPLACE FUNCTION public.is_orientador(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'orientador')
$$;

-- Helper function: Check if user has full psychosocial access (dupla or inspector)
CREATE OR REPLACE FUNCTION public.has_full_psychosocial_access(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_dupla(_user_id) OR public.is_inspector(_user_id)
$$;

-- Function to check if orientador has access to specific student (via shared_case_access)
CREATE OR REPLACE FUNCTION public.orientador_has_student_access(_orientador_user_id UUID, _student_profile_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.shared_case_access
    WHERE student_id = _student_profile_id
    AND granted_to = public.get_profile_id(_orientador_user_id)
    AND (expires_at IS NULL OR expires_at > now())
  )
$$;

-- Update RLS policies for alerts to include inspector_general and orientador
DROP POLICY IF EXISTS "Only dupla and admin can view alerts" ON public.alerts;
DROP POLICY IF EXISTS "Only dupla and admin can manage alerts" ON public.alerts;

CREATE POLICY "Authorized roles can view alerts"
  ON public.alerts FOR SELECT
  TO authenticated
  USING (
    public.is_admin(auth.uid()) OR 
    public.is_dupla(auth.uid()) OR 
    public.is_inspector(auth.uid()) OR
    (public.is_orientador(auth.uid()) AND public.orientador_has_student_access(auth.uid(), student_id))
  );

CREATE POLICY "Authorized roles can manage alerts"
  ON public.alerts FOR ALL
  TO authenticated
  USING (
    public.is_admin(auth.uid()) OR 
    public.is_dupla(auth.uid()) OR 
    public.is_inspector(auth.uid())
  );

-- Update RLS policies for student_files to include inspector_general and orientador
DROP POLICY IF EXISTS "Dupla and admin can view all student files" ON public.student_files;
DROP POLICY IF EXISTS "Only dupla can manage student files" ON public.student_files;
DROP POLICY IF EXISTS "Students can view own file status" ON public.student_files;

CREATE POLICY "Authorized roles can view all student files"
ON public.student_files FOR SELECT
USING (
  public.is_admin(auth.uid()) OR 
  public.is_dupla(auth.uid()) OR 
  public.is_inspector(auth.uid()) OR
  (public.is_orientador(auth.uid()) AND public.orientador_has_student_access(auth.uid(), student_id)) OR
  student_id = public.get_profile_id(auth.uid())
);

CREATE POLICY "Dupla and inspector can manage student files"
ON public.student_files FOR ALL
USING (public.is_dupla(auth.uid()) OR public.is_inspector(auth.uid()));

-- Update RLS policies for student_case_records
DROP POLICY IF EXISTS "Dupla and admin can view all case records" ON public.student_case_records;
DROP POLICY IF EXISTS "Dupla and admin can insert case records" ON public.student_case_records;
DROP POLICY IF EXISTS "Dupla and admin can update case records" ON public.student_case_records;
DROP POLICY IF EXISTS "Dupla and admin can delete case records" ON public.student_case_records;
DROP POLICY IF EXISTS "Users with shared access can view case records" ON public.student_case_records;

CREATE POLICY "Authorized roles can view all case records"
ON public.student_case_records
FOR SELECT
TO authenticated
USING (
  public.is_dupla(auth.uid()) OR 
  public.is_admin(auth.uid()) OR 
  public.is_inspector(auth.uid()) OR
  EXISTS (
    SELECT 1 FROM public.shared_case_access
    WHERE shared_case_access.student_id = student_case_records.student_id
    AND shared_case_access.granted_to = public.get_profile_id(auth.uid())
    AND (shared_case_access.expires_at IS NULL OR shared_case_access.expires_at > now())
  )
);

CREATE POLICY "Authorized roles can insert case records"
ON public.student_case_records
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_dupla(auth.uid()) OR 
  public.is_admin(auth.uid()) OR 
  public.is_inspector(auth.uid())
);

CREATE POLICY "Authorized roles can update case records"
ON public.student_case_records
FOR UPDATE
TO authenticated
USING (
  public.is_dupla(auth.uid()) OR 
  public.is_admin(auth.uid()) OR 
  public.is_inspector(auth.uid())
);

CREATE POLICY "Authorized roles can delete case records"
ON public.student_case_records
FOR DELETE
TO authenticated
USING (
  public.is_dupla(auth.uid()) OR 
  public.is_admin(auth.uid()) OR 
  public.is_inspector(auth.uid())
);

-- Update RLS policies for shared_case_access (dupla and inspector can grant access)
DROP POLICY IF EXISTS "Dupla and admin can view shared access" ON public.shared_case_access;
DROP POLICY IF EXISTS "Dupla and admin can insert shared access" ON public.shared_case_access;
DROP POLICY IF EXISTS "Dupla and admin can update shared access" ON public.shared_case_access;
DROP POLICY IF EXISTS "Dupla and admin can delete shared access" ON public.shared_case_access;

CREATE POLICY "Authorized roles can view shared access"
ON public.shared_case_access
FOR SELECT
TO authenticated
USING (
  public.is_dupla(auth.uid()) OR 
  public.is_admin(auth.uid()) OR 
  public.is_inspector(auth.uid()) OR 
  granted_to = public.get_profile_id(auth.uid())
);

CREATE POLICY "Dupla and inspector can insert shared access"
ON public.shared_case_access
FOR INSERT
TO authenticated
WITH CHECK (public.is_dupla(auth.uid()) OR public.is_inspector(auth.uid()));

CREATE POLICY "Dupla and inspector can update shared access"
ON public.shared_case_access
FOR UPDATE
TO authenticated
USING (public.is_dupla(auth.uid()) OR public.is_inspector(auth.uid()));

CREATE POLICY "Dupla and inspector can delete shared access"
ON public.shared_case_access
FOR DELETE
TO authenticated
USING (public.is_dupla(auth.uid()) OR public.is_inspector(auth.uid()));

-- Update file_access_logs policies
DROP POLICY IF EXISTS "Dupla and admin can view access logs" ON public.file_access_logs;
DROP POLICY IF EXISTS "Only dupla can create access logs" ON public.file_access_logs;

CREATE POLICY "Authorized roles can view access logs"
ON public.file_access_logs FOR SELECT
USING (
  public.is_admin(auth.uid()) OR 
  public.is_dupla(auth.uid()) OR 
  public.is_inspector(auth.uid())
);

CREATE POLICY "Dupla and inspector can create access logs"
ON public.file_access_logs FOR INSERT
WITH CHECK (public.is_dupla(auth.uid()) OR public.is_inspector(auth.uid()));

-- Update teacher_student_access policies
DROP POLICY IF EXISTS "Dupla and admin can manage teacher access" ON public.teacher_student_access;

CREATE POLICY "Authorized roles can manage teacher access"
ON public.teacher_student_access FOR ALL
USING (
  public.is_admin(auth.uid()) OR 
  public.is_dupla(auth.uid()) OR 
  public.is_inspector(auth.uid())
);

-- Update wellbeing_records to allow new roles to view
DROP POLICY IF EXISTS "Admin and dupla can view all wellbeing records" ON public.wellbeing_records;

CREATE POLICY "Authorized roles can view all wellbeing records"
ON public.wellbeing_records FOR SELECT
USING (
  public.is_admin(auth.uid()) OR 
  public.is_dupla(auth.uid()) OR 
  public.is_inspector(auth.uid()) OR
  (public.is_orientador(auth.uid()) AND public.orientador_has_student_access(auth.uid(), student_id))
);

-- Update teacher_evaluations to allow new roles to view
DROP POLICY IF EXISTS "Admin and dupla can view all evaluations" ON public.teacher_evaluations;

CREATE POLICY "Authorized roles can view all evaluations"
ON public.teacher_evaluations FOR SELECT
USING (
  public.is_admin(auth.uid()) OR 
  public.is_dupla(auth.uid()) OR 
  public.is_inspector(auth.uid()) OR
  (public.is_orientador(auth.uid()) AND public.orientador_has_student_access(auth.uid(), student_id))
);

-- Update profiles to allow new roles to view all profiles
DROP POLICY IF EXISTS "Admin and dupla can view all profiles" ON public.profiles;

CREATE POLICY "Authorized roles can view all profiles"
ON public.profiles FOR SELECT
USING (
  public.is_admin(auth.uid()) OR 
  public.is_dupla(auth.uid()) OR 
  public.is_inspector(auth.uid()) OR
  public.is_orientador(auth.uid())
);