import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email requis');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email invalide');
      return;
    }

    setLoading(true);
    setError('');
    
    // Simulation d'envoi d'email
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      // TODO: Remplacer par vraie API Laravel
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
        {/* Back to Login */}
        {!success && (
          <Link to='/login' className='inline-flex items-center gap-2 mb-6 text-gray-600 hover:text-[#1DBF73] transition-colors'>
            <ArrowLeft className='w-5 h-5' />
            <span className='font-medium'>Retour à la connexion</span>
          </Link>
        )}

        {/* Logo */}
        <div className='mb-8 text-center'>
          <Link to='/' className='inline-flex items-center gap-2'>
            <div className='w-12 h-12 bg-gradient-to-br from-[#1DBF73] to-[#09B1BA] rounded-xl flex items-center justify-center'>
              <span className='text-2xl font-bold text-white'>D</span>
            </div>
            <span className='text-3xl font-bold bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] bg-clip-text text-transparent'>
              DocSpace
            </span>
          </Link>
        </div>

        {/* Form Card */}
        <div className='p-8 bg-white border border-gray-100 shadow-xl rounded-2xl'>
          {!success ? (
            <>
              {/* Header */}
              <div className='mb-8 text-center'>
                <div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#1DBF73] to-[#09B1BA] rounded-2xl mb-4 shadow-lg'>
                  <Mail className='w-8 h-8 text-white' />
                </div>
                <h2 className='mb-2 text-2xl font-bold text-gray-900'>
                  Mot de passe oublié ?
                </h2>
                <p className='text-gray-600'>
                  Entrez votre email pour recevoir un lien de réinitialisation
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className='p-4 mb-5 border-l-4 border-red-500 rounded-lg bg-red-50'
                >
                  <p className='text-sm font-medium text-red-700'>{error}</p>
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <div className='mb-6'>
                  <label className='block mb-2 text-sm font-semibold text-gray-700'>
                    Adresse email
                  </label>
                  <div className='relative'>
                    <Mail className='absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#1DBF73]' />
                    <input
                      type='email'
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                      }}
                      placeholder='exemple@email.com'
                      className='w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 transition-all'
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
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
                      Envoi en cours...
                    </div>
                  ) : 'Envoyer le lien de réinitialisation'}
                </motion.button>
              </form>

              {/* Back to Login */}
              <div className='pt-6 mt-6 text-center border-t border-gray-200'>
                <Link
                  to='/login'
                  className='inline-flex items-center gap-2 text-sm font-medium text-[#1DBF73] hover:text-[#09B1BA] transition-colors'
                >
                  <ArrowLeft className='w-4 h-4' />
                  Retour à la connexion
                </Link>
              </div>
            </>
          ) : (
            /* Success State */
            <motion.div 
              className='py-6 text-center'
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className='inline-flex items-center justify-center w-20 h-20 mb-6 bg-green-100 rounded-2xl'>
                <CheckCircle className='w-10 h-10 text-green-500' />
              </div>
              
              <h2 className='mb-3 text-2xl font-bold text-gray-900'>
                Email envoyé avec succès !
              </h2>
              
              <p className='mb-2 leading-relaxed text-gray-600'>
                Un lien de réinitialisation a été envoyé à
              </p>
              
              <p className='text-lg font-semibold text-[#1DBF73] mb-6'>
                {email}
              </p>
              
              <div className='bg-[#1DBF73]/10 border border-[#1DBF73]/20 rounded-xl p-4 mb-6'>
                <p className='text-sm text-gray-700'>
                  💡 <span className='font-medium'>Conseil :</span> Vérifiez également votre dossier spam si vous ne trouvez pas l'email.
                </p>
              </div>

              <Link to='/login'>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className='w-full py-3 bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all'
                >
                  Retour à la connexion
                </motion.button>
              </Link>
            </motion.div>
          )}
        </div>

        {/* Help Text */}
        {!success && (
          <p className='mt-6 text-xs text-center text-gray-500'>
            Vous n'avez pas reçu l'email ?{' '}
            <button 
              onClick={handleSubmit}
              className='text-[#1DBF73] hover:text-[#09B1BA] font-medium transition-colors'
            >
              Renvoyer
            </button>
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;