// One calculation for visitors and crawlers. These are advertised prices,
// not completed transactions or a representative sample of the NZ market.
const MIN_SAMPLE = 5;
const MIN_PRICE = 1000;
const MAX_PRICE = 200000;
const MATCHERS = [
  ['Toyota Hiace', /\bhiace\b/i],
  ['Nissan Caravan', /\b(?:nissan\s+caravan|homy)\b/i],
  ['Nissan Elgrand', /\belgrand\b/i],
  ['Mitsubishi Delica', /\bdelica\b/i],
  ['Mitsubishi L300', /\bl300\b/i],
  ['Mazda Bongo', /\bbongo\b/i],
  ['Ford Transit', /\btransit\b/i],
  ['VW Transporter', /\b(?:transporter|kombi)\b/i],
  ['Hyundai iLoad', /\b(?:iload|imax)\b/i],
  ['Mercedes Sprinter', /\bsprinter\b/i],
  ['Mercedes Vito', /\bvito\b/i],
  ['Toyota (other models)', /\b(?:toyota|estima|regius|townace|liteace|granvia)\b/i],
  ['Nissan (other models)', /\b(?:nissan|serena|vanette|nv200)\b/i],
];
const LABELS = { fr: { 'Toyota (other models)': 'Toyota (autres modèles)', 'Nissan (other models)': 'Nissan (autres modèles)' } };

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

function calculate(vans, T, lang = 'en') {
  const eligible = (vans || []).filter((van) => {
    const price = Number(van.price);
    return (!van.status || van.status === 'active')
      && Number.isFinite(price) && price >= MIN_PRICE && price <= MAX_PRICE;
  });
  if (eligible.length < MIN_SAMPLE) return null;
  const prices = eligible.map((van) => Number(van.price));
  const summarize = (values) => ({ count: values.length, median: median(values), min: Math.min(...values), max: Math.max(...values) });
  const segment = (name, subset) => subset.length >= MIN_SAMPLE
    ? { name, label: name, ...summarize(subset.map((van) => Number(van.price))) } : null;
  const groups = new Map(MATCHERS.map(([name]) => [name, []]));
  for (const van of eligible) {
    const identity = [van.brand, van.make, van.model, van.title].filter(Boolean).join(' ');
    const match = MATCHERS.find(([, re]) => re.test(identity));
    if (match) groups.get(match[0]).push(van);
  }
  const year = (van) => Number(van.year);
  const validYear = (van) => Number.isInteger(year(van)) && year(van) >= 1900 && year(van) <= new Date().getUTCFullYear() + 1;
  return {
    total: prices.length, median: median(prices), min: Math.min(...prices), max: Math.max(...prices),
    byBrand: [...groups].map(([name, subset]) => segment(LABELS[lang]?.[name] || name, subset)).filter(Boolean).sort((a, b) => b.median - a.median),
    byAge: [
      segment(T.ageBefore, eligible.filter((v) => validYear(v) && year(v) < 2000)),
      segment(T.age2000, eligible.filter((v) => validYear(v) && year(v) >= 2000 && year(v) <= 2009)),
      segment(T.age2010, eligible.filter((v) => validYear(v) && year(v) >= 2010)),
    ].filter(Boolean),
    // Missing or malformed declarations are unknown, never a negative claim.
    selfContained: segment(T.scYes, eligible.filter((v) => v.selfContained === true)),
    notSelfContained: segment(T.scNo, eligible.filter((v) => v.selfContained === false)),
    buckets: [
      [T.bucketUnder, 0, 5000], ['$5,000 – $9,999', 5000, 10000],
      ['$10,000 – $14,999', 10000, 15000], ['$15,000 – $24,999', 15000, 25000],
      [T.bucketAbove, 25000, Infinity],
    ].map(([label, low, high]) => {
      const count = prices.filter((p) => p >= low && p < high).length;
      return { label, count, pct: Math.round(count / prices.length * 100) };
    }),
  };
}

function dataset(stats, T, lang, observedAt) {
  if (!stats) return null;
  const origin = 'https://kiwivanmarket.com';
  const url = `${origin}/campervan-prices-nz${lang === 'fr' ? '?lang=fr' : ''}`;
  return {
    '@context': 'https://schema.org', '@type': 'Dataset', '@id': `${url}#dataset`,
    name: T.datasetName(new Date(observedAt).getUTCFullYear()), description: T.datasetDesc(stats),
    url, inLanguage: lang, dateModified: observedAt, temporalCoverage: observedAt.slice(0, 10),
    creator: { '@type': 'Organization', '@id': `${origin}/#organization`, name: 'Kiwi Van Market', url: origin },
    spatialCoverage: { '@type': 'Country', name: 'New Zealand' },
    measurementTechnique: T.measurement,
    variableMeasured: [
      { '@type': 'PropertyValue', name: T.varMedian, value: stats.median, unitText: 'NZD' },
      { '@type': 'PropertyValue', name: T.varSample, value: stats.total, unitText: 'listings' },
    ],
  };
}

export default { calculate, dataset, MIN_SAMPLE, MIN_PRICE, MAX_PRICE };
