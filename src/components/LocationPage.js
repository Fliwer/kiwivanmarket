import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { MapPin, ArrowLeft } from 'lucide-react';
import VanCard from './VanCard';
import boostVisibility from '../utils/boostVisibility.js';
import { useBoostClock } from '../hooks/useBoostClock';
import AlertCta from './AlertCta';
import SeoHead from './SeoHead';
import SeoFaqSection from './SeoFaqSection';
import taxonomy from '../data/seo/taxonomy';
import { useTranslation } from 'react-i18next';
import { useHideLoader } from '../hooks/useHideLoader';
import { seoCopy, seoLang, SEO_LANGS, priceStats, nzd } from '../data/seo';

// Configuration des locations avec descriptions SEO
const LOCATIONS_CONFIG = {
  'auckland': {
    name: 'Auckland',
    region: 'North Island',
    title: 'Campervans for Sale in Auckland, New Zealand',
    searchTerms: ['auckland'],
    keywords: ['Campervans Auckland', 'Buy van Auckland', 'Self contained van Auckland NZ'],
  },
  'wellington': {
    name: 'Wellington',
    region: 'North Island',
    title: 'Campervans for Sale in Wellington, New Zealand',
    searchTerms: ['wellington'],
    keywords: ['Campervans Wellington', 'Buy van Wellington', 'Wellington campervan sales NZ'],
  },
  'christchurch': {
    name: 'Christchurch',
    region: 'South Island',
    title: 'Campervans for Sale in Christchurch, New Zealand',
    searchTerms: ['christchurch'],
    keywords: ['Campervans Christchurch', 'Buy van Christchurch', 'Self contained van Christchurch'],
  },
  'queenstown': {
    name: 'Queenstown',
    region: 'South Island',
    title: 'Campervans for Sale in Queenstown, New Zealand',
    searchTerms: ['queenstown'],
    keywords: ['Campervans Queenstown', 'Buy van Queenstown', 'Queenstown campervan NZ'],
  },
  'hamilton': {
    name: 'Hamilton',
    region: 'North Island',
    title: 'Campervans for Sale in Hamilton, New Zealand',
    searchTerms: ['hamilton'],
    keywords: ['Campervans Hamilton', 'Buy van Hamilton', 'Hamilton van sales NZ'],
  },
  'tauranga': {
    name: 'Tauranga',
    region: 'North Island',
    title: 'Campervans for Sale in Tauranga, New Zealand',
    searchTerms: ['tauranga', 'bay of plenty'],
    keywords: ['Campervans Tauranga', 'Buy van Tauranga', 'Tauranga camper sales'],
  },
  'dunedin': {
    name: 'Dunedin',
    region: 'South Island',
    title: 'Campervans for Sale in Dunedin, New Zealand',
    searchTerms: ['dunedin'],
    keywords: ['Campervans Dunedin', 'Buy van Dunedin', 'Dunedin backpacker van'],
  },
  'rotorua': {
    name: 'Rotorua',
    region: 'North Island',
    title: 'Campervans for Sale in Rotorua, New Zealand',
    searchTerms: ['rotorua'],
    keywords: ['Campervans Rotorua', 'Buy van Rotorua', 'Rotorua campervan sales'],
  },
  'nelson': {
    name: 'Nelson',
    region: 'South Island',
    title: 'Campervans for Sale in Nelson, New Zealand',
    searchTerms: ['nelson'],
    keywords: ['Campervans Nelson', 'Buy van Nelson', 'Nelson campervan sales NZ'],
  },
};

// Schema.org pour la page de location
const LocationSchema = ({ name, description, vans, url }) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": name,
    "description": description,
    "url": url,
    "numberOfItems": vans.length,
    "itemListElement": vans.map((van, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": van.title,
      "url": `https://kiwivanmarket.com/van/${van.id}`
    }))
  };

  return (
    <script type="application/ld+json">
      {JSON.stringify(schema)}
    </script>
  );
};

export default function LocationPage() {
  useHideLoader();
  const { location } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language || 'en').split('-')[0];
  const [vans, setVans] = useState([]);
  const boostNow = useBoostClock();
  const [loading, setLoading] = useState(true);

  const locationConfig = LOCATIONS_CONFIG[location];
  const url = `https://kiwivanmarket.com/location/${location}`;
  // Textes SEO partagés avec le prerender (src/data/seo), dans la langue courante.
  const lang = seoLang(i18n.language);
  const S = seoCopy(i18n.language);
  const activeVans = taxonomy.activeStock(vans);
  const stats = priceStats(vans);
  const statsFmt = stats && { count: stats.count, min: nzd(stats.min), max: nzd(stats.max), avg: nzd(stats.avg) };
  const name = locationConfig?.name || '';
  const seoTitle = lang === 'en' ? locationConfig?.title : S.location.title(name).replace(' | Kiwi Van Market', '');
  const seoDescription = statsFmt ? S.location.metaDesc(name, statsFmt, activeVans.length) : S.location.metaDescNoStats(name);
  const heroText = S.location.blurbs[location];
  const locationFaqs = locationConfig ? S.location.faqs(name, statsFmt) : [];

  useEffect(() => {
    const fetchVans = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'vans'));
        const allVans = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Filtrer par location et statut (active and sold vans)
        const filtered = allVans.filter(van => {
          if (van.status && van.status !== 'active' && van.status !== 'sold') return false;

          const vanLocation = (van.location || '').toLowerCase();
          const vanRegion = (van.region || '').toLowerCase();
          return locationConfig?.searchTerms.some(term =>
            vanLocation.includes(term) || vanRegion.includes(term)
          );
        });

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

    if (locationConfig) {
      fetchVans();
    } else {
      setLoading(false);
    }
  }, [location, locationConfig, currentLang]);

  if (!locationConfig && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">{t('seo_pages.location.not_found')}</h1>
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
        keywords={locationConfig?.keywords}
        noindex={!loading && !taxonomy.hasActiveStock(vans)}
        alternateLangs={SEO_LANGS}
        faqs={locationFaqs}
        breadcrumbs={[
          { name: S.common.home, path: '/' },
          { name: t('seo_pages.location.crumb'), path: '/guides' },
          { name: locationConfig?.name || 'Location', path: `/location/${location}` },
        ]}
      />

      {locationConfig && <LocationSchema name={seoTitle} description={seoDescription} vans={activeVans} url={lang === 'en' ? url : `${url}?lang=${lang}`} />}

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
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-2xl">
              <MapPin size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl font-black">
              {locationConfig?.name}
            </h1>
          </div>
          <p className="text-emerald-100 text-lg max-w-2xl leading-relaxed">
            {heroText}
          </p>

        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500 font-bold">{t('seo_pages.location.loading', { name })}</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-800">
                {t(activeVans.length === 1 ? 'seo_pages.location.available_one' : 'seo_pages.location.available_many', { count: activeVans.length })}
              </h2>
            </div>

            {vans.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center shadow-xl border border-gray-100">
                <div className="text-6xl mb-6">📍</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('seo_pages.location.empty_title', { name })}</h2>
                <p className="text-gray-500 mb-8">{t('seo_pages.location.empty_text')}</p>
                <Link to="/" className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-emerald-700 transition shadow-lg">
                  {t('seo_pages.location.view_all')}
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {boostVisibility.rankVans(vans, 'newest', boostNow).map(van => (
                  <VanCard key={van.id} van={van} />
                ))}
              </div>
            )}

            <AlertCta variant="banner" source="location" className="mt-10" defaults={{ location }} />

            <SeoFaqSection title={S.common.faqTitle} faqs={locationFaqs} className="mt-10" />

            <div className="mt-10 bg-white rounded-2xl border border-slate-100 p-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4">{t('seo_pages.links_title')}</h3>
              <div className="flex flex-wrap gap-2">
                <Link to={`/faq/location/${location}`} className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 font-bold text-sm">
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

            {/* Premium Location Footer */}
            <div className="mt-20 bg-slate-900 rounded-[3rem] p-10 md:p-16 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-black mb-6 leading-tight">
                    {t('seo_pages.location.start_title')} <span className="text-emerald-400">{locationConfig?.name}</span>
                  </h2>
                  <p className="text-gray-400 mb-8 text-lg font-medium leading-relaxed">
                    {S.location.blurbs[location]}
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
                        <MapPin size={20} />
                      </div>
                      <span className="font-bold">{t('seo_pages.location.pickup')}</span>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10">
                    <img
                      src="https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&q=80&w=800"
                      alt="Travel NZ"
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
