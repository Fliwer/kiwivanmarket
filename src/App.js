import React, { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, Gauge, Users, Heart, Filter, ChevronDown, Star, Phone, Mail, Shield, Award, CheckCircle, X, Plus, TrendingUp, Zap, Clock, Facebook, Instagram, Twitter, Linkedin, ChevronRight, AlertCircle } from 'lucide-react';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

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
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true); // ← NOUVEAU : État de chargement
  const [filters, setFilters] = useState({
    priceMax: 50000,
    yearMin: 2000,
    type: 'all',
    location: 'all',
    selfContained: false
  });

  // Chargement des vans depuis Firebase
  useEffect(() => {
    const fetchVans = async () => {
      try {
        setLoading(true); // Début du chargement
        const querySnapshot = await getDocs(collection(db, 'vans'));
        const vansData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setVans(vansData);
        setFilteredVans(vansData);
        console.log('✅ Vans chargés depuis Firebase:', vansData.length);
      } catch (error) {
        console.error('❌ Erreur lors du chargement des vans:', error);
      } finally {
        setLoading(false); // Fin du chargement (que ça marche ou non)
      }
    };

    fetchVans();
  }, []);

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

  const AddVanForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full my-8 p-8 relative">
        <button onClick={() => setShowAddVanForm(false)} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
        
        <h2 className="text-3xl font-bold mb-6">List Your Van</h2>
        
        <form className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Van Title *</label>
              <input type="text" placeholder="e.g. Toyota Hiace 2015 - Self-Contained" 
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Price (NZD) *</label>
              <input type="number" placeholder="18500" 
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Year *</label>
              <input type="number" placeholder="2015" 
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Mileage (km) *</label>
              <input type="number" placeholder="145000" 
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Capacity *</label>
              <select className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
                <option>2 people</option>
                <option>3 people</option>
                <option>4 people</option>
                <option>5+ people</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Type *</label>
              <select className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
                <option>Campervan</option>
                <option>Van</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Location *</label>
              <input type="text" placeholder="Auckland" 
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Description *</label>
            <textarea rows="4" placeholder="Describe your van..."
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"></textarea>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Features (comma separated)</label>
            <input type="text" placeholder="Solar, Fridge, Fresh WOF, Kitchen" 
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">WOF Expiry</label>
              <input type="date" 
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Rego Expiry</label>
              <input type="date" 
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="w-5 h-5 text-emerald-600 rounded" />
              <span className="font-semibold">Self-Contained Certified</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="w-5 h-5 text-emerald-600 rounded" />
              <span className="font-semibold">Buy-Back Option</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Upload Photos</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-emerald-500 transition cursor-pointer">
              <Plus size={48} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600">Click to upload or drag and drop</p>
              <p className="text-sm text-gray-400">PNG, JPG up to 10MB</p>
            </div>
          </div>

          <div className="flex gap-4">
            <button type="button" onClick={() => setShowAddVanForm(false)}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition">
              Cancel
            </button>
            <button type="submit" 
              className="flex-1 bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition">
              List Your Van
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const VanDetailsModal = ({ van }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full my-8 relative">
        <button onClick={() => setSelectedVan(null)} 
          className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg z-10 hover:bg-gray-100">
          <X size={24} />
        </button>
        
        <img src={van.imageUrl || van.images?.[0] || 'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=800'} alt={van.title} className="w-full h-96 object-cover rounded-t-2xl" />
        
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
              {van.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-emerald-50 px-3 py-2 rounded-lg">
                  <CheckCircle size={18} className="text-emerald-600" />
                  <span className="text-sm font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="text-blue-600" size={20} />
                <p className="font-semibold">WOF Expiry</p>
              </div>
              <p className="text-sm text-gray-700">{new Date(van.wofExpiry).toLocaleDateString()}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="text-blue-600" size={20} />
                <p className="font-semibold">Rego Expiry</p>
              </div>
              <p className="text-sm text-gray-700">{new Date(van.regoExpiry).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-bold text-lg">{van.seller.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Star size={16} fill="currentColor" className="text-yellow-500" />
                  <span className="text-sm font-semibold">{van.seller.rating}</span>
                  <span className="text-sm text-gray-600">Seller Rating</span>
                </div>
              </div>
              {van.buyBack && (
                <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
                  <Shield size={18} />
                  Buy-Back Available
                </div>
              )}
            </div>
          </div>

          <button onClick={() => { setShowContactForm(true); setSelectedVan(null); }}
            className="w-full bg-emerald-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-emerald-700 transition">
            Contact Seller
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 text-white shadow-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white text-emerald-600 p-2 rounded-xl">
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17 5H7c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h1c0 1.66 1.34 3 3 3s3-1.34 3-3h2c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zM7 7h10v3H7V7zm4 13c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm6-2H7v-5h10v5z"/>
                  <circle cx="9" cy="15" r="1"/>
                  <circle cx="15" cy="15" r="1"/>
                </svg>
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
                <span className="hidden md:inline">List Your Van</span>
              </button>
              
              {!isLoggedIn ? (
                <button 
                  onClick={() => setIsLoggedIn(true)}
                  className="bg-emerald-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-800 transition">
                  Sign In
                </button>
              ) : (
                <div className="relative">
                  <button 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 bg-white bg-opacity-20 px-3 py-2 rounded-lg hover:bg-opacity-30 transition">
                    <div className="w-8 h-8 bg-emerald-700 rounded-full flex items-center justify-center font-bold">
                      P
                    </div>
                    <ChevronDown size={16} className={`transform transition ${showUserMenu ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 text-gray-700">
                      <a href="#" className="block px-4 py-2 hover:bg-gray-100 transition">
                        <div className="font-semibold">Paul</div>
                        <div className="text-xs text-gray-500">paul@email.com</div>
                      </a>
                      <hr className="my-2" />
                      <a href="#" className="block px-4 py-2 hover:bg-gray-100 transition flex items-center gap-2">
                        <Users size={16} />
                        My Profile
                      </a>
                      <a href="#" className="block px-4 py-2 hover:bg-gray-100 transition flex items-center gap-2">
                        <Heart size={16} />
                        My Favorites
                      </a>
                      <a href="#" className="block px-4 py-2 hover:bg-gray-100 transition flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17 5H7c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h1c0 1.66 1.34 3 3 3s3-1.34 3-3h2c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2z"/>
                        </svg>
                        My Listings
                      </a>
                      <hr className="my-2" />
                      <button 
                        onClick={() => { setIsLoggedIn(false); setShowUserMenu(false); }}
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

          {/* Filters Panel */}
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
                  min="2000" 
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

        {/* Results Count */}
        {!loading && (
          <div className="mb-6">
            <p className="text-2xl font-bold text-gray-800">
              {filteredVans.length} {filteredVans.length === 1 ? 'van' : 'vans'} available
            </p>
          </div>
        )}

        {/* NOUVEAU : Spinner de chargement */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600 mb-4"></div>
            <p className="text-xl text-gray-600 font-semibold">Loading vans from Firebase...</p>
            <p className="text-sm text-gray-500 mt-2">This should only take a moment</p>
          </div>
        ) : (
          <>
            {/* Van Grid */}
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
                      {van.postedDays && (
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

      {/* Modals */}
      {selectedVan && <VanDetailsModal van={selectedVan} />}
      {showContactForm && selectedVan && <ContactForm van={selectedVan} />}
      {showAddVanForm && <AddVanForm />}
    </div>
  );
}