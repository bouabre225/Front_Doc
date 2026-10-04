import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login2fa } from '../../../services/api';

const Login2FA = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const challenge_id = localStorage.getItem('2fa_challenge_id');
    if (!challenge_id) {
      setError('Session 2FA expirée. Reconnecte-toi.');
      return;
    }
    setLoading(true);
    try {
      const data = await login2fa({ challenge_id, code: code.trim() });
      localStorage.removeItem('2fa_challenge_id');
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.dispatchEvent(new Event('storage'));
      navigate(data.user?.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.message || 'Code invalide.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen p-4'>
      <form onSubmit={handleSubmit} className='w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border'>
        <h1 className='text-2xl font-bold mb-2'>Vérification 2FA</h1>
        <p className='text-sm text-gray-600 mb-6'>Un code à 6 chiffres a été envoyé par email.</p>
        {error && <div className='p-3 mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl'>{error}</div>}
        <input
          inputMode='numeric'
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder='••••••'
          className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-center tracking-widest text-xl mb-4'
          required
        />
        <button type='submit' disabled={loading} className='w-full py-3 bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white font-semibold rounded-xl disabled:opacity-50'>
          {loading ? 'Vérification...' : 'Valider'}
        </button>
        <Link to='/login' className='block text-center mt-4 text-sm text-gray-600'>Retour au login</Link>
      </form>
    </div>
  );
};

export default Login2FA;
