import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { BrowserRouter, Routes, Route, useNavigate, Link, useLocation, useNavigationType } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, MapPin, Calendar, Gauge, Users, Heart, Filter, ChevronDown, Star, Phone, Mail, Shield, Award, CheckCircle, X, Plus, TrendingUp, Zap, Clock, Facebook, Instagram, Twitter, AlertCircle, MessageCircle, Calculator, Settings, Menu, HelpCircle, CalendarCheck, ExternalLink, BookOpen, Share2, ArrowRight } from 'lucide-react';
import { db } from './firebase';
import { collection, getDocs, doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { useFavorites } from './hooks/useFavorites';
import { useHideLoader } from './hooks/useHideLoader';
import { useAutoTranslate } from './hooks/useAutoTranslate';
import { getThumbnail, getLargeImage } from './utils/imageOptimizer';
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
import { safeDate } from './utils/dateHelper';
import Footer, { FAQModal } from './components/Footer';
import VanCard from './components/VanCard';
import GuidePreviewSection from './components/GuidePreviewSection';

// ✅ LAZY LOADING
const SellPage = lazy(() => import('./components/SellPage'));
const AddVanForm = lazy(() => import('./components/AddVanForm'));
const MyVans = lazy(() => import('./components/MyVans'));
const FavoritesPage = lazy(() => import('./components/FavoritesPage'));
const MessagingPage = lazy(() => import('./components/MessagingPage'));
const BuybackCalculator = lazy(() => import('./components/BuybackCalculator'));
const UserProfile = lazy(() => import('./components/UserProfile'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const TermsOfServiceModal = lazy(() => import('./components/TermsOfService').then(m => ({ default: m.TermsOfServiceModal })));
const HomeSeoSection = lazy(() => import('./components/HomeSeoSection'));
const QuickMessageBox = lazy(() => import('./components/QuickMessageBox'));
const VanPage = lazy(() => import('./components/VanPage'));
const BrandPage = lazy(() => import('./components/BrandPage'));
const LocationPage = lazy(() => import('./components/LocationPage'));
const GuidePage = lazy(() => import('./components/GuidePage'));
const ContactPage = lazy(() => import('./components/ContactPage'));
const ProfilePage = lazy(() => import('./components/ProfilePage'));
const MyListingsPage = lazy(() => import('./components/MyListingsPage'));
const GuidesHubPage = lazy(() => import('./components/GuidesHubPage'));
const FaqPage = lazy(() => import('./components/FaqPage'));

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

  const [vans, setVans] = useState([]);
  const [filteredVans, setFilteredVans] = useState([]);
  const [selectedVan, setSelectedVan] = useState(null);
  const [currency, setCurrency] = useState('NZD');
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
      doubleBed: false, fridge: false, gasStove: false, sink: false, toilet: false,
      solarPanel: false, leisureBattery: false, heater: false, dieselHeater: false,
      shower: false, insulation: false, surfRack: false
    }
  });

  const [infoModals, setInfoModals] = useState({
    buyBack: false, wof: false, rego: false, selfContained: false
  });

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
        const cachedData = safeStorage.getItem('kiwiVanMarket_vans');
        const cacheTimestamp = safeStorage.getItem('kiwiVanMarket_timestamp');
        let initialVans = [];

        if (cachedData) {
          try {
            initialVans = JSON.parse(cachedData);
            if (initialVans.length > 0) {
              setVans(initialVans);
              setFilteredVans(initialVans);
              setLoading(false);
            }
          } catch (e) { console.error('Cache error:', e); }
        }

        if (initialVans.length === 0) setLoading(true);

        const now = Date.now();
        const cacheAge = cacheTimestamp ? now - parseInt(cacheTimestamp) : Infinity;
        if (initialVans.length > 0 && cacheAge < 30000) return;

        const querySnapshot = await getDocs(collection(db, 'vans'));
        const vansData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const sortedVans = [...vansData].sort((a, b) => (safeDate(b.createdAt)?.getTime() || 0) - (safeDate(a.createdAt)?.getTime() || 0));

        if (initialVans.length === 0 || JSON.stringify(sortedVans) !== cachedData) {
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
    let filtered = vans.filter(van => {
      if (van.status && van.status !== 'active' && van.status !== 'sold') return false;
      const matchSearch = !searchTerm || [van.title, van.location, van.description].some(s => s?.toLowerCase().includes(searchTerm.toLowerCase()));
      const price = van.price || 0;
      const matchPrice = price >= filters.priceMin && price <= filters.priceMax;
      const matchYear = (van.year || 2000) >= filters.yearMin;
      const matchType = filters.type === 'all' || van.type === filters.type;
      const matchLocation = filters.location === 'all' || van.location === filters.location;
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
      return matchSearch && matchPrice && matchYear && matchType && matchLocation && matchSelfContained && matchBuyBack && matchWofValid && matchRegoValid && matchEquipment;
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
                      href={`https://wa.me/${seller.phone.replace(/\D/g,'')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20bd5c] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95"
                    >
                      <Phone size={18} />
                      WhatsApp
                    </a>
                  )}
                  {seller.facebook && (
                    <a 
                      href={seller.facebook.startsWith('http') ? seller.facebook : `https://facebook.com/${seller.facebook}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 bg-[#1877F2] hover:bg-[#166fe5] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95"
                    >
                      <Facebook size={18} />
                      Facebook
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
    <div className="min-h-screen bg-slate-50">
      <SeoHead
        isHomepage
        title="Buy Campervans & Backpacker Vans in New Zealand | Kiwi Van Market"
        description="The road is calling. Find your ideal campervan and start your New Zealand adventure with Kiwi Van Market."
      />

      {/* Hero Section */}
      <section className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column: Content */}
            <div className="flex flex-col items-start text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black uppercase tracking-wider mb-6 border border-emerald-100 shadow-sm transition-transform hover:scale-105">
                <Zap size={14} fill="currentColor" />
                {t('home.badge')}
              </div>

              <h1 className="text-5xl lg:text-7xl font-black text-slate-900 mb-6 leading-[1.1] tracking-tight">
                {t('home.title_part1')} <br />
                <span className="text-emerald-500">{t('home.title_highlight')}</span> <br />
                {t('home.title_part2')}
              </h1>

              <p className="text-lg lg:text-xl text-slate-500 font-medium mb-10 max-w-xl leading-relaxed opacity-90">
                {t('home.subtitle')}
              </p>


              <div className="flex flex-wrap items-center gap-4 mb-16 w-full">
                <button
                  onClick={() => document.getElementById('listings-start')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-emerald-600 text-white px-10 py-5 rounded-2xl font-black hover:bg-emerald-500 transition-all shadow-2xl shadow-emerald-900/20 active:scale-95 text-lg"
                >
                  {t('home.cta_browse_listings')}
                  <ChevronDown size={20} />
                </button>

                <Link
                  to="/sell"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-transparent text-slate-500 border-2 border-slate-200 border-dashed px-8 py-5 rounded-2xl font-bold hover:border-slate-300 hover:text-slate-700 hover:bg-slate-50 transition-all active:scale-95 text-base"
                >
                  <Plus size={18} />
                  {t('home.cta_sell_van')}
                </Link>

                <Link
                  to="/guides"
                  className="hidden sm:flex items-center gap-2 text-slate-400 hover:text-emerald-600 font-bold transition-colors ml-2 border-b-2 border-dotted border-slate-200 hover:border-emerald-200 text-sm"
                >
                  <BookOpen size={16} />
                  <span>Buying Guides</span>
                </Link>
              </div>


            </div>

            {/* Right Column: Hero Image Card */}
            <div className="relative group">
              <div className="absolute -inset-4 bg-emerald-500/5 rounded-[4rem] blur-3xl group-hover:bg-emerald-500/10 transition-colors" />
              <div className="relative bg-white p-3 rounded-[3.5rem] shadow-2xl shadow-slate-200 border border-slate-50 overflow-hidden transform group-hover:-translate-y-2 transition-transform duration-700">
                <div className="rounded-[3rem] overflow-hidden border-[12px] border-white shadow-inner aspect-[4/3] lg:aspect-auto">
                  <img
                    src="/hiace-camper.png"
                    alt="NZ Road Adventure"
                    fetchPriority="high"
                    loading="eager"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                  />
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Popular Vans Models Section */}
      <section className="bg-slate-50 py-24 pb-12 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4 text-emerald-600 font-black uppercase tracking-[0.2em] text-[10px]">
                <span className="w-8 h-px bg-emerald-600" />
                {t('home.popular_vans_badge')}
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-[1.1] mb-6 tracking-tight">
                {t('home.popular_vans_title')}<br />
                <span className="text-emerald-600 italic">NZ Roadtrips</span>
              </h2>
              <p className="text-lg text-slate-500 font-medium leading-relaxed">
                {t('home.popular_vans_subtitle')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Toyota Hiace */}
            <div className="group bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 hover:border-emerald-200 transition-all duration-500">
              <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-500 inline-block">🚐</div>
              <h3 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-emerald-600 transition-colors">
                {t('van_models.hiace.title')}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                {t('van_models.hiace.desc')}
              </p>
              <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-xl">
                  {t('van_models.hiace.tag1')}
                </span>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-xl">
                  {t('van_models.hiace.tag2')}
                </span>
              </div>
            </div>

            {/* Nissan Caravan */}
            <div className="group bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 hover:border-emerald-200 transition-all duration-500">
              <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-500 inline-block">🏠</div>
              <h3 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-emerald-300 transition-colors">
                {t('van_models.caravan.title')}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                {t('van_models.caravan.desc')}
              </p>
              <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-xl">
                  {t('van_models.caravan.tag1')}
                </span>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-xl">
                  {t('van_models.caravan.tag2')}
                </span>
              </div>
            </div>

            {/* Mitsubishi Delica / Mazda Bongo */}
            <div className="group bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 hover:border-emerald-200 transition-all duration-500">
              <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-500 inline-block">🎒</div>
              <h3 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-amber-500 transition-colors">
                {t('van_models.delica.title')}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                {t('van_models.delica.desc')}
              </p>
              <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-xl">
                  {t('van_models.delica.tag1')}
                </span>
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1.5 rounded-xl">
                  {t('van_models.delica.tag2')}
                </span>
              </div>
            </div>
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
        />
      </main>
      {selectedVan && <VanDetailsModal van={selectedVan} />}
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  const navType = useNavigationType();
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
          <div className="min-h-screen bg-slate-50">
            <ScrollToTop />
            <Header {...headerProps} />
            <Routes>
              <Route path="/" element={<MainApp {...sharedProps} />} />
              <Route path="/van/:id" element={<Suspense fallback={<PageLoader />}><VanPage /></Suspense>} />
              <Route path="/brand/:brand" element={<Suspense fallback={<PageLoader />}><BrandPage /></Suspense>} />
              <Route path="/location/:location" element={<Suspense fallback={<PageLoader />}><LocationPage /></Suspense>} />
              <Route path="/guides" element={<Suspense fallback={<PageLoader />}><GuidesHubPage /></Suspense>} />
              <Route path="/faq" element={<Suspense fallback={<PageLoader />}><FaqPage /></Suspense>} />
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
        </NotificationProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
