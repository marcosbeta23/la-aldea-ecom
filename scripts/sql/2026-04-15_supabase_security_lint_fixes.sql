-- Supabase security linter remediations
-- Applied in project: glnyttjgqzpbiquvmujn
-- Date: 2026-04-15

-- 1) Views should use invoker permissions so RLS is respected
alter view if exists public.seo_audit set (security_invoker = true);
alter view if exists public.seo_product_audit set (security_invoker = true);

-- 2) Backup table should not be publicly queryable
alter table if exists public.migration_backup_products_quimicos_alignment_20260410 enable row level security;
alter table if exists public.migration_backup_products_quimicos_alignment_20260410 force row level security;
revoke all on table public.migration_backup_products_quimicos_alignment_20260410 from anon, authenticated;

-- 3) Replace always-true public insert policy with basic input constraints
drop policy if exists "Public insert quote requests" on public.quote_requests;
create policy "Public insert quote requests"
on public.quote_requests
for insert
to anon, authenticated
with check (
  length(btrim(name)) between 2 and 120
  and length(btrim(email)) between 5 and 254
  and email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  and length(regexp_replace(phone, '\D', '', 'g')) between 7 and 20
  and length(btrim(message)) between 10 and 5000
  and length(btrim(category)) between 2 and 60
  and lower(status) = 'pending'
);

-- 4) Keep extensions out of public schema
do $$
begin
  if exists (select 1 from pg_extension where extname = 'fuzzystrmatch') then
    alter extension fuzzystrmatch set schema extensions;
  end if;

  if exists (select 1 from pg_extension where extname = 'unaccent') then
    alter extension unaccent set schema extensions;
  end if;
end
$$;

-- 5) Set immutable search_path on flagged functions
do $$
declare
  fn record;
begin
  for fn in
    select n.nspname as schema_name,
           p.proname as function_name,
           pg_get_function_identity_arguments(p.oid) as identity_args
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in (
        'products_search_vector_trigger',
        'update_guide_date_modified',
        'search_products_semantic',
        'decrement_stock',
        'update_guides_updated_at',
        'immutable_unaccent',
        'increment_stock',
        'search_products_fuzzy'
      )
  loop
    execute format(
      'alter function %I.%I(%s) set search_path = pg_catalog, public, extensions',
      fn.schema_name,
      fn.function_name,
      fn.identity_args
    );
  end loop;
end
$$;
