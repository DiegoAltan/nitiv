-- Create severity level enum
CREATE TYPE public.severity_level AS ENUM ('leve', 'moderada', 'alta', 'critica');

-- Add severity_level column to student_case_records
ALTER TABLE public.student_case_records 
ADD COLUMN severity_level public.severity_level DEFAULT 'moderada';

-- Add tags column to student_case_records (free-form tags per record)
ALTER TABLE public.student_case_records
ADD COLUMN tags TEXT[] DEFAULT '{}'::TEXT[];