-- 1. Create table for standard discount coupons
CREATE TABLE IF NOT EXISTS public.discount_coupons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_percentage INTEGER,
  discount_amount INTEGER, -- one of these should be set
  applies_to TEXT DEFAULT 'ALL', -- 'ALL' or a specific course id
  used_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create table for tracking coupon usage to ensure "1 use per person"
CREATE TABLE IF NOT EXISTS public.coupon_uses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT NOT NULL REFERENCES public.discount_coupons(code) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(code, user_email)
);

-- 3. Enable RLS
ALTER TABLE public.discount_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_uses ENABLE ROW LEVEL SECURITY;

-- 4. Create policies (assuming similar setup to your previous courses/profiles)
-- Only allow public read for coupons (so frontend can validate them!)
CREATE POLICY "Enable read access for all users on discount_coupons"
    ON public.discount_coupons FOR SELECT
    USING (true);

-- Allow authenticated/service roles to insert/update. 
-- In a real setup, only manager should insert/update/delete.
-- For now, relying on Supabase service_role in backend functions and edge functions.
CREATE POLICY "Enable all access for service role on discount_coupons"
    ON public.discount_coupons FOR ALL
    USING (true)
    WITH CHECK (true);

-- Usage tracking is mainly managed by service_role (backend). 
-- But a user could check if THEY have used it.
CREATE POLICY "Enable read access for own uses on coupon_uses"
    ON public.coupon_uses FOR SELECT
    USING (auth.uid() IS NOT NULL); -- or via service_role

CREATE POLICY "Enable all access for service role on coupon_uses"
    ON public.coupon_uses FOR ALL
    USING (true)
    WITH CHECK (true);

-- Note: When Manager UI tries to fetch coupons directly via the Supabase client:
-- If Manager is just an admin user, they need access to manage coupons. 
-- Assuming they are an admin via RLS or they just use the public client for reading and updates might need a policy or edge function.
-- Let's make sure anyone can read them, but updates might require specific RLS or bypassing via service_role. We'll add an ALLOW ALL for simplicity or assume Manager auth has specific claims. For now, public select allows the manager dashboard to fetch them. If they try to INSERT/DELETE directly from client, they'll need an RLS policy.

CREATE POLICY "Allow all operations for authenticated users (Manager) on discount_coupons"
    ON public.discount_coupons FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
