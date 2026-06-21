import React, { useState } from 'react';
import { Send, Check, MessageCircle, AlertCircle, Zap } from 'lucide-react';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import { useRateLimit } from '../hooks/useRateLimit';
import { sanitizeText } from '../securityUtils';
import { useTranslation } from 'react-i18next';

// ============================================
// QUICK MESSAGE BOX
// For sending quick messages from van modal
// ✅ Avec vérification email + textarea multi-lignes
// ============================================

export default function QuickMessageBox({ van, seller, onMessageSent, onOpenFullChat, onAuthRequired }) {
  const { currentUser } = useAuth();
  const { t, i18n } = useTranslation();
  const { checkAndRecord, getRemainingActions } = useRateLimit(currentUser?.uid);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Récupérer le nombre de messages restants
  const messageLimit = getRemainingActions('sendMessage');

  const quickReplies = [
    { text: t('van_page.reply_available') || "Hi! Is this still available?", icon: "👋" },
    { text: t('van_page.reply_price') || "What's your best price?", icon: "💰" },
    { text: t('van_page.reply_visit') || "Can I come see it today?", icon: "📍" },
    { text: t('van_page.reply_photos') || "Can you send more photos?", icon: "📸" },
  ];


  // ✅ Récupère l'UID du vendeur (plusieurs sources possibles)
  const getSellerUid = () => {
    return seller?.uid || van?.seller?.uid || van?.userId || null;
  };

  // ✅ Récupère les infos du vendeur avec fallback
  const getSellerInfo = () => {
    return {
      uid: getSellerUid(),
      name: seller?.name || van?.seller?.name || 'Seller',
      email: seller?.email || van?.seller?.email || ''
    };
  };

  const sendMessage = async (text) => {
    // ✅ Validation améliorée avec messages d'erreur explicites
    if (!text.trim()) {
      setError('Please enter a message');
      return;
    }

    if (!currentUser) {
      if (onAuthRequired) onAuthRequired();
      else setError('Please sign in to send messages');
      return;
    }

    // Email verification required to contact sellers (also enforced server-side)
    if (!currentUser.emailVerified) {
      setError('Please verify your email to contact sellers. Check your inbox at ' + currentUser.email);
      return;
    }

    if (!van) {
      setError('Van information not available');
      return;
    }

    const sellerInfo = getSellerInfo();
    if (!sellerInfo.uid) {
      setError('Unable to contact seller. Please try again later.');
      console.error('❌ Seller UID not found:', { seller, van });
      return;
    }

    // 🛡️ RATE LIMIT: Max 30 messages par heure
    const rateCheck = checkAndRecord('sendMessage');
    if (!rateCheck.allowed) {
      setError(rateCheck.error);
      return;
    }

    setSending(true);
    setError(null);

    try {
      // Check for existing conversation
      const q = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', currentUser.uid)
      );

      const snapshot = await getDocs(q);
      let conversationId = null;

      // Find existing conversation for this van
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        if (data.vanId === van.id && data.participants.includes(sellerInfo.uid)) {
          conversationId = docSnap.id;
          break;
        }
      }

      // Create new conversation if none exists
      if (!conversationId) {
        const convRef = await addDoc(collection(db, 'conversations'), {
          participants: [currentUser.uid, sellerInfo.uid],
          // ✅ IMPORTANT: Ces champs sont requis par la Cloud Function pour les emails
          sellerId: sellerInfo.uid,
          buyerId: currentUser.uid,
          buyerName: currentUser.displayName || 'Someone',
          participantNames: {
            [currentUser.uid]: currentUser.displayName || 'Anonymous',
            [sellerInfo.uid]: sellerInfo.name
          },
          participantEmails: {
            [currentUser.uid]: currentUser.email,
            [sellerInfo.uid]: sellerInfo.email
          },
          vanId: van.id,
          van: {
            id: van.id,
            title: van.title,
            price: van.price,
            imageUrl: van.imageUrl || van.images?.[0],
            year: van.year,
            mileage: van.mileage,
            location: van.location,
            wofExpiry: van.wofExpiry,
            regoExpiry: van.regoExpiry,
            selfContained: van.selfContained,
            buyBack: van.buyBack,
            buyBackPrice: van.buyBackPrice,
            buyBackDuration: van.buyBackDuration
          },
          status: 'new',
          lastMessage: sanitizeText(text),
          lastMessageAt: serverTimestamp(),
          lastMessageSenderId: currentUser.uid,
          createdAt: serverTimestamp(),
          unreadCount: {
            [currentUser.uid]: 0,
            [sellerInfo.uid]: 0
          }
        });
        conversationId = convRef.id;
      }

      // Add message to conversation
      await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
        text: sanitizeText(text),
        senderId: currentUser.uid,
        senderName: currentUser.displayName || 'Anonymous',
        createdAt: serverTimestamp(),
        read: false
      });

      // Update conversation last message
      await updateDoc(doc(db, 'conversations', conversationId), {
        lastMessage: sanitizeText(text),
        lastMessageAt: serverTimestamp(),
        lastMessageSenderId: currentUser.uid,
        status: 'active',
        [`unreadCount.${sellerInfo.uid}`]: increment(1)
      });

      setSent(true);
      setMessage('');

      // 📊 QW2 — GA conversion event
      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag('event', 'message_sent', {
          van_id: van.id,
          seller_id: sellerInfo.uid,
        });
      }

      // Reset after 3 seconds
      setTimeout(() => setSent(false), 3000);

      if (onMessageSent) onMessageSent();

    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };


  const sellerUid = getSellerUid();

  // Don't show if user is the seller
  if (sellerUid && currentUser?.uid === sellerUid) {
    return null;
  }

  // ✅ Afficher un message si seller.uid est manquant
  if (!sellerUid) {
    return (
      <div className="bg-orange-50 rounded-xl p-4 text-center border border-orange-200">
        <p className="text-orange-700 text-sm font-medium flex items-center justify-center gap-2">
          <AlertCircle size={16} />
          Unable to contact this seller directly.
        </p>
        <p className="text-orange-600 text-xs mt-1">
          This listing may be outdated.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-emerald-50 rounded-2xl p-4 border border-emerald-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-black text-slate-900 uppercase tracking-tight flex items-center gap-2 text-sm md:text-base">
            <MessageCircle size={18} className="text-emerald-600" />
            {t('van_page.contact_title') || 'Contact Seller'}
          </h4>
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.2em] flex items-center gap-1 mt-1">
            <Zap size={10} fill="currentColor" />
            {t('van_page.contact_subtitle') || 'Fast response'}
          </p>
        </div>

        {/* ✅ Indicateur de messages restants (visible si < 10) */}
        {currentUser && messageLimit?.remaining !== undefined && messageLimit.remaining <= 10 && (
          <div className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1 ${messageLimit.remaining === 0
              ? 'bg-red-50 text-red-600 border border-red-100'
              : 'bg-slate-100 text-slate-500 border border-slate-200'
            }`}>
            {messageLimit.remaining === 0 ? (
              <>
                <AlertCircle size={12} />
                Limit
              </>
            ) : (
              <>{messageLimit.remaining} left</>
            )}
          </div>
        )}
      </div>

      {/* Make an Offer */}
      <div className="mb-3">
        <p className="text-xs text-gray-500 mb-2">Make an offer:</p>
        <div className="grid grid-cols-4 gap-1.5">
          {[5, 10, 15, 20].map((percent) => {
            const offerPrice = Math.round(van.price * (1 - percent / 100));
            return (
              <button
                key={percent}
                onClick={() => sendMessage(`Hi! I'd like to offer $${offerPrice.toLocaleString()} (-${percent}%) for this ${van.title}. Would you consider it?`)}
                disabled={sending}
                className="py-2 px-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 hover:border-amber-400 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
              >
                <span className="text-amber-700 font-bold">-{percent}%</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Replies - Grid 2x2 */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {quickReplies.map((reply, idx) => (
          <button
            key={idx}
            onClick={() => sendMessage(reply.text)}
            disabled={sending}
            className="bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs font-medium hover:border-emerald-500 hover:bg-emerald-50 transition-all flex items-center gap-2 disabled:opacity-50 text-left"
          >
            <span className="text-base">{reply.icon}</span>
            <span className="leading-tight">{reply.text}</span>
          </button>
        ))}
      </div>

      {/* ✅ TEXTAREA multi-lignes au lieu de input */}
      <div className="flex gap-2 items-end">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            // Envoyer avec Enter (sans Shift)
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage(message);
            }
          }}
          placeholder="Type your message..."
          disabled={sending}
          rows={2}
          className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 resize-none"
        />
        <button
          onClick={() => sendMessage(message)}
          disabled={!message.trim() || sending}
          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${sent
              ? 'bg-emerald-500 text-white'
              : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50'
            }`}
        >
          {sending ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : sent ? (
            <Check size={20} />
          ) : (
            <Send size={18} />
          )}
        </button>
      </div>

      {/* Success Message — avec bouton Open Full Chat */}
      {sent && (
        <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
          <p className="text-sm text-emerald-700 font-medium flex items-center gap-2 mb-2">
            <Check size={16} className="text-emerald-600" />
            Message sent! The seller will be notified.
          </p>
          {onOpenFullChat && (
            <button
              onClick={onOpenFullChat}
              className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg text-sm font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle size={16} />
              Open Full Chat
            </button>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg text-center text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}