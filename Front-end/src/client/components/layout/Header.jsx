import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingCart, Heart, Bell, Menu, X, User, ChevronDown } from 'lucide-react';
import Button from '../common/Button';
import { useLang } from '../../context/LangContext';

const Header = () => {
  const { t, currentLang, setCurrentLang, langList } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false);
      }
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

  const menuItems = [
    { name: t.nav.home, path: '/' },
    { name: t.nav.explore, path: '/explore' },
    { name: t.nav.categories, path: '/categories' },
    { name: t.nav.howItWorks, path: '/how-it-works' },
    { name: t.nav.contact, path: '/contact' }
  ];

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-xl shadow-lg' : 'bg-white/95 backdrop-blur-md shadow-sm'}`}>
      
      {/* Top Bar */}
      <div className='border-b border-gray-100'>
        <div className='container px-4 py-1 mx-auto'>
          <div className='flex items-center justify-between text-xs'>
            <span className='font-medium text-gray-600'>{t.topBar}</span>
            <div className='items-center hidden gap-4 md:flex'>
                    <Link to="/register?type=seller">
                      <button className='text-gray-600 hover:text-[#1DBF73] transition-colors font-medium'>
                        {t.becomeSeller}
                      </button>
                    </Link>
              <span className='text-gray-300'>|</span>

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
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className='flex items-center h-10 overflow-hidden'
            >
              <img 
                src='\images\docspace.png' 
                alt='DocSpace Logo'
                className='object-contain h-20 w-36'
              />
            </motion.div>
          </Link>

          {/* Search Bar - Desktop */}
          <div className='flex-1 hidden max-w-xl md:flex'>
            <form onSubmit={handleSearch} className='relative w-full'>
              <input
                type='text'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, false)}
                placeholder={t.searchPlaceholder}
                className='w-full px-4 py-2 pr-28 border border-gray-200 rounded-full 
                  focus:outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20
                  bg-gray-50 hover:bg-white text-sm transition-all duration-300'
              />
              <motion.button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 
                  origin-center px-3 py-1.5
                  bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] 
                  text-white rounded-full
                  transition-all flex items-center gap-1.5 
                  font-medium text-xs"
              >
                <Search className='w-3.5 h-3.5' />
                <span>{t.search}</span>
              </motion.button>
            </form>
          </div>

          {/* Right Section */}
          <div className='flex items-center gap-1'>
            <div className='items-center hidden gap-1 md:flex'>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className='relative p-2 transition-all rounded-full hover:bg-gray-100 group'>
                <Heart className='w-4 h-4 text-gray-600 transition-colors group-hover:text-red-500' />
                <span className='absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-[9px]'>3</span>
              </motion.button>

              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className='relative p-2 transition-all rounded-full hover:bg-gray-100 group'>
                <Bell className='w-4 h-4 text-gray-600 group-hover:text-[#1DBF73] transition-colors' />
                <span className='absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-[#1DBF73] text-white rounded-full flex items-center justify-center font-bold text-[9px]'>5</span>
              </motion.button>

              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className='relative p-2 transition-all rounded-full hover:bg-gray-100 group'>
                <ShoppingCart className='w-4 h-4 text-gray-600 group-hover:text-[#09B1BA] transition-colors' />
                <span className='absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-[#09B1BA] text-white rounded-full flex items-center justify-center font-bold text-[9px]'>2</span>
              </motion.button>

              <div className='w-px h-5 mx-1 bg-gray-300'></div>

              <Link to="/login"><Button variant='outline' size='sm'>{t.login}</Button></Link>
              <Link to="/r
              register"><Button variant='primary' size='sm'>{t.register}</Button></Link>

              <Link to="/profile">
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className='relative p-2 transition-all rounded-full hover:bg-gray-100 group'>
                  <User className='w-4 h-4 text-gray-600 group-hover:text-[#1DBF73] transition-colors' />
                </motion.button>
              </Link>
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className='p-2 transition-all rounded-lg md:hidden hover:bg-gray-100'>
              {mobileMenuOpen ? <X className='w-5 h-5' /> : <Menu className='w-5 h-5' />}
            </button>
          </div>
        </div>

        {/* Navigation Menu - Desktop */}
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
            <form onSubmit={handleMobileSearch} className='mb-4'>
              <div className='relative'>
                <input
                  type='text'
                  value={mobileSearchQuery}
                  onChange={(e) => setMobileSearchQuery(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, true)}
                  placeholder={t.searchPlaceholder}
                  className='w-full px-4 py-2 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1DBF73] text-sm'
                />
                <button type='submit' className='absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white rounded-lg'>
                  <Search className='w-3.5 h-3.5' />
                </button>
              </div>
            </form>

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

            <ul className='mb-4 space-y-1'>
              {menuItems.map((item, index) => (
                <li key={index}>
                  <Link to={item.path} onClick={() => setMobileMenuOpen(false)} className='block py-2 px-4 text-gray-700 hover:bg-gray-100 hover:text-[#1DBF73] rounded-lg transition-all font-medium text-sm'>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>

            <div className='flex flex-col gap-2'>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}><Button variant='outline' size='sm' className='w-full'>{t.login}</Button></Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}><Button variant='primary' size='sm' className='w-full'>{t.register}</Button></Link>
              <Link to="/profile" onClick={() => setMobileMenuOpen(false)}><Button variant='outline' size='sm' className='w-full'>{t.profile}</Button></Link>
            </div>
          </motion.div>
        )}
      </div>
    </header>
  );
};

export default Header;