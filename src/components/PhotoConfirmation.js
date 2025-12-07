// ============================================================
// 📸 PHOTO CONFIRMATION SYSTEM
// Double confirmation with photo proof (license plate visible)
// ============================================================

import React, { useState, useRef } from 'react';
import { 
  Camera, 
  X, 
  CheckCircle, 
  Shield, 
  RefreshCw, 
  User, 
  AlertCircle, 
  DollarSign,
  Image as ImageIcon,
  CreditCard,
  Check,
  Clock
} from 'lucide-react';
import { db, storage } from '../firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// ============================================================
// 📸 BUYER PHOTO CONFIRMATION MODAL
// Buyer uploads photo of the van with LICENSE PLATE visible
// ============================================================
export const BuyerPhotoConfirmationModal = ({ isOpen, onClose, reservation, onConfirmed }) => {
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen || !reservation) return null;

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Photo must be less than 10MB');
      return;
    }

    setError('');
    setPhoto(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirm = async () => {
    if (!photo || !confirmed) return;

    setIsUploading(true);
    setError('');

    try {
      // 1. Upload photo to Firebase Storage
      const photoRef = ref(storage, `confirmations/${reservation.id}/${Date.now()}_buyer_proof.jpg`);
      await uploadBytes(photoRef, photo);
      const photoURL = await getDownloadURL(photoRef);

      // 2. Update reservation in Firestore
      const reservationRef = doc(db, 'reservations', reservation.id);
      await updateDoc(reservationRef, {
        buyerConfirmed: true,
        buyerConfirmedAt: serverTimestamp(),
        buyerConfirmationPhoto: photoURL,
        status: 'buyer_confirmed',
        updatedAt: serverTimestamp()
      });

      // 3. Success callback
      if (onConfirmed) onConfirmed();
      onClose();
    } catch (err) {
      console.error('Error confirming:', err);
      setError('Failed to upload confirmation. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Camera size={24} />
              Confirm Van Viewing
            </h3>
            <button onClick={onClose} className="text-white/80 hover:text-white">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Instructions - LICENSE PLATE requirement */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <Shield size={18} />
              Photo Proof Required
            </h4>
            <p className="text-blue-700 text-sm leading-relaxed">
              Please upload a <strong>photo of the van showing the license plate</strong> as proof that you met with the seller and viewed the vehicle.
            </p>
            <div className="mt-3 bg-blue-100 rounded-lg p-3">
              <p className="text-blue-800 text-xs font-medium">📸 Your photo should include:</p>
              <ul className="text-blue-700 text-xs mt-1 space-y-0.5">
                <li>• The van clearly visible</li>
                <li>• The <strong>license plate readable</strong></li>
                <li>• Taken at the meeting location</li>
              </ul>
            </div>
          </div>

          {/* Photo Upload Area */}
          <div className="mb-6">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoSelect}
              ref={fileInputRef}
              className="hidden"
            />

            {photoPreview ? (
              <div className="relative">
                <img 
                  src={photoPreview} 
                  alt="Confirmation" 
                  className="w-full h-64 object-cover rounded-xl border-2 border-emerald-300"
                />
                <button
                  onClick={() => {
                    setPhoto(null);
                    setPhotoPreview(null);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition"
                >
                  <X size={16} />
                </button>
                <div className="absolute bottom-2 left-2 bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <CheckCircle size={14} />
                  Photo ready
                </div>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-64 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-emerald-400 hover:bg-emerald-50 transition cursor-pointer"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <Camera size={32} className="text-gray-400" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-700">Take or Upload Photo</p>
                  <p className="text-sm text-gray-500">Van with license plate visible</p>
                </div>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                    📷 Camera
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    🖼️ Gallery
                  </span>
                </div>
              </button>
            )}
          </div>

          {/* Confirmation Checkbox */}
          <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition mb-4">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="w-5 h-5 mt-0.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <div>
              <p className="font-semibold text-gray-800">I confirm I have seen the vehicle in person</p>
              <p className="text-sm text-gray-500 mt-1">
                I understand that after the seller confirms, the deposit becomes non-refundable.
              </p>
            </div>
          </label>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!photo || !confirmed || isUploading}
              className={`flex-1 px-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition ${
                photo && confirmed && !isUploading
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isUploading ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  Confirm Viewing
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// ✅ SELLER CONFIRMATION MODAL
// Seller sees buyer's photo and confirms to release deposit
// ============================================================
export const SellerConfirmationModal = ({ isOpen, onClose, reservation, onConfirmed }) => {
  const [confirmed, setConfirmed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !reservation) return null;

  const handleConfirm = async () => {
    if (!confirmed) return;

    setIsProcessing(true);
    setError('');

    try {
      // Update reservation in Firestore
      const reservationRef = doc(db, 'reservations', reservation.id);
      await updateDoc(reservationRef, {
        sellerConfirmed: true,
        sellerConfirmedAt: serverTimestamp(),
        status: 'completed',
        depositReleased: true,
        depositReleasedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // TODO: Trigger Stripe payout to seller via Cloud Function
      // This would call your backend to initiate the transfer

      if (onConfirmed) onConfirmed();
      onClose();
    } catch (err) {
      console.error('Error confirming:', err);
      setError('Failed to confirm. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Shield size={24} />
              Confirm Buyer Meeting
            </h3>
            <button onClick={onClose} className="text-white/80 hover:text-white">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Buyer's Photo Proof */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <ImageIcon size={18} />
              Buyer's Photo Proof
            </h4>
            {reservation.buyerConfirmationPhoto ? (
              <img 
                src={reservation.buyerConfirmationPhoto} 
                alt="Buyer confirmation" 
                className="w-full h-64 object-cover rounded-xl border-2 border-blue-200"
              />
            ) : (
              <div className="w-full h-64 bg-gray-100 rounded-xl flex items-center justify-center">
                <p className="text-gray-500">No photo available</p>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">
              ⚠️ Verify that this is your van and the license plate matches.
            </p>
          </div>

          {/* Buyer Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
                <User size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-blue-800">{reservation.buyerName || 'Buyer'}</p>
                <p className="text-sm text-blue-600">
                  Confirmed viewing on {reservation.buyerConfirmedAt?.toDate?.()?.toLocaleDateString() || 'recently'}
                </p>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
              <AlertCircle size={18} />
              Important
            </h4>
            <p className="text-amber-700 text-sm leading-relaxed">
              By confirming, you verify that this buyer physically came to see your van and the photo shows your vehicle with the correct license plate. 
              The deposit will be released to you and cannot be refunded.
            </p>
          </div>

          {/* Confirmation Checkbox */}
          <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition mb-4">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="w-5 h-5 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <p className="font-semibold text-gray-800">I confirm this buyer viewed my van in person</p>
              <p className="text-sm text-gray-500 mt-1">
                The photo shows my van with the correct license plate.
              </p>
            </div>
          </label>

          {/* Deposit Amount */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign size={20} className="text-emerald-600" />
              <span className="font-semibold text-emerald-800">Deposit to receive:</span>
            </div>
            <span className="text-2xl font-bold text-emerald-600">
              ${reservation.depositAmount || 500}
            </span>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!confirmed || isProcessing}
              className={`flex-1 px-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition ${
                confirmed && !isProcessing
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isProcessing ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <DollarSign size={18} />
                  Release Deposit
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// 📊 CONFIRMATION STATUS TRACKER
// Visual timeline of the confirmation process
// ============================================================
export const ConfirmationStatus = ({ reservation }) => {
  const steps = [
    {
      id: 'paid',
      label: 'Deposit Paid',
      icon: CreditCard,
      completed: ['paid', 'confirmed', 'buyer_confirmed', 'completed'].includes(reservation.status),
      active: reservation.status === 'paid'
    },
    {
      id: 'buyer_confirmed',
      label: 'Buyer Confirmed',
      icon: Camera,
      completed: ['buyer_confirmed', 'completed'].includes(reservation.status) || reservation.buyerConfirmed,
      active: reservation.status === 'confirmed' || (reservation.status === 'paid' && !reservation.buyerConfirmed)
    },
    {
      id: 'seller_confirmed',
      label: 'Seller Confirmed',
      icon: Shield,
      completed: reservation.status === 'completed' || reservation.sellerConfirmed,
      active: reservation.status === 'buyer_confirmed' || (reservation.buyerConfirmed && !reservation.sellerConfirmed)
    },
    {
      id: 'released',
      label: 'Deposit Released',
      icon: DollarSign,
      completed: reservation.depositReleased,
      active: reservation.sellerConfirmed && !reservation.depositReleased
    }
  ];

  return (
    <div className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl p-4">
      <h4 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
        <Shield size={14} />
        Transaction Progress
      </h4>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  step.completed 
                    ? 'bg-emerald-500 text-white' 
                    : step.active 
                      ? 'bg-blue-500 text-white animate-pulse' 
                      : 'bg-gray-200 text-gray-400'
                }`}>
                  {step.completed ? <Check size={20} /> : <StepIcon size={18} />}
                </div>
                <span className={`text-xs mt-1.5 text-center max-w-[70px] ${
                  step.completed ? 'text-emerald-600 font-medium' : step.active ? 'text-blue-600 font-medium' : 'text-gray-400'
                }`}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-2 rounded ${
                  steps[index + 1].completed ? 'bg-emerald-300' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================
// 🔘 CONFIRM MEETING BUTTON (for buyer)
// Button to trigger the photo confirmation modal
// ============================================================
export const ConfirmMeetingButton = ({ reservation }) => {
  const [showModal, setShowModal] = useState(false);

  if (reservation.buyerConfirmed) {
    return (
      <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg">
        <CheckCircle size={18} />
        <span className="font-medium">You have confirmed viewing</span>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition"
      >
        <Camera size={18} />
        Confirm I Saw The Van
      </button>

      <BuyerPhotoConfirmationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        reservation={reservation}
        onConfirmed={() => setShowModal(false)}
      />
    </>
  );
};

// ============================================================
// 🔘 CONFIRM BUYER BUTTON (for seller)
// Button to trigger the seller confirmation modal
// ============================================================
export const ConfirmBuyerButton = ({ reservation }) => {
  const [showModal, setShowModal] = useState(false);

  if (!reservation.buyerConfirmed) {
    return (
      <div className="flex items-center gap-2 text-gray-500 bg-gray-100 px-4 py-2 rounded-lg">
        <Clock size={18} />
        <span className="font-medium">Waiting for buyer to confirm...</span>
      </div>
    );
  }

  if (reservation.sellerConfirmed) {
    return (
      <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg">
        <CheckCircle size={18} />
        <span className="font-medium">Transaction Complete!</span>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
      >
        <Shield size={18} />
        Confirm & Release Deposit
      </button>

      <SellerConfirmationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        reservation={reservation}
        onConfirmed={() => setShowModal(false)}
      />
    </>
  );
};

// ============================================================
// EXPORTS
// ============================================================
export default {
  BuyerPhotoConfirmationModal,
  SellerConfirmationModal,
  ConfirmationStatus,
  ConfirmMeetingButton,
  ConfirmBuyerButton
};
