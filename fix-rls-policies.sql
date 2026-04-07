-- ========================================
-- NUCLEAR FIX: Run ONLY this. Nothing else.
-- Paste into Supabase SQL Editor → Run
-- ========================================

-- ===== PROFILES TABLE =====
-- Profiles should NOT have restrictive RLS (it's used for login sync)
-- If RLS was accidentally enabled, these policies ensure it still works
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Let every authenticated user read/write their own profile
DROP POLICY IF EXISTS "Users can manage own profile" ON public.profiles;
CREATE POLICY "Users can manage own profile"
  ON public.profiles FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Managers can see all profiles
DROP POLICY IF EXISTS "Managers can view all profiles" ON public.profiles;
CREATE POLICY "Managers can view all profiles"
  ON public.profiles FOR SELECT
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'MANAGER');

-- Service role (backend) full access on profiles
DROP POLICY IF EXISTS "Service role full access on profiles" ON public.profiles;
CREATE POLICY "Service role full access on profiles"
  ON public.profiles FOR ALL
  USING (true)
  WITH CHECK (true);

-- ===== REFERRAL PROFILES =====
ALTER TABLE public.referral_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own referral profile" ON public.referral_profiles;
CREATE POLICY "Users can read own referral profile"
  ON public.referral_profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Authenticated can read referral profiles" ON public.referral_profiles;
CREATE POLICY "Authenticated can read referral profiles"
  ON public.referral_profiles FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Service role full access on referral_profiles" ON public.referral_profiles;
CREATE POLICY "Service role full access on referral_profiles"
  ON public.referral_profiles FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Managers can view all referral profiles" ON public.referral_profiles;
CREATE POLICY "Managers can view all referral profiles"
  ON public.referral_profiles FOR SELECT
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'MANAGER');

-- ===== REFERRAL TRANSACTIONS =====
ALTER TABLE public.referral_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own referral transactions" ON public.referral_transactions;
CREATE POLICY "Users can read own referral transactions"
  ON public.referral_transactions FOR SELECT
  USING (
    referrer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR buyer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Service role full access on referral_transactions" ON public.referral_transactions;
CREATE POLICY "Service role full access on referral_transactions"
  ON public.referral_transactions FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Managers can view all referral transactions" ON public.referral_transactions;
CREATE POLICY "Managers can view all referral transactions"
  ON public.referral_transactions FOR SELECT
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'MANAGER');

-- ===== REFERRAL MILESTONES =====
ALTER TABLE public.referral_milestones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read on referral_milestones" ON public.referral_milestones;
CREATE POLICY "Public read on referral_milestones"
  ON public.referral_milestones FOR SELECT
  USING (true);

-- ===== WEBSITE ORDERS =====
ALTER TABLE public.website_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own orders" ON public.website_orders;
CREATE POLICY "Users can view own orders"
  ON public.website_orders FOR SELECT
  USING (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Service role full access on website_orders" ON public.website_orders;
CREATE POLICY "Service role full access on website_orders"
  ON public.website_orders FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Managers can view all orders" ON public.website_orders;
CREATE POLICY "Managers can view all orders"
  ON public.website_orders FOR SELECT
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'MANAGER');

-- ===== ADD COLUMNS (safe to re-run) =====
ALTER TABLE public.website_orders ADD COLUMN IF NOT EXISTS referral_code TEXT;
ALTER TABLE public.website_orders ADD COLUMN IF NOT EXISTS coins_applied INTEGER DEFAULT 0;
ALTER TABLE public.website_orders ADD COLUMN IF NOT EXISTS original_amount INTEGER DEFAULT 0;
ALTER TABLE public.website_orders ADD COLUMN IF NOT EXISTS discount_amount INTEGER DEFAULT 0;

-- ===== VERIFY MANAGER ROLE =====
-- Make sure your account has MANAGER role
UPDATE public.profiles SET role = 'MANAGER' WHERE email IN ('laxmikant.p@genziitian.com', 'genziitian@gmail.com');
