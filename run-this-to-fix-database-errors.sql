-- ========================================================================
-- DATABASE SCHEMA FIX FOR SUPABASE
-- Run this block in the Supabase SQL Editor if you see:
-- "Could not find the 'cohortContent' column..." or similar schema errors.
-- ========================================================================

-- Add missing columns to courses table
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS "class_type" TEXT DEFAULT 'recorded';
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS "cohortContent" TEXT DEFAULT NULL;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS "pricing_options" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS "tags" TEXT[] DEFAULT '{}'::TEXT[];
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS "courseCategory" TEXT DEFAULT 'NONE';
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS "term" TEXT DEFAULT NULL;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS "exam_stages" TEXT[] DEFAULT '{}'::TEXT[];
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS "pricing_banner_text" TEXT DEFAULT NULL;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS "active" BOOLEAN DEFAULT true;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS "selected_class_type" TEXT DEFAULT NULL;

-- Force reload PostgREST schema cache to make columns visible immediately
NOTIFY pgrst, 'reload schema';
