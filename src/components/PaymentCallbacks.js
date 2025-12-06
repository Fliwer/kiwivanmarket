// ============================================
// 🎉 PAYMENT CALLBACKS - Pages après paiement Stripe
// ============================================
// 
// Ces composants sont affichés après le retour de Stripe Checkout
// Ils mettent à jour le statut et affichent le résultat à l'utilisateur
//
// ============================================

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { CheckCircle, XCircle, Loader2, Home, MessageCircle, ArrowRight } from 'lucide-react';
import { RESERVATION_STATUS } from '../stripeConfig';

// ============================================
// ✅ SUCCESS PAGE - Paiement réussi
// ============================================

export function ReservationSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reservationId = searchParams.get('id');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!reservationId) {
        setError('No reservation ID provided');
        setLoading(false);
        return;
      }

      try {
        // Récupérer la réservation
        const reservationDoc = await getDoc(doc(db, 'reservations', reservationId));
        
        if (!reservationDoc.exists()) {
          setError('Reservation not found');
          setLoading(false);
          return;
        }

        const reservationData = reservationDoc.data();

        // 🔒 SÉCURITÉ: Ne JAMAIS modifier le statut côté client
        // Le statut "paid" ne peut être défini que par le webhook Stripe
        // On affiche simplement les données actuelles
        
        if (reservationData.status === RESERVATION_STATUS.PENDING) {
          // Attendre un peu que le webhook se déclenche
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          // Re-vérifier le statut (le webhook a peut-être mis à jour)
          const updatedDoc = await getDoc(doc(db, 'reservations', reservationId));
          const updatedData = updatedDoc.data();
          
          if (updatedData.status === RESERVATION_STATUS.PENDING) {
            // Le webhook n'a pas encore traité - informer l'utilisateur
            setError('Payment is being processed. Please refresh in a few moments or contact support if this persists.');
            setLoading(false);
            return;
          }
          
          setReservation({
            id: reservationId,
            ...updatedData,
          });
        } else {
          setReservation({
            id: reservationId,
            ...reservationData,
          });
        }

      } catch (err) {
        console.error('Error verifying payment:', err);
        setError('Failed to verify payment. Please contact support.');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [reservationId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-emerald-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">Verifying your payment...</h2>
          <p className="text-gray-500 mt-2">This may take a few seconds</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
          <XCircle size={64} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-8">
        {/* Success Icon */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={48} className="text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600">Your reservation has been confirmed</p>
        </div>

        {/* Reservation Details */}
        {reservation && (
          <div className="bg-gray-50 rounded-xl p-5 mb-6">
            <div className="flex gap-4 mb-4">
              <img
                src={reservation.van?.imageUrl || 'https://via.placeholder.com/100'}
                alt={reservation.van?.title}
                className="w-24 h-20 object-cover rounded-lg"
              />
              <div>
                <h3 className="font-bold text-gray-900">{reservation.van?.title}</h3>
                <p className="text-sm text-gray-500">{reservation.van?.location}</p>
                <p className="text-emerald-600 font-semibold mt-1">
                  ${reservation.van?.price?.toLocaleString()} NZD
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Reference</span>
                <span className="font-mono font-semibold">
                  {reservationId?.slice(0, 8).toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Deposit paid</span>
                <span className="font-semibold text-emerald-600">
                  ${reservation.depositAmount?.toLocaleString()} NZD
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Remaining to pay</span>
                <span className="font-semibold">
                  ${reservation.remainingBalance?.toLocaleString()} NZD
                </span>
              </div>
            </div>
          </div>
        )}

        {/* What's Next */}
        <div className="bg-blue-50 rounded-xl p-4 mb-6">
          <h4 className="font-semibold text-blue-900 mb-2">What happens next?</h4>
          <ul className="text-sm text-blue-700 space-y-2">
            <li className="flex items-start gap-2">
              <span className="font-bold">1.</span>
              The seller has been notified of your reservation
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">2.</span>
              They will confirm and contact you to arrange a viewing
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">3.</span>
              Meet the seller, inspect the van, and pay the remaining balance
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/')}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition flex items-center justify-center gap-2"
          >
            <MessageCircle size={20} />
            Message the Seller
            <ArrowRight size={18} />
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition flex items-center justify-center gap-2"
          >
            <Home size={20} />
            Return to Home
          </button>
        </div>

        {/* Receipt Note */}
        <p className="text-xs text-gray-500 text-center mt-4">
          A receipt has been sent to your email address
        </p>
      </div>
    </div>
  );
}

// ============================================
// ❌ CANCELLED PAGE - Paiement annulé
// ============================================

export function ReservationCancelled() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);

  const reservationId = searchParams.get('id');

  useEffect(() => {
    const loadReservation = async () => {
      if (!reservationId) {
        setLoading(false);
        return;
      }

      try {
        const reservationDoc = await getDoc(doc(db, 'reservations', reservationId));
        
        if (reservationDoc.exists()) {
          setReservation({
            id: reservationId,
            ...reservationDoc.data(),
          });
        }
      } catch (err) {
        console.error('Error loading reservation:', err);
      } finally {
        setLoading(false);
      }
    };

    loadReservation();
  }, [reservationId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <Loader2 size={48} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
        {/* Icon */}
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle size={48} className="text-amber-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Cancelled</h1>
        <p className="text-gray-600 mb-6">
          Your payment was not completed. The van is still available if you'd like to try again.
        </p>

        {/* Reservation Info */}
        {reservation && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
            <div className="flex gap-3">
              <img
                src={reservation.van?.imageUrl || 'https://via.placeholder.com/80'}
                alt={reservation.van?.title}
                className="w-16 h-14 object-cover rounded-lg"
              />
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">{reservation.van?.title}</h3>
                <p className="text-xs text-gray-500">{reservation.van?.location}</p>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left">
          <p className="text-sm text-blue-700">
            <strong>Don't worry!</strong> Your reservation is saved for 24 hours. 
            You can complete the payment anytime before it expires.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/')}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition"
          >
            Try Again
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition flex items-center justify-center gap-2"
          >
            <Home size={20} />
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 🔗 ROUTES CONFIGURATION
// ============================================

// Ajoute ces routes dans ton App.js ou router :
/*
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ReservationSuccess, ReservationCancelled } from './components/PaymentCallbacks';

<Routes>
  <Route path="/" element={<App />} />
  <Route path="/reservation-success" element={<ReservationSuccess />} />
  <Route path="/reservation-cancelled" element={<ReservationCancelled />} />
</Routes>
*/

export default { ReservationSuccess, ReservationCancelled };