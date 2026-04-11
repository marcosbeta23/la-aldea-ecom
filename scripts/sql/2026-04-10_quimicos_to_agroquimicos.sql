-- DEFERRED MIGRATION (DO NOT EXECUTE YET)
--
-- Goal (overlap-aware):
--   Keep "Químicos" as main category for now, and enrich products with sub-tags
--   that separate pool chemistry vs agro chemistry, including the overlap needed
--   by Droguería and Piscinas.
--
-- Why this replaces the old rename idea:
--   A direct "Químicos" -> "Agroquímicos" rename is too aggressive because
--   many pool products are also tagged under Piscinas/Droguería.
--
-- Preconditions:
-- 1) CATEGORY_HIERARCHY includes these sub-tags:
--    - "Químicos Piscina"
--    - "Químicos Piscina Droguería"
--    - "Agroquímicos"
-- 2) Admin form and filters are deployed with those values.
-- 3) Run first in staging and validate category filters/sitemap.

begin;

-- 1) Snapshot for rollback safety
create table if not exists migration_backup_products_quimicos_alignment_20260410 as
select id, slug, name, category
from products
where category && array['Químicos', 'Piscinas', 'Droguería'];

-- 2) Dry-run preview
with candidates as (
  select
    id,
    category,
    lower(coalesce(name, '') || ' ' || coalesce(description, '')) as haystack
  from products
  where category && array['Químicos', 'Piscinas', 'Droguería']
),
classified as (
  select
    id,
    category,
    (haystack ~ '(cloro|alguicida|algicida|floculante|clarificador|piscina|pileta|ph\s*minus|ph\s*plus)') as is_pool_chem,
    (haystack ~ '(herbicida|fungicida|insecticida|agroquimic|coadyuvante|fertilizante)') as is_agro_chem
  from candidates
)
select
  count(*) as candidate_products,
  sum(case when is_pool_chem then 1 else 0 end) as pool_chem_candidates,
  sum(case when is_agro_chem then 1 else 0 end) as agro_chem_candidates
from classified;

-- 3) Enrich category arrays with overlap-aware sub-tags (without renaming main category)
with candidates as (
  select
    id,
    category,
    lower(coalesce(name, '') || ' ' || coalesce(description, '')) as haystack
  from products
  where category && array['Químicos', 'Piscinas', 'Droguería']
),
classified as (
  select
    id,
    category,
    (haystack ~ '(cloro|alguicida|algicida|floculante|clarificador|piscina|pileta|ph\s*minus|ph\s*plus)') as is_pool_chem,
    (haystack ~ '(herbicida|fungicida|insecticida|agroquimic|coadyuvante|fertilizante)') as is_agro_chem
  from candidates
)
update products p
set category = (
  select array_agg(distinct tag order by tag)
  from unnest(
    p.category
    || case
      when c.is_pool_chem and p.category @> array['Químicos']
      then array['Químicos Piscina']::text[]
      else array[]::text[]
    end
    || case
      when c.is_pool_chem and p.category @> array['Droguería']
      then array['Químicos Piscina Droguería']::text[]
      else array[]::text[]
    end
    || case
      when c.is_pool_chem and p.category @> array['Piscinas']
      then array['Cloro y Químicos']::text[]
      else array[]::text[]
    end
    || case
      when c.is_agro_chem and p.category @> array['Químicos']
      then array['Agroquímicos']::text[]
      else array[]::text[]
    end
  ) as tag
)
from classified c
where p.id = c.id
  and (c.is_pool_chem or c.is_agro_chem);

-- 4) Validation queries
select count(*) as tagged_quimicos_piscina
from products
where category @> array['Químicos Piscina'];

select count(*) as tagged_quimicos_piscina_drogueria
from products
where category @> array['Químicos Piscina Droguería'];

select count(*) as tagged_agroquimicos
from products
where category @> array['Agroquímicos'];

commit;

-- Rollback helper (manual):
-- update products p
-- set category = b.category
-- from migration_backup_products_quimicos_alignment_20260410 b
-- where p.id = b.id;
