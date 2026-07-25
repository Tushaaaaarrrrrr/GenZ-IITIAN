-- Stores how bundle discount codes unlock:
-- all = whole pack only, any = any N selected courses.
ALTER TABLE public.courses
ADD COLUMN IF NOT EXISTS "bundleDiscountMode" TEXT DEFAULT 'all',
ADD COLUMN IF NOT EXISTS "bundleDiscountMinCourses" INTEGER DEFAULT 3;
