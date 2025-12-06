// ============================================
// 📸 PHOTO CONFIRMATION COMPONENT
// ============================================
//
// Ce composant gère la double confirmation avec photo
// pour libérer le dépôt de manière sécurisée
//
// ============================================

import React, { useState, useRef } from 'react';
import { X, Camera, Upload, CheckCircle, AlertTriangle, Image, Loader, Shield } from 'lucide-react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

// ============================================
// 📸 BUYER CONFIRMATION MODAL (avec photo)
// ============================================

export function BuyerPhotoConfirmationModal({ 
  isOpen, 
  onClose, 
  reservation, 
  onConfirmed 
}) {
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier le type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file (JPG, PNG, etc.)');
        return;
      }
      // Vérifier la taille (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Image too large. Maximum size is 10MB.');
        return;
      }
      
      setPhoto(file);
      setError('');
      
      // Créer preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirm = async () => {
    if (!photo) {
      setError('Please upload a photo first');
      return;
    }
    if (!isConfirmed) {
      setError('Please confirm that you have seen the vehicle');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      // 1. Upload photo to Firebase Storage
      const storage = getStorage();
      const photoRef = ref(storage, `confirmations/${reservation.id}/buyer_${Date.now()}.jpg`);
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

      // 3. Callback
      if (onConfirmed) {
        onConfirmed();
      }
      
      onClose();
    } catch (err) {
      console.error('Error confirming:', err);
      setError('Failed to confirm. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Camera size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Confirm Vehicle Viewing</h2>
                <p className="text-emerald-100 text-sm">Upload photo proof</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-white/70 hover:text-white transition p-2"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Info box */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <div className="flex gap-3">
              <AlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="font-semibold text-amber-800 text-sm mb-1">Important</h4>
                <p className="text-amber-700 text-xs">
                  By confirming, the deposit will become <strong>non-refundable</strong>. 
                  Make sure you have inspected the vehicle thoroughly.
                </p>
              </div>
            </div>
          </div>

          {/* Photo Upload Area */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📸 Upload a photo of you with the van
            </label>
            
            {!photoPreview ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition group"
              >
                <div className="w-16 h-16 bg-gray-100 group-hover:bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 transition">
                  <Camera size={32} className="text-gray-400 group-hover:text-emerald-600 transition" />
                </div>
                <p className="text-gray-600 font-medium mb-1">Click to upload photo</p>
                <p className="text-gray-400 text-sm">or drag and drop</p>
                <p className="text-gray-400 text-xs mt-2">JPG, PNG up to 10MB</p>
              </div>
            ) : (
              <div className="relative">
                <img 
                  src={photoPreview} 
                  alt="Confirmation photo" 
                  className="w-full h-64 object-cover rounded-xl"
                />
                <button
                  onClick={() => {
                    setPhoto(null);
                    setPhotoPreview(null);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                >
                  <X size={16} />
                </button>
                <div className="absolute bottom-2 left-2 bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <CheckCircle size={14} />
                  Photo ready
                </div>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Confirmation Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer mb-6 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
            <input
              type="checkbox"
              checked={isConfirmed}
              onChange={(e) => setIsConfirmed(e.target.checked)}
              className="mt-0.5 w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <div>
              <span className="text-gray-800 font-medium">I confirm that:</span>
              <ul className="text-sm text-gray-600 mt-1 space-y-1">
                <li>• I have physically seen and inspected the vehicle</li>
                <li>• I have verified its condition</li>
                <li>• I understand the deposit becomes non-refundable</li>
              </ul>
            </div>
          </label>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isUploading}
              className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isUploading || !photo || !isConfirmed}
              className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Confirming...
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
}

// ============================================
// ✅ SELLER CONFIRMATION MODAL
// ============================================

export function SellerConfirmationModal({ 
  isOpen, 
  onClose, 
  reservation,
  buyerPhoto,
  onConfirmed 
}) {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!isConfirmed) {
      setError('Please confirm that the buyer has seen the vehicle');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Update reservation in Firestore
      const reservationRef = doc(db, 'reservations', reservation.id);
      await updateDoc(reservationRef, {
        sellerConfirmed: true,
        sellerConfirmedAt: serverTimestamp(),
        status: 'completed', // Both confirmed = release deposit
        depositReleased: true,
        depositReleasedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // TODO: Trigger Stripe payout to seller here
      // await releaseDepositToSeller(reservation.stripePaymentIntentId);

      if (onConfirmed) {
        onConfirmed();
      }
      
      onClose();
    } catch (err) {
      console.error('Error confirming:', err);
      setError('Failed to confirm. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Shield size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Confirm Buyer Meeting</h2>
                <p className="text-blue-100 text-sm">Verify the buyer saw your van</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-white/70 hover:text-white transition p-2"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Buyer's Photo */}
          {buyerPhoto && (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📸 Photo uploaded by buyer:
              </label>
              <div className="relative">
                <img 
                  src={buyerPhoto} 
                  alt="Buyer confirmation" 
                  className="w-full h-48 object-cover rounded-xl border-2 border-gray-200"
                />
                <div className="absolute bottom-2 left-2 bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <CheckCircle size={14} />
                  Buyer confirmed
                </div>
              </div>
            </div>
          )}

          {/* Info box */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex gap-3">
              <Shield className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="font-semibold text-blue-800 text-sm mb-1">Release Deposit</h4>
                <p className="text-blue-700 text-xs">
                  By confirming, the deposit of <strong>${reservation?.depositAmount || 500} NZD</strong> will 
                  be released to your account.
                </p>
              </div>
            </div>
          </div>

          {/* Confirmation Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer mb-6 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
            <input
              type="checkbox"
              checked={isConfirmed}
              onChange={(e) => setIsConfirmed(e.target.checked)}
              className="mt-0.5 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <span className="text-gray-800 font-medium">I confirm that:</span>
              <ul className="text-sm text-gray-600 mt-1 space-y-1">
                <li>• The buyer came to see the vehicle in person</li>
                <li>• The buyer had the opportunity to inspect it</li>
                <li>• I recognize the person in the photo (if applicable)</li>
              </ul>
            </div>
          </label>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading || !isConfirmed}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Confirming...
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  Confirm & Release Deposit
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 📊 CONFIRMATION STATUS COMPONENT
// ============================================

export function ConfirmationStatus({ reservation }) {
  const buyerConfirmed = reservation?.buyerConfirmed;
  const sellerConfirmed = reservation?.sellerConfirmed;

  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <Shield size={16} className="text-emerald-600" />
        Confirmation Status
      </h4>
      
      <div className="space-y-3">
        {/* Buyer Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              buyerConfirmed ? 'bg-emerald-100' : 'bg-gray-200'
            }`}>
              {buyerConfirmed ? (
                <CheckCircle size={16} className="text-emerald-600" />
              ) : (
                <span className="text-gray-400 text-sm font-bold">1</span>
              )}
            </div>
            <div>
              <p className={`text-sm font-medium ${buyerConfirmed ? 'text-emerald-700' : 'text-gray-600'}`}>
                Buyer Confirmation
              </p>
              <p className="text-xs text-gray-400">
                {buyerConfirmed ? 'Photo uploaded ✓' : 'Waiting for photo...'}
              </p>
            </div>
          </div>
          {buyerConfirmed && (
            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full">
              Done
            </span>
          )}
        </div>

        {/* Connector Line */}
        <div className="ml-4 border-l-2 border-dashed border-gray-300 h-4"></div>

        {/* Seller Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              sellerConfirmed ? 'bg-emerald-100' : buyerConfirmed ? 'bg-blue-100' : 'bg-gray-200'
            }`}>
              {sellerConfirmed ? (
                <CheckCircle size={16} className="text-emerald-600" />
              ) : (
                <span className={`text-sm font-bold ${buyerConfirmed ? 'text-blue-500' : 'text-gray-400'}`}>2</span>
              )}
            </div>
            <div>
              <p className={`text-sm font-medium ${
                sellerConfirmed ? 'text-emerald-700' : buyerConfirmed ? 'text-blue-600' : 'text-gray-400'
              }`}>
                Seller Confirmation
              </p>
              <p className="text-xs text-gray-400">
                {sellerConfirmed ? 'Verified ✓' : buyerConfirmed ? 'Your turn!' : 'Waiting for buyer...'}
              </p>
            </div>
          </div>
          {sellerConfirmed && (
            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full">
              Done
            </span>
          )}
        </div>

        {/* Connector Line */}
        <div className="ml-4 border-l-2 border-dashed border-gray-300 h-4"></div>

        {/* Deposit Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              buyerConfirmed && sellerConfirmed ? 'bg-emerald-500' : 'bg-gray-200'
            }`}>
              {buyerConfirmed && sellerConfirmed ? (
                <CheckCircle size={16} className="text-white" />
              ) : (
                <span className="text-gray-400 text-sm font-bold">$</span>
              )}
            </div>
            <div>
              <p className={`text-sm font-medium ${
                buyerConfirmed && sellerConfirmed ? 'text-emerald-700' : 'text-gray-400'
              }`}>
                Deposit Released
              </p>
              <p className="text-xs text-gray-400">
                {buyerConfirmed && sellerConfirmed ? 'Payment sent to seller ✓' : 'Pending confirmations'}
              </p>
            </div>
          </div>
          {buyerConfirmed && sellerConfirmed && (
            <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              💰 Released
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// 🔘 CONFIRM MEETING BUTTON (pour l'acheteur)
// ============================================

export function ConfirmMeetingButton({ reservation, onConfirmed }) {
  const [showModal, setShowModal] = useState(false);

  // Ne pas afficher si déjà confirmé par l'acheteur
  if (reservation?.buyerConfirmed) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
        <CheckCircle className="text-emerald-600" size={24} />
        <div>
          <p className="font-semibold text-emerald-700">You have confirmed viewing</p>
          <p className="text-sm text-emerald-600">Waiting for seller confirmation...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl font-bold text-lg hover:from-emerald-700 hover:to-teal-700 transition shadow-lg flex items-center justify-center gap-3"
      >
        <Camera size={24} />
        Confirm I Saw The Van
      </button>
      
      <BuyerPhotoConfirmationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        reservation={reservation}
        onConfirmed={() => {
          setShowModal(false);
          if (onConfirmed) onConfirmed();
        }}
      />
    </>
  );
}

// ============================================
// 🔘 CONFIRM BUYER BUTTON (pour le vendeur)
// ============================================

export function ConfirmBuyerButton({ reservation, onConfirmed }) {
  const [showModal, setShowModal] = useState(false);

  // Ne pas afficher si l'acheteur n'a pas confirmé
  if (!reservation?.buyerConfirmed) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
          <Camera className="text-gray-400" size={20} />
        </div>
        <div>
          <p className="font-medium text-gray-600">Waiting for buyer</p>
          <p className="text-sm text-gray-400">The buyer must confirm first with a photo</p>
        </div>
      </div>
    );
  }

  // Ne pas afficher si déjà confirmé par le vendeur
  if (reservation?.sellerConfirmed) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
        <CheckCircle className="text-emerald-600" size={24} />
        <div>
          <p className="font-semibold text-emerald-700">Transaction Complete!</p>
          <p className="text-sm text-emerald-600">Deposit has been released to your account</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition shadow-lg flex items-center justify-center gap-3"
      >
        <Shield size={24} />
        Confirm Buyer & Release Deposit
      </button>
      
      <SellerConfirmationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        reservation={reservation}
        buyerPhoto={reservation?.buyerConfirmationPhoto}
        onConfirmed={() => {
          setShowModal(false);
          if (onConfirmed) onConfirmed();
        }}
      />
    </>
  );
}

export default BuyerPhotoConfirmationModal;
