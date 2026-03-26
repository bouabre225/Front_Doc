import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, RefreshCw, Eye, Trash2, AlertCircle, CheckCircle,
  Package, ChevronLeft, ChevronRight, MapPin, Tag, User, X,
  Shield, Calendar, Box, DollarSign, Image as ImageIcon
} from 'lucide-react';
import { getAnnonces, deleteAnnonce, getImageUrl } from '../../services/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatPrice = (p) => Number(p || 0).toLocaleString('fr-FR') + ' FCFA';
const formatDate  = (d) => d
  ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
  : '—';

const ETAT_CONFIG = {
  neuf:       { label: 'Neuf',       color: 'bg-green-100 text-green-700'  },
  tres_bon:   { label: 'Très bon',   color: 'bg-blue-100 text-blue-700'    },
  bon:        { label: 'Bon',        color: 'bg-yellow-100 text-yellow-700'},
  acceptable: { label: 'Acceptable', color: 'bg-orange-100 text-orange-700'},
};

const STATUT_CONFIG = {
  active:    { label: 'Active',    color: 'bg-green-100 text-green-700' },
  inactive:  { label: 'Inactive',  color: 'bg-gray-100 text-gray-500'  },
  vendue:    { label: 'Vendue',    color: 'bg-blue-100 text-blue-700'  },
  suspendue: { label: 'Suspendue', color: 'bg-red-100 text-red-600'    },
};

// ─── Modal détail ─────────────────────────────────────────────────────────────

const AnnonceModal = ({ annonce, onClose }) => {
  const [imgIdx, setImgIdx] = useState(0);
  const images    = annonce.images ?? [];
  const etatCfg   = ETAT_CONFIG[annonce.etat]     || { label: annonce.etat,   color: 'bg-gray-100 text-gray-600' };
  const statutCfg = STATUT_CONFIG[annonce.statut] || { label: annonce.statut, color: 'bg-gray-100 text-gray-600' };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm'
      onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92 }} onClick={e => e.stopPropagation()}
        className='bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto'>

        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10'>
          <h3 className='font-bold text-gray-900 text-lg truncate pr-4'>{annonce.titre}</h3>
          <button onClick={onClose} className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors shrink-0'>
            <X className='w-4 h-4' />
          </button>
        </div>

        <div className='p-6 space-y-5'>

          {/* Images */}
          {images.length > 0 ? (
            <div>
              <div className='relative h-56 bg-gray-100 rounded-xl overflow-hidden mb-2'>
                <img src={getImageUrl(images[imgIdx]?.image_url)} alt={annonce.titre} className='w-full h-full object-cover' />
                {images.length > 1 && (
                  <>
                    <button onClick={() => setImgIdx(i => Math.max(0, i - 1))} disabled={imgIdx === 0}
                      className='absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center disabled:opacity-30 hover:bg-white transition-all'>
                      <ChevronLeft className='w-4 h-4' />
                    </button>
                    <button onClick={() => setImgIdx(i => Math.min(images.length - 1, i + 1))} disabled={imgIdx === images.length - 1}
                      className='absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center disabled:opacity-30 hover:bg-white transition-all'>
                      <ChevronRight className='w-4 h-4' />
                    </button>
                    <span className='absolute bottom-2 right-2 px-2 py-0.5 bg-black/50 text-white text-xs rounded-full'>
                      {imgIdx + 1}/{images.length}
                    </span>
                  </>
                )}
              </div>
              {images.length > 1 && (
                <div className='flex gap-2 overflow-x-auto'>
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setImgIdx(i)}
                      className={`w-14 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${i === imgIdx ? 'border-[#1DBF73]' : 'border-transparent'}`}>
                      <img src={getImageUrl(img.image_url)} alt='' className='w-full h-full object-cover' />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className='h-40 bg-gray-50 rounded-xl flex items-center justify-center'>
              <div className='text-center'>
                <ImageIcon className='w-10 h-10 text-gray-200 mx-auto mb-1' />
                <p className='text-xs text-gray-400'>Aucune image</p>
              </div>
            </div>
          )}

          {/* Badges */}
          <div className='flex gap-2 flex-wrap'>
            <span className={`px-3 py-1 text-xs font-bold rounded-full ${statutCfg.color}`}>{statutCfg.label}</span>
            <span className={`px-3 py-1 text-xs font-bold rounded-full ${etatCfg.color}`}>{etatCfg.label}</span>
            <span className='px-3 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-600'>{annonce.categorie}</span>
          </div>

          {/* Description */}
          {annonce.description && (
            <div className='p-4 bg-gray-50 rounded-xl'>
              <p className='text-xs font-bold text-gray-400 uppercase tracking-wider mb-1'>Description</p>
              <p className='text-sm text-gray-700 leading-relaxed'>{annonce.description}</p>
            </div>
          )}

          {/* Infos grille */}
          <div className='grid grid-cols-2 gap-3'>
            {[
              { icon: DollarSign, label: 'Prix vendeur',     value: formatPrice(annonce.prix_vendeur) },
              { icon: DollarSign, label: 'Frais protection', value: formatPrice(annonce.frais_protection) },
              { icon: DollarSign, label: 'Prix total',       value: formatPrice(annonce.prix_total), highlight: true },
              { icon: Box,        label: 'Quantité',         value: `${annonce.quantite} unité(s)` },
              { icon: MapPin,     label: "Expédition",       value: annonce.pays_expedition || '—' },
              { icon: Calendar,   label: 'Publié le',        value: formatDate(annonce.created_at) },
            ].map(({ icon: Icon, label, value, highlight }) => (
              <div key={label} className='flex items-start gap-2 p-3 bg-gray-50 rounded-xl'>
                <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${highlight ? 'text-[#1DBF73]' : 'text-gray-400'}`} />
                <div>
                  <p className='text-[10px] text-gray-400 font-medium'>{label}</p>
                  <p className={`text-sm font-bold ${highlight ? 'text-[#1DBF73]' : 'text-gray-800'}`}>{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Vendeur */}
          {annonce.vendeur && (
            <div className='p-4 border border-gray-100 rounded-xl'>
              <p className='text-xs font-bold text-gray-400 uppercase tracking-wider mb-3'>Vendeur</p>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-gradient-to-br from-[#1DBF73] to-[#09B1BA] rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0'>
                  {annonce.vendeur.nom?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-2'>
                    <p className='font-bold text-gray-900 truncate'>{annonce.vendeur.nom}</p>
                    {annonce.vendeur.verifie_kyc  && <CheckCircle className='w-3.5 h-3.5 text-green-500 shrink-0' />}
                    {annonce.vendeur.badge_verifie && <Shield className='w-3.5 h-3.5 text-blue-500 shrink-0' />}
                  </div>
                  <p className='text-xs text-gray-400 truncate'>{annonce.vendeur.email}</p>
                  <p className='text-xs text-gray-400'>{annonce.vendeur.pays}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Composant principal ──────────────────────────────────────────────────────

export default function AdminAnnonces() {
  const [annonces,     setAnnonces]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [filter,       setFilter]       = useState('tous');
  const [page,         setPage]         = useState(1);
  const [lastPage,     setLastPage]     = useState(1);
  const [total,        setTotal]        = useState(0);
  const [success,      setSuccess]      = useState('');
  const [error,        setError]        = useState('');
  const [deleting,     setDeleting]     = useState(null);
  const [confirmDel,   setConfirmDel]   = useState(null);
  const [modalAnnonce, setModalAnnonce] = useState(null);

  const fetchAnnonces = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params = { page: p, per_page: 12 };
      if (search)            params.search = search;
      if (filter !== 'tous') params.statut = filter;
      const res  = await getAnnonces(params);
      const data = res?.data ?? res;
      setAnnonces(Array.isArray(data) ? data : data?.data ?? []);
      setLastPage(res?.last_page ?? res?.data?.last_page ?? 1);
      setTotal(res?.total ?? res?.data?.total ?? 0);
      setPage(p);
    } catch {
      setError('Erreur lors du chargement des annonces.');
    } finally {
      setLoading(false);
    }
  }, [search, filter]);

  useEffect(() => { fetchAnnonces(1); }, [filter]);

  const handleDelete = async (id) => {
    setDeleting(id);
    setError('');
    try {
      await deleteAnnonce(id);
      setAnnonces(prev => prev.filter(a => a.id !== id));
      setTotal(prev => prev - 1);
      setSuccess('Annonce supprimée.');
      setConfirmDel(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Erreur lors de la suppression.');
    } finally {
      setDeleting(null);
    }
  };

  const FILTERS = [
    { key: 'tous',      label: 'Toutes'    },
    { key: 'active',    label: 'Actives'   },
    { key: 'inactive',  label: 'Inactives' },
    { key: 'vendue',    label: 'Vendues'   },
    { key: 'suspendue', label: 'Suspendues'},
  ];

  return (
    <div className='min-h-screen p-6 bg-gray-50'>
      <div className='max-w-7xl mx-auto'>

        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Annonces</h1>
            <p className='text-sm text-gray-500 mt-0.5'>{total} annonce{total > 1 ? 's' : ''} au total</p>
          </div>
          <button onClick={() => fetchAnnonces(page)} disabled={loading}
            className='flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:border-[#1DBF73] hover:text-[#1DBF73] transition-all'>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>

        {/* Alertes */}
        <AnimatePresence>
          {success && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className='flex items-center gap-2 p-3 mb-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700'>
              <CheckCircle className='w-4 h-4 shrink-0' />{success}
            </motion.div>
          )}
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className='flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700'>
              <AlertCircle className='w-4 h-4 shrink-0' />{error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search + Filtres */}
        <div className='flex flex-col sm:flex-row gap-3 mb-6'>
          <form onSubmit={e => { e.preventDefault(); fetchAnnonces(1); }} className='relative flex-1'>
            <Search className='absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
            <input type='text' value={search} onChange={e => setSearch(e.target.value)}
              placeholder='Rechercher par titre, catégorie...'
              className='w-full pl-11 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 transition-all' />
          </form>
          <div className='flex gap-2 overflow-x-auto'>
            {FILTERS.map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all shrink-0 ${
                  filter === f.key
                    ? 'bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white shadow-md'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-[#1DBF73]/50'
                }`}>{f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grille */}
        {loading ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className='bg-white rounded-2xl border border-gray-100 p-4 animate-pulse'>
                <div className='h-40 bg-gray-200 rounded-xl mb-3' />
                <div className='h-4 bg-gray-200 rounded w-3/4 mb-2' />
                <div className='h-3 bg-gray-100 rounded w-1/2' />
              </div>
            ))}
          </div>
        ) : annonces.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className='flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100'>
            <Package className='w-16 h-16 text-gray-200 mb-4' />
            <p className='font-semibold text-gray-500'>Aucune annonce trouvée</p>
          </motion.div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            <AnimatePresence>
              {annonces.map(a => {
                const etatCfg   = ETAT_CONFIG[a.etat]     || { label: a.etat,   color: 'bg-gray-100 text-gray-600' };
                const statutCfg = STATUT_CONFIG[a.statut] || { label: a.statut, color: 'bg-gray-100 text-gray-600' };
                return (
                  <motion.div key={a.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className='bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden'>
                    <div className='relative h-40 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden'>
                      {a.images?.[0]
                        ? <img src={getImageUrl(a.images[0].image_url)} alt={a.titre} className='w-full h-full object-cover' />
                        : <div className='w-full h-full flex items-center justify-center text-4xl'>🏥</div>
                      }
                      <span className={`absolute top-2 right-2 px-2 py-0.5 text-xs font-bold rounded-full ${statutCfg.color}`}>
                        {statutCfg.label}
                      </span>
                    </div>
                    <div className='p-4'>
                      <h3 className='font-bold text-gray-900 truncate mb-1'>{a.titre}</h3>
                      <div className='flex items-center gap-2 mb-2'>
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${etatCfg.color}`}>{etatCfg.label}</span>
                        <span className='flex items-center gap-1 text-xs text-gray-400'><Tag className='w-3 h-3' />{a.categorie}</span>
                      </div>
                      <div className='flex items-center gap-1 text-xs text-gray-400 mb-1'>
                        <User className='w-3 h-3' />
                        <span className='truncate'>{a.vendeur?.nom}</span>
                        {a.vendeur?.verifie_kyc && <CheckCircle className='w-3 h-3 text-green-500 shrink-0' />}
                      </div>
                      <div className='flex items-center gap-1 text-xs text-gray-400 mb-3'>
                        <MapPin className='w-3 h-3' />{a.pays_expedition}
                        <span className='ml-auto font-bold text-[#1DBF73] text-sm'>{formatPrice(a.prix_total)}</span>
                      </div>
                      <div className='flex gap-2 pt-3 border-t border-gray-100'>
                        <button onClick={() => setModalAnnonce(a)}
                          className='flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-50 text-gray-600 font-semibold rounded-xl text-xs hover:bg-[#1DBF73]/10 hover:text-[#1DBF73] transition-colors'>
                          <Eye className='w-3.5 h-3.5' /> Voir détail
                        </button>
                        <button onClick={() => setConfirmDel(a)}
                          className='flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-50 text-red-500 font-semibold rounded-xl text-xs hover:bg-red-100 transition-colors'>
                          <Trash2 className='w-3.5 h-3.5' /> Supprimer
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Pagination */}
        {lastPage > 1 && (
          <div className='flex items-center justify-center gap-3 mt-8'>
            <button onClick={() => fetchAnnonces(page - 1)} disabled={page <= 1 || loading}
              className='flex items-center gap-1 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:border-[#1DBF73] disabled:opacity-40 disabled:cursor-not-allowed transition-all'>
              <ChevronLeft className='w-4 h-4' /> Précédent
            </button>
            <span className='text-sm text-gray-500 font-medium'>Page {page} / {lastPage}</span>
            <button onClick={() => fetchAnnonces(page + 1)} disabled={page >= lastPage || loading}
              className='flex items-center gap-1 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:border-[#1DBF73] disabled:opacity-40 disabled:cursor-not-allowed transition-all'>
              Suivant <ChevronRight className='w-4 h-4' />
            </button>
          </div>
        )}
      </div>

      {/* Modal détail */}
      <AnimatePresence>
        {modalAnnonce && <AnnonceModal annonce={modalAnnonce} onClose={() => setModalAnnonce(null)} />}
      </AnimatePresence>

      {/* Modal suppression */}
      <AnimatePresence>
        {confirmDel && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm'>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className='bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6'>
              <div className='w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4'>
                <Trash2 className='w-6 h-6 text-red-500' />
              </div>
              <h3 className='text-lg font-bold text-gray-900 text-center mb-2'>Supprimer l'annonce ?</h3>
              <p className='text-sm text-gray-500 text-center mb-5'>
                <span className='font-semibold'>"{confirmDel.titre}"</span> sera définitivement supprimée.
              </p>
              <div className='flex gap-3'>
                <button onClick={() => setConfirmDel(null)}
                  className='flex-1 py-2.5 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 text-sm'>
                  Annuler
                </button>
                <button onClick={() => handleDelete(confirmDel.id)} disabled={deleting === confirmDel.id}
                  className='flex-1 py-2.5 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 text-sm disabled:opacity-50'>
                  {deleting === confirmDel.id ? 'Suppression...' : 'Confirmer'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}