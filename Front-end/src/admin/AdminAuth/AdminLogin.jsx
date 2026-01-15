import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Shield, Stethoscope } from 'lucide-react';
import axios from 'axios';

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

    //  MODE SIMULATION - Pour les tests uniquement
    // Accepter n'importe quel email/password pour simuler un admin
    setTimeout(() => {
      // Simuler un admin connecté
      const fakeAdmin = {
        id: 1,
        nom: 'Admin',
        prenom: 'DocSpace',
        email: email || 'admin@docspace.com',
        role: 'ADMIN'
      };

      // Sauvegarder dans localStorage
      localStorage.setItem('user', JSON.stringify(fakeAdmin));
      localStorage.setItem('token', 'fake-admin-token-123');

      // Rediriger vers le dashboard admin
      navigate('/admin/dashboard');
    }, 1000); // Petit délai pour simuler une vraie requête

    /*  CODE RÉEL - À utiliser quand l'API sera prête
    try {
      const response = await axios.post('http://localhost:8000/api/admin/login', {
        email,
        password
      });
      
      const userData = response.data;
      
      if (userData.user.role !== 'ADMIN') {
        setError('Accès réservé aux administrateurs uniquement');
        setLoading(false);
        return;
      }

      localStorage.setItem('user', JSON.stringify(userData.user));
      localStorage.setItem('token', userData.token);

      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Email ou mot de passe incorrect');
      setLoading(false);
    }
    */
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-md mx-auto">
        
        {/* Logo et Badge */}
        <div className="mb-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#1DBF73] to-[#09B1BA] rounded-2xl flex items-center justify-center shadow-lg">
              <Stethoscope className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
          </div>
          
          <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 border border-red-200 rounded-full bg-red-50">
            <Shield className="w-4 h-4" />
            Espace Administrateur
          </span>
        </div>

        {/* Titre */}
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-2xl font-bold text-gray-800">
            Administration DocSpace
          </h1>
          <p className="text-sm text-gray-600">
            Connectez-vous au panel d'administration
          </p>
        </div>

        {/* Formulaire */}
        <div className="p-6 bg-white border border-gray-200 shadow-lg rounded-2xl">
          {/* Message d'erreur */}
          {error && (
            <div className="p-3 mb-4 text-sm text-red-600 border border-red-200 bg-red-50 rounded-xl">
              <p className="font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute w-5 h-5 text-[#1DBF73] transform -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@docspace.com"
                  className="w-full py-3 pr-4 text-sm text-gray-800 transition-all bg-gray-50 border-2 border-gray-200 rounded-xl pl-11 
                  focus:outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 
                  disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute w-5 h-5 text-[#1DBF73] transform -translate-y-1/2 left-3 top-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full py-3 pr-12 text-sm text-gray-800 transition-all bg-gray-50 border-2 border-gray-200 rounded-xl pl-11 
                  focus:outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20
                  disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute transition-all transform -translate-y-1/2 right-3 top-1/2 text-[#09B1BA] hover:text-[#1DBF73]"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Bouton de connexion */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3.5 text-sm font-bold text-white rounded-xl transition-all 
              bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] 
              hover:shadow-lg hover:scale-[1.02] 
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                  Connexion en cours...
                </div>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Shield className="w-5 h-5" />
                  Se connecter
                </span>
              )}
            </button>
          </form>

          {/* Avertissement */}
          <div className="pt-4 mt-4 text-center border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Accès réservé aux administrateurs.{" "}
              <Link 
                to="/login" 
                className="font-semibold text-[#1DBF73] hover:text-[#09B1BA] transition-colors hover:underline"
              >
                Retour à l'Espace Client
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            En vous connectant, vous acceptez nos conditions d'utilisation
          </p>
          <p className="mt-2 text-xs text-gray-400">
            © 2026 DocSpace - Plateforme d'équipements médicaux
          </p>
        </div>

        {/* Info de sécurité */}
        <div className="p-3 mt-4 border border-blue-200 bg-blue-50 rounded-xl">
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-700">
              <strong>Sécurité :</strong> Cette page est protégée. Toutes les tentatives de connexion sont enregistrées et surveillées.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}