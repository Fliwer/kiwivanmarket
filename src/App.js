import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, MapPin, Calendar, Gauge, Users, Heart, Filter, ChevronDown, Star, Phone, Mail, Shield, Award, CheckCircle, X, Plus, TrendingUp, Zap, Clock, Facebook, Instagram, Twitter, AlertCircle, MessageCircle, Calculator, Settings, Menu, HelpCircle, CalendarCheck, ExternalLink, BookOpen } from 'lucide-react';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { useFavorites } from './hooks/useFavorites';
import { getThumbnail, getLargeImage } from './utils/imageOptimizer';
// MVP_DISABLED: Notifications
// import { NotificationProvider, useNotifications } from './components/NotificationSystem';
// import NotificationBell from './components/NotificationBell';

// ✅ COMPOSANTS CRITIQUES - Chargés immédiatement
import AuthModal from './components/AuthModal';
import Footer, { FAQModal } from './components/Footer';
import VanCard from './components/VanCard';
// MVP_DISABLED: Stripe/Payments
// import { TrustBanner } from './components/SecurityBadge';

// ✅ LAZY LOADING - Chargés uniquement quand nécessaires
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

// 📍 Liste des emails admin autorisés
const ADMIN_EMAILS = [
  'p.morthier@gmail.com',
];

// ✅ Calcule le nombre de jours depuis la création
const getDaysAgo = (createdAt) => {
  if (!createdAt) return 0;
  const created = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
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

// 🌐 Sélecteur de langue pour le header
function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');

  const languages = [
    { code: 'en', flag: 'https://flagcdn.com/24x18/gb.png', name: 'ENGLISH', short: 'EN' },
    { code: 'fr', flag: 'https://flagcdn.com/24x18/fr.png', name: 'FRANÇAIS', short: 'FR' },
    { code: 'de', flag: 'https://flagcdn.com/24x18/de.png', name: 'DEUTSCH', short: 'DE' },
    { code: 'es', flag: 'https://flagcdn.com/24x18/es.png', name: 'ESPAÑOL', short: 'ES' },
    { code: 'zh-CN', flag: 'https://flagcdn.com/24x18/cn.png', name: '简体中文', short: '中文' },
    { code: 'ja', flag: 'https://flagcdn.com/24x18/jp.png', name: '日本語', short: 'JA' },
    { code: 'ko', flag: 'https://flagcdn.com/24x18/kr.png', name: '한국어', short: 'KO' },
    { code: 'pt', flag: 'https://flagcdn.com/24x18/br.png', name: 'PORTUGUÊS', short: 'PT' },
    { code: 'th', flag: 'https://flagcdn.com/24x18/th.png', name: 'ไทย', short: 'TH' },
    { code: 'vi', flag: 'https://flagcdn.com/24x18/vn.png', name: 'TIẾNG VIỆT', short: 'VI' }
  ];

  const applyLanguage = useCallback((langCode) => {
    const domains = ['', '.' + window.location.hostname, '.kiwivanmarket.com'];
    domains.forEach(domain => {
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;${domain ? ' domain=' + domain + ';' : ''}`;
    });
    
    try {
      localStorage.removeItem('googtrans');
      sessionStorage.clear();
    } catch (e) {}

    const gtFrame = document.querySelector('.goog-te-banner-frame');
    if (gtFrame) gtFrame.remove();
    const gtElement = document.getElementById('google_translate_element');
    if (gtElement) gtElement.innerHTML = '';
    
    document.body.className = document.body.className.replace(/translated-[a-z]+/g, '');
    const html = document.documentElement;
    html.className = html.className.replace(/translated-[a-z]+/g, '');
    
    const oldScript = document.getElementById('google-translate-script');
    if (oldScript) oldScript.remove();
    
    document.querySelectorAll('iframe.goog-te-menu-frame, iframe.goog-te-banner-frame').forEach(el => el.remove());
    
    if (langCode === 'en') {
      setTimeout(() => {
        window.location.replace(window.location.pathname + '?lang=en&t=' + Date.now());
      }, 100);
      return;
    }

    const langCookie = `/en/${langCode}`;
    document.cookie = `googtrans=${langCookie}; path=/;`;
    document.cookie = `googtrans=${langCookie}; path=/; domain=.${window.location.hostname}`;
    
    setTimeout(() => {
      window.location.replace(window.location.pathname + '?lang=' + langCode + '&t=' + Date.now());
    }, 100);
  }, []);

  const changeLanguage = (langCode) => {
    setIsOpen(false);
    setCurrentLang(langCode);
    localStorage.setItem('preferredLang', langCode);
    applyLanguage(langCode);
  };

  useEffect(() => {
    const savedLang = localStorage.getItem('preferredLang') || 'en';
    setCurrentLang(savedLang);

    if (!document.getElementById('google-translate-script')) {
      const translateDiv = document.createElement('div');
      translateDiv.id = 'google_translate_element';
      translateDiv.style.display = 'none';
      document.body.appendChild(translateDiv);

      window.googleTranslateElementInit = function () {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'en,fr,de,es,zh-CN,ja,ko,pt,th,vi',
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false
          },
          'google_translate_element'
        );
      };

      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const currentLangData = languages.find((l) => l.code === currentLang) || languages[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition text-white text-sm font-semibold"
        title="Change language"
      >
        <img
          src={currentLangData.flag}
          alt={currentLangData.name}
          className="w-6 h-4 object-cover rounded-sm shadow-sm"
        />
        <span className="hidden sm:inline">{currentLangData.short}</span>
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

          <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 min-w-[180px] z-[101]">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition ${
                  currentLang === lang.code
                    ? 'bg-emerald-50 text-emerald-700 font-semibold'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <img
                  src={lang.flag}
                  alt={lang.name}
                  className="w-6 h-4 object-cover rounded-sm shadow-sm"
                />
                <span className="font-medium">{lang.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
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
    const savedCurrency = localStorage.getItem('kiwivanmarket_currency') || 'NZD';
    setCurrentCurrency(savedCurrency);
  }, []);

  const changeCurrency = (code) => {
    setIsOpen(false);
    setCurrentCurrency(code);
    localStorage.setItem('kiwivanmarket_currency', code);
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
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition ${
                  currentCurrency === code
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

// MVP_DISABLED: Notifications - MessageBadge uses useNotifications
// function MessageBadge() {
//   const { unreadCount } = useNotifications();
//   
//   if (unreadCount === 0) return null;
//   
//   return (
//     <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold border-2 border-white animate-pulse">
//       {unreadCount > 9 ? '9+' : unreadCount}
//     </span>
//   );
// }
function MessageBadge() {
  return null; // MVP_DISABLED: Notifications
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
  
  const isAdmin = currentUser && ADMIN_EMAILS.includes(currentUser.email);
  
  const [showFAQ, setShowFAQ] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  
  const [sortBy, setSortBy] = useState('newest');
  
  const [filters, setFilters] = useState({
    priceMin: 0,
    priceMax: 50000,
    yearMin: 1990,
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
    const savedCurrency = localStorage.getItem('kiwivanmarket_currency') || 'NZD';
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
        setLoading(true);
        
        const cachedData = localStorage.getItem('kiwiVanMarket_vans');
        const cacheTimestamp = localStorage.getItem('kiwiVanMarket_timestamp');
        
        if (cachedData) {
          const cachedVans = JSON.parse(cachedData);
          // Sort cache immediately (newest first)
          const sortedCache = [...cachedVans].sort((a, b) => {
            const getTs = (v) => {
              if (!v.createdAt) return 0;
              if (v.createdAt.seconds) return v.createdAt.seconds * 1000;
              if (typeof v.createdAt === 'string') return new Date(v.createdAt).getTime();
              return 0;
            };
            return getTs(b) - getTs(a);
          });
          setVans(sortedCache);
          setFilteredVans(sortedCache);
          setLoading(false);
        }
        
        const now = Date.now();
        const cacheAge = cacheTimestamp ? now - parseInt(cacheTimestamp) : Infinity;
        const CACHE_DURATION = 5 * 60 * 1000;
        
        if (cacheAge < CACHE_DURATION && cachedData) {
          return;
        }
        
        const querySnapshot = await getDocs(collection(db, 'vans'));
        const vansData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Sort before saving to cache (newest first)
        const sortedVans = [...vansData].sort((a, b) => {
          const getTs = (v) => {
            if (!v.createdAt) return 0;
            if (v.createdAt.toDate) return v.createdAt.toDate().getTime();
            if (v.createdAt.seconds) return v.createdAt.seconds * 1000;
            return 0;
          };
          return getTs(b) - getTs(a);
        });
        
        localStorage.setItem('kiwiVanMarket_vans', JSON.stringify(sortedVans));
        localStorage.setItem('kiwiVanMarket_timestamp', now.toString());
        
        setVans(sortedVans);
        setFilteredVans(sortedVans);
        
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
          if (!v.createdAt) return 0;
          if (v.createdAt.toDate) return v.createdAt.toDate().getTime();
          if (v.createdAt.seconds) return v.createdAt.seconds * 1000;
          return 0;
        };
        return getTs(b) - getTs(a);
      });
      
      localStorage.setItem('kiwiVanMarket_vans', JSON.stringify(sortedVans));
      localStorage.setItem('kiwiVanMarket_timestamp', Date.now().toString());
      
      setVans(sortedVans);
      setFilteredVans(sortedVans);
    } catch (error) {
      console.error('Error reloading vans:', error);
    }
  };

  useEffect(() => {
    let filtered = vans.filter(van => {
      const matchSearch = van.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          van.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          van.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchPrice = van.price >= filters.priceMin && van.price <= filters.priceMax;
      const matchYear = van.year >= filters.yearMin;
      const matchType = filters.type === 'all' || van.type === filters.type;
      const matchLocation = filters.location === 'all' || van.location === filters.location;
      const matchSelfContained = !filters.selfContained || van.selfContained;
      const matchBuyBack = !filters.buyBack || van.buyBack;
      const matchWofValid = !filters.wofValid || (van.wofExpiry && new Date(van.wofExpiry) > new Date());
      const matchRegoValid = !filters.regoValid || (van.regoExpiry && new Date(van.regoExpiry) > new Date());
      
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
      if (!van.createdAt) return 0;
      if (van.createdAt.toDate) return van.createdAt.toDate().getTime();
      if (van.createdAt.seconds) return van.createdAt.seconds * 1000;
      if (typeof van.createdAt === 'string') return new Date(van.createdAt).getTime();
      return 0;
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
    const seller = van.seller || { name: 'Unknown', rating: 5, email: '', phone: '' };
    
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
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-bold shadow-lg">
                    ✓ Self-Contained
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
                  <div className={`bg-white p-3 rounded-lg border text-center ${van.wofExpiry && new Date(van.wofExpiry).getTime() ? 'border-emerald-200' : 'border-gray-200'}`}>
                    <div className="text-[10px] text-gray-500 font-semibold uppercase mb-1">WOF Valid</div>
                    <div className={`text-lg font-bold ${van.wofExpiry && new Date(van.wofExpiry).getTime() ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {van.wofExpiry && new Date(van.wofExpiry).getTime() ? new Date(van.wofExpiry).toLocaleDateString('en-NZ', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Not specified'}
                    </div>
                  </div>
                  <div className={`bg-white p-3 rounded-lg border text-center ${van.regoExpiry && new Date(van.regoExpiry).getTime() ? 'border-blue-200' : 'border-gray-200'}`}>
                    <div className="text-[10px] text-gray-500 font-semibold uppercase mb-1">REGO Until</div>
                    <div className={`text-lg font-bold ${van.regoExpiry && new Date(van.regoExpiry).getTime() ? 'text-blue-600' : 'text-gray-400'}`}>
                      {van.regoExpiry && new Date(van.regoExpiry).getTime() ? new Date(van.regoExpiry).toLocaleDateString('en-NZ', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Not specified'}
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg border text-center ${van.selfContained ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="text-[10px] text-gray-500 font-semibold uppercase mb-1">Self-Contained</div>
                    <div className={`text-lg font-bold ${van.selfContained ? 'text-green-600' : 'text-gray-400'}`}>
                      {van.selfContained ? '✓ Yes' : '✗ No'}
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

  // Si page Buyback Calculator ouverte
  if (showBuybackCalculator) {
    return (
      <Suspense fallback={<PageLoader />}>
        <div className="min-h-screen relative">
          <header className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 text-white shadow-lg sticky top-0 z-30">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center justify-between h-16">
                <button 
                  onClick={() => setShowBuybackCalculator(false)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition text-white font-semibold"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="hidden sm:inline">Back to listings</span>
                </button>

                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => { setShowBuybackCalculator(false); setTimeout(() => currentUser ? setShowFavorites(true) : setShowAuthModal(true), 100); }}
                    className="relative flex flex-col items-center p-2.5 hover:bg-white/10 rounded-xl transition"
                  >
                    <Heart size={22} className={favoritesCount > 0 ? "text-red-400 fill-red-400" : "text-white"} />
                    <span className="text-[10px] text-white/80 hidden sm:block mt-0.5">Favorites</span>
                  </button>

                  <button 
                    onClick={() => { setShowBuybackCalculator(false); setTimeout(() => currentUser ? setShowMessagingPage(true) : setShowAuthModal(true), 100); }}
                    className="relative flex flex-col items-center p-2.5 hover:bg-white/10 rounded-xl transition"
                  >
                    <MessageCircle size={22} className="text-white" />
                    <span className="text-[10px] text-white/80 hidden sm:block mt-0.5">Messages</span>
                  </button>

                  {!currentUser ? (
                    <button 
                      onClick={() => setShowAuthModal(true)}
                      className="flex flex-col items-center p-2.5 hover:bg-white/10 rounded-xl transition"
                    >
                      <Users size={22} className="text-white" />
                      <span className="text-[10px] text-white/80 hidden sm:block mt-0.5">Sign in</span>
                    </button>
                  ) : (
                    <button 
                      onClick={() => { setShowBuybackCalculator(false); setShowUserMenu(true); }}
                      className="flex flex-col items-center p-2.5 hover:bg-white/10 rounded-xl transition"
                    >
                      <div className="w-6 h-6 bg-white text-emerald-600 rounded-full flex items-center justify-center text-xs font-bold">
                        {currentUser.displayName?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <span className="text-[10px] text-white/80 hidden sm:block mt-0.5">Profile</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </header>
          
          <BuybackCalculator />
          
          <AuthModal 
            isOpen={showAuthModal} 
            onClose={() => setShowAuthModal(false)} 
          />
        </div>
      </Suspense>
    );
  }

  // Si page messagerie ouverte
  if (showMessagingPage) {
    return (
      <Suspense fallback={<PageLoader />}>
        {/* MVP_DISABLED: Notifications - NotificationProvider removed */}
        <MessagingPage onBack={() => setShowMessagingPage(false)} />
      </Suspense>
    );
  }

  return (
    <> {/* MVP_DISABLED: Notifications - was NotificationProvider */}
      {/* SEO: Meta tags dynamiques pour la page d'accueil */}
      <Helmet>
        <title>Kiwi Van Market | Buy and Sell Campervans in New Zealand</title>
        <meta name="description" content="Buy and sell campervans in New Zealand. Find self contained vans, WOF and rego valid vehicles, Toyota Hiace, Nissan Caravan, Mazda Bongo, and buy back options for backpackers." />
        <link rel="canonical" href="https://kiwivanmarket.com/" />
        <meta property="og:url" content="https://kiwivanmarket.com/" />
      </Helmet>

      {/* WebViewWarning desactive - le site s'affiche directement */}
      <div className="min-h-screen bg-gray-50">

        {/* ========== ANNOUNCEMENT BANNER ========== */}
        <div
          className="bg-gradient-to-r from-orange-500 to-amber-500 text-white py-2 px-4 text-center text-sm font-medium cursor-pointer hover:from-orange-600 hover:to-amber-600 transition-all"
          onClick={() => currentUser ? setShowAddVanForm(true) : setShowAuthModal(true)}
        >
          🚐 Sell your van FOR FREE → List now
        </div>

        {/* ========== HEADER ========== */}
        <header className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 text-white shadow-lg sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              
              {/* Logo */}
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.href = '/'}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg overflow-hidden" style={{ backgroundColor: '#f7eedd' }}>
                  <img src="/kiwi-van-logo.png" alt="Kiwi Van Market" className="w-9 h-9 object-contain" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold">Kiwi Van Market</h1>
                  <p className="text-xs text-white/80">Buy & Sell Campervans 🇳🇿</p>
                </div>
              </div>

              {/* Boutons d'action - Desktop */}
              <div className="hidden md:flex items-center gap-3 ml-10">
                <Link
                  to="/guide/buying-campervan-nz"
                  className="bg-white/20 text-white px-3 py-2 rounded-xl font-semibold hover:bg-white/30 transition flex items-center gap-2 text-sm"
                >
                  <BookOpen size={18} />
                  <span className="hidden lg:inline">Guides</span>
                </Link>

                <button
                  onClick={() => setShowBuybackCalculator(true)}
                  className="bg-white/20 text-white px-3 py-2 rounded-xl font-semibold hover:bg-white/30 transition flex items-center gap-2 text-sm"
                >
                  <Calculator size={18} />
                  <span className="hidden lg:inline">Calculator</span>
                </button>

                <button
                  onClick={() => currentUser ? setShowAddVanForm(true) : setShowAuthModal(true)}
                  className="bg-white text-emerald-600 px-4 py-2 rounded-xl font-semibold hover:bg-emerald-50 transition flex items-center gap-2 text-sm shadow-md"
                >
                  <Plus size={18} />
                  <span>Sell your van</span>
                </button>
              </div>

              {/* Barre de recherche - Desktop */}
              <div className="hidden lg:flex flex-1 max-w-md mx-6">
                <div className="relative w-full">
                  <input 
                    type="text"
                    placeholder="Search campervans..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-4 pr-12 py-2.5 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl text-white placeholder-white/70 focus:bg-white focus:text-gray-800 focus:placeholder-gray-400 focus:border-white outline-none transition-all text-sm"
                  />
                  <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70" />
                </div>
              </div>

              {/* Navigation Icons - Desktop */}
              <div className="hidden md:flex items-center gap-1">
                {/* MVP_DISABLED: Currency selector
                <CurrencySelector />
                */}
                <LanguageSelector />
                
                {/* MVP_DISABLED: Notifications
                {currentUser && (
                  <NotificationBell 
                    user={currentUser} 
                    onNotificationClick={(notif) => {
                      if (notif.type === 'reservation_paid' || notif.type === 'payment_confirmed') {
                        setShowMyReservations(true);
                      }
                    }} 
                  />
                )}
                */}

                {/* MVP_DISABLED: Reservations
                {currentUser && (
                  <button 
                    onClick={() => setShowMyReservations(true)}
                    className="relative flex flex-col items-center p-2.5 hover:bg-white/10 rounded-xl transition"
                    title="My Reservations"
                  >
                    <CalendarCheck size={22} className="text-white" />
                    <span className="text-[10px] text-white/80 hidden sm:block mt-0.5">Bookings</span>
                  </button>
                )}
                */}
                
                <button 
                  onClick={() => currentUser ? setShowFavorites(true) : setShowAuthModal(true)}
                  className="relative flex flex-col items-center p-2.5 hover:bg-white/10 rounded-xl transition"
                >
                  <Heart size={22} className={favoritesCount > 0 ? "text-red-400 fill-red-400" : "text-white"} />
                  <span className="text-[10px] text-white/80 hidden sm:block mt-0.5">Favorites</span>
                </button>

                <button 
                  onClick={() => currentUser ? setShowMessagingPage(true) : setShowAuthModal(true)}
                  className="relative flex flex-col items-center p-2.5 hover:bg-white/10 rounded-xl transition"
                >
                  <MessageCircle size={22} className="text-white" />
                  <span className="text-[10px] text-white/80 hidden sm:block mt-0.5">Messages</span>
                  <MessageBadge />
                </button>

                {!currentUser ? (
                  <button 
                    onClick={() => setShowAuthModal(true)}
                    className="flex flex-col items-center p-2.5 hover:bg-white/10 rounded-xl transition"
                  >
                    <Users size={22} className="text-white" />
                    <span className="text-[10px] text-white/80 hidden sm:block mt-0.5">Sign in</span>
                  </button>
                ) : (
                  <div className="relative">
                    <button 
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex flex-col items-center p-2.5 hover:bg-white/10 rounded-xl transition"
                    >
                      <div className="w-6 h-6 bg-white text-emerald-600 rounded-full flex items-center justify-center text-xs font-bold">
                        {currentUser.displayName?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <span className="text-[10px] text-white/80 hidden sm:block mt-0.5">Profile</span>
                    </button>
                    
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl py-2 text-gray-700 border border-gray-100 z-50">
                        <div className="px-4 py-3 border-b bg-gray-50 rounded-t-xl">
                          <div className="font-semibold text-gray-900">{currentUser.displayName || 'User'}</div>
                          <div className="text-xs text-gray-500">{currentUser.email}</div>
                        </div>
                        <div className="py-1">
                          <a 
                            href="#"
                            onClick={(e) => { e.preventDefault(); setShowUserProfile(true); setShowUserMenu(false); }}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-emerald-50 transition">
                            <svg className="w-[18px] h-[18px] text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>My Profile</span>
                          </a>
                          <a 
                            href="#"
                            onClick={(e) => { e.preventDefault(); setShowMyVans(true); setShowUserMenu(false); }}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-emerald-50 transition">
                            <svg className="w-[18px] h-[18px] text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17 5H7c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h1c0 1.66 1.34 3 3 3s3-1.34 3-3h2c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2z"/>
                            </svg>
                            <span>My Listings</span>
                          </a>
                          {/* MVP_DISABLED: Reservations
                          <a 
                            href="#"
                            onClick={(e) => { e.preventDefault(); setShowMyReservations(true); setShowUserMenu(false); }}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-emerald-50 transition">
                            <CalendarCheck className="w-[18px] h-[18px] text-emerald-500" />
                            <span className="font-medium text-emerald-700">My Reservations</span>
                          </a>
                          */}
                          {isAdmin && (
                            <a 
                              href="#"
                              onClick={(e) => { e.preventDefault(); setShowAdminDashboard(true); setShowUserMenu(false); }}
                              className="flex items-center gap-3 px-4 py-2.5 hover:bg-purple-50 transition text-purple-700">
                              <Settings className="w-[18px] h-[18px]" />
                              <span className="font-semibold">Admin Dashboard</span>
                            </a>
                          )}
                        </div>
                        <div className="border-t">
                          <button 
                            onClick={() => { logout(); setShowUserMenu(false); }}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition w-full text-red-600">
                            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <div className="flex md:hidden items-center gap-1">
                <button 
                  onClick={() => currentUser ? setShowAddVanForm(true) : setShowAuthModal(true)}
                  className="bg-white text-emerald-600 p-2 rounded-xl"
                >
                  <Plus size={20} />
                </button>
                {/* MVP_DISABLED: Currency selector
                <CurrencySelector />
                */}
                <LanguageSelector />
                {/* MVP_DISABLED: Notifications
                {currentUser && (
                  <NotificationBell user={currentUser} />
                )}
                */}
                {/* MVP_DISABLED: Reservations
                {currentUser && (
                  <button 
                    onClick={() => setShowMyReservations(true)}
                    className="p-2 hover:bg-white/10 rounded-xl"
                    title="My Reservations"
                  >
                    <CalendarCheck size={20} className="text-white" />
                  </button>
                )}
                */}
                <button 
                  onClick={() => currentUser ? setShowFavorites(true) : setShowAuthModal(true)}
                  className="p-2 hover:bg-white/10 rounded-xl"
                >
                  <Heart size={20} className={favoritesCount > 0 ? "text-red-400 fill-red-400" : "text-white"} />
                </button>
                <button 
                  onClick={() => currentUser ? setShowMessagingPage(true) : setShowAuthModal(true)}
                  className="relative p-2 hover:bg-white/10 rounded-xl"
                >
                  <MessageCircle size={20} className="text-white" />
                  <MessageBadge />
                </button>
                <button 
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="p-2 hover:bg-white/10 rounded-xl"
                >
                  {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {showMobileMenu && (
              <div className="md:hidden border-t border-white/20 py-4 space-y-2">
                {/* CTA Mobile - Sell your van */}
                <button
                  onClick={() => { currentUser ? setShowAddVanForm(true) : setShowAuthModal(true); setShowMobileMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-white/20 rounded-xl transition font-semibold"
                >
                  <Plus size={20} />
                  <span>Sell your van</span>
                  <span className="ml-auto text-xs bg-orange-500 px-2 py-0.5 rounded-full">FREE</span>
                </button>

                <Link
                  to="/guide/buying-campervan-nz"
                  onClick={() => setShowMobileMenu(false)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-xl transition"
                >
                  <BookOpen size={20} />
                  <span>Guides</span>
                </Link>

                <button
                  onClick={() => { setShowBuybackCalculator(true); setShowMobileMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-xl transition"
                >
                  <Calculator size={20} />
                  <span>Buyback Calculator</span>
                </button>
                
                {!currentUser ? (
                  <button 
                    onClick={() => { setShowAuthModal(true); setShowMobileMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-xl transition"
                  >
                    <Users size={20} />
                    <span>Sign In</span>
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={() => { setShowUserProfile(true); setShowMobileMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-xl transition"
                    >
                      <Users size={20} />
                      <span>My Profile</span>
                    </button>
                    <button 
                      onClick={() => { setShowMyVans(true); setShowMobileMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-xl transition"
                    >
                      <MapPin size={20} />
                      <span>My Listings</span>
                    </button>
                    {/* MVP_DISABLED: Reservations
                    <button 
                      onClick={() => { setShowMyReservations(true); setShowMobileMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-xl transition text-emerald-300"
                    >
                      <CalendarCheck size={20} />
                      <span className="font-medium">My Reservations</span>
                    </button>
                    */}
                    {isAdmin && (
                      <button 
                        onClick={() => { setShowAdminDashboard(true); setShowMobileMenu(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-xl transition text-yellow-300"
                      >
                        <Settings size={20} />
                        <span>Admin Dashboard</span>
                      </button>
                    )}
                    <button 
                      onClick={() => { logout(); setShowMobileMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-300 hover:bg-white/10 rounded-xl transition"
                    >
                      <X size={20} />
                      <span>Sign Out</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </header>

        {/* MVP_DISABLED: Stripe/Payments - TrustBanner
        <TrustBanner />
        */}

        {/* ========== SEARCH MOBILE + FILTRES ========== */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            
            {/* Search Mobile */}
            <div className="lg:hidden mb-4">
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search campervans..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-100 border-2 border-transparent rounded-xl focus:border-emerald-500 focus:bg-white outline-none transition-all"
                />
              </div>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              
              <div className="grid grid-cols-2 md:flex md:items-center gap-2 md:gap-3 md:overflow-visible md:pb-0 md:flex-wrap">
                
                {/* Buy-Back */}
                <div 
                  className="relative w-full md:w-auto"
                  onMouseEnter={() => setShowBuyBackInfo(true)}
                  onMouseLeave={() => setShowBuyBackInfo(false)}
                >
                  <button 
                    onClick={() => setFilters({...filters, buyBack: !filters.buyBack})}
                    className={`w-full px-4 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 md:hover:scale-105 shadow-sm ${
                      filters.buyBack 
                        ? 'bg-green-500 text-white shadow-md' 
                        : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-green-400 hover:text-green-600'
                    }`}>
                    <Shield size={16} className={filters.buyBack ? 'text-white' : 'text-green-500'} />
                    Buy-Back
                    <span 
                      onClick={(e) => { e.stopPropagation(); setShowBuyBackInfo(!showBuyBackInfo); }}
                      className={`hidden md:flex w-5 h-5 rounded-full items-center justify-center text-xs font-bold transition-all ${
                        filters.buyBack ? 'bg-white/25 text-white hover:bg-white/40' : 'bg-gray-200 text-gray-500 hover:bg-green-100 hover:text-green-600'
                      }`}>?</span>
                  </button>
                  {showBuyBackInfo && (
                    <>
                      <div className="fixed inset-0 z-[99] md:hidden" onClick={() => setShowBuyBackInfo(false)} />
                      <div className="fixed left-4 right-4 top-48 md:absolute md:left-0 md:right-auto md:top-full md:mt-2 w-auto md:w-72 bg-gray-900 text-white text-sm p-4 rounded-xl shadow-2xl z-[100]">
                        <button onClick={() => setShowBuyBackInfo(false)} className="absolute top-2 right-2 text-gray-400 hover:text-white text-lg md:hidden">✕</button>
                        <div className="flex items-center gap-2 mb-2 pr-6 md:pr-0">
                          <Shield size={18} className="text-emerald-400" />
                          <span className="font-bold text-emerald-400">Buy-Back Guarantee</span>
                        </div>
                        <p className="text-gray-300 leading-relaxed text-sm md:text-xs">
                          The seller guarantees to buy back the van at an agreed price if you return it within the specified period. 
                          <span className="text-white font-semibold"> Perfect for backpackers!</span>
                        </p>
                        <div className="hidden md:block absolute left-6 -top-2 w-4 h-4 bg-gray-900 rotate-45"></div>
                      </div>
                    </>
                  )}
                </div>

                {/* REGO Valid */}
                <div 
                  className="relative w-full md:w-auto"
                  onMouseEnter={() => window.innerWidth >= 768 && setShowRegoInfo(true)}
                  onMouseLeave={() => setShowRegoInfo(false)}
                >
                  <button 
                    onClick={() => setFilters({...filters, regoValid: !filters.regoValid})}
                    className={`w-full px-4 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 md:hover:scale-105 shadow-sm ${
                      filters.regoValid 
                        ? 'bg-purple-500 text-white shadow-md' 
                        : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-purple-400 hover:text-purple-600'
                    }`}>
                    <CheckCircle size={16} className={filters.regoValid ? 'text-white' : 'text-purple-500'} />
                    REGO Valid
                    <span 
                      onClick={(e) => { e.stopPropagation(); setShowRegoInfo(!showRegoInfo); }}
                      className={`hidden md:flex w-5 h-5 rounded-full items-center justify-center text-xs font-bold transition-all ${
                        filters.regoValid ? 'bg-white/25 text-white hover:bg-white/40' : 'bg-gray-200 text-gray-500 hover:bg-purple-100 hover:text-purple-600'
                      }`}>?</span>
                  </button>
                  {showRegoInfo && (
                    <>
                      <div className="fixed inset-0 z-[99] md:hidden" onClick={() => setShowRegoInfo(false)} />
                      <div className="fixed left-4 right-4 top-48 md:absolute md:left-0 md:right-auto md:top-full md:mt-2 w-auto md:w-72 bg-gray-900 text-white text-sm p-4 rounded-xl shadow-2xl z-[100]">
                        <button onClick={() => setShowRegoInfo(false)} className="absolute top-2 right-2 text-gray-400 hover:text-white text-lg md:hidden">✕</button>
                        <div className="flex items-center gap-2 mb-2 pr-6 md:pr-0">
                          <span className="text-purple-400 font-bold">📋 Vehicle Registration (REGO)</span>
                        </div>
                        <p className="text-gray-300 leading-relaxed text-sm md:text-xs">
                          <span className="text-white font-semibold">Registration fee</span> that must be paid to legally drive on NZ roads. 
                          Can be bought in 3, 6 or 12 month periods at any PostShop or online.
                          <span className="text-white font-semibold"> Check the sticker on the windscreen!</span>
                        </p>
                        <div className="hidden md:block absolute left-6 -top-2 w-4 h-4 bg-gray-900 rotate-45"></div>
                      </div>
                    </>
                  )}
                </div>

                {/* Self-Contained */}
                <div 
                  className="relative w-full md:w-auto"
                  onMouseEnter={() => window.innerWidth >= 768 && setShowSelfContainedInfo(true)}
                  onMouseLeave={() => setShowSelfContainedInfo(false)}
                >
                  <button 
                    onClick={() => setFilters({...filters, selfContained: !filters.selfContained})}
                    className={`w-full px-4 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 md:hover:scale-105 shadow-sm ${
                      filters.selfContained 
                        ? 'bg-blue-500 text-white shadow-md' 
                        : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-400 hover:text-blue-600'
                    }`}>
                    <CheckCircle size={16} className={filters.selfContained ? 'text-white' : 'text-blue-500'} />
                    <span className="md:hidden">Self-Cont</span>
                    <span className="hidden md:inline">Self-Contained</span>
                    <span 
                      onClick={(e) => { e.stopPropagation(); setShowSelfContainedInfo(!showSelfContainedInfo); }}
                      className={`hidden md:flex w-5 h-5 rounded-full items-center justify-center text-xs font-bold transition-all ${
                        filters.selfContained ? 'bg-white/25 text-white hover:bg-white/40' : 'bg-gray-200 text-gray-500 hover:bg-blue-100 hover:text-blue-600'
                      }`}>?</span>
                  </button>
                  {showSelfContainedInfo && (
                    <>
                      <div className="fixed inset-0 z-[99] md:hidden" onClick={() => setShowSelfContainedInfo(false)} />
                      <div className="fixed left-4 right-4 top-48 md:absolute md:left-0 md:right-auto md:top-full md:mt-2 w-auto md:w-72 bg-gray-900 text-white text-sm p-4 rounded-xl shadow-2xl z-[100]">
                        <button onClick={() => setShowSelfContainedInfo(false)} className="absolute top-2 right-2 text-gray-400 hover:text-white text-lg md:hidden">✕</button>
                        <div className="flex items-center gap-2 mb-2 pr-6 md:pr-0">
                          <span className="text-blue-400 font-bold">🏕️ Self-Contained Certification</span>
                        </div>
                        <p className="text-gray-300 leading-relaxed text-sm md:text-xs">
                          A certified van with <span className="text-white font-semibold">toilet, fresh water & grey water tanks</span>. 
                          Required for freedom camping in most areas of NZ.
                        </p>
                        <div className="flex gap-3 mt-2 text-xs">
                          <span><span className="text-green-400 font-bold">🟢 Green</span> = fixed toilet</span>
                          <span><span className="text-blue-400 font-bold">🔵 Blue</span> = porta-potty</span>
                        </div>
                        <p className="text-white font-semibold text-sm md:text-xs mt-2">Essential for free camping!</p>
                        <div className="hidden md:block absolute left-6 -top-2 w-4 h-4 bg-gray-900 rotate-45"></div>
                      </div>
                    </>
                  )}
                </div>

                {/* WOF Valid */}
                <div 
                  className="relative w-full md:w-auto"
                  onMouseEnter={() => window.innerWidth >= 768 && setShowWofInfo(true)}
                  onMouseLeave={() => setShowWofInfo(false)}
                >
                  <button 
                    onClick={() => setFilters({...filters, wofValid: !filters.wofValid})}
                    className={`w-full px-4 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 md:hover:scale-105 shadow-sm ${
                      filters.wofValid 
                        ? 'bg-emerald-500 text-white shadow-md' 
                        : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-emerald-400 hover:text-emerald-600'
                    }`}>
                    <CheckCircle size={16} className={filters.wofValid ? 'text-white' : 'text-emerald-500'} />
                    <span className="md:hidden">WOF</span>
                    <span className="hidden md:inline">WOF Valid</span>
                    <span 
                      onClick={(e) => { e.stopPropagation(); setShowWofInfo(!showWofInfo); }}
                      className={`hidden md:flex w-5 h-5 rounded-full items-center justify-center text-xs font-bold transition-all ${
                        filters.wofValid ? 'bg-white/25 text-white hover:bg-white/40' : 'bg-gray-200 text-gray-500 hover:bg-emerald-100 hover:text-emerald-600'
                      }`}>?</span>
                  </button>
                  {showWofInfo && (
                    <>
                      <div className="fixed inset-0 z-[99] md:hidden" onClick={() => setShowWofInfo(false)} />
                      <div className="fixed left-4 right-4 top-48 md:absolute md:left-0 md:right-auto md:top-full md:mt-2 w-auto md:w-72 bg-gray-900 text-white text-sm p-4 rounded-xl shadow-2xl z-[100]">
                        <button onClick={() => setShowWofInfo(false)} className="absolute top-2 right-2 text-gray-400 hover:text-white text-lg md:hidden">✕</button>
                        <div className="flex items-center gap-2 mb-2 pr-6 md:pr-0">
                          <span className="text-emerald-400 font-bold">🔧 Warrant of Fitness (WOF)</span>
                        </div>
                        <p className="text-gray-300 leading-relaxed text-sm md:text-xs">
                          A <span className="text-white font-semibold">safety inspection</span> required every 6-12 months for all vehicles in NZ. 
                          It checks brakes, lights, tyres, steering and other safety features.
                          <span className="text-white font-semibold"> You can't legally drive without a valid WOF!</span>
                        </p>
                        <div className="hidden md:block absolute left-6 -top-2 w-4 h-4 bg-gray-900 rotate-45"></div>
                      </div>
                    </>
                  )}
                </div>

                {(filters.selfContained || filters.buyBack || filters.wofValid || filters.regoValid) && (
                  <button 
                    onClick={() => setFilters({...filters, selfContained: false, buyBack: false, wofValid: false, regoValid: false})}
                    className="px-3 py-2 rounded-full text-sm font-semibold text-red-500 hover:bg-red-50 transition flex items-center gap-1">
                    <X size={14} />
                    Clear
                  </button>
                )}
              </div>

              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition flex items-center gap-2 ${
                  showFilters 
                    ? 'bg-gray-200 text-gray-600 hover:bg-gray-300' 
                    : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-md'
                }`}>
                <Filter size={16} />
                {showFilters ? 'Hide Filters' : 'Filters'}
                <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Panel Filtres Expandable */}
            {showFilters && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-5">
                  
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                      🔍 Find your perfect campervan
                    </h3>
                    {(Object.values(filters.equipment).some(v => v) || filters.priceMin > 0 || filters.priceMax < 50000 || filters.yearMin > 1990 || filters.location !== 'all' || filters.type !== 'all') && (
                      <button
                        onClick={() => setFilters({
                          ...filters,
                          priceMin: 0,
                          priceMax: 50000,
                          yearMin: 1990,
                          location: 'all',
                          type: 'all',
                          equipment: {
                            doubleBed: false, fridge: false, gasStove: false, sink: false, toilet: false,
                            solarPanel: false, leisureBattery: false, heater: false, dieselHeater: false, 
                            shower: false, insulation: false, surfRack: false
                          }
                        })}
                        className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 px-3 py-1.5 hover:bg-red-50 rounded-lg transition"
                      >
                        <X size={14} />
                        Reset
                      </button>
                    )}
                  </div>

                  {/* Price Range & Year */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Price Range
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                          <input 
                            type="number" 
                            min="0" 
                            max={filters.priceMax}
                            step="1000"
                            value={filters.priceMin}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              if (val <= filters.priceMax) {
                                setFilters({...filters, priceMin: val});
                              }
                            }}
                            placeholder="Min"
                            className="w-full pl-7 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm font-medium"
                          />
                        </div>
                        <span className="text-gray-400 font-medium">to</span>
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                          <input 
                            type="number" 
                            min={filters.priceMin}
                            max="100000"
                            step="1000"
                            value={filters.priceMax}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 50000;
                              if (val >= filters.priceMin) {
                                setFilters({...filters, priceMax: val});
                              }
                            }}
                            placeholder="Max"
                            className="w-full pl-7 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm font-medium"
                          />
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1.5">
                        <span>NZ${filters.priceMin.toLocaleString()} - ${filters.priceMax.toLocaleString()}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Min Year: <span className="text-emerald-600 font-bold">{filters.yearMin}</span>
                      </label>
                      <input 
                        type="range" 
                        min="1990" 
                        max="2024" 
                        step="1"
                        value={filters.yearMin}
                        onChange={(e) => setFilters({...filters, yearMin: parseInt(e.target.value)})}
                        className="w-full accent-emerald-500 h-2 rounded-lg"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>1990</span>
                        <span>2024</span>
                      </div>
                    </div>
                  </div>

                  {/* Location & Type */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                      <select 
                        value={filters.location}
                        onChange={(e) => setFilters({...filters, location: e.target.value})}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm font-medium">
                        <option value="all">🇳🇿 All New Zealand</option>
                        <optgroup label="── North Island ──">
                          <option value="Auckland">📍 Auckland</option>
                          <option value="Wellington">📍 Wellington</option>
                          <option value="Hamilton">📍 Hamilton</option>
                          <option value="Tauranga">📍 Tauranga</option>
                          <option value="Rotorua">📍 Rotorua</option>
                        </optgroup>
                        <optgroup label="── South Island ──">
                          <option value="Christchurch">📍 Christchurch</option>
                          <option value="Queenstown">📍 Queenstown</option>
                          <option value="Dunedin">📍 Dunedin</option>
                        </optgroup>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Vehicle Type</label>
                      <select 
                        value={filters.type}
                        onChange={(e) => setFilters({...filters, type: e.target.value})}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm font-medium">
                        <option value="all">🚐 All Types</option>
                        <option value="Car">🚗 Car</option>
                        <option value="Van">🚐 Van</option>
                        <option value="Motorhome">🚌 Motorhome</option>
                      </select>
                    </div>
                  </div>

                  {/* Equipment filters */}
                  <details className="group">
                    <summary className="cursor-pointer list-none">
                      <div className="flex items-center justify-between py-2 border-t border-gray-200">
                        <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          🔧 Equipment
                          {Object.values(filters.equipment).some(v => v) && (
                            <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                              {Object.values(filters.equipment).filter(v => v).length} selected
                            </span>
                          )}
                        </span>
                        <ChevronDown size={18} className="text-gray-500 transition-transform group-open:rotate-180" />
                      </div>
                    </summary>
                    <div className="pt-3 pb-1">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                        {[
                          { key: 'doubleBed', emoji: '🛏️', label: 'Double Bed' },
                          { key: 'fridge', emoji: '🧊', label: 'Fridge' },
                          { key: 'gasStove', emoji: '🔥', label: 'Gas Stove' },
                          { key: 'sink', emoji: '🚰', label: 'Sink' },
                          { key: 'toilet', emoji: '🚽', label: 'Toilet' },
                          { key: 'shower', emoji: '🚿', label: 'Shower' },
                          { key: 'solarPanel', emoji: '☀️', label: 'Solar Panel' },
                          { key: 'leisureBattery', emoji: '🔋', label: 'Battery' },
                          { key: 'heater', emoji: '🌡️', label: 'Heater' },
                          { key: 'dieselHeater', emoji: '🔥', label: 'Diesel Heater' },
                          { key: 'insulation', emoji: '🧥', label: 'Insulated' },
                          { key: 'surfRack', emoji: '🏄', label: 'Surf/Bike Rack' },
                        ].map(item => (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() => setFilters({
                              ...filters, 
                              equipment: {
                                ...filters.equipment, 
                                [item.key]: !filters.equipment[item.key]
                              }
                            })}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                              filters.equipment[item.key]
                                ? 'bg-emerald-500 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700'
                            }`}
                          >
                            <span>{item.emoji}</span>
                            <span className="text-xs">{item.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </details>

                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========== RÉSULTATS ========== */}
        <div className="max-w-7xl mx-auto px-4 py-6">

          {!loading && (
            <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-xl font-bold text-gray-800">
                {filteredVans.length} {filteredVans.length === 1 ? 'van' : 'vans'} available
              </p>
              <div className="flex items-center gap-3">
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    ✕ Clear search
                  </button>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 hidden sm:inline">Sort by:</span>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="newest">🆕 Newest first</option>
                    <option value="price-asc">💰 Price: Low to High</option>
                    <option value="price-desc">💎 Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600 mb-4"></div>
              <p className="text-xl text-gray-600 font-semibold">Loading vans...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVans.map(van => (
                  <VanCard key={van.id} van={van} formatPrice={formatPrice} />
                ))}
              </div>

              {filteredVans.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-2xl font-bold text-gray-400 mb-2">No vans found</p>
                  <p className="text-gray-500">Try adjusting your filters or search term</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* How It Works */}
        <div className="bg-white py-16 mt-12">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search size={32} className="text-emerald-600" />
                </div>
                <h3 className="font-bold text-xl mb-2">1. Search & Filter</h3>
                <p className="text-gray-600">Browse our wide selection of campervans and use filters to find your perfect match</p>
              </div>
              <div className="text-center">
                <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone size={32} className="text-emerald-600" />
                </div>
                <h3 className="font-bold text-xl mb-2">2. Contact Seller</h3>
                <p className="text-gray-600">Connect directly with verified sellers and arrange a viewing</p>
              </div>
              <div className="text-center">
                <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-emerald-600" />
                </div>
                <h3 className="font-bold text-xl mb-2">3. Buy with Confidence</h3>
                <p className="text-gray-600">All vans are WOF verified with optional buy-back guarantee</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <Suspense fallback={null}>
          <HomeSeoSection />
        </Suspense>

        <Footer 
          onOpenFAQ={() => setShowFAQ(true)} 
          onOpenTerms={() => setShowTerms(true)} 
        />

        {/* Modals */}
        {selectedVan && <VanDetailsModal van={selectedVan} />}
        
        {showAddVanForm && (
          <Suspense fallback={<PageLoader />}>
            <AddVanForm 
              onClose={() => setShowAddVanForm(false)} 
              onVanAdded={refreshVans}
            />
          </Suspense>
        )}
        
        {showMyVans && (
          <Suspense fallback={<PageLoader />}>
            <MyVans onClose={() => setShowMyVans(false)} />
          </Suspense>
        )}

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
        
        {showFavorites && (
          <Suspense fallback={<PageLoader />}>
            <FavoritesPage 
              onClose={() => setShowFavorites(false)}
              onVanClick={(van) => setSelectedVan(van)}
            />
          </Suspense>
        )}
        
        {showUserProfile && (
          <Suspense fallback={<PageLoader />}>
            <UserProfile onClose={() => setShowUserProfile(false)} />
          </Suspense>
        )}
        
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
        
        <FAQModal 
          isOpen={showFAQ} 
          onClose={() => setShowFAQ(false)} 
        />
        
        {showTerms && (
          <Suspense fallback={<PageLoader />}>
            <TermsOfServiceModal 
              isOpen={showTerms} 
              onClose={() => setShowTerms(false)} 
            />
          </Suspense>
        )}

        {showHowItWorks && (
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
                  How it works
                </h2>
                <p className="text-emerald-100 mt-1">Buy or sell your campervan in 3 simple steps</p>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    🔍 For Buyers
                  </h3>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="font-bold text-emerald-600">1</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">Browse & Filter</h4>
                        <p className="text-gray-600 text-sm">Search campervans by location, price, features. Use filters like Self-Contained, Buy-Back guarantee, WOF/REGO validity.</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="font-bold text-emerald-600">2</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">Contact the Seller</h4>
                        <p className="text-gray-600 text-sm">Found the perfect van? Send a message directly to the seller to arrange a viewing or ask questions.</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="font-bold text-emerald-600">3</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">Meet & Buy</h4>
                        <p className="text-gray-600 text-sm">Meet the seller, inspect the van, check WOF/REGO papers, and complete the transaction safely.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="border-gray-200" />

                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    💰 For Sellers
                  </h3>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="font-bold text-teal-600">1</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">Create your listing</h4>
                        <p className="text-gray-600 text-sm">Click "Sell your van", add photos, describe your campervan, set your price. It's 100% free!</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="font-bold text-teal-600">2</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">Get contacted</h4>
                        <p className="text-gray-600 text-sm">Interested buyers will message you directly. Respond quickly to increase your chances of selling!</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="font-bold text-teal-600">3</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">Sell & Get Paid</h4>
                        <p className="text-gray-600 text-sm">Meet the buyer, finalize the sale, and enjoy your payment. Don't forget to mark your listing as sold!</p>
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="border-gray-200" />

                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                  <h3 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                    💡 Pro Tips for Backpackers
                  </h3>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• Look for <strong>Self-Contained</strong> vans to freedom camp legally</li>
                    <li>• Check <strong>WOF</strong> (safety) and <strong>REGO</strong> (registration) expiry dates</li>
                    <li>• <strong>Buy-Back</strong> guarantee = seller buys it back when you leave NZ</li>
                    <li>• Use our <strong>Buyback Calculator</strong> to estimate your costs</li>
                  </ul>
                </div>

                <button 
                  onClick={() => setShowHowItWorks(false)}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition"
                >
                  Got it! Start browsing 🚐
                </button>
              </div>
            </div>
          </div>
        )}

        {showAdminDashboard && (
          <Suspense fallback={<PageLoader />}>
            <AdminDashboard onClose={() => setShowAdminDashboard(false)} />
          </Suspense>
        )}
      </div>
    </> /* MVP_DISABLED: was </NotificationProvider> */
  );
}

// ========================================
// EXPORT PAR DÉFAUT AVEC ROUTER
// ========================================
export default function KiwiVanMarket() {
  return (
    <BrowserRouter>
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
        <Route path="/guide/:slug" element={
          <Suspense fallback={<PageLoader />}>
            <GuidePage />
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