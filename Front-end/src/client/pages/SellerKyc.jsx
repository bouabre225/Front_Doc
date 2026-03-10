import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Upload, FileText, CheckCircle, AlertCircle,
  ArrowLeft, X, Eye, File, Loader
} from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { submitKyc } from '../../services/api';

const TYPE_DOCS = [
  {
    key:   'cni',
    label: "Carte Nationale d'Identité",
    desc:  'CNI recto-verso en cours de validité',
    icon:  '🪪',
  },
  {
    key:   'passport',
    label: 'Passeport',
    desc:  'Page principale du passeport',
    icon:  '📕',
  },
  {
    key:   'permis',
    label: 'Permis de conduire',
    desc:  'Permis recto-verso en cours de validité',
    icon:  '🚗',
  },
];

const ACCEPTED = '.jpg,.jpeg,.png,.pdf,.docx';
const MAX_MB   = 5;

export default function SellerKyc() {
  const navigate    = useNavigate();
  const inputRef    = useRef(null);

  const [typeDoc,   setTypeDoc]   = useState('');
  const [file,      setFile]      = useState(null);
  const [preview,   setPreview]   = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [success,   setSuccess]   = useState(false);
  const [error,     setError]     = useState('');
  const [dragOver,  setDragOver]  = useState(false);

  const handleFile = (f) => {
    if (!f) return;
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`Fichier trop volumineux (max ${MAX_MB} Mo).`);
      return;
    }
    setError('');
    setFile(f);
    if (f.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(f));
    } else {
      setPreview(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const handleSubmit = async () => {
    if (!typeDoc) { setError('Sélectionnez un type de document.'); return; }
    if (!file)    { setError('Ajoutez un fichier.'); return; }
    setError('');
    setLoading(true);
    try {
      await submitKyc(typeDoc, file);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Erreur lors de la soumission.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Succès ───────────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <Header />
        <div className='flex items-center justify-center py-24 px-4'>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className='max-w-md w-full bg-white rounded-2xl shadow-lg p-10 text-center'
          >
            <div className='w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5'>
              <CheckCircle className='w-10 h-10 text-green-500' />
            </div>
            <h2 className='text-2xl font-bold text-gray-900 mb-2'>Document soumis !</h2>
            <p className='text-gray-500 mb-6'>
              Votre document KYC est en cours d'examen. Vous serez notifié dès la validation de votre compte.
            </p>
            <div className='p-4 bg-yellow-50 border border-yellow-200 rounded-xl mb-6 text-left'>
              <p className='text-sm font-semibold text-yellow-700 mb-1'>⏳ Délai estimé</p>
              <p className='text-sm text-yellow-600'>La vérification prend généralement 24 à 48h ouvrées.</p>
            </div>
            <button
              onClick={() => navigate('/profile')}
              className='w-full py-3 bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white font-bold rounded-xl hover:shadow-lg transition-all'
            >
              Retour au profil
            </button>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <Header />

      <div className='max-w-2xl mx-auto px-4 py-10'>

        {/* Retour */}
        <button
          onClick={() => navigate('/profile')}
          className='flex items-center gap-2 text-sm text-gray-500 hover:text-[#1DBF73] transition-colors mb-6'
        >
          <ArrowLeft className='w-4 h-4' />
          Retour au profil
        </button>

        {/* Header */}
        <div className='flex items-center gap-4 mb-8'>
          <div className='w-14 h-14 bg-gradient-to-br from-[#1DBF73] to-[#09B1BA] rounded-2xl flex items-center justify-center shadow-md'>
            <Shield className='w-7 h-7 text-white' />
          </div>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Vérification KYC</h1>
            <p className='text-sm text-gray-500 mt-0.5'>
              Soumettez un document d'identité pour vérifier votre compte vendeur
            </p>
          </div>
        </div>

        {/* Info */}
        <div className='p-4 bg-blue-50 border border-blue-200 rounded-xl mb-6'>
          <div className='flex items-start gap-3'>
            <AlertCircle className='w-5 h-5 text-blue-500 shrink-0 mt-0.5' />
            <div className='text-sm text-blue-700'>
              <p className='font-semibold mb-1'>Pourquoi vérifier mon identité ?</p>
              <p className='opacity-80'>La vérification KYC protège les acheteurs et renforce la confiance sur la plateforme. Un compte vérifié bénéficie d'un badge de confiance.</p>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6'>

          {/* Erreur */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className='flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700'
              >
                <AlertCircle className='w-4 h-4 shrink-0' />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Étape 1 : Type de document */}
          <div>
            <p className='text-sm font-bold text-gray-700 mb-3'>
              1. Choisissez le type de document
            </p>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
              {TYPE_DOCS.map(t => (
                <button
                  key={t.key}
                  onClick={() => setTypeDoc(t.key)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-center transition-all ${
                    typeDoc === t.key
                      ? 'border-[#1DBF73] bg-[#1DBF73]/5'
                      : 'border-gray-200 hover:border-[#1DBF73]/40 hover:bg-gray-50'
                  }`}
                >
                  <span className='text-2xl'>{t.icon}</span>
                  <span className={`text-sm font-semibold ${typeDoc === t.key ? 'text-[#1DBF73]' : 'text-gray-700'}`}>
                    {t.label}
                  </span>
                  <span className='text-xs text-gray-400'>{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Étape 2 : Upload */}
          <div>
            <p className='text-sm font-bold text-gray-700 mb-3'>
              2. Importez votre document
            </p>

            {/* Zone de drop */}
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                dragOver
                  ? 'border-[#1DBF73] bg-[#1DBF73]/5'
                  : file
                  ? 'border-[#1DBF73] bg-[#1DBF73]/3'
                  : 'border-gray-200 hover:border-[#1DBF73]/50 hover:bg-gray-50'
              }`}
            >
              <input
                ref={inputRef}
                type='file'
                accept={ACCEPTED}
                className='hidden'
                onChange={e => handleFile(e.target.files?.[0])}
              />

              {file ? (
                <div className='flex flex-col items-center gap-3'>
                  {preview ? (
                    <img
                      src={preview}
                      alt='Aperçu'
                      className='w-24 h-24 object-cover rounded-xl border border-gray-200'
                    />
                  ) : (
                    <div className='w-16 h-16 bg-[#1DBF73]/10 rounded-xl flex items-center justify-center'>
                      <FileText className='w-8 h-8 text-[#1DBF73]' />
                    </div>
                  )}
                  <div>
                    <p className='font-semibold text-gray-800 text-sm'>{file.name}</p>
                    <p className='text-xs text-gray-400 mt-0.5'>
                      {(file.size / 1024 / 1024).toFixed(2)} Mo
                    </p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); setFile(null); setPreview(null); }}
                    className='flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-500 text-xs font-semibold rounded-lg hover:bg-red-100 transition-colors'
                  >
                    <X className='w-3.5 h-3.5' />
                    Supprimer
                  </button>
                </div>
              ) : (
                <div className='flex flex-col items-center gap-3'>
                  <div className='w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center'>
                    <Upload className='w-6 h-6 text-gray-400' />
                  </div>
                  <div>
                    <p className='font-semibold text-gray-700'>
                      Glissez-déposez ou cliquez pour importer
                    </p>
                    <p className='text-xs text-gray-400 mt-1'>
                      JPG, PNG, PDF, DOCX · max {MAX_MB} Mo
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Conseils */}
          <div className='p-4 bg-gray-50 rounded-xl'>
            <p className='text-xs font-bold text-gray-500 uppercase tracking-wider mb-2'>Conseils</p>
            <ul className='space-y-1.5 text-xs text-gray-500'>
              {[
                'Document en cours de validité',
                'Photo nette, sans reflet ni flou',
                'Tous les coins visibles',
                'Informations lisibles (nom, prénom, date)',
              ].map((tip, i) => (
                <li key={i} className='flex items-center gap-2'>
                  <CheckCircle className='w-3.5 h-3.5 text-[#1DBF73] shrink-0' />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Bouton submit */}
          <button
            onClick={handleSubmit}
            disabled={loading || !typeDoc || !file}
            className='w-full py-3.5 bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm'
          >
            {loading ? (
              <span className='flex items-center justify-center gap-2'>
                <Loader className='w-4 h-4 animate-spin' />
                Envoi en cours...
              </span>
            ) : (
              <span className='flex items-center justify-center gap-2'>
                <Shield className='w-4 h-4' />
                Soumettre mon document
              </span>
            )}
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}