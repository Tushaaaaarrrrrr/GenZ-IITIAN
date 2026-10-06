#!/usr/bin/env bash
# Requires local PostgreSQL tools; never connects to your production database.
set -euo pipefail
seo_repo_root="$(cd "$(dirname "$0")/.." && pwd)"
seo_test_root="$(mktemp -d /private/tmp/genz-seo-sql.XXXXXX)"
cleanup() {
  pg_ctl -D "$seo_test_root/data" -m immediate stop >/dev/null 2>&1 || true
  rm -rf "$seo_test_root"
}
trap cleanup EXIT
mkdir "$seo_test_root/socket"
initdb -D "$seo_test_root/data" -A trust --no-locale >/dev/null
pg_ctl -D "$seo_test_root/data" -l "$seo_test_root/postgres.log" -o "-F -k $seo_test_root/socket -h ''" -w start >/dev/null
psql -X -h "$seo_test_root/socket" -d postgres -v ON_ERROR_STOP=1 -f "$seo_repo_root/tests/database/public-seo-migration.sql"
# Incompatible existing publication types must fail atomically, without conversion.
psql -X -h "$seo_test_root/socket" -d postgres -v ON_ERROR_STOP=1 -c 'ALTER TABLE public.resources RENAME COLUMN published TO old_published; ALTER TABLE public.resources ADD COLUMN published integer DEFAULT 0;' >/dev/null
if psql -X -h "$seo_test_root/socket" -d postgres -v ON_ERROR_STOP=1 -f "$seo_repo_root/migrations/20261006-public-seo.sql" >"$seo_test_root/incompatible.log" 2>&1; then
  echo 'FAIL: incompatible publication type was accepted'; exit 1
fi
if ! rg -q 'public.resources.published must be boolean, found integer' "$seo_test_root/incompatible.log"; then
  cat "$seo_test_root/incompatible.log"; exit 1
fi
psql -X -h "$seo_test_root/socket" -d postgres -v ON_ERROR_STOP=1 -c "DO \$\$ BEGIN IF (SELECT count(*) FROM public.resources) <> 3 THEN RAISE EXCEPTION 'Existing records changed'; END IF; END \$\$;" >/dev/null
echo 'PASS: incompatible schema fails without changing records'
