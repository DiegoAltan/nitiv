-- Step 1: Add moderador role to the enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'moderador';