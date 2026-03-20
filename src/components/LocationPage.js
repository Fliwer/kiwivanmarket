import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { MapPin, ArrowLeft } from 'lucide-react';
import VanCard from './VanCard';
import SeoHead from './SeoHead';
import { useTranslation } from 'react-i18next';
import { useHideLoader } from '../hooks/useHideLoader';

// Configuration des locations avec descriptions SEO
const LOCATIONS_CONFIG = {
  'auckland': {
    name: 'Auckland',
    region: 'North Island',
    title: 'Campervans for Sale in Auckland, New Zealand',
    description: 'Find campervans for sale in Auckland, NZ. Browse self-contained vans, Toyota Hiace, Nissan Caravan and more. Auckland is the best place to start your New Zealand road trip adventure.',
    searchTerms: ['auckland'],
    keywords: ['Campervans Auckland', 'Buy van Auckland', 'Self contained van Auckland NZ'],
    highlights: ['Largest selection in NZ', 'Easy airport access', 'Start point for North Island trips'],
  },
  'wellington': {
    name: 'Wellington',
    region: 'North Island',
    title: 'Campervans for Sale in Wellington, New Zealand',
    description: 'Browse campervans for sale in Wellington. Perfect starting point for South Island adventures via the Interislander ferry. Find reliable vans with valid WOF and self-containment.',
    searchTerms: ['wellington'],
    keywords: ['Campervans Wellington', 'Buy van Wellington', 'Wellington campervan sales NZ'],
    highlights: ['Ferry to South Island', 'Capital city', 'Great café culture'],
  },
  'christchurch': {
    name: 'Christchurch',
    region: 'South Island',
    title: 'Campervans for Sale in Christchurch, New Zealand',
    description: 'Discover campervans for sale in Christchurch. Gateway to the South Island\'s stunning landscapes. Find self-contained vans perfect for exploring Queenstown, Milford Sound, and more.',
    searchTerms: ['christchurch'],
    keywords: ['Campervans Christchurch', 'Buy van Christchurch', 'Self contained van Christchurch'],
    highlights: ['South Island gateway', 'Close to ski fields', 'Garden city'],
  },
  'queenstown': {
    name: 'Queenstown',
    region: 'South Island',
    title: 'Campervans for Sale in Queenstown, New Zealand',
    description: 'Shop campervans in Queenstown, adventure capital of NZ. Find vans ready for exploring Milford Sound, Wanaka, and the stunning Otago region. Self-contained options available.',
    searchTerms: ['queenstown'],
    keywords: ['Campervans Queenstown', 'Buy van Queenstown', 'Queenstown campervan NZ'],
    highlights: ['Adventure capital', 'Stunning scenery', 'Year-round destination'],
  },
  'hamilton': {
    name: 'Hamilton',
    region: 'North Island',
    title: 'Campervans for Sale in Hamilton, New Zealand',
    description: 'Find campervans for sale in Hamilton. Central North Island location, perfect base for exploring Waitomo Caves, Hobbiton, and Rotorua. Affordable vans with buy-back options.',
    searchTerms: ['hamilton'],
    keywords: ['Campervans Hamilton', 'Buy van Hamilton', 'Hamilton van sales NZ'],
    highlights: ['Central location', 'Near Hobbiton', 'Affordable options'],
  },
  'tauranga': {
    name: 'Tauranga',
    region: 'North Island',
    title: 'Campervans for Sale in Tauranga, New Zealand',
    description: 'Browse campervans in Tauranga and the Bay of Plenty. Beautiful beaches, Mount Maunganui, and great weather. Find your perfect road trip van.',
    searchTerms: ['tauranga', 'bay of plenty'],
    keywords: ['Campervans Tauranga', 'Buy van Tauranga', 'Tauranga camper sales'],
    highlights: ['Beach lifestyle', 'Great weather', 'Mount Maunganui'],
  },
  'dunedin': {
    name: 'Dunedin',
    region: 'South Island',
    title: 'Campervans for Sale in Dunedin, New Zealand',
    description: 'Discover campervans for sale in Dunedin. Scottish heritage, wildlife, and gateway to the Catlins. Find reliable vans for your South Island adventure.',
    searchTerms: ['dunedin'],
    keywords: ['Campervans Dunedin', 'Buy van Dunedin', 'Dunedin backpacker van'],
    highlights: ['Wildlife spotting', 'University town', 'Catlins gateway'],
  },
  'rotorua': {
    name: 'Rotorua',
    region: 'North Island',
    title: 'Campervans for Sale in Rotorua, New Zealand',
    description: 'Find campervans in Rotorua, heart of Maori culture and geothermal wonders. Perfect base for exploring the North Island\'s thermal attractions.',
    searchTerms: ['rotorua'],
    keywords: ['Campervans Rotorua', 'Buy van Rotorua', 'Rotorua campervan sales'],
    highlights: ['Geothermal wonders', 'Maori culture', 'Mountain biking'],
  },
};

// Schema.org pour la page de location
const LocationSchema = ({ location, vans, url }) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": location.title,
    "description": location.description,
    "url": url,
    "about": {
      "@type": "City",
      "name": location.name,
      "containedInPlace": {
        "@type": "Country",
        "name": "New Zealand"
      }
    },
    "numberOfItems": vans.length,
    "itemListElement": vans.slice(0, 12).map((van, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Car",
        "name": van.title,
        "url": `https://kiwivanmarket.com/van/${van.id}`,
        "image": van.images?.[0] || van.imageUrl,
        "offers": {
          "@type": "Offer",
          "price": van.price,
          "priceCurrency": "NZD",
          "availability": van.status === 'sold' ? "https://schema.org/SoldOut" : "https://schema.org/InStock"
        },
        "itemCondition": "https://schema.org/UsedCondition"
      }
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
  const [loading, setLoading] = useState(true);

  const locationConfig = LOCATIONS_CONFIG[location];
  const url = `https://kiwivanmarket.com/location/${location}`;

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
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Location not found</h1>
          <Link to="/" className="text-emerald-600 hover:underline">Back to listings</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <SeoHead
        title={locationConfig?.title}
        description={locationConfig?.description}
        keywords={locationConfig?.keywords}
        canonicalUrl={url}
      />

      {locationConfig && <LocationSchema location={locationConfig} vans={vans} url={url} />}

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
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-2xl">
              <MapPin size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl font-black">
              {locationConfig?.name}
            </h1>
          </div>
          <p className="text-emerald-100 text-lg max-w-2xl leading-relaxed">
            {locationConfig?.description}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {locationConfig?.highlights.map((highlight, idx) => (
              <span key={idx} className="bg-white/10 px-4 py-2 rounded-xl text-sm font-bold border border-white/20">
                {highlight}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500 font-bold">Finding vans in {locationConfig?.name}...</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-800">
                {vans.length} {vans.length === 1 ? 'Van' : 'Vans'} Available
              </h2>
            </div>

            {vans.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center shadow-xl border border-gray-100">
                <div className="text-6xl mb-6">📍</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">No vans found in {locationConfig?.name}</h2>
                <p className="text-gray-500 mb-8">Try searching in a nearby region or check all listings.</p>
                <Link to="/" className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-emerald-700 transition shadow-lg">
                  View All Listings
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {vans.map(van => (
                  <VanCard key={van.id} van={van} />
                ))}
              </div>
            )}

            {/* Premium Location Footer */}
            <div className="mt-20 bg-slate-900 rounded-[3rem] p-10 md:p-16 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-black mb-6 leading-tight">
                    Start your journey in <span className="text-emerald-400">{locationConfig?.name}</span>
                  </h2>
                  <p className="text-gray-400 mb-8 text-lg font-medium leading-relaxed">
                    Auckland is the gateway to New Zealand. Most travelers start here, which means you'll find the best selection of fully equipped campervans and motorhomes ready for your road trip.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
                        <MapPin size={20} />
                      </div>
                      <span className="font-bold">Many pick-up points near the airport</span>
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
