import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { BrowserRouter, Routes, Route, useNavigate, Link, useLocation, useNavigationType } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, MapPin, Calendar, Gauge, Users, Heart, Filter, ChevronDown, Star, Phone, Mail, Shield, Award, CheckCircle, X, Plus, TrendingUp, Zap, Clock, Facebook, Instagram, Twitter, AlertCircle, MessageCircle, Calculator, Settings, Menu, HelpCircle, CalendarCheck, ExternalLink, BookOpen } from 'lucide-react';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { useFavorites } from './hooks/useFavorites';
import { getThumbnail, getLargeImage } from './utils/imageOptimizer';
import { NotificationProvider, useNotifications } from './components/NotificationSystem';
import NotificationBell from './components/NotificationBell';
import SeoHead from './components/SeoHead';
import Header from './components/Header';
import QuickFilters from './components/QuickFilters';
import Listings from './components/Listings';

// ✅ COMPOSANTS CRITIQUES - Chargés immédiatement
import AuthModal from './components/AuthModal';
import safeStorage, { safeSessionStorage } from './utils/safeStorage';
import { safeDate } from './utils/dateHelper';
import Footer, { FAQModal } from './components/Footer';
import VanCard from './components/VanCard';
// MVP_DISABLED: Stripe/Payments
// import { TrustBanner } from './components/SecurityBadge';

// ✅ LAZY LOADING - Chargés uniquement quand nécessaires
const SellPage = lazy(() => import('./components/SellPage'));
const AddVanForm = lazy(() => import('./components/AddVanForm'));
const MyVans = lazy(() => import('./components/MyVans'));
// MVP_DISABLED: Reservations
// const MyReservations = lazy(() => import('./components/MyReservations'));
const FavoritesPage = lazy(() => import('./components/FavoritesPage'));
const MessagingPage = lazy(() => import('./components/MessagingPage'));
const BuybackCalculator = lazy(() => import('./components/BuybackCalculator'));
const UserProfile = lazy(() => import('./components/UserProfile'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const TermsOfServiceModal = lazy(() => import('./components/TermsOfService').then(m => ({ default: m.TermsOfServiceModal })));
const HomeSeoSection = lazy(() => import('./components/HomeSeoSection'));
const QuickMessageBox = lazy(() => import('./components/QuickMessageBox'));
// ✅ SEO: Pages avec URLs propres pour le référencement
const VanPage = lazy(() => import('./components/VanPage'));
const BrandPage = lazy(() => import('./components/BrandPage'));
const LocationPage = lazy(() => import('./components/LocationPage'));
const GuidePage = lazy(() => import('./components/GuidePage'));
// ✅ User pages
const ProfilePage = lazy(() => import('./components/ProfilePage'));
const MyListingsPage = lazy(() => import('./components/MyListingsPage'));
// MVP_DISABLED: Reservations
// const ReservationSuccess = lazy(() => import('./components/ReservationSuccess'));
// const ReservationCancelled = lazy(() => import('./components/ReservationCancelled'));
// MVP_DISABLED: Reviews
// const LeaveReviewButton = lazy(() => import('./components/ReviewSystem').then(m => ({ default: m.LeaveReviewButton })));
// const SellerReviews = lazy(() => import('./components/ReviewSystem').then(m => ({ default: m.SellerReviews })));
// MVP_DISABLED: Payments/Stripe
// const ReserveButton = lazy(() => import('./components/PaymentSystem').then(m => ({ default: m.ReserveButton })));

// ✅ LOADING COMPONENTS
const LoadingSpinner = ({ text = "Loading..." }) => (
  <div className="flex items-center justify-center py-12">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mb-3"></div>
      <p className="text-gray-500 text-sm">{text}</p>
    </div>
  </div>
);

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600 mb-4"></div>
      <p className="text-xl text-gray-600 font-semibold">Loading...</p>
    </div>
  </div>
);


// ✅ Calcule le nombre de jours depuis la création
// ✅ Calcule le nombre de jours depuis la création
const getDaysAgo = (createdAt) => {
  const created = safeDate(createdAt);
  if (!created) return 0;
  const now = new Date();
  const diffTime = Math.abs(now - created);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Détecteur WebView (Messenger, Instagram, etc.)
function WebViewWarning() {
  const [isWebView, setIsWebView] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    const isInAppBrowser = /FBAN|FBAV|Instagram|Messenger|WebView|wv/i.test(ua);
    setIsWebView(isInAppBrowser);
  }, []);

  if (!isWebView) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl p-6 max-w-sm text-center shadow-2xl">
        <div className="text-5xl mb-4">🌐</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Open in Browser
        </h2>
        <p className="text-gray-600 mb-4 text-sm">
          For the best experience, please open this link in your browser (Safari, Chrome, etc.)
        </p>
        <div className="bg-gray-100 rounded-xl p-3 mb-4">
          <p className="text-xs text-gray-500 mb-1">Tap the menu ••• then</p>
          <p className="font-semibold text-gray-800">"Open in Browser"</p>
        </div>
        <button
          onClick={() => setIsWebView(false)}
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          Continue anyway →
        </button>
      </div>
    </div>
  );
}



// 💱 Sélecteur de devise pour le header
const CURRENCIES = {
  NZD: { symbol: '$', code: 'NZD', flag: 'https://flagcdn.com/24x18/nz.png', rate: 1 },
  EUR: { symbol: '€', code: 'EUR', flag: 'https://flagcdn.com/24x18/eu.png', rate: 0.54 },
  USD: { symbol: '$', code: 'USD', flag: 'https://flagcdn.com/24x18/us.png', rate: 0.59 },
  AUD: { symbol: '$', code: 'AUD', flag: 'https://flagcdn.com/24x18/au.png', rate: 0.92 },
  GBP: { symbol: '£', code: 'GBP', flag: 'https://flagcdn.com/24x18/gb.png', rate: 0.47 },
};

function CurrencySelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentCurrency, setCurrentCurrency] = useState('NZD');

  useEffect(() => {
    const savedCurrency = safeStorage.getItem('kiwivanmarket_currency') || 'NZD';
    setCurrentCurrency(savedCurrency);
  }, []);

  const changeCurrency = (code) => {
    setIsOpen(false);
    setCurrentCurrency(code);
    safeStorage.setItem('kiwivanmarket_currency', code);
    window.dispatchEvent(new CustomEvent('currencyChange', { detail: code }));
  };

  const currency = CURRENCIES[currentCurrency];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition text-white text-sm font-semibold"
        title="Change currency"
      >
        <img src={currency.flag} alt={currency.code} className="w-6 h-4 object-cover rounded-sm" />
        <span className="hidden sm:inline">{currency.code}</span>
        <ChevronDown
          size={14}
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[100]"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 min-w-[140px] z-[101]">
            {Object.entries(CURRENCIES).map(([code, curr]) => (
              <button
                key={code}
                onClick={() => changeCurrency(code)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition ${currentCurrency === code
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'hover:bg-gray-50 text-gray-700'
                  }`}
              >
                <img src={curr.flag} alt={code} className="w-6 h-4 object-cover rounded-sm" />
                <span className="font-medium">{code}</span>
                <span className="text-gray-400 ml-auto">{curr.symbol}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}



// ========================================
// COMPOSANT PRINCIPAL DE L'APPLICATION
// ========================================
function MainApp() {
  const navigate = useNavigate();
  const [vans, setVans] = useState([]);
  const [filteredVans, setFilteredVans] = useState([]);
  const [selectedVan, setSelectedVan] = useState(null);
  const { favorites, toggleFavorite, isFavorite, count: favoritesCount } = useFavorites();
  const [showFavorites, setShowFavorites] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showContactForm, setShowContactForm] = useState(false);
  const [showAddVanForm, setShowAddVanForm] = useState(false);
  const [showMyVans, setShowMyVans] = useState(false);
  // MVP_DISABLED: Reservations
  // const [showMyReservations, setShowMyReservations] = useState(false);
  const [showMessagingPage, setShowMessagingPage] = useState(false);
  const [showBuybackCalculator, setShowBuybackCalculator] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showBuyBackInfo, setShowBuyBackInfo] = useState(false);
  const [showWofInfo, setShowWofInfo] = useState(false);
  const [showRegoInfo, setShowRegoInfo] = useState(false);
  const [showSelfContainedInfo, setShowSelfContainedInfo] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const { currentUser, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  const isAdmin = currentUser?.isAdmin === true;

  const [showFAQ, setShowFAQ] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const [sortBy, setSortBy] = useState('newest');

  const [filters, setFilters] = useState({
    priceMin: 0,
    priceMax: 500000,
    yearMin: 1980,
    type: 'all',
    location: 'all',
    selfContained: false,
    buyBack: false,
    wofValid: false,
    regoValid: false,
    equipment: {
      doubleBed: false,
      fridge: false,
      gasStove: false,
      sink: false,
      toilet: false,
      solarPanel: false,
      leisureBattery: false,
      heater: false,
      dieselHeater: false,
      shower: false,
      insulation: false,
      surfRack: false
    }
  });

  const [currency, setCurrency] = useState('NZD');

  useEffect(() => {
    const savedCurrency = safeStorage.getItem('kiwivanmarket_currency') || 'NZD';
    setCurrency(savedCurrency);

    const handleCurrencyChange = (e) => {
      setCurrency(e.detail);
    };

    window.addEventListener('currencyChange', handleCurrencyChange);
    return () => window.removeEventListener('currencyChange', handleCurrencyChange);
  }, []);

  useEffect(() => {
    const loader = document.getElementById('app-loader');
    if (loader) {
      setTimeout(() => {
        loader.classList.add('fade-out');
        setTimeout(() => loader.remove(), 500);
      }, 300);
    }
  }, []);

  // ✨ OPTIMISATION : Chargement avec cache localStorage
  useEffect(() => {
    const fetchVans = async () => {
      try {
        const cachedData = safeStorage.getItem('kiwiVanMarket_vans');
        const cacheTimestamp = safeStorage.getItem('kiwiVanMarket_timestamp');
        let initialVans = [];

        if (cachedData) {
          try {
            initialVans = JSON.parse(cachedData);
            if (initialVans.length > 0) {
              setVans(initialVans);
              setFilteredVans(initialVans);
              setLoading(false); // On a des données, on peut masquer le loader
            }
          } catch (e) {
            console.error('Error parsing cache:', e);
          }
        }

        // Si on n'a absolument rien en cache, on affiche le loader
        if (initialVans.length === 0) {
          setLoading(true);
        }

        const now = Date.now();
        const cacheAge = cacheTimestamp ? now - parseInt(cacheTimestamp) : Infinity;
        const CACHE_FRESH_THRESHOLD = 2 * 60 * 1000; // 2 minutes

        // On ne fetch Firestore que si le cache est vieux ou inexistant
        if (initialVans.length > 0 && cacheAge < CACHE_FRESH_THRESHOLD) {
          return;
        }

        const querySnapshot = await getDocs(collection(db, 'vans'));
        const vansData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        const sortedVans = [...vansData].sort((a, b) => {
          const getTs = (v) => {
            const d = safeDate(v.createdAt);
            return d ? d.getTime() : 0;
          };
          return getTs(b) - getTs(a);
        });

        // Mise à jour uniquement si nécessaire (données différentes du cache)
        if (initialVans.length === 0 || JSON.stringify(sortedVans) !== cachedData) {
          safeStorage.setItem('kiwiVanMarket_vans', JSON.stringify(sortedVans));
          safeStorage.setItem('kiwiVanMarket_timestamp', now.toString());
          setVans(sortedVans);
          setFilteredVans(sortedVans);
        }

      } catch (error) {
        console.error('Error loading vans:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVans();
  }, []);

  const refreshVans = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'vans'));
      const vansData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Sort before saving (newest first)
      const sortedVans = [...vansData].sort((a, b) => {
        const getTs = (v) => {
          const d = safeDate(v.createdAt);
          return d ? d.getTime() : 0;
        };
        return getTs(b) - getTs(a);
      });

      safeStorage.setItem('kiwiVanMarket_vans', JSON.stringify(sortedVans));
      safeStorage.setItem('kiwiVanMarket_timestamp', Date.now().toString());

      setVans(sortedVans);
      setFilteredVans(sortedVans);
    } catch (error) {
      console.error('Error reloading vans:', error);
    }
  };

  useEffect(() => {
    let filtered = vans.filter(van => {
      // Only show active vans (hide sold, paused, deleted)
      if (van.status && van.status !== 'active') return false;

      const matchSearch = !searchTerm ||
        van.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        van.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        van.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const price = typeof van.price === 'number' ? van.price : 0;
      const matchPrice = price >= filters.priceMin && price <= filters.priceMax;
      const year = typeof van.year === 'number' ? van.year : 2000;
      const matchYear = year >= filters.yearMin;
      const matchType = filters.type === 'all' || van.type === filters.type;
      const matchLocation = filters.location === 'all' || van.location === filters.location;
      const matchSelfContained = !filters.selfContained || van.selfContained;
      const matchBuyBack = !filters.buyBack || van.buyBack;
      const matchWofValid = !filters.wofValid || (van.wofExpiry && safeDate(van.wofExpiry) > new Date());
      const matchRegoValid = !filters.regoValid || (van.regoExpiry && safeDate(van.regoExpiry) > new Date());

      const matchEquipment = Object.entries(filters.equipment).every(([key, required]) => {
        if (!required) return true;
        if (key === 'shower') {
          return van.equipment?.outdoorShower || van.equipment?.indoorShower;
        }
        if (key === 'surfRack') {
          return van.equipment?.surfRack || van.equipment?.bikeRack;
        }
        if (key === 'heater') {
          return van.equipment?.heater || van.equipment?.dieselHeater;
        }
        return van.equipment?.[key] === true;
      });

      return matchSearch && matchPrice && matchYear && matchType && matchLocation && matchSelfContained && matchBuyBack && matchWofValid && matchRegoValid && matchEquipment;
    });

    // Helper to get timestamp from any date format
    const getTimestamp = (van) => {
      const d = safeDate(van.createdAt);
      return d ? d.getTime() : 0;
    };

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return (a.price || 0) - (b.price || 0);
        case 'price-desc':
          return (b.price || 0) - (a.price || 0);
        case 'newest':
        default:
          return getTimestamp(b) - getTimestamp(a);
      }
    });

    setFilteredVans(filtered);
  }, [searchTerm, filters, vans, sortBy]);

  const formatPrice = (price) => {
    const curr = CURRENCIES[currency];
    const converted = Math.round((price || 0) * curr.rate);
    return `${converted.toLocaleString()} ${curr.symbol}`;
  };

  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  // ✅ VanDetailsModal
  const VanDetailsModal = ({ van }) => {
    const images = van.images && van.images.length > 0
      ? van.images
      : (van.imageUrl ? [van.imageUrl] : ['https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=800']);

    const features = van.features || [];
    const seller = van.seller || { name: 'Unknown', email: '', phone: '' };

    const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length);
    const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

    return (
      <div
        className="fixed inset-0 bg-black md:bg-black/70 md:backdrop-blur-sm flex items-start md:items-center justify-center z-[60] overflow-y-auto"
        onClick={() => { setSelectedVan(null); setCurrentImageIndex(0); }}>
        <div
          className="bg-white w-full md:rounded-3xl md:max-w-7xl md:my-8 relative shadow-2xl overflow-hidden min-h-screen md:min-h-0"
          onClick={(e) => e.stopPropagation()}>

          {/* Header mobile */}
          <div className="sticky top-0 z-[80] bg-gradient-to-b from-black/70 to-transparent md:hidden">
            <div className="flex items-center justify-between p-4">
              <button
                onClick={() => { setSelectedVan(null); setCurrentImageIndex(0); }}
                className="bg-white/20 backdrop-blur-sm rounded-full p-2 text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(`/van/${van.id}`); setSelectedVan(null); }}
                  className="bg-white/20 backdrop-blur-sm rounded-full p-2 text-white">
                  <ExternalLink size={22} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(van.id); }}
                  className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                  <Heart
                    size={22}
                    className={isFavorite(van.id) ? 'text-red-500 fill-red-500' : 'text-white'}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Boutons desktop: page complète + fermer */}
          <div className="hidden md:flex absolute top-6 right-6 gap-2 z-[70]">
            <button
              onClick={() => { navigate(`/van/${van.id}`); setSelectedVan(null); }}
              className="bg-white/95 backdrop-blur-sm rounded-full p-3 shadow-xl hover:bg-white transition-all hover:scale-110 group"
              title="Open full page">
              <ExternalLink size={24} className="text-gray-700 group-hover:text-emerald-600" />
            </button>
            <button
              onClick={() => { setSelectedVan(null); setCurrentImageIndex(0); }}
              className="bg-white/95 backdrop-blur-sm rounded-full p-3 shadow-xl hover:bg-white transition-all hover:scale-110">
              <X size={24} className="text-gray-700" />
            </button>
          </div>

          <div className="grid lg:grid-cols-2">

            {/* GALERIE PHOTO - Optimise pour reduire le bandwidth */}
            <div className="relative bg-gray-900 h-[280px] md:h-[600px] lg:h-[800px] -mt-16 md:mt-0">
              <img
                src={getLargeImage(images[currentImageIndex])}
                alt={van.title || 'Van'}
                className="w-full h-full object-contain"
                loading="lazy"
              />

              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                    className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-2 md:p-3 shadow-xl hover:bg-white transition-all hover:scale-110">
                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                    className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-2 md:p-3 shadow-xl hover:bg-white transition-all hover:scale-110">
                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-semibold">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </>
              )}

              <div className="absolute top-20 md:top-6 left-4 md:left-6 flex flex-col gap-2 md:gap-3">
                {van.featured && (
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-bold shadow-lg flex items-center gap-1.5 md:gap-2">
                    <Star size={14} fill="currentColor" />
                    FEATURED
                  </div>
                )}
                {van.selfContained && (
                  <div className={`text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-bold shadow-lg ${van.selfContainedType === 'blue'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                    : 'bg-gradient-to-r from-green-500 to-emerald-500'
                    }`}>
                    ✓ Self-Contained {van.selfContainedType === 'blue' ? '🔵' : '🟢'}
                  </div>
                )}
                {van.buyBack && (
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-bold shadow-lg flex items-center gap-1.5 md:gap-2">
                    <Shield size={14} />
                    Buy-Back
                  </div>
                )}
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); toggleFavorite(van.id); }}
                className="hidden md:block absolute bottom-6 right-6 bg-white rounded-full p-3 shadow-xl hover:scale-110 transition-all">
                <Heart
                  size={24}
                  className={isFavorite(van.id) ? 'text-red-500 fill-red-500' : 'text-gray-700'}
                />
              </button>
            </div>

            {/* INFORMATIONS */}
            <div className="p-5 md:p-8 lg:p-10 md:overflow-y-auto md:max-h-[600px] lg:max-h-[800px]">

              <div className="mb-6 pb-6 border-b-2 border-gray-100">
                <h1 className="text-3xl lg:text-4xl font-black text-gray-900 mb-3 leading-tight">
                  {van.title || 'Untitled Van'}
                </h1>
                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <MapPin size={20} className="text-emerald-600" />
                  <span className="font-medium">{van.location || 'Unknown'}, {van.region || ''}</span>
                </div>
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-2xl border-2 border-emerald-200">
                  <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold mb-1">Price</p>
                  <p className="text-4xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    {formatPrice(van.price)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <Calendar className="text-emerald-600 mb-2" size={20} />
                  <p className="text-xs text-gray-500 font-semibold mb-1">YEAR</p>
                  <p className="text-xl font-bold text-gray-900">{van.year || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <Gauge className="text-emerald-600 mb-2" size={20} />
                  <p className="text-xs text-gray-500 font-semibold mb-1">MILEAGE</p>
                  <p className="text-xl font-bold text-gray-900">{(van.mileage || 0).toLocaleString()} km</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <Users className="text-emerald-600 mb-2" size={20} />
                  <p className="text-xs text-gray-500 font-semibold mb-1">CAPACITY</p>
                  <p className="text-xl font-bold text-gray-900">{van.capacity || 2} people</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <Clock className="text-emerald-600 mb-2" size={20} />
                  <p className="text-xs text-gray-500 font-semibold mb-1">POSTED</p>
                  <p className="text-xl font-bold text-gray-900">{getDaysAgo(van.createdAt)}d ago</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-1 h-6 bg-emerald-600 rounded-full"></div>
                  Description
                </h3>
                <p className="text-gray-700 leading-relaxed">{van.description || 'No description available.'}</p>
              </div>

              {features.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-1 h-6 bg-emerald-600 rounded-full"></div>
                    Features
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {features.map((feature, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg">
                        <CheckCircle size={16} className="text-emerald-600 flex-shrink-0" />
                        <span className="text-sm font-semibold text-gray-900">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {van.equipment && Object.values(van.equipment).some(v => v === true) && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-1 h-6 bg-emerald-600 rounded-full"></div>
                    Equipment
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {van.equipment.doubleBed && <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-2 rounded-lg text-sm">🛏️ Double Bed</div>}
                    {van.equipment.fridge && <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-2 rounded-lg text-sm">🧊 Fridge</div>}
                    {van.equipment.gasStove && <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-2 rounded-lg text-sm">🔥 Gas Stove</div>}
                    {van.equipment.sink && <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-2 rounded-lg text-sm">🚰 Sink</div>}
                    {van.equipment.toilet && <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-2 rounded-lg text-sm">🚽 Toilet</div>}
                    {van.equipment.solarPanel && <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-2 rounded-lg text-sm">☀️ Solar Panel</div>}
                    {van.equipment.leisureBattery && <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-2 rounded-lg text-sm">🔋 Leisure Battery</div>}
                    {van.equipment.heater && <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-2 rounded-lg text-sm">🌡️ Heater</div>}
                    {van.equipment.hotWater && <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-2 rounded-lg text-sm">♨️ Boiler</div>}
                    {van.equipment.outdoorShower && <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-2 rounded-lg text-sm">🚿 Outdoor Shower</div>}
                    {van.equipment.indoorShower && <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-2 rounded-lg text-sm">🛁 Indoor Shower</div>}
                    {van.equipment.awning && <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-2 rounded-lg text-sm">⛺ Awning</div>}
                    {van.equipment.reverseCamera && <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-2 rounded-lg text-sm">📷 Reverse Camera</div>}
                    {van.equipment.bluetooth && <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-2 rounded-lg text-sm">📊 Bluetooth</div>}
                  </div>
                </div>
              )}

              {van.customFeatures && (
                <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <h4 className="text-sm font-bold text-gray-700 mb-2">✏️ Other Features</h4>
                  <p className="text-gray-600 text-sm">{van.customFeatures}</p>
                </div>
              )}

              {/* WOF + REGO + Self-Contained */}
              <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-4 rounded-xl border border-gray-200 mb-6">
                <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <Shield size={16} className="text-emerald-600" />
                  Vehicle Status
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className={`bg-white p-3 rounded-lg border text-center ${van.wofExpiry && safeDate(van.wofExpiry) ? 'border-emerald-200' : 'border-gray-200'}`}>
                    <div className="text-[10px] text-gray-500 font-semibold uppercase mb-1">WOF Valid</div>
                    <div className={`text-lg font-bold ${van.wofExpiry && safeDate(van.wofExpiry) ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {van.wofExpiry && safeDate(van.wofExpiry) ? safeDate(van.wofExpiry).toLocaleDateString('en-NZ', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Not specified'}
                    </div>
                  </div>
                  <div className={`bg-white p-3 rounded-lg border text-center ${van.regoExpiry && safeDate(van.regoExpiry) ? 'border-blue-200' : 'border-gray-200'}`}>
                    <div className="text-[10px] text-gray-500 font-semibold uppercase mb-1">REGO Until</div>
                    <div className={`text-lg font-bold ${van.regoExpiry && safeDate(van.regoExpiry) ? 'text-blue-600' : 'text-gray-400'}`}>
                      {van.regoExpiry && safeDate(van.regoExpiry) ? safeDate(van.regoExpiry).toLocaleDateString('en-NZ', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Not specified'}
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg border text-center ${van.selfContained
                    ? van.selfContainedType === 'blue'
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200'
                    }`}>
                    <div className="text-[10px] text-gray-500 font-semibold uppercase mb-1">Self-Contained</div>
                    <div className={`text-lg font-bold ${van.selfContained
                      ? van.selfContainedType === 'blue' ? 'text-blue-600' : 'text-green-600'
                      : 'text-gray-400'
                      }`}>
                      {van.selfContained
                        ? van.selfContainedType === 'blue' ? '✓ Blue' : '✓ Green'
                        : '✗ No'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Buy-Back Details */}
              {van.buyBack && (
                <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
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
                  {van.buyBackMaxKm && (
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Max km:</strong> {van.buyBackMaxKm.toLocaleString()} km
                    </p>
                  )}
                  {van.buyBackConditions && (
                    <p className="text-sm text-gray-600">
                      <strong>Conditions:</strong> {van.buyBackConditions}
                    </p>
                  )}
                </div>
              )}

              {/* Seller info */}
              {/* MVP_DISABLED: Reviews system - étoiles retirées */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200 mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full w-12 h-12 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                    {seller.name?.[0] || 'U'}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{seller.name || 'Unknown Seller'}</p>
                    <p className="text-sm text-gray-500">Private seller</p>
                  </div>
                </div>
              </div>

              {/* Quick Message Box - Lazy */}
              <Suspense fallback={<LoadingSpinner text="Loading..." />}>
                <QuickMessageBox
                  van={van}
                  seller={seller}
                  onOpenFullChat={() => {
                    setSelectedVan(null);
                    setCurrentImageIndex(0);
                    setShowMessagingPage(true);
                  }}
                />
              </Suspense>

              {/* MVP_DISABLED: Payments/Stripe
              <div className="mt-4">
                <Suspense fallback={<LoadingSpinner />}>
                  <ReserveButton van={van} seller={seller} />
                </Suspense>
              </div>
              */}

              {/* MVP_DISABLED: Reviews
              <div className="mt-4">
                <Suspense fallback={null}>
                  <LeaveReviewButton 
                    sellerId={seller.uid || van.seller?.uid}
                    sellerName={seller.name}
                    vanId={van.id}
                    vanTitle={van.title}
                    className="w-full justify-center"
                  />
                </Suspense>
              </div>

              {(seller.uid || van.seller?.uid) && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Star size={18} className="text-yellow-500" />
                    Seller Reviews
                  </h3>
                  <Suspense fallback={<LoadingSpinner text="Loading reviews..." />}>
                    <SellerReviews sellerId={seller.uid || van.seller?.uid} limit={3} />
                  </Suspense>
                </div>
              )}
              */}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ✅ HEADER PROPS
  const headerProps = {
    setShowBuybackCalculator,
    searchTerm,
    setSearchTerm,
    currentUser,
    favoritesCount,
    setShowFavorites,
    setShowAuthModal,
    setShowMessagingPage,
    setShowUserMenu,
    setShowMobileMenu,
    showMobileMenu,
    isAdmin,
    logout,
    setShowAdminDashboard,
    setShowUserProfile
  };


  return (
    <NotificationProvider onOpenMessaging={() => setShowMessagingPage(true)}>
      {/* WebViewWarning desactive - le site s'affiche directement */}
      <div className="min-h-screen bg-slate-50">
        <Header {...headerProps} />

        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-emerald-600 focus:text-white focus:rounded-lg focus:outline-none"
        >
          Skip to main content
        </a>

        {showBuybackCalculator ? (
          <div className="animate-fade-in-up">
            <Suspense fallback={<PageLoader />}>
              <BuybackCalculator />
            </Suspense>
          </div>
        ) : showMessagingPage ? (
          <div className="animate-fade-in-up">
            <Suspense fallback={<PageLoader />}>
              <MessagingPage onBack={() => setShowMessagingPage(false)} />
            </Suspense>
          </div>
        ) : (
          <>

            {/* ========== HERO SECTION 2.0 ========== */}
            <section className="relative pt-6 pb-20 overflow-hidden">
              {/* Background Elements */}
              <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white" />
                <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-emerald-100/50 blur-[120px] rounded-full" />
                <div className="absolute -bottom-[10%] -left-[10%] w-[30%] h-[30%] bg-teal-100/50 blur-[120px] rounded-full" />
              </div>

              <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

                  {/* Text Content */}
                  <div className="flex-1 text-center lg:text-left animate-fade-in-up stagger-1">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold mb-6 tracking-wide uppercase">
                      <Zap size={14} className="fill-emerald-700" />
                      NZ's #1 Campervan Marketplace
                    </div>

                    <h2 className="text-5xl lg:text-7xl font-black text-slate-900 mb-6 leading-[1.1]">
                      Start Your <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">NZ Adventure</span> Today.
                    </h2>

                    <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                      The most trusted platform to buy and sell campervans in New Zealand.
                      Verified sellers, transparent pricing, and 100% free for buyers.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                      <button
                        onClick={() => {
                          const el = document.getElementById('listings-start');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="btn-primary flex items-center gap-3 group px-8 py-4 text-lg"
                      >
                        Browse Listings
                        <ChevronDown size={20} className="group-hover:translate-y-1 transition-transform" />
                      </button>
                      <button
                        onClick={() => navigate('/sell')}
                        className="px-8 py-4 bg-white border-2 border-slate-100 text-slate-900 font-bold rounded-2xl hover:bg-slate-50 hover:border-emerald-200 transition-all flex items-center gap-2 text-lg"
                      >
                        <Plus size={22} className="text-emerald-600" />
                        Sell Your Van
                      </button>
                    </div>

                    {/* Trust Stats */}
                    <div className="mt-12 flex flex-wrap justify-center lg:justify-start gap-8 border-t border-slate-100 pt-8">
                      <div className="flex flex-col">
                        <span className="text-3xl font-black text-slate-900">1.2k+</span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Vans</span>
                      </div>
                      <div className="h-10 w-[1px] bg-slate-100 hidden sm:block" />
                      <div className="flex flex-col">
                        <span className="text-3xl font-black text-slate-900">5k+</span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Happy Travelers</span>
                      </div>
                      <div className="h-10 w-[1px] bg-slate-100 hidden sm:block" />
                      <div className="flex flex-col">
                        <span className="text-3xl font-black text-slate-900">100%</span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Trusted Sellers</span>
                      </div>
                    </div>
                  </div>

                  {/* Visual Element */}
                  <div className="flex-1 relative w-full aspect-square max-w-[500px] animate-fade-in-up stagger-2">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[3rem] rotate-3 opacity-20" />
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[3rem] -rotate-3 overflow-hidden shadow-2xl">
                      <img
                        src="https://images.unsplash.com/photo-1527786356703-4b100091cd2c?auto=format&fit=crop&q=80&w=1200"
                        alt="New Zealand Campervan Trip"
                        className="w-full h-full object-cover mix-blend-overlay opacity-90 grayscale-[20%] hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                      {/* Floating Card */}
                      <div className="absolute bottom-6 left-6 right-6 glass-effect p-6 rounded-3xl animate-fade-in-up stagger-3">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-lg">
                            <MapPin size={24} />
                          </div>
                          <div>
                            <p className="text-white font-bold">Mount Cook, NZ</p>
                            <p className="text-white/70 text-sm">Your next destination awaits.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ========== MAIN CONTENT ========== */}
            <main id="main-content" role="main">
              <div id="listings-start" className="scroll-mt-24" />

              {/* ========== SEARCH MOBILE + FILTRES ========== */}
              <QuickFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filters={filters}
                setFilters={setFilters}
                showFilters={showFilters}
                setShowFilters={setShowFilters}
                showBuyBackInfo={showBuyBackInfo}
                setShowBuyBackInfo={setShowBuyBackInfo}
                showRegoInfo={showRegoInfo}
                setShowRegoInfo={setShowRegoInfo}
                showSelfContainedInfo={showSelfContainedInfo}
                setShowSelfContainedInfo={setShowSelfContainedInfo}
                showWofInfo={showWofInfo}
                setShowWofInfo={setShowWofInfo}
              />

              {/* ========== RÉSULTATS ========== */}
              <Listings
                loading={loading}
                filteredVans={filteredVans}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                sortBy={sortBy}
                setSortBy={setSortBy}
                formatPrice={formatPrice}
              />

              {/* How It Works */}
              <div className="bg-white py-16 mt-12">
                <div className="max-w-7xl mx-auto px-4">
                  <h2 className="text-4xl font-bold text-center mb-12">{t('how_it_works.title')}</h2>
                  <div className="grid md:grid-cols-3 gap-8">
                    <div className="text-center">
                      <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search size={32} className="text-emerald-600" />
                      </div>
                      <h3 className="font-bold text-xl mb-2">1. {t('how_it_works.step1_title')}</h3>
                      <p className="text-gray-600">{t('how_it_works.step1_desc')}</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Phone size={32} className="text-emerald-600" />
                      </div>
                      <h3 className="font-bold text-xl mb-2">2. {t('how_it_works.step2_title')}</h3>
                      <p className="text-gray-600">{t('how_it_works.step2_desc')}</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={32} className="text-emerald-600" />
                      </div>
                      <h3 className="font-bold text-xl mb-2">3. {t('how_it_works.step3_title')}</h3>
                      <p className="text-gray-600">{t('how_it_works.step3_desc')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* SEO Section */}
              <Suspense fallback={null}>
                <HomeSeoSection />
              </Suspense>

            </main>
          </>
        )}
        {/* ========== END MAIN CONTENT ========== */}

        <Footer
          onOpenFAQ={() => setShowFAQ(true)}
          onOpenTerms={() => setShowTerms(true)}
        />

        {/* Modals */}
        {selectedVan && <VanDetailsModal van={selectedVan} />}

        {
          showAddVanForm && (
            <Suspense fallback={<PageLoader />}>
              <AddVanForm
                onClose={() => setShowAddVanForm(false)}
                onVanAdded={refreshVans}
              />
            </Suspense>
          )
        }

        {
          showMyVans && (
            <Suspense fallback={<PageLoader />}>
              <MyVans onClose={() => setShowMyVans(false)} />
            </Suspense>
          )
        }

        {/* MVP_DISABLED: Reservations
        {showMyReservations && (
          <Suspense fallback={<PageLoader />}>
            <MyReservations 
              onClose={() => setShowMyReservations(false)} 
              onViewVan={(vanId) => {
                const van = vans.find(v => v.id === vanId);
                if (van) {
                  setSelectedVan(van);
                  setShowMyReservations(false);
                }
              }}
            />
          </Suspense>
        )}
        */}

        {
          showFavorites && (
            <Suspense fallback={<PageLoader />}>
              <FavoritesPage
                onClose={() => setShowFavorites(false)}
                onVanClick={(van) => setSelectedVan(van)}
              />
            </Suspense>
          )
        }

        {
          showUserProfile && (
            <Suspense fallback={<PageLoader />}>
              <UserProfile onClose={() => setShowUserProfile(false)} />
            </Suspense>
          )
        }

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />

        <FAQModal
          isOpen={showFAQ}
          onClose={() => setShowFAQ(false)}
        />

        {
          showTerms && (
            <Suspense fallback={<PageLoader />}>
              <TermsOfServiceModal
                isOpen={showTerms}
                onClose={() => setShowTerms(false)}
              />
            </Suspense>
          )
        }

        {
          showHowItWorks && (
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
              onClick={() => setShowHowItWorks(false)}
            >
              <div
                className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 p-6 rounded-t-3xl">
                  <button
                    onClick={() => setShowHowItWorks(false)}
                    className="absolute top-4 right-4 text-white/80 hover:text-white"
                  >
                    <X size={24} />
                  </button>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <HelpCircle size={28} />
                    {t('how_it_works_modal.title')}
                  </h2>
                  <p className="text-emerald-100 mt-1">{t('how_it_works_modal.subtitle')}</p>
                </div>

                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      🔍 {t('how_it_works_modal.buyers_title')}
                    </h3>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="font-bold text-emerald-600">1</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">{t('how_it_works_modal.step1_buyer_title')}</h4>
                          <p className="text-gray-600 text-sm">{t('how_it_works_modal.step1_buyer_desc')}</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="font-bold text-emerald-600">2</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">{t('how_it_works_modal.step2_buyer_title')}</h4>
                          <p className="text-gray-600 text-sm">{t('how_it_works_modal.step2_buyer_desc')}</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="font-bold text-emerald-600">3</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">{t('how_it_works_modal.step3_buyer_title')}</h4>
                          <p className="text-gray-600 text-sm">{t('how_it_works_modal.step3_buyer_desc')}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <hr className="border-gray-200" />

                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      💰 {t('how_it_works_modal.sellers_title')}
                    </h3>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="font-bold text-teal-600">1</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">{t('how_it_works_modal.step1_seller_title')}</h4>
                          <p className="text-gray-600 text-sm">{t('how_it_works_modal.step1_seller_desc')}</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="font-bold text-teal-600">2</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">{t('how_it_works_modal.step2_seller_title')}</h4>
                          <p className="text-gray-600 text-sm">{t('how_it_works_modal.step2_seller_desc')}</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="font-bold text-teal-600">3</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">{t('how_it_works_modal.step3_seller_title')}</h4>
                          <p className="text-gray-600 text-sm">{t('how_it_works_modal.step3_seller_desc')}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <hr className="border-gray-200" />

                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                    <h3 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                      💡 {t('how_it_works_modal.pro_tips_title')}
                    </h3>
                    <ul className="text-sm text-amber-700 space-y-1">
                      {t('how_it_works_modal.pro_tips_list', { returnObjects: true }).map((tip, i) => (
                        <li key={i}>• {tip}</li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => setShowHowItWorks(false)}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition"
                  >
                    {t('how_it_works_modal.cta')}
                  </button>
                </div>
              </div>
            </div>
          )
        }

        {
          showAdminDashboard && (
            <Suspense fallback={<PageLoader />}>
              <AdminDashboard onClose={() => setShowAdminDashboard(false)} />
            </Suspense>
          )
        }
      </div >
    </NotificationProvider >
  );
}

// ========================================
// SCROLL TO TOP ON ROUTE CHANGE
// ========================================
const GuidesHubPage = React.lazy(() => import('./components/GuidesHubPage'));

function ScrollToTop() {
  const { pathname } = useLocation();
  const navType = useNavigationType();
  useEffect(() => {
    // Only scroll to top on PUSH (new navigation), not on POP (back/forward)
    if (navType !== 'POP') {
      window.scrollTo(0, 0);
    }
  }, [pathname, navType]);
  return null;
}

// ========================================
// EXPORT PAR DÉFAUT AVEC ROUTER
// ========================================
export default function KiwiVanMarket() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <SeoHead />
      <Routes>
        {/* ✅ SEO: Pages avec URLs propres pour le référencement */}
        <Route path="/van/:id" element={
          <Suspense fallback={<PageLoader />}>
            <VanPage />
          </Suspense>
        } />
        <Route path="/brand/:brand" element={
          <Suspense fallback={<PageLoader />}>
            <BrandPage />
          </Suspense>
        } />
        <Route path="/location/:location" element={
          <Suspense fallback={<PageLoader />}>
            <LocationPage />
          </Suspense>
        } />
        <Route path="/guides" element={
          <Suspense fallback={<PageLoader />}>
            <GuidesHubPage />
          </Suspense>
        } />
        <Route path="/guide/:slug" element={
          <Suspense fallback={<PageLoader />}>
            <GuidePage />
          </Suspense>
        } />
        <Route path="/sell" element={<SellPage />} />
        <Route path="/profile" element={
          <Suspense fallback={<PageLoader />}>
            <ProfilePage />
          </Suspense>
        } />
        <Route path="/my-listings" element={
          <Suspense fallback={<PageLoader />}>
            <MyListingsPage />
          </Suspense>
        } />
        <Route path="/buyback-calculator" element={
          <Suspense fallback={<PageLoader />}>
            <BuybackCalculator />
          </Suspense>
        } />
        <Route path="/messages" element={
          <Suspense fallback={<PageLoader />}>
            <MessagingPage onBack={() => window.history.back()} />
          </Suspense>
        } />

        {/* MVP_DISABLED: Reservations
        <Route path="/reservation-success" element={
          <Suspense fallback={<PageLoader />}>
            <ReservationSuccess />
          </Suspense>
        } />
        <Route path="/reservation-cancelled" element={
          <Suspense fallback={<PageLoader />}>
            <ReservationCancelled />
          </Suspense>
        } />
        */}
        <Route path="*" element={<MainApp />} />
      </Routes>
    </BrowserRouter>
  );
}