import React, { useState, useEffect, useRef, useCallback, Suspense, lazy } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { doc, getDoc, updateDoc, increment, deleteDoc } from 'firebase/firestore';
import { db, functions } from '../firebase';
import { httpsCallable } from 'firebase/functions';
import { useAuth } from '../AuthContext';
import { useFavorites } from '../hooks/useFavorites';
import { useHideLoader } from '../hooks/useHideLoader';
import { safeDate } from '../utils/dateHelper';
import { getLargeImage, getThumbnail } from '../utils/imageOptimizer';
import { formatMileage, formatWhatsAppNumber } from '../utils/formatHelper';
import {
  ArrowLeft, Heart, Share2, MapPin, Calendar, Gauge, Users,
  Shield, Star, Clock, CheckCircle, X, MessageCircle, ChevronLeft, ChevronRight, HelpCircle, Copy, Facebook, ExternalLink, BookOpen, User, LogOut,
  Trash2, Edit2, LayoutDashboard, Pause, Play, AlertTriangle, Phone, Lock, Fuel, Cog
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToast } from './ToastProvider';
import SeoHead from './SeoHead';
import EquipmentBadges from './EquipmentBadges';

// Lazy load du QuickMessageBox (avec auto-récupération si chunk périmé)
import lazyWithReload from '../utils/lazyWithReload';
const QuickMessageBox = lazyWithReload(() => import('./QuickMessageBox'));
const AuthModal = lazyWithReload(() => import('./AuthModal'));

// ✅ Composant SEO avec Schema.org pour les vans
const VanSEO = ({ van }) => {
  const { t } = useTranslation();
  if (!van) return null;

  const url = `https://kiwivanmarket.com/van/${van.id}`;
  const image = van.images?.[0] || van.imageUrl || 'https://kiwivanmarket.com/og-image.jpg';
  const title = `${van.title} - ${van.price ? `NZ$${van.price.toLocaleString()}` : ''}`;
  const description = `${van.year} ${van.title} in ${van.location}. ${formatMileage(van.mileage)} km. ${t('hero.subtitle')}`;

  // Description SEO enrichie avec équipements
  const features = [];
  if (van.selfContained) features.push('self-contained');
  if (van.buyBack) features.push('buy-back guarantee');
  if (van.equipment?.doubleBed) features.push('double bed');
  if (van.equipment?.solarPanel) features.push('solar panel');
  if (van.equipment?.fridge) features.push('fridge');

  const featuresText = features.length > 0 ? ` Features: ${features.join(', ')}.` : '';
  const metaDescription = `${van.year} ${van.title} for sale in ${van.location}, New Zealand. ${formatMileage(van.mileage)} km, ${van.capacity || 2} berth.${featuresText} Perfect campervan for backpackers and travellers.`.slice(0, 160);

  // Schema.org JSON-LD pour Google Rich Snippets — type Car (more precise than Vehicle)
  const additionalProperties = [];
  if (van.buyBack) additionalProperties.push({ "@type": "PropertyValue", "name": "Buy-Back Guarantee", "value": `Yes${van.buyBackPrice ? ` — NZ$${van.buyBackPrice.toLocaleString()}` : ''}` });
  if (van.selfContained) additionalProperties.push({ "@type": "PropertyValue", "name": "Self-Contained (NZS 5465)", "value": van.selfContainedType === 'blue' ? 'Blue (porta-potty)' : 'Green (fixed toilet)' });
  if (van.wofExpiry && safeDate(van.wofExpiry) > new Date()) additionalProperties.push({ "@type": "PropertyValue", "name": "WOF Valid Until", "value": safeDate(van.wofExpiry).toLocaleDateString('en-NZ') });
  if (van.regoExpiry && safeDate(van.regoExpiry) > new Date()) additionalProperties.push({ "@type": "PropertyValue", "name": "REGO Valid Until", "value": safeDate(van.regoExpiry).toLocaleDateString('en-NZ') });
  if (van.equipment?.doubleBed) additionalProperties.push({ "@type": "PropertyValue", "name": "Double Bed", "value": "Yes" });
  if (van.equipment?.solarPanel) additionalProperties.push({ "@type": "PropertyValue", "name": "Solar Panel", "value": "Yes" });
  if (van.equipment?.fridge) additionalProperties.push({ "@type": "PropertyValue", "name": "Fridge", "value": "Yes" });
  if (van.equipment?.shower || van.equipment?.outdoorShower) additionalProperties.push({ "@type": "PropertyValue", "name": "Shower", "value": "Yes" });

  // Try to parse brand from title (first word)
  const titleParts = (van.title || '').split(' ');
  const brandName = titleParts[0] || 'Campervan';
  const modelName = titleParts.slice(1).join(' ') || van.title;

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Car",
    "name": van.title,
    "description": van.description,
    "image": van.images || [image],
    "url": url,
    "offers": {
      "@type": "Offer",
      "price": van.price,
      "priceCurrency": "NZD",
      "availability": van.status === 'sold' ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
      "itemCondition": "https://schema.org/UsedCondition",
      "seller": {
        "@type": "Person",
        "name": van.seller?.name || "Private Seller"
      },
      "areaServed": {
        "@type": "Country",
        "name": "New Zealand"
      }
    },
    "vehicleModelDate": van.year?.toString(),
    "mileageFromOdometer": {
      "@type": "QuantitativeValue",
      "value": van.mileage,
      "unitCode": "KMT"
    },
    "vehicleConfiguration": van.type || "Van",
    "bodyType": van.type || "Campervan",
    "vehicleSeatingCapacity": van.capacity || 2,
    "itemCondition": "https://schema.org/UsedCondition",
    "brand": {
      "@type": "Brand",
      "name": brandName
    },
    "model": modelName,
    "vehicleIdentificationNumber": van.id,
    "additionalProperty": additionalProperties.length > 0 ? additionalProperties : undefined
  };

  // BreadcrumbList — 3 niveaux avec localisation
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://kiwivanmarket.com" },
      { "@type": "ListItem", "position": 2, "name": van.location ? `${van.location} Campervans` : "Campervans", "item": van.location ? `https://kiwivanmarket.com/location/${encodeURIComponent(van.location)}` : "https://kiwivanmarket.com" },
      { "@type": "ListItem", "position": 3, "name": van.title, "item": url }
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
        "text": "Always verify the WOF (Warrant of Fitness) and REGO (registration) expiry dates. This van's WOF is valid until " + (van.wofExpiry ? safeDate(van.wofExpiry).toLocaleDateString('en-NZ') : 'not specified') + ". Meet the seller in person, inspect the vehicle thoroughly, and consider getting a mechanical inspection for peace of mind."
      }
    }
  ];

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
    <>
      <SeoHead
        title={title}
        description={metaDescription}
        image={image}
        type="product"
      />
      <Helmet>
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
    </>
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
  const { currentUser, logout } = useAuth();
  const { toggleFavorite, isFavorite, count: favoritesCount } = useFavorites();
  const toast = useToast();
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { t, i18n } = useTranslation();

  const [van, setVan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

  // Management functions for owner
  const handleToggleSold = async () => {
    if (!van) return;
    setIsUpdating(true);
    const newStatus = van.status === 'sold' ? 'active' : 'sold';
    try {
      await updateDoc(doc(db, 'vans', van.id), { status: newStatus });
      setVan(prev => ({ ...prev, status: newStatus }));
      // Invalidate cache
      localStorage.removeItem('kiwiVanMarket_vans');
      localStorage.removeItem('kiwiVanMarket_timestamp');
    } catch (err) {
      console.error('Error toggling sold status:', err);
      toast.error('Error updating status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTogglePause = async () => {
    if (!van) return;
    setIsUpdating(true);
    const newStatus = van.status === 'paused' ? 'active' : 'paused';
    try {
      await updateDoc(doc(db, 'vans', van.id), { status: newStatus });
      setVan(prev => ({ ...prev, status: newStatus }));
      // Invalidate cache
      localStorage.removeItem('kiwiVanMarket_vans');
      localStorage.removeItem('kiwiVanMarket_timestamp');
    } catch (err) {
      console.error('Error toggling pause status:', err);
      toast.error('Error updating status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!van) return;
    setIsUpdating(true);
    try {
      await deleteDoc(doc(db, 'vans', van.id));
      // Invalidate cache
      localStorage.removeItem('kiwiVanMarket_vans');
      localStorage.removeItem('kiwiVanMarket_timestamp');
      navigate('/my-listings');
    } catch (err) {
      console.error('Error deleting van:', err);
      toast.error('Error during deletion');
      setIsUpdating(false);
      setShowDeleteConfirm(false);
    }
  };

  // Ref pour éviter d'incrémenter les vues 2x (React StrictMode)
  const viewIncremented = useRef(false);

  useHideLoader();

  // Charger le van depuis Firebase
  useEffect(() => {
    const fetchVan = async () => {
      try {
        setLoading(true);
        const vanRef = doc(db, 'vans', id);
        const vanSnap = await getDoc(vanRef);

        if (vanSnap.exists()) {
          const rawVanData = vanSnap.data();
          let vanData = { id: vanSnap.id, ...rawVanData };

          // ✅ Fetch latest seller info from 'users' collection for up-to-date WhatsApp/Bio
          const sellerId = rawVanData.seller?.uid || rawVanData.userId;
          if (sellerId) {
            try {
              const userSnap = await getDoc(doc(db, 'users', sellerId));
              if (userSnap.exists()) {
                const userData = userSnap.data();
                // Combine: van.seller info preferred for van-specific overrides, 
                // but user doc data used as fallback for latest contact info
                vanData.seller = {
                  ...userData, // Start with latest user data (photo, bio, phone)
                  ...rawVanData.seller, // Override with van-specific data if any
                };

                // Ensure phone from profile is used if van-specific phone is missing
                if (!vanData.seller.phone && userData.phone) {
                  vanData.seller.phone = userData.phone;
                }
                if (!vanData.seller.whatsapp && (userData.whatsapp || userData.phone)) {
                  vanData.seller.whatsapp = userData.whatsapp || userData.phone;
                }
              }
            } catch (userErr) {
              console.warn('Could not fetch latest seller profile:', userErr);
            }
          }

          setVan(vanData);

          // Incrémenter le compteur de vues + GA van_view (1× par session/van — M1 anti-doublon StrictMode)
          const viewedKey = `viewed_${vanSnap.id}`;
          if (!viewIncremented.current && !sessionStorage.getItem(viewedKey)) {
            viewIncremented.current = true;
            sessionStorage.setItem(viewedKey, '1');
            updateDoc(vanRef, { views: increment(1) }).catch(() => { });

            // 📊 GA event: vue d'une annonce
            if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
              window.gtag('event', 'van_view', {
                van_id: vanSnap.id,
                van_title: rawVanData.title,
                van_price: rawVanData.price,
                van_location: rawVanData.location,
              });
            }
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

  const nextImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);
  const prevImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Partage
  const shareUrl = `https://kiwivanmarket.com/van/${id}`;
  const shareText = van ? t('header.subtitle') + ': ' + van.title : '';

  const handleMainShareClick = async () => {
    // Si sur mobile => Share natif (le plus puissant pour la viralité sur WhatsApp/Insta/SMS)
    if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
      try {
        await navigator.share({
          title: shareText,
          text: van ? `Check out this ${van.year} ${van.title} in ${van.location}!` : 'Check out this van!',
          url: shareUrl,
        });
      } catch (err) {
        if (err.name !== 'AbortError') console.error('Share failed:', err);
      }
    } else {
      // Sinon on affiche le menu dropdown Custom
      setShowShareMenu(!showShareMenu);
    }
  };

  const handleShare = async (platform) => {
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
      copy: null
    };

    if (platform === 'copy') {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard!');
    } else if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400');
    }
    setShowShareMenu(false);
  };

  // Générateur de texte pour Facebook
  const generateFbAdText = () => {
    const features = [];
    if (van.selfContained) features.push(`✅ Self-Contained (${van.selfContainedType === 'blue' ? 'Blue' : 'Green'})`);
    if (van.buyBack) features.push(`🛡️ Buy-Back Guarantee available`);
    if (van.equipment?.doubleBed) features.push('🛏️ Double Bed');
    if (van.equipment?.solarPanel) features.push('☀️ Solar Panel');
    if (van.equipment?.fridge) features.push('🧊 Fridge');
    if (van.equipment?.heater || van.equipment?.dieselHeater) features.push('🌡️ Heater');

    const text = `🚐 FOR SALE: ${van.title}
💰 Price: ${formatPrice(van.price)}
📍 Location: ${van.location}

✨ Key Details:
• Year: ${van.year}
• Mileage: ${formatMileage(van.mileage)} km
• WOF: ${formatDate(van.wofExpiry)}
• REGO: ${formatDate(van.regoExpiry)}
${features.length > 0 ? '\n🌟 Features:\n' + features.map(f => `• ${f}`).join('\n') : ''}

📝 Description:
${van.description?.slice(0, 200)}...

🔗 View more photos and contact me here:
${shareUrl}

#nzcampervan #vanlifeNZ #backpackernz #campervanforsale`;

    navigator.clipboard.writeText(text);
    toast.success(i18n.language.startsWith('fr') ? 'Texte copié ! Collez-le sur Facebook.' : 'Text copied! Paste it on Facebook.');
  };

  // Format prix
  const formatPrice = (price) => `NZ$${(price || 0).toLocaleString()}`;

  // Lightbox keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showLightbox) return;

      if (e.key === 'Escape') setShowLightbox(false);
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLightbox, nextImage, prevImage]);

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return t('van_page.not_specified');
    const d = safeDate(dateStr);
    const locale = i18n.language.startsWith('fr') ? 'fr-FR' : (i18n.language.startsWith('es') ? 'es-ES' : 'en-NZ');
    return d ? d.toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' }) : 'Invalid Date';
  };

  // Calcul jours depuis création
  const getDaysAgo = (createdAt) => {
    const created = safeDate(createdAt);
    if (!created) return 0;
    return Math.floor((new Date() - created) / (1000 * 60 * 60 * 24));
  };

  // Signaler une annonce (vendu / vendeur ne répond plus) -> email à l'équipe
  const handleReportListing = async (reason) => {
    if (reporting || reportSent) return;
    setReporting(true);
    try {
      const reportListing = httpsCallable(functions, 'reportListing');
      await reportListing({ vanId: id, vanTitle: van?.title || '', reason });
      setReportSent(true);
      toast.success(i18n.language.startsWith('fr') ? 'Merci ! On vérifie cette annonce.' : "Thanks! We'll check this listing.");
    } catch (e) {
      console.error('reportListing error:', e);
      toast.error(i18n.language.startsWith('fr') ? 'Échec du signalement. Réessaie.' : 'Could not send the report. Please try again.');
    } finally {
      setReporting(false);
    }
  };

  const inferBrandSlug = (title = '') => {
    const t = title.toLowerCase();
    if (t.includes('toyota') || t.includes('hiace')) return 'toyota-hiace';
    if (t.includes('nissan') || t.includes('caravan')) return 'nissan-caravan';
    if (t.includes('mazda') || t.includes('bongo')) return 'mazda-bongo';
    if (t.includes('mitsubishi') || t.includes('delica')) return 'mitsubishi-delica';
    if (t.includes('ford') || t.includes('transit')) return 'ford-transit';
    if (t.includes('mercedes') || t.includes('sprinter')) return 'mercedes-sprinter';
    return null;
  };

  if (loading) return <VanPageSkeleton />;

  if (error || !van) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <SeoHead title={t('van_page.not_found')} noindex={true} />
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🚐</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{t('van_page.not_found')}</h1>
          <p className="text-gray-600 mb-6">{t('van_page.not_found_desc')}</p>
          <Link
            to="/"
            className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition inline-flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            {t('van_page.browse_all')}
          </Link>
        </div>
      </div>
    );
  }

  const seller = van.seller || { name: 'Unknown' };
  const hasRating = seller.rating !== undefined && seller.rating !== null && seller.reviewCount > 0;
  const isOwner = currentUser && (currentUser.uid === seller.uid || currentUser.uid === van.userId);
  const locationSlug = (van.location || '').toLowerCase().trim().replace(/\s+/g, '-');
  const inferredBrandSlug = inferBrandSlug(van.title);
  const longTailSlug = locationSlug === 'auckland'
    ? 'buy-campervan-in-auckland-under-15000'
    : (locationSlug === 'christchurch' ? 'self-contained-van-christchurch' : null);

  return (
    <>
      {/* SEO Meta Tags */}
      <VanSEO van={van} />

      <div className="min-h-screen bg-white">

        {/* Barre d'actions : retour + fil d'ariane + favori/partage.
            (Le header GLOBAL du site s'affiche au-dessus — l'ancien header
            interne de cette page faisait doublon et a été supprimé.) */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-3 pb-1 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate('/')}
              className="p-2.5 bg-white border border-slate-200 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 rounded-xl transition-all flex-shrink-0 shadow-sm"
              title={t('van_page.back')}
            >
              <ArrowLeft size={18} />
            </button>
            <nav aria-label="Breadcrumb" className="min-w-0">
              <ol className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 flex-wrap">
                <li className="hidden sm:block"><Link to="/" className="hover:text-emerald-600 transition-colors">Marketplace</Link></li>
                <li className="hidden sm:block"><ChevronRight size={12} className="text-slate-300" /></li>
                {van.location && (
                  <>
                    <li><Link to={`/location/${encodeURIComponent(van.location)}`} className="hover:text-emerald-600 transition-colors">{van.location}</Link></li>
                    <li><ChevronRight size={12} className="text-slate-300" /></li>
                  </>
                )}
                <li className="text-slate-900 truncate max-w-[140px] sm:max-w-[240px]">{van.title}</li>
              </ol>
            </nav>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => toggleFavorite(van.id)}
              className="p-2.5 bg-white border border-slate-200 hover:bg-red-50 text-slate-500 hover:text-red-500 rounded-xl transition-all shadow-sm"
              title="Favorites"
            >
              <Heart size={18} className={isFavorite(van.id) ? 'fill-red-500 text-red-500' : ''} />
            </button>
            <div className="relative">
              <button
                onClick={handleMainShareClick}
                className="p-2.5 bg-white border border-slate-200 hover:bg-blue-50 text-slate-500 hover:text-blue-500 rounded-xl transition-all shadow-sm"
                title="Share this van"
              >
                <Share2 size={18} />
              </button>
              {showShareMenu && (
                <>
                  <div className="fixed inset-0 z-[100]" onClick={() => setShowShareMenu(false)} />
                  <div className="absolute right-0 top-full mt-3 w-56 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-100 py-2 z-[101] overflow-hidden animate-fade-in-up">
                    <button onClick={() => handleShare('whatsapp')} className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-bold transition-all border-b border-slate-50">
                      <MessageCircle size={18} className="text-green-500" /> Share on WhatsApp
                    </button>
                    <button onClick={() => handleShare('facebook')} className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-bold transition-all border-b border-slate-50">
                      <Facebook size={18} className="text-blue-600" /> Share on Facebook
                    </button>
                    <button onClick={() => handleShare('copy')} className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-bold transition-all">
                      <Copy size={18} className="text-slate-400" /> Copy Link
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-28 lg:pb-16">

          {/* Titre & sous-ligne */}
          <header className="pt-1 pb-4">
            <h1 className="text-2xl sm:text-3xl lg:text-[2rem] font-semibold text-slate-900 tracking-tight leading-tight">
              {van.title}
            </h1>
            <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1.5 font-medium text-slate-800">
                <MapPin size={15} className="text-emerald-600" />
                {van.location}{van.region ? `, ${van.region}` : ', New Zealand'}
              </span>
              {hasRating && (
                <span className="inline-flex items-center gap-1 font-medium text-slate-800">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  {seller.rating.toFixed(1)}
                </span>
              )}
            </div>
          </header>

          {/* GALERIE — style Airbnb : mosaïque en desktop, carrousel en mobile */}
          <div className="relative">
            {/* Mobile : image unique swipeable */}
            <div className="sm:hidden relative rounded-2xl overflow-hidden bg-slate-100 aspect-[4/3] group">
              <img
                src={getLargeImage(images[currentImageIndex])}
                alt={`${van.title} - ${currentImageIndex + 1}`}
                className="w-full h-full object-cover cursor-zoom-in"
                onClick={() => setShowLightbox(true)}
              />
              {images.length > 1 && (
                <>
                  <button onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 shadow-lg active:scale-90 transition">
                    <ChevronLeft size={20} className="text-slate-800" />
                  </button>
                  <button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 shadow-lg active:scale-90 transition">
                    <ChevronRight size={20} className="text-slate-800" />
                  </button>
                  <div className="absolute bottom-3 right-3 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>

            {/* Desktop : mosaïque cliquable (ouvre la lightbox) */}
            <div className="hidden sm:block relative">
              {images.length >= 5 ? (
                <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[400px] lg:h-[460px] rounded-2xl overflow-hidden">
                  <button onClick={() => { setCurrentImageIndex(0); setShowLightbox(true); }} className="col-span-2 row-span-2 relative overflow-hidden group">
                    <img src={getLargeImage(images[0])} alt={van.title} className="w-full h-full object-cover group-hover:brightness-95 transition" />
                  </button>
                  {[1, 2, 3, 4].map((i) => (
                    <button key={i} onClick={() => { setCurrentImageIndex(i); setShowLightbox(true); }} className="relative overflow-hidden group">
                      <img src={getThumbnail(images[i])} alt="" className="w-full h-full object-cover group-hover:brightness-95 transition" />
                    </button>
                  ))}
                </div>
              ) : images.length >= 2 ? (
                <div className="grid grid-cols-2 gap-2 h-[380px] lg:h-[440px] rounded-2xl overflow-hidden">
                  <button onClick={() => { setCurrentImageIndex(0); setShowLightbox(true); }} className="relative overflow-hidden group">
                    <img src={getLargeImage(images[0])} alt={van.title} className="w-full h-full object-cover group-hover:brightness-95 transition" />
                  </button>
                  <div className="grid gap-2" style={{ gridTemplateRows: `repeat(${images.length - 1}, minmax(0, 1fr))` }}>
                    {images.slice(1).map((img, idx) => (
                      <button key={idx} onClick={() => { setCurrentImageIndex(idx + 1); setShowLightbox(true); }} className="relative overflow-hidden group">
                        <img src={getThumbnail(img)} alt="" className="w-full h-full object-cover group-hover:brightness-95 transition" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowLightbox(true)} className="block w-full h-[380px] lg:h-[440px] rounded-2xl overflow-hidden">
                  <img src={getLargeImage(images[0])} alt={van.title} className="w-full h-full object-cover" />
                </button>
              )}

              {images.length > 1 && (
                <button
                  onClick={() => setShowLightbox(true)}
                  className="absolute bottom-4 right-4 inline-flex items-center gap-2 bg-white text-slate-900 px-4 py-2 rounded-xl text-sm font-semibold shadow-lg border border-slate-200 hover:bg-slate-50 transition"
                >
                  <LayoutDashboard size={15} />
                  {i18n.language.startsWith('fr') ? `Voir les ${images.length} photos` : `Show all ${images.length} photos`}
                </button>
              )}
            </div>

            {/* Badges (superposés) */}
            <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
              {van.featured && (
                <span className="bg-white text-amber-600 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md">
                  <Star size={13} fill="currentColor" /> {t('van_page.featured')}
                </span>
              )}
              {van.selfContained && (
                <span className="bg-white/95 backdrop-blur px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md text-slate-800">
                  {van.selfContainedType === 'blue' ? '🔵' : '🟢'} {t('filters.self_contained')}
                </span>
              )}
              {van.buyBack && (
                <span className="bg-white/95 backdrop-blur px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md text-emerald-700">
                  <Shield size={13} /> {t('filters.buyback')}
                </span>
              )}
            </div>
          </div>

          {/* Corps : contenu (gauche) + carte contact sticky (droite) */}
          <div className="mt-8 lg:mt-10 grid lg:grid-cols-3 gap-8 lg:gap-12 items-start">

            {/* Colonne principale */}
            <div className="lg:col-span-2 space-y-8">

              {/* ✅ OWNER DASHBOARD */}
              {currentUser?.uid === van.seller?.uid && (
                <div className="bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-800 p-8 text-white relative overflow-hidden group">
                  {/* Decorative background icon */}
                  <LayoutDashboard size={120} className="absolute -right-8 -bottom-8 text-white/5 group-hover:scale-110 transition-transform duration-700" />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                          <LayoutDashboard size={20} />
                        </div>
                        <h3 className="text-lg font-black uppercase tracking-widest">{t('owner.dashboard') || 'Owner Dashboard'}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        {van.status === 'paused' && (
                          <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-full text-amber-400 text-[10px] font-black uppercase tracking-widest animate-pulse">Paused</span>
                        )}
                        {van.status === 'sold' && (
                          <span className="px-3 py-1 bg-red-500/20 border border-red-500/40 rounded-full text-red-400 text-[10px] font-black uppercase tracking-widest">Sold</span>
                        )}
                        {(!van.status || van.status === 'active') && (
                          <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-emerald-400 text-[10px] font-black uppercase tracking-widest">Live</span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-3">
                        <Link
                          to={`/sell?edit=${van.id}`}
                          className="flex items-center justify-center gap-3 w-full bg-white/10 hover:bg-white text-white hover:text-slate-900 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                        >
                          <Edit2 size={16} />
                          {t('my_listings.edit')}
                        </Link>

                        <button
                          onClick={handleToggleSold}
                          disabled={isUpdating}
                          className={`flex items-center justify-center gap-3 w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${van.status === 'sold'
                            ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                            }`}
                        >
                          <CheckCircle size={16} />
                          {van.status === 'sold' ? t('my_listings.reactivate') : t('my_listings.mark_as_sold')}
                        </button>
                      </div>

                      <div className="space-y-3">
                        <button
                          onClick={handleTogglePause}
                          disabled={isUpdating}
                          className="flex items-center justify-center gap-3 w-full bg-white/10 hover:bg-amber-500 hover:text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                        >
                          {van.status === 'paused' ? <Play size={16} /> : <Pause size={16} />}
                          {van.status === 'paused' ? t('my_listings.resume') || 'Resume' : t('my_listings.pause') || 'Pause'}
                        </button>

                        <button
                          onClick={() => setShowDeleteConfirm(true)}
                          disabled={isUpdating}
                          className="flex items-center justify-center gap-3 w-full bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                        >
                          <Trash2 size={16} />
                          {t('my_listings.delete')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Faits clés — ligne épurée style Airbnb */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-2">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 shrink-0 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center">
                    <Calendar size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400 font-medium">{t('van_page.year')}</p>
                    <p className="text-base font-semibold text-slate-900 leading-tight truncate">{van.year || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 shrink-0 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center">
                    <Gauge size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400 font-medium">{t('van_page.mileage')}</p>
                    <p className="text-base font-semibold text-slate-900 leading-tight truncate">{formatMileage(van.mileage)} km</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 shrink-0 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center">
                    <Users size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400 font-medium">{t('van_page.sleeps')}</p>
                    <p className="text-base font-semibold text-slate-900 leading-tight truncate">{van.capacity || 2} pax</p>
                  </div>
                </div>
                {van.fuelType && (
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 shrink-0 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center">
                      <Fuel size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-400 font-medium">{i18n.language.startsWith('fr') ? 'Carburant' : 'Fuel'}</p>
                      <p className="text-base font-semibold text-slate-900 leading-tight truncate capitalize">
                        {van.fuelType === 'petrol' ? (i18n.language.startsWith('fr') ? 'Essence' : 'Petrol') : (van.fuelType === 'diesel' ? 'Diesel' : van.fuelType)}
                      </p>
                    </div>
                  </div>
                )}
                {van.transmission && (
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 shrink-0 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center">
                      <Cog size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-400 font-medium">{i18n.language.startsWith('fr') ? 'Boîte' : 'Transmission'}</p>
                      <p className="text-base font-semibold text-slate-900 leading-tight truncate capitalize">
                        {van.transmission === 'automatic' ? (i18n.language.startsWith('fr') ? 'Automatique' : 'Automatic') : (van.transmission === 'manual' ? (i18n.language.startsWith('fr') ? 'Manuelle' : 'Manual') : van.transmission)}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 shrink-0 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center">
                    <Clock size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400 font-medium">Views</p>
                    <p className="text-base font-semibold text-slate-900 leading-tight truncate">{van.views || 0}</p>
                  </div>
                </div>
              </div>

              {/* Vehicle Compliance */}
              <div className="border-t border-slate-200 pt-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                    <Shield size={20} className="text-emerald-600" />
                    {i18n.language.startsWith('fr') ? 'Conformité & historique' : 'Compliance & history'}
                  </h2>
                </div>
                <div className="rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                    {/* WOF */}
                    <div className="flex flex-1 items-center justify-between gap-3 px-4 py-3">
                      <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-slate-400">
                        <CheckCircle size={14} className={van.wofExpiry && safeDate(van.wofExpiry) > new Date() ? 'text-emerald-500' : 'text-slate-300'} />
                        WOF
                      </span>
                      <span className={`text-sm font-bold ${van.wofExpiry && safeDate(van.wofExpiry) > new Date() ? 'text-slate-900' : 'text-slate-400'}`}>
                        {formatDate(van.wofExpiry)}
                      </span>
                    </div>
                    {/* REGO */}
                    <div className="flex flex-1 items-center justify-between gap-3 px-4 py-3">
                      <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-slate-400">
                        <CheckCircle size={14} className={van.regoExpiry && safeDate(van.regoExpiry) > new Date() ? 'text-blue-500' : 'text-slate-300'} />
                        REGO
                      </span>
                      <span className={`text-sm font-bold ${van.regoExpiry && safeDate(van.regoExpiry) > new Date() ? 'text-slate-900' : 'text-slate-400'}`}>
                        {formatDate(van.regoExpiry)}
                      </span>
                    </div>
                    {/* Self-contained */}
                    <div className="flex flex-1 items-center justify-between gap-3 px-4 py-3">
                      <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-slate-400">
                        {van.selfContained ? <CheckCircle size={14} className="text-teal-500" /> : <X size={14} className="text-slate-300" />}
                        Self-contained
                      </span>
                      <span className={`text-sm font-bold ${van.selfContained ? 'text-slate-900' : 'text-slate-400'}`}>
                        {van.selfContained ? (van.selfContainedType === 'blue' ? '🔵 Blue' : '🟢 Green') : 'No'}
                      </span>
                    </div>
                  </div>

                  {/* CarJam — compact one-line trust signal */}
                  {van.plateNumber ? (
                    <div className="flex flex-col gap-2 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-center gap-2">
                        <Shield size={16} className="shrink-0 text-blue-600" aria-hidden />
                        <span className="truncate text-sm font-semibold text-slate-700">
                          {t('van_page.carjam_headline')}
                        </span>
                        <HelpCircle
                          size={14}
                          className="shrink-0 cursor-help text-slate-400"
                          title={t('van_page.carjam_explainer_long')}
                          aria-label={t('van_page.carjam_explainer_long')}
                        />
                      </div>
                      <a
                        href={`https://www.carjam.co.nz/car/?plate=${van.plateNumber.toUpperCase()}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                          if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
                            window.gtag('event', 'carjam_click', { van_id: van.id, van_title: van.title });
                          }
                        }}
                        className="inline-flex w-full shrink-0 items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-bold uppercase tracking-wide text-blue-700 transition-all hover:bg-blue-100 active:scale-[0.98] sm:w-auto"
                      >
                        <ExternalLink size={13} aria-hidden />
                        {t('van_page.carjam_cta_button')}
                      </a>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 border-t border-slate-100 px-4 py-3 text-xs font-semibold text-amber-700">
                      <AlertTriangle size={14} className="shrink-0" aria-hidden />
                      {t('van_page.carjam_no_plate_short')}
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="border-t border-slate-200 pt-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">{t('van_page.about')}</h2>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line text-[15px]">
                  {van.description || t('van_page.no_description')}
                </p>
              </div>

              {/* Equipment - Premium Grid */}
              {van.equipment && Object.values(van.equipment).some(v => v === true) && (
                <div className="border-t border-slate-200 pt-8">
                  <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <CheckCircle size={20} className="text-amber-500" />
                    {i18n.language.startsWith('fr') ? 'Ce que propose ce van' : 'What this van offers'}
                  </h2>
                  <div>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                      {van.equipment.doubleBed && (
                        <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl hover:bg-emerald-50 hover:border-emerald-100 transition-all group">
                          <span className="text-xl group-hover:scale-110 transition-transform">🛏️</span>
                          <span className="font-bold text-slate-700 text-sm">Double Bed</span>
                        </div>
                      )}
                      {van.equipment.fridge && (
                        <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl hover:bg-emerald-50 hover:border-emerald-100 transition-all group">
                          <span className="text-xl group-hover:scale-110 transition-transform">🧊</span>
                          <span className="font-bold text-slate-700 text-sm">Fridge</span>
                        </div>
                      )}
                      {van.equipment.gasStove && (
                        <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl hover:bg-emerald-50 hover:border-emerald-100 transition-all group">
                          <span className="text-xl group-hover:scale-110 transition-transform">🔥</span>
                          <span className="font-bold text-slate-700 text-sm">Gas Stove</span>
                        </div>
                      )}
                      {van.equipment.sink && (
                        <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl hover:bg-emerald-50 hover:border-emerald-100 transition-all group">
                          <span className="text-xl group-hover:scale-110 transition-transform">🚰</span>
                          <span className="font-bold text-slate-700 text-sm">Sink</span>
                        </div>
                      )}
                      {van.equipment.toilet && (
                        <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl hover:bg-emerald-50 hover:border-emerald-100 transition-all group">
                          <span className="text-xl group-hover:scale-110 transition-transform">🚽</span>
                          <span className="font-bold text-slate-700 text-sm">Toilet</span>
                        </div>
                      )}
                      {van.equipment.solarPanel && (
                        <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl hover:bg-emerald-50 hover:border-emerald-100 transition-all group">
                          <span className="text-xl group-hover:scale-110 transition-transform">☀️</span>
                          <span className="font-bold text-slate-700 text-sm">Solar Panel</span>
                        </div>
                      )}
                      {van.equipment.leisureBattery && (
                        <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl hover:bg-emerald-50 hover:border-emerald-100 transition-all group">
                          <span className="text-xl group-hover:scale-110 transition-transform">🔋</span>
                          <span className="font-bold text-slate-700 text-sm">Leisure Battery</span>
                        </div>
                      )}
                      {van.equipment.heater && (
                        <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl hover:bg-emerald-50 hover:border-emerald-100 transition-all group">
                          <span className="text-xl group-hover:scale-110 transition-transform">🌡️</span>
                          <span className="font-bold text-slate-700 text-sm">Heater</span>
                        </div>
                      )}
                      {van.equipment.dieselHeater && (
                        <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl hover:bg-emerald-50 hover:border-emerald-100 transition-all group">
                          <span className="text-xl group-hover:scale-110 transition-transform">🔥</span>
                          <span className="font-bold text-slate-700 text-sm">Diesel Heater</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Buy-Back Details - Premium Design */}
              {van.buyBack && (
                <div className="bg-emerald-600 rounded-[2rem] shadow-2xl overflow-hidden border-4 border-emerald-500/30">
                  <div className="px-8 py-6 text-white">
                    <h3 className="font-black text-xl uppercase tracking-widest flex items-center gap-3">
                      <Shield size={24} fill="currentColor" className="text-emerald-300" />
                      {t('van_page.buyback_title')}
                    </h3>
                    <p className="text-emerald-100 font-medium mt-1">{t('van_page.buyback_subtitle')}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                      <div className="bg-emerald-700/50 backdrop-blur-md rounded-2xl p-6 border border-emerald-400/20">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300 mb-1">{t('van_page.buyback_price')}</p>
                        <p className="text-3xl font-black">{van.buyBackPrice ? formatPrice(van.buyBackPrice) : t('van_page.contact_seller')}</p>
                      </div>
                      <div className="bg-emerald-700/50 backdrop-blur-md rounded-2xl p-6 border border-emerald-400/20">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300 mb-1">{t('van_page.valid_for')}</p>
                        <p className="text-3xl font-black">{van.buyBackDuration ? `${van.buyBackDuration} ${t('van_page.months')}` : t('van_page.contact_seller')}</p>
                      </div>
                    </div>

                    {van.buyBackConditions && (
                      <div className="mt-6 bg-white/10 rounded-2xl p-4 border border-white/10">
                        <p className="text-sm font-medium leading-relaxed italic opacity-90">
                          "{van.buyBackConditions}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Seller Info */}
              <div className="border-t border-slate-200 pt-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-5">{i18n.language.startsWith('fr') ? 'Le vendeur' : 'Meet the seller'}</h2>

                <div className="flex items-center gap-5 mb-7">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      {seller.name?.[0]?.toUpperCase() || 'U'}
                    </div>

                  </div>

                  <div>
                    <h4 className="text-2xl font-black text-slate-900 leading-tight mb-1">{seller.name || 'Unknown Seller'}</h4>
                    <div className="flex items-center gap-2">
                      {hasRating ? (
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={14} className={i < seller.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"} />
                            ))}
                          </div>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">({seller.rating.toFixed(1)})</span>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('van_page.new_seller')}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Partage (le contact direct est dans la carte sticky à droite) */}
                {!isOwner && (
                  <button
                    onClick={() => handleShare('facebook')}
                    className="mb-6 w-full flex items-center justify-center gap-2.5 border border-slate-300 hover:border-slate-900 text-slate-700 hover:text-slate-900 py-3 rounded-xl font-semibold transition active:scale-[0.98]"
                  >
                    <Share2 size={18} />
                    {i18n.language.startsWith('fr') ? 'Partager à un ami' : 'Share with a friend'}
                  </button>
                )}

                {/* Quick Message Box */}
                <div id="quick-message-box" className="transition-all duration-500 rounded-3xl">
                  <Suspense fallback={<div className="h-40 animate-pulse bg-slate-50 rounded-3xl" />}>
                    <QuickMessageBox
                      van={van}
                      seller={seller}
                      onOpenFullChat={() => navigate('/messages')}
                      onAuthRequired={() => setShowAuthModal(true)}
                    />
                  </Suspense>
                </div>
              </div>

              {/* Facebook Ad Generator — outil vendeur (owner uniquement) */}
              {isOwner && (
              <div className="border-t border-slate-200 pt-8">
              <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-blue-600 p-2 rounded-lg text-white">
                    <Facebook size={20} />
                  </div>
                  <h4 className="font-bold text-gray-900">{i18n.language.startsWith('fr') ? 'Vendre plus vite' : 'Sell Faster'}</h4>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  {i18n.language.startsWith('fr')
                    ? 'Générez un texte optimisé pour vos groupes Facebook.'
                    : 'Generate a perfectly formatted text for your Facebook groups.'}
                </p>
                <button
                  onClick={generateFbAdText}
                  className="w-full bg-white border-2 border-blue-600 text-blue-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-all group"
                >
                  <Copy size={18} className="group-hover:scale-110 transition-transform" />
                  {i18n.language.startsWith('fr') ? 'Copier le texte FB' : 'Copy Facebook Ad Text'}
                </button>
              </div>
              </div>
              )}

              {/* Helpful Resources for Buyers */}
              <div className="border-t border-slate-200 pt-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <HelpCircle size={20} className="text-emerald-600" />
                  {i18n.language.startsWith('fr') ? 'Ressources utiles' : 'Helpful resources'}
                </h2>
                <div className="space-y-2">
                  <Link to="/guide/how-to-inspect-campervan-nz" className="flex items-center justify-between p-4 hover:bg-emerald-50 rounded-2xl transition-all group border border-transparent hover:border-emerald-100">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🛠️</span>
                      <span className="text-sm font-bold text-slate-700">How to inspect a van</span>
                    </div>
                    <ExternalLink size={14} className="text-slate-300 group-hover:text-emerald-600" />
                  </Link>
                  <Link to="/buyback-calculator" className="flex items-center justify-between p-4 hover:bg-emerald-50 rounded-2xl transition-all group border border-transparent hover:border-emerald-100">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🧮</span>
                      <span className="text-sm font-bold text-slate-700">Estimate your buy-back price</span>
                    </div>
                    <ExternalLink size={14} className="text-slate-300 group-hover:text-emerald-600" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Colonne droite : carte contact / gestion (sticky) */}
            <aside className="lg:sticky lg:top-24">
              {!isOwner ? (
                <div className="rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/40 bg-white p-6">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-3xl font-bold text-slate-900">{formatPrice(van.price)}</span>
                    {van.status === 'sold' && (
                      <span className="text-xs font-bold text-red-600 uppercase tracking-widest bg-red-50 px-2 py-0.5 rounded-full">{t('my_listings.sold') || 'Sold'}</span>
                    )}
                  </div>
                  <p className="mt-1.5 text-xs text-slate-400 flex items-center gap-1.5">
                    <Clock size={13} /> {t('van_page.days_ago', { count: getDaysAgo(van.createdAt) })}
                  </p>

                  {van.status !== 'sold' && getDaysAgo(van.createdAt) > 30 && (
                    <div className="mt-4 flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200">
                      <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-800 leading-relaxed">
                        {i18n.language.startsWith('fr')
                          ? 'Annonce publiée il y a plus d\'un mois — elle est peut-être déjà vendue. Confirme la disponibilité avec le vendeur avant de te déplacer.'
                          : 'Listed over a month ago — it may already be sold. Confirm availability with the seller before travelling to see it.'}
                      </p>
                    </div>
                  )}

                  <div className="mt-5 space-y-2.5">
                    {(seller.whatsapp || seller.phone) && (
                      <button
                        onClick={() => {
                          if (!currentUser) { setShowAuthModal(true); return; }
                          const whatsappTarget = seller.whatsapp || seller.phone;
                          const waText = encodeURIComponent(t('van_page.whatsapp_prefill', { year: van.year || '', title: van.title || '', price: formatPrice(van.price) }));
                          if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
                            window.gtag('event', 'contact_seller', { method: 'whatsapp', van_id: van.id, van_title: van.title, seller_id: seller.uid || van.userId });
                          }
                          window.open(`https://wa.me/${formatWhatsAppNumber(whatsappTarget)}?text=${waText}`, '_blank', 'noopener,noreferrer');
                        }}
                        className="w-full flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#20bd5c] text-white py-3.5 rounded-xl font-semibold transition active:scale-[0.98]"
                      >
                        {currentUser ? <MessageCircle size={19} /> : <Lock size={17} />}
                        {currentUser ? 'WhatsApp' : (i18n.language.startsWith('fr') ? 'Voir le contact' : 'Reveal contact')}
                      </button>
                    )}
                    {seller.phone && (
                      <button
                        onClick={() => {
                          if (!currentUser) { setShowAuthModal(true); return; }
                          if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
                            window.gtag('event', 'contact_seller', { method: 'phone', van_id: van.id, van_title: van.title, seller_id: seller.uid || van.userId });
                          }
                          window.open(`tel:${seller.phone}`, '_self');
                        }}
                        className="w-full flex items-center justify-center gap-2.5 bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-xl font-semibold transition active:scale-[0.98]"
                      >
                        {currentUser ? <Phone size={18} /> : <Lock size={17} />}
                        {currentUser ? (i18n.language.startsWith('fr') ? 'Appeler' : 'Call seller') : (i18n.language.startsWith('fr') ? 'Voir le numéro' : 'Show number')}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        const messageBox = document.getElementById('quick-message-box');
                        if (messageBox) {
                          messageBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          messageBox.classList.add('ring-4', 'ring-emerald-500/20');
                          setTimeout(() => messageBox.classList.remove('ring-4', 'ring-emerald-500/20'), 2000);
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2.5 border border-slate-300 hover:border-slate-900 text-slate-900 py-3.5 rounded-xl font-semibold transition active:scale-[0.98]"
                    >
                      <MessageCircle size={18} />
                      {i18n.language.startsWith('fr') ? 'Envoyer un message' : 'Send a message'}
                    </button>
                  </div>

                  {!currentUser && (seller.whatsapp || seller.phone) && (
                    <p className="mt-3 text-center text-xs text-slate-400">
                      {i18n.language.startsWith('fr') ? 'Connexion requise pour contacter le vendeur' : 'Sign in to contact the seller'}
                    </p>
                  )}

                  {/* Signalement : van vendu / vendeur injoignable */}
                  <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                    {reportSent ? (
                      <p className="text-xs text-slate-400 inline-flex items-center gap-1.5">
                        <CheckCircle size={13} className="text-emerald-500" />
                        {i18n.language.startsWith('fr') ? 'Signalé, merci !' : 'Reported, thanks!'}
                      </p>
                    ) : (
                      <button
                        onClick={() => handleReportListing('sold')}
                        disabled={reporting}
                        className="text-xs text-slate-400 hover:text-red-500 transition disabled:opacity-50 inline-flex items-center gap-1.5"
                      >
                        <AlertTriangle size={12} />
                        {i18n.language.startsWith('fr') ? 'Déjà vendu ou vendeur injoignable ? Signaler' : 'Already sold or seller not responding? Report it'}
                      </button>
                    )}
                  </div>

                  {/* Mini vendeur */}
                  <div className="mt-5 pt-5 border-t border-slate-100 flex items-center gap-3">
                    <div className="w-11 h-11 shrink-0 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold">
                      {seller.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 text-sm truncate">{seller.name || 'Private seller'}</p>
                      <p className="text-xs text-slate-400">
                        {hasRating ? `★ ${seller.rating.toFixed(1)} (${seller.reviewCount})` : t('van_page.new_seller')}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/40 bg-white p-6">
                  <span className="text-3xl font-bold text-slate-900">{formatPrice(van.price)}</span>
                  <p className="mt-1.5 text-xs text-slate-400 flex items-center gap-1.5">
                    <Clock size={13} /> {t('van_page.days_ago', { count: getDaysAgo(van.createdAt) })} · {van.views || 0} views
                  </p>
                  <Link
                    to={`/sell?edit=${van.id}`}
                    className="mt-5 w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-xl font-semibold transition active:scale-[0.98]"
                  >
                    <Edit2 size={17} /> {t('my_listings.edit')}
                  </Link>
                  <p className="mt-3 text-center text-xs text-slate-400">
                    {i18n.language.startsWith('fr') ? 'Gérez votre annonce ci-dessous' : 'Manage your listing below'}
                  </p>
                </div>
              )}
            </aside>
          </div>

          {/* Browse More - Internal Links for SEO */}
          <section className="mt-14 border-t border-slate-200 pt-10">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900 tracking-tight">{t('van_page.browse_more')}</h2>
              <p className="text-slate-500 text-sm mt-1">{t('van_page.discover')}</p>
            </div>
            <div>
              <div className="mb-8 bg-slate-50 rounded-2xl border border-slate-100 p-5">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Related SEO paths</h3>
                <div className="flex flex-wrap gap-2">
                  {locationSlug && (
                    <>
                      <Link to={`/location/${locationSlug}`} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:border-emerald-200 hover:text-emerald-700 transition-all">
                        More vans in {van.location}
                      </Link>
                      <Link to={`/faq/location/${locationSlug}`} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:border-blue-200 hover:text-blue-700 transition-all">
                        {van.location} FAQ
                      </Link>
                    </>
                  )}
                  {inferredBrandSlug && (
                    <>
                      <Link to={`/brand/${inferredBrandSlug}`} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:border-emerald-200 hover:text-emerald-700 transition-all">
                        Similar brand listings
                      </Link>
                      <Link to={`/faq/brand/${inferredBrandSlug}`} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:border-blue-200 hover:text-blue-700 transition-all">
                        Brand FAQ
                      </Link>
                    </>
                  )}
                  {longTailSlug && (
                    <Link to={`/search/${longTailSlug}`} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:border-emerald-200 hover:text-emerald-700 transition-all">
                      High-intent local page
                    </Link>
                  )}
                  <Link to="/guide/buying-campervan-nz" className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:border-emerald-200 hover:text-emerald-700 transition-all">
                    Buyer guide
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* By Brand */}
                <div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                    {t('van_page.popular_brands')}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <Link to="/brand/toyota-hiace" className="px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-700 font-bold hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-all">
                      Toyota Hiace
                    </Link>
                    <Link to="/brand/nissan-caravan" className="px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-700 font-bold hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-all">
                      Nissan Caravan
                    </Link>
                    <Link to="/brand/mitsubishi-delica" className="px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-700 font-bold hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-all">
                      Mitsubishi Delica
                    </Link>
                    <Link to="/brand/mazda-bongo" className="px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-700 font-bold hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-all">
                      Mazda Bongo
                    </Link>
                    <Link to="/brand/ford-transit" className="px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-700 font-bold hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-all">
                      Ford Transit
                    </Link>
                  </div>
                </div>
                {/* By Location */}
                <div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    {t('van_page.popular_locations')}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <Link to="/location/auckland" className="px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-700 font-bold hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all">
                      Auckland
                    </Link>
                    <Link to="/location/wellington" className="px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-700 font-bold hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all">
                      Wellington
                    </Link>
                    <Link to="/location/christchurch" className="px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-700 font-bold hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all">
                      Christchurch
                    </Link>
                    <Link to="/location/queenstown" className="px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-700 font-bold hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all">
                      Queenstown
                    </Link>
                    <Link to="/location/rotorua" className="px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-700 font-bold hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all">
                      Rotorua
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Modals & Overlays */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowDeleteConfirm(false)}
                className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white rounded-[2.5rem] w-full max-w-md p-8 relative z-10 shadow-2xl overflow-hidden"
              >
                {/* Warning icon */}
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-6 mx-auto">
                  <AlertTriangle size={40} />
                </div>

                <h3 className="text-2xl font-black text-slate-900 text-center mb-4 uppercase tracking-tight">
                  {t('my_listings.delete_confirm_title') || 'Delete Listing?'}
                </h3>
                <p className="text-slate-500 text-center mb-8 font-medium leading-relaxed">
                  {t('my_listings.delete_confirm_desc') || 'Are you sure you want to permanently delete this listing? This action cannot be undone.'}
                </p>

                <div className="flex flex-col gap-3">
                  {van?.status !== 'sold' && (
                    <button
                      onClick={async () => {
                        await handleToggleSold();
                        setShowDeleteConfirm(false);
                      }}
                      disabled={isUpdating}
                      className="w-full py-4 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
                    >
                      {t('my_listings.mark_as_sold')}
                    </button>
                  )}
                  <button
                    onClick={handleDelete}
                    disabled={isUpdating}
                    className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-red-200 active:scale-95 disabled:opacity-50"
                  >
                    {isUpdating ? t('common.loading') : (t('my_listings.delete') || 'Delete Permanently')}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isUpdating}
                    className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* LIGHTBOX / FULL SCREEN IMAGES */}
          {showLightbox && (
            <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/95 backdrop-blur-md overflow-hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0"
                onClick={() => setShowLightbox(false)}
              />

              {/* Header Controls */}
              <div className="absolute top-0 inset-x-0 p-6 flex items-center justify-between z-10">
                <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-2xl text-white text-sm font-black tracking-widest border border-white/10 uppercase">
                  {currentImageIndex + 1} / {images.length}
                </div>
                <button
                  onClick={() => setShowLightbox(false)}
                  className="bg-white/10 hover:bg-white text-white hover:text-black p-3 rounded-2xl backdrop-blur-md transition-all border border-white/10 shadow-2xl"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Main Image in Lightbox */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative max-w-7xl max-h-[85vh] w-full px-4 flex items-center justify-center z-10"
              >
                <img
                  src={getLargeImage(images[currentImageIndex])}
                  alt={`${van.title} - Large view`}
                  className="max-w-full max-h-full object-contain rounded-3xl shadow-2xl pointer-events-none select-none"
                />

                {/* Navigation in Modal */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); prevImage(); }}
                      className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white text-white hover:text-black p-4 rounded-3xl backdrop-blur-md transition-all border border-white/10 shadow-2xl"
                    >
                      <ChevronLeft size={32} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); nextImage(); }}
                      className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white text-white hover:text-black p-4 rounded-3xl backdrop-blur-md transition-all border border-white/10 shadow-2xl"
                    >
                      <ChevronRight size={32} />
                    </button>
                  </>
                )}
              </motion.div>

              {/* Thumbnails row at bottom of lightbox */}
              {images.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 px-6 py-4 bg-black/40 backdrop-blur-xl rounded-[2.5rem] border border-white/10 max-w-[90vw] overflow-x-auto scrollbar-hide z-10">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                      className={`flex-shrink-0 w-16 h-16 rounded-2xl overflow-hidden transition-all duration-300 ${idx === currentImageIndex
                        ? 'ring-4 ring-emerald-500 ring-offset-4 ring-offset-black scale-110'
                        : 'opacity-40 hover:opacity-100 hover:scale-105'
                        }`}
                    >
                      <img src={getThumbnail(img)} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </AnimatePresence>

        {/* Sticky Mobile Action Bar - HIGH CONVERSION TOOL */}
        {!isOwner && van.status !== 'sold' && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[150] p-4 safe-bottom pointer-events-none">
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              className="bg-white/95 backdrop-blur-xl border border-slate-200 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] rounded-[2.5rem] p-3 flex items-center gap-3 pointer-events-auto max-w-md mx-auto"
            >
              <div className="flex-1 min-w-0 pl-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                  Asking Price
                </p>
                <p className="text-xl font-black text-slate-900 truncate">
                  {formatPrice(van.price)}
                </p>
              </div>

              <div className="flex gap-2">
                {(seller.whatsapp || seller.phone) && (
                  <button
                    onClick={() => {
                      // Contact protégé : connexion requise pour révéler le numéro
                      if (!currentUser) { setShowAuthModal(true); return; }
                      const whatsappTarget = seller.whatsapp || seller.phone;
                      const waText = encodeURIComponent(t('van_page.whatsapp_prefill', { year: van.year || '', title: van.title || '', price: formatPrice(van.price) }));
                      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
                        window.gtag('event', 'contact_seller', { method: 'whatsapp', van_id: van.id, van_title: van.title, seller_id: seller.uid || van.userId });
                      }
                      window.open(`https://wa.me/${formatWhatsAppNumber(whatsappTarget)}?text=${waText}`, '_blank', 'noopener,noreferrer');
                    }}
                    className="w-14 h-14 bg-[#25D366] text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                    title={currentUser ? 'WhatsApp' : 'Sign in to contact'}
                  >
                    {currentUser ? <MessageCircle size={24} fill="currentColor" /> : <Lock size={22} />}
                  </button>
                )}
                {seller.phone && currentUser && (
                  <button
                    onClick={() => {
                      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
                        window.gtag('event', 'contact_seller', { method: 'phone', van_id: van.id, van_title: van.title, seller_id: seller.uid || van.userId });
                      }
                      window.open(`tel:${seller.phone}`, '_self');
                    }}
                    className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                    title="Call Seller"
                  >
                    <Phone size={22} />
                  </button>
                )}

                <button
                  onClick={() => {
                    const messageBox = document.getElementById('quick-message-box');
                    if (messageBox) {
                      messageBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      // Give it a subtle highlight effect
                      messageBox.classList.add('ring-4', 'ring-emerald-500/20');
                      setTimeout(() => messageBox.classList.remove('ring-4', 'ring-emerald-500/20'), 2000);
                    }
                  }}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 h-14 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <MessageCircle size={20} />
                  {i18n.language.startsWith('fr') ? 'Contacter' : 'Message'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </div>
    </>
  );
}
