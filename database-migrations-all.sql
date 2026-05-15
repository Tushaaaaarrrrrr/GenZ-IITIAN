-- ========================================================================
-- DATABASE MIGRATIONS - MULTI-PRICING & COURSE CATEGORY
-- Paste this ENTIRE block into the Supabase SQL Editor and click Run.
-- ========================================================================

-- 1. Add pricing_options column to courses table for multi-tier pricing support
-- This enables fixed bundle courses to have multiple pricing tiers (live/recorded classes)
ALTER TABLE public.courses
ADD COLUMN IF NOT EXISTS "pricing_options" JSONB DEFAULT '[]'::jsonb;

-- Create an index for better query performance on the pricing_options column
CREATE INDEX IF NOT EXISTS idx_courses_pricing_options ON public.courses USING GIN ("pricing_options");

-- 2. Add courseCategory column to courses table for marketing/course type classification
-- Allows managers to mark courses as QUALIFIER, LIVE, RECORDED, or NONE
ALTER TABLE public.courses
ADD COLUMN IF NOT EXISTS "courseCategory" TEXT DEFAULT 'NONE';

-- Create an index for better query performance on courseCategory
CREATE INDEX IF NOT EXISTS idx_courses_category ON public.courses("courseCategory");

-- ========================================================================
-- MIGRATIONS COMPLETE
-- ========================================================================
