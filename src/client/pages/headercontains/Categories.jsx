import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Filter, MapPin, Star, Search, SlidersHorizontal, X } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { getAnnonces, searchAnnonces, getImageUrl } from '../../../services/api';

// ─── Config catégories (UI seulement) ───────────────────────────────────────

const CATEGORIES_CONFIG = {
  cardiologie:        { name: 'Cardiologie',       color: 'from-red-500 to-pink-600',      bgLight: 'bg-red-50',      textColor: 'text-red-500',    emoji: '❤️',  image: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=800&fit=crop' },
  neurologie:         { name: 'Neurologie',         color: 'from-purple-500 to-indigo-600', bgLight: 'bg-purple-50',   textColor: 'text-purple-500', emoji: '🧠',  image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&fit=crop' },
  medecine_generale:  { name: 'Médecine Générale',  color: 'from-blue-500 to-sky-600',      bgLight: 'bg-blue-50',     textColor: 'text-blue-500',   emoji: '🩺',  image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&fit=crop' },
  monitoring:         { name: 'Monitoring',         color: 'from-green-500 to-emerald-600', bgLight: 'bg-green-50',    textColor: 'text-green-500',  emoji: '📊',  image: 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=800&fit=crop' },
  laboratoire:        { name: 'Laboratoire',        color: 'from-yellow-500 to-orange-500', bgLight: 'bg-yellow-50',   textColor: 'text-yellow-600', emoji: '🔬',  image: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800&fit=crop' },
  chirurgie:          { name: 'Chirurgie',          color: 'from-teal-500 to-cyan-600',     bgLight: 'bg-teal-50',     textColor: 'text-teal-500',   emoji: '🔪',  image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&fit=crop' },
  imagerie:           { name: 'Imagerie Médicale',  color: 'from-indigo-500 to-purple-600', bgLight: 'bg-indigo-50',   textColor: 'text-indigo-500', emoji: '🩻',  image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&fit=crop' },
  ophtalmologie:      { name: 'Ophtalmologie',      color: 'from-pink-500 to-rose-600',     bgLight: 'bg-pink-50',     textColor: 'text-pink-500',   emoji: '👁️',  image: 'https://images.unsplash.com/photo-1576089238240-df71dfc57cfa?w=800&fit=crop' },
  sterilisation:      { name: 'Stérilisation',      color: 'from-cyan-500 to-blue-600',     bgLight: 'bg-cyan-50',     textColor: 'text-cyan-500',   emoji: '🧼',  image: 'https://images.unsplash.com/photo-1583911860205-72f8ac8ddcbe?w=800&fit=crop' },
  mobilier:           { name: 'Mobilier Médical',   color: 'from-slate-500 to-gray-600',    bgLight: 'bg-slate-50',    textColor: 'text-slate-500',  emoji: '🛏️', image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&fit=crop' },
  urgence:            { name: 'Urgence',            color: 'from-red-600 to-orange-500',    bgLight: 'bg-red-50',      textColor: 'text-red-600',    emoji: '🚨',  image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&fit=crop' },
  pieces_rechange:    { name: 'Pièces de Rechange', color: 'from-gray-500 to-slate-600',    bgLight: 'bg-gray-50',     textColor: 'text-gray-600',   emoji: '⚙️',  image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop' },
  autres:             { name: 'Autres',             color: 'from-gray-500 to-slate-600',    bgLight: 'bg-gray-50',     textColor: 'text-gray-600',   emoji: '⚙️',  image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop' },
};

const ETATS = ['tous', 'neuf', 'occasion', 'reconditionne'];

const conditionStyle = (etat) => {
  if (!etat) return 'bg-gray-100 text-gray-600';
  const e = etat.toLowerCase();
  if (e === 'neuf') return 'bg-emerald-500 text-white';
  if (e === 'occasion') return 'bg-amber-400 text-white';
  return 'bg-blue-500 text-white';
};

// ─── Carte annonce ───────────────────────────────────────────────────────────

const AnnonceCard = ({ annonce, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 25 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.06 }}
  >
    <Link to={`/equipment/${annonce.id}`}>
      <div className='overflow-hidden transition-all duration-300 bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-xl group hover:-translate-y-1'>
        <div className='relative overflow-hidden h-52'>
          {annonce.images?.[0] ? (
            <img
              src={getImageUrl(annonce.images[0].image_url)}
              alt={annonce.titre}
              className='object-cover w-full h-full transition-transform duration-500 group-hover:scale-105'
            />
          ) : (
            <div className='flex items-center justify-center w-full h-full bg-gray-100 text-5xl'>🏥</div>
          )}
          <div className='absolute inset-0 transition-opacity opacity-0 bg-gradient-to-t from-black/20 to-transparent group-hover:opacity-100' />
          {annonce.etat && (
            <span className={`absolute top-3 left-3 px-2.5 py-1 text-xs font-bold rounded-lg capitalize ${conditionStyle(annonce.etat)}`}>
              {annonce.etat}
            </span>
          )}
        </div>

        <div className='p-5'>
          <h3 className='font-bold text-gray-900 text-base line-clamp-2 group-hover:text-[#1DBF73] transition-colors leading-snug mb-3'>
            {annonce.titre}
          </h3>
          <div className='flex items-center justify-between mb-4'>
            {annonce.pays_expedition && (
              <div className='flex items-center gap-1 text-xs text-gray-400'>
                <MapPin className='w-3.5 h-3.5 text-[#1DBF73]' />
                <span className='truncate max-w-[120px]'>{annonce.pays_expedition}</span>
              </div>
            )}
            {annonce.note_moyenne && (
              <div className='flex items-center gap-1 text-xs'>
                <Star className='w-3.5 h-3.5 text-yellow-400 fill-yellow-400' />
                <span className='font-semibold text-gray-700'>{annonce.note_moyenne}</span>
              </div>
            )}
          </div>
          <div className='flex items-center justify-between pt-3 border-t border-gray-100'>
            <div>
              <p className='text-xl font-black text-[#1DBF73]'>
                {Number(annonce.prix_vendeur).toLocaleString('fr-FR')}
                <span className='ml-1 text-sm font-medium text-gray-400'>FCFA</span>
              </p>
              <div className='flex items-center gap-1 mt-0.5'>
                <span className='text-xs text-gray-400'>Total :</span>
                <span className='text-xs font-semibold text-gray-600'>
                  {Math.round(Number(annonce.prix_vendeur) * 1.08).toLocaleString('fr-FR')} FCFA
                </span>
                <span className='text-[10px] bg-[#09B1BA]/10 text-[#09B1BA] px-1.5 py-0.5 rounded-full font-semibold'>
                  🛡️ +8%
                </span>
              </div>
            </div>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className='w-10 h-10 bg-gradient-to-br from-[#1DBF73] to-[#09B1BA] rounded-xl flex items-center justify-center shadow-md'
            >
              <ArrowRight className='w-4 h-4 text-white' />
            </motion.div>
          </div>
        </div>
      </div>
    </Link>
  </motion.div>
);

// ─── Skeleton loader ─────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div className='overflow-hidden bg-white border border-gray-100 rounded-2xl animate-pulse'>
    <div className='h-52 bg-gray-200' />
    <div className='p-5 space-y-3'>
      <div className='h-4 bg-gray-200 rounded w-3/4' />
      <div className='h-3 bg-gray-200 rounded w-1/2' />
      <div className='h-6 bg-gray-200 rounded w-1/3 mt-4' />
    </div>
  </div>
);

// ─── Page toutes les catégories ──────────────────────────────────────────────

const AllCategories = ({ counts }) => (
  <div className='min-h-screen bg-gray-50'>
    <Header />

    <div className='relative bg-white border-b border-gray-100'>
      <div className='absolute inset-0 bg-gradient-to-br from-[#1DBF73]/5 via-transparent to-[#09B1BA]/5' />
      <div className='container relative max-w-6xl px-4 py-16 mx-auto'>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className='max-w-xl'>
          <span className='inline-flex items-center gap-2 px-3 py-1 bg-[#1DBF73]/10 text-[#1DBF73] text-xs font-bold rounded-full mb-4 uppercase tracking-wide'>
            {Object.keys(CATEGORIES_CONFIG).length} Spécialités
          </span>
          <h1 className='mb-3 text-5xl font-black leading-tight text-gray-900'>
            Explorez par<br />
            <span className='bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] bg-clip-text text-transparent'>
              Catégorie
            </span>
          </h1>
          <p className='text-gray-500'>Trouvez rapidement l'équipement dont vous avez besoin parmi nos spécialités médicales.</p>
        </motion.div>
      </div>
    </div>

    <div className='container max-w-6xl px-4 py-12 mx-auto'>
      <div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4'>
        {Object.entries(CATEGORIES_CONFIG).map(([key, cat], index) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link to={`/categories/${key}`}>
              <div className='relative overflow-hidden transition-all duration-300 bg-white border border-gray-100 shadow-sm cursor-pointer group rounded-2xl hover:shadow-xl hover:-translate-y-1'>
                <div className='relative h-40 overflow-hidden'>
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className='object-cover w-full h-full transition-transform duration-500 group-hover:scale-110'
                  />
                  <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-70`} />
                  <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent' />
                  <div className='absolute top-3 right-3 text-2xl'>{cat.emoji}</div>
                  <div className='absolute bottom-3 left-3 right-3'>
                    <h3 className='text-sm font-bold leading-tight text-white'>{cat.name}</h3>
                  </div>
                </div>
                <div className='px-3 py-2.5 flex items-center justify-between'>
                  <span className='text-xs font-medium text-gray-400'>
                    {counts[key] ?? '—'} annonce(s)
                  </span>
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${cat.bgLight}`}>
                    <ArrowRight className={`w-3 h-3 ${cat.textColor}`} />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>

    <Footer />
  </div>
);

// ─── Page catégorie détail ───────────────────────────────────────────────────

const CategoryDetail = ({ slug, category }) => {
  const navigate = useNavigate();
  const [annonces, setAnnonces]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [searchQ, setSearchQ]       = useState('');
  const [etatFilter, setEtatFilter] = useState('tous');
  const [sortBy, setSortBy]         = useState('recent'); // recent | prix_asc | prix_desc
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage]             = useState(1);
  const [hasMore, setHasMore]       = useState(false);

  useEffect(() => {
    loadAnnonces();
  }, [slug]);

  const loadAnnonces = async (p = 1) => {
    setLoading(true);
    try {
      // Recherche par nom de catégorie
      const data = await searchAnnonces(category.name, p);
      const list = data.data ?? data ?? [];
      const arr  = Array.isArray(list) ? list : [];

      // Filtrer côté front par champ categorie exact
      const filtered = arr.filter(a =>
        a.categorie?.toLowerCase().includes(slug.replace('-', ' ')) ||
        a.categorie?.toLowerCase() === category.name.toLowerCase()
      );

      if (p === 1) setAnnonces(filtered);
      else setAnnonces(prev => [...prev, ...filtered]);

      setHasMore(arr.length === 12);
      setPage(p);
    } catch {
      // TODO: handle error
    }
    finally { setLoading(false); }
  };

  // Filtrage + tri local
  const displayed = annonces
    .filter(a => {
      const qMatch = searchQ
        ? a.titre?.toLowerCase().includes(searchQ.toLowerCase())
        : true;
      const etatMatch = etatFilter === 'tous'
        ? true
        : a.etat?.toLowerCase() === etatFilter;
      return qMatch && etatMatch;
    })
    .sort((a, b) => {
      if (sortBy === 'prix_asc')  return Number(a.prix_vendeur) - Number(b.prix_vendeur);
      if (sortBy === 'prix_desc') return Number(b.prix_vendeur) - Number(a.prix_vendeur);
      return new Date(b.created_at) - new Date(a.created_at);
    });

  return (
    <div className='min-h-screen bg-gray-50'>
      <Header />

      {/* Bannière */}
      <div className='relative overflow-hidden h-60'>
        <img src={category.image} alt={category.name} className='object-cover w-full h-full' />
        <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-80`} />
        <div className='absolute inset-0 bg-gradient-to-t from-black/50 to-transparent' />
        <div className='container relative z-10 flex flex-col justify-end h-full max-w-6xl px-4 pb-8 mx-auto'>
          <Link to='/categories'>
            <motion.div
              whileHover={{ x: -4 }}
              className='inline-flex items-center gap-2 mb-4 text-sm font-medium text-white/70 hover:text-white transition-colors'
            >
              <ArrowLeft className='w-4 h-4' />
              Toutes les catégories
            </motion.div>
          </Link>
          <div className='flex items-end justify-between'>
            <div>
              <div className='flex items-center gap-2 mb-1'>
                <span className='text-3xl'>{category.emoji}</span>
                <h1 className='text-4xl font-black text-white'>{category.name}</h1>
              </div>
              <p className='max-w-lg text-sm text-white/70'>{category.description || `Équipements médicaux — ${category.name}`}</p>
            </div>
            <div className='hidden px-5 py-3 text-center border md:block bg-white/15 backdrop-blur-sm border-white/20 rounded-2xl'>
              <p className='text-3xl font-black text-white'>{annonces.length}</p>
              <p className='text-xs text-white/70 mt-0.5'>annonce(s)</p>
            </div>
          </div>
        </div>
      </div>

      <div className='container max-w-6xl px-4 py-8 mx-auto'>

        {/* Barre filtres */}
        <div className='flex flex-wrap items-center gap-3 mb-6'>

          {/* Search local */}
          <div className='relative flex-1 min-w-[200px]'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
            <input
              type='text'
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              placeholder='Rechercher dans cette catégorie...'
              className='w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 bg-white transition-all'
            />
            {searchQ && (
              <button onClick={() => setSearchQ('')} className='absolute right-3 top-1/2 -translate-y-1/2'>
                <X className='w-3.5 h-3.5 text-gray-400' />
              </button>
            )}
          </div>

          {/* Filtre état */}
          <div className='flex items-center gap-1.5'>
            {ETATS.map(e => (
              <button
                key={e}
                onClick={() => setEtatFilter(e)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all capitalize ${
                  etatFilter === e
                    ? 'bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-[#1DBF73]/40'
                }`}
              >
                {e === 'tous' ? 'Tous' : e}
              </button>
            ))}
          </div>

          {/* Tri */}
          <div className='relative'>
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                sortBy !== 'recent'
                  ? 'border-[#1DBF73] text-[#1DBF73] bg-[#1DBF73]/5'
                  : 'border-gray-200 text-gray-600 bg-white hover:border-gray-300'
              }`}
            >
              <SlidersHorizontal className='w-3.5 h-3.5' />
              {sortBy === 'recent' ? 'Trier' : sortBy === 'prix_asc' ? 'Prix ↑' : 'Prix ↓'}
            </button>
            <AnimatePresence>
              {filterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className='absolute right-0 mt-2 w-44 bg-white border border-gray-100 shadow-xl rounded-2xl overflow-hidden z-20'
                >
                  {[
                    { key: 'recent',    label: 'Plus récents' },
                    { key: 'prix_asc',  label: 'Prix croissant' },
                    { key: 'prix_desc', label: 'Prix décroissant' },
                  ].map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => { setSortBy(opt.key); setFilterOpen(false); }}
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

          {/* Résultats count */}
          <span className='text-xs text-gray-400 ml-auto'>
            {displayed.length} résultat{displayed.length > 1 ? 's' : ''}
          </span>
        </div>

        {/* Grille */}
        {loading ? (
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : displayed.length > 0 ? (
          <>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
              <AnimatePresence>
                {displayed.map((annonce, index) => (
                  <AnnonceCard key={annonce.id} annonce={annonce} index={index} />
                ))}
              </AnimatePresence>
            </div>

            {/* Charger plus */}
            {hasMore && (
              <div className='flex justify-center mt-8'>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => loadAnnonces(page + 1)}
                  className='px-8 py-3 bg-white border-2 border-[#1DBF73] text-[#1DBF73] font-semibold rounded-xl hover:bg-[#1DBF73]/5 transition-all'
                >
                  Charger plus
                </motion.button>
              </div>
            )}
          </>
        ) : (
          <div className='text-center bg-white border border-gray-100 shadow-sm py-28 rounded-3xl'>
            <div className='flex items-center justify-center w-20 h-20 mx-auto mb-5 border border-gray-100 bg-gray-50 rounded-3xl'>
              <Filter className='text-gray-300 w-9 h-9' />
            </div>
            <p className='mb-2 text-xl font-bold text-gray-700'>Aucun équipement disponible</p>
            <p className='max-w-xs mx-auto mb-8 text-sm text-gray-400'>
              {searchQ || etatFilter !== 'tous'
                ? 'Aucun résultat pour ces filtres.'
                : 'Cette catégorie sera bientôt alimentée par nos vendeurs.'}
            </p>
            {(searchQ || etatFilter !== 'tous') ? (
              <button
                onClick={() => { setSearchQ(''); setEtatFilter('tous'); }}
                className='px-6 py-3 border-2 border-[#1DBF73] text-[#1DBF73] font-semibold rounded-xl hover:bg-[#1DBF73]/5 transition-all'
              >
                Réinitialiser les filtres
              </button>
            ) : (
              <Link to='/explore'>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className='px-8 py-3.5 bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white font-semibold rounded-xl shadow-lg'
                >
                  Explorer tous les équipements
                </motion.button>
              </Link>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

// ─── Composant racine ────────────────────────────────────────────────────────

const Categories = () => {
  const { slug } = useParams();
  const [counts, setCounts] = useState({});

  // Charger les counts par catégorie pour la page liste
  useEffect(() => {
    if (slug) return;
    const fetchCounts = async () => {
      try {
        const data = await getAnnonces(1);
        const list = data.data ?? data ?? [];
        const arr  = Array.isArray(list) ? list : [];
        const c = {};
        arr.forEach(a => {
          if (!a.categorie) return;
          const key = Object.keys(CATEGORIES_CONFIG).find(k =>
            CATEGORIES_CONFIG[k].name.toLowerCase() === a.categorie.toLowerCase() ||
            k === a.categorie.toLowerCase().replace(' ', '-')
          );
          if (key) c[key] = (c[key] || 0) + 1;
        });
        setCounts(c);
      } catch {
        //
      }
    };
    fetchCounts();
  }, [slug]);

  const category = slug ? CATEGORIES_CONFIG[slug] : null;

  if (!slug) return <AllCategories counts={counts} />;

  if (!category) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <Header />
        <div className='flex flex-col items-center justify-center py-32 text-center'>
          <div className='flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-2xl'>
            <Filter className='w-8 h-8 text-gray-300' />
          </div>
          <p className='mb-4 text-xl font-bold text-gray-700'>Catégorie introuvable</p>
          <Link to='/categories'>
            <button className='px-6 py-3 bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white font-semibold rounded-xl'>
              Retour aux catégories
            </button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return <CategoryDetail slug={slug} category={category} />;
};

export default Categories;