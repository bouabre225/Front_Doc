
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, ArrowRight, Heart } from 'lucide-react';
import Card from '../common/Card';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:8000/api';

const PopularEquipments = () => {
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnonces = async () => {
      try {
        const res = await fetch(`${API_URL}/annonces?page=1`, {
          headers: { 'Accept': 'application/json' }
        });
        const data = await res.json();
        if (res.ok) {
          // Prendre les 4 premiers
          setEquipments(data.data?.slice(0, 4) || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnonces();
  }, []);

  const conditionColor = (etat) => {
    if (etat === 'Neuf') return 'text-green-600 bg-green-50';
    if (etat === 'Occasion') return 'text-orange-600 bg-orange-50';
    return 'text-blue-600 bg-blue-50';
  };

  if (loading) return (
    <section className='py-24 bg-gradient-to-b from-white to-gray-50'>
      <div className='flex justify-center py-20'>
        <div className='w-10 h-10 border-4 border-[#1DBF73] rounded-full border-t-transparent animate-spin' />
      </div>
    </section>
  );

  if (equipments.length === 0) return null;

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
              <span className='block md:inline bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] bg-clip-text text-transparent'> Populaires</span>
            </h2>
            <p className='text-lg text-gray-600'>Les plus demandés cette semaine</p>
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

        <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4'>
          {equipments.map((equipment, index) => (
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
                        src={`http://localhost:8000/storage/${equipment.images[0].image_url}`}
                        alt={equipment.titre}
                        className='object-cover w-full h-full transition-transform duration-500 group-hover:scale-110'
                      />
                    ) : (
                      <div className='flex items-center justify-center w-full h-full bg-gradient-to-br from-gray-100 to-gray-200'>
                        <span className='text-4xl'>🏥</span>
                      </div>
                    )}
                    <div className='absolute flex items-start justify-between top-3 left-3 right-3'>
                      <div className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-md ${conditionColor(equipment.etat)}`}>
                        {equipment.etat}
                      </div>
                      {equipment.vendeur?.badge_verifie && (
                        <div className='bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-md'>
                          ✓ Vérifié
                        </div>
                      )}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => e.preventDefault()}
                      className='absolute flex items-center justify-center w-10 h-10 transition-opacity duration-300 rounded-full shadow-lg opacity-0 top-3 right-3 bg-white/90 group-hover:opacity-100'
                    >
                      <Heart className='w-5 h-5 text-gray-600 hover:text-red-500 hover:fill-red-500' />
                    </motion.button>
                  </div>

                  <div className='p-5'>
                    <span className='inline-block text-xs font-bold text-[#09B1BA] uppercase tracking-wider bg-[#09B1BA]/10 px-2 py-1 rounded'>
                      {equipment.categorie || 'Médical'}
                    </span>
                    <h3 className='font-bold text-lg mt-3 mb-3 line-clamp-2 group-hover:text-[#1DBF73] transition-colors leading-tight'>
                      {equipment.titre}
                    </h3>
                    <div className='flex items-center justify-between mb-4'>
                      <div className='flex items-center gap-1.5 text-sm text-gray-600'>
                        <MapPin className='w-4 h-4 text-[#1DBF73]' />
                        <span className='font-medium'>{equipment.pays_expedition || 'Bénin'}</span>
                      </div>
                    </div>
                    <div className='flex items-end justify-between pt-4 border-t border-gray-100'>
                      <div className='text-2xl font-bold text-[#1DBF73] flex items-baseline gap-1'>
                        {Number(equipment.prix_vendeur).toLocaleString()}
                        <span className='text-sm font-medium text-gray-600'>FCFA</span>
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.15, rotate: -15 }}
                        whileTap={{ scale: 0.9 }}
                        className='w-12 h-12 bg-gradient-to-br from-[#1DBF73] to-[#09B1BA] text-white rounded-full flex items-center justify-center shadow-lg'
                      >
                        <ArrowRight className='w-5 h-5' />
                      </motion.div>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularEquipments;
