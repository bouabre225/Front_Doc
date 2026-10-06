import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { RefreshCw, Package, AlertTriangle, Star } from 'lucide-react';
import { getStatsVendeur } from '../../../services/api';
import { useLang } from '../../context/LangContext';
import { getLocale } from '../../i18n/format';

const fmt = (n) => Number(n || 0).toLocaleString(getLocale());

const Kpi = ({ label, value, sub, alert }) => (
  <div className={`p-4 bg-white border rounded-2xl shadow-sm ${alert ? 'border-orange-300' : 'border-gray-100'}`}>
    <p className='text-xs font-semibold text-gray-400 uppercase tracking-wide'>{label}</p>
    <p className='mt-1 text-2xl font-black text-gray-900'>{value}</p>
    {sub && <p className='mt-1 text-xs text-gray-500'>{sub}</p>}
  </div>
);

export default function VendeurStats() {
  const { t } = useLang();
  const [periode, setPeriode] = useState('30j');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = useCallback(async () => {
    setLoading(true); setError('');
    try {
      setData(await getStatsVendeur({ periode }));
    } catch (e) {
      setError(e.message || 'Chargement impossible');
    } finally {
      setLoading(false);
    }
  }, [periode]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  if (loading && !data) {
    return <div className='grid grid-cols-2 gap-4 animate-pulse'>{Array.from({ length: 6 }).map((_, i) => <div key={i} className='h-24 bg-white border border-gray-100 rounded-2xl' />)}</div>;
  }
  if (error) return <div className='p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl'>{error}</div>;
  if (!data) return null;

  const k = data.kpis ?? {};
  const serie = (data.serie || []).map((s) => ({ ...s, ca: Number(s.ca), commandes: Number(s.commandes) }));

  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <h3 className='text-lg font-bold text-gray-900'>{t.statsVendeur.title}</h3>
        <div className='flex items-center gap-2'>
          <select value={periode} onChange={(e) => setPeriode(e.target.value)} className='px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white'>
            <option value='7j'>{t.admin.period7}</option>
            <option value='30j'>{t.admin.period30}</option>
            <option value='90j'>{t.admin.period90}</option>
            <option value='365j'>{t.admin.period365}</option>
            <option value='tout'>{t.admin.periodAll}</option>
          </select>
          <button onClick={fetchStats} disabled={loading} className='p-2 text-white bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] rounded-xl disabled:opacity-50'>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {k.a_expedier > 0 && (
        <div className='p-3 text-sm font-semibold text-orange-700 bg-orange-50 border border-orange-200 rounded-xl'>
          {k.a_expedier} {t.statsVendeur.shipAlert}
        </div>
      )}
      {(k.ruptures > 0 || k.stock_bas > 0) && (
        <div className='p-3 text-sm font-semibold text-orange-700 bg-orange-50 border border-orange-200 rounded-xl'>
          {t.statsVendeur.stockLabel} {k.ruptures} {t.statsVendeur.stockAlert}{k.stock_bas > 0 && `, ${k.stock_bas} ${t.statsVendeur.restockAlert}`}.
        </div>
      )}

      <div className='grid grid-cols-2 gap-4'>
        <Kpi label={t.statsVendeur.ca} value={`${fmt(k.ca)} FCFA`} sub={`${t.statsVendeur.netHint} ${fmt(k.net)}`} />
        <Kpi label={t.statsVendeur.orders} value={fmt(k.commandes)} sub={`${fmt(k.commandes_payees)} ${t.statsVendeur.paidHint}`} />
        <Kpi label={t.statsVendeur.interested} value={fmt(k.interesses)} sub={t.statsVendeur.interestedHint} />
        <Kpi label={t.statsVendeur.listingsActive} value={fmt(k.annonces_actives)} />
        <Kpi label={t.statsVendeur.rating} value={`${k.note_moyenne}/5`} sub={`${k.avis_total} ${t.statsVendeur.reviewsSuffix}`} />
      </div>

      <div className='p-4 bg-white border border-gray-100 rounded-2xl shadow-sm'>
        <h4 className='mb-3 text-sm font-bold text-gray-800'>{t.statsVendeur.salesChart}</h4>
        {serie.length ? (
          <div className='h-52'>
            <ResponsiveContainer width='100%' height='100%'>
              <AreaChart data={serie}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='date' tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type='monotone' dataKey='ca' name={t.admin.caFcfa} stroke='#1DBF73' fill='#1DBF73' fillOpacity={0.2} />
                <Area type='monotone' dataKey='commandes' name={t.admin.orders} stroke='#09B1BA' fill='#09B1BA' fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : <p className='text-sm text-gray-400'>{t.statsVendeur.noSales}</p>}
      </div>

      <div className='p-4 bg-white border border-gray-100 rounded-2xl shadow-sm'>
        <h4 className='flex items-center gap-2 mb-3 text-sm font-bold text-gray-800'><Package className='w-4 h-4 text-[#1DBF73]' /> {t.statsVendeur.myProducts}</h4>
        {(data.par_annonce || []).length ? (
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead><tr className='text-left text-xs text-gray-400'><th className='py-1'>{t.statsVendeur.product}</th><th className='text-right'>{t.statsVendeur.ordersCol}</th><th className='text-right'>{t.statsVendeur.caCol}</th><th className='text-right'>♥</th><th className='text-right'>{t.statsVendeur.stockCol}</th></tr></thead>
              <tbody>{data.par_annonce.map((a) => (
                <tr key={a.id} className='border-t border-gray-50'>
                  <td className='py-1.5 font-medium'>{a.titre}</td>
                  <td className='text-right'>{a.commandes}</td>
                  <td className='text-right font-bold text-[#1DBF73]'>{fmt(a.ca)}</td>
                  <td className='text-right'>{a.favoris ?? 0}</td>
                  <td className={`text-right font-semibold ${a.stock <= 0 ? 'text-red-500' : a.stock <= 2 ? 'text-orange-500' : ''}`}>{a.stock}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        ) : <p className='text-sm text-gray-400'>{t.statsVendeur.noOrdersPeriod}</p>}
      </div>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <div className='p-4 bg-white border border-gray-100 rounded-2xl shadow-sm'>
          <h4 className='mb-2 text-sm font-bold text-gray-800'>{t.statsVendeur.loyal}</h4>
          {(data.recurrents || []).length ? data.recurrents.map((c) => (
            <p key={c.acheteur_id} className='flex justify-between py-1 text-sm border-t border-gray-50 first:border-0'>
              <span>{c.acheteur?.nom || c.acheteur?.email}</span><b>{c.commandes} {t.statsVendeur.loyalCmds} • {fmt(c.total)}</b>
            </p>
          )) : <p className='text-sm text-gray-400'>{t.statsVendeur.loyalNone}</p>}
        </div>
        <div className='p-4 bg-white border border-gray-100 rounded-2xl shadow-sm'>
          <h4 className='flex items-center gap-2 mb-2 text-sm font-bold text-gray-800'><AlertTriangle className='w-4 h-4 text-orange-500' /> {t.statsVendeur.disputes}</h4>
          {(data.litiges || []).length ? data.litiges.map((l) => (
            <p key={l.id} className='py-1 text-sm border-t border-gray-50 first:border-0'>
              <Link to={`/litiges/${l.id}`} className='font-semibold text-orange-600'>#{String(l.id).slice(0, 8)}</Link> • {l.motif} • {l.statut}
            </p>
          )) : <p className='text-sm text-gray-400'>{t.statsVendeur.noDisputes}</p>}
        </div>
      </div>

      <div className='p-4 bg-white border border-gray-100 rounded-2xl shadow-sm'>
        <h4 className='flex items-center gap-2 mb-2 text-sm font-bold text-gray-800'><Star className='w-4 h-4 text-yellow-500' /> {t.statsVendeur.reviewsGot}</h4>
        {(data.avis || []).length ? data.avis.map((a) => (
          <div key={a.id} className='py-2 text-sm border-t border-gray-50 first:border-0'>
            <p className='font-semibold'>★ {a.note_vendeur}/5 {t.statsVendeur.sellerSuffix} • {a.note_conformite}/5 {t.statsVendeur.conformitySuffix}</p>
            {a.commentaire && <p className='text-gray-600'>{a.commentaire}</p>}
          </div>
        )) : <p className='text-sm text-gray-400'>{t.statsVendeur.noReviews}</p>}
      </div>
    </div>
  );
}
