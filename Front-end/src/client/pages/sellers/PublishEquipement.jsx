import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Package,
  Upload,
  X,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useLang } from '../../context/LangContext';

const API_BASE = import.meta?.env?.VITE_API_BASE_URL || 'http://localhost:8000';

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('token'); // si tu stockes un token
  const headers = {
    Accept: 'application/json',
    ...(options.headers || {}),
  };

  const isFormData = options.body instanceof FormData;
  if (!isFormData) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg =
      data?.message ||
      (data?.errors ? Object.values(data.errors).flat().join('\n') : 'Erreur serveur');
    throw new Error(msg);
  }
  return data;
}

const PublishEquipment = () => {
  const { t } = useLang();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);

  // vendeur only
  const [sellerMode, setSellerMode] = useState(true);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [images, setImages] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [authFormData, setAuthFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialty: '',
    password: ''
  });

  // ✅ Champs alignés backend
  const [formData, setFormData] = useState({
    categorie: '',
    titre: '',
    description: '',
    prix_vendeur: '',
    etat: '',
    quantite: 1,
    pays_expedition: ''
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
    if (images.length + files.length > 20) {
      alert('Maximum 20 images');
      return;
    }
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // ✅ Catégorie unique (backend = string)
  const handleCategorySelect = (category) => {
    setFormData(prev => ({ ...prev, categorie: category }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAuthChange = (e) => {
    const { name, value } = e.target;
    setAuthFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    // Étape 1: vendeur only => rien à valider, mais on garde le flow
    if (currentStep === 1 && !sellerMode) {
      alert('Mode vendeur requis');
      return;
    }

    // Étape 2: type équipement => ici c'est toujours "equipment"
    if (currentStep === 2) {
      // rien
    }

    // Étape 3: catégorie + etat + quantité
    if (currentStep === 3) {
      if (!formData.categorie) {
        alert('Veuillez sélectionner une catégorie');
        return;
      }
      if (!formData.etat) {
        alert('Veuillez sélectionner l’état');
        return;
      }
      if (!formData.quantite || Number(formData.quantite) < 1) {
        alert('Quantité min 1');
        return;
      }
    }

    setCurrentStep(prev => prev + 1);
  };

  // ✅ ici tu dois brancher ton vrai login/register API si tu veux
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 👉 OPTION A: si tu n'as pas encore d'API auth, tu peux garder "fake login"
      // mais ton backend (Auth::id()) refusera store si route protégée
      // Donc je laisse placeholder. Remplace par ton endpoint auth.

      // Exemple:
      // const data = await apiFetch('/api/login', { method:'POST', body: JSON.stringify({email: authFormData.email, password: authFormData.password}) });
      // localStorage.setItem('token', data.token);

      localStorage.setItem('user', JSON.stringify({
        name: authFormData.name || 'Utilisateur',
        email: authFormData.email,
      }));

      setShowAuthModal(false);
      await publishAnnonce();
    } catch (err) {
      alert(err.message || 'Erreur auth');
    } finally {
      setLoading(false);
    }
  };

  const publishAnnonce = async () => {
    // 1) créer annonce
    const payload = {
      titre: formData.titre.trim(),
      description: formData.description?.trim() || null,
      prix_vendeur: Number(formData.prix_vendeur),
      categorie: formData.categorie || null,
      etat: formData.etat,
      quantite: Number(formData.quantite),
      pays_expedition: formData.pays_expedition?.trim() || null
    };

    const created = await apiFetch('/api/annonces', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    const annonceId = created?.annonce?.id;
    if (!annonceId) throw new Error('ID annonce introuvable');

    // 2) upload images (optionnel)
    for (const img of images) {
      const fd = new FormData();
      fd.append('image', img.file);

      await apiFetch(`/api/annonces/${annonceId}/images`, {
        method: 'POST',
        body: fd
      });
    }

    alert('Annonce publiée avec succès !');
    navigate(`/equipment/${annonceId}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ validations backend
    if (!formData.titre || formData.titre.trim() === '') {
      alert('Veuillez renseigner un titre');
      return;
    }

    // description est nullable backend, mais tu peux garder required si tu veux
    if (!formData.description || formData.description.trim() === '') {
      alert('Veuillez renseigner une description');
      return;
    }

    if (formData.prix_vendeur === '' || Number(formData.prix_vendeur) < 0) {
      alert('Veuillez renseigner un prix valide');
      return;
    }

    // Images: backend ne les rend pas obligatoires
    // mais si tu veux les rendre obligatoires, décommente:
    // if (images.length === 0) { alert('Veuillez ajouter au moins une image'); return; }

    // ✅ Si token absent => ouvrir modal
    const token = localStorage.getItem('token');
    if (!token) {
      setShowAuthModal(true);
      return;
    }

    try {
      setLoading(true);
      await publishAnnonce();
    } catch (err) {
      alert(err.message || 'Erreur publication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* progress steps (4) - même style */}
      <div className="bg-white border-b shadow-sm">
        <div className="container px-4 py-6 mx-auto">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all ${
                  currentStep >= step
                    ? 'bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {currentStep > step ? <CheckCircle className="w-6 h-6" /> : step}
                </div>
                {step < 4 && (
                  <div className={`w-20 h-1 mx-2 ${
                    currentStep > step ? 'bg-gradient-to-r from-[#1DBF73] to-[#09B1BA]' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container px-4 py-12 mx-auto">
        <div className="max-w-4xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 text-gray-600 hover:text-[#1DBF73] transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Retour</span>
          </Link>

          <AnimatePresence mode="wait">
            {/* ÉTAPE 1: VENDEUR UNIQUEMENT (même style que vente/achat) */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8 bg-white shadow-lg rounded-2xl"
              >
                <h2 className="mb-8 text-3xl font-bold text-center text-gray-800">
                  Publier une annonce 
                </h2>

                <div className="flex justify-center mb-8">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSellerMode(true)}
                    className={`p-8 border-2 rounded-xl transition-all max-w-md w-full ${
                      sellerMode
                        ? 'border-[#1DBF73] bg-[#1DBF73]/5'
                        : 'border-gray-200 hover:border-[#1DBF73]/50'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-4">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                        sellerMode ? 'bg-[#1DBF73]' : 'bg-gray-100'
                      }`}>
                        <Package className={`w-8 h-8 ${sellerMode ? 'text-white' : 'text-gray-600'}`} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">VENDEUR</h3>
                      <p className="text-sm text-center text-gray-600">
                        Publiez un équipement à vendre
                      </p>
                    </div>
                  </motion.button>
                </div>

                <button
                  onClick={handleNext}
                  className="w-full py-4 font-semibold text-white transition-all rounded-xl bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] hover:shadow-xl"
                >
                  Suivante
                </button>
              </motion.div>
            )}

            {/* ÉTAPE 2: TYPE ÉQUIPEMENT (même style) */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8 bg-white shadow-lg rounded-2xl"
              >
                <h2 className="mb-8 text-3xl font-bold text-center text-gray-800">
                  Type d&apos;équipement
                </h2>

                <div className="flex justify-center mb-8">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-8 border-2 rounded-xl transition-all border-[#1DBF73] bg-[#1DBF73]/5 max-w-sm w-full"
                  >
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center bg-[#1DBF73]">
                        <Package className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">ÉQUIPEMENT MÉDICAL</h3>
                      <p className="text-sm text-center text-gray-600">
                        Matériel et équipement médical professionnel
                      </p>
                    </div>
                  </motion.button>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 py-4 font-semibold text-gray-700 transition-all bg-gray-200 rounded-xl hover:bg-gray-300"
                  >
                    Précédent
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 py-4 font-semibold text-white transition-all rounded-xl bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] hover:shadow-xl"
                  >
                    Suivante
                  </button>
                </div>
              </motion.div>
            )}

            {/* ÉTAPE 3: CATEGORIE + ETAT + QUANTITE (au lieu contact) */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8 bg-white shadow-lg rounded-2xl"
              >
                <h2 className="mb-6 text-2xl font-bold text-gray-800">Détails de l&apos;annonce</h2>

                <div className="p-6 mb-8 border-2 border-gray-200 rounded-xl">
                  <h3 className="mb-4 text-lg font-bold text-gray-800">Catégorie *</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {equipmentCategories.map((item, index) => (
                      <button
                        type="button"
                        key={index}
                        onClick={() => handleCategorySelect(item)}
                        className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all text-left ${
                          formData.categorie === item
                            ? 'border-[#1DBF73] bg-[#1DBF73]/10'
                            : 'border-gray-200 hover:border-[#1DBF73]/50'
                        }`}
                      >
                        <span className="flex items-center justify-center w-4 h-4 border-2 border-gray-300 rounded-full">
                          {formData.categorie === item ? (
                            <span className="w-2 h-2 rounded-full bg-[#1DBF73]" />
                          ) : null}
                        </span>
                        <span className="text-sm text-gray-700">{item}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2">
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700">État *</label>
                    <select
                      name="etat"
                      value={formData.etat}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#1DBF73]"
                      required
                    >
                      <option value="">Choisir</option>
                      {etats.map((e) => (
                        <option key={e} value={e}>{e}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700">Quantité *</label>
                    <input
                      type="number"
                      name="quantite"
                      min={1}
                      value={formData.quantite}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#1DBF73]"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block mb-2 text-sm font-semibold text-gray-700">Pays d&apos;expédition (optionnel)</label>
                    <input
                      type="text"
                      name="pays_expedition"
                      value={formData.pays_expedition}
                      onChange={handleChange}
                      placeholder="Bénin"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#1DBF73]"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="flex-1 py-4 font-semibold text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300"
                  >
                    Précédent
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 py-4 font-semibold text-white rounded-xl bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] hover:shadow-xl"
                  >
                    Suivante
                  </button>
                </div>
              </motion.div>
            )}

            {/* ÉTAPE 4: DESCRIPTION (même style) */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8 bg-white shadow-lg rounded-2xl"
              >
                <h2 className="mb-6 text-2xl font-bold text-gray-800">Description</h2>

                {/* Images (optionnel) */}
                <div className="mb-8">
                  <label className="block mb-2 text-sm font-semibold text-gray-700">Images (optionnel)</label>
                  <div className="relative p-12 border-2 border-dashed border-gray-300 rounded-xl hover:border-[#1DBF73] transition-all">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="text-center">
                      <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg font-semibold text-gray-700">Glissez vos images ici</p>
                    </div>
                  </div>

                  {images.length > 0 && (
                    <div className="grid grid-cols-4 gap-4 mt-6">
                      {images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img src={image.preview} alt="" className="object-cover w-full h-32 rounded-lg" />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute p-1 text-white bg-red-500 rounded-full opacity-0 top-2 right-2 group-hover:opacity-100"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block mb-2 text-sm font-semibold text-gray-700">Titre *</label>
                  <input
                    type="text"
                    name="titre"
                    value={formData.titre}
                    onChange={handleChange}
                    placeholder="Titre de l'annonce"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#1DBF73]"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block mb-2 text-sm font-semibold text-gray-700">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={6}
                    placeholder="Description détaillée"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#1DBF73] resize-none"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block mb-2 text-sm font-semibold text-gray-700">Prix *</label>
                  <input
                    type="number"
                    name="prix_vendeur"
                    value={formData.prix_vendeur}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#1DBF73]"
                    required
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="flex-1 py-4 font-semibold text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300"
                  >
                    Précédent
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 py-4 font-semibold text-white rounded-xl bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] hover:shadow-xl disabled:opacity-50"
                  >
                    {loading ? 'Publication...' : "Publier l'annonce"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* MODAL LOGIN/REGISTER (gardé) */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md overflow-hidden bg-white shadow-2xl rounded-2xl"
            >
              <div className="flex border-b-2">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className={`flex-1 py-4 font-bold text-sm tracking-wide transition-all ${
                    authMode === 'login'
                      ? 'border-b-4 border-gray-800 text-gray-800'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  SE CONNECTER
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className={`flex-1 py-4 font-bold text-sm tracking-wide transition-all ${
                    authMode === 'register'
                      ? 'border-b-4 border-gray-800 text-gray-800'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  INSCRIPTION
                </button>
              </div>

              <div className="p-8">
                <div className="flex items-center gap-4 my-6">
                  <div className="flex-1 h-px bg-gray-300"></div>
                  <span className="text-sm font-semibold text-gray-500">OU</span>
                  <div className="flex-1 h-px bg-gray-300"></div>
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  {authMode === 'register' && (
                    <>
                      <input
                        type="text"
                        name="name"
                        value={authFormData.name}
                        onChange={handleAuthChange}
                        placeholder="Nom complet"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#1DBF73]"
                        required
                      />
                      <input
                        type="email"
                        name="email"
                        value={authFormData.email}
                        onChange={handleAuthChange}
                        placeholder="Saisissez Votre E-mail"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#1DBF73]"
                        required
                      />
                      <input
                        type="tel"
                        name="phone"
                        value={authFormData.phone}
                        onChange={handleAuthChange}
                        placeholder="+229 XX XX XX XX"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#1DBF73]"
                        required
                      />
                      <select
                        name="specialty"
                        value={authFormData.specialty}
                        onChange={handleAuthChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#1DBF73]"
                        required
                      >
                        <option value="">Spécialité</option>
                        {specialties.map((s, i) => (
                          <option key={i} value={s}>{s}</option>
                        ))}
                      </select>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={authFormData.password}
                          onChange={handleAuthChange}
                          placeholder="Mot de passe"
                          className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#1DBF73]"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute text-gray-400 transform -translate-y-1/2 right-4 top-1/2"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </>
                  )}

                  {authMode === 'login' && (
                    <>
                      <input
                        type="email"
                        name="email"
                        value={authFormData.email}
                        onChange={handleAuthChange}
                        placeholder="Saisissez Votre E-mail"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#1DBF73]"
                        required
                      />
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={authFormData.password}
                          onChange={handleAuthChange}
                          placeholder="Mot de passe"
                          className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#1DBF73]"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute text-gray-400 transform -translate-y-1/2 right-4 top-1/2"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 mt-6 font-bold text-white transition-all bg-yellow-400 rounded-xl hover:bg-yellow-500 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className='flex items-center justify-center gap-2'>
                        <div className='w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin'></div>
                        {authMode === 'login' ? 'Connexion...' : 'Inscription...'}
                      </div>
                    ) : (
                      'CONTINUER'
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAuthModal(false)}
                    className="w-full py-3 font-semibold text-gray-700 transition-all bg-gray-100 rounded-xl hover:bg-gray-200"
                  >
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