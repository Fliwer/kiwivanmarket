// ============================================================================
// Prerender /brand/:slug pour les crawlers — parité avec BrandPage.js
// + enrichissement : stats de prix RÉELLES calculées depuis les annonces.
// Localisé : ?lang=fr sert la version française (textes dans _lib/copy.js).
// ============================================================================

const {
  langUrl, esc, fetchAllVans, priceStats, nzd, vanListHTML,
  itemListLd, faqLd, breadcrumbLd, htmlShell, send404, sendHTML, send503,
} = require('./_lib/util');
const { pickLang, pageMeta } = require('./_lib/i18n');
const COPY = require('../src/data/seo/copy');

// Parité stricte avec BRANDS_CONFIG de src/components/BrandPage.js
const BRANDS = {
  'toyota-hiace': { name: 'Toyota Hiace', searchTerms: ['toyota', 'hiace'] },
  'nissan-caravan': { name: 'Nissan Caravan', searchTerms: ['nissan', 'caravan'] },
  'mazda-bongo': { name: 'Mazda Bongo', searchTerms: ['mazda', 'bongo'] },
  'mitsubishi-delica': { name: 'Mitsubishi Delica', searchTerms: ['mitsubishi', 'delica'] },
  'ford-transit': { name: 'Ford Transit', searchTerms: ['ford', 'transit'] },
  'mercedes-sprinter': { name: 'Mercedes Sprinter', searchTerms: ['mercedes', 'sprinter'] },
};

module.exports = async function handler(req, res) {
  const slug = String(req.query.slug || '').toLowerCase();
  const brand = BRANDS[slug];
  if (!brand) return send404(res, 'This brand page does not exist');

  const lang = pickLang(req);
  const T = COPY[lang].brand;
  const C = COPY[lang].common;

  let vans;
  try {
    const all = await fetchAllVans();
    vans = all.filter((v) => {
      const t = `${v.title || ''} ${v.description || ''}`.toLowerCase();
      return brand.searchTerms.some((term) => t.includes(term));
    });
  } catch (e) {
    return send503(res);
  }

  const stats = priceStats(vans);
  const S = stats && { count: stats.count, min: nzd(stats.min), max: nzd(stats.max), avg: nzd(stats.avg) };
  const n = brand.name;
  const title = T.title(n);
  const metaDesc = S ? T.metaDesc(n, S, vans.length) : T.metaDescNoStats(n);
  const faqs = T.faqs(n, S);

  const body = `
<h1>${T.h1(esc(n))}</h1>
${stats ? `
<h2>${T.pricesTitle(esc(n))}</h2>
<table class="stats"><tbody>
<tr><td>${C.listingsForSale}</td><td>${stats.count}</td></tr>
<tr><td>${C.cheapest}</td><td>${esc(nzd(stats.min))}</td></tr>
<tr><td>${C.averagePrice}</td><td>${esc(nzd(stats.avg))}</td></tr>
<tr><td>${C.mostExpensive}</td><td>${esc(nzd(stats.max))}</td></tr>
</tbody></table>` : ''}
<h2>${T.available(esc(n))}</h2>
${vans.length ? `<ul>${vanListHTML(vans, { lang })}</ul>` : `<p>${T.empty(esc(n))} <a href="${langUrl('/', lang)}">${C.browseAll}</a>.</p>`}
<h2>${C.faqTitle}</h2>
${faqs.map(({ q, a }) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join('\n')}
<h2>${T.explore}</h2>
<ul>
${Object.entries(BRANDS).filter(([s]) => s !== slug).map(([s, b]) => `<li><a href="${langUrl('/brand/' + s, lang)}">${T.brandLink(esc(b.name))}</a></li>`).join('\n')}
<li><a href="${langUrl('/guide/buying-campervan-nz', lang)}">${T.guideBuy}</a></li>
<li><a href="${langUrl('/guide/how-to-inspect-campervan-nz', lang)}">${T.guideInspect}</a></li>
</ul>`;

  const html = htmlShell({
    title,
    metaDesc,
    ...pageMeta(`/brand/${slug}`, lang),
    // Sans annonce, la page se résume au blurb : Google la classe en soft 404.
    // noindex,follow jusqu'à ce qu'un van arrive (le maillage reste utile).
    noindex: !vans.length,
    ogImage: (vans[0] && ((vans[0].images || [])[0] || vans[0].imageUrl)) || undefined,
    jsonLd: [
      itemListLd(T.itemList(n), vans),
      faqLd(faqs),
      breadcrumbLd([
        { name: C.home, path: '/' },
        { name: T.crumb(n), path: `/brand/${slug}` },
      ]),
    ],
    body,
  });
  return sendHTML(res, html);
};
