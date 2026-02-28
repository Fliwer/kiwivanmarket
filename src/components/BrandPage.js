import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { ArrowLeft } from 'lucide-react';
import VanCard from './VanCard';
import SeoHead from './SeoHead';
import { useHideLoader } from '../hooks/useHideLoader';
import { useTranslation } from 'react-i18next';

const BRANDS_CONFIG = {
  'toyota-hiace': {
    name: 'Toyota Hiace',
    title: 'Toyota Hiace Campervans for Sale in New Zealand',
    description: 'Browse Toyota Hiace campervans for sale in New Zealand. The Hiace is the most popular campervan choice for backpackers - reliable, fuel-efficient, and easy to maintain. Find self-contained Toyota Hiace vans with valid WOF.',
    keywords: ['Toyota Hiace', 'Hiace campervan', 'Toyota van NZ'],
    searchTerms: ['toyota', 'hiace'],
  },
  'nissan-caravan': {
    name: 'Nissan Caravan',
    title: 'Nissan Caravan Campervans for Sale in New Zealand',
    description: 'Find Nissan Caravan campervans for sale in NZ. Spacious and affordable, the Caravan offers excellent value for backpackers. Browse self-contained Nissan vans with buy-back options.',
    keywords: ['Nissan Caravan', 'Nissan campervan', 'Caravan van NZ'],
    searchTerms: ['nissan', 'caravan'],
  },
  'mazda-bongo': {
    name: 'Mazda Bongo',
    title: 'Mazda Bongo Campervans for Sale in New Zealand',
    description: 'Discover Mazda Bongo campervans for sale in New Zealand. Compact, fuel-efficient, and perfect for couples. Many Bongos feature pop-top roofs and self-contained certification.',
    keywords: ['Mazda Bongo', 'Bongo campervan', 'Mazda van NZ'],
    searchTerms: ['mazda', 'bongo'],
  },
  'mitsubishi-delica': {
    name: 'Mitsubishi Delica',
    title: 'Mitsubishi Delica Campervans for Sale in New Zealand',
    description: 'Shop Mitsubishi Delica campervans in NZ. The Delica offers 4WD capability perfect for exploring New Zealand\'s rugged terrain. Find self-contained Delicas ready for adventure.',
    keywords: ['Mitsubishi Delica', 'Delica 4WD', 'Delica campervan NZ'],
    searchTerms: ['mitsubishi', 'delica'],
  },
  'ford-transit': {
    name: 'Ford Transit',
    title: 'Ford Transit Campervans for Sale in New Zealand',
    description: 'Browse Ford Transit campervans for sale in New Zealand. Large, versatile, and perfect for full-time van life. Find converted Ford Transit vans with all amenities.',
    keywords: ['Ford Transit', 'Transit campervan', 'Ford van NZ'],
    searchTerms: ['ford', 'transit'],
  },
  'mercedes-sprinter': {
    name: 'Mercedes Sprinter',
    title: 'Mercedes Sprinter Campervans for Sale in New Zealand',
    description: 'Find Mercedes Sprinter campervans in NZ. Premium quality, spacious interiors, and built to last. Browse luxury Sprinter conversions for the ultimate road trip.',
    keywords: ['Mercedes Sprinter', 'Sprinter campervan', 'Mercedes van NZ'],
    searchTerms: ['mercedes', 'sprinter'],
  },
};

// Schema.org pour la page de marque
const BrandSchema = ({ brand, vans, url }) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": brand.title,
    "description": brand.description,
    "url": url,
    "numberOfItems": vans.length,
    "itemListElement": vans.slice(0, 10).map((van, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Vehicle",
        "name": van.title,
        "url": `https://kiwivanmarket.com/van/${van.id}`,
        "image": van.images?.[0] || van.imageUrl,
        "offers": {
          "@type": "Offer",
          "price": van.price,
          "priceCurrency": "NZD"
        }
      }
    }))
  };

  return (
    <script type="application/ld+json">
      {JSON.stringify(schema)}
    </script>
  );
};

export default function BrandPage() {
  useHideLoader();
  const { brand } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language || 'en').split('-')[0];
  const [vans, setVans] = useState([]);
  const [loading, setLoading] = useState(true);

  const brandConfig = BRANDS_CONFIG[brand];
  const url = `https://kiwivanmarket.com/brand/${brand}`;

  useEffect(() => {
    const fetchVans = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'vans'));
        const allVans = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Filtrer par marque (active and sold vans)
        const filtered = allVans.filter(van => {
          if (van.status && van.status !== 'active' && van.status !== 'sold') return false;
          const title = (van.title || '').toLowerCase();
          return brandConfig?.searchTerms.some(term => title.includes(term));
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
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Brand not found</h1>
          <Link to="/" className="text-emerald-600 hover:underline">Back to listings</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <SeoHead
        title={brandConfig?.title}
        description={brandConfig?.description}
        keywords={brandConfig?.keywords}
        canonicalUrl={url}
      />

      {brandConfig && <BrandSchema brand={brandConfig} vans={vans} url={url} />}

      {/* Hero Section */}
      <div className="bg-emerald-600 text-white pt-24 pb-12 px-4 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-emerald-100 hover:text-white transition mb-6"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            {brandConfig?.name}
          </h1>
          <p className="text-emerald-100 text-lg max-w-2xl leading-relaxed">
            {brandConfig?.description}
          </p>
          <div className="mt-8 flex items-center gap-4 text-sm font-bold bg-white/10 w-fit px-4 py-2 rounded-full border border-white/20">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            {vans.length === 0 ? 'Searching specialized market...' : `${vans.length} Vans Available`}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500 font-bold">Loading {brandConfig?.name} listings...</p>
          </div>
        ) : (
          <>
            {vans.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center shadow-xl border border-gray-100">
                <div className="text-6xl mb-6">🚐</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">No {brandConfig?.name} currently listed</h2>
                <p className="text-gray-500 mb-8">Try selecting a different brand or checking back soon.</p>
                <Link to="/" className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-emerald-700 transition shadow-lg">
                  Browse All Vans
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {vans.map(van => (
                  <VanCard key={van.id} van={van} />
                ))}
              </div>
            )}

            {/* Premium Guide Section */}
            <div className="mt-20 bg-emerald-900 rounded-[3rem] p-10 md:p-16 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-black mb-6 leading-tight">
                    Why choose a <span className="text-emerald-400">{brandConfig?.name}</span>?
                  </h2>
                  <p className="text-gray-300 mb-8 text-lg font-medium leading-relaxed">
                    {brandConfig?.name === 'Toyota Hiace' ?
                      "The Hiace is New Zealand's cult classic for a reason. Spare parts are available in every small town, and the engines are practically bulletproof. Perfect for long West Coast exploration." :
                      `The ${brandConfig?.name} offers a perfect balance of reliability and comfort for your New Zealand road trip. Known for being spacious and easy to convert.`
                    }
                  </p>
                  <Link to="/guides" className="bg-white text-emerald-900 px-8 py-4 rounded-2xl font-black hover:bg-emerald-50 transition shadow-xl inline-block">
                    Read Buyer's Guide
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
