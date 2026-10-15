import taxonomy from './taxonomy';

// Used by React and the crawler HTML so discovery links describe the same
// available inventory. Sold/hidden vehicles must not inflate the counts.
function inventoryLinks(vans = []) {
  const active = vans.filter((van) => !van.status || van.status === 'active');
  const group = (entries, kind) => Object.entries(entries).map(([slug, config]) => {
    const matches = taxonomy.vansForTaxonomy(active, kind, slug);
    const prices = matches.map((van) => Number(van.price)).filter((price) => Number.isFinite(price) && price > 0);
    return {
      path: `/${kind === 'brands' ? 'brand' : 'location'}/${slug}`,
      name: typeof config === 'string' ? config : config.name,
      count: matches.length,
      min: prices.length ? Math.min(...prices) : null,
    };
  }).filter((entry) => entry.count > 0);
  return {
    cities: group(taxonomy.LOCATIONS, 'locations'),
    models: group(taxonomy.BRANDS, 'brands'),
  };
}

export default inventoryLinks;
