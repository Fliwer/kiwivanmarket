import market from '../data/seo/market';
import inventoryLinks from '../data/seo/inventory';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { seoLang, seoCopy, priceStats, nzd } from '../data/seo';


// The same source-backed information is rendered in api/prerender-home.js.
export default function HomeSeoSection({ vans = [] }) {
  const { t, i18n } = useTranslation();
  const lang = seoLang(i18n.language);
  const T = market.COPY[lang] || market.COPY.en;
  const stats = priceStats(vans);
  const sample = stats && { count: stats.count, min: nzd(stats.min), max: nzd(stats.max), avg: nzd(stats.avg) };
  const faqs = [...seoCopy(lang).home.faqs(sample), ...T.faqs];
  const inventory = inventoryLinks(vans);
  const home = seoCopy(lang).home;
  const href = (path) => lang === 'fr' ? path + '?lang=fr' : path;
  const card = (item) => <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6"><h3 className="text-lg font-bold text-slate-900 mb-3">{item.title}</h3><p className="text-slate-600 leading-relaxed">{item.text}</p></article>;
  return <section className="max-w-7xl mx-auto px-5 py-12 space-y-10">
    <div className="max-w-3xl"><h2 className="text-3xl font-black text-slate-900 mb-4">{T.title}</h2><p className="text-slate-600 leading-relaxed">{T.intro}</p>
      {sample && <p className="mt-4 font-semibold text-slate-800">{t('seo_market.inventorySummary', sample)}</p>}
    </div>
    <div className="grid md:grid-cols-2 gap-8">{[
      [T.byLocation, inventory.cities, home.locationLink],
      [T.byBrand, inventory.models, home.brandLink],
    ].filter(([, links]) => links.length).map(([title, links, label]) => <nav key={title} aria-label={title}><h2 className="text-2xl font-bold mb-4">{title}</h2><ul className="space-y-3">{links.map(({path, name, count, min}) => <li key={path}><Link to={href(path)} className="flex flex-col rounded-xl border border-slate-200 bg-white px-4 py-3 text-emerald-800 hover:border-emerald-400"><span className="font-semibold">{label(name)}</span><span className="text-sm text-slate-600">{t('seo_market.stockCount', {count})}{min !== null ? ` · ${t('seo_market.fromPrice', {price: nzd(min)})}` : ''}</span></Link></li>)}</ul></nav>)}</div>
    <div><h2 className="text-2xl font-bold mb-5">{T.buyersTitle}</h2><div className="grid md:grid-cols-2 gap-5">{T.buyers.map(card)}</div></div>
    <div><h2 className="text-2xl font-bold mb-5">{T.sellersTitle}</h2><div className="grid md:grid-cols-2 gap-5">{T.sellers.map(card)}</div></div>
    <div className="flex flex-wrap gap-3">{[
      ['/guide/buying-campervan-nz', T.buyLink], ['/guide/how-to-inspect-campervan-nz', T.inspectLink],
      ['/sell', T.sellLink], ['/campervan-prices-nz', T.pricesLink],
    ].map(([path, label]) => <Link key={path} to={href(path)} className="rounded-xl bg-emerald-50 text-emerald-800 px-4 py-3 font-bold hover:bg-emerald-100">{label}</Link>)}</div>
    <div className="rounded-2xl bg-slate-100 p-6"><h2 className="text-xl font-bold mb-3">{T.methodTitle}</h2><p className="text-slate-600 leading-relaxed">{T.method}</p></div>
    <div><h2 className="text-2xl font-bold mb-5">{T.faqTitle}</h2>{faqs.map(({q, a}) => <div key={q} className="border-b border-slate-200 py-4"><h3 className="font-bold mb-2">{q}</h3><p className="text-slate-600">{a}</p></div>)}</div>
    <div><h2 className="text-lg font-bold mb-3">{T.sourcesTitle}</h2><ul className="space-y-2">{market.SOURCES.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline">{source.name}</a></li>)}</ul><p className="text-sm text-slate-500 mt-4">{T.reviewed}</p></div>
  </section>;
}
