import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, AlertCircle, Clock, CheckCircle, 
  MessageCircle, ShieldCheck, Scale, FileText,
  User, Store, Package
} from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { getLitigeById } from '../../../services/api';

const STATUS_LITIGE = {
  ouvert: {
    label: 'Litige ouvert',
    color: 'from-orange-400 to-red-500',
    bg: 'bg-orange-50 border-orange-200',
    text: 'text-orange-700',
    icon: Clock,
    desc: 'Notre équipe examine actuellement votre demande.'
  },
  en_cours: {
    label: 'En cours d\'examen',
    color: 'from-blue-400 to-blue-600',
    bg: 'bg-blue-50 border-blue-200',
    text: 'text-blue-700',
    icon: Scale,
    desc: 'Un médiateur DocSpace a pris en charge le dossier.'
  },
  resolu: {
    label: 'Litige résolu',
    color: 'from-[#1DBF73] to-[#09B1BA]',
    bg: 'bg-green-50 border-green-200',
    text: 'text-green-700',
    icon: CheckCircle,
    desc: 'Une décision a été rendue pour ce litige.'
  },
  annule: {
    label: 'Litige annulé',
    color: 'from-gray-400 to-gray-500',
    bg: 'bg-gray-50 border-gray-200',
    text: 'text-gray-600',
    icon: ShieldCheck,
    desc: 'Le litige a été clos par l\'initiateur.'
  }
};

const LitigeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [litige, setLitige] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLitige();
  }, [id]);

  const fetchLitige = async () => {
    try {
      setLoading(true);
      const res = await getLitigeById(id);
      setLitige(res.data ?? res);
    } catch (err) {
      setError('Impossible de charger les détails du litige.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container px-4 py-10 mx-auto max-w-2xl animate-pulse">
        <div className="h-40 bg-white rounded-2xl border border-gray-100 mb-6" />
        <div className="h-64 bg-white rounded-2xl border border-gray-100" />
      </div>
      <Footer />
    </div>
  );

  if (error || !litige) return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <p className="text-gray-600 font-medium">{error || "Litige introuvable"}</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-[#1DBF73] font-bold">Retour</button>
      </div>
      <Footer />
    </div>
  );

  const statusCfg = STATUS_LITIGE[litige.statut] || STATUS_LITIGE.ouvert;
  const StatusIcon = statusCfg.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container px-4 py-8 mx-auto max-w-2xl">
        <button 
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#1DBF73] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>

        {/* --- Header du Litige --- */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl border p-6 mb-6 ${statusCfg.bg}`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${statusCfg.color} flex items-center justify-center shadow-lg text-white`}>
              <StatusIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className={`text-lg font-bold ${statusCfg.text}`}>{statusCfg.label}</h1>
              <p className="text-xs text-gray-500">Référence Litige : #{litige.id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-600 leading-relaxed italic">
            "{statusCfg.desc}"
          </p>
        </motion.div>

        <div className="space-y-4">
          {/* --- Détails du Motif --- */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Détails du problème</span>
            </div>
            <h3 className="font-bold text-gray-900 mb-2 capitalize">
              {litige.motif?.replace('_', ' ')}
            </h3>
            <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl border border-dashed border-gray-200">
              {litige.description || "Aucune description supplémentaire fournie."}
            </p>
          </div>

          {/* --- Commande Associée --- */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-4 h-4 text-[#1DBF73]" />
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Commande liée</span>
            </div>
            <Link to={`/commandes/${litige.commande_id}`} className="group flex items-center justify-between p-3 rounded-xl border border-gray-50 hover:border-[#1DBF73]/30 hover:bg-green-50/30 transition-all">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800 group-hover:text-[#1DBF73]">Voir la commande</p>
                    <p className="text-xs text-gray-400">#{litige.commande_id.slice(0, 8).toUpperCase()}</p>
                  </div>
               </div>
               <ArrowLeft className="w-4 h-4 rotate-180 text-gray-300 group-hover:text-[#1DBF73]" />
            </Link>
          </div>

          {/* --- Support & Aide --- */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
             <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100 mb-4">
                <ShieldCheck className="w-6 h-6 text-blue-500" />
                <p className="text-xs text-blue-700 font-medium">
                  La protection DocSpace sécurise vos fonds. L'argent est bloqué tant que le litige n'est pas résolu.
                </p>
             </div>
             <button className="w-full py-3.5 bg-gray-900 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-md">
                <MessageCircle className="w-4 h-4" />
                <a href='mailto:docspaceafrica@gmail.com'>Discuter avec le médiateur</a>
             </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LitigeDetail;