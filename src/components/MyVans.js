import React, { useState, useEffect, useCallback } from 'react';
import { X, Edit2, Trash2, Eye, Plus, Calendar, MapPin, DollarSign, Crown, CheckCircle, RotateCcw } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import AddVanForm from './AddVanForm';
import { isAdmin, AdminBadge } from '../utils/adminHelper';
import safeStorage from '../utils/safeStorage';
import { useTranslation } from 'react-i18next';
import { useToast } from './ToastProvider';
import ConfirmModal from './ConfirmModal';
import { formatMileage } from '../utils/formatHelper';

export default function MyVans({ onClose }) {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [myVans, setMyVans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingVan, setEditingVan] = useState(null);
  const [stats, setStats] = useState({ totalVans: 0, totalViews: 0, avgPrice: 0 });
  const [viewMode, setViewMode] = useState('my'); // 'my' ou 'all'
  const userIsAdmin = isAdmin(currentUser);
  const toast = useToast();
  const [confirmConfig, setConfirmConfig] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchVans = useCallback(async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

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

      console.log('✅ Vans loaded:', vansData.length);
    } catch (error) {
      console.error('❌ Error loading vans:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser, viewMode, userIsAdmin]);

  // Charger les vans
  useEffect(() => {
    fetchVans();
  }, [fetchVans]);

  // Supprimer un van
  const handleDelete = async (van) => {
    setConfirmConfig({
      title: 'Delete Listing',
      message: `Are you sure you want to delete "${van.title}"? This action cannot be undone.`,
      confirmText: 'Delete Permanently',
      type: 'danger',
      onConfirm: async () => {
        setDeleting(true);
        try {
          await deleteDoc(doc(db, 'vans', van.id));
          setMyVans(prev => prev.filter(v => v.id !== van.id));
          safeStorage.removeItem('kiwiVanMarket_vans');
          safeStorage.removeItem('kiwiVanMarket_timestamp');
          toast.success(t('my_listings.delete_success'));
        } catch (error) {
          console.error('❌ Error deleting:', error);
          toast.error('❌ Error during deletion.');
        } finally {
          setDeleting(false);
          setConfirmConfig(null);
        }
      }
    });
  };

  // Toggle sold status
  const handleToggleSold = async (van) => {
    const newStatus = van.status === 'sold' ? 'active' : 'sold';
    try {
      await updateDoc(doc(db, 'vans', van.id), { status: newStatus });
      setMyVans(prev => prev.map(v => v.id === van.id ? { ...v, status: newStatus } : v));

      const convsSnapshot = await getDocs(
        query(collection(db, 'conversations'), where('vanId', '==', van.id))
      );
      const updatePromises = convsSnapshot.docs.map(convDoc =>
        updateDoc(convDoc.ref, { 'van.status': newStatus })
      );
      await Promise.all(updatePromises);

      safeStorage.removeItem('kiwiVanMarket_vans');
      safeStorage.removeItem('kiwiVanMarket_timestamp');
      toast.success(t('my_listings.status_updated'));
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error updating status.');
    }
  };

  // Rafraîchir après modification
  const handleVanUpdated = async () => {
    await fetchVans();
    setEditingVan(null);

    // Invalider le cache après modification aussi
    safeStorage.removeItem('kiwiVanMarket_vans');
    safeStorage.removeItem('kiwiVanMarket_timestamp');
  };

  const formatPrice = (price) => `NZ$${price.toLocaleString()}`;

  // ✅ Fermeture avec touche Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && !editingVan && !confirmConfig) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose, editingVan, confirmConfig]);

  if (editingVan) {
    return (
      <AddVanForm
        onClose={() => setEditingVan(null)}
        onVanAdded={handleVanUpdated}
        isEditMode={true}
        van={editingVan}
      />
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ✅ HEADER STICKY - Toujours visible */}
        <div className="sticky top-0 z-20 bg-white rounded-t-2xl border-b border-gray-100 px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold">{t('my_listings.title')} 🚐</h2>
            {userIsAdmin && <AdminBadge user={currentUser} />}
          </div>

          <div className="flex items-center gap-3">
            {/* Toggle Admin Mode */}
            {userIsAdmin && (
              <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('my')}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${viewMode === 'my'
                    ? 'bg-white text-emerald-600 shadow'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}>
                  {t('my_listings.title')}
                </button>
                <button
                  onClick={() => setViewMode('all')}
                  className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${viewMode === 'all'
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}>
                  <Crown size={16} />
                  All Vans (Admin)
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-all hover:scale-110">
              <X size={24} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* ✅ CONTENU SCROLLABLE */}
        <div className="flex-1 overflow-y-auto px-8 py-6">

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-emerald-600 font-semibold">
                  {viewMode === 'all' ? 'Total Vans (Platform)' : t('my_listings.stats_listings')}
                </span>
                <Plus size={24} className="text-emerald-600" />
              </div>
              <p className="text-3xl font-bold text-emerald-700">{stats.totalVans}</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-600 font-semibold">{t('my_listings.stats_views')}</span>
                <Eye size={24} className="text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-blue-700">{stats.totalViews}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-600 font-semibold">{t('my_listings.stats_price')}</span>
                <DollarSign size={24} className="text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-purple-700">{formatPrice(stats.avgPrice)}</p>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-emerald-600 mb-4"></div>
              <p className="text-gray-600 font-semibold">Loading vans...</p>
            </div>
          )}

          {/* Pas de vans */}
          {!loading && myVans.length === 0 && (
            <div className="text-center py-20">
              <div className="text-gray-300 mb-4">
                <svg className="w-24 h-24 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17 5H7c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h1c0 1.66 1.34 3 3 3s3-1.34 3-3h2c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2z" />
                </svg>
              </div>
              <p className="text-xl font-bold text-gray-400 mb-2">No vans</p>
              <p className="text-gray-500 mb-4">
                {viewMode === 'all' ? 'No vans on the platform' : t('my_listings.no_listings')}
              </p>
              {viewMode === 'my' && (
                <button
                  onClick={onClose}
                  className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition">
                  {t('my_listings.add_new')}
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
                  <div key={van.id} className={`bg-white border-2 rounded-xl overflow-hidden hover:shadow-xl transition ${isOwner ? 'border-emerald-200' : 'border-orange-200'
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
                          👤 {van.seller?.name || 'Other seller'}
                        </div>
                      )}
                      <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 shadow-sm">
                        <Eye size={14} />
                        {van.views || 0}
                      </div>
                      {van.status === 'sold' && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-white font-bold text-2xl tracking-widest">{t('my_listings.status_sold')}</span>
                        </div>
                      )}
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
                          {van.year} • {formatMileage(van.mileage)} km
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          Posted {van.postedDays || 0}d ago
                        </span>
                        {van.selfContained && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-semibold">
                            Self-Contained
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {(isOwner || userIsAdmin) && (
                          <>
                            <button
                              onClick={() => setEditingVan(van)}
                              className="flex-1 min-w-[150px] bg-emerald-600 text-white py-2 rounded-lg font-semibold hover:bg-emerald-700 transition flex items-center justify-center gap-2">
                              <Edit2 size={16} />
                              {t('my_listings.edit')}
                            </button>
                            {van.status === 'sold' ? (
                              <button
                                onClick={() => handleToggleSold(van)}
                                className="flex-1 min-w-[150px] bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2">
                                <RotateCcw size={16} />
                                {t('my_listings.reactivate')}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleToggleSold(van)}
                                className="flex-1 min-w-[150px] bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition flex items-center justify-center gap-2">
                                <CheckCircle size={16} />
                                {t('my_listings.mark_as_sold')}
                              </button>
                            )}
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(van)}
                          className={`${(isOwner || userIsAdmin) ? 'w-12 h-10 min-h-[40px]' : 'w-full py-2'} bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition flex items-center justify-center`}>
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Confirmation de suppression */}
        </div>
        {/* ✅ FIN CONTENU SCROLLABLE */}

        <ConfirmModal
          isOpen={!!confirmConfig}
          onClose={() => !deleting && setConfirmConfig(null)}
          onConfirm={confirmConfig?.onConfirm}
          title={confirmConfig?.title}
          message={confirmConfig?.message}
          confirmText={confirmConfig?.confirmText}
          type={confirmConfig?.type}
          isLoading={deleting}
        />
      </div>
    </div>
  );
}