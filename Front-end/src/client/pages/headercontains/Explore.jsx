import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  MapPin,
  Heart,
  Eye,
  Calendar,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useLang } from '../../context/LangContext';
import { getAnnonces, searchAnnonces, getImageUrl } from '../../../services/api';

const CATEGORIES = [
  'Toutes',
  'Imagerie Médicale',
  'Cardiologie',
  'Laboratoire',
  'Chirurgie',
  'Monitoring',
  'Urgence',
  'Mobilier Médical',
  'Stérilisation',
  'Neurologie',
  'Médecine Générale',
  'Pharmacie',
];

const CONDITIONS = ['Tous', 'Neuf', 'Occasion', 'Reconditionné'];

const Explore = () => {
  const { t } = useLang();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialQuery = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [inputValue, setInputValue] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState('Toutes');
  const [selectedCondition, setSelectedCondition] = useState('Tous');
  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [favorites, setFavorites] = useState([]);

  const fetchAnnonces = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      let data;
      if (searchQuery.trim()) {
        data = await searchAnnonces(searchQuery.trim(), currentPage);
      } else {
        data = await getAnnonces(currentPage);
      }
      const items = data.data || [];
      setLastPage(data.last_page || 1);

      // Filtrage côté client pour catégorie et état
      let filtered = items;
      if (selectedCategory !== 'Toutes') {
        filtered = filtered.filter(
          (a) => a.categorie === selectedCategory
        );
      }
      if (selectedCondition !== 'Tous') {
        filtered = filtered.filter((a) => a.etat === selectedCondition);
      }
      setAnnonces(filtered);
    } catch (err) {
      setError('Impossible de charger les équipements. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, currentPage, selectedCategory, selectedCondition]);

  useEffect(() => {
    fetchAnnonces();
  }, [fetchAnnonces]);

  // Reset page quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedCondition]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(inputValue);
    setCurrentPage(1);
  };

  const handleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <Header />

      <div className='container max-w-6xl px-4 py-10 mx-auto'>
        {/* En-tête */}
        <div className='mb-8'>
          <h1 className='mb-2 text-4xl font-bold text-gray-900'>
            Explorer les{' '}
            <span className='bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] bg-clip-text text-transparent'>
              équipements
            </span>
          </h1>
          <p className='text-gray-500'>Trouvez l'équipement médical dont vous avez besoin</p>
        </div>

        {/* Barre de recherche */}
        <form onSubmit={handleSearch} className='mb-6'>
          <div className='relative'>
            <Search className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
            <input
              type='text'
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder='Rechercher un équipement...'
              className='w-full pl-12 pr-32 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#1DBF73] transition-all'
            />
            <button
              type='submit'
              className='absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white font-semibold rounded-lg'
            >
              Rechercher
            </button>
          </div>
        </form>

        {/* Filtres */}
        <div className='flex flex-wrap gap-3 mb-8'>
          {/* Catégories */}
          <div className='flex flex-wrap gap-2'>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#1DBF73] text-white border-[#1DBF73]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-[#1DBF73]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* État */}
          <div className='flex gap-2 ml-auto'>
            {CONDITIONS.map((cond) => (
              <button
                key={cond}
                onClick={() => setSelectedCondition(cond)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  selectedCondition === cond
                    ? 'bg-[#09B1BA] text-white border-[#09B1BA]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-[#09B1BA]'
                }`}
              >
                {cond}
              </button>
            ))}
          </div>
        </div>

        {/* Contenu */}
        {error && (
          <div className='flex items-center gap-2 p-4 mb-6 text-red-700 bg-red-50 border border-red-200 rounded-xl'>
            <AlertCircle className='w-5 h-5 shrink-0' />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className='flex justify-center py-20'>
            <div className='w-10 h-10 border-4 border-[#1DBF73] rounded-full border-t-transparent animate-spin' />
          </div>
        ) : annonces.length === 0 ? (
          <div className='py-20 text-center bg-white border border-gray-100 rounded-2xl'>
            <p className='text-xl font-bold text-gray-700'>Aucun équipement trouvé</p>
            <p className='mt-2 text-gray-400'>Essayez de modifier vos filtres ou votre recherche</p>
            <button
              onClick={() => {
                setSelectedCategory('Toutes');
                setSelectedCondition('Tous');
                setSearchQuery('');
                setInputValue('');
              }}
              className='mt-6 px-6 py-3 bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white font-semibold rounded-xl'
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <>
            <p className='mb-4 text-sm text-gray-500'>{annonces.length} équipement(s) trouvé(s)</p>
            <div className='relative'>
              <motion.div
                className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {annonces.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className='overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-xl transition-all group'
                  >
                    {/* Image */}
                    <div className='relative overflow-hidden bg-gray-100 h-48'>
                      {item.images?.[0] ? (
                        <img
                          src={getImageUrl(item.images[0].image_url)}
                          alt={item.titre}
                          className='object-cover w-full h-full transition-transform duration-500 group-hover:scale-105'
                        />
                      ) : (
                        <div className='flex items-center justify-center w-full h-full'>
                          <span className='text-5xl'>🏥</span>
                        </div>
                      )}
                      <button
                        onClick={() => handleFavorite(item.id)}
                        className='absolute p-2 transition-all bg-white rounded-full shadow-md top-3 right-3 hover:scale-110'
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            favorites.includes(item.id)
                              ? 'fill-red-500 text-red-500'
                              : 'text-gray-400'
                          }`}
                        />
                      </button>
                      <div className='absolute px-2 py-1 text-xs font-semibold text-white rounded-lg bg-gray-900/80 bottom-3 left-3'>
                        {item.etat}
                      </div>
                    </div>

                    {/* Contenu */}
                    <div className='p-4'>
                      <div className='mb-1 text-xs font-semibold text-[#09B1BA] uppercase'>
                        {item.categorie}
                      </div>
                      <h3 className='mb-3 text-base font-bold text-gray-900 line-clamp-2 min-h-[48px]'>
                        {item.titre}
                      </h3>

                      <div className='flex items-center gap-1 mb-3 text-xs text-gray-500'>
                        <MapPin className='w-3.5 h-3.5' />
                        <span className='truncate'>{item.pays_expedition || 'Non précisé'}</span>
                      </div>

                      <div className='mb-4'>
                        <div className='text-xl font-bold text-[#1DBF73]'>
                          {Number(item.prix_vendeur).toLocaleString()}
                          <span className='ml-1 text-sm font-normal text-gray-400'>FCFA</span>
                        </div>
                      </div>

                      <div className='flex items-center justify-between pt-3 mb-3 border-t border-gray-100 text-xs text-gray-400'>
                        <span>{item.vendeur?.nom || 'Vendeur'}</span>
                        <div className='flex items-center gap-1'>
                          <Calendar className='w-3.5 h-3.5' />
                          {new Date(item.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </div>
                      </div>

                      <Link
                        to={`/equipment/${item.id}`}
                        className='block w-full py-2.5 text-center text-sm font-semibold text-white transition-all rounded-xl bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] hover:shadow-md'
                      >
                        Voir détails
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Pagination */}
              {lastPage > 1 && (
                <div className='flex items-center justify-center gap-4 mt-10'>
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className='p-3 bg-white rounded-full shadow-md hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed'
                  >
                    <ChevronLeft className='w-5 h-5 text-gray-700' />
                  </button>
                  <div className='flex gap-2'>
                    {Array.from({ length: lastPage }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-9 h-9 rounded-full font-semibold text-sm transition-all ${
                          currentPage === i + 1
                            ? 'bg-[#1DBF73] text-white shadow-md'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(lastPage, p + 1))}
                    disabled={currentPage === lastPage}
                    className='p-3 bg-white rounded-full shadow-md hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed'
                  >
                    <ChevronRight className='w-5 h-5 text-gray-700' />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Explore;
