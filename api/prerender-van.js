// ============================================================================
// Prerender /van/:id pour les crawlers (Google, Bing, GPTBot, ClaudeBot…)
// ============================================================================
// Les humains reçoivent la SPA React (inchangée). Les bots — routés ici par
// vercel.json via leur user-agent — reçoivent un HTML complet généré depuis
// les MÊMES données Firestore que l'app (parité de contenu = pas de cloaking).
//
// Bénéfices : indexation des annonces, vraies 404 (fin des soft 404), aperçus
// riches sur les réseaux (OG), et lisibilité par les moteurs IA (GEO).
// ============================================================================

const { BRANDS, matchesBrand } = require('./_lib/taxonomy');
const { ORIGIN, esc, cdnImg, fetchAllVans } = require('./_lib/util');
const vehicleData = require('../src/data/seo/vehicle-schema.cjs');
const selfContained = require('../src/data/seo/self-contained.cjs');

// ── Maillage interne (liens uniquement vers des pages qui existent) ─────────
// Même liste que prerender-location.js : un lien vers /location/napier alors
// que la page n'existe pas = une 404 de plus dans GSC.
const LOCATION_SLUGS = {
  auckland: 'Auckland', wellington: 'Wellington', christchurch: 'Christchurch',
  queenstown: 'Queenstown', rotorua: 'Rotorua', dunedin: 'Dunedin',
  hamilton: 'Hamilton', tauranga: 'Tauranga', nelson: 'Nelson',
};
const BRAND_PAGES = Object.entries(BRANDS).map(([slug, brand]) => ({ slug, label: brand.name }));

const label = (k) =>
  k.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()).trim();

function page404() {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Listing not found | Kiwi Van Market</title>
<meta name="robots" content="noindex">
</head><body>
<h1>This campervan listing no longer exists</h1>
<p>It may have been sold or removed by the seller.</p>
<p><a href="${ORIGIN}/">Browse all campervans for sale in New Zealand</a></p>
</body></html>`;
}

module.exports = async function handler(req, res) {
  const id = String(req.query.id || '').replace(/[^A-Za-z0-9_-]/g, '');
  if (!id) {
    res.status(404).setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(page404());
  }

  // Un seul appel Firestore pour l'annonce ET les annonces similaires (le
  // maillage entre /van/:id est ce qui fait crawler le catalogue : sans lui,
  // une annonce n'est atteignable que depuis la home, sa ville ou son
  // sitemap).
  let van; let all;
  try {
    all = await fetchAllVans();
    van = all.find((v) => v.id === id);
    if (!van) {
      res.status(404).setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 's-maxage=3600');
      return res.send(page404());
    }
  } catch (e) {
    // En cas d'erreur amont, ne pas indexer une page cassée.
    res.status(503).setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Retry-After', '300');
    return res.send('<!DOCTYPE html><title>Temporarily unavailable</title>');
  }

  // Annonces retirées/masquées → vraie 404 (élimine les soft 404 de GSC)
  if (van.status && van.status !== 'active' && van.status !== 'sold') {
    res.status(404).setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600');
    return res.send(page404());
  }

  const sold = van.status === 'sold';
  const url = `${ORIGIN}/van/${id}`;
  const images = vehicleData.images(van);
  const title = vehicleData.title(van);
  const price = van.price ? `$${Number(van.price).toLocaleString('en-NZ')} NZD` : 'Price on request';
  const metaDesc = vehicleData.description(van);

  const equipment = van.equipment && typeof van.equipment === 'object'
    ? Object.keys(van.equipment).filter((k) => van.equipment[k] === true).map(label)
    : [];

  const locSlug = van.location && LOCATION_SLUGS[String(van.location).toLowerCase()]
    ? String(van.location).toLowerCase() : null;
  const brand = BRAND_PAGES.find((b) => matchesBrand(van, b.slug));

  // Annonces similaires : même ville d'abord, puis même marque, puis les plus
  // récentes. Actives uniquement, 4 max.
  const sameCity = (v) => van.location && v.location === van.location;
  const sameBrand = (v) => brand && matchesBrand(v, brand.slug);
  const similar = all
    .filter((v) => v.id !== id && v.status !== 'sold')
    .sort((a, b) => (Number(sameCity(b)) + Number(sameBrand(b))) - (Number(sameCity(a)) + Number(sameBrand(a)))
      || String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
    .slice(0, 4);

  // ── JSON-LD : parité avec VanSeo.jsx ──────────────────────────────────────
  const vehicleLd = vehicleData.schema(van);
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: ORIGIN },
      locSlug ? { '@type': 'ListItem', position: 2, name: van.location, item: `${ORIGIN}/location/${locSlug}` } : null,
      { '@type': 'ListItem', position: locSlug ? 3 : 2, name: van.title || 'Campervan', item: url },
    ].filter(Boolean),
  };
  const cleanLd = (o) => JSON.stringify(o).replace(/</g, '\\u003c');

  const specRows = [
    ['Price', price + (sold ? ' — SOLD' : '')],
    van.year ? ['Year', van.year] : null,
    van.mileage ? ['Mileage', `${Number(van.mileage).toLocaleString('en-NZ')} km`] : null,
    van.location ? ['Location', `${van.location}, New Zealand`] : null,
    van.type ? ['Type', van.type] : null,
    van.capacity ? ['Sleeps (seller declaration)', van.capacity] : null,
    [selfContained.COPY.en.label, selfContained.describe(van)],
    van.wofExpiry ? ['WOF expiry', van.wofExpiry] : null,
    van.regoExpiry ? ['REGO expiry', van.regoExpiry] : null,
    van.buyBack ? ['Buy-back option', 'Available'] : null,
  ].filter(Boolean);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} | Kiwi Van Market</title>
<meta name="description" content="${esc(metaDesc)}">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="${url}">
<meta property="og:type" content="product">
<meta property="og:title" content="${esc(title)} | Kiwi Van Market">
<meta property="og:description" content="${esc(metaDesc)}">
<meta property="og:url" content="${url}">
<meta property="og:site_name" content="Kiwi Van Market">
<meta property="og:locale" content="en_NZ">
${images[0] ? `<meta property="og:image" content="${esc(cdnImg(images[0], 1200))}">` : ''}
${van.price ? `<meta property="product:price:amount" content="${esc(van.price)}"><meta property="product:price:currency" content="NZD">` : ''}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)} | Kiwi Van Market">
<meta name="twitter:description" content="${esc(metaDesc)}">
${images[0] ? `<meta name="twitter:image" content="${esc(cdnImg(images[0], 1200))}">` : ''}
<script type="application/ld+json">${cleanLd(vehicleLd)}</script>
<script type="application/ld+json">${cleanLd(breadcrumbLd)}</script>
<style>body{font-family:system-ui,sans-serif;max-width:760px;margin:0 auto;padding:16px;color:#1e293b;line-height:1.6}img{max-width:100%;height:auto;border-radius:8px}table{border-collapse:collapse;width:100%}td{padding:6px 10px;border-bottom:1px solid #e2e8f0}td:first-child{font-weight:600;width:40%}.price{font-size:1.5rem;font-weight:800;color:#059669}.sold{color:#dc2626}nav a{margin-right:12px}</style>
</head>
<body>
<header>
  <p><a href="${ORIGIN}/"><strong>Kiwi Van Market</strong></a> — Buy and Sell Campervans in New Zealand</p>
  <nav>
    <a href="${ORIGIN}/">All campervans for sale</a>
    ${locSlug ? `<a href="${ORIGIN}/location/${locSlug}">Campervans in ${esc(van.location)}</a>` : ''}
    ${brand ? `<a href="${ORIGIN}/brand/${brand.slug}">${brand.label} for sale NZ</a>` : ''}
    <a href="${ORIGIN}/guides">Buying guides</a>
  </nav>
</header>
<main>
  <h1>${esc(title)}</h1>
  <p class="price">${esc(price)}${sold ? ' <span class="sold">— SOLD</span>' : ''}</p>
  ${images.slice(0, 5).map((u, i) => `<img src="${esc(cdnImg(u, 800))}" alt="${esc(van.title || 'Campervan')} — photo ${i + 1}" ${i > 0 ? 'loading="lazy"' : ''}>`).join('\n  ')}
  <h2>Key details</h2>
  <table><tbody>
  ${specRows.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join('\n  ')}
  </tbody></table>
  <p>${esc(selfContained.COPY.en.guidance)} <a href="${selfContained.SOURCE}">${esc(selfContained.COPY.en.sourceLabel)}</a>.</p>
  <h2>Description</h2>
  ${String(van.description || '').split(/\n+/).filter(Boolean).map((p) => `<p>${esc(p)}</p>`).join('\n  ') || '<p>Contact the seller for more details.</p>'}
  ${equipment.length ? `<h2>Equipment &amp; features</h2>\n  <ul>${equipment.map((e) => `<li>${esc(e)}</li>`).join('')}</ul>` : ''}
  <h2>Seller</h2>
  <p>${esc((van.seller && van.seller.name) || 'Private seller')} — contact via the listing page on Kiwi Van Market.</p>
  <p><a href="${url}">View this listing and contact the seller →</a></p>
  ${similar.length ? `<h2>Similar campervans for sale</h2>
  <ul>${similar.map((v) => `<li><a href="${ORIGIN}/van/${esc(v.id)}">${esc(`${v.year ? v.year + ' ' : ''}${v.title || 'Campervan'}`)}</a> — ${v.price ? `$${Number(v.price).toLocaleString('en-NZ')} NZD` : 'Price on request'}${v.location ? `, ${esc(v.location)}` : ''}</li>`).join('\n  ')}</ul>` : ''}
</main>
<footer>
  <p>Kiwi Van Market — New Zealand's peer-to-peer campervan marketplace. Free listings, CarJam checks, WOF/REGO visibility, self-contained filters.</p>
  <nav>
    <a href="${ORIGIN}/guide/buying-campervan-nz">How to buy a campervan in NZ</a>
    <a href="${ORIGIN}/guide/selling-campervan-nz">How to sell your campervan</a>
    <a href="${ORIGIN}/faq">FAQ</a>
  </nav>
</footer>
</body>
</html>`;

  res.status(200);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
  return res.send(html);
};
