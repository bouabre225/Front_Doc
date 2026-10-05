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
import ImageViewer from '../../components/common/ImageViewer';
import { useImageViewer } from '../../../hooks/useImageViewer';
import { useFavoris } from '../../hooks/useFavoris';
import { useLang } from '../../context/LangContext';
import { useTracking } from '../../hooks/useTracking';
import { getLocale } from '../../i18n/format';
import FavoriteButton from '../../components/common/FavoriteButton';

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

  const { viewer, openViewer, closeViewer } = useImageViewer();
  
  const [annonce,       setAnnonce]       = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantite,      setQuantite]      = useState(1);
  const [addedToCart,   setAddedToCart]   = useState(false);
  const { isFavorite: isFav, toggle: toggleFav } = useFavoris();
  const { t } = useLang();
  const isFavorite = isFav(id);
  useTracking({ annonce_id: id });

  const currentUser = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } })();
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
        setError(t.equipment.notFound);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  // ─── Favoris (serveur si connecté, local sinon) ─────────────────────────
  const handleFavorite = () => toggleFav(id);

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
          <p className='text-xl font-bold text-gray-700'>{error || t.equipment.notFound}</p>
          <Link to='/explore' className='px-6 py-3 bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white font-semibold rounded-xl'>
            {t.equipment.backExplore}
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const images      = annonce.images || [];
  const avis        = annonce.avis || [];
  const noteMoyenne = annonce.note_moyenne != null && Number(annonce.note_moyenne) > 0
    ? Number(annonce.note_moyenne).toFixed(1)
    : (avis.length > 0
      ? (avis.reduce((sum, a) => sum + (Number(a.note_vendeur || 0) + Number(a.note_conformite || 0)) / 2, 0) / avis.length).toFixed(1)
      : null);
  const stockDispo  = Number(annonce.quantite) || 0;
  const alreadyInCart = isInCart(annonce.id);

  return (
    
    <div className='min-h-screen bg-gray-50 pb-24 md:pb-0'>
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
              onClick={() => openViewer(images, selectedImage, annonce.titre)}
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
                  <span>🔍</span> {t.equipment.zoom}
                </div>
              )}

              {/* ✅ Image Viewer Modal */}
              {viewer.open && (
                <ImageViewer
                  images={viewer.images}
                  initialIndex={viewer.index}
                  titre={viewer.titre}
                  onClose={closeViewer}
                />
              )}

              {/* Badge état */}
              {annonce.etat && (
                <span className={`absolute top-4 left-4 px-3 py-1 text-xs font-bold rounded-full capitalize ${etatStyle(annonce.etat)}`}>
                  {t.etats[annonce.etat] ?? annonce.etat}
                </span>
              )}

              {/* Favori */}
              <div className='absolute top-4 right-4'>
                <FavoriteButton active={isFavorite} onToggle={handleFavorite} />
              </div>

              {/* Navigation flèches */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage(i => Math.max(0, i - 1))}
                    disabled={selectedImage === 0}
                    className='absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/90 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center hover:bg-white transition-all disabled:opacity-30'
                  >
                    <ChevronLeft className='w-4 h-4 text-gray-700' />
                  </button>
                  <button
                    onClick={() => setSelectedImage(i => Math.min(images.length - 1, i + 1))}
                    disabled={selectedImage === images.length - 1}
                    className='absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/90 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center hover:bg-white transition-all disabled:opacity-30'
                  >
                    <ChevronRight className='w-4 h-4 text-gray-700' />
                  </button>
                  {/* Indicateur */}
                  <div className='absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5'>
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedImage(i)}
                        aria-label={`Image ${i + 1}`}
                        className='w-8 h-8 flex items-center justify-center'
                      >
                        <span className={`h-2 rounded-full transition-all ${i === selectedImage ? 'bg-white w-5' : 'bg-white/50 w-2'}`} />
                      </button>
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
                  {t.cats[annonce.categorie] ?? annonce.categorie}
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
              <div className='text-4xl font-black text-[#1DBF73]'>
                {Number(annonce.prix_vendeur).toLocaleString(getLocale())}
                <span className='ml-2 text-lg font-semibold text-gray-400'>FCFA</span>
              </div>

              {/* Protection acheteur style Vinted */}
              <div className='mt-3 pt-3 border-t border-[#1DBF73]/15 space-y-2'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-gray-500'>{t.equipment.sellerPrice}</span>
                  <span className='text-gray-700 font-medium'>
                    {Number(annonce.prix_vendeur).toLocaleString(getLocale())} FCFA
                  </span>
                </div>
                <div className='flex items-center justify-between text-sm'>
                  <div className='flex items-center gap-1.5'>
                    <ShieldCheck className='w-4 h-4 text-[#09B1BA]' />
                    <span className='text-[#09B1BA] font-medium'>{t.equipment.buyerProtection}</span>
                    <span className='text-xs bg-[#09B1BA]/10 text-[#09B1BA] px-1.5 py-0.5 rounded-full font-semibold'>8%</span>
                  </div>
                  <span className='text-[#09B1BA] font-medium'>
                    + {Math.round(Number(annonce.prix_vendeur) * 0.08).toLocaleString(getLocale())} FCFA
                  </span>
                </div>
                <div className='flex items-center justify-between pt-2 border-t border-[#1DBF73]/15'>
                  <span className='font-bold text-gray-800'>{t.equipment.total}</span>
                  <span className='font-black text-xl text-[#1DBF73]'>
                    {Math.round(Number(annonce.prix_vendeur) * 1.08).toLocaleString(getLocale())} FCFA
                  </span>
                </div>
              </div>

              {stockDispo > 0 && (
                <p className='text-xs text-emerald-600 font-medium mt-3 flex items-center gap-1'>
                  <ShieldCheck className='w-3.5 h-3.5' />
                  {stockDispo} {stockDispo > 1 ? t.equipment.unitsAvailable : t.equipment.unitAvailable}
                </p>
              )}
            </div>

            {/* Infos grille */}
            <div className='grid grid-cols-2 gap-3'>
              {[
                { icon: Package,  color: 'bg-[#1DBF73]/10', iconColor: 'text-[#1DBF73]',  label: t.equipment.stateLabel,      value: t.etats[annonce.etat] ?? annonce.etat },
                { icon: Layers,   color: 'bg-[#09B1BA]/10', iconColor: 'text-[#09B1BA]',  label: t.equipment.qtyLabel,  value: `${annonce.quantite} dispo.` },
                { icon: Calendar, color: 'bg-orange-50',    iconColor: 'text-orange-400', label: t.equipment.publishedOn, value: annonce.created_at ? new Date(annonce.created_at).toLocaleDateString(getLocale()) : '—' },
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
                <p className='text-xs font-semibold text-gray-400 uppercase mb-2'>{t.equipment.description}</p>
                <p className='text-sm leading-relaxed text-gray-600'>{annonce.description}</p>
              </div>
            )}

            {/* Sélecteur quantité */}
            {stockDispo > 1 && (
              <div className='flex items-center gap-4'>
                <span className='text-sm font-semibold text-gray-700'>{t.equipment.quantity}</span>
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
                  {t.equipment.yourListing}
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
                        <Check className='w-5 h-5' /> {t.equipment.addedCart}
                      </motion.span>
                    ) : (
                      <motion.span key='add' initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className='flex items-center gap-2'>
                        <ShoppingCart className='w-5 h-5' />
                        {stockDispo === 0 ? t.equipment.outOfStock : alreadyInCart ? t.equipment.inCart : t.equipment.addCart}
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
                  {t.equipment.contact}
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
                    {t.equipment.viewCart}
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
              <h2 className='text-xl font-bold text-gray-900'>{t.equipment.reviews} ({avis.length})</h2>
              {noteMoyenne && (
                <div className='flex items-center gap-2 px-4 py-2 bg-yellow-50 rounded-xl border border-yellow-100'>
                  <Star className='w-5 h-5 fill-yellow-400 text-yellow-400' />
                  <span className='font-bold text-gray-900'>{noteMoyenne}</span>
                  <span className='text-sm text-gray-400'>/ 5</span>
                </div>
              )}
            </div>
            <div className='grid gap-4 md:grid-cols-2'>
              {avis.map(a => {
                const note = Math.round((Number(a.note_vendeur || 0) + Number(a.note_conformite || 0)) / 2);
                return (
                <div key={a.id} className='p-5 bg-white border border-gray-100 rounded-2xl shadow-sm'>
                  <div className='flex items-center justify-between mb-3'>
                    <div className='flex items-center gap-2'>
                      <div className='w-8 h-8 rounded-full bg-gradient-to-br from-[#1DBF73] to-[#09B1BA] flex items-center justify-center text-white text-xs font-bold'>
                        {(a.commande?.acheteur?.nom || a.acheteur?.nom || 'U')[0].toUpperCase()}
                      </div>
                      <span className='font-semibold text-gray-800 text-sm'>
                        {a.commande?.acheteur?.nom || a.acheteur?.nom || 'Utilisateur'}
                      </span>
                    </div>
                    <div className='flex gap-0.5'>
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`w-4 h-4 ${s <= note ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                      ))}
                    </div>
                  </div>
                  <p className='text-xs text-gray-400 mb-1'>{t.equipment.ratingSeller} {a.note_vendeur}/5 • {t.equipment.ratingConformity} {a.note_conformite}/5</p>
                  {a.commentaire && <p className='text-sm text-gray-600 leading-relaxed'>{a.commentaire}</p>}
                  {a.created_at && (
                    <p className='text-xs text-gray-400 mt-2'>
                      {new Date(a.created_at).toLocaleDateString(getLocale())}
                    </p>
                  )}
                </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <Footer />

      {/* ── Barre sticky mobile : prix TTC + CTA ─────────────────────── */}
      {!loading && annonce && !isOwnAnnonce && (
        <div className='md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-gray-200 px-4 pt-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]' style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
          <div className='flex items-center gap-3'>
            <div className='min-w-0'>
              <p className='text-[11px] text-gray-400 leading-none'>{t.equipment.total}</p>
              <p className='text-lg font-black text-[#1DBF73] leading-tight truncate'>
                {Math.round(Number(annonce.prix_vendeur) * quantite * 1.08).toLocaleString(getLocale())} FCFA
              </p>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={stockDispo === 0}
              className='flex-1 py-3.5 font-bold text-white rounded-xl bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] shadow-lg disabled:opacity-50 disabled:shadow-none transition-all text-sm'
            >
              {stockDispo === 0 ? t.equipment.outOfStock : `${t.equipment.addCart} • ${quantite}`}
            </button>
            {!isOwnAnnonce && (
              <button
                onClick={handleContact}
                aria-label={t.equipment.contact}
                className='w-12 h-12 shrink-0 flex items-center justify-center border-2 border-[#1DBF73] text-[#1DBF73] rounded-xl'
              >
                <MessageSquare className='w-5 h-5' />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Equipment;