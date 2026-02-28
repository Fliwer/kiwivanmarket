import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Send, Search, MoreVertical, Phone, Mail, MapPin,
  MessageCircle, Check, CheckCheck, Clock, Star, Archive,
  ChevronLeft, ChevronRight, DollarSign, Calendar, Gauge, Users,
  Circle, CheckCircle2, MessageSquare, Eye, Settings, Bell, BellOff, X,
  Heart, ChevronDown
} from 'lucide-react';
import {
  collection, query, where, orderBy, onSnapshot, addDoc,
  updateDoc, doc, serverTimestamp, getDocs, setDoc, limit, writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import { useRateLimit } from '../hooks/useRateLimit';
import { sanitizeText } from '../securityUtils';
import SeoHead from './SeoHead';
import { useTranslation } from 'react-i18next';
import { useHideLoader } from '../hooks/useHideLoader';

// ============================================
// MESSAGING PAGE - Full Page 3 Columns
// ============================================

// 🌐 Language Selector Component - CORRIGÉ
function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');

  const languages = [
    { code: 'en', flag: 'https://flagcdn.com/24x18/gb.png', name: 'ENGLISH', short: 'EN' },
    { code: 'fr', flag: 'https://flagcdn.com/24x18/fr.png', name: 'FRANÇAIS', short: 'FR' },
    { code: 'de', flag: 'https://flagcdn.com/24x18/de.png', name: 'DEUTSCH', short: 'DE' },
    { code: 'es', flag: 'https://flagcdn.com/24x18/es.png', name: 'ESPAÑOL', short: 'ES' },
    { code: 'zh-CN', flag: 'https://flagcdn.com/24x18/cn.png', name: '简体中文', short: '中文' },
    { code: 'ja', flag: 'https://flagcdn.com/24x18/jp.png', name: '日本語', short: 'JA' },
    { code: 'ko', flag: 'https://flagcdn.com/24x18/kr.png', name: '한국어', short: 'KO' },
    { code: 'pt', flag: 'https://flagcdn.com/24x18/br.png', name: 'PORTUGUÊS', short: 'PT' },
    { code: 'th', flag: 'https://flagcdn.com/24x18/th.png', name: 'ไทย', short: 'TH' },
    { code: 'vi', flag: 'https://flagcdn.com/24x18/vn.png', name: 'TIẾNG VIỆT', short: 'VI' }
  ];

  // ✨ CORRECTION: Force Google Translate à rafraîchir complètement
  const applyLanguage = useCallback((langCode) => {
    // 1. Nettoyer TOUS les cookies Google Translate
    const domains = ['', '.' + window.location.hostname, '.kiwivanmarket.com'];
    domains.forEach(domain => {
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;${domain ? ' domain=' + domain + ';' : ''}`;
    });

    // 2. Supprimer aussi du localStorage
    try {
      localStorage.removeItem('googtrans');
      sessionStorage.clear();
    } catch (e) { }

    // 3. Supprimer les éléments Google Translate du DOM
    const gtFrame = document.querySelector('.goog-te-banner-frame');
    if (gtFrame) gtFrame.remove();
    const gtElement = document.getElementById('google_translate_element');
    if (gtElement) gtElement.innerHTML = '';

    // 4. Réinitialiser le body
    document.body.className = document.body.className.replace(/translated-[a-z]+/g, '');
    const html = document.documentElement;
    html.className = html.className.replace(/translated-[a-z]+/g, '');

    // 5. Supprimer le script Google Translate pour forcer une réinitialisation
    const oldScript = document.getElementById('google-translate-script');
    if (oldScript) oldScript.remove();

    // 6. Supprimer les iframes Google
    document.querySelectorAll('iframe.goog-te-menu-frame, iframe.goog-te-banner-frame').forEach(el => el.remove());

    if (langCode === 'en') {
      // Retour à l'anglais - reload COMPLET sans cache
      setTimeout(() => {
        window.location.replace(window.location.pathname + '?lang=en&t=' + Date.now());
      }, 100);
      return;
    }

    // Définir le nouveau cookie de langue
    const langCookie = `/en/${langCode}`;
    document.cookie = `googtrans=${langCookie}; path=/;`;
    document.cookie = `googtrans=${langCookie}; path=/; domain=.${window.location.hostname}`;

    // Force reload avec cache bypass
    setTimeout(() => {
      window.location.replace(window.location.pathname + '?lang=' + langCode + '&t=' + Date.now());
    }, 100);
  }, []);

  const changeLanguage = (langCode) => {
    setIsOpen(false);
    setCurrentLang(langCode);
    localStorage.setItem('preferredLang', langCode);
    applyLanguage(langCode);
  };

  useEffect(() => {
    const savedLang = localStorage.getItem('preferredLang') || 'en';
    setCurrentLang(savedLang);

    // On injecte le script Google si ce n'est pas déjà fait
    if (!document.getElementById('google-translate-script')) {
      const translateDiv = document.createElement('div');
      translateDiv.id = 'google_translate_element';
      translateDiv.style.display = 'none';
      document.body.appendChild(translateDiv);

      window.googleTranslateElementInit = function () {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'en,fr,de,es,zh-CN,ja,ko,pt,th,vi',
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false
          },
          'google_translate_element'
        );
      };

      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const currentLangData =
    languages.find((l) => l.code === currentLang) || languages[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition text-white text-sm font-semibold"
        title="Change language"
      >
        <img
          src={currentLangData.flag}
          alt={currentLangData.name}
          className="w-6 h-4 object-cover rounded-sm shadow-sm"
        />
        <span className="hidden sm:inline">{currentLangData.short}</span>
        <ChevronDown
          size={14}
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[100]"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 min-w-[180px] z-[101]">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition ${currentLang === lang.code
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'hover:bg-gray-50 text-gray-700'
                  }`}
              >
                <img
                  src={lang.flag}
                  alt={lang.name}
                  className="w-6 h-4 object-cover rounded-sm shadow-sm"
                />
                <span className="font-medium">{lang.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function MessagingPage({ onBack }) {
  useHideLoader();
  const { currentUser } = useAuth();
  const { checkAndRecord } = useRateLimit(currentUser?.uid);
  const navigate = useNavigate();

  // Handle browser back button
  useEffect(() => {
    // Push a state when opening
    window.history.pushState({ messaging: true }, '', window.location.href);

    const handlePopState = (event) => {
      // When user clicks browser back, close messaging
      onBack();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [onBack]);

  // 🔄 Force Google Translate à re-traduire au chargement de la page
  useEffect(() => {
    const savedLang = localStorage.getItem('preferredLang');
    if (savedLang && savedLang !== 'en') {
      // Attendre que Google Translate soit prêt
      const intervalId = setInterval(() => {
        const combo = document.querySelector('.goog-te-combo');
        if (combo) {
          combo.value = savedLang;
          combo.dispatchEvent(new Event('change'));
          clearInterval(intervalId);
        }
      }, 500);

      // Timeout après 5 secondes
      setTimeout(() => clearInterval(intervalId), 5000);

      return () => clearInterval(intervalId);
    }
  }, []);

  // Write lastSeen heartbeat while on messaging page
  useEffect(() => {
    if (!currentUser) return;

    const userRef = doc(db, 'users', currentUser.uid);
    const writeLastSeen = () => {
      setDoc(userRef, { lastSeen: serverTimestamp() }, { merge: true }).catch(() => { });
    };

    // Write immediately, then every 5 minutes (300000ms) to reduce Firestore writes
    writeLastSeen();
    const interval = setInterval(writeLastSeen, 300000);

    return () => {
      clearInterval(interval);
      // Mark as offline when leaving
      setDoc(userRef, { lastSeen: serverTimestamp() }, { merge: true }).catch(() => { });
    };
  }, [currentUser]);

  // State
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);

  // Listen to other user's lastSeen
  useEffect(() => {
    if (!selectedConversation?.otherUserId) {
      setOtherUserLastSeen(null);
      return;
    }

    const otherUserRef = doc(db, 'users', selectedConversation.otherUserId);
    const unsubscribe = onSnapshot(otherUserRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setOtherUserLastSeen(data.lastSeen || null);
      } else {
        setOtherUserLastSeen(null);
      }
    }, () => {
      setOtherUserLastSeen(null);
    });

    return () => unsubscribe();
  }, [selectedConversation?.otherUserId]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showDetailsPanel, setShowDetailsPanel] = useState(true);
  const [mobileView, setMobileView] = useState('list');
  const [isTyping, setIsTyping] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [customOffer, setCustomOffer] = useState('');

  const [otherUserLastSeen, setOtherUserLastSeen] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isTypingActiveRef = useRef(false); // Track if we already sent a typing=true

  // Quick replies
  const quickReplies = [
    { text: "Hi! Is this still available?", icon: "👋" },
    { text: "What's your best price?", icon: "💰" },
    { text: "Can I come see it today?", icon: "📍" },
    { text: "Can you send more photos?", icon: "📸" },
  ];

  // Status options
  const statusOptions = [
    { id: 'new', label: 'New', color: 'bg-blue-500' },
    { id: 'active', label: 'Active', color: 'bg-emerald-500' },
    { id: 'pending', label: 'Pending', color: 'bg-amber-500' },
    { id: 'resolved', label: 'Resolved', color: 'bg-gray-400' },
  ];

  // Load conversations
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    console.log('🔄 Loading conversations for:', currentUser.uid);

    // Simple query without orderBy to avoid index requirement
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        console.log('✅ Found conversations:', snapshot.docs.length);

        const convos = snapshot.docs.map(docSnap => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            ...data,
            unreadCount: data.unreadCount?.[currentUser.uid] || 0,
            otherUserId: data.participants.find(p => p !== currentUser.uid)
          };
        });

        // Sort client-side by lastMessageAt (newest first)
        convos.sort((a, b) => {
          const timeA = a.lastMessageAt?.toDate?.() || new Date(0);
          const timeB = b.lastMessageAt?.toDate?.() || new Date(0);
          return timeB - timeA;
        });

        setConversations(convos);
        setLoading(false);

        // Auto-select first conversation on desktop
        if (convos.length > 0 && !selectedConversation && window.innerWidth >= 768) {
          setSelectedConversation(convos[0]);
        }
      },
      (error) => {
        console.error('❌ Firebase error:', error);
        console.error('💡 If index error, create index in Firebase Console');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Load messages - with limit to reduce Firestore reads
  useEffect(() => {
    if (!selectedConversation) return;

    console.log('📨 Loading messages for conversation:', selectedConversation.id);

    // Query with limit to reduce costs - load last 100 messages
    const messagesRef = collection(db, 'conversations', selectedConversation.id, 'messages');
    const messagesQuery = query(messagesRef, limit(100));

    const unsubscribe = onSnapshot(messagesQuery,
      (snapshot) => {
        console.log('✅ Found messages:', snapshot.docs.length);

        const msgs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Sort client-side by createdAt (oldest first)
        msgs.sort((a, b) => {
          const timeA = a.createdAt?.toDate?.() || new Date(0);
          const timeB = b.createdAt?.toDate?.() || new Date(0);
          return timeA - timeB;
        });

        setMessages(msgs);
        // NOTE: markAsRead is called once on conversation selection, not here
        // to avoid a write->read feedback loop
      },
      (error) => {
        console.error('❌ Error loading messages:', error);
      }
    );

    // Mark as read once when conversation is selected
    markAsRead();

    // Get typing state from the conversation document (already loaded in conversations list)
    // No need for a separate listener - we can derive it from selectedConversation updates

    return () => {
      unsubscribe();
    };
  }, [selectedConversation]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message
  const sendMessage = async (text = newMessage) => {
    if (!text.trim() || !selectedConversation) return;

    // 🛡️ RATE LIMIT: Max 30 messages par heure
    const rateCheck = checkAndRecord('sendMessage');
    if (!rateCheck.allowed) {
      alert(rateCheck.error);
      return;
    }

    setSendingMessage(true);
    const messageText = sanitizeText(text);
    setNewMessage('');

    try {
      await addDoc(collection(db, 'conversations', selectedConversation.id, 'messages'), {
        text: messageText,
        senderId: currentUser.uid,
        senderName: currentUser.displayName || 'Anonymous',
        createdAt: serverTimestamp(),
        read: false
      });

      await updateDoc(doc(db, 'conversations', selectedConversation.id), {
        lastMessage: messageText,
        lastMessageAt: serverTimestamp(),
        lastMessageSenderId: currentUser.uid,
        status: 'active',
        [`unreadCount.${selectedConversation.otherUserId}`]: (selectedConversation.unreadCount || 0) + 1,
        [`typing.${currentUser.uid}`]: false
      });

    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(messageText);
    } finally {
      setSendingMessage(false);
      inputRef.current?.focus();
    }
  };

  // Mark as read
  const markAsRead = async () => {
    if (!selectedConversation || !currentUser) return;
    try {
      // Update conversation unread count
      await updateDoc(doc(db, 'conversations', selectedConversation.id), {
        [`unreadCount.${currentUser.uid}`]: 0
      });

      // Mark only unread messages from other user as read (optimized query)
      const messagesRef = collection(db, 'conversations', selectedConversation.id, 'messages');
      const unreadQuery = query(
        messagesRef,
        where('read', '==', false),
        limit(50) // Process max 50 at a time to avoid large batches
      );
      const snapshot = await getDocs(unreadQuery);

      if (snapshot.empty) return;

      // Use batch write for efficiency
      const batch = writeBatch(db);
      snapshot.docs.forEach((docSnap) => {
        const msgData = docSnap.data();
        // Only mark messages from other user as read
        if (msgData.senderId !== currentUser.uid) {
          batch.update(docSnap.ref, {
            read: true,
            readAt: serverTimestamp()
          });
        }
      });
      await batch.commit();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // Handle typing - debounced to avoid excessive writes
  const handleTyping = useCallback(() => {
    if (!selectedConversation) return;

    // Only write to Firestore once when user starts typing (not every keystroke)
    if (!isTypingActiveRef.current) {
      isTypingActiveRef.current = true;
      updateDoc(doc(db, 'conversations', selectedConversation.id), {
        [`typing.${currentUser.uid}`]: true
      });
    }

    // Reset the timeout on each keystroke
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    // After 2 seconds of no typing, set typing to false
    typingTimeoutRef.current = setTimeout(() => {
      isTypingActiveRef.current = false;
      updateDoc(doc(db, 'conversations', selectedConversation.id), {
        [`typing.${currentUser.uid}`]: false
      });
    }, 2000);
  }, [selectedConversation, currentUser]);

  // Update status
  const updateStatus = async (status) => {
    if (!selectedConversation) return;
    try {
      await updateDoc(doc(db, 'conversations', selectedConversation.id), { status });
      setSelectedConversation({ ...selectedConversation, status });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // Format time
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d`;
    return date.toLocaleDateString();
  };

  // Filter conversations
  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = searchQuery === '' ||
      conv.van?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.participantNames?.[conv.otherUserId]?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || conv.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  // Helpers
  const getOtherUserName = (conv) => conv.participantNames?.[conv.otherUserId] || 'Unknown';
  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';

  // Online status helper
  const getOnlineStatus = () => {
    if (!otherUserLastSeen) return { online: false, text: 'Offline' };
    const lastSeenDate = otherUserLastSeen.toDate ? otherUserLastSeen.toDate() : new Date(otherUserLastSeen);
    const diffMs = Date.now() - lastSeenDate.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 5) return { online: true, text: 'Online' };
    if (diffMin < 60) return { online: false, text: `Last seen ${diffMin}m ago` };
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return { online: false, text: `Last seen ${diffH}h ago` };
    const diffD = Math.floor(diffH / 24);
    return { online: false, text: `Last seen ${diffD}d ago` };
  };

  // Not logged in
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <MessageCircle size={64} className="mx-auto mb-4 text-gray-300" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Sign in required</h2>
          <p className="text-gray-500 mb-4">Please sign in to view your messages</p>
          <button onClick={onBack} className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <SeoHead
        title="Messages"
        noindex={true}
      />
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <MessageCircle size={22} />
              </div>
              <div>
                <h1 className="text-xl font-bold">Messages</h1>
                <p className="text-white/70 text-sm">
                  {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Icons */}
          <div className="flex items-center gap-1">
            {/* Language Selector */}
            <LanguageSelector />

            {/* Favoris */}
            <button
              onClick={onBack}
              className="relative flex flex-col items-center p-2.5 hover:bg-white/10 rounded-xl transition"
              title="Favorites"
            >
              <Heart size={22} className="text-white" />
              <span className="text-[10px] text-white/80 hidden sm:block mt-0.5">Favorites</span>
            </button>

            {/* Messages (actif) */}
            <button
              className="relative flex flex-col items-center p-2.5 bg-white/20 rounded-xl transition"
              title="Messages"
            >
              <MessageCircle size={22} className="text-white" />
              <span className="text-[10px] text-white/80 hidden sm:block mt-0.5">Messages</span>
            </button>

            {/* Profil */}
            <button
              onClick={onBack}
              className="flex flex-col items-center p-2.5 hover:bg-white/10 rounded-xl transition"
              title="Profile"
            >
              <div className="w-6 h-6 bg-white text-emerald-600 rounded-full flex items-center justify-center text-xs font-bold">
                {currentUser.displayName?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="text-[10px] text-white/80 hidden sm:block mt-0.5">Profile</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - 3 Columns */}
      <div className="flex-1 flex overflow-hidden max-w-7xl mx-auto w-full">

        {/* Column 1: Conversations List */}
        <div className={`
          w-full md:w-80 lg:w-96 border-r border-gray-200 flex flex-col bg-white
          ${mobileView !== 'list' ? 'hidden md:flex' : 'flex'}
        `}>
          {/* Search & Filter */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1 overflow-x-auto pb-1">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${activeFilter === 'all'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                All
              </button>
              {statusOptions.map(status => (
                <button
                  key={status.id}
                  onClick={() => setActiveFilter(status.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${activeFilter === status.id
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <span className={`w-2 h-2 rounded-full ${status.color}`}></span>
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-500 p-4">
                <MessageCircle size={48} className="mb-3 opacity-30" />
                <p className="font-medium">No conversations yet</p>
                <p className="text-sm text-center mt-1">Start by messaging a seller on a van listing</p>
              </div>
            ) : (
              filteredConversations.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => {
                    setSelectedConversation(conv);
                    setMobileView('chat');
                  }}
                  className={`p-4 border-b border-gray-100 cursor-pointer transition-all hover:bg-gray-50 ${selectedConversation?.id === conv.id ? 'bg-emerald-50 border-l-4 border-l-emerald-500' : ''
                    }`}
                >
                  <div className="flex gap-3">
                    {/* Van Image */}
                    <div className="relative flex-shrink-0">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-200">
                        {conv.van?.imageUrl ? (
                          <img src={conv.van.imageUrl} alt="" className={`w-full h-full object-cover ${conv.van?.status === 'sold' ? 'opacity-50 grayscale' : ''}`} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-400 to-teal-500">
                            <span className="text-white text-xl">🚐</span>
                          </div>
                        )}
                      </div>
                      {conv.van?.status === 'sold' && (
                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                          SOLD
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className={`font-semibold text-sm truncate ${conv.van?.status === 'sold' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                            {conv.van?.title || 'Unknown Van'}
                          </h4>
                          <p className="text-xs text-gray-500 truncate">
                            {getOtherUserName(conv)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs text-gray-400">{formatTime(conv.lastMessageAt)}</span>
                          {conv.unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {conv.lastMessage || 'No messages yet'}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: Chat */}
        <div className={`
          flex-1 flex flex-col bg-white
          ${mobileView !== 'chat' ? 'hidden md:flex' : 'flex'}
        `}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setMobileView('list')}
                    className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold">
                    {getInitials(getOtherUserName(selectedConversation))}
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {getOtherUserName(selectedConversation)}
                    </h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      {isTyping ? (
                        <span className="text-emerald-600 flex items-center gap-1">
                          <span className="flex gap-0.5">
                            <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                          </span>
                          typing...
                        </span>
                      ) : (() => {
                        const status = getOnlineStatus();
                        return (
                          <>
                            <span className={`w-2 h-2 rounded-full ${status.online ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                            {status.text}
                          </>
                        );
                      })()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedConversation.status || 'new'}
                    onChange={(e) => updateStatus(e.target.value)}
                    className="text-xs bg-gray-100 border-none rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {statusOptions.map(status => (
                      <option key={status.id} value={status.id}>{status.label}</option>
                    ))}
                  </select>

                  <button
                    onClick={() => {
                      setShowDetailsPanel(!showDetailsPanel);
                      if (mobileView === 'chat') setMobileView('details');
                    }}
                    className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <ChevronRight size={20} className={`transition-transform ${showDetailsPanel ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.length === 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-3 text-center">Quick replies:</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {quickReplies.map((reply, idx) => (
                        <button
                          key={idx}
                          onClick={() => sendMessage(reply.text)}
                          className="bg-white border border-gray-200 px-4 py-2 rounded-full text-sm hover:border-emerald-500 hover:bg-emerald-50 transition-all flex items-center gap-2 shadow-sm"
                        >
                          <span>{reply.icon}</span>
                          <span>{reply.text}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((msg, idx) => {
                  const isOwn = msg.senderId === currentUser.uid;
                  const showAvatar = idx === 0 || messages[idx - 1]?.senderId !== msg.senderId;

                  return (
                    <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex items-end gap-2 max-w-[80%] ${isOwn ? 'flex-row-reverse' : ''}`}>
                        {showAvatar && !isOwn ? (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {getInitials(msg.senderName)}
                          </div>
                        ) : (
                          <div className="w-8 flex-shrink-0"></div>
                        )}

                        <div className={`px-4 py-2.5 rounded-2xl ${isOwn
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-md'
                          : 'bg-white text-gray-800 shadow-sm rounded-bl-md'
                          }`}>
                          <p className="text-sm leading-relaxed">{msg.text}</p>
                          <div className={`flex items-center justify-end gap-1 mt-1 ${isOwn ? 'text-white/70' : 'text-gray-400'}`}>
                            <span className="text-[10px]">{formatTime(msg.createdAt)}</span>
                            {isOwn && (
                              <span className="flex items-center ml-1">
                                {msg.read ? (
                                  // Double check bleu = Lu
                                  <CheckCheck size={16} className="text-blue-400" />
                                ) : (
                                  // Simple check gris = Envoyé
                                  <Check size={16} className={isOwn ? 'text-white/50' : 'text-gray-400'} />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white px-4 py-3 rounded-2xl shadow-sm">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200 bg-white">
                {/* Make an Offer with options */}
                {selectedConversation.van && (
                  <div className="relative mb-3">
                    <button
                      onClick={() => setShowOfferModal(!showOfferModal)}
                      className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium text-sm hover:from-amber-600 hover:to-orange-600 transition-all flex items-center justify-center gap-2"
                    >
                      <DollarSign size={18} />
                      Make an Offer
                      <ChevronRight size={16} className={`transition-transform ${showOfferModal ? 'rotate-90' : ''}`} />
                    </button>

                    {/* Offer Options Modal */}
                    {showOfferModal && (
                      <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-10">
                        <p className="text-sm font-semibold text-gray-700 mb-3">
                          Choose an offer for {selectedConversation.van.title}
                        </p>
                        <p className="text-xs text-gray-500 mb-3">
                          Listed price: <span className="font-bold text-emerald-600">${selectedConversation.van.price?.toLocaleString()}</span>
                        </p>

                        {/* Preset Options */}
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          {[5, 10, 15, 20].map((percent) => {
                            const offerPrice = Math.round(selectedConversation.van.price * (1 - percent / 100));
                            return (
                              <button
                                key={percent}
                                onClick={() => {
                                  setNewMessage(`Hi! I'd like to make an offer of $${offerPrice.toLocaleString()} (-${percent}%) for the ${selectedConversation.van.title}. Would you consider this?`);
                                  setShowOfferModal(false);
                                  inputRef.current?.focus();
                                }}
                                className="py-2 px-3 bg-gray-100 hover:bg-emerald-100 hover:border-emerald-500 border border-gray-200 rounded-lg text-sm font-medium transition-all"
                              >
                                <span className="text-emerald-600 font-bold">${offerPrice.toLocaleString()}</span>
                                <span className="text-gray-500 text-xs ml-1">(-{percent}%)</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Custom Amount */}
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                            <input
                              type="number"
                              value={customOffer}
                              onChange={(e) => setCustomOffer(e.target.value)}
                              placeholder="Custom amount"
                              className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          </div>
                          <button
                            onClick={() => {
                              if (customOffer) {
                                setNewMessage(`Hi! I'd like to make an offer of $${parseInt(customOffer).toLocaleString()} for the ${selectedConversation.van.title}. Would you consider this?`);
                                setShowOfferModal(false);
                                setCustomOffer('');
                                inputRef.current?.focus();
                              }
                            }}
                            disabled={!customOffer}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Send
                          </button>
                        </div>

                        {/* Close button */}
                        <button
                          onClick={() => setShowOfferModal(false)}
                          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    value={newMessage}
                    onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    placeholder="Type a message..."
                    rows={1}
                    className="flex-1 px-4 py-3 bg-gray-100 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm"
                    style={{ minHeight: '48px', maxHeight: '120px' }}
                  />

                  <button
                    onClick={() => sendMessage()}
                    disabled={!newMessage.trim() || sendingMessage}
                    className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl flex items-center justify-center hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50 shadow-lg"
                  >
                    {sendingMessage ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send size={20} />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <MessageCircle size={48} className="text-gray-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No conversation selected</h3>
              <p className="text-center">Choose a conversation from the list to start chatting</p>
            </div>
          )}
        </div>

        {/* Column 3: Details */}
        {selectedConversation && showDetailsPanel && (
          <div className={`
            w-full md:w-80 lg:w-96 border-l border-gray-200 bg-white flex flex-col
            ${mobileView !== 'details' ? 'hidden lg:flex' : 'flex'}
          `}>
            <div className="lg:hidden px-4 py-3 border-b border-gray-200 flex items-center">
              <button onClick={() => setMobileView('chat')} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
                <ChevronLeft size={20} />
              </button>
              <h3 className="font-semibold text-gray-900 ml-2">Details</h3>
            </div>

            <div className="flex-1 overflow-y-auto">
              {selectedConversation.van && (
                <div className="p-4 border-b border-gray-100">
                  <div className="relative">
                    <div
                      className="aspect-video rounded-xl overflow-hidden mb-4 shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => navigate(`/van/${selectedConversation.van.id}`)}
                    >
                      <img src={selectedConversation.van.imageUrl} alt="" className={`w-full h-full object-cover ${selectedConversation.van.status === 'sold' ? 'opacity-50 grayscale' : ''}`} />
                    </div>
                    {selectedConversation.van.status === 'sold' && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                        SOLD
                      </div>
                    )}
                  </div>

                  <h3
                    className={`font-bold text-lg mb-1 cursor-pointer hover:text-emerald-600 transition-colors ${selectedConversation.van.status === 'sold' ? 'text-gray-400 line-through' : 'text-gray-900'}`}
                    onClick={() => navigate(`/van/${selectedConversation.van.id}`)}
                  >{selectedConversation.van.title}</h3>
                  <p className={`text-2xl font-black mb-4 ${selectedConversation.van.status === 'sold' ? 'text-gray-400' : 'text-emerald-600'}`}>
                    ${selectedConversation.van.price?.toLocaleString()}
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2">
                      <Calendar size={18} className="text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Year</p>
                        <p className="font-semibold text-gray-900">{selectedConversation.van.year}</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2">
                      <Gauge size={18} className="text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Mileage</p>
                        <p className="font-semibold text-gray-900">{selectedConversation.van.mileage?.toLocaleString()} km</p>
                      </div>
                    </div>
                    <div className="col-span-2 bg-gray-50 rounded-xl p-3 flex items-center gap-2">
                      <MapPin size={18} className="text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Location</p>
                        <p className="font-semibold text-gray-900">{selectedConversation.van.location}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-4 border-b border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Users size={16} /> Contact
                </h4>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold">
                    {getInitials(getOtherUserName(selectedConversation))}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{getOtherUserName(selectedConversation)}</p>
                    <p className="text-xs text-gray-500">
                      Member
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <MessageSquare size={16} /> Conversation
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedConversation.status === 'new' ? 'bg-blue-100 text-blue-700' :
                      selectedConversation.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                        selectedConversation.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          'bg-gray-100 text-gray-700'
                      }`}>
                      {selectedConversation.status || 'New'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Messages</span>
                    <span className="font-medium text-gray-900">{messages.length}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-500">Started</span>
                    <span className="font-medium text-gray-900">{formatTime(selectedConversation.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 space-y-2">
              <button
                onClick={() => {
                  if (selectedConversation.van?.id) {
                    // Close messaging and navigate to the van page
                    onBack();
                    setTimeout(() => navigate(`/van/${selectedConversation.van.id}`), 100);
                  }
                }}
                className="w-full py-2.5 bg-emerald-600 text-white rounded-xl font-medium text-sm hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
              >
                <Eye size={18} /> View Listing
              </button>
              <button
                onClick={() => updateStatus('resolved')}
                className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
              >
                <Archive size={18} /> Archive
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}