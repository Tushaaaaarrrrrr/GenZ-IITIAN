-- Add tags column to courses table
-- This allows storing up to two promotional tags (e.g., SALE, NEW, BESTSELLER)
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS tags text[];

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
