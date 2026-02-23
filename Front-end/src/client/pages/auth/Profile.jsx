import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Package, 
  ShoppingBag, 
  Heart, 
  Settings, 
  LogOut,
  Edit,
  Trash2,
  Eye,
  Calendar,
  DollarSign,
  Star
} from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useLang } from '../../context/LangContext';

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('annonces');
  
  // Données d'exemple des annonces du vendeur
  const [myAnnonces, setMyAnnonces] = useState([
    {
      id: 1,
      title: 'Échographe Portable GE Voluson',
      price: 15000,
      currency: 'FCFA',
      condition: 'Excellent',
      date: '2026-02-10',
      views: 234,
      status: 'active',
      image: 'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=300&h=200&fit=crop'
    },
    {
      id: 2,
      title: 'Stéthoscope Littmann Cardiology IV',
      price: 350,
      currency: 'FCFA',
      condition: 'Comme neuf',
      date: '2026-02-08',
      views: 156,
      status: 'active',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=200&fit=crop'
    }
  ]);

  // Données d'exemple des favoris de l'acheteur
  const [favorites, setFavorites] = useState([
    {
      id: 3,
      title: 'Défibrillateur Philips HeartStart',
      price: 4200,
      currency: 'FCFA',
      seller: 'Emergency Med',
      location: 'Cotonou',
      image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=300&h=200&fit=crop'
    },
    {
      id: 4,
      title: 'Moniteur de Signes Vitaux',
      price: 3800,
      currency: 'FCFA',
      seller: 'VitalCare',
      location: 'Porto-Novo',
      image: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=300&h=200&fit=crop'
    }
  ]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [navigate]);

  const handleLogout = () => {
  const { t } = useLang();
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleDeleteAnnonce = (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer cette annonce ?')) {
      setMyAnnonces(myAnnonces.filter(a => a.id !== id));
      alert('Annonce supprimée avec succès !');
    }
  };

  const handleRemoveFavorite = (id) => {
    setFavorites(favorites.filter(f => f.id !== id));
  };

  if (!user) return null;

  const isSeller = user.role === 'seller';

  return (
    <div className='min-h-screen bg-gray-50'>
      <Header />
      
      <div className='container px-4 py-12 mx-auto'>
        <div className='grid grid-cols-1 gap-8 lg:grid-cols-4'>
          {/* Sidebar - Profile Info */}
          <div className='lg:col-span-1'>
            <div className='p-6 bg-white shadow-lg rounded-2xl'>
              {/* Avatar */}
              <div className='flex flex-col items-center mb-6'>
                <div className='w-24 h-24 mb-4 bg-gradient-to-br from-[#1DBF73] to-[#09B1BA] rounded-full flex items-center justify-center'>
                  <User className='w-12 h-12 text-white' />
                </div>
                <h2 className='text-xl font-bold text-gray-800'>{user.name || 'Utilisateur'}</h2>
                <span className={`px-3 py-1 mt-2 text-xs font-semibold rounded-full ${
                  isSeller 
                    ? 'bg-[#1DBF73]/10 text-[#1DBF73]' 
                    : 'bg-[#09B1BA]/10 text-[#09B1BA]'
                }`}>
                  {isSeller ? 'Vendeur' : 'Acheteur'}
                </span>
              </div>

              {/* User Info */}
              <div className='mb-6 space-y-3'>
                <div className='flex items-center gap-3 text-sm text-gray-600'>
                  <Mail className='w-4 h-4 text-[#1DBF73]' />
                  <span className='truncate'>{user.email}</span>
                </div>
                {user.phone && (
                  <div className='flex items-center gap-3 text-sm text-gray-600'>
                    <Phone className='w-4 h-4 text-[#1DBF73]' />
                    <span>{user.phone}</span>
                  </div>
                )}
                {user.location && (
                  <div className='flex items-center gap-3 text-sm text-gray-600'>
                    <MapPin className='w-4 h-4 text-[#1DBF73]' />
                    <span>{user.location || 'Bénin'}</span>
                  </div>
                )}
              </div>

              {/* Stats */}
              {isSeller && (
                <div className='p-4 mb-6 bg-gray-50 rounded-xl'>
                  <h3 className='mb-3 text-sm font-semibold text-gray-700'>Statistiques</h3>
                  <div className='space-y-2'>
                    <div className='flex justify-between text-sm'>
                      <span className='text-gray-600'>Annonces actives</span>
                      <span className='font-bold text-[#1DBF73]'>{myAnnonces.length}</span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span className='text-gray-600'>Vues totales</span>
                      <span className='font-bold text-gray-800'>
                        {myAnnonces.reduce((acc, a) => acc + a.views, 0)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className='space-y-2'>
                <Link 
                  to='/settings'
                  className='flex items-center justify-center w-full gap-2 py-3 font-medium text-gray-700 transition-all bg-gray-100 rounded-xl hover:bg-gray-200'
                >
                  <Settings className='w-5 h-5' />
                  Paramètres
                </Link>
                <button 
                  onClick={handleLogout}
                  className='flex items-center justify-center w-full gap-2 py-3 font-medium text-red-600 transition-all bg-red-50 rounded-xl hover:bg-red-100'
                >
                  <LogOut className='w-5 h-5' />
                  Déconnexion
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className='lg:col-span-3'>
            {/* Tabs */}
            <div className='flex gap-2 mb-6 overflow-x-auto'>
              {isSeller ? (
                <>
                  <button
                    onClick={() => setActiveTab('annonces')}
                    className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
                      activeTab === 'annonces'
                        ? 'bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white shadow-lg'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className='flex items-center gap-2'>
                      <Package className='w-5 h-5' />
                      Mes Annonces
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('stats')}
                    className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
                      activeTab === 'stats'
                        ? 'bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white shadow-lg'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className='flex items-center gap-2'>
                      <Star className='w-5 h-5' />
                      Statistiques
                    </div>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setActiveTab('favoris')}
                    className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
                      activeTab === 'favoris'
                        ? 'bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white shadow-lg'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className='flex items-center gap-2'>
                      <Heart className='w-5 h-5' />
                      Mes Favoris
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('achats')}
                    className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
                      activeTab === 'achats'
                        ? 'bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white shadow-lg'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className='flex items-center gap-2'>
                      <ShoppingBag className='w-5 h-5' />
                      Mes Achats
                    </div>
                  </button>
                </>
              )}
            </div>

            {/* Content */}
            <div className='p-6 bg-white shadow-lg rounded-2xl'>
              {/* TAB: Mes Annonces (Vendeur) */}
              {activeTab === 'annonces' && isSeller && (
                <div>
                  <div className='flex items-center justify-between mb-6'>
                    <h2 className='text-2xl font-bold text-gray-800'>Mes Annonces</h2>
                    <Link
                      to='/publish-equipment'
                      className='px-6 py-3 bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white font-semibold rounded-xl hover:shadow-xl transition-all'
                    >
                      + Nouvelle annonce
                    </Link>
                  </div>

                  {myAnnonces.length === 0 ? (
                    <div className='py-20 text-center'>
                      <Package className='w-16 h-16 mx-auto mb-4 text-gray-300' />
                      <p className='text-gray-600'>Aucune annonce pour le moment</p>
                      <Link
                        to='/publish-equipment'
                        className='inline-block mt-4 px-6 py-3 bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white font-semibold rounded-xl hover:shadow-xl transition-all'
                      >
                        Créer ma première annonce
                      </Link>
                    </div>
                  ) : (
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                      {myAnnonces.map((annonce) => (
                        <motion.div
                          key={annonce.id}
                          whileHover={{ y: -5 }}
                          className='overflow-hidden bg-white border-2 border-gray-200 shadow-md rounded-xl hover:border-[#1DBF73] transition-all'
                        >
                          <div className='relative h-48'>
                            <img
                              src={annonce.image}
                              alt={annonce.title}
                              className='object-cover w-full h-full'
                            />
                            <div className='absolute px-3 py-1 text-xs font-bold text-white bg-green-500 rounded-full top-3 right-3'>
                              {annonce.status === 'active' ? 'Active' : 'Inactive'}
                            </div>
                          </div>
                          
                          <div className='p-4'>
                            <h3 className='mb-2 text-lg font-bold text-gray-800 line-clamp-1'>
                              {annonce.title}
                            </h3>
                            
                            <div className='flex items-center justify-between mb-3'>
                              <div className='text-2xl font-bold text-[#1DBF73]'>
                                {annonce.price.toLocaleString()} {annonce.currency}
                              </div>
                              <span className='px-2 py-1 text-xs font-semibold text-green-700 rounded bg-green-50'>
                                {annonce.condition}
                              </span>
                            </div>

                            <div className='flex items-center gap-4 mb-4 text-sm text-gray-600'>
                              <div className='flex items-center gap-1'>
                                <Eye className='w-4 h-4' />
                                <span>{annonce.views} vues</span>
                              </div>
                              <div className='flex items-center gap-1'>
                                <Calendar className='w-4 h-4' />
                                <span>{new Date(annonce.date).toLocaleDateString('fr-FR')}</span>
                              </div>
                            </div>

                            <div className='flex gap-2'>
                              <Link
                                to={`/equipment/${annonce.id}`}
                                className='flex-1 py-2 text-center text-sm font-semibold text-[#1DBF73] bg-[#1DBF73]/10 rounded-lg hover:bg-[#1DBF73]/20 transition-all'
                              >
                                Voir
                              </Link>
                              <button className='flex items-center justify-center flex-1 gap-1 py-2 text-sm font-semibold text-center text-blue-600 transition-all rounded-lg bg-blue-50 hover:bg-blue-100'>
                                <Edit className='w-4 h-4' />
                                Modifier
                              </button>
                              <button 
                                onClick={() => handleDeleteAnnonce(annonce.id)}
                                className='flex items-center justify-center flex-1 gap-1 py-2 text-sm font-semibold text-center text-red-600 transition-all rounded-lg bg-red-50 hover:bg-red-100'
                              >
                                <Trash2 className='w-4 h-4' />
                                Supprimer
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: Statistiques (Vendeur) */}
              {activeTab === 'stats' && isSeller && (
                <div>
                  <h2 className='mb-6 text-2xl font-bold text-gray-800'>Statistiques de vente</h2>
                  
                  <div className='grid grid-cols-1 gap-6 mb-8 md:grid-cols-3'>
                    <div className='p-6 bg-gradient-to-br from-[#1DBF73]/10 to-[#1DBF73]/5 rounded-xl border-2 border-[#1DBF73]/20'>
                      <div className='flex items-center justify-between mb-2'>
                        <span className='text-gray-600'>Annonces actives</span>
                        <Package className='w-8 h-8 text-[#1DBF73]' />
                      </div>
                      <div className='text-3xl font-bold text-gray-800'>{myAnnonces.length}</div>
                    </div>

                    <div className='p-6 bg-gradient-to-br from-[#09B1BA]/10 to-[#09B1BA]/5 rounded-xl border-2 border-[#09B1BA]/20'>
                      <div className='flex items-center justify-between mb-2'>
                        <span className='text-gray-600'>Vues totales</span>
                        <Eye className='w-8 h-8 text-[#09B1BA]' />
                      </div>
                      <div className='text-3xl font-bold text-gray-800'>
                        {myAnnonces.reduce((acc, a) => acc + a.views, 0)}
                      </div>
                    </div>

                    <div className='p-6 border-2 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 rounded-xl border-yellow-500/20'>
                      <div className='flex items-center justify-between mb-2'>
                        <span className='text-gray-600'>Revenus estimés</span>
                        <DollarSign className='w-8 h-8 text-yellow-600' />
                      </div>
                      <div className='text-3xl font-bold text-gray-800'>
                        {myAnnonces.reduce((acc, a) => acc + a.price, 0).toLocaleString()} FCFA
                      </div>
                    </div>
                  </div>

                  <div className='p-6 bg-gray-50 rounded-xl'>
                    <h3 className='mb-4 text-lg font-bold text-gray-800'>Performance des annonces</h3>
                    <p className='text-gray-600'>Graphiques et analyses détaillées - En développement</p>
                  </div>
                </div>
              )}

              {/* TAB: Mes Favoris (Acheteur) */}
              {activeTab === 'favoris' && !isSeller && (
                <div>
                  <h2 className='mb-6 text-2xl font-bold text-gray-800'>Mes Favoris</h2>

                  {favorites.length === 0 ? (
                    <div className='py-20 text-center'>
                      <Heart className='w-16 h-16 mx-auto mb-4 text-gray-300' />
                      <p className='text-gray-600'>Aucun favori pour le moment</p>
                      <Link
                        to='/explore'
                        className='inline-block mt-4 px-6 py-3 bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white font-semibold rounded-xl hover:shadow-xl transition-all'
                      >
                        Explorer les équipements
                      </Link>
                    </div>
                  ) : (
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                      {favorites.map((item) => (
                        <motion.div
                          key={item.id}
                          whileHover={{ y: -5 }}
                          className='overflow-hidden bg-white border-2 border-gray-200 shadow-md rounded-xl hover:border-[#1DBF73] transition-all'
                        >
                          <div className='relative h-48'>
                            <img
                              src={item.image}
                              alt={item.title}
                              className='object-cover w-full h-full'
                            />
                            <button
                              onClick={() => handleRemoveFavorite(item.id)}
                              className='absolute p-2 transition-all bg-white rounded-full shadow-lg top-3 right-3 hover:bg-red-50'
                            >
                              <Heart className='w-5 h-5 text-red-500 fill-red-500' />
                            </button>
                          </div>
                          
                          <div className='p-4'>
                            <h3 className='mb-2 text-lg font-bold text-gray-800 line-clamp-1'>
                              {item.title}
                            </h3>
                            
                            <div className='mb-3 text-2xl font-bold text-[#1DBF73]'>
                              {item.price.toLocaleString()} {item.currency}
                            </div>

                            <div className='flex items-center justify-between mb-4 text-sm text-gray-600'>
                              <span>{item.seller}</span>
                              <div className='flex items-center gap-1'>
                                <MapPin className='w-4 h-4' />
                                <span>{item.location}</span>
                              </div>
                            </div>

                            <Link
                              to={`/equipment/${item.id}`}
                              className='block w-full py-3 text-center font-semibold text-white rounded-xl bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] hover:shadow-xl transition-all'
                            >
                              Voir les détails
                            </Link>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: Mes Achats (Acheteur) */}
              {activeTab === 'achats' && !isSeller && (
                <div>
                  <h2 className='mb-6 text-2xl font-bold text-gray-800'>Historique des achats</h2>
                  <div className='py-20 text-center'>
                    <ShoppingBag className='w-16 h-16 mx-auto mb-4 text-gray-300' />
                    <p className='text-gray-600'>Aucun achat pour le moment</p>
                  </div>
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