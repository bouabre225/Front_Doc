import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Package, Clock, CheckCircle, XCircle,
  AlertCircle, User, Store, CreditCard, MessageCircle,
  ShoppingBag, Ban, AlertTriangle
} from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { getCommandeById, cancelCommande, payCommande, createLitige, getMe } from '../../../services/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUT_CONFIG = {
  en_attente: {
    label: 'En attente de paiement',
    color: 'from-yellow-400 to-orange-400',
    bg:    'bg-yellow-50 border-yellow-200',
    text:  'text-yellow-700',
    icon:  Clock,
  },
  payee: {
    label: 'Payée — en cours de traitement',
    color: 'from-blue-400 to-blue-600',
    bg:    'bg-blue-50 border-blue-200',
    text:  'text-blue-700',
    icon:  CheckCircle,
  },
  livree: {
    label: 'Livrée',
    color: 'from-[#1DBF73] to-[#09B1BA]',
    bg:    'bg-green-50 border-green-200',
    text:  'text-green-700',
    icon:  CheckCircle,
  },
  annulee: {
    label: 'Annulée',
    color: 'from-gray-400 to-gray-500',
    bg:    'bg-gray-50 border-gray-200',
    text:  'text-gray-600',
    icon:  XCircle,
  },
  litige: {
    label: 'Litige en cours',
    color: 'from-orange-400 to-red-400',
    bg:    'bg-orange-50 border-orange-200',
    text:  'text-orange-700',
    icon:  AlertCircle,
  },
};

const formatDate = (d) =>
  new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const formatPrice = (p) =>
  Number(p).toLocaleString('fr-FR') + ' FCFA';

// ─── Modal confirmation ───────────────────────────────────────────────────────

const ConfirmModal = ({ title, message, onConfirm, onCancel, loading, danger = false, children }) => (
  <AnimatePresence>
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
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${danger ? 'bg-red-100' : 'bg-yellow-100'}`}>
          <AlertTriangle className={`w-7 h-7 ${danger ? 'text-red-500' : 'text-yellow-500'}`} />
        </div>
        <h3 className='text-lg font-bold text-gray-900 text-center mb-2'>{title}</h3>
        <p className='text-sm text-gray-500 text-center mb-5'>{message}</p>
        {children}
        <div className='flex gap-3 mt-4'>
          <button
            onClick={onCancel}
            className='flex-1 py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-all text-sm'
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-3 text-white font-semibold rounded-xl transition-all text-sm disabled:opacity-50 ${
              danger
                ? 'bg-gradient-to-r from-red-500 to-red-600'
                : 'bg-gradient-to-r from-[#1DBF73] to-[#09B1BA]'
            }`}
          >
            {loading ? (
              <span className='flex items-center justify-center gap-2'>
                <span className='w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin' />
                Chargement...
              </span>
            ) : 'Confirmer'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

// ─── Composant principal ──────────────────────────────────────────────────────

const CommandeDetail = () => {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'));

  const [commande,      setCommande]      = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error,         setError]         = useState('');
  const [success,       setSuccess]       = useState('');

  // Modals
  const [showCancel,  setShowCancel]  = useState(false);
  const [showPay,     setShowPay]     = useState(false);
  const [showLitige,  setShowLitige]  = useState(false);
  const [litigeMotif, setLitigeMotif] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('auth_token')) { navigate('/login'); return; }
    fetchCommande();
    // Rafraîchir le profil utilisateur pour avoir les données à jour (ex: téléphone)
    getMe().then(res => {
      const user = res.user ?? res.data ?? res;
      setCurrentUser(user);
      localStorage.setItem('user', JSON.stringify(user));
    }).catch(() => {});
  }, [id]);

  const fetchCommande = async () => {
    setLoading(true);
    try {
      const res = await getCommandeById(id);
      setCommande(res.data ?? res);
    } catch {
      setError('Commande introuvable.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      await cancelCommande(id);
      setSuccess('Commande annulée avec succès.');
      setShowCancel(false);
      fetchCommande();
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'annulation.');
      setShowCancel(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePay = async () => {
    // Guard: FedaPay needs the user's phone number stored in their profile
    if (!currentUser.telephone) {
      setError('Veuillez ajouter un numéro de téléphone à votre profil avant de payer.');
      setShowPay(false);
      return;
    }

    const publicKey = import.meta.env.VITE_FEDAPAY_PUBLIC_KEY;
    if (!publicKey) {
      setError('Configuration de paiement manquante. Contactez l\'administrateur.');
      setShowPay(false);
      return;
    }

    setActionLoading(true);
    try {
        const res  = await payCommande(id);
        const data = res.data ?? res;

        if (!data.token) throw new Error('Token de paiement manquant — vérifiez la configuration FedaPay côté serveur.');

        setShowPay(false);

        // ── Ouvrir le modal FedaPay natif ──────────────────────────────
        window.FedaPay.init({
          public_key:  publicKey,
          transaction: { token: data.token },
          onComplete: function(transaction) {
            if (transaction.reason === window.FedaPay.CHECKOUT_COMPLETED) {
              setSuccess('Paiement effectué avec succès !');
              fetchCommande();
            } else {
              setError('Paiement annulé ou échoué.');
            }
          },
        }).open();

    } catch (err) {
        setError(err.message || 'Erreur lors du paiement.');
        setShowPay(false);
        setActionLoading(false);
    }
  };

  const handleLitige = async () => {
    if (!litigeMotif.trim()) return;
    setActionLoading(true);
    try {
      await createLitige({ commande_id: id, motif: litigeMotif });
      setSuccess('Litige ouvert avec succès. Notre équipe vous contactera.');
      setShowLitige(false);
      setLitigeMotif('');
      fetchCommande();
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'ouverture du litige.');
      setShowLitige(false);
    } finally {
      setActionLoading(false);
    }
  };

  const isAcheteur = currentUser.id === commande?.acheteur_id;
  const isVendeur  = currentUser.id === commande?.vendeur_id;
  const cfg        = commande ? (STATUT_CONFIG[commande.statut] || STATUT_CONFIG.en_attente) : null;
  const Icon       = cfg?.icon;

  // ── Skeleton ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <Header />
        <div className='container px-4 py-10 mx-auto max-w-2xl'>
          <div className='bg-white rounded-2xl border border-gray-100 p-8 animate-pulse space-y-5'>
            <div className='h-6 bg-gray-200 rounded w-1/3' />
            <div className='h-20 bg-gray-100 rounded-xl' />
            <div className='h-4 bg-gray-200 rounded w-2/3' />
            <div className='h-4 bg-gray-100 rounded w-1/2' />
            <div className='h-12 bg-gray-200 rounded-xl' />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error && !commande) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <Header />
        <div className='flex flex-col items-center justify-center py-32 text-center px-4'>
          <div className='w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-4'>
            <XCircle className='w-8 h-8 text-red-400' />
          </div>
          <p className='font-semibold text-gray-700 mb-4'>{error}</p>
          <button onClick={() => navigate('/commandes')} className='px-5 py-2.5 bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white font-semibold rounded-xl text-sm'>
            Retour aux commandes
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <Header />

      <div className='container px-4 py-8 mx-auto max-w-2xl'>

        {/* Retour */}
        <button
          onClick={() => navigate('/commandes')}
          className='inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#1DBF73] transition-colors mb-6'
        >
          <ArrowLeft className='w-4 h-4' />
          Mes commandes
        </button>

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

        {commande && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className='space-y-4'
          >
            {/* Statut card */}
            <div className={`rounded-2xl border p-5 ${cfg.bg}`}>
              <div className='flex items-center gap-3'>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cfg.color} flex items-center justify-center shadow-sm`}>
                  <Icon className='w-5 h-5 text-white' />
                </div>
                <div>
                  <p className={`font-bold text-sm ${cfg.text}`}>{cfg.label}</p>
                  <p className='text-xs text-gray-400'>Commande #{commande.id.slice(0, 8).toUpperCase()}</p>
                </div>
              </div>
            </div>

            {/* Annonce */}
            <div className='bg-white rounded-2xl border border-gray-100 p-5'>
              <div className='flex items-center gap-3 mb-1'>
                <Package className='w-4 h-4 text-[#1DBF73]' />
                <span className='text-xs font-semibold text-gray-400 uppercase tracking-wide'>Équipement</span>
              </div>
              <Link
                to={`/equipment/${commande.annonce_id}`}
                className='font-bold text-gray-900 hover:text-[#1DBF73] transition-colors text-lg block mt-2'
              >
                {commande.annonce?.titre}
              </Link>
              <div className='flex items-center gap-6 mt-3 pt-3 border-t border-gray-100'>
                <div>
                  <p className='text-xs text-gray-400'>Quantité</p>
                  <p className='font-bold text-gray-800'>{commande.quantite}</p>
                </div>
                <div>
                  <p className='text-xs text-gray-400'>Prix unitaire</p>
                  <p className='font-bold text-gray-800'>{formatPrice(commande.annonce?.prix_total)}</p>
                </div>
                <div>
                  <p className='text-xs text-gray-400'>Total</p>
                  <p className='font-bold text-xl text-[#1DBF73]'>{formatPrice(commande.montant)}</p>
                </div>
              </div>
            </div>

            {/* Parties */}
            <div className='grid grid-cols-2 gap-4'>
              <div className='bg-white rounded-2xl border border-gray-100 p-4'>
                <div className='flex items-center gap-2 mb-2'>
                  <User className='w-4 h-4 text-[#1DBF73]' />
                  <span className='text-xs font-semibold text-gray-400 uppercase tracking-wide'>Acheteur</span>
                </div>
                <p className='font-bold text-gray-800 text-sm'>{commande.acheteur?.nom}</p>
                <p className='text-xs text-gray-400 mt-0.5'>{commande.acheteur?.email}</p>
              </div>
              <div className='bg-white rounded-2xl border border-gray-100 p-4'>
                <div className='flex items-center gap-2 mb-2'>
                  <Store className='w-4 h-4 text-[#09B1BA]' />
                  <span className='text-xs font-semibold text-gray-400 uppercase tracking-wide'>Vendeur</span>
                </div>
                <p className='font-bold text-gray-800 text-sm'>{commande.vendeur?.nom}</p>
                <p className='text-xs text-gray-400 mt-0.5'>{commande.vendeur?.email}</p>
              </div>
            </div>

            {/* Dates */}
            <div className='bg-white rounded-2xl border border-gray-100 p-5'>
              <div className='flex items-center gap-2 mb-3'>
                <Clock className='w-4 h-4 text-gray-400' />
                <span className='text-xs font-semibold text-gray-400 uppercase tracking-wide'>Dates</span>
              </div>
              <div className='space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-500'>Commandé le</span>
                  <span className='font-medium text-gray-800'>{formatDate(commande.created_at)}</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-500'>Mis à jour le</span>
                  <span className='font-medium text-gray-800'>{formatDate(commande.updated_at)}</span>
                </div>
              </div>
            </div>

            {/* Paiement */}
            {commande.paiement && (
              <div className='bg-white rounded-2xl border border-gray-100 p-5'>
                <div className='flex items-center gap-2 mb-3'>
                  <CreditCard className='w-4 h-4 text-[#1DBF73]' />
                  <span className='text-xs font-semibold text-gray-400 uppercase tracking-wide'>Paiement</span>
                </div>
                <div className='space-y-2 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-gray-500'>Méthode</span>
                    <span className='font-medium text-gray-800'>{commande.paiement.moyen ?? commande.paiement.methode ?? '—'}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-500'>Statut paiement</span>
                    <span className='font-medium text-gray-800 capitalize'>{commande.paiement.statut ?? '—'}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-500'>Montant</span>
                    <span className='font-medium text-gray-800'>{commande.paiement.montant ? formatPrice(commande.paiement.montant) : '—'}</span>
                  </div>
                  {commande.paiement.date_paiement && (
                    <div className='flex justify-between'>
                      <span className='text-gray-500'>Date</span>
                      <span className='font-medium text-gray-800'>{formatDate(commande.paiement.date_paiement)}</span>
                    </div>
                  )}
                  <div className='flex justify-between'>
                    <span className='text-gray-500'>Référence</span>
                    <span className='font-medium text-gray-800 break-all text-right max-w-[180px]'>{commande.paiement.provider_reference ?? commande.paiement.reference ?? '—'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className='bg-white rounded-2xl border border-gray-100 p-5 space-y-3'>
              <p className='text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1'>Actions</p>

              {/* Payer — acheteur + en_attente */}
              {isAcheteur && commande.statut === 'en_attente' && (
                <>
                  {!currentUser.telephone && (
                    <div className='flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-xs text-yellow-700'>
                      <AlertCircle className='w-4 h-4 shrink-0 mt-0.5' />
                      <span>
                        Un numéro de téléphone est requis pour le paiement FedaPay.{' '}
                        <Link to='/profile' className='underline font-semibold'>Mettre à jour le profil</Link>
                      </span>
                    </div>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setShowPay(true)}
                    disabled={!currentUser.telephone}
                    className='w-full py-3.5 bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    <CreditCard className='w-4 h-4' />
                    Payer maintenant — {formatPrice(commande.montant)}
                  </motion.button>
                </>
              )}

              {/* Contacter l'interlocuteur */}
              <Link
                to={`/messages?userId=${isAcheteur ? commande.vendeur_id : commande.acheteur_id}`}
                className='w-full py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl flex items-center justify-center gap-2 hover:border-[#1DBF73]/50 hover:text-[#1DBF73] transition-all text-sm'
              >
                <MessageCircle className='w-4 h-4' />
                Contacter le {isAcheteur ? 'vendeur' : 'acheteur'}
              </Link>

              {/* Ouvrir un litige — acheteur + payee */}
              {isAcheteur && commande.statut === 'payee' && (
                <button
                  onClick={() => setShowLitige(true)}
                  className='w-full py-3 border-2 border-orange-200 text-orange-600 font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-orange-50 transition-all text-sm'
                >
                  <AlertCircle className='w-4 h-4' />
                  Ouvrir un litige
                </button>
              )}

              {/* Annuler — acheteur + en_attente */}
              {isAcheteur && commande.statut === 'en_attente' && (
                <button
                  onClick={() => setShowCancel(true)}
                  className='w-full py-3 border-2 border-red-200 text-red-500 font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-red-50 transition-all text-sm'
                >
                  <Ban className='w-4 h-4' />
                  Annuler la commande
                </button>
              )}
            </div>

          </motion.div>
        )}
      </div>

      <Footer />

      {/* ── Modals ─────────────────────────────────────────────────────────── */}

      {showPay && (
        <ConfirmModal
          title='Confirmer le paiement'
          message={`Vous allez payer ${formatPrice(commande?.montant)} pour "${commande?.annonce?.titre}".`}
          onConfirm={handlePay}
          onCancel={() => setShowPay(false)}
          loading={actionLoading}
        />
      )}

      {showCancel && (
        <ConfirmModal
          title='Annuler la commande ?'
          message='Cette action est irréversible. La commande sera définitivement annulée.'
          onConfirm={handleCancel}
          onCancel={() => setShowCancel(false)}
          loading={actionLoading}
          danger
        />
      )}

      {showLitige && (
        <ConfirmModal
          title='Ouvrir un litige'
          message='Décrivez le problème rencontré. Notre équipe vous contactera sous 24h.'
          onConfirm={handleLitige}
          onCancel={() => { setShowLitige(false); setLitigeMotif(''); }}
          loading={actionLoading}
          danger
        >
          <textarea
            value={litigeMotif}
            onChange={e => setLitigeMotif(e.target.value)}
            placeholder='Décrivez votre problème en détail...'
            rows={4}
            className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all resize-none'
          />
        </ConfirmModal>
      )}

    </div>
  );
};

export default CommandeDetail;