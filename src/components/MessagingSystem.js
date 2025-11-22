import React, { useState, useEffect, useRef } from 'react';
import { X, Send, ArrowLeft, Clock, Check, CheckCheck } from 'lucide-react';
import { db } from '../firebase';
import { 
  collection, addDoc, query, where, orderBy, onSnapshot, 
  doc, updateDoc, serverTimestamp, getDoc, getDocs, setDoc 
} from 'firebase/firestore';
import { useAuth } from '../AuthContext';

export default function MessagingSystem({ onClose, initialVan, initialRecipient }) {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const { currentUser } = useAuth();
  const messagesEndRef = useRef(null);

  // Auto-scroll vers le bas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Charger les conversations
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
      
      // Calculer le nombre total de messages non lus
      const totalUnread = convs.reduce((sum, conv) => {
        return sum + (conv.unreadCount?.[currentUser.uid] || 0);
      }, 0);
      setUnreadCount(totalUnread);
      
      setLoading(false);
      console.log('✅ Conversations chargées:', convs.length);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Si initialVan et initialRecipient fournis, créer/ouvrir conversation
  useEffect(() => {
    if (initialVan && initialRecipient && currentUser) {
      createOrOpenConversation(initialVan, initialRecipient);
    }
  }, [initialVan, initialRecipient, currentUser]);

  // Créer ou ouvrir une conversation existante
  const createOrOpenConversation = async (van, recipient) => {
    try {
      // Chercher conversation existante
      const q = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', currentUser.uid)
      );
      
      const snapshot = await getDocs(q);
      const existingConv = snapshot.docs.find(doc => {
        const data = doc.data();
        return data.vanId === van.id && 
               data.participants.includes(recipient.uid || recipient.id);
      });

      if (existingConv) {
        // Ouvrir conversation existante
        setSelectedConversation({
          id: existingConv.id,
          ...existingConv.data()
        });
        console.log('✅ Conversation existante ouverte');
      } else {
        // Créer nouvelle conversation
        const conversationData = {
          participants: [currentUser.uid, recipient.uid || recipient.id],
          participantsData: {
            [currentUser.uid]: {
              name: currentUser.displayName || 'User',
              email: currentUser.email
            },
            [recipient.uid || recipient.id]: {
              name: recipient.name,
              email: recipient.email
            }
          },
          vanId: van.id,
          vanTitle: van.title,
          vanImage: van.imageUrl || van.images?.[0],
          lastMessage: '',
          lastMessageTime: serverTimestamp(),
          unreadCount: {
            [currentUser.uid]: 0,
            [recipient.uid || recipient.id]: 0
          },
          createdAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, 'conversations'), conversationData);
        
        setSelectedConversation({
          id: docRef.id,
          ...conversationData
        });

        console.log('✅ Nouvelle conversation créée');
      }
    } catch (error) {
      console.error('❌ Erreur création conversation:', error);
    }
  };

  // Charger les messages d'une conversation
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
      
      // Marquer comme lu
      markAsRead(selectedConversation.id);
      
      console.log('✅ Messages chargés:', msgs.length);
    });

    return () => unsubscribe();
  }, [selectedConversation]);

  // Marquer une conversation comme lue
  const markAsRead = async (conversationId) => {
    try {
      const convRef = doc(db, 'conversations', conversationId);
      await updateDoc(convRef, {
        [`unreadCount.${currentUser.uid}`]: 0
      });
      
      // Marquer tous les messages comme lus
      const q = query(
        collection(db, 'messages'),
        where('conversationId', '==', conversationId),
        where('senderId', '!=', currentUser.uid),
        where('read', '==', false)
      );
      
      const snapshot = await getDocs(q);
      const batch = snapshot.docs.map(doc => 
        updateDoc(doc.ref, { read: true })
      );
      
      await Promise.all(batch);
    } catch (error) {
      console.error('❌ Erreur marquage lu:', error);
    }
  };

  // Envoyer un message
  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const messageData = {
        conversationId: selectedConversation.id,
        senderId: currentUser.uid,
        senderName: currentUser.displayName || 'User',
        text: newMessage.trim(),
        timestamp: serverTimestamp(),
        read: false
      };

      // Ajouter le message
      await addDoc(collection(db, 'messages'), messageData);

      // Mettre à jour la conversation
      const otherUserId = selectedConversation.participants.find(id => id !== currentUser.uid);
      const convRef = doc(db, 'conversations', selectedConversation.id);
      
      await updateDoc(convRef, {
        lastMessage: newMessage.trim(),
        lastMessageTime: serverTimestamp(),
        [`unreadCount.${otherUserId}`]: (selectedConversation.unreadCount?.[otherUserId] || 0) + 1
      });

      setNewMessage('');
      console.log('✅ Message envoyé');
    } catch (error) {
      console.error('❌ Erreur envoi message:', error);
    }
  };

  // Ouvrir une conversation
  const openConversation = (conv) => {
    setSelectedConversation(conv);
  };

  // Formater l'heure (AMÉLIORÉ)
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-NZ', { day: 'numeric', month: 'short' });
  };

  // Formater le timestamp détaillé pour les messages
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('en-NZ', { hour: '2-digit', minute: '2-digit' });
  };

  // Obtenir l'autre participant
  const getOtherParticipant = (conv) => {
    const otherUserId = conv.participants.find(id => id !== currentUser.uid);
    return conv.participantsData?.[otherUserId] || { name: 'User', email: '' };
  };

  // Vue Liste des conversations
  const ConversationsList = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Messages</h2>
          {unreadCount > 0 && (
            <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {unreadCount}
            </div>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">{conversations.length} conversation(s)</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-emerald-600"></div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="font-bold text-lg text-gray-400 mb-2">No messages yet</h3>
            <p className="text-sm text-gray-500">Start a conversation by clicking "Message Seller" on any van</p>
          </div>
        ) : (
          <div className="divide-y">
            {conversations.map(conv => {
              const otherUser = getOtherParticipant(conv);
              const unread = conv.unreadCount?.[currentUser.uid] || 0;
              
              return (
                <div
                  key={conv.id}
                  onClick={() => openConversation(conv)}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition flex gap-3">
                  <img 
                    src={conv.vanImage || 'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=100'} 
                    alt={conv.vanTitle}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-bold truncate">{otherUser.name}</p>
                      <span className="text-xs text-gray-500">{formatTime(conv.lastMessageTime)}</span>
                    </div>
                    <p className="text-sm text-gray-600 truncate mb-1">{conv.vanTitle}</p>
                    <div className="flex items-center justify-between">
                      <p className={`text-sm truncate ${unread > 0 ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                        {conv.lastMessage || 'No messages yet'}
                      </p>
                      {unread > 0 && (
                        <div className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-2">
                          {unread}
                        </div>
                      )}
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

  // Vue Chat
  const ChatView = () => {
    const otherUser = getOtherParticipant(selectedConversation);
    
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b flex items-center gap-3 bg-white">
          <button 
            onClick={() => setSelectedConversation(null)}
            className="p-2 hover:bg-gray-100 rounded-lg transition">
            <ArrowLeft size={20} />
          </button>
          <img 
            src={selectedConversation.vanImage || 'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=100'} 
            alt={selectedConversation.vanTitle}
            className="w-12 h-12 rounded-lg object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="font-bold truncate">{otherUser.name}</p>
            <p className="text-sm text-gray-600 truncate">{selectedConversation.vanTitle}</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => {
                const isOwn = msg.senderId === currentUser.uid;
                
                return (
                  <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] ${isOwn ? 'bg-emerald-600 text-white' : 'bg-white text-gray-900'} rounded-2xl px-4 py-2 shadow`}>
                      <p className="text-sm break-words">{msg.text}</p>
                      <div className={`flex items-center gap-1 mt-1 text-xs ${isOwn ? 'text-emerald-100' : 'text-gray-500'}`}>
                        <span>{formatMessageTime(msg.timestamp)}</span>
                        {isOwn && (
                          msg.read ? 
                            <CheckCheck size={14} /> : 
                            <Check size={14} />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="p-4 border-t bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2">
              <Send size={20} />
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition z-10">
          <X size={24} />
        </button>
        
        {selectedConversation ? <ChatView /> : <ConversationsList />}
      </div>
    </div>
  );
}