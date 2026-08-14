-- Add exam_stages column to courses table
-- This allows assigning a course to one or more stages (e.g., {'Quiz 2', 'End Term'})
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS exam_stages TEXT[] DEFAULT '{}'::text[];

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
