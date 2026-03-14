import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle, Search, RefreshCw, CheckCircle, XCircle,
  User, ShoppingBag, Calendar, ChevronDown, ChevronUp,
  Clock, Eye, Shield, MessageSquare
} from 'lucide-react';
import {
  getAdminLitiges, prendreEnChargeLitige, resoldreLitige
} from '../../services/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (d) =>
  new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const formatPrice = (p) =>
  Number(p || 0).toLocaleString('fr-FR') + ' FCFA';

const STATUT_CONFIG = {
  en_attente: { label: 'En attente',  color: 'bg-yellow-100 text-yellow-700 border-yellow-200', dot: 'bg-yellow-400' },
  en_cours:   { label: 'En cours',    color: 'bg-blue-100 text-blue-700 border-blue-200',       dot: 'bg-blue-400'   },
  resolu:     { label: 'Résolu',      color: 'bg-green-100 text-green-700 border-green-200',    dot: 'bg-green-400'  },
  rejete:     { label: 'Rejeté',      color: 'bg-red-100 text-red-700 border-red-200',          dot: 'bg-red-400'    },
};

const MOTIF_LABELS = {
  non_conforme:     'Non conforme',
  non_recu:         'Non reçu',
  defectueux:       'Défectueux',
  fraude:           'Fraude',
  autre:            'Autre',
};

// ─── Modal résolution ─────────────────────────────────────────────────────────

const ResolutionModal = ({ litige, onConfirm, onClose, loading }) => {
  const [decision, setDecision] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm'
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className='bg-white rounded-2xl shadow-2xl max-w-md w-full p-6'
      >
        <div className='flex items-center gap-3 mb-5'>
          <div className='w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center'>
            <Shield className='w-6 h-6 text-white' />
          </div>
          <div>
            <h3 className='text-lg font-bold text-gray-900'>Résoudre le litige</h3>
            <p className='text-sm text-gray-500 truncate max-w-[220px]'>
              {litige.commande?.annonce?.titre ?? 'Commande'}
            </p>
          </div>
        </div>

        {/* Résumé */}
        <div className='p-4 bg-gray-50 rounded-xl mb-5 space-y-2 text-sm'>
          <div className='flex justify-between'>
            <span className='text-gray-500'>Acheteur</span>
            <span className='font-semibold text-gray-800'>{litige.commande?.acheteur?.nom}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-gray-500'>Vendeur</span>
            <span className='font-semibold text-gray-800'>{litige.commande?.vendeur?.nom}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-gray-500'>Montant</span>
            <span className='font-bold text-[#1DBF73]'>{formatPrice(litige.commande?.montant)}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-gray-500'>Motif</span>
            <span className='font-semibold text-gray-800'>{MOTIF_LABELS[litige.motif] ?? litige.motif}</span>
          </div>
        </div>

        {/* Décision */}
        <p className='text-sm font-semibold text-gray-700 mb-3'>Décision :</p>
        <div className='grid grid-cols-2 gap-3 mb-5'>
          <button
            onClick={() => setDecision('rembourse')}
            className={`flex flex-col items-center gap-2 py-4 rounded-xl border-2 font-semibold text-sm transition-all ${
              decision === 'rembourse'
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 text-gray-600 hover:border-green-300'
            }`}
          >
            <CheckCircle className='w-6 h-6' />
            Rembourser
            <span className='text-[10px] font-normal opacity-70'>En faveur de l'acheteur</span>
          </button>
          <button
            onClick={() => setDecision('rejete')}
            className={`flex flex-col items-center gap-2 py-4 rounded-xl border-2 font-semibold text-sm transition-all ${
              decision === 'rejete'
                ? 'border-red-500 bg-red-50 text-red-600'
                : 'border-gray-200 text-gray-600 hover:border-red-300'
            }`}
          >
            <XCircle className='w-6 h-6' />
            Rejeter
            <span className='text-[10px] font-normal opacity-70'>En faveur du vendeur</span>
          </button>
        </div>

        <div className='flex gap-3'>
          <button
            onClick={onClose}
            className='flex-1 py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-all text-sm'
          >
            Annuler
          </button>
          <button
            onClick={() => decision && onConfirm(litige.id, decision)}
            disabled={!decision || loading}
            className={`flex-1 py-3 text-white font-semibold rounded-xl transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
              decision === 'rejete'
                ? 'bg-gradient-to-r from-red-500 to-red-600'
                : 'bg-gradient-to-r from-[#1DBF73] to-[#09B1BA]'
            }`}
          >
            {loading ? (
              <span className='flex items-center justify-center gap-2'>
                <span className='w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin' />
                En cours...
              </span>
            ) : 'Confirmer la décision'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Carte litige ─────────────────────────────────────────────────────────────

const LitigeCard = ({ litige, onPrendreEnCharge, onResoudre, actionLoading }) => {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUT_CONFIG[litige.statut] || STATUT_CONFIG.en_attente;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className='bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden'
    >
      {/* Header */}
      <div className='flex items-center gap-4 p-5'>
        <div className='w-11 h-11 bg-orange-50 rounded-xl flex items-center justify-center shrink-0'>
          <AlertCircle className='w-5 h-5 text-orange-500' />
        </div>

        <div className='flex-1 min-w-0'>
          <p className='font-bold text-gray-900 truncate'>
            {litige.commande?.annonce?.titre ?? 'Équipement'}
          </p>
          <p className='text-xs text-gray-400 mt-0.5'>
            {litige.commande?.acheteur?.nom} → {litige.commande?.vendeur?.nom}
          </p>
          <div className='flex items-center gap-2 mt-1.5'>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full border ${cfg.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>
            {litige.motif && (
              <span className='px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full'>
                {MOTIF_LABELS[litige.motif] ?? litige.motif}
              </span>
            )}
          </div>
        </div>

        <div className='text-right shrink-0'>
          <p className='font-bold text-[#1DBF73] text-sm'>
            {formatPrice(litige.commande?.montant)}
          </p>
          <p className='text-xs text-gray-400 mt-0.5'>{formatDate(litige.created_at)}</p>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className='p-2 hover:bg-gray-100 rounded-xl transition-colors shrink-0'
        >
          {expanded
            ? <ChevronUp className='w-4 h-4 text-gray-500' />
            : <ChevronDown className='w-4 h-4 text-gray-500' />
          }
        </button>
      </div>

      {/* Détails */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='overflow-hidden'
          >
            <div className='px-5 pb-5 border-t border-gray-100 pt-4 space-y-4'>

              {/* Parties */}
              <div className='grid grid-cols-2 gap-3'>
                <div className='p-3 bg-gray-50 rounded-xl'>
                  <div className='flex items-center gap-2 mb-1'>
                    <User className='w-3.5 h-3.5 text-[#1DBF73]' />
                    <span className='text-[10px] font-bold text-gray-400 uppercase'>Acheteur</span>
                  </div>
                  <p className='text-sm font-bold text-gray-800'>{litige.commande?.acheteur?.nom}</p>
                  <p className='text-xs text-gray-500'>{litige.commande?.acheteur?.email}</p>
                </div>
                <div className='p-3 bg-gray-50 rounded-xl'>
                  <div className='flex items-center gap-2 mb-1'>
                    <User className='w-3.5 h-3.5 text-[#09B1BA]' />
                    <span className='text-[10px] font-bold text-gray-400 uppercase'>Vendeur</span>
                  </div>
                  <p className='text-sm font-bold text-gray-800'>{litige.commande?.vendeur?.nom}</p>
                  <p className='text-xs text-gray-500'>{litige.commande?.vendeur?.email}</p>
                </div>
              </div>

              {/* Preuves */}
              {litige.preuves && (
                <div className='p-3 bg-orange-50 border border-orange-200 rounded-xl'>
                  <div className='flex items-center gap-2 mb-1'>
                    <MessageSquare className='w-3.5 h-3.5 text-orange-500' />
                    <span className='text-xs font-bold text-orange-700'>Preuves / Description</span>
                  </div>
                  <p className='text-sm text-gray-700 leading-relaxed'>{litige.preuves}</p>
                </div>
              )}

              {/* Infos commande */}
              <div className='grid grid-cols-3 gap-2 text-sm'>
                <div className='p-3 bg-gray-50 rounded-xl text-center'>
                  <p className='text-[10px] text-gray-400 mb-0.5'>Montant</p>
                  <p className='font-bold text-[#1DBF73]'>{formatPrice(litige.commande?.montant)}</p>
                </div>
                <div className='p-3 bg-gray-50 rounded-xl text-center'>
                  <p className='text-[10px] text-gray-400 mb-0.5'>Commande</p>
                  <p className='font-bold text-gray-700 text-xs truncate'>{litige.commande?.statut}</p>
                </div>
                <div className='p-3 bg-gray-50 rounded-xl text-center'>
                  <p className='text-[10px] text-gray-400 mb-0.5'>Signalé le</p>
                  <p className='font-bold text-gray-700 text-xs'>
                    {new Date(litige.date_signalement || litige.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className='flex gap-3'>
                {litige.statut === 'en_attente' && (
                  <button
                    onClick={() => onPrendreEnCharge(litige.id)}
                    disabled={actionLoading === litige.id}
                    className='flex-1 flex items-center justify-center gap-2 py-2.5 border-2 border-[#09B1BA] text-[#09B1BA] font-semibold rounded-xl text-sm hover:bg-[#09B1BA]/5 transition-all disabled:opacity-50'
                  >
                    {actionLoading === litige.id ? (
                      <span className='w-4 h-4 border-2 border-[#09B1BA] rounded-full border-t-transparent animate-spin' />
                    ) : (
                      <Eye className='w-4 h-4' />
                    )}
                    Prendre en charge
                  </button>
                )}
                {(litige.statut === 'en_attente' || litige.statut === 'en_cours') && (
                  <button
                    onClick={() => onResoudre(litige)}
                    className='flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white font-semibold rounded-xl text-sm hover:shadow-lg transition-all'
                  >
                    <CheckCircle className='w-4 h-4' />
                    Résoudre
                  </button>
                )}
                {(litige.statut === 'resolu' || litige.statut === 'rejete') && (
                  <div className='flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-100 text-gray-500 font-semibold rounded-xl text-sm'>
                    <CheckCircle className='w-4 h-4' />
                    Traité
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Composant principal ──────────────────────────────────────────────────────

export default function AdminLitiges() {
  const [litiges,      setLitiges]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [actionLoad,   setActionLoad]   = useState(null);
  const [modalLitige,  setModalLitige]  = useState(null);
  const [modalLoad,    setModalLoad]    = useState(false);
  const [search,       setSearch]       = useState('');
  const [filter,       setFilter]       = useState('tous');
  const [success,      setSuccess]      = useState('');
  const [error,        setError]        = useState('');

  const fetchLitiges = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminLitiges();
      setLitiges(res?.data?.data ?? res?.data ?? res ?? []);
    } catch {
      setError('Erreur lors du chargement des litiges.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLitiges(); }, [fetchLitiges]);

  const handlePrendreEnCharge = async (id) => {
    setActionLoad(id);
    try {
      await prendreEnChargeLitige(id);
      setLitiges(prev => prev.map(l => l.id === id ? { ...l, statut: 'en_cours' } : l));
      setSuccess('Litige pris en charge.');
    } catch (err) {
      setError(err.message || 'Erreur.');
    } finally {
      setActionLoad(null);
    }
  };

  const handleResoudre = async (id, decision) => {
    setModalLoad(true);
    try {
      await resoldreLitige(id, decision);
      setLitiges(prev => prev.map(l =>
        l.id === id ? { ...l, statut: decision === 'rembourse' ? 'resolu' : 'rejete' } : l
      ));
      setSuccess(`Litige ${decision === 'rembourse' ? 'résolu — remboursement initié' : 'rejeté'}.`);
      setModalLitige(null);
    } catch (err) {
      setError(err.message || 'Erreur lors de la résolution.');
    } finally {
      setModalLoad(false);
    }
  };

  const FILTERS = [
    { key: 'tous',       label: 'Tous'        },
    { key: 'en_attente', label: 'En attente'  },
    { key: 'en_cours',   label: 'En cours'    },
    { key: 'resolu',     label: 'Résolus'     },
    { key: 'rejete',     label: 'Rejetés'     },
  ];

  const filtered = litiges.filter(l => {
    const matchFilter = filter === 'tous' || l.statut === filter;
    const matchSearch =
      l.commande?.annonce?.titre?.toLowerCase().includes(search.toLowerCase()) ||
      l.commande?.acheteur?.nom?.toLowerCase().includes(search.toLowerCase()) ||
      l.commande?.vendeur?.nom?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts = {
    en_attente: litiges.filter(l => l.statut === 'en_attente').length,
    en_cours:   litiges.filter(l => l.statut === 'en_cours').length,
  };

  return (
    <div className='min-h-screen p-6 bg-gray-50'>
      <div className='max-w-4xl mx-auto'>

        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Gestion des litiges</h1>
            <p className='text-sm text-gray-500 mt-0.5'>
              {litiges.length} litige{litiges.length > 1 ? 's' : ''} au total
              {counts.en_attente > 0 && ` · ${counts.en_attente} en attente`}
              {counts.en_cours > 0 && ` · ${counts.en_cours} en cours`}
            </p>
          </div>
          <button
            onClick={fetchLitiges}
            disabled={loading}
            className='flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:border-[#1DBF73] hover:text-[#1DBF73] transition-all'
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>

        {/* Alertes */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className='flex items-center gap-2 p-3 mb-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700'
            >
              <CheckCircle className='w-4 h-4 shrink-0' />{success}
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className='flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700'
            >
              <AlertCircle className='w-4 h-4 shrink-0' />{error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filtres + Search */}
        <div className='flex flex-col sm:flex-row gap-3 mb-6'>
          <div className='relative flex-1'>
            <Search className='absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
            <input
              type='text'
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder='Rechercher par annonce, acheteur, vendeur...'
              className='w-full pl-11 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 transition-all'
            />
          </div>
          <div className='flex gap-2 overflow-x-auto pb-0.5'>
            {FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all shrink-0 ${
                  filter === f.key
                    ? 'bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white shadow-md'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-[#1DBF73]/50'
                }`}
              >
                {f.label}
                {f.key !== 'tous' && litiges.filter(l => l.statut === f.key).length > 0 && (
                  <span className='ml-1.5 opacity-80'>
                    ({litiges.filter(l => l.statut === f.key).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Liste */}
        {loading ? (
          <div className='space-y-3'>
            {[1,2,3].map(i => (
              <div key={i} className='bg-white rounded-2xl border border-gray-100 p-5 animate-pulse'>
                <div className='flex items-center gap-4'>
                  <div className='w-11 h-11 bg-gray-200 rounded-xl shrink-0' />
                  <div className='flex-1 space-y-2'>
                    <div className='h-4 bg-gray-200 rounded w-1/2' />
                    <div className='h-3 bg-gray-100 rounded w-1/3' />
                  </div>
                  <div className='w-20 h-6 bg-gray-200 rounded-full' />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100'
          >
            <div className='w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-4'>
              <CheckCircle className='w-8 h-8 text-green-500' />
            </div>
            <p className='font-semibold text-gray-700 mb-1'>
              {search || filter !== 'tous' ? 'Aucun résultat' : 'Aucun litige'}
            </p>
            <p className='text-sm text-gray-400'>
              {search || filter !== 'tous' ? 'Essayez un autre filtre' : 'Aucun litige à traiter 🎉'}
            </p>
          </motion.div>
        ) : (
          <div className='space-y-3'>
            <AnimatePresence>
              {filtered.map(litige => (
                <LitigeCard
                  key={litige.id}
                  litige={litige}
                  onPrendreEnCharge={handlePrendreEnCharge}
                  onResoudre={setModalLitige}
                  actionLoading={actionLoad}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

      </div>

      {/* Modal résolution */}
      <AnimatePresence>
        {modalLitige && (
          <ResolutionModal
            litige={modalLitige}
            onConfirm={handleResoudre}
            onClose={() => setModalLitige(null)}
            loading={modalLoad}
          />
        )}
      </AnimatePresence>
    </div>
  );
}