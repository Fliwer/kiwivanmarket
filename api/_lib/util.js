// ============================================================================
// Helpers partagés par les fonctions de pré-rendu (fichiers _lib = pas de route)
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

// ── Sécurité : échapper tout contenu utilisateur ────────────────────────────
const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );

// ── Images Cloudinary optimisées ────────────────────────────────────────────
const cdnImg = (url, w) =>
  typeof url === 'string' && url.includes('/upload/')
    ? url.replace('/upload/', `/upload/w_${w},c_limit,q_auto,f_auto/`)
    : url;

// ── Fetch de tous les vans (visibles) depuis Firestore ─────────────────────
async function fetchAllVans() {
  const r = await fetch(
    `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/vans?pageSize=300`
  );
  if (!r.ok) throw new Error(`Firestore ${r.status}`);
  const data = await r.json();
  return (data.documents || [])
    .map((doc) => {
      const van = parseFields(doc.fields || {});
      van.id = doc.name.split('/').pop();
      return van;
    })
    // Parité avec l'app (App.js) : seules active + sold sont visibles
    .filter((v) => !v.status || v.status === 'active' || v.status === 'sold');
}

// ── Stats de prix (pages marques / lieux — contenu unique calculé) ─────────
function priceStats(vans) {
  const prices = vans.filter((v) => v.status !== 'sold' && v.price > 0).map((v) => v.price);
  if (!prices.length) return null;
  return {
    count: prices.length,
    min: Math.min(...prices),
    max: Math.max(...prices),
    avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
  };
}
const nzd = (n) => `$${Number(n).toLocaleString('en-NZ')} NZD`;

// ── Liste de vans (cartes HTML crawlables, liens internes vers /van/:id) ───
function vanListHTML(vans, { limit = 24 } = {}) {
  return vans.slice(0, limit).map((v) => {
    const img = (Array.isArray(v.images) && v.images[0]) || v.imageUrl;
    const bits = [
      v.year, v.mileage ? `${Number(v.mileage).toLocaleString('en-NZ')} km` : null,
      v.selfContained ? 'Self-contained' : null, v.location,
    ].filter(Boolean).join(' · ');
    return `<li>
  <a href="${ORIGIN}/van/${esc(v.id)}">
    ${img ? `<img src="${esc(cdnImg(img, 400))}" alt="${esc(v.title || 'Campervan')}" width="200" loading="lazy">` : ''}
    <strong>${esc(v.title || 'Campervan')}</strong></a>
  — ${v.price ? esc(nzd(v.price)) : 'Price on request'}${v.status === 'sold' ? ' (SOLD)' : ''}<br>
  <small>${esc(bits)}</small>
</li>`;
  }).join('\n');
}

// ── Schémas ItemList + FAQ ──────────────────────────────────────────────────
function itemListLd(name, vans, limit = 15) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    numberOfItems: vans.length,
    itemListElement: vans.slice(0, limit).map((v, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Vehicle',
        name: v.title || 'Campervan',
        url: `${ORIGIN}/van/${v.id}`,
        image: (Array.isArray(v.images) && v.images[0]) || v.imageUrl || undefined,
        offers: v.price ? {
          '@type': 'Offer', price: String(v.price), priceCurrency: 'NZD',
          availability: v.status === 'sold' ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
        } : undefined,
      },
    })),
  };
}
function faqLd(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question', name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}
function breadcrumbLd(crumbs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem', position: i + 1, name: c.name, item: `${ORIGIN}${c.path}`,
    })),
  };
}

// ── Enveloppe HTML commune ──────────────────────────────────────────────────
const NAV_LINKS = `<nav>
  <a href="${ORIGIN}/">Campervans for sale</a>
  <a href="${ORIGIN}/guides">Buying guides</a>
  <a href="${ORIGIN}/sell">Sell your van</a>
  <a href="${ORIGIN}/faq">FAQ</a>
</nav>`;

function htmlShell({ title, metaDesc, canonical, ogImage, jsonLd = [], body, ogType = 'website' }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(metaDesc)}">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="${canonical}">
<link rel="icon" type="image/png" sizes="192x192" href="${ORIGIN}/logo192.png">
<link rel="icon" type="image/png" sizes="32x32" href="${ORIGIN}/favicon.png">
<link rel="apple-touch-icon" href="${ORIGIN}/logo192.png">
<meta property="og:type" content="${ogType}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(metaDesc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:site_name" content="Kiwi Van Market">
<meta property="og:locale" content="en_NZ">
<meta property="og:image" content="${esc(ogImage || ORIGIN + '/og-image.jpg')}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(metaDesc)}">
${jsonLd.map((o) => `<script type="application/ld+json">${JSON.stringify(JSON.parse(JSON.stringify(o)))}</script>`).join('\n')}
<style>body{font-family:system-ui,sans-serif;max-width:820px;margin:0 auto;padding:16px;color:#1e293b;line-height:1.6}img{max-width:100%;height:auto;border-radius:8px}ul{padding-left:20px}li{margin-bottom:12px}nav a{margin-right:12px}blockquote{border-left:3px solid #059669;margin:12px 0;padding:6px 14px;background:#f0fdf4}.stats td{padding:6px 12px;border-bottom:1px solid #e2e8f0}</style>
</head>
<body>
<header>
  <p><a href="${ORIGIN}/"><strong>Kiwi Van Market</strong></a> — Buy and Sell Campervans in New Zealand</p>
  ${NAV_LINKS}
</header>
<main>
${body}
</main>
<footer>
  <p>Kiwi Van Market — New Zealand's peer-to-peer campervan marketplace. Free listings, CarJam checks, WOF/REGO visibility, self-contained filters, buy-back options.</p>
</footer>
</body>
</html>`;
}

function send404(res, message) {
  res.status(404).setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=3600');
  return res.send(`<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>Not found | Kiwi Van Market</title><meta name="robots" content="noindex"></head>
<body><h1>${esc(message || 'Page not found')}</h1><p><a href="${ORIGIN}/">Browse all campervans for sale in New Zealand</a></p></body></html>`);
}

function sendHTML(res, html) {
  res.status(200);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
  return res.send(html);
}

function send503(res) {
  res.status(503).setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Retry-After', '300');
  return res.send('<!DOCTYPE html><title>Temporarily unavailable</title>');
}

module.exports = {
  ORIGIN, fv, parseFields, esc, cdnImg, fetchAllVans, priceStats, nzd,
  vanListHTML, itemListLd, faqLd, breadcrumbLd, htmlShell, send404, sendHTML, send503,
};
