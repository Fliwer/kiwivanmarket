import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { ArrowLeft } from 'lucide-react';
import VanCard from './VanCard';

// Configuration des marques avec descriptions SEO
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
  const { brand } = useParams();
  const navigate = useNavigate();
  const [vans, setVans] = useState([]);
  const [loading, setLoading] = useState(true);

  const brandConfig = BRANDS_CONFIG[brand];
  const url = `https://kiwivanmarket.com/brand/${brand}`;

  // Fermer le loader initial
  useEffect(() => {
    const loader = document.getElementById('app-loader');
    if (loader) {
      loader.classList.add('fade-out');
      setTimeout(() => loader.remove(), 500);
    }
  }, []);

  useEffect(() => {
    const fetchVans = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'vans'));
        const allVans = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Filtrer par marque (only active vans)
        const filtered = allVans.filter(van => {
          if (van.status && van.status !== 'active') return false;
          const title = (van.title || '').toLowerCase();
          return brandConfig?.searchTerms.some(term => title.includes(term));
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
  }, [brand, brandConfig]);

  // 404 si marque non trouvée
  if (!brandConfig) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🚐</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Brand Not Found</h1>
          <p className="text-gray-600 mb-6">We don't have this brand listed yet.</p>
          <Link
            to="/"
            className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition inline-flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            Browse All Vans
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{brandConfig.title}</title>
        <meta name="description" content={brandConfig.description} />
        <link rel="canonical" href={url} />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content={brandConfig.title} />
        <meta property="og:description" content={brandConfig.description} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_NZ" />
      </Helmet>
      <BrandSchema brand={brandConfig} vans={vans} url={url} />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-white/80 hover:text-white mb-4 transition"
            >
              <ArrowLeft size={20} />
              Back to all vans
            </button>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{brandConfig.name} Campervans</h1>
            <p className="text-white/90 max-w-2xl">
              {brandConfig.description}
            </p>
            <div className="mt-4 flex items-center gap-4">
              <span className="bg-white/20 px-4 py-2 rounded-full text-sm font-semibold">
                {vans.length} {brandConfig.name} vans available
              </span>
            </div>
          </div>
        </header>

        {/* Breadcrumb */}
        <nav className="max-w-7xl mx-auto px-4 py-3" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm text-gray-500">
            <li><Link to="/" className="hover:text-emerald-600">Home</Link></li>
            <li>/</li>
            <li><Link to="/" className="hover:text-emerald-600">Campervans</Link></li>
            <li>/</li>
            <li className="text-gray-800 font-medium">{brandConfig.name}</li>
          </ol>
        </nav>

        {/* Van Grid */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
              <p className="mt-4 text-gray-600">Loading {brandConfig.name} vans...</p>
            </div>
          ) : vans.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">No {brandConfig.name} vans available</h2>
              <p className="text-gray-600 mb-6">Check back soon or browse other brands.</p>
              <Link
                to="/"
                className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition"
              >
                Browse All Vans
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vans.map(van => (
                <VanCard key={van.id} van={van} />
              ))}
            </div>
          )}

          {/* SEO Content */}
          <section className="mt-16 prose prose-emerald max-w-none">
            <h2>Why Choose a {brandConfig.name}?</h2>
            <p>
              The {brandConfig.name} is one of the most sought-after campervans in New Zealand.
              Known for reliability and practicality, it's the perfect choice for backpackers
              and travellers exploring Aotearoa. Browse our selection of {brandConfig.name} vans
              above, all with verified details including WOF status, registration, and
              self-containment certification.
            </p>
            <h3>Buying a {brandConfig.name} in New Zealand</h3>
            <p>
              When purchasing a {brandConfig.name} campervan, always check the WOF (Warrant of Fitness)
              and registration expiry dates. Many of our {brandConfig.name} listings include
              buy-back guarantees, perfect if you're on a working holiday visa and plan to
              sell at the end of your trip.
            </p>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full overflow-hidden" style={{ backgroundColor: '#f7eedd' }}>
                <img src="/kiwi-van-logo-48.webp" alt="Kiwi Van Market" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-xl">Kiwi Van Market</span>
            </Link>
            <p className="text-gray-400 text-sm">
              The #1 marketplace for campervans in New Zealand
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
