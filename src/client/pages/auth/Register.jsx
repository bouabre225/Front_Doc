import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, UserCircle, Briefcase, Phone, ArrowLeft, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLang } from '../../context/LangContext';

const Register = () => {
  const { t } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  
  const searchParams = new URLSearchParams(location.search);
  const initialUserType = searchParams.get('type') === 'seller' ? 'seller' : 'buyer';
  
  const [userType, setUserType] = useState(initialUserType);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    specialty: '',
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
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem('user', JSON.stringify({ 
        ...formData, 
        role: userType 
      }));
      setLoading(false);
      if (userType === 'seller') {
        navigate('/seller/publish');
      } else {
        navigate('/');
      }
    }, 1500);
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
          <h1 className='mb-2 text-3xl font-bold text-gray-900'>
            Créer un compte
          </h1>
          <p className='text-gray-600'>
            Commencez avec DocSpace
          </p>
        </div>

        <div className='p-8 bg-white border border-gray-100 shadow-xl rounded-2xl'>
          <div className='flex gap-3 p-2 mb-6 bg-gray-100 rounded-xl'>
            <button
              type='button'
              onClick={() => setUserType('buyer')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-all ${
                userType === 'buyer'
                  ? 'bg-white text-[#1DBF73] shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <UserCircle className='w-5 h-5' />
              Acheteur
            </button>
            <button
              type='button'
              onClick={() => setUserType('seller')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-all ${
                userType === 'seller'
                  ? 'bg-white text-[#09B1BA] shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Briefcase className='w-5 h-5' />
              Vendeur
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className='mb-4'>
              <label className='block mb-2 text-sm font-semibold text-gray-700'>
                Nom complet
              </label>
              <div className='relative'>
                <User className='absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#1DBF73]' />
                <input
                  type='text'
                  name='name'
                  value={formData.name}
                  onChange={handleChange}
                  placeholder='Nom et prénoms'
                  className='w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 transition-all'
                  required
                />
              </div>
            </div>

            <div className='mb-4'>
              <label className='block mb-2 text-sm font-semibold text-gray-700'>
                Adresse email
              </label>
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

            {/* ✅ Téléphone pour acheteur ET vendeur */}
            <div className='mb-4'>
              <label className='block mb-2 text-sm font-semibold text-gray-700'>
                Téléphone
              </label>
              <div className='relative'>
                <Phone className='absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#1DBF73]' />
                <input
                  type='tel'
                  name='phone'
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder='+229 XX XX XX XX'
                  className='w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 transition-all'
                  required
                />
              </div>
            </div>

            {userType === 'seller' && (
              <div className='mb-4'>
                <label className='block mb-2 text-sm font-semibold text-gray-700'>
                  Spécialité
                </label>
                <div className='relative'>
                  <Briefcase className='absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#1DBF73]' />
                  <select
                    name='specialty'
                    value={formData.specialty}
                    onChange={handleChange}
                    className='w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 transition-all'
                    required
                  >
                    <option value=''>Choisir une spécialité</option>
                    <option value='imagerie'>Imagerie Médicale</option>
                    <option value='cardiologie'>Cardiologie</option>
                    <option value='laboratoire'>Laboratoire</option>
                    <option value='chirurgie'>Chirurgie</option>
                    <option value='monitoring'>Monitoring</option>
                    <option value='autre'>Autre</option>
                  </select>
                </div>
              </div>
            )}

            <div className='mb-5'>
              <label className='block mb-2 text-sm font-semibold text-gray-700'>
                Mot de passe
              </label>
              <div className='relative'>
                <Lock className='absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#1DBF73]' />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name='password'
                  value={formData.password}
                  onChange={handleChange}
                  placeholder='••••••••'
                  className='w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 transition-all'
                  required
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
              <Link 
                to='/login' 
                className='font-semibold text-[#1DBF73] hover:text-[#09B1BA] transition-colors'
              >
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