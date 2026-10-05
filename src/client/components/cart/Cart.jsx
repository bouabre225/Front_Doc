// src/pages/cart/Cart.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Trash2, Plus, Minus, ArrowLeft,
  ShieldCheck, AlertCircle, CheckCircle, Package
} from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useCart } from '../../context/CartContext';
import { getImageUrl, createCommande } from '../../../services/api';
import ConfirmDialog from '../common/ConfirmDialog';
import { useLang } from '../../context/LangContext';
import { getLocale } from '../../i18n/format';

const Cart = () => {
  const { t } = useLang();
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantite, clearCart, totalPrice, totalItems } = useCart();

  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [fieldError, setFieldError] = useState({}); // {adresse, telephone}
  const [success,   setSuccess]   = useState(false);
  const [createdIds, setCreatedIds] = useState([]);
  const [adresse,   setAdresse]   = useState(() => { try { return localStorage.getItem('delivery_adresse') || ''; } catch { return ''; } });
  const [confirmClear, setConfirmClear] = useState(false);
  const [telephone, setTelephone] = useState(() => { try { return localStorage.getItem('delivery_telephone') || ''; } catch { return ''; } });

  const validPhone = (tel) => /^\+?[0-9\s.-]{8,20}$/.test((tel || '').trim());

  const handleCommander = async () => {
    const token = localStorage.getItem('auth_token');
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    const propresArticles = cart.filter(item => item.vendeur_id === currentUser.id);
    if (propresArticles.length > 0) {
      setError(t.cart.ownArticles);
      return;
    }

    const errs = {};
    if (!adresse.trim()) errs.adresse = t.cart.addressRequired;
    if (!telephone.trim()) errs.telephone = t.cart.phoneRequired;
    else if (!validPhone(telephone)) errs.telephone = t.cart.phoneInvalid;
    setFieldError(errs);
    if (Object.keys(errs).length) return;

    try { localStorage.setItem('delivery_adresse', adresse.trim()); localStorage.setItem('delivery_telephone', telephone.trim()); } catch { /* ignore */ }

    setLoading(true);
    setError('');

    // Séquentiel : si un item échoue, les précédents restent valides et on l'indique
    const created = [];
    try {
      for (const item of cart) {
        const res = await createCommande({
          annonce_id:          item.id,
          quantite:            item.quantite,
          adresse_livraison:   adresse.trim(),
          telephone_livraison: telephone.trim(),
        });
        created.push(res);
      }

      clearCart();
      setCreatedIds(created.map((c) => c?.commande?.id ?? c?.data?.id ?? c?.id).filter(Boolean));
      setSuccess(true);
    } catch (err) {
      if (created.length) {
        clearCart();
        setCreatedIds(created.map((c) => c?.commande?.id ?? c?.data?.id ?? c?.id).filter(Boolean));
        setSuccess(true);
        setError(`${t.cart.partialOk} (${created.length}/${cart.length})`);
      } else {
        setError(err.message || t.cart.orderError);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Panier vide ──────────────────────────────────────────────────────────
  if (cart.length === 0 && !success) {
    return (
      <div className='min-h-screen flex flex-col bg-gray-50'>
        <Header />
        <div className='container max-w-2xl px-4 flex-grow py-20 mx-auto text-center'>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className='w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6'>
              <ShoppingCart className='w-12 h-12 text-gray-300' />
            </div>
            <h2 className='text-2xl font-bold text-gray-800 mb-2'>{t.cart.empty}</h2>
            <p className='text-gray-500 mb-8'>{t.cart.emptyHint}</p>
            <Link
              to='/explore'
              className='inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all'
            >
              <Package className='w-5 h-5' />
              {t.cart.explore}
            </Link>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Succès commande ──────────────────────────────────────────────────────
  if (success) {
    return (
      <div className='min-h-screen flex flex-col bg-gray-50'>
        <Header />
        <div className='container max-w-lg px-4 flex-grow py-20 mx-auto text-center'>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className='p-10 bg-white rounded-2xl shadow-lg'
          >
            <div className='w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6'>
              <CheckCircle className='w-10 h-10 text-green-500' />
            </div>
            <h2 className='text-2xl font-bold text-gray-900 mb-2'>{t.cart.ordered}</h2>
            <p className='text-gray-500 text-sm mb-6'>
              {t.cart.orderedHint}
            </p>
            <div className='flex flex-col gap-3'>
              {createdIds.length > 0 && (
                <Link
                  to={`/commandes/${createdIds[0]}`}
                  className='w-full py-3 bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all'
                >
                  {t.cart.viewOrder}{createdIds.length > 1 ? ` (1/${createdIds.length})` : ''}
                </Link>
              )}
              <Link
                to='/explore'
                className='w-full py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-all'
              >
                {t.cart.keepShopping}
              </Link>
            </div>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className='min-h-screen flex flex-col bg-gray-50'>
      <Header />

      <div className='container flex-grow max-w-5xl px-4 py-10 mx-auto'>

        {/* Header */}
        <div className='flex items-center justify-between mb-8'>
          <div className='flex items-center gap-3'>
            <button onClick={() => navigate(-1)} className='p-2 text-gray-500 hover:text-[#1DBF73] transition-colors'>
              <ArrowLeft className='w-5 h-5' />
            </button>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>{t.cart.title}</h1>
              <p className='text-sm text-gray-400'>{totalItems} {totalItems > 1 ? t.explore.equipmentPlural : t.explore.equipment}</p>
            </div>
          </div>
          <button
            onClick={() => setConfirmClear(true)}
            className='flex items-center gap-1.5 text-xs text-red-400 hover:text-red-500 font-medium transition-colors'
          >
            <Trash2 className='w-3.5 h-3.5' />
            {t.cart.clear}
          </button>
          <ConfirmDialog
            open={confirmClear}
            title={t.cart.clearTitle}
            message={t.cart.clearMsg}
            confirmLabel='Vider'
            tone='danger'
            onConfirm={() => { clearCart(); setConfirmClear(false); }}
            onCancel={() => setConfirmClear(false)}
          />
        </div>

        <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>

          {/* ── Items ──────────────────────────────────────────────── */}
          <div className='lg:col-span-2 space-y-4'>
            <AnimatePresence>
              {cart.map(item => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -30, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className='flex gap-3 p-3 bg-white border border-gray-100 rounded-2xl shadow-sm'
                >
                  {/* Image — plus grande sur mobile */}
                  <div className='w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-100 shrink-0'>
                    {item.image_url ? (
                      <img src={getImageUrl(item.image_url)} alt={item.titre} className='object-cover w-full h-full' />
                    ) : (
                      <div className='flex items-center justify-center w-full h-full text-3xl'>🏥</div>
                    )}
                  </div>

                  {/* Infos */}
                  <div className='flex-1 min-w-0'>
                    <Link
                      to={`/equipment/${item.id}`}
                      className='font-semibold text-gray-900 text-sm line-clamp-2 hover:text-[#1DBF73] transition-colors leading-snug'
                    >
                      {item.titre}
                    </Link>
                    <p className='text-xs text-gray-400 mt-0.5 truncate'>{item.vendeur}</p>
                    <div className='flex items-baseline gap-1 mt-1.5'>
                      <p className='text-base font-bold text-[#1DBF73]'>
                        {(Number(item.prix_vendeur) * item.quantite).toLocaleString(getLocale())}
                      </p>
                      <span className='text-xs text-gray-400'>FCFA</span>
                    </div>
                    <p className='text-xs text-gray-400'>
                      {Number(item.prix_vendeur).toLocaleString(getLocale())}{t.home.perUnit}
                    </p>
                  </div>

                  {/* Quantité + Supprimer */}
                  <div className='flex flex-col items-end justify-between shrink-0'>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className='p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-50 rounded-lg transition-all'
                    >
                      <Trash2 className='w-4 h-4' />
                    </button>
                    <div className='flex items-center gap-1 bg-gray-100 rounded-xl p-1'>
                      <button
                        onClick={() => updateQuantite(item.id, item.quantite - 1)}
                        className='w-11 h-11 flex items-center justify-center rounded-lg hover:bg-white transition-colors'
                      >
                        <Minus className='w-3 h-3 text-gray-600' />
                      </button>
                      <span className='w-5 text-center font-bold text-xs text-gray-900'>{item.quantite}</span>
                      <button
                        onClick={() => updateQuantite(item.id, item.quantite + 1)}
                        disabled={item.quantite >= item.stock}
                        className='w-11 h-11 flex items-center justify-center rounded-lg hover:bg-white transition-colors disabled:opacity-30'
                      >
                        <Plus className='w-3 h-3 text-gray-600' />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* ── Récapitulatif & Commande ────────────────────────────── */}
          <div className='space-y-4'>

            {/* Récap prix */}
            <div className='p-5 bg-white border border-gray-100 rounded-2xl shadow-sm'>
              <h3 className='font-bold text-gray-800 mb-4'>{t.cart.summary}</h3>
              <div className='space-y-2 mb-4'>
                {cart.map(item => (
                  <div key={item.id} className='flex justify-between text-sm'>
                    <span className='text-gray-500 truncate max-w-[150px]'>{item.titre} ×{item.quantite}</span>
                    <span className='font-medium text-gray-800 shrink-0 ml-2'>
                      {(Number(item.prix_vendeur) * item.quantite).toLocaleString(getLocale())} FCFA
                    </span>
                  </div>
                ))}
              </div>
              <div className='border-t border-gray-100 pt-3 space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-500'>{t.cart.subtotal}</span>
                  <span className='font-medium text-gray-800'>
                    {totalPrice.toLocaleString(getLocale())} FCFA
                  </span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='flex items-center gap-1 text-[#09B1BA]'>
                    🛡️ {t.cart.buyerProtection} <span className='text-xs bg-[#09B1BA]/10 px-1.5 py-0.5 rounded-full font-semibold'>8%</span>
                  </span>
                  <span className='font-medium text-[#09B1BA]'>
                    + {Math.round(totalPrice * 0.08).toLocaleString(getLocale())} FCFA
                  </span>
                </div>
                <div className='flex justify-between pt-2 border-t border-gray-100'>
                  <span className='font-bold text-gray-900'>{t.cart.total}</span>
                  <span className='text-xl font-black text-[#1DBF73]'>
                    {Math.round(totalPrice * 1.08).toLocaleString(getLocale())} FCFA
                  </span>
                </div>
              </div>
            </div>

            {/* Formulaire livraison */}
            <div className='p-5 bg-white border border-gray-100 rounded-2xl shadow-sm'>
              <h3 className='font-bold text-gray-800 mb-4'>{t.cart.delivery}</h3>
              <div className='space-y-3'>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-1'>{t.cart.address} *</label>
                  <input
                    type='text'
                    value={adresse}
                    onChange={e => { setAdresse(e.target.value); setFieldError((p) => ({ ...p, adresse: undefined })); }}
                    placeholder={t.cart.addressPh}
                    aria-invalid={!!fieldError.adresse}
                    className={`w-full px-3 py-2.5 border-2 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${fieldError.adresse ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-[#1DBF73] focus:ring-[#1DBF73]/20'}`}
                  />
                  {fieldError.adresse && <p className='text-xs text-red-500 mt-1'>{fieldError.adresse}</p>}
                </div>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-1'>{t.cart.phone} *</label>
                  <input
                    type='tel'
                    value={telephone}
                    onChange={e => { setTelephone(e.target.value); setFieldError((p) => ({ ...p, telephone: undefined })); }}
                    placeholder='+229 XX XX XX XX'
                    aria-invalid={!!fieldError.telephone}
                    className={`w-full px-3 py-2.5 border-2 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${fieldError.telephone ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-[#1DBF73] focus:ring-[#1DBF73]/20'}`}
                  />
                  {fieldError.telephone && <p className='text-xs text-red-500 mt-1'>{fieldError.telephone}</p>}
                </div>
              </div>
            </div>

            {/* Erreur */}
            {error && (
              <div className='flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700'>
                <AlertCircle className='w-4 h-4 shrink-0 mt-0.5' />
                {error}
              </div>
            )}

            {/* Bouton commander */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCommander}
              disabled={loading}
              className='w-full py-4 bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60'
            >
              {loading ? (
                <><div className='w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin' /> {t.cart.processing}</>
              ) : (
                <><ShieldCheck className='w-5 h-5' /> {t.cart.orderFor} {Math.round(totalPrice * 1.08).toLocaleString(getLocale())} FCFA</>
              )}
            </motion.button>

            <p className='text-xs text-center text-gray-400'>
              {t.cart.secureNote}
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Cart;