import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ArrowLeft, Send, Search, MoreVertical, Phone, Mail, MapPin,
  MessageCircle, Check, CheckCheck, Clock, Star, Archive,
  ChevronLeft, ChevronRight, DollarSign, Calendar, Gauge, Users,
  Circle, CheckCircle2, MessageSquare, Eye, Settings, Bell, BellOff
} from 'lucide-react';
import { 
  collection, query, where, orderBy, onSnapshot, addDoc, 
  updateDoc, doc, serverTimestamp, getDocs
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import { sanitizeText } from '../securityUtils';

// ============================================
// MESSAGING PAGE - Full Page 3 Columns
// ============================================

export default function MessagingPage({ onBack }) {
  const { currentUser } = useAuth();
  
  // State
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showDetailsPanel, setShowDetailsPanel] = useState(true);
  const [mobileView, setMobileView] = useState('list');
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

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

    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', currentUser.uid),
      orderBy('lastMessageAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const convos = snapshot.docs.map(docSnap => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            ...data,
            unreadCount: data.unreadCount?.[currentUser.uid] || 0,
            otherUserId: data.participants.find(p => p !== currentUser.uid)
          };
        });
        
        setConversations(convos);
        setLoading(false);

        // Auto-select first conversation on desktop
        if (convos.length > 0 && !selectedConversation && window.innerWidth >= 768) {
          setSelectedConversation(convos[0]);
        }
      },
      (error) => {
        console.error('Firebase error:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Load messages
  useEffect(() => {
    if (!selectedConversation) return;

    const q = query(
      collection(db, 'conversations', selectedConversation.id, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
      markAsRead();
    });

    // Typing listener
    const typingUnsubscribe = onSnapshot(
      doc(db, 'conversations', selectedConversation.id),
      (doc) => {
        const data = doc.data();
        setIsTyping(data?.typing?.[selectedConversation.otherUserId] || false);
      }
    );

    return () => {
      unsubscribe();
      typingUnsubscribe();
    };
  }, [selectedConversation]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message
  const sendMessage = async (text = newMessage) => {
    if (!text.trim() || !selectedConversation) return;

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
    if (!selectedConversation) return;
    try {
      await updateDoc(doc(db, 'conversations', selectedConversation.id), {
        [`unreadCount.${currentUser.uid}`]: 0
      });
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // Handle typing
  const handleTyping = useCallback(() => {
    if (!selectedConversation) return;

    updateDoc(doc(db, 'conversations', selectedConversation.id), {
      [`typing.${currentUser.uid}`]: true
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
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
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
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
          
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all">
              <Settings size={20} />
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
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  activeFilter === 'all' 
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    activeFilter === status.id 
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
                  className={`p-4 border-b border-gray-100 cursor-pointer transition-all hover:bg-gray-50 ${
                    selectedConversation?.id === conv.id ? 'bg-emerald-50 border-l-4 border-l-emerald-500' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    {/* Van Image */}
                    <div className="relative flex-shrink-0">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-200">
                        {conv.van?.imageUrl ? (
                          <img src={conv.van.imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-400 to-teal-500">
                            <span className="text-white text-xl">🚐</span>
                          </div>
                        )}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                        statusOptions.find(s => s.id === conv.status)?.color || 'bg-gray-400'
                      }`}></div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm truncate">
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
                            <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                            <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                            <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                          </span>
                          typing...
                        </span>
                      ) : (
                        <><span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Online</>
                      )}
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
                        
                        <div className={`px-4 py-2.5 rounded-2xl ${
                          isOwn 
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-md' 
                            : 'bg-white text-gray-800 shadow-sm rounded-bl-md'
                        }`}>
                          <p className="text-sm leading-relaxed">{msg.text}</p>
                          <div className={`flex items-center justify-end gap-1 mt-1 ${isOwn ? 'text-white/70' : 'text-gray-400'}`}>
                            <span className="text-[10px]">{formatTime(msg.createdAt)}</span>
                            {isOwn && (msg.read ? <CheckCheck size={14} className="text-blue-300" /> : <Check size={14} />)}
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
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200 bg-white">
                {selectedConversation.van && (
                  <button
                    onClick={() => {
                      const offer = Math.round(selectedConversation.van.price * 0.9);
                      setNewMessage(`Hi! I'd like to make an offer of $${offer.toLocaleString()} for the ${selectedConversation.van.title}. Would you consider this?`);
                      inputRef.current?.focus();
                    }}
                    className="w-full mb-3 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium text-sm hover:from-amber-600 hover:to-orange-600 transition-all flex items-center justify-center gap-2"
                  >
                    <DollarSign size={18} />
                    Make an Offer
                  </button>
                )}
                
                <div className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    value={newMessage}
                    onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }}}
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
                  <div className="aspect-video rounded-xl overflow-hidden mb-4 shadow-lg">
                    <img src={selectedConversation.van.imageUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                  
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{selectedConversation.van.title}</h3>
                  <p className="text-2xl font-black text-emerald-600 mb-4">
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
                      {selectedConversation.participantEmails?.[selectedConversation.otherUserId] || 'No email'}
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
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedConversation.status === 'new' ? 'bg-blue-100 text-blue-700' :
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
              <button className="w-full py-2.5 bg-emerald-600 text-white rounded-xl font-medium text-sm hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
                <Eye size={18} /> View Listing
              </button>
              <button className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
                <Archive size={18} /> Archive
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}