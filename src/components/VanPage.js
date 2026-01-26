import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import { useFavorites } from '../hooks/useFavorites';
import { 
  ArrowLeft, Heart, Share2, MapPin, Calendar, Gauge, Users, 
  Shield, Star, Clock, CheckCircle, X, MessageCircle, ChevronLeft, ChevronRight
} from 'lucide-react';

// Lazy load du QuickMessageBox
const QuickMessageBox = lazy(() => import('./QuickMessageBox'));

// ✅ Composant SEO avec Schema.org pour les vans
const VanSEO = ({ van }) => {
  if (!van) return null;

  const url = `https://kiwivanmarket.com/van/${van.id}`;
  const image = van.images?.[0] || van.imageUrl || 'https://kiwivanmarket.com/default-van.jpg';
  const title = `${van.title} - NZ$${van.price?.toLocaleString()} | Kiwi Van Market`;

  // Description SEO enrichie avec équipements
  const features = [];
  if (van.selfContained) features.push('self-contained');
  if (van.buyBack) features.push('buy-back guarantee');
  if (van.equipment?.doubleBed) features.push('double bed');
  if (van.equipment?.solarPanel) features.push('solar panel');
  if (van.equipment?.fridge) features.push('fridge');

  const featuresText = features.length > 0 ? ` Features: ${features.join(', ')}.` : '';
  const description = `${van.year} ${van.title} for sale in ${van.location}, New Zealand. ${van.mileage?.toLocaleString()}km, ${van.capacity || 2} berth.${featuresText} Perfect campervan for backpackers and travellers.`.slice(0, 160);
  
  // Schema.org JSON-LD pour Google Rich Snippets
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    "name": van.title,
    "description": van.description,
    "image": van.images || [image],
    "url": url,
    "offers": {
      "@type": "Offer",
      "price": van.price,
      "priceCurrency": "NZD",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Person",
        "name": van.seller?.name || "Seller"
      }
    },
    "vehicleModelDate": van.year?.toString(),
    "mileageFromOdometer": {
      "@type": "QuantitativeValue",
      "value": van.mileage,
      "unitCode": "KMT"
    },
    "vehicleConfiguration": van.type || "Van",
    "numberOfDoors": 3,
    "vehicleSeatingCapacity": van.capacity || 2,
    "itemCondition": "https://schema.org/UsedCondition",
    "brand": {
      "@type": "Brand",
      "name": van.title?.split(' ')[0] || "Campervan"
    }
  };

  // BreadcrumbList pour navigation
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://kiwivanmarket.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Campervans",
        "item": "https://kiwivanmarket.com/#listings"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": van.title,
        "item": url
      }
    ]
  };

  // FAQ Schema contextuel basé sur les caractéristiques du van
  const faqItems = [
    {
      "@type": "Question",
      "name": `Is this ${van.title?.split(' ')[0] || 'campervan'} a good choice for backpackers?`,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": `This ${van.year} ${van.title} is located in ${van.location}, New Zealand. ${van.selfContained ? 'It is self-contained, meaning you can freedom camp in designated areas.' : 'It is not self-contained, so you will need to stay at campsites with facilities.'} ${van.buyBack ? 'The seller offers a buy-back guarantee, which is great for travellers on a working holiday visa.' : ''}`
      }
    },
    {
      "@type": "Question",
      "name": "What should I check before buying a campervan in New Zealand?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Always verify the WOF (Warrant of Fitness) and REGO (registration) expiry dates. This van's WOF is valid until " + (van.wofExpiry ? new Date(van.wofExpiry).toLocaleDateString('en-NZ') : 'not specified') + ". Meet the seller in person, inspect the vehicle thoroughly, and consider getting a mechanical inspection for peace of mind."
      }
    }
  ];

  // Ajouter FAQ sur self-contained si applicable
  if (van.selfContained) {
    faqItems.push({
      "@type": "Question",
      "name": "What does self-contained mean for campervans in New Zealand?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A self-contained campervan has a toilet, fresh water tank, and grey water tank that meets NZ standards (NZS 5465). This allows you to freedom camp in many scenic locations across New Zealand. This van is certified self-contained."
      }
    });
  }

  // Ajouter FAQ sur buy-back si applicable
  if (van.buyBack) {
    faqItems.push({
      "@type": "Question",
      "name": "How does the buy-back guarantee work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": `This seller offers a buy-back option${van.buyBackPrice ? ` at NZ$${van.buyBackPrice.toLocaleString()}` : ''}${van.buyBackDuration ? ` valid for ${van.buyBackDuration} months` : ''}. Buy-back guarantees are agreements between you and the seller - contact them directly for specific terms and conditions.`
      }
    });
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems
  };

  return (
    <Helmet>
      {/* Balises meta de base */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta name="robots" content="index, follow, max-image-preview:large" />

      {/* Open Graph pour Facebook/LinkedIn */}
      <meta property="og:type" content="product" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="Kiwi Van Market" />
      <meta property="og:locale" content="en_NZ" />
      <meta property="product:price:amount" content={van.price} />
      <meta property="product:price:currency" content="NZD" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Schema.org JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </script>
    </Helmet>
  );
};

// ✅ Loading Skeleton
const VanPageSkeleton = () => (
  <div className="min-h-screen bg-gray-50 animate-pulse">
    <div className="bg-gradient-to-r from-emerald-600 to-teal-500 h-16"></div>
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-gray-200 rounded-2xl h-[400px]"></div>
        <div className="space-y-4">
          <div className="bg-gray-200 h-8 rounded w-3/4"></div>
          <div className="bg-gray-200 h-12 rounded w-1/2"></div>
          <div className="bg-gray-200 h-24 rounded"></div>
        </div>
      </div>
    </div>
  </div>
);

// ✅ Page principale du van
export default function VanPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toggleFavorite, isFavorite } = useFavorites();
  
  const [van, setVan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Fermer le loader initial
  useEffect(() => {
    const loader = document.getElementById('app-loader');
    if (loader) {
      loader.classList.add('fade-out');
      setTimeout(() => loader.remove(), 500);
    }
  }, []);

  // Charger le van depuis Firebase
  useEffect(() => {
    const fetchVan = async () => {
      try {
        setLoading(true);
        const vanRef = doc(db, 'vans', id);
        const vanSnap = await getDoc(vanRef);
        
        if (vanSnap.exists()) {
          const vanData = { id: vanSnap.id, ...vanSnap.data() };
          setVan(vanData);
          
          // Incrémenter le compteur de vues (en arrière-plan)
          updateDoc(vanRef, { views: increment(1) }).catch(() => {});
        } else {
          setError('Van not found');
        }
      } catch (err) {
        console.error('Error fetching van:', err);
        setError('Failed to load van');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchVan();
  }, [id]);

  // Navigation images
  const images = van?.images?.length > 0 
    ? van.images 
    : (van?.imageUrl ? [van.imageUrl] : ['https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=800']);
  
  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

  // Partage
  const shareUrl = `https://kiwivanmarket.com/van/${id}`;
  const shareText = van ? `Check out this ${van.title} for $${van.price?.toLocaleString()} on Kiwi Van Market!` : '';
  
  const handleShare = async (platform) => {
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
      copy: null
    };
    
    if (platform === 'copy') {
      await navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    } else {
      window.open(urls[platform], '_blank', 'width=600,height=400');
    }
    setShowShareMenu(false);
  };

  // Format prix
  const formatPrice = (price) => `NZ$${(price || 0).toLocaleString()}`;
  
  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not specified';
    return new Date(dateStr).toLocaleDateString('en-NZ', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Calcul jours depuis création
  const getDaysAgo = (createdAt) => {
    if (!createdAt) return 0;
    const created = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
    return Math.floor((new Date() - created) / (1000 * 60 * 60 * 24));
  };

  if (loading) return <VanPageSkeleton />;
  
  if (error || !van) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🚐</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Van Not Found</h1>
          <p className="text-gray-600 mb-6">This listing may have been removed or sold.</p>
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

  const seller = van.seller || { name: 'Unknown', rating: 5 };

  return (
    <>
      {/* SEO Meta Tags */}
      <VanSEO van={van} />
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 text-white shadow-lg sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              {/* Bouton retour */}
              <button 
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition text-white font-semibold"
              >
                <ArrowLeft size={20} />
                <span className="hidden sm:inline">Back to listings</span>
              </button>

              {/* Logo centré */}
              <Link to="/" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg overflow-hidden" style={{ backgroundColor: '#f7eedd' }}>
                  <img src="/kiwi-van-logo-48.webp" alt="Kiwi Van Market" className="w-8 h-8 object-contain" />
                </div>
                <span className="hidden md:block font-bold">Kiwi Van Market</span>
              </Link>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => toggleFavorite(van.id)}
                  className="p-2.5 bg-white/20 hover:bg-white/30 rounded-xl transition"
                >
                  <Heart size={22} className={isFavorite(van.id) ? 'text-red-400 fill-red-400' : 'text-white'} />
                </button>
                
                <div className="relative">
                  <button 
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="p-2.5 bg-white/20 hover:bg-white/30 rounded-xl transition"
                  >
                    <Share2 size={22} />
                  </button>
                  
                  {showShareMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowShareMenu(false)} />
                      <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-2xl p-2 min-w-[180px] z-50">
                        <button onClick={() => handleShare('facebook')} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 rounded-lg text-gray-700">
                          📘 Facebook
                        </button>
                        <button onClick={() => handleShare('twitter')} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 rounded-lg text-gray-700">
                          🐦 Twitter
                        </button>
                        <button onClick={() => handleShare('whatsapp')} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 rounded-lg text-gray-700">
                          💬 WhatsApp
                        </button>
                        <button onClick={() => handleShare('copy')} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 rounded-lg text-gray-700">
                          📋 Copy Link
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Breadcrumb SEO */}
        <nav className="max-w-7xl mx-auto px-4 py-3" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm text-gray-500">
            <li><Link to="/" className="hover:text-emerald-600">Home</Link></li>
            <li>/</li>
            <li><Link to="/" className="hover:text-emerald-600">Campervans</Link></li>
            <li>/</li>
            <li className="text-gray-800 font-medium truncate max-w-[200px]">{van.title}</li>
          </ol>
        </nav>

        {/* Contenu principal */}
        <main className="max-w-7xl mx-auto px-4 pb-12">
          <div className="grid lg:grid-cols-2 gap-8 items-start">

            {/* GALERIE PHOTOS - sticky pour rester visible au scroll */}
            <div className="lg:sticky lg:top-20 relative bg-gray-900 rounded-2xl overflow-hidden shadow-xl">
              <div className="aspect-[4/3] flex items-center justify-center">
                <img
                  src={images[currentImageIndex]}
                  alt={`${van.title} - ${currentImageIndex + 1}`}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              
              {/* Navigation images */}
              {images.length > 1 && (
                <>
                  <button 
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 shadow-lg hover:bg-white transition"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button 
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 shadow-lg hover:bg-white transition"
                  >
                    <ChevronRight size={24} />
                  </button>
                  
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {van.featured && (
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5 shadow-lg">
                    <Star size={14} fill="currentColor" /> FEATURED
                  </span>
                )}
                {van.selfContained && (
                  <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
                    ✓ Self-Contained
                  </span>
                )}
                {van.buyBack && (
                  <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5 shadow-lg">
                    <Shield size={14} /> Buy-Back
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.slice(0, 5).map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition ${
                        idx === currentImageIndex ? 'border-white' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                  {images.length > 5 && (
                    <div className="w-12 h-12 rounded-lg bg-black/60 flex items-center justify-center text-white text-sm font-bold">
                      +{images.length - 5}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* INFORMATIONS */}
            <div className="space-y-6">
              
              {/* Titre & Prix */}
              <div>
                <h1 className="text-3xl lg:text-4xl font-black text-gray-900 mb-3">
                  {van.title}
                </h1>
                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <MapPin size={20} className="text-emerald-600" />
                  <span className="font-medium">{van.location}, {van.region || 'New Zealand'}</span>
                </div>
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-2xl border-2 border-emerald-200">
                  <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold mb-1">Price</p>
                  <p className="text-4xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    {formatPrice(van.price)}
                  </p>
                </div>
              </div>

              {/* Stats rapides */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <Calendar className="text-emerald-600 mb-2" size={20} />
                  <p className="text-xs text-gray-500 font-semibold">YEAR</p>
                  <p className="text-xl font-bold text-gray-900">{van.year || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <Gauge className="text-emerald-600 mb-2" size={20} />
                  <p className="text-xs text-gray-500 font-semibold">MILEAGE</p>
                  <p className="text-xl font-bold text-gray-900">{(van.mileage || 0).toLocaleString()} km</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <Users className="text-emerald-600 mb-2" size={20} />
                  <p className="text-xs text-gray-500 font-semibold">CAPACITY</p>
                  <p className="text-xl font-bold text-gray-900">{van.capacity || 2} people</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <Clock className="text-emerald-600 mb-2" size={20} />
                  <p className="text-xs text-gray-500 font-semibold">POSTED</p>
                  <p className="text-xl font-bold text-gray-900">{getDaysAgo(van.createdAt)}d ago</p>
                </div>
              </div>

              {/* WOF & REGO */}
              <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-4 rounded-xl border border-gray-200">
                <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <Shield size={16} className="text-emerald-600" />
                  Vehicle Status
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className={`bg-white p-3 rounded-lg border text-center ${van.wofExpiry && new Date(van.wofExpiry) > new Date() ? 'border-emerald-200' : 'border-gray-200'}`}>
                    <div className="text-[10px] text-gray-500 font-semibold uppercase mb-1">WOF Valid</div>
                    <div className={`text-sm font-bold ${van.wofExpiry && new Date(van.wofExpiry) > new Date() ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {formatDate(van.wofExpiry)}
                    </div>
                  </div>
                  <div className={`bg-white p-3 rounded-lg border text-center ${van.regoExpiry && new Date(van.regoExpiry) > new Date() ? 'border-blue-200' : 'border-gray-200'}`}>
                    <div className="text-[10px] text-gray-500 font-semibold uppercase mb-1">REGO Until</div>
                    <div className={`text-sm font-bold ${van.regoExpiry && new Date(van.regoExpiry) > new Date() ? 'text-blue-600' : 'text-gray-400'}`}>
                      {formatDate(van.regoExpiry)}
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg border text-center ${van.selfContained ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="text-[10px] text-gray-500 font-semibold uppercase mb-1">Self-Contained</div>
                    <div className={`text-sm font-bold ${van.selfContained ? 'text-green-600' : 'text-gray-400'}`}>
                      {van.selfContained ? '✓ Yes' : '✗ No'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-1 h-6 bg-emerald-600 rounded-full"></div>
                  Description
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {van.description || 'No description available.'}
                </p>
              </div>

              {/* Equipment */}
              {van.equipment && Object.values(van.equipment).some(v => v === true) && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-1 h-6 bg-emerald-600 rounded-full"></div>
                    Equipment
                  </h2>
                  <div className="grid grid-cols-2 gap-2">
                    {van.equipment.doubleBed && <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-2 rounded-lg text-sm">🛏️ Double Bed</div>}
                    {van.equipment.fridge && <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-2 rounded-lg text-sm">🧊 Fridge</div>}
                    {van.equipment.gasStove && <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-2 rounded-lg text-sm">🔥 Gas Stove</div>}
                    {van.equipment.sink && <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-2 rounded-lg text-sm">🚰 Sink</div>}
                    {van.equipment.toilet && <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-2 rounded-lg text-sm">🚽 Toilet</div>}
                    {van.equipment.solarPanel && <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-2 rounded-lg text-sm">☀️ Solar Panel</div>}
                    {van.equipment.leisureBattery && <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-2 rounded-lg text-sm">🔋 Leisure Battery</div>}
                    {van.equipment.heater && <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-2 rounded-lg text-sm">🌡️ Heater</div>}
                    {van.equipment.dieselHeater && <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-2 rounded-lg text-sm">🔥 Diesel Heater</div>}
                    {van.equipment.outdoorShower && <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-2 rounded-lg text-sm">🚿 Outdoor Shower</div>}
                    {van.equipment.indoorShower && <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-2 rounded-lg text-sm">🛁 Indoor Shower</div>}
                    {van.equipment.awning && <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-2 rounded-lg text-sm">⛺ Awning</div>}
                    {van.equipment.reverseCamera && <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-2 rounded-lg text-sm">📷 Reverse Camera</div>}
                    {van.equipment.bluetooth && <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-2 rounded-lg text-sm">📻 Bluetooth</div>}
                  </div>
                </div>
              )}

              {/* Buy-Back Details */}
              {van.buyBack && (
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                  <h3 className="text-lg font-bold text-green-700 mb-3 flex items-center gap-2">
                    <Shield size={20} />
                    Buy-Back Guarantee
                  </h3>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-white p-3 rounded-lg border border-green-200">
                      <div className="text-xs text-gray-500 font-semibold">Buy-Back Price</div>
                      <div className="text-xl font-bold text-green-600">
                        {van.buyBackPrice ? formatPrice(van.buyBackPrice) : 'Contact seller'}
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-green-200">
                      <div className="text-xs text-gray-500 font-semibold">Valid For</div>
                      <div className="text-xl font-bold text-green-600">
                        {van.buyBackDuration ? `${van.buyBackDuration} months` : 'Contact seller'}
                      </div>
                    </div>
                  </div>
                  {van.buyBackConditions && (
                    <p className="text-sm text-gray-600">
                      <strong>Conditions:</strong> {van.buyBackConditions}
                    </p>
                  )}
                </div>
              )}

              {/* Seller Info */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full w-12 h-12 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                    {seller.name?.[0] || 'U'}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{seller.name || 'Unknown Seller'}</p>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={14} 
                          className={i < (seller.rating || 5) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} 
                        />
                      ))}
                      <span className="text-xs text-gray-600 ml-1">({seller.rating || 5}.0)</span>
                    </div>
                  </div>
                </div>

                {/* Quick Message Box */}
                <Suspense fallback={<div className="animate-pulse bg-gray-200 h-32 rounded-xl"></div>}>
                  <QuickMessageBox 
                    van={van} 
                    seller={seller}
                  />
                </Suspense>
              </div>

            </div>
          </div>
          {/* Browse More - Internal Links for SEO */}
          <section className="mt-12 bg-gray-50 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Browse More Campervans</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* By Brand */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Popular Brands</h3>
                <div className="flex flex-wrap gap-2">
                  <Link to="/brand/toyota-hiace" className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-emerald-50 hover:border-emerald-300 transition">
                    Toyota Hiace
                  </Link>
                  <Link to="/brand/nissan-caravan" className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-emerald-50 hover:border-emerald-300 transition">
                    Nissan Caravan
                  </Link>
                  <Link to="/brand/mitsubishi-delica" className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-emerald-50 hover:border-emerald-300 transition">
                    Mitsubishi Delica
                  </Link>
                  <Link to="/brand/mazda-bongo" className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-emerald-50 hover:border-emerald-300 transition">
                    Mazda Bongo
                  </Link>
                  <Link to="/brand/ford-transit" className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-emerald-50 hover:border-emerald-300 transition">
                    Ford Transit
                  </Link>
                </div>
              </div>
              {/* By Location */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Popular Locations</h3>
                <div className="flex flex-wrap gap-2">
                  <Link to="/location/auckland" className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-emerald-50 hover:border-emerald-300 transition">
                    Auckland
                  </Link>
                  <Link to="/location/wellington" className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-emerald-50 hover:border-emerald-300 transition">
                    Wellington
                  </Link>
                  <Link to="/location/christchurch" className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-emerald-50 hover:border-emerald-300 transition">
                    Christchurch
                  </Link>
                  <Link to="/location/queenstown" className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-emerald-50 hover:border-emerald-300 transition">
                    Queenstown
                  </Link>
                  <Link to="/location/rotorua" className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-emerald-50 hover:border-emerald-300 transition">
                    Rotorua
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer simple */}
        <footer className="bg-gray-900 text-white py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full overflow-hidden" style={{ backgroundColor: '#f7eedd' }}>
                <img src="/kiwi-van-logo-48.webp" alt="Kiwi Van Market" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-xl">Kiwi Van Market</span>
            </Link>
            <p className="text-gray-400 text-sm">
              The #1 marketplace for campervans in New Zealand 🇳🇿
            </p>
            <p className="text-gray-500 text-xs mt-4">
              © {new Date().getFullYear()} Kiwi Van Market. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
