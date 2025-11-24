import React, { useState } from 'react';
import { Send, Check, MessageCircle } from 'lucide-react';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';

// ============================================
// QUICK MESSAGE BOX
// For sending quick messages from van modal
// ============================================

export default function QuickMessageBox({ van, seller, onMessageSent, onOpenFullChat }) {
  const { currentUser } = useAuth();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const quickReplies = [
    { text: "Hi! Is this still available?", icon: "👋" },
    { text: "What's your best price?", icon: "💰" },
    { text: "Can I come see it today?", icon: "📍" },
    { text: "Can you send more photos?", icon: "📸" },
  ];

  const sendMessage = async (text) => {
    if (!text.trim() || !currentUser || !van || !seller) return;
    
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
        if (data.vanId === van.id && data.participants.includes(seller.uid)) {
          conversationId = docSnap.id;
          break;
        }
      }

      // Create new conversation if none exists
      if (!conversationId) {
        const convRef = await addDoc(collection(db, 'conversations'), {
          participants: [currentUser.uid, seller.uid],
          participantNames: {
            [currentUser.uid]: currentUser.displayName || 'Anonymous',
            [seller.uid]: seller.name || 'Seller'
          },
          participantEmails: {
            [currentUser.uid]: currentUser.email,
            [seller.uid]: seller.email || ''
          },
          vanId: van.id,
          van: {
            id: van.id,
            title: van.title,
            price: van.price,
            imageUrl: van.imageUrl || van.images?.[0],
            year: van.year,
            mileage: van.mileage,
            location: van.location
          },
          status: 'new',
          lastMessage: text.trim(),
          lastMessageAt: serverTimestamp(),
          createdAt: serverTimestamp(),
          unreadCount: {
            [currentUser.uid]: 0,
            [seller.uid]: 1
          }
        });
        conversationId = convRef.id;
      }

      // Add message to conversation
      await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
        text: text.trim(),
        senderId: currentUser.uid,
        senderName: currentUser.displayName || 'Anonymous',
        createdAt: serverTimestamp(),
        read: false
      });

      // Update conversation last message
      await updateDoc(doc(db, 'conversations', conversationId), {
        lastMessage: text.trim(),
        lastMessageAt: serverTimestamp(),
        status: 'active',
        [`unreadCount.${seller.uid}`]: 1
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

  if (!currentUser) {
    return (
      <div className="bg-gray-50 rounded-xl p-4 text-center">
        <p className="text-gray-600 text-sm">Sign in to message the seller</p>
      </div>
    );
  }

  // Don't show if user is the seller
  if (currentUser.uid === seller?.uid) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-emerald-50 rounded-2xl p-4 border border-emerald-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
          <MessageCircle size={18} className="text-emerald-600" />
          Contact Seller
        </h4>
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

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage(message)}
          placeholder="Type your message..."
          disabled={sending}
          className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50"
        />
        <button
          onClick={() => sendMessage(message)}
          disabled={!message.trim() || sending}
          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
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
        <div className="mt-2 text-center text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}