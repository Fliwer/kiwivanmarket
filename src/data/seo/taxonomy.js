const BRANDS = {
  'toyota-hiace': { name: 'Toyota Hiace', searchTerms: ['toyota', 'hiace'] },
  'nissan-caravan': { name: 'Nissan Caravan', searchTerms: ['nissan', 'caravan'] },
  'mazda-bongo': { name: 'Mazda Bongo', searchTerms: ['mazda', 'bongo'] },
  'mitsubishi-delica': { name: 'Mitsubishi Delica', searchTerms: ['mitsubishi', 'delica'] },
  'ford-transit': { name: 'Ford Transit', searchTerms: ['ford', 'transit'] },
  'mercedes-sprinter': { name: 'Mercedes Sprinter', searchTerms: ['mercedes', 'sprinter'] },
};

const LOCATIONS = {
  auckland: 'Auckland', christchurch: 'Christchurch', wellington: 'Wellington',
  queenstown: 'Queenstown', rotorua: 'Rotorua', dunedin: 'Dunedin',
  hamilton: 'Hamilton', tauranga: 'Tauranga', nelson: 'Nelson',
};

function vansForTaxonomy(vans, kind, slug) {
  if (kind === 'brands') {
    const brand = BRANDS[slug];
    return brand ? vans.filter((v) => {
      const text = (String(v.title || '') + ' ' + String(v.description || '')).toLowerCase();
      return brand.searchTerms.some((term) => text.includes(term));
    }) : [];
  }
  if (kind === 'locations' && LOCATIONS[slug]) {
    return vans.filter((v) => String(v.location || '').toLowerCase().includes(slug)
      || String(v.region || '').toLowerCase().includes(slug));
  }
  return [];
}

export default { BRANDS, LOCATIONS, vansForTaxonomy };
