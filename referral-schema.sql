-- ========================================
-- REFERRAL SYSTEM — COMPLETE SQL MIGRATION
-- Paste this ENTIRE block into Supabase SQL Editor → Click Run
-- ========================================

-- 1. Referral profiles: each user's code, wallet, and counters
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

-- 2. Referral transactions: log of every successful referral purchase
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

-- 3. Milestone config (static seed data)
CREATE TABLE IF NOT EXISTS public.referral_milestones (
  referrals_required INTEGER PRIMARY KEY,
  bonus_coins INTEGER NOT NULL
);

-- Seed milestones (safe to re-run)
INSERT INTO public.referral_milestones (referrals_required, bonus_coins)
VALUES (5, 50), (10, 110), (20, 250)
ON CONFLICT (referrals_required) DO NOTHING;

-- 4. Add referral columns to existing website_orders table
ALTER TABLE public.website_orders ADD COLUMN IF NOT EXISTS referral_code TEXT;
ALTER TABLE public.website_orders ADD COLUMN IF NOT EXISTS coins_applied INTEGER DEFAULT 0;

-- ========================================
-- ROW LEVEL SECURITY
-- ========================================

ALTER TABLE public.referral_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_milestones ENABLE ROW LEVEL SECURITY;

-- Referral Profiles: users can read their own
CREATE POLICY "Users can read own referral profile"
  ON public.referral_profiles FOR SELECT
  USING (auth.uid() = id);

-- Referral Profiles: authenticated users can read any profile (for code validation)
CREATE POLICY "Authenticated can read referral profiles"
  ON public.referral_profiles FOR SELECT
  TO authenticated
  USING (true);

-- Referral Profiles: service role full access (server-side inserts/updates)
CREATE POLICY "Service role full access on referral_profiles"
  ON public.referral_profiles FOR ALL
  USING (true)
  WITH CHECK (true);

-- Referral Transactions: users can read their own (as referrer or buyer)
CREATE POLICY "Users can read own referral transactions"
  ON public.referral_transactions FOR SELECT
  USING (
    referrer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR buyer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Referral Transactions: service role full access
CREATE POLICY "Service role full access on referral_transactions"
  ON public.referral_transactions FOR ALL
  USING (true)
  WITH CHECK (true);

-- Milestones: public read (everyone can see milestone tiers)
CREATE POLICY "Public read on referral_milestones"
  ON public.referral_milestones FOR SELECT
  USING (true);
