import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import { getAnnonces } from '../../../services/api';

const CATEGORIES = [
  { slug: 'cardiologie', name: 'Cardiologie', image: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=400&h=300&fit=crop', color: 'from-red-500/80 to-pink-500/80' },
  { slug: 'neurologie', name: 'Neurologie', image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&h=300&fit=crop', color: 'from-purple-500/80 to-indigo-500/80' },
  { slug: 'medecine-generale', name: 'Médecine Générale', image: 'https://images.unsplash.com/photo-1584362917165-526a968579e8?w=400&h=300&fit=crop', color: 'from-blue-500/80 to-cyan-500/80' },
  { slug: 'monitoring', name: 'Monitoring', image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=300&fit=crop', color: 'from-green-500/80 to-emerald-500/80' },
  { slug: 'laboratoire', name: 'Laboratoire', image: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=400&h=300&fit=crop', color: 'from-yellow-500/80 to-orange-500/80' },
  { slug: 'chirurgie', name: 'Chirurgie', image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&h=300&fit=crop', color: 'from-teal-500/80 to-cyan-500/80' },
  { slug: 'imagerie', name: 'Imagerie', image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=400&h=300&fit=crop', color: 'from-indigo-500/80 to-purple-500/80' },
  { slug: 'pharmacie', name: 'Pharmacie', image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=300&fit=crop', color: 'from-pink-500/80 to-rose-500/80' },
];

// Mapping slug → nom exact dans le backend
const slugToCategorie = {
  'cardiologie': 'Cardiologie',
  'neurologie': 'Neurologie',
  'medecine-generale': 'Médecine Générale',
  'monitoring': 'Monitoring',
  'laboratoire': 'Laboratoire',
  'chirurgie': 'Chirurgie',
  'imagerie': 'Imagerie Médicale',
  'pharmacie': 'Pharmacie',
};

const CategoryCards = () => {
  const [counts, setCounts] = useState({});

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const data = await getAnnonces(1);
        const items = data.data || [];
        const c = {};
        items.forEach((a) => {
          if (a.categorie) c[a.categorie] = (c[a.categorie] || 0) + 1;
        });
        setCounts(c);
      } catch (_) {
        // En cas d'erreur, on affiche sans compteur
      }
    };
    fetchCounts();
  }, []);

  return (
    <section className='py-20 bg-white'>
      <div className='container px-4 mx-auto'>
        <motion.div
          className='mb-12 text-center'
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className='mb-4 text-4xl font-bold'>
            Parcourir par
            <span className='bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] bg-clip-text text-transparent'> Spécialité</span>
          </h2>
          <p className='text-lg text-gray-600'>Trouvez l'équipement médical dont vous avez besoin</p>
        </motion.div>

        <div className='grid grid-cols-2 gap-6 md:grid-cols-4'>
          {CATEGORIES.map((category, index) => {
            const backendName = slugToCategorie[category.slug];
            const count = counts[backendName] || 0;
            return (
              <motion.div
                key={category.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={`/categories/${category.slug}`}>
                  <Card hover={true} className='h-48 overflow-hidden cursor-pointer group'>
                    <div className='relative h-full'>
                      <img
                        src={category.image}
                        alt={category.name}
                        className='absolute inset-0 object-cover w-full h-full transition-transform duration-500 group-hover:scale-110'
                      />
                      <div className={`absolute inset-0 bg-gradient-to-br ${category.color} transition-opacity duration-300`} />
                      <div className='relative z-10 flex flex-col justify-end h-full p-4 text-white'>
                        <h3 className='text-lg font-bold leading-tight'>{category.name}</h3>
                        {count > 0 && (
                          <p className='text-xs text-white/80 mt-0.5'>{count} équipement{count > 1 ? 's' : ''}</p>
                        )}
                      </div>
                      <div className='absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-t from-black/40 to-transparent group-hover:opacity-100' />
                    </div>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          className='mt-12 text-center'
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Link to='/categories'>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className='px-8 py-3 border-2 border-[#1DBF73] text-[#1DBF73] rounded-lg font-semibold hover:bg-[#1DBF73] hover:text-white transition-all'
            >
              Voir toutes les catégories
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default CategoryCards;
