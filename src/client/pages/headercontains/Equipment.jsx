// src/pages/equipment/Equipment.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, MapPin, Heart, ShoppingCart, MessageSquare,
  Check, Package, Calendar, User, Layers, AlertCircle,
  ChevronLeft, ChevronRight, Minus, Plus, ShieldCheck, ArrowLeft, X
} from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { getAnnonceById, getImageUrl } from '../../../services/api';
import { useCart } from '../../context/CartContext';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const etatStyle = (etat) => {
  if (!etat) return 'bg-gray-100 text-gray-600';
  const e = etat.toLowerCase();
  if (e === 'neuf')        return 'bg-emerald-100 text-emerald-700';
  if (e === 'occasion')    return 'bg-amber-100 text-amber-700';
  if (e.includes('recon')) return 'bg-blue-100 text-blue-700';
  return 'bg-gray-100 text-gray-600';
};

// ─── Composant principal ─────────────────────────────────────────────────────

function Equipment() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { addToCart, isInCart } = useCart();

  const [viewerOpen,  setViewerOpen]  = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  
  const [annonce,       setAnnonce]       = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantite,      setQuantite]      = useState(1);
  const [addedToCart,   setAddedToCart]   = useState(false);
  const [isFavorite,    setIsFavorite]    = useState(() => {
    try {
      const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
      return favs.includes(id);
    } catch { return false; }
  });

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isOwnAnnonce = currentUser.id === annonce?.vendeur_id;    

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getAnnonceById(id);
        // L'API peut retourner { data: annonce } ou l'annonce directement
        setAnnonce(data?.data ?? data);
      } catch {
        setError("Équipement introuvable ou une erreur est survenue.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  // ─── Favoris ────────────────────────────────────────────────────────────
  const handleFavorite = () => {
    const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
    const updated = isFavorite ? favs.filter(f => f !== id) : [...favs, id];
    localStorage.setItem('favorites', JSON.stringify(updated));
    setIsFavorite(!isFavorite);
  };

  // ─── Panier ─────────────────────────────────────────────────────────────
  const handleAddToCart = () => {
    if (!annonce) return;

    const token = localStorage.getItem('auth_token');
    if (!token) {
      navigate('/login', { state: { from: `/equipment/${id}` } });
      return;
    }

    addToCart(annonce, quantite);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  // ─── Contact vendeur ────────────────────────────────────────────────────
  const handleContact = () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      navigate('/login', { state: { from: `/equipment/${id}` } });
      return;
    }
    navigate(`/messages?userId=${annonce?.vendeur_id}&annonceId=${annonce?.id}&vendeurNom=${encodeURIComponent(annonce?.vendeur?.nom || 'Vendeur')}`);
  };

  // ─── Loading ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <Header />
        <div className='container max-w-5xl px-4 py-10 mx-auto'>
          <div className='grid grid-cols-1 gap-8 lg:grid-cols-2 animate-pulse'>
            <div className='h-80 bg-gray-200 rounded-2xl' />
            <div className='space-y-4'>
              <div className='h-4 bg-gray-200 rounded w-1/3' />
              <div className='h-8 bg-gray-200 rounded w-3/4' />
              <div className='h-20 bg-gray-200 rounded' />
              <div className='grid grid-cols-2 gap-3'>
                {[1,2,3,4].map(i => <div key={i} className='h-20 bg-gray-200 rounded-2xl' />)}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !annonce) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <Header />
        <div className='flex flex-col items-center justify-center py-40 gap-4'>
          <AlertCircle className='w-12 h-12 text-red-400' />
          <p className='text-xl font-bold text-gray-700'>{error || "Équipement introuvable"}</p>
          <Link to='/explore' className='px-6 py-3 bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white font-semibold rounded-xl'>
            Retour à l'exploration
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // ─── Modal visualiseur d'images ───────────────────────────────────────────────

  const ImageViewer = ({ images, initialIndex, onClose, getImageUrl, titre }) => {
  const [current, setCurrent] = useState(initialIndex);

  // Navigation clavier
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowRight') setCurrent(i => Math.min(images.length - 1, i + 1));
      if (e.key === 'ArrowLeft')  setCurrent(i => Math.max(0, i - 1));
      if (e.key === 'Escape')     onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [images.length, onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className='fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-sm p-4'
      >
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className='absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all z-10'
        >
          <X className='w-5 h-5 text-white' />
        </button>

        {/* Compteur */}
        <div className='absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-white/10 rounded-full text-white text-sm font-medium'>
          {current + 1} / {images.length}
        </div>

        {/* Image principale */}
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          onClick={e => e.stopPropagation()}
          className='relative w-full max-w-4xl max-h-[75vh] flex items-center justify-center'
        >
          <img
            src={getImageUrl(images[current]?.image_url)}
            alt={`${titre} - ${current + 1}`}
            className='max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl'
          />

          {/* Flèche gauche */}
          {current > 0 && (
            <button
            type='button'
              onClick={e => { e.stopPropagation(); setCurrent(i => i - 1); }}
              className='absolute left-2 w-11 h-11 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center transition-all backdrop-blur-sm'
            >
              <ChevronLeft className='w-6 h-6 text-white' />
            </button>
          )}

          {/* Flèche droite */}
          {current < images.length - 1 && (
            <button
              type='button'
              onClick={e => { e.stopPropagation(); setCurrent(i => i + 1); }}
              className='absolute right-2 w-11 h-11 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center transition-all backdrop-blur-sm'
            >
              <ChevronRight className='w-6 h-6 text-white' />
            </button>
          )}
        </motion.div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div
            onClick={e => e.stopPropagation()}
            className='flex gap-2 mt-4 overflow-x-auto max-w-full px-4 pb-2'
          >
            {images.map((img, i) => (
              <button
                key={i}
                type='button'
                onClick={() => setCurrent(i)}
                className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  i === current
                    ? 'border-[#1DBF73] opacity-100 scale-105'
                    : 'border-transparent opacity-50 hover:opacity-80'
                }`}
              >
                <img
                  src={getImageUrl(img.image_url)}
                  alt=''
                  className='w-full h-full object-cover'
                />
              </button>
            ))}
          </div>
        )}

        {/* Titre */}
        <p className='mt-3 text-white/60 text-sm text-center max-w-md truncate'>
          {titre}
        </p>
      </motion.div>
    </AnimatePresence>
  );
  };

  const images      = annonce.images || [];
  const avis        = annonce.avis || [];
  const noteMoyenne = avis.length > 0
    ? (avis.reduce((sum, a) => sum + (a.note || 0), 0) / avis.length).toFixed(1)
    : null;
  const stockDispo  = Number(annonce.quantite) || 0;
  const alreadyInCart = isInCart(annonce.id);

  return (
    
    <div className='min-h-screen bg-gray-50'>
      <Header />

      <div className='container max-w-5xl px-4 py-10 mx-auto'>

        {/* Fil d'Ariane + retour */}
        <div className='flex items-center justify-between mb-6'>
          <button
            onClick={() => navigate(-1)}
            className='flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1DBF73] transition-colors'
          >
            <ArrowLeft className='w-4 h-4' />
            Retour
          </button>
        </div>

        <div className='grid grid-cols-1 gap-10 lg:grid-cols-2'>

          {/* ── Galerie ──────────────────────────────────────────────── */}
          <div className='space-y-4'>
            <div 
              className='relative overflow-hidden bg-gray-100 rounded-2xl h-64 sm:h-80 lg:h-96 group cursor-zoom-in'
              onClick={() => { if (images.length > 0) { setViewerIndex(selectedImage); setViewerOpen(true); }}}
            >
              {images[selectedImage] ? (
                <img
                  src={getImageUrl(images[selectedImage].image_url)}
                  alt={annonce.titre}
                  className='object-cover w-full h-full transition-transform duration-500 group-hover:scale-105'
                />
              ) : (
                <div className='flex items-center justify-center w-full h-full'>
                  <span className='text-8xl'>🏥</span>
                </div>
              )}

              {/* ✅ Indicateur zoom */}
              {images.length > 0 && (
                <div className='absolute bottom-3 right-3 px-2 py-1 bg-black/40 backdrop-blur-sm rounded-lg text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1'>
                  <span>🔍</span> Agrandir
                </div>
              )}

              {/* ✅ Image Viewer Modal */}
              {viewerOpen && images.length > 0 && (
                <ImageViewer
                  images={images}
                  initialIndex={viewerIndex}
                  onClose={() => setViewerOpen(false)}
                  getImageUrl={getImageUrl}
                  titre={annonce.titre}
                />
              )}

              {/* Badge état */}
              {annonce.etat && (
                <span className={`absolute top-4 left-4 px-3 py-1 text-xs font-bold rounded-full capitalize ${etatStyle(annonce.etat)}`}>
                  {annonce.etat}
                </span>
              )}

              {/* Favori */}
              <button
                onClick={handleFavorite}
                className='absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-all'
              >
                <Heart className={`w-5 h-5 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
              </button>

              {/* Navigation flèches */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage(i => Math.max(0, i - 1))}
                    disabled={selectedImage === 0}
                    className='absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center hover:bg-white transition-all disabled:opacity-30'
                  >
                    <ChevronLeft className='w-4 h-4 text-gray-700' />
                  </button>
                  <button
                    onClick={() => setSelectedImage(i => Math.min(images.length - 1, i + 1))}
                    disabled={selectedImage === images.length - 1}
                    className='absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center hover:bg-white transition-all disabled:opacity-30'
                  >
                    <ChevronRight className='w-4 h-4 text-gray-700' />
                  </button>
                  {/* Indicateur */}
                  <div className='absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5'>
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedImage(i)}
                        className={`w-2 h-2 rounded-full transition-all ${i === selectedImage ? 'bg-white w-5' : 'bg-white/50'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── Détails ──────────────────────────────────────────────── */}
          <div className='space-y-5'>
            {/* Catégorie + Titre */}
            <div>
              {annonce.categorie && (
                <span className='text-xs font-bold text-[#09B1BA] uppercase tracking-wide'>
                  {annonce.categorie}
                </span>
              )}
              <h1 className='mt-1 text-2xl font-bold text-gray-900 leading-snug'>{annonce.titre}</h1>

              {/* Note + localisation */}
              <div className='flex flex-wrap items-center gap-3 mt-2'>
                {noteMoyenne && (
                  <div className='flex items-center gap-1'>
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={`w-4 h-4 ${s <= Math.round(noteMoyenne) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                    ))}
                    <span className='ml-1 text-sm font-semibold text-gray-700'>{noteMoyenne}</span>
                    <span className='text-xs text-gray-400'>({avis.length} avis)</span>
                  </div>
                )}
                {annonce.pays_expedition && (
                  <div className='flex items-center gap-1 text-sm text-gray-500'>
                    <MapPin className='w-4 h-4 text-[#1DBF73]' />
                    {annonce.pays_expedition}
                  </div>
                )}
              </div>
            </div>

            {/* Prix */}
            <div className='p-5 bg-gradient-to-br from-[#1DBF73]/5 to-[#09B1BA]/5 rounded-2xl border border-[#1DBF73]/15'>
              <p className='text-xs text-gray-500 mb-1'>Prix vendeur</p>
              <div className='text-4xl font-black text-[#1DBF73]'>
                {Number(annonce.prix_vendeur).toLocaleString('fr-FR')}
                <span className='ml-2 text-lg font-semibold text-gray-400'>FCFA</span>
              </div>

              {/* Protection acheteur style Vinted */}
              <div className='mt-3 pt-3 border-t border-[#1DBF73]/15 space-y-2'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-gray-500'>Prix vendeur</span>
                  <span className='text-gray-700 font-medium'>
                    {Number(annonce.prix_vendeur).toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
                <div className='flex items-center justify-between text-sm'>
                  <div className='flex items-center gap-1.5'>
                    <ShieldCheck className='w-4 h-4 text-[#09B1BA]' />
                    <span className='text-[#09B1BA] font-medium'>Protection acheteur</span>
                    <span className='text-xs bg-[#09B1BA]/10 text-[#09B1BA] px-1.5 py-0.5 rounded-full font-semibold'>8%</span>
                  </div>
                  <span className='text-[#09B1BA] font-medium'>
                    + {Math.round(Number(annonce.prix_vendeur) * 0.08).toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
                <div className='flex items-center justify-between pt-2 border-t border-[#1DBF73]/15'>
                  <span className='font-bold text-gray-800'>Total</span>
                  <span className='font-black text-xl text-[#1DBF73]'>
                    {Math.round(Number(annonce.prix_vendeur) * 1.08).toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              </div>

              {stockDispo > 0 && (
                <p className='text-xs text-emerald-600 font-medium mt-3 flex items-center gap-1'>
                  <ShieldCheck className='w-3.5 h-3.5' />
                  {stockDispo} unité{stockDispo > 1 ? 's' : ''} disponible{stockDispo > 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* Infos grille */}
            <div className='grid grid-cols-2 gap-3'>
              {[
                { icon: Package,  color: 'bg-[#1DBF73]/10', iconColor: 'text-[#1DBF73]',  label: 'État',      value: annonce.etat },
                { icon: Layers,   color: 'bg-[#09B1BA]/10', iconColor: 'text-[#09B1BA]',  label: 'Quantité',  value: `${annonce.quantite} dispo.` },
                { icon: Calendar, color: 'bg-orange-50',    iconColor: 'text-orange-400', label: 'Publié le', value: annonce.created_at ? new Date(annonce.created_at).toLocaleDateString('fr-FR') : '—' },
              ].map(({ icon: Icon, color, iconColor, label, value }, index, arr) => (
                    <div
                        key={label}
                        className={`flex items-center gap-3 p-4 bg-white border border-gray-100 shadow-sm rounded-2xl ${
                          index === arr.length - 1 ? 'col-span-2' : '' // ✅ dernière carte = pleine largeur
                        }`}
                      >
                    <div className={`w-9 h-9 ${color} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${iconColor}`} />
                  </div>
                  <div className='min-w-0'>
                    <p className='text-xs text-gray-400'>{label}</p>
                    <p className='text-sm font-semibold text-gray-900 truncate capitalize'>{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            {annonce.description && (
              <div className='p-4 bg-white border border-gray-100 rounded-2xl'>
                <p className='text-xs font-semibold text-gray-400 uppercase mb-2'>Description</p>
                <p className='text-sm leading-relaxed text-gray-600'>{annonce.description}</p>
              </div>
            )}

            {/* Sélecteur quantité */}
            {stockDispo > 1 && (
              <div className='flex items-center gap-4'>
                <span className='text-sm font-semibold text-gray-700'>Quantité :</span>
                <div className='flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-1'>
                  <button
                    onClick={() => setQuantite(q => Math.max(1, q - 1))}
                    className='w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors'
                  >
                    <Minus className='w-4 h-4 text-gray-600' />
                  </button>
                  <span className='w-8 text-center font-bold text-gray-900'>{quantite}</span>
                  <button
                    onClick={() => setQuantite(q => Math.min(stockDispo, q + 1))}
                    className='w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors'
                  >
                    <Plus className='w-4 h-4 text-gray-600' />
                  </button>
                </div>
                <span className='text-xs text-gray-400'>max {stockDispo}</span>
              </div>
            )}

            {/* Boutons actions */}
            <div className='flex gap-3 pt-1'>

              {/* ✅ Si c'est sa propre annonce → message au lieu du bouton panier */}
              {isOwnAnnonce ? (
                <div className='flex-1 py-4 bg-gray-100 text-gray-500 font-semibold rounded-2xl flex items-center justify-center gap-2 text-sm'>
                  <Package className='w-5 h-5' />
                  Votre annonce
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  disabled={stockDispo === 0}
                  className={`flex-1 py-4 font-semibold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                    stockDispo === 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white hover:shadow-xl'
                  }`}
                >
                  <AnimatePresence mode='wait'>
                    {addedToCart ? (
                      <motion.span key='added' initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className='flex items-center gap-2'>
                        <Check className='w-5 h-5' /> Ajouté au panier !
                      </motion.span>
                    ) : (
                      <motion.span key='add' initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className='flex items-center gap-2'>
                        <ShoppingCart className='w-5 h-5' />
                        {stockDispo === 0 ? 'Rupture de stock' : alreadyInCart ? 'Déjà dans le panier' : 'Ajouter au panier'}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              )}

              {/* Favori — toujours visible */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleFavorite}
                className='px-4 py-4 border-2 border-gray-200 rounded-2xl hover:border-red-300 transition-all'
              >
                <Heart className={`w-5 h-5 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
              </motion.button>

              {/* Contacter — masqué si c'est sa propre annonce */}
              {!isOwnAnnonce && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleContact}
                  className='px-5 py-4 border-2 border-[#1DBF73] text-[#1DBF73] font-semibold rounded-2xl hover:bg-[#1DBF73]/5 transition-all flex items-center gap-2 text-sm'
                >
                  <MessageSquare className='w-4 h-4' />
                  Contacter
                </motion.button>
              )}
            </div>

            {/* Lien vers panier si déjà ajouté */}
            <AnimatePresence>
              {(addedToCart || alreadyInCart) && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <Link
                    to='/cart'
                    className='flex items-center justify-center gap-2 w-full py-3 bg-white border-2 border-[#1DBF73]/30 text-[#1DBF73] font-semibold rounded-xl hover:bg-[#1DBF73]/5 transition-all text-sm'
                  >
                    <ShoppingCart className='w-4 h-4' />
                    Voir mon panier →
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Avis ─────────────────────────────────────────────────── */}
        {avis.length > 0 && (
          <div className='mt-14'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-xl font-bold text-gray-900'>Avis clients ({avis.length})</h2>
              {noteMoyenne && (
                <div className='flex items-center gap-2 px-4 py-2 bg-yellow-50 rounded-xl border border-yellow-100'>
                  <Star className='w-5 h-5 fill-yellow-400 text-yellow-400' />
                  <span className='font-bold text-gray-900'>{noteMoyenne}</span>
                  <span className='text-sm text-gray-400'>/ 5</span>
                </div>
              )}
            </div>
            <div className='grid gap-4 md:grid-cols-2'>
              {avis.map(a => (
                <div key={a.id} className='p-5 bg-white border border-gray-100 rounded-2xl shadow-sm'>
                  <div className='flex items-center justify-between mb-3'>
                    <div className='flex items-center gap-2'>
                      <div className='w-8 h-8 rounded-full bg-gradient-to-br from-[#1DBF73] to-[#09B1BA] flex items-center justify-center text-white text-xs font-bold'>
                        {(a.acheteur?.nom || a.vendeur?.nom || 'U')[0].toUpperCase()}
                      </div>
                      <span className='font-semibold text-gray-800 text-sm'>
                        {a.acheteur?.nom || a.vendeur?.nom || 'Utilisateur'}
                      </span>
                    </div>
                    <div className='flex gap-0.5'>
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`w-4 h-4 ${s <= a.note ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                      ))}
                    </div>
                  </div>
                  {a.commentaire && <p className='text-sm text-gray-600 leading-relaxed'>{a.commentaire}</p>}
                  {a.created_at && (
                    <p className='text-xs text-gray-400 mt-2'>
                      {new Date(a.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default Equipment;