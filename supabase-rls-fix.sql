-- ============================================================
-- GenZ IITian — Manager Authorization RLS Fix
-- Run this ENTIRE script in Supabase SQL Editor
-- ============================================================

-- 1. Create a SECURITY DEFINER function to check manager role
--    (Avoids recursive RLS issues when policies query the profiles table)
CREATE OR REPLACE FUNCTION public.is_manager()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'MANAGER'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 2. Drop ALL existing overly permissive / conflicting policies
DROP POLICY IF EXISTS "Enable read for everyone" ON profiles;
DROP POLICY IF EXISTS "Enable read for everyone" ON website_orders;
DROP POLICY IF EXISTS "Users Read Own Profile" ON profiles;
DROP POLICY IF EXISTS "Users Read Own Orders" ON website_orders;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Public Read Courses" ON profiles;
DROP POLICY IF EXISTS "Public Read Logs" ON activity_logs;

-- 3. PROFILES — users see own, managers see all
CREATE POLICY "profiles_select" ON profiles
  FOR SELECT USING (auth.uid() = id OR public.is_manager());

CREATE POLICY "profiles_insert" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 4. ORDERS — users see own, managers see all
CREATE POLICY "orders_select" ON website_orders
  FOR SELECT USING (user_email = auth.jwt() ->> 'email' OR public.is_manager());

-- 5. COURSES — anyone can read, only managers can write
DROP POLICY IF EXISTS "Public Read Courses" ON courses;
DROP POLICY IF EXISTS "Anyone can view courses" ON courses;
CREATE POLICY "courses_select" ON courses FOR SELECT USING (true);
CREATE POLICY "courses_insert" ON courses FOR INSERT WITH CHECK (public.is_manager());
CREATE POLICY "courses_update" ON courses FOR UPDATE USING (public.is_manager());
CREATE POLICY "courses_delete" ON courses FOR DELETE USING (public.is_manager());

-- 6. ACTIVITY LOGS — only managers can read (service_role writes from backend)
CREATE POLICY "logs_select" ON activity_logs
  FOR SELECT USING (public.is_manager());

-- 7. Set your manager accounts
UPDATE profiles SET role = 'MANAGER' 
WHERE email IN ('lkiitmng2428@gmail.com', 'genziitian@gmail.com');

-- 8. Verify it worked
SELECT email, role FROM profiles WHERE role = 'MANAGER';
