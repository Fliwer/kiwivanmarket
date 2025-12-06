// ============================================
// ❌ RESERVATION CANCELLED PAGE
// ============================================
// 
// Page affichée quand l'utilisateur annule le paiement
// ou quand la session Stripe expire
//
// ============================================

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { XCircle, Home, RefreshCw, HelpCircle, Loader2 } from 'lucide-react';

export default function ReservationCancelled() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);

  const reservationId = searchParams.get('id');

  useEffect(() => {
    const fetchReservation = async () => {
      if (!reservationId) {
        setLoading(false);
        return;
      }

      try {
        const docSnap = await getDoc(doc(db, 'reservations', reservationId));
        if (docSnap.exists()) {
          setReservation({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error('Error fetching reservation:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReservation();
  }, [reservationId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-gray-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-10 h-10 text-gray-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Cancelled
          </h1>
          <p className="text-gray-600">
            Your reservation has not been completed. No charges have been made.
          </p>
        </div>

        {/* Reservation Info */}
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
                <span className="font-medium text-gray-600">
                  ${reservation.depositAmount || 500} NZD
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium text-gray-500">
                  Not completed
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex gap-3">
            <HelpCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-800 mb-1">What happened?</h4>
              <p className="text-sm text-amber-700">
                You cancelled the payment or the checkout session expired. 
                The van is still available and you can try again anytime.
              </p>
            </div>
          </div>
        </div>

        {/* Why reserve? */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <h4 className="font-semibold text-blue-800 mb-2">Why reserve with a deposit?</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>✅ Your money is protected by Stripe</li>
            <li>✅ Auto-refund if seller doesn't respond in 48h</li>
            <li>✅ Secure the van before someone else does</li>
            <li>✅ Shows the seller you're serious</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
          >
            <Home size={18} />
            Back to Home
          </button>
          {reservation?.vanId && (
            <button
              onClick={() => {
                // Retourner à l'annonce du van
                navigate(`/?van=${reservation.vanId}`);
              }}
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition"
            >
              <RefreshCw size={18} />
              Try Again
            </button>
          )}
        </div>

        {/* Reservation ID */}
        {reservationId && (
          <p className="text-center text-xs text-gray-400 mt-6">
            Reference: {reservationId}
          </p>
        )}
      </div>
    </div>
  );
}