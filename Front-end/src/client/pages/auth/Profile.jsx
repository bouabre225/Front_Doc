import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, X, Edit } from 'lucide-react';
import {
  User, Mail, Phone, MapPin, Package, ShoppingBag,
  LogOut, Trash2, Eye, Calendar, AlertCircle,
  MessageSquare, Shield, CheckCircle, Clock,
  XCircle, Truck, AlertTriangle, ChevronRight
} from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { getMe, getCommandes, getMyAnnonces, deleteAnnonce, logoutUser, getImageUrl, getKycStatus, updateProfile, getCommandesRecues } from '../../../services/api';


// ─── Helpers ────────────────────────────────────────────────────────────────

const STATUT_CONFIG = {
  en_attente: { label: 'En attente',  color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  expediee:   { label: 'Expédiée',    color: 'bg-blue-100 text-blue-700',     icon: Truck },
  livree:     { label: 'Livrée',      color: 'bg-green-100 text-green-700',   icon: CheckCircle },
  cloturee:   { label: 'Clôturée',    color: 'bg-gray-100 text-gray-600',     icon: CheckCircle },
  annulee:    { label: 'Annulée',     color: 'bg-red-100 text-red-700',       icon: XCircle },
  litige:     { label: 'Litige',      color: 'bg-orange-100 text-orange-700', icon: AlertTriangle },
};

const StatutBadge = ({ statut }) => {
  const cfg = STATUT_CONFIG[statut] || { label: statut, color: 'bg-gray-100 text-gray-600', icon: Clock };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${cfg.color}`}>
      <Icon className='w-3 h-3' />
      {cfg.label}
    </span>
  );
};

// ─── Composant principal ─────────────────────────────────────────────────────

function Profile() {
  const navigate = useNavigate();

  const [user, setUser]               = useState(null);
  const [activeTab, setActiveTab] = useState('achats');
  const [myAnnonces, setMyAnnonces]   = useState([]);
  const [myCommandes, setMyCommandes] = useState([]);
  const [kycStatus, setKycStatus]     = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);  
  const isSeller = user?.role === 'vendeur';

  useEffect(() => {
    if (!localStorage.getItem('auth_token')) {
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
      const u = meData.user;
      setUser(u);
      setActiveTab(u.role === 'vendeur' ? 'annonces' : 'achats');

      // Commandes (filtrées par user côté back)
      try {
        const commandesData = await getCommandes();
        const raw  = commandesData?.data?.data ?? commandesData?.data ?? commandesData;
        setMyCommandes(Array.isArray(raw) ? raw : []);
      } catch (_) {
        //
      }

      // Annonces du vendeur — route dédiée
      if (u.role === 'vendeur') {
        try {
          const annoncesData = await getMyAnnonces();
          const raw = annoncesData?.data?.data ?? annoncesData?.data ?? annoncesData;
          setMyAnnonces(Array.isArray(raw) ? raw : []);
        } catch (_) {
          //
        }

        try {
          const kyc = await getKycStatus();
          setKycStatus(kyc);
        } catch (_) {
          //
        }
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
    try { await logoutUser(); } catch (_) {
      //
    }
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('storage'));
    navigate('/');
  };

  const handleEditOpen = () => {
    setEditForm({
      nom: user?.nom || '',
      telephone: user?.telephone || '',
      pays: user?.pays || '',
      adresse: user?.adresse || '',
    });
    setSaveError('');
    setSaveSuccess(false);
    setEditMode(true);
  };

  const handleEditSave = async () => {
    setSaving(true);
    setSaveError('');
    try {
      const data = await updateProfile(editForm);

      
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.dispatchEvent(new Event('storage'));
      setSaveSuccess(true);
      setTimeout(() => {
        setEditMode(false);
        setSaveSuccess(false);
      }, 1500);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAnnonce = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette annonce ?')) return;
    try {
      await deleteAnnonce(id);
      setMyAnnonces(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      alert('Erreur : ' + err.message);
    }
  };

  // ─── États de chargement / erreur ─────────────────────────────────────────

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

  // ─── Tabs config ──────────────────────────────────────────────────────────

  const sellerTabs = [
    { key: 'annonces',  label: 'Mes annonces',      icon: Package },
    { key: 'commandes', label: 'Commandes reçues',   icon: ShoppingBag },
    { key: 'messages',  label: 'Messages',           icon: MessageSquare },
    { key: 'kyc',       label: 'Vérification KYC',   icon: Shield },
  ];

  const buyerTabs = [
    { key: 'achats',    label: 'Mes achats',         icon: ShoppingBag },
    { key: 'messages',  label: 'Messages',           icon: MessageSquare },
  ];

  const tabs = isSeller ? sellerTabs : buyerTabs;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className='min-h-screen bg-gray-50'>
      <Header />

      <div className='container max-w-6xl px-4 py-10 mx-auto'>
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-4'>

          {/* ── Sidebar ─────────────────────────────────────────────────── */}
          <div className='lg:col-span-1 space-y-4'>

            {/* Carte profil */}
            <div className='p-6 bg-white border border-gray-100 shadow-sm rounded-2xl'>
              <div className='flex flex-col items-center mb-6'>
                <div className='relative mb-3'>
                  <div className='flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#1DBF73] to-[#09B1BA]'>
                    <User className='w-10 h-10 text-white' />
                  </div>
                  {user?.verifie_kyc && (
                    <span className='absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white'>
                      <CheckCircle className='w-3.5 h-3.5 text-white' />
                    </span>
                  )}
                </div>
                <h2 className='text-lg font-bold text-gray-900 text-center'>{user?.nom}</h2>
                <span className={`mt-1 px-3 py-1 text-xs font-semibold rounded-full ${
                  isSeller ? 'bg-[#09B1BA]/10 text-[#09B1BA]' : 'bg-[#1DBF73]/10 text-[#1DBF73]'
                }`}>
                  {isSeller ? 'Vendeur' : 'Acheteur'}
                </span>
                {isSeller && user?.type_compte && (
                  <span className='mt-1 text-xs text-gray-400 capitalize'>{user.type_compte}</span>
                )}
              </div>

              {/* Infos contact */}
              <div className='space-y-2.5 pb-5 mb-5 border-b border-gray-100'>
                <div className='flex items-center gap-2 text-sm text-gray-600'>
                  <Mail className='w-4 h-4 text-[#1DBF73] shrink-0' />
                  <span className='truncate'>{user?.email}</span>
                </div>
                {user?.telephone && (
                  <div className='flex items-center gap-2 text-sm text-gray-600'>
                    <Phone className='w-4 h-4 text-[#1DBF73] shrink-0' />
                    <span>{user.telephone}</span>
                  </div>
                )}
                {user?.pays && (
                  <div className='flex items-center gap-2 text-sm text-gray-600'>
                    <MapPin className='w-4 h-4 text-[#1DBF73] shrink-0' />
                    <span>{user.pays}</span>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <nav className='space-y-1 mb-5'>
                {tabs.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      activeTab === key
                        ? 'bg-[#1DBF73]/10 text-[#1DBF73]'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className='flex items-center gap-3'>
                      <Icon className='w-4 h-4' />
                      {label}
                    </span>
                    <ChevronRight className='w-3.5 h-3.5 opacity-40' />
                  </button>
                ))}
              </nav>

              {/* Bouton Modifier profil */}
              <button
                onClick={handleEditOpen}
                className='w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#1DBF73] hover:bg-[#1DBF73]/5 rounded-xl transition-all mb-1'
              >
                <Edit className='w-4 h-4' />
                Modifier mon profil
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className='w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-all'
              >
                <LogOut className='w-4 h-4' />
                Se déconnecter
              </button>
            </div>

            {/* Stats rapides */}
            <div className='p-4 bg-white border border-gray-100 shadow-sm rounded-2xl'>
              <p className='text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3'>Statistiques</p>
              <div className='grid grid-cols-2 gap-3'>
                {isSeller ? (
                  <>
                    <div className='text-center p-3 bg-[#1DBF73]/5 rounded-xl'>
                      <p className='text-2xl font-bold text-[#1DBF73]'>{myAnnonces.length}</p>
                      <p className='text-xs text-gray-500 mt-0.5'>Annonces</p>
                    </div>
                    <div className='text-center p-3 bg-[#09B1BA]/5 rounded-xl'>
                      <p className='text-2xl font-bold text-[#09B1BA]'>{myCommandes.length}</p>
                      <p className='text-xs text-gray-500 mt-0.5'>Commandes</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className='text-center p-3 bg-[#1DBF73]/5 rounded-xl'>
                      <p className='text-2xl font-bold text-[#1DBF73]'>{myCommandes.length}</p>
                      <p className='text-xs text-gray-500 mt-0.5'>Achats</p>
                    </div>
                    <div className='text-center p-3 bg-[#09B1BA]/5 rounded-xl'>
                      <p className='text-2xl font-bold text-[#09B1BA]'>
                        {myCommandes.filter(c => c.statut === 'livree').length}
                      </p>
                      <p className='text-xs text-gray-500 mt-0.5'>Livrés</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ── Contenu principal ─────────────────────────────────────────── */}
          <div className='lg:col-span-3'>
            <AnimatePresence mode='wait'>
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className='p-6 bg-white border border-gray-100 shadow-sm rounded-2xl'
              >

                {/* ── Mes annonces (vendeur) ────────────────────────────── */}
                {activeTab === 'annonces' && (
                  <div>
                    <div className='flex items-center justify-between mb-6'>
                      <h2 className='text-xl font-bold text-gray-800'>Mes annonces</h2>
                      <Link
                        to='/publish-equipment'
                        className='px-4 py-2 bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all'
                      >
                        + Nouvelle
                      </Link>
                    </div>

                    {myAnnonces.length === 0 ? (
                      <div className='py-20 text-center'>
                        <Package className='w-16 h-16 mx-auto mb-4 text-gray-200' />
                        <p className='text-gray-500 mb-4'>Aucune annonce publiée.</p>
                        <Link to='/publish-equipment' className='inline-block px-6 py-3 bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white font-semibold rounded-xl'>
                          Publier ma première annonce
                        </Link>
                      </div>
                    ) : (
                      <div className='space-y-3'>
                        {myAnnonces.map((annonce) => (
                          <motion.div
                            key={annonce.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className='flex gap-4 p-4 border border-gray-100 rounded-2xl hover:border-[#1DBF73]/30 hover:shadow-sm transition-all'
                          >
                            <div className='w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0'>
                              {annonce.images?.[0] ? (
                                <img src={getImageUrl(annonce.images[0].image_url)} alt={annonce.titre} className='object-cover w-full h-full' />
                              ) : (
                                <div className='flex items-center justify-center w-full h-full text-3xl'>🏥</div>
                              )}
                            </div>
                            <div className='flex-1 min-w-0'>
                              <h3 className='font-bold text-gray-900 truncate'>{annonce.titre}</h3>
                              <p className='text-xs text-gray-400 mt-0.5'>{annonce.categorie} · {annonce.etat}</p>
                              <p className='text-base font-bold text-[#1DBF73] mt-1'>
                                {Number(annonce.prix_vendeur).toLocaleString('fr-FR')} FCFA
                              </p>
                            </div>
                            <div className='flex flex-col gap-2 shrink-0'>
                              <Link to={`/equipment/${annonce.id}`} className='flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all'>
                                <Eye className='w-3.5 h-3.5' /> Voir
                              </Link>
                              <button onClick={() => handleDeleteAnnonce(annonce.id)} className='flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-all'>
                                <Trash2 className='w-3.5 h-3.5' /> Suppr.
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── Commandes reçues (vendeur) ────────────────────────── */}
                {activeTab === 'commandes' && (
                  <div>
                    <h2 className='mb-6 text-xl font-bold text-gray-800'>Commandes reçues</h2>
                    {myCommandes.length === 0 ? (
                      <div className='py-20 text-center'>
                        <ShoppingBag className='w-16 h-16 mx-auto mb-4 text-gray-200' />
                        <p className='text-gray-500'>Aucune commande reçue.</p>
                      </div>
                    ) : (
                      <div className='space-y-3'>
                        {myCommandes.map((cmd) => (
                          <Link key={cmd.id} to={`/commandes/${cmd.id}`} className='block p-4 border border-gray-100 rounded-2xl hover:border-[#1DBF73]/30 hover:shadow-sm transition-all'>
                            <div className='flex items-center justify-between'>
                              <div>
                                <p className='font-semibold text-gray-900 text-sm'>
                                  {cmd.annonce?.titre || `Commande #${String(cmd.id ?? '').slice(0, 8)}`}
                                </p>
                                <p className='text-xs text-gray-400 mt-0.5 flex items-center gap-1'>
                                  <Calendar className='w-3 h-3' />
                                  {new Date(cmd.created_at).toLocaleDateString('fr-FR')}
                                </p>
                              </div>
                              <div className='flex flex-col items-end gap-2'>
                                <StatutBadge statut={cmd.statut} />
                                {cmd.prix_total != null && !isNaN(Number(cmd.prix_total)) && (
                                  <p className='text-sm font-bold text-[#1DBF73]'>
                                    {Number(cmd.prix_total).toLocaleString('fr-FR')} FCFA
                                  </p>
                                )}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── Achats (acheteur) ─────────────────────────────────── */}
                {activeTab === 'achats' && (
                  <div>
                    <h2 className='mb-6 text-xl font-bold text-gray-800'>Historique des achats</h2>
                    {myCommandes.length === 0 ? (
                      <div className='py-20 text-center'>
                        <ShoppingBag className='w-16 h-16 mx-auto mb-4 text-gray-200' />
                        <p className='text-gray-500 mb-4'>Aucun achat pour le moment.</p>
                        <Link to='/explore' className='inline-block px-6 py-3 bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white font-semibold rounded-xl'>
                          Explorer les équipements
                        </Link>
                      </div>
                    ) : (
                      <div className='space-y-3'>
                        {myCommandes.map((cmd) => (
                          <Link key={cmd.id} to={`/commandes/${cmd.id}`} className='block p-4 border border-gray-100 rounded-2xl hover:border-[#1DBF73]/30 hover:shadow-sm transition-all'>
                            <div className='flex items-center justify-between'>
                              <div>
                                <p className='font-semibold text-gray-900 text-sm'>
                                  {cmd.annonce?.titre || `Commande #${String(cmd.id ?? '').slice(0, 8)}`}
                                </p>
                                <p className='text-xs text-gray-400 mt-0.5 flex items-center gap-1'>
                                  <Calendar className='w-3 h-3' />
                                  {new Date(cmd.created_at).toLocaleDateString('fr-FR')}
                                </p>
                              </div>
                              <div className='flex flex-col items-end gap-2'>
                                <StatutBadge statut={cmd.statut} />
                                {cmd.prix_total != null && !isNaN(Number(cmd.prix_total)) && (
                                  <p className='text-sm font-bold text-[#1DBF73]'>
                                    {Number(cmd.prix_total).toLocaleString('fr-FR')} FCFA
                                  </p>
                                )}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── Messages ──────────────────────────────────────────── */}
                {activeTab === 'messages' && (
                  <div className='py-20 text-center'>
                    <MessageSquare className='w-16 h-16 mx-auto mb-4 text-gray-200' />
                    <p className='text-gray-500 mb-4'>Accédez à vos conversations</p>
                    <Link to='/messages' className='inline-block px-6 py-3 bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white font-semibold rounded-xl'>
                      Ouvrir la messagerie
                    </Link>
                  </div>
                )}

                {/* ── KYC (vendeur) ─────────────────────────────────────── */}
                {activeTab === 'kyc' && (
                  <div>
                    <h2 className='mb-6 text-xl font-bold text-gray-800'>Vérification KYC</h2>

                    {/* Statut actuel */}
                    <div className={`p-4 rounded-2xl mb-6 flex items-center gap-4 ${
                      user?.verifie_kyc
                        ? 'bg-green-50 border border-green-200'
                        : kycStatus?.kyc_document?.statut === 'en_attente'
                        ? 'bg-yellow-50 border border-yellow-200'
                        : kycStatus?.kyc_document?.statut === 'refuse'
                        ? 'bg-red-50 border border-red-200'
                        : 'bg-gray-50 border border-gray-200'
                    }`}>
                      {user?.verifie_kyc ? (
                        <>
                          <CheckCircle className='w-8 h-8 text-green-500 shrink-0' />
                          <div>
                            <p className='font-bold text-green-700'>Compte vérifié</p>
                            <p className='text-sm text-green-600'>Votre identité a été validée avec succès.</p>
                          </div>
                        </>
                      ) : kycStatus?.kyc_document?.statut === 'en_attente' ? (
                        <>
                          <Clock className='w-8 h-8 text-yellow-500 shrink-0' />
                          <div>
                            <p className='font-bold text-yellow-700'>En cours de vérification</p>
                            <p className='text-sm text-yellow-600'>Votre document est en attente de validation.</p>
                          </div>
                        </>
                      ) : kycStatus?.kyc_document?.statut === 'refuse' ? (
                        <>
                          <XCircle className='w-8 h-8 text-red-500 shrink-0' />
                          <div>
                            <p className='font-bold text-red-700'>Document refusé</p>
                            <p className='text-sm text-red-600'>Veuillez soumettre un nouveau document.</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <Shield className='w-8 h-8 text-gray-400 shrink-0' />
                          <div>
                            <p className='font-bold text-gray-700'>Non vérifié</p>
                            <p className='text-sm text-gray-500'>Soumettez un document pour vérifier votre compte.</p>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Bouton soumettre si pas encore vérifié */}
                    {!user?.verifie_kyc && kycStatus?.kyc_document?.statut !== 'en_attente' && (
                      <Link
                        to='/seller/kyc'
                        className='inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white font-semibold rounded-xl hover:shadow-lg transition-all'
                      >
                        <Shield className='w-4 h-4' />
                        Soumettre mon document KYC
                      </Link>
                    )}
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>

      {/* ── Modal édition profil ──────────────────────────────────────────── */}
      {editMode && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm'>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className='w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden'
          >
            {/* Header modal */}
            <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100'>
              <div className='flex items-center gap-3'>
                <div className='w-9 h-9 rounded-xl bg-gradient-to-br from-[#1DBF73] to-[#09B1BA] flex items-center justify-center'>
                  <Edit className='w-4 h-4 text-white' />
                </div>
                <h3 className='text-lg font-bold text-gray-900'>Modifier mon profil</h3>
              </div>
              <button
                onClick={() => setEditMode(false)}
                className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all'
              >
                <X className='w-4 h-4' />
              </button>
            </div>

            {/* Body modal */}
            <div className='px-6 py-5 space-y-4'>

              {/* Succès */}
              {saveSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className='flex items-center gap-2 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl'
                >
                  <CheckCircle className='w-4 h-4 shrink-0' />
                  Profil mis à jour avec succès !
                </motion.div>
              )}

              {/* Erreur */}
              {saveError && (
                <div className='flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl'>
                  <AlertCircle className='w-4 h-4 shrink-0' />
                  {saveError}
                </div>
              )}

              {/* Avatar preview */}
              <div className='flex items-center gap-4 p-4 bg-gray-50 rounded-xl'>
                <div className='w-14 h-14 rounded-full bg-gradient-to-br from-[#1DBF73] to-[#09B1BA] flex items-center justify-center shrink-0'>
                  <User className='w-7 h-7 text-white' />
                </div>
                <div>
                  <p className='font-semibold text-gray-900'>{editForm.nom || user?.nom}</p>
                  <p className='text-sm text-gray-500'>{user?.email}</p>
                  <span className={`mt-1 inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${
                    isSeller ? 'bg-[#09B1BA]/10 text-[#09B1BA]' : 'bg-[#1DBF73]/10 text-[#1DBF73]'
                  }`}>
                    {isSeller ? 'Vendeur' : 'Acheteur'}
                  </span>
                </div>
              </div>

              {/* Champ Nom */}
              <div>
                <label className='block mb-1.5 text-sm font-semibold text-gray-700'>
                  Nom complet
                </label>
                <div className='relative'>
                  <User className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1DBF73]' />
                  <input
                    type='text'
                    value={editForm.nom}
                    onChange={(e) => setEditForm(prev => ({ ...prev, nom: e.target.value }))}
                    className='w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 transition-all'
                    placeholder='Votre nom complet'
                  />
                </div>
              </div>

              {/* Champ Téléphone */}
              <div>
                <label className='block mb-1.5 text-sm font-semibold text-gray-700'>
                  Téléphone <span className='text-[#1DBF73] font-normal text-xs'>(requis pour les paiements FedaPay)</span>
                </label>
                <div className='relative'>
                  <Phone className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1DBF73]' />
                  <input
                    type='tel'
                    value={editForm.telephone}
                    onChange={(e) => setEditForm(prev => ({ ...prev, telephone: e.target.value }))}
                    className='w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 transition-all'
                    placeholder='+229 XX XX XX XX'
                  />
                </div>
              </div>

              {/* Champ Pays */}
              <div>
                <label className='block mb-1.5 text-sm font-semibold text-gray-700'>
                  Pays
                </label>
                <div className='relative'>
                  <MapPin className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1DBF73]' />
                  <input
                    type='text'
                    value={editForm.pays}
                    onChange={(e) => setEditForm(prev => ({ ...prev, pays: e.target.value }))}
                    className='w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 transition-all'
                    placeholder='Bénin, France...'
                  />
                </div>
              </div>

              {/* Champ Adresse */}
              <div>
                <label className='block mb-1.5 text-sm font-semibold text-gray-700'>
                  Adresse
                </label>
                <div className='relative'>
                  <MapPin className='absolute left-3 top-3 w-4 h-4 text-[#1DBF73]' />
                  <textarea
                    value={editForm.adresse}
                    onChange={(e) => setEditForm(prev => ({ ...prev, adresse: e.target.value }))}
                    rows={2}
                    className='w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 transition-all resize-none'
                    placeholder='Votre adresse'
                  />
                </div>
              </div>

              {/* Email (non modifiable) */}
              <div>
                <label className='block mb-1.5 text-sm font-semibold text-gray-700'>
                  Email <span className='text-gray-400 font-normal text-xs'>(non modifiable)</span>
                </label>
                <div className='relative'>
                  <Mail className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300' />
                  <input
                    type='email'
                    value={user?.email}
                    disabled
                    className='w-full pl-10 pr-4 py-2.5 border-2 border-gray-100 rounded-xl text-sm text-gray-400 bg-gray-50 cursor-not-allowed'
                  />
                </div>
              </div>
            </div>

            {/* Footer modal */}
            <div className='flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50'>
              <button
                onClick={() => setEditMode(false)}
                className='flex-1 py-2.5 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-100 transition-all text-sm'
              >
                Annuler
              </button>
              <motion.button
                onClick={handleEditSave}
                disabled={saving}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className='flex-1 py-2.5 bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2'
              >
                {saving ? (
                  <>
                    <div className='w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin' />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className='w-4 h-4' />
                    Enregistrer
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Profile;