import React, { useState, useEffect, useRef } from 'react';
import { Bell, CreditCard, CheckCircle, XCircle, MessageCircle, Star, Package, AlertCircle, ChevronRight, X, Trash2 } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, writeBatch, limit, deleteDoc } from 'firebase/firestore';

// ✨ World-class NotificationBell Component
// Inspired by Airbnb, LinkedIn, Facebook best practices

const NotificationBell = ({ user, onNotificationClick }) => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const dropdownRef = useRef(null);
  const bellRef = useRef(null);
  const previousCountRef = useRef(0);

  const unreadCount = notifications.filter(n => !n.read).length;

  // 🔔 Load notifications in real-time
  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      if (notifs.length > previousCountRef.current && previousCountRef.current > 0) {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 600);
      }

      previousCountRef.current = notifs.length;
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

  // 🗑️ Delete single notification
  const deleteNotification = async (e, notifId) => {
    e.stopPropagation();
    setDeletingId(notifId);

    try {
      await deleteDoc(doc(db, 'notifications', notifId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    } finally {
      setDeletingId(null);
    }
  };

  // 🗑️ Delete all notifications
  const deleteAllNotifications = async () => {
    if (!window.confirm('Delete all notifications? This cannot be undone.')) return;

    try {
      const batch = writeBatch(db);
      notifications.forEach(n => {
        batch.delete(doc(db, 'notifications', n.id));
      });
      await batch.commit();
      setShowAllNotifications(false);
    } catch (error) {
      console.error('Error deleting all notifications:', error);
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

  // 📅 Format full date
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

  const handleViewAllClick = () => {
    setIsOpen(false);
    setShowAllNotifications(true);
  };

  // 📋 Notification Item Component
  const NotificationItem = ({ notif, showFullDate = false, showDelete = false }) => {
    const style = getNotificationStyle(notif.type);
    const IconComponent = style.icon;
    const isDeleting = deletingId === notif.id;

    return (
      <div
        onClick={() => handleNotificationClick(notif)}
        className={`
          group relative flex gap-4 p-4 cursor-pointer
          transition-all duration-300
          border-l-4 ${style.accentColor}
          ${isDeleting ? 'opacity-50 scale-95' : ''}
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
        <div className="flex-1 min-w-0 pr-8">
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

        {/* Delete button */}
        <button
          onClick={(e) => deleteNotification(e, notif.id)}
          className={`
            absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg
            text-gray-400 hover:text-red-500 hover:bg-red-50
            transition-all duration-200
            ${showDelete ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
          `}
          title="Delete notification"
        >
          <Trash2 size={16} />
        </button>

        {/* Unread indicator dot */}
        {!notif.read && !showDelete && (
          <div className="absolute right-12 top-1/2 -translate-y-1/2 group-hover:opacity-0 transition-opacity">
            <div className="w-2.5 h-2.5 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full animate-pulse" />
          </div>
        )}
      </div>
    );
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
              ? 'bg-emerald-50 text-emerald-600'
              : 'hover:bg-slate-50 text-slate-500 hover:text-emerald-600'
            }
            ${isAnimating ? 'animate-wiggle' : ''}
          `}
          aria-label="Notifications"
        >
          <Bell
            size={22}
            className={`transition-all duration-300 ${isOpen ? 'fill-emerald-600/10' : ''
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
                : 'top-0.5 right-0.5 w-[18px] h-[18px] text-[11px] rounded-full bg-gradient-to-r from-red-500 to-pink-500'
              }
              ${isAnimating ? 'scale-125' : 'scale-100'}
            `}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* 📋 Dropdown Panel */}
        {isOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100] md:hidden"
              onClick={() => setIsOpen(false)}
            />

            <div
              ref={dropdownRef}
              className="fixed md:absolute z-[101] left-4 right-4 md:left-auto md:right-0 top-20 md:top-full md:mt-3 md:w-[380px] lg:w-[420px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-slideDown"
              style={{ maxHeight: 'calc(100vh - 100px)' }}
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

              {/* List */}
              <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 220px)' }}>
                {notifications.length === 0 ? (
                  <div className="py-16 px-6 text-center">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                      <Bell size={32} className="text-gray-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-700 mb-1">All caught up!</h4>
                    <p className="text-gray-500 text-sm">No notifications yet.</p>
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

        <style>{`
          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-10px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
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
          .animate-slideDown { animation: slideDown 0.25s ease-out forwards; }
          .animate-wiggle { animation: wiggle 0.6s ease-in-out; }
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        `}</style>
      </div>

      {/* Full Notifications Modal */}
      {showAllNotifications && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">

            {/* Header */}
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

              {/* Action buttons */}
              <div className="flex gap-2 mt-3">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="px-4 py-2 bg-white/20 text-white rounded-lg text-sm font-semibold hover:bg-white/30 transition"
                  >
                    Mark all as read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={deleteAllNotifications}
                    className="px-4 py-2 bg-red-500/80 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    Clear all
                  </button>
                )}
              </div>
            </div>

            {/* List */}
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
                    <NotificationItem key={notif.id} notif={notif} showFullDate={true} showDelete={true} />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
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