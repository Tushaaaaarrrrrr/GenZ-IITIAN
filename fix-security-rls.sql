-- ============================================================
-- GenZ IITian Platform — Comprehensive Security & RLS Fix
-- Run this ENTIRE script in your Supabase SQL Editor
-- (Includes CREATE TABLE IF NOT EXISTS so it never errors)
-- ============================================================

-- 1. MANAGER ROLE HELPER (SECURITY DEFINER)
-- Prevents recursive policy evaluation
CREATE OR REPLACE FUNCTION public.is_manager()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'MANAGER'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 2. PROFILE ROLE PRIVILEGE ESCALATION PROTECTION (SEC-01)
-- Blocks non-service_role callers from ever changing the 'role' column.
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF (auth.jwt() ->> 'role') IS DISTINCT FROM 'service_role' THEN
      RAISE EXCEPTION 'Modifying user role is not permitted.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_protect_profile_role ON public.profiles;
CREATE TRIGGER tr_protect_profile_role
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_role();

-- 3. PROFILES TABLE RLS POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Managers can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can manage own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable read for everyone" ON public.profiles;
DROP POLICY IF EXISTS "profiles_all_service" ON public.profiles;

CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_manager());

DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 4. JOB APPLICATIONS PROTECTION (SEC-03)
CREATE TABLE IF NOT EXISTS public.job_applications (
    id TEXT PRIMARY KEY,
    role TEXT NOT NULL,
    role_title TEXT NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    age TEXT,
    gender TEXT,
    student_type TEXT,
    degree_level TEXT,
    is_iitm TEXT,
    level TEXT,
    subject TEXT,
    courses JSONB DEFAULT '[]'::jsonb,
    has_tablet TEXT,
    experience_and_why TEXT,
    language TEXT,
    cgpa TEXT,
    resume_link TEXT,
    official_email TEXT,
    is_bs_student TEXT,
    is_group_owner TEXT,
    group_link TEXT,
    group_members TEXT,
    inquiries TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'PENDING',
    manager_notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can submit job applications" ON public.job_applications;
CREATE POLICY "Public can submit job applications"
    ON public.job_applications FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Managers can read job applications" ON public.job_applications;
CREATE POLICY "Managers can read job applications"
    ON public.job_applications FOR SELECT
    USING (public.is_manager() OR (auth.jwt() ->> 'role') = 'service_role');

DROP POLICY IF EXISTS "Managers can update job applications" ON public.job_applications;
CREATE POLICY "Managers can update job applications"
    ON public.job_applications FOR UPDATE
    USING (public.is_manager() OR (auth.jwt() ->> 'role') = 'service_role');

DROP POLICY IF EXISTS "Managers can delete job applications" ON public.job_applications;
CREATE POLICY "Managers can delete job applications"
    ON public.job_applications FOR DELETE
    USING (public.is_manager() OR (auth.jwt() ->> 'role') = 'service_role');

-- 5. 1:1 BOOKINGS TABLE & PROTECTION (SEC-04)
CREATE TABLE IF NOT EXISTS public.one_on_one_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    level TEXT,
    subjects TEXT,
    slot_date DATE,
    slot_time TEXT,
    plan TEXT DEFAULT '1:1 Personalised Teaching',
    notes TEXT,
    user_notes TEXT,
    manager_notes TEXT,
    status TEXT DEFAULT 'CONFIRMED',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.one_on_one_bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public inserts on 1:1 bookings" ON public.one_on_one_bookings;
CREATE POLICY "Allow public inserts on 1:1 bookings"
    ON public.one_on_one_bookings FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Allow read on 1:1 bookings for authenticated users" ON public.one_on_one_bookings;
DROP POLICY IF EXISTS "one_on_one_bookings_select" ON public.one_on_one_bookings;
CREATE POLICY "one_on_one_bookings_select"
    ON public.one_on_one_bookings FOR SELECT
    USING (
        email = (auth.jwt() ->> 'email')
        OR public.is_manager()
        OR (auth.jwt() ->> 'role') = 'service_role'
    );

DROP POLICY IF EXISTS "one_on_one_bookings_update" ON public.one_on_one_bookings;
CREATE POLICY "one_on_one_bookings_update"
    ON public.one_on_one_bookings FOR UPDATE
    USING (
        email = (auth.jwt() ->> 'email')
        OR public.is_manager()
        OR (auth.jwt() ->> 'role') = 'service_role'
    );

-- 6. REFERRAL PROFILES & WALLET PROTECTION (SEC-07)
CREATE TABLE IF NOT EXISTS public.referral_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    referral_code TEXT UNIQUE NOT NULL,
    wallet_balance INTEGER DEFAULT 0,
    total_earned INTEGER DEFAULT 0,
    pending_payout INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.referral_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can read referral profiles" ON public.referral_profiles;
DROP POLICY IF EXISTS "Users can read own referral profile" ON public.referral_profiles;
DROP POLICY IF EXISTS "Managers can view all referral profiles" ON public.referral_profiles;
DROP POLICY IF EXISTS "ref_profiles_select_own" ON public.referral_profiles;
DROP POLICY IF EXISTS "ref_profiles_select_auth" ON public.referral_profiles;
DROP POLICY IF EXISTS "ref_profiles_all_service" ON public.referral_profiles;
DROP POLICY IF EXISTS "referral_profiles_select" ON public.referral_profiles;

CREATE POLICY "referral_profiles_select"
    ON public.referral_profiles FOR SELECT
    USING (
        auth.uid() = id
        OR public.is_manager()
        OR (auth.jwt() ->> 'role') = 'service_role'
    );

CREATE OR REPLACE FUNCTION public.validate_referral_code(code_input TEXT)
RETURNS TABLE (is_valid BOOLEAN, referral_code TEXT) AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.referral_profiles WHERE UPPER(referral_code) = UPPER(TRIM(code_input))
  ), UPPER(TRIM(code_input));
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 7. WEBSITE ORDERS PROTECTION (SEC-05)
CREATE TABLE IF NOT EXISTS public.website_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT UNIQUE,
    user_id UUID,
    user_email TEXT NOT NULL,
    user_phone TEXT,
    courses JSONB DEFAULT '[]'::jsonb,
    amount NUMERIC,
    currency TEXT DEFAULT 'INR',
    status TEXT DEFAULT 'PENDING',
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.website_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own orders" ON public.website_orders;
DROP POLICY IF EXISTS "Managers can view all orders" ON public.website_orders;
DROP POLICY IF EXISTS "orders_all_service" ON public.website_orders;
DROP POLICY IF EXISTS "orders_select" ON public.website_orders;

CREATE POLICY "orders_select" ON public.website_orders
    FOR SELECT
    USING (
        user_email = (auth.jwt() ->> 'email')
        OR public.is_manager()
        OR (auth.jwt() ->> 'role') = 'service_role'
    );

-- 8. BLOGS TABLE PROTECTION (Prevents Unauthorized Mod/Stored XSS)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'blogs') THEN
    ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "blogs_select" ON public.blogs;
    DROP POLICY IF EXISTS "blogs_all_service" ON public.blogs;
    DROP POLICY IF EXISTS "blogs_insert_manager" ON public.blogs;
    DROP POLICY IF EXISTS "blogs_update_manager" ON public.blogs;
    DROP POLICY IF EXISTS "blogs_delete_manager" ON public.blogs;

    CREATE POLICY "blogs_select" ON public.blogs FOR SELECT
      USING (published = 1 OR public.is_manager() OR (auth.jwt() ->> 'role') = 'service_role');

    CREATE POLICY "blogs_insert_manager" ON public.blogs FOR INSERT
      WITH CHECK (public.is_manager() OR (auth.jwt() ->> 'role') = 'service_role');

    CREATE POLICY "blogs_update_manager" ON public.blogs FOR UPDATE
      USING (public.is_manager() OR (auth.jwt() ->> 'role') = 'service_role');

    CREATE POLICY "blogs_delete_manager" ON public.blogs FOR DELETE
      USING (public.is_manager() OR (auth.jwt() ->> 'role') = 'service_role');
  END IF;
END $$;

-- 9. DISCOUNT COUPONS & USAGE INTEGRITY
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'discount_coupons') THEN
    ALTER TABLE public.discount_coupons ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Enable read access for all users on discount_coupons" ON public.discount_coupons;
    DROP POLICY IF EXISTS "Enable all access for service role on discount_coupons" ON public.discount_coupons;
    DROP POLICY IF EXISTS "Allow all operations for authenticated users (Manager) on discount_coupons" ON public.discount_coupons;
    DROP POLICY IF EXISTS "discounts_select" ON public.discount_coupons;
    DROP POLICY IF EXISTS "discounts_manager" ON public.discount_coupons;
    DROP POLICY IF EXISTS "coupons_all_service" ON public.discount_coupons;

    -- Coupons are validated server-side (/api/validate-coupon, /api/create-order). Browsers must not list them.
    CREATE POLICY "coupons_select" ON public.discount_coupons FOR SELECT
      USING (public.is_manager() OR (auth.jwt() ->> 'role') = 'service_role');

    CREATE POLICY "coupons_write_manager" ON public.discount_coupons FOR ALL
      USING (public.is_manager() OR (auth.jwt() ->> 'role') = 'service_role')
      WITH CHECK (public.is_manager() OR (auth.jwt() ->> 'role') = 'service_role');
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'coupon_uses') THEN
    ALTER TABLE public.coupon_uses ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Enable read access for own uses on coupon_uses" ON public.coupon_uses;
    DROP POLICY IF EXISTS "Enable all access for service role on coupon_uses" ON public.coupon_uses;
    DROP POLICY IF EXISTS "coupon_uses_select" ON public.coupon_uses;
    DROP POLICY IF EXISTS "coupon_uses_all_service" ON public.coupon_uses;

    CREATE POLICY "coupon_uses_select" ON public.coupon_uses FOR SELECT
      USING (user_email = (auth.jwt() ->> 'email') OR public.is_manager() OR (auth.jwt() ->> 'role') = 'service_role');

    CREATE POLICY "coupon_uses_write_service" ON public.coupon_uses FOR ALL
      USING ((auth.jwt() ->> 'role') = 'service_role')
      WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');
  END IF;
END $$;

-- 10. EMPLOYEES & AUDIT LOGS PROTECTION
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'employees') THEN
    ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Allow public read access" ON public.employees;
    DROP POLICY IF EXISTS "Allow all access to authenticated users" ON public.employees;

    CREATE POLICY "employees_select_public" ON public.employees FOR SELECT
      USING (true);

    CREATE POLICY "employees_write_manager" ON public.employees FOR ALL
      USING (public.is_manager() OR (auth.jwt() ->> 'role') = 'service_role')
      WITH CHECK (public.is_manager() OR (auth.jwt() ->> 'role') = 'service_role');
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'employee_logs') THEN
    ALTER TABLE public.employee_logs ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Allow authenticated users to read logs" ON public.employee_logs;
    DROP POLICY IF EXISTS "Allow authenticated users to insert logs" ON public.employee_logs;

    CREATE POLICY "employee_logs_manager" ON public.employee_logs FOR ALL
      USING (public.is_manager() OR (auth.jwt() ->> 'role') = 'service_role')
      WITH CHECK (public.is_manager() OR (auth.jwt() ->> 'role') = 'service_role');
  END IF;
END $$;

-- 11. COURSES & COURSE CATALOG PROTECTION (No tampering with prices or catalog)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'courses') THEN
    ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "courses_select" ON public.courses;
    DROP POLICY IF EXISTS "courses_insert_manager" ON public.courses;
    DROP POLICY IF EXISTS "courses_update_manager" ON public.courses;
    DROP POLICY IF EXISTS "courses_delete_manager" ON public.courses;
    DROP POLICY IF EXISTS "courses_insert" ON public.courses;
    DROP POLICY IF EXISTS "courses_update" ON public.courses;
    DROP POLICY IF EXISTS "courses_delete" ON public.courses;

    CREATE POLICY "courses_select" ON public.courses FOR SELECT USING (true);
    CREATE POLICY "courses_write_manager" ON public.courses FOR ALL
      USING (public.is_manager() OR (auth.jwt() ->> 'role') = 'service_role')
      WITH CHECK (public.is_manager() OR (auth.jwt() ->> 'role') = 'service_role');
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'course_catalog') THEN
    ALTER TABLE public.course_catalog ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "catalog_read" ON public.course_catalog;
    DROP POLICY IF EXISTS "catalog_write_manager" ON public.course_catalog;

    CREATE POLICY "catalog_read" ON public.course_catalog FOR SELECT USING (true);
    CREATE POLICY "catalog_write_manager" ON public.course_catalog FOR ALL
      USING (public.is_manager() OR (auth.jwt() ->> 'role') = 'service_role')
      WITH CHECK (public.is_manager() OR (auth.jwt() ->> 'role') = 'service_role');
  END IF;
END $$;
