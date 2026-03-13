import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, Shield, Stethoscope, KeyRound, ArrowLeft } from 'lucide-react';
import { loginAdmin, login2fa } from '../../services/api';

// ─── Étape 1 : Formulaire email/password ─────────────────────────────────────

const StepLogin = ({ onSuccess, loading, setLoading, error, setError }) => {
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginAdmin(email, password);
      //console.log('RES loginAdmin:', res); // ← ajoute ça temporairement
      if (res.requires_2fa && res.challenge_id) {
        onSuccess(String(res.challenge_id)); // ← forcer string ici aussi
      } else {
        setError('Réponse inattendue du serveur.');
      }
    } catch (err) {
      setError(err.message || 'Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      key='login'
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      {error && (
        <div className='p-3 mb-4 text-sm text-red-600 border border-red-200 bg-red-50 rounded-xl'>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label className='block mb-2 text-sm font-semibold text-gray-700'>
            Adresse email
          </label>
          <div className='relative'>
            <Mail className='absolute w-5 h-5 text-[#1DBF73] transform -translate-y-1/2 left-3 top-1/2' />
            <input
              type='email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder='admin@docspace.com'
              required
              disabled={loading}
              className='w-full py-3 pr-4 text-sm text-gray-800 bg-gray-50 border-2 border-gray-200 rounded-xl pl-11 focus:outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 transition-all disabled:opacity-50'
            />
          </div>
        </div>

        <div>
          <label className='block mb-2 text-sm font-semibold text-gray-700'>
            Mot de passe
          </label>
          <div className='relative'>
            <Lock className='absolute w-5 h-5 text-[#1DBF73] transform -translate-y-1/2 left-3 top-1/2' />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder='••••••••'
              required
              disabled={loading}
              className='w-full py-3 pr-12 text-sm text-gray-800 bg-gray-50 border-2 border-gray-200 rounded-xl pl-11 focus:outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 transition-all disabled:opacity-50'
            />
            <button
              type='button'
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
              className='absolute transform -translate-y-1/2 right-3 top-1/2 text-[#09B1BA] hover:text-[#1DBF73] transition-colors'
            >
              {showPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
            </button>
          </div>
        </div>

        <button
          type='submit'
          disabled={loading}
          className='w-full py-3.5 text-sm font-bold text-white rounded-xl bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all'
        >
          {loading ? (
            <span className='flex items-center justify-center gap-2'>
              <span className='w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin' />
              Connexion en cours...
            </span>
          ) : (
            <span className='flex items-center justify-center gap-2'>
              <Shield className='w-5 h-5' />
              Se connecter
            </span>
          )}
        </button>
      </form>
    </motion.div>
  );
};

// ─── Étape 2 : Code 2FA ───────────────────────────────────────────────────────

const Step2FA = ({ challengeId, onBack, loading, setLoading, error, setError }) => {
  const navigate   = useNavigate();
  const [codes, setCodes] = useState(['', '', '', '', '', '']);
  const inputsRef  = useRef([]);

  const handleChange = (idx, val) => {
    const v = val.replace(/\D/, '').slice(0, 1);
    const next = [...codes];
    next[idx] = v;
    setCodes(next);
    if (v && idx < 5) inputsRef.current[idx + 1]?.focus();
    // Auto-submit quand tous les champs sont remplis
    if (next.every(c => c !== '') && v) {
      handleVerify(next.join(''));
    }
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !codes[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const next = pasted.split('');
      setCodes(next);
      inputsRef.current[5]?.focus();
      handleVerify(pasted);
    }
  };

  const handleVerify = async (code) => {
    //console.log('challenge_id:', challengeId, typeof challengeId);
    //console.log('code:', code, typeof code);
    setError('');
    setLoading(true);
    try {
      const res = await login2fa({
        challenge_id: String(challengeId),
        code:         String(code),
      });
      //console.log('RES 2fa:', res); // ← ajoute ça
      if (res.success && res.token && res.user) {
        localStorage.setItem('auth_token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        window.dispatchEvent(new Event('storage'));
        //console.log('Redirect vers /admin/dashboard'); // ← et ça
        // ← attendre que le storage soit propagé
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 100);
      } else {
        //console.log('Condition non remplie:', res); // ← et ça
        setError('Code invalide. Vérifiez votre application 2FA.');
        setCodes(['', '', '', '', '', '']);
        inputsRef.current[0]?.focus();
      }
    } catch (err) {
      //console.log('ERREUR 2fa:', err); // ← et ça
      setError(err.message || 'Code incorrect ou expiré.');
      setCodes(['', '', '', '', '', '']);
      inputsRef.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const code = codes.join('');
    if (code.length === 6) handleVerify(code);
  };

  return (
    <motion.div
      key='2fa'
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <div className='mb-5 text-center'>
        <div className='w-14 h-14 bg-gradient-to-br from-[#1DBF73]/10 to-[#09B1BA]/10 rounded-2xl flex items-center justify-center mx-auto mb-3'>
          <KeyRound className='w-7 h-7 text-[#1DBF73]' />
        </div>
        <p className='text-sm text-gray-600'>
          Entrez le code à 6 chiffres de votre application d'authentification.
        </p>
      </div>

      {error && (
        <div className='p-3 mb-4 text-sm text-red-600 border border-red-200 bg-red-50 rounded-xl'>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className='space-y-5'>
        {/* Inputs OTP */}
        <div className='flex justify-center gap-2' onPaste={handlePaste}>
          {codes.map((c, idx) => (
            <input
              key={idx}
              ref={el => inputsRef.current[idx] = el}
              type='text'
              inputMode='numeric'
              maxLength={1}
              value={c}
              onChange={e => handleChange(idx, e.target.value)}
              onKeyDown={e => handleKeyDown(idx, e)}
              disabled={loading}
              className={`w-11 h-13 text-center text-xl font-bold border-2 rounded-xl transition-all focus:outline-none disabled:opacity-50
                ${c
                  ? 'border-[#1DBF73] bg-[#1DBF73]/5 text-[#1DBF73]'
                  : 'border-gray-200 bg-gray-50 text-gray-800'
                }
                focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20
              `}
            />
          ))}
        </div>

        <button
          type='submit'
          disabled={loading || codes.some(c => !c)}
          className='w-full py-3.5 text-sm font-bold text-white rounded-xl bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all'
        >
          {loading ? (
            <span className='flex items-center justify-center gap-2'>
              <span className='w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin' />
              Vérification...
            </span>
          ) : (
            <span className='flex items-center justify-center gap-2'>
              <Shield className='w-5 h-5' />
              Vérifier le code
            </span>
          )}
        </button>
      </form>

      <button
        onClick={onBack}
        className='flex items-center justify-center gap-2 w-full mt-4 text-sm text-gray-500 hover:text-[#1DBF73] transition-colors'
      >
        <ArrowLeft className='w-4 h-4' />
        Retour à la connexion
      </button>
    </motion.div>
  );
};

// ─── Composant principal ──────────────────────────────────────────────────────

export default function AdminLogin() {
  const [step,        setStep]        = useState('login'); // 'login' | '2fa'
  const [challengeId, setChallengeId] = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');

  const handleLoginSuccess = (id) => {
    setChallengeId(String(id)); // ← forcer string
    setError('');
    setStep('2fa');
  };

  const handleBack = () => {
    setStep('login');
    setChallengeId(null);
    setError('');
  };

  return (
    <div className='flex items-center justify-center min-h-screen p-4 bg-gray-50'>
      <div className='w-full max-w-md mx-auto'>

        {/* Logo + Badge */}
        <div className='mb-6 text-center'>
          <div className='flex justify-center mb-4'>
            <div className='w-16 h-16 bg-gradient-to-br from-[#1DBF73] to-[#09B1BA] rounded-2xl flex items-center justify-center shadow-lg'>
              <Stethoscope className='w-8 h-8 text-white' strokeWidth={2.5} />
            </div>
          </div>
          <span className='inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 border border-red-200 rounded-full bg-red-50'>
            <Shield className='w-4 h-4' />
            Espace Administrateur
          </span>
        </div>

        {/* Titre */}
        <div className='mb-6 text-center'>
          <h1 className='mb-2 text-2xl font-bold text-gray-800'>
            {step === 'login' ? 'Administration DocSpace' : 'Vérification 2FA'}
          </h1>
          <p className='text-sm text-gray-600'>
            {step === 'login'
              ? 'Connectez-vous au panel d\'administration'
              : 'Authentification à deux facteurs requise'
            }
          </p>
        </div>

        {/* Carte */}
        <div className='p-6 bg-white border border-gray-200 shadow-lg rounded-2xl overflow-hidden'>
          <AnimatePresence mode='wait'>
            {step === 'login' ? (
              <StepLogin
                key='login'
                onSuccess={handleLoginSuccess}
                loading={loading}
                setLoading={setLoading}
                error={error}
                setError={setError}
              />
            ) : (
              <Step2FA
                key='2fa'
                challengeId={challengeId}
                onBack={handleBack}
                loading={loading}
                setLoading={setLoading}
                error={error}
                setError={setError}
              />
            )}
          </AnimatePresence>

          {/* Footer carte */}
          <div className='pt-4 mt-4 text-center border-t border-gray-200'>
            <p className='text-sm text-gray-600'>
              Accès réservé aux administrateurs.{' '}
              <Link to='/login' className='font-semibold text-[#1DBF73] hover:text-[#09B1BA] transition-colors hover:no-underline'>
                Retour à l'Espace Client
              </Link>
            </p>
          </div>
        </div>

        {/* Footer page */}
        <div className='mt-6 text-center'>
          <p className='text-xs text-gray-500'>
            En vous connectant, vous acceptez nos conditions d'utilisation
          </p>
          <p className='mt-2 text-xs text-gray-400'>
            © 2026 DocSpace - Plateforme d'équipements médicaux
          </p>
        </div>

        {/* Info sécurité */}
        <div className='p-3 mt-4 border border-blue-200 bg-blue-50 rounded-xl'>
          <div className='flex items-start gap-2'>
            <Shield className='w-4 h-4 text-blue-600 mt-0.5 shrink-0' />
            <p className='text-xs text-blue-700'>
              <strong>Sécurité :</strong> Cette page est protégée. Toutes les tentatives de connexion sont enregistrées et surveillées.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}