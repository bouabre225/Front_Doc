import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { forgotPassword } from '../../../services/api';

const ForgotPassword = () => {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!email.trim())              { setError('Email requis'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Email invalide'); return; }

    setLoading(true);
    setError('');
    try {
      await forgotPassword(email.trim());
      setSuccess(true);
    } catch (err) {
      // L'API Laravel retourne 200 même si l'email n'existe pas (sécurité)
      // On affiche toujours le succès sauf erreur réseau
      if (err.message?.toLowerCase().includes('réseau') || err.message?.includes('fetch')) {
        setError('Erreur réseau. Vérifiez votre connexion.');
      } else {
        // Par sécurité on affiche quand même le succès
        setSuccess(true);
      }
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
        {!success && (
          <Link to='/login' className='inline-flex items-center gap-2 mb-6 text-gray-600 hover:text-[#1DBF73] transition-colors'>
            <ArrowLeft className='w-5 h-5' />
            <span className='font-medium'>Retour à la connexion</span>
          </Link>
        )}

        {/* Logo */}
        <div className='mb-8 text-center'>
          <Link to='/'>
            <img src='/images/docspace.png' alt='DocSpace' className='object-contain w-auto h-20 mix-blend-multiply mx-auto' />
          </Link>
        </div>

        <div className='p-8 bg-white border border-gray-100 shadow-xl rounded-2xl'>
          {!success ? (
            <>
              {/* Header */}
              <div className='mb-8 text-center'>
                <div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#1DBF73] to-[#09B1BA] rounded-2xl mb-4 shadow-lg'>
                  <Mail className='w-8 h-8 text-white' />
                </div>
                <h2 className='mb-2 text-2xl font-bold text-gray-900'>Mot de passe oublié ?</h2>
                <p className='text-sm text-gray-500'>Entrez votre email pour recevoir un lien de réinitialisation</p>
              </div>

              {/* Erreur */}
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

              {/* Formulaire */}
              <form onSubmit={handleSubmit}>
                <div className='mb-6'>
                  <label className='block mb-2 text-sm font-semibold text-gray-700'>
                    Adresse email
                  </label>
                  <div className='relative'>
                    <Mail className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1DBF73]' />
                    <input
                      type='email'
                      value={email}
                      onChange={e => { setEmail(e.target.value); setError(''); }}
                      placeholder='exemple@email.com'
                      className='w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 transition-all'
                      autoComplete='email'
                      autoFocus
                    />
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
                    <span className='flex items-center justify-center gap-2'>
                      <span className='w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin' />
                      Envoi en cours...
                    </span>
                  ) : (
                    'Envoyer le lien de réinitialisation'
                  )}
                </motion.button>
              </form>

              <div className='pt-6 mt-6 text-center border-t border-gray-200'>
                <Link to='/login' className='inline-flex items-center gap-2 text-sm font-medium text-[#1DBF73] hover:text-[#09B1BA] transition-colors'>
                  <ArrowLeft className='w-4 h-4' />
                  Retour à la connexion
                </Link>
              </div>
            </>
          ) : (
            /* ── Succès ── */
            <motion.div
              className='py-6 text-center'
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className='inline-flex items-center justify-center w-20 h-20 mb-6 bg-green-100 rounded-2xl'>
                <CheckCircle className='w-10 h-10 text-green-500' />
              </div>
              <h2 className='mb-3 text-2xl font-bold text-gray-900'>Email envoyé !</h2>
              <p className='mb-1 text-sm text-gray-500'>Un lien de réinitialisation a été envoyé à</p>
              <p className='text-base font-semibold text-[#1DBF73] mb-6'>{email}</p>

              <div className='bg-[#1DBF73]/10 border border-[#1DBF73]/20 rounded-xl p-4 mb-6 text-left'>
                <p className='text-sm text-gray-700'>
                  💡 <span className='font-medium'>Conseil :</span> Vérifiez également votre dossier spam. Le lien expire dans <span className='font-semibold'>60 minutes</span>.
                </p>
              </div>

              {/* Renvoyer */}
              <button
                onClick={() => { setSuccess(false); }}
                className='w-full py-2.5 mb-3 text-sm font-semibold text-[#1DBF73] border-2 border-[#1DBF73]/30 rounded-xl hover:bg-[#1DBF73]/5 transition-all'
              >
                Renvoyer un lien
              </button>

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

        {/* Renvoyer (hors card) */}
        {!success && (
          <p className='mt-5 text-xs text-center text-gray-500'>
            Vous n'avez pas reçu l'email ?{' '}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className='text-[#1DBF73] hover:text-[#09B1BA] font-medium transition-colors disabled:opacity-50'
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