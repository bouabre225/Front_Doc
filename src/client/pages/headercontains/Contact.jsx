import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Mail, Phone, MapPin, Send,
  MessageCircle, Clock, CheckCircle, AlertCircle,
  ChevronDown, ChevronUp
} from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { sendContact } from '../../../services/api';

// ─── FAQ data ─────────────────────────────────────────────────────────────────

const FAQ = [
  {
    q: 'Comment fonctionne la protection acheteur ?',
    a: "DocSpace prélève des frais de protection sur chaque transaction. En cas de litige, notre équipe intervient pour arbitrer et rembourser l'acheteur si le vendeur est en tort.",
  },
  {
    q: 'Comment devenir vendeur sur DocSpace ?',
    a: "Créez un compte vendeur, puis soumettez vos documents KYC (CNI ou passeport). Notre équipe valide votre identité sous 24-48h. Une fois validé, vous pouvez publier vos annonces.",
  },
  {
    q: 'Quels équipements peut-on vendre ?',
    a: "Tout matériel médical légal : imagerie, monitoring, chirurgie, laboratoire, mobilier médical... Les équipements doivent être conformes aux réglementations en vigueur.",
  },
  {
    q: 'Combien de temps pour recevoir un remboursement ?',
    a: "En cas de litige résolu en faveur de l'acheteur, le remboursement est effectué sous 5 à 10 jours ouvrés selon votre moyen de paiement.",
  },
  {
    q: 'Comment contacter un vendeur ?',
    a: 'Sur chaque annonce, un bouton "Contacter le vendeur" ouvre directement la messagerie intégrée. Vous pouvez échanger en temps réel avec le vendeur.',
  },
];

// ─── FaqItem ──────────────────────────────────────────────────────────────────

const FaqItem = ({ q, a, index }) => {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className='border border-gray-100 rounded-2xl overflow-hidden'
    >
      <button
        onClick={() => setOpen(!open)}
        className='w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors'
      >
        <span className='font-semibold text-gray-800 text-sm pr-4'>{q}</span>
        {open
          ? <ChevronUp className='w-4 h-4 text-[#1DBF73] shrink-0' />
          : <ChevronDown className='w-4 h-4 text-gray-400 shrink-0' />
        }
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='overflow-hidden'
          >
            <p className='px-6 pb-5 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-4'>
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Contact ──────────────────────────────────────────────────────────────────

const Contact = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nom:       '',
    email:     '',
    sujet:     '',
    categorie: '',
    message:   '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState('');

  // Pré-remplir si connecté
  React.useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.nom)   setForm(p => ({ ...p, nom: user.nom }));
    if (user.email) setForm(p => ({ ...p, email: user.email }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.nom.trim() || !form.email.trim() || !form.message.trim()) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setLoading(true);
    try {
      await sendContact({
        nom:       form.nom,
        email:     form.email,
        sujet:     form.sujet     || undefined,
        categorie: form.categorie || undefined,
        message:   form.message,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Erreur lors de l'envoi. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  const CATEGORIES = [
    'Question générale',
    'Problème technique',
    'Litige / Remboursement',
    'Vérification KYC',
    'Signalement',
    'Partenariat',
    'Autre',
  ];

  const INFO_CARDS = [
    {
      icon:  Mail,
      label: 'Email',
      value: 'docspaceafrica@gmail.com',
      href:  'mailto:docspaceafrica@gmail.com',
      color: 'from-[#1DBF73] to-[#09B1BA]',
    },
    {
      icon:  Phone,
      label: 'Téléphone',
      value: '+229 01 23 45 67',
      href:  'tel:+22901234567',
      color: 'from-[#09B1BA] to-[#1DBF73]',
    },
    {
      icon:  MapPin,
      label: 'Adresse',
      value: 'Cotonou, Bénin',
      href:  null,
      color: 'from-[#1DBF73] to-[#09B1BA]',
    },
    {
      icon:  Clock,
      label: 'Disponibilité',
      value: '24h/24, 7j/7',
      href:  null,
      color: 'from-[#09B1BA] to-[#1DBF73]',
    },
  ];

  return (
    <div className='min-h-screen bg-gray-50'>
      <Header />

      {/* Hero */}
      <section className='relative bg-gradient-to-r from-[#09B1BA] to-[#1DBF73] py-3 overflow-hidden'>
        <div className='absolute inset-0'>
          <div className='absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2' />
          <div className='absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3' />
        </div>
        <div className='container relative px-4 mx-auto text-center'>
          <div className='flex justify-start text-2xl text-white'>

            <motion.button
              onClick={() => navigate(-1)}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className='inline-flex items-center gap-2 text-white hover:text-white/80 mb-6 transition-colors text-sm'
            >
              <ArrowLeft className='w-4 h-4' />
              Retour
            </motion.button>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className='inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4 backdrop-blur-sm'>
              <MessageCircle className='w-8 h-8 text-white' />
            </div>
            <h1 className='text-4xl font-bold text-white mb-3'>Contactez-nous</h1>
            <p className='text-white/80 text-lg max-w-lg mx-auto'>
              Notre équipe est là pour vous aider. Réponse garantie sous 24h.
            </p>
          </motion.div>
        </div>
      </section>

      <div className='container px-4 py-12 mx-auto max-w-6xl'>

        {/* Info cards */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-3 mb-12 -mt-8 relative z-10'>
          {INFO_CARDS.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className='bg-white rounded-2xl shadow-lg border border-gray-100 p-3 sm:p-5 text-center overflow-hidden'
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mx-auto mb-3 shadow-md`}>
                <card.icon className='w-5 h-5 text-white' />
              </div>
              <p className='text-xs text-gray-400 font-medium mb-1'>{card.label}</p>
              {card.href ? (
              <a href={card.href} className='text-sm font-semibold text-gray-700 hover:text-[#1DBF73] transition-colors break-all'>
                {card.value}
              </a>
              ) : (
                <p className='text-sm font-semibold text-gray-700 break-all'>{card.value}</p>
              )}
            </motion.div>
          ))}
        </div>

        <div className='grid gap-10 lg:grid-cols-2'>

          {/* ── Formulaire ─────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-8'>
              <h2 className='text-2xl font-bold text-gray-900 mb-1'>Envoyer un message</h2>
              <p className='text-sm text-gray-500 mb-7'>Nous vous répondons sous 24h ouvrées.</p>

              <AnimatePresence mode='wait'>
                {success ? (
                  <motion.div
                    key='success'
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className='py-12 text-center'
                  >
                    <div className='w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-5'>
                      <CheckCircle className='w-10 h-10 text-green-500' />
                    </div>
                    <h3 className='text-xl font-bold text-gray-900 mb-2'>Message envoyé !</h3>
                    <p className='text-sm text-gray-500 mb-6'>
                      Nous avons bien reçu votre message et vous répondrons dans les plus brefs délais.
                    </p>
                    <button
                      onClick={() => {
                        setSuccess(false);
                        setForm(p => ({ ...p, sujet: '', categorie: '', message: '' }));
                      }}
                      className='px-6 py-2.5 bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white font-semibold rounded-xl text-sm hover:shadow-lg transition-all'
                    >
                      Envoyer un autre message
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key='form'
                    onSubmit={handleSubmit}
                    className='space-y-5'
                  >
                    {error && (
                      <div className='flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700'>
                        <AlertCircle className='w-4 h-4 shrink-0' />
                        {error}
                      </div>
                    )}

                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <label className='block mb-1.5 text-sm font-semibold text-gray-700'>
                          Nom complet <span className='text-red-400'>*</span>
                        </label>
                        <input
                          name='nom'
                          value={form.nom}
                          onChange={handleChange}
                          placeholder='Votre nom'
                          className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 transition-all'
                        />
                      </div>
                      <div>
                        <label className='block mb-1.5 text-sm font-semibold text-gray-700'>
                          Email <span className='text-red-400'>*</span>
                        </label>
                        <input
                          type='email'
                          name='email'
                          value={form.email}
                          onChange={handleChange}
                          placeholder='votre@email.com'
                          className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 transition-all'
                        />
                      </div>
                    </div>

                    <div>
                      <label className='block mb-1.5 text-sm font-semibold text-gray-700'>Catégorie</label>
                      <select
                        name='categorie'
                        value={form.categorie}
                        onChange={handleChange}
                        className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 transition-all'
                      >
                        <option value=''>Sélectionnez une catégorie</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className='block mb-1.5 text-sm font-semibold text-gray-700'>Sujet</label>
                      <input
                        name='sujet'
                        value={form.sujet}
                        onChange={handleChange}
                        placeholder='Résumez votre demande en quelques mots'
                        className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 transition-all'
                      />
                    </div>

                    <div>
                      <label className='block mb-1.5 text-sm font-semibold text-gray-700'>
                        Message <span className='text-red-400'>*</span>
                      </label>
                      <textarea
                        name='message'
                        value={form.message}
                        onChange={handleChange}
                        rows={5}
                        maxLength={1000}
                        placeholder='Décrivez votre demande en détail...'
                        className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1DBF73] focus:ring-2 focus:ring-[#1DBF73]/20 transition-all resize-none'
                      />
                      <p className='text-xs text-gray-400 mt-1 text-right'>{form.message.length}/1000</p>
                    </div>

                    <motion.button
                      type='submit'
                      disabled={loading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className='w-full py-3.5 bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white font-bold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 transition-all flex items-center justify-center gap-2'
                    >
                      {loading ? (
                        <>
                          <div className='w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin' />
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <Send className='w-4 h-4' />
                          Envoyer le message
                        </>
                      )}
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* ── FAQ ────────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className='text-2xl font-bold text-gray-900 mb-1'>Questions fréquentes</h2>
            <p className='text-sm text-gray-500 mb-6'>Trouvez rapidement une réponse à votre question.</p>

            <div className='space-y-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-4'>
              {FAQ.map((item, i) => (
                <FaqItem key={i} q={item.q} a={item.a} index={i} />
              ))}
            </div>

            {/* Messagerie directe */}
            <div className='mt-6 p-6 bg-gradient-to-r from-[#1DBF73]/10 to-[#09B1BA]/10 border border-[#1DBF73]/20 rounded-2xl'>
              <div className='flex items-start gap-4'>
                <div className='w-10 h-10 bg-gradient-to-br from-[#1DBF73] to-[#09B1BA] rounded-xl flex items-center justify-center shrink-0 shadow'>
                  <MessageCircle className='w-5 h-5 text-white' />
                </div>
                <div>
                  <h3 className='font-bold text-gray-800 mb-1'>Messagerie instantanée</h3>
                  <p className='text-sm text-gray-500 mb-3'>
                    Besoin d'aide rapide ? Contactez directement un vendeur via notre messagerie intégrée.
                  </p>
                  <Link
                    to='/messages'
                    className='inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all'
                  >
                    <MessageCircle className='w-4 h-4' />
                    Ouvrir la messagerie
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;