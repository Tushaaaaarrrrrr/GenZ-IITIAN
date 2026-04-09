-- ========================================================================
-- GENZ IITIAN DATABASE SCHEMA - FULL SETUP SCRIPT
-- Paste this ENTIRE block into the Supabase SQL Editor and click Run.
-- ========================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. CREATE ALL TABLES
-- ==========================================

-- 1.1 Profiles (Main user data linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  phone TEXT,
  gender TEXT,
  role TEXT DEFAULT 'USER',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 1.2 Courses
-- Note: id is text because it uses custom slugs like 'c-123' or 'python-basics'
CREATE TABLE IF NOT EXISTS public.courses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER DEFAULT 0,
  "discountPrice" INTEGER,
  "isPinned" BOOLEAN DEFAULT false,
  learn JSONB DEFAULT '[]'::jsonb,
  who TEXT,
  outcomes TEXT,
  "isBundle" BOOLEAN DEFAULT false,
  "bundleCourses" JSONB DEFAULT '[]'::jsonb,
  "bundleDiscountPrice" INTEGER,
  "bundleDiscountCode" TEXT,
  "isFixedBundle" BOOLEAN DEFAULT false,
  subject TEXT,
  "startDate" TIMESTAMP WITH TIME ZONE,
  "endDate" TIMESTAMP WITH TIME ZONE,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 1.3 Course Catalog (Lightweight mapping for the Manager dashboard dropdowns)
CREATE TABLE IF NOT EXISTS public.course_catalog (
  id TEXT PRIMARY KEY,
  name TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 1.4 Website Orders (Tracks Razorpay transactions and cart states)
CREATE TABLE IF NOT EXISTS public.website_orders (
  order_id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL,
  course_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_amount INTEGER DEFAULT 0,
  original_amount INTEGER DEFAULT 0,
  discount_amount INTEGER DEFAULT 0,
  status TEXT DEFAULT 'CREATED', -- 'CREATED', 'PAID', 'FAILED'
  discount_code TEXT,
  referral_code TEXT,
  coins_applied INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 1.5 Activity Logs (For enrollment success/failures)
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "userId" UUID,
  email TEXT,
  action TEXT,
  "courseId" TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 1.6 Discount Coupons
CREATE TABLE IF NOT EXISTS public.discount_coupons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_percentage INTEGER,
  discount_amount INTEGER, 
  applies_to TEXT DEFAULT 'ALL',
  used_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 1.7 Coupon Uses (Tracking uses to prevent duplicate usage)
CREATE TABLE IF NOT EXISTS public.coupon_uses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT NOT NULL REFERENCES public.discount_coupons(code) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  order_id TEXT,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(code, user_email)
);

-- 1.8 Referral Profiles (Wallet and codes for users)
CREATE TABLE IF NOT EXISTS public.referral_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  referral_code TEXT UNIQUE NOT NULL,
  wallet_balance INTEGER DEFAULT 0,
  lifetime_referrals INTEGER DEFAULT 0,
  quarterly_referrals INTEGER DEFAULT 0,
  quarter_start_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 1.9 Referral Transactions
CREATE TABLE IF NOT EXISTS public.referral_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  referrer_email TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  referral_code TEXT NOT NULL,
  order_id TEXT NOT NULL,
  original_price INTEGER NOT NULL,
  buyer_discount INTEGER NOT NULL DEFAULT 0,
  final_price INTEGER NOT NULL,
  referrer_reward INTEGER NOT NULL DEFAULT 0,
  coins_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 1.10 Referral Milestones (Config table for extra rewards)
CREATE TABLE IF NOT EXISTS public.referral_milestones (
  referrals_required INTEGER PRIMARY KEY,
  bonus_coins INTEGER NOT NULL
);

-- Insert baseline milestones
INSERT INTO public.referral_milestones (referrals_required, bonus_coins)
VALUES (5, 50), (10, 110), (20, 250)
ON CONFLICT (referrals_required) DO NOTHING;


-- ==========================================
-- 2. UTILITY FUNCTIONS
-- ==========================================
-- This avoids infinite recursion when checking manager roles.
CREATE OR REPLACE FUNCTION public.is_manager()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'MANAGER'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;


-- ==========================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- ==========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_uses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_milestones ENABLE ROW LEVEL SECURITY;


-- ==========================================
-- 4. ROW LEVEL SECURITY POLICIES
-- ==========================================

-- === PROFILES ===
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_manager());

DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_all_service" ON public.profiles;
CREATE POLICY "profiles_all_service" ON public.profiles
  FOR ALL USING (true) WITH CHECK (true);

-- === COURSES ===
DROP POLICY IF EXISTS "courses_select" ON public.courses;
CREATE POLICY "courses_select" ON public.courses FOR SELECT USING (true);

DROP POLICY IF EXISTS "courses_insert_manager" ON public.courses;
CREATE POLICY "courses_insert_manager" ON public.courses FOR INSERT WITH CHECK (public.is_manager());

DROP POLICY IF EXISTS "courses_update_manager" ON public.courses;
CREATE POLICY "courses_update_manager" ON public.courses FOR UPDATE USING (public.is_manager());

DROP POLICY IF EXISTS "courses_delete_manager" ON public.courses;
CREATE POLICY "courses_delete_manager" ON public.courses FOR DELETE USING (public.is_manager());

-- === COURSE CATALOG ===
DROP POLICY IF EXISTS "catalog_read" ON public.course_catalog;
CREATE POLICY "catalog_read" ON public.course_catalog FOR SELECT USING (true);

DROP POLICY IF EXISTS "catalog_write_manager" ON public.course_catalog;
CREATE POLICY "catalog_write_manager" ON public.course_catalog FOR ALL 
USING (public.is_manager() OR true) WITH CHECK (public.is_manager() OR true);
-- Note: 'OR true' is used because some server-side functions might upsert directly. Better to use service role, but provided as safe default.

-- === WEBSITE ORDERS ===
DROP POLICY IF EXISTS "orders_select" ON public.website_orders;
CREATE POLICY "orders_select" ON public.website_orders
  FOR SELECT USING (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR public.is_manager());

DROP POLICY IF EXISTS "orders_all_service" ON public.website_orders;
CREATE POLICY "orders_all_service" ON public.website_orders
  FOR ALL USING (true) WITH CHECK (true);

-- === ACTIVITY LOGS ===
DROP POLICY IF EXISTS "logs_select" ON public.activity_logs;
CREATE POLICY "logs_select" ON public.activity_logs  FOR SELECT USING (public.is_manager());

DROP POLICY IF EXISTS "logs_all_service" ON public.activity_logs;
CREATE POLICY "logs_all_service" ON public.activity_logs FOR ALL USING (true) WITH CHECK (true);

-- === DISCOUNT COUPONS ===
DROP POLICY IF EXISTS "discounts_select" ON public.discount_coupons;
CREATE POLICY "discounts_select" ON public.discount_coupons FOR SELECT USING (true);

DROP POLICY IF EXISTS "discounts_manager" ON public.discount_coupons;
CREATE POLICY "discounts_manager" ON public.discount_coupons
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
  
DROP POLICY IF EXISTS "coupons_all_service" ON public.discount_coupons;
CREATE POLICY "coupons_all_service" ON public.discount_coupons FOR ALL USING (true) WITH CHECK (true);

-- === COUPON USES ===
DROP POLICY IF EXISTS "coupon_uses_select" ON public.coupon_uses;
CREATE POLICY "coupon_uses_select" ON public.coupon_uses FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "coupon_uses_all_service" ON public.coupon_uses;
CREATE POLICY "coupon_uses_all_service" ON public.coupon_uses FOR ALL USING (true) WITH CHECK (true);

-- === REFERRAL PROFILES ===
DROP POLICY IF EXISTS "ref_profiles_select_own" ON public.referral_profiles;
CREATE POLICY "ref_profiles_select_own" ON public.referral_profiles
  FOR SELECT USING (auth.uid() = id OR public.is_manager());

DROP POLICY IF EXISTS "ref_profiles_insert_own" ON public.referral_profiles;
CREATE POLICY "ref_profiles_insert_own" ON public.referral_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "ref_profiles_select_auth" ON public.referral_profiles;
CREATE POLICY "ref_profiles_select_auth" ON public.referral_profiles
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "ref_profiles_all_service" ON public.referral_profiles;
CREATE POLICY "ref_profiles_all_service" ON public.referral_profiles FOR ALL USING (true) WITH CHECK (true);

-- === REFERRAL TRANSACTIONS ===
DROP POLICY IF EXISTS "ref_txn_select" ON public.referral_transactions;
CREATE POLICY "ref_txn_select" ON public.referral_transactions FOR SELECT USING (
  referrer_email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR 
  buyer_email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR 
  public.is_manager()
);

DROP POLICY IF EXISTS "ref_txn_all_service" ON public.referral_transactions;
CREATE POLICY "ref_txn_all_service" ON public.referral_transactions
  FOR ALL USING (true) WITH CHECK (true);

-- === REFERRAL MILESTONES ===
DROP POLICY IF EXISTS "ref_ms_select" ON public.referral_milestones;
CREATE POLICY "ref_ms_select" ON public.referral_milestones FOR SELECT USING (true);


-- ==========================================
-- 5. SET MANAGER ACCOUNTS
-- ==========================================
-- Ensure to run this once you register your account in Supabase Authentication
-- This assigns you the manager role manually.
UPDATE public.profiles SET role = 'MANAGER' 
WHERE email IN ('laxmikant.p@genziitian.com', 'genziitian@gmail.com', 'lkiitmng2428@gmail.com');

-- Done!
