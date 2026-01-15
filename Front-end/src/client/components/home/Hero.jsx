import React from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import Button from '../common/Button';
import AnimatedBackground from './AnimatedBackground';

const Hero = () => {
  return (
    <div className='relative bg-gradient-to-br from-[#1DBF73]/10 via-white to-[#09B1BA]/10 overflow-hidden'>
      {/* Animated Background */}
      <AnimatedBackground />
      
      <div className='container relative z-10 px-4 py-20 mx-auto'>
        <div className='grid items-center gap-12 md:grid-cols-2'>
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1 
              className='mb-6 text-5xl font-bold leading-tight md:text-6xl'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Équipements Médicaux
              <span className='block bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] bg-clip-text text-transparent'>
                D'occasion Premium
              </span>
            </motion.h1>
            
            <motion.p 
              className='mb-8 text-xl text-gray-600'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Achetez et vendez du matériel médical certifié. 
              Qualité garantie, prix accessibles, livraison sécurisée.
            </motion.p>

            {/* Search Bar */}
            <motion.div 
              className='mb-8'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className='flex gap-2'>
                <input
                  type='text'
                  placeholder='Ex: Échographe, Stéthoscope, Scanner...'
                  className='flex-1 px-6 py-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 transition-all'
                />
                <Button variant='primary' size='lg' icon={Search}>
                  Rechercher
                </Button>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div 
              className='grid grid-cols-3 gap-6'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <div className='text-center'>
                <div className='text-3xl font-bold text-[#1DBF73]'>2,500+</div>
                <div className='text-sm text-gray-600'>Équipements</div>
              </div>
              <div className='text-center'>
                <div className='text-3xl font-bold text-[#09B1BA]'>1,200+</div>
                <div className='text-sm text-gray-600'>Vendeurs</div>
              </div>
              <div className='text-center'>
                <div className='text-3xl font-bold text-[#1DBF73]'>98%</div>
                <div className='text-sm text-gray-600'>Satisfaction</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Feature Cards with Images */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className='grid grid-cols-2 gap-4'
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
                className='relative h-40 overflow-hidden bg-white shadow-lg cursor-pointer rounded-xl group'
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
                <div className='relative z-10 flex flex-col justify-end h-full p-4 text-white'>
                  <h3 className='mb-1 text-lg font-bold'>{feature.title}</h3>
                  <p className='text-sm text-white/90'>{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
