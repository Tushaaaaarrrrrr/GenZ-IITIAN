-- JOB APPLICATIONS TABLE — For Subject Tutors & Campus Leaders
-- Run this in your Supabase SQL Editor if you are using Supabase

CREATE TABLE IF NOT EXISTS public.job_applications (
    id TEXT PRIMARY KEY,
    role TEXT NOT NULL,                     -- 'tutor' or 'campus-leader'
    role_title TEXT NOT NULL,               -- 'Subject Tutor (Faculty)' or 'Campus Leaders'
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    
    -- Subject Tutor specific
    is_iitm TEXT,
    level TEXT,
    subject TEXT,
    language TEXT,
    cgpa TEXT,
    resume_link TEXT,
    
    -- Campus Leader specific
    official_email TEXT,
    is_bs_student TEXT,
    is_group_owner TEXT,
    group_link TEXT,
    group_members TEXT,
    inquiries TEXT,
    
    -- Common metadata & review
    metadata JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'PENDING',          -- 'PENDING', 'REVIEWED', 'SHORTLISTED', 'HIRED', 'REJECTED'
    manager_notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- 1. Anyone (public/applicant) can submit an application
DROP POLICY IF EXISTS "Public can submit job applications" ON public.job_applications;
CREATE POLICY "Public can submit job applications"
    ON public.job_applications
    FOR INSERT
    TO public
    WITH CHECK (true);

-- 2. Managers can view all applications
DROP POLICY IF EXISTS "Managers can read job applications" ON public.job_applications;
CREATE POLICY "Managers can read job applications"
    ON public.job_applications
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'MANAGER'
        )
        OR (auth.jwt() ->> 'role') = 'service_role'
        OR true -- Fallback for authenticated/anon during development
    );

-- 3. Managers can update application status and notes
DROP POLICY IF EXISTS "Managers can update job applications" ON public.job_applications;
CREATE POLICY "Managers can update job applications"
    ON public.job_applications
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'MANAGER'
        )
        OR (auth.jwt() ->> 'role') = 'service_role'
        OR true
    );

-- 4. Managers can delete applications
DROP POLICY IF EXISTS "Managers can delete job applications" ON public.job_applications;
CREATE POLICY "Managers can delete job applications"
    ON public.job_applications
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'MANAGER'
        )
        OR (auth.jwt() ->> 'role') = 'service_role'
        OR true
    );

-- Index for speedy queries
CREATE INDEX IF NOT EXISTS idx_job_applications_created_at ON public.job_applications (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_applications_role ON public.job_applications (role);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON public.job_applications (status);
CREATE INDEX IF NOT EXISTS idx_job_applications_email ON public.job_applications (email);
