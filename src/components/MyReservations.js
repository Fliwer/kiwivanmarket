import React, { useState, useEffect } from 'react';
import { X, Calendar, CreditCard, Clock, MapPin, User, CheckCircle, XCircle, AlertCircle, ChevronRight, Package, RefreshCw, Camera, Shield } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../AuthContext';
import { ConfirmMeetingButton, ConfirmBuyerButton, ConfirmationStatus } from './PhotoConfirmation';

// ============================================================
// 📦 MY RESERVATIONS PAGE - WITH DOUBLE CONFIRMATION SYSTEM
// Shows all reservations for the current user (as buyer OR seller)
// Includes photo proof confirmation for deposit release
// ============================================================

const MyReservations = ({ onClose, onViewVan }) => {
  const { currentUser, loading: authLoading } = useAuth();
  
  const [activeTab, setActiveTab] = useState('buying');
  const [buyerReservations, setBuyerReservations] = useState([]);
  const [sellerReservations, setSellerReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔄 Load reservations in real-time
  useEffect(() => {
    if (authLoading) return;
    
    if (!currentUser?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    let loadedCount = 0;
    
    const checkLoaded = () => {
      loadedCount++;
      if (loadedCount >= 2) {
        setLoading(false);
      }
    };

    const timeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

    const buyerQuery = query(
      collection(db, 'reservations'),
      where('buyerId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const sellerQuery = query(
      collection(db, 'reservations'),
      where('sellerId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubBuyer = onSnapshot(buyerQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBuyerReservations(data);
      checkLoaded();
    }, (error) => {
      console.error('Error loading buyer reservations:', error);
      checkLoaded();
    });

    const unsubSeller = onSnapshot(sellerQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSellerReservations(data);
      checkLoaded();
    }, (error) => {
      console.error('Error loading seller reservations:', error);
      checkLoaded();
    });

    return () => {
      clearTimeout(timeout);
      unsubBuyer();
      unsubSeller();
    };
  }, [currentUser?.uid, authLoading]);

  // 🎨 Status badge styling
  const getStatusStyle = (status) => {
    const styles = {
      pending: {
        bg: 'bg-amber-100',
        text: 'text-amber-700',
        icon: Clock,
        label: 'Pending Payment'
      },
      paid: {
        bg: 'bg-emerald-100',
        text: 'text-emerald-700',
        icon: CheckCircle,
        label: 'Paid - Awaiting Viewing'
      },
      confirmed: {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        icon: CheckCircle,
        label: 'Seller Confirmed'
      },
      buyer_confirmed: {
        bg: 'bg-purple-100',
        text: 'text-purple-700',
        icon: Camera,
        label: 'Buyer Confirmed'
      },
      completed: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        icon: Package,
        label: 'Completed ✓'
      },
      cancelled: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        icon: XCircle,
        label: 'Cancelled'
      },
      expired: {
        bg: 'bg-gray-100',
        text: 'text-gray-500',
        icon: AlertCircle,
        label: 'Expired'
      }
    };
    return styles[status] || styles.pending;
  };

  // 🕐 Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return '—';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-NZ', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 💰 Format price
  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const currentReservations = activeTab === 'buying' ? buyerReservations : sellerReservations;
  const buyerUnread = buyerReservations.filter(r => r.status === 'paid' || r.status === 'pending' || r.status === 'confirmed').length;
  const sellerUnread = sellerReservations.filter(r => r.status === 'paid' || r.status === 'buyer_confirmed').length;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col my-4" style={{ maxHeight: 'calc(100vh - 2rem)' }}>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 flex-shrink-0 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Calendar size={28} />
                My Reservations
              </h2>
              <p className="text-emerald-100 text-sm mt-1">
                Track your van reservations and payments
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition text-white"
            >
              <X size={24} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab('buying')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                activeTab === 'buying'
                  ? 'bg-white text-emerald-600 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <CreditCard size={18} />
              I'm Buying
              {buyerUnread > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {buyerUnread}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('selling')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                activeTab === 'selling'
                  ? 'bg-white text-emerald-600 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Package size={18} />
              I'm Selling
              {sellerUnread > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {sellerUnread}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <RefreshCw size={32} className="animate-spin text-emerald-500 mx-auto mb-3" />
                <p className="text-gray-500">Loading reservations...</p>
              </div>
            </div>
          ) : currentReservations.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Calendar size={28} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No reservations yet
              </h3>
              <p className="text-gray-500 text-sm max-w-xs mx-auto leading-relaxed">
                {activeTab === 'buying' 
                  ? "When you reserve a van, it will appear here."
                  : "When someone reserves one of your vans, it will appear here."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentReservations.map((reservation) => {
                const statusStyle = getStatusStyle(reservation.status);
                const StatusIcon = statusStyle.icon;
                
                // ✅ Récupérer l'image correctement
                const vanImage = reservation.vanImage || reservation.van?.imageUrl || reservation.van?.images?.[0] || 'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=400';
                const vanTitle = reservation.vanTitle || reservation.van?.title || 'Van Reservation';
                const vanLocation = reservation.vanLocation || reservation.van?.location;

                // Vérifier si les confirmations sont nécessaires
                const needsBuyerConfirmation = (reservation.status === 'paid' || reservation.status === 'confirmed') && !reservation.buyerConfirmed;
                const needsSellerConfirmation = reservation.buyerConfirmed && !reservation.sellerConfirmed;
                const isCompleted = reservation.buyerConfirmed && reservation.sellerConfirmed;

                return (
                  <div 
                    key={reservation.id}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-emerald-200 transition-all group"
                  >
                    {/* Layout - Flex row sur desktop, column sur mobile */}
                    <div className="flex flex-col sm:flex-row">
                      
                      {/* Van Image - Taille fixe */}
                      <div className="sm:w-48 md:w-56 flex-shrink-0">
                        <div className="relative h-48 sm:h-full w-full">
                          <img 
                            src={vanImage}
                            alt={vanTitle}
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=400';
                            }}
                          />
                          {/* Status Badge */}
                          <div className={`absolute top-3 left-3 ${statusStyle.bg} ${statusStyle.text} px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow`}>
                            <StatusIcon size={12} />
                            {statusStyle.label}
                          </div>
                        </div>
                      </div>

                      {/* Content - Flex grow */}
                      <div className="flex-1 p-4 sm:p-5 min-w-0">
                        <div className="flex flex-col h-full">
                          
                          {/* Title & Deposit */}
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-gray-900 text-lg group-hover:text-emerald-600 transition-colors truncate">
                                {vanTitle}
                              </h3>
                              {vanLocation && (
                                <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                                  <MapPin size={14} className="flex-shrink-0" />
                                  <span className="truncate">{vanLocation}</span>
                                </div>
                              )}
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-xs text-gray-400 uppercase tracking-wide">Deposit</div>
                              <div className="text-xl font-bold text-emerald-600">
                                {formatPrice(reservation.depositAmount)}
                              </div>
                            </div>
                          </div>

                          {/* Details Grid */}
                          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 mb-3">
                            <div className="bg-gray-50 rounded-lg px-3 py-2">
                              <div className="text-xs text-gray-400 uppercase tracking-wide">
                                {activeTab === 'buying' ? 'Seller' : 'Buyer'}
                              </div>
                              <div className="font-semibold text-gray-800 text-sm flex items-center gap-1.5 mt-0.5 truncate">
                                <User size={14} className="text-gray-400 flex-shrink-0" />
                                <span className="truncate">
                                  {activeTab === 'buying' 
                                    ? (reservation.sellerName || 'Seller')
                                    : (reservation.buyerName || 'Buyer')}
                                </span>
                              </div>
                            </div>
                            <div className="bg-gray-50 rounded-lg px-3 py-2">
                              <div className="text-xs text-gray-400 uppercase tracking-wide">Reserved</div>
                              <div className="font-semibold text-gray-800 text-sm mt-0.5 truncate">
                                {formatDate(reservation.createdAt)}
                              </div>
                            </div>
                            {reservation.paidAt && (
                              <div className="bg-emerald-50 rounded-lg px-3 py-2 col-span-2 lg:col-span-1">
                                <div className="text-xs text-emerald-600 uppercase tracking-wide">Paid</div>
                                <div className="font-semibold text-emerald-700 text-sm mt-0.5 truncate">
                                  {formatDate(reservation.paidAt)}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* 📸 CONFIRMATION STATUS */}
                          {(reservation.status === 'paid' || reservation.status === 'confirmed' || reservation.status === 'buyer_confirmed' || reservation.status === 'completed') && (
                            <div className="mb-3">
                              <ConfirmationStatus reservation={reservation} />
                            </div>
                          )}

                          {/* Full Van Price */}
                          {(reservation.vanPrice || reservation.van?.price) && (
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                              <span className="text-sm text-gray-500">Full van price:</span>
                              <span className="font-bold text-gray-900">
                                {formatPrice(reservation.vanPrice || reservation.van?.price)}
                              </span>
                            </div>
                          )}

                          {/* Action Button */}
                          {reservation.vanId && onViewVan && (
                            <button
                              onClick={() => onViewVan(reservation.vanId)}
                              className="mt-3 w-full sm:w-auto sm:self-end flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg font-semibold text-sm hover:bg-emerald-100 transition"
                            >
                              View Van
                              <ChevronRight size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status Bar for Pending */}
                    {reservation.status === 'pending' && activeTab === 'buying' && (
                      <div className="bg-amber-50 border-t border-amber-200 px-4 sm:px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-amber-700">
                          <AlertCircle size={16} className="flex-shrink-0" />
                          <span className="text-sm font-medium">Payment pending - complete to secure your reservation</span>
                        </div>
                        {reservation.checkoutUrl && (
                          <a 
                            href={reservation.checkoutUrl}
                            className="px-4 py-1.5 bg-amber-500 text-white rounded-lg text-sm font-semibold hover:bg-amber-600 transition text-center"
                          >
                            Pay Now
                          </a>
                        )}
                      </div>
                    )}

                    {/* 📸 BUYER CONFIRMATION BUTTON */}
                    {(reservation.status === 'paid' || reservation.status === 'confirmed') && activeTab === 'buying' && !reservation.buyerConfirmed && (
                      <div className="bg-emerald-50 border-t border-emerald-200 px-4 sm:px-5 py-4">
                        <div className="flex items-start gap-3 mb-3">
                          <Camera className="text-emerald-600 flex-shrink-0 mt-0.5" size={20} />
                          <div>
                            <p className="font-semibold text-emerald-800">Have you seen the van?</p>
                            <p className="text-sm text-emerald-600">Upload a photo of the van with <strong>license plate visible</strong> to confirm your viewing.</p>
                          </div>
                        </div>
                        <ConfirmMeetingButton reservation={reservation} />
                      </div>
                    )}

                    {/* ✅ BUYER CONFIRMED - Waiting for seller */}
                    {reservation.buyerConfirmed && !reservation.sellerConfirmed && activeTab === 'buying' && (
                      <div className="bg-purple-50 border-t border-purple-200 px-4 sm:px-5 py-3 flex items-center gap-2 text-purple-700">
                        <CheckCircle size={16} className="flex-shrink-0" />
                        <span className="text-sm font-medium">
                          ✓ You confirmed viewing. Waiting for seller to confirm and release deposit...
                        </span>
                      </div>
                    )}

                    {/* Status Bar for Seller - New Paid Reservation */}
                    {reservation.status === 'paid' && activeTab === 'selling' && !reservation.buyerConfirmed && (
                      <div className="bg-emerald-50 border-t border-emerald-200 px-4 sm:px-5 py-3 flex items-center gap-2 text-emerald-700">
                        <CheckCircle size={16} className="flex-shrink-0" />
                        <span className="text-sm font-medium">
                          🎉 New reservation! Contact the buyer to arrange the viewing.
                        </span>
                      </div>
                    )}

                    {/* 🛡️ SELLER CONFIRMATION BUTTON */}
                    {reservation.buyerConfirmed && !reservation.sellerConfirmed && activeTab === 'selling' && (
                      <div className="bg-blue-50 border-t border-blue-200 px-4 sm:px-5 py-4">
                        <div className="flex items-start gap-3 mb-3">
                          <Shield className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                          <div>
                            <p className="font-semibold text-blue-800">Buyer has confirmed viewing!</p>
                            <p className="text-sm text-blue-600">Check if the photo shows your van with the correct license plate.</p>
                          </div>
                        </div>
                        {reservation.buyerConfirmationPhoto && (
                          <div className="mb-3">
                            <p className="text-xs text-blue-600 mb-2 font-medium">📸 Buyer's photo proof:</p>
                            <img 
                              src={reservation.buyerConfirmationPhoto} 
                              alt="Buyer confirmation" 
                              className="w-full max-w-xs h-32 object-cover rounded-lg border-2 border-blue-200"
                            />
                          </div>
                        )}
                        <ConfirmBuyerButton reservation={reservation} />
                      </div>
                    )}

                    {/* ✅ COMPLETED - Both confirmed */}
                    {reservation.buyerConfirmed && reservation.sellerConfirmed && (
                      <div className="bg-green-50 border-t border-green-200 px-4 sm:px-5 py-3 flex items-center gap-2 text-green-700">
                        <CheckCircle size={16} className="flex-shrink-0" />
                        <span className="text-sm font-medium">
                          ✅ Transaction complete! Deposit of {formatPrice(reservation.depositAmount)} has been released.
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex-shrink-0 rounded-b-2xl">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {activeTab === 'buying' 
                ? `${buyerReservations.length} reservation${buyerReservations.length !== 1 ? 's' : ''} as buyer`
                : `${sellerReservations.length} reservation${sellerReservations.length !== 1 ? 's' : ''} as seller`}
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-300 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyReservations;