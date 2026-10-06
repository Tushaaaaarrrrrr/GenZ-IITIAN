-- Run only in a disposable local PostgreSQL database.
CREATE ROLE anon;
CREATE ROLE authenticated;
CREATE ROLE service_role BYPASSRLS;
CREATE FUNCTION public.is_manager() RETURNS boolean LANGUAGE sql STABLE AS
 $$ SELECT coalesce(current_setting('seo_test.manager',true),'false') = 'true' $$;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
CREATE TABLE public.blogs (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, published integer NOT NULL DEFAULT 1);
INSERT INTO public.blogs (published) VALUES (1),(0);
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.blogs TO anon, authenticated, service_role;
CREATE POLICY blogs_all_service ON public.blogs FOR ALL USING (true) WITH CHECK (true);

-- Both content tables initially absent: the reported production failure.
\ir ../../migrations/20261006-public-seo.sql
INSERT INTO public.resources (level,subject,title,published) VALUES
 ('Foundation','CT','Published resource',true),('Foundation','CT','Draft resource',false);
INSERT INTO public.pseo_pages (slug,playbook_type,title,primary_keyword,h1,published) VALUES
 ('published-guide','guide','Published guide','keyword','Published guide',true),
 ('draft-guide','guide','Draft guide','keyword','Draft guide',false);
-- A second application must preserve existing content and remain executable.
\ir ../../migrations/20261006-public-seo.sql
DO $$ BEGIN
 IF (SELECT count(*) FROM public.resources) <> 2 OR (SELECT count(*) FROM public.pseo_pages) <> 2 THEN
  RAISE EXCEPTION 'Rerun changed existing content';
 END IF;
 IF (SELECT column_default FROM information_schema.columns WHERE table_schema='public' AND table_name='resources' AND column_name='published') <> 'false' THEN
  RAISE EXCEPTION 'New resources should default to draft';
 END IF;
END $$;
SET ROLE anon;
DO $$ BEGIN
 IF (SELECT count(*) FROM public.blogs) <> 1 OR (SELECT count(*) FROM public.resources) <> 1 OR (SELECT count(*) FROM public.pseo_pages) <> 1 THEN
  RAISE EXCEPTION 'Anonymous draft leak or published rows inaccessible';
 END IF;
 BEGIN
  INSERT INTO public.resources (level,subject,title) VALUES ('Foundation','CT','Forbidden');
  RAISE EXCEPTION 'Anonymous insert unexpectedly allowed';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;
SET ROLE authenticated;
DO $$ BEGIN
 IF (SELECT count(*) FROM public.resources) <> 1 OR (SELECT count(*) FROM public.pseo_pages) <> 1 THEN
  RAISE EXCEPTION 'Non-manager can read drafts';
 END IF;
 BEGIN
  INSERT INTO public.resources (level,subject,title) VALUES ('Foundation','CT','Forbidden');
  RAISE EXCEPTION 'Non-manager insert unexpectedly allowed';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
SET seo_test.manager = 'true';
DO $$ BEGIN
 IF (SELECT count(*) FROM public.blogs) <> 2 OR (SELECT count(*) FROM public.resources) <> 2 OR (SELECT count(*) FROM public.pseo_pages) <> 2 THEN
  RAISE EXCEPTION 'Managers cannot read drafts';
 END IF;
END $$;
INSERT INTO public.resources (level,subject,title) VALUES ('Foundation','CT','Manager draft');
INSERT INTO public.pseo_pages (slug,playbook_type,title,primary_keyword,h1) VALUES ('manager-draft','guide','Manager draft','keyword','Manager draft');
RESET ROLE;
SET seo_test.manager = 'false';
SET ROLE service_role;
DO $$ BEGIN
 IF (SELECT count(*) FROM public.resources) <> 3 OR (SELECT count(*) FROM public.pseo_pages) <> 3 THEN
  RAISE EXCEPTION 'Server role lacks content access';
 END IF;
END $$;
RESET ROLE;
SELECT 'PASS: missing tables, reruns, draft protection, manager writes, service access' AS result;
