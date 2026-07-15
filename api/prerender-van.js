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

const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'kiwivanmarket';
const ORIGIN = 'https://kiwivanmarket.com';

// ── Parsing Firestore REST ──────────────────────────────────────────────────
function fv(field) {
  if (!field || typeof field !== 'object') return undefined;
  if ('stringValue' in field) return field.stringValue;
  if ('integerValue' in field) return Number(field.integerValue);
  if ('doubleValue' in field) return Number(field.doubleValue);
  if ('booleanValue' in field) return field.booleanValue;
  if ('timestampValue' in field) return field.timestampValue;
  if ('nullValue' in field) return null;
  if ('arrayValue' in field) return (field.arrayValue.values || []).map(fv);
  if ('mapValue' in field) return parseFields(field.mapValue.fields || {});
  return undefined;
}
function parseFields(fields) {
  const out = {};
  for (const k of Object.keys(fields)) out[k] = fv(fields[k]);
  return out;
}

// ── Sécurité : tout contenu utilisateur est échappé avant insertion HTML ────
const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );

// ── Images Cloudinary optimisées ────────────────────────────────────────────
const cdnImg = (url, w) =>
  typeof url === 'string' && url.includes('/upload/')
    ? url.replace('/upload/', `/upload/w_${w},c_limit,q_auto,f_auto/`)
    : url;

// ── Maillage interne (liens uniquement vers des pages qui existent) ─────────
const LOCATION_SLUGS = {
  auckland: 'Auckland', wellington: 'Wellington', christchurch: 'Christchurch',
  queenstown: 'Queenstown', rotorua: 'Rotorua', dunedin: 'Dunedin',
  hamilton: 'Hamilton', tauranga: 'Tauranga', nelson: 'Nelson', napier: 'Napier',
};
const BRAND_PAGES = [
  { slug: 'toyota-hiace', label: 'Toyota Hiace', kw: ['hiace'] },
  { slug: 'nissan-caravan', label: 'Nissan Caravan', kw: ['caravan', 'nissan'] },
  { slug: 'mitsubishi-delica', label: 'Mitsubishi Delica', kw: ['delica', 'l300', 'mitsubishi'] },
  { slug: 'mazda-bongo', label: 'Mazda Bongo', kw: ['bongo', 'mazda'] },
  { slug: 'ford-transit', label: 'Ford Transit', kw: ['transit', 'ford'] },
];

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

  let van;
  try {
    const r = await fetch(
      `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/vans/${id}`
    );
    if (r.status === 404) {
      res.status(404).setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 's-maxage=3600');
      return res.send(page404());
    }
    if (!r.ok) throw new Error(`Firestore ${r.status}`);
    const doc = await r.json();
    van = parseFields(doc.fields || {});
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
  const images = (Array.isArray(van.images) && van.images.length ? van.images : [van.imageUrl])
    .filter((u) => typeof u === 'string' && u.startsWith('https://'));
  const title = `${van.year ? van.year + ' ' : ''}${van.title || 'Campervan'} for Sale${van.location ? ' in ' + van.location : ' in New Zealand'}`;
  const price = van.price ? `$${Number(van.price).toLocaleString('en-NZ')} NZD` : 'Price on request';
  const descBits = [
    price,
    van.year,
    van.mileage ? `${Number(van.mileage).toLocaleString('en-NZ')} km` : null,
    van.selfContained ? 'Self-contained' : null,
    van.buyBack ? 'Buy-back available' : null,
    van.location ? `Located in ${van.location}` : null,
  ].filter(Boolean).join(' • ');
  const metaDesc = `${descBits}. ${String(van.description || '').replace(/\s+/g, ' ').slice(0, 100)}`.slice(0, 155);

  const equipment = van.equipment && typeof van.equipment === 'object'
    ? Object.keys(van.equipment).filter((k) => van.equipment[k] === true).map(label)
    : [];

  const locSlug = van.location && LOCATION_SLUGS[String(van.location).toLowerCase()]
    ? String(van.location).toLowerCase() : null;
  const titleLc = String(van.title || '').toLowerCase();
  const brand = BRAND_PAGES.find((b) => b.kw.some((k) => titleLc.includes(k)));

  // ── JSON-LD : parité avec VanSeo.jsx ──────────────────────────────────────
  const vehicleLd = {
    '@context': 'https://schema.org',
    '@type': 'Vehicle',
    '@id': url,
    name: van.title || 'Campervan',
    description: String(van.description || metaDesc).slice(0, 5000),
    image: images,
    url,
    vehicleModelDate: van.year ? String(van.year) : undefined,
    bodyType: 'Campervan',
    vehicleSeatingCapacity: van.capacity || undefined,
    mileageFromOdometer: van.mileage
      ? { '@type': 'QuantitativeValue', value: van.mileage, unitCode: 'KMT' }
      : undefined,
    itemCondition: 'https://schema.org/UsedCondition',
    offers: {
      '@type': 'Offer',
      price: van.price ? String(van.price) : undefined,
      priceCurrency: 'NZD',
      availability: sold ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/UsedCondition',
      seller: { '@type': 'Person', name: (van.seller && van.seller.name) || 'Private Seller' },
      availableAtOrFrom: van.location
        ? { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: van.location, addressCountry: 'NZ' } }
        : undefined,
    },
    additionalProperty: [
      van.selfContained ? { '@type': 'PropertyValue', name: 'Self-Contained', value: 'Yes' } : null,
      van.wofExpiry ? { '@type': 'PropertyValue', name: 'WOF Valid Until', value: String(van.wofExpiry) } : null,
      van.regoExpiry ? { '@type': 'PropertyValue', name: 'Registration Valid Until', value: String(van.regoExpiry) } : null,
      van.buyBack ? { '@type': 'PropertyValue', name: 'Buy-Back Option', value: 'Available' } : null,
    ].filter(Boolean),
  };
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: ORIGIN },
      locSlug ? { '@type': 'ListItem', position: 2, name: van.location, item: `${ORIGIN}/location/${locSlug}` } : null,
      { '@type': 'ListItem', position: locSlug ? 3 : 2, name: van.title || 'Campervan', item: url },
    ].filter(Boolean),
  };
  const cleanLd = (o) => JSON.parse(JSON.stringify(o));

  const specRows = [
    ['Price', price + (sold ? ' — SOLD' : '')],
    van.year ? ['Year', van.year] : null,
    van.mileage ? ['Mileage', `${Number(van.mileage).toLocaleString('en-NZ')} km`] : null,
    van.location ? ['Location', `${van.location}, New Zealand`] : null,
    van.type ? ['Type', van.type] : null,
    van.capacity ? ['Sleeps / Seats', van.capacity] : null,
    ['Self-contained', van.selfContained ? `Yes${van.selfContainedType ? ` (${van.selfContainedType} sticker)` : ''}` : 'No'],
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
<script type="application/ld+json">${JSON.stringify(cleanLd(vehicleLd))}</script>
<script type="application/ld+json">${JSON.stringify(cleanLd(breadcrumbLd))}</script>
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
  <h2>Description</h2>
  ${String(van.description || '').split(/\n+/).filter(Boolean).map((p) => `<p>${esc(p)}</p>`).join('\n  ') || '<p>Contact the seller for more details.</p>'}
  ${equipment.length ? `<h2>Equipment &amp; features</h2>\n  <ul>${equipment.map((e) => `<li>${esc(e)}</li>`).join('')}</ul>` : ''}
  <h2>Seller</h2>
  <p>${esc((van.seller && van.seller.name) || 'Private seller')} — contact via the listing page on Kiwi Van Market.</p>
  <p><a href="${url}">View this listing and contact the seller →</a></p>
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
