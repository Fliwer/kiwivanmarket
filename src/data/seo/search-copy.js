const TEXT = {
  en: require('../../locales/en/translation.json').seo_search,
  fr: require('../../locales/fr/translation.json').seo_search,
};
const searchLang = (language) => String(language || 'en').split('-')[0] === 'fr' ? 'fr' : 'en';
function searchText(language, key, values = {}) {
  return TEXT[searchLang(language)][key].replace(/\{\{(\w+)\}\}/g, (_, name) => String(values[name] ?? ''));
}
function localizePage(page, language) {
  const lang = searchLang(language);
  const values = { city: page.cityName, brand: page.brandName,
    budget: Number(page.maxPrice || 0).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-NZ') };
  const kind = page.brandSlug ? 'brand' : page.selfContainedOnly ? 'sc' : 'budget';
  return { ...page, title: searchText(lang, `${kind}Title`, values),
    heading: searchText(lang, `${kind}Heading`, values),
    description: searchText(lang, `${kind}Desc`, values) };
}
function searchFaqs(page, lang) {
  return ['safety', 'budget', 'sc'].map((key) => ({
    q: searchText(lang, `${key}Question`, { city: page.cityName }),
    a: searchText(lang, `${key}Answer`, { city: page.cityName }),
  }));
}
export default { searchLang, searchText, localizePage, searchFaqs };
