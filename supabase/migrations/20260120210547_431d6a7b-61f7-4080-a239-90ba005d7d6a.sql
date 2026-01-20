-- Add new roles to the app_role enum
-- These must be committed before they can be used in functions
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'inspector_general';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'orientador';