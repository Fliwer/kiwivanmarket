import catalog from '../data/seo/long-tail';

const { CITY_META, BRAND_META, LONG_TAIL_PAGE_LIST, LONG_TAIL_PAGE_MAP } = catalog;
const BUDGETS = [8000, 12000, 15000, 18000, 22000];
export { CITY_META, BRAND_META, LONG_TAIL_PAGE_LIST, LONG_TAIL_PAGE_MAP };
export const { indexableSlugs, vansForPage } = catalog;

export const FEATURED_LONG_TAIL_SLUGS = [
  'buy-campervan-in-auckland-under-15000',
  'buy-campervan-in-christchurch-under-15000',
  'buy-campervan-in-wellington-under-12000',
  'self-contained-van-auckland',
  'self-contained-van-christchurch',
  'self-contained-van-queenstown',
  'toyota-hiace-auckland-under-18000',
  'nissan-caravan-christchurch-under-12000',
];

function slugifyLocation(location = '') {
  return location.toLowerCase().trim().replace(/\s+/g, '-');
}

function inferBrandFromTitle(title = '') {
  const t = title.toLowerCase();
  return BRAND_META.find((brand) => brand.terms.some((term) => t.includes(term))) || null;
}

function closestBudgetCeiling(price = 0) {
  if (!price || price <= 0) return BUDGETS[1];
  for (const budget of BUDGETS) {
    if (price <= budget) return budget;
  }
  return BUDGETS[BUDGETS.length - 1];
}

export function getLongTailSlugsForVan(van) {
  const city = slugifyLocation(van?.location || '');
  if (!city) return [];
  const budget = closestBudgetCeiling(Number(van?.price || 0));
  const slugs = [`buy-campervan-in-${city}-under-${budget}`];
  if (van?.selfContained) slugs.push(`self-contained-van-${city}`);
  const brand = inferBrandFromTitle(van?.title || '');
  if (brand) slugs.push(`${brand.slug}-${city}-under-${budget}`);
  return slugs.filter((slug) => LONG_TAIL_PAGE_MAP[slug]);
}
