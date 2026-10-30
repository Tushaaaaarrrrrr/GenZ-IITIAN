-- Stop browsers (anon/authenticated students) from reading discount_coupons.
-- Coupons are now validated by /api/validate-coupon and /api/create-order using the service role.
-- Managers keep full access. RUN THIS ONLY AFTER the new frontend + API are deployed,
-- otherwise the old cart's "apply code" will stop working.
DROP POLICY IF EXISTS "coupons_select" ON public.discount_coupons;
DROP POLICY IF EXISTS "Enable read access for all users on discount_coupons" ON public.discount_coupons;
DROP POLICY IF EXISTS "Enable all access for service role on discount_coupons" ON public.discount_coupons;
DROP POLICY IF EXISTS "Allow all operations for authenticated users (Manager) on discount_coupons" ON public.discount_coupons;

CREATE POLICY "coupons_select" ON public.discount_coupons FOR SELECT
  USING (public.is_manager() OR (auth.jwt() ->> 'role') = 'service_role');
-- "coupons_write_manager" (FOR ALL, manager/service_role) from fix-security-rls.sql stays as is.
