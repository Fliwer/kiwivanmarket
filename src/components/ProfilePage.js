import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import { uploadToCloudinary } from '../cloudinaryConfig';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Camera, Check, Shield, Mail, MapPin, Calendar,
  Star, Eye, AlertCircle, Edit3, Save, Loader, User, Car,
  Heart, MessageCircle, ChevronRight, Zap, Award, TrendingUp, Phone,
  Settings, Lock, LogOut, Plus, X
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SeoHead from './SeoHead';

const TABS = ['profile', 'listings', 'favorites', 'messages', 'settings'];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({
    displayName: '', photoURL: '', phone: '', city: '',
    region: 'North Island', bio: '', createdAt: null
  });
  const [stats, setStats] = useState({
    totalListings: 0, activeListings: 0, totalViews: 0,
    avgRating: 0, totalReviews: 0, favorites: 0,
    totalConversations: 0, unreadMessages: 0, activeThreads: 0
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [successMsg, setSuccessMsg] = useState('');

  // Hide app-loader
  useEffect(() => {
    const loader = document.getElementById('app-loader');
    if (loader) { loader.classList.add('fade-out'); setTimeout(() => loader.remove(), 500); }
  }, []);

  useEffect(() => {
    if (!loading && !currentUser) navigate('/');
  }, [currentUser, loading, navigate]);

  useEffect(() => {
    const load = async () => {
      if (!currentUser) return;
      try {
        setLoading(true);
        const userRef = doc(db, 'users', currentUser.uid);
        const snap = await getDoc(userRef);

        if (snap.exists()) {
          const d = snap.data();
          setProfile({
            displayName: d.displayName || currentUser.displayName || '',
            photoURL: d.photoURL || currentUser.photoURL || '',
            phone: d.phone || '',
            city: d.city || '',
            region: d.region || 'North Island',
            bio: d.bio || '',
            createdAt: d.createdAt || currentUser.metadata?.creationTime
          });
        } else {
          const init = {
            uid: currentUser.uid, email: currentUser.email,
            displayName: currentUser.displayName || '', photoURL: currentUser.photoURL || '',
            phone: '', city: '', region: 'North Island', bio: '',
            createdAt: new Date(), lastActive: new Date()
          };
          await setDoc(userRef, init);
          setProfile(init);
        }

        // Load stats
        const vansQ = query(collection(db, 'vans'), where('seller.uid', '==', currentUser.uid));
        const vansSnap = await getDocs(vansQ);
        const vans = vansSnap.docs.map(d => d.data());
        const totalViews = vans.reduce((s, v) => s + (v.views || 0), 0);
        const activeListings = vans.filter(v => v.status === 'active').length;

        const reviewsQ = query(collection(db, 'reviews'), where('sellerId', '==', currentUser.uid));
        const reviewsSnap = await getDocs(reviewsQ);
        const totalReviews = reviewsSnap.size;
        const avgRating = totalReviews > 0
          ? parseFloat((reviewsSnap.docs.reduce((s, d) => s + (d.data().rating || 0), 0) / totalReviews).toFixed(1))
          : 0;

        const favQ = query(collection(db, 'favorites'), where('userId', '==', currentUser.uid));
        const favSnap = await getDocs(favQ);

        const convQ = query(collection(db, 'conversations'), where('participants', 'array-contains', currentUser.uid));
        const convSnap = await getDocs(convQ);
        const convos = convSnap.docs.map(d => d.data());
        const unreadMessages = convos.reduce((sum, c) => sum + (c.unreadCount?.[currentUser.uid] || 0), 0);
        const activeThreads = convos.filter((c) => {
          const date = c.lastMessageAt?.toDate ? c.lastMessageAt.toDate() : new Date(c.lastMessageAt || 0);
          const thirtyDaysAgo = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000));
          return date > thirtyDaysAgo;
        }).length;

        setStats({
          totalListings: vansSnap.size, activeListings,
          totalViews, avgRating, totalReviews, favorites: favSnap.size,
          totalConversations: convSnap.size, unreadMessages, activeThreads
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentUser]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('Image must be less than 5MB'); return; }
    try {
      setUploadingPhoto(true);
      const result = await uploadToCloudinary(file, { folder: 'profile_photos' });
      const photoURL = result.url;
      await updateDoc(doc(db, 'users', currentUser.uid), { photoURL });
      await updateProfile(currentUser, { photoURL });
      setProfile(p => ({ ...p, photoURL }));
    } catch (e) {
      console.error(e);
      alert('Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateDoc(doc(db, 'users', currentUser.uid), {
        displayName: editData.displayName ?? profile.displayName,
        city: editData.city ?? profile.city,
        region: editData.region ?? profile.region,
        bio: editData.bio ?? profile.bio,
        phone: editData.phone ?? profile.phone,
        lastActive: new Date()
      });
      if (editData.displayName) await updateProfile(currentUser, { displayName: editData.displayName });
      setProfile(p => ({ ...p, ...editData }));
      setIsEditing(false);
      setEditData({});
      setSuccessMsg('Profile saved!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) {
      console.error(e);
      alert('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const getMemberDuration = () => {
    if (!profile.createdAt) return 'New member';
    const created = profile.createdAt.toDate ? profile.createdAt.toDate() : new Date(profile.createdAt);
    const months = Math.floor((new Date() - created) / (1000 * 60 * 60 * 24 * 30));
    if (months < 1) return 'New member';
    if (months < 12) return `${months} month${months > 1 ? 's' : ''}`;
    const y = Math.floor(months / 12);
    return `${y} year${y > 1 ? 's' : ''}`;
  };

  const trustScore = Math.min(
    50 + (profile.photoURL ? 20 : 0) + (profile.bio ? 15 : 0) + (profile.city ? 10 : 0) + (profile.phone ? 5 : 0),
    100
  );

  const trustLevel = trustScore >= 90 ? { label: 'Elite', color: 'text-emerald-600', bg: 'bg-emerald-50' }
    : trustScore >= 70 ? { label: 'Trusted', color: 'text-blue-600', bg: 'bg-blue-50' }
      : { label: 'New', color: 'text-slate-500', bg: 'bg-slate-100' };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white shadow-xl flex items-center justify-center">
            <Loader className="w-7 h-7 text-emerald-600 animate-spin" />
          </div>
          <p className="text-slate-500 font-medium text-sm">Loading your profile…</p>
        </div>
      </div>
    );
  }

  if (!currentUser) return null;

  const tabConfig = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'listings', label: 'My Vans', icon: Car, badge: stats.activeListings },
    { id: 'favorites', label: 'Saved', icon: Heart, badge: stats.favorites },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      <SeoHead title="My Profile" noindex={true} />

      <div className="min-h-screen bg-slate-50 pb-24 lg:pb-8">

        {/* ═══ HERO HEADER ═══ */}
        <div className="relative bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-[-30%] right-[-10%] w-80 h-80 bg-emerald-400 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-20%] left-[-10%] w-64 h-64 bg-teal-400 rounded-full blur-[80px]" />
          </div>

          <div className="relative max-w-4xl mx-auto px-4 pt-6 pb-24">
            {/* Back */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-white/60 hover:text-white transition mb-8 text-sm font-medium"
            >
              <ArrowLeft size={18} />
              Back
            </button>

            {/* Avatar + Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-28 h-28 rounded-3xl border-4 border-white/20 bg-white/10 overflow-hidden shadow-2xl">
                  {profile.photoURL ? (
                    <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600">
                      <User size={44} className="text-white" />
                    </div>
                  )}
                </div>
                <label className="absolute -bottom-2 -right-2 p-2.5 bg-emerald-500 rounded-xl text-white cursor-pointer hover:bg-emerald-400 transition shadow-lg border-2 border-white/20">
                  {uploadingPhoto ? <Loader size={16} className="animate-spin" /> : <Camera size={16} />}
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" disabled={uploadingPhoto} />
                </label>
              </div>

              {/* Name + Info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-3xl font-black text-white tracking-tight">
                    {profile.displayName || 'Anonymous User'}
                  </h1>
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${trustLevel.bg} ${trustLevel.color}`}>
                    {trustLevel.label}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-white/60 text-sm">
                  <span className="flex items-center gap-1.5">
                    <Mail size={14} />
                    {currentUser.email}
                    {currentUser.emailVerified && <Check size={12} className="text-emerald-400" />}
                  </span>
                  {profile.city && (
                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} />
                      {profile.city}, {profile.region}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    {getMemberDuration()}
                  </span>
                </div>
              </div>

              {/* Edit button */}
              <button
                onClick={() => { setIsEditing(true); setActiveTab('profile'); }}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition border border-white/10 text-sm"
              >
                <Edit3 size={15} />
                Edit Profile
              </button>
            </div>

            {/* Stats strip */}
            <div className="mt-8 grid grid-cols-4 gap-3">
              {[
                { label: 'Vans', value: stats.totalListings, icon: Car, color: 'text-emerald-400' },
                { label: 'Views', value: stats.totalViews, icon: Eye, color: 'text-blue-400' },
                { label: 'Msgs', value: stats.totalConversations, icon: MessageCircle, color: 'text-cyan-400' },
                { label: 'Trust', value: `${trustScore}%`, icon: Shield, color: 'text-purple-400' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-white/5 rounded-2xl p-3 text-center border border-white/10">
                  <Icon size={16} className={`${color} mx-auto mb-1.5`} />
                  <div className="text-xl font-black text-white">{value}</div>
                  <div className="text-white/40 text-xs font-semibold uppercase tracking-wider mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ TABS ═══ */}
        <div className="sticky top-0 z-20 bg-white border-b border-slate-100 shadow-sm">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex overflow-x-auto scrollbar-hide">
              {tabConfig.map(({ id, label, icon: Icon, badge }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`relative flex items-center gap-2 px-4 py-4 text-sm font-semibold whitespace-nowrap transition border-b-2 ${activeTab === id
                      ? 'text-emerald-600 border-emerald-500'
                      : 'text-slate-500 border-transparent hover:text-slate-800'
                    }`}
                >
                  <Icon size={16} />
                  {label}
                  {badge > 0 && (
                    <span className="bg-emerald-500 text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                      {badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ TAB CONTENT ═══ */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >

              {/* ─── PROFILE TAB ─── */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  {/* Success toast */}
                  <AnimatePresence>
                    {successMsg && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-2 font-medium text-sm"
                      >
                        <Check size={16} /> {successMsg}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Edit form / Display */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-black text-slate-900">About me</h2>
                      {!isEditing ? (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="flex items-center gap-2 text-sm text-emerald-600 font-semibold hover:text-emerald-500 transition"
                        >
                          <Edit3 size={15} /> Edit
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setIsEditing(false); setEditData({}); }}
                            className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-4 py-1.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-500 transition flex items-center gap-1.5"
                          >
                            {saving ? <Loader size={14} className="animate-spin" /> : <Save size={14} />}
                            Save
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-5">
                      {/* Display Name */}
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Display Name</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editData.displayName ?? profile.displayName}
                            onChange={e => setEditData({ ...editData, displayName: e.target.value })}
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
                            placeholder="Your name"
                          />
                        ) : (
                          <p className="text-slate-800 font-semibold">{profile.displayName || <span className="text-slate-400 italic">Not set</span>}</p>
                        )}
                      </div>

                      {/* Phone / WhatsApp */}
                      <div className="relative group">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          <Phone size={14} className="text-emerald-500" />
                          WhatsApp / Phone
                          {profile.phone && <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full lowercase font-medium">Contact direct activé</span>}
                        </label>
                        {isEditing ? (
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 px-1 border-r border-slate-100 flex items-center justify-center">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                            </div>
                            <input
                              type="tel"
                              value={editData.phone ?? profile.phone}
                              onChange={e => setEditData({ ...editData, phone: e.target.value })}
                              className="w-full pl-12 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
                              placeholder="+64 21 000 0000"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                             <p className="text-slate-800 font-semibold">{profile.phone || <span className="text-slate-400 italic">Non renseigné</span>}</p>
                             {profile.phone && <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />}
                          </div>
                        )}
                      </div>

                      {/* City */}
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">City</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editData.city ?? profile.city}
                            onChange={e => setEditData({ ...editData, city: e.target.value })}
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
                            placeholder="Auckland"
                          />
                        ) : (
                          <p className="text-slate-800 font-semibold">{profile.city || <span className="text-slate-400 italic">Not set</span>}</p>
                        )}
                      </div>

                      {/* Region */}
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Region</label>
                        {isEditing ? (
                          <select
                            value={editData.region ?? profile.region}
                            onChange={e => setEditData({ ...editData, region: e.target.value })}
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition bg-white"
                          >
                            <option value="North Island">North Island</option>
                            <option value="South Island">South Island</option>
                          </select>
                        ) : (
                          <p className="text-slate-800 font-semibold">{profile.region}</p>
                        )}
                      </div>

                      {/* Bio */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Bio</label>
                        {isEditing ? (
                          <>
                            <textarea
                              value={editData.bio ?? profile.bio}
                              onChange={e => setEditData({ ...editData, bio: e.target.value })}
                              placeholder="Tell buyers a bit about yourself…"
                              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition resize-none"
                              rows={3}
                              maxLength={500}
                            />
                            <p className="text-xs text-slate-400 text-right mt-1">{(editData.bio ?? profile.bio)?.length || 0}/500</p>
                          </>
                        ) : (
                          <p className="text-slate-700 leading-relaxed text-sm">
                            {profile.bio || <span className="text-slate-400 italic">Add a bio to build trust with buyers.</span>}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Trust Score */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-lg font-black text-slate-900">Trust Score</h2>
                        <p className="text-slate-500 text-sm mt-0.5">Complete your profile to increase buyer confidence</p>
                      </div>
                      <div className="text-right">
                        <div className={`text-3xl font-black ${trustLevel.color}`}>{trustScore}%</div>
                        <div className={`text-xs font-bold px-2 py-0.5 rounded-full ${trustLevel.bg} ${trustLevel.color} mt-1`}>{trustLevel.label}</div>
                      </div>
                    </div>

                    {/* Bar */}
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden mb-6">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${trustScore}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                      />
                    </div>

                    {/* Checklist */}
                    <div className="space-y-3">
                      {[
                        { label: 'Email verified', done: true, points: 50, locked: true },
                        { label: 'Profile photo added', done: !!profile.photoURL, points: 20 },
                        { label: 'Bio written', done: !!profile.bio, points: 15 },
                        { label: 'Location set', done: !!profile.city, points: 10 },
                        { label: 'Phone added', done: !!profile.phone, points: 5 },
                      ].map(({ label, done, points, locked }) => (
                        <div key={label} className={`flex items-center justify-between p-3 rounded-xl transition ${done ? 'bg-emerald-50' : 'bg-slate-50'}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${done ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                              {done ? <Check size={14} className="text-white" /> : <Plus size={14} className="text-slate-500" />}
                            </div>
                            <span className={`text-sm font-semibold ${done ? 'text-emerald-800' : 'text-slate-600'}`}>{label}</span>
                          </div>
                          <span className={`text-xs font-black px-2 py-1 rounded-full ${done ? 'text-emerald-600 bg-emerald-100' : 'text-slate-400 bg-slate-200'}`}>
                            +{points}pts
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ─── LISTINGS TAB ─── */}
              {activeTab === 'listings' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-black text-slate-900">My Vans ({stats.totalListings})</h2>
                    <Link
                      to="/sell"
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-500 transition"
                    >
                      <Plus size={15} /> List a Van
                    </Link>
                  </div>
                  <Link
                    to="/my-listings"
                    className="block group bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:border-emerald-200 hover:shadow-md transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center">
                          <Car size={26} className="text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-lg">{stats.activeListings} active listing{stats.activeListings !== 1 ? 's' : ''}</p>
                          <p className="text-slate-500 text-sm">{stats.totalViews} total views across all your listings</p>
                        </div>
                      </div>
                      <ChevronRight size={20} className="text-slate-400 group-hover:text-emerald-600 transition" />
                    </div>
                  </Link>
                  {stats.totalListings === 0 && (
                    <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
                      <Car size={40} className="text-slate-300 mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-slate-700 mb-2">No vans listed yet</h3>
                      <p className="text-slate-500 text-sm mb-6">List your first van for free — it only takes a few minutes.</p>
                      <Link to="/sell" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition">
                        <Plus size={16} /> List a Van
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* ─── FAVORITES TAB ─── */}
              {activeTab === 'favorites' && (
                <div className="space-y-4">
                  <h2 className="text-lg font-black text-slate-900">Saved Vans ({stats.favorites})</h2>
                  {stats.favorites > 0 ? (
                    <Link
                      to="/"
                      state={{ openFavorites: true }}
                      className="block group bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:border-pink-200 hover:shadow-md transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-pink-50 flex items-center justify-center">
                            <Heart size={26} className="text-pink-500 fill-pink-200" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-lg">{stats.favorites} saved van{stats.favorites !== 1 ? 's' : ''}</p>
                            <p className="text-slate-500 text-sm">Vans you've bookmarked for later</p>
                          </div>
                        </div>
                        <ChevronRight size={20} className="text-slate-400 group-hover:text-pink-500 transition" />
                      </div>
                    </Link>
                  ) : (
                    <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
                      <Heart size={40} className="text-slate-300 mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-slate-700 mb-2">No saved vans yet</h3>
                      <p className="text-slate-500 text-sm mb-6">Tap the heart on any listing to save it for later.</p>
                      <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition">
                        Browse Vans
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* ─── MESSAGES TAB ─── */}
              {activeTab === 'messages' && (
                <div className="space-y-4">
                  <h2 className="text-lg font-black text-slate-900">Messages</h2>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white border border-slate-100 rounded-xl p-3">
                      <p className="text-[10px] uppercase font-black text-slate-400">Conversations</p>
                      <p className="text-xl font-black text-slate-900">{stats.totalConversations}</p>
                    </div>
                    <div className="bg-white border border-slate-100 rounded-xl p-3">
                      <p className="text-[10px] uppercase font-black text-slate-400">Unread</p>
                      <p className="text-xl font-black text-red-600">{stats.unreadMessages}</p>
                    </div>
                    <div className="bg-white border border-slate-100 rounded-xl p-3">
                      <p className="text-[10px] uppercase font-black text-slate-400">Active 30d</p>
                      <p className="text-xl font-black text-emerald-600">{stats.activeThreads}</p>
                    </div>
                  </div>
                  <Link
                    to="/messages"
                    className="block group bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:border-blue-200 hover:shadow-md transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
                          <MessageCircle size={26} className="text-blue-500" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-lg">Open Inbox</p>
                          <p className="text-slate-500 text-sm">View all your conversations</p>
                        </div>
                      </div>
                      <ChevronRight size={20} className="text-slate-400 group-hover:text-blue-500 transition" />
                    </div>
                  </Link>
                </div>
              )}

              {/* ─── SETTINGS TAB ─── */}
              {activeTab === 'settings' && (
                <div className="space-y-4">
                  <h2 className="text-lg font-black text-slate-900">Settings</h2>

                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-100">
                    <div className="p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <Mail size={18} className="text-slate-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 text-sm">Email address</p>
                        <p className="text-slate-500 text-xs truncate">{currentUser.email}</p>
                      </div>
                      {currentUser.emailVerified && (
                        <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-lg flex-shrink-0">
                          <Check size={11} /> Verified
                        </span>
                      )}
                    </div>

                    <div className="p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <Lock size={18} className="text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800 text-sm">Password</p>
                        <p className="text-slate-500 text-xs">Change via Firebase Authentication</p>
                      </div>
                    </div>

                    <div className="p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <Shield size={18} className="text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800 text-sm">Account security</p>
                        <p className="text-slate-500 text-xs">Trust score: {trustScore}% — {trustLevel.label}</p>
                      </div>
                    </div>
                  </div>

                  {/* Logout */}
                  <button
                    onClick={async () => { await logout(); navigate('/'); }}
                    className="w-full flex items-center justify-center gap-3 p-4 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-2xl transition"
                  >
                    <LogOut size={18} />
                    Sign Out
                  </button>

                  {/* Danger zone */}
                  <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6">
                    <h3 className="font-black text-red-600 mb-1">Danger Zone</h3>
                    <p className="text-slate-500 text-sm mb-4">These actions are permanent and cannot be undone.</p>
                    <button className="text-sm text-red-500 font-semibold border border-red-200 px-4 py-2 rounded-xl hover:bg-red-50 transition">
                      Delete my account
                    </button>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
