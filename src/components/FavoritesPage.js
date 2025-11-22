import React, { useState, useEffect } from 'react';
import { X, Heart, MapPin, Calendar, Gauge, Star, TrendingUp, Clock, Trash2 } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useFavorites } from '../hooks/useFavorites';

export default function FavoritesPage({ onClose, onVanClick }) {
  const { favorites, toggleFavorite, loading: favoritesLoading } = useFavorites();
  const [vansData, setVansData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Charger les données des vans favoris
  useEffect(() => {
    const loadFavoriteVans = async () => {
      if (favorites.length === 0) {
        setVansData([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const vansRef = collection(db, 'vans');
        const q = query(vansRef, where('__name__', 'in', favorites.slice(0, 10))); // Firebase limite à 10
        const snapshot = await getDocs(q);
        
        const vans = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setVansData(vans);
        console.log('✅ Vans favoris chargés:', vans.length);
      } catch (error) {
        console.error('❌ Erreur lors du chargement des vans favoris:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!favoritesLoading) {
      loadFavoriteVans();
    }
  }, [favorites, favoritesLoading]);

  const formatPrice = (price) => `NZ$${price?.toLocaleString() || '0'}`;

  const handleRemoveFavorite = async (e, vanId) => {
    e.stopPropagation();
    if (window.confirm('Remove from favorites?')) {
      await toggleFavorite(vanId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Heart size={28} className="text-red-500 fill-red-500" />
            <div>
              <h2 className="text-2xl font-bold">My Favorites</h2>
              <p className="text-sm text-gray-500">
                {favorites.length} {favorites.length === 1 ? 'van' : 'vans'} saved
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading || favoritesLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-emerald-600 mb-4"></div>
                <p className="text-gray-600">Loading your favorites...</p>
              </div>
            </div>
          ) : favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Heart size={64} className="text-gray-300 mb-4" />
              <h3 className="text-2xl font-bold text-gray-400 mb-2">No favorites yet</h3>
              <p className="text-gray-500 mb-6">
                Start adding vans to your favorites by clicking the heart icon
              </p>
              <button 
                onClick={onClose}
                className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition">
                Browse Vans
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vansData.map(van => (
                <div 
                  key={van.id}
                  onClick={() => {
                    onVanClick(van);
                    onClose();
                  }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition cursor-pointer transform hover:-translate-y-1 border border-gray-100">
                  <div className="relative">
                    <img 
                      src={van.imageUrl || van.images?.[0] || 'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=800'} 
                      alt={van.title} 
                      className="w-full h-48 object-cover"
                    />
                    <button 
                      onClick={(e) => handleRemoveFavorite(e, van.id)}
                      className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-lg hover:bg-red-50 transition group">
                      <Trash2 size={18} className="text-red-500 group-hover:scale-110 transition" />
                    </button>
                    {van.featured && (
                      <div className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <Star size={12} fill="currentColor" />
                        Featured
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2 line-clamp-2">{van.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <MapPin size={14} className="text-emerald-600"/>
                      {van.location}, {van.region}
                    </div>
                    <div className="text-2xl font-bold text-emerald-600 mb-3">
                      {formatPrice(van.price)}
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {van.year}
                      </span>
                      <span className="flex items-center gap-1">
                        <Gauge size={14} />
                        {van.mileage?.toLocaleString()} km
                      </span>
                    </div>
                    {van.seller?.rating && (
                      <div className="flex items-center gap-1 text-sm">
                        <Star size={14} fill="currentColor" className="text-yellow-500"/>
                        <span className="font-semibold">{van.seller.rating}</span>
                        <span className="text-gray-500">seller rating</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && !favoritesLoading && favorites.length > 0 && (
          <div className="border-t p-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                💡 Tip: Click on any van to view details
              </p>
              <button 
                onClick={onClose}
                className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition">
                Continue Browsing
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}