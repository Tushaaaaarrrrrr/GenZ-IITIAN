-- ========================================================================
-- 1:1 PERSONALISED TEACHING BOOKINGS TABLE
-- Paste this into your Supabase SQL Editor if you wish to query 1:1 bookings.
-- ========================================================================

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
    status TEXT DEFAULT 'CONFIRMED',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Index for searching and filtering
CREATE INDEX IF NOT EXISTS idx_1on1_bookings_email ON public.one_on_one_bookings(email);
CREATE INDEX IF NOT EXISTS idx_1on1_bookings_slot_date ON public.one_on_one_bookings(slot_date);
CREATE INDEX IF NOT EXISTS idx_1on1_bookings_created_at ON public.one_on_one_bookings(created_at);

-- Enable RLS
ALTER TABLE public.one_on_one_bookings ENABLE ROW LEVEL SECURITY;

-- Allow insert by anon/authenticated (students booking slots)
CREATE POLICY "Allow public inserts on 1:1 bookings"
ON public.one_on_one_bookings
FOR INSERT
WITH CHECK (true);

-- Allow select by service role / authenticated managers
CREATE POLICY "Allow read on 1:1 bookings for authenticated users"
ON public.one_on_one_bookings
FOR SELECT
USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
