// ============================================================================
// Prerender /faq/:scope/:slug pour les crawlers — parité avec
// SeoTopicFaqPage.jsx, mais volontairement en NOINDEX.
//
// Ces 15 pages (9 villes + 6 marques) portent 3 questions-réponses gabarit où
// seul le nom change : pour Google c'est du contenu dupliqué, et la vraie FAQ
// de chaque ville/marque, avec des prix réels, vit déjà sur /location/:slug
// et /brand/:slug. On sert donc une page propre aux bots (elles sont liées
// depuis chaque page /search/), avec le lien vers la page qui mérite l'index.
// ============================================================================

const { ORIGIN, esc, faqLd, breadcrumbLd, htmlShell, send404, sendHTML } = require('./_lib/util');
const { CITY_META, BRAND_META } = require('./_lib/long-tail');

function locationFaq(name) {
  return [
    { q: `What should I check before buying a campervan in ${name}?`, a: 'Prioritize trust signals first: WOF, REGO, and self-contained status. Ask for service history, inspect rust points, and run a CarJam check when the plate is available.' },
    { q: `Is ${name} a good city to buy and resell a van?`, a: `${name} is a strong market with active backpacker demand. Pricing changes by season, so compare listing quality, not only headline price.` },
    { q: `How can I avoid scams in ${name}?`, a: 'Meet in person, never pay full amount before inspection, verify ownership transfer process, and keep communication on traceable channels.' },
  ];
}

function brandFaq(name) {
  return [
    { q: `Is the ${name} good for vanlife in New Zealand?`, a: `${name} is popular because of reliability, parts availability, and practical conversion layouts. Actual value depends on maintenance and build quality.` },
    { q: `What matters most when buying a used ${name}?`, a: 'Focus on mechanical condition, rust, WOF/REGO validity, and conversion quality (insulation, wiring, water system, and ventilation).' },
    { q: `Can I resell a ${name} quickly in NZ?`, a: 'Well-presented listings with complete trust signals usually sell faster. Good photos, transparent description, and realistic pricing are key.' },
  ];
}

module.exports = async function handler(req, res) {
  const scope = String(req.query.scope || '').toLowerCase();
  const slug = String(req.query.slug || '').toLowerCase();

  const meta = scope === 'location'
    ? CITY_META.find((c) => c.slug === slug)
    : scope === 'brand' ? BRAND_META.find((b) => b.slug === slug) : null;
  if (!meta) return send404(res, 'This FAQ page does not exist');

  const isLocation = scope === 'location';
  const faqs = isLocation ? locationFaq(meta.name) : brandFaq(meta.name);
  const title = isLocation ? `Campervan FAQ in ${meta.name}` : `${meta.name} Campervan FAQ`;
  const mainPage = isLocation ? `/location/${slug}` : `/brand/${slug}`;
  const mainLabel = isLocation ? `Campervans for sale in ${meta.name}` : `${meta.name} campervans for sale`;

  const body = `
<h1>${esc(title)}</h1>
<p>Quick answers for buyers. For live listings, current prices and the full FAQ, see
<a href="${ORIGIN}${mainPage}"><strong>${esc(mainLabel)}</strong></a>.</p>
${faqs.map(({ q, a }) => `<h2>${esc(q)}</h2><p>${esc(a)}</p>`).join('\n')}
<h2>Go further</h2>
<ul>
<li><a href="${ORIGIN}${mainPage}">${esc(mainLabel)}</a></li>
<li><a href="${ORIGIN}/faq">Full campervan FAQ</a></li>
<li><a href="${ORIGIN}/guide/buying-campervan-nz">How to buy a campervan in New Zealand</a></li>
</ul>`;

  const html = htmlShell({
    title: `${title} | Kiwi Van Market`,
    metaDesc: faqs[0].a.slice(0, 155),
    canonical: `${ORIGIN}/faq/${scope}/${slug}`,
    noindex: true,
    jsonLd: [
      faqLd(faqs),
      breadcrumbLd([
        { name: 'Home', path: '/' },
        { name: 'FAQ', path: '/faq' },
        { name: title, path: `/faq/${scope}/${slug}` },
      ]),
    ],
    body,
  });
  return sendHTML(res, html);
};
