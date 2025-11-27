import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import { 
  X, Search, Filter, Trash2, Edit, Eye, EyeOff, Check, Ban, 
  Users, Car, TrendingUp, AlertTriangle, Shield, Star, 
  ChevronDown, ChevronUp, RefreshCw, Download, BarChart3,
  MapPin, Calendar, DollarSign, MessageCircle, Settings
} from 'lucide-react';

// 🔐 Liste des emails admin autorisés
const ADMIN_EMAILS = [
  'p.morthier@gmail.com', // Ton email admin
  // Ajoute d'autres admins ici
];

export default function AdminDashboard({ onClose }) {
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

  // 🔐 Vérifier si l'utilisateur est admin
  const isAdmin = currentUser && ADMIN_EMAILS.includes(currentUser.email);

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
        ...doc.data()
      }));
      setVans(vansData);

      // Charger les utilisateurs (si collection existe)
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(usersData);
      } catch (e) {
        console.log('Collection users non trouvée');
        setUsers([]);
      }

      // Calculer les stats
      calculateStats(vansData);

    } catch (error) {
      console.error('Erreur chargement données admin:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (vansData) => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    setStats({
      totalVans: vansData.length,
      activeVans: vansData.filter(v => v.status !== 'hidden' && v.status !== 'rejected').length,
      vansWithBuyBack: vansData.filter(v => v.buyBack).length,
      selfContainedVans: vansData.filter(v => v.selfContained).length,
      featuredVans: vansData.filter(v => v.featured).length,
      averagePrice: vansData.length > 0 
        ? Math.round(vansData.reduce((sum, v) => sum + (v.price || 0), 0) / vansData.length)
        : 0,
      vansByCity: vansData.reduce((acc, v) => {
        acc[v.location] = (acc[v.location] || 0) + 1;
        return acc;
      }, {}),
      vansByType: vansData.reduce((acc, v) => {
        acc[v.type] = (acc[v.type] || 0) + 1;
        return acc;
      }, {}),
      recentVans: vansData.filter(v => {
        const createdAt = v.createdAt?.toDate?.() || new Date(v.createdAt);
        return createdAt > thirtyDaysAgo;
      }).length,
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  };

  // 🚐 Actions sur les vans
  const handleToggleFeatured = async (vanId, currentStatus) => {
    try {
      await updateDoc(doc(db, 'vans', vanId), {
        featured: !currentStatus
      });
      setVans(vans.map(v => v.id === vanId ? { ...v, featured: !currentStatus } : v));
    } catch (error) {
      console.error('Erreur toggle featured:', error);
      alert('Erreur lors de la mise à jour');
    }
  };

  const handleToggleVisibility = async (vanId, currentStatus) => {
    const newStatus = currentStatus === 'hidden' ? 'active' : 'hidden';
    try {
      await updateDoc(doc(db, 'vans', vanId), {
        status: newStatus
      });
      setVans(vans.map(v => v.id === vanId ? { ...v, status: newStatus } : v));
    } catch (error) {
      console.error('Erreur toggle visibility:', error);
      alert('Erreur lors de la mise à jour');
    }
  };

  const handleDeleteVan = async (vanId) => {
    if (!window.confirm('⚠️ Supprimer cette annonce définitivement ?')) return;
    
    try {
      await deleteDoc(doc(db, 'vans', vanId));
      setVans(vans.filter(v => v.id !== vanId));
      setSelectedVan(null);
      alert('✅ Annonce supprimée');
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  // 🔍 Filtrer les vans
  const filteredVans = vans.filter(van => {
    const matchSearch = 
      van.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      van.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      van.seller?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchStatus = filterStatus === 'all' || 
      (filterStatus === 'featured' && van.featured) ||
      (filterStatus === 'buyback' && van.buyBack) ||
      (filterStatus === 'hidden' && van.status === 'hidden');
    
    return matchSearch && matchStatus;
  });

  // 🚫 Si pas admin
  if (!isAdmin) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Ban className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Accès Refusé</h2>
          <p className="text-gray-600 mb-6">
            Vous n'avez pas les permissions pour accéder au panneau d'administration.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-100 z-[100] overflow-hidden">
      {/* Header */}
      <header className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-400 text-sm">KiwiVanMarket</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl transition"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-xl transition"
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
              { id: 'overview', icon: BarChart3, label: 'Vue d\'ensemble' },
              { id: 'vans', icon: Car, label: 'Annonces', count: vans.length },
              { id: 'users', icon: Users, label: 'Utilisateurs', count: users.length },
              { id: 'stats', icon: TrendingUp, label: 'Statistiques' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition ${
                  activeTab === item.id
                    ? 'bg-emerald-50 text-emerald-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    activeTab === item.id ? 'bg-emerald-200' : 'bg-gray-200'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement des données...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Mobile Tabs */}
              <div className="flex gap-2 mb-6 overflow-x-auto md:hidden pb-2">
                {[
                  { id: 'overview', label: '📊 Overview' },
                  { id: 'vans', label: '🚐 Vans' },
                  { id: 'users', label: '👥 Users' },
                  { id: 'stats', label: '📈 Stats' },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition ${
                      activeTab === item.id
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
                  <h2 className="text-2xl font-bold text-gray-900">Vue d'ensemble</h2>
                  
                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl p-5 border border-gray-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                          <Car className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-gray-600 text-sm">Total Annonces</span>
                      </div>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalVans}</p>
                    </div>

                    <div className="bg-white rounded-2xl p-5 border border-gray-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                          <Shield className="w-5 h-5 text-green-600" />
                        </div>
                        <span className="text-gray-600 text-sm">Buy-Back</span>
                      </div>
                      <p className="text-3xl font-bold text-gray-900">{stats.vansWithBuyBack}</p>
                    </div>

                    <div className="bg-white rounded-2xl p-5 border border-gray-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                          <Star className="w-5 h-5 text-yellow-600" />
                        </div>
                        <span className="text-gray-600 text-sm">Featured</span>
                      </div>
                      <p className="text-3xl font-bold text-gray-900">{stats.featuredVans}</p>
                    </div>

                    <div className="bg-white rounded-2xl p-5 border border-gray-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-purple-600" />
                        </div>
                        <span className="text-gray-600 text-sm">Prix Moyen</span>
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
                        Annonces par ville
                      </h3>
                      <div className="space-y-3">
                        {Object.entries(stats.vansByCity || {})
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 5)
                          .map(([city, count]) => (
                            <div key={city} className="flex items-center gap-3">
                              <div className="flex-1">
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="font-medium text-gray-700">{city}</span>
                                  <span className="text-gray-500">{count}</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-emerald-500 rounded-full"
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
                        Annonces par type
                      </h3>
                      <div className="space-y-3">
                        {Object.entries(stats.vansByType || {})
                          .sort((a, b) => b[1] - a[1])
                          .map(([type, count]) => (
                            <div key={type} className="flex items-center gap-3">
                              <div className="flex-1">
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="font-medium text-gray-700">{type}</span>
                                  <span className="text-gray-500">{count}</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-blue-500 rounded-full"
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
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Dernières annonces</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left text-sm text-gray-500 border-b">
                            <th className="pb-3 font-medium">Annonce</th>
                            <th className="pb-3 font-medium">Prix</th>
                            <th className="pb-3 font-medium">Ville</th>
                            <th className="pb-3 font-medium">Vendeur</th>
                            <th className="pb-3 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {vans.slice(0, 5).map(van => (
                            <tr key={van.id} className="border-b last:border-0">
                              <td className="py-3">
                                <div className="flex items-center gap-3">
                                  <img 
                                    src={van.imageUrl || van.images?.[0]} 
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
                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                                      ⭐ Featured
                                    </span>
                                  )}
                                  {van.buyBack && (
                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                      🛡️ Buy-Back
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
                    <h2 className="text-2xl font-bold text-gray-900">Gestion des annonces</h2>
                    
                    {/* Search & Filters */}
                    <div className="flex gap-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Rechercher..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 w-64"
                        />
                      </div>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500"
                      >
                        <option value="all">Tous</option>
                        <option value="featured">⭐ Featured</option>
                        <option value="buyback">🛡️ Buy-Back</option>
                        <option value="hidden">🚫 Masqués</option>
                      </select>
                    </div>
                  </div>

                  {/* Vans Table */}
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr className="text-left text-sm text-gray-500">
                            <th className="px-4 py-3 font-medium">Annonce</th>
                            <th className="px-4 py-3 font-medium">Prix</th>
                            <th className="px-4 py-3 font-medium">Ville</th>
                            <th className="px-4 py-3 font-medium">Vendeur</th>
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
                                    src={van.imageUrl || van.images?.[0]} 
                                    alt={van.title}
                                    className="w-14 h-14 rounded-xl object-cover"
                                  />
                                  <div>
                                    <p className="font-medium text-gray-900 line-clamp-1 max-w-[200px]">{van.title}</p>
                                    <p className="text-xs text-gray-500">{van.year} • {van.mileage?.toLocaleString()} km</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className="font-bold text-gray-900">${van.price?.toLocaleString()}</span>
                              </td>
                              <td className="px-4 py-3 text-gray-600">{van.location}</td>
                              <td className="px-4 py-3">
                                <p className="text-sm text-gray-900">{van.seller?.name}</p>
                                <p className="text-xs text-gray-500">{van.seller?.email}</p>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex flex-wrap gap-1">
                                  {van.featured && (
                                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                                      Featured
                                    </span>
                                  )}
                                  {van.buyBack && (
                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                      Buy-Back
                                    </span>
                                  )}
                                  {van.selfContained && (
                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                      Self-C
                                    </span>
                                  )}
                                  {van.status === 'hidden' && (
                                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                                      Masqué
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleToggleFeatured(van.id, van.featured)}
                                    className={`p-2 rounded-lg transition ${
                                      van.featured 
                                        ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
                                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                    }`}
                                    title={van.featured ? 'Retirer featured' : 'Mettre en featured'}
                                  >
                                    <Star className="w-4 h-4" fill={van.featured ? 'currentColor' : 'none'} />
                                  </button>
                                  <button
                                    onClick={() => handleToggleVisibility(van.id, van.status)}
                                    className={`p-2 rounded-lg transition ${
                                      van.status === 'hidden'
                                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                    }`}
                                    title={van.status === 'hidden' ? 'Afficher' : 'Masquer'}
                                  >
                                    {van.status === 'hidden' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                  </button>
                                  <button
                                    onClick={() => handleDeleteVan(van.id)}
                                    className="p-2 bg-gray-100 text-red-500 hover:bg-red-100 rounded-lg transition"
                                    title="Supprimer"
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
                        Aucune annonce trouvée
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Users Tab */}
              {activeTab === 'users' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Gestion des utilisateurs</h2>
                  
                  {users.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">Pas de collection users</h3>
                      <p className="text-gray-500 text-sm">
                        Les utilisateurs sont gérés via Firebase Auth.<br/>
                        Tu peux voir leurs infos dans les annonces qu'ils postent.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr className="text-left text-sm text-gray-500">
                            <th className="px-4 py-3 font-medium">Utilisateur</th>
                            <th className="px-4 py-3 font-medium">Email</th>
                            <th className="px-4 py-3 font-medium">Annonces</th>
                            <th className="px-4 py-3 font-medium text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map(user => (
                            <tr key={user.id} className="border-t border-gray-100">
                              <td className="px-4 py-3 font-medium text-gray-900">
                                {user.displayName || 'Sans nom'}
                              </td>
                              <td className="px-4 py-3 text-gray-600">{user.email}</td>
                              <td className="px-4 py-3">
                                {vans.filter(v => v.seller?.uid === user.id).length}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button className="text-red-500 hover:text-red-700 text-sm">
                                  Bannir
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Liste des vendeurs depuis les annonces */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Vendeurs (depuis les annonces)</h3>
                    <div className="space-y-3">
                      {[...new Map(vans.map(v => [v.seller?.email, v.seller])).values()]
                        .filter(Boolean)
                        .map((seller, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold">
                                {seller.name?.[0] || '?'}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{seller.name || 'Anonyme'}</p>
                                <p className="text-sm text-gray-500">{seller.email}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">
                                {vans.filter(v => v.seller?.email === seller.email).length} annonce(s)
                              </p>
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
                  <h2 className="text-2xl font-bold text-gray-900">Statistiques détaillées</h2>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl p-6 border border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Résumé</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total annonces</span>
                          <span className="font-bold">{stats.totalVans}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Annonces actives</span>
                          <span className="font-bold">{stats.activeVans}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Avec Buy-Back</span>
                          <span className="font-bold text-green-600">{stats.vansWithBuyBack}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Self-Contained</span>
                          <span className="font-bold text-blue-600">{stats.selfContainedVans}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Featured</span>
                          <span className="font-bold text-yellow-600">{stats.featuredVans}</span>
                        </div>
                        <div className="flex justify-between border-t pt-4">
                          <span className="text-gray-600">Prix moyen</span>
                          <span className="font-bold text-emerald-600">${stats.averagePrice?.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">📍 Par ville</h3>
                      <div className="space-y-2">
                        {Object.entries(stats.vansByCity || {})
                          .sort((a, b) => b[1] - a[1])
                          .map(([city, count]) => (
                            <div key={city} className="flex justify-between text-sm">
                              <span className="text-gray-600">{city}</span>
                              <span className="font-medium">{count}</span>
                            </div>
                          ))}
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">🚐 Par type</h3>
                      <div className="space-y-2">
                        {Object.entries(stats.vansByType || {})
                          .sort((a, b) => b[1] - a[1])
                          .map(([type, count]) => (
                            <div key={type} className="flex justify-between text-sm">
                              <span className="text-gray-600">{type}</span>
                              <span className="font-medium">{count}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}