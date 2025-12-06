// ============================================
// ✅ RESERVATION SUCCESS PAGE
// ============================================
// 
// 🛡️ SÉCURITÉ: Cette page ne modifie PAS le statut de paiement
// Seul le webhook Stripe peut valider un paiement
//
// ============================================

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { CheckCircle, Clock, AlertCircle, Home, MessageCircle, Loader2, Shield } from 'lucide-react';

// Statuts des réservations
const RESERVATION_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  SELLER_CONFIRMED: 'seller_confirmed',
  BUYER_CONFIRMED: 'buyer_confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
  EXPIRED: 'expired',
  DISPUTED: 'disputed',
};

export default function ReservationSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reservationId = searchParams.get('id');

  useEffect(() => {
    if (!reservationId) {
      setError('No reservation ID provided');
      setLoading(false);
      return;
    }

    // Écouter les changements en temps réel
    const unsubscribe = onSnapshot(
      doc(db, 'reservations', reservationId),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setReservation({ id: docSnap.id, ...data });
          
          // 🛡️ SÉCURITÉ: On ne modifie RIEN ici
          // Si le statut est toujours "pending" après quelques secondes,
          // c'est que le webhook n'a pas encore été traité
          if (data.status === RESERVATION_STATUS.PENDING) {
            // Attendre que le webhook mette à jour le statut
            console.log('⏳ Waiting for webhook to confirm payment...');
          }
        } else {
          setError('Reservation not found');
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching reservation:', err);
        setError('Failed to load reservation');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [reservationId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Confirming your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
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

  const isPaid = reservation?.status === RESERVATION_STATUS.PAID || 
                 reservation?.status === RESERVATION_STATUS.SELLER_CONFIRMED ||
                 reservation?.status === RESERVATION_STATUS.BUYER_CONFIRMED ||
                 reservation?.status === RESERVATION_STATUS.COMPLETED;
  
  const isPending = reservation?.status === RESERVATION_STATUS.PENDING;

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-6">
          {isPaid ? (
            <>
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-emerald-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Payment Successful! 🎉
              </h1>
              <p className="text-gray-600">
                Your deposit has been received and is securely held.
              </p>
            </>
          ) : isPending ? (
            <>
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-10 h-10 text-amber-600 animate-pulse" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Processing Payment...
              </h1>
              <p className="text-gray-600">
                Please wait while we confirm your payment. This usually takes a few seconds.
              </p>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-10 h-10 text-gray-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Reservation Status: {reservation?.status}
              </h1>
            </>
          )}
        </div>

        {/* Reservation Details */}
        {reservation && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Reservation Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Van:</span>
                <span className="font-medium text-gray-900">{reservation.van?.title || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Deposit Amount:</span>
                <span className="font-medium text-emerald-600">
                  ${reservation.depositAmount || 500} NZD
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ${isPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {isPaid ? '✅ Confirmed' : '⏳ Processing'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Security Info */}
        {isPaid && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex gap-3">
              <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-800 mb-1">Your Money is Protected</h4>
                <p className="text-sm text-blue-700">
                  Your deposit is securely held by Stripe. The seller has 48 hours to confirm. 
                  If they don't respond, you'll be automatically refunded.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Next Steps */}
        {isPaid && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
            <h4 className="font-semibold text-emerald-800 mb-2">What's Next?</h4>
            <ol className="text-sm text-emerald-700 space-y-1 list-decimal list-inside">
              <li>The seller will be notified of your reservation</li>
              <li>They have 48 hours to confirm</li>
              <li>You'll arrange a meeting to view the van</li>
              <li>After viewing, confirm to complete the transaction</li>
            </ol>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
          >
            <Home size={18} />
            Back to Home
          </button>
          {isPaid && (
            <button
              onClick={() => {
                // Ouvrir la messagerie avec le vendeur
                navigate('/?messages=true');
              }}
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition"
            >
              <MessageCircle size={18} />
              Message Seller
            </button>
          )}
        </div>

        {/* Reservation ID */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Reservation ID: {reservationId}
        </p>
      </div>
    </div>
  );
}