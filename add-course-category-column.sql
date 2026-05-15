-- Add courseCategory column to courses table for marketing/course type classification
-- Allows managers to mark courses as QUALIFIER, LIVE, RECORDED, or NONE

ALTER TABLE public.courses
ADD COLUMN IF NOT EXISTS "courseCategory" TEXT DEFAULT 'NONE';

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_courses_category ON public.courses("courseCategory");
