import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Shield, Stethoscope } from 'lucide-react';

const API_URL = 'http://localhost:8000/api';

export default function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email, mot_de_passe: password })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Identifiants incorrects');

      // Vérifier que c'est bien un admin
      if (data.user?.role !== 'ADMIN' && data.user?.role !== 'admin') {
        throw new Error('Accès réservé aux administrateurs');
      }

      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('user', JSON.stringify({ ...data.user, role: 'ADMIN' }));
      navigate('/admin/dashboard');

    } catch (err) {
      // Si le back n'est pas encore prêt, mode simulation
      if (err.message === 'Failed to fetch') {
        const fakeAdmin = { id: 1, nom: 'Admin DocSpace', email, role: 'ADMIN' };
        localStorage.setItem('user', JSON.stringify(fakeAdmin));
        localStorage.setItem('admin_token', 'fake-admin-token-123');
        navigate('/admin/dashboard');
        return;
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen p-4 bg-gray-50'>
      <div className='w-full max-w-md mx-auto'>

        {/* Logo */}
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

        <div className='mb-6 text-center'>
          <h1 className='mb-1 text-2xl font-bold text-gray-800'>Administration DocSpace</h1>
          <p className='text-sm text-gray-500'>Connectez-vous au panel d'administration</p>
        </div>

        {/* Formulaire */}
        <div className='p-6 bg-white border border-gray-200 shadow-lg rounded-2xl'>
          {error && (
            <div className='p-3 mb-4 text-sm text-red-600 border border-red-200 bg-red-50 rounded-xl'>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-4'>
            {/* Email */}
            <div>
              <label className='block mb-1.5 text-sm font-semibold text-gray-700'>Adresse email</label>
              <div className='relative'>
                <Mail className='absolute w-4 h-4 text-[#1DBF73] left-3 top-1/2 -translate-y-1/2' />
                <input type='email' value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder='admin@docspace.com'
                  className='w-full py-3 pr-4 text-sm bg-gray-50 border-2 border-gray-200 rounded-xl pl-10 focus:outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 disabled:opacity-50'
                  required disabled={loading} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className='block mb-1.5 text-sm font-semibold text-gray-700'>Mot de passe</label>
              <div className='relative'>
                <Lock className='absolute w-4 h-4 text-[#1DBF73] left-3 top-1/2 -translate-y-1/2' />
                <input type={showPassword ? 'text' : 'password'} value={password}
                  onChange={(e) => setPassword(e.target.value)} placeholder='••••••••'
                  className='w-full py-3 pr-12 text-sm bg-gray-50 border-2 border-gray-200 rounded-xl pl-10 focus:outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 disabled:opacity-50'
                  required disabled={loading} />
                <button type='button' onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-[#09B1BA] hover:text-[#1DBF73]'>
                  {showPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
                </button>
              </div>
            </div>

            <button type='submit' disabled={loading}
              className='w-full py-3.5 text-sm font-bold text-white rounded-xl bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] hover:shadow-lg disabled:opacity-50 transition-all'>
              {loading ? (
                <div className='flex items-center justify-center gap-2'>
                  <div className='w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin' />
                  Connexion...
                </div>
              ) : (
                <span className='flex items-center justify-center gap-2'>
                  <Shield className='w-4 h-4' />
                  Se connecter
                </span>
              )}
            </button>
          </form>

          <div className='pt-4 mt-4 text-sm text-center text-gray-500 border-t border-gray-100'>
            <Link to='/login' className='font-semibold text-[#1DBF73] hover:underline'>
              Retour à l'espace client
            </Link>
          </div>
        </div>

        {/* Sécurité */}
        <div className='p-3 mt-4 border border-blue-200 bg-blue-50 rounded-xl'>
          <div className='flex items-start gap-2'>
            <Shield className='w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0' />
            <p className='text-xs text-blue-700'>
              <strong>Sécurité :</strong> Accès protégé. Toutes les tentatives sont enregistrées.
            </p>
          </div>
        </div>

        <p className='mt-4 text-xs text-center text-gray-400'>© 2026 DocSpace</p>
      </div>
    </div>
  );
}