// ============================================================================
// Prerender des pages statiques (/sell, /guides, /faq, /contact) pour les
// crawlers. Sans ça elles servaient le shell CRA nu : même <title>, aucun <h1>,
// aucune canonical → 4 doublons de la home pour Google, donc non indexées.
// Contenu = copie de src/components/{SellPage,GuidesHubPage,FaqPage,ContactPage}
// via api/_lib/pages-data.json (même convention que guides-data.json).
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

const PAGES = {
  sell: sellPage,
  guides: guidesPage,
  faq: faqPage,
  contact: contactPage,
};

module.exports = async function handler(req, res) {
  const key = String(req.query.page || '').toLowerCase();
  const build = PAGES[key];
  if (!build) return send404(res, 'This page does not exist');

  const page = await build();
  return sendHTML(res, htmlShell(page));
};
