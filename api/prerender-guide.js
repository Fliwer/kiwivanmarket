// ============================================================================
// Prerender /guide/:slug pour les crawlers — contenu complet des guides
// (extrait de src/constants/guides.js → api/_lib/guides-data.json, nesté par
// langue). Multilingue : ?lang=fr / ?lang=es servent la traduction + canonical
// auto-référent + hreflang réciproques. Article JSON-LD + texte intégral =
// idéal SEO et citations IA (GEO).
// ============================================================================

const {
  ORIGIN, esc, breadcrumbLd, htmlShell, send404, sendHTML,
} = require('./_lib/util');
const GUIDES = require('./_lib/guides-data.json');

const absUrl = (u) => (typeof u === 'string' && u.startsWith('/') ? `${ORIGIN}${u}` : u);

const OG_LOCALE = { en: 'en_NZ', fr: 'fr_FR', es: 'es_ES' };
const L = {
  expertTip: { en: 'Expert tip:', fr: 'Conseil de pro :', es: 'Consejo de experto:' },
  moreGuides: { en: 'More guides', fr: 'Plus de guides', es: 'Más guías' },
  browseAll: {
    en: 'Browse campervans for sale in New Zealand',
    fr: 'Voir les campervans à vendre en Nouvelle-Zélande',
    es: 'Ver campervans en venta en Nueva Zelanda',
  },
  guidesCrumb: { en: 'Guides', fr: 'Guides', es: 'Guías' },
  homeCrumb: { en: 'Home', fr: 'Accueil', es: 'Inicio' },
};

function renderItem(item, lang) {
  if (!item || typeof item !== 'object') return '';
  if (item.type === 'image') {
    return `<figure><img src="${esc(absUrl(item.url))}" alt="${esc(item.caption || 'Guide illustration')}" loading="lazy">${item.caption ? `<figcaption>${esc(item.caption)}</figcaption>` : ''}</figure>`;
  }
  if (item.type === 'callout') {
    return `<blockquote><strong>${esc(item.title || (item.variant === 'warning' ? 'Warning' : 'Good to know'))}</strong><br>${esc(item.text || '')}</blockquote>`;
  }
  if (item.type === 'checklist') {
    return `<h3>${esc(item.title || 'Checklist')}</h3><ul>${(item.items || []).map((li) => `<li>✅ ${esc(li)}</li>`).join('')}</ul>`;
  }
  if (item.type === 'steps') {
    return `<ol>${(item.items || []).map((s) => `<li><strong>${esc(s.title || '')}</strong>${s.title && s.text ? ' — ' : ''}${esc(s.text || '')}</li>`).join('')}</ol>`;
  }
  if (item.type === 'cta') {
    const target = item.href || `${ORIGIN}${item.to || '/'}`;
    return `<p><a href="${esc(target)}"><strong>${esc(item.text || '')} →</strong></a></p>`;
  }
  if (item.type === 'table') {
    const head = `<tr>${(item.headers || []).map((h) => `<th>${esc(h)}</th>`).join('')}</tr>`;
    const rows = (item.rows || []).map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('');
    return `${item.title ? `<h3>${esc(item.title)}</h3>` : ''}<table border="1" cellpadding="6">${head}${rows}</table>${item.caption ? `<p><small>${esc(item.caption)}</small></p>` : ''}`;
  }
  if (item.type === 'faq') {
    return (item.items || []).map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('\n');
  }
  let out = '';
  if (item.title) out += `<h3>${esc(item.title)}</h3>`;
  if (item.text) out += `<p>${esc(item.text)}</p>`;
  if (item.expertTip) out += `<blockquote><strong>${L.expertTip[lang]}</strong> ${esc(item.expertTip)}</blockquote>`;
  return out;
}

module.exports = async function handler(req, res) {
  const slug = String(req.query.slug || '').toLowerCase();

  // Langue demandée (?lang=fr|es), défaut/fallback en.
  let lang = String(req.query.lang || 'en').slice(0, 2).toLowerCase();
  if (!GUIDES[lang]) lang = 'en';

  const guide = (GUIDES[lang] && GUIDES[lang][slug]) || GUIDES.en[slug];
  if (!guide) return send404(res, 'This guide does not exist');

  const suffix = lang === 'en' ? '' : `?lang=${lang}`;
  const cleanUrl = `${ORIGIN}/guide/${slug}`;
  const canonical = `${cleanUrl}${suffix}`;

  // Hreflang réciproques (chaque variante pointe vers toutes les autres).
  const alternates = [
    { hreflang: 'en', href: cleanUrl },
    { hreflang: 'fr', href: `${cleanUrl}?lang=fr` },
    { hreflang: 'es', href: `${cleanUrl}?lang=es` },
    { hreflang: 'x-default', href: cleanUrl },
  ];

  const title = `${guide.title} | Kiwi Van Market`;
  const metaDesc = String(guide.description || '').slice(0, 155);
  const content = guide.content || {};
  const sections = Array.isArray(content.sections) ? content.sections : [];

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${canonical}#article`,
    headline: guide.title,
    description: guide.description,
    image: guide.heroImage ? [absUrl(guide.heroImage)] : undefined,
    url: canonical,
    inLanguage: lang,
    author: { '@type': 'Organization', name: 'Kiwi Van Market', url: ORIGIN },
    publisher: {
      '@type': 'Organization',
      name: 'Kiwi Van Market',
      logo: { '@type': 'ImageObject', url: `${ORIGIN}/kiwi-van-logo-128.webp` },
    },
    mainEntityOfPage: canonical,
  };

  const byLang = GUIDES[lang] || GUIDES.en;
  const otherGuides = Object.entries(byLang)
    .filter(([s]) => s !== slug)
    .slice(0, 6)
    .map(([s, g]) => `<li><a href="${ORIGIN}/guide/${s}${suffix}">${esc(g.title)}</a></li>`)
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
${(Array.isArray(s.items) ? s.items : []).map((it) => renderItem(it, lang)).join('\n')}
</section>`).join('\n')}
</article>
<h2>${L.moreGuides[lang]}</h2>
<ul>
${otherGuides}
<li><a href="${ORIGIN}/${suffix}">${L.browseAll[lang]}</a></li>
</ul>`;

  // FAQ du guide → schéma FAQPage (SEO + citations IA)
  const faqItems = sections
    .flatMap((s) => s.items || [])
    .filter((i) => i && i.type === 'faq')
    .flatMap((i) => i.items || []);
  const faqPageLd = faqItems.length ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: lang,
    mainEntity: faqItems.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  } : null;

  const html = htmlShell({
    title,
    metaDesc,
    canonical,
    ogImage: absUrl(guide.heroImage),
    ogType: 'article',
    htmlLang: lang,
    ogLocale: OG_LOCALE[lang] || 'en_NZ',
    alternates,
    jsonLd: [
      articleLd,
      ...(faqPageLd ? [faqPageLd] : []),
      breadcrumbLd([
        { name: L.homeCrumb[lang], path: `/${suffix}` },
        { name: L.guidesCrumb[lang], path: `/guides${suffix}` },
        { name: guide.title, path: `/guide/${slug}${suffix}` },
      ]),
    ],
    body,
  });
  return sendHTML(res, html);
};
