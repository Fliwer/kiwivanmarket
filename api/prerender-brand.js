// ============================================================================
// Prerender /brand/:slug pour les crawlers — parité avec BrandPage.js
// + enrichissement : stats de prix RÉELLES calculées depuis les annonces.
// ============================================================================

const {
  ORIGIN, esc, fetchAllVans, priceStats, nzd, vanListHTML,
  itemListLd, faqLd, breadcrumbLd, htmlShell, send404, sendHTML, send503,
} = require('./_lib/util');

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
  const url = `${ORIGIN}/brand/${slug}`;
  const title = `${brand.name} Campervans for Sale in New Zealand | Kiwi Van Market`;
  const metaDesc = stats
    ? `${vans.length} ${brand.name} campervans for sale in NZ. Prices from ${nzd(stats.min)} (average ${nzd(stats.avg)}). Self-contained options, WOF & REGO checked, direct from owners.`
    : `${brand.name} campervans for sale in New Zealand. Buy directly from owners — self-contained options, WOF & REGO visibility, CarJam checks.`;

  const faqs = [
    {
      q: `How much does a ${brand.name} campervan cost in New Zealand?`,
      a: stats
        ? `Based on current listings on Kiwi Van Market, ${brand.name} campervans in New Zealand range from ${nzd(stats.min)} to ${nzd(stats.max)}, with an average price of ${nzd(stats.avg)} (${stats.count} listings for sale right now).`
        : `Prices vary by year, mileage and self-contained certification. Check the latest ${brand.name} listings on Kiwi Van Market for current prices.`,
    },
    {
      q: `Is the ${brand.name} a good campervan for New Zealand?`,
      a: `The ${brand.name} is one of the most popular backpacker campervans in NZ thanks to its reliability, availability of parts, and suitability for self-contained conversion — key for freedom camping.`,
    },
    {
      q: `Where can I buy a used ${brand.name} campervan in NZ?`,
      a: `Kiwi Van Market lists ${brand.name} campervans across New Zealand (Auckland, Christchurch, Wellington, Queenstown and more), sold directly by owners with WOF, REGO and self-contained status shown on every listing.`,
    },
  ];

  const body = `
<h1>${esc(brand.name)} Campervans for Sale in New Zealand</h1>
${stats ? `
<h2>Current ${esc(brand.name)} prices in NZ (live data)</h2>
<table class="stats"><tbody>
<tr><td>Listings for sale</td><td>${stats.count}</td></tr>
<tr><td>Cheapest</td><td>${esc(nzd(stats.min))}</td></tr>
<tr><td>Average price</td><td>${esc(nzd(stats.avg))}</td></tr>
<tr><td>Most expensive</td><td>${esc(nzd(stats.max))}</td></tr>
</tbody></table>` : ''}
<h2>${esc(brand.name)} campervans available now</h2>
${vans.length ? `<ul>${vanListHTML(vans)}</ul>` : `<p>No ${esc(brand.name)} listed right now — new vans are added every week. <a href="${ORIGIN}/">Browse all campervans</a>.</p>`}
<h2>Frequently asked questions</h2>
${faqs.map(({ q, a }) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join('\n')}
<h2>Explore more</h2>
<ul>
${Object.entries(BRANDS).filter(([s]) => s !== slug).map(([s, b]) => `<li><a href="${ORIGIN}/brand/${s}">${esc(b.name)} for sale NZ</a></li>`).join('\n')}
<li><a href="${ORIGIN}/guide/buying-campervan-nz">How to buy a campervan in New Zealand</a></li>
<li><a href="${ORIGIN}/guide/how-to-inspect-campervan-nz">How to inspect a campervan before buying</a></li>
</ul>`;

  const html = htmlShell({
    title,
    metaDesc,
    canonical: url,
    ogImage: (vans[0] && ((vans[0].images || [])[0] || vans[0].imageUrl)) || undefined,
    jsonLd: [
      itemListLd(`${brand.name} campervans for sale in New Zealand`, vans),
      faqLd(faqs),
      breadcrumbLd([
        { name: 'Home', path: '/' },
        { name: `${brand.name} campervans`, path: `/brand/${slug}` },
      ]),
    ],
    body,
  });
  return sendHTML(res, html);
};
