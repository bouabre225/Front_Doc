import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle, Search, RefreshCw, CheckCircle, XCircle,
  User, Shield, MessageSquare, ChevronDown, ChevronUp,
  Eye, Scale, Info
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
  non_conforme: 'Non conforme',
  non_recu:     'Non reçu',
  defectueux:   'Défectueux',
  fraude:       'Fraude',
  autre:        'Autre',
};

// ─── Modal résolution amélioré ───────────────────────────────────────────────

const ResolutionModal = ({ litige, onConfirm, onClose, loading }) => {
  const [decision, setDecision] = useState('');
  const [commentaire, setCommentaire] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm'
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className='bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 overflow-hidden'
      >
        <div className='flex items-center gap-4 mb-6'>
          <div className='w-12 h-12 bg-gradient-to-br from-gray-800 to-black rounded-2xl flex items-center justify-center shadow-lg'>
            <Scale className='w-6 h-6 text-white' />
          </div>
          <div>
            <h3 className='text-xl font-black text-gray-900'>Décision finale</h3>
            <p className='text-xs text-gray-500'>Litige #{litige.id.slice(0,8).toUpperCase()}</p>
          </div>
        </div>

        {/* Choix de la décision */}
        <div className='grid grid-cols-2 gap-3 mb-6'>
          <button
            onClick={() => setDecision('rembourse')}
            className={`flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all ${
              decision === 'rembourse' ? 'border-[#1DBF73] bg-green-50 text-[#1DBF73]' : 'border-gray-100 text-gray-400 hover:border-gray-200'
            }`}
          >
            <CheckCircle className='w-6 h-6' />
            <span className='font-bold text-sm'>Rembourser</span>
          </button>
          <button
            onClick={() => setDecision('rejete')}
            className={`flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all ${
              decision === 'rejete' ? 'border-red-500 bg-red-50 text-red-500' : 'border-gray-100 text-gray-400 hover:border-gray-200'
            }`}
          >
            <XCircle className='w-6 h-6' />
            <span className='font-bold text-sm'>Rejeter</span>
          </button>
        </div>

        {/* Commentaire de l'admin */}
        <div className='mb-6'>
          <label className='block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest'>
            Justification (Sera visible par les deux parties)
          </label>
          <textarea
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            placeholder="Expliquez les raisons de votre décision..."
            className='w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm focus:border-blue-400 focus:outline-none transition-all resize-none'
            rows={4}
          />
        </div>

        <div className='flex gap-3'>
          <button onClick={onClose} className='flex-1 py-4 text-gray-500 font-bold text-sm hover:bg-gray-50 rounded-2xl transition-all'>
            Annuler
          </button>
          <button
            disabled={!decision || !commentaire || loading}
            onClick={() => onConfirm(litige.id, decision, commentaire)}
            className={`flex-1 py-4 text-white font-bold rounded-2xl text-sm shadow-xl transition-all disabled:opacity-30 ${
              decision === 'rejete' ? 'bg-red-500' : 'bg-[#1DBF73]'
            }`}
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin mx-auto" /> : "Confirmer"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Composant LitigeCard ────────────────────────────────────────────────────

const LitigeCard = ({ litige, onPrendreEnCharge, onResoudre, actionLoading }) => {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUT_CONFIG[litige.statut] || STATUT_CONFIG.en_attente;

  return (
    <motion.div layout className='bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden mb-3'>
      <div className='p-5 flex items-center gap-4 cursor-pointer' onClick={() => setExpanded(!expanded)}>
        <div className='w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center shrink-0'>
          <AlertCircle className='w-6 h-6 text-orange-500' />
        </div>
        <div className='flex-1 min-w-0'>
          <h4 className='font-black text-gray-900 truncate'>{litige.commande?.annonce?.titre}</h4>
          <div className='flex items-center gap-2 mt-1'>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.color}`}>{cfg.label}</span>
            <span className='text-[10px] text-gray-400 font-bold uppercase'>{formatDate(litige.created_at)}</span>
          </div>
        </div>
        <div className='text-right mr-2'>
           <p className='font-black text-[#1DBF73]'>{formatPrice(litige.commande?.montant)}</p>
        </div>
        {expanded ? <ChevronUp className='text-gray-300' /> : <ChevronDown className='text-gray-300' />}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className='p-5 border-t border-gray-50 space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='bg-gray-50 p-4 rounded-2xl'>
                  <p className='text-[10px] font-black text-gray-400 uppercase mb-1'>Acheteur</p>
                  <p className='text-sm font-bold'>{litige.commande?.acheteur?.nom}</p>
                </div>
                <div className='bg-gray-50 p-4 rounded-2xl'>
                  <p className='text-[10px] font-black text-gray-400 uppercase mb-1'>Vendeur</p>
                  <p className='text-sm font-bold'>{litige.commande?.vendeur?.nom}</p>
                </div>
              </div>

              <div className='bg-orange-50/50 border border-orange-100 p-4 rounded-2xl'>
                 <div className='flex items-center gap-2 mb-2 text-orange-600'>
                    <MessageSquare className='w-4 h-4' />
                    <span className='text-xs font-bold'>Motif : {MOTIF_LABELS[litige.motif] || litige.motif}</span>
                 </div>
                 <p className='text-sm text-gray-600 italic'>"{litige.preuves || litige.description || "Pas de détails"}"</p>
              </div>

              <div className='flex gap-3'>
                {litige.statut === 'en_attente' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onPrendreEnCharge(litige.id); }}
                    disabled={actionLoading === litige.id}
                    className='flex-1 py-3 bg-blue-50 text-blue-600 font-bold rounded-2xl text-sm flex items-center justify-center gap-2'
                  >
                    <Eye className='w-4 h-4' /> Prendre en charge
                  </button>
                )}
                {(litige.statut === 'en_attente' || litige.statut === 'en_cours') && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onResoudre(litige); }}
                    className='flex-1 py-3 bg-gray-900 text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-gray-200'
                  >
                    <Scale className='w-4 h-4' /> Trancher
                  </button>
                )}
                {(litige.statut === 'resolu' || litige.statut === 'rejete') && (
                  <div className='flex-1 py-3 bg-green-50 text-green-600 font-bold rounded-2xl text-sm text-center'>
                    Dossier clôturé
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

// ─── Main Admin Component ────────────────────────────────────────────────────

export default function AdminLitiges() {
  const [litiges, setLitiges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoad, setActionLoad] = useState(null);
  const [modalLitige, setModalLitige] = useState(null);
  const [modalLoad, setModalLoad] = useState(false);
  const [success, setSuccess] = useState('');

  const fetchLitiges = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminLitiges();
      setLitiges(res.data ?? res);
    } catch { /**/ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchLitiges(); }, [fetchLitiges]);

  const handlePrendreEnCharge = async (id) => {
    setActionLoad(id);
    try {
      await prendreEnChargeLitige(id);
      fetchLitiges();
      setSuccess('Litige passé en cours de traitement.');
    } catch { /**/ } finally { setActionLoad(null); }
  };

  const handleResoudre = async (id, decision, commentaire) => {
    setModalLoad(true);
    try {
      await resoldreLitige(id, { decision, commentaire });
      setModalLitige(null);
      fetchLitiges();
      setSuccess('Le litige a été tranché avec succès.');
    } catch { /**/ } finally { setModalLoad(false); }
  };

  return (
    <div className='min-h-screen bg-[#F8FAFC] p-6'>
      <div className='max-w-3xl mx-auto'>
        <div className='flex justify-between items-end mb-8'>
          <div>
            <h1 className='text-3xl font-black text-gray-900 tracking-tight'>Litiges</h1>
            <p className='text-gray-400 font-bold text-sm'>CENTRE DE MÉDIATION DOCSPACE</p>
          </div>
          <button onClick={fetchLitiges} className='p-3 bg-white rounded-2xl shadow-sm border border-gray-100 hover:rotate-180 transition-all duration-500'>
            <RefreshCw className={`w-5 h-5 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {success && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className='p-4 bg-[#1DBF73] text-white rounded-2xl font-bold text-sm mb-6 flex items-center gap-3'>
            <CheckCircle className='w-5 h-5' /> {success}
          </motion.div>
        )}

        {loading ? (
          <div className='space-y-4 animate-pulse'>
            {[1, 2, 3].map(i => <div key={i} className='h-24 bg-gray-200 rounded-3xl' />)}
          </div>
        ) : (
          <div className='space-y-2'>
            {litiges.length > 0 ? (
              litiges.map(l => (
                <LitigeCard key={l.id} litige={l} onPrendreEnCharge={handlePrendreEnCharge} onResoudre={setModalLitige} actionLoading={actionLoad} />
              ))
            ) : (
              <div className='text-center py-20'>
                <div className='w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <Shield className='w-10 h-10 text-[#1DBF73]' />
                </div>
                <p className='text-gray-400 font-bold'>Aucun litige en attente</p>
              </div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {modalLitige && (
          <ResolutionModal litige={modalLitige} onClose={() => setModalLitige(null)} onConfirm={handleResoudre} loading={modalLoad} />
        )}
      </AnimatePresence>
    </div>
  );
}