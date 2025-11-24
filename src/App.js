import React, { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, Gauge, Users, Heart, Filter, ChevronDown, Star, Phone, Mail, Shield, Award, CheckCircle, X, Plus, TrendingUp, Zap, Clock, Facebook, Instagram, Twitter, AlertCircle } from 'lucide-react';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import AuthModal from './components/AuthModal';
import AddVanForm from './components/AddVanForm';
import MyVans from './components/MyVans';
import FavoritesPage from './components/FavoritesPage';
import { useFavorites } from './hooks/useFavorites';
import { NotificationProvider, FloatingMessageButton } from './components/NotificationSystem';
import QuickMessageBox from './components/QuickMessageBox';
import MessagingPage from './components/MessagingPage';

export default function KiwiVanMarket() {
  const [vans, setVans] = useState([]);
  const [filteredVans, setFilteredVans] = useState([]);
  const [selectedVan, setSelectedVan] = useState(null);
  const { favorites, toggleFavorite, isFavorite, count: favoritesCount } = useFavorites();
  const [showFavorites, setShowFavorites] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showContactForm, setShowContactForm] = useState(false);
  const [showAddVanForm, setShowAddVanForm] = useState(false);
  const [showMyVans, setShowMyVans] = useState(false);
  const [showMessagingPage, setShowMessagingPage] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { currentUser, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    priceMax: 50000,
    yearMin: 1990,
    type: 'all',
    location: 'all',
    selfContained: false
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

  useEffect(() => {
    let filtered = vans.filter(van => {
      const matchSearch = van.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          van.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          van.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchPrice = van.price <= filters.priceMax;
      const matchYear = van.year >= filters.yearMin;
      const matchType = filters.type === 'all' || van.type === filters.type;
      const matchLocation = filters.location === 'all' || van.region === filters.location;
      const matchSelfContained = !filters.selfContained || van.selfContained;
      const matchTab = activeTab === 'all' || 
                      (activeTab === 'featured' && van.featured) ||
                      (activeTab === 'buyback' && van.buyBack);
      
      return matchSearch && matchPrice && matchYear && matchType && matchLocation && matchSelfContained && matchTab;
    });
    
    setFilteredVans(filtered);
  }, [searchTerm, filters, vans, activeTab]);

  const formatPrice = (price) => `NZ$${price.toLocaleString()}`;

  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  const VanDetailsModal = ({ van }) => {
    const images = van.images && van.images.length > 0 ? van.images : [van.imageUrl || 'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=800'];
    
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
                alt={van.title} 
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
                  {van.title}
                </h1>
                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <MapPin size={20} className="text-emerald-600" />
                  <span className="font-medium">{van.location}, {van.region}</span>
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
                  <p className="text-xl font-bold text-gray-900">{van.year}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <Gauge className="text-emerald-600 mb-2" size={20} />
                  <p className="text-xs text-gray-500 font-semibold mb-1">MILEAGE</p>
                  <p className="text-xl font-bold text-gray-900">{van.mileage.toLocaleString()} km</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <Users className="text-emerald-600 mb-2" size={20} />
                  <p className="text-xs text-gray-500 font-semibold mb-1">CAPACITY</p>
                  <p className="text-xl font-bold text-gray-900">{van.capacity} people</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <Clock className="text-emerald-600 mb-2" size={20} />
                  <p className="text-xs text-gray-500 font-semibold mb-1">POSTED</p>
                  <p className="text-xl font-bold text-gray-900">{van.postedDays}d ago</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-1 h-6 bg-emerald-600 rounded-full"></div>
                  Description
                </h3>
                <p className="text-gray-700 leading-relaxed">{van.description}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-1 h-6 bg-emerald-600 rounded-full"></div>
                  Features
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {van.features.map((feature, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg">
                      <CheckCircle size={16} className="text-emerald-600 flex-shrink-0" />
                      <span className="text-sm font-semibold text-gray-900">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="text-blue-600" size={18} />
                    <p className="text-xs font-bold text-gray-900">WOF</p>
                  </div>
                  <p className="text-xs text-gray-700">{new Date(van.wofExpiry).toLocaleDateString()}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="text-blue-600" size={18} />
                    <p className="text-xs font-bold text-gray-900">REGO</p>
                  </div>
                  <p className="text-xs text-gray-700">{new Date(van.regoExpiry).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200 mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full w-12 h-12 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                    {van.seller.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{van.seller.name}</p>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={14} 
                          className={i < van.seller.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} 
                        />
                      ))}
                      <span className="text-xs text-gray-600 ml-1">({van.seller.rating}.0)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Message Box */}
              <QuickMessageBox 
                van={van} 
                seller={van.seller}
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        {/* Header */}
        <header className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 text-white shadow-xl sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-[#f7eedd] p-3 rounded-full shadow-lg overflow-hidden">
                  <img src="/kiwi-van-logo.png" alt="Kiwi Van Market" className="w-16 h-16 object-contain" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Kiwi Van Market 🇳🇿</h1>
                  <p className="text-sm opacity-90">Buy & Sell Campervans</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowAddVanForm(true)}
                  className="bg-white text-emerald-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center gap-2">
                  <Plus size={20} />
                  <span className="hidden md:inline">Add Your Van</span>
                </button>
                
                {!currentUser ? (
                  <button 
                    onClick={() => setShowAuthModal(true)}
                    className="bg-emerald-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-800 transition">
                    Sign In
                  </button>
                ) : (
                  <div className="relative">
                    <button 
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 bg-white bg-opacity-20 px-3 py-2 rounded-lg hover:bg-opacity-30 transition">
                      <div className="w-8 h-8 bg-emerald-700 rounded-full flex items-center justify-center font-bold">
                        {currentUser.displayName?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <ChevronDown size={16} className={`transform transition ${showUserMenu ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 text-gray-700">
                        <div className="px-4 py-2 border-b">
                          <div className="font-semibold">{currentUser.displayName || 'User'}</div>
                          <div className="text-xs text-gray-500">{currentUser.email}</div>
                        </div>
                        <a href="#" className="block px-4 py-2 hover:bg-gray-100 transition flex items-center gap-2">
                          <Users size={16} />
                          My Profile
                        </a>
                        <a 
                          href="#"
                          onClick={(e) => { e.preventDefault(); setShowMessagingPage(true); setShowUserMenu(false); }}
                          className="block px-4 py-2 hover:bg-gray-100 transition flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          Messages
                        </a>
                        <a
                          href="#"
                          onClick={(e) => { e.preventDefault(); setShowFavorites(true); setShowUserMenu(false); }}
                          className="block px-4 py-2 hover:bg-gray-100 transition flex items-center gap-2">
                          <Heart size={16} />
                          My Favorites
                          {favoritesCount > 0 && (
                            <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                              {favoritesCount}
                            </span>
                          )}
                        </a>
                        <a 
                          href="#"
                          onClick={(e) => { e.preventDefault(); setShowMyVans(true); setShowUserMenu(false); }}
                          className="block px-4 py-2 hover:bg-gray-100 transition flex items-center gap-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17 5H7c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h1c0 1.66 1.34 3 3 3s3-1.34 3-3h2c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2z"/>
                          </svg>
                          My Listings
                        </a>
                        <hr className="my-2" />
                        <button 
                          onClick={() => { logout(); setShowUserMenu(false); }}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100 transition text-red-600">
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Trust Bar */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-center gap-8 text-sm flex-wrap">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} />
                <span className="font-semibold">WOF Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield size={16} />
                <span className="font-semibold">Buy-Back Guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <Award size={16} />
                <span className="font-semibold">Trusted Sellers</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap size={16} />
                <span className="font-semibold">Quick Response</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text"
                  placeholder="Search by location, model, or features..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition flex items-center gap-2 justify-center">
                <Filter size={20} />
                Filters
                <ChevronDown size={20} className={`transform transition ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {showFilters && (
              <div className="mt-6 pt-6 border-t grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Max Price: NZ${filters.priceMax.toLocaleString()}</label>
                  <input 
                    type="range" 
                    min="5000" 
                    max="50000" 
                    step="1000"
                    value={filters.priceMax}
                    onChange={(e) => setFilters({...filters, priceMax: parseInt(e.target.value)})}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Min Year: {filters.yearMin}</label>
                  <input 
                    type="range" 
                    min="1990" 
                    max="2024" 
                    step="1"
                    value={filters.yearMin}
                    onChange={(e) => setFilters({...filters, yearMin: parseInt(e.target.value)})}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Type</label>
                  <select 
                    value={filters.type}
                    onChange={(e) => setFilters({...filters, type: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
                    <option value="all">All Types</option>
                    <option value="Campervan">Campervan</option>
                    <option value="Van">Van</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Location</label>
                  <select 
                    value={filters.location}
                    onChange={(e) => setFilters({...filters, location: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
                    <option value="all">All Regions</option>
                    <option value="North Island">North Island</option>
                    <option value="South Island">South Island</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox"
                    id="selfContained"
                    checked={filters.selfContained}
                    onChange={(e) => setFilters({...filters, selfContained: e.target.checked})}
                    className="w-5 h-5 text-emerald-600 rounded"
                  />
                  <label htmlFor="selfContained" className="font-semibold">Self-Contained Only</label>
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            <button 
              onClick={() => setActiveTab('all')}
              className={`px-6 py-2 rounded-lg font-semibold transition ${activeTab === 'all' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>
              All Vans ({vans.length})
            </button>
            <button 
              onClick={() => setActiveTab('featured')}
              className={`px-6 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${activeTab === 'featured' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>
              <Star size={18} />
              Featured
            </button>
            <button 
              onClick={() => setActiveTab('buyback')}
              className={`px-6 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${activeTab === 'buyback' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>
              <Shield size={18} />
              Buy-Back Guarantee
            </button>
          </div>

          {!loading && (
            <div className="mb-6">
              <p className="text-2xl font-bold text-gray-800">
                {filteredVans.length} {filteredVans.length === 1 ? 'van' : 'vans'} available
              </p>
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
                      {van.featured && (
                        <div className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <Star size={12} fill="currentColor" />
                          Featured
                        </div>
                      )}
                      {van.buyBack && (
                        <div className="absolute bottom-3 left-3 bg-green-400 text-green-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <Shield size={12} />
                          Buy-Back
                        </div>
                      )}
                      {van.selfContained && (
                        <div className="absolute bottom-3 right-3 bg-blue-400 text-blue-900 px-3 py-1 rounded-full text-xs font-bold">
                          Self-Contained
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <h3 className="font-bold text-lg mb-2 line-clamp-2">{van.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <MapPin size={16} className="text-emerald-600"/>
                        {van.location}, {van.region}
                      </div>
                      <div className="text-3xl font-bold text-emerald-600 mb-3">
                        {formatPrice(van.price)}
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                        <span>{van.year} • {van.mileage.toLocaleString()} km</span>
                        {van.seller?.rating && (
                          <div className="flex items-center gap-1">
                            <Star size={16} fill="currentColor" className="text-yellow-500"/>
                            <span className="font-bold">{van.seller.rating}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        {van.postedDays !== undefined && (
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {van.postedDays}d ago
                          </span>
                        )}
                        {van.views && (
                          <span className="flex items-center gap-1">
                            <TrendingUp size={14} />
                            {van.views} views
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

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-emerald-600 p-2 rounded-lg">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                    </svg>
                  </div>
                  <span className="font-bold text-xl">Kiwi Van Market</span>
                </div>
                <p className="text-gray-400 text-sm">New Zealand's trusted platform for buying and selling campervans</p>
              </div>
              
              <div>
                <h4 className="font-bold mb-4">Quick Links</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition">Browse Vans</a></li>
                  <li><a href="#" className="hover:text-white transition">Sell Your Van</a></li>
                  <li><a href="#" className="hover:text-white transition">How It Works</a></li>
                  <li><a href="#" className="hover:text-white transition">Buy-Back Guarantee</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold mb-4">Support</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition">FAQ</a></li>
                  <li><a href="#" className="hover:text-white transition">Contact Us</a></li>
                  <li><a href="#" className="hover:text-white transition">Safety Tips</a></li>
                  <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold mb-4">Follow Us</h4>
                <div className="flex gap-3">
                  <a href="#" className="bg-gray-800 p-3 rounded-lg hover:bg-emerald-600 transition">
                    <Facebook size={20} />
                  </a>
                  <a href="#" className="bg-gray-800 p-3 rounded-lg hover:bg-emerald-600 transition">
                    <Instagram size={20} />
                  </a>
                  <a href="#" className="bg-gray-800 p-3 rounded-lg hover:bg-emerald-600 transition">
                    <Twitter size={20} />
                  </a>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-400 mb-2">Get updates</p>
                  <div className="flex gap-2">
                    <input type="email" placeholder="Your email" 
                      className="px-3 py-2 rounded-lg bg-gray-800 text-white text-sm flex-1 outline-none" />
                    <button className="bg-emerald-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition">
                      Subscribe
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
              <p>&copy; 2024 Kiwi Van Market. All rights reserved. Made with ❤️ in New Zealand 🇳🇿</p>
            </div>
          </div>
        </footer>

        {/* Floating Message Button */}
        <FloatingMessageButton onClick={() => setShowMessagingPage(true)} />

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
      </div>
    </NotificationProvider>
  );
}