// ============================================================================
// Prerender /search/:slug (pages longue traîne) pour les crawlers — parité
// avec SeoLongTailPage.jsx, plus une barrière qualité : en dessous de
// MIN_INDEXABLE vans, la page est servie en noindex. Sans ça, ~90 pages vides
// ("No exact match right now") partiraient dans l'index comme des doorway
// pages, ce qui pèse sur tout le domaine.
// ============================================================================

const {
  esc, fetchAllVans, priceStats, nzd, vanListHTML,
  itemListLd, faqLd, breadcrumbLd, htmlShell, send404, sendHTML, send503,
} = require('./_lib/util');
const { pickLang, pageMeta, langUrl } = require('./_lib/i18n');
const { localizePage, searchText, searchFaqs } = require('../src/data/seo/search-copy.cjs');
const { LONG_TAIL_PAGE_LIST, LONG_TAIL_PAGE_MAP, indexableSlugs, vansForPage } = require('./_lib/long-tail');

module.exports = async function handler(req, res) {
  const slug = String(req.query.slug || '').toLowerCase();
  const lang = pickLang(req);
  const sourcePage = LONG_TAIL_PAGE_MAP[slug];
  if (!sourcePage) return send404(res, 'This search page does not exist');
  const page = localizePage(sourcePage, lang);
  const text = (key, values) => searchText(lang, key, { city: page.cityName, ...values });

  let vans; let keep;
  try {
    const all = await fetchAllVans();
    vans = vansForPage(all, page);
    keep = indexableSlugs(all);
  } catch (e) {
    return send503(res);
  }

  const indexable = keep.has(slug);
  const stats = priceStats(vans);
  const city = page.cityName;

  const faqs = searchFaqs(page, lang);

  // Maillage : uniquement vers des pages indexables, sinon on envoie le
  // crawler sur des noindex.
  const related = LONG_TAIL_PAGE_LIST
    .filter((p) => p.city === page.city && p.slug !== slug && keep.has(p.slug))
    .slice(0, 6).map((p) => localizePage(p, lang));

  const body = `
<h1>${esc(page.heading)}</h1>
<p>${esc(page.description)}</p>
<p>
  <a href="${langUrl(`/location/${page.city}`, lang)}">${esc(text('allCity'))}</a> ·
  ${page.brandSlug ? `<a href="${langUrl(`/brand/${page.brandSlug}`, lang)}">${esc(text('brandLink', { brand: page.brandName }))}</a> · ` : ''}
  <a href="${langUrl('/guide/buying-campervan-nz', lang)}">${esc(text('buyerGuide'))}</a>
</p>
${vans.length ? `
${stats ? `<p>${esc(text('stats', { count: vans.length, min: nzd(stats.min), max: nzd(stats.max), avg: nzd(stats.avg) }))}</p>` : ''}
<ul>${vanListHTML(vans, { lang })}</ul>` : `
<h2>${esc(text('emptyTitle'))}</h2>
<p>${esc(text('emptyText'))} <a href="${langUrl('/', lang)}">${esc(text('allListings'))}</a>.</p>`}
<h2>${esc(text('faqTitle'))}</h2>
${faqs.map(({ q, a }) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join('\n')}
<h2>${esc(text('related'))}</h2>
<ul>
${related.map((p) => `<li><a href="${langUrl(`/search/${p.slug}`, lang)}">${esc(p.heading)}</a></li>`).join('\n')}
</ul>`;

  const html = htmlShell({
    title: `${page.title} | Kiwi Van Market`,
    metaDesc: page.description,
    ...pageMeta(`/search/${slug}`, lang),
    noindex: !indexable,
    ogImage: (vans[0] && ((vans[0].images || [])[0] || vans[0].imageUrl)) || undefined,
    jsonLd: [
      itemListLd(page.heading, vans),
      faqLd(faqs),
      breadcrumbLd([
        { name: text('home'), path: lang === 'fr' ? '/?lang=fr' : '/' },
        { name: text('allCity'), path: `/location/${page.city}${lang === 'fr' ? '?lang=fr' : ''}` },
        { name: page.heading, path: `/search/${slug}${lang === 'fr' ? '?lang=fr' : ''}` },
      ]),
    ],
    body,
  });
  return sendHTML(res, html);
};
