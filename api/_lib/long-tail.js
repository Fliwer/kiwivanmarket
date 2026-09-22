// ============================================================================
// Pages longue traîne /search/:slug — miroir CommonJS de
// src/constants/seoLongTailPages.js (même convention que guides-data.json :
// copie manuelle, à resynchroniser si le générateur change côté React).
//
// 126 pages générées : 9 villes × 5 budgets, 9 self-contained, 6 marques ×
// 4 villes × 3 budgets. La plupart n'ont aucun van : c'est MIN_INDEXABLE qui
// décide lesquelles méritent l'index (les autres restent en noindex jusqu'à
// ce que des annonces arrivent).
// ============================================================================

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

// En dessous, la page est trop mince pour l'index : elle reste servie (utile
// à l'humain, et elle bascule en indexable toute seule dès que le stock monte).
const MIN_INDEXABLE = 3;

function createBudgetPage(city, budget) {
  return {
    slug: `buy-campervan-in-${city.slug}-under-${budget}`,
    title: `Buy Campervan in ${city.name} Under ${budget} NZD`,
    description: `Browse campervans in ${city.name} under NZ$${budget.toLocaleString()}. Compare trust-first listings with WOF/REGO and direct seller contact.`,
    heading: `Buy a campervan in ${city.name} under NZ$${budget.toLocaleString()}`,
    city: city.slug,
    cityName: city.name,
    maxPrice: budget,
    selfContainedOnly: false,
  };
}

function createSelfContainedPage(city) {
  return {
    slug: `self-contained-van-${city.slug}`,
    title: `Self-Contained Van ${city.name}`,
    description: `Find self-contained vans in ${city.name}, New Zealand. Compare listings with trust signals and clear compliance details.`,
    heading: `Self-contained vans in ${city.name}`,
    city: city.slug,
    cityName: city.name,
    selfContainedOnly: true,
  };
}

function createBrandCityBudgetPage(city, brand, budget) {
  return {
    slug: `${brand.slug}-${city.slug}-under-${budget}`,
    title: `${brand.name} in ${city.name} Under ${budget} NZD`,
    description: `Find ${brand.name} campervans in ${city.name} under NZ$${budget.toLocaleString()}. Compare trusted listings and contact sellers directly.`,
    heading: `${brand.name} in ${city.name} under NZ$${budget.toLocaleString()}`,
    city: city.slug,
    cityName: city.name,
    maxPrice: budget,
    selfContainedOnly: false,
    brandSlug: brand.slug,
    brandName: brand.name,
    brandTerms: brand.terms,
  };
}

const LONG_TAIL_PAGE_LIST = [];
CITY_META.forEach((city) => {
  BUDGETS.forEach((budget) => LONG_TAIL_PAGE_LIST.push(createBudgetPage(city, budget)));
  LONG_TAIL_PAGE_LIST.push(createSelfContainedPage(city));
});
BRAND_META.forEach((brand) => {
  CITY_META
    .filter((city) => BRAND_CITY_FOCUS.includes(city.slug))
    .forEach((city) => {
      BRAND_BUDGETS.forEach((budget) => LONG_TAIL_PAGE_LIST.push(createBrandCityBudgetPage(city, brand, budget)));
    });
});

const LONG_TAIL_PAGE_MAP = Object.fromEntries(LONG_TAIL_PAGE_LIST.map((p) => [p.slug, p]));

// Même filtre que SeoLongTailPage.jsx (ville par inclusion, plafond de prix,
// self-contained, marque par mots-clés du titre).
function matchesPage(van, page) {
  if (!(van.location || '').toLowerCase().includes(page.city)) return false;
  if (typeof page.maxPrice === 'number' && (van.price || 0) > page.maxPrice) return false;
  if (page.selfContainedOnly && !van.selfContained) return false;
  if (page.brandTerms) {
    const t = (van.title || '').toLowerCase();
    if (!page.brandTerms.some((k) => t.includes(k))) return false;
  }
  return true;
}

function vansForPage(vans, page) {
  return vans.filter((v) => matchesPage(v, page)).sort((a, b) => {
    // Actifs d'abord, puis les plus récents.
    const s = (a.status === 'sold' ? 1 : 0) - (b.status === 'sold' ? 1 : 0);
    if (s) return s;
    return String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
  });
}

// Pages qui méritent l'index, calculées d'un coup pour tout le catalogue.
// Deux barrières :
//  1. >= MIN_INDEXABLE vans actifs (page vide = doorway page).
//  2. Dédup des paliers de budget. "Auckland < 8 000", "< 12 000" … "< 22 000"
//     sont des sous-ensembles emboîtés : si un palier n'apporte pas au moins
//     MIN_INDEXABLE vans de plus que le palier indexable précédent, Google le
//     voit comme un doublon (GSC : « Page en double », « Détectée, non
//     indexée ») et ça dilue le budget de crawl de tout le site. Idem si le
//     palier le plus large recouvre quasiment toute la page /location/:city.
// Les pages exclues restent servies en noindex,follow et reviennent toutes
// seules dès que le stock le justifie.
const PARENT_OVERLAP_MAX = 0.9;

function indexableSlugs(vans) {
  const active = vans.filter((v) => v.status !== 'sold');
  const keep = new Set();
  const ladders = new Map();
  LONG_TAIL_PAGE_LIST.forEach((page) => {
    const count = vansForPage(active, page).length;
    if (typeof page.maxPrice !== 'number') {
      // Self-contained : quasi tout le stock l'est, la page recouvre souvent
      // /location/:city à 95 %.
      const cityCount = vansForPage(active, { ...page, selfContainedOnly: false }).length;
      if (count >= MIN_INDEXABLE && count <= cityCount * PARENT_OVERLAP_MAX) keep.add(page.slug);
      return;
    }
    const key = `${page.city}|${page.brandSlug || ''}`;
    if (!ladders.has(key)) ladders.set(key, []);
    ladders.get(key).push({ page, count });
  });
  ladders.forEach((tiers) => {
    tiers.sort((a, b) => a.page.maxPrice - b.page.maxPrice);
    // Sans plafond = ce que montre déjà /location/:city ; un palier qui
    // recouvre presque tout n'apporte rien de plus à l'index.
    const parent = { ...tiers[0].page, maxPrice: undefined };
    const parentCount = vansForPage(active, parent).length;
    let prevKept = 0;
    tiers.forEach(({ page, count }) => {
      if (count < MIN_INDEXABLE) return;
      if (count - prevKept < MIN_INDEXABLE) return;
      if (!page.brandSlug && count > parentCount * PARENT_OVERLAP_MAX) return;
      keep.add(page.slug);
      prevKept = count;
    });
  });
  return keep;
}

module.exports = {
  CITY_META, BRAND_META, MIN_INDEXABLE,
  LONG_TAIL_PAGE_LIST, LONG_TAIL_PAGE_MAP, matchesPage, vansForPage, indexableSlugs,
};
