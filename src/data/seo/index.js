// Accès aux textes SEO depuis React, dans la langue d'i18next.
// Même source que les prerenders (api/), donc bots et humains lisent les
// mêmes contenus. Une langue sans traduction retombe sur l'anglais.
import copy from './copy';
import pagesEn from './pages-data.json';
import pagesFr from './pages-data.fr.json';

const PAGES = { en: pagesEn, fr: pagesFr };

export const seoLang = (i18nLanguage) => {
  const l = String(i18nLanguage || 'en').split('-')[0].toLowerCase();
  return copy[l] ? l : 'en';
};

export const seoCopy = (i18nLanguage) => copy[seoLang(i18nLanguage)];
export const pagesData = (i18nLanguage) => PAGES[seoLang(i18nLanguage)] || PAGES.en;

// Langues pour lesquelles ces pages ont une vraie version (SeoHead: hreflang).
export const SEO_LANGS = Object.keys(copy);

// Stats de prix identiques à util.priceStats (api) : vans actifs avec prix.
export function priceStats(vans) {
  const prices = (vans || []).filter((v) => v.status !== 'sold' && v.price > 0).map((v) => Number(v.price));
  if (!prices.length) return null;
  return {
    count: prices.length,
    min: Math.min(...prices),
    max: Math.max(...prices),
    avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
  };
}
export const nzd = (n) => `$${Number(n).toLocaleString('en-NZ')} NZD`;
