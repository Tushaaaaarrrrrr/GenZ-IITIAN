-- Add pricing_banner_text column to courses table for pricing tier context banner
ALTER TABLE public.courses
ADD COLUMN IF NOT EXISTS "pricing_banner_text" TEXT DEFAULT NULL;
