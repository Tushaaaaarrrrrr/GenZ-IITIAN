-- Adds bundleDiscountAmount column to store bundle discount (in ₹ off)
ALTER TABLE public.courses
ADD COLUMN IF NOT EXISTS "bundleDiscountAmount" INTEGER;
