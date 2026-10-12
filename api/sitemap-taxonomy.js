// Submit only category pages that the prerender serves as indexable.
const { fetchAllVans, latestUpdate, esc } = require('./_lib/util');
const { langUrl, SUPPORTED } = require('./_lib/i18n');
const { BRANDS, LOCATIONS, vansForTaxonomy } = require('./_lib/taxonomy');

module.exports = async function handler(req, res) {
  const kind = req.query.kind;
  const config = kind === 'brands' ? BRANDS : kind === 'locations' ? LOCATIONS : null;
  if (!config) return res.status(404).send('');
  let vans;
  try {
    vans = await fetchAllVans();
  } catch (error) {
    res.status(503).setHeader('Retry-After', '300');
    return res.send('');
  }
  const prefix = kind === 'brands' ? 'brand' : 'location';
  const urls = Object.keys(config).flatMap((slug) => {
    const matches = vansForTaxonomy(vans, kind, slug);
    if (!matches.length) return [];
    return SUPPORTED.map((lang) => `  <url><loc>${esc(langUrl(`/${prefix}/${slug}`, lang))}</loc><lastmod>${latestUpdate(matches)}</lastmod></url>`);
  });
  res.status(200);
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
  return res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`);
};
