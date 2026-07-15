// ============================================================================
// Prerender / (home) pour les crawlers — hub de découverte : annonces
// récentes (liens crawlables vers /van/:id) + maillage complet vers les
// pages marques, villes et guides. Schémas Organization + WebSite + FAQ.
// ============================================================================

const {
  ORIGIN, esc, fetchAllVans, priceStats, nzd, vanListHTML,
  itemListLd, faqLd, htmlShell, sendHTML, send503,
} = require('./_lib/util');
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
  const title = 'Buy and Sell Campervans in New Zealand | Kiwi Van Market';
  const metaDesc = stats
    ? `${stats.count} campervans for sale across New Zealand, from ${nzd(stats.min)}. Self-contained vans with CarJam checks, WOF & REGO visibility, buy-back options. Free listings, no commission.`
    : 'The easiest way to buy and sell campervans in New Zealand. Self-contained vans with CarJam checks, WOF & REGO visibility, buy-back options.';

  const faqs = [
    {
      q: 'How much does a campervan cost in New Zealand?',
      a: stats
        ? `On Kiwi Van Market right now, campervans range from ${nzd(stats.min)} to ${nzd(stats.max)}, with an average price of ${nzd(stats.avg)} across ${stats.count} active listings.`
        : 'Backpacker campervans in NZ typically range from $3,000 to $20,000+ NZD depending on model, year and self-contained certification.',
    },
    {
      q: 'What does "self-contained" mean for a campervan in NZ?',
      a: 'A self-contained certified campervan has a toilet and water systems meeting the NZ standard, shown by a blue or green sticker. It is required for freedom camping in most areas.',
    },
    {
      q: 'Is it free to sell my campervan on Kiwi Van Market?',
      a: 'Yes — listings are free and there is no commission. Buyers contact you directly through the platform.',
    },
    {
      q: 'What should I check before buying a used campervan in NZ?',
      a: 'Check the WOF (Warrant of Fitness) and REGO expiry, run a CarJam history check with the plate number, verify the self-contained certificate, and get a pre-purchase mechanical inspection (~$150).',
    },
  ];

  const organizationLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${ORIGIN}/#organization`,
    name: 'Kiwi Van Market',
    url: ORIGIN,
    logo: { '@type': 'ImageObject', url: `${ORIGIN}/kiwi-van-logo-128.webp` },
    description: 'The #1 campervan marketplace in New Zealand. Buy or sell campervans, motorhomes, and vans peer-to-peer with zero commission.',
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
<h1>Buy Your Perfect Campervan in New Zealand</h1>
<p>Kiwi Van Market is New Zealand's peer-to-peer marketplace for campervans, backpacker vans and motorhomes. Compare Toyota Hiace, Nissan Caravan, Mitsubishi Delica and more — with CarJam checks, WOF &amp; REGO expiry and self-contained certification visible on every listing. Free to list, no commission.</p>
${stats ? `<p><strong>${stats.count} campervans for sale right now</strong> — from ${esc(nzd(stats.min))}, average ${esc(nzd(stats.avg))}.</p>` : ''}
<h2>Latest campervans for sale</h2>
<ul>${vanListHTML(vans, { limit: 24 })}</ul>
<h2>Browse by brand</h2>
<ul>
${Object.entries(BRANDS).map(([s, n]) => `<li><a href="${ORIGIN}/brand/${s}">${esc(n)} campervans for sale NZ</a></li>`).join('\n')}
</ul>
<h2>Browse by location</h2>
<ul>
${Object.entries(LOCATIONS).map(([s, n]) => `<li><a href="${ORIGIN}/location/${s}">Campervans for sale in ${esc(n)}</a></li>`).join('\n')}
</ul>
<h2>Expert guides for buying &amp; selling in NZ</h2>
<ul>
${Object.entries(GUIDES).map(([s, g]) => `<li><a href="${ORIGIN}/guide/${s}">${esc(g.title)}</a></li>`).join('\n')}
</ul>
<h2>Frequently asked questions</h2>
${faqs.map(({ q, a }) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join('\n')}`;

  const html = htmlShell({
    title,
    metaDesc,
    canonical: `${ORIGIN}/`,
    jsonLd: [
      organizationLd,
      websiteLd,
      itemListLd('Latest campervans for sale in New Zealand', vans),
      faqLd(faqs),
    ],
    body,
  });
  return sendHTML(res, html);
};
