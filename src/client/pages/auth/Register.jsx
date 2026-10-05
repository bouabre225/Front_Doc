import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Briefcase, Phone, ArrowLeft, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLang } from '../../context/LangContext';
import { registerBuyer, registerSeller } from '../../../services/api';
import { COUNTRIES, DEFAULT_COUNTRY } from '../../constants/countries';

const Register = () => {
  const { t } = useLang();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const initialUserType = ['seller', 'vendeur'].includes(searchParams.get('type')) ? 'seller' : 'buyer';

  const [userType, setUserType] = useState(initialUserType);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState({});
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    mot_de_passe: '',
    telephone: '',
    pays: DEFAULT_COUNTRY,
    type_compte: 'particulier',
    acceptTerms: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setFieldError(prev => ({ ...prev, [name]: undefined }));
  };

  const pwdScore = (() => {
    const p = formData.mot_de_passe || '';
    let s = 0;
    if (p.length >= 10) s++;
    if (p.length >= 14) s++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return Math.min(s, 4);
  })();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.acceptTerms) {
      setError("Veuillez accepter les conditions d'utilisation et la politique de confidentialité.");
      return;
    }
    setLoading(true);
    setError('');

    try {
      const payload = {
        nom: formData.nom,
        email: formData.email,
        mot_de_passe: formData.mot_de_passe,
        mot_de_passe_confirmation: formData.mot_de_passe,
        telephone: formData.telephone,
        pays: formData.pays,
        acceptTerms: true,
        ...(userType === 'seller' ? { type_compte: formData.type_compte } : {}),
      };

      // Après inscription
      const data = userType === 'seller'
        ? await registerSeller(payload)
        : await registerBuyer(payload);

      if (data.token) { // ← ajoute cette vérification
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.dispatchEvent(new Event('storage'));
      }

      if (userType === 'seller') {
        navigate('/'); // ← ou '/seller/publish' selon ton flow
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
          <span className='font-medium'>{t.common.backHome}</span>
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
            {t.auth.join}
          </span>
        </div>

        <div className='mb-8 text-center'>
          <h1 className='mb-2 text-3xl font-bold text-gray-900'>{t.auth.registerTitle}</h1>
          <p className='text-gray-600'>{t.auth.registerSubtitle}</p>
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
              {t.auth.buyer}
            </button>
            <button
              type='button'
              onClick={() => setUserType('seller')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-all ${
                userType === 'seller' ? 'bg-white text-[#09B1BA] shadow-md' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Briefcase className='w-4 h-4' />
              {t.auth.seller}
            </button>
          </div>

          {/* Erreur */}
          {error && (
            <div role='alert' className='flex items-center gap-2 p-3 mb-5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl'>
              <AlertCircle className='w-4 h-4 shrink-0' />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Nom */}
            <div className='mb-4'>
              <label className='block mb-2 text-sm font-semibold text-gray-700'>{t.auth.fullName}</label>
              <div className='relative'>
                <User className='absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#1DBF73]' />
                <input
                  type='text'
                  name='nom'
                  value={formData.nom}
                  onChange={handleChange}
                  placeholder={t.auth.fullNamePlaceholder}
                  aria-invalid={!!fieldError.nom}
                  data-field-error={fieldError.nom ? 'true' : undefined}
                  className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${fieldError.nom ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-[#1DBF73] focus:ring-[#1DBF73]/20'}`}
                  required
                />
                {fieldError.nom && <p className='text-xs text-red-500 mt-1'>{fieldError.nom}</p>}
              </div>
            </div>

            {/* Email */}
            <div className='mb-4'>
              <label className='block mb-2 text-sm font-semibold text-gray-700'>{t.auth.email}</label>
              <div className='relative'>
                <Mail className='absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#1DBF73]' />
                <input
                  type='email'
                  name='email'
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t.auth.emailPlaceholder}
                  aria-invalid={!!fieldError.email}
                  data-field-error={fieldError.email ? 'true' : undefined}
                  className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${fieldError.email ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-[#1DBF73] focus:ring-[#1DBF73]/20'}`}
                  required
                />
                {fieldError.email && <p className='text-xs text-red-500 mt-1'>{fieldError.email}</p>}
              </div>
            </div>

            {/* Téléphone */}
            <div className='mb-4'>
              <label className='block mb-2 text-sm font-semibold text-gray-700'>
                {t.auth.phone} {userType === 'buyer' && <span className='text-gray-400 font-normal'>({t.common.optional})</span>}
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
                  aria-invalid={!!fieldError.telephone}
                  data-field-error={fieldError.telephone ? 'true' : undefined}
                  className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${fieldError.telephone ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-[#1DBF73] focus:ring-[#1DBF73]/20'}`}
                />
                {fieldError.telephone && <p className='text-xs text-red-500 mt-1'>{fieldError.telephone}</p>}
              </div>
            </div>

            {/* Pays */}
            <div className='mb-4'>
              <label className='block mb-2 text-sm font-semibold text-gray-700'>{t.auth.country}</label>
              <div className='relative'>
                <select
                  name='pays'
                  value={formData.pays}
                  onChange={handleChange}
                  className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 transition-all bg-white'
                  required
                >
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Type de compte (vendeur seulement) */}
            {userType === 'seller' && (
              <div className='mb-4'>
                <label className='block mb-2 text-sm font-semibold text-gray-700'>{t.auth.accountType}</label>
                <div className='relative'>
                  <Briefcase className='absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#1DBF73]' />
                  <select
                    name='type_compte'
                    value={formData.type_compte}
                    onChange={handleChange}
                    className='w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 transition-all'
                  >
                    <option value='particulier'>{t.auth.individual}</option>
                    <option value='professionnel'>{t.auth.professional}</option>
                  </select>
                </div>
              </div>
            )}

            {/* Mot de passe */}
            <div className='mb-5'>
              <label className='block mb-2 text-sm font-semibold text-gray-700'>{t.auth.password}</label>
              <div className='relative'>
                <Lock className='absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#1DBF73]' />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name='mot_de_passe'
                  value={formData.mot_de_passe}
                  onChange={handleChange}
                  placeholder='••••••••'
                  aria-invalid={!!fieldError.mot_de_passe}
                  aria-describedby='pwd-help'
                  data-field-error={fieldError.mot_de_passe ? 'true' : undefined}
                  className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${fieldError.mot_de_passe ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-[#1DBF73] focus:ring-[#1DBF73]/20'}`}
                  required
                  minLength={10}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#1DBF73] transition-colors'
                >
                  {showPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                </button>
              </div>
              {formData.mot_de_passe && (
                <div className='mt-2 flex gap-1' id='pwd-help'>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full ${pwdScore >= i ? (pwdScore <= 1 ? 'bg-red-400' : pwdScore === 2 ? 'bg-orange-400' : pwdScore === 3 ? 'bg-yellow-400' : 'bg-green-500') : 'bg-gray-200'}`} />
                  ))}
                </div>
              )}
              {formData.mot_de_passe && (
                <p className='text-xs text-gray-500 mt-1'>{[t.auth.pwdWeak, t.auth.pwdWeak, t.auth.pwdMedium, t.auth.pwdGood, t.auth.pwdStrong][pwdScore]}</p>
              )}
              {fieldError.mot_de_passe && <p className='text-xs text-red-500 mt-1'>{fieldError.mot_de_passe}</p>}
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
                  required
                />
                <span className='text-sm text-gray-600'>
                  {t.auth.acceptCgu}{' '}
                  <Link to='/terms' className='text-[#1DBF73] hover:no-underline font-medium'>{t.auth.termsLink}</Link>
                  {' '}et la{' '}
                  <Link to='/privacy' className='text-[#1DBF73] hover:no-underline font-medium'>{t.auth.privacyLink}</Link>
                </span>
              </label>
              {fieldError.acceptTerms && <p className='text-xs text-red-500 mt-1'>{fieldError.acceptTerms}</p>}
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
                  {t.auth.creating}
                </div>
              ) : (
                userType === 'buyer' ? t.auth.createBuyer : t.auth.createSeller
              )}
            </motion.button>
          </form>

          <div className='pt-6 mt-6 text-center border-t border-gray-200'>
            <p className='text-gray-600'>
              {t.auth.hasAccount}{' '}
              <Link to='/login' className='font-semibold text-[#1DBF73] hover:text-[#09B1BA] transition-colors'>
                {t.auth.loginCta}
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
