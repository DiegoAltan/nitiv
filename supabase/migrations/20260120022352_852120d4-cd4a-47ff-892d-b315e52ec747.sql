-- Create student_case_records table for dupla psicosocial
CREATE TABLE public.student_case_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  record_type TEXT NOT NULL, -- 'conducta', 'atencion', 'cita', 'observacion', 'seguimiento'
  title TEXT NOT NULL,
  description TEXT,
  date_recorded DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.student_case_records ENABLE ROW LEVEL SECURITY;

-- Only dupla psicosocial can view case records
CREATE POLICY "Dupla can view all case records"
ON public.student_case_records
FOR SELECT
TO authenticated
USING (public.is_dupla(auth.uid()));

-- Only dupla can insert case records
CREATE POLICY "Dupla can insert case records"
ON public.student_case_records
FOR INSERT
TO authenticated
WITH CHECK (public.is_dupla(auth.uid()));

-- Only dupla can update case records
CREATE POLICY "Dupla can update case records"
ON public.student_case_records
FOR UPDATE
TO authenticated
USING (public.is_dupla(auth.uid()));

-- Only dupla can delete case records
CREATE POLICY "Dupla can delete case records"
ON public.student_case_records
FOR DELETE
TO authenticated
USING (public.is_dupla(auth.uid()));

-- Create shared_case_access table for granting access to other roles
CREATE TABLE public.shared_case_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  granted_to UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  granted_by UUID NOT NULL,
  access_type TEXT NOT NULL DEFAULT 'view', -- 'view', 'full'
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, granted_to)
);

-- Enable Row Level Security
ALTER TABLE public.shared_case_access ENABLE ROW LEVEL SECURITY;

-- Only dupla can manage shared access
CREATE POLICY "Dupla can view shared access"
ON public.shared_case_access
FOR SELECT
TO authenticated
USING (public.is_dupla(auth.uid()) OR granted_to = public.get_profile_id(auth.uid()));

CREATE POLICY "Dupla can insert shared access"
ON public.shared_case_access
FOR INSERT
TO authenticated
WITH CHECK (public.is_dupla(auth.uid()));

CREATE POLICY "Dupla can update shared access"
ON public.shared_case_access
FOR UPDATE
TO authenticated
USING (public.is_dupla(auth.uid()));

CREATE POLICY "Dupla can delete shared access"
ON public.shared_case_access
FOR DELETE
TO authenticated
USING (public.is_dupla(auth.uid()));

-- Create trigger to update updated_at
CREATE TRIGGER update_student_case_records_updated_at
BEFORE UPDATE ON public.student_case_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Teachers/others with shared access can view case records
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