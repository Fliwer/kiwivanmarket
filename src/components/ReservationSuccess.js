// ============================================
// ✅ RESERVATION SUCCESS PAGE
// ============================================

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  CheckCircle, 
  ArrowRight, 
  Mail, 
  Clock,
  Home,
  MessageCircle,
  DollarSign
} from 'lucide-react';

function ReservationSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);

  const reservationId = searchParams.get('id');

  // ⚡ Cacher le loader initial
  useEffect(() => {
    const loader = document.getElementById('app-loader');
    if (loader) {
      loader.classList.add('fade-out');
      setTimeout(() => loader.remove(), 500);
    }
  }, []);

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
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle size={48} className="text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Successful! 🎉
          </h1>
          <p className="text-gray-600">
            Your reservation deposit has been received
          </p>
        </div>

        {/* Reservation Details Card */}
        {reservation && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
            {/* Van Image & Info */}
            <div className="flex gap-4 p-6 border-b border-gray-100">
              <img
                src={reservation.van?.imageUrl || 'https://via.placeholder.com/120'}
                alt={reservation.van?.title}
                className="w-28 h-24 object-cover rounded-xl"
              />
              <div className="flex-1">
                <h2 className="font-bold text-xl text-gray-900">
                  {reservation.van?.title}
                </h2>
                <p className="text-gray-500">
                  {reservation.van?.year} • {reservation.van?.location}
                </p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  ${reservation.van?.price?.toLocaleString()} NZD
                </p>
              </div>
            </div>

            {/* Reference */}
            <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-100">
              <div className="flex items-center justify-between">
                <span className="text-emerald-700 font-medium">Reference Number</span>
                <span className="font-mono font-bold text-emerald-800 text-lg">
                  {reservation.id.slice(0, 8).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="p-6 space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <DollarSign size={18} className="text-emerald-600" />
                Payment Summary
              </h3>
              
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Deposit paid</span>
                  <span className="font-bold text-emerald-600">
                    ${reservation.depositAmount?.toLocaleString()} NZD
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Platform fee</span>
                  <span className="text-gray-500">
                    ${reservation.platformFee?.toLocaleString()} NZD
                  </span>
                </div>
                <hr />
                <div className="flex justify-between">
                  <span className="text-gray-600">Remaining at pickup</span>
                  <span className="font-bold text-gray-900">
                    ${reservation.remainingBalance?.toLocaleString()} NZD
                  </span>
                </div>
              </div>
            </div>

            {/* Seller Info */}
            <div className="p-6 border-t border-gray-100">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <Mail size={18} className="text-emerald-600" />
                Seller Contact
              </h3>
              
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="font-medium text-blue-900">{reservation.sellerName}</p>
                <p className="text-blue-700 text-sm">{reservation.sellerEmail}</p>
                <p className="text-blue-600 text-xs mt-2">
                  The seller has been notified and will contact you soon to arrange the viewing.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock size={20} className="text-emerald-600" />
            What happens next?
          </h3>
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-emerald-600 font-bold text-sm">1</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Seller confirmation</p>
                <p className="text-sm text-gray-500">
                  The seller will review and confirm your reservation within 24-48 hours
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-emerald-600 font-bold text-sm">2</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Arrange a viewing</p>
                <p className="text-sm text-gray-500">
                  Contact the seller to schedule a time to inspect the van
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-emerald-600 font-bold text-sm">3</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Complete the purchase</p>
                <p className="text-sm text-gray-500">
                  Pay the remaining balance directly to the seller and finalize the sale
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition flex items-center justify-center gap-2"
          >
            <Home size={18} />
            Back to Home
          </button>
          <button
            onClick={() => navigate('/messages')}
            className="flex-1 bg-emerald-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-emerald-700 transition flex items-center justify-center gap-2"
          >
            <MessageCircle size={18} />
            Go to Messages
            <ArrowRight size={18} />
          </button>
        </div>

        {/* Help */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Questions? Contact us at{' '}
          <a href="mailto:support@kiwivanmarket.com" className="text-emerald-600 hover:underline">
            support@kiwivanmarket.com
          </a>
        </p>
      </div>
    </div>
  );
}

export default ReservationSuccess;