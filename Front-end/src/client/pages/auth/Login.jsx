import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLang } from '../../context/LangContext';
import { loginUser } from '../../../services/api';

const Login = () => {
  const { t } = useLang();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [motDePasse, setmotDePasse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await loginUser(email, motDePasse);

      // Cas 2FA requis
      if (data.requires_2fa) {
        localStorage.setItem('2fa_challenge_id', data.challenge_id);
        navigate('/login/2fa');
        return;
      }

      // Connexion normale : sauvegarder token + user
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.dispatchEvent(new Event('storage'));

      if (data.user?.role === 'admin') {
        navigate('/admin');
      } else if (data.user?.role === 'vendeur') {
        navigate('/profile');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Email ou mot de passe incorrect.');
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
          <Link to='/'>
            <img src='/images/docspace.png' alt='DocSpace Logo' className='object-contain w-auto h-20 mx-auto mix-blend-multiply' />
          </Link>
        </div>

        <div className='mb-6 text-center'>
          <span className='inline-flex items-center gap-2 px-4 py-2 bg-[#1DBF73]/10 border border-[#1DBF73]/20 rounded-full text-sm font-medium text-[#1DBF73]'>
            <span className='w-2 h-2 bg-[#1DBF73] rounded-full animate-pulse'></span>
            Plateforme N°1 d'équipements médicaux
          </span>
        </div>

        <div className='mb-8 text-center'>
          <h1 className='mb-2 text-3xl font-bold text-gray-900'>Bon retour !</h1>
          <p className='text-gray-600'>Connectez-vous à votre compte</p>
        </div>

        <div className='p-8 bg-white border border-gray-100 shadow-xl rounded-2xl'>
          {error && (
            <div className='flex items-center gap-2 p-3 mb-5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl'>
              <AlertCircle className='w-4 h-4 shrink-0' />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className='mb-5'>
              <label className='block mb-2 text-sm font-semibold text-gray-700'>Adresse email</label>
              <div className='relative'>
                <Mail className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1DBF73]' />
                <input
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder='exemple@email.com'
                  className='w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 transition-all'
                  required
                />
              </div>
            </div>

            <div className='mb-6'>
              <div className='flex items-center justify-between mb-2'>
                <label className='text-sm font-semibold text-gray-700'>Mot de passe</label>
                <Link to='/forgot-password' className='text-sm font-medium text-[#1DBF73] hover:text-[#09B1BA] transition-colors'>
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className='relative'>
                <Lock className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1DBF73]' />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={motDePasse}
                  onChange={(e) => setmotDePasse(e.target.value)} // ← corrigé
                  placeholder='••••••••'
                  className='w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 transition-all'
                  required
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1DBF73] transition-colors'
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
                  Connexion...
                </div>
              ) : 'Se connecter'}
            </motion.button>
          </form>

          <div className='flex items-center gap-4 my-6'>
            <div className='flex-1 h-px bg-gray-200'></div>
            <span className='text-sm text-gray-500'>OU</span>
            <div className='flex-1 h-px bg-gray-200'></div>
          </div>

          <div className='text-center'>
            <p className='text-gray-600'>
              Pas encore de compte ?{' '}
              <Link to='/register' className='font-semibold text-[#1DBF73] hover:text-[#09B1BA] transition-colors'>
                Créer un compte
              </Link>
            </p>
          </div>
        </div>

        <p className='mt-6 text-xs text-center text-gray-500'>
          En vous connectant, vous acceptez nos{' '}
          <Link to='/terms' className='text-[#1DBF73] hover:underline'>conditions d'utilisation</Link>
          {' '}et notre{' '}
          <Link to='/privacy' className='text-[#1DBF73] hover:underline'>politique de confidentialité</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
