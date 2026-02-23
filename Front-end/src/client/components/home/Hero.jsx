import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import AnimatedBackground from './AnimatedBackground';
import { useLang } from '../../context/LangContext';

const Hero = () => {
  const { t } = useLang();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Naviguer vers la page explore avec le query en paramètre
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  return (
    <div className='relative bg-gradient-to-br from-[#1DBF73]/10 via-white to-[#09B1BA]/10 overflow-hidden'>
      {/* Animated Background */}
      <AnimatedBackground />
      
      <div className='container relative z-10 px-4 py-20 mx-auto'>
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className='mb-10 text-center'
        >
          <h1 className='mb-6 text-5xl font-bold leading-tight text-gray-800 md:text-6xl'>
            Équipements Médicaux
            <span className='block bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] bg-clip-text text-transparent'>
              D'occasion Premium
            </span>
          </h1>
          
          <p className='max-w-3xl mx-auto mb-8 text-xl text-gray-600'>
            Achetez et vendez du matériel médical certifié. 
            Qualité garantie, prix accessibles, livraison sécurisée.
          </p>
        </motion.div>

        {/* Feature Cards in Row with Images - SMALLER SIZE */}
        <motion.div 
          className='grid max-w-4xl grid-cols-2 gap-3 mx-auto mb-10 md:grid-cols-4'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {[
            { 
              image: 'https://images.unsplash.com/photo-1584362917165-526a968579e8?w=400&h=300&fit=crop',
              title: 'Certifié', 
              desc: 'Équipements vérifiés',
              overlay: 'from-blue-500/80 to-blue-600/80'
            },
            { 
              image: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=400&h=300&fit=crop',
              title: 'Livraison Rapide', 
              desc: 'Partout au Bénin',
              overlay: 'from-green-500/80 to-emerald-600/80'
            },
            { 
              image: 'https://images.unsplash.com/photo-1607863680198-23d4b2565df0?w=400&h=300&fit=crop',
              title: 'Meilleur Prix', 
              desc: 'Garantie satisfait',
              overlay: 'from-orange-500/80 to-yellow-600/80'
            },
            { 
              image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop',
              title: 'Paiement Sécurisé', 
              desc: 'Transaction protégée',
              overlay: 'from-purple-500/80 to-pink-600/80'
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05, y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className='relative overflow-hidden bg-white rounded-lg shadow-md cursor-pointer h-28 group'
            >
              {/* Image Background */}
              <img 
                src={feature.image} 
                alt={feature.title}
                className='absolute inset-0 object-cover w-full h-full transition-transform duration-500 group-hover:scale-110'
              />
              
              {/* Overlay Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.overlay} transition-opacity duration-300`}></div>
              
              {/* Content */}
              <div className='relative z-10 flex flex-col justify-end h-full p-3 text-white'>
                <h3 className='mb-0.5 text-sm font-bold'>{feature.title}</h3>
                <p className='text-xs text-white/90'>{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className='max-w-5xl mx-auto'
        >
          <h2 className='mb-8 text-4xl font-bold text-center text-gray-800'>
            QUE CHERCHEZ-VOUS?
          </h2>
          
          <form onSubmit={handleSearch} className='relative'>
            <div className='flex items-center gap-4 p-3 bg-white border-4 border-[#1DBF73]/30 rounded-full shadow-2xl hover:border-[#1DBF73]/50 transition-all duration-300'>
              <div className='flex items-center flex-1 gap-4 px-6'>
                <Search className='w-7 h-7 text-[#1DBF73]' />
                <input
                  type='text'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder='Ex: Échographe, Stéthoscope, Scanner...'
                  className='flex-1 py-5 text-xl text-gray-800 placeholder-gray-400 bg-transparent border-none outline-none'
                />
              </div>
              <button
                type='submit'
                className='px-10 py-5 text-lg bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white font-bold rounded-full hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95'
              >
                Rechercher
              </button>
            </div>
          </form>

          {/* Suggestion Examples */}
          <div className='flex flex-wrap justify-center gap-3 mt-8'>
            <span className='text-sm font-medium text-gray-500'>Recherches populaires:</span>
            {['Échographe', 'Stéthoscope', 'Scanner', 'Lit médical', 'Défibrillateur'].map((term, index) => (
              <button
                key={index}
                onClick={() => {
                  setSearchQuery(term);
                  navigate(`/explore?q=${encodeURIComponent(term)}`);
                }}
                className='px-5 py-2 text-sm font-medium text-gray-700 bg-white rounded-full hover:bg-gradient-to-r hover:from-[#1DBF73] hover:to-[#09B1BA] hover:text-white transition-all duration-300 shadow-md hover:shadow-lg'
              >
                {term}
              </button>
            ))}
          </div>
        </motion.div>

          {/* Stats */}
          <motion.div
            className="grid max-w-4xl grid-cols-1 gap-6 mx-auto mt-16 sm:grid-cols-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <div className="p-8 text-center transition-all duration-300 bg-white border border-gray-100 shadow-xl rounded-2xl hover:shadow-2xl hover:-translate-y-1">
              <div className="text-5xl font-extrabold text-[#1DBF73] mb-2">2,500+</div>
              <div className="text-base font-semibold text-gray-700">Équipements</div>
            </div>

            <div className="p-8 text-center transition-all duration-300 bg-white border border-gray-100 shadow-xl rounded-2xl hover:shadow-2xl hover:-translate-y-1">
              <div className="text-5xl font-extrabold text-[#09B1BA] mb-2">1,200+</div>
              <div className="text-base font-semibold text-gray-700">Vendeurs</div>
            </div>

            <div className="p-8 text-center transition-all duration-300 bg-white border border-gray-100 shadow-xl rounded-2xl hover:shadow-2xl hover:-translate-y-1">
              <div className="text-5xl font-extrabold text-[#1DBF73] mb-2">98%</div>
              <div className="text-base font-semibold text-gray-700">Satisfaction</div>
            </div>
          </motion.div>

      </div>
    </div>
  );
};

export default Hero;