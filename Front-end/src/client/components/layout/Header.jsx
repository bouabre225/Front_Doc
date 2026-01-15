    import React, { useState, useEffect } from 'react';
    import { Link, useNavigate } from 'react-router-dom';
    import { motion } from 'framer-motion';
    import { Search, ShoppingCart, Heart, Bell, Menu, X, Stethoscope } from 'lucide-react';
    import Button from '../common/Button';

    const Header = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    // Détecte le scroll
    useEffect(() => {
        const handleScroll = () => {
        setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const menuItems = [
        { name: 'Accueil', path: '/' },
        { name: 'Explorer', path: '/explore' },
        { name: 'Catégories', path: '/categories' },
        { name: 'Comment ça marche', path: '/how-it-works' },
        { name: 'Contact', path: '/contact' }
    ];

    return (
        <header 
        className={`
            sticky top-0 z-50 transition-all duration-300
            ${scrolled 
            ? 'bg-white/90 backdrop-blur-xl shadow-lg' 
            : 'bg-white/95 backdrop-blur-md shadow-sm'
            }
        `}
        >
        {/* Top Bar */}
        <div className='border-b border-gray-100'>
            <div className='container px-4 py-2 mx-auto'>
            <div className='flex items-center justify-between text-sm'>
                <div className='flex items-center gap-2'>
                <div className='w-6 h-6 bg-gradient-to-br from-[#1DBF73] to-[#09B1BA] rounded-lg flex items-center justify-center'>
                    <Stethoscope className='w-4 h-4 text-white' />
                </div>
                <span className='font-medium text-gray-600'>Équipements Médicaux de Qualité</span>
                </div>
                <div className='items-center hidden gap-4 md:flex'>
                <Link to="/Register">
                <button className='text-gray-600 hover:text-[#1DBF73] transition-colors font-medium'>
                    Devenir Vendeur
                </button>
                </Link>
                <span className='text-gray-300'>|</span>
                <button className='text-gray-600 hover:text-[#1DBF73] transition-colors font-medium flex items-center gap-1'>
                    <span>🇫🇷</span>
                    <span>Français</span>
                </button>
                </div>
            </div>
            </div>
        </div>

        {/* Main Header */}
        <div className='container px-4 py-3 mx-auto'>
            <div className='flex items-center justify-between gap-4'>
            {/* Logo */}
            <Link to='/' className='flex items-center gap-2 group'>
                <motion.div 
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className='w-11 h-11 bg-gradient-to-br from-[#1DBF73] to-[#09B1BA] rounded-xl flex items-center justify-center shadow-md'
                >
                <span className='text-xl font-bold text-white'>D</span>
                </motion.div>
                <div className='flex flex-col'>
                <span className='text-2xl font-bold bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] bg-clip-text text-transparent leading-none'>
                    DocSpace
                </span>
                <span className='text-xs font-medium text-gray-500'>Équipements Médicaux</span>
                </div>
            </Link>

            {/* Search Bar - Desktop */}
            <div className='flex-1 hidden max-w-2xl md:flex'>
                <div className='relative w-full'>
                <input
                    type='text'
                    placeholder='Rechercher des équipements médicaux...'
                    className='w-full px-6 py-3 pr-32 border-2 border-gray-200 rounded-full 
                    focus:outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20
                    bg-gray-50 hover:bg-white
                    transition-all duration-300'
                />
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className='absolute right-2 top-1/2 transform -translate-y-1/2 px-5 py-2
                    bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white rounded-full 
                    hover:shadow-lg transition-all flex items-center gap-2 font-medium text-sm'
                >
                    <Search className='w-4 h-4' />
                    <span>Rechercher</span>
                </motion.button>
                </div>
            </div>

            {/* Right Section */}
            <div className='flex items-center gap-2'>
                {/* Icons - Desktop */}
                <div className='items-center hidden gap-2 md:flex'>
                <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className='relative p-2.5 hover:bg-gray-100 rounded-full transition-all group'
                >
                    <Heart className='w-5 h-5 text-gray-600 transition-colors group-hover:text-red-500' />
                    <span className='absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold text-[10px]'>
                    3
                    </span>
                </motion.button>

                <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className='relative p-2.5 hover:bg-gray-100 rounded-full transition-all group'
                >
                    <Bell className='w-5 h-5 text-gray-600 group-hover:text-[#1DBF73] transition-colors' />
                    <span className='absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#1DBF73] text-white text-xs rounded-full flex items-center justify-center font-bold text-[10px]'>
                    5
                    </span>
                </motion.button>

                <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className='relative p-2.5 hover:bg-gray-100 rounded-full transition-all group'
                >
                    <ShoppingCart className='w-5 h-5 text-gray-600 group-hover:text-[#09B1BA] transition-colors' />
                    <span className='absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#09B1BA] text-white text-xs rounded-full flex items-center justify-center font-bold text-[10px]'>
                    2
                    </span>
                </motion.button>

                <div className='w-px h-6 mx-1 bg-gray-300'></div>
                 <Link to="/login">
                <Button variant='outline' size='sm'>
                    Connexion
                </Button>
                </Link>

                <Link to="/Register">
                <Button variant='primary' size='sm'>
                    S'inscrire
                </Button>
                </Link>

                </div>

                {/* Mobile Menu Button */}
                <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className='p-2 transition-all rounded-lg md:hidden hover:bg-gray-100'
                >
                {mobileMenuOpen ? <X className='w-6 h-6' /> : <Menu className='w-6 h-6' />}
                </button>
            </div>
            </div>

            {/* Navigation Menu - Desktop */}
            <nav className='hidden pt-3 mt-3 border-t border-gray-100 md:block'>
            <ul className='flex items-center gap-6'>
                {menuItems.map((item, index) => (
                <motion.li 
                    key={index}
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                >
                    <Link
                    to={item.path}
                    className='text-gray-700 hover:text-[#1DBF73] font-semibold text-sm transition-colors relative group py-1'
                    >
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
                {/* Search Bar - Mobile */}
                <div className='mb-4'>
                <input
                    type='text'
                    placeholder='Rechercher...'
                    className='w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#1DBF73]'
                />
                </div>

                {/* Menu Items - Mobile */}
                <ul className='mb-4 space-y-2'>
                {menuItems.map((item, index) => (
                    <li key={index}>
                    <Link
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className='block py-2 px-4 text-gray-700 hover:bg-gray-100 hover:text-[#1DBF73] rounded-lg transition-all font-medium'
                    >
                        {item.name}
                    </Link>
                    </li>
                ))}
                </ul>

                {/* Actions - Mobile */}
                <div className='flex flex-col gap-2'>
                <Button variant='outline' size='md' className='w-full'>
                    Connexion
                </Button>
                <Button variant='primary' size='md' className='w-full'>
                    S'inscrire
                </Button>
                </div>
            </motion.div>
            )}
        </div>
        </header>
    );
    };

    export default Header;