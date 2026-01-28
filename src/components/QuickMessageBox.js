import React, { useState } from 'react';
import { Send, Check, MessageCircle, AlertCircle, Mail, RefreshCw } from 'lucide-react';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import { useRateLimit } from '../hooks/useRateLimit';
import { sanitizeText } from '../securityUtils';

// ============================================
// QUICK MESSAGE BOX
// For sending quick messages from van modal
// ✅ Avec vérification email + textarea multi-lignes
// ============================================

export default function QuickMessageBox({ van, seller, onMessageSent, onOpenFullChat }) {
  const { currentUser, resendVerificationEmail, refreshEmailVerification } = useAuth();
  const { checkAndRecord, getRemainingActions } = useRateLimit(currentUser?.uid);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  
  // ✅ États pour la vérification email
  const [resendingEmail, setResendingEmail] = useState(false);
  const [emailResent, setEmailResent] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // ✅ Récupérer le nombre de messages restants
  const messageLimit = getRemainingActions('sendMessage');

  const quickReplies = [
    { text: "Hi! Is this still available?", icon: "👋" },
    { text: "What's your best price?", icon: "💰" },
    { text: "Can I come see it today?", icon: "📍" },
    { text: "Can you send more photos?", icon: "📸" },
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

  // ✅ Renvoyer l'email de vérification
  const handleResendEmail = async () => {
    setResendingEmail(true);
    setError(null);
    try {
      await resendVerificationEmail();
      setEmailResent(true);
      setTimeout(() => setEmailResent(false), 5000);
    } catch (err) {
      setError(err.message || 'Failed to send verification email');
    } finally {
      setResendingEmail(false);
    }
  };

  // ✅ Rafraîchir le statut de vérification
  const handleRefreshVerification = async () => {
    setRefreshing(true);
    setError(null);
    try {
      const isVerified = await refreshEmailVerification();
      if (isVerified) {
        // Force le re-render en rechargeant la page
        window.location.reload();
      } else {
        setError('Email not verified yet. Please check your inbox.');
      }
    } catch (err) {
      setError('Failed to check verification status');
    } finally {
      setRefreshing(false);
    }
  };

  const sendMessage = async (text) => {
    // ✅ Validation améliorée avec messages d'erreur explicites
    if (!text.trim()) {
      setError('Please enter a message');
      return;
    }
    
    if (!currentUser) {
      setError('Please sign in to send messages');
      return;
    }

    // ✅ NOUVEAU: Bloquer si email non vérifié
    if (!currentUser.emailVerified) {
      setError('Please verify your email before sending messages');
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
            [sellerInfo.uid]: 1
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
        [`unreadCount.${sellerInfo.uid}`]: 1
      });

      setSent(true);
      setMessage('');
      
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

  // ✅ Si pas connecté
  if (!currentUser) {
    return (
      <div className="bg-gray-50 rounded-xl p-4 text-center">
        <p className="text-gray-600 text-sm">Sign in to message the seller</p>
      </div>
    );
  }

  const sellerUid = getSellerUid();
  
  // Don't show if user is the seller
  if (sellerUid && currentUser.uid === sellerUid) {
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

  // ✅ NOUVEAU: Bloquer si email non vérifié
  if (!currentUser.emailVerified) {
    return (
      <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
        <div className="flex items-start gap-3">
          <div className="bg-amber-100 rounded-full p-2 flex-shrink-0">
            <Mail size={20} className="text-amber-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-amber-800 mb-1">
              📧 Verify your email to contact sellers
            </h4>
            <p className="text-amber-700 text-sm mb-3">
              We sent a verification link to <strong>{currentUser.email}</strong>. 
              Please check your inbox (and spam folder).
            </p>
            
            {emailResent ? (
              <p className="text-emerald-600 text-sm font-medium flex items-center gap-1">
                <Check size={16} />
                Verification email sent!
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleResendEmail}
                  disabled={resendingEmail}
                  className="text-sm bg-amber-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-amber-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {resendingEmail ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail size={16} />
                      Resend email
                    </>
                  )}
                </button>
                <button
                  onClick={handleRefreshVerification}
                  disabled={refreshing}
                  className="text-sm bg-white text-amber-700 px-4 py-2 rounded-lg font-medium hover:bg-amber-100 transition border border-amber-300 flex items-center gap-2"
                >
                  {refreshing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-amber-400/30 border-t-amber-600 rounded-full animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <RefreshCw size={16} />
                      I've verified
                    </>
                  )}
                </button>
              </div>
            )}
            
            {error && (
              <p className="text-red-600 text-sm mt-2">{error}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-emerald-50 rounded-2xl p-4 border border-emerald-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
          <MessageCircle size={18} className="text-emerald-600" />
          Contact Seller
        </h4>
        
        {/* ✅ Indicateur de messages restants (visible si < 10) */}
        {messageLimit.remaining <= 10 && (
          <div className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
            messageLimit.remaining === 0 
              ? 'bg-red-100 text-red-700' 
              : messageLimit.remaining <= 5 
                ? 'bg-amber-100 text-amber-700' 
                : 'bg-gray-100 text-gray-600'
          }`}>
            {messageLimit.remaining === 0 ? (
              <>
                <AlertCircle size={12} />
                Limit reached
              </>
            ) : (
              <>{messageLimit.remaining} msg left/h</>
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
          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
            sent 
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

      {/* Success Message */}
      {sent && (
        <div className="mt-2 text-center text-sm text-emerald-600 font-medium animate-pulse">
          ✓ Message sent! The seller will be notified.
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