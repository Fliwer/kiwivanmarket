// ============================================================================
// Prerender /search/:slug (pages longue traîne) pour les crawlers — parité
// avec SeoLongTailPage.jsx, plus une barrière qualité : en dessous de
// MIN_INDEXABLE vans, la page est servie en noindex. Sans ça, ~90 pages vides
// ("No exact match right now") partiraient dans l'index comme des doorway
// pages, ce qui pèse sur tout le domaine.
// ============================================================================

const {
  ORIGIN, esc, fetchAllVans, priceStats, nzd, vanListHTML,
  itemListLd, faqLd, breadcrumbLd, htmlShell, send404, sendHTML, send503,
} = require('./_lib/util');
const { LONG_TAIL_PAGE_LIST, LONG_TAIL_PAGE_MAP, indexableSlugs, vansForPage } = require('./_lib/long-tail');

module.exports = async function handler(req, res) {
  const slug = String(req.query.slug || '').toLowerCase();
  const page = LONG_TAIL_PAGE_MAP[slug];
  if (!page) return send404(res, 'This search page does not exist');

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
  const url = `${ORIGIN}/search/${slug}`;
  const city = page.cityName;

  // Mêmes FAQ que le composant React.
  const faqs = [
    {
      q: `How to buy a campervan in ${city} safely?`,
      a: 'Use listing trust signals first: WOF, REGO, self-contained status, and CarJam access when a plate is provided. Then inspect in person and test drive before payment.',
    },
    {
      q: `What budget is realistic for ${city}?`,
      a: typeof page.maxPrice === 'number'
        ? `For this page, we focus on listings up to NZ$${page.maxPrice.toLocaleString()}. You can compare similarly priced vans and contact sellers directly.`
        : 'Prices vary by season and equipment. Compare current listings and prioritize condition, service history, and compliance.',
    },
    {
      q: 'Is self-contained important in New Zealand?',
      a: 'Yes, self-contained certification is a major trust and usability signal for freedom camping. It usually increases resale potential and buyer confidence.',
    },
  ];

  // Maillage : uniquement vers des pages indexables, sinon on envoie le
  // crawler sur des noindex.
  const related = LONG_TAIL_PAGE_LIST
    .filter((p) => p.city === page.city && p.slug !== slug && keep.has(p.slug))
    .slice(0, 6);

  const body = `
<h1>${esc(page.heading)}</h1>
<p>${esc(page.description)}</p>
<p>
  <a href="${ORIGIN}/location/${esc(page.city)}">View all vans in ${esc(city)}</a> ·
  ${page.brandSlug ? `<a href="${ORIGIN}/brand/${esc(page.brandSlug)}">All ${esc(page.brandName)} listings</a> · ` : ''}
  <a href="${ORIGIN}/guide/buying-campervan-nz">Read the buyer guide</a>
</p>
${vans.length ? `
${stats ? `<p><strong>${vans.length} listing${vans.length > 1 ? 's' : ''}</strong> right now, from ${esc(nzd(stats.min))} to ${esc(nzd(stats.max))} (average ${esc(nzd(stats.avg))}).</p>` : `<p><strong>${vans.length} listing${vans.length > 1 ? 's' : ''}</strong> right now.</p>`}
<ul>${vanListHTML(vans)}</ul>` : `
<h2>No exact match right now</h2>
<p>Try nearby pages and keep checking as new vans are listed daily.
<a href="${ORIGIN}/location/${esc(page.city)}">Browse ${esc(city)}</a> or
<a href="${ORIGIN}/">browse all listings</a>.</p>`}
<h2>Frequently asked questions</h2>
${faqs.map(({ q, a }) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join('\n')}
<h2>More specific searches in ${esc(city)}</h2>
<ul>
${related.map((p) => `<li><a href="${ORIGIN}/search/${esc(p.slug)}">${esc(p.heading)}</a></li>`).join('\n')}
</ul>`;

  const html = htmlShell({
    title: `${page.title} | Kiwi Van Market`,
    metaDesc: stats
      ? `${vans.length} campervans in ${city}${page.maxPrice ? ` under NZ$${page.maxPrice.toLocaleString()}` : ''}, from ${nzd(stats.min)}. WOF/REGO shown, direct seller contact.`
      : page.description,
    canonical: url,
    noindex: !indexable,
    ogImage: (vans[0] && ((vans[0].images || [])[0] || vans[0].imageUrl)) || undefined,
    jsonLd: [
      itemListLd(page.heading, vans),
      faqLd(faqs),
      breadcrumbLd([
        { name: 'Home', path: '/' },
        { name: `Campervans in ${city}`, path: `/location/${page.city}` },
        { name: page.heading, path: `/search/${slug}` },
      ]),
    ],
    body,
  });
  return sendHTML(res, html);
};
