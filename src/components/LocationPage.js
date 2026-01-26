import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { MapPin, Calendar, Gauge, Heart, Shield, ArrowLeft } from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';
import { getThumbnail } from '../utils/imageOptimizer';

// Configuration des locations avec descriptions SEO
const LOCATIONS_CONFIG = {
  'auckland': {
    name: 'Auckland',
    region: 'North Island',
    title: 'Campervans for Sale in Auckland, New Zealand',
    description: 'Find campervans for sale in Auckland, NZ. Browse self-contained vans, Toyota Hiace, Nissan Caravan and more. Auckland is the best place to start your New Zealand road trip adventure.',
    searchTerms: ['auckland'],
    highlights: ['Largest selection in NZ', 'Easy airport access', 'Start point for North Island trips'],
  },
  'wellington': {
    name: 'Wellington',
    region: 'North Island',
    title: 'Campervans for Sale in Wellington, New Zealand',
    description: 'Browse campervans for sale in Wellington. Perfect starting point for South Island adventures via the Interislander ferry. Find reliable vans with valid WOF and self-containment.',
    searchTerms: ['wellington'],
    highlights: ['Ferry to South Island', 'Capital city', 'Great café culture'],
  },
  'christchurch': {
    name: 'Christchurch',
    region: 'South Island',
    title: 'Campervans for Sale in Christchurch, New Zealand',
    description: 'Discover campervans for sale in Christchurch. Gateway to the South Island\'s stunning landscapes. Find self-contained vans perfect for exploring Queenstown, Milford Sound, and more.',
    searchTerms: ['christchurch'],
    highlights: ['South Island gateway', 'Close to ski fields', 'Garden city'],
  },
  'queenstown': {
    name: 'Queenstown',
    region: 'South Island',
    title: 'Campervans for Sale in Queenstown, New Zealand',
    description: 'Shop campervans in Queenstown, adventure capital of NZ. Find vans ready for exploring Milford Sound, Wanaka, and the stunning Otago region. Self-contained options available.',
    searchTerms: ['queenstown'],
    highlights: ['Adventure capital', 'Stunning scenery', 'Year-round destination'],
  },
  'hamilton': {
    name: 'Hamilton',
    region: 'North Island',
    title: 'Campervans for Sale in Hamilton, New Zealand',
    description: 'Find campervans for sale in Hamilton. Central North Island location, perfect base for exploring Waitomo Caves, Hobbiton, and Rotorua. Affordable vans with buy-back options.',
    searchTerms: ['hamilton'],
    highlights: ['Central location', 'Near Hobbiton', 'Affordable options'],
  },
  'tauranga': {
    name: 'Tauranga',
    region: 'North Island',
    title: 'Campervans for Sale in Tauranga, New Zealand',
    description: 'Browse campervans in Tauranga and the Bay of Plenty. Beautiful beaches, Mount Maunganui, and great weather. Find your perfect road trip van.',
    searchTerms: ['tauranga', 'bay of plenty'],
    highlights: ['Beach lifestyle', 'Great weather', 'Mount Maunganui'],
  },
  'dunedin': {
    name: 'Dunedin',
    region: 'South Island',
    title: 'Campervans for Sale in Dunedin, New Zealand',
    description: 'Discover campervans for sale in Dunedin. Scottish heritage, wildlife, and gateway to the Catlins. Find reliable vans for your South Island adventure.',
    searchTerms: ['dunedin'],
    highlights: ['Wildlife spotting', 'University town', 'Catlins gateway'],
  },
  'rotorua': {
    name: 'Rotorua',
    region: 'North Island',
    title: 'Campervans for Sale in Rotorua, New Zealand',
    description: 'Find campervans in Rotorua, heart of Maori culture and geothermal wonders. Perfect base for exploring the North Island\'s thermal attractions.',
    searchTerms: ['rotorua'],
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
  };

  return (
    <script type="application/ld+json">
      {JSON.stringify(schema)}
    </script>
  );
};

export default function LocationPage() {
  const { location } = useParams();
  const navigate = useNavigate();
  const [vans, setVans] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toggleFavorite, isFavorite } = useFavorites();

  const locationConfig = LOCATIONS_CONFIG[location];
  const url = `https://kiwivanmarket.com/location/${location}`;

  useEffect(() => {
    const fetchVans = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'vans'));
        const allVans = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Filtrer par location
        const filtered = allVans.filter(van => {
          const vanLocation = (van.location || '').toLowerCase();
          const vanRegion = (van.region || '').toLowerCase();
          return locationConfig?.searchTerms.some(term =>
            vanLocation.includes(term) || vanRegion.includes(term)
          );
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
  }, [location, locationConfig]);

  // 404 si location non trouvée
  if (!locationConfig) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">📍</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Location Not Found</h1>
          <p className="text-gray-600 mb-6">We don't have this location listed yet.</p>
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
        <title>{locationConfig.title}</title>
        <meta name="description" content={locationConfig.description} />
        <link rel="canonical" href={url} />
        <meta name="robots" content="index, follow" />
        <meta name="geo.placename" content={`${locationConfig.name}, New Zealand`} />
        <meta name="geo.region" content="NZ" />
        <meta property="og:title" content={locationConfig.title} />
        <meta property="og:description" content={locationConfig.description} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_NZ" />
      </Helmet>
      <LocationSchema location={locationConfig} vans={vans} url={url} />

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
            <div className="flex items-center gap-2 mb-2">
              <MapPin size={28} />
              <h1 className="text-3xl md:text-4xl font-bold">Campervans in {locationConfig.name}</h1>
            </div>
            <p className="text-white/80 text-sm mb-2">{locationConfig.region}, New Zealand</p>
            <p className="text-white/90 max-w-2xl">
              {locationConfig.description}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="bg-white/20 px-4 py-2 rounded-full text-sm font-semibold">
                {vans.length} vans in {locationConfig.name}
              </span>
              {locationConfig.highlights.map((highlight, i) => (
                <span key={i} className="bg-white/10 px-3 py-1 rounded-full text-xs">
                  {highlight}
                </span>
              ))}
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
            <li className="text-gray-800 font-medium">{locationConfig.name}</li>
          </ol>
        </nav>

        {/* Van Grid */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
              <p className="mt-4 text-gray-600">Loading vans in {locationConfig.name}...</p>
            </div>
          ) : vans.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">No vans in {locationConfig.name} right now</h2>
              <p className="text-gray-600 mb-6">Check back soon or browse all locations.</p>
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
                <Link
                  key={van.id}
                  to={`/van/${van.id}`}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition transform hover:-translate-y-1"
                >
                  <div className="relative">
                    <img
                      src={getThumbnail(van.imageUrl || van.images?.[0] || 'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=800')}
                      alt={van.title}
                      className="w-full h-56 object-cover"
                      loading="lazy"
                    />
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(van.id); }}
                      className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-lg hover:scale-110 transition"
                    >
                      <Heart size={20} className={isFavorite(van.id) ? 'text-red-500 fill-red-500' : 'text-gray-400'} />
                    </button>
                    {van.buyBack && (
                      <div className="absolute bottom-3 left-3 bg-green-400 text-green-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <Shield size={12} />
                        Buy-Back
                      </div>
                    )}
                    {van.selfContained && (
                      <div className="absolute bottom-3 right-3 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        Self-Contained
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h2 className="font-bold text-lg text-gray-800 mb-1 truncate">{van.title}</h2>
                    <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
                      <MapPin size={14} />
                      <span>{van.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-emerald-600">
                        ${van.price?.toLocaleString()}
                      </span>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {van.year}
                        </span>
                        <span className="flex items-center gap-1">
                          <Gauge size={12} />
                          {van.mileage?.toLocaleString()}km
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* SEO Content */}
          <section className="mt-16 prose prose-emerald max-w-none">
            <h2>Buying a Campervan in {locationConfig.name}</h2>
            <p>
              {locationConfig.name} is a fantastic place to buy a campervan in New Zealand.
              Located in the {locationConfig.region}, it offers easy access to some of
              NZ's most incredible destinations. Whether you're starting your adventure
              or looking to sell at the end of your trip, {locationConfig.name} has
              a great selection of campervans.
            </p>
            <h3>Why {locationConfig.name}?</h3>
            <ul>
              {locationConfig.highlights.map((highlight, i) => (
                <li key={i}>{highlight}</li>
              ))}
            </ul>
            <p>
              All campervans listed on Kiwi Van Market include verified WOF and
              registration details. Many sellers in {locationConfig.name} offer
              buy-back guarantees, perfect for backpackers on working holiday visas.
            </p>
          </section>

          {/* Other Locations */}
          <section className="mt-12">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Browse Other Locations</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(LOCATIONS_CONFIG)
                .filter(([key]) => key !== location)
                .map(([key, loc]) => (
                  <Link
                    key={key}
                    to={`/location/${key}`}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-emerald-50 hover:border-emerald-200 transition"
                  >
                    {loc.name}
                  </Link>
                ))}
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full overflow-hidden" style={{ backgroundColor: '#f7eedd' }}>
                <img src="/kiwi-van-logo.png" alt="Kiwi Van Market" className="w-full h-full object-contain" />
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
