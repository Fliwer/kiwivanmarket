import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { MessageCircle, X, ChevronRight, Bell, BellOff, Volume2, VolumeX } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { useAuth } from '../AuthContext';

// ============================================
// CONTEXT POUR LES NOTIFICATIONS
// ============================================
const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

// ============================================
// NOTIFICATION PROVIDER
// ============================================
export function NotificationProvider({ children, onOpenMessaging }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [browserNotifEnabled, setBrowserNotifEnabled] = useState(false);
  const [lastMessageIds, setLastMessageIds] = useState(new Set());
  // ✅ CORRIGÉ : AuthContext exporte "loading", pas "authLoading"
  const { currentUser, loading: authLoading } = useAuth();

  // Son de notification (base64 d'un son court)
  const playNotificationSound = useCallback(() => {
    if (!soundEnabled) return;

    try {
      // Créer un son avec Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // Note A5
      oscillator.frequency.setValueAtTime(1108.73, audioContext.currentTime + 0.1); // Note C#6

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
      console.log('Audio not supported');
    }
  }, [soundEnabled]);

  // Demander permission pour les notifications browser
  const requestBrowserNotifications = useCallback(async () => {
    // Safety check for SSR or environments without Notification API
    if (typeof Notification === 'undefined' || !('Notification' in window)) return false;

    if (Notification.permission === 'granted') {
      setBrowserNotifEnabled(true);
      return true;
    }

    if (Notification.permission !== 'denied') {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setBrowserNotifEnabled(true);
          return true;
        }
      } catch (e) {
        console.warn('Error requesting notification permission:', e);
      }
    }

    return false;
  }, []);

  // Envoyer une notification browser
  const sendBrowserNotification = useCallback((title, body, icon) => {
    if (typeof Notification === 'undefined' || !browserNotifEnabled || Notification.permission !== 'granted') return;

    try {
      const notification = new Notification(title, {
        body,
        icon: icon || '/kiwi-van-logo.png',
        badge: '/kiwi-van-logo.png',
        tag: 'kiwi-van-message',
        renotify: true,
        requireInteraction: false,
        silent: true // On gère le son nous-même
      });

      notification.onclick = () => {
        window.focus();
        onOpenMessaging?.();
        notification.close();
      };

      setTimeout(() => notification.close(), 5000);
    } catch (e) {
      console.log('Browser notification failed:', e);
    }
  }, [browserNotifEnabled, onOpenMessaging]);

  // Retirer une notification
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Ajouter une notification toast
  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotif = { ...notification, id, createdAt: Date.now() };

    setNotifications(prev => [newNotif, ...prev].slice(0, 5)); // Max 5 notifications

    // Jouer le son
    playNotificationSound();

    // Envoyer notification browser si activé
    if (browserNotifEnabled) {
      sendBrowserNotification(
        notification.senderName || 'New Message',
        notification.text || 'You have a new message',
        notification.vanImage
      );
    }

    // Auto-dismiss après 6 secondes
    setTimeout(() => {
      removeNotification(id);
    }, 6000);

    return id;
  }, [playNotificationSound, browserNotifEnabled, sendBrowserNotification, removeNotification]);

  // Écouter les nouveaux messages en temps réel
  useEffect(() => {
    // Attendre que l'auth soit terminée
    if (authLoading) return;

    if (!currentUser) {
      setUnreadCount(0);
      return;
    }

    // Écouter les conversations pour le compteur (sans orderBy pour éviter les index)
    const convQuery = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', currentUser.uid)
    );

    const unsubConv = onSnapshot(convQuery,
      (snapshot) => {
        let total = 0;
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          total += data.unreadCount?.[currentUser.uid] || 0;
        });
        setUnreadCount(total);
      },
      (error) => {
        console.error('🔔 Erreur listener notifications:', error);
        setUnreadCount(0);
      }
    );

    return () => {
      unsubConv();
    };
  }, [currentUser, authLoading]);

  // Vérifier permission au démarrage
  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      setBrowserNotifEnabled(true);
    }
  }, []);

  const value = {
    notifications,
    unreadCount,
    soundEnabled,
    setSoundEnabled,
    browserNotifEnabled,
    requestBrowserNotifications,
    addNotification,
    removeNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationToasts
        notifications={notifications}
        onDismiss={removeNotification}
        onOpenMessaging={onOpenMessaging}
      />
    </NotificationContext.Provider>
  );
}

// ============================================
// COMPOSANT TOAST NOTIFICATIONS
// ============================================
function NotificationToasts({ notifications, onDismiss, onOpenMessaging }) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
      {notifications.map((notif, index) => (
        <Toast
          key={notif.id}
          notification={notif}
          onDismiss={() => onDismiss(notif.id)}
          onClick={() => {
            onOpenMessaging?.();
            onDismiss(notif.id);
          }}
          index={index}
        />
      ))}
    </div>
  );
}

// ============================================
// COMPOSANT TOAST INDIVIDUEL
// ============================================
function Toast({ notification, onDismiss, onClick, index }) {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Animation d'entrée
    setTimeout(() => setIsVisible(true), 50);

    // Progress bar
    const interval = setInterval(() => {
      setProgress(prev => Math.max(0, prev - 1.67)); // 6 secondes
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  return (
    <div
      onClick={onClick}
      className={`
        pointer-events-auto cursor-pointer
        transform transition-all duration-300 ease-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
      style={{
        transitionDelay: `${index * 50}ms`,
        animation: isVisible ? 'slideInRight 0.3s ease-out' : 'none'
      }}
    >
      <div className="bg-white rounded-2xl shadow-3xl border border-gray-100 overflow-hidden w-80 md:w-96">
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-400 to-teal-500">
                {notification.vanImage ? (
                  <img src={notification.vanImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-xl">
                    🚐
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white">
                <MessageCircle size={10} className="text-white" />
              </div>
            </div>

            {/* Texte */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-gray-900 truncate">
                  {notification.senderName || 'New Message'}
                </p>
                <span className="text-xs text-gray-400">now</span>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">
                {notification.text || 'Sent you a message'}
              </p>
            </div>

            {/* Close */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDismiss();
              }}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors opacity-0 group-hover:opacity-100"
            >
              <X size={16} className="text-gray-400" />
            </button>
          </div>

          {/* CTA */}
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              Tap to reply
              <ChevronRight size={14} />
            </span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs text-gray-400">Kiwi Van Market</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Styles */}
      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

// ============================================
// COMPOSANT BADGE HEADER (à mettre dans le header)
// ============================================
export function MessagesBadge({ onClick }) {
  const { unreadCount, soundEnabled, setSoundEnabled, browserNotifEnabled, requestBrowserNotifications } = useNotifications();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={onClick}
        className="relative p-2 hover:bg-white/20 rounded-lg transition-colors group"
      >
        <MessageCircle size={24} className="text-white" />

        {/* Badge animé */}
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 rounded-full flex items-center justify-center px-1.5 animate-bounce-subtle">
            <span className="text-white text-xs font-bold">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          </div>
        )}

        {/* Pulse effect quand nouveaux messages */}
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 rounded-full animate-ping opacity-75" />
        )}
      </button>

      {/* Settings dropdown (optionnel) */}
      {showSettings && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl py-2 z-50 border border-gray-100">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="font-semibold text-gray-900">Notification Settings</p>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              {soundEnabled ? <Volume2 size={18} className="text-emerald-600" /> : <VolumeX size={18} className="text-gray-400" />}
              <span className="text-sm text-gray-700">Sound</span>
            </div>
            <div className={`w-10 h-6 rounded-full transition-colors ${soundEnabled ? 'bg-emerald-500' : 'bg-gray-300'}`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform mt-0.5 ${soundEnabled ? 'translate-x-4.5 ml-4' : 'translate-x-0.5 ml-0.5'}`} />
            </div>
          </button>

          <button
            onClick={async () => {
              if (!browserNotifEnabled) {
                await requestBrowserNotifications();
              }
            }}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              {browserNotifEnabled ? <Bell size={18} className="text-emerald-600" /> : <BellOff size={18} className="text-gray-400" />}
              <span className="text-sm text-gray-700">Browser notifications</span>
            </div>
            <div className={`w-10 h-6 rounded-full transition-colors ${browserNotifEnabled ? 'bg-emerald-500' : 'bg-gray-300'}`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform mt-0.5 ${browserNotifEnabled ? 'translate-x-4.5 ml-4' : 'translate-x-0.5 ml-0.5'}`} />
            </div>
          </button>
        </div>
      )}

      <style>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

// ============================================
// COMPOSANT FLOATING NOTIFICATION BUTTON
// ============================================
export function FloatingMessageButton({ onClick, className = '' }) {
  const { unreadCount } = useNotifications();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed bottom-6 right-6 z-40 bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 group ${className}`}
    >
      <MessageCircle size={28} className={`transition-transform duration-300 ${isHovered ? 'scale-110' : ''}`} />

      {/* Badge */}
      {unreadCount > 0 && (
        <>
          <div className="absolute -top-2 -right-2 min-w-[24px] h-6 bg-red-500 rounded-full flex items-center justify-center px-2 border-2 border-white shadow-lg">
            <span className="text-white text-sm font-bold">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          </div>
          <div className="absolute -top-2 -right-2 min-w-[24px] h-6 bg-red-500 rounded-full animate-ping opacity-50" />
        </>
      )}

      {/* Tooltip */}
      <div className={`absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap transition-all duration-200 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 pointer-events-none'}`}>
        {unreadCount > 0 ? `${unreadCount} new message${unreadCount > 1 ? 's' : ''}` : 'Messages'}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 border-8 border-transparent border-l-gray-900" />
      </div>

      {/* Ripple effect */}
      {unreadCount > 0 && (
        <div className="absolute inset-0 rounded-full bg-white animate-ripple" />
      )}

      <style>{`
        .shadow-3xl {
          box-shadow: 0 25px 50px -12px rgba(16, 185, 129, 0.4);
        }
        @keyframes ripple {
          0% {
            transform: scale(1);
            opacity: 0.4;
          }
          100% {
            transform: scale(1.8);
            opacity: 0;
          }
        }
        .animate-ripple {
          animation: ripple 2s ease-out infinite;
        }
      `}</style>
    </button>
  );
}

export default NotificationProvider;