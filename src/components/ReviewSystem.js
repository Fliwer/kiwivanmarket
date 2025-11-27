import React, { useState, useEffect } from 'react';
import { 
  collection, addDoc, query, where, getDocs, orderBy, 
  doc, getDoc, updateDoc, serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import { Star, X, Send, User, Calendar, ThumbsUp, AlertCircle, Check } from 'lucide-react';

// ⭐ Composant pour afficher les étoiles cliquables
function StarRating({ rating, onRate, size = 24, readonly = false }) {
  const [hover, setHover] = useState(0);
  
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onRate && onRate(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={`transition-transform ${!readonly && 'hover:scale-110 cursor-pointer'} ${readonly && 'cursor-default'}`}
        >
          <Star
            size={size}
            className={`transition-colors ${
              star <= (hover || rating)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// 📝 Modal pour laisser un avis
export function LeaveReviewModal({ isOpen, onClose, sellerId, sellerName, vanId = null, vanTitle = null }) {
  const { currentUser } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  // Vérifier si l'utilisateur a déjà laissé un avis
  useEffect(() => {
    const checkExistingReview = async () => {
      if (!currentUser || !sellerId) return;
      
      try {
        const reviewsQuery = query(
          collection(db, 'reviews'),
          where('buyerId', '==', currentUser.uid),
          where('sellerId', '==', sellerId)
        );
        const snapshot = await getDocs(reviewsQuery);
        setAlreadyReviewed(!snapshot.empty);
      } catch (err) {
        console.error('Error checking existing review:', err);
      }
    };
    
    if (isOpen) {
      checkExistingReview();
    }
  }, [isOpen, currentUser, sellerId]);

  const handleSubmit = async () => {
    if (!currentUser) {
      setError('You must be logged in to leave a review');
      return;
    }
    
    if (currentUser.uid === sellerId) {
      setError("You can't review yourself!");
      return;
    }
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    
    if (comment.trim().length < 10) {
      setError('Please write at least 10 characters');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Créer l'avis
      await addDoc(collection(db, 'reviews'), {
        sellerId: sellerId,
        sellerName: sellerName,
        buyerId: currentUser.uid,
        buyerName: currentUser.displayName || 'Anonymous',
        buyerPhoto: currentUser.photoURL || '',
        rating: rating,
        comment: comment.trim(),
        vanId: vanId,
        vanTitle: vanTitle,
        helpful: 0,
        createdAt: serverTimestamp()
      });
      
      // Mettre à jour les stats du vendeur
      await updateSellerStats(sellerId);
      
      setSuccess(true);
      
      setTimeout(() => {
        onClose();
        setRating(0);
        setComment('');
        setSuccess(false);
      }, 2000);
      
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-4 flex items-center justify-between">
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <Star size={20} fill="white" />
            Leave a Review
          </h3>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={32} className="text-emerald-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Thank You!</h4>
              <p className="text-gray-600">Your review has been submitted.</p>
            </div>
          ) : alreadyReviewed ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={32} className="text-blue-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Already Reviewed</h4>
              <p className="text-gray-600">You have already left a review for this seller.</p>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              {/* Seller info */}
              <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <User size={24} className="text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{sellerName}</p>
                  {vanTitle && (
                    <p className="text-sm text-gray-500">For: {vanTitle}</p>
                  )}
                </div>
              </div>
              
              {/* Rating */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Rating *
                </label>
                <div className="flex items-center gap-3">
                  <StarRating rating={rating} onRate={setRating} size={32} />
                  <span className="text-gray-500 text-sm">
                    {rating === 1 && 'Poor'}
                    {rating === 2 && 'Fair'}
                    {rating === 3 && 'Good'}
                    {rating === 4 && 'Very Good'}
                    {rating === 5 && 'Excellent!'}
                  </span>
                </div>
              </div>
              
              {/* Comment */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Review *
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience with this seller..."
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:outline-none resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {comment.length}/500 characters (minimum 10)
                </p>
              </div>
              
              {/* Error */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}
              
              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={loading || rating === 0}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-3 rounded-xl font-bold hover:from-yellow-500 hover:to-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Send size={18} />
                    Submit Review
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// 📋 Composant pour afficher la liste des avis d'un vendeur
export function SellerReviews({ sellerId, limit = 5 }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ avg: 0, total: 0, breakdown: {} });

  useEffect(() => {
    const loadReviews = async () => {
      if (!sellerId) return;
      
      try {
        setLoading(true);
        
        const reviewsQuery = query(
          collection(db, 'reviews'),
          where('sellerId', '==', sellerId),
          orderBy('createdAt', 'desc')
        );
        
        const snapshot = await getDocs(reviewsQuery);
        const reviewsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setReviews(reviewsData.slice(0, limit));
        
        // Calculer les stats
        if (reviewsData.length > 0) {
          const total = reviewsData.length;
          const sum = reviewsData.reduce((acc, r) => acc + r.rating, 0);
          const avg = sum / total;
          
          const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
          reviewsData.forEach(r => {
            breakdown[r.rating]++;
          });
          
          setStats({ avg: avg.toFixed(1), total, breakdown });
        }
        
      } catch (err) {
        console.error('Error loading reviews:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadReviews();
  }, [sellerId, limit]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-20 bg-gray-200 rounded-xl"></div>
        <div className="h-32 bg-gray-200 rounded-xl"></div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-xl">
        <Star size={32} className="text-gray-300 mx-auto mb-2" />
        <p className="text-gray-500">No reviews yet</p>
        <p className="text-sm text-gray-400">Be the first to leave a review!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats summary */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-4xl font-black text-yellow-600">{stats.avg}</div>
            <div>
              <StarRating rating={Math.round(parseFloat(stats.avg))} readonly size={18} />
              <p className="text-sm text-gray-500">{stats.total} review{stats.total > 1 ? 's' : ''}</p>
            </div>
          </div>
          
          {/* Breakdown */}
          <div className="hidden sm:block space-y-1">
            {[5, 4, 3, 2, 1].map(star => (
              <div key={star} className="flex items-center gap-2 text-xs">
                <span className="w-3">{star}</span>
                <Star size={10} className="text-yellow-400 fill-yellow-400" />
                <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-400 rounded-full"
                    style={{ width: `${stats.total > 0 ? (stats.breakdown[star] / stats.total) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-gray-400 w-4">{stats.breakdown[star]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Reviews list */}
      <div className="space-y-3">
        {reviews.map(review => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
}

// 🎴 Carte individuelle d'un avis
function ReviewCard({ review }) {
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
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {review.buyerPhoto ? (
            <img 
              src={review.buyerPhoto} 
              alt={review.buyerName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <span className="text-emerald-600 font-bold">
                {review.buyerName?.[0]?.toUpperCase() || '?'}
              </span>
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-900">{review.buyerName}</p>
            <div className="flex items-center gap-2">
              <StarRating rating={review.rating} readonly size={14} />
            </div>
          </div>
        </div>
        <span className="text-xs text-gray-400 flex items-center gap-1">
          <Calendar size={12} />
          {formatDate(review.createdAt)}
        </span>
      </div>
      
      {/* Comment */}
      <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
      
      {/* Van reference */}
      {review.vanTitle && (
        <p className="mt-2 text-xs text-gray-400">
          Regarding: {review.vanTitle}
        </p>
      )}
    </div>
  );
}

// 🔧 Fonction pour mettre à jour les stats du vendeur
async function updateSellerStats(sellerId) {
  try {
    // Récupérer tous les avis du vendeur
    const reviewsQuery = query(
      collection(db, 'reviews'),
      where('sellerId', '==', sellerId)
    );
    const snapshot = await getDocs(reviewsQuery);
    
    if (snapshot.empty) return;
    
    const reviews = snapshot.docs.map(doc => doc.data());
    const totalReviews = reviews.length;
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
    
    // Mettre à jour le document utilisateur
    const userRef = doc(db, 'users', sellerId);
    await updateDoc(userRef, {
      totalReviews: totalReviews,
      avgRating: parseFloat(avgRating.toFixed(1)),
      lastReviewAt: serverTimestamp()
    });
    
  } catch (err) {
    console.error('Error updating seller stats:', err);
  }
}

// 📊 Hook pour récupérer les stats d'un vendeur
export function useSellerStats(sellerId) {
  const [stats, setStats] = useState({
    avgRating: 5.0,
    totalReviews: 0,
    responseRate: 100,
    loading: true
  });

  useEffect(() => {
    const loadStats = async () => {
      if (!sellerId) return;
      
      try {
        // Stats depuis le profil utilisateur
        const userRef = doc(db, 'users', sellerId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setStats({
            avgRating: userData.avgRating || 5.0,
            totalReviews: userData.totalReviews || 0,
            responseRate: userData.responseRate || 100,
            loading: false
          });
        } else {
          // Calculer depuis les avis directement
          const reviewsQuery = query(
            collection(db, 'reviews'),
            where('sellerId', '==', sellerId)
          );
          const snapshot = await getDocs(reviewsQuery);
          
          if (!snapshot.empty) {
            const reviews = snapshot.docs.map(doc => doc.data());
            const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
            setStats({
              avgRating: parseFloat(avg.toFixed(1)),
              totalReviews: reviews.length,
              responseRate: 100,
              loading: false
            });
          } else {
            setStats(prev => ({ ...prev, loading: false }));
          }
        }
        
      } catch (err) {
        console.error('Error loading seller stats:', err);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };
    
    loadStats();
  }, [sellerId]);

  return stats;
}

// Bouton pour laisser un avis (à intégrer dans les conversations)
export function LeaveReviewButton({ sellerId, sellerName, vanId, vanTitle, className = '' }) {
  const [showModal, setShowModal] = useState(false);
  const { currentUser } = useAuth();
  
  // Ne pas afficher si c'est le même utilisateur
  if (currentUser?.uid === sellerId) return null;
  
  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-xl font-semibold hover:bg-yellow-200 transition ${className}`}
      >
        <Star size={16} />
        Leave a Review
      </button>
      
      <LeaveReviewModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        sellerId={sellerId}
        sellerName={sellerName}
        vanId={vanId}
        vanTitle={vanTitle}
      />
    </>
  );
}

export default { LeaveReviewModal, SellerReviews, LeaveReviewButton, useSellerStats };
