const CITY_META = [
  { slug: 'auckland', name: 'Auckland' },
  { slug: 'christchurch', name: 'Christchurch' },
  { slug: 'wellington', name: 'Wellington' },
  { slug: 'queenstown', name: 'Queenstown' },
  { slug: 'hamilton', name: 'Hamilton' },
  { slug: 'tauranga', name: 'Tauranga' },
  { slug: 'rotorua', name: 'Rotorua' },
  { slug: 'dunedin', name: 'Dunedin' },
  { slug: 'nelson', name: 'Nelson' },
];

const BRAND_META = [
  { slug: 'toyota-hiace', name: 'Toyota Hiace', terms: ['toyota', 'hiace'] },
  { slug: 'nissan-caravan', name: 'Nissan Caravan', terms: ['nissan', 'caravan'] },
  { slug: 'mazda-bongo', name: 'Mazda Bongo', terms: ['mazda', 'bongo'] },
  { slug: 'mitsubishi-delica', name: 'Mitsubishi Delica', terms: ['mitsubishi', 'delica'] },
  { slug: 'ford-transit', name: 'Ford Transit', terms: ['ford', 'transit'] },
  { slug: 'mercedes-sprinter', name: 'Mercedes Sprinter', terms: ['mercedes', 'sprinter'] },
];

const BUDGETS = [8000, 12000, 15000, 18000, 22000];
const BRAND_CITY_FOCUS = ['auckland', 'christchurch', 'wellington', 'queenstown'];
const BRAND_BUDGETS = [12000, 18000, 22000];

function createBudgetPage(city, budget) {
  const slug = `buy-campervan-in-${city.slug}-under-${budget}`;
  return {
    slug,
    title: `Buy Campervan in ${city.name} Under ${budget} NZD`,
    description: `Browse campervans in ${city.name} under NZ$${budget.toLocaleString()}. Compare trust-first listings with WOF/REGO and direct seller contact.`,
    heading: `Buy a campervan in ${city.name} under NZ$${budget.toLocaleString()}`,
    city: city.slug,
    maxPrice: budget,
    selfContainedOnly: false,
  };
}

function createSelfContainedPage(city) {
  const slug = `self-contained-van-${city.slug}`;
  return {
    slug,
    title: `Self-Contained Van ${city.name}`,
    description: `Find self-contained vans in ${city.name}, New Zealand. Compare listings with trust signals and clear compliance details.`,
    heading: `Self-contained vans in ${city.name}`,
    city: city.slug,
    selfContainedOnly: true,
  };
}

function createBrandCityBudgetPage(city, brand, budget) {
  const slug = `${brand.slug}-${city.slug}-under-${budget}`;
  return {
    slug,
    title: `${brand.name} in ${city.name} Under ${budget} NZD`,
    description: `Find ${brand.name} campervans in ${city.name} under NZ$${budget.toLocaleString()}. Compare trusted listings and contact sellers directly.`,
    heading: `${brand.name} in ${city.name} under NZ$${budget.toLocaleString()}`,
    city: city.slug,
    maxPrice: budget,
    selfContainedOnly: false,
    brandTerms: brand.terms,
  };
}

const pages = [];

CITY_META.forEach((city) => {
  BUDGETS.forEach((budget) => pages.push(createBudgetPage(city, budget)));
  pages.push(createSelfContainedPage(city));
});

BRAND_META.forEach((brand) => {
  CITY_META
    .filter((city) => BRAND_CITY_FOCUS.includes(city.slug))
    .forEach((city) => {
      BRAND_BUDGETS.forEach((budget) => pages.push(createBrandCityBudgetPage(city, brand, budget)));
    });
});

export const LONG_TAIL_PAGE_LIST = pages;
export const LONG_TAIL_PAGE_MAP = pages.reduce((acc, page) => {
  acc[page.slug] = page;
  return acc;
}, {});

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
