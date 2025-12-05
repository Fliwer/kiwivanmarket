// ============================================
// ❌ RESERVATION CANCELLED PAGE
// ============================================

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  XCircle, 
  ArrowLeft, 
  RefreshCw, 
  Home,
  HelpCircle,
  Clock
} from 'lucide-react';

function ReservationCancelled() {
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
        const docRef = doc(db, 'reservations', reservationId);
        const docSnap = await getDoc(docRef);

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-400 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-lg mx-auto">
        {/* Cancelled Icon */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle size={48} className="text-amber-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Cancelled
          </h1>
          <p className="text-gray-600">
            Your payment was not completed
          </p>
        </div>

        {/* Reservation Info */}
        {reservation && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
            <div className="flex gap-4 p-6 border-b border-gray-100">
              <img
                src={reservation.van?.imageUrl || 'https://via.placeholder.com/100'}
                alt={reservation.van?.title}
                className="w-24 h-20 object-cover rounded-xl"
              />
              <div className="flex-1">
                <h2 className="font-bold text-lg text-gray-900">
                  {reservation.van?.title}
                </h2>
                <p className="text-gray-500 text-sm">
                  {reservation.van?.year} • {reservation.van?.location}
                </p>
                <p className="text-xl font-bold text-emerald-600 mt-1">
                  ${reservation.van?.price?.toLocaleString()} NZD
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="bg-amber-50 px-6 py-4">
              <div className="flex items-center gap-3">
                <Clock size={20} className="text-amber-600" />
                <div>
                  <p className="font-medium text-amber-800">Reservation pending</p>
                  <p className="text-sm text-amber-600">
                    Your reservation is still active. Complete payment within 24 hours to secure it.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 rounded-xl p-4 mb-6">
          <div className="flex gap-3">
            <HelpCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">What happened?</p>
              <p className="text-sm text-blue-700 mt-1">
                The payment process was cancelled or did not complete. Don't worry - no money has been charged to your account.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {reservation && (
            <button
              onClick={() => navigate(`/van/${reservation.vanId}`)}
              className="w-full bg-emerald-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-emerald-700 transition flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} />
              Try Again
            </button>
          )}
          
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition flex items-center justify-center gap-2"
          >
            <Home size={18} />
            Back to Home
          </button>
        </div>

        {/* Help */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Having trouble? Contact us at{' '}
          <a href="mailto:support@kiwivanmarket.com" className="text-emerald-600 hover:underline">
            support@kiwivanmarket.com
          </a>
        </p>
      </div>
    </div>
  );
}

export default ReservationCancelled;
