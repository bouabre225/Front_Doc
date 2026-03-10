import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCheck, Search, RefreshCw, CheckCircle, XCircle,
  User, Mail, Phone, MapPin, Calendar, FileText,
  AlertCircle, Clock, Shield, ChevronDown, ChevronUp
} from 'lucide-react';
import { getKycPending, decideKyc } from '../../services/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (d) =>
  new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

// ─── Modal de décision ────────────────────────────────────────────────────────

const DecisionModal = ({ kyc, onConfirm, onClose, loading }) => {
  const [decision,     setDecision]     = useState('');
  const [commentaire,  setCommentaire]  = useState('');

  const handleConfirm = () => {
    if (!decision) return;
    onConfirm(kyc.id, decision, commentaire || null);
  };

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
          <div className='w-12 h-12 bg-gradient-to-br from-[#1DBF73] to-[#09B1BA] rounded-xl flex items-center justify-center'>
            <Shield className='w-6 h-6 text-white' />
          </div>
          <div>
            <h3 className='text-lg font-bold text-gray-900'>Décision KYC</h3>
            <p className='text-sm text-gray-500'>{kyc.user?.nom}</p>
          </div>
        </div>

        {/* Choix */}
        <div className='grid grid-cols-2 gap-3 mb-4'>
          <button
            onClick={() => setDecision('valide')}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
              decision === 'valide'
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 text-gray-600 hover:border-green-300'
            }`}
          >
            <CheckCircle className='w-4 h-4' />
            Valider
          </button>
          <button
            onClick={() => setDecision('refuse')}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
              decision === 'refuse'
                ? 'border-red-500 bg-red-50 text-red-600'
                : 'border-gray-200 text-gray-600 hover:border-red-300'
            }`}
          >
            <XCircle className='w-4 h-4' />
            Refuser
          </button>
        </div>

        {/* Commentaire */}
        <div className='mb-5'>
          <label className='block text-sm font-semibold text-gray-700 mb-1.5'>
            Commentaire {decision === 'refuse' && <span className='text-red-400'>*</span>}
          </label>
          <textarea
            value={commentaire}
            onChange={e => setCommentaire(e.target.value)}
            placeholder={decision === 'refuse' ? 'Raison du refus...' : 'Commentaire optionnel...'}
            rows={3}
            className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 transition-all resize-none'
          />
        </div>

        <div className='flex gap-3'>
          <button
            onClick={onClose}
            className='flex-1 py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-all text-sm'
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={!decision || (decision === 'refuse' && !commentaire.trim()) || loading}
            className={`flex-1 py-3 text-white font-semibold rounded-xl transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
              decision === 'refuse'
                ? 'bg-gradient-to-r from-red-500 to-red-600'
                : 'bg-gradient-to-r from-[#1DBF73] to-[#09B1BA]'
            }`}
          >
            {loading ? (
              <span className='flex items-center justify-center gap-2'>
                <span className='w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin' />
                En cours...
              </span>
            ) : (
              decision === 'valide' ? 'Valider le KYC' : decision === 'refuse' ? 'Refuser le KYC' : 'Confirmer'
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Carte KYC ────────────────────────────────────────────────────────────────

const KycCard = ({ kyc, onDecide }) => {
  const [expanded, setExpanded] = useState(false);
  const user = kyc.user || {};

  const getInitials = (nom) =>
    nom?.trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className='bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden'
    >
      {/* Header carte */}
      <div className='flex items-center gap-4 p-5'>
        {/* Avatar */}
        <div className='w-12 h-12 bg-gradient-to-br from-[#1DBF73] to-[#09B1BA] rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm'>
          {getInitials(user.nom)}
        </div>

        {/* Infos principales */}
        <div className='flex-1 min-w-0'>
          <p className='font-bold text-gray-900 truncate'>{user.nom}</p>
          <p className='text-sm text-gray-500 truncate'>{user.email}</p>
          <div className='flex items-center gap-2 mt-1'>
            <span className='inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full'>
              <Clock className='w-3 h-3' />
              En attente
            </span>
            {kyc.type_document && (
              <span className='inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full'>
                <FileText className='w-3 h-3' />
                {kyc.type_document}
              </span>
            )}
          </div>
        </div>

        {/* Date */}
        <div className='text-right shrink-0'>
          <p className='text-xs text-gray-400'>{formatDate(kyc.created_at)}</p>
        </div>

        {/* Toggle détails */}
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

      {/* Détails expandables */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='overflow-hidden'
          >
            <div className='px-5 pb-5 border-t border-gray-100 pt-4'>
              <div className='grid grid-cols-2 gap-3 mb-4'>
                {[
                  { icon: User,     label: 'Nom',       value: user.nom },
                  { icon: Mail,     label: 'Email',     value: user.email },
                  { icon: Phone,    label: 'Téléphone', value: user.telephone || '—' },
                  { icon: MapPin,   label: 'Pays',      value: user.pays || '—' },
                  { icon: Calendar, label: 'Inscrit le', value: formatDate(user.created_at) },
                  { icon: Shield,   label: 'Type',      value: user.type_compte || '—' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className='flex items-start gap-2 p-3 bg-gray-50 rounded-xl'>
                    <Icon className='w-4 h-4 text-[#1DBF73] mt-0.5 shrink-0' />
                    <div>
                      <p className='text-[10px] text-gray-400 font-medium'>{label}</p>
                      <p className='text-sm font-semibold text-gray-800 truncate'>{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Document */}
              {kyc.fichier ? (
                <div className='mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl'>
                  <p className='text-xs font-semibold text-blue-700 mb-2'>Document soumis</p>
                  <a
                    href={kyc.fichier}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors'
                  >
                    <FileText className='w-4 h-4' />
                    Voir le document
                  </a>
                </div>
              ) : (
                <div className='mb-4 p-3 bg-gray-50 border border-gray-200 rounded-xl'>
                  <p className='text-xs text-gray-400 flex items-center gap-1'>
                    <AlertCircle className='w-3.5 h-3.5' />
                    Aucun document soumis
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className='flex gap-3'>
                <button
                  onClick={() => onDecide(kyc, 'valide')}
                  className='flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white font-semibold rounded-xl text-sm hover:shadow-lg transition-all'
                >
                  <CheckCircle className='w-4 h-4' />
                  Valider
                </button>
                <button
                  onClick={() => onDecide(kyc, 'refuse')}
                  className='flex-1 flex items-center justify-center gap-2 py-2.5 border-2 border-red-200 text-red-500 font-semibold rounded-xl text-sm hover:bg-red-50 transition-all'
                >
                  <XCircle className='w-4 h-4' />
                  Refuser
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Composant principal ──────────────────────────────────────────────────────

export default function AdminKyc() {
  const [kycList,    setKycList]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [selected,   setSelected]   = useState(null); // kyc sélectionné pour modal
  const [modalLoad,  setModalLoad]  = useState(false);
  const [success,    setSuccess]    = useState('');
  const [error,      setError]      = useState('');

  const fetchKyc = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getKycPending();
      setKycList(res.kyc_pending ?? res.data ?? res ?? []);
    } catch {
      setError('Erreur lors du chargement des KYC.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchKyc(); }, [fetchKyc]);

  const handleDecide = (kyc, preDecision = null) => {
    setSelected({ ...kyc, _preDecision: preDecision });
    setError('');
    setSuccess('');
  };

  const handleConfirm = async (id, decision, commentaire) => {
    setModalLoad(true);
    try {
      await decideKyc(id, decision, commentaire);
      setSuccess(`KYC ${decision === 'valide' ? 'validé' : 'refusé'} avec succès.`);
      setSelected(null);
      // Retirer de la liste
      setKycList(prev => prev.filter(k => k.id !== id));
    } catch (err) {
      setError(err.message || 'Erreur lors de la décision.');
    } finally {
      setModalLoad(false);
    }
  };

  const filtered = kycList.filter(k =>
    k.user?.nom?.toLowerCase().includes(search.toLowerCase()) ||
    k.user?.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className='min-h-screen p-6 bg-gray-50'>
      <div className='max-w-4xl mx-auto'>

        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Vérification KYC</h1>
            <p className='text-sm text-gray-500 mt-0.5'>
              {kycList.length} vendeur{kycList.length > 1 ? 's' : ''} en attente de vérification
            </p>
          </div>
          <button
            onClick={fetchKyc}
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
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className='flex items-center gap-2 p-3 mb-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700'
            >
              <CheckCircle className='w-4 h-4 shrink-0' />
              {success}
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className='flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700'
            >
              <AlertCircle className='w-4 h-4 shrink-0' />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search */}
        <div className='relative mb-6'>
          <Search className='absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
          <input
            type='text'
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder='Rechercher par nom ou email...'
            className='w-full pl-11 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 transition-all'
          />
        </div>

        {/* Liste */}
        {loading ? (
          <div className='space-y-3'>
            {[1,2,3].map(i => (
              <div key={i} className='bg-white rounded-2xl border border-gray-100 p-5 animate-pulse'>
                <div className='flex items-center gap-4'>
                  <div className='w-12 h-12 bg-gray-200 rounded-xl shrink-0' />
                  <div className='flex-1 space-y-2'>
                    <div className='h-4 bg-gray-200 rounded w-1/3' />
                    <div className='h-3 bg-gray-100 rounded w-1/2' />
                  </div>
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
              <UserCheck className='w-8 h-8 text-green-500' />
            </div>
            <p className='font-semibold text-gray-700 mb-1'>
              {search ? 'Aucun résultat' : 'Aucun KYC en attente'}
            </p>
            <p className='text-sm text-gray-400'>
              {search ? 'Essayez un autre terme' : 'Tous les vendeurs ont été vérifiés 🎉'}
            </p>
          </motion.div>
        ) : (
          <div className='space-y-3'>
            <AnimatePresence>
              {filtered.map(kyc => (
                <KycCard
                  key={kyc.id}
                  kyc={kyc}
                  onDecide={handleDecide}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

      </div>

      {/* Modal décision */}
      <AnimatePresence>
        {selected && (
          <DecisionModal
            kyc={selected}
            onConfirm={handleConfirm}
            onClose={() => setSelected(null)}
            loading={modalLoad}
          />
        )}
      </AnimatePresence>
    </div>
  );
}