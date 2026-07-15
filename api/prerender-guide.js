// ============================================================================
// Prerender /guide/:slug pour les crawlers — contenu complet des guides
// (extrait de src/constants/guides.js → api/_lib/guides-data.json).
// Article JSON-LD + rendu texte intégral = idéal SEO et citations IA (GEO).
// ============================================================================

const {
  ORIGIN, esc, breadcrumbLd, htmlShell, send404, sendHTML,
} = require('./_lib/util');
const GUIDES = require('./_lib/guides-data.json');

const absUrl = (u) => (typeof u === 'string' && u.startsWith('/') ? `${ORIGIN}${u}` : u);

function renderItem(item) {
  if (!item || typeof item !== 'object') return '';
  if (item.type === 'image') {
    return `<figure><img src="${esc(absUrl(item.url))}" alt="${esc(item.caption || 'Guide illustration')}" loading="lazy">${item.caption ? `<figcaption>${esc(item.caption)}</figcaption>` : ''}</figure>`;
  }
  if (item.type === 'callout') {
    return `<blockquote><strong>${esc(item.title || (item.variant === 'warning' ? 'Warning' : 'Good to know'))}</strong><br>${esc(item.text || '')}</blockquote>`;
  }
  let out = '';
  if (item.title) out += `<h3>${esc(item.title)}</h3>`;
  if (item.text) out += `<p>${esc(item.text)}</p>`;
  if (item.expertTip) out += `<blockquote><strong>Expert tip:</strong> ${esc(item.expertTip)}</blockquote>`;
  return out;
}

module.exports = async function handler(req, res) {
  const slug = String(req.query.slug || '').toLowerCase();
  const guide = GUIDES[slug];
  if (!guide) return send404(res, 'This guide does not exist');

  const url = `${ORIGIN}/guide/${slug}`;
  const title = `${guide.title} | Kiwi Van Market`;
  const metaDesc = String(guide.description || '').slice(0, 155);
  const content = guide.content || {};
  const sections = Array.isArray(content.sections) ? content.sections : [];

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${url}#article`,
    headline: guide.title,
    description: guide.description,
    image: guide.heroImage ? [absUrl(guide.heroImage)] : undefined,
    url,
    inLanguage: 'en',
    author: { '@type': 'Organization', name: 'Kiwi Van Market', url: ORIGIN },
    publisher: {
      '@type': 'Organization',
      name: 'Kiwi Van Market',
      logo: { '@type': 'ImageObject', url: `${ORIGIN}/kiwi-van-logo-128.webp` },
    },
    mainEntityOfPage: url,
  };

  const otherGuides = Object.entries(GUIDES)
    .filter(([s]) => s !== slug)
    .slice(0, 6)
    .map(([s, g]) => `<li><a href="${ORIGIN}/guide/${s}">${esc(g.title)}</a></li>`)
    .join('\n');

  const body = `
<article>
<h1>${esc(guide.title)}</h1>
<p><em>${esc(guide.description || '')}</em></p>
${guide.heroImage ? `<img src="${esc(absUrl(guide.heroImage))}" alt="${esc(guide.title)}">` : ''}
${content.intro ? `<p>${esc(content.intro)}</p>` : ''}
${sections.map((s) => `
<section>
<h2>${esc(s.title || '')}</h2>
${(Array.isArray(s.items) ? s.items : []).map(renderItem).join('\n')}
</section>`).join('\n')}
</article>
<h2>More guides</h2>
<ul>
${otherGuides}
<li><a href="${ORIGIN}/">Browse campervans for sale in New Zealand</a></li>
</ul>`;

  const html = htmlShell({
    title,
    metaDesc,
    canonical: url,
    ogImage: absUrl(guide.heroImage),
    ogType: 'article',
    jsonLd: [
      articleLd,
      breadcrumbLd([
        { name: 'Home', path: '/' },
        { name: 'Guides', path: '/guides' },
        { name: guide.title, path: `/guide/${slug}` },
      ]),
    ],
    body,
  });
  return sendHTML(res, html);
};
