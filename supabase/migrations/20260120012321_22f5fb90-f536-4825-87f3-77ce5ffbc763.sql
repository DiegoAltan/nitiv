-- Add anxiety_level and stress_level columns to wellbeing_records table
ALTER TABLE public.wellbeing_records
ADD COLUMN anxiety_level INTEGER CHECK (anxiety_level >= 1 AND anxiety_level <= 10),
ADD COLUMN stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10);

-- Enable realtime for alerts table
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;