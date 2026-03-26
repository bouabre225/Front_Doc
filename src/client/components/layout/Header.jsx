import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, Menu, X, ChevronDown, LogOut, User, Settings, MessageCircle, ShoppingBag } from 'lucide-react';
import Button from '../common/Button';
import { useLang } from '../../context/LangContext';
import { useCart } from '../../context/CartContext';
import { ShoppingCart } from 'lucide-react';
import { logoutUser, getNotificationsCount, getConversations } from '../../../services/api';
import echo from '../../../echo';

const Header = () => {
  const { t, currentLang, setCurrentLang, langList } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const [langOpen, setLangOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [messageCount, setMessageCount] = useState(0);

  const langRef = useRef(null);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  // ─── Charger user depuis localStorage ───────────────────────────────────
  const loadUser = () => {
    try {
      const stored = localStorage.getItem('user');
      setCurrentUser(stored ? JSON.parse(stored) : null);
    } catch {
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    loadUser();
    window.addEventListener('storage', loadUser);
    return () => window.removeEventListener('storage', loadUser);
  }, []);

  // ─── Charger compteur notifications ─────────────────────────────────────
  useEffect(() => {
    if (!currentUser) return;
    const fetchCount = async () => {
      try {
        const data = await getNotificationsCount();
        setNotifCount(data.count ?? data.non_lues ?? 0);
      } catch { /**/ }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    
    // Charge les conversations au démarrage
    const fetchMessageCount = async () => {
      try {
        const data = await getConversations();
        const convs = Array.isArray(data) ? data : [];
        const total = convs.reduce((sum, c) => sum + (c.non_lus || 0), 0);
        setMessageCount(total);
      } catch { /**/ }
    };
    fetchMessageCount();
    
    // Écoute les nouveaux messages en temps réel via Pusher
    const channel = echo.private(`conversation.${currentUser.id}`);
    channel.listen('.nouveau.message', () => {
      // Rafraîchit les conversations pour mettre à jour les compteurs "non lus"
      fetchMessageCount();
    });
    
    return () => {
      echo.leave(`conversation.${currentUser.id}`);
    };
  }, [currentUser]);

  // ─── Scroll ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ─── Click outside ───────────────────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ─── Logout ──────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    try { await logoutUser(); } catch { /**/ }
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setUserMenuOpen(false);
    window.dispatchEvent(new Event('storage'));
    navigate('/');
  };

  // ─── Search ──────────────────────────────────────────────────────────────
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleMobileSearch = (e) => {
    e.preventDefault();
    if (mobileSearchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(mobileSearchQuery.trim())}`);
      setMobileSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  // ─── Initiales ───────────────────────────────────────────────────────────
  const getInitials = (nom) => {
    if (!nom) return '?';
    return nom.trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  };

  const menuItems = [
    { name: t.nav.home, path: '/' },
    { name: t.nav.explore, path: '/explore' },
    { name: t.nav.categories, path: '/categories' },
    { name: t.nav.contact, path: '/contact' },
  ];

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-xl shadow-lg' : 'bg-white/95 backdrop-blur-md shadow-sm'}`}>

      {/* Top Bar */}
      <div className='border-b border-gray-100'>
        <div className='container px-4 py-1 mx-auto'>
          <div className='flex items-center justify-between text-xs'>
            <span className='font-medium text-gray-600'>{t.topBar}</span>
            <div className='items-center hidden gap-4 md:flex'>
              {!currentUser && (
                <>
                  <Link to='/register?type=seller'>
                    <button className='text-gray-600 hover:text-[#1DBF73] transition-colors font-medium'>
                      {t.becomeSeller}
                    </button>
                  </Link>
                  <span className='text-gray-300'>|</span>
                </>
              )}

              {/* Language Selector */}
              <div className='relative' ref={langRef}>
                <button
                  onClick={() => setLangOpen(!langOpen)}
                  className='text-gray-600 hover:text-[#1DBF73] transition-colors font-medium flex items-center gap-1'
                >
                  <span>{t.flag}</span>
                  <span>{t.name}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${langOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {langOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className='absolute right-0 z-50 mt-2 overflow-hidden bg-white border border-gray-100 shadow-xl top-full w-44 rounded-xl'
                    >
                      <div className='py-1 overflow-y-auto max-h-72'>
                        {langList.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => { setCurrentLang(lang.code); setLangOpen(false); }}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 transition-colors
                              ${currentLang === lang.code ? 'bg-[#1DBF73]/10 text-[#1DBF73] font-semibold' : 'text-gray-700'}`}
                          >
                            <span className='text-base'>{lang.flag}</span>
                            <span>{lang.name}</span>
                            {currentLang === lang.code && <span className='ml-auto text-[#1DBF73]'>✓</span>}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className='container px-4 py-2 mx-auto'>
        <div className='flex items-center justify-between gap-3'>

          {/* Logo */}
          <Link to='/' className='flex items-center flex-shrink-0 group'>
            <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }} className='flex items-center h-10 overflow-hidden'>
              <img src='/images/docspace.png' alt='DocSpace Logo' className='object-contain h-20 w-36' />
            </motion.div>
          </Link>

          {/* Right Section */}
          <div className='flex items-center gap-1'>
            <div className='items-center hidden gap-1 md:flex'>

              {/* Cloche + Messages + Panier — visibles si connecté */}
              {currentUser && (
                <>
                  <Link to='/notifications'>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className='relative p-2 transition-all rounded-full hover:bg-gray-100 group'
                    >
                      <Bell className='w-4 h-4 text-gray-600 group-hover:text-[#1DBF73] transition-colors' />
                      {notifCount > 0 && (
                        <span className='absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-[#1DBF73] text-white rounded-full flex items-center justify-center font-bold text-[9px]'>
                          {notifCount > 9 ? '9+' : notifCount}
                        </span>
                      )}
                    </motion.button>
                  </Link>

                  <Link to='/messages'>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className='relative p-2 transition-all rounded-full hover:bg-gray-100 group'
                    >
                      <MessageCircle className='w-4 h-4 text-gray-600 group-hover:text-[#1DBF73] transition-colors' />
                      {messageCount > 0 && (
                        <span className='absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-[#09B1BA] text-white rounded-full flex items-center justify-center font-bold text-[9px]'>
                          {messageCount > 9 ? '9+' : messageCount}
                        </span>
                      )}
                    </motion.button>
                  </Link>

                  <Link to='/cart'>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className='relative p-2 transition-all rounded-full hover:bg-gray-100 group'
                    >
                      <ShoppingCart className='w-4 h-4 text-gray-600 group-hover:text-[#1DBF73] transition-colors' />
                      {totalItems > 0 && (
                        <span className='absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white rounded-full flex items-center justify-center font-bold text-[9px]'>
                          {totalItems > 9 ? '9+' : totalItems}
                        </span>
                      )}
                    </motion.button>
                  </Link>

                  <Link to='/commandes'>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className='relative p-2 transition-all rounded-full hover:bg-gray-100 group'
                    >
                      <ShoppingBag className='w-4 h-4 text-gray-600 group-hover:text-[#1DBF73] transition-colors' />
                    </motion.button>
                  </Link>
                </>
              )}

              <div className='w-px h-5 mx-1 bg-gray-300'></div>

              {currentUser ? (
                /* ── Avatar + dropdown connecté ── */
                <div className='relative' ref={userMenuRef}>
                  <motion.button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className='flex items-center gap-2 pl-1 pr-3 py-1 rounded-full hover:bg-gray-100 transition-all'
                  >
                    <div className='w-8 h-8 rounded-full bg-gradient-to-br from-[#1DBF73] to-[#09B1BA] flex items-center justify-center shrink-0'>
                      <span className='text-white font-bold text-xs'>{getInitials(currentUser.nom)}</span>
                    </div>
                    <span className='text-sm font-semibold text-gray-700 max-w-[80px] truncate'>
                      {currentUser.nom?.split(' ')[0]}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </motion.button>

                  {/* Dropdown menu */}
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className='absolute right-0 mt-2 w-56 bg-white border border-gray-100 shadow-xl rounded-2xl overflow-hidden z-50'
                      >
                        {/* Entête utilisateur */}
                        <div className='px-4 py-3 bg-gradient-to-r from-[#1DBF73]/5 to-[#09B1BA]/5 border-b border-gray-100'>
                          <div className='flex items-center gap-3'>
                            <div className='w-10 h-10 rounded-full bg-gradient-to-br from-[#1DBF73] to-[#09B1BA] flex items-center justify-center shrink-0'>
                              <span className='text-white font-bold text-sm'>{getInitials(currentUser.nom)}</span>
                            </div>
                            <div className='min-w-0'>
                              <p className='font-semibold text-gray-900 text-sm truncate'>{currentUser.nom}</p>
                              <p className='text-xs text-gray-500 truncate'>{currentUser.email}</p>
                              <span className={`inline-block mt-0.5 px-2 py-0.5 text-xs font-semibold rounded-full ${
                                currentUser.role === 'vendeur'
                                  ? 'bg-[#09B1BA]/10 text-[#09B1BA]'
                                  : currentUser.role === 'admin'
                                  ? 'bg-purple-100 text-purple-600'
                                  : 'bg-[#1DBF73]/10 text-[#1DBF73]'
                              }`}>
                                {currentUser.role === 'vendeur' ? 'Vendeur' : currentUser.role === 'admin' ? 'Admin' : 'Acheteur'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Items menu */}
                        <div className='py-1'>
                          <Link
                            to='/profile'
                            onClick={() => setUserMenuOpen(false)}
                            className='flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#1DBF73] transition-colors'
                          >
                            <User className='w-4 h-4' />
                            Mon profil
                          </Link>

                          <Link
                            to='/messages'
                            onClick={() => setUserMenuOpen(false)}
                            className='flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#1DBF73] transition-colors'
                          >
                            <MessageCircle className='w-4 h-4' />
                            Messagerie
                          </Link>

                          {currentUser.role === 'admin' && (
                            <Link
                              to='/admin'
                              onClick={() => setUserMenuOpen(false)}
                              className='flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-purple-600 transition-colors'
                            >
                              <Settings className='w-4 h-4' />
                              Dashboard admin
                            </Link>
                          )}

                          {currentUser.role === 'vendeur' && (
                            <Link
                              to='/publish-equipment'
                              onClick={() => setUserMenuOpen(false)}
                              className='flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#1DBF73] transition-colors'
                            >
                              <Settings className='w-4 h-4' />
                              Publier une annonce
                            </Link>
                          )}
                        </div>

                        <div className='border-t border-gray-100 py-1'>
                          <button
                            onClick={handleLogout}
                            className='w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors'
                          >
                            <LogOut className='w-4 h-4' />
                            Se déconnecter
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                /* ── Boutons non connecté ── */
                <>
                  <Link to='/login'><Button variant='outline' size='sm'>{t.login}</Button></Link>
                  <Link to='/register'><Button variant='primary' size='sm'>{t.register}</Button></Link>
                </>
              )}
            </div>

            {/* Burger mobile */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className='p-2 transition-all rounded-lg md:hidden hover:bg-gray-100'>
              {mobileMenuOpen ? <X className='w-5 h-5' /> : <Menu className='w-5 h-5' />}
            </button>
          </div>
        </div>

        {/* Navigation Desktop */}
        <nav className='hidden pt-2 mt-2 border-t border-gray-100 md:block'>
          <ul className='flex items-center gap-5'>
            {menuItems.map((item, index) => (
              <motion.li key={index} whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                <Link to={item.path} className='text-gray-700 hover:text-[#1DBF73] font-semibold text-xs transition-colors relative group py-1'>
                  {item.name}
                  <span className='absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] rounded-full group-hover:w-full transition-all duration-300'></span>
                </Link>
              </motion.li>
            ))}
          </ul>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className='pt-4 pb-4 mt-4 border-t border-gray-100 md:hidden'
          >
            {/* Recherche mobile */}
            <form onSubmit={handleMobileSearch} className='mb-4'>
              <div className='relative'>
                <input
                  type='text'
                  value={mobileSearchQuery}
                  onChange={(e) => setMobileSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className='w-full px-4 py-2 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1DBF73] text-sm'
                />
                <button type='submit' className='absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white rounded-lg'>
                  <Search className='w-3.5 h-3.5' />
                </button>
              </div>
            </form>

            {/* Langue mobile */}
            <div className='mb-3'>
              <p className='px-4 mb-1 text-xs font-medium text-gray-400'>Langue</p>
              <div className='grid grid-cols-3 gap-1 px-2'>
                {langList.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setCurrentLang(lang.code)}
                    className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs transition-colors
                      ${currentLang === lang.code ? 'bg-[#1DBF73]/10 text-[#1DBF73] font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    <span>{lang.flag}</span>
                    <span className='truncate'>{lang.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation mobile */}
            <ul className='mb-4 space-y-1'>
              {menuItems.map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className='block py-2 px-4 text-gray-700 hover:bg-gray-100 hover:text-[#1DBF73] rounded-lg transition-all font-medium text-sm'
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Auth mobile */}
            <div className='flex flex-col gap-2'>
              {currentUser ? (
                <>
                  {/* Infos user */}
                  <div className='flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl mb-1'>
                    <div className='w-10 h-10 rounded-full bg-gradient-to-br from-[#1DBF73] to-[#09B1BA] flex items-center justify-center shrink-0'>
                      <span className='text-white font-bold text-sm'>{getInitials(currentUser.nom)}</span>
                    </div>
                    <div>
                      <p className='font-semibold text-gray-900 text-sm'>{currentUser.nom}</p>
                      <p className='text-xs text-gray-500'>
                        {currentUser.role === 'vendeur' ? 'Vendeur' : currentUser.role === 'admin' ? 'Admin' : 'Acheteur'}
                      </p>
                    </div>
                  </div>

                  {/* Icônes rapides mobile */}
                  <div className='grid grid-cols-5 px-2 py-3 bg-gray-50 rounded-xl mb-1'>
                    <Link to='/notifications' onClick={() => setMobileMenuOpen(false)} className='flex flex-col items-center gap-1'>
                      <div className='relative p-2.5 bg-white rounded-full shadow-sm'>
                        <Bell className='w-5 h-5 text-gray-600' />
                        {notifCount > 0 && (
                          <span className='absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#1DBF73] text-white rounded-full flex items-center justify-center font-bold text-[9px]'>
                            {notifCount > 9 ? '9+' : notifCount}
                          </span>
                        )}
                      </div>
                      <span className='text-[10px] text-gray-500 font-medium'>Notifs</span>
                    </Link>

                    <Link to='/messages' onClick={() => setMobileMenuOpen(false)} className='flex flex-col items-center gap-1'>
                      <div className='relative p-2.5 bg-white rounded-full shadow-sm'>
                        <MessageCircle className='w-5 h-5 text-gray-600' />
                        {messageCount > 0 && (
                          <span className='absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#09B1BA] text-white rounded-full flex items-center justify-center font-bold text-[9px]'>
                            {messageCount > 9 ? '9+' : messageCount}
                          </span>
                        )}
                      </div>
                      <span className='text-[10px] text-gray-500 font-medium'>Messages</span>
                    </Link>

                    <Link to='/cart' onClick={() => setMobileMenuOpen(false)} className='flex flex-col items-center gap-1'>
                      <div className='relative p-2.5 bg-white rounded-full shadow-sm'>
                        <ShoppingCart className='w-5 h-5 text-gray-600' />
                        {totalItems > 0 && (
                          <span className='absolute -top-0.5 -right-0.5 w-4 h-4 bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white rounded-full flex items-center justify-center font-bold text-[9px]'>
                            {totalItems > 9 ? '9+' : totalItems}
                          </span>
                        )}
                      </div>
                      <span className='text-[10px] text-gray-500 font-medium'>Panier</span>
                    </Link>

                    <Link to='/commandes' onClick={() => setMobileMenuOpen(false)} className='flex flex-col items-center gap-1'>
                      <div className='p-2.5 bg-white rounded-full shadow-sm'>
                        <ShoppingBag className='w-5 h-5 text-gray-600' />
                      </div>
                      <span className='text-[10px] text-gray-500 font-medium'>Commandes</span>
                    </Link>

                    <Link to='/profile' onClick={() => setMobileMenuOpen(false)} className='flex flex-col items-center gap-1'>
                      <div className='p-2.5 bg-white rounded-full shadow-sm'>
                        <User className='w-5 h-5 text-gray-600' />
                      </div>
                      <span className='text-[10px] text-gray-500 font-medium'>Profil</span>
                    </Link>
                  </div>

                  {/* Vendeur : publier */}
                  {currentUser.role === 'vendeur' && (
                    <Link
                      to='/publish-equipment'
                      onClick={() => setMobileMenuOpen(false)}
                      className='w-full py-2.5 text-sm font-semibold text-center text-white bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] rounded-xl hover:shadow-lg transition-all'
                    >
                      + Publier une annonce
                    </Link>
                  )}

                  {/* Admin : dashboard */}
                  {currentUser.role === 'admin' && (
                    <Link
                      to='/admin'
                      onClick={() => setMobileMenuOpen(false)}
                      className='w-full py-2.5 text-sm font-semibold text-center text-white bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl hover:shadow-lg transition-all'
                    >
                      Dashboard Admin
                    </Link>
                  )}

                  {/* Déconnexion */}
                  <button
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    className='w-full py-2.5 text-sm font-semibold text-red-500 border-2 border-red-200 rounded-xl hover:bg-red-50 transition-all'
                  >
                    Se déconnecter
                  </button>
                </>
              ) : (
                <>
                  <Link to='/login' onClick={() => setMobileMenuOpen(false)}>
                    <Button variant='outline' size='sm' className='w-full'>{t.login}</Button>
                  </Link>
                  <Link to='/register' onClick={() => setMobileMenuOpen(false)}>
                    <Button variant='primary' size='sm' className='w-full'>{t.register}</Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </header>
  );
};

export default Header;