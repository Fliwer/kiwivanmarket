import React, { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
// MVP_DISABLED: Phone verification imports
// import { RecaptchaVerifier, signInWithPhoneNumber, updateProfile } from 'firebase/auth';
import { updateProfile } from 'firebase/auth';
import { db, auth } from '../firebase';
import { useAuth } from '../AuthContext';
import { 
  X, Camera, Check, Shield, Phone, Mail, MapPin, Calendar, 
  Star, MessageCircle, Eye, Upload, AlertCircle, ChevronRight,
  Award, TrendingUp, Clock, Edit3, Save, Loader
} from 'lucide-react';
// MVP_DISABLED: Review system
// import { SellerReviews } from './ReviewSystem';
// MVP_DISABLED: Stripe Connect
// import { StripeConnectSetup } from './StripeConnect';

export default function UserProfile({ onClose }) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile data
  const [profile, setProfile] = useState({
    displayName: '',
    photoURL: '',
    phone: '',
    phoneVerified: false,
    city: '',
    region: '',
    bio: '',
    createdAt: null,
    lastActive: null
  });
  
  // Stats
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    totalViews: 0,
    responseRate: 100,
    avgRating: 5.0,
    totalReviews: 0
  });
  
  // MVP_DISABLED: Phone verification states
  // const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  // const [phoneNumber, setPhoneNumber] = useState('');
  // const [phoneCountry, setPhoneCountry] = useState('+64');
  // const [verificationCode, setVerificationCode] = useState('');
  // const [verificationId, setVerificationId] = useState(null);
  // const [phoneStep, setPhoneStep] = useState('input');
  // const [phoneError, setPhoneError] = useState('');
  
  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  // ✅ Fermeture avec la touche Escape
  const handleEscape = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [handleEscape]);

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        
        // Get user profile from Firestore
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const data = userSnap.data();
          setProfile({
            displayName: data.displayName || currentUser.displayName || '',
            photoURL: data.photoURL || currentUser.photoURL || '',
            phone: data.phone || '',
            phoneVerified: data.phoneVerified || false,
            city: data.city || '',
            region: data.region || 'North Island',
            bio: data.bio || '',
            createdAt: data.createdAt || currentUser.metadata?.creationTime,
            lastActive: data.lastActive || new Date()
          });
        } else {
          // Create initial profile document
          const initialProfile = {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName || '',
            photoURL: currentUser.photoURL || '',
            phone: '',
            phoneVerified: false,
            city: '',
            region: 'North Island',
            bio: '',
            createdAt: new Date(),
            lastActive: new Date()
          };
          await setDoc(userRef, initialProfile);
          setProfile(initialProfile);
        }
        
        // Load user stats (listings count, views, etc.)
        const vansQuery = query(
          collection(db, 'vans'),
          where('seller.uid', '==', currentUser.uid)
        );
        const vansSnap = await getDocs(vansQuery);
        
        let totalViews = 0;
        vansSnap.docs.forEach(doc => {
          totalViews += doc.data().views || 0;
        });
        
        // Load reviews stats
        const reviewsQuery = query(
          collection(db, 'reviews'),
          where('sellerId', '==', currentUser.uid)
        );
        const reviewsSnap = await getDocs(reviewsQuery);
        
        let avgRating = 0;
        let totalReviews = reviewsSnap.size;
        
        if (totalReviews > 0) {
          const sumRatings = reviewsSnap.docs.reduce((sum, doc) => sum + (doc.data().rating || 0), 0);
          avgRating = parseFloat((sumRatings / totalReviews).toFixed(1));
        }
        
        setStats({
          totalListings: vansSnap.size,
          activeListings: vansSnap.size,
          totalViews: totalViews,
          responseRate: 100,
          avgRating: avgRating || 0,
          totalReviews: totalReviews
        });
        
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadProfile();
  }, [currentUser]);

  // Photo upload handler
  const handlePhotoUpload = async (file) => {
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }
    
    try {
      setUploadingPhoto(true);
      
      // Upload directly to Cloudinary using unsigned upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'kiwivan_unsigned');
      formData.append('folder', 'profile_photos');
      
      const cloudName = 'dsgnwjmlv';
      
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      const photoURL = data.secure_url;
      
      // Update Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, { photoURL: photoURL });
      
      // Update Firebase Auth profile
      await updateProfile(currentUser, { photoURL: photoURL });
      
      // Update local state
      setProfile(prev => ({ ...prev, photoURL: photoURL }));
      
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo: ' + error.message);
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        displayName: editData.displayName || profile.displayName,
        city: editData.city || profile.city,
        region: editData.region || profile.region,
        bio: editData.bio || profile.bio,
        lastActive: new Date()
      });
      
      // Update Firebase Auth display name
      if (editData.displayName) {
        await updateProfile(currentUser, { displayName: editData.displayName });
      }
      
      // Update local state
      setProfile(prev => ({
        ...prev,
        ...editData,
        lastActive: new Date()
      }));
      
      setIsEditing(false);
      setEditData({});
      
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'Unknown';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-NZ', { month: 'long', year: 'numeric' });
  };

  // Calculate member duration
  const getMemberDuration = () => {
    if (!profile.createdAt) return 'New member';
    const created = profile.createdAt.toDate ? profile.createdAt.toDate() : new Date(profile.createdAt);
    const now = new Date();
    const months = Math.floor((now - created) / (1000 * 60 * 60 * 24 * 30));
    if (months < 1) return 'New member';
    if (months < 12) return `${months} month${months > 1 ? 's' : ''}`;
    const years = Math.floor(months / 12);
    return `${years} year${years > 1 ? 's' : ''}`;
  };

  // Calculate trust score (without phone verification for MVP)
  const getTrustScore = () => {
    let score = 50; // Base score for email verified
    if (profile.photoURL) score += 25;
    if (profile.bio) score += 15;
    if (profile.city) score += 10;
    return Math.min(score, 100);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70]">
        <div className="bg-white rounded-3xl p-8 flex flex-col items-center">
          <Loader className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
          <p className="text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
      onClick={onClose}  // ✅ Fermeture au clic sur le backdrop
    >
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] relative shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}  // ✅ Empêche la fermeture au clic sur le contenu
      >
        
        {/* ✅ HEADER STICKY avec bouton X toujours visible */}
        <div className="sticky top-0 z-20 bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 h-32 relative shrink-0">
          {/* Bouton X toujours visible */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition z-30"
            aria-label="Fermer"
          >
            <X size={24} className="text-white" />
          </button>
          
          {/* Decorative circles */}
          <div className="absolute top-4 left-4 w-20 h-20 bg-white/10 rounded-full"></div>
          <div className="absolute bottom-0 right-12 w-32 h-32 bg-white/5 rounded-full translate-y-1/2"></div>
        </div>
        
        {/* ✅ CONTENU SCROLLABLE */}
        <div className="flex-1 overflow-y-auto">
          {/* Profile photo - positioned relative to scroll container */}
          <div className="relative -mt-16 px-6">
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gradient-to-br from-emerald-400 to-teal-500">
                {profile.photoURL ? (
                  <img 
                    src={profile.photoURL} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
                    {profile.displayName?.[0]?.toUpperCase() || currentUser?.email?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                
                {uploadingPhoto && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}
              </div>
              
              {/* Photo upload button */}
              <label className="absolute bottom-1 right-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full p-2.5 cursor-pointer shadow-lg transition transform hover:scale-110">
                <Camera size={18} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files[0] && handlePhotoUpload(e.target.files[0])}
                  className="hidden"
                  disabled={uploadingPhoto}
                />
              </label>
            </div>
          </div>
          
          {/* Profile content */}
          <div className="px-6 pb-6">
            
            {/* Name and verification badges */}
            <div className="mt-4 mb-6">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-bold text-gray-900">
                  {profile.displayName || 'Anonymous User'}
                </h2>
                
                {/* Verification badges */}
                <div className="flex items-center gap-2">
                  {/* Email verified */}
                  <div className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                    <Mail size={12} />
                    <span>Email</span>
                    <Check size={12} className="text-emerald-600" />
                  </div>
                  
                  {/* MVP_DISABLED: Phone verification badge
                  {profile.phoneVerified ? (
                    <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                      <Phone size={12} />
                      <span>Phone</span>
                      <Check size={12} className="text-blue-600" />
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowPhoneVerification(true)}
                      className="flex items-center gap-1 bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full text-xs font-semibold hover:bg-orange-100 hover:text-orange-600 transition"
                    >
                      <Phone size={12} />
                      <span>Verify Phone</span>
                      <ChevronRight size={12} />
                    </button>
                  )}
                  */}
                </div>
              </div>
              
              {/* Location and member since */}
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                {(profile.city || profile.region) && (
                  <span className="flex items-center gap-1">
                    <MapPin size={14} />
                    {profile.city}{profile.city && profile.region ? ', ' : ''}{profile.region}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  Member for {getMemberDuration()}
                </span>
              </div>
            </div>
            
            {/* Trust score */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 mb-6 border border-emerald-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-600 rounded-full p-2">
                    <Shield size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Trust Score</h3>
                    <p className="text-xs text-gray-500">Based on verifications & activity</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-emerald-600">
                    {getTrustScore()}%
                  </div>
                  <p className="text-xs text-gray-500">
                    {getTrustScore() >= 80 ? 'Trusted seller' : 'Complete profile to boost'}
                  </p>
                </div>
              </div>
              
              {/* Trust progress bar */}
              <div className="mt-3 bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${getTrustScore()}%` }}
                ></div>
              </div>
              
              {/* Tips to improve score */}
              {getTrustScore() < 100 && (
                <p className="mt-2 text-xs text-emerald-600 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {!profile.photoURL ? 'Add a profile photo (+25%)' : 
                   !profile.bio ? 'Add a bio (+15%)' : 
                   !profile.city ? 'Add your location (+10%)' : 
                   'Great profile!'}
                </p>
              )}
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-gray-900">{stats.totalListings}</div>
                <div className="text-xs text-gray-500">Listings</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-gray-900">{stats.totalViews}</div>
                <div className="text-xs text-gray-500">Views</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-1">
                  {stats.totalReviews > 0 ? stats.avgRating : '-'}
                  {stats.totalReviews > 0 && <Star size={14} className="text-yellow-500 fill-yellow-500" />}
                </div>
                <div className="text-xs text-gray-500">{stats.totalReviews > 0 ? `${stats.totalReviews} reviews` : 'No reviews'}</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-emerald-600">{stats.responseRate}%</div>
                <div className="text-xs text-gray-500">Response</div>
              </div>
            </div>
            
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <div className="flex gap-6">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`pb-3 text-sm font-semibold transition relative ${
                    activeTab === 'profile' 
                      ? 'text-emerald-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Profile Info
                  {activeTab === 'profile' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full"></div>
                  )}
                </button>
                
                {/* MVP_DISABLED: Reviews tab
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`pb-3 text-sm font-semibold transition relative flex items-center gap-1 ${
                    activeTab === 'reviews' 
                      ? 'text-emerald-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Star size={14} />
                  Reviews
                  {activeTab === 'reviews' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full"></div>
                  )}
                </button>
                */}
                
                <button
                  onClick={() => setActiveTab('security')}
                  className={`pb-3 text-sm font-semibold transition relative ${
                    activeTab === 'security' 
                      ? 'text-emerald-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Security
                  {activeTab === 'security' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full"></div>
                  )}
                </button>
              </div>
            </div>
            
            {/* Tab Content */}
            {activeTab === 'profile' && (
              <div className="space-y-4">
                {isEditing ? (
                  // Edit mode
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Display Name</label>
                      <input
                        type="text"
                        value={editData.displayName ?? profile.displayName}
                        onChange={(e) => setEditData({ ...editData, displayName: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                        placeholder="Your name"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">City</label>
                        <select
                          value={editData.city ?? profile.city}
                          onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                        >
                          <option value="">Select city</option>
                          <option value="Auckland">Auckland</option>
                          <option value="Wellington">Wellington</option>
                          <option value="Christchurch">Christchurch</option>
                          <option value="Queenstown">Queenstown</option>
                          <option value="Rotorua">Rotorua</option>
                          <option value="Tauranga">Tauranga</option>
                          <option value="Hamilton">Hamilton</option>
                          <option value="Dunedin">Dunedin</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Region</label>
                        <select
                          value={editData.region ?? profile.region}
                          onChange={(e) => setEditData({ ...editData, region: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                        >
                          <option value="North Island">North Island</option>
                          <option value="South Island">South Island</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Bio</label>
                      <textarea
                        value={editData.bio ?? profile.bio}
                        onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none resize-none"
                        rows={3}
                        placeholder="Tell buyers about yourself..."
                        maxLength={500}
                      />
                      <p className="text-xs text-gray-400 mt-1 text-right">
                        {(editData.bio ?? profile.bio).length}/500
                      </p>
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={() => { setIsEditing(false); setEditData({}); }}
                        className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition flex items-center justify-center gap-2"
                      >
                        {saving ? (
                          <>
                            <Loader className="w-5 h-5 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save size={18} />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">About</h3>
                        <button
                          onClick={() => {
                            setIsEditing(true);
                            setEditData({
                              displayName: profile.displayName,
                              city: profile.city,
                              region: profile.region,
                              bio: profile.bio
                            });
                          }}
                          className="text-emerald-600 text-sm font-semibold flex items-center gap-1 hover:text-emerald-700"
                        >
                          <Edit3 size={14} />
                          Edit
                        </button>
                      </div>
                      {profile.bio ? (
                        <p className="text-gray-600">{profile.bio}</p>
                      ) : (
                        <p className="text-gray-400 italic">No bio yet. Click edit to add one!</p>
                      )}
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Contact Info</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 text-sm">
                          <Mail size={16} className="text-gray-400" />
                          <span className="text-gray-600">{currentUser?.email}</span>
                          <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-semibold">Verified</span>
                        </div>
                        {/* MVP_DISABLED: Phone display
                        {profile.phone && profile.phoneVerified && (
                          <div className="flex items-center gap-3 text-sm">
                            <Phone size={16} className="text-gray-400" />
                            <span className="text-gray-600">{profile.phone}</span>
                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-semibold">Verified</span>
                          </div>
                        )}
                        */}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
            
            {/* MVP_DISABLED: Reviews tab content
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                <SellerReviews sellerId={currentUser?.uid} limit={10} />
              </div>
            )}
            */}
            
            {activeTab === 'security' && (
              <div className="space-y-4">
                {/* Email verification */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-600 rounded-full p-2">
                      <Mail size={18} className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Email Address</h4>
                      <p className="text-sm text-gray-500">{currentUser?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-emerald-600 text-white px-3 py-1.5 rounded-full text-sm font-semibold">
                    <Check size={16} />
                    Verified
                  </div>
                </div>
                
                {/* MVP_DISABLED: Phone verification
                <div className={`border rounded-xl p-4 flex items-center justify-between ${
                  profile.phoneVerified 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`rounded-full p-2 ${profile.phoneVerified ? 'bg-blue-600' : 'bg-gray-400'}`}>
                      <Phone size={18} className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Phone Number</h4>
                      <p className="text-sm text-gray-500">
                        {profile.phoneVerified ? profile.phone : 'Not verified yet'}
                      </p>
                    </div>
                  </div>
                  {profile.phoneVerified ? (
                    <div className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-full text-sm font-semibold">
                      <Check size={16} />
                      Verified
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowPhoneVerification(true)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition"
                    >
                      Verify Now
                    </button>
                  )}
                </div>
                */}
                
                {/* Phone verification - Coming Soon placeholder */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-between opacity-60">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-400 rounded-full p-2">
                      <Phone size={18} className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Phone Number</h4>
                      <p className="text-sm text-gray-500">SMS verification</p>
                    </div>
                  </div>
                  <span className="bg-gray-200 text-gray-600 px-3 py-1.5 rounded-full text-sm font-semibold">
                    Coming Soon
                  </span>
                </div>
                
                {/* ID verification (coming soon) */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-between opacity-60">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-400 rounded-full p-2">
                      <Award size={18} className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">ID Verification</h4>
                      <p className="text-sm text-gray-500">Upload passport or driver's license</p>
                    </div>
                  </div>
                  <span className="bg-gray-200 text-gray-600 px-3 py-1.5 rounded-full text-sm font-semibold">
                    Coming Soon
                  </span>
                </div>
                
                {/* MVP_DISABLED: Stripe Connect - Configuration des paiements
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-xl">💳</span> Payment Setup
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium ml-2">
                      Receive money
                    </span>
                  </h4>
                  <p className="text-sm text-gray-500 mb-4">
                    Set up your Stripe account to receive deposits when buyers reserve your vans.
                  </p>
                  <StripeConnectSetup />
                </div>
                */}
              </div>
            )}
          </div>
        </div>
        
        {/* MVP_DISABLED: Phone Verification Modal - Code commenté pour réactivation future
        {showPhoneVerification && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4 z-30">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
              ... phone verification UI ...
            </div>
          </div>
        )}
        */}
      </div>
    </div>
  );
}