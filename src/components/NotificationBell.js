import React, { useState, useEffect, useRef } from 'react';
import { Bell, CreditCard, CheckCircle, XCircle, MessageCircle, Star, Package, AlertCircle, ChevronRight, X } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, writeBatch, limit } from 'firebase/firestore';

// ✨ World-class NotificationBell Component
// Inspired by Airbnb, LinkedIn, Facebook best practices

const NotificationBell = ({ user, onNotificationClick }) => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false); // ✅ NEW: Full page view
  const [isAnimating, setIsAnimating] = useState(false);
  const dropdownRef = useRef(null);
  const bellRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // 🔔 Load notifications in real-time
  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(50) // ✅ Increased limit for full view
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Trigger bell animation on new notification
      if (notifs.length > notifications.length && notifications.length > 0) {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 600);
      }
      
      setNotifications(notifs);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // 🖱️ Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          bellRef.current && !bellRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ✅ Mark single notification as read
  const markAsRead = async (notifId) => {
    try {
      await updateDoc(doc(db, 'notifications', notifId), { read: true });
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // ✅ Mark all as read
  const markAllAsRead = async () => {
    try {
      const batch = writeBatch(db);
      notifications.filter(n => !n.read).forEach(n => {
        batch.update(doc(db, 'notifications', n.id), { read: true });
      });
      await batch.commit();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // 🕐 Format time elegantly
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // 🎨 Get notification style based on type
  const getNotificationStyle = (type) => {
    const styles = {
      reservation_paid: {
        icon: CreditCard,
        iconBg: 'bg-gradient-to-br from-emerald-400 to-emerald-600',
        iconColor: 'text-white',
        accentColor: 'border-l-emerald-500'
      },
      payment_confirmed: {
        icon: CheckCircle,
        iconBg: 'bg-gradient-to-br from-blue-400 to-blue-600',
        iconColor: 'text-white',
        accentColor: 'border-l-blue-500'
      },
      reservation_cancelled: {
        icon: XCircle,
        iconBg: 'bg-gradient-to-br from-red-400 to-red-600',
        iconColor: 'text-white',
        accentColor: 'border-l-red-500'
      },
      new_message: {
        icon: MessageCircle,
        iconBg: 'bg-gradient-to-br from-purple-400 to-purple-600',
        iconColor: 'text-white',
        accentColor: 'border-l-purple-500'
      },
      new_review: {
        icon: Star,
        iconBg: 'bg-gradient-to-br from-amber-400 to-orange-500',
        iconColor: 'text-white',
        accentColor: 'border-l-amber-500'
      },
      listing_approved: {
        icon: Package,
        iconBg: 'bg-gradient-to-br from-teal-400 to-teal-600',
        iconColor: 'text-white',
        accentColor: 'border-l-teal-500'
      },
      default: {
        icon: AlertCircle,
        iconBg: 'bg-gradient-to-br from-gray-400 to-gray-600',
        iconColor: 'text-white',
        accentColor: 'border-l-gray-500'
      }
    };
    return styles[type] || styles.default;
  };

  const handleNotificationClick = (notif) => {
    if (!notif.read) markAsRead(notif.id);
    if (onNotificationClick) onNotificationClick(notif);
    setIsOpen(false);
    setShowAllNotifications(false);
  };

  // ✅ NEW: Handle "View all notifications" click
  const handleViewAllClick = () => {
    setIsOpen(false);
    setShowAllNotifications(true);
  };

  // 📋 Notification Item Component (reusable)
  const NotificationItem = ({ notif, showFullDate = false }) => {
    const style = getNotificationStyle(notif.type);
    const IconComponent = style.icon;
    
    return (
      <div
        onClick={() => handleNotificationClick(notif)}
        className={`
          group relative flex gap-4 p-4 cursor-pointer
          transition-all duration-200
          border-l-4 ${style.accentColor}
          ${!notif.read 
            ? 'bg-gradient-to-r from-emerald-50/80 via-white to-white hover:from-emerald-100/80' 
            : 'bg-white hover:bg-gray-50'
          }
        `}
      >
        {/* Icon */}
        <div className={`
          flex-shrink-0 w-11 h-11 rounded-xl ${style.iconBg}
          flex items-center justify-center shadow-lg
          group-hover:scale-110 transition-transform duration-200
        `}>
          <IconComponent size={20} className={style.iconColor} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-sm leading-snug ${!notif.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
              {notif.title}
            </p>
            <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
              {showFullDate ? formatFullDate(notif.createdAt) : formatTime(notif.createdAt)}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
            {notif.message}
          </p>
        </div>

        {/* Unread indicator dot */}
        {!notif.read && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-2.5 h-2.5 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full animate-pulse" />
          </div>
        )}

        {/* Hover arrow */}
        <ChevronRight 
          size={18} 
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200"
          style={{ display: notif.read ? 'block' : 'none' }}
        />
      </div>
    );
  };

  // 📅 Format full date for all notifications view
  const formatFullDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <div className="relative">
        {/* 🔔 Bell Button */}
        <button
          ref={bellRef}
          onClick={() => setIsOpen(!isOpen)}
          className={`
            relative p-2.5 rounded-xl transition-all duration-300
            ${isOpen 
              ? 'bg-white/30 scale-105' 
              : 'hover:bg-white/20 hover:scale-105'
            }
            ${isAnimating ? 'animate-wiggle' : ''}
          `}
          aria-label="Notifications"
        >
          <Bell 
            size={22} 
            className={`transition-all duration-300 ${
              isOpen ? 'text-white fill-white/20' : 'text-white'
            }`}
          />
          
          {/* Badge */}
          {unreadCount > 0 && (
            <span className={`
              absolute flex items-center justify-center
              font-bold text-white shadow-lg
              transition-all duration-300 transform
              ${unreadCount > 9 
                ? 'top-0 right-0 min-w-[20px] h-[20px] text-[10px] px-1 rounded-full bg-gradient-to-r from-red-500 to-pink-500' 
                : unreadCount > 0 
                  ? 'top-0.5 right-0.5 w-[18px] h-[18px] text-[11px] rounded-full bg-gradient-to-r from-red-500 to-pink-500'
                  : 'top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500'
              }
              ${isAnimating ? 'scale-125' : 'scale-100'}
            `}>
              {unreadCount > 99 ? '99+' : unreadCount > 0 ? unreadCount : ''}
            </span>
          )}
        </button>

        {/* 📋 Dropdown Panel */}
        {isOpen && (
          <>
            {/* Backdrop for mobile */}
            <div 
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100] md:hidden"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <div
              ref={dropdownRef}
              className={`
                fixed md:absolute z-[101]
                left-4 right-4 md:left-auto md:right-0
                top-20 md:top-full md:mt-3
                md:w-[380px] lg:w-[420px]
                bg-white rounded-2xl shadow-2xl
                border border-gray-100
                overflow-hidden
                animate-slideDown
              `}
              style={{
                maxHeight: 'calc(100vh - 100px)',
              }}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white z-10 px-5 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="px-2.5 py-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
              </div>

              {/* Notifications List */}
              <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 220px)' }}>
                {notifications.length === 0 ? (
                  /* Empty State */
                  <div className="py-16 px-6 text-center">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                      <Bell size={32} className="text-gray-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-700 mb-1">All caught up!</h4>
                    <p className="text-gray-500 text-sm">No notifications yet. We'll let you know when something happens.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {notifications.slice(0, 5).map((notif) => (
                      <NotificationItem key={notif.id} notif={notif} />
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="sticky bottom-0 bg-gradient-to-t from-white via-white to-transparent pt-4 pb-3 px-5 border-t border-gray-100">
                  <button 
                    onClick={handleViewAllClick}
                    className="w-full py-2.5 text-center text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors"
                  >
                    View all notifications ({notifications.length})
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Animations CSS */}
        <style>{`
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-10px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          
          @keyframes wiggle {
            0%, 100% { transform: rotate(0deg); }
            15% { transform: rotate(-15deg); }
            30% { transform: rotate(12deg); }
            45% { transform: rotate(-10deg); }
            60% { transform: rotate(8deg); }
            75% { transform: rotate(-5deg); }
            90% { transform: rotate(3deg); }
          }
          
          .animate-slideDown {
            animation: slideDown 0.25s ease-out forwards;
          }
          
          .animate-wiggle {
            animation: wiggle 0.6s ease-in-out;
          }
          
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        `}</style>
      </div>

      {/* ✅ NEW: Full Notifications Modal */}
      {showAllNotifications && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Bell size={28} />
                    All Notifications
                  </h2>
                  <p className="text-emerald-100 text-sm mt-1">
                    {notifications.length} notification{notifications.length !== 1 ? 's' : ''} • {unreadCount} unread
                  </p>
                </div>
                <button 
                  onClick={() => setShowAllNotifications(false)}
                  className="p-2 hover:bg-white/20 rounded-xl transition text-white"
                >
                  <X size={24} />
                </button>
              </div>
              
              {/* Mark all as read button */}
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="mt-3 px-4 py-2 bg-white/20 text-white rounded-lg text-sm font-semibold hover:bg-white/30 transition"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-16 px-6 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Bell size={32} className="text-gray-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-700 mb-1">No notifications</h4>
                  <p className="text-gray-500 text-sm">You're all caught up!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notif) => (
                    <NotificationItem key={notif.id} notif={notif} showFullDate={true} />
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex-shrink-0">
              <button
                onClick={() => setShowAllNotifications(false)}
                className="w-full py-2.5 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NotificationBell;