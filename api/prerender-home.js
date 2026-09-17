// ============================================================================
// Prerender / (home) pour les crawlers — hub de découverte : annonces
// récentes (liens crawlables vers /van/:id) + maillage complet vers les
// pages marques, villes et guides. Schémas Organization + WebSite + FAQ.
// Localisé : ?lang=fr sert la version française (textes dans _lib/copy.js).
// ============================================================================

const {
  ORIGIN, langUrl, esc, fetchAllVans, priceStats, nzd, vanListHTML,
  itemListLd, faqLd, htmlShell, sendHTML, send503,
} = require('./_lib/util');
const { pickLang, pageMeta } = require('./_lib/i18n');
const COPY = require('./_lib/copy');
const GUIDES = require('./_lib/guides-data.json');

const BRANDS = {
  'toyota-hiace': 'Toyota Hiace', 'nissan-caravan': 'Nissan Caravan',
  'mazda-bongo': 'Mazda Bongo', 'mitsubishi-delica': 'Mitsubishi Delica',
  'ford-transit': 'Ford Transit', 'mercedes-sprinter': 'Mercedes Sprinter',
};
const LOCATIONS = {
  auckland: 'Auckland', christchurch: 'Christchurch', wellington: 'Wellington',
  queenstown: 'Queenstown', rotorua: 'Rotorua', dunedin: 'Dunedin',
  hamilton: 'Hamilton', tauranga: 'Tauranga',
};

module.exports = async function handler(req, res) {
  const lang = pickLang(req);
  const T = COPY[lang].home;
  const C = COPY[lang].common;
  // Les guides existent dans la langue demandée (en/fr/es) ; sinon repli EN.
  const guides = GUIDES[lang] || GUIDES.en;

  let vans;
  try {
    vans = await fetchAllVans();
    // Les plus récents d'abord (parité avec le tri de l'app)
    vans.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
    // Actifs en tête, vendus derrière
    vans.sort((a, b) => (a.status === 'sold' ? 1 : 0) - (b.status === 'sold' ? 1 : 0));
  } catch (e) {
    return send503(res);
  }

  const stats = priceStats(vans);
  // Montants formatés une fois, pour les gabarits de textes.
  const S = stats && { count: stats.count, min: nzd(stats.min), max: nzd(stats.max), avg: nzd(stats.avg) };
  const SE = stats && { count: stats.count, min: esc(nzd(stats.min)), max: esc(nzd(stats.max)), avg: esc(nzd(stats.avg)) };

  const title = T.title;
  const metaDesc = S ? T.metaDesc(S) : T.metaDescNoStats;
  const faqs = T.faqs(S);

  const organizationLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${ORIGIN}/#organization`,
    name: 'Kiwi Van Market',
    url: ORIGIN,
    logo: { '@type': 'ImageObject', url: `${ORIGIN}/kiwi-van-logo-128.webp` },
    description: T.orgDesc,
    areaServed: { '@type': 'Country', name: 'New Zealand' },
    sameAs: ['https://www.facebook.com/kiwivanmarket'],
  };
  const websiteLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${ORIGIN}/#website`,
    url: ORIGIN,
    name: 'Kiwi Van Market',
    publisher: { '@id': `${ORIGIN}/#organization` },
  };

  const body = `
<h1>${T.h1}</h1>
<p>${T.intro}</p>
${SE ? `<p>${T.statsLine(SE)}</p>` : ''}
<h2>${T.latest}</h2>
<ul>${vanListHTML(vans, { limit: 24, lang })}</ul>
<h2>${T.byBrand}</h2>
<ul>
${Object.entries(BRANDS).map(([s, n]) => `<li><a href="${langUrl('/brand/' + s, lang)}">${T.brandLink(esc(n))}</a></li>`).join('\n')}
</ul>
<h2>${T.byLocation}</h2>
<ul>
${Object.entries(LOCATIONS).map(([s, n]) => `<li><a href="${langUrl('/location/' + s, lang)}">${T.locationLink(esc(n))}</a></li>`).join('\n')}
</ul>
<h2>${T.guides}</h2>
<ul>
${Object.entries(guides).map(([s, g]) => `<li><a href="${langUrl('/guide/' + s, lang)}">${esc(g.title)}</a></li>`).join('\n')}
</ul>
<h2>${C.faqTitle}</h2>
${faqs.map(({ q, a }) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join('\n')}`;

  const html = htmlShell({
    title,
    metaDesc,
    ...pageMeta('/', lang),
    jsonLd: [
      organizationLd,
      websiteLd,
      itemListLd(T.itemList, vans),
      faqLd(faqs),
    ],
    body,
  });
  return sendHTML(res, html);
};
