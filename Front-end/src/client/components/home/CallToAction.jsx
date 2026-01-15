import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Upload } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const CallToAction = () => {
  const navigate = useNavigate();

  const handlePublishClick = () => {
    // Vérifier si l'utilisateur est connecté et est vendeur
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (user.role === 'seller') {
      // Si c'est un vendeur connecté, rediriger vers la page de publication
      navigate('/seller/publish');
    } else {
      // Sinon, rediriger vers l'inscription en tant que vendeur
      navigate('/register?type=seller');
    }
  };

  return (
    <section className='py-20 bg-gradient-to-r from-[#09B1BA] to-[#1DBF73] relative overflow-hidden'>
      {/* Decorative shapes */}
      <div className='absolute top-0 left-0 w-64 h-64 rounded-full bg-white/10 blur-3xl'></div>
      <div className='absolute bottom-0 right-0 rounded-full w-96 h-96 bg-white/10 blur-3xl'></div>

      <div className='container relative z-10 px-4 mx-auto'>
        <div className='grid items-center gap-12 md:grid-cols-2'>
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className='mb-6 text-5xl font-bold leading-tight text-white'>
              Vous avez du matériel <br />à vendre ?
            </h2>
            <p className='mb-8 text-xl leading-relaxed text-white/90'>
              Publiez votre annonce gratuitement et touchez des milliers d'acheteurs 
              potentiels dans toute l'Afrique de l'Ouest.
            </p>

            <motion.button
              onClick={handlePublishClick}
              whileHover={{ scale: 1.05, x: 5 }}
              whileTap={{ scale: 0.95 }}
              className='flex items-center gap-3 px-8 py-4 bg-white text-[#1DBF73] rounded-xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all'
            >
              <Upload className='w-6 h-6' />
              Publier une annonce gratuite
              <ArrowRight className='w-6 h-6' />
            </motion.button>
          </motion.div>

          {/* Right Content - Stats Cards with CORRECT Images */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className='grid grid-cols-3 gap-6'
          >
            {[
              { 
                number: '500+', 
                label: 'Équipements disponibles',
                image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=300&h=300&fit=crop',
                overlay: 'from-blue-500/80 to-blue-600/80'
              },
              { 
                number: '150+', 
                label: 'Vendeurs vérifiés',
                image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=300&h=300&fit=crop',
                overlay: 'from-purple-500/80 to-purple-600/80'
              },
              { 
                number: '8', 
                label: 'Pays couverts',
                image: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=300&h=300&fit=crop',
                overlay: 'from-yellow-500/80 to-orange-500/80'
              }
            ].map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -10, scale: 1.05 }}
                className='relative h-48 overflow-hidden bg-white shadow-xl cursor-pointer rounded-2xl group'
              >
                {/* Image Background */}
                <img 
                  src={stat.image} 
                  alt={stat.label}
                  className='absolute inset-0 object-cover w-full h-full transition-transform duration-500 group-hover:scale-110'
                />
                
                {/* Overlay Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.overlay}`}></div>
                
                {/* Content */}
                <div className='relative z-10 flex flex-col items-center justify-center h-full p-4 text-center text-white'>
                  <div className='mb-2 text-5xl font-bold'>{stat.number}</div>
                  <div className='text-sm font-semibold'>{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;