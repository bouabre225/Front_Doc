    import React from 'react';
    import { motion } from 'framer-motion';
    import { Star, MapPin, Heart } from 'lucide-react';
    import Card from '../common/Card';
import { useLang } from '../../context/LangContext';

    const EquipmentCard = ({ equipment }) => {
  const { t } = useLang();
    return (
        <Card hover={true} className='group cursor-pointer'>
        {/* Image */}
        <div className='relative overflow-hidden h-48'>
            <img 
            src={equipment.image} 
            alt={equipment.name}
            className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-300'
            />
            <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className='absolute top-2 right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg'
            >
            <Heart className='w-5 h-5 text-gray-600 hover:text-red-500' />
            </motion.button>
        </div>

        {/* Content */}
        <div className='p-4'>
            <span className='text-xs font-semibold text-[#09B1BA] uppercase'>
            {equipment.category}
            </span>
            <h3 className='font-bold text-lg mt-2 mb-2 line-clamp-2'>
            {equipment.name}
            </h3>
            <div className='flex items-center gap-2 mb-3'>
            <Star className='w-4 h-4 fill-yellow-400 text-yellow-400' />
            <span className='font-semibold text-sm'>{equipment.rating}</span>
            </div>
            <div className='flex items-center gap-2 mb-3 text-sm text-gray-600'>
            <MapPin className='w-4 h-4' />
            <span>{equipment.location}</span>
            </div>
            <div className='text-2xl font-bold text-[#1DBF73]'>
            {equipment.price} FCFA
            </div>
        </div>
        </Card>
    );
    };

    export default EquipmentCard;