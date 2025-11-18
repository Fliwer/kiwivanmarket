import React, { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, Gauge, Users, Heart, Filter, ChevronDown, Star, Phone, Mail, Shield, Award, CheckCircle, X, Plus, TrendingUp, Zap, Clock } from 'lucide-react';

export default function KiwiVanMarket() {
  const [vans, setVans] = useState([]);
  const [filteredVans, setFilteredVans] = useState([]);
  const [selectedVan, setSelectedVan] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState({
    priceMax: 30000,
    yearMin: 2005,
    type: 'all',
    location: 'all'
  });

  const initialVans = [
    {
      id: 1,
      title: 'Toyota Hiace 2015 - Self-Contained Certified',
      price: 18500,
      year: 2015,
      mileage: 145000,
      location: 'Auckland',
      region: 'North Island',
      type: 'Campervan',
      capacity: 2,
      selfContained: true,
      featured: true,
      wofExpiry: '2025-11-15',
      regoExpiry: '2025-09-20',
      images: ['https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=800'],
      description: 'Perfect backpacker van! Self-contained certified with fresh WOF.',
      features: ['Self-Contained', 'Solar 200W', 'Fridge', 'Fresh WOF'],
      seller: { name: 'Mike Thompson', rating: 4.9, phone: '+64 21 123 4567' },
      buyBack: true,
      views: 234,
      postedDays: 3
    },
    {
      id: 2,
      title: 'Mitsubishi Delica 2008 - 4WD Adventure',
      price: 12800,
      year: 2008,
      mileage: 198000,
      location: 'Queenstown',
      region: 'South Island',
      type: 'Van',
      capacity: 4,
      selfContained: false,
      featured: true,
      wofExpiry: '2025-08-10',
      regoExpiry: '2025-07-15',
      images: ['https://images.unsplash.com/photo-1622022999934-fe71e89e366d?w=800'],
      description: '4WD Delica, perfect for adventures!',
      features: ['4WD', 'Pop-top', 'Sleeps 4'],
      seller: { name: 'Emma Wilson', rating: 4.7, phone: '+64 27 987 6543' },
      buyBack: false,
      views: 189,
      postedDays: 5
    }
  ];

  useEffect(() => {
    setVans(initialVans);
    setFilteredVans(initialVans);
  }, []);

  useEffect(() => {
    let filtered = vans.filter(van => {
      const matchSearch = van.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchPrice = van.price <= filters.priceMax;
      const matchYear = van.year >= filters.yearMin;
      const matchType = filters.type === 'all' || van.type === filters.type;
      const matchTab = activeTab === 'all' || 
                      (activeTab === 'featured' && van.featured) ||
                      (activeTab === 'buyback' && van.buyBack);
      
      return matchSearch && matchPrice && matchYear && matchType && matchTab;
    });
    
    setFilteredVans(filtered);
  }, [searchTerm, filters, vans, activeTab]);

  const toggleFavorite = (vanId) => {
    setFavorites(prev => 
      prev.includes(vanId) ? prev.filter(id => id !== vanId) : [...prev, vanId]
    );
  };

  const formatPrice = (price) => `NZ$${price.toLocaleString()}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <header className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 text-white shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white text-emerald-600 p-2 rounded-xl">
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Kiwi Van Market 🇳🇿</h1>
                <p className="text-sm">Buy & Sell Campervans</p>
              </div>
            </div>
            <button className="bg-white text-emerald-600 px-6 py-2 rounded-lg font-semibold">
              List Van
            </button>
          </div>
        </div>
      </header>

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
              <span className="font-semibold">Trusted Platform</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-5">
        <div className="mb-4">
          <p className="text-2xl font-bold text-emerald-600">{filteredVans.length} campervans available</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVans.map(van => (
            <div key={van.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition cursor-pointer">
              <div className="relative">
                <img src={van.images[0]} alt={van.title} className="w-full h-56 object-cover"/>
                <button onClick={() => toggleFavorite(van.id)}
                  className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-lg">
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
              </div>

              <div className="p-5">
                <h3 className="font-bold text-lg mb-2">{van.title}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <MapPin size={16} className="text-emerald-600"/>
                  {van.location}, {van.region}
                </div>
                <div className="text-3xl font-bold text-emerald-600 mb-3">
                  {formatPrice(van.price)}
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{van.year} • {van.mileage.toLocaleString()} km</span>
                  <div className="flex items-center gap-1">
                    <Star size={16} fill="currentColor" className="text-yellow-500"/>
                    <span className="font-bold">{van.seller.rating}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}