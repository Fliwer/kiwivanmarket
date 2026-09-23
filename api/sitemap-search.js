// ============================================================================
// Sitemap dynamique des pages /search/:slug — uniquement celles qui passent la
// barrière qualité (>= MIN_INDEXABLE vans + dédup des paliers de budget, voir
// indexableSlugs). Recalculé à chaque requête (cache CDN 1 h) : une page entre
// ou sort du sitemap toute seule au gré du stock, sans rien regénérer à la
// main. Même mécanique que sitemap-vehicles.
//
// lastmod = dernière annonce modifiée sur la page, pas « aujourd'hui » : un
// lastmod qui bouge à chaque requête finit ignoré par Google.
// ============================================================================

const { ORIGIN, fetchAllVans, latestUpdate } = require('./_lib/util');
const { LONG_TAIL_PAGE_LIST, indexableSlugs, vansForPage } = require('./_lib/long-tail');

module.exports = async function handler(req, res) {
  let vans;
  try {
    vans = await fetchAllVans();
  } catch (e) {
    res.status(503).setHeader('Retry-After', '300');
    return res.send('');
  }

  const keep = indexableSlugs(vans);
  const urls = LONG_TAIL_PAGE_LIST
    .filter((page) => keep.has(page.slug))
    .map((page) => `  <url>
    <loc>${ORIGIN}/search/${page.slug}</loc>
    <lastmod>${latestUpdate(vansForPage(vans, page))}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  res.status(200);
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
  return res.send(xml);
};
