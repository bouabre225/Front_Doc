import React, { useState, useEffect, useCallback } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from 'recharts';
import { RefreshCw, Download, TrendingUp, ShoppingCart, Users, Package, Star, AlertTriangle } from 'lucide-react';
import { getAdminStats } from '../../services/api';

const COLORS = ['#1DBF73', '#09B1BA', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b', '#14b8a6'];
const fmt = (n) => Number(n || 0).toLocaleString('fr-FR');

const Kpi = ({ label, value, sub }) => (
  <div className='p-4 bg-white border border-gray-100 rounded-2xl shadow-sm'>
    <p className='text-xs font-semibold text-gray-400 uppercase tracking-wide'>{label}</p>
    <p className='mt-1 text-2xl font-black text-gray-900'>{value}</p>
    {sub && <p className='mt-1 text-xs text-gray-500'>{sub}</p>}
  </div>
);

const Section = ({ title, icon: Icon, children, action }) => (
  <div className='p-4 sm:p-6 bg-white border border-gray-100 rounded-2xl shadow-sm'>
    <div className='flex items-center justify-between mb-4'>
      <h2 className='flex items-center gap-2 text-base font-bold text-gray-800'>
        {Icon && <Icon className='w-5 h-5 text-[#1DBF73]' />}
        {title}
      </h2>
      {action}
    </div>
    {children}
  </div>
);

const toCSV = (rows) => {
  if (!rows?.length) return '';
  const head = Object.keys(rows[0]);
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [head.join(','), ...rows.map((r) => head.map((h) => esc(r[h])).join(','))].join('\n');
};

const downloadCSV = (name, rows) => {
  const blob = new Blob([toCSV(rows)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export default function AdminStats() {
  const [periode, setPeriode] = useState('30j');
  const [categorie, setCategorie] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = { periode };
      if (categorie) params.categorie = categorie;
      setData(await getAdminStats(params));
    } catch (e) {
      setError(e.message || 'Chargement impossible');
    } finally {
      setLoading(false);
    }
  }, [periode, categorie]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const k = data?.kpis;
  const serie = (data?.serie || []).map((s) => ({ ...s, ca: Number(s.ca), commandes: Number(s.commandes) }));
  const cats = data?.par_categorie || [];

  return (
    <div className='min-h-full p-4 sm:p-6 bg-gray-50'>
      <div className='mx-auto max-w-7xl space-y-6'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h1 className='text-xl font-bold text-gray-800'>Statistiques plateforme</h1>
            <p className='text-sm text-gray-500 mt-0.5'>Orientation ventes, produits et utilisateurs</p>
          </div>
          <div className='flex flex-wrap items-center gap-2'>
            <select value={periode} onChange={(e) => setPeriode(e.target.value)} className='px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white'>
              <option value='7j'>7 jours</option>
              <option value='30j'>30 jours</option>
              <option value='90j'>90 jours</option>
              <option value='365j'>12 mois</option>
              <option value='tout'>Tout</option>
            </select>
            <input value={categorie} onChange={(e) => setCategorie(e.target.value)} placeholder='Filtrer catégorie...' className='px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white w-44' />
            <button onClick={fetchStats} disabled={loading} className='flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] rounded-xl disabled:opacity-50'>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Actualiser
            </button>
          </div>
        </div>

        {error && <div className='p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl'>{error}</div>}

        {loading && !data ? (
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 animate-pulse'>
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className='h-24 bg-white border border-gray-100 rounded-2xl' />)}
          </div>
        ) : k && (
          <>
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
              <Kpi label="CA total" value={`${fmt(k.ca_total)} FCFA`} sub={`Revenus plateforme (8%) : ${fmt(k.revenus_plateforme)}`} />
              <Kpi label='Commandes' value={fmt(k.commandes_total)} sub={`${fmt(k.commandes_payees)} payées • conversion ${k.taux_conversion}%`} />
              <Kpi label='Panier moyen' value={`${fmt(k.panier_moyen)} FCFA`} sub={`Annulation ${k.taux_annulation}% • Litiges ${k.taux_litige}%`} />
              <Kpi label='Utilisateurs' value={fmt(k.users_total)} sub={`${fmt(k.vendeurs)} vendeurs • ${fmt(k.acheteurs)} acheteurs • KYC ${k.kyc_valide_pct}%`} />
              <Kpi label='Annonces actives' value={fmt(k.annonces_actives)} sub={`${fmt(k.nouvelles_annonces)} nouvelles • ${fmt(k.ruptures)} ruptures`} />
              <Kpi label='Stock mort' value={fmt(k.stock_mort)} sub='actives sans aucune vente' />
              <Kpi label='Avis' value={`${data.avis.note_vendeur}/5`} sub={`${fmt(data.avis.total)} avis • ${fmt(data.avis.commandes_notees)} commandes notées`} />
              <Kpi label='Paiements' value={data.paiements.delai_moyen_heures != null ? `${data.paiements.delai_moyen_heures}h` : '—'} sub={`délai moyen • ${data.paiements.echoues}/${data.paiements.total} échoués`} />
            </div>

            <Section title='CA & commandes par jour' icon={TrendingUp}>
              <div className='h-64'>
                <ResponsiveContainer width='100%' height='100%'>
                  <AreaChart data={serie}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='date' tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Area type='monotone' dataKey='ca' name='CA (FCFA)' stroke='#1DBF73' fill='#1DBF73' fillOpacity={0.2} />
                    <Area type='monotone' dataKey='commandes' name='Commandes' stroke='#09B1BA' fill='#09B1BA' fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Section>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              <Section title='CA par catégorie' icon={Package} action={<button onClick={() => downloadCSV('ca-par-categorie.csv', cats)} className='flex items-center gap-1 text-xs font-semibold text-[#1DBF73]'><Download className='w-3.5 h-3.5' /> CSV</button>}>
                {cats.length ? (
                  <div className='h-64'>
                    <ResponsiveContainer width='100%' height='100%'>
                      <PieChart>
                        <Pie data={cats} dataKey='ca' nameKey='categorie' outerRadius={90} label={({ categorie, percent }) => `${(percent * 100).toFixed(0)}%`}>
                          {cats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(v) => `${fmt(v)} FCFA`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : <p className='text-sm text-gray-400'>Aucune donnée</p>}
                <div className='mt-3 overflow-x-auto'>
                  <table className='w-full text-sm'>
                    <thead><tr className='text-left text-xs text-gray-400'><th className='py-1'>Catégorie</th><th className='text-right'>Cmds</th><th className='text-right'>CA</th><th className='text-right'>Panier</th></tr></thead>
                    <tbody>{cats.map((c) => <tr key={c.categorie} className='border-t border-gray-50'><td className='py-1.5 font-medium'>{c.categorie}</td><td className='text-right'>{c.commandes}</td><td className='text-right font-bold text-[#1DBF73]'>{fmt(c.ca)}</td><td className='text-right'>{fmt(c.panier_moyen)}</td></tr>)}</tbody>
                  </table>
                </div>
              </Section>

              <Section title='Tunnel des commandes' icon={ShoppingCart}>
                <div className='space-y-2'>
                  {(data.funnel || []).sort((a, b) => b.total - a.total).map((f) => {
                    const max = Math.max(...(data.funnel || []).map((x) => x.total), 1);
                    return (
                      <div key={f.statut}>
                        <div className='flex justify-between text-xs mb-1'><span className='font-semibold capitalize'>{f.statut.replace('_', ' ')}</span><span>{f.total}</span></div>
                        <div className='h-2 bg-gray-100 rounded-full'><div className='h-2 bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] rounded-full' style={{ width: `${(f.total / max) * 100}%` }} /></div>
                      </div>
                    );
                  })}
                </div>
                <div className='mt-4 grid grid-cols-2 gap-3 text-sm'>
                  <div className='p-3 bg-gray-50 rounded-xl'><p className='text-xs text-gray-400'>Par état produit</p>{(data.par_etat || []).map((e) => <p key={e.etat} className='flex justify-between'><span>{e.etat}</span><b>{fmt(e.ca)}</b></p>)}</div>
                  <div className='p-3 bg-gray-50 rounded-xl'><p className='text-xs text-gray-400'>Par pays vendeur</p>{(data.par_pays || []).map((p) => <p key={p.pays || '?'} className='flex justify-between'><span>{p.pays || '—'}</span><b>{fmt(p.ca)}</b></p>)}</div>
                </div>
              </Section>
            </div>

            <Section title='Top 10 produits (CA)' icon={TrendingUp} action={<button onClick={() => downloadCSV('top-produits.csv', data.top_produits)} className='flex items-center gap-1 text-xs font-semibold text-[#1DBF73]'><Download className='w-3.5 h-3.5' /> CSV</button>}>
              <div className='h-72'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={(data.top_produits || []).map((p) => ({ ...p, nom: (p.titre || '').slice(0, 22) }))} layout='vertical'>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis type='number' tick={{ fontSize: 11 }} />
                    <YAxis type='category' dataKey='nom' width={140} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => fmt(v)} />
                    <Bar dataKey='ca' name='CA (FCFA)' fill='#1DBF73' radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Section>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              <Section title='Top vendeurs' icon={Users} action={<button onClick={() => downloadCSV('top-vendeurs.csv', data.top_vendeurs)} className='flex items-center gap-1 text-xs font-semibold text-[#1DBF73]'><Download className='w-3.5 h-3.5' /> CSV</button>}>
                <table className='w-full text-sm'>
                  <thead><tr className='text-left text-xs text-gray-400'><th className='py-1'>Vendeur</th><th className='text-right'>Cmds</th><th className='text-right'>CA</th></tr></thead>
                  <tbody>{(data.top_vendeurs || []).map((v) => <tr key={v.id} className='border-t border-gray-50'><td className='py-1.5'><p className='font-medium'>{v.nom}</p><p className='text-xs text-gray-400'>{v.email}</p></td><td className='text-right'>{v.commandes}</td><td className='text-right font-bold text-[#1DBF73]'>{fmt(v.ca)}</td></tr>)}</tbody>
                </table>
              </Section>
              <Section title='Top acheteurs' icon={Users} action={<button onClick={() => downloadCSV('top-acheteurs.csv', data.top_acheteurs)} className='flex items-center gap-1 text-xs font-semibold text-[#1DBF73]'><Download className='w-3.5 h-3.5' /> CSV</button>}>
                <table className='w-full text-sm'>
                  <thead><tr className='text-left text-xs text-gray-400'><th className='py-1'>Acheteur</th><th className='text-right'>Cmds</th><th className='text-right'>Total</th></tr></thead>
                  <tbody>{(data.top_acheteurs || []).map((a) => <tr key={a.id} className='border-t border-gray-50'><td className='py-1.5'><p className='font-medium'>{a.nom}</p><p className='text-xs text-gray-400'>{a.email}</p></td><td className='text-right'>{a.commandes}</td><td className='text-right font-bold'>{fmt(a.montant)}</td></tr>)}</tbody>
                </table>
              </Section>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
              <Section title='Sans vente (top 10 anciens)' icon={Package}>
                {(data.sans_vente || []).length ? <table className='w-full text-sm'><tbody>{data.sans_vente.map((a) => <tr key={a.id} className='border-t border-gray-50 first:border-0'><td className='py-1.5'><p className='font-medium'>{a.titre}</p><p className='text-xs text-gray-400'>{a.categorie} • {fmt(a.prix_total)} FCFA</p></td></tr>)}</tbody></table> : <p className='text-sm text-gray-400'>Aucun</p>}
              </Section>
              <Section title='Litiges & KYC' icon={AlertTriangle}>
                <p className='text-sm'>Litiges : <b>{data.litiges.total}</b>{data.litiges.delai_resolution_jours != null && <> • résolution ~<b>{data.litiges.delai_resolution_jours}j</b></>}</p>
                {(data.litiges.par_motif || []).map((m) => <p key={m.motif} className='text-sm flex justify-between'><span>{m.motif}</span><b>{m.total}</b></p>)}
                <p className='text-sm mt-3'>KYC : {(data.kyc_funnel || []).map((s) => `${s.statut} ${s.total}`).join(' • ')}</p>
              </Section>
              <Section title='Avis par catégorie' icon={Star}>
                {(data.avis.par_categorie || []).length ? (data.avis.par_categorie || []).map((c) => <p key={c.categorie} className='text-sm flex justify-between'><span>{c.categorie} ({c.total})</span><b>★ {c.note}</b></p>) : <p className='text-sm text-gray-400'>Aucun avis</p>}
              </Section>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
