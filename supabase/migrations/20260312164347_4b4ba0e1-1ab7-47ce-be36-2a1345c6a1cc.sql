
-- Create classroom climate table
CREATE TABLE public.classroom_climate (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  climate_level TEXT NOT NULL,
  energy_level TEXT NOT NULL,
  participation_level TEXT NOT NULL,
  conflict_present BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  recorded_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(teacher_id, course_id, recorded_at)
);

-- Enable RLS
ALTER TABLE public.classroom_climate ENABLE ROW LEVEL SECURITY;

-- Teachers can insert their own climate records
CREATE POLICY "Teachers can insert climate records"
ON public.classroom_climate
FOR INSERT
TO authenticated
WITH CHECK (teacher_id = public.get_profile_id(auth.uid()) AND public.is_teacher(auth.uid()));

-- Teachers can update their own climate records
CREATE POLICY "Teachers can update climate records"
ON public.classroom_climate
FOR UPDATE
TO authenticated
USING (teacher_id = public.get_profile_id(auth.uid()));

-- Teachers can view their own climate records
CREATE POLICY "Teachers can view own climate records"
ON public.classroom_climate
FOR SELECT
TO authenticated
USING (teacher_id = public.get_profile_id(auth.uid()));

-- Non-student staff can view all climate records
CREATE POLICY "Staff can view all climate records"
ON public.classroom_climate
FOR SELECT
TO authenticated
USING (
  public.is_admin(auth.uid()) OR 
  public.is_dupla(auth.uid()) OR 
  public.is_inspector(auth.uid()) OR 
  public.is_orientador(auth.uid()) OR 
  public.is_moderador(auth.uid())
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.classroom_climate;
