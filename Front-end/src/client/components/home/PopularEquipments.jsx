import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAnnonces, getImageUrl } from '../../../services/api';

const PopularEquipments = () => {
  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const fetchAnnonces = async () => {
      try {
        const data = await getAnnonces(1);
        // Prendre les 4 premières annonces
        setAnnonces((data.data || []).slice(0, 4));
      } catch (err) {
        console.error('Erreur chargement annonces populaires:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnonces();
  }, []);

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  return (
    <section className='py-24 bg-gradient-to-b from-white to-gray-50'>
      <div className='container px-4 mx-auto'>
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

        {loading ? (
          <div className='flex justify-center py-16'>
            <div className='w-10 h-10 border-4 border-[#1DBF73] rounded-full border-t-transparent animate-spin' />
          </div>
        ) : annonces.length === 0 ? (
          <div className='py-16 text-center text-gray-400'>
            <p className='text-lg'>Aucun équipement disponible pour le moment.</p>
            <Link to='/explore' className='inline-block mt-4 text-[#1DBF73] font-semibold hover:underline'>
              Explorer quand même →
            </Link>
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4'>
            {annonces.map((annonce, index) => (
              <motion.div
                key={annonce.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className='overflow-hidden bg-white border border-gray-100 shadow-lg rounded-2xl group hover:shadow-2xl transition-all duration-300'
              >
                {/* Image */}
                <div className='relative overflow-hidden bg-gray-100 h-48'>
                  {annonce.images?.[0] ? (
                    <img
                      src={getImageUrl(annonce.images[0].image_url)}
                      alt={annonce.titre}
                      className='object-cover w-full h-full transition-transform duration-500 group-hover:scale-110'
                    />
                  ) : (
                    <div className='flex items-center justify-center w-full h-full'>
                      <span className='text-5xl'>🏥</span>
                    </div>
                  )}
                  <button
                    onClick={() => toggleFavorite(annonce.id)}
                    className='absolute p-2 transition-all bg-white rounded-full shadow-md top-3 right-3 hover:scale-110'
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        favorites.includes(annonce.id)
                          ? 'fill-red-500 text-red-500'
                          : 'text-gray-400'
                      }`}
                    />
                  </button>
                  <div className='absolute px-2 py-1 text-xs font-bold text-white rounded-lg bg-gray-900/80 bottom-3 left-3'>
                    {annonce.etat}
                  </div>
                </div>

                {/* Contenu */}
                <div className='p-5'>
                  <div className='mb-1 text-xs font-semibold text-[#09B1BA] uppercase'>
                    {annonce.categorie}
                  </div>
                  <h3 className='mb-2 font-bold text-gray-900 line-clamp-2 group-hover:text-[#1DBF73] transition-colors'>
                    {annonce.titre}
                  </h3>
                  <div className='flex items-center gap-1 mb-4 text-xs text-gray-500'>
                    <MapPin className='w-3.5 h-3.5 text-[#1DBF73]' />
                    <span className='truncate'>{annonce.pays_expedition || 'Non précisé'}</span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-lg font-bold text-[#1DBF73]'>
                        {Number(annonce.prix_vendeur).toLocaleString()}
                        <span className='ml-1 text-xs font-normal text-gray-400'>FCFA</span>
                      </p>
                    </div>
                    <Link to={`/equipment/${annonce.id}`}>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className='w-9 h-9 bg-gradient-to-br from-[#1DBF73] to-[#09B1BA] rounded-xl flex items-center justify-center shadow-md'
                      >
                        <ArrowRight className='w-4 h-4 text-white' />
                      </motion.div>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default PopularEquipments;
