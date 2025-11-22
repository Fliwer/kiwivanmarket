import React, { useState, useEffect, Suspense } from 'react';
import { Search, MapPin, Calendar, Gauge, Users, Heart, Filter, ChevronDown, Star, Phone, Mail, Shield, Award, CheckCircle, X, Plus, TrendingUp, Zap, Clock, Facebook, Instagram, Twitter, AlertCircle } from 'lucide-react';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import AuthModal from './components/AuthModal';

// ⚡ LAZY LOADING - Chargement à la demande des gros composants
const AddVanForm = React.lazy(() => import('./components/AddVanForm'));
const MyVans = React.lazy(() => import('./components/MyVans'));
const MessagingSystem = React.lazy(() => import('./components/MessagingSystem'));

export default function KiwiVanMarket() {
  const [vans, setVans] = useState([]);
  const [filteredVans, setFilteredVans] = useState([]);
  const [selectedVan, setSelectedVan] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showContactForm, setShowContactForm] = useState(false);
  const [showAddVanForm, setShowAddVanForm] = useState(false);
  const [showMyVans, setShowMyVans] = useState(false);
  const [showMessaging, setShowMessaging] = useState(false);
  const [messagingInitialVan, setMessagingInitialVan] = useState(null);
  const [messagingInitialRecipient, setMessagingInitialRecipient] = useState(null);
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
      // Attends que les vans du cache soient affichés
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
        
        // 🚀 ÉTAPE 1 : Charger depuis le cache local (INSTANTANÉ)
        const cachedData = localStorage.getItem('kiwiVanMarket_vans');
        const cacheTimestamp = localStorage.getItem('kiwiVanMarket_timestamp');
        
        if (cachedData) {
          const cachedVans = JSON.parse(cachedData);
          setVans(cachedVans);
          setFilteredVans(cachedVans);
          setLoading(false); // ✅ Affichage immédiat des vans en cache !
          console.log('⚡ Vans chargés depuis le cache:', cachedVans.length);
        }
        
        // 🔄 ÉTAPE 2 : Vérifier si le cache est récent (< 5 minutes)
        const now = Date.now();
        const cacheAge = cacheTimestamp ? now - parseInt(cacheTimestamp) : Infinity;
        const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes en millisecondes
        
        // Si le cache est récent, pas besoin de recharger depuis Firebase
        if (cacheAge < CACHE_DURATION && cachedData) {
          console.log('✅ Cache récent, pas de rechargement nécessaire');
          return;
        }
        
        // 📡 ÉTAPE 3 : Charger depuis Firebase (en arrière-plan si cache existe)
        console.log('🔄 Rechargement depuis Firebase...');
        const querySnapshot = await getDocs(collection(db, 'vans'));
        const vansData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // 💾 ÉTAPE 4 : Mettre à jour le cache
        localStorage.setItem('kiwiVanMarket_vans', JSON.stringify(vansData));
        localStorage.setItem('kiwiVanMarket_timestamp', now.toString());
        
        // 🎯 ÉTAPE 5 : Mettre à jour l'affichage
        setVans(vansData);
        setFilteredVans(vansData);
        console.log('✅ Vans chargés depuis Firebase et mis en cache:', vansData.length);
        
      } catch (error) {
        console.error('❌ Erreur lors du chargement des vans:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVans();
  }, []);

  // Fonction pour recharger les vans après ajout
  const refreshVans = async () => {
    try {
      console.log('🔄 Reloading vans...');
      const querySnapshot = await getDocs(collection(db, 'vans'));
      const vansData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Mettre à jour le cache et l'affichage
      localStorage.setItem('kiwiVanMarket_vans', JSON.stringify(vansData));
      localStorage.setItem('kiwiVanMarket_timestamp', Date.now().toString());
      
      setVans(vansData);
      setFilteredVans(vansData);
      console.log('✅ Vans reloaded:', vansData.length);
    } catch (error) {
      console.error('❌ Error reloading vans:', error);
    }
  };

  // ✅ NOUVEAU : Fonction pour ouvrir "Add Van" avec vérification auth
  const handleAddVanClick = () => {
    if (!currentUser) {
      // Pas connecté → Ouvrir modal de connexion
      setShowAuthModal(true);
    } else {
      // Connecté → Ouvrir formulaire
      setShowAddVanForm(true);
    }
  };

  // Filtrage des vans
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

  const toggleFavorite = (vanId) => {
    setFavorites(prev => 
      prev.includes(vanId) ? prev.filter(id => id !== vanId) : [...prev, vanId]
    );
  };

  const formatPrice = (price) => `NZ$${price.toLocaleString()}`;

  const ContactForm = ({ van }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
        <button onClick={() => setShowContactForm(false)} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
        
        <h3 className="text-2xl font-bold mb-4">Contact Seller</h3>
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <p className="font-semibold">{van.seller.name}</p>
          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
            <Star size={16} fill="currentColor" className="text-yellow-500" />
            <span>{van.seller.rating} rating</span>
          </div>
        </div>
        
        <form className="space-y-4">
          <input type="text" placeholder="Your Name" 
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
          <input type="email" placeholder="Your Email" 
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
          <input type="tel" placeholder="Your Phone" 
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
          <textarea placeholder="Your Message" rows="4"
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"></textarea>
          <button type="submit" 
            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition">
            Send Message
          </button>
        </form>
        
        <div className="mt-4 pt-4 border-t space-y-2">
          <a href={`tel:${van.seller.phone}`} 
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700">
            <Phone size={18} />
            <span>{van.seller.phone}</span>
          </a>
          <a href={`mailto:${van.seller.email}`} 
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700">
            <Mail size={18} />
            <span>{van.seller.email}</span>
          </a>
        </div>
      </div>
    </div>
  );

  // ✅ OPTIMISÉ : Modal qui ne "saute" pas
  const VanDetailsModal = ({ van }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full my-8 relative max-h-[90vh] overflow-y-auto">
        <button onClick={() => setSelectedVan(null)} 
          className="sticky top-4 float-right bg-white rounded-full p-2 shadow-lg z-10 hover:bg-gray-100 mr-4">
          <X size={24} />
        </button>
        
        {/* ✅ OPTIMISÉ : Image avec eager loading pour la modal */}
        <img 
          src={van.imageUrl || van.images?.[0] || 'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=1200'} 
          alt={van.title} 
          className="w-full h-96 object-cover rounded-t-2xl bg-gray-200"
          loading="eager"
        />
        
        <div className="p-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold mb-2">{van.title}</h2>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin size={20} className="text-emerald-600" />
                {van.location}, {van.region}
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-emerald-600">{formatPrice(van.price)}</p>
              <button onClick={() => toggleFavorite(van.id)}
                className="mt-2 flex items-center gap-2 text-sm text-gray-600 hover:text-red-500">
                <Heart size={20} className={favorites.includes(van.id) ? 'text-red-500 fill-red-500' : ''} />
                Save
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <Calendar className="text-emerald-600 mb-2" size={24} />
              <p className="text-sm text-gray-600">Year</p>
              <p className="font-bold">{van.year}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <Gauge className="text-emerald-600 mb-2" size={24} />
              <p className="text-sm text-gray-600">Mileage</p>
              <p className="font-bold">{van.mileage.toLocaleString()} km</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <Users className="text-emerald-600 mb-2" size={24} />
              <p className="text-sm text-gray-600">Capacity</p>
              <p className="font-bold">{van.capacity} people</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <Clock className="text-emerald-600 mb-2" size={24} />
              <p className="text-sm text-gray-600">Posted</p>
              <p className="font-bold">{van.postedDays}d ago</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-bold text-xl mb-3">Description</h3>
            <p className="text-gray-700 leading-relaxed">{van.description}</p>
          </div>

          <div className="mb-6">
            <h3 className="font-bold text-xl mb-3">Features</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {van.features && van.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 bg-emerald-50 px-3 py-2 rounded-lg">
                  <CheckCircle size={16} className="text-emerald-600" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {van.wofExpiry && van.regoExpiry && (
            <div className="mb-6 grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">WOF Expiry</p>
                <p className="font-bold text-blue-900">{van.wofExpiry}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Rego Expiry</p>
                <p className="font-bold text-green-900">{van.regoExpiry}</p>
              </div>
            </div>
          )}

          {van.buyBack && (
            <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-3">
                <Shield size={24} className="text-green-600" />
                <h3 className="font-bold text-lg text-green-900">Buy-Back Guarantee Offered</h3>
              </div>
              
              {van.buyBackDetails ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded-lg border border-green-300">
                      <p className="text-xs text-gray-600 mb-1">Guaranteed Buy-Back Price</p>
                      <p className="text-xl font-bold text-green-700">NZ${van.buyBackDetails.guaranteedPrice?.toLocaleString()}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-green-300">
                      <p className="text-xs text-gray-600 mb-1">Duration</p>
                      <p className="text-xl font-bold text-green-700">{van.buyBackDetails.duration} months</p>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg border border-green-300">
                    <p className="text-xs text-gray-600 mb-1">Estimated Total Cost</p>
                    <p className="text-sm text-gray-700">
                      Buy for <strong>NZ${van.price?.toLocaleString()}</strong>, 
                      sell back for <strong>NZ${van.buyBackDetails.guaranteedPrice?.toLocaleString()}</strong> = 
                      <strong className="text-green-700"> NZ${(van.price - van.buyBackDetails.guaranteedPrice)?.toLocaleString()} total</strong>
                      <span className="text-gray-500"> (≈ NZ${Math.round((van.price - van.buyBackDetails.guaranteedPrice) / van.buyBackDetails.duration)}/month)</span>
                    </p>
                  </div>
                  
                  {van.buyBackDetails.conditions && (
                    <div className="bg-white p-3 rounded-lg border border-green-300">
                      <p className="text-xs text-gray-600 mb-1">Conditions</p>
                      <p className="text-sm text-gray-700">{van.buyBackDetails.conditions}</p>
                    </div>
                  )}
                  
                  <div className="bg-yellow-50 p-3 rounded border border-yellow-300">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="text-yellow-600 mt-0.5 flex-shrink-0" size={16} />
                      <p className="text-xs text-yellow-900">
                        <strong>Disclaimer:</strong> Buy-back guarantee is a direct agreement between buyer and seller. Kiwi Van Market is not responsible for enforcement or disputes. Always get written contracts.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-green-800">This van includes a buy-back guarantee. Contact seller for details.</p>
              )}
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-bold text-lg">{van.seller.name}</p>
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                  <Star size={16} fill="currentColor" className="text-yellow-500" />
                  <span>{van.seller.rating} rating</span>
                </div>
              </div>
              <Award size={32} className="text-emerald-600" />
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setSelectedVan(null);
                  setShowContactForm(true);
                  setSelectedVan(van);
                }}
                className="flex-1 bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition flex items-center justify-center gap-2">
                <Mail size={20} />
                Contact Seller
              </button>
              <a href={`tel:${van.seller.phone}`}
                className="flex-1 border-2 border-emerald-600 text-emerald-600 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition flex items-center justify-center gap-2">
                <Phone size={20} />
                Call Now
              </a>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <TrendingUp size={16} />
                {van.views || 0} views
              </span>
              <span className="flex items-center gap-1">
                <Clock size={16} />
                Posted {van.postedDays}d ago
              </span>
            </div>
            <button 
              onClick={() => {
                if (!currentUser) {
                  setShowAuthModal(true);
                } else {
                  setMessagingInitialVan(van);
                  setMessagingInitialRecipient(van.seller);
                  setShowMessaging(true);
                  setSelectedVan(null);
                }
              }}
              className="text-emerald-600 hover:text-emerald-700 font-semibold">
              Send Message
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/kiwi-van-logo.png" 
                alt="Kiwi Van Market" 
                className="w-16 h-16 object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Kiwi Van Market</h1>
                <p className="text-sm text-gray-600">New Zealand's Campervan Marketplace</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* ✅ MODIFIÉ : Bouton Add Van avec vérification auth */}
              <button 
                onClick={handleAddVanClick}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition flex items-center gap-2">
                <Plus size={20} />
                <span className="hidden md:inline">Sell Your Van</span>
              </button>

              {currentUser ? (
                <div className="relative">
                  <button 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition">
                    <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                      {currentUser.displayName?.[0] || currentUser.email?.[0]?.toUpperCase()}
                    </div>
                    <span className="hidden md:inline font-semibold">{currentUser.displayName || 'User'}</span>
                    <ChevronDown size={16} />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                      <button 
                        onClick={() => {
                          setShowMyVans(true);
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 transition">
                        My Vans
                      </button>
                      <button 
                        onClick={() => {
                          setShowMessaging(true);
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 transition">
                        Messages
                      </button>
                      <hr className="my-2" />
                      <button 
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 transition text-red-600">
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="bg-gray-100 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition">
                  Login / Sign Up
                </button>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-4 flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search vans by title, location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition flex items-center gap-2">
              <Filter size={20} />
              Filters
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg grid md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Max Price</label>
                <input 
                  type="range" 
                  min="5000" 
                  max="50000" 
                  step="1000"
                  value={filters.priceMax}
                  onChange={(e) => setFilters({...filters, priceMax: parseInt(e.target.value)})}
                  className="w-full"
                />
                <p className="text-sm text-emerald-600 font-bold mt-1">{formatPrice(filters.priceMax)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2">Min Year</label>
                <input 
                  type="range" 
                  min="1990" 
                  max="2024" 
                  value={filters.yearMin}
                  onChange={(e) => setFilters({...filters, yearMin: parseInt(e.target.value)})}
                  className="w-full"
                />
                <p className="text-sm text-emerald-600 font-bold mt-1">{filters.yearMin}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Type</label>
                <select 
                  value={filters.type}
                  onChange={(e) => setFilters({...filters, type: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
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
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
                  <option value="all">All Locations</option>
                  <option value="North Island">North Island</option>
                  <option value="South Island">South Island</option>
                </select>
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={filters.selfContained}
                    onChange={(e) => setFilters({...filters, selfContained: e.target.checked})}
                    className="w-5 h-5 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-sm font-semibold">Self-Contained Only</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats & Tabs */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${activeTab === 'all' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>
              All Vans ({vans.length})
            </button>
            <button 
              onClick={() => setActiveTab('featured')}
              className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-1 ${activeTab === 'featured' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>
              <Star size={16} />
              Featured
            </button>
            <button 
              onClick={() => setActiveTab('buyback')}
              className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-1 ${activeTab === 'buyback' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>
              <Shield size={16} />
              Buy-Back
            </button>
          </div>
          
          <p className="text-gray-600">
            <span className="font-bold text-emerald-600">{filteredVans.length}</span> vans found
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading vans...</p>
          </div>
        ) : (
          <>
            {/* Van Grid */}
            {/* ✅ OPTIMISÉ : Images avec lazy loading */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVans.map(van => (
                <div key={van.id} 
                  onClick={() => setSelectedVan(van)}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition cursor-pointer transform hover:-translate-y-1">
                  <div className="relative">
                    <img 
                      src={van.imageUrl || van.images?.[0] || 'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=400'} 
                      alt={van.title} 
                      className="w-full h-56 object-cover bg-gray-200"
                      loading="lazy"
                    />
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(van.id); }}
                      className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-lg hover:scale-110 transition">
                      <Heart size={20} className={favorites.includes(van.id) ? 'text-red-500 fill-red-500' : 'text-gray-400'}/>
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

            {/* No results message */}
            {filteredVans.length === 0 && (
              <div className="text-center py-20">
                <p className="text-2xl font-bold text-gray-400 mb-2">No vans found</p>
                <p className="text-gray-500">Try adjusting your filters or search term</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* How It Works Section */}
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
                <img 
                  src="/kiwi-van-logo.png" 
                  alt="Kiwi Van Market" 
                  className="w-12 h-12 object-contain bg-white rounded-lg p-1"
                />
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
          
          <div className="border-t border-gray-800 pt-8">
            {/* Legal Disclaimer */}
            <div className="bg-gray-800 p-4 rounded-lg mb-6">
              <p className="text-xs text-gray-400 leading-relaxed">
                <strong className="text-gray-300">Legal Disclaimer:</strong> Kiwi Van Market is a marketplace platform that connects buyers and sellers of campervans. We are NOT a dealer, broker, or party to any transaction. All listings, prices, buy-back guarantees, and agreements are the sole responsibility of the individual sellers and buyers. We do not verify listings, guarantee transactions, or assume any liability for disputes, damages, misrepresentations, or fraud. All buy-back guarantees are direct agreements between buyers and sellers - Kiwi Van Market has NO responsibility for their enforcement. Users must conduct their own due diligence, inspections, and create written contracts. By using this platform, you agree that Kiwi Van Market holds no liability for any transaction outcomes.
              </p>
            </div>
            
            <div className="text-center text-gray-400 text-sm">
              <p>&copy; 2024 Kiwi Van Market. All rights reserved. Made with ❤️ in New Zealand 🇳🇿</p>
              <p className="text-xs mt-2">
                <a href="#" className="hover:text-white transition">Terms of Service</a> • 
                <a href="#" className="hover:text-white transition ml-2">Privacy Policy</a> • 
                <a href="#" className="hover:text-white transition ml-2">Disclaimer</a>
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {selectedVan && <VanDetailsModal van={selectedVan} />}
      {showContactForm && selectedVan && <ContactForm van={selectedVan} />}
      {showAddVanForm && (
        <Suspense fallback={
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading form...</p>
            </div>
          </div>
        }>
          <AddVanForm 
            onClose={() => setShowAddVanForm(false)} 
            onVanAdded={refreshVans}
          />
        </Suspense>
      )}
      {showMyVans && (
        <Suspense fallback={
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          </div>
        }>
          <MyVans 
            onClose={() => setShowMyVans(false)}
          />
        </Suspense>
      )}
      {showMessaging && (
        <Suspense fallback={
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading messages...</p>
            </div>
          </div>
        }>
          <MessagingSystem 
            onClose={() => {
              setShowMessaging(false);
              setMessagingInitialVan(null);
              setMessagingInitialRecipient(null);
            }}
            initialVan={messagingInitialVan}
            initialRecipient={messagingInitialRecipient}
          />
        </Suspense>
      )}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
}