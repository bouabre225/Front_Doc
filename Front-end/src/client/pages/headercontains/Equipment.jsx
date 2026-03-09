import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, MapPin, Heart, ShoppingCart, Phone, Check, Package, Calendar, User, Layers, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useLang } from '../../context/LangContext';
import { getAnnonceById, getImageUrl } from '../../../services/api';

function Equipment() {
  const { id } = useParams();
  const { t } = useLang();

  const [annonce, setAnnonce] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchAnnonce = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getAnnonceById(id);
        setAnnonce(data);
      } catch (err) {
        setError("Équipement introuvable ou une erreur est survenue.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnnonce();
  }, [id]);

  const addToCart = () => {
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <Header />
        <div className='flex items-center justify-center py-40'>
          <div className='w-12 h-12 border-4 border-[#1DBF73] rounded-full border-t-transparent animate-spin' />
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

  const images = annonce.images || [];
  const avis = annonce.avis || [];
  const noteMoyenne = avis.length > 0
    ? (avis.reduce((sum, a) => sum + (a.note || 0), 0) / avis.length).toFixed(1)
    : null;

  return (
    <div className='min-h-screen bg-gray-50'>
      <Header />

      <div className='container max-w-5xl px-4 py-10 mx-auto'>
        {/* Fil d'Ariane */}
        <div className='flex items-center gap-2 mb-6 text-sm text-gray-500'>
          <Link to='/' className='hover:text-[#1DBF73]'>Accueil</Link>
          <span>/</span>
          <Link to='/explore' className='hover:text-[#1DBF73]'>Explorer</Link>
          <span>/</span>
          <span className='text-gray-900 font-medium line-clamp-1'>{annonce.titre}</span>
        </div>

        <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
          {/* Galerie images */}
          <div className='space-y-4'>
            <div className='relative overflow-hidden bg-gray-100 rounded-2xl h-80'>
              {images[selectedImage] ? (
                <img
                  src={getImageUrl(images[selectedImage].image_url)}
                  alt={annonce.titre}
                  className='object-cover w-full h-full'
                />
              ) : (
                <div className='flex items-center justify-center w-full h-full'>
                  <span className='text-7xl'>🏥</span>
                </div>
              )}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage((i) => Math.max(0, i - 1))}
                    className='absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50'
                  >
                    <ChevronLeft className='w-4 h-4' />
                  </button>
                  <button
                    onClick={() => setSelectedImage((i) => Math.min(images.length - 1, i + 1))}
                    className='absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50'
                  >
                    <ChevronRight className='w-4 h-4' />
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className='flex gap-3 overflow-x-auto'>
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      i === selectedImage ? 'border-[#1DBF73]' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={getImageUrl(img.image_url)}
                      alt={`Image ${i + 1}`}
                      className='object-cover w-full h-full'
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Détails */}
          <div className='space-y-5'>
            {/* Titre & rating */}
            <div>
              <div className='mb-1 text-sm font-semibold text-[#09B1BA] uppercase'>{annonce.categorie}</div>
              <h1 className='mb-3 text-2xl font-bold text-gray-900'>{annonce.titre}</h1>
              <div className='flex items-center gap-3'>
                {noteMoyenne && (
                  <div className='flex items-center gap-1'>
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} className={`w-4 h-4 ${s <= Math.round(noteMoyenne) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                    ))}
                    <span className='ml-1 text-sm font-semibold text-gray-700'>{noteMoyenne}</span>
                    <span className='text-sm text-gray-400'>({avis.length} avis)</span>
                  </div>
                )}
                <div className='flex items-center gap-1.5 text-sm text-gray-500'>
                  <MapPin className='w-4 h-4 text-[#1DBF73]' />
                  <span>{annonce.pays_expedition || 'Non précisé'}</span>
                </div>
              </div>
            </div>

            {/* Prix */}
            <div className='p-5 bg-gradient-to-br from-[#1DBF73]/5 to-[#09B1BA]/5 rounded-2xl border border-[#1DBF73]/15'>
              <div className='text-4xl font-bold text-[#1DBF73]'>
                {Number(annonce.prix_vendeur).toLocaleString()}
                <span className='ml-2 text-lg font-semibold text-gray-400'>FCFA</span>
              </div>
            </div>

            {/* Infos grille */}
            <div className='grid grid-cols-2 gap-3'>
              <div className='flex items-center gap-3 p-4 bg-white border border-gray-100 shadow-sm rounded-2xl'>
                <div className='w-9 h-9 bg-[#1DBF73]/10 rounded-xl flex items-center justify-center'>
                  <Package className='w-4 h-4 text-[#1DBF73]' />
                </div>
                <div>
                  <p className='text-xs text-gray-400'>État</p>
                  <p className='text-sm font-semibold text-gray-900'>{annonce.etat}</p>
                </div>
              </div>
              <div className='flex items-center gap-3 p-4 bg-white border border-gray-100 shadow-sm rounded-2xl'>
                <div className='w-9 h-9 bg-[#09B1BA]/10 rounded-xl flex items-center justify-center'>
                  <Layers className='w-4 h-4 text-[#09B1BA]' />
                </div>
                <div>
                  <p className='text-xs text-gray-400'>Quantité</p>
                  <p className='text-sm font-semibold text-gray-900'>{annonce.quantite} dispo.</p>
                </div>
              </div>
              <div className='flex items-center gap-3 p-4 bg-white border border-gray-100 shadow-sm rounded-2xl'>
                <div className='w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center'>
                  <User className='w-4 h-4 text-purple-400' />
                </div>
                <div>
                  <p className='text-xs text-gray-400'>Vendeur</p>
                  <p className='text-sm font-semibold text-gray-900'>{annonce.vendeur?.nom || '—'}</p>
                </div>
              </div>
              <div className='flex items-center gap-3 p-4 bg-white border border-gray-100 shadow-sm rounded-2xl'>
                <div className='w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center'>
                  <Calendar className='w-4 h-4 text-orange-400' />
                </div>
                <div>
                  <p className='text-xs text-gray-400'>Publié le</p>
                  <p className='text-sm font-semibold text-gray-900'>
                    {new Date(annonce.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            {annonce.description && (
              <p className='text-sm leading-relaxed text-gray-600'>{annonce.description}</p>
            )}

            {/* Boutons actions */}
            <div className='flex gap-3 pt-2'>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={addToCart}
                className='flex-1 py-4 bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2'
              >
                {addedToCart ? <Check className='w-5 h-5' /> : <ShoppingCart className='w-5 h-5' />}
                {addedToCart ? 'Ajouté !' : 'Ajouter au panier'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsFavorite(!isFavorite)}
                className='px-4 py-4 border-2 border-gray-200 rounded-2xl hover:border-red-300 transition-all'
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className='px-6 py-4 border-2 border-[#1DBF73] text-[#1DBF73] font-semibold rounded-2xl hover:bg-[#1DBF73]/5 transition-all flex items-center gap-2'
              >
                <Phone className='w-5 h-5' />
                Contacter
              </motion.button>
            </div>
          </div>
        </div>

        {/* Avis */}
        {avis.length > 0 && (
          <div className='mt-12'>
            <h2 className='mb-6 text-xl font-bold text-gray-900'>Avis ({avis.length})</h2>
            <div className='grid gap-4 md:grid-cols-2'>
              {avis.map((a) => (
                <div key={a.id} className='p-4 bg-white border border-gray-100 rounded-2xl shadow-sm'>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='font-semibold text-gray-800'>{a.vendeur?.nom || 'Utilisateur'}</span>
                    <div className='flex gap-0.5'>
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} className={`w-4 h-4 ${s <= a.note ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                      ))}
                    </div>
                  </div>
                  {a.commentaire && <p className='text-sm text-gray-600'>{a.commentaire}</p>}
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
