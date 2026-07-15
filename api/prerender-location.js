// ============================================================================
// Prerender /location/:slug pour les crawlers — parité avec LocationPage.js
// (matching location/region par inclusion) + stats de prix réelles.
// ============================================================================

const {
  ORIGIN, esc, fetchAllVans, priceStats, nzd, vanListHTML,
  itemListLd, faqLd, breadcrumbLd, htmlShell, send404, sendHTML, send503,
} = require('./_lib/util');

const LOCATIONS = {
  auckland: { name: 'Auckland', blurb: "New Zealand's biggest campervan market — most backpackers start or end their trip here, so supply and choice are at their peak." },
  christchurch: { name: 'Christchurch', blurb: 'The South Island hub for campervan sales — ideal starting point for exploring the South Island.' },
  wellington: { name: 'Wellington', blurb: 'The capital and ferry gateway between the two islands — a strategic spot to buy or sell a van.' },
  queenstown: { name: 'Queenstown', blurb: 'The adventure capital — vans here often come from travellers ending their South Island road trip.' },
  rotorua: { name: 'Rotorua', blurb: 'Central North Island hub, popular with travellers doing the geothermal and lakes circuit.' },
  dunedin: { name: 'Dunedin', blurb: 'Student city of the south — good deals from locals and travellers heading north.' },
  hamilton: { name: 'Hamilton', blurb: 'Waikato hub close to Auckland with easier prices than the big city.' },
  tauranga: { name: 'Tauranga', blurb: 'Bay of Plenty — popular coastal region for vanlife and surf trips.' },
};

module.exports = async function handler(req, res) {
  const slug = String(req.query.slug || '').toLowerCase();
  const loc = LOCATIONS[slug];
  if (!loc) return send404(res, 'This location page does not exist');

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
  const url = `${ORIGIN}/location/${slug}`;
  const title = `Campervans for Sale in ${loc.name} | Kiwi Van Market`;
  const metaDesc = stats
    ? `${vans.length} campervans for sale in ${loc.name}, NZ. Prices from ${nzd(stats.min)} (average ${nzd(stats.avg)}). Self-contained vans, WOF & REGO checked, direct from owners.`
    : `Campervans and backpacker vans for sale in ${loc.name}, New Zealand. Buy directly from owners with WOF, REGO and self-contained status on every listing.`;

  const faqs = [
    {
      q: `How much does a campervan cost in ${loc.name}?`,
      a: stats
        ? `Right now on Kiwi Van Market, campervans in ${loc.name} range from ${nzd(stats.min)} to ${nzd(stats.max)}, with an average of ${nzd(stats.avg)} across ${stats.count} active listings.`
        : `Prices depend on the model, year and self-contained certification. Browse the latest ${loc.name} listings on Kiwi Van Market for live prices.`,
    },
    {
      q: `Where do backpackers buy campervans in ${loc.name}?`,
      a: `Most travellers buy peer-to-peer. Kiwi Van Market lists vans in ${loc.name} sold directly by owners, with CarJam checks, WOF/REGO expiry and self-contained badges shown upfront.`,
    },
  ];

  const body = `
<h1>Campervans for Sale in ${esc(loc.name)}, New Zealand</h1>
<p>${esc(loc.blurb)}</p>
${stats ? `
<h2>Current campervan prices in ${esc(loc.name)} (live data)</h2>
<table class="stats"><tbody>
<tr><td>Listings for sale</td><td>${stats.count}</td></tr>
<tr><td>Cheapest</td><td>${esc(nzd(stats.min))}</td></tr>
<tr><td>Average price</td><td>${esc(nzd(stats.avg))}</td></tr>
<tr><td>Most expensive</td><td>${esc(nzd(stats.max))}</td></tr>
</tbody></table>` : ''}
<h2>Campervans available in ${esc(loc.name)}</h2>
${vans.length ? `<ul>${vanListHTML(vans)}</ul>` : `<p>No vans listed in ${esc(loc.name)} right now — new listings arrive every week. <a href="${ORIGIN}/">Browse all campervans in NZ</a>.</p>`}
<h2>Frequently asked questions</h2>
${faqs.map(({ q, a }) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join('\n')}
<h2>Other locations</h2>
<ul>
${Object.entries(LOCATIONS).filter(([s]) => s !== slug).map(([s, l]) => `<li><a href="${ORIGIN}/location/${s}">Campervans for sale in ${esc(l.name)}</a></li>`).join('\n')}
</ul>`;

  const html = htmlShell({
    title,
    metaDesc,
    canonical: url,
    ogImage: (vans[0] && ((vans[0].images || [])[0] || vans[0].imageUrl)) || undefined,
    jsonLd: [
      itemListLd(`Campervans for sale in ${loc.name}`, vans),
      faqLd(faqs),
      breadcrumbLd([
        { name: 'Home', path: '/' },
        { name: `Campervans in ${loc.name}`, path: `/location/${slug}` },
      ]),
    ],
    body,
  });
  return sendHTML(res, html);
};
