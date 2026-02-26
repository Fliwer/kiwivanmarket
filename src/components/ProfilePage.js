import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import { uploadToCloudinary } from '../cloudinaryConfig';
import {
  ArrowLeft, Camera, Check, Shield, Mail, MapPin, Calendar,
  Star, Eye, AlertCircle, Edit3, Save, Loader, User, Car
} from 'lucide-react';

import { useTranslation } from 'react-i18next';
import SeoHead from './SeoHead';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

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
    avgRating: 0,
    totalReviews: 0
  });

  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  // Hide app-loader on mount
  useEffect(() => {
    const loader = document.getElementById('app-loader');
    if (loader) {
      loader.classList.add('fade-out');
      setTimeout(() => loader.remove(), 500);
    }
  }, []);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !currentUser) {
      navigate('/');
    }
  }, [currentUser, loading, navigate]);

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

        // Load user stats
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
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
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

      const result = await uploadToCloudinary(file, { folder: 'profile_photos' });
      const photoURL = result.url;

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

  // Calculate trust score
  const getTrustScore = () => {
    let score = 50;
    if (profile.photoURL) score += 25;
    if (profile.bio) score += 15;
    if (profile.city) score += 10;
    return Math.min(score, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  const trustScore = getTrustScore();

  return (
    <>
      <SeoHead
        title="My Profile"
        noindex={true}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 text-white">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-white/20 rounded-xl transition"
                aria-label="Go back"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-bold">My Profile</h1>
                <p className="text-white/80 text-sm">Manage your account settings</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
            {/* Cover & Avatar */}
            <div className="h-32 bg-gradient-to-r from-emerald-500 to-teal-500 relative">
              <div className="absolute -bottom-16 left-6">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-100 overflow-hidden shadow-xl">
                    {profile.photoURL ? (
                      <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-100">
                        <User size={48} className="text-emerald-600" />
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 p-2 bg-emerald-600 rounded-full text-white cursor-pointer hover:bg-emerald-700 transition shadow-lg">
                    {uploadingPhoto ? (
                      <Loader size={20} className="animate-spin" />
                    ) : (
                      <Camera size={20} />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      disabled={uploadingPhoto}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="pt-20 pb-6 px-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.displayName ?? profile.displayName}
                      onChange={(e) => setEditData({ ...editData, displayName: e.target.value })}
                      className="text-2xl font-bold border-b-2 border-emerald-500 outline-none bg-transparent"
                      placeholder="Your name"
                    />
                  ) : (
                    <h2 className="text-2xl font-bold text-gray-900">
                      {profile.displayName || 'Anonymous User'}
                    </h2>
                  )}
                  <div className="flex items-center gap-2 text-gray-500 mt-1">
                    <Mail size={16} />
                    <span>{currentUser.email}</span>
                    <Check size={14} className="text-emerald-600" />
                  </div>
                </div>

                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => { setIsEditing(false); setEditData({}); }}
                        className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition flex items-center gap-2"
                      >
                        {saving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                        Save
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition flex items-center gap-2"
                    >
                      <Edit3 size={16} />
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>

              {/* Location & Member Since */}
              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin size={16} className="text-emerald-600" />
                  {isEditing ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editData.city ?? profile.city}
                        onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                        placeholder="City"
                        className="border-b border-gray-300 outline-none w-24"
                      />
                      <select
                        value={editData.region ?? profile.region}
                        onChange={(e) => setEditData({ ...editData, region: e.target.value })}
                        className="border-b border-gray-300 outline-none"
                      >
                        <option value="North Island">North Island</option>
                        <option value="South Island">South Island</option>
                      </select>
                    </div>
                  ) : (
                    <span>{profile.city || 'Location not set'}{profile.city && `, ${profile.region}`}</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar size={16} className="text-emerald-600" />
                  <span>Member for {getMemberDuration()}</span>
                </div>
              </div>

              {/* Bio */}
              <div className="mt-4">
                {isEditing ? (
                  <textarea
                    value={editData.bio ?? profile.bio}
                    onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                    placeholder="Tell buyers about yourself..."
                    className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 resize-none"
                    rows={3}
                    maxLength={500}
                  />
                ) : (
                  <p className="text-gray-600">
                    {profile.bio || 'No bio yet. Click Edit Profile to add one.'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 text-emerald-600 mb-2">
                <Car size={20} />
                <span className="text-sm font-medium">Listings</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalListings}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <Eye size={20} />
                <span className="text-sm font-medium">Total Views</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalViews}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 text-yellow-600 mb-2">
                <Star size={20} />
                <span className="text-sm font-medium">Rating</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalReviews > 0 ? stats.avgRating : '-'}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 text-purple-600 mb-2">
                <Shield size={20} />
                <span className="text-sm font-medium">Trust Score</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{trustScore}%</p>
            </div>
          </div>

          {/* Trust Score Details */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="text-emerald-600" />
              Trust Score Breakdown
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Email verified</span>
                <Check size={20} className="text-emerald-600" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Profile photo</span>
                {profile.photoURL ? (
                  <Check size={20} className="text-emerald-600" />
                ) : (
                  <AlertCircle size={20} className="text-gray-300" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Bio added</span>
                {profile.bio ? (
                  <Check size={20} className="text-emerald-600" />
                ) : (
                  <AlertCircle size={20} className="text-gray-300" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Location set</span>
                {profile.city ? (
                  <Check size={20} className="text-emerald-600" />
                ) : (
                  <AlertCircle size={20} className="text-gray-300" />
                )}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Overall Trust Score</span>
                <span className="text-sm font-bold text-emerald-600">{trustScore}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all"
                  style={{ width: `${trustScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Links</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                to="/my-listings"
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition"
              >
                <Car size={24} className="text-emerald-600" />
                <div>
                  <p className="font-semibold">My Listings</p>
                  <p className="text-sm text-gray-500">{stats.totalListings} vans listed</p>
                </div>
              </Link>
              <Link
                to="/sell"
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition"
              >
                <span className="text-2xl">+</span>
                <div>
                  <p className="font-semibold">Sell a Van</p>
                  <p className="text-sm text-gray-500">List your van for free</p>
                </div>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
