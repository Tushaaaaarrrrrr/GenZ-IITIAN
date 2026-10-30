-- Run in Supabase SQL editor. Supports API-issued partner coupons.
ALTER TABLE public.discount_coupons
ADD COLUMN IF NOT EXISTS partner_id TEXT,
ADD COLUMN IF NOT EXISTS issued_to_email TEXT;

CREATE INDEX IF NOT EXISTS idx_discount_coupons_partner_email
  ON public.discount_coupons (partner_id, issued_to_email);
