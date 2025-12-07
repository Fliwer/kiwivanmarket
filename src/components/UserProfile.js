import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { RecaptchaVerifier, signInWithPhoneNumber, updateProfile } from 'firebase/auth';
import { db, auth } from '../firebase';
import { useAuth } from '../AuthContext';
import { 
  X, Camera, Check, Shield, Phone, Mail, MapPin, Calendar, 
  Star, MessageCircle, Eye, Upload, AlertCircle, ChevronRight,
  Award, TrendingUp, Clock, Edit3, Save, Loader
} from 'lucide-react';
import { SellerReviews } from './ReviewSystem';
import { StripeConnectSetup } from './StripeConnect';

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
  
  // Phone verification
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneCountry, setPhoneCountry] = useState('+64'); // Default NZ
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState(null);
  const [phoneStep, setPhoneStep] = useState('input'); // 'input', 'verify', 'success'
  const [phoneError, setPhoneError] = useState('');
  
  // Country codes for phone verification
  const countryCodes = [
    { code: '+64', country: 'NZ', flag: '🇳🇿', name: 'New Zealand' },
    { code: '+61', country: 'AU', flag: '🇦🇺', name: 'Australia' },
    { code: '+44', country: 'UK', flag: '🇬🇧', name: 'United Kingdom' },
    { code: '+33', country: 'FR', flag: '🇫🇷', name: 'France' },
    { code: '+49', country: 'DE', flag: '🇩🇪', name: 'Germany' },
    { code: '+31', country: 'NL', flag: '🇳🇱', name: 'Netherlands' },
    { code: '+32', country: 'BE', flag: '🇧🇪', name: 'Belgium' },
    { code: '+41', country: 'CH', flag: '🇨🇭', name: 'Switzerland' },
    { code: '+34', country: 'ES', flag: '🇪🇸', name: 'Spain' },
    { code: '+39', country: 'IT', flag: '🇮🇹', name: 'Italy' },
    { code: '+1', country: 'US', flag: '🇺🇸', name: 'United States' },
    { code: '+1', country: 'CA', flag: '🇨🇦', name: 'Canada' },
    { code: '+353', country: 'IE', flag: '🇮🇪', name: 'Ireland' },
    { code: '+81', country: 'JP', flag: '🇯🇵', name: 'Japan' },
    { code: '+82', country: 'KR', flag: '🇰🇷', name: 'South Korea' },
    { code: '+86', country: 'CN', flag: '🇨🇳', name: 'China' },
    { code: '+91', country: 'IN', flag: '🇮🇳', name: 'India' },
    { code: '+55', country: 'BR', flag: '🇧🇷', name: 'Brazil' },
    { code: '+54', country: 'AR', flag: '🇦🇷', name: 'Argentina' },
    { code: '+56', country: 'CL', flag: '🇨🇱', name: 'Chile' },
  ];
  
  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

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
          responseRate: 100, // TODO: Calculate from messages
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
      formData.append('upload_preset', 'kiwivan_unsigned'); // You need to create this preset in Cloudinary
      formData.append('folder', 'profile_photos');
      
      const cloudName = 'dsgnwjmlv'; // Your Cloudinary cloud name
      
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

  // Phone verification - Step 1: Send code
  const sendVerificationCode = async () => {
    if (!phoneNumber || phoneNumber.length < 6) {
      setPhoneError('Please enter a valid phone number');
      return;
    }
    
    try {
      setPhoneError('');
      
      // Format phone number with selected country code
      let formattedPhone = phoneNumber.replace(/\s/g, ''); // Remove spaces
      if (formattedPhone.startsWith('0')) {
        formattedPhone = formattedPhone.substring(1); // Remove leading 0
      }
      formattedPhone = phoneCountry + formattedPhone;
      
      // Setup reCAPTCHA
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'normal',
          callback: () => {},
          'expired-callback': () => {
            setPhoneError('reCAPTCHA expired. Please try again.');
          }
        });
      }
      
      const confirmationResult = await signInWithPhoneNumber(
        auth, 
        formattedPhone, 
        window.recaptchaVerifier
      );
      
      setVerificationId(confirmationResult);
      setPhoneStep('verify');
      
    } catch (error) {
      console.error('Error sending code:', error);
      setPhoneError(error.message || 'Failed to send verification code');
      
      // Reset reCAPTCHA on error
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    }
  };

  // Phone verification - Step 2: Verify code
  const verifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setPhoneError('Please enter the 6-digit code');
      return;
    }
    
    try {
      setPhoneError('');
      
      await verificationId.confirm(verificationCode);
      
      // Format full phone number with country code
      let fullPhone = phoneNumber.replace(/\s/g, '');
      if (fullPhone.startsWith('0')) {
        fullPhone = fullPhone.substring(1);
      }
      fullPhone = phoneCountry + ' ' + fullPhone;
      
      // Update Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        phone: fullPhone,
        phoneVerified: true
      });
      
      // Update local state
      setProfile(prev => ({
        ...prev,
        phone: fullPhone,
        phoneVerified: true
      }));
      
      setPhoneStep('success');
      
      setTimeout(() => {
        setShowPhoneVerification(false);
        setPhoneStep('input');
        setPhoneNumber('');
        setVerificationCode('');
      }, 2000);
      
    } catch (error) {
      console.error('Error verifying code:', error);
      setPhoneError('Invalid code. Please try again.');
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full my-8 relative shadow-2xl overflow-hidden">
        
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 h-32 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition"
          >
            <X size={24} className="text-white" />
          </button>
          
          {/* Decorative circles */}
          <div className="absolute top-4 left-4 w-20 h-20 bg-white/10 rounded-full"></div>
          <div className="absolute bottom-0 right-12 w-32 h-32 bg-white/5 rounded-full translate-y-1/2"></div>
        </div>
        
        {/* Profile photo */}
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
                
                {/* Phone verified or not */}
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
                  {(profile.phoneVerified ? 80 : 50) + (profile.photoURL ? 10 : 0) + (profile.bio ? 10 : 0)}%
                </div>
                <p className="text-xs text-gray-500">
                  {profile.phoneVerified ? 'Verified seller' : 'Add phone to boost'}
                </p>
              </div>
            </div>
            
            {/* Trust progress bar */}
            <div className="mt-3 bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(profile.phoneVerified ? 80 : 50) + (profile.photoURL ? 10 : 0) + (profile.bio ? 10 : 0)}%` }}
              ></div>
            </div>
            
            {/* Missing verifications hint */}
            {!profile.phoneVerified && (
              <p className="mt-2 text-xs text-orange-600 flex items-center gap-1">
                <AlertCircle size={12} />
                Verify your phone number to increase trust (+30%)
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
              <div className="flex items-center justify-center gap-1">
                <Star size={16} className={stats.totalReviews > 0 ? "text-yellow-500 fill-yellow-500" : "text-gray-300"} />
                <span className="text-2xl font-bold text-gray-900">
                  {stats.totalReviews > 0 ? stats.avgRating : '-'}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                {stats.totalReviews > 0 ? `${stats.totalReviews} review${stats.totalReviews > 1 ? 's' : ''}` : 'No reviews'}
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.responseRate}%</div>
              <div className="text-xs text-gray-500">Response</div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-2 mb-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 font-semibold text-sm transition border-b-2 -mb-px ${
                activeTab === 'profile'
                  ? 'text-emerald-600 border-emerald-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              Profile Info
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-4 py-2 font-semibold text-sm transition border-b-2 -mb-px flex items-center gap-1 ${
                activeTab === 'reviews'
                  ? 'text-emerald-600 border-emerald-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              <Star size={14} />
              Reviews
              {stats.totalReviews > 0 && (
                <span className="bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full text-xs">
                  {stats.totalReviews}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-4 py-2 font-semibold text-sm transition border-b-2 -mb-px ${
                activeTab === 'security'
                  ? 'text-emerald-600 border-emerald-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              Security
            </button>
          </div>
          
          {/* Tab content */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              {isEditing ? (
                // Edit mode
                <>
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
                        <option value="">Select city...</option>
                        <option value="Auckland">Auckland</option>
                        <option value="Wellington">Wellington</option>
                        <option value="Christchurch">Christchurch</option>
                        <option value="Queenstown">Queenstown</option>
                        <option value="Hamilton">Hamilton</option>
                        <option value="Tauranga">Tauranga</option>
                        <option value="Dunedin">Dunedin</option>
                        <option value="Rotorua">Rotorua</option>
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
                    <label className="block text-sm font-semibold text-gray-700 mb-1">About Me</label>
                    <textarea
                      value={editData.bio ?? profile.bio}
                      onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none resize-none"
                      rows={3}
                      placeholder="Tell buyers a bit about yourself..."
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setIsEditing(false); setEditData({}); }}
                      className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition flex items-center justify-center gap-2"
                    >
                      {saving ? (
                        <Loader className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Save size={18} />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                // View mode
                <>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">About Me</h3>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-emerald-600 hover:text-emerald-700 text-sm font-semibold flex items-center gap-1"
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
                      {profile.phone && profile.phoneVerified && (
                        <div className="flex items-center gap-3 text-sm">
                          <Phone size={16} className="text-gray-400" />
                          <span className="text-gray-600">{profile.phone}</span>
                          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-semibold">Verified</span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <SellerReviews sellerId={currentUser?.uid} limit={10} />
            </div>
          )}
          
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
              
              {/* Phone verification */}
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
              
              {/* 💳 Stripe Connect - Configuration des paiements */}
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
            </div>
          )}
        </div>
        
        {/* Phone Verification Modal */}
        {showPhoneVerification && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Verify Phone</h3>
                <button 
                  onClick={() => {
                    setShowPhoneVerification(false);
                    setPhoneStep('input');
                    setPhoneError('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              
              {phoneStep === 'input' && (
                <>
                  <p className="text-gray-600 text-sm mb-4">
                    Enter your phone number. We'll send you a verification code via SMS.
                  </p>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                    <div className="flex">
                      <select
                        value={phoneCountry}
                        onChange={(e) => setPhoneCountry(e.target.value)}
                        className="bg-gray-100 border-2 border-r-0 border-gray-200 rounded-l-xl px-2 py-3 text-gray-700 text-sm focus:outline-none focus:border-emerald-500 cursor-pointer"
                      >
                        {countryCodes.map((c) => (
                          <option key={c.country} value={c.code}>
                            {c.flag} {c.code}
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/[^\d\s]/g, ''))}
                        placeholder="21 123 4567"
                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-r-xl focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {countryCodes.find(c => c.code === phoneCountry)?.flag} {countryCodes.find(c => c.code === phoneCountry)?.name}
                    </p>
                  </div>
                  
                  <div id="recaptcha-container" className="mb-4"></div>
                  
                  {phoneError && (
                    <p className="text-red-500 text-sm mb-4 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {phoneError}
                    </p>
                  )}
                  
                  <button
                    onClick={sendVerificationCode}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold transition"
                  >
                    Send Code
                  </button>
                </>
              )}
              
              {phoneStep === 'verify' && (
                <>
                  <p className="text-gray-600 text-sm mb-4">
                    Enter the 6-digit code sent to {phoneCountry} {phoneNumber}
                  </p>
                  
                  <div className="mb-4">
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none text-center text-2xl tracking-widest font-mono"
                      maxLength={6}
                    />
                  </div>
                  
                  {phoneError && (
                    <p className="text-red-500 text-sm mb-4 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {phoneError}
                    </p>
                  )}
                  
                  <button
                    onClick={verifyCode}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold transition"
                  >
                    Verify
                  </button>
                  
                  <button
                    onClick={() => setPhoneStep('input')}
                    className="w-full mt-2 text-gray-500 hover:text-gray-700 text-sm font-semibold"
                  >
                    ← Change number
                  </button>
                </>
              )}
              
              {phoneStep === 'success' && (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check size={32} className="text-emerald-600" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Phone Verified!</h4>
                  <p className="text-gray-600 text-sm">Your phone number has been verified successfully.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}