-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM (
  'administrador',
  'psicologo',
  'trabajador_social',
  'docente',
  'estudiante'
);

-- Create institutions table
CREATE TABLE public.institutions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create courses table
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  level TEXT NOT NULL,
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM now()),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create student_courses (link students to their course)
CREATE TABLE public.student_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, course_id)
);

-- Create teacher_courses (link teachers to their assigned courses)
CREATE TABLE public.teacher_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(teacher_id, course_id)
);

-- Create wellbeing_records (student self-reports)
CREATE TABLE public.wellbeing_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  wellbeing_level INTEGER NOT NULL CHECK (wellbeing_level BETWEEN 1 AND 5),
  emotions TEXT[] DEFAULT '{}',
  comment TEXT,
  recorded_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, recorded_at)
);

-- Create teacher_evaluations
CREATE TABLE public.teacher_evaluations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  evaluation_level TEXT NOT NULL CHECK (evaluation_level IN ('bajo', 'medio', 'alto')),
  observations TEXT,
  evaluated_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, teacher_id, evaluated_at)
);

-- Create alerts table
CREATE TABLE public.alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('bienestar_bajo', 'discrepancia', 'sostenido_bajo')),
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'nueva' CHECK (status IN ('nueva', 'en_revision', 'resuelta')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Create user_preferences table
CREATE TABLE public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  theme TEXT NOT NULL DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
  notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  weekly_summary BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wellbeing_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Helper function: Check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'administrador')
$$;

-- Helper function: Check if user is dupla psicosocial (psychologist or social worker)
CREATE OR REPLACE FUNCTION public.is_dupla(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'psicologo') OR public.has_role(_user_id, 'trabajador_social')
$$;

-- Helper function: Check if user is teacher
CREATE OR REPLACE FUNCTION public.is_teacher(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'docente')
$$;

-- Helper function: Check if user is student
CREATE OR REPLACE FUNCTION public.is_student(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'estudiante')
$$;

-- Helper function: Get user's profile ID
CREATE OR REPLACE FUNCTION public.get_profile_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.profiles WHERE user_id = _user_id LIMIT 1
$$;

-- Helper function: Get user's institution ID
CREATE OR REPLACE FUNCTION public.get_institution_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT institution_id FROM public.profiles WHERE user_id = _user_id LIMIT 1
$$;

-- Helper function: Check if teacher has access to student (same course)
CREATE OR REPLACE FUNCTION public.teacher_has_student_access(_teacher_user_id UUID, _student_profile_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.teacher_courses tc
    JOIN public.student_courses sc ON tc.course_id = sc.course_id
    WHERE tc.teacher_id = public.get_profile_id(_teacher_user_id)
    AND sc.student_id = _student_profile_id
  )
$$;

-- RLS Policies for institutions
CREATE POLICY "Authenticated users can view institutions"
  ON public.institutions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage institutions"
  ON public.institutions FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- RLS Policies for courses
CREATE POLICY "Authenticated users can view courses"
  ON public.courses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage courses"
  ON public.courses FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admin and dupla can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()) OR public.is_dupla(auth.uid()));

CREATE POLICY "Teachers can view students in their courses"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    public.is_teacher(auth.uid()) AND 
    public.teacher_has_student_access(auth.uid(), id)
  );

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Allow profile creation on signup"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- RLS Policies for student_courses
CREATE POLICY "Authenticated users can view student courses"
  ON public.student_courses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage student courses"
  ON public.student_courses FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- RLS Policies for teacher_courses
CREATE POLICY "Authenticated users can view teacher courses"
  ON public.teacher_courses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage teacher courses"
  ON public.teacher_courses FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- RLS Policies for wellbeing_records
CREATE POLICY "Students can view own wellbeing records"
  ON public.wellbeing_records FOR SELECT
  TO authenticated
  USING (student_id = public.get_profile_id(auth.uid()));

CREATE POLICY "Admin and dupla can view all wellbeing records"
  ON public.wellbeing_records FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()) OR public.is_dupla(auth.uid()));

CREATE POLICY "Teachers can view students in their courses wellbeing"
  ON public.wellbeing_records FOR SELECT
  TO authenticated
  USING (
    public.is_teacher(auth.uid()) AND 
    public.teacher_has_student_access(auth.uid(), student_id)
  );

CREATE POLICY "Students can insert own wellbeing records"
  ON public.wellbeing_records FOR INSERT
  TO authenticated
  WITH CHECK (student_id = public.get_profile_id(auth.uid()));

CREATE POLICY "Students can update own wellbeing records"
  ON public.wellbeing_records FOR UPDATE
  TO authenticated
  USING (student_id = public.get_profile_id(auth.uid()));

-- RLS Policies for teacher_evaluations
CREATE POLICY "Students can view own evaluations"
  ON public.teacher_evaluations FOR SELECT
  TO authenticated
  USING (student_id = public.get_profile_id(auth.uid()));

CREATE POLICY "Teachers can view and manage their evaluations"
  ON public.teacher_evaluations FOR ALL
  TO authenticated
  USING (teacher_id = public.get_profile_id(auth.uid()));

CREATE POLICY "Admin and dupla can view all evaluations"
  ON public.teacher_evaluations FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()) OR public.is_dupla(auth.uid()));

-- RLS Policies for alerts (ONLY dupla and admin)
CREATE POLICY "Only dupla and admin can view alerts"
  ON public.alerts FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()) OR public.is_dupla(auth.uid()));

CREATE POLICY "Only dupla and admin can manage alerts"
  ON public.alerts FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()) OR public.is_dupla(auth.uid()));

-- RLS Policies for user_preferences
CREATE POLICY "Users can view own preferences"
  ON public.user_preferences FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own preferences"
  ON public.user_preferences FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Trigger function to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply update triggers
CREATE TRIGGER update_institutions_updated_at
  BEFORE UPDATE ON public.institutions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to automatically create alert when wellbeing is low
CREATE OR REPLACE FUNCTION public.check_wellbeing_and_create_alert()
RETURNS TRIGGER AS $$
DECLARE
  recent_low_count INTEGER;
  existing_alert_count INTEGER;
BEGIN
  -- Check for sustained low wellbeing (3 or more records with level <= 2 in last 7 days)
  SELECT COUNT(*) INTO recent_low_count
  FROM public.wellbeing_records
  WHERE student_id = NEW.student_id
  AND wellbeing_level <= 2
  AND recorded_at >= CURRENT_DATE - INTERVAL '7 days';

  -- Check if an unresolved alert already exists
  SELECT COUNT(*) INTO existing_alert_count
  FROM public.alerts
  WHERE student_id = NEW.student_id
  AND status != 'resuelta'
  AND alert_type = 'sostenido_bajo';

  -- Create alert if sustained low wellbeing and no existing alert
  IF recent_low_count >= 3 AND existing_alert_count = 0 THEN
    INSERT INTO public.alerts (student_id, alert_type, description)
    VALUES (NEW.student_id, 'sostenido_bajo', 'Bienestar bajo sostenido: 3 o más registros con nivel bajo en los últimos 7 días');
  -- Create immediate alert for very low wellbeing
  ELSIF NEW.wellbeing_level = 1 AND existing_alert_count = 0 THEN
    INSERT INTO public.alerts (student_id, alert_type, description)
    VALUES (NEW.student_id, 'bienestar_bajo', 'Alerta inmediata: Estudiante reportó nivel de bienestar muy bajo (1)');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for automatic alerts
CREATE TRIGGER trigger_wellbeing_alert
  AFTER INSERT ON public.wellbeing_records
  FOR EACH ROW EXECUTE FUNCTION public.check_wellbeing_and_create_alert();

-- Function to check discrepancy between student and teacher evaluations
CREATE OR REPLACE FUNCTION public.check_evaluation_discrepancy()
RETURNS TRIGGER AS $$
DECLARE
  student_wellbeing INTEGER;
  existing_alert_count INTEGER;
BEGIN
  -- Get the most recent student wellbeing for the same day
  SELECT wellbeing_level INTO student_wellbeing
  FROM public.wellbeing_records
  WHERE student_id = NEW.student_id
  AND recorded_at = NEW.evaluated_at
  ORDER BY created_at DESC
  LIMIT 1;

  -- Check if discrepancy exists (student says high but teacher says low, or vice versa)
  IF student_wellbeing IS NOT NULL THEN
    SELECT COUNT(*) INTO existing_alert_count
    FROM public.alerts
    WHERE student_id = NEW.student_id
    AND status != 'resuelta'
    AND alert_type = 'discrepancia';

    -- High discrepancy: student >= 4 but teacher says 'bajo', or student <= 2 but teacher says 'alto'
    IF existing_alert_count = 0 AND (
      (student_wellbeing >= 4 AND NEW.evaluation_level = 'bajo') OR
      (student_wellbeing <= 2 AND NEW.evaluation_level = 'alto')
    ) THEN
      INSERT INTO public.alerts (student_id, alert_type, description)
      VALUES (NEW.student_id, 'discrepancia', 'Discrepancia significativa entre autoevaluación del estudiante y evaluación docente');
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for discrepancy alerts
CREATE TRIGGER trigger_evaluation_discrepancy
  AFTER INSERT ON public.teacher_evaluations
  FOR EACH ROW EXECUTE FUNCTION public.check_evaluation_discrepancy();

-- Create indexes for performance
CREATE INDEX idx_wellbeing_records_student_date ON public.wellbeing_records(student_id, recorded_at);
CREATE INDEX idx_teacher_evaluations_student_date ON public.teacher_evaluations(student_id, evaluated_at);
CREATE INDEX idx_alerts_student_status ON public.alerts(student_id, status);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_student_courses_student ON public.student_courses(student_id);
CREATE INDEX idx_teacher_courses_teacher ON public.teacher_courses(teacher_id);