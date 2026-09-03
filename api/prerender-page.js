// ============================================================================
// Prerender des pages statiques (/sell, /guides, /faq, /contact,
// /campervan-prices-nz) pour les crawlers. Sans ça elles servaient le shell CRA
// nu : même <title>, aucun <h1>, aucune canonical → autant de doublons de la
// home pour Google, donc non indexées.
// Contenu = copie de src/components/{SellPage,GuidesHubPage,FaqPage,
// ContactPage,PriceIndexPage} via api/_lib/pages-data.json (même convention que
// guides-data.json).
// ============================================================================

const {
  ORIGIN, esc, fetchAllVans, priceStats, nzd,
  faqLd, breadcrumbLd, htmlShell, send404, sendHTML,
} = require('./_lib/util');

const GUIDES = require('./_lib/guides-data.json');
const DATA = require('./_lib/pages-data.json');

const ALL_FAQS = DATA.faq.flatMap((c) => c.items);

// ── /sell ───────────────────────────────────────────────────────────────────
async function sellPage() {
  // Stats de prix réelles : contenu unique et à jour, comme les pages /location.
  let stats = null;
  try {
    stats = priceStats(await fetchAllVans());
  } catch (e) {
    stats = null; // pas bloquant : on sert la page sans le tableau de prix.
  }

  const faqs = (DATA.faq.find((c) => c.category === 'Selling a Van') || { items: [] }).items;

  const body = `
<h1>Sell Your Campervan in New Zealand — Free Listing</h1>
<p>List your campervan, van or motorhome for free on Kiwi Van Market and reach thousands of
backpackers looking to buy their adventure vehicle. No listing fee, no commission, no success fee.</p>
<p><a href="${ORIGIN}/sell"><strong>Create your free listing</strong></a> — you will be asked to sign in
or create a free account first, then your van goes live in under 10 minutes.</p>
${stats ? `
<h2>What campervans are selling for right now</h2>
<p>Live figures from the ${stats.count} campervans currently listed on Kiwi Van Market — use them to
price your own van competitively.</p>
<table class="stats"><tbody>
<tr><td>Campervans for sale</td><td>${stats.count}</td></tr>
<tr><td>Cheapest</td><td>${esc(nzd(stats.min))}</td></tr>
<tr><td>Average asking price</td><td>${esc(nzd(stats.avg))}</td></tr>
<tr><td>Most expensive</td><td>${esc(nzd(stats.max))}</td></tr>
</tbody></table>` : ''}
<h2>How to list your van in 5 steps</h2>
<ol>
${DATA.sell.steps.map((s) => `<li>${esc(s)}</li>`).join('\n')}
</ol>
<h2>Why sell on Kiwi Van Market</h2>
${DATA.sell.valueProps.map((p) => `<h3>${esc(p.title)}</h3><p>${esc(p.text)}</p>`).join('\n')}
<h2>Selling a campervan in NZ — frequently asked questions</h2>
${faqs.map(({ q, a }) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join('\n')}
<h2>Read before you sell</h2>
<ul>
<li><a href="${ORIGIN}/guide/selling-campervan-nz">How to sell your campervan in New Zealand</a></li>
<li><a href="${ORIGIN}/guide/wof-rego-ruc-insurance-nz">WOF, REGO, RUC and insurance explained</a></li>
<li><a href="${ORIGIN}/guides">All campervan guides</a></li>
</ul>`;

  return {
    title: 'Sell Your Campervan for FREE in New Zealand | Kiwi Van Market',
    metaDesc: stats
      ? `List your campervan for free in NZ — no commission, no success fee. ${stats.count} vans currently listed, average asking price ${nzd(stats.avg)}. Reach thousands of backpackers looking to buy.`
      : 'List your campervan, van or motorhome for FREE on Kiwi Van Market. Reach thousands of backpackers in New Zealand looking to buy their adventure vehicle. No commission, no fees.',
    canonical: `${ORIGIN}/sell`,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: 'How to sell your campervan in New Zealand',
        description: 'List a campervan for free on Kiwi Van Market and sell it directly to backpackers.',
        step: DATA.sell.steps.map((s, i) => ({
          '@type': 'HowToStep', position: i + 1, name: `Step ${i + 1}`, text: s,
        })),
      },
      faqLd(faqs),
      breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Sell your van', path: '/sell' }]),
    ],
    body,
  };
}

// ── /guides ─────────────────────────────────────────────────────────────────
function guidesPage() {
  const entries = Object.entries(GUIDES.en || {});

  const body = `
<h1>The Ultimate New Zealand Campervan Guides</h1>
<p>From mechanical inspections to freedom camping rules, we have you covered for your NZ road trip
adventure. Everything you need to know about buying, selling and living in a campervan in New Zealand.</p>
<h2>Featured guides</h2>
<ul>
${entries.map(([slug, g]) => `<li>
  <a href="${ORIGIN}/guide/${esc(slug)}"><strong>${esc(g.title)}</strong></a><br>
  <small>${esc(String(g.description || '').slice(0, 200))}</small>
</li>`).join('\n')}
</ul>
<h2>Also available in French and Spanish</h2>
<p>Every guide is translated — <a href="${ORIGIN}/guide/buying-campervan-nz?lang=fr">version française</a>,
<a href="${ORIGIN}/guide/buying-campervan-nz?lang=es">versión en español</a>.</p>
<h2>Browse campervans</h2>
<ul>
<li><a href="${ORIGIN}/">All campervans for sale in New Zealand</a></li>
<li><a href="${ORIGIN}/location/auckland">Campervans in Auckland</a></li>
<li><a href="${ORIGIN}/location/christchurch">Campervans in Christchurch</a></li>
<li><a href="${ORIGIN}/location/queenstown">Campervans in Queenstown</a></li>
<li><a href="${ORIGIN}/faq">Campervan FAQ</a></li>
</ul>`;

  return {
    title: 'Travel & Campervan Guides New Zealand | Kiwi Van Market',
    metaDesc: 'Everything you need to know about buying, selling, and living in a campervan in New Zealand. Expert tips for backpackers.',
    canonical: `${ORIGIN}/guides`,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'The Ultimate New Zealand Campervan Guides',
        numberOfItems: entries.length,
        itemListElement: entries.map(([slug, g], i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `${ORIGIN}/guide/${slug}`,
          name: g.title,
        })),
      },
      breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Guides', path: '/guides' }]),
    ],
    body,
  };
}

// ── /faq ────────────────────────────────────────────────────────────────────
function faqPage() {
  const body = `
<h1>Van Life NZ — Frequently Asked Questions</h1>
<p>Everything you need to know about buying, selling, and living in a campervan in New Zealand.
WOF, REGO, self-contained, freedom camping — all answered.</p>
${DATA.faq.map((cat) => `
<h2>${esc(cat.category)}</h2>
${cat.items.map(({ q, a }) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join('\n')}`).join('\n')}
<h2>Go further</h2>
<ul>
<li><a href="${ORIGIN}/guides">Read the full campervan guides</a></li>
<li><a href="${ORIGIN}/">Browse campervans for sale in New Zealand</a></li>
<li><a href="${ORIGIN}/sell">List your van for free</a></li>
</ul>`;

  return {
    title: 'Campervan FAQ — Buying & Selling in NZ | Kiwi Van Market',
    metaDesc: 'All your questions answered: how to buy a campervan in New Zealand, WOF, REGO, self-contained certification, freedom camping, van prices, and more.',
    canonical: `${ORIGIN}/faq`,
    jsonLd: [
      faqLd(ALL_FAQS),
      breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'FAQ', path: '/faq' }]),
    ],
    body,
  };
}

// ── /contact ────────────────────────────────────────────────────────────────
function contactPage() {
  const { email, responseTime, intro } = DATA.contact;

  const body = `
<h1>Contact Kiwi Van Market</h1>
<p>${esc(intro)}</p>
<h2>Email us</h2>
<p>For general inquiries and support: <a href="mailto:${esc(email)}">${esc(email)}</a></p>
<h2>Typical response time</h2>
<p>We usually get back to you within ${esc(responseTime)}.</p>
<h2>Before you write</h2>
<p>Most questions are already answered in our <a href="${ORIGIN}/faq">campervan FAQ</a> —
WOF and REGO, self-contained certification, freedom camping rules, van prices and how to sell.
Our <a href="${ORIGIN}/guides">buying and selling guides</a> cover the rest.</p>
<h2>Safe and trusted marketplace</h2>
<p>Kiwi Van Market is New Zealand's peer-to-peer campervan marketplace: free listings, no commission,
WOF and REGO expiry shown on every listing, self-contained status displayed upfront, and direct contact
between buyer and seller. Report any suspicious listing to us and we will review it.</p>`;

  return {
    title: 'Contact | Kiwi Van Market',
    metaDesc: "Get in touch with the Kiwi Van Market team. We're here to help with your campervan journey in New Zealand.",
    canonical: `${ORIGIN}/contact`,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        url: `${ORIGIN}/contact`,
        name: 'Contact Kiwi Van Market',
        mainEntity: {
          '@type': 'Organization',
          name: 'Kiwi Van Market',
          url: ORIGIN,
          logo: `${ORIGIN}/kiwi-van-logo-128.webp`,
          email,
          areaServed: 'NZ',
          contactPoint: [{
            '@type': 'ContactPoint',
            contactType: 'customer support',
            email,
            availableLanguage: ['en', 'fr', 'es'],
          }],
        },
      },
      breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Contact', path: '/contact' }]),
    ],
    body,
  };
}

// ── /campervan-prices-nz ────────────────────────────────────────────────────
// Parité avec src/components/PriceIndexPage.jsx : mêmes matchers de marque,
// même seuil d'échantillon, même médiane. Les chiffres servis aux bots doivent
// être ceux que l'utilisateur voit.
const CURRENT_YEAR = new Date().getFullYear();
const MIN_SAMPLE = 5;

// L'ORDRE COMPTE : chaque van n'est compté que dans le premier segment qui
// matche, donc les modèles précis passent avant les marques génériques.
const BRAND_MATCHERS = [
  { name: 'Toyota Hiace', kws: ['hiace'] },
  { name: 'Nissan Caravan', kws: ['caravan', 'homy'] },
  { name: 'Nissan Elgrand', kws: ['elgrand'] },
  { name: 'Mitsubishi Delica', kws: ['delica'] },
  { name: 'Mazda Bongo', kws: ['bongo'] },
  { name: 'Ford Transit', kws: ['transit'] },
  { name: 'VW Transporter', kws: ['transporter', 'kombi'] },
  { name: 'Hyundai iLoad', kws: ['iload', 'imax'] },
  { name: 'Mercedes Sprinter', kws: ['sprinter', 'vito'] },
  { name: 'Toyota (other models)', kws: ['toyota', 'estima', 'regius', 'townace', 'liteace', 'granvia'] },
  { name: 'Nissan (other models)', kws: ['nissan', 'serena', 'vanette', 'nv200'] },
];

// Montant brut "$12,000" : util.nzd() suffixe " NZD", ce qui doublonnerait
// avec la prose reprise de PriceIndexPage.jsx.
const amount = (n) => `$${Math.round(n).toLocaleString('en-NZ')}`;

const median = (nums) => {
  if (!nums.length) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2);
};

const priceRow = (r) =>
  `<tr><td>${esc(r.name)}</td><td>${esc(amount(r.median))}</td><td>${esc(amount(r.min))} – ${esc(amount(r.max))}</td><td>${r.count}</td></tr>`;

function priceIndex(vans) {
  const prices = vans.map((v) => Number(v.price));
  if (!prices.length) return null;

  // Attribution exclusive : les effectifs s'additionnent sans doublon.
  const groups = new Map(BRAND_MATCHERS.map((m) => [m.name, []]));
  vans.forEach((v) => {
    const title = String(v.title || '').toLowerCase();
    const hit = BRAND_MATCHERS.find((m) => m.kws.some((k) => title.includes(k)));
    if (hit) groups.get(hit.name).push(Number(v.price));
  });

  const segment = (label, subset) => {
    const p = subset.map((v) => Number(v.price));
    return p.length >= MIN_SAMPLE
      ? { name: label, label, count: p.length, median: median(p), min: Math.min(...p), max: Math.max(...p) }
      : null;
  };

  return {
    total: prices.length,
    median: median(prices),
    min: Math.min(...prices),
    max: Math.max(...prices),
    byBrand: [...groups.entries()]
      .filter(([, p]) => p.length >= MIN_SAMPLE)
      .map(([name, p]) => ({
        name, count: p.length, median: median(p), min: Math.min(...p), max: Math.max(...p),
      }))
      .sort((a, b) => b.median - a.median),
    byAge: [
      segment('Before 2000', vans.filter((v) => v.year && v.year < 2000)),
      segment('2000 – 2009', vans.filter((v) => v.year >= 2000 && v.year <= 2009)),
      segment('2010 or newer', vans.filter((v) => v.year >= 2010)),
    ].filter(Boolean),
    selfContained: segment('Self-contained certified', vans.filter((v) => v.selfContained)),
    notSelfContained: segment('Not certified', vans.filter((v) => !v.selfContained)),
    buckets: [
      { label: 'Under $5,000', test: (p) => p < 5000 },
      { label: '$5,000 – $9,999', test: (p) => p >= 5000 && p < 10000 },
      { label: '$10,000 – $14,999', test: (p) => p >= 10000 && p < 15000 },
      { label: '$15,000 – $24,999', test: (p) => p >= 15000 && p < 25000 },
      { label: '$25,000 and above', test: (p) => p >= 25000 },
    ].map((b) => {
      const count = prices.filter(b.test).length;
      return { label: b.label, count, pct: Math.round((count / prices.length) * 100) };
    }),
  };
}

async function pricesPage() {
  const url = `${ORIGIN}/campervan-prices-nz`;
  let stats = null;
  try {
    const all = await fetchAllVans();
    // Mêmes bornes que la page : hors de $1k–$200k c'est une erreur de saisie
    // qui ferait dériver la médiane.
    stats = priceIndex(all.filter((v) => {
      const p = Number(v.price);
      return Number.isFinite(p) && p >= 1000 && p <= 200000;
    }));
  } catch (e) {
    stats = null;
  }

  // Sans données, on sert une page honnête plutôt qu'un tableau vide.
  if (!stats) {
    return {
      title: `Campervan Prices NZ ${CURRENT_YEAR} — Real Market Data | Kiwi Van Market`,
      metaDesc: `How much does a campervan cost in New Zealand? Median asking prices by brand, age and self-contained status, based on live listings. Updated ${CURRENT_YEAR}.`,
      canonical: url,
      jsonLd: [breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Campervan prices NZ', path: '/campervan-prices-nz' }])],
      body: `<h1>Campervan prices in New Zealand</h1>
<p>Not enough listings yet to publish reliable statistics.
<a href="${ORIGIN}/">Browse the campervans currently for sale</a>.</p>`,
    };
  }

  const faqs = [
    {
      q: 'How much does a campervan cost in New Zealand?',
      a: `Based on ${stats.total} campervans currently listed for sale on Kiwi Van Market, the median asking price is ${amount(stats.median)} NZD, with listings ranging from ${amount(stats.min)} to ${amount(stats.max)}. Most backpacker vans sell between $5,000 and $15,000 NZD.`,
    },
    {
      q: 'What is a fair price for a backpacker van in NZ?',
      a: 'A reliable self-contained backpacker van in New Zealand typically sits between $6,000 and $12,000 NZD. Below $5,000 you should expect high mileage and possible WOF work; above $15,000 you are generally paying for a newer vehicle or a professional conversion.',
    },
    {
      q: 'Does a self-contained certificate increase a van price in New Zealand?',
      a: stats.selfContained && stats.notSelfContained
        ? `Yes. On Kiwi Van Market, self-contained certified vans have a median asking price of ${amount(stats.selfContained.median)} NZD versus ${amount(stats.notSelfContained.median)} NZD for non-certified vans.`
        : 'Yes. Self-contained certification lets you freedom camp legally in many areas, which noticeably increases resale value and demand in New Zealand.',
    },
    {
      q: 'When is the cheapest time to buy a campervan in New Zealand?',
      a: 'Prices are lowest around March to May, when backpackers leave at the end of the summer season and supply peaks. Prices are highest from November to January, when arrivals compete for vans at the start of the season.',
    },
  ];

  const body = `
<h1>Campervan prices in New Zealand</h1>
<p>How much does a campervan cost in NZ? These are the prices sellers are actually asking,
calculated live from the listings published on Kiwi Van Market — by brand, by age and by
self-contained certification. ${CURRENT_YEAR} market data.</p>

<h2>How much does a campervan cost in New Zealand?</h2>
<p>Across the <strong>${stats.total} campervans</strong> currently for sale on Kiwi Van Market, the median
asking price is <strong>${esc(amount(stats.median))} NZD</strong>, ranging from ${esc(amount(stats.min))} to
${esc(amount(stats.max))}. Most backpacker vans sell for between $5,000 and $15,000 NZD.</p>
<table class="stats"><tbody>
<tr><td>Median price</td><td>${esc(amount(stats.median))}</td></tr>
<tr><td>Lowest</td><td>${esc(amount(stats.min))}</td></tr>
<tr><td>Highest</td><td>${esc(amount(stats.max))}</td></tr>
<tr><td>Listings analysed</td><td>${stats.total}</td></tr>
</tbody></table>

<h2>Price distribution</h2>
<table class="stats"><tbody>
${stats.buckets.map((b) => `<tr><td>${esc(b.label)}</td><td>${b.pct}%</td><td>${b.count} listings</td></tr>`).join('\n')}
</tbody></table>
${stats.byBrand.length ? `
<h2>Median price by brand</h2>
<table class="stats"><thead><tr><th>Model</th><th>Median price</th><th>Range</th><th>Listings</th></tr></thead>
<tbody>
${stats.byBrand.map(priceRow).join('\n')}
</tbody></table>` : ''}
${stats.byAge.length ? `
<h2>Median price by vehicle age</h2>
<table class="stats"><thead><tr><th>Year</th><th>Median price</th><th>Range</th><th>Listings</th></tr></thead>
<tbody>
${stats.byAge.map(priceRow).join('\n')}
</tbody></table>` : ''}
${stats.selfContained && stats.notSelfContained ? `
<h2>What self-contained certification is worth</h2>
<table class="stats"><tbody>
<tr><td>${esc(stats.selfContained.label)}</td><td>${esc(amount(stats.selfContained.median))}</td><td>${stats.selfContained.count} listings</td></tr>
<tr><td>${esc(stats.notSelfContained.label)}</td><td>${esc(amount(stats.notSelfContained.median))}</td><td>${stats.notSelfContained.count} listings</td></tr>
</tbody></table>
<p>Self-contained certification allows freedom camping across many areas of New Zealand — it is the
single feature that most affects how much a van is worth when you resell it.</p>` : ''}

<h2>Methodology</h2>
<ul>
<li>Calculated live from the <strong>${stats.total} listings</strong> published on Kiwi Van Market, refreshed on every request.</li>
<li>These are <strong>asking prices</strong> set by sellers, not final sale prices: the negotiated price is typically 5–15% lower.</li>
<li>We use the <strong>median</strong> rather than the average, because it is far less distorted by a handful of extreme listings.</li>
<li>Listings outside the $1,000–$200,000 range are excluded as data-entry errors, and a segment is only published once it holds at least ${MIN_SAMPLE} listings — below that, the sample is too small to mean anything.</li>
<li>Each van is counted in <strong>one brand segment only</strong>, so the listing counts never overlap.</li>
</ul>
<p>Free to reuse and cite, with a link back to kiwivanmarket.com.</p>

<h2>Frequently asked questions</h2>
${faqs.map(({ q, a }) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join('\n')}

<h2>Now you know what your van is worth</h2>
<p>List it for free — no commission, ever.</p>
<ul>
<li><a href="${ORIGIN}/sell">Sell my van</a></li>
<li><a href="${ORIGIN}/">Browse campervans for sale in New Zealand</a></li>
<li><a href="${ORIGIN}/guide/buying-campervan-nz">How to buy a campervan in New Zealand</a></li>
</ul>`;

  return {
    title: `Campervan Prices NZ ${CURRENT_YEAR} — Real Market Data | Kiwi Van Market`,
    metaDesc: `How much does a campervan cost in New Zealand? Median asking price ${amount(stats.median)} NZD across ${stats.total} live listings, broken down by brand, age and self-contained status. Updated ${CURRENT_YEAR}.`,
    canonical: url,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Dataset',
        name: `New Zealand Campervan Price Index ${CURRENT_YEAR}`,
        description: `Median and range of asking prices for campervans and backpacker vans listed for sale in New Zealand, based on ${stats.total} live listings on Kiwi Van Market.`,
        url,
        keywords: ['campervan prices New Zealand', 'how much does a campervan cost NZ', 'backpacker van price NZ', 'used campervan value NZ'],
        license: 'https://creativecommons.org/licenses/by/4.0/',
        creator: { '@type': 'Organization', name: 'Kiwi Van Market', url: ORIGIN },
        temporalCoverage: String(CURRENT_YEAR),
        spatialCoverage: { '@type': 'Country', name: 'New Zealand' },
        variableMeasured: [
          { '@type': 'PropertyValue', name: 'Median asking price', value: stats.median, unitText: 'NZD' },
          { '@type': 'PropertyValue', name: 'Sample size', value: stats.total, unitText: 'listings' },
        ],
      },
      faqLd(faqs),
      breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Campervan prices NZ', path: '/campervan-prices-nz' }]),
    ],
    body,
  };
}

const PAGES = {
  sell: sellPage,
  guides: guidesPage,
  faq: faqPage,
  contact: contactPage,
  prices: pricesPage,
};

module.exports = async function handler(req, res) {
  const key = String(req.query.page || '').toLowerCase();
  const build = PAGES[key];
  if (!build) return send404(res, 'This page does not exist');

  const page = await build();
  return sendHTML(res, htmlShell(page));
};
