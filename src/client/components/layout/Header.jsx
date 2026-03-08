import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingCart, Heart, Bell, Menu, X, User, ChevronDown, LogOut, Package } from 'lucide-react';
import Button from '../common/Button';
import { useLang } from '../../context/LangContext';

const API_URL = 'http://localhost:8000/api';

const Header = () => {
  const { t, currentLang, setCurrentLang, langList } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const [langOpen, setLangOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  const langRef = useRef(null);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  // Charger user depuis localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('auth_token');
    if (userData && token) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Écouter les changements de localStorage (login/logout dans d'autres pages)
  useEffect(() => {
    const handleStorage = () => {
      const userData = localStorage.getItem('user');
      const token = localStorage.getItem('auth_token');
      if (userData && token) {
        setUser(JSON.parse(userData));
      } else {
        setUser(null);
      }
    };
    window.addEventListener('storage', handleStorage);
    // Vérifier aussi à chaque focus de la page
    window.addEventListener('focus', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleStorage);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleKeyPress = (e, isMobile = false) => {
    if (e.key === 'Enter') {
      isMobile ? handleMobileSearch(e) : handleSearch(e);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      await fetch(`${API_URL}/logout`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      setUser(null);
      setUserMenuOpen(false);
      navigate('/');
    }
  };

  const menuItems = [
    { name: t.nav.home, path: '/' },
    { name: t.nav.explore, path: '/explore' },
    { name: t.nav.categories, path: '/categories' },
  ];

  const isSeller = user?.role === 'vendeur';

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-xl shadow-lg' : 'bg-white/95 backdrop-blur-md shadow-sm'}`}>

      {/* Top Bar */}
      <div className='border-b border-gray-100'>
        <div className='container px-4 py-1 mx-auto'>
          <div className='flex items-center justify-between text-xs'>
            <span className='font-medium text-gray-600'>{t.topBar}</span>
            <div className='items-center hidden gap-4 md:flex'>
              <Link to='/register?type=seller'>
                <button className='text-gray-600 hover:text-[#1DBF73] transition-colors font-medium'>
                  {t.becomeSeller}
                </button>
              </Link>
              <span className='text-gray-300'>|</span>

              {/* Language Selector */}
              <div className='relative' ref={langRef}>
                <button onClick={() => setLangOpen(!langOpen)}
                  className='text-gray-600 hover:text-[#1DBF73] transition-colors font-medium flex items-center gap-1'>
                  <span>{t.flag}</span>
                  <span>{t.name}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${langOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {langOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className='absolute right-0 z-50 mt-2 overflow-hidden bg-white border border-gray-100 shadow-xl top-full w-44 rounded-xl'>
                      <div className='py-1 overflow-y-auto max-h-72'>
                        {langList.map((lang) => (
                          <button key={lang.code} onClick={() => { setCurrentLang(lang.code); setLangOpen(false); }}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 transition-colors ${
                              currentLang === lang.code ? 'bg-[#1DBF73]/10 text-[#1DBF73] font-semibold' : 'text-gray-700'
                            }`}>
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
            <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}
              className='flex items-center h-10 overflow-hidden'>
              <img src='/images/docspace.png' alt='DocSpace Logo' className='object-contain h-20 w-36' />
            </motion.div>
          </Link>

          {/* Search Bar - Desktop */}
          <div className='flex-1 hidden max-w-xl md:flex'>
            <form onSubmit={handleSearch} className='relative w-full'>
              <input type='text' value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, false)}
                placeholder={t.searchPlaceholder}
                className='w-full px-4 py-2 pr-28 border border-gray-200 rounded-full focus:outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 bg-gray-50 hover:bg-white text-sm transition-all duration-300'
              />
              <motion.button type='submit'
                className='absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white rounded-full flex items-center gap-1.5 font-medium text-xs'>
                <Search className='w-3.5 h-3.5' />
                <span>{t.search}</span>
              </motion.button>
            </form>
          </div>

          {/* Right Section */}
          <div className='flex items-center gap-1'>
            <div className='items-center hidden gap-1 md:flex'>

              {/* Notifications & icônes — visibles seulement si connecté */}
              {user && (
                <>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    className='relative p-2 rounded-full hover:bg-gray-100 group'>
                    <Heart className='w-4 h-4 text-gray-600 transition-colors group-hover:text-red-500' />
                  </motion.button>

                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    className='relative p-2 rounded-full hover:bg-gray-100 group'>
                    <Bell className='w-4 h-4 text-gray-600 group-hover:text-[#1DBF73] transition-colors' />
                  </motion.button>

                  {/* Publier annonce (vendeur) */}
                  {isSeller && (
                    <Link to='/publish-equipment'>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        className='flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white rounded-full text-xs font-semibold'>
                        <Package className='w-3.5 h-3.5' />
                        Publier
                      </motion.button>
                    </Link>
                  )}

                  <div className='w-px h-5 mx-1 bg-gray-300' />
                </>
              )}

              {/* Si NON connecté : boutons Login / Register */}
              {!user ? (
                <>
                  <Link to='/login'><Button variant='outline' size='sm'>{t.login}</Button></Link>
                  <Link to='/register'><Button variant='primary' size='sm'>{t.register}</Button></Link>
                </>
              ) : (
                /* Si connecté : menu utilisateur */
                <div className='relative' ref={userMenuRef}>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className='flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-all'>
                    <div className='flex items-center justify-center w-6 h-6 bg-gradient-to-br from-[#1DBF73] to-[#09B1BA] rounded-full'>
                      <User className='w-3.5 h-3.5 text-white' />
                    </div>
                    <span className='text-xs font-semibold text-gray-700 max-w-[80px] truncate'>
                      {user.nom || user.name || 'Mon compte'}
                    </span>
                    <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </motion.button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className='absolute right-0 z-50 w-48 mt-2 overflow-hidden bg-white border border-gray-100 shadow-xl top-full rounded-xl'>
                        <div className='px-4 py-3 border-b border-gray-100'>
                          <p className='text-xs font-bold text-gray-800 truncate'>{user.nom || user.name}</p>
                          <p className='text-xs text-gray-500 truncate'>{user.email}</p>
                          <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded-full ${
                            isSeller ? 'bg-[#1DBF73]/10 text-[#1DBF73]' : 'bg-[#09B1BA]/10 text-[#09B1BA]'
                          }`}>
                            {isSeller ? 'Vendeur' : 'Acheteur'}
                          </span>
                        </div>
                        <div className='py-1'>
                          <Link to='/profile' onClick={() => setUserMenuOpen(false)}
                            className='flex items-center gap-2 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50'>
                            <User className='w-4 h-4 text-[#1DBF73]' />
                            Mon profil
                          </Link>
                          {isSeller && (
                            <Link to='/publish-equipment' onClick={() => setUserMenuOpen(false)}
                              className='flex items-center gap-2 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50'>
                              <Package className='w-4 h-4 text-[#09B1BA]' />
                              Publier une annonce
                            </Link>
                          )}
                          <button onClick={handleLogout}
                            className='flex items-center w-full gap-2 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50'>
                            <LogOut className='w-4 h-4' />
                            Déconnexion
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className='p-2 transition-all rounded-lg md:hidden hover:bg-gray-100'>
              {mobileMenuOpen ? <X className='w-5 h-5' /> : <Menu className='w-5 h-5' />}
            </button>
          </div>
        </div>

        {/* Navigation - Desktop */}
        <nav className='hidden pt-2 mt-2 border-t border-gray-100 md:block'>
          <ul className='flex items-center gap-5'>
            {menuItems.map((item, index) => (
              <motion.li key={index} whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                <Link to={item.path}
                  className='text-gray-700 hover:text-[#1DBF73] font-semibold text-xs transition-colors relative group py-1'>
                  {item.name}
                  <span className='absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] rounded-full group-hover:w-full transition-all duration-300' />
                </Link>
              </motion.li>
            ))}
          </ul>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className='pt-4 pb-4 mt-4 border-t border-gray-100 md:hidden'>

            {/* Search mobile */}
            <form onSubmit={handleMobileSearch} className='mb-4'>
              <div className='relative'>
                <input type='text' value={mobileSearchQuery}
                  onChange={(e) => setMobileSearchQuery(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, true)}
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
                  <button key={lang.code} onClick={() => setCurrentLang(lang.code)}
                    className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs transition-colors ${
                      currentLang === lang.code ? 'bg-[#1DBF73]/10 text-[#1DBF73] font-semibold' : 'text-gray-600 hover:bg-gray-100'
                    }`}>
                    <span>{lang.flag}</span>
                    <span className='truncate'>{lang.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Nav links mobile */}
            <ul className='mb-4 space-y-1'>
              {menuItems.map((item, index) => (
                <li key={index}>
                  <Link to={item.path} onClick={() => setMobileMenuOpen(false)}
                    className='block py-2 px-4 text-gray-700 hover:bg-gray-100 hover:text-[#1DBF73] rounded-lg transition-all font-medium text-sm'>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Auth mobile */}
            <div className='flex flex-col gap-2'>
              {!user ? (
                <>
                  <Link to='/login' onClick={() => setMobileMenuOpen(false)}>
                    <Button variant='outline' size='sm' className='w-full'>{t.login}</Button>
                  </Link>
                  <Link to='/register' onClick={() => setMobileMenuOpen(false)}>
                    <Button variant='primary' size='sm' className='w-full'>{t.register}</Button>
                  </Link>
                </>
              ) : (
                <>
                  {/* Info user mobile */}
                  <div className='flex items-center gap-3 px-4 py-3 mb-1 bg-gray-50 rounded-xl'>
                    <div className='flex items-center justify-center w-10 h-10 bg-gradient-to-br from-[#1DBF73] to-[#09B1BA] rounded-full'>
                      <User className='w-5 h-5 text-white' />
                    </div>
                    <div>
                      <p className='text-sm font-bold text-gray-800'>{user.nom || user.name}</p>
                      <p className='text-xs text-gray-500'>{isSeller ? 'Vendeur' : 'Acheteur'}</p>
                    </div>
                  </div>
                  <Link to='/profile' onClick={() => setMobileMenuOpen(false)}>
                    <Button variant='outline' size='sm' className='w-full'>{t.profile || 'Mon profil'}</Button>
                  </Link>
                  {isSeller && (
                    <Link to='/publish-equipment' onClick={() => setMobileMenuOpen(false)}>
                      <Button variant='primary' size='sm' className='w-full'>Publier une annonce</Button>
                    </Link>
                  )}
                  <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    className='w-full py-2 text-sm font-semibold text-red-600 transition-all bg-red-50 rounded-xl hover:bg-red-100'>
                    Déconnexion
                  </button>
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