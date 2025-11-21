import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageCircle, Clock, CheckCheck, ArrowLeft } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  getDocs,
  setDoc,
  getDoc
} from 'firebase/firestore';

export default function MessagingSystem({ onClose, initialVan = null, initialRecipient = null }) {
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Scroll automatique vers le bas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Charger les conversations de l'utilisateur
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
      setLoading(false);
      console.log('✅ Conversations chargées:', convs.length);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Si initialVan et initialRecipient, créer/ouvrir la conversation
  useEffect(() => {
    if (initialVan && initialRecipient && currentUser) {
      openOrCreateConversation(initialVan, initialRecipient);
    }
  }, [initialVan, initialRecipient, currentUser]);

  // Créer ou ouvrir une conversation existante
  const openOrCreateConversation = async (van, recipient) => {
    try {
      // Chercher si une conversation existe déjà
      const q = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', currentUser.uid)
      );

      const snapshot = await getDocs(q);
      const existingConv = snapshot.docs.find(doc => {
        const data = doc.data();
        return data.participants.includes(recipient.uid) && data.vanId === van.id;
      });

      if (existingConv) {
        // Ouvrir la conversation existante
        setSelectedConversation({
          id: existingConv.id,
          ...existingConv.data()
        });
      } else {
        // Créer une nouvelle conversation
        const conversationData = {
          participants: [currentUser.uid, recipient.uid],
          participantNames: {
            [currentUser.uid]: currentUser.displayName || 'User',
            [recipient.uid]: recipient.name
          },
          participantEmails: {
            [currentUser.uid]: currentUser.email,
            [recipient.uid]: recipient.email
          },
          vanId: van.id,
          vanTitle: van.title,
          vanPrice: van.price,
          vanImage: van.imageUrl || van.images?.[0],
          lastMessage: '',
          lastMessageTime: serverTimestamp(),
          unreadCount: {
            [currentUser.uid]: 0,
            [recipient.uid]: 0
          },
          createdAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, 'conversations'), conversationData);
        
        setSelectedConversation({
          id: docRef.id,
          ...conversationData
        });

        console.log('✅ Nouvelle conversation créée:', docRef.id);
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

  // Ouvrir une conversation depuis la liste
  const openConversation = (conv) => {
    setSelectedConversation(conv);
  };

  // Formater l'heure
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    // Moins d'une minute
    if (diff < 60000) return 'À l\'instant';
    
    // Moins d'une heure
    if (diff < 3600000) {
      const mins = Math.floor(diff / 60000);
      return `Il y a ${mins}min`;
    }
    
    // Moins d'un jour
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `Il y a ${hours}h`;
    }
    
    // Plus d'un jour
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const formatPrice = (price) => `NZ$${price?.toLocaleString()}`;

  // Vue : Liste des conversations
  if (!selectedConversation) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full h-[80vh] flex flex-col relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-white rounded-full p-2 shadow-lg z-10">
            <X size={24} />
          </button>

          <div className="p-6 border-b">
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <MessageCircle className="text-emerald-600" size={32} />
              Mes Messages
            </h2>
          </div>

          {/* Liste des conversations */}
          <div className="flex-1 overflow-y-auto">
            {loading && (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-emerald-600 mb-4"></div>
                <p className="text-gray-600">Chargement...</p>
              </div>
            )}

            {!loading && conversations.length === 0 && (
              <div className="text-center py-20">
                <MessageCircle size={64} className="mx-auto text-gray-300 mb-4" />
                <p className="text-xl font-bold text-gray-400 mb-2">Aucun message</p>
                <p className="text-gray-500">Commencez une conversation en contactant un vendeur !</p>
              </div>
            )}

            {conversations.map(conv => {
              const otherUserId = conv.participants?.find(id => id !== currentUser.uid);
              const otherUserName = conv.participantNames?.[otherUserId] || 'Utilisateur';
              const unreadCount = conv.unreadCount?.[currentUser.uid] || 0;

              return (
                <div
                  key={conv.id}
                  onClick={() => openConversation(conv)}
                  className="p-4 border-b hover:bg-gray-50 cursor-pointer transition flex gap-4">
                  
                  {/* Image du van */}
                  <img 
                    src={conv.vanImage || 'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=200'}
                    alt={conv.vanTitle}
                    className="w-20 h-20 object-cover rounded-lg"
                  />

                  {/* Infos conversation */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <p className="font-bold text-gray-900">{otherUserName}</p>
                        <p className="text-sm text-gray-600 truncate">{conv.vanTitle}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{formatTime(conv.lastMessageTime)}</p>
                        {unreadCount > 0 && (
                          <div className="bg-emerald-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center mt-1 ml-auto">
                            {unreadCount}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 truncate">
                      {conv.lastMessage || 'Pas de message encore'}
                    </p>
                    
                    <p className="text-sm font-semibold text-emerald-600 mt-1">
                      {formatPrice(conv.vanPrice)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Vue : Chat
  const otherUserId = selectedConversation.participants?.find(id => id !== currentUser.uid);
  const otherUserName = selectedConversation.participantNames?.[otherUserId] || 'Utilisateur';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full h-[80vh] flex flex-col relative">
        
        {/* Header du chat */}
        <div className="p-4 border-b flex items-center gap-4 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-t-2xl">
          <button 
            onClick={() => setSelectedConversation(null)}
            className="hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition">
            <ArrowLeft size={24} />
          </button>

          <img 
            src={selectedConversation.vanImage || 'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=200'}
            alt={selectedConversation.vanTitle}
            className="w-12 h-12 object-cover rounded-lg"
          />

          <div className="flex-1">
            <p className="font-bold">{otherUserName}</p>
            <p className="text-sm opacity-90 truncate">{selectedConversation.vanTitle}</p>
          </div>

          <button 
            onClick={onClose}
            className="hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition">
            <X size={24} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {messages.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-400">Commencez la conversation !</p>
            </div>
          )}

          {messages.map(msg => {
            const isMe = msg.senderId === currentUser.uid;
            
            return (
              <div key={msg.id} className={`mb-4 flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] ${isMe ? 'order-2' : 'order-1'}`}>
                  {!isMe && (
                    <p className="text-xs text-gray-500 mb-1 ml-2">{msg.senderName}</p>
                  )}
                  
                  <div className={`rounded-2xl px-4 py-2 ${
                    isMe 
                      ? 'bg-emerald-600 text-white rounded-br-none' 
                      : 'bg-white text-gray-900 rounded-bl-none shadow'
                  }`}>
                    <p className="break-words">{msg.text}</p>
                    <p className={`text-xs mt-1 ${isMe ? 'text-emerald-100' : 'text-gray-400'}`}>
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input message */}
        <form onSubmit={sendMessage} className="p-4 border-t bg-white rounded-b-2xl">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Écrivez votre message..."
              className="flex-1 px-4 py-3 border rounded-full focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-emerald-600 text-white p-3 rounded-full hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
              <Send size={24} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
