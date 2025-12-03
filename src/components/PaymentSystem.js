// ============================================
// 💳 PAYMENT SYSTEM - Système de réservation avec Stripe
// ============================================
// 
// Ce composant gère :
// - Le bouton de réservation
// - Le modal de confirmation
// - L'intégration Stripe Checkout
// - L'affichage du statut de réservation
//
// ============================================

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Shield, 
  CheckCircle, 
  X, 
  AlertCircle, 
  Clock,
  Lock,
  ArrowRight,
  Loader2,
  Calendar,
  DollarSign,
  Info,
  Phone,
  Mail
} from 'lucide-react';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import { 
  getPaymentSummary, 
  PAYMENT_CONFIG, 
  RESERVATION_STATUS,
  RESERVATION_STATUS_LABELS,
  API_ENDPOINTS 
} from '../stripeConfig';

// ============================================
// 🔘 RESERVE BUTTON - Bouton principal de réservation
// ============================================

export function ReserveButton({ van, seller, onReservationCreated, className = '' }) {
  const { currentUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [existingReservation, setExistingReservation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Vérifier s'il existe déjà une réservation active
  useEffect(() => {
    const checkExistingReservation = async () => {
      if (!currentUser || !van?.id) {
        setLoading(false);
        return;
      }

      try {
        // Vérifier si l'utilisateur a déjà réservé ce van
        const userReservationQuery = query(
          collection(db, 'reservations'),
          where('vanId', '==', van.id),
          where('buyerId', '==', currentUser.uid),
          where('status', 'in', [RESERVATION_STATUS.PENDING, RESERVATION_STATUS.PAID, RESERVATION_STATUS.CONFIRMED])
        );
        
        const userSnapshot = await getDocs(userReservationQuery);
        
        if (!userSnapshot.empty) {
          setExistingReservation({
            id: userSnapshot.docs[0].id,
            ...userSnapshot.docs[0].data()
          });
        } else {
          // Vérifier si quelqu'un d'autre a réservé
          const anyReservationQuery = query(
            collection(db, 'reservations'),
            where('vanId', '==', van.id),
            where('status', 'in', [RESERVATION_STATUS.PAID, RESERVATION_STATUS.CONFIRMED])
          );
          
          const anySnapshot = await getDocs(anyReservationQuery);
          
          if (!anySnapshot.empty) {
            setExistingReservation({
              id: anySnapshot.docs[0].id,
              ...anySnapshot.docs[0].data(),
              isOtherUser: true
            });
          }
        }
      } catch (err) {
        console.error('Error checking reservation:', err);
      } finally {
        setLoading(false);
      }
    };

    checkExistingReservation();
  }, [currentUser, van?.id]);

  // Ne pas afficher si pas connecté
  if (!currentUser) {
    return (
      <div className="bg-gray-100 rounded-xl p-4 text-center">
        <Lock size={24} className="text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600 text-sm">Sign in to reserve this van</p>
      </div>
    );
  }

  // Ne pas afficher si c'est le vendeur
  if (currentUser.uid === seller?.uid) {
    return null;
  }

  // Loading
  if (loading) {
    return (
      <div className="bg-gray-100 rounded-xl p-4 text-center">
        <Loader2 size={24} className="text-gray-400 mx-auto mb-2 animate-spin" />
        <p className="text-gray-500 text-sm">Checking availability...</p>
      </div>
    );
  }

  // Van déjà réservé par quelqu'un d'autre
  if (existingReservation?.isOtherUser) {
    return (
      <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 text-center">
        <Clock size={24} className="text-amber-500 mx-auto mb-2" />
        <p className="text-amber-700 font-semibold">This van is currently reserved</p>
        <p className="text-amber-600 text-sm mt-1">Check back later or contact the seller</p>
      </div>
    );
  }

  // L'utilisateur a déjà une réservation
  if (existingReservation && !existingReservation.isOtherUser) {
    const statusInfo = RESERVATION_STATUS_LABELS[existingReservation.status] || {};
    
    return (
      <div className={`bg-${statusInfo.color}-50 border-2 border-${statusInfo.color}-200 rounded-xl p-4`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{statusInfo.icon}</span>
            <span className={`font-semibold text-${statusInfo.color}-700`}>{statusInfo.label}</span>
          </div>
          <span className="text-xs text-gray-500">
            Ref: {existingReservation.id.slice(0, 8).toUpperCase()}
          </span>
        </div>
        
        {existingReservation.status === RESERVATION_STATUS.PENDING && (
          <button
            onClick={() => setShowModal(true)}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition flex items-center justify-center gap-2"
          >
            <CreditCard size={18} />
            Complete Payment
          </button>
        )}
        
        {existingReservation.status === RESERVATION_STATUS.PAID && (
          <p className="text-sm text-blue-600 text-center">
            Waiting for seller confirmation. They will contact you soon!
          </p>
        )}
        
        {existingReservation.status === RESERVATION_STATUS.CONFIRMED && (
          <div className="text-sm text-green-600 text-center">
            <p className="font-semibold mb-1">✅ Reservation confirmed!</p>
            <p>Contact the seller to arrange the viewing and finalize the sale.</p>
          </div>
        )}
      </div>
    );
  }

  // Bouton de réservation normal
  const summary = getPaymentSummary(van.price);

  return (
    <>
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 border-2 border-emerald-200">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-bold text-gray-900 flex items-center gap-2">
            <Shield size={18} className="text-emerald-600" />
            Secure Reservation
          </h4>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Lock size={12} />
            Stripe Secured
          </div>
        </div>

        <div className="bg-white rounded-xl p-3 mb-3 border border-emerald-100">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Reservation deposit</span>
            <span className="text-xl font-bold text-emerald-600">{summary.formattedDeposit}</span>
          </div>
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>Remaining to pay at pickup</span>
            <span>{summary.formattedRemaining}</span>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3.5 rounded-xl font-bold text-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
        >
          <CreditCard size={20} />
          Reserve Now
          <ArrowRight size={18} />
        </button>

        <p className="text-xs text-gray-500 text-center mt-2 flex items-center justify-center gap-1">
          <Info size={12} />
          Deposit is deducted from final price
        </p>
      </div>

      {/* Modal de confirmation */}
      {showModal && (
        <ReservationModal
          van={van}
          seller={seller}
          existingReservation={existingReservation}
          onClose={() => setShowModal(false)}
          onSuccess={(reservation) => {
            setExistingReservation(reservation);
            if (onReservationCreated) onReservationCreated(reservation);
          }}
        />
      )}
    </>
  );
}

// ============================================
// 📋 RESERVATION MODAL - Modal de confirmation et paiement
// ============================================

function ReservationModal({ van, seller, existingReservation, onClose, onSuccess }) {
  const { currentUser } = useAuth();
  const [step, setStep] = useState(existingReservation ? 'payment' : 'confirm');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reservation, setReservation] = useState(existingReservation);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const summary = getPaymentSummary(van.price);

  // Créer la réservation dans Firestore
  const createReservation = async () => {
    if (!agreedToTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Créer la réservation
      const reservationData = {
        vanId: van.id,
        van: {
          id: van.id,
          title: van.title,
          price: van.price,
          imageUrl: van.imageUrl || van.images?.[0],
          location: van.location,
          year: van.year,
        },
        sellerId: seller.uid,
        sellerName: seller.name || 'Seller',
        sellerEmail: seller.email || '',
        buyerId: currentUser.uid,
        buyerName: currentUser.displayName || 'Buyer',
        buyerEmail: currentUser.email,
        depositAmount: summary.deposit,
        platformFee: summary.platformFee,
        sellerPayout: summary.sellerPayout,
        remainingBalance: summary.remainingBalance,
        currency: 'NZD',
        status: RESERVATION_STATUS.PENDING,
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Expire dans 24h si pas payé
        validUntil: new Date(Date.now() + PAYMENT_CONFIG.RESERVATION_VALIDITY_DAYS * 24 * 60 * 60 * 1000),
      };

      const docRef = await addDoc(collection(db, 'reservations'), reservationData);
      
      const newReservation = {
        id: docRef.id,
        ...reservationData,
      };

      setReservation(newReservation);
      setStep('payment');
      
    } catch (err) {
      console.error('Error creating reservation:', err);
      setError('Failed to create reservation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Lancer le paiement Stripe
  const handlePayment = async () => {
    if (!reservation) return;

    setLoading(true);
    setError(null);

    try {
      // Appeler la Firebase Function pour créer une session Checkout
      const response = await fetch(API_ENDPOINTS.CREATE_CHECKOUT_SESSION, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reservationId: reservation.id,
          vanId: van.id,
          vanTitle: van.title,
          amount: summary.deposit * 100, // Stripe utilise les centimes
          currency: 'nzd',
          buyerEmail: currentUser.email,
          successUrl: `${window.location.origin}/reservation-success?id=${reservation.id}`,
          cancelUrl: `${window.location.origin}/reservation-cancelled?id=${reservation.id}`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();

      // Rediriger vers Stripe Checkout en utilisant l'URL directement
      // (redirectToCheckout est déprécié)
      window.location.href = url;

    } catch (err) {
      console.error('Payment error:', err);
      setError('Payment failed. Please try again.');
      setLoading(false);
    }
  };

  // Simuler le paiement (pour les tests sans Stripe)
  const handleTestPayment = async () => {
    if (!reservation) return;

    setLoading(true);
    setError(null);

    try {
      // Mettre à jour le statut de la réservation
      await updateDoc(doc(db, 'reservations', reservation.id), {
        status: RESERVATION_STATUS.PAID,
        paidAt: serverTimestamp(),
        paymentMethod: 'test',
      });

      const updatedReservation = {
        ...reservation,
        status: RESERVATION_STATUS.PAID,
      };

      setReservation(updatedReservation);
      setStep('success');
      
      if (onSuccess) {
        onSuccess(updatedReservation);
      }

    } catch (err) {
      console.error('Test payment error:', err);
      setError('Failed to process test payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              {step === 'confirm' && <><Shield size={22} /> Reserve this Van</>}
              {step === 'payment' && <><CreditCard size={22} /> Complete Payment</>}
              {step === 'success' && <><CheckCircle size={22} /> Success!</>}
            </h3>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition">
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          
          {/* Van Summary */}
          <div className="flex gap-4 mb-5 pb-5 border-b border-gray-200">
            <img 
              src={van.imageUrl || van.images?.[0] || 'https://via.placeholder.com/100'} 
              alt={van.title}
              className="w-24 h-20 object-cover rounded-xl"
            />
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 line-clamp-1">{van.title}</h4>
              <p className="text-sm text-gray-500">{van.year} • {van.location}</p>
              <p className="text-xl font-bold text-emerald-600 mt-1">
                ${van.price?.toLocaleString()} NZD
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {/* Step: Confirm */}
          {step === 'confirm' && (
            <>
              {/* Payment Breakdown */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <h5 className="font-semibold text-gray-900 mb-3">Payment Summary</h5>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reservation deposit</span>
                    <span className="font-semibold">{summary.formattedDeposit}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Platform fee ({PAYMENT_CONFIG.PLATFORM_FEE_PERCENTAGE}%)</span>
                    <span>{summary.formattedFee}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Seller receives</span>
                    <span>{summary.formattedSellerPayout}</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between">
                    <span className="text-gray-600">Remaining at pickup</span>
                    <span className="font-semibold">{summary.formattedRemaining}</span>
                  </div>
                </div>
              </div>

              {/* How it works */}
              <div className="bg-blue-50 rounded-xl p-4 mb-4">
                <h5 className="font-semibold text-blue-900 mb-2 text-sm">How it works</h5>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="font-bold">1.</span>
                    Pay the deposit to reserve the van
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">2.</span>
                    The seller confirms and contacts you
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">3.</span>
                    Meet, inspect the van, and pay the remaining balance
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">4.</span>
                    Complete the sale directly with the seller
                  </li>
                </ul>
              </div>

              {/* Terms */}
              <label className="flex items-start gap-3 mb-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-5 h-5 mt-0.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs text-gray-600">
                  I agree to the <a href="#" className="text-emerald-600 underline">Terms of Use</a> and understand that 
                  the deposit is non-refundable if I cancel after the seller confirms. The remaining 
                  balance is paid directly to the seller.
                </span>
              </label>

              {/* Button */}
              <button
                onClick={createReservation}
                disabled={loading || !agreedToTerms}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3.5 rounded-xl font-bold hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Creating reservation...
                  </>
                ) : (
                  <>
                    Continue to Payment
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </>
          )}

          {/* Step: Payment */}
          {step === 'payment' && reservation && (
            <>
              <div className="bg-amber-50 rounded-xl p-4 mb-4 border border-amber-200">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={18} className="text-amber-600" />
                  <span className="font-semibold text-amber-800">Reservation created!</span>
                </div>
                <p className="text-sm text-amber-700">
                  Reference: <strong>{reservation.id.slice(0, 8).toUpperCase()}</strong>
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  Complete payment within 24 hours to secure your reservation.
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Amount to pay now</span>
                  <span className="text-2xl font-bold text-emerald-600">{summary.formattedDeposit}</span>
                </div>
              </div>

              {/* Real Stripe Payment Button */}
              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 rounded-xl font-bold hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 mb-3"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Connecting to Stripe...
                  </>
                ) : (
                  <>
                    <CreditCard size={20} />
                    Pay with Stripe
                    <Lock size={16} />
                  </>
                )}
              </button>

              {/* Test Payment Button (dev only) */}
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={handleTestPayment}
                  disabled={loading}
                  className="w-full bg-gray-200 text-gray-700 py-2 rounded-xl font-medium hover:bg-gray-300 transition flex items-center justify-center gap-2 text-sm"
                >
                  🧪 Test Payment (Dev Only)
                </button>
              )}

              <p className="text-xs text-gray-500 text-center mt-3 flex items-center justify-center gap-1">
                <Lock size={12} />
                Secured by Stripe • 256-bit encryption
              </p>
            </>
          )}

          {/* Step: Success */}
          {step === 'success' && (
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={40} className="text-emerald-600" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h4>
              <p className="text-gray-600 mb-4">
                Your reservation is confirmed. The seller has been notified and will contact you soon.
              </p>
              
              <div className="bg-gray-50 rounded-xl p-4 mb-4 text-left">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Reference:</strong> {reservation?.id.slice(0, 8).toUpperCase()}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Deposit paid:</strong> {summary.formattedDeposit}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Remaining to pay:</strong> {summary.formattedRemaining}
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// 📊 RESERVATION STATUS BADGE
// ============================================

export function ReservationBadge({ status, small = false }) {
  const info = RESERVATION_STATUS_LABELS[status] || { 
    label: 'Unknown', 
    color: 'gray', 
    icon: '❓' 
  };

  if (small) {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-${info.color}-100 text-${info.color}-700`}>
        {info.icon} {info.label}
      </span>
    );
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-${info.color}-50 border border-${info.color}-200`}>
      <span className="text-lg">{info.icon}</span>
      <span className={`font-semibold text-${info.color}-700`}>{info.label}</span>
    </div>
  );
}

// ============================================
// 📋 MY RESERVATIONS - Liste des réservations de l'utilisateur
// ============================================

export function MyReservations({ onClose, onVanClick }) {
  const { currentUser } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, buyer, seller

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    // Écouter les réservations en temps réel
    const buyerQuery = query(
      collection(db, 'reservations'),
      where('buyerId', '==', currentUser.uid)
    );

    const sellerQuery = query(
      collection(db, 'reservations'),
      where('sellerId', '==', currentUser.uid)
    );

    const loadReservations = async () => {
      try {
        const [buyerSnapshot, sellerSnapshot] = await Promise.all([
          getDocs(buyerQuery),
          getDocs(sellerQuery)
        ]);

        const buyerReservations = buyerSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          role: 'buyer'
        }));

        const sellerReservations = sellerSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          role: 'seller'
        }));

        // Combiner et trier par date
        const allReservations = [...buyerReservations, ...sellerReservations]
          .sort((a, b) => {
            const dateA = a.createdAt?.toDate?.() || new Date(0);
            const dateB = b.createdAt?.toDate?.() || new Date(0);
            return dateB - dateA;
          });

        setReservations(allReservations);
      } catch (err) {
        console.error('Error loading reservations:', err);
      } finally {
        setLoading(false);
      }
    };

    loadReservations();
  }, [currentUser]);

  const filteredReservations = reservations.filter(r => {
    if (filter === 'all') return true;
    return r.role === filter;
  });

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-NZ', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Reservations</h2>
            <p className="text-sm text-gray-500">{reservations.length} total</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X size={24} />
          </button>
        </div>

        {/* Filters */}
        <div className="px-6 py-3 border-b bg-gray-50">
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'All' },
              { key: 'buyer', label: 'As Buyer' },
              { key: 'seller', label: 'As Seller' },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                  filter === f.key
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 size={32} className="animate-spin text-emerald-600 mx-auto mb-4" />
              <p className="text-gray-500">Loading reservations...</p>
            </div>
          ) : filteredReservations.length === 0 ? (
            <div className="text-center py-12">
              <Calendar size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No reservations yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReservations.map(reservation => (
                <div 
                  key={reservation.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition"
                >
                  <div className="flex gap-4">
                    <img
                      src={reservation.van?.imageUrl || 'https://via.placeholder.com/100'}
                      alt={reservation.van?.title}
                      className="w-24 h-20 object-cover rounded-lg cursor-pointer"
                      onClick={() => onVanClick && onVanClick(reservation.van)}
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h4 className="font-bold text-gray-900 line-clamp-1">
                            {reservation.van?.title}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {reservation.role === 'buyer' ? 'Seller' : 'Buyer'}: {' '}
                            <span className="font-medium">
                              {reservation.role === 'buyer' ? reservation.sellerName : reservation.buyerName}
                            </span>
                          </p>
                        </div>
                        <ReservationBadge status={reservation.status} small />
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-500">
                          {formatDate(reservation.createdAt)}
                        </span>
                        <span className="font-semibold text-emerald-600">
                          Deposit: ${reservation.depositAmount?.toLocaleString()} NZD
                        </span>
                      </div>

                      {/* Actions for seller */}
                      {reservation.role === 'seller' && reservation.status === RESERVATION_STATUS.PAID && (
                        <div className="mt-3 flex gap-2">
                          <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition">
                            ✓ Confirm
                          </button>
                          <button className="px-4 py-2 bg-red-100 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-200 transition">
                            ✗ Decline
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Export default
export default {
  ReserveButton,
  ReservationBadge,
  MyReservations,
};