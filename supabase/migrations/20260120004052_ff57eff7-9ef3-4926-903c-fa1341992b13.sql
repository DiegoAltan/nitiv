-- Create enum for student file access status
CREATE TYPE public.file_access_status AS ENUM ('abierta', 'restringida', 'confidencial');

-- Create student files table to manage access permissions
CREATE TABLE public.student_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  access_status file_access_status NOT NULL DEFAULT 'abierta',
  restricted_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id)
);

-- Create table to log permission changes
CREATE TABLE public.file_access_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_file_id UUID NOT NULL REFERENCES public.student_files(id) ON DELETE CASCADE,
  changed_by UUID NOT NULL,
  previous_status file_access_status,
  new_status file_access_status NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for teacher access authorizations (for specific students)
CREATE TABLE public.teacher_student_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  granted_by UUID NOT NULL,
  access_level TEXT NOT NULL DEFAULT 'basic', -- 'basic' = indicators only, 'extended' = more details
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(teacher_id, student_id)
);

-- Enable RLS on all new tables
ALTER TABLE public.student_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_student_access ENABLE ROW LEVEL SECURITY;

-- RLS Policies for student_files
-- Only dupla and admin can view all student files
CREATE POLICY "Dupla and admin can view all student files"
ON public.student_files FOR SELECT
USING (is_admin(auth.uid()) OR is_dupla(auth.uid()));

-- Only dupla can manage student files (change access status)
CREATE POLICY "Only dupla can manage student files"
ON public.student_files FOR ALL
USING (is_dupla(auth.uid()));

-- Students can view their own file status
CREATE POLICY "Students can view own file status"
ON public.student_files FOR SELECT
USING (student_id = get_profile_id(auth.uid()));

-- RLS Policies for file_access_logs
CREATE POLICY "Dupla and admin can view access logs"
ON public.file_access_logs FOR SELECT
USING (is_admin(auth.uid()) OR is_dupla(auth.uid()));

CREATE POLICY "Only dupla can create access logs"
ON public.file_access_logs FOR INSERT
WITH CHECK (is_dupla(auth.uid()));

-- RLS Policies for teacher_student_access
CREATE POLICY "Dupla and admin can manage teacher access"
ON public.teacher_student_access FOR ALL
USING (is_admin(auth.uid()) OR is_dupla(auth.uid()));

CREATE POLICY "Teachers can view their own access grants"
ON public.teacher_student_access FOR SELECT
USING (teacher_id = get_profile_id(auth.uid()));

-- Create function to check if teacher has extended access to a student
CREATE OR REPLACE FUNCTION public.teacher_has_extended_access(_teacher_user_id uuid, _student_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.teacher_student_access
    WHERE teacher_id = get_profile_id(_teacher_user_id)
    AND student_id = _student_profile_id
    AND access_level = 'extended'
    AND (expires_at IS NULL OR expires_at > now())
  )
$$;

-- Create function to get student file access status
CREATE OR REPLACE FUNCTION public.get_student_file_status(_student_profile_id uuid)
RETURNS file_access_status
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT access_status FROM public.student_files WHERE student_id = _student_profile_id LIMIT 1),
    'abierta'::file_access_status
  )
$$;

-- Trigger to update updated_at
CREATE TRIGGER update_student_files_updated_at
BEFORE UPDATE ON public.student_files
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to log access status changes
CREATE OR REPLACE FUNCTION public.log_file_access_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.access_status IS DISTINCT FROM NEW.access_status THEN
    INSERT INTO public.file_access_logs (student_file_id, changed_by, previous_status, new_status, reason)
    VALUES (NEW.id, auth.uid(), OLD.access_status, NEW.access_status, NEW.restricted_reason);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER log_file_access_status_change
AFTER UPDATE ON public.student_files
FOR EACH ROW
EXECUTE FUNCTION public.log_file_access_change();