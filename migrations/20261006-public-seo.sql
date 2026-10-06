-- Additive migration. Apply on staging, verify manager access, then production.
BEGIN;
ALTER TABLE public.blogs
 ADD COLUMN IF NOT EXISTS summary text DEFAULT '',
 ADD COLUMN IF NOT EXISTS author text,
 ADD COLUMN IF NOT EXISTS reviewer text,
 ADD COLUMN IF NOT EXISTS source_references jsonb NOT NULL DEFAULT '[]'::jsonb,
 ADD COLUMN IF NOT EXISTS last_verified_at date,
 ADD COLUMN IF NOT EXISTS published_at timestamptz,
 ADD COLUMN IF NOT EXISTS modified_at timestamptz,
 ADD COLUMN IF NOT EXISTS image_alt text DEFAULT '';
-- Historical author/publication/review dates deliberately remain NULL.
-- Existing service role bypasses RLS; an unrestricted FOR ALL policy was exposing drafts.
DROP POLICY IF EXISTS blogs_select ON public.blogs;
DROP POLICY IF EXISTS blogs_all_service ON public.blogs;
CREATE POLICY blogs_select ON public.blogs FOR SELECT USING (published = 1 OR public.is_manager());
-- Restrictive guards protect against other permissive policies already installed.
DROP POLICY IF EXISTS blogs_publication_guard ON public.blogs;
CREATE POLICY blogs_publication_guard ON public.blogs AS RESTRICTIVE FOR SELECT
 TO anon, authenticated USING (published = 1 OR public.is_manager());
-- Publication guards apply to existing BOOLEAN content tables; fail visibly if the
-- deployment has an incompatible table definition, rather than expose drafts.
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS resources_publication_guard ON public.resources;
CREATE POLICY resources_publication_guard ON public.resources AS RESTRICTIVE FOR SELECT
 TO anon, authenticated USING (published = true OR public.is_manager());
ALTER TABLE public.pseo_pages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS pseo_publication_guard ON public.pseo_pages;
CREATE POLICY pseo_publication_guard ON public.pseo_pages AS RESTRICTIVE FOR SELECT
 TO anon, authenticated USING (published = true OR public.is_manager());
COMMIT;
