import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy, where } from 'firebase/firestore';
import { db, functions } from '../firebase';
import { httpsCallable } from 'firebase/functions';
import { useAuth } from '../AuthContext';
import {
  X, Search, Filter, Trash2, Edit, Eye, EyeOff, Check, Ban,
  Users, Car, TrendingUp, AlertTriangle, Shield, Star,
  ChevronDown, ChevronUp, RefreshCw, Download, BarChart3,
  MapPin, Calendar, DollarSign, MessageCircle, Settings,
  ExternalLink, Mail, Phone, Clock, CheckCircle, XCircle
} from 'lucide-react';

// 🔧 Helper pour normaliser les types de véhicules
const normalizeVehicleType = (type) => {
  if (!type) return 'Van';
  const normalized = type.toLowerCase().trim();
  if (normalized.includes('motorhome') || normalized.includes('camping-car') || normalized.includes('camper')) {
    return 'Motorhome';
  }
  if (normalized.includes('car') || normalized.includes('voiture')) {
    return 'Car';
  }
  return 'Van';
};

export default function AdminDashboard({ onClose, onEditVan }) {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [vans, setVans] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedVan, setSelectedVan] = useState(null);
  const [stats, setStats] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [showBanConfirm, setShowBanConfirm] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // 🔐 Vérifier si l'utilisateur est admin (via custom claim Firebase)
  const isAdmin = currentUser?.isAdmin === true;

  // 📊 Charger les données
  useEffect(() => {
    if (isAdmin) {
      loadAllData();
    }
  }, [isAdmin]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      // Charger les vans
      const vansSnapshot = await getDocs(collection(db, 'vans'));
      const vansData = vansSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Normaliser le type
        type: normalizeVehicleType(doc.data().type)
      }));
      setVans(vansData);

      // Charger les utilisateurs
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(usersData);
      } catch (e) {
        console.log('Users collection not found');
        setUsers([]);
      }

      // Calculer les stats
      calculateStats(vansData);

    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (vansData) => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    setStats({
      totalVans: vansData.length,
      activeVans: vansData.filter(v => v.status !== 'hidden' && v.status !== 'rejected').length,
      soldVans: vansData.filter(v => v.status === 'sold').length,
      hiddenVans: vansData.filter(v => v.status === 'hidden').length,
      totalViews: vansData.reduce((sum, v) => sum + (v.views || 0), 0),
      // ... previous stats
      vansWithBuyBack: vansData.filter(v => v.buyBack).length,
      selfContainedVans: vansData.filter(v => v.selfContained).length,
      featuredVans: vansData.filter(v => v.featured).length,
      averagePrice: vansData.length > 0
        ? Math.round(vansData.reduce((sum, v) => sum + (v.price || 0), 0) / vansData.length)
        : 0,
      totalValue: vansData.reduce((sum, v) => sum + (v.price || 0), 0),
      vansByCity: vansData.reduce((acc, v) => {
        const city = v.location || 'Unknown';
        acc[city] = (acc[city] || 0) + 1;
        return acc;
      }, {}),
      vansByType: vansData.reduce((acc, v) => {
        const type = normalizeVehicleType(v.type);
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {}),
      recentVans: vansData.filter(v => {
        const createdAt = v.createdAt?.toDate?.() || new Date(v.createdAt);
        return createdAt > thirtyDaysAgo;
      }).length,
      thisWeekVans: vansData.filter(v => {
        const createdAt = v.createdAt?.toDate?.() || new Date(v.createdAt);
        return createdAt > sevenDaysAgo;
      }).length,
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    // Invalider le cache
    localStorage.removeItem('kiwiVanMarket_vans');
    localStorage.removeItem('kiwiVanMarket_timestamp');
    setRefreshing(false);
  };

  // 🚐 Actions sur les vans
  const handleToggleFeatured = async (vanId, currentStatus) => {
    try {
      await updateDoc(doc(db, 'vans', vanId), {
        featured: !currentStatus
      });
      setVans(vans.map(v => v.id === vanId ? { ...v, featured: !currentStatus } : v));
      // Invalider le cache
      localStorage.removeItem('kiwiVanMarket_vans');
    } catch (error) {
      console.error('Error toggling featured:', error);
      alert('Error updating van');
    }
  };

  const handleToggleVisibility = async (vanId, currentStatus) => {
    const newStatus = currentStatus === 'hidden' ? 'active' : 'hidden';
    try {
      await updateDoc(doc(db, 'vans', vanId), {
        status: newStatus
      });
      setVans(vans.map(v => v.id === vanId ? { ...v, status: newStatus } : v));
      localStorage.removeItem('kiwiVanMarket_vans');
    } catch (error) {
      console.error('Error toggling visibility:', error);
      alert('Error updating van');
    }
  };

  const handleDeleteVan = async (vanId, vanTitle) => {
    if (!window.confirm(`⚠️ Delete "${vanTitle}" permanently?\n\nThis action cannot be undone.`)) return;

    try {
      await deleteDoc(doc(db, 'vans', vanId));
      setVans(vans.filter(v => v.id !== vanId));
      setSelectedVan(null);
      localStorage.removeItem('kiwiVanMarket_vans');
      alert('✅ Listing deleted successfully');
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Error deleting listing');
    }
  };

  // ✏️ Edit van - ouvre le formulaire d'édition
  const handleEditVan = (van) => {
    if (onEditVan) {
      onEditVan(van);
      onClose();
    } else {
      alert('Edit function not available. Please use "My Vans" section to edit.');
    }
  };

  // 👤 Ban/Unban user
  const handleBanUser = async (userId, userEmail, currentBanned) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        banned: !currentBanned,
        bannedAt: !currentBanned ? new Date() : null,
        bannedBy: !currentBanned ? currentUser.email : null
      });

      setUsers(users.map(u => u.id === userId ? { ...u, banned: !currentBanned } : u));
      setShowBanConfirm(null);

      alert(currentBanned
        ? `✅ ${userEmail} has been unbanned`
        : `🚫 ${userEmail} has been banned`
      );
    } catch (error) {
      console.error('Error banning user:', error);
      alert('Error updating user');
    }
  };

  // 🗑️ Delete user account
  const handleDeleteUser = async (userId, userEmail) => {
    setDeleting(true);
    try {
      const deleteUserFn = httpsCallable(functions, 'deleteUser');
      const result = await deleteUserFn({ userId });

      setUsers(users.filter(u => u.id !== userId));
      setVans(vans.filter(v => v.seller?.uid !== userId));
      setShowDeleteConfirm(null);
      localStorage.removeItem('kiwiVanMarket_vans');

      alert(`Account ${userEmail} deleted (${result.data.vansDeleted} listing(s) removed).`);
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user: ' + (error.message || 'Unknown error'));
    } finally {
      setDeleting(false);
    }
  };

  // 📥 Export CSV
  const handleExportCSV = () => {
    const headers = ['Title', 'Price', 'Year', 'Mileage', 'Location', 'Type', 'Seller Name', 'Seller Email', 'Self-Contained', 'Buy-Back', 'Featured', 'Status', 'Created At'];

    const rows = vans.map(van => [
      van.title?.replace(/,/g, ';') || '',
      van.price || 0,
      van.year || '',
      van.mileage || 0,
      van.location || '',
      van.type || 'Van',
      van.seller?.name?.replace(/,/g, ';') || '',
      van.seller?.email || '',
      van.selfContained ? 'Yes' : 'No',
      van.buyBack ? 'Yes' : 'No',
      van.featured ? 'Yes' : 'No',
      van.status || 'active',
      van.createdAt?.toDate?.()?.toISOString() || ''
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `kiwivanmarket_vans_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // 🔍 Filtrer les vans
  const filteredVans = vans.filter(van => {
    const matchSearch =
      van.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      van.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      van.seller?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      van.seller?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = filterStatus === 'all' ||
      (filterStatus === 'featured' && van.featured) ||
      (filterStatus === 'buyback' && van.buyBack) ||
      (filterStatus === 'selfcontained' && van.selfContained) ||
      (filterStatus === 'hidden' && van.status === 'hidden');

    return matchSearch && matchStatus;
  });

  // Format date helper
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-NZ', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // 🚫 Si pas admin
  if (!isAdmin) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Ban className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access the admin dashboard.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-100 z-[100] overflow-hidden">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-400 text-sm">KiwiVanMarket • {stats.totalVans || 0} listings</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl transition text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl transition"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-xl transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-72px)]">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 p-4 hidden md:block">
          <nav className="space-y-2">
            {[
              { id: 'overview', icon: BarChart3, label: 'Overview' },
              { id: 'vans', icon: Car, label: 'Listings', count: vans.length },
              { id: 'users', icon: Users, label: 'Users', count: users.length },
              { id: 'stats', icon: TrendingUp, label: 'Statistics' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition ${activeTab === item.id
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span className={`text-xs px-2 py-1 rounded-full ${activeTab === item.id ? 'bg-emerald-200' : 'bg-gray-200'
                    }`}>
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Quick Stats in Sidebar */}
          <div className="mt-8 p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Quick Stats</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">This week</span>
                <span className="font-bold text-emerald-600">+{stats.thisWeekVans || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Hidden</span>
                <span className="font-bold text-red-500">{stats.hiddenVans || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total value</span>
                <span className="font-bold">${(stats.totalValue || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading data...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Mobile Tabs */}
              <div className="flex gap-2 mb-6 overflow-x-auto md:hidden pb-2">
                {[
                  { id: 'overview', label: '📊 Overview' },
                  { id: 'vans', label: '🚐 Listings' },
                  { id: 'users', label: '👥 Users' },
                  { id: 'stats', label: '📈 Stats' },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition ${activeTab === item.id
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white text-gray-600'
                      }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Overview</h2>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl p-5 border border-gray-200 hover:shadow-lg transition">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                          <Car className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-gray-600 text-sm">Total Listings</span>
                      </div>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalVans}</p>
                      <p className="text-xs text-gray-500 mt-1">+{stats.thisWeekVans} this week</p>
                    </div>

                    <div className="bg-white rounded-2xl p-5 border border-gray-200 hover:shadow-lg transition">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-emerald-600" />
                        </div>
                        <span className="text-gray-600 text-sm">Sold Listings</span>
                      </div>
                      <p className="text-3xl font-bold text-gray-900">{stats.soldVans || 0}</p>
                      <p className="text-xs text-gray-500 mt-1">Success rate: {stats.totalVans > 0 ? Math.round((stats.soldVans / stats.totalVans) * 100) : 0}%</p>
                    </div>

                    <div className="bg-white rounded-2xl p-5 border border-gray-200 hover:shadow-lg transition">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                          <Eye className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-gray-600 text-sm">Total Views</span>
                      </div>
                      <p className="text-3xl font-bold text-gray-900">{(stats.totalViews || 0).toLocaleString()}</p>
                      <p className="text-xs text-gray-500 mt-1">Global engagement</p>
                    </div>

                    <div className="bg-white rounded-2xl p-5 border border-gray-200 hover:shadow-lg transition">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-purple-600" />
                        </div>
                        <span className="text-gray-600 text-sm">Average Price</span>
                      </div>
                      <p className="text-3xl font-bold text-gray-900">${stats.averagePrice?.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Charts Section */}
                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Vans par ville */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-emerald-600" />
                        Listings by City
                      </h3>
                      <div className="space-y-3">
                        {Object.entries(stats.vansByCity || {})
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 6)
                          .map(([city, count]) => (
                            <div key={city} className="flex items-center gap-3">
                              <div className="flex-1">
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="font-medium text-gray-700">{city}</span>
                                  <span className="text-gray-500">{count}</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                                    style={{ width: `${(count / stats.totalVans) * 100}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Vans par type */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Car className="w-5 h-5 text-emerald-600" />
                        Listings by Type
                      </h3>
                      <div className="space-y-3">
                        {Object.entries(stats.vansByType || {})
                          .sort((a, b) => b[1] - a[1])
                          .map(([type, count]) => (
                            <div key={type} className="flex items-center gap-3">
                              <div className="flex-1">
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="font-medium text-gray-700 flex items-center gap-2">
                                    {type === 'Van' && '🚐'}
                                    {type === 'Motorhome' && '🚌'}
                                    {type === 'Car' && '🚗'}
                                    {type}
                                  </span>
                                  <span className="text-gray-500">{count}</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                                    style={{ width: `${(count / stats.totalVans) * 100}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>

                  {/* Recent Vans */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900">Latest Listings</h3>
                      <button
                        onClick={() => setActiveTab('vans')}
                        className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                      >
                        View all <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left text-sm text-gray-500 border-b">
                            <th className="pb-3 font-medium">Listing</th>
                            <th className="pb-3 font-medium">Price</th>
                            <th className="pb-3 font-medium">City</th>
                            <th className="pb-3 font-medium">Seller</th>
                            <th className="pb-3 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {vans.slice(0, 5).map(van => (
                            <tr key={van.id} className="border-b last:border-0 hover:bg-gray-50">
                              <td className="py-3">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={van.imageUrl || van.images?.[0] || 'https://via.placeholder.com/48'}
                                    alt={van.title}
                                    className="w-12 h-12 rounded-lg object-cover"
                                  />
                                  <div>
                                    <p className="font-medium text-gray-900 line-clamp-1">{van.title}</p>
                                    <p className="text-xs text-gray-500">{van.year} • {van.type}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 font-semibold text-gray-900">
                                ${van.price?.toLocaleString()}
                              </td>
                              <td className="py-3 text-gray-600">{van.location}</td>
                              <td className="py-3 text-gray-600 text-sm">{van.seller?.email}</td>
                              <td className="py-3">
                                <div className="flex items-center gap-2">
                                  {van.featured && (
                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
                                      ⭐ Featured
                                    </span>
                                  )}
                                  {van.buyBack && (
                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                      🛡️ Buy-Back
                                    </span>
                                  )}
                                  {van.status === 'hidden' && (
                                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                                      Hidden
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Vans Tab */}
              {activeTab === 'vans' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-2xl font-bold text-gray-900">Manage Listings</h2>

                    {/* Search & Filters */}
                    <div className="flex gap-3 flex-wrap">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 w-64"
                        />
                      </div>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 bg-white"
                      >
                        <option value="all">All ({vans.length})</option>
                        <option value="featured">⭐ Featured ({stats.featuredVans})</option>
                        <option value="buyback">🛡️ Buy-Back ({stats.vansWithBuyBack})</option>
                        <option value="selfcontained">🔵 Self-Contained ({stats.selfContainedVans})</option>
                        <option value="hidden">🚫 Hidden ({stats.hiddenVans})</option>
                      </select>
                    </div>
                  </div>

                  {/* Vans Table */}
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr className="text-left text-sm text-gray-500">
                            <th className="px-4 py-3 font-medium">Listing</th>
                            <th className="px-4 py-3 font-medium">Price</th>
                            <th className="px-4 py-3 font-medium">City</th>
                            <th className="px-4 py-3 font-medium">Seller</th>
                            <th className="px-4 py-3 font-medium">Options</th>
                            <th className="px-4 py-3 font-medium text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredVans.map(van => (
                            <tr key={van.id} className="border-t border-gray-100 hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={van.imageUrl || van.images?.[0] || 'https://via.placeholder.com/56'}
                                    alt={van.title}
                                    className="w-14 h-14 rounded-xl object-cover"
                                  />
                                  <div>
                                    <p className="font-medium text-gray-900 line-clamp-1 max-w-[200px]">{van.title}</p>
                                    <p className="text-xs text-gray-500">{van.year} • {van.mileage?.toLocaleString()} km • {van.type}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className="font-bold text-gray-900">${van.price?.toLocaleString()}</span>
                              </td>
                              <td className="px-4 py-3 text-gray-600">{van.location}</td>
                              <td className="px-4 py-3">
                                <p className="text-sm text-gray-900">{van.seller?.name || 'Unknown'}</p>
                                <p className="text-xs text-gray-500">{van.seller?.email}</p>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex flex-wrap gap-1">
                                  {van.featured && (
                                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
                                      Featured
                                    </span>
                                  )}
                                  {van.buyBack && (
                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                      Buy-Back
                                    </span>
                                  )}
                                  {van.selfContained && (
                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                                      Self-C
                                    </span>
                                  )}
                                  {van.status === 'hidden' && (
                                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                                      Hidden
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-end gap-2">
                                  {/* Edit Button */}
                                  <button
                                    onClick={() => handleEditVan(van)}
                                    className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition"
                                    title="Edit listing"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  {/* Featured Toggle */}
                                  <button
                                    onClick={() => handleToggleFeatured(van.id, van.featured)}
                                    className={`p-2 rounded-lg transition ${van.featured
                                      ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                      }`}
                                    title={van.featured ? 'Remove featured' : 'Set as featured'}
                                  >
                                    <Star className="w-4 h-4" fill={van.featured ? 'currentColor' : 'none'} />
                                  </button>
                                  {/* Visibility Toggle */}
                                  <button
                                    onClick={() => handleToggleVisibility(van.id, van.status)}
                                    className={`p-2 rounded-lg transition ${van.status === 'hidden'
                                      ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                      }`}
                                    title={van.status === 'hidden' ? 'Show listing' : 'Hide listing'}
                                  >
                                    {van.status === 'hidden' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                  </button>
                                  {/* Delete Button */}
                                  <button
                                    onClick={() => handleDeleteVan(van.id, van.title)}
                                    className="p-2 bg-gray-100 text-red-500 hover:bg-red-100 rounded-lg transition"
                                    title="Delete listing"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {filteredVans.length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <Car className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="font-medium">No listings found</p>
                        <p className="text-sm">Try adjusting your search or filters</p>
                      </div>
                    )}
                  </div>

                  {/* Summary */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <p>Showing {filteredVans.length} of {vans.length} listings</p>
                  </div>
                </div>
              )}

              {/* Users Tab */}
              {activeTab === 'users' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">User Management</h2>

                  {users.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">No users collection</h3>
                      <p className="text-gray-500 text-sm">
                        Users are managed via Firebase Auth.<br />
                        You can see their info from the listings they post.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr className="text-left text-sm text-gray-500">
                            <th className="px-4 py-3 font-medium">User</th>
                            <th className="px-4 py-3 font-medium">Email</th>
                            <th className="px-4 py-3 font-medium">Listings</th>
                            <th className="px-4 py-3 font-medium">Status</th>
                            <th className="px-4 py-3 font-medium text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map(user => (
                            <tr key={user.id} className={`border-t border-gray-100 ${user.banned ? 'bg-red-50' : ''}`}>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold">
                                    {user.displayName?.[0] || '?'}
                                  </div>
                                  <span className="font-medium text-gray-900">{user.displayName || 'No name'}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-gray-600">{user.email}</td>
                              <td className="px-4 py-3">
                                <span className="font-semibold">{vans.filter(v => v.seller?.uid === user.id).length}</span>
                              </td>
                              <td className="px-4 py-3">
                                {user.banned ? (
                                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                                    🚫 Banned
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                    ✓ Active
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => setShowBanConfirm(user)}
                                    className={`px-3 py-1 rounded-lg text-sm font-medium transition ${user.banned
                                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                                      }`}
                                  >
                                    {user.banned ? 'Unban' : 'Ban'}
                                  </button>
                                  <button
                                    onClick={() => setShowDeleteConfirm(user)}
                                    className="p-2 bg-gray-100 text-red-500 hover:bg-red-100 rounded-lg transition"
                                    title="Delete account"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Sellers from listings */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Sellers (from listings)</h3>
                    <div className="space-y-3">
                      {[...new Map(vans.map(v => [v.seller?.email, v.seller])).values()]
                        .filter(Boolean)
                        .sort((a, b) => {
                          const countA = vans.filter(v => v.seller?.email === a.email).length;
                          const countB = vans.filter(v => v.seller?.email === b.email).length;
                          return countB - countA;
                        })
                        .map((seller, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold">
                                {seller.name?.[0] || '?'}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{seller.name || 'Anonymous'}</p>
                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {seller.email}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-emerald-600 text-lg">
                                {vans.filter(v => v.seller?.email === seller.email).length}
                              </p>
                              <p className="text-xs text-gray-500">listings</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Stats Tab */}
              {activeTab === 'stats' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Detailed Statistics</h2>

                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Summary */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Summary</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Total listings</span>
                          <span className="font-bold">{stats.totalVans}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Active</span>
                          <span className="font-bold text-green-600">{stats.activeVans}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Hidden</span>
                          <span className="font-bold text-red-500">{stats.hiddenVans}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">With Buy-Back</span>
                          <span className="font-bold text-green-600">{stats.vansWithBuyBack}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Self-Contained</span>
                          <span className="font-bold text-blue-600">{stats.selfContainedVans}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Featured</span>
                          <span className="font-bold text-yellow-600">{stats.featuredVans}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Added this month</span>
                          <span className="font-bold text-emerald-600">+{stats.recentVans}</span>
                        </div>
                        <div className="flex justify-between pt-2">
                          <span className="text-gray-600 font-medium">Average price</span>
                          <span className="font-bold text-lg text-emerald-600">${stats.averagePrice?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t">
                          <span className="text-gray-600 font-medium">Total value</span>
                          <span className="font-bold text-lg">${stats.totalValue?.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* By City */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">📍 By City</h3>
                      <div className="space-y-2">
                        {Object.entries(stats.vansByCity || {})
                          .sort((a, b) => b[1] - a[1])
                          .map(([city, count]) => (
                            <div key={city} className="flex justify-between text-sm py-1">
                              <span className="text-gray-600">{city}</span>
                              <span className="font-medium">{count}</span>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* By Type */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">🚐 By Type</h3>
                      <div className="space-y-2">
                        {Object.entries(stats.vansByType || {})
                          .sort((a, b) => b[1] - a[1])
                          .map(([type, count]) => (
                            <div key={type} className="flex justify-between text-sm py-1">
                              <span className="text-gray-600 flex items-center gap-2">
                                {type === 'Van' && '🚐'}
                                {type === 'Motorhome' && '🚌'}
                                {type === 'Car' && '🚗'}
                                {type}
                              </span>
                              <span className="font-medium">{count}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>

                  {/* Price Distribution */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">💰 Price Distribution</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {[
                        { label: 'Under $5k', min: 0, max: 5000 },
                        { label: '$5k - $10k', min: 5000, max: 10000 },
                        { label: '$10k - $20k', min: 10000, max: 20000 },
                        { label: '$20k - $35k', min: 20000, max: 35000 },
                        { label: 'Over $35k', min: 35000, max: Infinity },
                      ].map(range => {
                        const count = vans.filter(v => v.price >= range.min && v.price < range.max).length;
                        const percentage = stats.totalVans > 0 ? Math.round((count / stats.totalVans) * 100) : 0;
                        return (
                          <div key={range.label} className="bg-gray-50 rounded-xl p-4 text-center">
                            <p className="text-2xl font-bold text-gray-900">{count}</p>
                            <p className="text-sm text-gray-600">{range.label}</p>
                            <p className="text-xs text-gray-400 mt-1">{percentage}%</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Ban Confirmation Modal */}
      {showBanConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="text-center mb-6">
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${showBanConfirm.banned ? 'bg-green-100' : 'bg-red-100'
                }`}>
                {showBanConfirm.banned ? (
                  <CheckCircle className="w-8 h-8 text-green-600" />
                ) : (
                  <Ban className="w-8 h-8 text-red-600" />
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {showBanConfirm.banned ? 'Unban User?' : 'Ban User?'}
              </h3>
              <p className="text-gray-600">
                {showBanConfirm.banned
                  ? `Allow ${showBanConfirm.email} to use the platform again?`
                  : `This will prevent ${showBanConfirm.email} from posting new listings.`
                }
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBanConfirm(null)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleBanUser(showBanConfirm.id, showBanConfirm.email, showBanConfirm.banned)}
                className={`flex-1 px-4 py-3 rounded-xl font-semibold transition ${showBanConfirm.banned
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
              >
                {showBanConfirm.banned ? 'Unban' : 'Ban User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 bg-red-100">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Account?</h3>
              <p className="text-gray-600 mb-3">
                Delete <strong>{showDeleteConfirm.email}</strong> permanently?
              </p>
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                This will permanently delete the account, all their listings, and cannot be undone.
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                disabled={deleting}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(showDeleteConfirm.id, showDeleteConfirm.email)}
                disabled={deleting}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}