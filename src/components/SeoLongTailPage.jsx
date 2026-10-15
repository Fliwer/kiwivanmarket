import searchCopy from '../data/seo/search-copy';
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import SeoHead from './SeoHead';
import SeoFaqSection from './SeoFaqSection';
import VanCard from './VanCard';
import boostVisibility from '../utils/boostVisibility.js';
import { useBoostClock } from '../hooks/useBoostClock';
import AlertCta from './AlertCta';
import { useTranslation } from 'react-i18next';
import { SEO_LANGS } from '../data/seo';
import { useHideLoader } from '../hooks/useHideLoader';
import { LONG_TAIL_PAGE_LIST, LONG_TAIL_PAGE_MAP, indexableSlugs, vansForPage } from '../constants/seoLongTailPages';


export default function SeoLongTailPage() {
  useHideLoader();
  const { slug } = useParams();
  const [vans, setVans] = useState([]);
  const [loading, setLoading] = useState(true);
  const boostNow = useBoostClock();

  const { i18n } = useTranslation();
  const lang = searchCopy.searchLang(i18n.language);
  const text = (key, values) => searchCopy.searchText(lang, key, { city: config?.cityName, ...values });
  const sourceConfig = LONG_TAIL_PAGE_MAP[slug];
  const config = useMemo(() => sourceConfig ? searchCopy.localizePage(sourceConfig, lang) : null, [sourceConfig, lang]);
  const href = (path) => lang === 'fr' ? `${path}?lang=fr` : path;
  const [keep, setKeep] = useState(new Set());

  useEffect(() => {
    const fetchVans = async () => {
      if (!config) {
        setLoading(false);
        return;
      }

      try {
        const snap = await getDocs(collection(db, 'vans'));
        const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setVans(vansForPage(all, config));
        setKeep(indexableSlugs(all));
      } catch (err) {
        console.error('Error loading long-tail SEO page:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVans();
  }, [config]);

  const faqs = config ? searchCopy.searchFaqs(config, lang) : [];
  const rankedVans = boostVisibility.rankVans(vans, 'newest', boostNow);

  if (!config) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <SeoHead title={text('notFound')} noindex={true} />
        <div className="text-center">
          <h1 className="text-2xl font-black text-slate-900 mb-3">{text('notFound')}</h1>
          <Link to={href('/')} className="text-emerald-600 font-bold hover:underline">{text('backHome')}</Link>
        </div>
      </div>
    );
  }

  const relatedPages = LONG_TAIL_PAGE_LIST
    .filter((page) => page.city === config.city && page.slug !== slug && keep.has(page.slug))
    .slice(0, 6).map((page) => searchCopy.localizePage(page, lang));

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <SeoHead
        title={config.title}
        alternateLangs={SEO_LANGS}
        noindex={!loading && !keep.has(slug)}
        description={config.description}
        faqs={faqs}
        breadcrumbs={[
          { name: text('home'), path: href('/') },
          { name: text('allCity'), path: href(`/location/${config.city}`) },
          { name: config.heading, path: href(`/search/${slug}`) },
        ]}
      />

      <section className="bg-white border-b border-slate-100 pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">{config.heading}</h1>
          <p className="text-slate-600 max-w-3xl">
            {config.description}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link to={href(`/location/${config.city}`)} className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-sm">
              {text('allCity')}
            </Link>
            <Link to={href(`/faq/location/${config.city}`)} className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 font-bold text-sm">
              {text('faqTitle')}
            </Link>
            <Link to={href('/guide/buying-campervan-nz')} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm">
              {text('buyerGuide')}
            </Link>
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 py-10">
        {loading ? (
          <div className="text-center text-slate-500 font-bold">{text('loading')}</div>
        ) : vans.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
            <h2 className="text-xl font-black text-slate-900 mb-2">{text('emptyTitle')}</h2>
            <p className="text-slate-500 mb-6">{text('emptyText')}</p>
            <div className="mb-6"><AlertCta variant="inline" source="search_empty" defaults={{ location: config.city, brand: config.brandSlug || '', priceMax: config.maxPrice || '', selfContained: !!config.selfContainedOnly }} /></div>
            <div className="flex justify-center gap-3 flex-wrap">
              <Link to={href(`/location/${config.city}`)} className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold">
                {text('allCity')}
              </Link>
              <Link to="/" className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold">
                {text('allListings')}
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {rankedVans.map((van) => <VanCard key={van.id} van={van} />)}
            </div>
            <section className="mt-10 bg-white rounded-2xl border border-slate-100 p-6">
              <AlertCta variant="banner" source="search" className="mb-8" defaults={{ location: config.city, brand: config.brandSlug || '', priceMax: config.maxPrice || '', selfContained: !!config.selfContainedOnly }} />
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4">{text('related')}</h2>
              <div className="flex flex-wrap gap-2">
                {relatedPages.map((page) => (
                  <Link
                    key={page.slug}
                    to={href(`/search/${page.slug}`)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition"
                  >
                    {page.heading}
                  </Link>
                ))}
              </div>
            </section>
          </>
        )}
        {!loading && <SeoFaqSection title={text('faqTitle')} faqs={faqs} className="mt-10" />}
      </main>
    </div>
  );
}
