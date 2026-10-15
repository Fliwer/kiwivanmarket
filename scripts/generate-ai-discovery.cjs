// Generate factual EN/FR discovery files from the content visitors can read.
const fs = require('node:fs');
const path = require('node:path');
require('./sync-seo-modules.cjs');
require('./sync-crawler-routes.cjs');
require('./generate-public-assets.cjs');
require('./generate-guide-summaries.cjs');
const { COPY, SOURCES, REVIEWED } = require('../src/data/seo/market.cjs');
const guides = require('../api/_lib/guides-data.json');
const origin = 'https://kiwivanmarket.com';
const url = (pathname, lang) => origin + pathname + (lang === 'fr' ? '?lang=fr' : '');
const pages = ['/', '/sell', '/guides', '/faq', '/why', '/contact', '/campervan-prices-nz', '/buyback-calculator'];
const intro = `# Kiwi Van Market

> Campervan marketplace in New Zealand / Annonces de vans en Nouvelle-Zélande.

Canonical: ${origin}/
Content reviewed: ${REVIEWED}

Owner listings are free, with no sales commission. Vehicle details are seller-provided; buyers should verify documents and inspect vehicles. Asking-price data describes this platform's advertised inventory, not completed sales or the whole NZ market.

Les annonces de particuliers sont gratuites et sans commission sur la vente. Les informations sont déclarées par les vendeurs : vérifiez les documents et inspectez le véhicule. Les données de prix portent sur les prix demandés sur cette plateforme, pas sur les ventes conclues ou l'ensemble du marché.
`;
const links = Object.entries(COPY).map(([lang, T]) => `## ${lang === 'fr' ? 'Français' : 'English'}

${T.intro}

${pages.map((p) => `- [${p === '/' ? T.title : p.slice(1)}](${url(p, lang)})`).join('\n')}

### Guides
${Object.entries(guides[lang]).map(([slug, guide]) => `- [${guide.title}](${url('/guide/' + slug, lang)}): ${guide.description}`).join('\n')}`).join('\n\n');
const sources = `## Official references / Sources officielles
${SOURCES.map((s) => `- [${s.name}](${s.url})`).join('\n')}

## Discovery
- [Sitemap index](${origin}/sitemap.xml)
- [Active listing sitemap](${origin}/sitemap-vehicles.xml)
- [English and French search pages](${origin}/sitemap-search.xml)
- [Extended context](${origin}/llms-full.txt)
`;
const full = Object.entries(COPY).map(([lang, T]) => `## ${T.title}
${T.intro}

### ${T.buyersTitle}
${T.buyers.map((s) => `#### ${s.title}\n${s.text}`).join('\n\n')}

### ${T.sellersTitle}
${T.sellers.map((s) => `#### ${s.title}\n${s.text}`).join('\n\n')}

### ${T.methodTitle}
${T.method}

### ${T.faqTitle}
${T.faqs.map((f) => `#### ${f.q}\n${f.a}`).join('\n\n')}

Source: ${url('/', lang)}
${T.reviewed}`).join('\n\n');
const root = path.join(__dirname, '..', 'public');
fs.writeFileSync(path.join(root, 'llms.txt'), intro + '\n' + links + '\n\n' + sources);
fs.writeFileSync(path.join(root, 'llms-full.txt'), intro + '\n' + full + '\n\n' + links + '\n\n' + sources);
console.log('Generated EN/FR AI discovery files from shared editorial content.');
