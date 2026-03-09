import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User, Mail, Phone, MapPin, Package, ShoppingBag, Heart,
  LogOut, Edit, Trash2, Eye, Calendar, AlertCircle
} from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useLang } from '../../context/LangContext';
import { getMe, getAnnonces, getCommandes, deleteAnnonce, logoutUser, getImageUrl } from '../../../services/api';

function Profile() {
  const navigate = useNavigate();
  const { t } = useLang();

  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('annonces');
  const [myAnnonces, setMyAnnonces] = useState([]);
  const [myCommandes, setMyCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isSeller = user?.role === 'vendeur';

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      navigate('/login');
      return;
    }
    loadProfileData();
  }, [navigate]);

  const loadProfileData = async () => {
    setLoading(true);
    setError('');
    try {
      const meData = await getMe();
      setUser(meData.user);

      // Charger commandes
      try {
        const commandesData = await getCommandes();
        setMyCommandes(commandesData.data || commandesData || []);
      } catch (_) {}

      // Si vendeur, charger ses annonces
      if (meData.user?.role === 'vendeur') {
        try {
          const annoncesData = await getAnnonces(1);
          const all = annoncesData.data || [];
          // Filtrer les annonces du vendeur connecté
          const mine = all.filter((a) => a.vendeur_id === meData.user.id);
          setMyAnnonces(mine);
        } catch (_) {}
      }
    } catch (err) {
      setError('Session expirée. Veuillez vous reconnecter.');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      setTimeout(() => navigate('/login'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (_) {}
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('storage'));
    navigate('/');
  };

  const handleDeleteAnnonce = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette annonce ?')) return;
    try {
      await deleteAnnonce(id);
      setMyAnnonces((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      alert('Erreur lors de la suppression : ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <Header />
        <div className='flex items-center justify-center py-40'>
          <div className='w-12 h-12 border-4 border-[#1DBF73] rounded-full border-t-transparent animate-spin' />
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <Header />
        <div className='flex flex-col items-center justify-center py-40 gap-4'>
          <AlertCircle className='w-12 h-12 text-red-400' />
          <p className='text-gray-700 font-medium'>{error}</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <Header />

      <div className='container max-w-6xl px-4 py-10 mx-auto'>
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-4'>
          {/* Sidebar profil */}
          <div className='lg:col-span-1'>
            <div className='p-6 bg-white border border-gray-100 shadow-sm rounded-2xl'>
              {/* Avatar */}
              <div className='flex flex-col items-center mb-6'>
                <div className='flex items-center justify-center w-20 h-20 mb-3 rounded-full bg-gradient-to-br from-[#1DBF73] to-[#09B1BA]'>
                  <User className='w-10 h-10 text-white' />
                </div>
                <h2 className='text-lg font-bold text-gray-900'>{user?.nom}</h2>
                <span className={`mt-1 px-3 py-1 text-xs font-semibold rounded-full ${
                  isSeller
                    ? 'bg-[#09B1BA]/10 text-[#09B1BA]'
                    : 'bg-[#1DBF73]/10 text-[#1DBF73]'
                }`}>
                  {isSeller ? 'Vendeur' : 'Acheteur'}
                </span>
                {user?.badge_verifie && (
                  <span className='mt-2 px-2 py-0.5 text-xs bg-blue-50 text-blue-600 border border-blue-200 rounded-full'>
                    ✓ Vérifié
                  </span>
                )}
              </div>

              {/* Infos */}
              <div className='space-y-3 mb-6'>
                <div className='flex items-center gap-2 text-sm text-gray-600'>
                  <Mail className='w-4 h-4 text-[#1DBF73]' />
                  <span className='truncate'>{user?.email}</span>
                </div>
                {user?.telephone && (
                  <div className='flex items-center gap-2 text-sm text-gray-600'>
                    <Phone className='w-4 h-4 text-[#1DBF73]' />
                    <span>{user.telephone}</span>
                  </div>
                )}
                {user?.pays && (
                  <div className='flex items-center gap-2 text-sm text-gray-600'>
                    <MapPin className='w-4 h-4 text-[#1DBF73]' />
                    <span>{user.pays}</span>
                  </div>
                )}
              </div>

              {/* Navigation tabs */}
              <div className='space-y-1 mb-6'>
                {isSeller ? (
                  <>
                    <button
                      onClick={() => setActiveTab('annonces')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        activeTab === 'annonces'
                          ? 'bg-[#1DBF73]/10 text-[#1DBF73]'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Package className='w-4 h-4' />
                      Mes annonces
                    </button>
                    <button
                      onClick={() => setActiveTab('commandes')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        activeTab === 'commandes'
                          ? 'bg-[#1DBF73]/10 text-[#1DBF73]'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <ShoppingBag className='w-4 h-4' />
                      Commandes reçues
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setActiveTab('achats')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        activeTab === 'achats'
                          ? 'bg-[#1DBF73]/10 text-[#1DBF73]'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <ShoppingBag className='w-4 h-4' />
                      Mes achats
                    </button>
                  </>
                )}
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className='w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-all'
              >
                <LogOut className='w-4 h-4' />
                Se déconnecter
              </button>
            </div>
          </div>

          {/* Contenu principal */}
          <div className='lg:col-span-3'>
            <div className='p-6 bg-white border border-gray-100 shadow-sm rounded-2xl'>

              {/* Mes annonces (vendeur) */}
              {activeTab === 'annonces' && isSeller && (
                <div>
                  <div className='flex items-center justify-between mb-6'>
                    <h2 className='text-2xl font-bold text-gray-800'>Mes annonces</h2>
                    <Link
                      to='/seller/publish'
                      className='px-4 py-2 bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all'
                    >
                      + Nouvelle annonce
                    </Link>
                  </div>

                  {myAnnonces.length === 0 ? (
                    <div className='py-20 text-center'>
                      <Package className='w-16 h-16 mx-auto mb-4 text-gray-200' />
                      <p className='text-gray-500 mb-4'>Vous n'avez pas encore publié d'annonce.</p>
                      <Link
                        to='/seller/publish'
                        className='inline-block px-6 py-3 bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white font-semibold rounded-xl'
                      >
                        Publier ma première annonce
                      </Link>
                    </div>
                  ) : (
                    <div className='space-y-4'>
                      {myAnnonces.map((annonce) => (
                        <motion.div
                          key={annonce.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className='flex gap-4 p-4 border border-gray-100 rounded-2xl hover:border-[#1DBF73]/30 transition-all'
                        >
                          {/* Image */}
                          <div className='w-24 h-24 rounded-xl overflow-hidden bg-gray-100 shrink-0'>
                            {annonce.images?.[0] ? (
                              <img
                                src={getImageUrl(annonce.images[0].image_url)}
                                alt={annonce.titre}
                                className='object-cover w-full h-full'
                              />
                            ) : (
                              <div className='flex items-center justify-center w-full h-full text-3xl'>🏥</div>
                            )}
                          </div>

                          {/* Infos */}
                          <div className='flex-1'>
                            <h3 className='font-bold text-gray-900 line-clamp-1'>{annonce.titre}</h3>
                            <p className='text-sm text-gray-500 mt-1'>{annonce.categorie} · {annonce.etat}</p>
                            <p className='text-lg font-bold text-[#1DBF73] mt-1'>
                              {Number(annonce.prix_vendeur).toLocaleString()} FCFA
                            </p>
                          </div>

                          {/* Actions */}
                          <div className='flex flex-col gap-2 shrink-0'>
                            <Link
                              to={`/equipment/${annonce.id}`}
                              className='flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all'
                            >
                              <Eye className='w-3.5 h-3.5' />
                              Voir
                            </Link>
                            <button
                              onClick={() => handleDeleteAnnonce(annonce.id)}
                              className='flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-all'
                            >
                              <Trash2 className='w-3.5 h-3.5' />
                              Suppr.
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Commandes (vendeur) */}
              {activeTab === 'commandes' && isSeller && (
                <div>
                  <h2 className='mb-6 text-2xl font-bold text-gray-800'>Commandes reçues</h2>
                  {myCommandes.length === 0 ? (
                    <div className='py-20 text-center'>
                      <ShoppingBag className='w-16 h-16 mx-auto mb-4 text-gray-200' />
                      <p className='text-gray-500'>Aucune commande reçue pour le moment.</p>
                    </div>
                  ) : (
                    <div className='space-y-4'>
                      {myCommandes.map((cmd) => (
                        <div key={cmd.id} className='p-4 border border-gray-100 rounded-2xl'>
                          <div className='flex items-center justify-between'>
                            <div>
                              <p className='font-semibold text-gray-900'>Commande #{cmd.id}</p>
                              <p className='text-sm text-gray-500 mt-0.5'>
                                <Calendar className='inline w-3.5 h-3.5 mr-1' />
                                {new Date(cmd.created_at).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              cmd.statut === 'en_attente' ? 'bg-yellow-100 text-yellow-700' :
                              cmd.statut === 'confirmee' ? 'bg-green-100 text-green-700' :
                              cmd.statut === 'annulee' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {cmd.statut?.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Achats (acheteur) */}
              {activeTab === 'achats' && !isSeller && (
                <div>
                  <h2 className='mb-6 text-2xl font-bold text-gray-800'>Historique des achats</h2>
                  {myCommandes.length === 0 ? (
                    <div className='py-20 text-center'>
                      <ShoppingBag className='w-16 h-16 mx-auto mb-4 text-gray-200' />
                      <p className='text-gray-500 mb-4'>Aucun achat pour le moment.</p>
                      <Link
                        to='/explore'
                        className='inline-block px-6 py-3 bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white font-semibold rounded-xl'
                      >
                        Explorer les équipements
                      </Link>
                    </div>
                  ) : (
                    <div className='space-y-4'>
                      {myCommandes.map((cmd) => (
                        <div key={cmd.id} className='p-4 border border-gray-100 rounded-2xl'>
                          <div className='flex items-center justify-between'>
                            <div>
                              <p className='font-semibold text-gray-900'>Commande #{cmd.id}</p>
                              <p className='text-sm text-gray-500 mt-0.5'>
                                {new Date(cmd.created_at).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              cmd.statut === 'en_attente' ? 'bg-yellow-100 text-yellow-700' :
                              cmd.statut === 'confirmee' ? 'bg-green-100 text-green-700' :
                              cmd.statut === 'annulee' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {cmd.statut?.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Profile;
