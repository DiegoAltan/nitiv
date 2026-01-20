-- Create student_progress table for gamification
CREATE TABLE public.student_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_records INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  current_streak_weeks INTEGER DEFAULT 0,
  longest_streak_weeks INTEGER DEFAULT 0,
  last_record_week DATE,
  streak_frozen BOOLEAN DEFAULT false,
  theme_color TEXT DEFAULT 'default',
  theme_icon TEXT DEFAULT 'default',
  dashboard_style TEXT DEFAULT 'default',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create missions table for optional challenges
CREATE TABLE public.student_missions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mission_type TEXT NOT NULL,
  mission_description TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_missions ENABLE ROW LEVEL SECURITY;

-- RLS policies for student_progress - students can only see their own
CREATE POLICY "Students can view their own progress" 
ON public.student_progress 
FOR SELECT 
USING (auth.uid() IN (SELECT user_id FROM profiles WHERE id = student_id));

CREATE POLICY "Students can update their own progress" 
ON public.student_progress 
FOR UPDATE 
USING (auth.uid() IN (SELECT user_id FROM profiles WHERE id = student_id));

CREATE POLICY "Students can insert their own progress" 
ON public.student_progress 
FOR INSERT 
WITH CHECK (auth.uid() IN (SELECT user_id FROM profiles WHERE id = student_id));

-- RLS policies for student_missions
CREATE POLICY "Students can view their own missions" 
ON public.student_missions 
FOR SELECT 
USING (auth.uid() IN (SELECT user_id FROM profiles WHERE id = student_id));

CREATE POLICY "Students can update their own missions" 
ON public.student_missions 
FOR UPDATE 
USING (auth.uid() IN (SELECT user_id FROM profiles WHERE id = student_id));

CREATE POLICY "Students can insert their own missions" 
ON public.student_missions 
FOR INSERT 
WITH CHECK (auth.uid() IN (SELECT user_id FROM profiles WHERE id = student_id));

-- Trigger to update progress on wellbeing_records insert
CREATE OR REPLACE FUNCTION public.update_student_progress()
RETURNS TRIGGER AS $$
DECLARE
  current_week_start DATE;
  existing_progress student_progress%ROWTYPE;
BEGIN
  -- Get current week start (Monday)
  current_week_start := date_trunc('week', NEW.recorded_at::date)::date;
  
  -- Get or create student progress
  SELECT * INTO existing_progress 
  FROM student_progress 
  WHERE student_id = NEW.student_id;
  
  IF existing_progress.id IS NULL THEN
    -- Create new progress record
    INSERT INTO student_progress (student_id, total_records, last_record_week, current_streak_weeks)
    VALUES (NEW.student_id, 1, current_week_start, 1);
  ELSE
    -- Update existing progress
    IF existing_progress.last_record_week IS NULL OR existing_progress.last_record_week < current_week_start THEN
      -- New week, check streak
      IF existing_progress.last_record_week = current_week_start - INTERVAL '7 days' THEN
        -- Consecutive week, increment streak
        UPDATE student_progress 
        SET 
          total_records = total_records + 1,
          last_record_week = current_week_start,
          current_streak_weeks = current_streak_weeks + 1,
          longest_streak_weeks = GREATEST(longest_streak_weeks, current_streak_weeks + 1),
          streak_frozen = false,
          current_level = CASE 
            WHEN total_records + 1 >= 100 THEN 5
            WHEN total_records + 1 >= 50 THEN 4
            WHEN total_records + 1 >= 25 THEN 3
            WHEN total_records + 1 >= 10 THEN 2
            ELSE 1
          END,
          updated_at = now()
        WHERE student_id = NEW.student_id;
      ELSIF existing_progress.streak_frozen = false AND existing_progress.last_record_week < current_week_start - INTERVAL '7 days' THEN
        -- Missed week(s), freeze streak instead of resetting
        UPDATE student_progress 
        SET 
          total_records = total_records + 1,
          last_record_week = current_week_start,
          streak_frozen = true,
          current_level = CASE 
            WHEN total_records + 1 >= 100 THEN 5
            WHEN total_records + 1 >= 50 THEN 4
            WHEN total_records + 1 >= 25 THEN 3
            WHEN total_records + 1 >= 10 THEN 2
            ELSE 1
          END,
          updated_at = now()
        WHERE student_id = NEW.student_id;
      ELSE
        -- Same behavior for subsequent records
        UPDATE student_progress 
        SET 
          total_records = total_records + 1,
          last_record_week = current_week_start,
          current_level = CASE 
            WHEN total_records + 1 >= 100 THEN 5
            WHEN total_records + 1 >= 50 THEN 4
            WHEN total_records + 1 >= 25 THEN 3
            WHEN total_records + 1 >= 10 THEN 2
            ELSE 1
          END,
          updated_at = now()
        WHERE student_id = NEW.student_id;
      END IF;
    ELSE
      -- Same week, just increment total
      UPDATE student_progress 
      SET 
        total_records = total_records + 1,
        current_level = CASE 
          WHEN total_records + 1 >= 100 THEN 5
          WHEN total_records + 1 >= 50 THEN 4
          WHEN total_records + 1 >= 25 THEN 3
          WHEN total_records + 1 >= 10 THEN 2
          ELSE 1
        END,
        updated_at = now()
      WHERE student_id = NEW.student_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER on_wellbeing_record_insert
AFTER INSERT ON public.wellbeing_records
FOR EACH ROW
EXECUTE FUNCTION public.update_student_progress();

-- Create trigger for updated_at
CREATE TRIGGER update_student_progress_updated_at
BEFORE UPDATE ON public.student_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();