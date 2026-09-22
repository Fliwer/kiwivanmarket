// API Route Vercel - Génère le sitemap des vans dynamiquement depuis Firebase
// URL: https://kiwivanmarket.com/api/sitemap-vehicles
//
// Seules les annonces actives sont soumises : une annonce vendue reste servie
// (200, « SOLD ») pour qui a le lien, mais la pousser dans le sitemap en
// priorité 0.9 dit à Google de dépenser son crawl sur des pages sans valeur.
// lastmod = updatedAt/createdAt de l'annonce (pas doc.updateTime, qui bouge à
// chaque vue), sinon Google finit par ignorer le champ.

const { ORIGIN, fetchAllVans, latestUpdate } = require('./_lib/util');

module.exports = async function handler(req, res) {
  try {
    const vans = (await fetchAllVans()).filter((v) => v.status !== 'sold');

    const urls = vans.map((van) => `  <url>
    <loc>${ORIGIN}/van/${van.id}</loc>
    <lastmod>${latestUpdate([van])}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.status(200).send(sitemap);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    // 503 + Retry-After : Google garde la version précédente au lieu de
    // remplacer le sitemap par un fichier vide.
    res.setHeader('Retry-After', '300');
    res.status(503).send('');
  }
};
