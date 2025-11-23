import React, { useState, useEffect } from 'react';
import { X, Edit2, Trash2, Eye, Plus, Calendar, MapPin, DollarSign, Crown } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
import AddVanForm from './AddVanForm';
import { isAdmin, AdminBadge } from '../utils/adminHelper';

export default function MyVans({ onClose }) {
  const { currentUser } = useAuth();
  const [myVans, setMyVans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingVan, setEditingVan] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [stats, setStats] = useState({ totalVans: 0, totalViews: 0, avgPrice: 0 });
  const [viewMode, setViewMode] = useState('my'); // 'my' ou 'all'

  const userIsAdmin = isAdmin(currentUser);

  // Charger les vans
  useEffect(() => {
    fetchVans();
  }, [currentUser, viewMode]);

  const fetchVans = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      
      let q;
      if (viewMode === 'all' && userIsAdmin) {
        // Admin voit TOUS les vans
        q = query(collection(db, 'vans'));
      } else {
        // Utilisateur normal voit seulement ses vans
        q = query(
          collection(db, 'vans'),
          where('seller.uid', '==', currentUser.uid)
        );
      }
      
      const querySnapshot = await getDocs(q);
      const vansData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setMyVans(vansData);
      
      // Calculer les stats
      const totalViews = vansData.reduce((sum, van) => sum + (van.views || 0), 0);
      const avgPrice = vansData.length > 0 
        ? vansData.reduce((sum, van) => sum + van.price, 0) / vansData.length 
        : 0;
      
      setStats({
        totalVans: vansData.length,
        totalViews,
        avgPrice: Math.round(avgPrice)
      });
      
      console.log('✅ Vans chargés:', vansData.length);
    } catch (error) {
      console.error('❌ Erreur chargement vans:', error);
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un van
  const handleDelete = async (van) => {
    try {
      console.log('🗑️ Suppression du van:', van.id);
      
      // 1. Supprimer le document Firestore
      await deleteDoc(doc(db, 'vans', van.id));
      console.log('✅ Van supprimé de Firestore');
      
      // 2. Mettre à jour l'état local
      setMyVans(prev => prev.filter(v => v.id !== van.id));
      setShowDeleteConfirm(null);
      
      // 3. ✨ INVALIDER LE CACHE AUTOMATIQUEMENT ✨
      localStorage.removeItem('kiwiVanMarket_vans');
      localStorage.removeItem('kiwiVanMarket_timestamp');
      console.log('🧹 Cache invalidé automatiquement');
      
      alert('✅ Van supprimé avec succès !');
      
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      alert('❌ Erreur lors de la suppression. Vérifiez vos permissions.');
    }
  };

  // Rafraîchir après modification
  const handleVanUpdated = async () => {
    await fetchVans();
    setEditingVan(null);
    
    // Invalider le cache après modification aussi
    localStorage.removeItem('kiwiVanMarket_vans');
    localStorage.removeItem('kiwiVanMarket_timestamp');
  };

  const formatPrice = (price) => `NZ$${price.toLocaleString()}`;

  if (editingVan) {
    return (
      <AddVanForm 
        onClose={() => setEditingVan(null)}
        onVanAdded={handleVanUpdated}
        editMode={true}
        vanData={editingVan}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-6xl w-full my-8 p-8 relative max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-white rounded-full p-2 shadow-lg z-10">
          <X size={24} />
        </button>
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold">Mes Vans 🚐</h2>
            {userIsAdmin && <AdminBadge user={currentUser} />}
          </div>
          
          {/* Toggle Admin Mode */}
          {userIsAdmin && (
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('my')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  viewMode === 'my' 
                    ? 'bg-white text-emerald-600 shadow' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}>
                Mes Vans
              </button>
              <button
                onClick={() => setViewMode('all')}
                className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
                  viewMode === 'all' 
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}>
                <Crown size={16} />
                Tous les Vans (Admin)
              </button>
            </div>
          )}
        </div>
        
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-emerald-600 font-semibold">
                {viewMode === 'all' ? 'Total Vans (Plateforme)' : 'Mes Vans'}
              </span>
              <Plus size={24} className="text-emerald-600" />
            </div>
            <p className="text-3xl font-bold text-emerald-700">{stats.totalVans}</p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-600 font-semibold">Total Vues</span>
              <Eye size={24} className="text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-blue-700">{stats.totalViews}</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-600 font-semibold">Prix Moyen</span>
              <DollarSign size={24} className="text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-purple-700">{formatPrice(stats.avgPrice)}</p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-emerald-600 mb-4"></div>
            <p className="text-gray-600 font-semibold">Chargement des vans...</p>
          </div>
        )}

        {/* Pas de vans */}
        {!loading && myVans.length === 0 && (
          <div className="text-center py-20">
            <div className="text-gray-300 mb-4">
              <svg className="w-24 h-24 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 5H7c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h1c0 1.66 1.34 3 3 3s3-1.34 3-3h2c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2z"/>
              </svg>
            </div>
            <p className="text-xl font-bold text-gray-400 mb-2">Aucun van</p>
            <p className="text-gray-500 mb-4">
              {viewMode === 'all' ? 'Aucun van sur la plateforme' : 'Commencez par ajouter votre premier van !'}
            </p>
            {viewMode === 'my' && (
              <button 
                onClick={onClose}
                className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition">
                Ajouter un Van
              </button>
            )}
          </div>
        )}

        {/* Liste des vans */}
        {!loading && myVans.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myVans.map(van => {
              const isOwner = van.seller?.uid === currentUser.uid;
              
              return (
                <div key={van.id} className={`bg-white border-2 rounded-xl overflow-hidden hover:shadow-xl transition ${
                  isOwner ? 'border-emerald-200' : 'border-orange-200'
                }`}>
                  <div className="relative">
                    <img 
                      src={van.imageUrl || van.images?.[0] || 'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=800'} 
                      alt={van.title}
                      className="w-full h-48 object-cover"
                    />
                    {van.featured && (
                      <div className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
                        ⭐ Featured
                      </div>
                    )}
                    {!isOwner && viewMode === 'all' && (
                      <div className="absolute top-3 left-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        👤 {van.seller?.name || 'Autre vendeur'}
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                      <Eye size={14} />
                      {van.views || 0}
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold text-lg mb-2 line-clamp-1">{van.title}</h3>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <MapPin size={16} className="text-emerald-600" />
                      {van.location}, {van.region}
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="text-2xl font-bold text-emerald-600">
                        {formatPrice(van.price)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {van.year} • {van.mileage?.toLocaleString()} km
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        Posté il y a {van.postedDays || 0}j
                      </span>
                      {van.selfContained && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-semibold">
                          Self-Contained
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {isOwner && (
                        <button 
                          onClick={() => setEditingVan(van)}
                          className="flex-1 bg-emerald-600 text-white py-2 rounded-lg font-semibold hover:bg-emerald-700 transition flex items-center justify-center gap-2">
                          <Edit2 size={16} />
                          Éditer
                        </button>
                      )}
                      <button 
                        onClick={() => setShowDeleteConfirm(van)}
                        className={`${isOwner ? 'flex-1' : 'w-full'} bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2`}>
                        <Trash2 size={16} />
                        {userIsAdmin && !isOwner ? 'Supprimer (Admin)' : 'Supprimer'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Confirmation de suppression */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <h3 className="text-2xl font-bold mb-4 text-red-600">⚠️ Confirmer la suppression</h3>
              {userIsAdmin && showDeleteConfirm.seller?.uid !== currentUser.uid && (
                <div className="bg-orange-100 border-2 border-orange-500 rounded-lg p-3 mb-4">
                  <p className="text-orange-800 font-bold text-sm flex items-center gap-2">
                    <Crown size={16} />
                    MODE ADMIN : Suppression du van d'un autre utilisateur
                  </p>
                </div>
              )}
              <p className="text-gray-700 mb-2">
                Êtes-vous sûr de vouloir supprimer ce van ?
              </p>
              <p className="font-bold mb-4">{showDeleteConfirm.title}</p>
              <p className="text-sm text-gray-500 mb-6">
                Cette action est irréversible. Les images et toutes les données seront définitivement supprimées.
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition">
                  Annuler
                </button>
                <button 
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition">
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}