-- ============================================================
-- THE FIX: Resolve Infinite Recursion & Missing INSERT Policies
-- Paste into Supabase SQL Editor → Run
-- ============================================================

-- 1. Create a SECURITY DEFINER function to check manager role safely
-- This is CRITICAL to prevent "infinite recursion" errors when 
-- policies query the same table (profiles).
CREATE OR REPLACE FUNCTION public.is_manager()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'MANAGER'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ===== PROFILES TABLE =====
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own profile" ON public.profiles;
CREATE POLICY "Users can manage own profile"
  ON public.profiles FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Use the new function to avoid infinite recursion
DROP POLICY IF EXISTS "Managers can view all profiles" ON public.profiles;
CREATE POLICY "Managers can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_manager());

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

-- [CRITICAL FIX] Enable users to insert their *new* referral profiles
DROP POLICY IF EXISTS "Users can insert own referral profile" ON public.referral_profiles;
CREATE POLICY "Users can insert own referral profile"
  ON public.referral_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

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

-- Use the new function to avoid infinite recursion
DROP POLICY IF EXISTS "Managers can view all referral profiles" ON public.referral_profiles;
CREATE POLICY "Managers can view all referral profiles"
  ON public.referral_profiles FOR SELECT
  USING (public.is_manager());

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

-- Use the new function to avoid infinite recursion
DROP POLICY IF EXISTS "Managers can view all referral transactions" ON public.referral_transactions;
CREATE POLICY "Managers can view all referral transactions"
  ON public.referral_transactions FOR SELECT
  USING (public.is_manager());

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

-- Use the new function to avoid infinite recursion
DROP POLICY IF EXISTS "Managers can view all orders" ON public.website_orders;
CREATE POLICY "Managers can view all orders"
  ON public.website_orders FOR SELECT
  USING (public.is_manager());

-- ===== ENSURE MANAGER STATUS =====
UPDATE public.profiles SET role = 'MANAGER' 
WHERE email IN ('laxmikant.p@genziitian.com', 'genziitian@gmail.com', 'lkiitmng2428@gmail.com');
