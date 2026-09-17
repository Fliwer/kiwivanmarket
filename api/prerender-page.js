// ============================================================================
// Prerender des pages statiques (/sell, /guides, /faq, /contact,
// /campervan-prices-nz, /why, /buyback-calculator) pour les crawlers. Sans ça
// elles servaient le shell CRA nu : même <title>, aucun <h1>, aucune
// canonical → autant de doublons de la home pour Google, donc non indexées.
//
// Localisé : ?lang=fr sert la version française. Textes courts dans
// _lib/copy.js, contenus longs dans _lib/pages-data.json (EN) et
// pages-data.fr.json (FR), même structure. Contenu = copie de
// src/components/{SellPage,GuidesHubPage,FaqPage,ContactPage,PriceIndexPage,
// WhyPage,BuybackCalculator} (même convention que guides-data.json).
// ============================================================================

const {
  ORIGIN, langUrl, esc, fetchAllVans, priceStats, nzd,
  faqLd, breadcrumbLd, htmlShell, send404, sendHTML,
} = require('./_lib/util');
const { pickLang, pageMeta, langUrl: absLangUrl } = require('./_lib/i18n');
const COPY = require('../src/data/seo/copy');

const GUIDES = require('./_lib/guides-data.json');
const DATA = {
  en: require('../src/data/seo/pages-data.json'),
  fr: require('../src/data/seo/pages-data.fr.json'),
};

// ── /sell ───────────────────────────────────────────────────────────────────
async function sellPage(lang) {
  const T = COPY[lang].sell;
  const C = COPY[lang].common;
  const D = DATA[lang];

  // Stats de prix réelles : contenu unique et à jour, comme les pages /location.
  let stats = null;
  try {
    stats = priceStats(await fetchAllVans());
  } catch (e) {
    stats = null; // pas bloquant : on sert la page sans le tableau de prix.
  }
  const S = stats && { count: stats.count, min: nzd(stats.min), max: nzd(stats.max), avg: nzd(stats.avg) };

  const faqs = (D.faq.find((c, i) => i === 1) || { items: [] }).items;

  const body = `
<h1>${T.h1}</h1>
<p>${T.intro}</p>
<p><a href="${langUrl('/sell', lang)}"><strong>${T.cta}</strong></a> ${T.ctaNote}</p>
${stats ? `
<h2>${T.pricesTitle}</h2>
<p>${T.pricesIntro(stats.count)}</p>
<table class="stats"><tbody>
<tr><td>${T.campervansForSale}</td><td>${stats.count}</td></tr>
<tr><td>${C.cheapest}</td><td>${esc(nzd(stats.min))}</td></tr>
<tr><td>${T.averageAsking}</td><td>${esc(nzd(stats.avg))}</td></tr>
<tr><td>${C.mostExpensive}</td><td>${esc(nzd(stats.max))}</td></tr>
</tbody></table>` : ''}
<h2>${T.steps}</h2>
<ol>
${D.sell.steps.map((s) => `<li>${esc(s)}</li>`).join('\n')}
</ol>
<h2>${T.why}</h2>
${D.sell.valueProps.map((p) => `<h3>${esc(p.title)}</h3><p>${esc(p.text)}</p>`).join('\n')}
<h2>${T.faqTitle}</h2>
${faqs.map(({ q, a }) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join('\n')}
<h2>${T.read}</h2>
<ul>
<li><a href="${langUrl('/guide/selling-campervan-nz', lang)}">${T.guideSell}</a></li>
<li><a href="${langUrl('/guide/wof-rego-ruc-insurance-nz', lang)}">${T.guideWof}</a></li>
<li><a href="${langUrl('/guides', lang)}">${T.allGuides}</a></li>
</ul>`;

  return {
    title: T.title,
    metaDesc: S ? T.metaDesc(S) : T.metaDescNoStats,
    ...pageMeta('/sell', lang),
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: T.howToName,
        description: T.howToDesc,
        step: D.sell.steps.map((s, i) => ({
          '@type': 'HowToStep', position: i + 1, name: T.step(i + 1), text: s,
        })),
      },
      faqLd(faqs),
      breadcrumbLd([{ name: C.home, path: '/' }, { name: T.crumb, path: '/sell' }]),
    ],
    body,
  };
}

// ── /guides ─────────────────────────────────────────────────────────────────
function guidesPage(lang) {
  const T = COPY[lang].guides;
  const entries = Object.entries(GUIDES[lang] || GUIDES.en);
  // Les deux autres langues des guides (en/fr/es), pour le lien croisé.
  const others = ['en', 'fr', 'es'].filter((l) => l !== lang);
  const guideUrl = (l) => absLangUrl('/guide/buying-campervan-nz', l);

  const body = `
<h1>${T.h1}</h1>
<p>${T.intro}</p>
<h2>${T.featured}</h2>
<ul>
${entries.map(([slug, g]) => `<li>
  <a href="${langUrl('/guide/' + esc(slug), lang)}"><strong>${esc(g.title)}</strong></a><br>
  <small>${esc(String(g.description || '').slice(0, 200))}</small>
</li>`).join('\n')}
</ul>
<h2>${T.otherLangs}</h2>
<p>${T.otherLangsText(guideUrl(others[0]), guideUrl(others[1]))}</p>
<h2>${T.browse}</h2>
<ul>
<li><a href="${langUrl('/', lang)}">${T.allNz}</a></li>
<li><a href="${langUrl('/location/auckland', lang)}">${T.inCity('Auckland')}</a></li>
<li><a href="${langUrl('/location/christchurch', lang)}">${T.inCity('Christchurch')}</a></li>
<li><a href="${langUrl('/location/queenstown', lang)}">${T.inCity('Queenstown')}</a></li>
<li><a href="${langUrl('/faq', lang)}">${T.faqLink}</a></li>
</ul>`;

  return {
    title: T.title,
    metaDesc: T.metaDesc,
    ...pageMeta('/guides', lang),
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: T.h1,
        numberOfItems: entries.length,
        itemListElement: entries.map(([slug, g], i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: absLangUrl(`/guide/${slug}`, lang),
          name: g.title,
        })),
      },
      breadcrumbLd([{ name: COPY[lang].common.home, path: '/' }, { name: T.crumb, path: '/guides' }]),
    ],
    body,
  };
}

// ── /faq ────────────────────────────────────────────────────────────────────
function faqPage(lang) {
  const T = COPY[lang].faq;
  const D = DATA[lang];
  const allFaqs = D.faq.flatMap((c) => c.items);

  const body = `
<h1>${T.h1}</h1>
<p>${T.intro}</p>
${D.faq.map((cat) => `
<h2>${esc(cat.category)}</h2>
${cat.items.map(({ q, a }) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join('\n')}`).join('\n')}
<h2>${T.further}</h2>
<ul>
<li><a href="${langUrl('/guides', lang)}">${T.readGuides}</a></li>
<li><a href="${langUrl('/', lang)}">${T.browse}</a></li>
<li><a href="${langUrl('/sell', lang)}">${T.listFree}</a></li>
</ul>`;

  return {
    title: T.title,
    metaDesc: T.metaDesc,
    ...pageMeta('/faq', lang),
    jsonLd: [
      faqLd(allFaqs),
      breadcrumbLd([{ name: COPY[lang].common.home, path: '/' }, { name: T.crumb, path: '/faq' }]),
    ],
    body,
  };
}

// ── /contact ────────────────────────────────────────────────────────────────
function contactPage(lang) {
  const T = COPY[lang].contact;
  const { email, responseTime, intro } = DATA[lang].contact;

  const body = `
<h1>${T.h1}</h1>
<p>${esc(intro)}</p>
<h2>${T.email}</h2>
<p>${T.emailLine} <a href="mailto:${esc(email)}">${esc(email)}</a></p>
<h2>${T.response}</h2>
<p>${T.responseLine(esc(responseTime))}</p>
<h2>${T.before}</h2>
<p>${T.beforeText(langUrl('/faq', lang), langUrl('/guides', lang))}</p>
<h2>${T.safe}</h2>
<p>${T.safeText}</p>`;

  return {
    title: T.title,
    metaDesc: T.metaDesc,
    ...pageMeta('/contact', lang),
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        url: absLangUrl('/contact', lang),
        name: T.h1,
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
      breadcrumbLd([{ name: COPY[lang].common.home, path: '/' }, { name: T.crumb, path: '/contact' }]),
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
// Libellés des deux segments génériques dans chaque langue.
const BRAND_LABELS = {
  en: {},
  fr: { 'Toyota (other models)': 'Toyota (autres modèles)', 'Nissan (other models)': 'Nissan (autres modèles)' },
};

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

function priceIndex(vans, T, lang) {
  const prices = vans.map((v) => Number(v.price));
  if (!prices.length) return null;

  // Attribution exclusive : les effectifs s'additionnent sans doublon.
  const groups = new Map(BRAND_MATCHERS.map((m) => [m.name, []]));
  vans.forEach((v) => {
    const title = String(v.title || '').toLowerCase();
    const hit = BRAND_MATCHERS.find((m) => m.kws.some((k) => title.includes(k)));
    if (hit) groups.get(hit.name).push(Number(v.price));
  });
  const label = (name) => (BRAND_LABELS[lang] && BRAND_LABELS[lang][name]) || name;

  const segment = (name, subset) => {
    const p = subset.map((v) => Number(v.price));
    return p.length >= MIN_SAMPLE
      ? { name, label: name, count: p.length, median: median(p), min: Math.min(...p), max: Math.max(...p) }
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
        name: label(name), count: p.length, median: median(p), min: Math.min(...p), max: Math.max(...p),
      }))
      .sort((a, b) => b.median - a.median),
    byAge: [
      segment(T.ageBefore, vans.filter((v) => v.year && v.year < 2000)),
      segment(T.age2000, vans.filter((v) => v.year >= 2000 && v.year <= 2009)),
      segment(T.age2010, vans.filter((v) => v.year >= 2010)),
    ].filter(Boolean),
    selfContained: segment(T.scYes, vans.filter((v) => v.selfContained)),
    notSelfContained: segment(T.scNo, vans.filter((v) => !v.selfContained)),
    buckets: [
      { label: T.bucketUnder, test: (p) => p < 5000 },
      { label: '$5,000 – $9,999', test: (p) => p >= 5000 && p < 10000 },
      { label: '$10,000 – $14,999', test: (p) => p >= 10000 && p < 15000 },
      { label: '$15,000 – $24,999', test: (p) => p >= 15000 && p < 25000 },
      { label: T.bucketAbove, test: (p) => p >= 25000 },
    ].map((b) => {
      const count = prices.filter(b.test).length;
      return { label: b.label, count, pct: Math.round((count / prices.length) * 100) };
    }),
  };
}

async function pricesPage(lang) {
  const T = COPY[lang].prices;
  const C = COPY[lang].common;
  const path = '/campervan-prices-nz';
  const url = absLangUrl(path, lang);

  let stats = null;
  try {
    const all = await fetchAllVans();
    // Mêmes bornes que la page : hors de $1k–$200k c'est une erreur de saisie
    // qui ferait dériver la médiane.
    stats = priceIndex(all.filter((v) => {
      const p = Number(v.price);
      return Number.isFinite(p) && p >= 1000 && p <= 200000;
    }), T, lang);
  } catch (e) {
    stats = null;
  }

  const crumbs = breadcrumbLd([{ name: C.home, path: '/' }, { name: T.crumb, path }]);

  // Sans données, on sert une page honnête plutôt qu'un tableau vide.
  if (!stats) {
    return {
      title: T.title(CURRENT_YEAR),
      metaDesc: T.metaDescNoStats(CURRENT_YEAR),
      ...pageMeta(path, lang),
      jsonLd: [crumbs],
      body: `<h1>${T.h1}</h1>
<p>${T.empty}
<a href="${langUrl('/', lang)}">${T.browseCurrent}</a>.</p>`,
    };
  }

  const faqs = T.faqs(stats, amount);
  const SA = { total: stats.total, median: esc(amount(stats.median)), min: esc(amount(stats.min)), max: esc(amount(stats.max)) };

  const body = `
<h1>${T.h1}</h1>
<p>${T.intro(CURRENT_YEAR)}</p>

<h2>${T.howMuch}</h2>
<p>${T.answer(SA)}</p>
<table class="stats"><tbody>
<tr><td>${T.median}</td><td>${esc(amount(stats.median))}</td></tr>
<tr><td>${T.lowest}</td><td>${esc(amount(stats.min))}</td></tr>
<tr><td>${T.highest}</td><td>${esc(amount(stats.max))}</td></tr>
<tr><td>${T.analysed}</td><td>${stats.total}</td></tr>
</tbody></table>

<h2>${T.distribution}</h2>
<table class="stats"><tbody>
${stats.buckets.map((b) => `<tr><td>${esc(b.label)}</td><td>${b.pct}%</td><td>${b.count} ${T.listings}</td></tr>`).join('\n')}
</tbody></table>
${stats.byBrand.length ? `
<h2>${T.byBrand}</h2>
<table class="stats"><thead><tr><th>${T.model}</th><th>${T.median}</th><th>${T.range}</th><th>${T.listingsCol}</th></tr></thead>
<tbody>
${stats.byBrand.map(priceRow).join('\n')}
</tbody></table>` : ''}
${stats.byAge.length ? `
<h2>${T.byAge}</h2>
<table class="stats"><thead><tr><th>${T.year}</th><th>${T.median}</th><th>${T.range}</th><th>${T.listingsCol}</th></tr></thead>
<tbody>
${stats.byAge.map(priceRow).join('\n')}
</tbody></table>` : ''}
${stats.selfContained && stats.notSelfContained ? `
<h2>${T.scTitle}</h2>
<table class="stats"><tbody>
<tr><td>${esc(stats.selfContained.label)}</td><td>${esc(amount(stats.selfContained.median))}</td><td>${stats.selfContained.count} ${T.listings}</td></tr>
<tr><td>${esc(stats.notSelfContained.label)}</td><td>${esc(amount(stats.notSelfContained.median))}</td><td>${stats.notSelfContained.count} ${T.listings}</td></tr>
</tbody></table>
<p>${T.scText}</p>` : ''}

<h2>${T.methodology}</h2>
<ul>
${T.method(stats, MIN_SAMPLE).map((m) => `<li>${m}</li>`).join('\n')}
</ul>
<p>${T.reuse}</p>

<h2>${C.faqTitle}</h2>
${faqs.map(({ q, a }) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join('\n')}

<h2>${T.ctaTitle}</h2>
<p>${T.ctaText}</p>
<ul>
<li><a href="${langUrl('/sell', lang)}">${T.sellMy}</a></li>
<li><a href="${langUrl('/', lang)}">${T.browse}</a></li>
<li><a href="${langUrl('/guide/buying-campervan-nz', lang)}">${T.guideBuy}</a></li>
</ul>`;

  return {
    title: T.title(CURRENT_YEAR),
    metaDesc: T.metaDesc(CURRENT_YEAR, { median: amount(stats.median), total: stats.total }),
    ...pageMeta(path, lang),
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Dataset',
        name: T.datasetName(CURRENT_YEAR),
        description: T.datasetDesc(stats),
        url,
        keywords: ['campervan prices New Zealand', 'how much does a campervan cost NZ', 'backpacker van price NZ', 'used campervan value NZ'],
        license: 'https://creativecommons.org/licenses/by/4.0/',
        creator: { '@type': 'Organization', name: 'Kiwi Van Market', url: ORIGIN },
        temporalCoverage: String(CURRENT_YEAR),
        spatialCoverage: { '@type': 'Country', name: 'New Zealand' },
        variableMeasured: [
          { '@type': 'PropertyValue', name: T.varMedian, value: stats.median, unitText: 'NZD' },
          { '@type': 'PropertyValue', name: T.varSample, value: stats.total, unitText: 'listings' },
        ],
      },
      faqLd(faqs),
      crumbs,
    ],
    body,
  };
}

// ── /why ────────────────────────────────────────────────────────────────────
function whyPage(lang) {
  const T = COPY[lang].why;
  const C = COPY[lang].common;
  const W = DATA[lang].why;

  const body = `
<h1>${esc(W.h1)}</h1>
<p>${esc(W.intro)}</p>

<h2>${esc(W.pillarsTitle)}</h2>
<p>${esc(W.pillarsSubtitle)}</p>
${W.pillars.map((p) => `<h3>${esc(p.title)}</h3>
<p>${esc(p.desc)}</p>
<ul>${p.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`).join('\n')}

<h2>${esc(W.top10Title)}</h2>
<p>${esc(W.top10Subtitle)}</p>
${W.top10.map((v) => `<h3>${v.rank}. ${esc(v.name)} — ${esc(v.tagline)}</h3>
<p><strong>${esc(v.priceRange)}</strong> · ${esc(v.badge)} · ${T.bestFor} ${esc(v.bestFor)}</p>
<ul>${v.pros.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>`).join('\n')}

<h2>${T.ready}</h2>
<p>${T.readyText}</p>
<ul>
<li><a href="${langUrl('/', lang)}">${T.explore}</a></li>
<li><a href="${langUrl('/sell', lang)}">${T.listFree}</a></li>
<li><a href="${langUrl('/campervan-prices-nz', lang)}">${T.pricesLink}</a></li>
<li><a href="${langUrl('/guide/buying-campervan-nz', lang)}">${T.guideBuy}</a></li>
</ul>`;

  return {
    title: W.seoTitle,
    metaDesc: W.seoDesc,
    ...pageMeta('/why', lang),
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: W.top10Title,
        numberOfItems: W.top10.length,
        itemListElement: W.top10.map((v) => ({
          '@type': 'ListItem',
          position: v.rank,
          name: v.name,
          description: T.itemDesc(v),
        })),
      },
      breadcrumbLd([{ name: C.home, path: '/' }, { name: T.crumb, path: '/why' }]),
    ],
    body,
  };
}

// ── /buyback-calculator ─────────────────────────────────────────────────────
function buybackPage(lang) {
  const T = COPY[lang].buyback;
  const C = COPY[lang].common;
  const B = DATA[lang].buyback;

  const body = `
<h1>${esc(B.h1)}</h1>
<p>${esc(B.intro)}</p>
<p>${esc(B.explainer)}</p>
<p><a href="${langUrl('/buyback-calculator', lang)}"><strong>${T.open}</strong></a> ${T.openText}</p>

<h2>${esc(B.factorsTitle)}</h2>
${B.factors.map((f) => `<h3>${esc(f.name)}</h3><p>${esc(f.text)}</p>`).join('\n')}

<h2>${C.faqTitle}</h2>
${B.faqs.map(({ q, a }) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join('\n')}

<h2>${T.further}</h2>
<ul>
<li><a href="${langUrl('/campervan-prices-nz', lang)}">${T.pricesLink}</a></li>
<li><a href="${langUrl('/sell', lang)}">${T.sellFree}</a></li>
<li><a href="${langUrl('/guide/selling-campervan-nz', lang)}">${T.guideSell}</a></li>
</ul>`;

  return {
    title: B.seoTitle,
    metaDesc: B.seoDesc,
    ...pageMeta('/buyback-calculator', lang),
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: T.appName,
        url: absLangUrl('/buyback-calculator', lang),
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Any',
        description: B.seoDesc,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'NZD' },
        provider: { '@type': 'Organization', name: 'Kiwi Van Market', url: ORIGIN },
      },
      faqLd(B.faqs),
      breadcrumbLd([{ name: C.home, path: '/' }, { name: T.crumb, path: '/buyback-calculator' }]),
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
  why: whyPage,
  buyback: buybackPage,
};

module.exports = async function handler(req, res) {
  const key = String(req.query.page || '').toLowerCase();
  const build = PAGES[key];
  if (!build) return send404(res, 'This page does not exist');

  const page = await build(pickLang(req));
  return sendHTML(res, htmlShell(page));
};
