import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MapPin, Heart, ShoppingCart, Plus, Minus, X, Phone, Check, Package, Calendar, User, Layers, AlertCircle } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useLang } from '../../context/LangContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const FEDAPAY_PUBLIC_KEY = import.meta.env.VITE_FEDAPAY_PUBLIC_KEY || '';

const equipmentsData = {
  1: {
    id: 1,
    name: 'Échographe GE Voluson E10',
    category: 'Imagerie Médicale',
    price: 45000,
    originalPrice: 55000,
    currency: 'EUR',
    rating: 4.8,
    reviews: 124,
    location: 'Cotonou, Bénin',
    condition: 'Neuf',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=500',
    images: [
      'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=500',
      'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800',
      'https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=800',
    ],
    seller: 'MediTech Solutions',
    year: 2022,
    description: 'Échographe portable en excellent état, peu utilisé. Idéal pour cabinet médical ou clinique.',
    features: ['Écran HD 15 pouces', 'Doppler couleur', 'Batterie longue durée', 'Connexion WiFi'],
    stock: 1,
  },
  2: {
    id: 2,
    name: 'Électrocardiographe 12 dérivations',
    category: 'Cardiologie',
    price: 2500,
    originalPrice: 3200,
    currency: 'EUR',
    rating: 4.5,
    reviews: 89,
    location: 'Paris, France',
    condition: 'Occasion',
    image: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=500',
    images: [
      'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=500',
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
    ],
    seller: 'CardioPlus',
    year: 2020,
    description: 'Électrocardiographe 12 dérivations en bon état de fonctionnement.',
    features: ['12 dérivations', 'Écran tactile', 'Impression intégrée', 'Mémoire 1000 ECG'],
    stock: 2,
  },
  3: {
    id: 3,
    name: 'Analyseur de sang automatique',
    category: 'Laboratoire',
    price: 15000,
    originalPrice: 18000,
    currency: 'USD',
    rating: 4.7,
    reviews: 56,
    location: "Abidjan, Côte d'Ivoire",
    condition: 'Reconditionné',
    image: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=500',
    images: ['https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=500'],
    seller: 'LabEquip Africa',
    year: 2019,
    description: 'Analyseur hématologique automatique reconditionné, testé et certifié.',
    features: ['22 paramètres', 'Résultats en 60s', 'Capacité 60 tests/h', 'Écran couleur'],
    stock: 1,
  },
  4: {
    id: 4,
    name: "Table d'opération électrique",
    category: 'Chirurgie',
    price: 8500,
    originalPrice: 11000,
    currency: 'EUR',
    rating: 4.9,
    reviews: 34,
    location: 'Dakar, Sénégal',
    condition: 'Neuf',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=500',
    images: ['https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=500'],
    seller: 'SurgicalPro',
    year: 2023,
    description: "Table d'opération électrique multifonction, idéale pour bloc opératoire.",
    features: ['4 sections', 'Télécommande', 'Charge max 300kg', 'Acier inox'],
    stock: 2,
  },
  5: {
    id: 5,
    name: 'Moniteur Patient 5 paramètres',
    category: 'Monitoring',
    price: 3200,
    originalPrice: 4500,
    currency: 'EUR',
    rating: 4.6,
    reviews: 78,
    location: 'Lomé, Togo',
    condition: 'Occasion',
    image: 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=500',
    images: ['https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=500'],
    seller: 'MonitorTech',
    year: 2021,
    description: 'Moniteur multiparamétrique 5 en 1 pour suivi continu des patients.',
    features: ['ECG', 'SpO2', 'NIBP', 'Température', 'Respiration'],
    stock: 3,
  },
  6: {
    id: 6,
    name: 'Défibrillateur automatique',
    category: 'Urgence',
    price: 1800,
    originalPrice: 2400,
    currency: 'USD',
    rating: 5.0,
    reviews: 45,
    location: 'Douala, Cameroun',
    condition: 'Neuf',
    image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=500',
    images: ['https://images.unsplash.com/photo-1584515933487-779824d29309?w=500'],
    seller: 'EmergencyMed',
    year: 2023,
    description: 'Défibrillateur automatique externe, simple et efficace pour les urgences.',
    features: ['Guidage vocal', 'Analyse automatique', 'Choc 360J', 'IP55'],
    stock: 5,
  },
  7: {
    id: 7,
    name: 'Lit médicalisé électrique 3 fonctions',
    category: 'Mobilier Médical',
    price: 1200,
    originalPrice: 1600,
    currency: 'EUR',
    rating: 4.4,
    reviews: 23,
    location: 'Niamey, Niger',
    condition: 'Occasion',
    image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=500',
    images: ['https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=500'],
    seller: 'HospitalFurniture',
    year: 2020,
    description: 'Lit médicalisé électrique 3 fonctions avec matelas inclus.',
    features: ['3 fonctions électriques', 'Barrières latérales', 'Roulettes frein', 'Matelas inclus'],
    stock: 4,
  },
  8: {
    id: 8,
    name: 'Autoclave stérilisateur 23L',
    category: 'Stérilisation',
    price: 950,
    originalPrice: 1200,
    currency: 'EUR',
    rating: 4.6,
    reviews: 67,
    location: 'Ouagadougou, Burkina Faso',
    condition: 'Reconditionné',
    image: 'https://images.unsplash.com/photo-1583911860205-72f8ac8ddcbe?w=500',
    images: ['https://images.unsplash.com/photo-1583911860205-72f8ac8ddcbe?w=500'],
    seller: 'SterileTech',
    year: 2019,
    description: 'Autoclave 23L reconditionné pour stérilisation de matériel médical.',
    features: ['23 litres', '134°C', 'Cycle rapide 20min', 'Affichage digital'],
    stock: 2,
  },
  9: {
    id: 9,
    name: 'Microscope binoculaire LED',
    category: 'Laboratoire',
    price: 3500,
    originalPrice: 4200,
    currency: 'EUR',
    rating: 4.7,
    reviews: 38,
    location: 'Cotonou, Bénin',
    condition: 'Neuf',
    image: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=500',
    images: ['https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=500'],
    seller: 'LabTech',
    year: 2023,
    description: 'Microscope binoculaire LED haute résolution pour laboratoire.',
    features: ['Grossissement 40-1000x', 'LED intégrée', 'Platine mécanique', 'Oculaires 10x'],
    stock: 3,
  },
  10: {
    id: 10,
    name: 'Respirateur artificiel portable',
    category: 'Urgence',
    price: 12000,
    originalPrice: 15000,
    currency: 'EUR',
    rating: 4.8,
    reviews: 29,
    location: 'Paris, France',
    condition: 'Occasion',
    image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=500',
    images: ['https://images.unsplash.com/photo-1584515933487-779824d29309?w=500'],
    seller: 'RespiCare',
    year: 2021,
    description: 'Respirateur portable pour transport et urgences, certifié CE.',
    features: ['Modes VCV/PCV', 'Batterie 6h', 'Alarmes multiples', 'Compact 4kg'],
    stock: 1,
  },
  11: {
    id: 11,
    name: 'Scanner IRM Siemens',
    category: 'Imagerie Médicale',
    price: 125000,
    originalPrice: 180000,
    currency: 'EUR',
    rating: 4.9,
    reviews: 15,
    location: "Abidjan, Côte d'Ivoire",
    condition: 'Reconditionné',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=500',
    images: ['https://images.unsplash.com/photo-1516549655169-df83a0774514?w=500'],
    seller: 'ImagingPro',
    year: 2018,
    description: 'Scanner IRM Siemens reconditionné, idéal pour hôpitaux et cliniques.',
    features: ['1.5 Tesla', 'Champ large', 'Logiciel dernière version', 'Installation incluse'],
    stock: 1,
  },
  12: {
    id: 12,
    name: 'Lampe scialytique opératoire',
    category: 'Chirurgie',
    price: 4500,
    originalPrice: 6000,
    currency: 'EUR',
    rating: 4.6,
    reviews: 42,
    location: 'Dakar, Sénégal',
    condition: 'Neuf',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=500',
    images: ['https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=500'],
    seller: 'SurgeryLight',
    year: 2023,
    description: 'Lampe scialytique LED pour bloc opératoire, sans ombre portée.',
    features: ['LED 120W', 'Sans ombre', 'Réglage couleur', 'Bras articulé'],
    stock: 3,
  },
};

const CartSidebar = ({ cartItems, onClose, onUpdateQuantity, onRemove }) => {
  const [step, setStep] = useState('cart');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [commandeRef, setCommandeRef] = useState('');

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handlePayment = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setError('Vous devez être connecté pour effectuer un paiement.');
      return;
    }
    if (cartItems.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const item = cartItems[0];

      // Étape 1 : créer la commande
      const commandeRes = await fetch(`${API_URL}/commandes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          annonce_id: item.id,       // UUID de l'annonce
          quantite: item.quantity,
        }),
      });

      const commandeData = await commandeRes.json();
      if (!commandeRes.ok) {
        throw new Error(commandeData.message || 'Erreur lors de la création de la commande');
      }

      const commandeId = commandeData.data.id;
      setCommandeRef(commandeId);

      // Étape 2 : initier le paiement → récupérer le token FedaPay
      const payRes = await fetch(`${API_URL}/commandes/${commandeId}/pay`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      const payData = await payRes.json();
      if (!payRes.ok) {
        throw new Error(payData.message || "Erreur lors de l'initiation du paiement");
      }

      const fedaToken = payData.data.token;

      // Étape 3 : ouvrir le modal FedaPay avec le token
      if (!window.FedaPay) {
        throw new Error('SDK FedaPay non chargé. Vérifiez votre connexion.');
      }

      setLoading(false);

      window.FedaPay.init({
        public_key: FEDAPAY_PUBLIC_KEY,
        transaction: {
          token: fedaToken,
        },
        onComplete: function (resp) {
          if (resp.reason === window.FedaPay.DIALOG_DISMISSED) {
            setError('Paiement annulé. Vous pouvez réessayer.');
          } else if (resp.transaction && resp.transaction.status === 'approved') {
            setStep('success');
          } else {
            setError('Le paiement a échoué. Veuillez réessayer.');
          }
        },
      }).open();

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className='fixed top-0 right-0 z-50 flex flex-col w-full h-full max-w-md bg-white shadow-2xl'
    >
      {/* Header sidebar */}
      <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50'>
        <div className='flex items-center gap-3'>
          {step === 'cart' && <ShoppingCart className='w-5 h-5 text-[#1DBF73]' />}
          {step === 'payment' && <Layers className='w-5 h-5 text-[#1DBF73]' />}
          {step === 'success' && <Check className='w-5 h-5 text-[#1DBF73]' />}
          <h2 className='text-base font-bold text-gray-900'>
            {step === 'cart' ? 'Mon Panier' : step === 'payment' ? 'Paiement sécurisé' : 'Commande confirmée'}
          </h2>
        </div>
        <button onClick={onClose} className='p-2 transition-colors rounded-full hover:bg-gray-200'>
          <X className='w-4 h-4 text-gray-500' />
        </button>
      </div>

      <div className='flex-1 p-6 overflow-y-auto'>
        {/* PANIER */}
        {step === 'cart' && (
          <>
            {cartItems.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-20 text-center'>
                <div className='flex items-center justify-center w-16 h-16 mb-4 bg-gray-100 rounded-2xl'>
                  <ShoppingCart className='w-8 h-8 text-gray-400' />
                </div>
                <p className='font-semibold text-gray-700'>Votre panier est vide</p>
                <p className='mt-1 text-sm text-gray-400'>Ajoutez des équipements pour commencer</p>
              </div>
            ) : (
              <div className='space-y-3'>
                {cartItems.map((item) => (
                  <div key={item.id} className='flex gap-4 p-4 border border-gray-100 bg-gray-50 rounded-2xl'>
                    <img src={item.image} alt={item.name} className='flex-shrink-0 object-cover w-20 h-20 rounded-xl' />
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-semibold leading-snug text-gray-900 line-clamp-2'>{item.name}</p>
                      <p className='text-[#1DBF73] font-bold mt-1 text-sm'>{item.price.toLocaleString()} {item.currency}</p>
                      <div className='flex items-center gap-2 mt-3'>
                        <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className='flex items-center justify-center transition-colors bg-white border border-gray-200 rounded-lg w-7 h-7 hover:bg-gray-100'>
                          <Minus className='w-3 h-3 text-gray-600' />
                        </button>
                        <span className='w-6 text-sm font-bold text-center'>{item.quantity}</span>
                        <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className='flex items-center justify-center transition-colors bg-white border border-gray-200 rounded-lg w-7 h-7 hover:bg-gray-100'>
                          <Plus className='w-3 h-3 text-gray-600' />
                        </button>
                        <button onClick={() => onRemove(item.id)}
                          className='ml-auto p-1.5 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors text-gray-400'>
                          <X className='w-4 h-4' />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* PAIEMENT */}
        {step === 'payment' && (
          <div className='space-y-4'>
            {/* Message info FedaPay */}
            <div className='p-4 bg-blue-50 border border-blue-100 rounded-2xl'>
              <p className='text-sm font-semibold text-blue-700 mb-1'>Paiement sécurisé via FedaPay</p>
              <p className='text-xs text-blue-500'>
                Vous serez redirigé vers le portail FedaPay pour choisir votre opérateur (MTN MoMo, Moov Money, Celtis Cash) et saisir votre numéro.
              </p>
            </div>

            {/* Affichage erreur */}
            {error && (
              <div className='flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl'>
                <AlertCircle className='w-5 h-5 text-red-500 flex-shrink-0 mt-0.5' />
                <p className='text-sm text-red-600'>{error}</p>
              </div>
            )}

            {/* Récapitulatif */}
            <div className='p-4 bg-gradient-to-br from-[#1DBF73]/5 to-[#09B1BA]/5 rounded-2xl border border-[#1DBF73]/15'>
              <p className='mb-3 text-sm font-semibold text-gray-700'>Récapitulatif de commande</p>
              {cartItems.map((item) => (
                <div key={item.id} className='flex justify-between mb-2 text-sm'>
                  <span className='mr-2 text-gray-600 truncate'>{item.name.slice(0, 22)}... ×{item.quantity}</span>
                  <span className='flex-shrink-0 font-semibold text-gray-800'>{(item.price * item.quantity).toLocaleString()} {item.currency}</span>
                </div>
              ))}
              <div className='flex justify-between font-bold mt-3 pt-3 border-t border-[#1DBF73]/20'>
                <span className='text-gray-900'>Total à payer</span>
                <span className='text-[#1DBF73] text-lg'>{total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* SUCCÈS */}
        {step === 'success' && (
          <div className='flex flex-col items-center justify-center py-12 text-center'>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15 }}
              className='w-24 h-24 bg-gradient-to-br from-[#1DBF73] to-[#09B1BA] rounded-full flex items-center justify-center mb-6 shadow-lg'>
              <Check className='w-12 h-12 text-white' strokeWidth={3} />
            </motion.div>
            <h3 className='mb-2 text-2xl font-bold text-gray-900'>Commande confirmée !</h3>
            <p className='mb-6 text-sm leading-relaxed text-gray-500'>
              Votre paiement a été traité avec succès.<br/>Vous recevrez une confirmation par email.
            </p>
            <div className='w-full p-4 text-left border border-gray-100 bg-gray-50 rounded-2xl'>
              <p className='mb-1 text-xs tracking-wider text-gray-400 uppercase'>Référence commande</p>
              <p className='text-[#1DBF73] font-bold text-lg tracking-wider'>#{commandeRef.slice(-9).toUpperCase()}</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer sidebar */}
      {cartItems.length > 0 && step !== 'success' && (
        <div className='px-6 py-4 bg-white border-t border-gray-100'>
          {step === 'cart' && (
            <>
              <div className='flex items-center justify-between mb-4'>
                <span className='text-sm text-gray-500'>Total</span>
                <span className='text-xl font-bold text-gray-900'>{total.toLocaleString()} <span className='text-sm font-normal text-gray-500'>EUR</span></span>
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setStep('payment')}
                className='w-full py-3.5 bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all'>
                Procéder au paiement
              </motion.button>
            </>
          )}
          {step === 'payment' && (
            <div className='flex gap-3'>
              <button onClick={() => { setStep('cart'); setError(null); }}
                className='flex-1 py-3.5 font-semibold text-gray-700 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-all'>
                Retour
              </button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handlePayment}
                disabled={loading}
                className='flex-2 px-8 py-3.5 bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white font-semibold rounded-2xl shadow-lg disabled:opacity-40 transition-all'>
                {loading ? (
                  <div className='flex items-center justify-center gap-2'>
                    <div className='w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin'></div>
                    Traitement...
                  </div>
                ) : 'Payer via FedaPay'}
              </motion.button>
            </div>
          )}
        </div>
      )}

      {step === 'success' && (
        <div className='px-6 py-4 border-t border-gray-100'>
          <button onClick={onClose}
            className='w-full py-3.5 bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white font-semibold rounded-2xl'>
            Fermer
          </button>
        </div>
      )}
    </motion.div>
  );
};

function Equipment() {
  const { id } = useParams();
  const { t } = useLang();
  const [selectedImage, setSelectedImage] = useState(0);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [liked, setLiked] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  // Données de l'équipement : depuis l'API ou fallback sur les données mock
  const [equipment, setEquipment] = useState(equipmentsData[parseInt(id)] || equipmentsData[1]);

  useEffect(() => {
    if (!id) return;
    fetch(`${API_URL}/annonces/${id}`, { headers: { 'Accept': 'application/json' } })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (!data) return;
        // Mapper les champs de l'API vers la structure attendue par l'UI
        const images = data.images?.length
          ? data.images.map(img => img.image_url).filter(Boolean)
          : [equipmentsData[1].image];

        setEquipment({
          id: data.id,                          // UUID annonce (utilisé comme annonce_id pour la commande)
          name: data.titre,
          category: data.categorie || '',
          price: parseFloat(data.prix_total || data.prix_vendeur || 0),
          currency: 'XOF',
          rating: data.note_moyenne || 0,
          reviews: data.avis?.length || 0,
          location: data.pays_expedition || '',
          condition: data.etat || '',
          image: images[0],
          images,
          seller: data.vendeur?.nom || '',
          description: data.description || '',
          features: [],
          stock: data.quantite || 0,
        });
      })
      .catch(() => {}); // Conserver les données mock en cas d'erreur réseau
  }, [id]);

  const addToCart = () => {
    const existing = cartItems.find(item => item.id === equipment.id);
    if (existing) {
      setCartItems(cartItems.map(item => item.id === equipment.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCartItems([...cartItems, { ...equipment, quantity: 1 }]);
    }
    setAddedToCart(true);
    setCartOpen(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      setCartItems(cartItems.filter(item => item.id !== id));
    } else {
      setCartItems(cartItems.map(item => item.id === id ? { ...item, quantity } : item));
    }
  };

  const removeFromCart = (id) => setCartItems(cartItems.filter(item => item.id !== id));
  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className='min-h-screen bg-gray-50'>
      <Header />

      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setCartOpen(false)} className='fixed inset-0 z-40 bg-black/40 backdrop-blur-sm' />
            <CartSidebar cartItems={cartItems} onClose={() => setCartOpen(false)}
              onUpdateQuantity={updateQuantity} onRemove={removeFromCart} />
          </>
        )}
      </AnimatePresence>

      {/* Bouton panier flottant */}
      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setCartOpen(true)}
        className='fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] rounded-2xl flex items-center justify-center shadow-xl z-30'>
        <ShoppingCart className='w-6 h-6 text-white' />
        {totalCartItems > 0 && (
          <span className='absolute flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full shadow-md -top-2 -right-2'>
            {totalCartItems}
          </span>
        )}
      </motion.button>

      {/* Contenu principal avec espacement top/bottom */}
      <div className='container max-w-6xl px-4 py-12 mx-auto'>
        <div className='grid grid-cols-1 gap-12 lg:grid-cols-2'>

          {/* Colonne images */}
          <div>
            <motion.div className='relative mb-4 overflow-hidden bg-white shadow-lg rounded-3xl' whileHover={{ scale: 1.005 }}>
              <img src={equipment.images[selectedImage]} alt={equipment.name} className='object-cover w-full h-96' />
              <button onClick={() => setLiked(!liked)}
                className='absolute flex items-center justify-center transition-transform bg-white shadow-lg w-11 h-11 rounded-2xl top-4 right-4 hover:scale-110'>
                <Heart className={`w-5 h-5 ${liked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
              </button>
              <div className='absolute bottom-4 left-4'>
                <span className='px-3 py-1.5 bg-white/90 backdrop-blur-sm text-xs font-semibold text-gray-700 rounded-xl shadow-sm'>
                  {equipment.condition}
                </span>
              </div>
            </motion.div>

            {equipment.images.length > 1 && (
              <div className='flex gap-3'>
                {equipment.images.map((img, index) => (
                  <button key={index} onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all hover:scale-105 ${
                      selectedImage === index ? 'border-[#1DBF73] shadow-md' : 'border-gray-200'
                    }`}>
                    <img src={img} alt='' className='object-cover w-full h-full' />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Colonne détails */}
          <div className='flex flex-col gap-6'>

            {/* Titre et catégorie */}
            <div>
              <span className='inline-block px-3 py-1 bg-[#09B1BA]/10 text-[#09B1BA] text-xs font-semibold rounded-full mb-3'>
                {equipment.category}
              </span>
              <h1 className='text-3xl font-bold leading-tight text-gray-900'>{equipment.name}</h1>

              <div className='flex items-center gap-5 mt-4'>
                <div className='flex items-center gap-1.5'>
                  <Star className='w-4 h-4 text-yellow-400 fill-yellow-400' />
                  <span className='font-bold text-gray-800'>{equipment.rating}</span>
                  <span className='text-sm text-gray-400'>({equipment.reviews} avis)</span>
                </div>
                <div className='flex items-center gap-1.5 text-sm text-gray-500'>
                  <MapPin className='w-4 h-4 text-[#1DBF73]' />
                  <span>{equipment.location}</span>
                </div>
              </div>
            </div>

            {/* Prix */}
            <div className='p-5 bg-gradient-to-br from-[#1DBF73]/5 to-[#09B1BA]/5 rounded-2xl border border-[#1DBF73]/15'>
              <div className='text-4xl font-bold text-[#1DBF73]'>
                {equipment.price.toLocaleString()}
                <span className='ml-2 text-lg font-semibold text-gray-500'>{equipment.currency}</span>
              </div>
              {equipment.originalPrice && (
                <p className='mt-1 text-sm text-gray-400 line-through'>
                  Prix original : {equipment.originalPrice.toLocaleString()} {equipment.currency}
                </p>
              )}
            </div>

            {/* Infos grille */}
            <div className='grid grid-cols-2 gap-3'>
              <div className='flex items-center gap-3 p-4 bg-white border border-gray-100 shadow-sm rounded-2xl'>
                <div className='w-9 h-9 bg-[#1DBF73]/10 rounded-xl flex items-center justify-center'>
                  <Package className='w-4 h-4 text-[#1DBF73]' />
                </div>
                <div>
                  <p className='text-xs text-gray-400'>État</p>
                  <p className='text-sm font-semibold text-gray-900'>{equipment.condition}</p>
                </div>
              </div>
              <div className='flex items-center gap-3 p-4 bg-white border border-gray-100 shadow-sm rounded-2xl'>
                <div className='w-9 h-9 bg-[#09B1BA]/10 rounded-xl flex items-center justify-center'>
                  <Calendar className='w-4 h-4 text-[#09B1BA]' />
                </div>
                <div>
                  <p className='text-xs text-gray-400'>Année</p>
                  <p className='text-sm font-semibold text-gray-900'>{equipment.year}</p>
                </div>
              </div>
              <div className='flex items-center gap-3 p-4 bg-white border border-gray-100 shadow-sm rounded-2xl'>
                <div className='flex items-center justify-center w-9 h-9 bg-purple-50 rounded-xl'>
                  <User className='w-4 h-4 text-purple-400' />
                </div>
                <div>
                  <p className='text-xs text-gray-400'>Vendeur</p>
                  <p className='text-sm font-semibold text-gray-900'>{equipment.seller}</p>
                </div>
              </div>
              <div className='flex items-center gap-3 p-4 bg-white border border-gray-100 shadow-sm rounded-2xl'>
                <div className='flex items-center justify-center w-9 h-9 bg-orange-50 rounded-xl'>
                  <Layers className='w-4 h-4 text-orange-400' />
                </div>
                <div>
                  <p className='text-xs text-gray-400'>Stock</p>
                  <p className='text-sm font-semibold text-gray-900'>{equipment.stock} disponible(s)</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className='text-sm leading-relaxed text-gray-600'>{equipment.description}</p>

            {/* Caractéristiques */}
            <div>
              <p className='mb-3 text-sm font-semibold tracking-wide text-gray-900 uppercase'>Caractéristiques</p>
              <div className='flex flex-wrap gap-2'>
                {equipment.features.map((feature, index) => (
                  <span key={index} className='px-3 py-1.5 bg-white border border-[#1DBF73]/30 text-[#1DBF73] text-xs rounded-xl font-medium shadow-sm'>
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            {/* Boutons actions */}
            <div className='flex gap-3 pt-2'>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={addToCart}
                className='flex-1 py-4 bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2'>
                <ShoppingCart className='w-5 h-5' />
                {addedToCart ? 'Ajouté au panier !' : 'Ajouter au panier'}
              </motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className='px-6 py-4 border-2 border-[#1DBF73] text-[#1DBF73] font-semibold rounded-2xl hover:bg-[#1DBF73]/5 transition-all flex items-center gap-2'>
                <Phone className='w-5 h-5' />
                Contacter
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Equipment;