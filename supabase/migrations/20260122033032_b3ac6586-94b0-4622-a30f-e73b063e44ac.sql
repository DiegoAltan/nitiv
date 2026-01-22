-- Table for school activities/workshops
CREATE TABLE public.school_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  activity_date DATE NOT NULL,
  activity_time TIME,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL DEFAULT 'interna' CHECK (activity_type IN ('interna', 'externa', 'conjunta')),
  organizers TEXT[] NOT NULL DEFAULT '{}',
  photo_urls TEXT[] DEFAULT '{}',
  is_upcoming BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for student activity ratings
CREATE TABLE public.activity_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id UUID NOT NULL REFERENCES public.school_activities(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(activity_id, student_id)
);

-- Enable RLS
ALTER TABLE public.school_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for school_activities
CREATE POLICY "Everyone can view activities"
ON public.school_activities
FOR SELECT
USING (true);

CREATE POLICY "Staff can manage activities"
ON public.school_activities
FOR ALL
USING (
  is_admin(auth.uid()) OR 
  is_dupla(auth.uid()) OR 
  is_inspector(auth.uid()) OR 
  is_orientador(auth.uid()) OR
  is_teacher(auth.uid()) OR
  is_moderador(auth.uid())
);

-- RLS Policies for activity_ratings
CREATE POLICY "Everyone can view ratings"
ON public.activity_ratings
FOR SELECT
USING (true);

CREATE POLICY "Students can rate activities"
ON public.activity_ratings
FOR INSERT
WITH CHECK (
  is_student(auth.uid()) AND 
  student_id = get_profile_id(auth.uid())
);

CREATE POLICY "Students can update own ratings"
ON public.activity_ratings
FOR UPDATE
USING (student_id = get_profile_id(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_school_activities_updated_at
BEFORE UPDATE ON public.school_activities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample activities with mock data
INSERT INTO public.school_activities (title, description, activity_date, activity_time, activity_type, organizers, is_upcoming, created_by, photo_urls)
VALUES 
  ('Taller de Resolución de Conflictos', 'Taller práctico para enseñar técnicas de mediación y resolución pacífica de conflictos entre estudiantes.', '2026-01-15', '10:00', 'interna', ARRAY['Dupla Psicosocial', 'Orientador'], false, '00000000-0000-0000-0000-000000000000', ARRAY[]::text[]),
  ('Charla sobre Bullying y Ciberbullying', 'Charla educativa sobre prevención del acoso escolar y uso responsable de redes sociales.', '2026-01-18', '14:30', 'externa', ARRAY['Inspector General', 'Profesional Externo'], false, '00000000-0000-0000-0000-000000000000', ARRAY[]::text[]),
  ('Jornada de Convivencia Escolar', 'Actividad recreativa para fortalecer vínculos entre estudiantes de diferentes cursos.', '2026-01-25', '09:00', 'conjunta', ARRAY['Administración', 'Dupla Psicosocial', 'Orientador'], true, '00000000-0000-0000-0000-000000000000', ARRAY[]::text[]);

-- Insert mock ratings for past activities (simulating student votes)
-- Get the activity IDs and insert ratings
DO $$
DECLARE
  activity1_id UUID;
  activity2_id UUID;
BEGIN
  SELECT id INTO activity1_id FROM public.school_activities WHERE title = 'Taller de Resolución de Conflictos' LIMIT 1;
  SELECT id INTO activity2_id FROM public.school_activities WHERE title = 'Charla sobre Bullying y Ciberbullying' LIMIT 1;
  
  -- Insert mock ratings using random UUIDs for student_id (simulated)
  IF activity1_id IS NOT NULL THEN
    INSERT INTO public.activity_ratings (activity_id, student_id, rating) VALUES
      (activity1_id, gen_random_uuid(), 5),
      (activity1_id, gen_random_uuid(), 4),
      (activity1_id, gen_random_uuid(), 5),
      (activity1_id, gen_random_uuid(), 4),
      (activity1_id, gen_random_uuid(), 5);
  END IF;
  
  IF activity2_id IS NOT NULL THEN
    INSERT INTO public.activity_ratings (activity_id, student_id, rating) VALUES
      (activity2_id, gen_random_uuid(), 4),
      (activity2_id, gen_random_uuid(), 3),
      (activity2_id, gen_random_uuid(), 5),
      (activity2_id, gen_random_uuid(), 4);
  END IF;
END $$;