import React from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, ArrowRight, Heart } from 'lucide-react';
import Card from '../common/Card';
import { Link } from 'react-router-dom';

const equipments = [
  {
    id: 1,
    name: 'Échographe GE Voluson E10',
    category: 'Imagerie Médicale',
    price: '45,000',
    originalPrice: '55,000',
    currency: 'EUR',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=500',
    rating: 4.8,
    reviews: 124,
    location: 'Cotonou, Bénin',
    condition: 'Neuf',
    verified: true,
  },
  {
    id: 5,
    name: 'Moniteur Patient 5 paramètres',
    category: 'Monitoring',
    price: '3,200',
    originalPrice: '4,500',
    currency: 'EUR',
    image: 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=500',
    rating: 4.6,
    reviews: 78,
    location: 'Lomé, Togo',
    condition: 'Occasion',
    verified: true,
  },
  {
    id: 11,
    name: 'Scanner IRM Siemens',
    category: 'Imagerie Médicale',
    price: '125,000',
    originalPrice: '180,000',
    currency: 'EUR',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=500',
    rating: 4.9,
    reviews: 15,
    location: "Abidjan, Côte d'Ivoire",
    condition: 'Reconditionné',
    verified: true,
  },
  {
    id: 6,
    name: 'Défibrillateur automatique',
    category: 'Urgence',
    price: '1,800',
    originalPrice: '2,400',
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=500',
    rating: 5.0,
    reviews: 45,
    location: 'Douala, Cameroun',
    condition: 'Neuf',
    verified: true,
  },
];

const PopularEquipments = () => {
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
                  <div className='relative h-56 overflow-hidden'>
                    <img
                      src={equipment.image}
                      alt={equipment.name}
                      className='object-cover w-full h-full transition-transform duration-500 group-hover:scale-110'
                    />
                    <div className='absolute flex items-start justify-between top-3 left-3 right-3'>
                      <div className='bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-gray-700 shadow-md'>
                        {equipment.condition}
                      </div>
                      {equipment.verified && (
                        <div className='bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-md'>
                          ✓ Vérifié
                        </div>
                      )}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => e.preventDefault()}
                      className='absolute flex items-center justify-center w-10 h-10 transition-opacity duration-300 rounded-full shadow-lg opacity-0 top-3 right-3 bg-white/90 backdrop-blur-sm group-hover:opacity-100'
                    >
                      <Heart className='w-5 h-5 text-gray-600 transition-colors hover:text-red-500 hover:fill-red-500' />
                    </motion.button>
                  </div>

                  <div className='p-5'>
                    <span className='inline-block text-xs font-bold text-[#09B1BA] uppercase tracking-wider bg-[#09B1BA]/10 px-2 py-1 rounded'>
                      {equipment.category}
                    </span>
                    <h3 className='font-bold text-lg mt-3 mb-3 line-clamp-2 group-hover:text-[#1DBF73] transition-colors leading-tight'>
                      {equipment.name}
                    </h3>
                    <div className='flex items-center justify-between mb-4'>
                      <div className='flex items-center gap-1.5'>
                        <Star className='w-4 h-4 text-yellow-400 fill-yellow-400' />
                        <span className='text-sm font-bold'>{equipment.rating}</span>
                        <span className='text-sm text-gray-400'>({equipment.reviews})</span>
                      </div>
                      <div className='flex items-center gap-1.5 text-sm text-gray-600'>
                        <MapPin className='w-4 h-4 text-[#1DBF73]' />
                        <span className='font-medium'>{equipment.location}</span>
                      </div>
                    </div>
                    <div className='flex items-end justify-between pt-4 border-t border-gray-100'>
                      <div>
                        <div className='mb-1 text-sm text-gray-400 line-through'>
                          {equipment.originalPrice} {equipment.currency}
                        </div>
                        <div className='text-2xl font-bold text-[#1DBF73] flex items-baseline gap-1'>
                          {equipment.price}
                          <span className='text-sm font-medium text-gray-600'>{equipment.currency}</span>
                        </div>
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.15, rotate: -15 }}
                        whileTap={{ scale: 0.9 }}
                        className='w-12 h-12 bg-gradient-to-br from-[#1DBF73] to-[#09B1BA] text-white rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all'
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