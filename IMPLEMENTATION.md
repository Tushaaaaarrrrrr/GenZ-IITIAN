# GenZ IITian SEO, AEO and GEO implementation

Implemented in an isolated copy of source commit `8e1257b13fcba3d9db805f473a99eca32a3a3f84`. The original Downloads checkout is unchanged. This is a local implementation and tested handoff; it has not been deployed or applied to your live database.

## What is included

- A dedicated React public tree with Vite client and server builds, Express data loading, real HTML bodies, metadata and JSON-LD, and client hydration.
- SSR homepage, IITM hub, resource directory/subjects, assignment directory/archives, blog archive/articles, existing docs, about/contact and published knowledge pages.
- HTTP 301 resource/assignment migrations and legacy blog-ID aliases, query-string preservation, and document navigation from the transaction app.
- A shared level/subject catalogue retaining existing database keys and display names.
- Explicit public Supabase queries enforcing publication, resource filters, knowledge pagination/counts and related-page rules. Static resource notes merge by URL. No static blog fallbacks can resurrect drafts.
- Shared canonical, description, social, breadcrumb, robots and schema descriptors. Global settings provide a social-image default without overwriting page titles/descriptions. The branded fallback image is included.
- `/robots.txt`, a sitemap index and six generated sitemap sections, and `/llms.txt`. Review material and private/operational destinations are excluded. Course URLs are retained.
- A blog-editor extension and an additive SQL migration for summaries, authors/reviewers, sources, real dates and alternative text. Public RLS publication guards protect drafts; existing manager access is retained through `public.is_manager()`.
- Four researched editorial guides in `content/editorial-guides.json`, plus a real, idempotent Supabase seeder. Existing slugs, including existing drafts, are never overwritten or republished by seeding.
- HTTP, data-filter, staging, pagination and sanitization tests; a browser regression script with mocked course data; protected-campaign hash checks.

The public pages have a shared layout and normal document links into the existing application. Courses, course selection, cart, authentication and referral storage retain their original implementations. PostHog initialization remains in the main entry point.

## Assignment release status

All five populated CT weeks have routes under `/iitm-bs/graded-assignment/foundation/computational-thinking/week-N`, for N = 1, 2, 3, 5 and 6. They render the archive and disclosures, with solution text present in HTML.

They deliberately remain **noindex review pages**. Re-extraction restored missing mathematical operators and missing question headings. Visual review of PDF pages 6–11 found that the supplied Week 1 tutorial references procedures and a transport flowchart that are not reproduced in that source. The complete source and question-by-question academic verification are required before publishing reviewed weeks. Term/year remain unknown.

Read `review/assignments/REVIEW.md`. The review manifest controls directories, schema, sitemaps and llms.txt together; changing a week to `reviewed` after verification publishes its subject/week links automatically. Missing weeks receive 404, not “coming soon” pages.

## Build and local verification

Use a supported Node.js release such as Node 22 or 24 with npm. The existing React and Vite major versions are preserved.

```sh
npm ci --ignore-scripts
npm run lint
npm run build
npm test
npm run verify:campaign
```

`npm run build` creates **both** `dist/` and `dist-server/`. This step is mandatory before production startup.

For a read-only preview with clearly synthetic test data:

```sh
SEO_FIXTURE=true PORT=3100 npm run preview:public
```

The fixture preview excludes payments, welcome emails, enrolment and other application mutation endpoints. Never set `SEO_FIXTURE=true` on production.

For development with real public data, configure the environment and run `npm run dev` (SSR/Vite on port 3100). Run the existing Express application on port 3001 for transaction APIs. The development preview forwards non-public `/api` requests to port 3001. `npm run dev:app` retains the plain Vite workflow for transaction-only development.

Browser checks require the newly declared Playwright development dependency and its Chromium browser:

```sh
npx playwright install chromium
PREVIEW_URL=http://127.0.0.1:3100 npm run test:browser
```

The script blocks external services, mocks course reads, and prevents payment/enrolment requests. It checks hydration, selectors/search, tabs/disclosures, mobile overflow, referral capture, course detail, the existing checkout destination and `courseId` lookup, and cart persistence.

## Supabase rollout

Use a staging database and retain a database backup. Do not point transaction tests at production payments or email webhooks.

1. Apply `migrations/20261006-public-seo.sql` in the Supabase SQL editor. It assumes the existing `public.is_manager()` helper and the source's schema: `blogs.published` is INTEGER; `resources.published` and `pseo_pages.published` are BOOLEAN. Verify these types and manager access first. The migration fails visibly if an existing schema is incompatible.
2. Run the read-only public inventory audit with deployment credentials:

```sh
npm run audit:public
```

Review duplicate-title candidates and content collisions in `review/public-inventory.json`. Existing knowledge slugs are not renamed or merged. The old pSEO dataset contains dated claims; it is not automatically seeded or published by this release.

3. Seed the four guides:

```sh
npm run seed:editorial
```

The seeder uses `SUPABASE_SERVICE_ROLE_KEY` on the server, checks actual errors and verifies resulting publication status. Publication timestamps are generated when the seed is applied; source verification dates are 6 October 2026. It leaves historical authors/dates blank and preserves all existing rows on slug conflicts.

4. Confirm public anonymous access cannot read draft blogs/resources/knowledge pages through direct Supabase REST as well as your public content APIs. Confirm authorized managers can still read and edit drafts.

## Hostinger rollout

1. Preserve the existing live environment, Razorpay configuration, tracking settings and campaign destination list. Add only the SEO-related environment values needed for this release; `.env.seo.example` documents them without real credentials.
2. Configure Hostinger's Node application to start `npm start` from this project. Send **document requests to Express**, including `/`. Assets may be cached, but the web server/CDN must not serve `dist/index.html` directly for document requests.
3. On staging, set `SEO_STAGING=true`. Verify HTML/HTTP noindex, blocked staging robots and empty crawl inventories. Use test payment keys, a separate test database and test email webhooks for full transaction regression. The read-only fixture preview is a separate safe review option.
4. Deploy `dist/`, `dist-server/`, `server/`, installed production dependencies and existing public assets together. Ensure Node can import `dist-server/entry-server.js` and `sanitize-html`.
5. Apply the migration and seed before enabling the public release. Missing schema/content-service failures intentionally return 503; they do not quietly expose stale fallback content.
6. Remove `SEO_STAGING` for production after staging checks. Confirm the existing preferred host points to `https://genziitian.in` at Hostinger/CDN. Host-level redirects must preserve query strings.
7. Check representative URLs with `curl -I` and View Source: `/`, the four blogs, resource aliases/destinations, assignment directory/review pages, invalid routes and crawler files. Check old aliases redirect once and keep `ref`, `utm_*` and click IDs.
8. Retest actual recorded campaign destinations in the browser with approved test-mode payments. Local mock checks and source hashes do not substitute for the live gateway/analytics checks.

Only `/robots.txt`, `/sitemap.xml`, `/sitemaps/*.xml` and `/llms.txt` are special crawler responses. They are real plain-text/XML endpoints, served before asset or HTML routing. OAI-SearchBot, Claude-SearchBot, Googlebot and Bingbot are permitted by the general public-search rules. Existing provider/CDN access rules still need inspection. The supplied source had no valid training-specific robots rules; if your deployment has such preferences, copy those groups unchanged into `ROBOTS_TRAINING_RULES`. Do not accidentally include a blanket search block in that variable.

The existing pSEO admin routes now require the same server-admin bearer authentication as other server-admin APIs. Their former anonymous access could expose drafts. Legacy pSEO writes now perform real database operations and propagate failures instead of reporting fake success.

## Rollback and monitoring

Keep the migration gateway, new resource/assignment destinations, catalogue and a compatible public rendering bundle available after permanent redirects go live. Roll back to the last tested client/server pair that supports these destinations; do not restore the old empty-shell catch-all or remove the destination routes. The additive blog columns can remain during rollback. Keep redirects for at least twelve months.

After release, verify sitemap submission and representative URLs in Google Search Console and Bing Webmaster Tools, including HTTP status, rendered content, canonical selection and indexing. Inspect Hostinger/CDN logs for crawler access, redirect errors and 503 rates. Verify campaign conversions and analytics capture in the existing tracking tools.

Review nonbrand clicks, comparison queries, AI citations/referrals and qualified leads at 30, 60 and 90 days. Rankings/citations are measured outcomes. Backlink outreach and placements remain deferred; official outbound references are citations, not acquired backlinks.

## Verification achieved locally

- TypeScript check passed.
- Client and SSR production builds passed.
- 76 Vitest tests passed, including the 33 existing grading tests.
- Browser fixture regression passed, including mocked course detail, checkout and cart checks; no real payment or enrolment calls.
- Twelve protected campaign files are byte-for-byte unchanged; the payment/enrolment/referral server-handler span also matches the original source hash.

Live database migration/seeding, Hostinger deployment, actual gateway/analytics verification, crawler/CDN access and Search Console/Bing checks have not been performed because deployment/account access is not available in this workspace.
