import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Search, ArrowLeft, Circle,
  MessageCircle, Package, CheckCheck, Check, X
} from 'lucide-react';
import { getConversations, getConversation, sendMessage, getImageUrl } from '../../../services/api';
import websocket from '../../../services/websocket';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
  if (diff < 60)     return "À l'instant";
  if (diff < 3600)   return `${Math.floor(diff / 60)}min`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}j`;
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
};

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

const formatDateSeparator = (dateStr) => {
  const d    = new Date(dateStr);
  const diff = Math.floor((new Date() - d) / 86400000);
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return 'Hier';
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
};

const isSameDay = (a, b) =>
  new Date(a).toDateString() === new Date(b).toDateString();

// ─── Avatar ───────────────────────────────────────────────────────────────────

const Avatar = ({ name, avatar, size = 'md', online = false }) => {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' };
  const initials = name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';
  return (
    <div className='relative shrink-0'>
      {avatar ? (
        <img src={getImageUrl(avatar)} alt={name} className={`${sizes[size]} rounded-full object-cover ring-2 ring-white`} />
      ) : (
        <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-[#1DBF73] to-[#09B1BA] flex items-center justify-center font-bold text-white`}>
          {initials}
        </div>
      )}
      {online && <span className='absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full ring-2 ring-white' />}
    </div>
  );
};

// ─── Composant principal ──────────────────────────────────────────────────────

const Messages = () => {
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const initUserId     = searchParams.get('userId') || null;
  const initAnnonceId = searchParams.get('annonceId') || null;
  const initVendeurNom = searchParams.get('vendeurNom') || 'Vendeur';

  const currentUser    = JSON.parse(localStorage.getItem('user') || '{}');

  const [conversations,  setConversations]  = useState([]);
  const [selectedConv,   setSelectedConv]   = useState(null);
  const [messages,       setMessages]       = useState([]);
  const [input,          setInput]          = useState('');
  const [search,         setSearch]         = useState('');
  const [loadingConvs,   setLoadingConvs]   = useState(true);
  const [loadingMsgs,    setLoadingMsgs]    = useState(false);
  const [sending,        setSending]        = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [showScrollBtn,  setShowScrollBtn]  = useState(false);
  const selectedConvRef = useRef(null);

  const bottomRef   = useRef(null);
  const inputRef    = useRef(null);
  const messagesRef = useRef(null);
  //const pollRef     = useRef(null);

  const fetchConversations = useCallback(async () => {
    try {
      const data = await getConversations();
      setConversations(Array.isArray(data) ? data : []);
    } catch {
        //
    }
    finally { setLoadingConvs(false); }
  }, []);

  useEffect(() => {
    if (!localStorage.getItem('auth_token')) { navigate('/login'); return; }
    fetchConversations();
  }, [fetchConversations, navigate]);

// Remplace cet useEffect dans Messages.jsx
  useEffect(() => {
    if (!initUserId || loadingConvs) return;

    const conv = conversations.find(c => c.id === initUserId);
    if (conv) {
      openConversation(conv); // ← openConversation sync déjà la ref
    } else {
      const newConv = {
        id:              initUserId,
        name:            initVendeurNom,
        avatar:          null,
        non_lus:         0,
        dernier_message: null,
      };
      setSelectedConv(newConv);
      selectedConvRef.current = newConv; // ← sync la ref ici aussi
      setMobileShowChat(true);
      setMessages([]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [initUserId, loadingConvs]); // ← dépend de loadingConvs pas conversations

  const fetchMessages = useCallback(async (userId) => {
    setLoadingMsgs(true);
    try {
      const data = await getConversation(userId);
      setMessages(Array.isArray(data) ? data : []);
    } catch { setMessages([]); }
    finally { setLoadingMsgs(false); }
  }, []);

  // Remplace ta fonction openConversation par celle-ci
  const openConversation = (conv) => {
    setSelectedConv(conv);
    selectedConvRef.current = conv; // ← sync la ref
    setMobileShowChat(true);
    fetchMessages(conv.id);
    setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, non_lus: 0 } : c));
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  //useEffect(() => {
  //  if (!selectedConv) return;
   // pollRef.current = setInterval(() => {
   //   fetchMessages(selectedConv.id);
   //   fetchConversations();
   // }, 2000);
   // return () => clearInterval(pollRef.current);
  //}, [selectedConv, fetchMessages, fetchConversations]);

  // ✅ WebSocket listener using native connection
  useEffect(() => {
    if (!currentUser?.id) return;

    const setupWebSocket = async () => {
      try {
        const channelName = `private-conversation.${currentUser.id}`;
        console.log('[Messages] Connecting WebSocket and subscribing to:', channelName);
        
        await websocket.subscribe(channelName);
        
        // Listen for new messages
        const unsubscribe = websocket.listen(
          channelName,
          'nouveau.message',
          (eventData) => {
            console.log('[WS] Message received ✅:', eventData);
            
            const e = eventData;
            const conv = selectedConvRef.current;

            if (conv && String(e.expediteur_id) === String(conv.id)) {
              console.log('[WS] Message added to chat');
              setMessages(prev => {
                if (prev.find(m => m.id === e.id)) return prev;
                return [...prev, e];
              });
            }

            // Update unread count
            setConversations(prev => 
              prev.map(c => {
                if (String(c.id) === String(e.expediteur_id)) {
                  console.log('[WS] Unread count updated for:', c.id);
                  return { ...c, non_lus: (c.non_lus || 0) + 1 };
                }
                return c;
              })
            );
          }
        );

        return unsubscribe;
      } catch (error) {
        console.error('[Messages] WebSocket error:', error);
      }
    };

    let unsubscribe;
    setupWebSocket().then((unsub) => {
      unsubscribe = unsub;
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser?.id]); // ← SEULEMENT currentUser.id, jamais selectedConv

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleScroll = () => {
    const el = messagesRef.current;
    if (!el) return;
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 200);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !selectedConv || sending) return;

    const optimistic = {
      id: `opt-${Date.now()}`,
      expediteur_id: currentUser.id,
      recepteur_id:  selectedConv.id,
      contenu:       text,
      lu:            false,
      created_at:    new Date().toISOString(),
      _optimistic:   true,
    };

    setMessages(prev => [...prev, optimistic]);
    setInput('');
    setSending(true);

    try {
      const response = await sendMessage({
        recepteur_id: selectedConv.id,
        contenu:      text,
        annonce_id:   initAnnonceId || undefined,
      });
      
      console.log('[sendMessage] Response:', response);
      
      // Remplace le message optimiste par le vrai message du serveur
      const realMessage = response?.data || { 
        ...optimistic, 
        id: response?.id || optimistic.id,
        _optimistic: false 
      };
      
      console.log('[sendMessage] Real message:', realMessage);
      
      setMessages(prev => 
        prev.map(m => m.id === optimistic.id ? realMessage : m)
      );
    } catch (error) {
      console.error('[sendMessage] Error:', error);
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const filteredConvs = conversations.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const totalUnread = conversations.reduce((sum, c) => sum + (c.non_lus || 0), 0);

  return (
    <div className='flex h-screen bg-gray-50 overflow-hidden'>

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <div className={`
        flex flex-col w-full md:w-80 lg:w-96 bg-white border-r border-gray-100 shrink-0
        ${mobileShowChat ? 'hidden md:flex' : 'flex'}
      `}>
        {/* Top */}
        <div className='flex items-center gap-3 px-4 py-4 border-b border-gray-100'>
          <button
            onClick={() => navigate(-1)}
            className='p-2 hover:bg-gray-100 rounded-xl transition-colors shrink-0'
          >
            <ArrowLeft className='w-5 h-5 text-gray-600' />
          </button>
          <div className='flex items-center gap-2 flex-1 min-w-0'>
            <h1 className='text-lg font-bold text-gray-900'>Messages</h1>
            {totalUnread > 0 && (
              <span className='px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white rounded-full shrink-0'>
                {totalUnread}
              </span>
            )}
          </div>
        </div>

        {/* Search */}
        <div className='px-4 py-3'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
            <input
              type='text'
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder='Rechercher...'
              className='w-full pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 transition-all'
            />
            {search && (
              <button onClick={() => setSearch('')} className='absolute right-3 top-1/2 -translate-y-1/2'>
                <X className='w-3.5 h-3.5 text-gray-400' />
              </button>
            )}
          </div>
        </div>

        {/* Conversations */}
        <div className='flex-1 overflow-y-auto'>
          {loadingConvs ? (
            <div className='p-4 space-y-3'>
              {[1,2,3,4].map(i => (
                <div key={i} className='flex items-center gap-3 p-3 animate-pulse'>
                  <div className='w-10 h-10 bg-gray-200 rounded-full shrink-0' />
                  <div className='flex-1 space-y-2'>
                    <div className='h-3 bg-gray-200 rounded w-3/4' />
                    <div className='h-2.5 bg-gray-100 rounded w-1/2' />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConvs.length === 0 ? (
            <div className='flex flex-col items-center justify-center h-full p-8 text-center'>
              <div className='w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-3'>
                <MessageCircle className='w-7 h-7 text-gray-300' />
              </div>
              <p className='text-sm font-semibold text-gray-500'>
                {search ? 'Aucun résultat' : 'Aucune conversation'}
              </p>
              <p className='text-xs text-gray-400 mt-1'>
                {search ? 'Essayez un autre terme' : 'Contactez un vendeur depuis une annonce'}
              </p>
            </div>
          ) : (
            <div className='py-1'>
              {filteredConvs.map((conv) => {
                const isSelected = selectedConv?.id === conv.id;
                return (
                  <motion.button
                    key={conv.id}
                    onClick={() => openConversation(conv)}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#1DBF73]/10 to-[#09B1BA]/5 border-r-2 border-[#1DBF73]'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <Avatar name={conv.name} avatar={conv.avatar} online />
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center justify-between mb-0.5'>
                        <span className={`text-sm truncate ${conv.non_lus > 0 ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                          {conv.name}
                        </span>
                        <span className='text-xs text-gray-400 shrink-0 ml-2'>{timeAgo(conv.dernier_message)}</span>
                      </div>
                      <div className='flex items-center justify-between'>
                        <span className='text-xs text-gray-400 truncate'>{conv.email}</span>
                        {conv.non_lus > 0 && (
                          <span className='ml-2 min-w-[18px] h-[18px] px-1 bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0'>
                            {conv.non_lus > 9 ? '9+' : conv.non_lus}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Zone chat ────────────────────────────────────────────────────── */}
      <div className={`
        flex flex-col flex-1 overflow-hidden relative
        ${!mobileShowChat ? 'hidden md:flex' : 'flex'}
      `}>
        {!selectedConv ? (
          <div className='flex flex-col items-center justify-center flex-1 p-8 text-center'>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className='w-20 h-20 bg-gradient-to-br from-[#1DBF73]/10 to-[#09B1BA]/10 rounded-3xl flex items-center justify-center mb-5'
            >
              <MessageCircle className='w-10 h-10 text-[#1DBF73]' />
            </motion.div>
            <h2 className='text-xl font-bold text-gray-800 mb-2'>Vos messages</h2>
            <p className='text-sm text-gray-500 max-w-xs'>
              Sélectionnez une conversation ou contactez un vendeur depuis une annonce.
            </p>
          </div>
        ) : (
          <>
            {/* Header chat */}
            <div className='flex items-center gap-3 px-4 py-3.5 bg-white border-b border-gray-100 shadow-sm shrink-0'>
              {/* Mobile: retour liste */}
              <button
                onClick={() => { setMobileShowChat(false); setSelectedConv(null); }}
                className='md:hidden p-1.5 hover:bg-gray-100 rounded-lg transition-colors'
              >
                <ArrowLeft className='w-5 h-5 text-gray-600' />
              </button>
              {/* Desktop: retour page précédente */}
              <button
                onClick={() => navigate(-1)}
                className='hidden md:flex p-1.5 hover:bg-gray-100 rounded-lg transition-colors'
              >
                <ArrowLeft className='w-5 h-5 text-gray-500' />
              </button>

              <Avatar name={selectedConv.name} avatar={selectedConv.avatar} online />
              <div className='flex-1 min-w-0'>
                <p className='font-bold text-gray-900 truncate'>{selectedConv.name}</p>
                <div className='flex items-center gap-1.5'>
                  <Circle className='w-2 h-2 fill-green-400 text-green-400' />
                  <span className='text-xs text-green-500 font-medium'>En ligne</span>
                </div>
              </div>
            </div>

            {/* Messages area */}
            <div
              ref={messagesRef}
              onScroll={handleScroll}
              className='flex-1 overflow-y-auto px-4 py-5 bg-gray-50'
            >
              {loadingMsgs ? (
                <div className='flex items-center justify-center py-20'>
                  <div className='w-8 h-8 border-2 border-[#1DBF73] rounded-full border-t-transparent animate-spin' />
                </div>
              ) : messages.length === 0 ? (
                <div className='flex flex-col items-center justify-center py-20 text-center'>
                  <div className='w-12 h-12 bg-white rounded-2xl shadow flex items-center justify-center mb-3'>
                    <MessageCircle className='w-6 h-6 text-gray-300' />
                  </div>
                  <p className='text-sm text-gray-500 font-medium'>Démarrez la conversation</p>
                  <p className='text-xs text-gray-400 mt-1'>Envoyez votre premier message à {selectedConv.name}</p>
                </div>
              ) : (
                <div className='space-y-0.5'>
                  {messages.map((msg, idx) => {
                    const isMine     = msg.expediteur_id === currentUser.id;
                    const prevMsg    = messages[idx - 1];
                    const showDate   = !prevMsg || !isSameDay(prevMsg.created_at || new Date(), msg.created_at || new Date());
                    const showAvatar = !isMine && (!messages[idx + 1] || messages[idx + 1]?.expediteur_id !== msg.expediteur_id);
                    const isGroup    = idx > 0 && messages[idx - 1]?.expediteur_id === msg.expediteur_id && !showDate;

                    return (
                      <React.Fragment key={msg.id}>
                        {showDate && msg.created_at && (
                          <div className='flex items-center gap-3 py-3'>
                            <div className='flex-1 h-px bg-gray-200' />
                            <span className='text-[11px] text-gray-400 font-medium px-3 py-1 bg-white rounded-full border border-gray-200'>
                              {formatDateSeparator(msg.created_at)}
                            </span>
                            <div className='flex-1 h-px bg-gray-200' />
                          </div>
                        )}

                        {msg.annonce && idx === 0 && (
                          <div className='flex justify-center mb-3'>
                            <div className='flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm max-w-xs'>
                              <Package className='w-4 h-4 text-[#1DBF73] shrink-0' />
                              <div className='min-w-0'>
                                <p className='text-xs text-gray-400'>À propos de</p>
                                <p className='text-sm font-semibold text-gray-700 truncate'>{msg.annonce?.titre}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        <motion.div
                          initial={{ opacity: 0, y: 6, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.15 }}
                          className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'} ${isGroup ? 'mt-0.5' : 'mt-3'}`}
                        >
                          {!isMine && (
                            <div className='w-8 shrink-0'>
                              {showAvatar && <Avatar name={selectedConv.name} avatar={selectedConv.avatar} size='sm' />}
                            </div>
                          )}
                          <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[70%]`}>
                            <div className={`
                              px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm
                              ${isMine
                                ? 'bg-gradient-to-br from-[#1DBF73] to-[#09B1BA] text-white rounded-br-sm'
                                : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
                              }
                              ${msg._optimistic ? 'opacity-60' : ''}
                            `}>
                              {msg.contenu}
                            </div>
                            <div className={`flex items-center gap-1 mt-1 ${isMine ? 'flex-row-reverse' : ''}`}>
                              <span className='text-[10px] text-gray-400'>{formatTime(msg.created_at)}</span>
                              {isMine && (
                                msg.lu
                                  ? <CheckCheck className='w-3 h-3 text-[#1DBF73]' />
                                  : <Check className='w-3 h-3 text-gray-400' />
                              )}
                            </div>
                          </div>
                        </motion.div>
                      </React.Fragment>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>
              )}
            </div>

            {/* Scroll to bottom btn */}
            <AnimatePresence>
              {showScrollBtn && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' })}
                  className='absolute bottom-24 right-5 w-9 h-9 bg-white shadow-lg border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors'
                >
                  <ArrowLeft className='w-4 h-4 text-gray-600 -rotate-90' />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Input zone */}
            <div className='px-4 py-3.5 bg-white border-t border-gray-100 shrink-0'>
              <div className='flex items-end gap-3'>
                <div className='flex-1'>
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Message à ${selectedConv.name}...`}
                    rows={1}
                    style={{ resize: 'none' }}
                    className='w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 transition-all max-h-32 overflow-y-auto'
                    onInput={e => {
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
                    }}
                  />
                </div>
                <motion.button
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className='w-11 h-11 bg-gradient-to-br from-[#1DBF73] to-[#09B1BA] rounded-2xl flex items-center justify-center shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0'
                >
                  {sending
                    ? <div className='w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin' />
                    : <Send className='w-4 h-4 text-white' />
                  }
                </motion.button>
              </div>
              <p className='text-[10px] text-gray-400 mt-1.5 text-center'>
                Entrée pour envoyer · Maj+Entrée pour nouvelle ligne
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Messages;