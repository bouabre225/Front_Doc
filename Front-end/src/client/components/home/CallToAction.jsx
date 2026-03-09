import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAnnonces } from '../../../services/api';

const CallToAction = () => {
  const [stats, setStats] = useState({
    equipements: '500+',
    vendeurs:    '150+',
    pays:        '8',
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getAnnonces(1);
        // total annonces
        const total = data.total ?? data.data?.length ?? null;
        if (total) {
          setStats(prev => ({
            ...prev,
            equipements: total >= 1000 ? `${Math.floor(total / 100) * 100}+` : `${total}+`,
          }));
        }
      } catch {}
      // vendeurs et pays restent statiques si pas d'endpoint dédié
    };
    fetchStats();
  }, []);

  const STAT_CARDS = [
    {
      number:  stats.equipements,
      label:   'Équipements disponibles',
      image:   'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=300&h=300&fit=crop',
      overlay: 'from-blue-500/80 to-blue-600/80',
    },
    {
      number:  stats.vendeurs,
      label:   'Vendeurs vérifiés',
      image:   'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=300&h=300&fit=crop',
      overlay: 'from-purple-500/80 to-purple-600/80',
    },
    {
      number:  stats.pays,
      label:   'Pays couverts',
      image:   'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=300&h=300&fit=crop',
      overlay: 'from-yellow-500/80 to-orange-500/80',
    },
  ];

  // Vérifie si le vendeur est connecté et KYC validé
  const user      = JSON.parse(localStorage.getItem('user') || '{}');
  const isVendeur = user.role === 'vendeur';
  const isAcheteur = user.role === 'acheteur';
  const kycValide = user.verifie_kyc === true;

  const publishLink = !user.id
    ? '/login'
    : isVendeur && kycValide
    ? '/publish-equipment'
    : isVendeur && !kycValide
    ? '/profile'
    : isAcheteur
    ? '/register?type=vendeur'  // inscription vendeur
    : '/';

  return (
    <section className='py-20 bg-gradient-to-r from-[#09B1BA] to-[#1DBF73] relative overflow-hidden'>
      <div className='absolute top-0 left-0 w-64 h-64 rounded-full bg-white/10 blur-3xl' />
      <div className='absolute bottom-0 right-0 rounded-full w-96 h-96 bg-white/10 blur-3xl' />

      <div className='container relative z-10 px-4 mx-auto'>
        <div className='grid items-center gap-12 md:grid-cols-2'>

          {/* Left */}
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

            <Link
            to={publishLink}
            onClick={() => {
              if (isVendeur && !kycValide) {
                sessionStorage.setItem('profile_tab', 'kyc');
              }
            }}
            >
            <motion.button
              whileHover={{ scale: 1.05, x: 5 }}
              whileTap={{ scale: 0.95 }}
              className='flex items-center gap-3 px-8 py-4 bg-white text-[#1DBF73] rounded-xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all'
            >
              {isAcheteur ? (
                <>
                  Devenez vendeur
                  <ArrowRight className='w-6 h-6' />
                </>
              ) : (
                <>
                  <Upload className='w-6 h-6' />
                  Publier une annonce gratuite
                  <ArrowRight className='w-6 h-6' />
                </>
              )}
            </motion.button>
            </Link>

            {/* Messages contextualisés */}
            {isVendeur && !kycValide && (
            <p className='mt-4 text-sm text-white/80'>
              ⚠️ Votre KYC doit être validé pour publier
            </p>
            )}
            {isAcheteur && (
            <p className='mt-4 text-sm text-white/80'>
              🚀 Rejoignez nos vendeurs vérifiés et commencez à vendre
            </p>
            )}
            {!user.id && (
            <p className='mt-4 text-sm text-white/80'>
              Connectez-vous pour commencer à vendre
            </p>
            )}
          </motion.div>

          {/* Right — Stats */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className='grid grid-cols-3 gap-6'
          >
            {STAT_CARDS.map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -10, scale: 1.05 }}
                className='relative h-48 overflow-hidden bg-white shadow-xl cursor-pointer rounded-2xl group'
              >
                <img
                  src={stat.image}
                  alt={stat.label}
                  className='absolute inset-0 object-cover w-full h-full transition-transform duration-500 group-hover:scale-110'
                />
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.overlay}`} />
                <div className='relative z-10 flex flex-col items-center justify-center h-full p-4 text-center text-white'>
                  <motion.div
                    key={stat.number}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='mb-2 text-5xl font-bold'
                  >
                    {stat.number}
                  </motion.div>
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