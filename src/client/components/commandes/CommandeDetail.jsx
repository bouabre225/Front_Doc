import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Package, Clock, CheckCircle, XCircle,
  AlertCircle, User, Store, CreditCard, MessageCircle,
  ShoppingBag, Ban, AlertTriangle, Mail, Star, RefreshCw
} from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { getCommandeById, cancelCommande, payCommande, createLitige, verifyCommande, renvoyerFacture, createAvis } from '../../../services/api';
import { useLang } from '../../context/LangContext';
import { getLocale } from '../../i18n/format';

// ─── Stepper suivi commande (dynamique selon statut) ────────────────────────

const ORDER_FLOW = ['en_attente', 'payee', 'livree', 'cloturee'];

const OrderStepper = ({ statut, t }) => {
  if (statut === 'annulee' || statut === 'litige') return null;
  const steps = [
    { key: 'en_attente', icon: Package,     color: 'text-gray-600 bg-gray-100',   label: t.order.stepCreated,   desc: t.order.stepCreatedD },
    { key: 'payee',      icon: CheckCircle, color: 'text-[#1DBF73] bg-[#1DBF73]/10', label: t.order.stepPaid,      desc: t.order.stepPaidD },
    { key: 'livree',     icon: ShoppingBag, color: 'text-[#09B1BA] bg-[#09B1BA]/10', label: t.order.stepShipped,   desc: t.order.stepShippedD },
    { key: 'cloturee',   icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50', label: t.order.stepDelivered, desc: t.order.stepDeliveredD },
  ];
  const current = ORDER_FLOW.indexOf(statut);
  return (
    <div className='space-y-3' role='list' aria-label={t.order.stepCreated}>
      {steps.map(({ key, icon: Icon, color, label, desc }, i) => {
        const done = i <= current;
        return (
          <div key={key} role='listitem' className='flex items-center gap-4'>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${done ? color : 'text-gray-300 bg-gray-50'}`}>
              <Icon className='w-5 h-5' />
            </div>
            <div className='flex-1 min-w-0'>
              <p className={`text-sm font-bold ${done ? 'text-gray-900' : 'text-gray-400'}`}>{label}</p>
              <p className='text-xs text-gray-400'>{desc}</p>
            </div>
            {done && <CheckCircle className='w-4 h-4 text-[#1DBF73] shrink-0' />}
          </div>
        );
      })}
    </div>
  );
};

// ─── Formulaire d'avis (extrait du bandeau payé : visible livrée/clôturée) ───

const AvisForm = ({ noteVendeur, setNoteVendeur, noteConformite, setNoteConformite, avisCommentaire, setAvisCommentaire, onSubmit, loading, t }) => (
  <div className='w-full p-4 mb-3 border-2 border-yellow-100 bg-yellow-50/50 rounded-xl'>
    <p className='text-sm font-bold text-gray-800 mb-3 flex items-center gap-2'>
      <Star className='w-4 h-4 fill-yellow-400 text-yellow-400' /> {t.order.rateTitle}
    </p>
    {[[t.order.ratingSeller, noteVendeur, setNoteVendeur], [t.order.ratingConformity, noteConformite, setNoteConformite]].map(([label, val, setVal]) => (
      <div key={label} className='flex items-center justify-between mb-2'>
        <span className='text-xs text-gray-600'>{label}</span>
        <div className='flex gap-1' role='radiogroup' aria-label={label}>
          {[1, 2, 3, 4, 5].map((s) => (
            <button key={s} type='button' onClick={() => setVal(s)} aria-label={`${label} ${s}/5`} className='w-11 h-11 flex items-center justify-center'>
              <Star className={`w-5 h-5 ${s <= val ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
            </button>
          ))}
        </div>
      </div>
    ))}
    <textarea
      value={avisCommentaire}
      onChange={(e) => setAvisCommentaire(e.target.value)}
      placeholder={t.order.yourReview}
      rows={2}
      maxLength={1000}
      className='w-full mt-2 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-yellow-400 resize-none bg-white'
    />
    <button
      onClick={onSubmit}
      disabled={loading}
      className='w-full mt-2 py-2.5 bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white font-semibold rounded-xl text-sm disabled:opacity-50'
    >
      {loading ? t.order.resending : t.order.publishReview}
    </button>
  </div>
);

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
    label: 'Paiement confirmé',
    color: 'from-[#1DBF73] to-[#09B1BA]',
    bg:    'bg-green-50 border-green-200',
    text:  'text-green-700',
    icon:  CheckCircle,
  },
  expediee: {                                      
    label: 'Expédiée',
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
  new Date(d).toLocaleDateString(getLocale(), { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const formatPrice = (p) =>
  Number(p).toLocaleString(getLocale()) + ' FCFA';

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
            {t.order.cancelTitle}
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
                {t.order.loadingTitle}
              </span>
            ) : t.order.confirmTitle}
          </button>
        </div>
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

// ─── Composant principal ──────────────────────────────────────────────────────

const CommandeDetail = () => {
  const { t } = useLang();
  const { id }      = useParams();
  const navigate    = useNavigate();
  const [searchParams] = useSearchParams();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

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
  const [litigeDetails, setLitigeDetails] = useState('');
  const [noteVendeur, setNoteVendeur] = useState(5);
  const [noteConformite, setNoteConformite] = useState(5);
  const [avisCommentaire, setAvisCommentaire] = useState('');
  const [avisDepose, setAvisDepose] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleManualVerify = async () => {
    setVerifying(true);
    setError('');
    try {
      const data = await verifyCommande(id);
      await fetchCommande();
      if (data.statut === 'payee') {
        setSuccess(t.order.paidOk);
      } else {
        setSuccess(t.order.stillPending);
      }
    } catch {
      setError(t.order.verifyError);
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem('auth_token')) { navigate('/login'); return; }
    fetchCommande();
  }, [id]);

  const fetchCommande = async () => {
    setLoading(true);
    try {
      const res = await getCommandeById(id);
      const data = res.data ?? res;
      setCommande(data);
    } catch {
      setError(t.order.notFound);
    } finally {
      setLoading(false);
    }
  };

  // ─── Polling après retour FedaPay ────────────────────────────────────────
  useEffect(() => {
    const fedaStatus = searchParams.get('status');
    if (!fedaStatus || !commande || commande.statut !== 'en_attente') return;

    const controller = new AbortController();
    let cancelled = false;
    // Vérifier directement côté serveur
    const verify = async () => {
      if (cancelled) return;
      try {
        const data = await verifyCommande(id);
        if (cancelled) return;
        if (data.statut === 'payee') {
          fetchCommande();
          setSuccess('✅ Paiement confirmé ! Votre facture a été envoyée par email.');
        }
      } catch { /**/ }
    };

    // Essaie immédiatement puis toutes les 3s pendant 1 min
    verify();
    const interval = setInterval(verify, 3000);
    const timeout  = setTimeout(() => clearInterval(interval), 60000);

    return () => { cancelled = true; controller.abort(); clearInterval(interval); clearTimeout(timeout); };
  }, [commande?.statut, id]);


  const handleCancel = async () => {
    setActionLoading(true);
    try {
      await cancelCommande(id);
      setSuccess(t.order.cancelledOk);
      setShowCancel(false);
      fetchCommande();
    } catch (err) {
      setError(err.message || t.order.cancelError);
      setShowCancel(false);
    } finally {
      setActionLoading(false);
    }
  };

const handlePay = async () => {
  setActionLoading(true);
  try {
    const res  = await payCommande(id);
    const data = res.data ?? res;

    if (!data.payment_url && !data.token) throw new Error('URL de paiement manquante');

    setShowPay(false);

    const payUrl = data.payment_url ?? `https://process.fedapay.com/${data.token}`;
    // Redirection same-tab : évite le blocage popup
    window.location.href = payUrl;

  } catch (err) {
    setError(err.message || t.order.payError);
    setShowPay(false);
  } finally {
    setActionLoading(false);
  }
};

  const handleAvis = async () => {
    setActionLoading(true);
    setError('');
    try {
      await createAvis(id, { note_vendeur: noteVendeur, note_conformite: noteConformite, commentaire: avisCommentaire.trim() || undefined });
      setSuccess(t.order.reviewThanks);
      setAvisDepose(true);
      fetchCommande();
    } catch (err) {
      if ((err.message || '').toLowerCase().includes('déjà')) setAvisDepose(true);
      else setError(err.message || t.order.reviewError);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResendFacture = async () => {    setActionLoading(true);
    setError('');
    try {
      const res = await renvoyerFacture(id);
      setSuccess(res.message || t.order.billResent);
    } catch (err) {
      setError(err.message || t.order.billError);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLitige = async () => {    if (!litigeMotif.trim()) {
      setError(t.order.disputeNeedReason);
      return;
    }
    setActionLoading(true);
    try {
      await createLitige({ commande_id: id, motif: litigeMotif, preuves: litigeDetails.trim() || undefined });
      setSuccess(t.order.disputeOk);
      setShowLitige(false);
      setLitigeMotif('');
      setLitigeDetails('');
      fetchCommande();
    } catch (err) {
      setError(err.message || t.order.disputeError);
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

  const prixTotal    = Number(commande.montant);
  const quantite     = Number(commande.quantite) || 1;
  const prixVendeur  = Math.round(prixTotal / 1.08 / quantite);
  const protection   = Math.round(prixVendeur * 0.08 * quantite);

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
          {t.order.backToOrders}
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

        {/* ── Section succès paiement ─────────────────────────────────────── */}
        {commande?.statut === 'payee' && isAcheteur && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='mb-6 overflow-hidden rounded-2xl border border-green-200 shadow-lg'
          >
            {/* Bandeau dégradé */}
            <div className='bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] px-6 py-8 text-center'>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className='w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4'
              >
                <CheckCircle className='w-10 h-10 text-white' />
              </motion.div>
              <h2 className='text-2xl font-black text-white mb-2'>{t.order.paidTitle}</h2>
              <p className='text-white/85 text-sm'>
                {t.order.thankYou}
              </p>
            </div>

            {/* Détails */}
            <div className='bg-white px-6 py-5 space-y-4'>

              {/* Étapes livraison — dynamiques selon statut */}
              <OrderStepper statut={commande.statut} t={t} />

              <div className='border-t border-gray-100 pt-4'>
                <p className='text-xs text-center text-gray-400 mb-4'>
                  📧 {t.order.billSentTo} <span className='font-semibold text-gray-600'>{commande.acheteur?.email}</span>
                  <br />{t.order.checkSpam}
                </p>

                <button
                  onClick={handleResendFacture}
                  disabled={actionLoading}
                  className='w-full py-3 mb-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl flex items-center justify-center gap-2 hover:border-[#1DBF73]/50 hover:text-[#1DBF73] transition-all text-sm disabled:opacity-50'
                >
                  {actionLoading
                    ? <div className='w-4 h-4 border-2 border-gray-400 rounded-full border-t-transparent animate-spin' />
                    : <Mail className='w-4 h-4' />}
                  {t.order.resendBill}
                </button>

                {isAcheteur && (
                  <Link
                    to={`/messages?userId=${commande.vendeur_id}`}
                    className='w-full py-3 mb-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl flex items-center justify-center gap-2 hover:border-[#1DBF73]/50 hover:text-[#1DBF73] transition-all text-sm'
                  >
                    <MessageCircle className='w-4 h-4' />
                    {t.order.contactSeller}
                  </Link>
                )}
                <div className='flex gap-3'>
                  <Link
                    to='/explore'
                    className='flex-1 py-3 text-center text-sm font-semibold text-gray-600 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all'
                  >
                    {t.order.keepShopping}
                  </Link>
                  <Link
                    to='/profile'
                    className='flex-1 py-3 text-center text-sm font-semibold text-white bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] rounded-xl hover:shadow-lg transition-all'
                  >
                    {t.order.backToOrders}
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Avis & litige (livrée/clôturée, acheteur) ─────────────────── */}
        {commande && isAcheteur && ['livree', 'cloturee'].includes(commande.statut) && (
          <div className='bg-white rounded-2xl border border-gray-100 p-5 mb-4 space-y-3'>
            {!avisDepose ? (
              <AvisForm
                noteVendeur={noteVendeur} setNoteVendeur={setNoteVendeur}
                noteConformite={noteConformite} setNoteConformite={setNoteConformite}
                avisCommentaire={avisCommentaire} setAvisCommentaire={setAvisCommentaire}
                onSubmit={handleAvis} loading={actionLoading} t={t}
              />
            ) : (
              <p className='w-full py-2 text-center text-xs font-semibold text-green-600'>{t.order.alreadyRated}</p>
            )}
            <button
              onClick={() => setShowLitige(true)}
              className='w-full py-3 border-2 border-orange-200 text-orange-600 font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-orange-50 transition-all text-sm'
            >
              <AlertCircle className='w-4 h-4' />
              {t.order.openDispute}
            </button>
          </div>
        )}

        {commande && (commande.statut !== 'payee' || isVendeur) && (
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
                  <p className='text-xs text-gray-400'>Commande #{String(commande.id ?? "").slice(0, 8).toUpperCase()}</p>
                </div>
              </div>
            </div>

            {/* Annonce */}
            <div className='bg-white rounded-2xl border border-gray-100 p-5'>
              <div className='flex items-center gap-3 mb-1'>
                <Package className='w-4 h-4 text-[#1DBF73]' />
                <span className='text-xs font-semibold text-gray-400 uppercase tracking-wide'>{t.order.equipment}</span>
              </div>
              <Link
                to={`/equipment/${commande.annonce_id}`}
                className='font-bold text-gray-900 hover:text-[#1DBF73] transition-colors text-lg block mt-2'
              >
                {commande.annonce?.titre}
              </Link>
              <div className='grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-100 sm:flex sm:items-center sm:gap-6'>
                <div>
                  <p className='text-xs text-gray-400'>{t.order.quantity}</p>
                  <p className='font-bold text-gray-800'>{commande.quantite}</p>
                </div>
                <div>
                  <p className='text-xs text-gray-400'>{t.order.sellerPrice}</p>
                  <p className='font-bold text-gray-800'>{formatPrice(prixVendeur * quantite)}</p>
                </div>
                <div>
                  <p className='text-xs text-gray-400 flex items-center gap-1'>
                    🛡️ Protection
                    <span className='bg-[#09B1BA]/10 text-[#09B1BA] px-1.5 py-0.5 rounded-full text-[10px] font-semibold'>8%</span>
                  </p>
                  <p className='font-bold text-[#09B1BA]'>+ {formatPrice(protection)}</p>
                </div>
                <div>
                  <p className='text-xs text-gray-400'>{t.order.total}</p>
                  <p className='font-bold text-lg text-[#1DBF73]'>{formatPrice(commande.montant)}</p>
                </div>
              </div>
            </div>

            {/* Parties */}
            <div className='grid grid-cols-2 gap-4'>
              <div className='bg-white rounded-2xl border border-gray-100 p-4 min-w-0'>
                <div className='flex items-center gap-2 mb-2'>
                  <User className='w-4 h-4 text-[#1DBF73] shrink-0' />
                  <span className='text-xs font-semibold text-gray-400 uppercase tracking-wide'>{t.order.buyer}</span>
                </div>
                <p className='font-bold text-gray-800 text-sm truncate'>{commande.acheteur?.nom}</p>
                <p className='text-xs text-gray-400 mt-0.5 truncate'>{commande.acheteur?.email}</p>
              </div>
              <div className='bg-white rounded-2xl border border-gray-100 p-4 min-w-0'>
                <div className='flex items-center gap-2 mb-2'>
                  <Store className='w-4 h-4 text-[#09B1BA] shrink-0' />
                  <span className='text-xs font-semibold text-gray-400 uppercase tracking-wide'>{t.order.seller}</span>
                </div>
                <p className='font-bold text-gray-800 text-sm truncate'>{commande.vendeur?.nom}</p>
                <p className='text-xs text-gray-400 mt-0.5 truncate'>{commande.vendeur?.email}</p>
              </div>
            </div>

            {/*Informations de livraison */}
            {(isAcheteur || isVendeur) && (commande.adresse_livraison || commande.telephone_livraison) && (
              <div className='bg-white rounded-2xl border border-gray-100 p-5'>
                <div className='flex items-center gap-2 mb-3'>
                  <Package className='w-4 h-4 text-[#1DBF73]' />
                  <span className='text-xs font-semibold text-gray-400 uppercase tracking-wide'>
                    Informations de livraison
                  </span>
                </div>
                <div className='space-y-3'>
                  {commande.adresse_livraison && (
                    <div className='flex items-start gap-3 p-3 bg-gray-50 rounded-xl'>
                      <div className='w-8 h-8 bg-[#1DBF73]/10 rounded-lg flex items-center justify-center shrink-0'>
                        <span className='text-base'>📍</span>
                      </div>
                      <div>
                        <p className='text-xs text-gray-400 font-medium'>{t.order.deliveryAddress}</p>
                        <p className='text-sm font-semibold text-gray-800 mt-0.5'>
                          {commande.adresse_livraison}
                        </p>
                      </div>
                    </div>
                  )}
                  {commande.telephone_livraison && (
                    <div className='flex items-start gap-3 p-3 bg-gray-50 rounded-xl'>
                      <div className='w-8 h-8 bg-[#09B1BA]/10 rounded-lg flex items-center justify-center shrink-0'>
                        <span className='text-base'>📞</span>
                      </div>
                      <div>
                        <p className='text-xs text-gray-400 font-medium'>
                          {isVendeur ? t.order.buyerPhone : t.order.yourPhone}
                        </p>
                        <p className='text-sm font-semibold text-gray-800 mt-0.5'>
                          {commande.telephone_livraison}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Dates */}
            <div className='bg-white rounded-2xl border border-gray-100 p-5'>
              <div className='flex items-center gap-2 mb-3'>
                <Clock className='w-4 h-4 text-gray-400' />
                <span className='text-xs font-semibold text-gray-400 uppercase tracking-wide'>{t.order.dates}</span>
              </div>
              <div className='space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-500'>{t.order.orderedOn}</span>
                  <span className='font-medium text-gray-800'>{formatDate(commande.created_at)}</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-500'>{t.order.updatedOn}</span>
                  <span className='font-medium text-gray-800'>{formatDate(commande.updated_at)}</span>
                </div>
              </div>
            </div>

            {/* Paiement */}
            {commande.paiement && (
              <div className='bg-white rounded-2xl border border-gray-100 p-5'>
                <div className='flex items-center gap-2 mb-3'>
                  <CreditCard className='w-4 h-4 text-[#1DBF73]' />
                  <span className='text-xs font-semibold text-gray-400 uppercase tracking-wide'>{t.order.payment}</span>
                </div>
                <div className='space-y-2 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-gray-500'>{t.order.method}</span>
                    <span className='font-medium text-gray-800'>{commande.paiement.moyen ?? commande.paiement.methode ?? '—'}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-500'>{t.order.paymentStatus}</span>
                    <span className='font-medium text-gray-800 capitalize'>{commande.paiement.statut === 'bloque' ? '✅ Confirmé' : commande.paiement.statut ?? '—'}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-500'>{t.order.amount}</span>
                    <span className='font-medium text-gray-800'>{commande.paiement.montant ? formatPrice(commande.paiement.montant) : '—'}</span>
                  </div>
                  {commande.paiement.date_paiement && (
                    <div className='flex justify-between'>
                      <span className='text-gray-500'>{t.order.date}</span>
                      <span className='font-medium text-gray-800'>{formatDate(commande.paiement.date_paiement)}</span>
                    </div>
                  )}
                  <div className='flex justify-between'>
                    <span className='text-gray-500'>{t.order.reference}</span>
                    <span className='font-medium text-gray-800 break-all text-right max-w-[180px]'>{commande.paiement.provider_reference ?? commande.paiement.reference ?? '—'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className='bg-white rounded-2xl border border-gray-100 p-5 space-y-3'>
              <p className='text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1'>{t.order.actions}</p>

              {/* Payer — acheteur + en_attente */}
              {isAcheteur && commande.statut === 'en_attente' && (
                <>
                  {!currentUser.telephone && (
                    <div className='flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-xs text-yellow-700'>
                      <AlertCircle className='w-4 h-4 shrink-0 mt-0.5' />
                      <span>
                        {t.order.phoneRequiredPay}{' '}
                        <Link to='/profile' className='underline font-semibold'>{t.order.updateProfile}</Link>
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
                    {t.order.payNow} — {formatPrice(commande.montant)}
                  </motion.button>
                </>
              )}

              {/* Contacter l'interlocuteur */}
              <Link
                to={`/messages?userId=${isAcheteur ? commande.vendeur_id : commande.acheteur_id}`}
                className='w-full py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl flex items-center justify-center gap-2 hover:border-[#1DBF73]/50 hover:text-[#1DBF73] transition-all text-sm'
              >
                <MessageCircle className='w-4 h-4' />
                {t.order.contactPeer}  {isAcheteur ? t.order.theSeller : t.order.theBuyer}
              </Link>

              {/* Vérifier mon paiement — acheteur + en_attente */}
              {isAcheteur && commande.statut === 'en_attente' && (
                <button
                  onClick={handleManualVerify}
                  disabled={verifying}
                  className='w-full py-3 border-2 border-[#1DBF73]/40 text-[#1DBF73] font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-[#1DBF73]/5 transition-all text-sm disabled:opacity-50'
                >
                  {verifying
                    ? <><div className='w-4 h-4 border-2 border-[#1DBF73] rounded-full border-t-transparent animate-spin' /> {t.order.verifying}</>
                    : <><RefreshCw className='w-4 h-4' /> {t.order.verifyPayment}</>}
                </button>
              )}

              {/* Annuler — acheteur + en_attente */}
              {isAcheteur && commande.statut === 'en_attente' && (
                <button
                  onClick={() => setShowCancel(true)}
                  className='w-full py-3 border-2 border-red-200 text-red-500 font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-red-50 transition-all text-sm'
                >
                  <Ban className='w-4 h-4' />
                  {t.order.cancelOrderBtn}
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
          title={t.order.confirmPayTitle}
          message={`${t.order.confirmPayMsg} ${formatPrice(commande?.montant)} ${t.order.pour} "${commande?.annonce?.titre}".`}
          onConfirm={handlePay}
          onCancel={() => setShowPay(false)}
          loading={actionLoading}
        />
      )}

      {showCancel && (
        <ConfirmModal
          title={t.order.cancelOrderTitle}
          message={t.order.cancelOrderMsg}
          onConfirm={handleCancel}
          onCancel={() => setShowCancel(false)}
          loading={actionLoading}
          danger
        />
      )}

      {showLitige && (
        <ConfirmModal
          title={t.order.disputeModalTitle}
          message={t.order.disputeModalMsg}
          onConfirm={handleLitige}
          onCancel={() => { setShowLitige(false); setLitigeMotif(''); setLitigeDetails(''); }}
          loading={actionLoading}
          danger
        >
          {/*Select au lieu de textarea */}
          <select
            value={litigeMotif}
            onChange={e => setLitigeMotif(e.target.value)}
            className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all'
          >
            <option value=''>{t.order.chooseReason}</option>
            <option value='non_conforme'>{t.order.reasonNonConforme}</option>
            <option value='defectueux'>{t.order.reasonDefectueux}</option>
            <option value='perdu'>{t.order.reasonPerdu}</option>
          </select>

          {/* Zone de détails optionnelle */}
          <textarea
            value={litigeDetails}
            onChange={(e) => setLitigeDetails(e.target.value)}
            placeholder={t.order.ratePlaceholder}
            rows={3}
            className='w-full mt-3 px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-all resize-none'
          />
        </ConfirmModal>
      )}

    </div>
  );
};

export default CommandeDetail;