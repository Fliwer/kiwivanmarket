import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
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

  // Ref pour éviter d'incrémenter les vues 2x (React StrictMode)
  const viewIncremented = useRef(false);

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

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
          
          // Incrémenter le compteur de vues (une seule fois)
          if (!viewIncremented.current) {
            viewIncremented.current = true;
            updateDoc(vanRef, { views: increment(1) }).catch(() => {});
          }
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

  const seller = van.seller || { name: 'Unknown' };
  const hasRating = seller.rating !== undefined && seller.rating !== null && seller.reviewCount > 0;

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

            {/* GALERIE PHOTOS - Design premium */}
            <div className="lg:sticky lg:top-20 space-y-3 relative z-10">
              {/* Main Image */}
              <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl overflow-hidden shadow-2xl group z-20">
                <div className="aspect-[4/3] flex items-center justify-center p-2">
                  <img
                    src={images[currentImageIndex]}
                    alt={`${van.title} - ${currentImageIndex + 1}`}
                    className="max-w-full max-h-full object-contain rounded-2xl"
                  />
                </div>

                {/* Navigation images */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur rounded-full p-3 shadow-xl hover:bg-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <ChevronLeft size={24} className="text-gray-800" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur rounded-full p-3 shadow-xl hover:bg-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <ChevronRight size={24} className="text-gray-800" />
                    </button>
                  </>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {van.featured && (
                    <span className="bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 text-gray-900 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg animate-pulse">
                      <Star size={16} fill="currentColor" /> FEATURED
                    </span>
                  )}
                  {van.selfContained && (
                    <span className={`text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg backdrop-blur ${
                      van.selfContainedType === 'blue'
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-400'
                        : 'bg-gradient-to-r from-green-500 to-emerald-400'
                    }`}>
                      ✓ Self-Contained {van.selfContainedType === 'blue' ? '🔵' : '🟢'}
                    </span>
                  )}
                  {van.buyBack && (
                    <span className="bg-gradient-to-r from-emerald-500 to-green-400 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
                      <Shield size={16} /> Buy-Back
                    </span>
                  )}
                </div>

                {/* Image counter */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold">
                    📷 {currentImageIndex + 1} / {images.length}
                  </div>
                )}
              </div>

              {/* Thumbnails - Outside main image */}
              {images.length > 1 && (
                <div className="relative z-0 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`flex-shrink-0 w-20 h-16 rounded-xl overflow-hidden transition-all duration-200 ${
                        idx === currentImageIndex
                          ? 'ring-3 ring-emerald-500 ring-offset-2'
                          : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* INFORMATIONS */}
            <div className="space-y-6">

              {/* Titre & Prix - Premium Design */}
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 p-6 text-white">
                  <h1 className="text-2xl lg:text-3xl font-black mb-2 leading-tight">
                    {van.title}
                  </h1>
                  <div className="flex items-center gap-2 text-white/90">
                    <MapPin size={18} />
                    <span className="font-medium">{van.location}, {van.region || 'New Zealand'}</span>
                  </div>
                </div>
                <div className="p-6 bg-gradient-to-br from-gray-50 to-white">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Asking Price</p>
                      <p className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        {formatPrice(van.price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Views</p>
                      <p className="text-2xl font-bold text-gray-600">{van.views || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats rapides - Premium Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-2xl border border-emerald-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                    <Calendar className="text-white" size={20} />
                  </div>
                  <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">Year</p>
                  <p className="text-2xl font-black text-gray-900">{van.year || 'N/A'}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-2xl border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                    <Gauge className="text-white" size={20} />
                  </div>
                  <p className="text-[10px] text-blue-700 font-bold uppercase tracking-wider">Mileage</p>
                  <p className="text-2xl font-black text-gray-900">{(van.mileage || 0).toLocaleString()}<span className="text-sm font-medium text-gray-500"> km</span></p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-2xl border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                    <Users className="text-white" size={20} />
                  </div>
                  <p className="text-[10px] text-purple-700 font-bold uppercase tracking-wider">Sleeps</p>
                  <p className="text-2xl font-black text-gray-900">{van.capacity || 2}<span className="text-sm font-medium text-gray-500"> people</span></p>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-2xl border border-amber-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                    <Clock className="text-white" size={20} />
                  </div>
                  <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">Posted</p>
                  <p className="text-2xl font-black text-gray-900">{getDaysAgo(van.createdAt)}<span className="text-sm font-medium text-gray-500"> days ago</span></p>
                </div>
              </div>

              {/* WOF & REGO - Premium Status Cards */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-5 py-3">
                  <h3 className="text-white font-bold flex items-center gap-2">
                    <Shield size={18} />
                    Vehicle Compliance
                  </h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className={`p-4 rounded-xl text-center transition-all ${
                      van.wofExpiry && new Date(van.wofExpiry) > new Date()
                        ? 'bg-gradient-to-br from-emerald-50 to-green-100 border-2 border-emerald-300'
                        : 'bg-gray-100 border-2 border-gray-200'
                    }`}>
                      <div className={`w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center ${
                        van.wofExpiry && new Date(van.wofExpiry) > new Date() ? 'bg-emerald-500' : 'bg-gray-400'
                      }`}>
                        <CheckCircle size={20} className="text-white" />
                      </div>
                      <div className="text-[10px] text-gray-600 font-bold uppercase tracking-wider mb-1">WOF Valid</div>
                      <div className={`text-sm font-bold ${van.wofExpiry && new Date(van.wofExpiry) > new Date() ? 'text-emerald-700' : 'text-gray-500'}`}>
                        {formatDate(van.wofExpiry)}
                      </div>
                    </div>
                    <div className={`p-4 rounded-xl text-center transition-all ${
                      van.regoExpiry && new Date(van.regoExpiry) > new Date()
                        ? 'bg-gradient-to-br from-blue-50 to-cyan-100 border-2 border-blue-300'
                        : 'bg-gray-100 border-2 border-gray-200'
                    }`}>
                      <div className={`w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center ${
                        van.regoExpiry && new Date(van.regoExpiry) > new Date() ? 'bg-blue-500' : 'bg-gray-400'
                      }`}>
                        <CheckCircle size={20} className="text-white" />
                      </div>
                      <div className="text-[10px] text-gray-600 font-bold uppercase tracking-wider mb-1">REGO Until</div>
                      <div className={`text-sm font-bold ${van.regoExpiry && new Date(van.regoExpiry) > new Date() ? 'text-blue-700' : 'text-gray-500'}`}>
                        {formatDate(van.regoExpiry)}
                      </div>
                    </div>
                    <div className={`p-4 rounded-xl text-center transition-all ${
                      van.selfContained
                        ? van.selfContainedType === 'blue'
                          ? 'bg-gradient-to-br from-blue-50 to-cyan-100 border-2 border-blue-300'
                          : 'bg-gradient-to-br from-green-50 to-teal-100 border-2 border-green-300'
                        : 'bg-gray-100 border-2 border-gray-200'
                    }`}>
                      <div className={`w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center ${
                        van.selfContained
                          ? van.selfContainedType === 'blue' ? 'bg-blue-500' : 'bg-green-500'
                          : 'bg-gray-400'
                      }`}>
                        {van.selfContained ? <CheckCircle size={20} className="text-white" /> : <X size={20} className="text-white" />}
                      </div>
                      <div className="text-[10px] text-gray-600 font-bold uppercase tracking-wider mb-1">Self-Contained</div>
                      <div className={`text-sm font-bold ${
                        van.selfContained
                          ? van.selfContainedType === 'blue' ? 'text-blue-700' : 'text-green-700'
                          : 'text-gray-500'
                      }`}>
                        {van.selfContained ? (van.selfContainedType === 'blue' ? 'Blue Sticker' : 'Green Sticker') : 'No'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description - Premium Card */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3">
                  <h2 className="text-white font-bold flex items-center gap-2">
                    <MessageCircle size={18} />
                    About This Van
                  </h2>
                </div>
                <div className="p-5">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line text-[15px]">
                    {van.description || 'No description available.'}
                  </p>
                </div>
              </div>

              {/* Equipment - Premium Grid */}
              {van.equipment && Object.values(van.equipment).some(v => v === true) && (
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3">
                    <h2 className="text-white font-bold flex items-center gap-2">
                      <CheckCircle size={18} />
                      Features & Equipment
                    </h2>
                  </div>
                  <div className="p-5">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {van.equipment.doubleBed && (
                        <div className="flex items-center gap-3 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 px-4 py-3 rounded-xl hover:shadow-md transition-shadow">
                          <span className="text-2xl">🛏️</span>
                          <span className="font-semibold text-gray-800 text-sm">Double Bed</span>
                        </div>
                      )}
                      {van.equipment.fridge && (
                        <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 px-4 py-3 rounded-xl hover:shadow-md transition-shadow">
                          <span className="text-2xl">🧊</span>
                          <span className="font-semibold text-gray-800 text-sm">Fridge</span>
                        </div>
                      )}
                      {van.equipment.gasStove && (
                        <div className="flex items-center gap-3 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 px-4 py-3 rounded-xl hover:shadow-md transition-shadow">
                          <span className="text-2xl">🔥</span>
                          <span className="font-semibold text-gray-800 text-sm">Gas Stove</span>
                        </div>
                      )}
                      {van.equipment.sink && (
                        <div className="flex items-center gap-3 bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 px-4 py-3 rounded-xl hover:shadow-md transition-shadow">
                          <span className="text-2xl">🚰</span>
                          <span className="font-semibold text-gray-800 text-sm">Sink</span>
                        </div>
                      )}
                      {van.equipment.toilet && (
                        <div className="flex items-center gap-3 bg-gradient-to-r from-slate-50 to-gray-100 border border-slate-200 px-4 py-3 rounded-xl hover:shadow-md transition-shadow">
                          <span className="text-2xl">🚽</span>
                          <span className="font-semibold text-gray-800 text-sm">Toilet</span>
                        </div>
                      )}
                      {van.equipment.solarPanel && (
                        <div className="flex items-center gap-3 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 px-4 py-3 rounded-xl hover:shadow-md transition-shadow">
                          <span className="text-2xl">☀️</span>
                          <span className="font-semibold text-gray-800 text-sm">Solar Panel</span>
                        </div>
                      )}
                      {van.equipment.leisureBattery && (
                        <div className="flex items-center gap-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 px-4 py-3 rounded-xl hover:shadow-md transition-shadow">
                          <span className="text-2xl">🔋</span>
                          <span className="font-semibold text-gray-800 text-sm">Leisure Battery</span>
                        </div>
                      )}
                      {van.equipment.heater && (
                        <div className="flex items-center gap-3 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 px-4 py-3 rounded-xl hover:shadow-md transition-shadow">
                          <span className="text-2xl">🌡️</span>
                          <span className="font-semibold text-gray-800 text-sm">Heater</span>
                        </div>
                      )}
                      {van.equipment.dieselHeater && (
                        <div className="flex items-center gap-3 bg-gradient-to-r from-rose-50 to-red-50 border border-rose-200 px-4 py-3 rounded-xl hover:shadow-md transition-shadow">
                          <span className="text-2xl">🔥</span>
                          <span className="font-semibold text-gray-800 text-sm">Diesel Heater</span>
                        </div>
                      )}
                      {van.equipment.outdoorShower && (
                        <div className="flex items-center gap-3 bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 px-4 py-3 rounded-xl hover:shadow-md transition-shadow">
                          <span className="text-2xl">🚿</span>
                          <span className="font-semibold text-gray-800 text-sm">Outdoor Shower</span>
                        </div>
                      )}
                      {van.equipment.indoorShower && (
                        <div className="flex items-center gap-3 bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 px-4 py-3 rounded-xl hover:shadow-md transition-shadow">
                          <span className="text-2xl">🛁</span>
                          <span className="font-semibold text-gray-800 text-sm">Indoor Shower</span>
                        </div>
                      )}
                      {van.equipment.awning && (
                        <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 px-4 py-3 rounded-xl hover:shadow-md transition-shadow">
                          <span className="text-2xl">⛺</span>
                          <span className="font-semibold text-gray-800 text-sm">Awning</span>
                        </div>
                      )}
                      {van.equipment.reverseCamera && (
                        <div className="flex items-center gap-3 bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 px-4 py-3 rounded-xl hover:shadow-md transition-shadow">
                          <span className="text-2xl">📷</span>
                          <span className="font-semibold text-gray-800 text-sm">Reverse Camera</span>
                        </div>
                      )}
                      {van.equipment.bluetooth && (
                        <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 px-4 py-3 rounded-xl hover:shadow-md transition-shadow">
                          <span className="text-2xl">📻</span>
                          <span className="font-semibold text-gray-800 text-sm">Bluetooth</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Buy-Back Details - Premium Card */}
              {van.buyBack && (
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-green-300">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-5 py-4">
                    <h3 className="text-white font-bold flex items-center gap-2 text-lg">
                      <Shield size={22} />
                      Buy-Back Guarantee
                    </h3>
                    <p className="text-green-100 text-sm mt-1">Peace of mind for your travel adventure</p>
                  </div>
                  <div className="p-5">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-4 rounded-xl border border-green-200">
                        <div className="text-xs text-green-700 font-bold uppercase tracking-wider mb-1">Buy-Back Price</div>
                        <div className="text-2xl font-black text-green-600">
                          {van.buyBackPrice ? formatPrice(van.buyBackPrice) : 'Contact seller'}
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-4 rounded-xl border border-green-200">
                        <div className="text-xs text-green-700 font-bold uppercase tracking-wider mb-1">Valid For</div>
                        <div className="text-2xl font-black text-green-600">
                          {van.buyBackDuration ? `${van.buyBackDuration} months` : 'Contact'}
                        </div>
                      </div>
                    </div>
                    {van.buyBackConditions && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">
                          <span className="font-bold text-gray-800">Conditions:</span> {van.buyBackConditions}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Seller Info - Premium Card */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-slate-700 to-slate-600 px-5 py-3">
                  <h3 className="text-white font-bold">Contact Seller</h3>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-4 mb-5 pb-5 border-b border-gray-100">
                    <div className="relative">
                      <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl w-16 h-16 flex items-center justify-center text-white text-2xl font-black shadow-xl">
                        {seller.name?.[0] || 'U'}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-lg text-gray-900">{seller.name || 'Unknown Seller'}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {hasRating ? (
                          <>
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={16}
                                className={i < seller.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                              />
                            ))}
                            <span className="text-sm text-gray-600 ml-2 font-semibold">({seller.rating.toFixed(1)})</span>
                          </>
                        ) : (
                          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">New seller</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Usually responds quickly</p>
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
          </div>
          {/* Browse More - Internal Links for SEO */}
          <section className="mt-12 bg-white rounded-3xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 px-6 py-4">
              <h2 className="text-xl font-bold text-white">Browse More Campervans</h2>
              <p className="text-white/80 text-sm">Discover your perfect adventure vehicle</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* By Brand */}
                <div>
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    Popular Brands
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <Link to="/brand/toyota-hiace" className="px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl text-sm text-gray-700 font-medium hover:from-emerald-50 hover:to-teal-50 hover:border-emerald-300 hover:text-emerald-700 transition-all shadow-sm hover:shadow">
                      Toyota Hiace
                    </Link>
                    <Link to="/brand/nissan-caravan" className="px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl text-sm text-gray-700 font-medium hover:from-emerald-50 hover:to-teal-50 hover:border-emerald-300 hover:text-emerald-700 transition-all shadow-sm hover:shadow">
                      Nissan Caravan
                    </Link>
                    <Link to="/brand/mitsubishi-delica" className="px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl text-sm text-gray-700 font-medium hover:from-emerald-50 hover:to-teal-50 hover:border-emerald-300 hover:text-emerald-700 transition-all shadow-sm hover:shadow">
                      Mitsubishi Delica
                    </Link>
                    <Link to="/brand/mazda-bongo" className="px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl text-sm text-gray-700 font-medium hover:from-emerald-50 hover:to-teal-50 hover:border-emerald-300 hover:text-emerald-700 transition-all shadow-sm hover:shadow">
                      Mazda Bongo
                    </Link>
                    <Link to="/brand/ford-transit" className="px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl text-sm text-gray-700 font-medium hover:from-emerald-50 hover:to-teal-50 hover:border-emerald-300 hover:text-emerald-700 transition-all shadow-sm hover:shadow">
                      Ford Transit
                    </Link>
                  </div>
                </div>
                {/* By Location */}
                <div>
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Popular Locations
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <Link to="/location/auckland" className="px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl text-sm text-gray-700 font-medium hover:from-blue-50 hover:to-cyan-50 hover:border-blue-300 hover:text-blue-700 transition-all shadow-sm hover:shadow">
                      Auckland
                    </Link>
                    <Link to="/location/wellington" className="px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl text-sm text-gray-700 font-medium hover:from-blue-50 hover:to-cyan-50 hover:border-blue-300 hover:text-blue-700 transition-all shadow-sm hover:shadow">
                      Wellington
                    </Link>
                    <Link to="/location/christchurch" className="px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl text-sm text-gray-700 font-medium hover:from-blue-50 hover:to-cyan-50 hover:border-blue-300 hover:text-blue-700 transition-all shadow-sm hover:shadow">
                      Christchurch
                    </Link>
                    <Link to="/location/queenstown" className="px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl text-sm text-gray-700 font-medium hover:from-blue-50 hover:to-cyan-50 hover:border-blue-300 hover:text-blue-700 transition-all shadow-sm hover:shadow">
                      Queenstown
                    </Link>
                    <Link to="/location/rotorua" className="px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl text-sm text-gray-700 font-medium hover:from-blue-50 hover:to-cyan-50 hover:border-blue-300 hover:text-blue-700 transition-all shadow-sm hover:shadow">
                      Rotorua
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer - Premium */}
        <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-white py-12 mt-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col items-center">
              <Link to="/" className="inline-flex items-center gap-3 mb-4 group">
                <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-xl group-hover:scale-105 transition-transform" style={{ backgroundColor: '#f7eedd' }}>
                  <img src="/kiwi-van-logo-48.webp" alt="Kiwi Van Market" className="w-full h-full object-contain" />
                </div>
                <div>
                  <span className="font-black text-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Kiwi Van Market</span>
                  <p className="text-gray-400 text-xs font-medium">Your Adventure Starts Here</p>
                </div>
              </Link>
              <p className="text-gray-400 text-sm text-center max-w-md mb-6">
                New Zealand's premier marketplace for campervans and motorhomes. Find your perfect home on wheels.
              </p>
              <div className="flex items-center gap-4 mb-6">
                <Link to="/" className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition">
                  Browse Vans
                </Link>
                <Link to="/sell" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-sm font-medium transition">
                  Sell Your Van
                </Link>
              </div>
              <div className="border-t border-gray-800 pt-6 w-full text-center">
                <p className="text-gray-500 text-xs">
                  © {new Date().getFullYear()} Kiwi Van Market. All rights reserved. Made with love in New Zealand
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
