-- Add pricing_options column to courses table for multi-tier pricing support
-- This enables fixed bundle courses to have multiple pricing tiers (live/recorded classes)

ALTER TABLE public.courses
ADD COLUMN IF NOT EXISTS "pricing_options" JSONB DEFAULT '[]'::jsonb;

-- Create an index for better query performance on the pricing_options column
CREATE INDEX IF NOT EXISTS idx_courses_pricing_options ON public.courses USING GIN ("pricing_options");
