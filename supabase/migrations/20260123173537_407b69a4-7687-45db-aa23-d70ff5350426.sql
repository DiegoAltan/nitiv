-- Create storage bucket for activity photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('activity-photos', 'activity-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for activity photos bucket
CREATE POLICY "Anyone can view activity photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'activity-photos');

CREATE POLICY "Staff can upload activity photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'activity-photos' 
  AND (
    public.is_admin(auth.uid()) 
    OR public.is_dupla(auth.uid()) 
    OR public.is_inspector(auth.uid()) 
    OR public.is_orientador(auth.uid()) 
    OR public.is_teacher(auth.uid())
    OR public.is_moderador(auth.uid())
  )
);

CREATE POLICY "Staff can update activity photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'activity-photos' 
  AND (
    public.is_admin(auth.uid()) 
    OR public.is_dupla(auth.uid()) 
    OR public.is_inspector(auth.uid()) 
    OR public.is_orientador(auth.uid()) 
    OR public.is_teacher(auth.uid())
    OR public.is_moderador(auth.uid())
  )
);

CREATE POLICY "Staff can delete activity photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'activity-photos' 
  AND (
    public.is_admin(auth.uid()) 
    OR public.is_dupla(auth.uid()) 
    OR public.is_inspector(auth.uid()) 
    OR public.is_orientador(auth.uid()) 
    OR public.is_teacher(auth.uid())
    OR public.is_moderador(auth.uid())
  )
);

-- Create table for activity notifications
CREATE TABLE IF NOT EXISTS public.activity_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id UUID NOT NULL REFERENCES public.school_activities(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_activity_notifications_student ON public.activity_notifications(student_id, is_read);

-- Enable RLS
ALTER TABLE public.activity_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Students can view their own notifications"
ON public.activity_notifications FOR SELECT
USING (student_id = public.get_profile_id(auth.uid()));

CREATE POLICY "Students can update their own notifications"
ON public.activity_notifications FOR UPDATE
USING (student_id = public.get_profile_id(auth.uid()));

CREATE POLICY "Staff can manage notifications"
ON public.activity_notifications FOR ALL
USING (
  public.is_admin(auth.uid()) 
  OR public.is_dupla(auth.uid()) 
  OR public.is_inspector(auth.uid())
  OR public.is_moderador(auth.uid())
);

-- Function to create notifications for students when activity is created
CREATE OR REPLACE FUNCTION public.notify_students_of_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only notify for upcoming activities
  IF NEW.is_upcoming = true THEN
    -- If activity is for a specific course, notify students in that course
    IF NEW.course_id IS NOT NULL THEN
      INSERT INTO public.activity_notifications (activity_id, student_id)
      SELECT NEW.id, sc.student_id
      FROM public.student_courses sc
      WHERE sc.course_id = NEW.course_id;
    ELSE
      -- Notify all students (those with student role)
      INSERT INTO public.activity_notifications (activity_id, student_id)
      SELECT NEW.id, p.id
      FROM public.profiles p
      JOIN public.user_roles ur ON ur.user_id = p.user_id
      WHERE ur.role = 'estudiante';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for notifications
CREATE TRIGGER trigger_notify_students_of_activity
AFTER INSERT ON public.school_activities
FOR EACH ROW
EXECUTE FUNCTION public.notify_students_of_activity();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_notifications;