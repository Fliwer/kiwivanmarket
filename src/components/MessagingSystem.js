import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, ArrowLeft, Check, CheckCheck, Image, Smile } from 'lucide-react';
import { db } from '../firebase';
import { 
  collection, addDoc, query, where, orderBy, onSnapshot, 
  doc, updateDoc, serverTimestamp, getDocs, deleteDoc, setDoc, getDoc
} from 'firebase/firestore';
import { useAuth } from '../AuthContext';

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
export default function MessagingSystem({ onClose, initialVan, initialRecipient }) {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  
  const { currentUser } = useAuth();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // ============================================
  // HELPERS
  // ============================================
  
  // Auto-scroll vers le bas
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Focus sur l'input quand on ouvre une conversation
  useEffect(() => {
    if (selectedConversation && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [selectedConversation]);

  // Formater l'heure relative
  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    
    return date.toLocaleDateString('en-NZ', { day: 'numeric', month: 'short' });
  };

  // Formater l'heure exacte pour les messages
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('en-NZ', { hour: '2-digit', minute: '2-digit' });
  };

  // Obtenir l'autre participant
  const getOtherParticipant = useCallback((conv) => {
    if (!conv || !currentUser) return { name: 'User', email: '' };
    const otherUserId = conv.participants?.find(id => id !== currentUser.uid);
    return conv.participantsData?.[otherUserId] || { name: 'User', email: '' };
  }, [currentUser]);

  // Obtenir l'ID de l'autre participant
  const getOtherUserId = useCallback((conv) => {
    if (!conv || !currentUser) return null;
    return conv.participants?.find(id => id !== currentUser.uid);
  }, [currentUser]);

  // ============================================
  // CHARGEMENT DES CONVERSATIONS
  // ============================================
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', currentUser.uid),
      orderBy('lastMessageTime', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setConversations(convs);
      
      // Calculer messages non lus
      const totalUnread = convs.reduce((sum, conv) => {
        return sum + (conv.unreadCount?.[currentUser.uid] || 0);
      }, 0);
      setUnreadCount(totalUnread);
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // ============================================
  // CRÉATION / OUVERTURE CONVERSATION
  // ============================================
  useEffect(() => {
    if (initialVan && initialRecipient && currentUser) {
      createOrOpenConversation(initialVan, initialRecipient);
    }
  }, [initialVan, initialRecipient, currentUser]);

  const createOrOpenConversation = async (van, recipient) => {
    try {
      const recipientId = recipient.uid || recipient.id || recipient.email;
      
      // Chercher conversation existante
      const q = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', currentUser.uid)
      );
      
      const snapshot = await getDocs(q);
      const existingConv = snapshot.docs.find(doc => {
        const data = doc.data();
        return data.vanId === van.id && data.participants.includes(recipientId);
      });

      if (existingConv) {
        setSelectedConversation({ id: existingConv.id, ...existingConv.data() });
      } else {
        // Créer nouvelle conversation
        const conversationData = {
          participants: [currentUser.uid, recipientId],
          participantsData: {
            [currentUser.uid]: {
              name: currentUser.displayName || 'User',
              email: currentUser.email
            },
            [recipientId]: {
              name: recipient.name || 'Seller',
              email: recipient.email || ''
            }
          },
          vanId: van.id,
          vanTitle: van.title,
          vanImage: van.imageUrl || van.images?.[0],
          vanPrice: van.price,
          lastMessage: '',
          lastMessageTime: serverTimestamp(),
          unreadCount: {
            [currentUser.uid]: 0,
            [recipientId]: 0
          },
          typing: {
            [currentUser.uid]: false,
            [recipientId]: false
          },
          createdAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, 'conversations'), conversationData);
        setSelectedConversation({ id: docRef.id, ...conversationData });
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  // ============================================
  // CHARGEMENT DES MESSAGES
  // ============================================
  useEffect(() => {
    if (!selectedConversation) return;

    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', selectedConversation.id),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setMessages(msgs);
      markAsRead(selectedConversation.id);
    });

    return () => unsubscribe();
  }, [selectedConversation]);

  // ============================================
  // ÉCOUTER LE TYPING DE L'AUTRE
  // ============================================
  useEffect(() => {
    if (!selectedConversation || !currentUser) return;

    const convRef = doc(db, 'conversations', selectedConversation.id);
    
    const unsubscribe = onSnapshot(convRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const otherUserId = getOtherUserId(selectedConversation);
        setOtherUserTyping(data.typing?.[otherUserId] || false);
      }
    });

    return () => unsubscribe();
  }, [selectedConversation, currentUser, getOtherUserId]);

  // ============================================
  // GESTION DU TYPING INDICATOR
  // ============================================
  const updateTypingStatus = async (isTyping) => {
    if (!selectedConversation || !currentUser) return;
    
    try {
      const convRef = doc(db, 'conversations', selectedConversation.id);
      await updateDoc(convRef, {
        [`typing.${currentUser.uid}`]: isTyping
      });
    } catch (error) {
      console.error('Error updating typing status:', error);
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    
    // Mettre à jour le statut "typing"
    if (!isTyping) {
      setIsTyping(true);
      updateTypingStatus(true);
    }
    
    // Reset le timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Arrêter le typing après 2 secondes d'inactivité
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      updateTypingStatus(false);
    }, 2000);
  };

  // ============================================
  // MARQUER COMME LU
  // ============================================
  const markAsRead = async (conversationId) => {
    if (!currentUser) return;
    
    try {
      const convRef = doc(db, 'conversations', conversationId);
      await updateDoc(convRef, {
        [`unreadCount.${currentUser.uid}`]: 0
      });
      
      // Marquer les messages comme lus
      const q = query(
        collection(db, 'messages'),
        where('conversationId', '==', conversationId),
        where('senderId', '!=', currentUser.uid)
      );
      
      const snapshot = await getDocs(q);
      const updates = snapshot.docs
        .filter(doc => !doc.data().read)
        .map(doc => updateDoc(doc.ref, { read: true, readAt: serverTimestamp() }));
      
      await Promise.all(updates);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // ============================================
  // ENVOYER UN MESSAGE
  // ============================================
  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation || sending) return;

    setSending(true);
    setIsTyping(false);
    updateTypingStatus(false);
    
    const messageText = newMessage.trim();
    setNewMessage(''); // Clear immédiatement pour UX

    try {
      const otherUserId = getOtherUserId(selectedConversation);
      
      const messageData = {
        conversationId: selectedConversation.id,
        senderId: currentUser.uid,
        senderName: currentUser.displayName || 'User',
        text: messageText,
        timestamp: serverTimestamp(),
        status: 'sent', // sent → delivered → read
        read: false,
        readAt: null
      };

      await addDoc(collection(db, 'messages'), messageData);

      // Mettre à jour la conversation
      const convRef = doc(db, 'conversations', selectedConversation.id);
      await updateDoc(convRef, {
        lastMessage: messageText,
        lastMessageTime: serverTimestamp(),
        [`unreadCount.${otherUserId}`]: (selectedConversation.unreadCount?.[otherUserId] || 0) + 1
      });

    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(messageText); // Restore si erreur
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  // ============================================
  // RENDER - LISTE DES CONVERSATIONS
  // ============================================
  const renderConversationsList = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-5 border-b bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Messages</h2>
            <p className="text-emerald-100 text-sm mt-1">
              {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
            </p>
          </div>
          {unreadCount > 0 && (
            <div className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full animate-pulse">
              {unreadCount} new
            </div>
          )}
        </div>
      </div>

      {/* Liste */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 p-6 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-700 mb-2">No messages yet</h3>
            <p className="text-sm text-gray-500">Click "Message Seller" on any van to start a conversation</p>
          </div>
        ) : (
          <div>
            {conversations.map(conv => {
              const otherUser = getOtherParticipant(conv);
              const unread = conv.unreadCount?.[currentUser?.uid] || 0;
              
              return (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`p-4 border-b cursor-pointer transition-all hover:bg-gray-50 ${unread > 0 ? 'bg-emerald-50' : ''}`}
                >
                  <div className="flex gap-3">
                    {/* Image du van */}
                    <div className="relative flex-shrink-0">
                      <img 
                        src={conv.vanImage || 'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=100'} 
                        alt={conv.vanTitle}
                        className="w-14 h-14 rounded-xl object-cover"
                      />
                      {unread > 0 && (
                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                          {unread}
                        </div>
                      )}
                    </div>
                    
                    {/* Infos */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className={`font-semibold truncate ${unread > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                          {otherUser.name}
                        </p>
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                          {formatRelativeTime(conv.lastMessageTime)}
                        </span>
                      </div>
                      <p className="text-sm text-emerald-600 truncate mb-1">{conv.vanTitle}</p>
                      <p className={`text-sm truncate ${unread > 0 ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                        {conv.lastMessage || 'Start the conversation...'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  // ============================================
  // RENDER - VUE CHAT
  // ============================================
  const renderChatView = () => {
    const otherUser = getOtherParticipant(selectedConversation);
    
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b bg-white flex items-center gap-3 shadow-sm">
          <button 
            onClick={() => setSelectedConversation(null)}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          
          <img 
            src={selectedConversation.vanImage || 'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=100'} 
            alt={selectedConversation.vanTitle}
            className="w-12 h-12 rounded-xl object-cover"
          />
          
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">{otherUser.name}</p>
            <div className="flex items-center gap-2">
              <p className="text-sm text-emerald-600 truncate">{selectedConversation.vanTitle}</p>
              {selectedConversation.vanPrice && (
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                  NZ${selectedConversation.vanPrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-gray-600 font-medium">Start the conversation!</p>
              <p className="text-sm text-gray-500 mt-1">Say hello to {otherUser.name}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg, index) => {
                const isOwn = msg.senderId === currentUser?.uid;
                const showTime = index === 0 || 
                  (messages[index - 1] && 
                   msg.timestamp && 
                   messages[index - 1].timestamp &&
                   (msg.timestamp.toDate?.() || new Date(msg.timestamp)).getTime() - 
                   (messages[index - 1].timestamp.toDate?.() || new Date(messages[index - 1].timestamp)).getTime() > 300000);
                
                return (
                  <div key={msg.id}>
                    {/* Timestamp separator */}
                    {showTime && msg.timestamp && (
                      <div className="text-center my-4">
                        <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
                          {formatRelativeTime(msg.timestamp)} • {formatMessageTime(msg.timestamp)}
                        </span>
                      </div>
                    )}
                    
                    {/* Message bubble */}
                    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div 
                        className={`max-w-[75%] px-4 py-2.5 rounded-2xl shadow-sm ${
                          isOwn 
                            ? 'bg-emerald-600 text-white rounded-br-md' 
                            : 'bg-white text-gray-900 rounded-bl-md'
                        }`}
                      >
                        <p className="text-[15px] leading-relaxed break-words">{msg.text}</p>
                        
                        {/* Time & Status */}
                        <div className={`flex items-center justify-end gap-1 mt-1 ${isOwn ? 'text-emerald-200' : 'text-gray-400'}`}>
                          <span className="text-[11px]">{formatMessageTime(msg.timestamp)}</span>
                          {isOwn && (
                            <span className="flex items-center">
                              {msg.read ? (
                                <CheckCheck size={14} className="text-blue-300" />
                              ) : (
                                <Check size={14} />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Typing indicator */}
              {otherUserTyping && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-600 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t">
          <form onSubmit={sendMessage} className="flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={handleInputChange}
                placeholder="Type a message..."
                className="w-full px-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all pr-12"
                disabled={sending}
              />
            </div>
            
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className={`p-3 rounded-full transition-all ${
                newMessage.trim() && !sending
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {sending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Send size={20} />
              )}
            </button>
          </form>
        </div>
      </div>
    );
  };

  // ============================================
  // RENDER PRINCIPAL
  // ============================================
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg h-[85vh] max-h-[700px] flex flex-col relative shadow-2xl overflow-hidden">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-gray-100 rounded-full transition z-20 shadow-md"
        >
          <X size={20} className="text-gray-600" />
        </button>
        
        {selectedConversation ? renderChatView() : renderConversationsList()}
      </div>
    </div>
  );
}