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

const Cart = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantite, clearCart, totalPrice, totalItems } = useCart();

  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState(false);
  const [adresse,   setAdresse]   = useState('');
  const [telephone, setTelephone] = useState('');

  const handleCommander = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    if (!adresse.trim())   { setError("L'adresse de livraison est requise"); return; }
    if (!telephone.trim()) { setError("Le numéro de téléphone est requis");  return; }

    setLoading(true);
    setError('');

    try {
      // Créer une commande par item (backend attend une annonce à la fois)
      const commandes = await Promise.all(
        cart.map(item =>
          createCommande({
            annonce_id:          item.id,
            quantite:            item.quantite,
            adresse_livraison:   adresse.trim(),
            telephone_livraison: telephone.trim(),
          })
        )
      );

      clearCart();
      setSuccess(true);

      // Rediriger vers la première commande créée après 2s
      const firstId = commandes[0]?.commande?.id ?? commandes[0]?.data?.id ?? commandes[0]?.id;
      setTimeout(() => {
        if (firstId) navigate(`/commandes/${firstId}`);
        else navigate('/profile');
      }, 2000);

    } catch (err) {
      setError(err.message || 'Erreur lors de la commande');
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
            <h2 className='text-2xl font-bold text-gray-800 mb-2'>Votre panier est vide</h2>
            <p className='text-gray-500 mb-8'>Ajoutez des équipements depuis la page d'exploration</p>
            <Link
              to='/explore'
              className='inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all'
            >
              <Package className='w-5 h-5' />
              Explorer les équipements
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
            <h2 className='text-2xl font-bold text-gray-900 mb-2'>Commande passée !</h2>
            <p className='text-gray-500 text-sm mb-4'>
              Votre commande a été enregistrée. Redirection en cours...
            </p>
            <div className='w-8 h-8 border-4 border-[#1DBF73] rounded-full border-t-transparent animate-spin mx-auto' />
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
              <h1 className='text-2xl font-bold text-gray-900'>Mon panier</h1>
              <p className='text-sm text-gray-400'>{totalItems} article{totalItems > 1 ? 's' : ''}</p>
            </div>
          </div>
          <button
            onClick={() => { if (window.confirm('Vider le panier ?')) clearCart(); }}
            className='flex items-center gap-1.5 text-xs text-red-400 hover:text-red-500 font-medium transition-colors'
          >
            <Trash2 className='w-3.5 h-3.5' />
            Vider le panier
          </button>
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
                        {(Number(item.prix_vendeur) * item.quantite).toLocaleString('fr-FR')}
                      </p>
                      <span className='text-xs text-gray-400'>FCFA</span>
                    </div>
                    <p className='text-xs text-gray-400'>
                      {Number(item.prix_vendeur).toLocaleString('fr-FR')} / unité
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
                        className='w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white transition-colors'
                      >
                        <Minus className='w-3 h-3 text-gray-600' />
                      </button>
                      <span className='w-5 text-center font-bold text-xs text-gray-900'>{item.quantite}</span>
                      <button
                        onClick={() => updateQuantite(item.id, item.quantite + 1)}
                        disabled={item.quantite >= item.stock}
                        className='w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white transition-colors disabled:opacity-30'
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
              <h3 className='font-bold text-gray-800 mb-4'>Récapitulatif</h3>
              <div className='space-y-2 mb-4'>
                {cart.map(item => (
                  <div key={item.id} className='flex justify-between text-sm'>
                    <span className='text-gray-500 truncate max-w-[150px]'>{item.titre} ×{item.quantite}</span>
                    <span className='font-medium text-gray-800 shrink-0 ml-2'>
                      {(Number(item.prix_vendeur) * item.quantite).toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                ))}
              </div>
              <div className='border-t border-gray-100 pt-3 space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-500'>Sous-total</span>
                  <span className='font-medium text-gray-800'>
                    {totalPrice.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='flex items-center gap-1 text-[#09B1BA]'>
                    🛡️ Protection acheteur <span className='text-xs bg-[#09B1BA]/10 px-1.5 py-0.5 rounded-full font-semibold'>8%</span>
                  </span>
                  <span className='font-medium text-[#09B1BA]'>
                    + {Math.round(totalPrice * 0.08).toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
                <div className='flex justify-between pt-2 border-t border-gray-100'>
                  <span className='font-bold text-gray-900'>Total</span>
                  <span className='text-xl font-black text-[#1DBF73]'>
                    {Math.round(totalPrice * 1.08).toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              </div>
            </div>

            {/* Formulaire livraison */}
            <div className='p-5 bg-white border border-gray-100 rounded-2xl shadow-sm'>
              <h3 className='font-bold text-gray-800 mb-4'>Informations de livraison</h3>
              <div className='space-y-3'>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-1'>Adresse *</label>
                  <input
                    type='text'
                    value={adresse}
                    onChange={e => setAdresse(e.target.value)}
                    placeholder='Votre adresse de livraison'
                    className='w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 transition-all'
                  />
                </div>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-1'>Téléphone *</label>
                  <input
                    type='tel'
                    value={telephone}
                    onChange={e => setTelephone(e.target.value)}
                    placeholder='+229 XX XX XX XX'
                    className='w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 transition-all'
                  />
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
                <><div className='w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin' /> Traitement...</>
              ) : (
                <><ShieldCheck className='w-5 h-5' /> Commander pour {Math.round(totalPrice * 1.08).toLocaleString('fr-FR')} FCFA</>
              )}
            </motion.button>

            <p className='text-xs text-center text-gray-400'>
              Paiement sécurisé • Vous serez contacté par le vendeur
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Cart;