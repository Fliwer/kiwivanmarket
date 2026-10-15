const BRANDS = {
  'toyota-hiace': { name: 'Toyota Hiace', searchTerms: ['hiace'] },
  'nissan-caravan': { name: 'Nissan Caravan', searchTerms: ['caravan', 'caravane', 'homy'] },
  'mazda-bongo': { name: 'Mazda Bongo', searchTerms: ['bongo'] },
  'mitsubishi-delica': { name: 'Mitsubishi Delica', searchTerms: ['delica', 'l300'] },
  'ford-transit': { name: 'Ford Transit', searchTerms: ['transit'] },
  'mercedes-sprinter': { name: 'Mercedes Sprinter', searchTerms: ['sprinter'] },
};

const LOCATIONS = {
  auckland: 'Auckland', christchurch: 'Christchurch', wellington: 'Wellington',
  queenstown: 'Queenstown', rotorua: 'Rotorua', dunedin: 'Dunedin',
  hamilton: 'Hamilton', tauranga: 'Tauranga', nelson: 'Nelson',
};

function matchesBrand(van, slug) {
  const brand = BRANDS[slug];
  if (!brand) return false;
  // Descriptions often mention alternatives. A manufacturer alone cannot
  // identify a model: Toyota Estima and Toyota Hiace are different vehicles.
  const text = `${String(van.title || '')} ${String(van.model || '')}`.toLowerCase();
  if (slug === 'nissan-caravan') {
    // "Caravane" is a common French noun as well as a translated model
    // title. Require Nissan evidence; Homy is the corresponding model alias.
    const manufacturer = `${text} ${String(van.brand || '')} ${String(van.make || '')}`;
    const declared = [van.brand, van.make].filter((value) => typeof value === 'string' && value.trim());
    if (declared.some((value) => !/\bnissan\b/i.test(value))) return false;
    return /\bhomy\b/i.test(text) || (/\bnissan\b/i.test(manufacturer) && /\bcaravane?\b/i.test(text));
  }
  return brand.searchTerms.some((term) => {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i').test(text);
  });
}

function vansForTaxonomy(vans, kind, slug) {
  if (kind === 'brands') {
    const brand = BRANDS[slug];
    return brand ? vans.filter((v) => matchesBrand(v, slug)) : [];
  }
  if (kind === 'locations' && LOCATIONS[slug]) {
    return vans.filter((v) => String(v.location || '').toLowerCase().includes(slug)
      || String(v.region || '').toLowerCase().includes(slug));
  }
  return [];
}

// Sold listings remain accessible, but an exhausted category should not be
// submitted as a page of vehicles for sale. Match the site's visible statuses.
function hasActiveStock(vans) {
  return activeStock(vans).length > 0;
}

const activeStock = (vans) => vans.filter((van) => !van.status || van.status === 'active');

// A known model can identify a manufacturer; a title's first word cannot
// (it may be a year, a nickname or a marketing adjective).
function vehicleIdentity(van) {
  const explicit = (value) => typeof value === 'string' && /[a-z]/i.test(value) ? value.trim() : undefined;
  const comparison = /\b(alternative|compared?|than|versus|vs|comme)\b/i.test(String(van.title || ''));
  const known = comparison ? null : Object.keys(BRANDS).find((slug) => matchesBrand(van, slug));
  const knownName = known ? BRANDS[known].name : '';
  const l300 = known === 'mitsubishi-delica' && /\bl300\b/i.test(`${van.title || ''} ${van.model || ''}`);
  const homy = known === 'nissan-caravan' && /\bhomy\b/i.test(`${van.title || ''} ${van.model || ''}`);
  return {
    brand: explicit(van.brand) || explicit(van.make) || (knownName ? knownName.split(' ')[0] : undefined),
    model: explicit(van.model) || (l300 ? 'L300' : homy ? 'Homy' : knownName ? knownName.split(' ').slice(1).join(' ') : undefined),
  };
}

export default { BRANDS, LOCATIONS, matchesBrand, vansForTaxonomy, hasActiveStock, activeStock, vehicleIdentity };
