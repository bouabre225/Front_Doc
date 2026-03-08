import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Package, Upload, X, CheckCircle, Eye, EyeOff
} from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

const API_URL = 'http://localhost:8000/api';

const PublishEquipment = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [sellerMode, setSellerMode] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [images, setImages] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [authFormData, setAuthFormData] = useState({
    name: '', email: '', phone: '', specialty: '', password: ''
  });

  const [formData, setFormData] = useState({
    categorie: '', titre: '', description: '',
    prix_vendeur: '', etat: '', quantite: 1, pays_expedition: ''
  });

  const equipmentCategories = [
    'Imagerie Médicale', 'Cardiologie', 'Laboratoire', 'Chirurgie',
    'Monitoring', 'Urgence', 'Mobilier Médical', 'Stérilisation'
  ];

  const specialties = [
    'Cardiologie', 'Radiologie', 'Chirurgie', 'Pédiatrie',
    'Urgence', 'Laboratoire', 'Autre'
  ];

  const etats = ['Neuf', 'Comme neuf', 'Bon état', 'Occasion'];

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 20) { alert('Maximum 20 images'); return; }
    setImages(prev => [...prev, ...files.map(file => ({
      file, preview: URL.createObjectURL(file)
    }))]);
  };

  const removeImage = (index) => setImages(prev => prev.filter((_, i) => i !== index));

  const handleCategorySelect = (category) =>
    setFormData(prev => ({ ...prev, categorie: category }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAuthChange = (e) => {
    const { name, value } = e.target;
    setAuthFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (currentStep === 3) {
      if (!formData.categorie) { alert('Veuillez sélectionner une catégorie'); return; }
      if (!formData.etat) { alert("Veuillez sélectionner l'état"); return; }
      if (!formData.quantite || Number(formData.quantite) < 1) { alert('Quantité min 1'); return; }
    }
    setCurrentStep(prev => prev + 1);
  };

  const publishAnnonce = async () => {
    const token = localStorage.getItem('auth_token');
    const payload = {
      titre: formData.titre.trim(),
      description: formData.description?.trim() || null,
      prix_vendeur: Number(formData.prix_vendeur),
      categorie: formData.categorie,
      etat: formData.etat,
      quantite: Number(formData.quantite),
      pays_expedition: formData.pays_expedition?.trim() || null
    };

    const res = await fetch(`${API_URL}/annonces`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      const msg = data?.message ||
        (data?.errors ? Object.values(data.errors).flat().join('\n') : 'Erreur serveur');
      throw new Error(msg);
    }

    const annonceId = data?.annonce?.id;
    if (!annonceId) throw new Error('ID annonce introuvable');

    for (const img of images) {
      const fd = new FormData();
      fd.append('image', img.file);
      await fetch(`${API_URL}/annonces/${annonceId}/images`, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
        body: fd
      });
    }
    navigate(`/equipment/${annonceId}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.titre?.trim()) { setError('Veuillez renseigner un titre'); return; }
    if (!formData.description?.trim()) { setError('Veuillez renseigner une description'); return; }
    if (formData.prix_vendeur === '' || Number(formData.prix_vendeur) < 0) {
      setError('Veuillez renseigner un prix valide'); return;
    }
    const token = localStorage.getItem('auth_token');
    if (!token) { setShowAuthModal(true); return; }
    try {
      setLoading(true);
      await publishAnnonce();
    } catch (err) {
      setError(err.message || 'Erreur publication');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const endpoint = authMode === 'login'
        ? `${API_URL}/login` : `${API_URL}/register/vendeur`;
      const body = authMode === 'login'
        ? { email: authFormData.email, mot_de_passe: authFormData.password }
        : { nom: authFormData.name, email: authFormData.email, mot_de_passe: authFormData.password, telephone: authFormData.phone, pays: 'Bénin' };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur auth');

      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setShowAuthModal(false);
      await publishAnnonce();
    } catch (err) {
      setError(err.message || 'Erreur auth');
    } finally {
      setLoading(false);
    }
  };

  // ── Classe commune pour les inputs ──
  const inputClass = 'w-full px-3 py-3 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#1DBF73] transition-colors';
  const btnPrimary = 'flex-1 py-3.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] hover:shadow-lg transition-all disabled:opacity-50';
  const btnSecondary = 'flex-1 py-3.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all';

  return (
    <div className='min-h-screen bg-gray-50'>
      <Header />

      {/* ── Barre de progression ── */}
      <div className='bg-white border-b shadow-sm'>
        <div className='w-full px-4 py-4'>
          <div className='flex items-center justify-center max-w-xs gap-0 mx-auto sm:max-w-sm'>
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className='flex items-center'>
                {/* Cercle étape */}
                <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full font-bold text-xs sm:text-sm transition-all flex-shrink-0 ${
                  currentStep >= step
                    ? 'bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white shadow-md'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {currentStep > step
                    ? <CheckCircle className='w-4 h-4 sm:w-5 sm:h-5' />
                    : step}
                </div>
                {/* Ligne entre étapes */}
                {step < 4 && (
                  <div className={`w-8 sm:w-16 h-1 transition-all ${
                    currentStep > step
                      ? 'bg-gradient-to-r from-[#1DBF73] to-[#09B1BA]'
                      : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          {/* Label étape */}
          <p className='mt-2 text-xs text-center text-gray-400'>
            Étape {currentStep} sur 4
          </p>
        </div>
      </div>

      {/* ── Contenu ── */}
      <div className='w-full max-w-2xl px-3 py-6 mx-auto sm:px-4 sm:py-10'>
        <Link to='/' className='inline-flex items-center gap-2 mb-5 text-sm text-gray-600 hover:text-[#1DBF73] transition-colors'>
          <ArrowLeft className='w-4 h-4' />
          Retour
        </Link>

        <AnimatePresence mode='wait'>

          {/* ── ÉTAPE 1 ── */}
          {currentStep === 1 && (
            <motion.div key='step1'
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              className='p-4 bg-white shadow-md sm:p-8 rounded-2xl'>
              <h2 className='mb-6 text-xl font-bold text-center text-gray-800 sm:text-2xl'>
                Publier une annonce
              </h2>

              <div className='flex justify-center mb-6'>
                <motion.button whileTap={{ scale: 0.98 }}
                  onClick={() => setSellerMode(true)}
                  className={`p-5 sm:p-8 border-2 rounded-xl transition-all w-full max-w-xs ${
                    sellerMode ? 'border-[#1DBF73] bg-[#1DBF73]/5' : 'border-gray-200'
                  }`}>
                  <div className='flex flex-col items-center gap-3'>
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                      sellerMode ? 'bg-[#1DBF73]' : 'bg-gray-100'
                    }`}>
                      <Package className={`w-7 h-7 ${sellerMode ? 'text-white' : 'text-gray-600'}`} />
                    </div>
                    <h3 className='text-base font-bold text-gray-800'>VENDEUR</h3>
                    <p className='text-xs text-center text-gray-500'>Publiez un équipement à vendre</p>
                  </div>
                </motion.button>
              </div>

              <button onClick={handleNext} className={btnPrimary + ' w-full'}>
                Suivante
              </button>
            </motion.div>
          )}

          {/* ── ÉTAPE 2 ── */}
          {currentStep === 2 && (
            <motion.div key='step2'
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              className='p-4 bg-white shadow-md sm:p-8 rounded-2xl'>
              <h2 className='mb-6 text-xl font-bold text-center text-gray-800 sm:text-2xl'>
                Type d'équipement
              </h2>

              <div className='flex justify-center mb-6'>
                <div className='p-5 sm:p-8 border-2 rounded-xl border-[#1DBF73] bg-[#1DBF73]/5 w-full max-w-xs'>
                  <div className='flex flex-col items-center gap-3'>
                    <div className='w-14 h-14 rounded-full bg-[#1DBF73] flex items-center justify-center'>
                      <Package className='text-white w-7 h-7' />
                    </div>
                    <h3 className='text-base font-bold text-gray-800'>ÉQUIPEMENT MÉDICAL</h3>
                    <p className='text-xs text-center text-gray-500'>Matériel médical professionnel</p>
                  </div>
                </div>
              </div>

              <div className='flex gap-3'>
                <button type='button' onClick={() => setCurrentStep(1)} className={btnSecondary}>Précédent</button>
                <button type='button' onClick={handleNext} className={btnPrimary}>Suivante</button>
              </div>
            </motion.div>
          )}

          {/* ── ÉTAPE 3 ── */}
          {currentStep === 3 && (
            <motion.div key='step3'
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              className='p-4 bg-white shadow-md sm:p-8 rounded-2xl'>
              <h2 className='mb-5 text-lg font-bold text-gray-800 sm:text-xl'>
                Détails de l'annonce
              </h2>

              {/* Catégorie */}
              <div className='p-4 mb-5 border-2 border-gray-200 rounded-xl'>
                <h3 className='mb-3 text-sm font-bold text-gray-800'>Catégorie *</h3>
                <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
                  {equipmentCategories.map((item) => (
                    <button type='button' key={item} onClick={() => handleCategorySelect(item)}
                      className={`flex items-center gap-2 px-3 py-2.5 border-2 rounded-lg text-left transition-all ${
                        formData.categorie === item
                          ? 'border-[#1DBF73] bg-[#1DBF73]/10'
                          : 'border-gray-200 hover:border-[#1DBF73]/50'
                      }`}>
                      <span className='flex items-center justify-center flex-shrink-0 w-4 h-4 border-2 border-gray-300 rounded-full'>
                        {formData.categorie === item && (
                          <span className='w-2 h-2 rounded-full bg-[#1DBF73]' />
                        )}
                      </span>
                      <span className='text-xs font-medium text-gray-700'>{item}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className='grid grid-cols-1 gap-4 mb-5 sm:grid-cols-2'>
                <div>
                  <label className='block mb-1.5 text-xs font-semibold text-gray-700'>État *</label>
                  <select name='etat' value={formData.etat} onChange={handleChange}
                    className={inputClass} required>
                    <option value=''>Choisir</option>
                    {etats.map((e) => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <div>
                  <label className='block mb-1.5 text-xs font-semibold text-gray-700'>Quantité *</label>
                  <input type='number' name='quantite' min={1} value={formData.quantite}
                    onChange={handleChange} className={inputClass} required />
                </div>
                <div className='sm:col-span-2'>
                  <label className='block mb-1.5 text-xs font-semibold text-gray-700'>
                    Pays d'expédition <span className='font-normal text-gray-400'>(optionnel)</span>
                  </label>
                  <input type='text' name='pays_expedition' value={formData.pays_expedition}
                    onChange={handleChange} placeholder='Bénin' className={inputClass} />
                </div>
              </div>

              <div className='flex gap-3'>
                <button type='button' onClick={() => setCurrentStep(2)} className={btnSecondary}>Précédent</button>
                <button type='button' onClick={handleNext} className={btnPrimary}>Suivante</button>
              </div>
            </motion.div>
          )}

          {/* ── ÉTAPE 4 ── */}
          {currentStep === 4 && (
            <motion.div key='step4'
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              className='p-4 bg-white shadow-md sm:p-8 rounded-2xl'>
              <h2 className='mb-5 text-lg font-bold text-gray-800 sm:text-xl'>
                Description & Prix
              </h2>

              {error && (
                <div className='p-3 mb-4 text-xs font-medium text-red-600 border border-red-200 rounded-xl bg-red-50'>
                  {error}
                </div>
              )}

              {/* Upload images */}
              <div className='mb-5'>
                <label className='block mb-1.5 text-xs font-semibold text-gray-700'>
                  Images <span className='font-normal text-gray-400'>(optionnel, max 20)</span>
                </label>
                <div className='relative p-6 sm:p-10 border-2 border-dashed border-gray-300 rounded-xl hover:border-[#1DBF73] transition-all'>
                  <input type='file' multiple accept='image/*' onChange={handleImageUpload}
                    className='absolute inset-0 w-full h-full opacity-0 cursor-pointer' />
                  <div className='text-center pointer-events-none'>
                    <Upload className='w-10 h-10 mx-auto mb-2 text-gray-300 sm:w-12 sm:h-12' />
                    <p className='text-sm font-semibold text-gray-600'>Appuyez pour ajouter des images</p>
                    <p className='mt-1 text-xs text-gray-400'>JPG, PNG, WebP</p>
                  </div>
                </div>

                {images.length > 0 && (
                  <div className='grid grid-cols-3 gap-2 mt-3 sm:grid-cols-4'>
                    {images.map((image, index) => (
                      <div key={index} className='relative group'>
                        <img src={image.preview} alt=''
                          className='object-cover w-full rounded-lg aspect-square' />
                        <button type='button' onClick={() => removeImage(index)}
                          className='absolute top-1 right-1 p-0.5 text-white bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity'>
                          <X className='w-3 h-3' />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Titre */}
              <div className='mb-4'>
                <label className='block mb-1.5 text-xs font-semibold text-gray-700'>Titre *</label>
                <input type='text' name='titre' value={formData.titre} onChange={handleChange}
                  placeholder="Ex: Échographe GE Voluson E10"
                  className={inputClass} required />
              </div>

              {/* Description */}
              <div className='mb-4'>
                <label className='block mb-1.5 text-xs font-semibold text-gray-700'>Description *</label>
                <textarea name='description' value={formData.description} onChange={handleChange}
                  rows={5} placeholder='Description détaillée...'
                  className={inputClass + ' resize-none'} required />
              </div>

              {/* Prix */}
              <div className='mb-6'>
                <label className='block mb-1.5 text-xs font-semibold text-gray-700'>Prix (FCFA) *</label>
                <div className='relative'>
                  <input type='number' name='prix_vendeur' value={formData.prix_vendeur}
                    onChange={handleChange} placeholder='0'
                    className={inputClass + ' pr-16'} required />
                  <span className='absolute text-xs font-semibold text-gray-400 -translate-y-1/2 right-3 top-1/2'>
                    FCFA
                  </span>
                </div>
              </div>

              <div className='flex gap-3'>
                <button type='button' onClick={() => setCurrentStep(3)} className={btnSecondary}>Précédent</button>
                <button type='button' onClick={handleSubmit} disabled={loading} className={btnPrimary}>
                  {loading ? (
                    <div className='flex items-center justify-center gap-2'>
                      <div className='w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin' />
                      Publication...
                    </div>
                  ) : "Publier"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── MODAL AUTH ── */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className='fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center'>
            <motion.div
              initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
              className='w-full bg-white rounded-t-3xl sm:rounded-2xl sm:max-w-md overflow-hidden max-h-[90vh] overflow-y-auto'>

              {/* Handle mobile */}
              <div className='flex justify-center pt-3 pb-1 sm:hidden'>
                <div className='w-10 h-1 bg-gray-300 rounded-full' />
              </div>

              {/* Tabs */}
              <div className='flex border-b'>
                {['login', 'register'].map((mode) => (
                  <button key={mode} type='button'
                    onClick={() => { setAuthMode(mode); setError(''); }}
                    className={`flex-1 py-3.5 font-bold text-xs tracking-wider transition-all ${
                      authMode === mode
                        ? 'border-b-2 border-[#1DBF73] text-[#1DBF73]'
                        : 'text-gray-400'
                    }`}>
                    {mode === 'login' ? 'SE CONNECTER' : 'INSCRIPTION'}
                  </button>
                ))}
              </div>

              <div className='p-5'>
                {error && (
                  <div className='p-3 mb-4 text-xs text-red-600 border border-red-200 rounded-xl bg-red-50'>
                    {error}
                  </div>
                )}

                <form onSubmit={handleAuthSubmit} className='space-y-3'>
                  {authMode === 'register' && (
                    <>
                      <input type='text' name='name' value={authFormData.name}
                        onChange={handleAuthChange} placeholder='Nom complet'
                        className={inputClass} required />
                      <input type='tel' name='phone' value={authFormData.phone}
                        onChange={handleAuthChange} placeholder='+229 XX XX XX XX'
                        className={inputClass} required />
                      <select name='specialty' value={authFormData.specialty}
                        onChange={handleAuthChange} className={inputClass} required>
                        <option value=''>Spécialité</option>
                        {specialties.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </>
                  )}

                  <input type='email' name='email' value={authFormData.email}
                    onChange={handleAuthChange} placeholder='Adresse email'
                    className={inputClass} required />

                  <div className='relative'>
                    <input type={showPassword ? 'text' : 'password'} name='password'
                      value={authFormData.password} onChange={handleAuthChange}
                      placeholder='Mot de passe'
                      className={inputClass + ' pr-11'} required />
                    <button type='button' onClick={() => setShowPassword(!showPassword)}
                      className='absolute text-gray-400 -translate-y-1/2 right-3 top-1/2 hover:text-[#1DBF73]'>
                      {showPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
                    </button>
                  </div>

                  <button type='submit' disabled={loading}
                    className='w-full py-3.5 font-bold text-sm text-white bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] rounded-xl disabled:opacity-50 transition-all'>
                    {loading ? (
                      <div className='flex items-center justify-center gap-2'>
                        <div className='w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin' />
                        {authMode === 'login' ? 'Connexion...' : 'Inscription...'}
                      </div>
                    ) : 'CONTINUER'}
                  </button>

                  <button type='button' onClick={() => { setShowAuthModal(false); setError(''); }}
                    className='w-full py-3 text-sm font-semibold text-gray-600 transition-all bg-gray-100 rounded-xl hover:bg-gray-200'>
                    Annuler
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default PublishEquipment;