import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import { isAdmin, AdminBadge } from '../utils/adminHelper';
import AddVanForm from './AddVanForm';
import {
  ArrowLeft, Edit2, Trash2, Eye, Plus, Calendar, MapPin,
  DollarSign, Crown, Loader, Car, AlertTriangle
} from 'lucide-react';

export default function MyListingsPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [myVans, setMyVans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingVan, setEditingVan] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [stats, setStats] = useState({ totalVans: 0, totalViews: 0, avgPrice: 0 });
  const [viewMode, setViewMode] = useState('my');

  const userIsAdmin = isAdmin(currentUser);

  // Hide app-loader on mount
  useEffect(() => {
    const loader = document.getElementById('app-loader');
    if (loader) {
      loader.classList.add('fade-out');
      setTimeout(() => loader.remove(), 500);
    }
  }, []);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !currentUser) {
      navigate('/');
    }
  }, [currentUser, loading, navigate]);

  // Fetch vans
  useEffect(() => {
    fetchVans();
  }, [currentUser, viewMode]);

  const fetchVans = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);

      let q;
      if (viewMode === 'all' && userIsAdmin) {
        q = query(collection(db, 'vans'));
      } else {
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

      // Sort by createdAt (newest first)
      vansData.sort((a, b) => {
        const getTs = (v) => {
          if (!v.createdAt) return 0;
          if (v.createdAt.toDate) return v.createdAt.toDate().getTime();
          if (v.createdAt.seconds) return v.createdAt.seconds * 1000;
          return 0;
        };
        return getTs(b) - getTs(a);
      });

      setMyVans(vansData);

      // Calculate stats
      const totalViews = vansData.reduce((sum, van) => sum + (van.views || 0), 0);
      const avgPrice = vansData.length > 0
        ? vansData.reduce((sum, van) => sum + van.price, 0) / vansData.length
        : 0;

      setStats({
        totalVans: vansData.length,
        totalViews,
        avgPrice: Math.round(avgPrice)
      });

    } catch (error) {
      console.error('Error loading vans:', error);
    } finally {
      setLoading(false);
    }
  };

  // Delete van
  const handleDelete = async (van) => {
    try {
      await deleteDoc(doc(db, 'vans', van.id));
      setMyVans(prev => prev.filter(v => v.id !== van.id));
      setShowDeleteConfirm(null);

      // Invalidate cache
      localStorage.removeItem('kiwiVanMarket_vans');
      localStorage.removeItem('kiwiVanMarket_timestamp');

      alert('Van deleted successfully!');

    } catch (error) {
      console.error('Error deleting:', error);
      alert('Error during deletion. Check your permissions.');
    }
  };

  // Refresh after edit
  const handleVanUpdated = async () => {
    await fetchVans();
    setEditingVan(null);
    // Invalidate cache
    localStorage.removeItem('kiwiVanMarket_vans');
    localStorage.removeItem('kiwiVanMarket_timestamp');
  };

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading your listings...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>My Listings | Kiwi Van Market</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 text-white">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 hover:bg-white/20 rounded-xl transition"
                  aria-label="Go back"
                >
                  <ArrowLeft size={24} />
                </button>
                <div>
                  <h1 className="text-2xl font-bold flex items-center gap-2">
                    My Listings
                    {userIsAdmin && <AdminBadge />}
                  </h1>
                  <p className="text-white/80 text-sm">Manage your van listings</p>
                </div>
              </div>
              <Link
                to="/sell"
                className="flex items-center gap-2 px-4 py-2 bg-white text-emerald-600 rounded-xl font-semibold hover:bg-emerald-50 transition"
              >
                <Plus size={20} />
                <span className="hidden sm:inline">Add New Van</span>
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm text-center">
              <Car className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{stats.totalVans}</p>
              <p className="text-sm text-gray-500">Listings</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm text-center">
              <Eye className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{stats.totalViews}</p>
              <p className="text-sm text-gray-500">Total Views</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm text-center">
              <DollarSign className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">${stats.avgPrice.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Avg Price</p>
            </div>
          </div>

          {/* Admin Toggle */}
          {userIsAdmin && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="text-yellow-600" />
                  <span className="font-semibold text-yellow-800">Admin Mode</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('my')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                      viewMode === 'my'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                    }`}
                  >
                    My Vans
                  </button>
                  <button
                    onClick={() => setViewMode('all')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                      viewMode === 'all'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                    }`}
                  >
                    All Vans
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {myVans.length === 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No listings yet</h3>
              <p className="text-gray-500 mb-6">Start selling your van today!</p>
              <Link
                to="/sell"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition"
              >
                <Plus size={20} />
                List Your First Van
              </Link>
            </div>
          )}

          {/* Vans List */}
          <div className="space-y-4">
            {myVans.map(van => (
              <div key={van.id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition">
                <div className="flex flex-col sm:flex-row">
                  {/* Image */}
                  <div className="sm:w-48 h-40 sm:h-auto relative flex-shrink-0">
                    <img
                      src={van.images?.[0] || van.imageUrl || '/placeholder-van.jpg'}
                      alt={van.title}
                      className="w-full h-full object-cover"
                    />
                    {van.status === 'sold' && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">SOLD</span>
                      </div>
                    )}
                    {van.status === 'paused' && (
                      <div className="absolute inset-0 bg-yellow-500/80 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">PAUSED</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{van.title}</h3>
                        <p className="text-2xl font-bold text-emerald-600">${van.price?.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Eye size={16} />
                        <span>{van.views || 0} views</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPin size={14} />
                        <span>{van.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{van.year}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>{van.mileage?.toLocaleString()} km</span>
                      </div>
                    </div>

                    <div className="text-xs text-gray-400 mt-2">
                      Listed on {formatDate(van.createdAt)}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                      <Link
                        to={`/van/${van.id}`}
                        className="flex items-center gap-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                      >
                        <Eye size={16} />
                        View
                      </Link>
                      <button
                        onClick={() => setEditingVan(van)}
                        className="flex items-center gap-1 px-3 py-2 text-sm bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition"
                      >
                        <Edit2 size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(van)}
                        className="flex items-center gap-1 px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <div className="flex items-center gap-3 text-red-600 mb-4">
                <AlertTriangle size={28} />
                <h3 className="text-xl font-bold">Delete Listing?</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <strong>"{showDeleteConfirm.title}"</strong>?
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Van Modal */}
        {editingVan && (
          <AddVanForm
            van={editingVan}
            isEditMode={true}
            onClose={() => setEditingVan(null)}
            onSuccess={handleVanUpdated}
          />
        )}
      </div>
    </>
  );
}
