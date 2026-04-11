import { CATEGORY_HIERARCHY } from './categories';

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/&/g, ' y ')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

const CATEGORY_SLUG_OVERRIDES: Record<string, string> = {
  'Energía Solar': 'energia-solar',
  'Hidráulica': 'hidraulica',
  'Droguería': 'drogueria',
  // Canonical slug for Químicos to avoid overlap with Piscinas > Cloro y Químicos.
  'Químicos': 'agroquimicos',
};

const CATEGORY_SLUG_ALIASES: Record<string, string> = {
  quimicos: 'agroquimicos',
  quimico: 'agroquimicos',
};

const CATEGORY_VALUE_ALIASES: Record<string, string> = {
  agroquimicos: 'Químicos',
  'agroquímicos': 'Químicos',
  quimicos: 'Químicos',
  'químicos': 'Químicos',
};

function findCategoryValue(categoryValue: string): string | null {
  const raw = categoryValue.trim();
  if (!raw) return null;

  const alias = CATEGORY_VALUE_ALIASES[raw.toLowerCase()];
  const searchValue = alias || raw;

  const match = CATEGORY_HIERARCHY.find(
    (cat) => cat.value.toLowerCase() === searchValue.toLowerCase()
  );
  return match?.value ?? null;
}

const CATEGORY_SLUG_TO_VALUE = new Map<string, string>(
  CATEGORY_HIERARCHY.map((cat) => {
    const overridden = CATEGORY_SLUG_OVERRIDES[cat.value];
    const slug = overridden || slugify(cat.value);
    return [slug, cat.value];
  })
);

export function getCategorySlug(categoryValue: string): string | null {
  const safeValue = findCategoryValue(categoryValue);
  if (!safeValue) return null;
  return CATEGORY_SLUG_OVERRIDES[safeValue] || slugify(safeValue);
}

export function getCategoryFromSlug(inputSlug: string): string | null {
  const normalized = slugify(inputSlug);
  const canonicalSlug = CATEGORY_SLUG_ALIASES[normalized] || normalized;
  return CATEGORY_SLUG_TO_VALUE.get(canonicalSlug) ?? null;
}

export function isCategorySlug(inputSlug: string): boolean {
  return !!getCategoryFromSlug(inputSlug);
}

export function getCategoryPath(categoryValue: string): string {
  const slug = getCategorySlug(categoryValue);
  if (!slug) return '/productos';
  return `/productos/categoria/${slug}`;
}

export function buildCategoryUrl(
  categoryValue: string,
  search?: URLSearchParams | Record<string, string | undefined>
): string {
  const basePath = getCategoryPath(categoryValue);
  if (!search) return basePath;

  const params =
    search instanceof URLSearchParams
      ? new URLSearchParams(search.toString())
      : new URLSearchParams(
          Object.entries(search).filter(([, value]) => Boolean(value)) as Array<[string, string]>
        );

  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}
