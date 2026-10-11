-- Adds max_discount_amount column to limit maximum discount (in ₹) that a user can get
-- e.g. for a 15% off coupon, cap savings at ₹100 or ₹1000
ALTER TABLE public.discount_coupons
ADD COLUMN IF NOT EXISTS max_discount_amount INTEGER;
