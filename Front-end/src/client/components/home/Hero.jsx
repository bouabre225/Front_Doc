import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AnimatedBackground from './AnimatedBackground';
import { getAnnonces } from '../../../services/api';

const SUGGESTIONS = ['Échographe', 'Stéthoscope', 'Scanner', 'Lit médical', 'Défibrillateur'];

const FEATURES = [
  { image: 'https://images.unsplash.com/photo-1584362917165-526a968579e8?w=400&h=300&fit=crop', title: 'Certifié',          desc: 'Équipements vérifiés',   overlay: 'from-blue-500/80 to-blue-600/80' },
  { image: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=400&h=300&fit=crop', title: 'Livraison Rapide', desc: 'Partout au Bénin',       overlay: 'from-green-500/80 to-emerald-600/80' },
  { image: 'https://images.unsplash.com/photo-1607863680198-23d4b2565df0?w=400&h=300&fit=crop', title: 'Meilleur Prix',    desc: 'Garantie satisfait',     overlay: 'from-orange-500/80 to-yellow-600/80' },
  { image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop', title: 'Paiement Sécurisé', desc: 'Transaction protégée',   overlay: 'from-purple-500/80 to-pink-600/80' },
];

// ─── Skeleton stat ────────────────────────────────────────────────────────────
const StatSkeleton = () => (
  <div className='p-8 text-center bg-white border border-gray-100 shadow-xl rounded-2xl animate-pulse'>
    <div className='h-12 bg-gray-200 rounded-xl w-24 mx-auto mb-3' />
    <div className='h-4 bg-gray-200 rounded w-32 mx-auto' />
  </div>
);

const Hero = () => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState({
    equipements: null,
    vendeurs:    null,
  });

  useEffect(() => {
    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        // Page 1 pour total + vendeurs uniques sur toutes les pages
        const first    = await getAnnonces(1);
        const total    = first.total ?? (first.data || []).length;
        const lastPage = first.last_page || 1;

        // Récupérer toutes les pages pour compter les vendeurs uniques réels
        let allItems = [...(first.data || [])];
        if (lastPage > 1) {
          const rest = await Promise.all(
            Array.from({ length: lastPage - 1 }, (_, i) => getAnnonces(i + 2))
          );
          rest.forEach(p => allItems.push(...(p.data || [])));
        }

        const vendeurIds = new Set(allItems.map(a => a.vendeur_id).filter(Boolean));

        setStats({
          equipements: total,
          vendeurs:    vendeurIds.size || null,
        });
      } catch {
        // Garde null → affiche '—'
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className='relative bg-gradient-to-br from-[#1DBF73]/10 via-white to-[#09B1BA]/10 overflow-hidden'>
      <AnimatedBackground />

      <div className='container relative z-10 px-4 py-20 mx-auto'>

        {/* ── Titre ──────────────────────────────────────────────────── */}
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

        {/* ── Feature cards ───────────────────────────────────────────── */}
        <motion.div
          className='grid max-w-4xl grid-cols-2 gap-3 mx-auto mb-10 md:grid-cols-4'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {FEATURES.map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05, y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className='relative overflow-hidden bg-white rounded-xl shadow-md cursor-pointer h-28 group'
            >
              <img
                src={feature.image}
                alt={feature.title}
                className='absolute inset-0 object-cover w-full h-full transition-transform duration-500 group-hover:scale-110'
              />
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.overlay} transition-opacity duration-300`} />
              <div className='relative z-10 flex flex-col justify-end h-full p-3 text-white'>
                <h3 className='mb-0.5 text-sm font-bold'>{feature.title}</h3>
                <p className='text-xs text-white/90'>{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Barre de recherche ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className='max-w-5xl mx-auto'
        >
          <h2 className='mb-8 text-4xl font-bold text-center text-gray-800'>
            QUE CHERCHEZ-VOUS ?
          </h2>

          {/* ── Barre de recherche ──────────────────────────────────────── */}
<form onSubmit={handleSearch}>
  <div className='flex flex-col sm:flex-row items-center gap-3 p-3 bg-white border-4 border-[#1DBF73]/30 rounded-2xl sm:rounded-full shadow-2xl hover:border-[#1DBF73]/50 transition-all duration-300 focus-within:border-[#1DBF73]/60'>
    <div className='flex items-center flex-1 gap-3 px-3 w-full'>
      <Search className='w-6 h-6 text-[#1DBF73] shrink-0' />
      <input
        type='text'
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        placeholder='Ex: Échographe, Scanner...'
        className='flex-1 py-3 text-base sm:text-xl text-gray-800 placeholder-gray-400 bg-transparent border-none outline-none'
      />
      {searchQuery && (
        <button
          type='button'
          onClick={() => setSearchQuery('')}
          className='text-gray-400 hover:text-gray-600 transition-colors'
        >
          <X className='w-5 h-5' />
        </button>
      )}
    </div>
    <button
      type='submit'
      className='w-full sm:w-auto px-8 py-4 text-base sm:text-lg bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white font-bold rounded-xl sm:rounded-full hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 shrink-0'
    >
      Rechercher
    </button>
  </div>
</form>

          {/* Suggestions */}
          <div className='flex flex-wrap justify-center items-center gap-3 mt-6'>
            <span className='text-sm font-medium text-gray-500'>Recherches populaires :</span>
            {SUGGESTIONS.map((term, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/explore?q=${encodeURIComponent(term)}`)}
                className='px-5 py-2 text-sm font-medium text-gray-700 bg-white rounded-full hover:bg-gradient-to-r hover:from-[#1DBF73] hover:to-[#09B1BA] hover:text-white transition-all duration-300 shadow-md hover:shadow-lg'
              >
                {term}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* ── Stats ───────────────────────────────────────────────────── */}
        <motion.div
          className='grid max-w-4xl grid-cols-1 gap-6 mx-auto mt-16 sm:grid-cols-3'
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          {statsLoading ? (
            // Skeleton × 3
            Array.from({ length: 3 }).map((_, i) => <StatSkeleton key={i} />)
          ) : (
            <>
              <motion.div
                whileHover={{ y: -4 }}
                className='p-8 text-center transition-all duration-300 bg-white border border-gray-100 shadow-xl rounded-2xl hover:shadow-2xl'
              >
                <div className='text-5xl font-extrabold text-[#1DBF73] mb-2'>
                  {stats.equipements != null
                    ? `${stats.equipements.toLocaleString('fr-FR')}+`
                    : '—'}
                </div>
                <div className='text-base font-semibold text-gray-700'>Équipements</div>
              </motion.div>

              <motion.div
                whileHover={{ y: -4 }}
                className='p-8 text-center transition-all duration-300 bg-white border border-gray-100 shadow-xl rounded-2xl hover:shadow-2xl'
              >
                <div className='text-5xl font-extrabold text-[#09B1BA] mb-2'>
                  {stats.vendeurs != null
                    ? `${stats.vendeurs}+`
                    : '—'}
                </div>
                <div className='text-base font-semibold text-gray-700'>Vendeurs actifs</div>
              </motion.div>

              <motion.div
                whileHover={{ y: -4 }}
                className='p-8 text-center transition-all duration-300 bg-white border border-gray-100 shadow-xl rounded-2xl hover:shadow-2xl'
              >
                <div className='text-5xl font-extrabold text-[#1DBF73] mb-2'>98%</div>
                <div className='text-base font-semibold text-gray-700'>Satisfaction</div>
              </motion.div>
            </>
          )}
        </motion.div>

      </div>
    </div>
  );
};

export default Hero;