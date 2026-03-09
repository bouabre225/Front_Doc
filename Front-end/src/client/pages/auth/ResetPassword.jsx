import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { resetPassword } from '../../../services/api';

const ResetPassword = () => {
  const navigate       = useNavigate();
  const [params]       = useSearchParams();
  const token          = params.get('token') || '';
  const email          = params.get('email') || '';

  const [form,         setForm]         = useState({ password: '', password_confirmation: '' });
  const [showPass,     setShowPass]     = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const [success,      setSuccess]      = useState(false);

  useEffect(() => {
    if (!token || !email) navigate('/forgot-password');
  }, [token, email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères'); return;
    }
    if (form.password !== form.password_confirmation) {
      setError('Les mots de passe ne correspondent pas'); return;
    }

    setLoading(true);
    try {
      await resetPassword({
        token,
        email,
        password:              form.password,
        password_confirmation: form.password_confirmation,
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.message || 'Erreur lors de la réinitialisation');
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
      >
        <div className='mb-8 text-center'>
          <Link to='/'>
            <img src='/images/docspace.png' alt='DocSpace' className='object-contain w-auto h-20 mix-blend-multiply mx-auto' />
          </Link>
        </div>

        <div className='p-8 bg-white border border-gray-100 shadow-xl rounded-2xl'>
          {!success ? (
            <>
              <div className='mb-8 text-center'>
                <div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#1DBF73] to-[#09B1BA] rounded-2xl mb-4 shadow-lg'>
                  <Lock className='w-8 h-8 text-white' />
                </div>
                <h2 className='mb-2 text-2xl font-bold text-gray-900'>Nouveau mot de passe</h2>
                <p className='text-sm text-gray-500'>Choisissez un mot de passe sécurisé</p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className='flex items-center gap-2 p-3 mb-5 border-l-4 border-red-500 rounded-lg bg-red-50 text-sm text-red-700'
                >
                  <AlertCircle className='w-4 h-4 shrink-0' />
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className='space-y-5'>
                {/* Nouveau mot de passe */}
                <div>
                  <label className='block mb-2 text-sm font-semibold text-gray-700'>
                    Nouveau mot de passe
                  </label>
                  <div className='relative'>
                    <Lock className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1DBF73]' />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={form.password}
                      onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                      placeholder='Minimum 8 caractères'
                      className='w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 transition-all'
                    />
                    <button type='button' onClick={() => setShowPass(!showPass)}
                      className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'>
                      {showPass ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                    </button>
                  </div>

                  {/* Indicateur force */}
                  {form.password && (
                    <div className='mt-2 flex gap-1'>
                      {[1,2,3,4].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                          form.password.length >= i * 3
                            ? i <= 1 ? 'bg-red-400'
                            : i <= 2 ? 'bg-orange-400'
                            : i <= 3 ? 'bg-yellow-400'
                            : 'bg-green-500'
                            : 'bg-gray-200'
                        }`} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Confirmation */}
                <div>
                  <label className='block mb-2 text-sm font-semibold text-gray-700'>
                    Confirmer le mot de passe
                  </label>
                  <div className='relative'>
                    <Lock className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1DBF73]' />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={form.password_confirmation}
                      onChange={e => setForm(p => ({ ...p, password_confirmation: e.target.value }))}
                      placeholder='Répétez le mot de passe'
                      className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${
                        form.password_confirmation && form.password !== form.password_confirmation
                          ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                          : 'border-gray-200 focus:border-[#1DBF73] focus:ring-[#1DBF73]/20'
                      }`}
                    />
                    <button type='button' onClick={() => setShowConfirm(!showConfirm)}
                      className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'>
                      {showConfirm ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                    </button>
                  </div>
                  {form.password_confirmation && form.password !== form.password_confirmation && (
                    <p className='text-xs text-red-500 mt-1'>Les mots de passe ne correspondent pas</p>
                  )}
                </div>

                <motion.button
                  type='submit'
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className='w-full py-3 bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50'
                >
                  {loading ? (
                    <span className='flex items-center justify-center gap-2'>
                      <span className='w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin' />
                      Réinitialisation...
                    </span>
                  ) : 'Réinitialiser mon mot de passe'}
                </motion.button>
              </form>
            </>
          ) : (
            <motion.div
              className='py-6 text-center'
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className='inline-flex items-center justify-center w-20 h-20 mb-6 bg-green-100 rounded-2xl'>
                <CheckCircle className='w-10 h-10 text-green-500' />
              </div>
              <h2 className='mb-3 text-2xl font-bold text-gray-900'>Mot de passe mis à jour !</h2>
              <p className='text-sm text-gray-500 mb-6'>
                Redirection vers la connexion dans quelques secondes...
              </p>
              <div className='w-8 h-8 border-4 border-[#1DBF73] rounded-full border-t-transparent animate-spin mx-auto' />
            </motion.div>
          )}
        </div>

        <div className='mt-5 text-center'>
          <Link to='/login' className='inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#1DBF73] transition-colors'>
            <ArrowLeft className='w-4 h-4' />
            Retour à la connexion
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;