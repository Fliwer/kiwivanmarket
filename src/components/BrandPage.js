import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { ArrowLeft } from 'lucide-react';
import VanCard from './VanCard';
import boostVisibility from '../utils/boostVisibility.js';
import { useBoostClock } from '../hooks/useBoostClock';
import AlertCta from './AlertCta';
import SeoHead from './SeoHead';
import taxonomy from '../data/seo/taxonomy';
import { useHideLoader } from '../hooks/useHideLoader';
import { useTranslation } from 'react-i18next';
import { seoCopy, seoLang, SEO_LANGS, priceStats, nzd } from '../data/seo';

const BRANDS_CONFIG = {
  'toyota-hiace': {
    name: 'Toyota Hiace',
    keywords: ['Toyota Hiace', 'Hiace campervan', 'Toyota van NZ'],
  },
  'nissan-caravan': {
    name: 'Nissan Caravan',
    keywords: ['Nissan Caravan', 'Nissan campervan', 'Caravan van NZ'],
  },
  'mazda-bongo': {
    name: 'Mazda Bongo',
    keywords: ['Mazda Bongo', 'Bongo campervan', 'Mazda van NZ'],
  },
  'mitsubishi-delica': {
    name: 'Mitsubishi Delica',
    keywords: ['Mitsubishi Delica', 'Delica 4WD', 'Delica campervan NZ'],
  },
  'ford-transit': {
    name: 'Ford Transit',
    keywords: ['Ford Transit', 'Transit campervan', 'Ford van NZ'],
  },
  'mercedes-sprinter': {
    name: 'Mercedes Sprinter',
    keywords: ['Mercedes Sprinter', 'Sprinter campervan', 'Mercedes van NZ'],
  },
};

// Schema.org pour la page de marque
const BrandSchema = ({ brand, vans, url }) => {
  const language = new URL(url).searchParams.get('lang');
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: brand.title,
    url,
    numberOfItems: vans.length,
    itemListElement: vans.map((van, index) => ({
      '@type': 'ListItem', position: index + 1,
      name: van.title,
      url: `https://kiwivanmarket.com/van/${van.id}${language ? '?lang=' + language : ''}`,
    })),
  };
  return <script type="application/ld+json">{JSON.stringify(schema)}</script>;
};

export default function BrandPage() {
  useHideLoader();
  const { brand } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language || 'en').split('-')[0];
  const [vans, setVans] = useState([]);
  const boostNow = useBoostClock();
  const [loading, setLoading] = useState(true);

  const brandConfig = BRANDS_CONFIG[brand];
  const url = `https://kiwivanmarket.com/brand/${brand}`;
  // Textes SEO partagés avec le prerender (src/data/seo), dans la langue courante.
  const lang = seoLang(i18n.language);
  const S = seoCopy(i18n.language);
  const stats = priceStats(vans);
  const statsFmt = stats && { count: stats.count, min: nzd(stats.min), max: nzd(stats.max), avg: nzd(stats.avg) };
  const name = brandConfig?.name || '';
  const seoTitle = S.brand.title(name).replace(' | Kiwi Van Market', '');
  const seoDescription = statsFmt ? S.brand.metaDesc(name, statsFmt, vans.length) : S.brand.metaDescNoStats(name);
  const brandFaqs = brandConfig ? S.brand.faqs(name, statsFmt) : [];

  useEffect(() => {
    const fetchVans = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'vans'));
        const allVans = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Filtrer par marque (active and sold vans)
        const visible = allVans.filter((van) => !van.status || ['active', 'sold'].includes(van.status));
        const filtered = taxonomy.vansForTaxonomy(visible, 'brands', brand);

        // Tri : Actifs en premier, puis les Vendus (plus récents en premier dans chaque groupe)
        filtered.sort((a, b) => {
          const statusOrder = (a.status === 'sold' ? 1 : 0) - (b.status === 'sold' ? 1 : 0);
          if (statusOrder !== 0) return statusOrder;

          const getTs = (v) => {
            if (!v.createdAt) return 0;
            const d = v.createdAt.toDate ? v.createdAt.toDate() : new Date(v.createdAt);
            return d ? d.getTime() : 0;
          };
          return getTs(b) - getTs(a);
        });

        setVans(filtered);
      } catch (error) {
        console.error('Error fetching vans:', error);
      } finally {
        setLoading(false);
      }
    };

    if (brandConfig) {
      fetchVans();
    } else {
      setLoading(false);
    }
  }, [brand, brandConfig, currentLang]);

  if (!brandConfig && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">{t('seo_pages.brand.not_found')}</h1>
          <Link to="/" className="text-emerald-600 hover:underline">{t('seo_pages.back_to_listings')}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <SeoHead
        title={seoTitle}
        description={seoDescription}
        keywords={brandConfig?.keywords}
        noindex={!loading && !vans.length}
        alternateLangs={SEO_LANGS}
        faqs={brandFaqs}
        breadcrumbs={[
          { name: S.common.home, path: '/' },
          { name: t('seo_pages.brand.crumb'), path: '/guides' },
          { name: brandConfig?.name || 'Brand', path: `/brand/${brand}` },
        ]}
      />

      {brandConfig && <BrandSchema brand={{ title: seoTitle }} vans={vans} url={lang === 'en' ? url : `${url}?lang=${lang}`} />}

      {/* Hero Section */}
      <div className="bg-emerald-600 text-white pt-24 pb-12 px-4 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-emerald-100 hover:text-white transition mb-6"
          >
            <ArrowLeft size={20} />
            <span>{t('seo_pages.back')}</span>
          </button>
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            {S.brand.h1(name)}
          </h1>
          <p className="text-emerald-100 text-lg max-w-2xl leading-relaxed">
            {seoDescription}
          </p>
          <div className="mt-8 flex items-center gap-4 text-sm font-bold bg-white/10 w-fit px-4 py-2 rounded-full border border-white/20">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            {vans.length === 0 ? t('seo_pages.brand.searching') : t('seo_pages.brand.available', { count: vans.length })}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500 font-bold">{t('seo_pages.brand.loading', { name })}</p>
          </div>
        ) : (
          <>
            {vans.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center shadow-xl border border-gray-100">
                <div className="text-6xl mb-6">🚐</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('seo_pages.brand.empty_title', { name })}</h2>
                <p className="text-gray-500 mb-8">{t('seo_pages.brand.empty_text')}</p>
                <Link to="/" className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-emerald-700 transition shadow-lg">
                  {t('seo_pages.brand.browse_all')}
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {boostVisibility.rankVans(vans, 'newest', boostNow).map(van => (
                  <VanCard key={van.id} van={van} />
                ))}
              </div>
            )}

            <AlertCta variant="banner" source="brand" className="mt-10" defaults={{ brand }} />

            <div className="mt-10 bg-white rounded-2xl border border-slate-100 p-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4">{t('seo_pages.links_title')}</h3>
              <div className="flex flex-wrap gap-2">
                <Link to={`/faq/brand/${brand}`} className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 font-bold text-sm">
                  {t('seo_pages.faq_of', { name })}
                </Link>
                <Link to="/guide/buying-campervan-nz" className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm">
                  {t('seo_pages.buyer_guide')}
                </Link>
                <Link to="/search/buy-campervan-in-auckland-under-15000" className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-sm">
                  {t('seo_pages.budget_auckland')}
                </Link>
                <Link to="/search/self-contained-van-christchurch" className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-sm">
                  {t('seo_pages.sc_christchurch')}
                </Link>
              </div>
            </div>

            {/* Premium Guide Section */}
            <div className="mt-20 bg-emerald-900 rounded-[3rem] p-10 md:p-16 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-black mb-6 leading-tight">
                    {t('seo_pages.brand.why_title')} <span className="text-emerald-400">{brandConfig?.name}</span>?
                  </h2>
                  <p className="text-gray-300 mb-8 text-lg font-medium leading-relaxed">
                    {brandConfig?.name === 'Toyota Hiace' ? t('seo_pages.brand.why_hiace') : t('seo_pages.brand.why_generic', { name })}
                  </p>
                  <Link to="/guides" className="bg-white text-emerald-900 px-8 py-4 rounded-2xl font-black hover:bg-emerald-50 transition shadow-xl inline-block">
                    {t('seo_pages.brand.read_guide')}
                  </Link>
                </div>
                <div className="relative">
                  <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10">
                    <img
                      src="https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&q=80&w=800"
                      alt="Vanlife NZ"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
