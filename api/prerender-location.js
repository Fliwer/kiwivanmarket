// ============================================================================
// Prerender /location/:slug pour les crawlers — parité avec LocationPage.js
// (matching location/region par inclusion) + stats de prix réelles.
// Localisé : ?lang=fr sert la version française (textes dans _lib/copy.js).
// ============================================================================

const {
  langUrl, esc, fetchAllVans, priceStats, nzd, vanListHTML,
  itemListLd, faqLd, breadcrumbLd, htmlShell, send404, sendHTML, send503,
} = require('./_lib/util');
const { pickLang, pageMeta } = require('./_lib/i18n');
const COPY = require('../src/data/seo/copy');

const LOCATIONS = {
  auckland: 'Auckland', christchurch: 'Christchurch', wellington: 'Wellington',
  queenstown: 'Queenstown', rotorua: 'Rotorua', dunedin: 'Dunedin',
  hamilton: 'Hamilton', tauranga: 'Tauranga',
};

module.exports = async function handler(req, res) {
  const slug = String(req.query.slug || '').toLowerCase();
  const name = LOCATIONS[slug];
  if (!name) return send404(res, 'This location page does not exist');

  const lang = pickLang(req);
  const T = COPY[lang].location;
  const C = COPY[lang].common;

  let vans;
  try {
    const all = await fetchAllVans();
    const term = slug;
    vans = all.filter((v) => {
      const vanLocation = (v.location || '').toLowerCase();
      const vanRegion = (v.region || '').toLowerCase();
      return vanLocation.includes(term) || vanRegion.includes(term);
    });
  } catch (e) {
    return send503(res);
  }

  const stats = priceStats(vans);
  const S = stats && { count: stats.count, min: nzd(stats.min), max: nzd(stats.max), avg: nzd(stats.avg) };
  const title = T.title(name);
  const metaDesc = S ? T.metaDesc(name, S, vans.length) : T.metaDescNoStats(name);
  const faqs = T.faqs(name, S);

  const body = `
<h1>${T.h1(esc(name))}</h1>
<p>${esc(T.blurbs[slug])}</p>
${stats ? `
<h2>${T.pricesTitle(esc(name))}</h2>
<table class="stats"><tbody>
<tr><td>${C.listingsForSale}</td><td>${stats.count}</td></tr>
<tr><td>${C.cheapest}</td><td>${esc(nzd(stats.min))}</td></tr>
<tr><td>${C.averagePrice}</td><td>${esc(nzd(stats.avg))}</td></tr>
<tr><td>${C.mostExpensive}</td><td>${esc(nzd(stats.max))}</td></tr>
</tbody></table>` : ''}
<h2>${T.available(esc(name))}</h2>
${vans.length ? `<ul>${vanListHTML(vans, { lang })}</ul>` : `<p>${T.empty(esc(name))} <a href="${langUrl('/', lang)}">${C.browseAllNz}</a>.</p>`}
<h2>${C.faqTitle}</h2>
${faqs.map(({ q, a }) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join('\n')}
<h2>${T.others}</h2>
<ul>
${Object.entries(LOCATIONS).filter(([s]) => s !== slug).map(([s, n]) => `<li><a href="${langUrl('/location/' + s, lang)}">${T.locationLink(esc(n))}</a></li>`).join('\n')}
</ul>`;

  const html = htmlShell({
    title,
    metaDesc,
    ...pageMeta(`/location/${slug}`, lang),
    ogImage: (vans[0] && ((vans[0].images || [])[0] || vans[0].imageUrl)) || undefined,
    jsonLd: [
      itemListLd(T.itemList(name), vans),
      faqLd(faqs),
      breadcrumbLd([
        { name: C.home, path: '/' },
        { name: T.crumb(name), path: `/location/${slug}` },
      ]),
    ],
    body,
  });
  return sendHTML(res, html);
};
