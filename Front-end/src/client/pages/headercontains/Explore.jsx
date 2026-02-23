import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Heart,
  Eye,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useLang } from '../../context/LangContext';

const Explore = () => {
  const { t } = useLang();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [location, setLocation] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState([]);
  const itemsPerPage = 3; // TROIS ANNONCES PAR PAGE

  const [allEquipments] = useState([
    {
      id: 1,
      title: 'Échographe GE Voluson E10',
      price: 45000,
      currency: 'EUR',
      condition: 'Neuf',
      category: 'Imagerie Médicale',
      location: 'Cotonou, Bénin',
      image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=500',
      seller: 'MediTech Solutions',
      views: 234,
      date: '2025-02-10',
      featured: true
    },
    {
      id: 2,
      title: 'Électrocardiographe 12 dérivations',
      price: 2500,
      currency: 'EUR',
      condition: 'Occasion',
      category: 'Cardiologie',
      location: 'Paris, France',
      image: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=500',
      seller: 'CardioPlus',
      views: 156,
      date: '2025-02-09',
      featured: false
    },
    {
      id: 3,
      title: 'Analyseur de sang automatique',
      price: 15000,
      currency: 'USD',
      condition: 'Reconditionné',
      category: 'Laboratoire',
      location: 'Abidjan, Côte d\'Ivoire',
      image: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=500',
      seller: 'LabEquip Africa',
      views: 89,
      date: '2025-02-08',
      featured: true
    },
    {
      id: 4,
      title: 'Table d\'opération électrique',
      price: 8500,
      currency: 'EUR',
      condition: 'Neuf',
      category: 'Chirurgie',
      location: 'Dakar, Sénégal',
      image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=500',
      seller: 'SurgicalPro',
      views: 312,
      date: '2025-02-07',
      featured: false
    },
    {
      id: 5,
      title: 'Moniteur Patient 5 paramètres',
      price: 3200,
      currency: 'EUR',
      condition: 'Occasion',
      category: 'Monitoring',
      location: 'Lomé, Togo',
      image: 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=500',
      seller: 'MonitorTech',
      views: 198,
      date: '2025-02-06',
      featured: true
    },
    {
      id: 6,
      title: 'Défibrillateur automatique',
      price: 1800,
      currency: 'USD',
      condition: 'Neuf',
      category: 'Urgence',
      location: 'Douala, Cameroun',
      image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=500',
      seller: 'EmergencyMed',
      views: 445,
      date: '2025-02-05',
      featured: false
    },
    {
      id: 7,
      title: 'Lit médicalisé électrique 3 fonctions',
      price: 1200,
      currency: 'EUR',
      condition: 'Occasion',
      category: 'Mobilier Médical',
      location: 'Niamey, Niger',
      image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=500',
      seller: 'HospitalFurniture',
      views: 267,
      date: '2025-02-04',
      featured: false
    },
    {
      id: 8,
      title: 'Autoclave stérilisateur 23L',
      price: 950,
      currency: 'EUR',
      condition: 'Reconditionné',
      category: 'Stérilisation',
      location: 'Ouagadougou, Burkina Faso',
      image: 'https://images.unsplash.com/photo-1583911860205-72f8ac8ddcbe?w=500',
      seller: 'SterileTech',
      views: 134,
      date: '2025-02-03',
      featured: true
    },
    {
      id: 9,
      title: 'Microscope binoculaire LED',
      price: 3500,
      currency: 'EUR',
      condition: 'Neuf',
      category: 'Laboratoire',
      location: 'Cotonou, Bénin',
      image: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=500',
      seller: 'LabTech',
      views: 178,
      date: '2025-02-02',
      featured: false
    },
    {
      id: 10,
      title: 'Respirateur artificiel portable',
      price: 12000,
      currency: 'EUR',
      condition: 'Occasion',
      category: 'Urgence',
      location: 'Paris, France',
      image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=500',
      seller: 'RespiCare',
      views: 523,
      date: '2025-02-01',
      featured: true
    },
    {
      id: 11,
      title: 'Scanner IRM Siemens',
      price: 125000,
      currency: 'EUR',
      condition: 'Reconditionné',
      category: 'Imagerie Médicale',
      location: 'Abidjan, Côte d\'Ivoire',
      image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=500',
      seller: 'ImagingPro',
      views: 892,
      date: '2025-01-31',
      featured: true
    },
    {
      id: 12,
      title: 'Lampe scialytique opératoire',
      price: 4500,
      currency: 'EUR',
      condition: 'Neuf',
      category: 'Chirurgie',
      location: 'Dakar, Sénégal',
      image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=500',
      seller: 'SurgeryLight',
      views: 156,
      date: '2025-01-30',
      featured: false
    },
  ]);

  const categories = [
    'Imagerie Médicale',
    'Cardiologie', 
    'Laboratoire',
    'Chirurgie',
    'Monitoring',
    'Urgence',
    'Mobilier Médical',
    'Stérilisation'
  ];

  const conditions = ['Neuf', 'Occasion', 'Reconditionné'];
  
  const locations = [
    'Cotonou, Bénin',
    'Paris, France',
    'Abidjan, Côte d\'Ivoire',
    'Dakar, Sénégal',
    'Lomé, Togo',
    'Douala, Cameroun',
    'Niamey, Niger',
    'Ouagadougou, Burkina Faso'
  ];

  const filteredEquipments = allEquipments.filter(item => {
    const matchSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchCondition = selectedCondition === 'all' || item.condition === selectedCondition;
    const matchLocation = location === 'all' || item.location === location;
    
    let matchPrice = true;
    if (priceRange === 'low') matchPrice = item.price < 5000;
    if (priceRange === 'medium') matchPrice = item.price >= 5000 && item.price < 15000;
    if (priceRange === 'high') matchPrice = item.price >= 15000;

    return matchSearch && matchCategory && matchCondition && matchLocation && matchPrice;
  });

  const totalPages = Math.ceil(filteredEquipments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentEquipments = filteredEquipments.slice(startIndex, startIndex + itemsPerPage);

  const handleFavorite = (id) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(fav => fav !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedCondition('all');
    setPriceRange('all');
    setLocation('all');
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedCondition, priceRange, location]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* SECTION TITRE */}
      <div className="bg-white border-b border-gray-200">
        <div className="container px-6 py-8 mx-auto max-w-7xl">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Explorer les Équipements Médicaux
          </h1>
          <p className="text-gray-600">
            {filteredEquipments.length} équipements disponibles
          </p>
        </div>
      </div>

      {/* BARRE DE FILTRES HORIZONTALE */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="container px-6 py-4 mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center gap-3">
            {/* Recherche */}
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher..."
                className="w-full py-2.5 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#1DBF73] focus:ring-1 focus:ring-[#1DBF73]"
              />
            </div>

            {/* Catégorie */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#1DBF73] focus:ring-1 focus:ring-[#1DBF73] bg-white"
            >
              <option value="all">Toutes les catégories</option>
              {categories.map((cat, i) => (
                <option key={i} value={cat}>{cat}</option>
              ))}
            </select>

            {/* État */}
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#1DBF73] focus:ring-1 focus:ring-[#1DBF73] bg-white"
            >
              <option value="all">État</option>
              {conditions.map((cond, i) => (
                <option key={i} value={cond}>{cond}</option>
              ))}
            </select>

            {/* Prix */}
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#1DBF73] focus:ring-1 focus:ring-[#1DBF73] bg-white"
            >
              <option value="all">Prix</option>
              <option value="low">&lt; 5 000€</option>
              <option value="medium">5 000€ - 15 000€</option>
              <option value="high">&gt; 15 000€</option>
            </select>

            {/* Localisation */}
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#1DBF73] focus:ring-1 focus:ring-[#1DBF73] bg-white"
            >
              <option value="all">Localisation</option>
              {locations.map((loc, i) => (
                <option key={i} value={loc}>{loc}</option>
              ))}
            </select>

            {/* Réinitialiser */}
            <button
              onClick={resetFilters}
              className="px-4 py-2.5 text-sm font-medium text-[#1DBF73] hover:bg-[#1DBF73]/5 rounded-lg transition-colors"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* CONTENU PRINCIPAL */}
      <div className="container px-6 py-8 mx-auto max-w-7xl">
        {currentEquipments.length === 0 ? (
          <div className="py-20 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gray-100 rounded-full">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <p className="mb-4 text-xl text-gray-500">Aucun équipement trouvé</p>
            <button
              onClick={resetFilters}
              className="px-6 py-2.5 text-white rounded-lg bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] hover:shadow-lg transition-all font-medium"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <>
            {/* 3 CARTES CÔTE À CÔTE ENTRE LES FLÈCHES */}
            <div className="px-6 py-16 -mx-6 bg-gray-50">
              <div className="container mx-auto">
                <div className="relative mx-auto max-w-7xl">
                  {/* Flèche gauche - TRÈS ÉLOIGNÉE */}
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="absolute left-0 z-10 p-4 transition-all duration-300 -translate-x-8 -translate-y-1/2 bg-white rounded-full shadow-lg top-1/2 md:-translate-x-20 hover:bg-gray-100 hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
                    aria-label="Page précédente"
                  >
                    <ChevronLeft className="text-gray-700 w-7 h-7" />
                  </button>

                  {/* CONTENU - 3 CARTES */}
                  <div className="p-8 bg-white shadow-xl rounded-2xl">
                    <motion.div
                      key={currentPage}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="grid grid-cols-1 gap-6 md:grid-cols-3"
                    >
                      {currentEquipments.map((item) => (
                        <motion.div
                          key={item.id}
                          whileHover={{ y: -4 }}
                          className="overflow-hidden transition-all duration-300 border border-gray-100 shadow-sm bg-gray-50 rounded-xl hover:shadow-md"
                        >
                          {/* Image */}
                          <div className="relative overflow-hidden bg-gray-100 h-44">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="object-cover w-full h-full transition-transform duration-500 hover:scale-105"
                            />
                            {item.featured && (
                              <div className="absolute px-2 py-1 text-xs font-bold text-white bg-yellow-500 rounded-lg top-3 left-3">
                                À LA UNE
                              </div>
                            )}
                            <button
                              onClick={() => handleFavorite(item.id)}
                              className="absolute p-2 transition-all bg-white rounded-full shadow-md top-3 right-3 hover:scale-110"
                            >
                              <Heart
                                className={`w-4 h-4 ${
                                  favorites.includes(item.id)
                                    ? 'fill-red-500 text-red-500'
                                    : 'text-gray-600'
                                }`}
                              />
                            </button>
                            <div className="absolute px-2 py-1 text-xs font-semibold text-white rounded-lg bg-gray-900/80 bottom-3 right-3">
                              {item.condition}
                            </div>
                          </div>

                          {/* Contenu */}
                          <div className="p-4">
                            <div className="mb-2 text-xs font-semibold text-[#09B1BA] uppercase">
                              {item.category}
                            </div>
                            <h3 className="mb-3 text-base font-bold text-gray-900 line-clamp-2 min-h-[48px]">
                              {item.title}
                            </h3>

                            <div className="flex items-center gap-1 mb-3 text-xs text-gray-500">
                              <MapPin className="w-3.5 h-3.5" />
                              <span className="truncate">{item.location}</span>
                            </div>

                            <div className="mb-4">
                              <div className="text-xl font-bold text-[#1DBF73]">
                                {item.price.toLocaleString()} {item.currency}
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-3 mb-3 border-t border-gray-200">
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Eye className="w-3.5 h-3.5" />
                                {item.views}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Calendar className="w-3.5 h-3.5" />
                                {new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                              </div>
                            </div>

                            <Link
                              to={`/equipment/${item.id}`}
                              className="block w-full py-2.5 text-center text-sm font-semibold text-white transition-all rounded-xl bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] hover:shadow-md"
                            >
                              Voir détails
                            </Link>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>

                    {/* Pagination dots */}
                    {totalPages > 1 && (
                      <div className="flex justify-center gap-2 mt-8">
                        {Array.from({ length: totalPages }, (_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentPage(index + 1)}
                            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                              index + 1 === currentPage
                                ? 'bg-gray-900 w-8'
                                : 'bg-gray-300 hover:bg-gray-400'
                            }`}
                            aria-label={`Aller à la page ${index + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Flèche droite - TRÈS ÉLOIGNÉE */}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="absolute right-0 z-10 p-4 transition-all duration-300 translate-x-8 -translate-y-1/2 bg-white rounded-full shadow-lg top-1/2 md:translate-x-20 hover:bg-gray-100 hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
                    aria-label="Page suivante"
                  >
                    <ChevronRight className="text-gray-700 w-7 h-7" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Explore;