import React from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, ArrowRight, Heart } from 'lucide-react';
import Card from '../common/Card';
import { Link } from 'react-router-dom';

const PopularEquipments = () => {
const equipments = [
  {
    id: 1,
    name: 'Échographe Portable GE Vscan',
    category: 'Imagerie',
    price: '2,500,000',
    originalPrice: '3,200,000',
    image: 'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.8,
    reviews: 124,
    location: 'Cotonou',
    condition: 'Excellent',
    verified: true
  },
  {
    id: 2,
    name: 'Stéthoscope Littmann Cardiology IV',
    category: 'Cardiologie',
    price: '185,000',
    originalPrice: '250,000',
    image: 'https://images.pexels.com/photos/40568/medical-appointment-doctor-healthcare-40568.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.9,
    reviews: 89,
    location: 'Porto-Novo',
    condition: 'Comme neuf',
    verified: true
  },
  {
    id: 3,
    name: 'Tensiomètre Automatique Omron',
    category: 'Monitoring',
    price: '45,000',
    originalPrice: '65,000',
    image: 'https://images.pexels.com/photos/7659564/pexels-photo-7659564.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.7,
    reviews: 156,
    location: 'Parakou',
    condition: 'Très bon état',
    verified: true
  },
  {
    id: 4,
    name: 'Défibrillateur Philips HeartStart',
    category: 'Urgence',
    price: '1,800,000',
    originalPrice: '2,500,000',
    image: 'https://images.pexels.com/photos/236380/pexels-photo-236380.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 5.0,
    reviews: 67,
    location: 'Cotonou',
    condition: 'Excellent',
    verified: true
  },
  {
    id: 5,
    name: 'Microscope Binoculaire Professionnel',
    category: 'Laboratoire',
    price: '850,000',
    originalPrice: '1,200,000',
    image: 'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.6,
    reviews: 92,
    location: 'Abomey-Calavi',
    condition: 'Bon état',
    verified: true
  },
  {
    id: 6,
    name: 'Oxymètre de Pouls Professionnel',
    category: 'Monitoring',
    price: '35,000',
    originalPrice: '50,000',
    image: 'https://images.pexels.com/photos/3259625/pexels-photo-3259625.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.8,
    reviews: 203,
    location: 'Cotonou',
    condition: 'Excellent',
    verified: true
  },
  {
    id: 7,
    name: 'Fauteuil Roulant Électrique Premium',
    category: 'Mobilité',
    price: '950,000',
    originalPrice: '1,400,000',
    image: 'https://images.pexels.com/photos/6647028/pexels-photo-6647028.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.9,
    reviews: 78,
    location: 'Porto-Novo',
    condition: 'Comme neuf',
    verified: true
  },
  {
    id: 8,
    name: 'Glucomètre Connecté OneTouch',
    category: 'Diabétologie',
    price: '28,000',
    originalPrice: '42,000',
    image: 'https://images.pexels.com/photos/3683099/pexels-photo-3683099.jpeg?auto=compress&cs=tinysrgb&w=600',
    rating: 4.7,
    reviews: 145,
    location: 'Cotonou',
    condition: 'Très bon état',
    verified: true
  }
];

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

        {/* Equipment Grid */}
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
                  <div className='relative h-56 overflow-hidden'>
                    <img 
                      src={equipment.image} 
                      alt={equipment.name}
                      className='object-cover w-full h-full transition-transform duration-500 group-hover:scale-110'
                    />
                    
                    {/* Badges */}
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

                    {/* Favorite Button */}
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => e.preventDefault()}
                      className='absolute flex items-center justify-center w-10 h-10 transition-opacity duration-300 rounded-full shadow-lg opacity-0 top-3 right-3 bg-white/90 backdrop-blur-sm group-hover:opacity-100'
                    >
                      <Heart className='w-5 h-5 text-gray-600 transition-colors hover:text-red-500 hover:fill-red-500' />
                    </motion.button>
                  </div>

                  {/* Content */}
                  <div className='p-5'>
                    {/* Category */}
                    <span className='inline-block text-xs font-bold text-[#09B1BA] uppercase tracking-wider bg-[#09B1BA]/10 px-2 py-1 rounded'>
                      {equipment.category}
                    </span>

                    {/* Title */}
                    <h3 className='font-bold text-lg mt-3 mb-3 line-clamp-2 group-hover:text-[#1DBF73] transition-colors leading-tight'>
                      {equipment.name}
                    </h3>

                    {/* Rating & Location */}
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

                    {/* Price */}
                    <div className='flex items-end justify-between pt-4 border-t border-gray-100'>
                      <div>
                        <div className='mb-1 text-sm text-gray-400 line-through'>
                          {equipment.originalPrice} FCFA
                        </div>
                        <div className='text-2xl font-bold text-[#1DBF73] flex items-baseline gap-1'>
                          {equipment.price}
                          <span className='text-sm font-medium text-gray-600'>FCFA</span>
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