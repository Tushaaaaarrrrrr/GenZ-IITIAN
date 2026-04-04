-- Bundle Discount System Migration
-- Adds bundleDiscountPrice and bundleDiscountCode columns to the courses table
-- These are used for server-side validated bundle discounts

ALTER TABLE courses ADD COLUMN IF NOT EXISTS "bundleDiscountPrice" integer;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS "bundleDiscountCode" text;

-- Verify
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'courses' AND column_name IN ('bundleDiscountPrice', 'bundleDiscountCode');
