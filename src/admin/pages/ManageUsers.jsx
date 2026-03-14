import React, { useState, useEffect } from 'react';
import { Search, Eye, Shield, ShieldOff, RefreshCw, Users, UserCheck, UserX } from 'lucide-react';

const API_URL = 'https://api.medi-kado.com/api';
const getToken = () => localStorage.getItem('admin_token') || localStorage.getItem('auth_token');

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/users`, {
        headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (res.ok) {
        const list = data.data || data || [];
        setUsers(list);
        setTotal(data.total || list.length);
      }
    } catch {
      // Fallback mockdata si route admin pas encore prête
      const mock = [
        { id: 1, nom: 'Kofi Mensah', email: 'kofi@email.com', role: 'vendeur', telephone: '+229 97 00 00 01', pays: 'Bénin', statut: 'actif', badge_verifie: true, created_at: '2026-01-10' },
        { id: 2, nom: 'Amina Diallo', email: 'amina@email.com', role: 'acheteur', telephone: '+229 97 00 00 02', pays: 'Bénin', statut: 'actif', badge_verifie: false, created_at: '2026-01-15' },
        { id: 3, nom: 'Yao Kouassi', email: 'yao@email.com', role: 'vendeur', telephone: '+225 07 00 00 03', pays: "Côte d'Ivoire", statut: 'actif', badge_verifie: true, created_at: '2026-01-20' },
        { id: 4, nom: 'Fatou Ndiaye', email: 'fatou@email.com', role: 'acheteur', telephone: '+221 77 00 00 04', pays: 'Sénégal', statut: 'suspendu', badge_verifie: false, created_at: '2026-02-01' },
        { id: 5, nom: 'Ibrahim Sawadogo', email: 'ibrahim@email.com', role: 'vendeur', telephone: '+226 70 00 00 05', pays: 'Burkina Faso', statut: 'actif', badge_verifie: false, created_at: '2026-02-10' },
      ];
      setUsers(mock);
      setTotal(mock.length);
    } finally {
      setLoading(false);
    }
  };

  const filtered = users.filter(u => {
    const matchSearch = !search ||
      u.nom?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = !filterRole || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const roleStyle = (role) => {
    if (role === 'vendeur') return 'bg-[#1DBF73]/10 text-[#1DBF73]';
    if (role === 'acheteur') return 'bg-[#09B1BA]/10 text-[#09B1BA]';
    return 'bg-gray-100 text-gray-600';
  };

  const statutStyle = (statut) => {
    if (statut === 'actif') return 'bg-green-100 text-green-700';
    if (statut === 'suspendu') return 'bg-red-100 text-red-600';
    return 'bg-gray-100 text-gray-600';
  };

  // Stats rapides
  const vendeurs = users.filter(u => u.role === 'vendeur').length;
  const acheteurs = users.filter(u => u.role === 'acheteur').length;
  const verifies = users.filter(u => u.badge_verifie).length;

  return (
    <div className='min-h-full p-4 sm:p-6 bg-gray-50'>
      <div className='mx-auto max-w-7xl'>

        {/* En-tête */}
        <div className='flex flex-col justify-between gap-3 mb-6 sm:flex-row sm:items-center'>
          <div>
            <h1 className='text-xl font-bold text-gray-800'>Gestion des utilisateurs</h1>
            <p className='text-sm text-gray-500 mt-0.5'>{total} utilisateur(s) au total</p>
          </div>
          <button onClick={fetchUsers}
            className='flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] rounded-xl hover:shadow-md transition-all self-start sm:self-auto'>
            <RefreshCw className='w-4 h-4' />
            Actualiser
          </button>
        </div>

        {/* Stats rapides */}
        <div className='grid grid-cols-3 gap-3 mb-5'>
          {[
            { icon: Users, label: 'Total', value: total, color: 'text-gray-600', bg: 'bg-gray-50' },
            { icon: UserCheck, label: 'Vendeurs', value: vendeurs, color: 'text-[#1DBF73]', bg: 'bg-[#1DBF73]/5' },
            { icon: Shield, label: 'Vérifiés', value: verifies, color: 'text-[#09B1BA]', bg: 'bg-[#09B1BA]/5' },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className={`p-3 sm:p-4 rounded-xl border border-gray-100 shadow-sm ${bg} bg-white`}>
              <div className='flex items-center gap-2 mb-1'>
                <Icon className={`w-4 h-4 ${color}`} />
                <span className='text-xs text-gray-500'>{label}</span>
              </div>
              <p className='text-xl font-bold text-gray-800'>{value}</p>
            </div>
          ))}
        </div>

        {/* Filtres */}
        <div className='flex flex-col gap-3 mb-5 sm:flex-row'>
          <div className='relative flex-1'>
            <Search className='absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2' />
            <input type='text' value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Rechercher par nom ou email...'
              className='w-full pl-9 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#1DBF73] bg-white' />
          </div>
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}
            className='px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#1DBF73] bg-white cursor-pointer'>
            <option value=''>Tous les rôles</option>
            <option value='vendeur'>Vendeurs</option>
            <option value='acheteur'>Acheteurs</option>
          </select>
        </div>

        {/* Table */}
        <div className='overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl'>
          {loading ? (
            <div className='flex justify-center py-20'>
              <div className='w-8 h-8 border-4 border-[#1DBF73] rounded-full border-t-transparent animate-spin' />
            </div>
          ) : filtered.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-20'>
              <UserX className='w-12 h-12 mb-3 text-gray-200' />
              <p className='font-medium text-gray-500'>Aucun utilisateur trouvé</p>
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className='hidden overflow-x-auto sm:block'>
                <table className='w-full'>
                  <thead>
                    <tr className='border-b border-gray-100 bg-gray-50'>
                      <th className='px-4 py-3 text-xs font-semibold text-left text-gray-500 uppercase'>Utilisateur</th>
                      <th className='px-4 py-3 text-xs font-semibold text-left text-gray-500 uppercase'>Rôle</th>
                      <th className='px-4 py-3 text-xs font-semibold text-left text-gray-500 uppercase'>Pays</th>
                      <th className='px-4 py-3 text-xs font-semibold text-left text-gray-500 uppercase'>Statut</th>
                      <th className='px-4 py-3 text-xs font-semibold text-left text-gray-500 uppercase'>Vérifié</th>
                      <th className='px-4 py-3 text-xs font-semibold text-left text-gray-500 uppercase'>Inscrit le</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-50'>
                    {filtered.map((u) => (
                      <tr key={u.id} className='transition-colors hover:bg-gray-50'>
                        <td className='px-4 py-3'>
                          <div className='flex items-center gap-3'>
                            <div className='w-9 h-9 bg-gradient-to-br from-[#1DBF73] to-[#09B1BA] rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0'>
                              {(u.nom || 'U').slice(0, 2).toUpperCase()}
                            </div>
                            <div className='min-w-0'>
                              <p className='text-sm font-semibold text-gray-800 truncate'>{u.nom}</p>
                              <p className='text-xs text-gray-400 truncate'>{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className='px-4 py-3'>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-lg capitalize ${roleStyle(u.role)}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className='px-4 py-3'>
                          <p className='text-sm text-gray-600'>{u.pays || '—'}</p>
                        </td>
                        <td className='px-4 py-3'>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-lg ${statutStyle(u.statut)}`}>
                            {u.statut || 'actif'}
                          </span>
                        </td>
                        <td className='px-4 py-3'>
                          {u.badge_verifie
                            ? <Shield className='w-4 h-4 text-[#1DBF73]' />
                            : <ShieldOff className='w-4 h-4 text-gray-300' />}
                        </td>
                        <td className='px-4 py-3'>
                          <p className='text-xs text-gray-500'>
                            {u.created_at ? new Date(u.created_at).toLocaleDateString('fr-FR') : '—'}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className='divide-y sm:hidden divide-gray-50'>
                {filtered.map((u) => (
                  <div key={u.id} className='p-4'>
                    <div className='flex items-start gap-3'>
                      <div className='w-10 h-10 bg-gradient-to-br from-[#1DBF73] to-[#09B1BA] rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0'>
                        {(u.nom || 'U').slice(0, 2).toUpperCase()}
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center justify-between gap-2'>
                          <p className='text-sm font-semibold text-gray-800 truncate'>{u.nom}</p>
                          {u.badge_verifie
                            ? <Shield className='w-4 h-4 text-[#1DBF73] flex-shrink-0' />
                            : <ShieldOff className='flex-shrink-0 w-4 h-4 text-gray-300' />}
                        </div>
                        <p className='text-xs text-gray-400 truncate mt-0.5'>{u.email}</p>
                        <div className='flex flex-wrap items-center gap-2 mt-2'>
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded-lg capitalize ${roleStyle(u.role)}`}>
                            {u.role}
                          </span>
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded-lg ${statutStyle(u.statut)}`}>
                            {u.statut || 'actif'}
                          </span>
                          <span className='text-xs text-gray-400'>{u.pays}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}