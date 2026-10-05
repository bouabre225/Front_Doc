import React, { useState, useEffect } from 'react';
import { useLang } from '../../context/LangContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Package, Upload, X,
  CheckCircle, Shield, Clock, XCircle, AlertCircle
} from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { createAnnonce, uploadAnnonceImages, getKycStatus } from '../../../services/api';
import { getLocale } from '../../i18n/format';

// ─── Constantes ──────────────────────────────────────────────────────────────

const CATEGORIES = [
  'Imagerie Médicale', 'Cardiologie', 'Laboratoire', 'Chirurgie',
  'Monitoring', 'Urgence', 'Mobilier Médical', 'Stérilisation',
  'Stomatologie', 'Médecine Générale', 'Ophtalmologie', 'Pièces de rechange', 'Autres'
];

const ETATS = [
  { value: 'neuf',       label: 'Neuf'        },
  { value: 'occasion',   label: 'Occasion'    },
  { value: 'reconditionne', label: 'Reconditionné'  },
];

// ─── Composant principal ─────────────────────────────────────────────────────

const PublishEquipment = () => {
  const { t } = useLang();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep]   = useState(1); // 1 = Détails, 2 = Description & Prix
  const [loading, setLoading]           = useState(false);
  const [kycLoading, setKycLoading]     = useState(true);
  const [kycStatus, setKycStatus]       = useState(null);
  const [error, setError]               = useState('');
  const [images, setImages]             = useState([]);

  const [formData, setFormData] = useState(() => {
    try {
      const draft = JSON.parse(localStorage.getItem('publish_draft') || 'null');
      if (draft && typeof draft === 'object') return {
        categorie: '', titre: '', description: '', prix_vendeur: '',
        etat: '', quantite: 1, pays_expedition: '', ...draft,
      };
    } catch { /* ignore */ }
    return {
      categorie: '', titre: '', description: '', prix_vendeur: '',
      etat: '', quantite: 1, pays_expedition: '',
    };
  });
  const [draftNote, setDraftNote] = useState(false);

  // Persistance brouillon (texte uniquement, pas les images)
  useEffect(() => {
    try {
      const hasContent = formData.titre || formData.description || formData.prix_vendeur || formData.categorie;
      if (hasContent) localStorage.setItem('publish_draft', JSON.stringify(formData));
    } catch { /* ignore */ }
  }, [formData]);

  useEffect(() => {
    try {
      if (localStorage.getItem('publish_draft')) setDraftNote(true);
    } catch { /* ignore */ }
  }, []);

  // ─── Vérifications au montage ──────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const user  = JSON.parse(localStorage.getItem('user') || '{}');

    // Non connecté → login
    if (!token) {
      navigate('/login', { state: { from: '/publish-equipment' } });
      return;
    }

    // Pas vendeur → accueil
    if (user.role !== 'vendeur') {
      navigate('/');
      return;
    }

    // Vérifier KYC
  const checkKyc = async () => {
    setKycLoading(true);
    try {
      const data = await getKycStatus();
      setKycStatus(data);
      // ← Met à jour le localStorage si KYC validé
      if (data?.verifie_kyc === true) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...user, verifie_kyc: true }));
        window.dispatchEvent(new Event('storage'));
      }
    } catch {
      setKycStatus(null);
    } finally {
      setKycLoading(false);
    }
  };

    checkKyc();
  }, [navigate]);

  const kycValide = kycStatus?.verifie_kyc === true;

  const kycDoc    = kycStatus?.kyc_document;

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onerror = () => resolve(file);
      reader.onload = (e) => {
        const img = new Image();
        img.onerror = () => resolve(file);
        img.onload = () => {
          const canvas = document.createElement('canvas');

          // ✅ Limite la taille max à 1200px
          const MAX = 1200;
          let { width, height } = img;
          if (width > MAX || height > MAX) {
            if (width > height) { height = Math.round(height * MAX / width); width = MAX; }
            else { width = Math.round(width * MAX / height); height = MAX; }
          }

          canvas.width  = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // ✅ Convertit en JPEG (résout HEIC + rotation EXIF)
          canvas.toBlob(
            (blob) => {
              if (!blob) { resolve(file); return; }
              const compressed = new File(
                [blob],
                file.name.replace(/\.[^.]+$/, '.jpg'), // ← extension .jpg
                { type: 'image/jpeg' }
              );
              resolve(compressed);
            },
            'image/jpeg',
            0.85 // qualité 85%
          );
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const setCover = (idx) => {
    if (idx <= 0) return;
    setImages(prev => {
      const next = [...prev];
      const [img] = next.splice(idx, 1);
      next.unshift(img);
      return next;
    });
  };

  const removeImage = (idx) => {
    setImages(prev => {
      const target = prev[idx];
      if (target?.preview?.startsWith('blob:')) {
        try { URL.revokeObjectURL(target.preview); } catch { /* ignore */ }
      }
      return prev.filter((_, i) => i !== idx);
    });
  };

  // ─── Images ────────────────────────────────────────────────────────────
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (images.length + files.length > 10) {
      setError(t.vendeur.imagesMax);
      return;
    }

    // ✅ Compresse chaque image (résout caméra, HEIC, rotation)
    const processed = await Promise.all(
        files.map(async (file) => {
          try {
            const compressed = await compressImage(file);
            return {
              file:    compressed,
              preview: URL.createObjectURL(compressed),
            };
          } catch {
            // Fallback si la compression échoue
            return {
              file,
              preview: URL.createObjectURL(file),
            };
          }
        })
      );

      setImages(prev => [...prev, ...processed]);

      // ✅ Reset l'input pour permettre de re-sélectionner le même fichier
      e.target.value = '';
    };

  // ─── Form ──────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ─── Navigation steps ──────────────────────────────────────────────────
  const handleNext = () => {
    setError('');

    if (currentStep === 1) {
      if (!formData.categorie) { setError(t.vendeur.needCategory); return; }
      if (!formData.etat)      { setError(t.vendeur.needState); return; }
      if (Number(formData.quantite) < 1) { setError(t.vendeur.minQty); return; }
    }

    setCurrentStep(prev => prev + 1);
  };

  // ─── Soumission ────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setError('');

    if (!formData.titre.trim())       { setError(t.vendeur.titleRequired); return; }
    if (!formData.description.trim()) { setError(t.vendeur.descRequired); return; }
    if (formData.titre.trim().length > 200) { setError(t.vendeur.titleTooLong); return; }
    if (formData.description.trim().length > 5000) { setError(t.vendeur.descTooLong); return; }
    if (!formData.prix_vendeur || Number(formData.prix_vendeur) < 100) {
      setError(t.vendeur.priceMin); return;
    }

    setLoading(true);
    try {
      // 1. Créer l'annonce
      const created = await createAnnonce({
        titre:           formData.titre.trim(),
        description:     formData.description.trim(),
        prix_vendeur:    Number(formData.prix_vendeur),
        categorie:       formData.categorie,
        etat:            formData.etat,
        quantite:        Math.max(1, parseInt(formData.quantite, 10) || 1),
        pays_expedition: formData.pays_expedition?.trim() || null,
      });

      const annonceId = created?.annonce?.id ?? created?.data?.id ?? created?.id;
      if (!annonceId) throw new Error(t.vendeur.noAnnonceId);

      // 2. Upload images si présentes
      if (images.length > 0) {
        await uploadAnnonceImages(annonceId, images.map(i => i.file));
      }

      try { localStorage.removeItem('publish_draft'); } catch { /* ignore */ }
      navigate(`/equipment/${annonceId}`);
    } catch (err) {
      setError(err.message || t.vendeur.publishError);
    } finally {
      setLoading(false);
    }
  };

  // ─── KYC loading ───────────────────────────────────────────────────────
  if (kycLoading) {
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

  // ─── Blocage KYC non validé ─────────────────────────────────────────────
  if (!kycValide) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <Header />
        <div className='container max-w-lg px-4 py-20 mx-auto text-center'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='p-10 bg-white rounded-2xl shadow-lg border border-gray-100'
          >
            {/* Icône selon statut KYC */}
            {kycDoc?.statut === 'en_attente' ? (
              <div className='w-20 h-20 mx-auto mb-6 rounded-full bg-yellow-100 flex items-center justify-center'>
                <Clock className='w-10 h-10 text-yellow-500' />
              </div>
            ) : kycDoc?.statut === 'refuse' ? (
              <div className='w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center'>
                <XCircle className='w-10 h-10 text-red-500' />
              </div>
            ) : (
              <div className='w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center'>
                <Shield className='w-10 h-10 text-gray-400' />
              </div>
            )}

            <h2 className='text-2xl font-bold text-gray-900 mb-3'>
              {kycDoc?.statut === 'en_attente'
                ? t.vendeur.kycChecking
                : kycDoc?.statut === 'refuse'
                ? t.vendeur.kycRefused
                : t.vendeur.kycRequired}
            </h2>

            <p className='text-gray-500 mb-8 text-sm leading-relaxed'>
              {kycDoc?.statut === 'en_attente'
                ? t.vendeur.kycCheckingHint
                : kycDoc?.statut === 'refuse'
                ? t.vendeur.kycRefusedHint
                : t.vendeur.kycRequiredHint}
            </p>

            <div className='flex flex-col gap-3'>
              {kycDoc?.statut !== 'en_attente' && (
                <Link
                  to='/seller/kyc'
                  onClick={() => {
                    // pré-sélectionner l'onglet KYC dans le profil
                    sessionStorage.setItem('profile_tab', 'kyc');
                  }}
                  className='block w-full py-3 bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white font-semibold rounded-xl hover:shadow-lg transition-all'
                >
                  <span className='flex items-center justify-center gap-2'>
                    <Shield className='w-4 h-4' />
                    {t.vendeur.kycSubmit}
                  </span>
                </Link>
              )}
              <button
                onClick={() => navigate(-1)}
                className='w-full py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-all'
              >
                {t.vendeur.back}
              </button>
            </div>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  // ─── Steps labels ───────────────────────────────────────────────────────
  const STEP_LABELS = [t.vendeur.stepDetails, t.vendeur.stepDesc];

  // ─── Render formulaire ──────────────────────────────────────────────────
  return (
    <div className='min-h-screen bg-gray-50'>
      <Header />

      {/* Progress bar */}
      <div className='bg-white border-b shadow-sm'>
        <div className='container px-4 py-5 mx-auto'>
          <div className='flex items-center justify-center max-w-sm mx-auto gap-2'>
            {[1, 2].map((step) => (
              <React.Fragment key={step}>
                <div className='flex flex-col items-center gap-1'>
                  <div className={`flex items-center justify-center w-9 h-9 rounded-full font-bold text-sm transition-all ${
                    currentStep > step
                      ? 'bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white'
                      : currentStep === step
                      ? 'bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white shadow-lg'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {currentStep > step ? <CheckCircle className='w-5 h-5' /> : step}
                  </div>
                  <span className={`text-xs font-medium ${currentStep === step ? 'text-[#1DBF73]' : 'text-gray-400'}`}>
                    {STEP_LABELS[step - 1]}
                  </span>
                </div>
                {step < 2 && (
                  <div className={`flex-1 h-1 rounded-full mb-4 transition-all ${
                    currentStep > step ? 'bg-gradient-to-r from-[#1DBF73] to-[#09B1BA]' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className='container px-4 py-10 mx-auto'>
        <div className='max-w-2xl mx-auto'>

          {/* Bouton retour page précédente */}
          <button
            onClick={() => navigate(-1)}
            className='inline-flex items-center gap-2 mb-6 text-gray-600 hover:text-[#1DBF73] transition-colors font-medium'
          >
            <ArrowLeft className='w-5 h-5' />
            Retour
          </button>

          {/* Erreur globale */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className='flex items-center gap-2 p-3 mb-5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl'
            >
              <AlertCircle className='w-4 h-4 shrink-0' />
              {error}
            </motion.div>
          )}

          <AnimatePresence mode='wait'>

            {/* ── ÉTAPE 1 : Détails ───────────────────────────────────── */}
            {currentStep === 1 && (
              <motion.div
                key='step1'
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className='p-8 bg-white shadow-lg rounded-2xl'
              >
                <h2 className='mb-6 text-2xl font-bold text-gray-800'>{t.vendeur.detailsTitle}</h2>
                {draftNote && (
                  <p className='mb-4 text-xs text-center text-gray-400'>{t.vendeur.draftRestored}</p>
                )}

                {/* Catégorie */}
                <div className='mb-6'>
                  <label className='block mb-3 text-sm font-semibold text-gray-700'>{t.vendeur.category}</label>
                  <div className='grid grid-cols-2 gap-2'>
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        type='button'
                        onClick={() => setFormData(prev => ({ ...prev, categorie: cat }))}
                        className={`flex items-center gap-2 p-3 border-2 rounded-xl text-left text-sm transition-all ${
                          formData.categorie === cat
                            ? 'border-[#1DBF73] bg-[#1DBF73]/10 text-[#1DBF73] font-semibold'
                            : 'border-gray-200 hover:border-[#1DBF73]/50 text-gray-700'
                        }`}
                      >
                        <span className={`w-3 h-3 rounded-full border-2 shrink-0 ${
                          formData.categorie === cat ? 'border-[#1DBF73] bg-[#1DBF73]' : 'border-gray-300'
                        }`} />
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
                  {/* État */}
                  <div>
                    <label className='block mb-2 text-sm font-semibold text-gray-700'>{t.vendeur.state}</label>
                    <select
                      name='etat'
                      value={formData.etat}
                      onChange={handleChange}
                      className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 transition-all'
                    >
                      <option value=''>{t.vendeur.chooseState}</option>
                      {ETATS.map(e => (
                        <option key={e.value} value={e.value}>{t.etats[e.value] ?? e.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Quantité */}
                  <div>
                    <label className='block mb-2 text-sm font-semibold text-gray-700'>{t.vendeur.quantity}</label>
                    <input
                      type='number'
                      name='quantite'
                      min={1}
                      value={formData.quantite}
                      onChange={handleChange}
                      className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 transition-all'
                    />
                  </div>

                  {/* Pays expédition */}
                  <div className='md:col-span-2'>
                    <label className='block mb-2 text-sm font-semibold text-gray-700'>
                      {t.vendeur.shipCountry} <span className='text-gray-400 font-normal'>({t.vendeur.shipCountryOpt})</span>
                    </label>
                    <input
                      type='text'
                      name='pays_expedition'
                      value={formData.pays_expedition}
                      onChange={handleChange}
                      placeholder={t.vendeur.shipCountryPh}
                      className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 transition-all'
                    />
                  </div>
                </div>

                <div className='flex gap-4 mt-8'>
                  <button
                    type='button'
                    onClick={() => setCurrentStep(1)}
                    className='flex-1 py-3.5 font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all'
                  >
                    {t.vendeur.prev}
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type='button'
                    onClick={handleNext}
                    className='flex-1 py-3.5 font-semibold text-white rounded-xl bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] hover:shadow-xl transition-all'
                  >
                    {t.vendeur.next}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ── ÉTAPE 3 : Description + Images + Prix ───────────────── */}
            {currentStep === 2 && (
              <motion.div
                key='step2'
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className='p-8 bg-white shadow-lg rounded-2xl'
              >
                <h2 className='mb-6 text-2xl font-bold text-gray-800'>{t.vendeur.descPriceTitle}</h2>

                {/* Upload images */}
                <div className='mb-6'>
                  <label className='block mb-2 text-sm font-semibold text-gray-700'>
                    {t.vendeur.imagesLabel} <span className='text-gray-400 font-normal'>({t.vendeur.imagesOpt})</span>
                  </label>
                  <div className='relative p-10 border-2 border-dashed border-gray-300 rounded-xl hover:border-[#1DBF73] transition-all group'>

                    {/* Input galerie */}
                    <input
                      type='file'
                      multiple
                      accept='image/*'
                      onChange={handleImageUpload}
                      className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
                    />

                    <div className='text-center pointer-events-none'>
                      <Upload className='w-10 h-10 mx-auto mb-3 text-gray-300 group-hover:text-[#1DBF73] transition-colors' />
                      <p className='text-sm font-semibold text-gray-500 group-hover:text-[#1DBF73]'>
                        {t.vendeur.gallery}
                      </p>
                      <p className='text-xs text-gray-400 mt-1'>{t.vendeur.galleryHint}</p>
                    </div>
                  </div>

                  {/* Bouton caméra séparé — mobile uniquement */}
                  <div className='md:hidden mt-3'>
                    <label className='flex items-center justify-center gap-2 w-full py-3 border-2 border-[#1DBF73]/40 text-[#1DBF73] font-semibold rounded-xl cursor-pointer hover:bg-[#1DBF73]/5 transition-all text-sm'>
                      📷 {t.vendeur.takePhoto}
                      <input
                        type='file'
                        accept='image/*'
                        capture='environment'
                        onChange={handleImageUpload}
                        className='hidden'
                      />
                    </label>
                  </div>

                  {images.length > 0 && (
                    <div className='grid grid-cols-4 gap-3 mt-4'>
                      {images.map((img, i) => (
                        <div key={i} className='relative group rounded-xl overflow-hidden'>
                          <img src={img.preview} alt='' onClick={() => setCover(i)} title={t.vendeur.setCover} className='object-cover w-full h-24 rounded-xl cursor-pointer' />
                          <button
                            type='button'
                            onClick={() => removeImage(i)}
                            className='absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'
                          >
                            <X className='w-3.5 h-3.5 text-white' />
                          </button>
                          {i === 0 && (
                            <span className='absolute bottom-1 left-1 px-1.5 py-0.5 text-xs bg-[#1DBF73] text-white rounded font-semibold'>
                              {t.vendeur.main}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Titre */}
                <div className='mb-5'>
                  <label className='block mb-2 text-sm font-semibold text-gray-700'>{t.vendeur.titleLabel}</label>
                  <input
                    type='text'
                    name='titre'
                    value={formData.titre}
                    onChange={handleChange}
                    placeholder={t.vendeur.titlePh}
                    maxLength={200}
                    className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 transition-all'
                  />
                  <p className='text-xs text-gray-400 mt-1 text-right'>{(formData.titre || '').length}/200</p>
                </div>

                {/* Description */}
                <div className='mb-5'>
                  <label className='block mb-2 text-sm font-semibold text-gray-700'>{t.vendeur.descLabel}</label>
                  <textarea
                    name='description'
                    value={formData.description}
                    onChange={handleChange}
                    rows={5}
                    placeholder={t.vendeur.descPh}
                    maxLength={5000}
                    className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 transition-all resize-none'
                  />
                  <p className='text-xs text-gray-400 mt-1 text-right'>{(formData.description || '').length}/5000</p>
                </div>

                {/* Prix */}
                <div className='mb-8'>
                  <label className='block mb-2 text-sm font-semibold text-gray-700'>{t.vendeur.priceLabel}</label>
                  <div className='relative'>
                    <input
                      type='number'
                      name='prix_vendeur'
                      value={formData.prix_vendeur}
                      onChange={handleChange}
                      placeholder='0'
                      min={0}
                      className='w-full px-4 py-3 pr-20 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 transition-all'
                    />
                    <span className='absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400'>FCFA</span>
                  </div>

                  {formData.prix_vendeur && Number(formData.prix_vendeur) > 0 && (
                    <div className='mt-3 p-3 bg-[#1DBF73]/5 border border-[#1DBF73]/20 rounded-xl space-y-1.5'>
                      <div className='flex items-center justify-between text-sm'>
                        <span className='text-gray-500'>{t.vendeur.priceHint}</span>
                        <span className='font-semibold text-gray-700'>
                          {Number(formData.prix_vendeur).toLocaleString(getLocale())} FCFA
                        </span>
                      </div>
                      <div className='flex items-center justify-between text-sm'>
                        <span className='flex items-center gap-1 text-[#09B1BA]'>
                          🛡️ {t.equipment.buyerProtection} <span className='text-xs'>(8%)</span>
                        </span>
                        <span className='font-semibold text-[#09B1BA]'>
                          + {Math.round(Number(formData.prix_vendeur) * 0.08).toLocaleString(getLocale())} FCFA
                        </span>
                      </div>
                      <div className='border-t border-[#1DBF73]/20 pt-1.5 flex items-center justify-between'>
                        <span className='font-bold text-gray-800'>{t.vendeur.priceBuyer}</span>
                        <span className='font-black text-[#1DBF73] text-base'>
                          {Math.round(Number(formData.prix_vendeur) * 1.08).toLocaleString(getLocale())} FCFA
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className='flex gap-4'>
                  <button
                    type='button'
                    onClick={() => setCurrentStep(1)}
                    className='flex-1 py-3.5 font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all'
                  >
                    {t.vendeur.prev}
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type='button'
                    onClick={handleSubmit}
                    disabled={loading}
                    className='flex-1 py-3.5 font-semibold text-white rounded-xl bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] hover:shadow-xl disabled:opacity-50 transition-all flex items-center justify-center gap-2'
                  >
                    {loading ? (
                      <>
                        <div className='w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin' />
                        {t.vendeur.publishing}
                      </>
                    ) : (
                      t.vendeur.publishNow
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PublishEquipment;
