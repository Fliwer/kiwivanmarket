import React, { useState, useEffect } from 'react';
import { Star, X, User, Calendar, ThumbsUp, MessageCircle, AlertCircle } from 'lucide-react';
import { collection, addDoc, query, where, getDocs, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import { sanitizeText } from '../securityUtils';

// ============================================
// LEAVE REVIEW BUTTON
// Button to open review modal for a seller
// ============================================

export function LeaveReviewButton({ sellerId, sellerName, vanId, vanTitle, onReviewSubmitted }) {
  const { currentUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  // Check if user already reviewed this seller
  useEffect(() => {
    const checkExistingReview = async () => {
      if (!currentUser || !sellerId) return;
      
      try {
        const q = query(
          collection(db, 'reviews'),
          where('reviewerId', '==', currentUser.uid),
          where('sellerId', '==', sellerId)
        );
        const snapshot = await getDocs(q);
        setHasReviewed(!snapshot.empty);
      } catch (err) {
        console.error('Error checking review:', err);
      }
    };
    
    checkExistingReview();
  }, [currentUser, sellerId]);

  const handleSubmit = async () => {
    if (!currentUser || !sellerId || rating === 0) return;
    
    setSubmitting(true);
    setError(null);
    
    try {
      await addDoc(collection(db, 'reviews'), {
        sellerId,
        sellerName: sellerName || 'Unknown Seller',
        reviewerId: currentUser.uid,
        reviewerName: currentUser.displayName || 'Anonymous',
        reviewerPhoto: currentUser.photoURL || null,
        vanId: vanId || null,
        vanTitle: vanTitle || null,
        rating,
        comment: sanitizeText(comment),
        createdAt: serverTimestamp(),
        helpful: 0
      });
      
      setSuccess(true);
      setHasReviewed(true);
      
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
      
      // Close modal after delay
      setTimeout(() => {
        setShowModal(false);
        setSuccess(false);
        setRating(0);
        setComment('');
      }, 2000);
      
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Don't show if not logged in or reviewing yourself
  if (!currentUser || currentUser.uid === sellerId) {
    return null;
  }

  // Already reviewed
  if (hasReviewed) {
    return (
      <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">
        <Star size={16} className="fill-emerald-500 text-emerald-500" />
        <span>You've reviewed this seller</span>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl font-semibold text-sm transition"
      >
        <Star size={16} />
        Leave a Review
      </button>

      {/* Review Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Review {sellerName}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            {success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star size={32} className="text-emerald-600 fill-emerald-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Thank you!</h4>
                <p className="text-gray-600">Your review has been submitted.</p>
              </div>
            ) : (
              <>
                {/* Star Rating */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Rating
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 transition-transform hover:scale-110"
                      >
                        <Star
                          size={32}
                          className={`transition-colors ${
                            star <= (hoverRating || rating)
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {rating === 0 && 'Select a rating'}
                    {rating === 1 && 'Poor'}
                    {rating === 2 && 'Fair'}
                    {rating === 3 && 'Good'}
                    {rating === 4 && 'Very Good'}
                    {rating === 5 && 'Excellent'}
                  </p>
                </div>

                {/* Comment */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Review (optional)
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience with this seller..."
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none resize-none"
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={rating === 0 || submitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ============================================
// SELLER REVIEWS
// Display reviews for a seller
// ============================================

export function SellerReviews({ sellerId, limit = 5 }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ avg: 0, total: 0, distribution: {} });

  useEffect(() => {
    const loadReviews = async () => {
      if (!sellerId) {
        setLoading(false);
        return;
      }
      
      try {
        const q = query(
          collection(db, 'reviews'),
          where('sellerId', '==', sellerId),
          orderBy('createdAt', 'desc')
        );
        
        const snapshot = await getDocs(q);
        const reviewsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setReviews(reviewsData.slice(0, limit));
        
        // Calculate stats
        if (reviewsData.length > 0) {
          const total = reviewsData.length;
          const sum = reviewsData.reduce((acc, r) => acc + (r.rating || 0), 0);
          const avg = parseFloat((sum / total).toFixed(1));
          
          const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
          reviewsData.forEach(r => {
            if (r.rating >= 1 && r.rating <= 5) {
              distribution[r.rating]++;
            }
          });
          
          setStats({ avg, total, distribution });
        }
        
      } catch (err) {
        console.error('Error loading reviews:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadReviews();
  }, [sellerId, limit]);

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-NZ', { month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-xl">
        <Star size={32} className="text-gray-300 mx-auto mb-2" />
        <p className="text-gray-500">No reviews yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Summary */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4 border border-amber-200">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">{stats.avg}</div>
            <div className="flex gap-0.5 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={14}
                  className={star <= Math.round(stats.avg) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                />
              ))}
            </div>
            <div className="text-xs text-gray-500 mt-1">{stats.total} reviews</div>
          </div>
          
          <div className="flex-1 space-y-1">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center gap-2 text-xs">
                <span className="w-3 text-gray-600">{star}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-yellow-400 h-full rounded-full"
                    style={{ width: `${stats.total > 0 ? (stats.distribution[star] / stats.total) * 100 : 0}%` }}
                  />
                </div>
                <span className="w-6 text-gray-400">{stats.distribution[star]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                {review.reviewerPhoto ? (
                  <img src={review.reviewerPhoto} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  review.reviewerName?.[0]?.toUpperCase() || '?'
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-semibold text-gray-900 truncate">
                    {review.reviewerName || 'Anonymous'}
                  </span>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {formatDate(review.createdAt)}
                  </span>
                </div>
                
                {/* Stars */}
                <div className="flex gap-0.5 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={14}
                      className={star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                    />
                  ))}
                </div>
                
                {/* Comment */}
                {review.comment && (
                  <p className="text-gray-600 text-sm">{review.comment}</p>
                )}
                
                {/* Van reference */}
                {review.vanTitle && (
                  <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                    <MessageCircle size={12} />
                    Regarding: {review.vanTitle}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Default export for lazy loading compatibility
export default { LeaveReviewButton, SellerReviews };