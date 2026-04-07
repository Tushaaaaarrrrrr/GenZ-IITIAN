-- ========================================
-- DIAGNOSTIC: Run this and paste the results
-- ========================================

-- 1. Check if 'role' column exists in profiles
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role';

-- 2. Check RLS status on all tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'website_orders', 'referral_profiles', 'referral_transactions', 'referral_milestones');

-- 3. List ALL existing policies on these tables
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'website_orders', 'referral_profiles', 'referral_transactions', 'referral_milestones')
ORDER BY tablename, policyname;

-- 4. Check your manager account
SELECT id, email, role, created_at FROM public.profiles 
WHERE email IN ('laxmikant.p@genziitian.com', 'genziitian@gmail.com');
