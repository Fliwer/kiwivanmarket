import React, { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, Gauge, Users, Heart, Filter, ChevronDown, Star, Phone, Mail, Shield, Award, CheckCircle, X, Plus, TrendingUp, Zap, Clock, Facebook, Instagram, Twitter, AlertCircle, MessageCircle, Calculator } from 'lucide-react';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import AuthModal from './components/AuthModal';
import AddVanForm from './components/AddVanForm';
import MyVans from './components/MyVans';
import FavoritesPage from './components/FavoritesPage';
import { useFavorites } from './hooks/useFavorites';
import { NotificationProvider, useNotifications } from './components/NotificationSystem';
import QuickMessageBox from './components/QuickMessageBox';
import MessagingPage from './components/MessagingPage';
import Footer, { FAQModal } from './components/Footer';
import TermsModal from './components/TermsModal';
import BuybackCalculator from './components/BuybackCalculator';

// 🌐 Sélecteur de langue pour le header
function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  
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
    { code: 'vi', flag: 'https://flagcdn.com/24x18/vn.png', name: 'TIẾNG VIỆT', short: 'VI' },
  ];

  // Fonction pour changer la langue via Google Translate
  const changeLanguage = (langCode) => {
    if (langCode === 'en') {
      // Revenir à l'anglais - supprimer le cookie et recharger
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.' + window.location.hostname;
      window.location.reload();
    } else {
      // Définir le cookie Google Translate
      document.cookie = `googtrans=/en/${langCode}; path=/;`;
      document.cookie = `googtrans=/en/${langCode}; path=/; domain=.${window.location.hostname}`;
      window.location.reload();
    }
    setIsOpen(false);
  };

  // Charger le script Google Translate
  useEffect(() => {
    if (!document.getElementById('google-translate-script')) {
      const translateDiv = document.createElement('div');
      translateDiv.id = 'google_translate_element';
      translateDiv.style.display = 'none';
      document.body.appendChild(translateDiv);

      window.googleTranslateElementInit = function() {
        new window.google.translate.TranslateElement({
          pageLanguage: 'en',
          includedLanguages: 'en,fr,de,es,zh-CN,ja,ko,pt,th,vi',
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false
        }, 'google_translate_element');
      };

      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Détecter la langue actuelle depuis le cookie
  const getCurrentLang = () => {
    const match = document.cookie.match(/googtrans=\/en\/([^;]+)/);
    return match ? match[1] : 'en';
  };

  const currentLang = getCurrentLang();
  const currentLangData = languages.find(l => l.code === currentLang) || languages[0];

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
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Overlay pour fermer */}
          <div 
            className="fixed inset-0 z-[100]" 
            onClick={() => setIsOpen(false)}
          />
          
          <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 min-w-[180px] z-[101]">
            {languages.map(lang => (
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

// Petit composant pour le badge Messages (utilise useNotifications)
function MessageBadge() {
  const { unreadCount } = useNotifications();
  
  if (unreadCount === 0) return null;
  
  return (
    <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold border-2 border-white animate-pulse">
      {unreadCount > 9 ? '9+' : unreadCount}
    </span>
  );
}

export default function KiwiVanMarket() {
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
  const [showMessagingPage, setShowMessagingPage] = useState(false);
  const [showBuybackCalculator, setShowBuybackCalculator] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showBuyBackInfo, setShowBuyBackInfo] = useState(false);
  const { currentUser, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // States pour Footer/FAQ/Terms
  const [showFAQ, setShowFAQ] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  
  const [filters, setFilters] = useState({
    priceMax: 50000,
    yearMin: 1990,
    type: 'all',
    location: 'all',
    selfContained: false,
    buyBack: false,
    wofValid: false,
    regoValid: false,
    // Equipment filters
    equipment: {
      doubleBed: false,
      fridge: false,
      gasStove: false,
      sink: false,
      toilet: false,
      solarPanel: false,
      leisureBattery: false,
      heater: false,
      hotWater: false,
      shower: false
    }
  });

  // ⚡ Cache le loader initial dès que React a monté
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
          setVans(cachedVans);
          setFilteredVans(cachedVans);
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
        
        localStorage.setItem('kiwiVanMarket_vans', JSON.stringify(vansData));
        localStorage.setItem('kiwiVanMarket_timestamp', now.toString());
        
        setVans(vansData);
        setFilteredVans(vansData);
        
      } catch (error) {
        console.error('❌ Erreur chargement vans:', error);
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
      
      localStorage.setItem('kiwiVanMarket_vans', JSON.stringify(vansData));
      localStorage.setItem('kiwiVanMarket_timestamp', Date.now().toString());
      
      setVans(vansData);
      setFilteredVans(vansData);
    } catch (error) {
      console.error('❌ Error reloading vans:', error);
    }
  };

  // ✅ MODIFIÉ: Filtre par ville (location) au lieu de région
  useEffect(() => {
    let filtered = vans.filter(van => {
      const matchSearch = van.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          van.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          van.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchPrice = van.price <= filters.priceMax;
      const matchYear = van.year >= filters.yearMin;
      const matchType = filters.type === 'all' || van.type === filters.type;
      
      // ✅ Filtre par ville (van.location) au lieu de région
      const matchLocation = filters.location === 'all' || van.location === filters.location;
      
      const matchSelfContained = !filters.selfContained || van.selfContained;
      const matchBuyBack = !filters.buyBack || van.buyBack;
      
      // Vérifier WOF valide (date future)
      const matchWofValid = !filters.wofValid || (van.wofExpiry && new Date(van.wofExpiry) > new Date());
      
      // Vérifier REGO valide (date future)
      const matchRegoValid = !filters.regoValid || (van.regoExpiry && new Date(van.regoExpiry) > new Date());
      
      // Vérifier les équipements sélectionnés
      const matchEquipment = Object.entries(filters.equipment).every(([key, required]) => {
        if (!required) return true; // Si pas requis, on passe
        // Cas spécial pour shower (indoor ou outdoor)
        if (key === 'shower') {
          return van.equipment?.outdoorShower || van.equipment?.indoorShower;
        }
        return van.equipment?.[key] === true;
      });
      
      return matchSearch && matchPrice && matchYear && matchType && matchLocation && matchSelfContained && matchBuyBack && matchWofValid && matchRegoValid && matchEquipment;
    });
    
    setFilteredVans(filtered);
  }, [searchTerm, filters, vans]);

  const formatPrice = (price) => `NZ$${(price || 0).toLocaleString()}`;

  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  // ✅ FIX: VanDetailsModal avec protection contre les champs undefined
  const VanDetailsModal = ({ van }) => {
    // ✅ Protection: S'assurer que images est toujours un tableau
    const images = van.images && van.images.length > 0 
      ? van.images 
      : (van.imageUrl ? [van.imageUrl] : ['https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=800']);
    
    // ✅ Protection: S'assurer que features est toujours un tableau
    const features = van.features || [];
    
    // ✅ Protection: S'assurer que seller existe
    const seller = van.seller || { name: 'Unknown', rating: 5, email: '', phone: '' };
    
    const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length);
    const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-[60] p-4 overflow-y-auto"
        onClick={() => { setSelectedVan(null); setCurrentImageIndex(0); }}>
        <div 
          className="bg-white rounded-3xl max-w-7xl w-full my-8 relative shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}>
          
          <button 
            onClick={() => { setSelectedVan(null); setCurrentImageIndex(0); }} 
            className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm rounded-full p-3 shadow-xl z-[70] hover:bg-white transition-all hover:scale-110">
            <X size={24} className="text-gray-700" />
          </button>
          
          <div className="grid lg:grid-cols-2">
            
            {/* GALERIE PHOTO */}
            <div className="relative bg-black h-[600px] lg:h-[800px]">
              <img 
                src={images[currentImageIndex]} 
                alt={van.title || 'Van'} 
                className="w-full h-full object-contain"
              />
              
              {images.length > 1 && (
                <>
                  <button 
                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-xl hover:bg-white transition-all hover:scale-110">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-xl hover:bg-white transition-all hover:scale-110">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
              
              <div className="absolute top-6 left-6 flex flex-col gap-3">
                {van.featured && (
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                    <Star size={16} fill="currentColor" />
                    FEATURED
                  </div>
                )}
                {van.selfContained && (
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                    ✓ Self-Contained
                  </div>
                )}
                {van.buyBack && (
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                    <Shield size={16} />
                    Buy-Back
                  </div>
                )}
              </div>

              <button 
                onClick={(e) => { e.stopPropagation(); toggleFavorite(van.id); }}
                className="absolute bottom-6 right-6 bg-white rounded-full p-3 shadow-xl hover:scale-110 transition-all">
                <Heart 
                  size={24} 
                  className={isFavorite(van.id) ? 'text-red-500 fill-red-500' : 'text-gray-700'} 
                />
              </button>
            </div>
            
            {/* INFORMATIONS */}
            <div className="p-8 lg:p-10 overflow-y-auto max-h-[600px] lg:max-h-[800px]">
              
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
                  <p className="text-xl font-bold text-gray-900">{van.postedDays || 0}d ago</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-1 h-6 bg-emerald-600 rounded-full"></div>
                  Description
                </h3>
                <p className="text-gray-700 leading-relaxed">{van.description || 'No description available.'}</p>
              </div>

              {/* ✅ FIX: Features avec protection */}
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

              {/* Equipment Section - Si van a equipment */}
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
                    {van.equipment.bluetooth && <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-2 rounded-lg text-sm">🔊 Bluetooth</div>}
                  </div>
                </div>
              )}

              {/* Custom Features */}
              {van.customFeatures && (
                <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <h4 className="text-sm font-bold text-gray-700 mb-2">✏️ Other Features</h4>
                  <p className="text-gray-600 text-sm">{van.customFeatures}</p>
                </div>
              )}

              {/* WOF + REGO + Self-Contained - Style Facebook */}
              <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-4 rounded-xl border border-gray-200 mb-6">
                <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <Shield size={16} className="text-emerald-600" />
                  Vehicle Status
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className={`bg-white p-3 rounded-lg border text-center ${van.wofExpiry ? 'border-emerald-200' : 'border-gray-200'}`}>
                    <div className="text-[10px] text-gray-500 font-semibold uppercase mb-1">WOF Valid</div>
                    <div className={`text-lg font-bold ${van.wofExpiry ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {van.wofExpiry ? new Date(van.wofExpiry).toLocaleDateString('en-NZ', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Not specified'}
                    </div>
                  </div>
                  <div className={`bg-white p-3 rounded-lg border text-center ${van.regoExpiry ? 'border-blue-200' : 'border-gray-200'}`}>
                    <div className="text-[10px] text-gray-500 font-semibold uppercase mb-1">REGO Until</div>
                    <div className={`text-lg font-bold ${van.regoExpiry ? 'text-blue-600' : 'text-gray-400'}`}>
                      {van.regoExpiry ? new Date(van.regoExpiry).toLocaleDateString('en-NZ', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Not specified'}
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

              {/* Buy-Back Details si applicable */}
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

              {/* ✅ FIX: Seller info avec protection */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200 mb-6">
                <div className="flex items-center gap-3">
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
              </div>

              {/* Quick Message Box */}
              <QuickMessageBox 
                van={van} 
                seller={seller}
                onOpenFullChat={() => {
                  setSelectedVan(null);
                  setCurrentImageIndex(0);
                  setShowMessagingPage(true);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Si page Buyback Calculator ouverte
  if (showBuybackCalculator) {
    return (
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
                <LanguageSelector />
                
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
    );
  }

  // Si page messagerie ouverte
  if (showMessagingPage) {
    return (
      <NotificationProvider onOpenMessaging={() => {}}>
        <MessagingPage onBack={() => setShowMessagingPage(false)} />
      </NotificationProvider>
    );
  }

  return (
    <NotificationProvider onOpenMessaging={() => setShowMessagingPage(true)}>
      <div className="min-h-screen bg-gray-50">
        
        {/* ========== HEADER VERT + ICÔNES VISIBLES ========== */}
        <header className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 text-white shadow-lg sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              
              {/* Logo */}
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.reload()}>
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
                  <img src="/kiwi-van-logo.png" alt="Kiwi Van Market" className="w-10 h-10 object-contain" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold">Kiwi Van Market</h1>
                  <p className="text-xs text-white/80">Buy & Sell Campervans 🇳🇿</p>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex items-center gap-3 ml-10">
                {/* Bouton Buyback Calculator */}
                <button 
                  onClick={() => setShowBuybackCalculator(true)}
                  className="bg-white/20 text-white px-3 py-2 rounded-xl font-semibold hover:bg-white/30 transition flex items-center gap-2 text-sm"
                >
                  <Calculator size={18} />
                  <span className="hidden md:inline">Buyback Calculator</span>
                </button>

                {/* Bouton Vendre */}
              <button 
                onClick={() => setShowAddVanForm(true)}
                className="bg-white text-emerald-600 px-4 py-2 rounded-xl font-semibold hover:bg-emerald-50 transition flex items-center gap-2 text-sm shadow-md"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Sell your van</span>
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

              {/* Navigation Icons */}
              <div className="flex items-center gap-1">
                
                {/* 🌐 Sélecteur de langue */}
                <LanguageSelector />
                
                {/* Favoris - sans badge rouge (juste le coeur) */}
                <button 
                  onClick={() => currentUser ? setShowFavorites(true) : setShowAuthModal(true)}
                  className="relative flex flex-col items-center p-2.5 hover:bg-white/10 rounded-xl transition"
                >
                  <Heart size={22} className={favoritesCount > 0 ? "text-red-400 fill-red-400" : "text-white"} />
                  <span className="text-[10px] text-white/80 hidden sm:block mt-0.5">Favorites</span>
                </button>

                {/* Messages - avec badge notification */}
                <button 
                  onClick={() => currentUser ? setShowMessagingPage(true) : setShowAuthModal(true)}
                  className="relative flex flex-col items-center p-2.5 hover:bg-white/10 rounded-xl transition"
                >
                  <MessageCircle size={22} className="text-white" />
                  <span className="text-[10px] text-white/80 hidden sm:block mt-0.5">Messages</span>
                  <MessageBadge />
                </button>

                {/* Profil / Connexion */}
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
                    
                    {/* Dropdown Menu */}
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl py-2 text-gray-700 border border-gray-100 z-50">
                        <div className="px-4 py-3 border-b bg-gray-50 rounded-t-xl">
                          <div className="font-semibold text-gray-900">{currentUser.displayName || 'User'}</div>
                          <div className="text-xs text-gray-500">{currentUser.email}</div>
                        </div>
                        <div className="py-1">
                          <a 
                            href="#"
                            onClick={(e) => { e.preventDefault(); setShowMyVans(true); setShowUserMenu(false); }}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-emerald-50 transition">
                            <svg className="w-[18px] h-[18px] text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17 5H7c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h1c0 1.66 1.34 3 3 3s3-1.34 3-3h2c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2z"/>
                            </svg>
                            <span>My Listings</span>
                          </a>
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
            </div>
          </div>
        </header>

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

            {/* Quick Filters - Pills cliquables */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              
              {/* Quick Filters par ordre alphabétique */}
              <div className="flex items-center gap-2 flex-wrap">
                
                {/* Buy-Back */}
                <div className="relative">
                  <button 
                    onClick={() => setFilters({...filters, buyBack: !filters.buyBack})}
                    onMouseEnter={() => setShowBuyBackInfo(true)}
                    onMouseLeave={() => setShowBuyBackInfo(false)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer hover:scale-105 ${
                      filters.buyBack 
                        ? 'bg-green-500 text-white shadow-md' 
                        : 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-700 border border-transparent hover:border-green-300'
                    }`}>
                    <Shield size={14} />
                    Buy-Back
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                      filters.buyBack ? 'bg-white/30 text-white' : 'bg-gray-300 text-gray-600'
                    }`}>?</span>
                  </button>
                  {/* Tooltip */}
                  {showBuyBackInfo && (
                    <div className="absolute left-0 top-full mt-2 w-72 bg-gray-900 text-white text-sm p-4 rounded-xl shadow-2xl z-[100]">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield size={18} className="text-emerald-400" />
                        <span className="font-bold text-emerald-400">Buy-Back Guarantee</span>
                      </div>
                      <p className="text-gray-300 leading-relaxed text-xs">
                        The seller guarantees to buy back the van at an agreed price if you return it within the specified period. 
                        <span className="text-white font-semibold"> Perfect for backpackers!</span>
                      </p>
                      <div className="absolute left-3 -top-2 w-4 h-4 bg-gray-900 rotate-45"></div>
                    </div>
                  )}
                </div>

                {/* REGO Valid */}
                <button 
                  onClick={() => setFilters({...filters, regoValid: !filters.regoValid})}
                  className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer hover:scale-105 ${
                    filters.regoValid 
                      ? 'bg-purple-500 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-700 border border-transparent hover:border-purple-300'
                  }`}>
                  <CheckCircle size={14} />
                  REGO Valid
                </button>

                {/* Self-Contained */}
                <button 
                  onClick={() => setFilters({...filters, selfContained: !filters.selfContained})}
                  className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer hover:scale-105 ${
                    filters.selfContained 
                      ? 'bg-blue-500 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-700 border border-transparent hover:border-blue-300'
                  }`}>
                  <CheckCircle size={14} />
                  Self-Contained
                </button>

                {/* WOF Valid */}
                <button 
                  onClick={() => setFilters({...filters, wofValid: !filters.wofValid})}
                  className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer hover:scale-105 ${
                    filters.wofValid 
                      ? 'bg-emerald-500 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-600 hover:bg-emerald-100 hover:text-emerald-700 border border-transparent hover:border-emerald-300'
                  }`}>
                  <CheckCircle size={14} />
                  WOF Valid
                </button>

                {/* Clear filters si au moins un actif */}
                {(filters.selfContained || filters.buyBack || filters.wofValid || filters.regoValid) && (
                  <button 
                    onClick={() => setFilters({...filters, selfContained: false, buyBack: false, wofValid: false, regoValid: false})}
                    className="px-3 py-2 rounded-full text-sm font-semibold text-red-500 hover:bg-red-50 transition flex items-center gap-1">
                    <X size={14} />
                    Clear
                  </button>
                )}
              </div>

              {/* Bouton Filtres à droite */}
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
                {/* Carte principale des filtres */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-5">
                  
                  {/* Titre + Reset button */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                      🔍 Find your perfect campervan
                    </h3>
                    {(Object.values(filters.equipment).some(v => v) || filters.priceMax < 50000 || filters.yearMin > 1990 || filters.location !== 'all' || filters.type !== 'all') && (
                      <button
                        onClick={() => setFilters({
                          ...filters,
                          priceMax: 50000,
                          yearMin: 1990,
                          location: 'all',
                          type: 'all',
                          equipment: {
                            doubleBed: false, fridge: false, gasStove: false, sink: false, toilet: false,
                            solarPanel: false, leisureBattery: false, heater: false, hotWater: false, shower: false
                          }
                        })}
                        className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 px-3 py-1.5 hover:bg-red-50 rounded-lg transition"
                      >
                        <X size={14} />
                        Reset
                      </button>
                    )}
                  </div>

                  {/* Row 1: Price & Year side by side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Max Price: <span className="text-emerald-600 font-bold">NZ${filters.priceMax.toLocaleString()}</span>
                      </label>
                      <input 
                        type="range" 
                        min="5000" 
                        max="50000" 
                        step="1000"
                        value={filters.priceMax}
                        onChange={(e) => setFilters({...filters, priceMax: parseInt(e.target.value)})}
                        className="w-full accent-emerald-500 h-2 rounded-lg"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>$5,000</span>
                        <span>$50,000</span>
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

                  {/* Row 2: Location & Type - ✅ MODIFIÉ avec villes */}
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
                        <option value="Minivan">🚙 Minivan</option>
                        <option value="Van">🚐 Van</option>
                        <option value="Campervan">🏕️ Campervan</option>
                        <option value="Motorhome">🚌 Motorhome</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 3: Equipment filters - Accordéon */}
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
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                        {[
                          { key: 'doubleBed', emoji: '🛏️', label: 'Double Bed' },
                          { key: 'fridge', emoji: '🧊', label: 'Fridge' },
                          { key: 'gasStove', emoji: '🔥', label: 'Gas Stove' },
                          { key: 'sink', emoji: '🚰', label: 'Sink' },
                          { key: 'toilet', emoji: '🚽', label: 'Toilet' },
                          { key: 'solarPanel', emoji: '☀️', label: 'Solar Panel' },
                          { key: 'leisureBattery', emoji: '🔋', label: 'Battery' },
                          { key: 'heater', emoji: '🌡️', label: 'Heater' },
                          { key: 'hotWater', emoji: '♨️', label: 'Boiler' },
                          { key: 'shower', emoji: '🚿', label: 'Shower' },
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

          {/* Results count */}
          {!loading && (
            <div className="mb-5 flex items-center justify-between">
              <p className="text-xl font-bold text-gray-800">
                {filteredVans.length} {filteredVans.length === 1 ? 'van' : 'vans'} available
              </p>
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  ✕ Clear search
                </button>
              )}
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
                  <div key={van.id} 
                    onClick={() => setSelectedVan(van)}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition cursor-pointer transform hover:-translate-y-1">
                    <div className="relative">
                      <img src={van.imageUrl || van.images?.[0] || 'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=800'} alt={van.title} className="w-full h-56 object-cover"/>
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(van.id); }}
                        className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-lg hover:scale-110 transition">
                        <Heart size={20} className={isFavorite(van.id) ? 'text-red-500 fill-red-500' : 'text-gray-400'}/>
                      </button>
                      {van.buyBack && (
                        <div className="absolute bottom-3 left-3 bg-green-400 text-green-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <Shield size={12} />
                          Buy-Back
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      {/* Prix + Self-Contained badge */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-2xl font-bold text-gray-900">
                          {formatPrice(van.price)}
                        </div>
                        {van.selfContained && (
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                            ✓ Self-Contained
                          </span>
                        )}
                      </div>

                      {/* Titre */}
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{van.title}</h3>
                      
                      {/* Location + Year + Km */}
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                        <span>{van.year}</span>
                        <span>•</span>
                        <span>{(van.mileage || 0).toLocaleString()} km</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin size={12} />
                          {van.location}
                        </span>
                      </div>

                      {/* WOF + REGO - Style clair */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className={`rounded-lg px-3 py-2 ${van.wofExpiry ? 'bg-emerald-50 border border-emerald-200' : 'bg-gray-50 border border-gray-200'}`}>
                          <div className={`text-[10px] font-semibold uppercase ${van.wofExpiry ? 'text-emerald-600' : 'text-gray-400'}`}>WOF until</div>
                          <div className={`text-sm font-bold ${van.wofExpiry ? 'text-emerald-700' : 'text-gray-400'}`}>
                            {van.wofExpiry ? new Date(van.wofExpiry).toLocaleDateString('en-NZ', { month: 'short', year: 'numeric' }) : 'Not specified'}
                          </div>
                        </div>
                        <div className={`rounded-lg px-3 py-2 ${van.regoExpiry ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-gray-200'}`}>
                          <div className={`text-[10px] font-semibold uppercase ${van.regoExpiry ? 'text-blue-600' : 'text-gray-400'}`}>REGO until</div>
                          <div className={`text-sm font-bold ${van.regoExpiry ? 'text-blue-700' : 'text-gray-400'}`}>
                            {van.regoExpiry ? new Date(van.regoExpiry).toLocaleDateString('en-NZ', { month: 'short', year: 'numeric' }) : 'Not specified'}
                          </div>
                        </div>
                      </div>

                      {/* Footer simplifié */}
                      <div className="flex items-center justify-end pt-2 border-t border-gray-100">
                        {van.buyBack && (
                          <span className="text-xs font-semibold text-green-600 flex items-center gap-1">
                            <Shield size={12} />
                            Buy-Back Guarantee
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
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

        {/* ✅ NOUVEAU FOOTER avec Disclaimer + FAQ + Google Translate */}
        <Footer 
          onOpenFAQ={() => setShowFAQ(true)} 
          onOpenTerms={() => setShowTerms(true)} 
        />

        {/* Modals */}
        {selectedVan && <VanDetailsModal van={selectedVan} />}
        {showAddVanForm && (
          <AddVanForm 
            onClose={() => setShowAddVanForm(false)} 
            onVanAdded={refreshVans}
          />
        )}
        {showMyVans && (
          <MyVans onClose={() => setShowMyVans(false)} />
        )}
        {showFavorites && (
          <FavoritesPage 
            onClose={() => setShowFavorites(false)}
            onVanClick={(van) => setSelectedVan(van)}
          />
        )} 
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
        
        {/* FAQ Modal */}
        <FAQModal 
          isOpen={showFAQ} 
          onClose={() => setShowFAQ(false)} 
        />
        
        {/* Terms Modal */}
        <TermsModal 
          isOpen={showTerms} 
          onAccept={() => setShowTerms(false)} 
          onClose={() => setShowTerms(false)} 
        />
      </div>
    </NotificationProvider>
  );
}