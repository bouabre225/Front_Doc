import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, Heart, Calendar,
  ChevronLeft, ChevronRight, AlertCircle, X, SlidersHorizontal
} from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { getAnnonces, searchAnnonces, getImageUrl } from '../../../services/api';
import ImageViewer from '../../components/common/ImageViewer';
import { useImageViewer } from '../../../hooks/useImageViewer';

// ─── Constantes ──────────────────────────────────────────────────────────────

const CATEGORIES = [
  'Toutes', 'Imagerie Médicale', 'Cardiologie', 'Laboratoire',
  'Chirurgie', 'Monitoring', 'Urgence', 'Mobilier Médical',
  'Stérilisation', 'Neurologie', 'Médecine Générale', 'Ophtalmologie', 'Pièces de rechange', 'Autres'
];

const CONDITIONS = ['Tous', 'neuf', 'occasion', 'reconditionne'];

const CONDITION_LABELS = {
  Tous: 'Tous',
  neuf: 'Neuf',
  occasion: 'Occasion',
  reconditionne: 'Reconditionné',
};

const SORTS = [
  { key: 'recent',    label: 'Plus récents' },
  { key: 'prix_asc',  label: 'Prix ↑' },
  { key: 'prix_desc', label: 'Prix ↓' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const conditionStyle = (etat) => {
  if (!etat) return 'bg-gray-700/80 text-white';
  const e = etat.toLowerCase();
  if (e === 'neuf')          return 'bg-emerald-500/90 text-white';
  if (e === 'occasion')      return 'bg-amber-400/90 text-white';
  if (e.includes('recon'))   return 'bg-blue-500/90 text-white';
  return 'bg-gray-700/80 text-white';
};

// ─── Skeleton ────────────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div className='overflow-hidden bg-white border border-gray-100 rounded-2xl animate-pulse'>
    <div className='h-48 bg-gray-200' />
    <div className='p-4 space-y-3'>
      <div className='h-3 bg-gray-200 rounded w-1/3' />
      <div className='h-4 bg-gray-200 rounded w-full' />
      <div className='h-4 bg-gray-200 rounded w-3/4' />
      <div className='h-3 bg-gray-200 rounded w-1/2' />
      <div className='h-6 bg-gray-200 rounded w-1/3 mt-2' />
      <div className='h-9 bg-gray-200 rounded-xl mt-3' />
    </div>
  </div>
);

// ─── Pagination ───────────────────────────────────────────────────────────────

const Pagination = ({ current, last, onChange }) => {
  if (last <= 1) return null;

  // Affiche max 5 pages autour de la page courante
  const getPages = () => {
    const pages = [];
    const delta = 2;
    const left  = Math.max(1, current - delta);
    const right = Math.min(last, current + delta);

    if (left > 1) { pages.push(1); if (left > 2) pages.push('...'); }
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < last) { if (right < last - 1) pages.push('...'); pages.push(last); }
    return pages;
  };

  return (
    <div className='flex items-center justify-center gap-2 mt-10'>
      <button
        onClick={() => onChange(Math.max(1, current - 1))}
        disabled={current === 1}
        className='p-2.5 bg-white rounded-full shadow-sm border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all'
      >
        <ChevronLeft className='w-4 h-4 text-gray-700' />
      </button>

      <div className='flex gap-1.5'>
        {getPages().map((p, i) =>
          p === '...' ? (
            <span key={`dots-${i}`} className='w-9 h-9 flex items-center justify-center text-gray-400 text-sm'>…</span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              className={`w-9 h-9 rounded-full font-semibold text-sm transition-all ${
                current === p
                  ? 'bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white shadow-md'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-[#1DBF73]/50'
              }`}
            >
              {p}
            </button>
          )
        )}
      </div>

      <button
        onClick={() => onChange(Math.min(last, current + 1))}
        disabled={current === last}
        className='p-2.5 bg-white rounded-full shadow-sm border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all'
      >
        <ChevronRight className='w-4 h-4 text-gray-700' />
      </button>
    </div>
  );
};

// ─── Composant principal ─────────────────────────────────────────────────────

const Explore = () => {
  const location     = useLocation();
  const initialQuery = new URLSearchParams(location.search).get('q') || '';

  const [inputValue,         setInputValue]         = useState(initialQuery);
  const [searchQuery,        setSearchQuery]         = useState(initialQuery);
  const [selectedCategory,   setSelectedCategory]   = useState('Toutes');
  const [selectedCondition,  setSelectedCondition]  = useState('Tous');
  const [sortBy,             setSortBy]             = useState('recent');
  const [sortOpen,           setSortOpen]           = useState(false);
  const [annonces,           setAnnonces]           = useState([]);
  const [loading,            setLoading]            = useState(true);
  const [error,              setError]              = useState('');
  const [currentPage,        setCurrentPage]        = useState(1);
  const [lastPage,           setLastPage]           = useState(1);
  const [total,              setTotal]              = useState(0);
  const [favorites,          setFavorites]          = useState(() => {
    try { return JSON.parse(localStorage.getItem('favorites') || '[]'); }
    catch { return []; }
  });

  const { viewer, openViewer, closeViewer } = useImageViewer();

  // ─── Fetch ──────────────────────────────────────────────────────────────
  const fetchAnnonces = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};

      // Envoie la catégorie à l'API
      if (selectedCategory !== 'Toutes') {
        params.categorie = selectedCategory;
      }

      // Envoie l'état à l'API
      if (selectedCondition !== 'Tous') {
        params.etat = selectedCondition;
      }

      // Envoie le tri
      if (sortBy === 'prix_asc')  params.sort = 'prix_asc';
      if (sortBy === 'prix_desc') params.sort = 'prix_desc';

      const data = searchQuery.trim()
        ? await searchAnnonces(searchQuery.trim(), currentPage, params) //passe params
        : await getAnnonces(currentPage, params); //passe les params

      const raw   = data.data ?? data ?? [];
      const items = Array.isArray(raw) ? raw : [];

      setLastPage(data.last_page || 1);
      setTotal(data.total || items.length);

      //Plus de filtrage côté client — l'API s'en charge
      // Tri local seulement si recherche (searchAnnonces ne supporte pas les params)
      let filtered = [...items];
      if (searchQuery.trim()) {
        if (sortBy === 'prix_asc')  filtered.sort((a, b) => Number(a.prix_vendeur) - Number(b.prix_vendeur));
        if (sortBy === 'prix_desc') filtered.sort((a, b) => Number(b.prix_vendeur) - Number(a.prix_vendeur));
        if (selectedCategory !== 'Toutes') {
          filtered = filtered.filter(a => a.categorie?.toLowerCase().includes(selectedCategory.toLowerCase()));
        }
        if (selectedCondition !== 'Tous') {
          filtered = filtered.filter(a => {
            if (!a.etat) return false;
            const e = a.etat.toLowerCase();
            const s = selectedCondition.toLowerCase();
            return s.includes('recon') ? e.includes('recon') : e === s;
          });
        }
      }

      setAnnonces(filtered);
    } catch {
      setError('Impossible de charger les équipements. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, currentPage, selectedCategory, selectedCondition, sortBy]);

  useEffect(() => { fetchAnnonces(); }, [fetchAnnonces]);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, selectedCategory, selectedCondition, sortBy]);

  // ─── Favoris ────────────────────────────────────────────────────────────
  const handleFavorite = (id) => {
    setFavorites(prev => {
      const updated = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      localStorage.setItem('favorites', JSON.stringify(updated));
      return updated;
    });
  };

  // ─── Reset ───────────────────────────────────────────────────────────────
  const handleReset = () => {
    setSelectedCategory('Toutes');
    setSelectedCondition('Tous');
    setSearchQuery('');
    setInputValue('');
    setSortBy('recent');
    setCurrentPage(1);
  };

  const hasActiveFilters = selectedCategory !== 'Toutes' || selectedCondition !== 'Tous' || searchQuery;

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className='min-h-screen bg-gray-50'>
      <Header />

      <div className='container max-w-6xl px-4 py-10 mx-auto'>

        {/* Header */}
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
        <form onSubmit={(e) => { e.preventDefault(); setSearchQuery(inputValue); setCurrentPage(1); }} className='mb-6'>
          <div className='relative'>
            <Search className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
            <input
              type='text'
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder='Rechercher un équipement médical...'
              className='w-full pl-12 pr-36 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 transition-all bg-white'
            />
            {inputValue && (
              <button
                type='button'
                onClick={() => { setInputValue(''); setSearchQuery(''); }}
                className='absolute right-28 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'
              >
                <X className='w-4 h-4' />
              </button>
            )}
            <button
              type='submit'
              className='absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white font-semibold rounded-lg text-sm'
            >
              Rechercher
            </button>
          </div>
        </form>

        {/* Filtres */}
        <div className='mb-6 space-y-3'>
          {/* Catégories */}
          <div className='flex flex-wrap gap-2'>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#1DBF73] text-white border-[#1DBF73] shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-[#1DBF73]/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* État + Tri + Reset */}
          <div className='flex flex-wrap items-center gap-2'>
            {CONDITIONS.map(cond => (
              <button
                key={cond}
                onClick={() => setSelectedCondition(cond)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  selectedCondition === cond
                    ? 'bg-[#09B1BA] text-white border-[#09B1BA] shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-[#09B1BA]/50'
                }`}
              >
                {CONDITION_LABELS[cond]}
              </button>
            ))}

            {/* Tri */}
            <div className='relative ml-2'>
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  sortBy !== 'recent'
                    ? 'border-[#1DBF73] text-[#1DBF73] bg-[#1DBF73]/5'
                    : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                <SlidersHorizontal className='w-3.5 h-3.5' />
                {SORTS.find(s => s.key === sortBy)?.label}
              </button>
              <AnimatePresence>
                {sortOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className='absolute left-0 mt-2 w-44 bg-white border border-gray-100 shadow-xl rounded-2xl overflow-hidden z-20'
                  >
                    {SORTS.map(opt => (
                      <button
                        key={opt.key}
                        onClick={() => { setSortBy(opt.key); setSortOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-xs transition-colors ${
                          sortBy === opt.key
                            ? 'bg-[#1DBF73]/10 text-[#1DBF73] font-semibold'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Reset filtres */}
            {hasActiveFilters && (
              <button
                onClick={handleReset}
                className='flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-red-400 bg-red-50 border border-red-100 hover:bg-red-100 transition-all ml-auto'
              >
                <X className='w-3 h-3' />
                Réinitialiser
              </button>
            )}
          </div>
        </div>

        {/* Erreur */}
        {error && (
          <div className='flex items-center gap-2 p-4 mb-6 text-red-700 bg-red-50 border border-red-200 rounded-xl'>
            <AlertCircle className='w-5 h-5 shrink-0' />
            <span className='text-sm'>{error}</span>
            <button onClick={fetchAnnonces} className='ml-auto text-xs font-semibold underline'>Réessayer</button>
          </div>
        )}

        {/* Résultats */}
        {!error && (
          <>
            {!loading && annonces.length > 0 && (
              <p className='mb-4 text-sm text-gray-400'>
                {annonces.length} équipement{annonces.length > 1 ? 's' : ''} affiché{annonces.length > 1 ? 's' : ''}
                {total > annonces.length ? ` sur ${total}` : ''}
              </p>
            )}

            {loading ? (
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : annonces.length === 0 ? (
              <div className='py-20 text-center bg-white border border-gray-100 rounded-2xl'>
                <div className='text-5xl mb-4'>🔍</div>
                <p className='text-xl font-bold text-gray-700'>Aucun équipement trouvé</p>
                <p className='mt-2 text-sm text-gray-400'>Essayez de modifier vos filtres ou votre recherche</p>
                <button
                  onClick={handleReset}
                  className='mt-6 px-6 py-3 bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white font-semibold rounded-xl'
                >
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <>
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
                      transition={{ delay: index * 0.04 }}
                      className='overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-xl transition-all group'
                    >
                      {/* Image */}
                      <div className='relative overflow-hidden bg-gray-100 h-48'>
                        {item.images?.[0] ? (
                          <img
                            src={getImageUrl(item.images[0].image_url)}
                            alt={item.titre}
                            className='object-cover w-full h-full transition-transform duration-500 group-hover:scale-105 cursor-zoom-in'
                            onClick={() => openViewer(item.images, 0, item.titre)}                          
                          />
                        ) : (
                          <div className='flex items-center justify-center w-full h-full text-5xl'>🏥</div>
                        )}

                        {viewer.open && (
                          <ImageViewer
                            images={viewer.images}
                            initialIndex={viewer.index}
                            titre={viewer.titre}
                            onClose={closeViewer}
                          />
                        )}

                        {/* Favori */}
                        <button
                          onClick={() => handleFavorite(item.id)}
                          className='absolute p-2 transition-all bg-white/90 backdrop-blur-sm rounded-full shadow-md top-3 right-3 hover:scale-110'
                        >
                          <Heart className={`w-4 h-4 transition-colors ${
                            favorites.includes(item.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'
                          }`} />
                        </button>

                        {/* Etat */}
                        {item.etat && (
                          <span className={`absolute bottom-3 left-3 px-2.5 py-1 text-xs font-bold rounded-lg capitalize ${conditionStyle(item.etat)}`}>
                            {item.etat}
                          </span>
                        )}
                      </div>

                      {/* Contenu */}
                      <div className='p-4'>
                        {item.categorie && (
                          <div className='mb-1 text-xs font-semibold text-[#09B1BA] uppercase tracking-wide'>
                            {item.categorie}
                          </div>
                        )}
                        <h3 className='mb-3 text-base font-bold text-gray-900 line-clamp-2 min-h-[48px] group-hover:text-[#1DBF73] transition-colors'>
                          {item.titre}
                        </h3>

                        <div className='flex items-center gap-1 mb-3 text-xs text-gray-400'>
                          <MapPin className='w-3.5 h-3.5 text-[#1DBF73]' />
                          <span className='truncate'>{item.pays_expedition || 'Non précisé'}</span>
                        </div>

                        {/* Prix */}
                        <div className='mb-3'>
                          <div className='text-xl font-bold text-[#1DBF73]'>
                            {Number(item.prix_vendeur).toLocaleString('fr-FR')}
                            <span className='ml-1 text-sm font-normal text-gray-400'>FCFA</span>
                          </div>
                          <div className='flex items-center gap-1 mt-0.5'>
                            <span className='text-xs text-gray-400'>Prix total :</span>
                            <span className='text-xs font-semibold text-gray-600'>
                              {Math.round(Number(item.prix_vendeur) * 1.08).toLocaleString('fr-FR')} FCFA
                            </span>
                            <span className='text-[10px] bg-[#09B1BA]/10 text-[#09B1BA] px-1.5 py-0.5 rounded-full font-semibold'>
                              🛡️ +8%
                            </span>
                          </div>
                        </div>

                        <div className='flex items-center justify-between pt-3 mb-3 border-t border-gray-100 text-xs text-gray-400'>
                          <span className='truncate max-w-[100px]'>{item.vendeur?.nom || 'Vendeur'}</span>
                          <div className='flex items-center gap-1 shrink-0'>
                            <Calendar className='w-3.5 h-3.5' />
                            {item.created_at ? new Date(item.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '—'}
                          </div>
                        </div>

                        <Link
                          to={`/equipment/${item.id}`}
                          className='block w-full py-2.5 text-center text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] hover:shadow-md transition-all'
                        >
                          Voir détails
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                <Pagination current={currentPage} last={lastPage} onChange={setCurrentPage} />
              </>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Explore;