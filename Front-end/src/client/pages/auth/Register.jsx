import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Briefcase, Phone, ArrowLeft, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLang } from '../../context/LangContext';
import { registerBuyer, registerSeller } from '../../../services/api';

const Register = () => {
  const { t } = useLang();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const initialUserType = searchParams.get('type') === 'seller' ? 'seller' : 'buyer';

  const [userType, setUserType] = useState(initialUserType);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    mot_de_passe: '',
    telephone: '',
    pays: '',
    type_compte: 'particulier',
    acceptTerms: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.acceptTerms) {
      setError("Veuillez accepter les conditions d'utilisation.");
      return;
    }
    setLoading(true);
    setError('');

    try {
      const payload = {
        nom: formData.nom,
        email: formData.email,
        mot_de_passe: formData.mot_de_passe,
        telephone: formData.telephone,
        pays: formData.pays || undefined,
        ...(userType === 'seller' ? { type_compte: formData.type_compte } : {}),
      };

      const data = userType === 'seller'
        ? await registerSeller(payload)
        : await registerBuyer(payload);

      // Sauvegarder token + user
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.dispatchEvent(new Event('storage'));

      if (userType === 'seller') {
        navigate('/seller/publish');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Une erreur est survenue lors de l\'inscription.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-[#1DBF73]/10 via-white to-[#09B1BA]/10'>
      <motion.div
        className='w-full max-w-md'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link to='/' className='inline-flex items-center gap-2 mb-6 text-gray-600 hover:text-[#1DBF73] transition-colors'>
          <ArrowLeft className='w-5 h-5' />
          <span className='font-medium'>Retour à l'accueil</span>
        </Link>

        <div className='mb-8 text-center'>
          <Link to='/' className='inline-flex items-center justify-center'>
            <img
              src='/images/docspace.png'
              alt='DocSpace Logo'
              className='object-contain w-auto h-20 mix-blend-multiply'
            />
          </Link>
        </div>

        <div className='mb-6 text-center'>
          <span className='inline-flex items-center gap-2 px-4 py-2 bg-[#09B1BA]/10 border border-[#09B1BA]/20 rounded-full text-sm font-medium text-[#09B1BA]'>
            <span className='w-2 h-2 bg-[#09B1BA] rounded-full animate-pulse'></span>
            Rejoignez notre communauté
          </span>
        </div>

        <div className='mb-8 text-center'>
          <h1 className='mb-2 text-3xl font-bold text-gray-900'>Créer un compte</h1>
          <p className='text-gray-600'>Commencez avec DocSpace</p>
        </div>

        <div className='p-8 bg-white border border-gray-100 shadow-xl rounded-2xl'>
          {/* Sélecteur acheteur / vendeur */}
          <div className='flex gap-3 p-2 mb-6 bg-gray-100 rounded-xl'>
            <button
              type='button'
              onClick={() => setUserType('buyer')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-all ${
                userType === 'buyer' ? 'bg-white text-[#1DBF73] shadow-md' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <User className='w-4 h-4' />
              Acheteur
            </button>
            <button
              type='button'
              onClick={() => setUserType('seller')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-all ${
                userType === 'seller' ? 'bg-white text-[#09B1BA] shadow-md' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Briefcase className='w-4 h-4' />
              Vendeur
            </button>
          </div>

          {/* Erreur */}
          {error && (
            <div className='flex items-center gap-2 p-3 mb-5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl'>
              <AlertCircle className='w-4 h-4 shrink-0' />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Nom */}
            <div className='mb-4'>
              <label className='block mb-2 text-sm font-semibold text-gray-700'>Nom complet</label>
              <div className='relative'>
                <User className='absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#1DBF73]' />
                <input
                  type='text'
                  name='nom'
                  value={formData.nom}
                  onChange={handleChange}
                  placeholder='Votre nom complet'
                  className='w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 transition-all'
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className='mb-4'>
              <label className='block mb-2 text-sm font-semibold text-gray-700'>Adresse email</label>
              <div className='relative'>
                <Mail className='absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#1DBF73]' />
                <input
                  type='email'
                  name='email'
                  value={formData.email}
                  onChange={handleChange}
                  placeholder='exemple@email.com'
                  className='w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 transition-all'
                  required
                />
              </div>
            </div>

            {/* Téléphone */}
            <div className='mb-4'>
              <label className='block mb-2 text-sm font-semibold text-gray-700'>
                Téléphone {userType === 'buyer' && <span className='text-gray-400 font-normal'>(optionnel)</span>}
              </label>
              <div className='relative'>
                <Phone className='absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#1DBF73]' />
                <input
                  type='tel'
                  name='telephone'
                  value={formData.telephone}
                  onChange={handleChange}
                  placeholder='+229 XX XX XX XX'
                  className='w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 transition-all'
                  required={userType === 'seller'}
                />
              </div>
            </div>

            {/* Type de compte (vendeur seulement) */}
            {userType === 'seller' && (
              <div className='mb-4'>
                <label className='block mb-2 text-sm font-semibold text-gray-700'>Type de compte</label>
                <div className='relative'>
                  <Briefcase className='absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#1DBF73]' />
                  <select
                    name='type_compte'
                    value={formData.type_compte}
                    onChange={handleChange}
                    className='w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 transition-all'
                  >
                    <option value='particulier'>Particulier</option>
                    <option value='professionnel'>Professionnel</option>
                  </select>
                </div>
              </div>
            )}

            {/* Mot de passe */}
            <div className='mb-5'>
              <label className='block mb-2 text-sm font-semibold text-gray-700'>Mot de passe</label>
              <div className='relative'>
                <Lock className='absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#1DBF73]' />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name='mot_de_passe'
                  value={formData.mot_de_passe}
                  onChange={handleChange}
                  placeholder='••••••••'
                  className='w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 transition-all'
                  required
                  minLength={6}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#1DBF73] transition-colors'
                >
                  {showPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                </button>
              </div>
            </div>

            {/* CGU */}
            <div className='mb-5'>
              <label className='flex items-start gap-3 cursor-pointer'>
                <input
                  type='checkbox'
                  name='acceptTerms'
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  className='mt-1 w-4 h-4 accent-[#1DBF73]'
                />
                <span className='text-sm text-gray-600'>
                  J'accepte les{' '}
                  <Link to='/terms' className='text-[#1DBF73] hover:underline font-medium'>conditions d'utilisation</Link>
                  {' '}et la{' '}
                  <Link to='/privacy' className='text-[#1DBF73] hover:underline font-medium'>politique de confidentialité</Link>
                </span>
              </label>
            </div>

            {/* Submit */}
            <motion.button
              type='submit'
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className='w-full py-3 bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50'
            >
              {loading ? (
                <div className='flex items-center justify-center gap-2'>
                  <div className='w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin'></div>
                  Création...
                </div>
              ) : (
                userType === 'buyer' ? 'Créer mon compte acheteur' : 'Créer mon compte vendeur'
              )}
            </motion.button>
          </form>

          <div className='pt-6 mt-6 text-center border-t border-gray-200'>
            <p className='text-gray-600'>
              Déjà un compte ?{' '}
              <Link to='/login' className='font-semibold text-[#1DBF73] hover:text-[#09B1BA] transition-colors'>
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
