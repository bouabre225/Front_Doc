import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, ArrowRight, Heart, ShieldCheck } from 'lucide-react';
import Card from '../common/Card';
import { Link } from 'react-router-dom';
import { getAnnonces, getImageUrl } from '../../../services/api';
import { useCart } from '../../context/CartContext';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const conditionStyle = (etat) => {
  if (!etat) return 'text-gray-600 bg-gray-50';
  const e = etat.toLowerCase();
  if (e === 'neuf')        return 'text-green-600 bg-green-50';
  if (e === 'occasion')    return 'text-orange-600 bg-orange-50';
  if (e.includes('recon')) return 'text-blue-600 bg-blue-50';
  return 'text-gray-600 bg-gray-50';
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div className='overflow-hidden bg-white border border-gray-100 rounded-2xl animate-pulse'>
    <div className='h-56 bg-gray-200' />
    <div className='p-5 space-y-3'>
      <div className='h-3 bg-gray-200 rounded w-1/3' />
      <div className='h-5 bg-gray-200 rounded w-full' />
      <div className='h-5 bg-gray-200 rounded w-3/4' />
      <div className='h-3 bg-gray-200 rounded w-1/2 mt-2' />
      <div className='flex justify-between items-center pt-3 border-t border-gray-100'>
        <div className='h-6 bg-gray-200 rounded w-1/3' />
        <div className='w-12 h-12 bg-gray-200 rounded-full' />
      </div>
    </div>
  </div>
);

// ─── Composant principal ─────────────────────────────────────────────────────

const PopularEquipments = () => {
  const { addToCart, isInCart } = useCart();

  const [equipments, setEquipments] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [favorites,  setFavorites]  = useState(() => {
    try { return JSON.parse(localStorage.getItem('favorites') || '[]'); }
    catch { return []; }
  });

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const data  = await getAnnonces(1);
        const items = data.data ?? data ?? [];
        const arr   = Array.isArray(items) ? items : [];

        // Trier par date décroissante et prendre les 4 plus récents
        const sorted = [...arr]
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 4);

        setEquipments(sorted);
      } catch {
        setEquipments([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleFavorite = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites(prev => {
      const updated = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      localStorage.setItem('favorites', JSON.stringify(updated));
      return updated;
    });
  };

  const handleAddToCart = (e, equipment) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(equipment, 1);
  };

  if (!loading && equipments.length === 0) return null;

  return (
    <section className='py-24 bg-gradient-to-b from-white to-gray-50'>
      <div className='container px-4 mx-auto'>

        {/* Header */}
        <motion.div
          className='flex flex-col items-start justify-between gap-6 mb-16 md:flex-row md:items-center'
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div>
            <h2 className='mb-3 text-5xl font-bold leading-tight'>
              Équipements
              <span className='block md:inline bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] bg-clip-text text-transparent'>
                {' '}Populaires
              </span>
            </h2>
            <p className='text-lg text-gray-600'>Les plus récemment ajoutés</p>
          </div>
          <Link to='/explore'>
            <motion.button
              whileHover={{ scale: 1.05, x: 5 }}
              whileTap={{ scale: 0.95 }}
              className='flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all'
            >
              Voir plus
              <ArrowRight className='w-5 h-5' />
            </motion.button>
          </Link>
        </motion.div>

        {/* Grille */}
        <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4'>
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : equipments.map((equipment, index) => (
              <motion.div
                key={equipment.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
              >
                <Link to={`/equipment/${equipment.id}`}>
                  <Card hover={true} className='h-full overflow-hidden cursor-pointer group'>

                    {/* Image */}
                    <div className='relative h-56 overflow-hidden bg-gray-100'>
                      {equipment.images?.[0] ? (
                        <img
                          src={getImageUrl(equipment.images[0].image_url)}
                          alt={equipment.titre}
                          className='object-cover w-full h-full transition-transform duration-500 group-hover:scale-110'
                        />
                      ) : (
                        <div className='flex items-center justify-center w-full h-full bg-gradient-to-br from-gray-100 to-gray-200'>
                          <span className='text-5xl'>🏥</span>
                        </div>
                      )}

                      {/* Badges haut gauche */}
                      <div className='absolute top-3 left-3 flex flex-col gap-1.5'>
                        {equipment.etat && (
                          <span className={`px-2.5 py-1 rounded-full text-xs flex items-center gap-1 font-bold shadow-sm capitalize ${conditionStyle(equipment.etat)}`}>
                            <ShieldCheck className='w-3 h-3' />  {equipment.etat}  
                          </span>
                        )}
                        {equipment.vendeur?.verifie_kyc && (
                          <span className='bg-green-500 text-white px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm'>
                            <ShieldCheck className='w-3 h-3' /> Vérifié
                          </span>
                        )}
                      </div>

                      {/* Favori + Panier — visibles au hover */}
                      <div className='absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                        <motion.button
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={e => handleFavorite(e, equipment.id)}
                          className='w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg'
                        >
                          <Heart className={`w-4 h-4 transition-colors ${
                            favorites.includes(equipment.id)
                              ? 'fill-red-500 text-red-500'
                              : 'text-gray-600 hover:text-red-400'
                          }`} />
                        </motion.button>
                      </div>
                    </div>

                    {/* Contenu */}
                    <div className='p-5'>
                      <span className='inline-block text-xs font-bold text-[#09B1BA] uppercase tracking-wider bg-[#09B1BA]/10 px-2 py-1 rounded-lg'>
                        {equipment.categorie || 'Médical'}
                      </span>

                      <h3 className='font-bold text-lg mt-3 mb-3 line-clamp-2 group-hover:text-[#1DBF73] transition-colors leading-tight'>
                        {equipment.titre}
                      </h3>

                      <div className='flex items-center gap-1.5 mb-4 text-sm text-gray-500'>
                        <MapPin className='w-4 h-4 text-[#1DBF73] shrink-0' />
                        <span className='font-medium truncate'>
                          {equipment.pays_expedition || 'Non précisé'}
                        </span>
                      </div>

                      <div className='flex items-end justify-between pt-4 border-t border-gray-100'>
                        <div>
                          <div className='text-2xl font-bold text-[#1DBF73] flex items-baseline gap-1'>
                            {Number(equipment.prix_vendeur).toLocaleString('fr-FR')}
                            <span className='text-sm font-medium text-gray-500'>FCFA</span>
                          </div>
                          <div className='flex items-center gap-1 mt-0.5'>
                            <span className='text-xs text-gray-400'>Total :</span>
                            <span className='text-xs font-semibold text-gray-600'>
                              {Math.round(Number(equipment.prix_vendeur) * 1.08).toLocaleString('fr-FR')} FCFA
                            </span>
                            <span className='text-[10px] bg-[#09B1BA]/10 text-[#09B1BA] px-1.5 py-0.5 rounded-full font-semibold'>
                              🛡️ +8%
                            </span>
                          </div>
                          {isInCart(equipment.id) && (
                            <span className='text-xs text-[#1DBF73] font-semibold'>✓ Dans le panier</span>
                          )}
                        </div>

                        <motion.div
                          whileHover={{ scale: 1.15, rotate: -10 }}
                          whileTap={{ scale: 0.9 }}
                          className='w-12 h-12 bg-gradient-to-br from-[#1DBF73] to-[#09B1BA] text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow'
                          title='Voir les détails'
                        >
                          <ArrowRight className='w-5 h-5' />
                        </motion.div>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))
          }
        </div>
      </div>
    </section>
  );
};

export default PopularEquipments;