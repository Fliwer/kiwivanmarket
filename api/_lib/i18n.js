// ============================================================================
// Langue des pages prérendues. Convention du site : ?lang=fr (le sélecteur de
// langue écrit ce paramètre, i18next le lit, les rewrites Vercel le
// transmettent aux handlers). Chaque page localisée a une canonical
// auto-référente par langue + des hreflang réciproques, sinon Google replie
// la variante sur l'anglais.
//
// Les guides gèrent en plus l'espagnol (prerender-guide.js) ; ici on ne
// localise que ce qui a du contenu FR. Pour ajouter une langue : SUPPORTED,
// LOCALE, et le contenu dans copy.js / pages-data.<lang>.json.
// ============================================================================

const ORIGIN = 'https://kiwivanmarket.com';
const SUPPORTED = ['en', 'fr'];
const LOCALE = { en: 'en_NZ', fr: 'fr_FR' };

function pickLang(req) {
  const l = String((req.query && req.query.lang) || 'en').slice(0, 2).toLowerCase();
  return SUPPORTED.includes(l) ? l : 'en';
}

// URL absolue d'une page dans une langue. L'anglais est la version sans
// paramètre (x-default).
function langUrl(path, lang) {
  if (lang === 'en') return ORIGIN + path;
  return ORIGIN + path + (path.includes('?') ? '&' : '?') + 'lang=' + lang;
}

function alternates(path) {
  return [
    ...SUPPORTED.map((l) => ({ hreflang: l, href: langUrl(path, l) })),
    { hreflang: 'x-default', href: langUrl(path, 'en') },
  ];
}

// Tout ce que htmlShell attend pour une page localisée, en un appel.
function pageMeta(path, lang) {
  return {
    canonical: langUrl(path, lang),
    alternates: alternates(path),
    htmlLang: lang,
    ogLocale: LOCALE[lang] || LOCALE.en,
    lang,
  };
}

module.exports = { SUPPORTED, LOCALE, pickLang, langUrl, alternates, pageMeta };
