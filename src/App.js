import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { BrowserRouter, Routes, Route, useNavigate, Link, useLocation, useNavigationType } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, MapPin, Calendar, Gauge, Users, Heart, Filter, ChevronDown, Star, Phone, Mail, Shield, Award, CheckCircle, X, Plus, TrendingUp, Zap, Clock, Instagram, Twitter, AlertCircle, MessageCircle, Calculator, Settings, Menu, HelpCircle, CalendarCheck, ExternalLink, BookOpen, Share2, ArrowRight } from 'lucide-react';
import { db } from './firebase';
import { collection, getDocs, doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { useFavorites } from './hooks/useFavorites';
import { useHideLoader } from './hooks/useHideLoader';
import { useAutoTranslate } from './hooks/useAutoTranslate';
import { usePageTracking } from './hooks/usePageTracking';
import { getThumbnail, getLargeImage } from './utils/imageOptimizer';
import { formatWhatsAppNumber } from './utils/formatHelper';
import { NotificationProvider, useNotifications } from './components/NotificationSystem';
import NotificationBell from './components/NotificationBell';
import SeoHead from './components/SeoHead';
import ToastProvider from './components/ToastProvider';
import Header from './components/Header';
import { CURRENCIES } from './components/CurrencySelector';
import QuickFilters from './components/QuickFilters';
import Listings from './components/Listings';
import EquipmentBadges from './components/EquipmentBadges';

// ✅ COMPOSANTS CRITIQUES - Chargés immédiatement
import AuthModal from './components/AuthModal';
import safeStorage, { safeSessionStorage } from './utils/safeStorage';
import lazyWithReload from './utils/lazyWithReload';
import { safeDate } from './utils/dateHelper';
import Footer, { FAQModal } from './components/Footer';
import VanCard from './components/VanCard';
import GuidePreviewSection from './components/GuidePreviewSection';
import HeroGuideCard from './components/HeroGuideCard';
import BottomNavigation from './components/BottomNavigation';
import { FEATURED_LONG_TAIL_SLUGS, LONG_TAIL_PAGE_MAP } from './constants/seoLongTailPages';

// ✅ LAZY LOADING
const SellPage = lazyWithReload(() => import('./components/SellPage'));
const AddVanForm = lazyWithReload(() => import('./components/AddVanForm'));
const MyVans = lazyWithReload(() => import('./components/MyVans'));
const FavoritesPage = lazyWithReload(() => import('./components/FavoritesPage'));
const MessagingPage = lazyWithReload(() => import('./components/MessagingPage'));
const BuybackCalculator = lazyWithReload(() => import('./components/BuybackCalculator'));
const UserProfile = lazyWithReload(() => import('./components/UserProfile'));
const AdminDashboard = lazyWithReload(() => import('./components/AdminDashboard'));
const TermsOfServiceModal = lazyWithReload(() => import('./components/TermsOfService').then(m => ({ default: m.TermsOfServiceModal })));
const HomeSeoSection = lazyWithReload(() => import('./components/HomeSeoSection'));
const QuickMessageBox = lazyWithReload(() => import('./components/QuickMessageBox'));
const VanPage = lazyWithReload(() => import('./components/VanPage'));
const BrandPage = lazyWithReload(() => import('./components/BrandPage'));
const LocationPage = lazyWithReload(() => import('./components/LocationPage'));
const GuidePage = lazyWithReload(() => import('./components/GuidePage'));
const ContactPage = lazyWithReload(() => import('./components/ContactPage'));
const ProfilePage = lazyWithReload(() => import('./components/ProfilePage'));
const MyListingsPage = lazyWithReload(() => import('./components/MyListingsPage'));
const GuidesHubPage = lazyWithReload(() => import('./components/GuidesHubPage'));
const FaqPage = lazyWithReload(() => import('./components/FaqPage'));
const WhyPage = lazyWithReload(() => import('./components/WhyPage'));
const SeoLongTailPage = lazyWithReload(() => import('./components/SeoLongTailPage'));
const SeoTopicFaqPage = lazyWithReload(() => import('./components/SeoTopicFaqPage'));


// ✅ LOADING COMPONENTS
const LoadingSpinner = ({ text }) => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mb-3"></div>
        <p className="text-gray-500 text-sm">{text ?? t('common.loading')}</p>
      </div>
    </div>
  );
};

const PageLoader = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-50 rounded-full blur-[120px] opacity-40 animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-50 rounded-full blur-[120px] opacity-40 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      <div className="relative z-10 flex flex-col items-center max-w-sm w-full px-6">
        <div className="relative mb-12">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-600/5 border border-slate-50 animate-scale-in">
            <img src="/kiwi-van-logo-48.webp" alt="Kiwi Van Market" className="w-12 h-12 object-contain animate-float" />
          </div>
          <div className="absolute inset-0 rounded-3xl border border-emerald-500/10 animate-ping shadow-xl shadow-emerald-500/5" style={{ animationDuration: '3s' }}></div>
        </div>
        <div className="text-center w-full space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              KiwiVan <span className="text-emerald-600">Market</span>
            </h2>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] italic">Aventure in NZ</p>
          </div>
          <div className="relative w-full h-1 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: "0%", x: "-100%" }}
              animate={{ width: "30%", x: "400%" }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="absolute top-0 h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
            />
          </div>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest animate-pulse">{t('common.loading')}...</p>
        </div>
      </div>
      <div className="absolute bottom-12 text-slate-300 text-[10px] font-black tracking-[0.4em] uppercase">Premium Marketplace</div>
    </div>
  );
};

const getDaysAgo = (createdAt) => {
  const created = safeDate(createdAt);
  if (!created) return 0;
  const now = new Date();
  const diffTime = Math.abs(now - created);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

function MainApp({
  searchTerm,
  setSearchTerm,
  showFavorites,
  setShowFavorites,
  showAuthModal,
  setShowAuthModal,
  showMessagingPage,
  setShowMessagingPage,
  showBuybackCalculator,
  setShowBuybackCalculator,
  showUserMenu,
  setShowUserMenu,
  showMobileMenu,
  setShowMobileMenu,
  showUserProfile,
  setShowUserProfile,
  showAdminDashboard,
  setShowAdminDashboard
}) {
  useHideLoader();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  
  // Synchronous initial loading from session/local storage for instant scroll restoration!
  const getInitialVans = () => {
    try {
      const cached = safeStorage.getItem('kiwiVanMarket_vans');
      return cached ? JSON.parse(cached) : [];
    } catch { return []; }
  };
  const initializedVans = getInitialVans();

  const [vans, setVans] = useState(initializedVans);
  const [filteredVans, setFilteredVans] = useState(initializedVans);
  const [selectedVan, setSelectedVan] = useState(null);
  const [currency, setCurrency] = useState('NZD');
  const [loading, setLoading] = useState(initializedVans.length === 0);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [listingsPage, setListingsPage] = useState(1);

  // Barre de recherche du hero (pattern marketplace : l'action au 1er regard)
  const [heroQuery, setHeroQuery] = useState('');
  const [heroBudget, setHeroBudget] = useState('');
  const handleHeroSearch = (e) => {
    e.preventDefault();
    setSearchTerm(heroQuery.trim());
    const max = parseInt(heroBudget, 10);
    setFilters(prev => ({ ...prev, priceMax: Number.isFinite(max) && max > 0 ? max : 500000 }));
    document.getElementById('listings-start')?.scrollIntoView({ behavior: 'smooth' });
  };

  const [filters, setFilters] = useState({
    priceMin: 0,
    priceMax: 500000,
    yearMin: 1980,
    type: 'all',
    location: 'all',
    brand: 'all',
    mileageMax: 0,
    capacityMin: 0,
    selfContained: false,
    buyBack: false,
    wofValid: false,
    regoValid: false,
    equipment: {
      doubleBed: false, fridge: false, gasStove: false, sink: false, toilet: false,
      solarPanel: false, leisureBattery: false, heater: false, dieselHeater: false,
      shower: false, insulation: false, surfRack: false
    }
  });

  const [infoModals, setInfoModals] = useState({
    buyBack: false, wof: false, rego: false, selfContained: false
  });
  const featuredSearchPages = FEATURED_LONG_TAIL_SLUGS
    .map((slug) => LONG_TAIL_PAGE_MAP[slug])
    .filter(Boolean);

  useEffect(() => {
    const savedCurrency = safeStorage.getItem('kiwivanmarket_currency') || 'NZD';
    setCurrency(savedCurrency);
    const handleCurrencyChange = (e) => setCurrency(e.detail);
    window.addEventListener('currencyChange', handleCurrencyChange);
    return () => window.removeEventListener('currencyChange', handleCurrencyChange);
  }, []);

  useEffect(() => {
    const fetchVans = async () => {
      try {
        let currentVans = getInitialVans();

        if (currentVans.length === 0) setLoading(true);

        const cacheTimestamp = safeStorage.getItem('kiwiVanMarket_timestamp');
        const now = Date.now();
        const cacheAge = cacheTimestamp ? now - parseInt(cacheTimestamp) : Infinity;
        if (currentVans.length > 0 && cacheAge < 30000) { setLoading(false); return; }

        const querySnapshot = await getDocs(collection(db, 'vans'));
        const vansData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const sortedVans = [...vansData].sort((a, b) => (safeDate(b.createdAt)?.getTime() || 0) - (safeDate(a.createdAt)?.getTime() || 0));

        if (currentVans.length === 0 || JSON.stringify(sortedVans) !== JSON.stringify(currentVans)) {
          safeStorage.setItem('kiwiVanMarket_vans', JSON.stringify(sortedVans));
          safeStorage.setItem('kiwiVanMarket_timestamp', now.toString());
          setVans(sortedVans);
          setFilteredVans(sortedVans);
        }
      } catch (error) { console.error('Error loading vans:', error); }
      finally { setLoading(false); }
    };
    fetchVans();
  }, []);

  useEffect(() => {
    const BRAND_KEYWORDS = {
      toyota: ['toyota', 'hiace', 'estima', 'regius', 'townace', 'liteace', 'hilux', 'granvia'],
      nissan: ['nissan', 'caravan', 'serena', 'elgrand', 'vanette', 'nv200', 'homy'],
      mazda: ['mazda', 'bongo', 'e2000', 'e2500'],
      mitsubishi: ['mitsubishi', 'delica', 'l300', 'express'],
      ford: ['ford', 'transit', 'econovan'],
      mercedes: ['mercedes', 'sprinter', 'benz', 'vito'],
      hyundai: ['hyundai', 'iload', 'imax', 'h1', 'h100'],
      volkswagen: ['volkswagen', 'vw ', 'transporter', 'kombi', 'caddy', 'crafter'],
    };
    const brandKw = filters.brand && filters.brand !== 'all' ? (BRAND_KEYWORDS[filters.brand] || [filters.brand]) : null;
    let filtered = vans.filter(van => {
      if (van.status && van.status !== 'active' && van.status !== 'sold') return false;
      const matchSearch = !searchTerm || [van.title, van.location, van.description].some(s => s?.toLowerCase().includes(searchTerm.toLowerCase()));
      const price = van.price || 0;
      const matchPrice = price >= filters.priceMin && price <= filters.priceMax;
      const matchYear = (van.year || 2000) >= filters.yearMin;
      const matchType = filters.type === 'all' || van.type === filters.type;
      const matchLocation = filters.location === 'all' || van.location === filters.location;
      const matchBrand = !brandKw || brandKw.some(k => (van.title || '').toLowerCase().includes(k));
      const matchMileage = !filters.mileageMax || (van.mileage || 0) <= filters.mileageMax;
      const matchCapacity = !filters.capacityMin || (van.capacity || 0) >= filters.capacityMin;
      const matchSelfContained = !filters.selfContained || van.selfContained;
      const matchBuyBack = !filters.buyBack || van.buyBack;
      const matchWofValid = !filters.wofValid || (van.wofExpiry && safeDate(van.wofExpiry) > new Date());
      const matchRegoValid = !filters.regoValid || (van.regoExpiry && safeDate(van.regoExpiry) > new Date());
      const matchEquipment = Object.entries(filters.equipment).every(([k, v]) => {
        if (!v) return true;
        if (k === 'shower') return van.equipment?.outdoorShower || van.equipment?.indoorShower;
        if (k === 'surfRack') return van.equipment?.surfRack || van.equipment?.bikeRack;
        if (k === 'heater') return van.equipment?.heater || van.equipment?.dieselHeater;
        return van.equipment?.[k] === true;
      });
      return matchSearch && matchPrice && matchYear && matchType && matchLocation && matchBrand && matchMileage && matchCapacity && matchSelfContained && matchBuyBack && matchWofValid && matchRegoValid && matchEquipment;
    });

    filtered.sort((a, b) => {
      const statusOrder = (a.status === 'sold' ? 1 : 0) - (b.status === 'sold' ? 1 : 0);
      if (statusOrder !== 0) return statusOrder;
      const getTs = v => safeDate(v.createdAt)?.getTime() || 0;
      if (sortBy === 'price-asc') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price-desc') return (b.price || 0) - (a.price || 0);
      return getTs(b) - getTs(a);
    });

    setFilteredVans(filtered);
  }, [searchTerm, filters, vans, sortBy]);

  const formatPrice = (price) => {
    const curr = CURRENCIES[currency] || CURRENCIES.NZD;
    return `${Math.round((price || 0) * curr.rate).toLocaleString()} ${curr.symbol}`;
  };

  const VanDetailsModal = ({ van }) => {
    const images = (van.images?.length > 0) ? van.images : (van.imageUrl ? [van.imageUrl] : ['https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=800']);
    const seller = van.seller || { name: 'Unknown' };
    const { translatedText: translatedTitle } = useAutoTranslate(van.title);
    const { translatedText: translatedDescription } = useAutoTranslate(van.description);

    const nextImage = () => setCurrentImageIndex(p => (p + 1) % images.length);
    const prevImage = () => setCurrentImageIndex(p => (p - 1 + images.length) % images.length);

    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] overflow-y-auto p-4" onClick={() => setSelectedVan(null)}>
        <div className="bg-white w-full max-w-7xl rounded-3xl overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
          <button onClick={() => setSelectedVan(null)} className="absolute top-6 right-6 z-50 bg-white/90 p-2 rounded-full shadow-lg"><X size={24} /></button>
          <div className="grid lg:grid-cols-2">
            <div className="relative bg-black h-[400px] lg:h-[700px] flex items-center justify-center">
              <img src={getLargeImage(images[currentImageIndex])} alt={translatedTitle} className="max-w-full max-h-full object-contain" />
              {images.length > 1 && (
                <>
                  <button onClick={prevImage} className="absolute left-4 bg-white/90 p-2 rounded-full shadow-lg"><ChevronDown className="rotate-90" /></button>
                  <button onClick={nextImage} className="absolute right-4 bg-white/90 p-2 rounded-full shadow-lg"><ChevronDown className="-rotate-90" /></button>
                </>
              )}
            </div>
            <div className="p-8 lg:p-12 overflow-y-auto max-h-[700px]">
              <h2 className="text-4xl font-black mb-4">{translatedTitle}</h2>
              <div className="flex gap-2 text-gray-600 mb-6"><MapPin size={20} /> {van.location}</div>
              <div className="bg-emerald-50 p-6 rounded-2xl border-2 border-emerald-100 mb-8">
                <span className="text-sm font-bold text-emerald-600 uppercase">Price</span>
                <div className="text-5xl font-black text-emerald-700">{formatPrice(van.price)}</div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-50 p-4 rounded-xl border">
                  <Calendar size={20} className="text-emerald-600 mb-2" />
                  <div className="text-xs text-gray-500 font-bold uppercase">Year</div>
                  <div className="text-xl font-bold">{van.year || 'N/A'}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border">
                  <Gauge size={20} className="text-emerald-600 mb-2" />
                  <div className="text-xs text-gray-500 font-bold uppercase">Km</div>
                  <div className="text-xl font-bold">{(van.mileage || 0).toLocaleString()}</div>
                </div>
              </div>
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">{translatedDescription}</p>
              </div>
              {van.equipment && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-4">Equipment</h3>
                  <EquipmentBadges equipment={van.equipment} />
                </div>
              )}
              <div className="bg-gray-100 p-6 rounded-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold">{seller.name?.[0]}</div>
                  <div>
                    <div className="font-bold">{seller.name}</div>
                    <div className="text-sm text-gray-500">Private Seller</div>
                  </div>
                </div>

                {/* Premium Contact Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {seller.phone && (
                    <a 
                      href={`https://wa.me/${formatWhatsAppNumber(seller.phone)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20bd5c] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95"
                    >
                      <Phone size={18} />
                      WhatsApp
                    </a>
                  )}
                </div>

                <Suspense fallback={<LoadingSpinner />}>
                  <QuickMessageBox van={van} seller={seller} onOpenFullChat={() => { setSelectedVan(null); setShowMessagingPage(true); }} />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      <SeoHead
        isHomepage
        title="Buy Campervans & Backpacker Vans in New Zealand"
        description="The easiest way to buy self-contained campervans in New Zealand. Compare Toyota Hiace, Nissan Caravan & more."
      />

      {/* ===== HERO — photo plein écran, collée sous le header transparent ===== */}
      <section className="relative overflow-hidden -mt-14 md:mt-0 min-h-[55vh] md:min-h-[65vh] flex items-center">
        {/* Photo de fond (déjà préchargée dans index.html → zéro coût LCP)
            + voile sombre dégradé pour la lisibilité du texte blanc */}
        <div className="absolute inset-0" aria-hidden="true">
          <picture>
            <source media="(max-width: 768px)" srcSet="/nz-background-mobile.webp" />
            <img src="/nz-background.webp" alt="" fetchPriority="high" className="w-full h-full object-cover" />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-900/40 to-slate-950/60" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 w-full pt-20 md:pt-32 pb-8 md:pb-16">
          <div className="max-w-2xl">
            <div className="inline-flex max-w-full items-center gap-2 px-3.5 py-2 rounded-full bg-white/10 backdrop-blur-sm text-emerald-200 text-[11px] sm:text-xs font-black uppercase tracking-wider mb-4 border border-white/20">
              <Zap size={14} fill="currentColor" className="flex-shrink-0" />
              <span className="truncate">{t('home.badge')}</span>
            </div>

            <h1 className="text-[2.4rem] leading-[1.05] sm:text-5xl lg:text-6xl font-black text-white mb-3 sm:leading-[1.08] tracking-tight drop-shadow-sm">
              {t('home.title_part1')} <span className="text-emerald-300">{t('home.title_highlight')}</span> {t('home.title_part2')}
            </h1>

            <p className="text-base sm:text-lg text-slate-200 font-medium mb-5 md:mb-7 max-w-xl leading-relaxed">
              {t('home.subtitle')}
            </p>

            {/* Barre de recherche — l'action utile au premier regard */}
            <form
              onSubmit={handleHeroSearch}
              className="bg-white rounded-2xl p-2 shadow-2xl shadow-slate-950/30 flex flex-col sm:flex-row gap-2 mb-5"
            >
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={heroQuery}
                  onChange={(e) => setHeroQuery(e.target.value)}
                  placeholder={t('home.search_placeholder', 'Model or city (e.g. Hiace, Auckland)')}
                  className="w-full pl-10 pr-3 py-3.5 rounded-xl bg-slate-50 text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                  aria-label={t('home.search_placeholder', 'Model or city')}
                />
              </div>
              <input
                type="number"
                min="0"
                value={heroBudget}
                onChange={(e) => setHeroBudget(e.target.value)}
                placeholder={t('home.budget_placeholder', 'Max budget (NZD)')}
                className="sm:w-44 px-4 py-3.5 rounded-xl bg-slate-50 text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                aria-label={t('home.budget_placeholder', 'Max budget (NZD)')}
              />
              <button
                type="submit"
                className="sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Search size={16} />
                {t('home.search_button', 'Search')}
              </button>
            </form>

            <div className="flex flex-wrap items-center gap-4 mb-5">
              <Link
                to="/sell"
                className="inline-flex items-center gap-2 text-white font-bold border border-white/40 hover:border-white hover:bg-white/10 px-5 py-2.5 rounded-xl transition-all text-sm"
              >
                <Plus size={16} />
                {t('home.cta_sell_van')}
              </Link>
              <Link
                to="/guides"
                className="hidden lg:inline-flex items-center gap-2 text-white/80 hover:text-white font-bold transition-colors text-sm"
              >
                <BookOpen size={15} />
                <span>{t('home.buying_guides', 'Buying Guides')}</span>
              </Link>
            </div>

            {/* Guide vedette — carte compacte (mobile/tablette) */}
            <HeroGuideCard className="lg:hidden w-full" />
          </div>
        </div>
      </section>

      <main id="main-content">
        <div id="listings-start" className="scroll-mt-24" />
        <QuickFilters
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          filters={filters} setFilters={setFilters}
          showFilters={showFilters} setShowFilters={setShowFilters}
          showBuyBackInfo={infoModals.buyBack} setShowBuyBackInfo={v => setInfoModals(p => ({ ...p, buyBack: v }))}
          showRegoInfo={infoModals.rego} setShowRegoInfo={v => setInfoModals(p => ({ ...p, rego: v }))}
          showSelfContainedInfo={infoModals.selfContained} setShowSelfContainedInfo={v => setInfoModals(p => ({ ...p, selfContained: v }))}
          showWofInfo={infoModals.wof} setShowWofInfo={v => setInfoModals(p => ({ ...p, wof: v }))}
        />
        <Listings
          loading={loading} filteredVans={filteredVans}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          sortBy={sortBy} setSortBy={setSortBy}
          formatPrice={formatPrice}
          onSelectVan={setSelectedVan}
          setShowAuthModal={setShowAuthModal}
          onPageChange={setListingsPage}
        />
        <section className="max-w-7xl mx-auto px-4 pb-10">
          <div className="bg-white border border-slate-100 rounded-2xl p-5">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">Popular high-intent searches</h2>
            <div className="flex flex-wrap gap-2">
              {featuredSearchPages.map((page) => (
                <Link
                  key={page.slug}
                  to={`/search/${page.slug}`}
                  className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-sm hover:bg-emerald-100 transition"
                >
                  {page.heading}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      {selectedVan && <VanDetailsModal van={selectedVan} />}
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  const navType = useNavigationType();
  usePageTracking(); // QW2 — GA page_view sur chaque changement de route (SPA)
  useEffect(() => { if (navType !== 'POP') window.scrollTo(0, 0); }, [pathname, navType]);
  return null;
}

export default function KiwiVanMarket() {
  const { currentUser, logout } = useAuth();
  const { count: favoritesCount } = useFavorites();
  const { t } = useTranslation();
  const isAdmin = currentUser?.isAdmin === true;

  const [searchTerm, setSearchTerm] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMessagingPage, setShowMessagingPage] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [showBuybackCalculator, setShowBuybackCalculator] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const headerProps = {
    setShowBuybackCalculator, searchTerm, setSearchTerm, currentUser, favoritesCount: favoritesCount || 0,
    setShowFavorites, setShowAuthModal, setShowMessagingPage, setShowUserMenu, setShowMobileMenu, showMobileMenu,
    isAdmin, logout, setShowAdminDashboard, setShowUserProfile
  };

  const sharedProps = {
    searchTerm, setSearchTerm, showFavorites, setShowFavorites, showAuthModal, setShowAuthModal,
    showMessagingPage, setShowMessagingPage, showBuybackCalculator, setShowBuybackCalculator,
    showUserMenu, setShowUserMenu, showMobileMenu, setShowMobileMenu, showUserProfile, setShowUserProfile,
    showAdminDashboard, setShowAdminDashboard
  };

  return (
    <BrowserRouter>
      <ToastProvider>
        <NotificationProvider onOpenMessaging={() => setShowMessagingPage(true)}>
          <div className="min-h-screen bg-slate-50 pt-14 md:pt-0">
            <ScrollToTop />
            <Header {...headerProps} />
            <Routes>
              <Route path="/" element={<MainApp {...sharedProps} />} />
              <Route path="/van/:id" element={<Suspense fallback={<PageLoader />}><VanPage /></Suspense>} />
              <Route path="/brand/:brand" element={<Suspense fallback={<PageLoader />}><BrandPage /></Suspense>} />
              <Route path="/location/:location" element={<Suspense fallback={<PageLoader />}><LocationPage /></Suspense>} />
              <Route path="/guides" element={<Suspense fallback={<PageLoader />}><GuidesHubPage /></Suspense>} />
              <Route path="/faq" element={<Suspense fallback={<PageLoader />}><FaqPage /></Suspense>} />
              <Route path="/faq/:scope/:slug" element={<Suspense fallback={<PageLoader />}><SeoTopicFaqPage /></Suspense>} />
              <Route path="/why" element={<Suspense fallback={<PageLoader />}><WhyPage /></Suspense>} />
              <Route path="/search/:slug" element={<Suspense fallback={<PageLoader />}><SeoLongTailPage /></Suspense>} />
              <Route path="/guide/:slug" element={<Suspense fallback={<PageLoader />}><GuidePage /></Suspense>} />
              <Route path="/sell" element={<Suspense fallback={<PageLoader />}><SellPage /></Suspense>} />
              <Route path="/profile" element={<Suspense fallback={<PageLoader />}><ProfilePage /></Suspense>} />
              <Route path="/my-listings" element={<Suspense fallback={<PageLoader />}><MyListingsPage /></Suspense>} />
              <Route path="/buyback-calculator" element={<Suspense fallback={<PageLoader />}><BuybackCalculator /></Suspense>} />
              <Route path="/messages" element={<Suspense fallback={<PageLoader />}><MessagingPage onBack={() => window.history.back()} /></Suspense>} />
              <Route path="/contact" element={<Suspense fallback={<PageLoader />}><ContactPage /></Suspense>} />
            </Routes>
            <Footer onOpenFAQ={() => setShowFAQ(true)} onOpenTerms={() => setShowTerms(true)} />
          </div>
          {showAuthModal && <AuthModal isOpen={true} onClose={() => setShowAuthModal(false)} />}
          {showFavorites && <Suspense fallback={<LoadingSpinner />}><FavoritesPage onClose={() => setShowFavorites(false)} /></Suspense>}
          {showUserProfile && <Suspense fallback={<LoadingSpinner />}><UserProfile onClose={() => setShowUserProfile(false)} /></Suspense>}
          {showAdminDashboard && <Suspense fallback={<PageLoader />}><AdminDashboard onClose={() => setShowAdminDashboard(false)} /></Suspense>}
          <FAQModal isOpen={showFAQ} onClose={() => setShowFAQ(false)} />
          {showTerms && <Suspense fallback={<PageLoader />}><TermsOfServiceModal isOpen={showTerms} onClose={() => setShowTerms(false)} /></Suspense>}
          <BottomNavigation 
             currentUser={currentUser}
             favoritesCount={favoritesCount || 0}
             setShowAuthModal={setShowAuthModal}
             setShowFavorites={setShowFavorites}
             showMobileMenu={showMobileMenu}
             setShowMobileMenu={setShowMobileMenu}
          />
        </NotificationProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
