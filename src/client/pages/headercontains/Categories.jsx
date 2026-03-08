import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Filter, MapPin } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

const API_URL = 'http://localhost:8000/api';

// Infos visuelles par catégorie (slug => visuel)
const categoryMeta = {
  'Imagerie Médicale': { slug: 'imagerie', color: 'from-indigo-500 to-purple-600', bgLight: 'bg-indigo-50', textColor: 'text-indigo-500', image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&fit=crop', description: "Échographes, scanners IRM, radiologie et équipements d'imagerie diagnostique." },
  'Cardiologie':       { slug: 'cardiologie', color: 'from-red-500 to-pink-600', bgLight: 'bg-red-50', textColor: 'text-red-500', image: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=800&fit=crop', description: 'ECG, moniteurs cardiaques, défibrillateurs et équipements spécialisés.' },
  'Laboratoire':       { slug: 'laboratoire', color: 'from-yellow-500 to-orange-500', bgLight: 'bg-yellow-50', textColor: 'text-yellow-600', image: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800&fit=crop', description: 'Analyseurs, microscopes, centrifugeuses et matériel de laboratoire.' },
  'Chirurgie':         { slug: 'chirurgie', color: 'from-teal-500 to-cyan-600', bgLight: 'bg-teal-50', textColor: 'text-teal-500', image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&fit=crop', description: "Tables d'opération, lampes scialytiques et équipements de bloc." },
  'Monitoring':        { slug: 'monitoring', color: 'from-green-500 to-emerald-600', bgLight: 'bg-green-50', textColor: 'text-green-500', image: 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=800&fit=crop', description: 'Moniteurs multiparamétriques, oxymètres et équipements de surveillance.' },
  'Urgence':           { slug: 'urgence', color: 'from-red-600 to-orange-500', bgLight: 'bg-red-50', textColor: 'text-red-600', image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&fit=crop', description: 'Défibrillateurs, respirateurs et équipements de réanimation.' },
  'Mobilier Médical':  { slug: 'mobilier', color: 'from-slate-500 to-gray-600', bgLight: 'bg-slate-50', textColor: 'text-slate-500', image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&fit=crop', description: 'Lits médicalisés, fauteuils roulants et mobilier hospitalier.' },
  'Stérilisation':     { slug: 'sterilisation', color: 'from-cyan-500 to-blue-600', bgLight: 'bg-cyan-50', textColor: 'text-cyan-500', image: 'https://images.unsplash.com/photo-1583911860205-72f8ac8ddcbe?w=800&fit=crop', description: 'Autoclaves, stérilisateurs UV et équipements de stérilisation.' },
  'Neurologie':        { slug: 'neurologie', color: 'from-purple-500 to-indigo-600', bgLight: 'bg-purple-50', textColor: 'text-purple-500', image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&fit=crop', description: 'EEG, électromyographes et équipements de diagnostic neurologique.' },
  'Médecine Générale': { slug: 'medecine-generale', color: 'from-blue-500 to-sky-600', bgLight: 'bg-blue-50', textColor: 'text-blue-500', image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&fit=crop', description: 'Stéthoscopes, otoscopes, tensiomètres et équipements de consultation.' },
  'Pharmacie':         { slug: 'pharmacie', color: 'from-pink-500 to-rose-600', bgLight: 'bg-pink-50', textColor: 'text-pink-500', image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&fit=crop', description: 'Armoires à pharmacie, robots de dispensation et équipements pharmaceutiques.' },
};

// Mapping slug => nom catégorie backend
const slugToCategorie = {
  'imagerie': 'Imagerie Médicale',
  'cardiologie': 'Cardiologie',
  'laboratoire': 'Laboratoire',
  'chirurgie': 'Chirurgie',
  'monitoring': 'Monitoring',
  'urgence': 'Urgence',
  'mobilier': 'Mobilier Médical',
  'sterilisation': 'Stérilisation',
  'neurologie': 'Neurologie',
  'medecine-generale': 'Médecine Générale',
  'pharmacie': 'Pharmacie',
};

const conditionStyle = (etat) => {
  if (etat === 'Neuf') return 'bg-emerald-500 text-white';
  if (etat === 'Occasion') return 'bg-amber-400 text-white';
  return 'bg-blue-500 text-white';
};

const Categories = () => {
  const { slug } = useParams();
  const [annonces, setAnnonces] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Page liste toutes catégories → on fetch toutes les annonces pour compter par catégorie
  useEffect(() => {
    if (!slug) {
      fetchAllForCategories();
    } else {
      fetchByCategory(slug);
    }
  }, [slug]);

  const fetchAllForCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/annonces?page=1`, {
        headers: { 'Accept': 'application/json' }
      });
      const data = await res.json();
      if (res.ok) {
        const items = data.data || [];
        // Compter par catégorie
        const counts = {};
        items.forEach(a => {
          if (a.categorie) {
            counts[a.categorie] = (counts[a.categorie] || 0) + 1;
          }
        });
        // Construire liste catégories avec count réel
        const cats = Object.entries(categoryMeta).map(([name, meta]) => ({
          name,
          ...meta,
          count: counts[name] || 0
        }));
        setAllCategories(cats);
      }
    } catch (err) {
      console.error(err);
      // Fallback : afficher catégories sans count
      const cats = Object.entries(categoryMeta).map(([name, meta]) => ({
        name, ...meta, count: 0
      }));
      setAllCategories(cats);
    } finally {
      setLoading(false);
    }
  };

  const fetchByCategory = async (slug) => {
    setLoading(true);
    try {
      const categorie = slugToCategorie[slug];
      if (!categorie) { setLoading(false); return; }

      const res = await fetch(
        `${API_URL}/annonces/search?q=${encodeURIComponent(categorie)}&page=1`,
        { headers: { 'Accept': 'application/json' } }
      );
      const data = await res.json();
      if (res.ok) {
        // Filtrer strictement par catégorie
        const filtered = (data.data || []).filter(a => a.categorie === categorie);
        setAnnonces(filtered);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ── PAGE : Toutes les catégories ──
  if (!slug) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <Header />

        <div className='relative bg-white border-b border-gray-100'>
          <div className='absolute inset-0 bg-gradient-to-br from-[#1DBF73]/5 via-transparent to-[#09B1BA]/5' />
          <div className='container relative max-w-6xl px-4 py-16 mx-auto'>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className='max-w-xl'>
              <span className='inline-flex items-center gap-2 px-3 py-1 bg-[#1DBF73]/10 text-[#1DBF73] text-xs font-bold rounded-full mb-4 uppercase tracking-wide'>
                {allCategories.length} Spécialités
              </span>
              <h1 className='mb-3 text-5xl font-black leading-tight text-gray-900'>
                Explorez par<br />
                <span className='bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] bg-clip-text text-transparent'>
                  Catégorie
                </span>
              </h1>
              <p className='text-gray-500'>Trouvez rapidement l'équipement dont vous avez besoin parmi nos spécialités médicales.</p>
            </motion.div>
          </div>
        </div>

        <div className='container max-w-6xl px-4 py-12 mx-auto'>
          {loading ? (
            <div className='flex justify-center py-20'>
              <div className='w-10 h-10 border-4 border-[#1DBF73] rounded-full border-t-transparent animate-spin' />
            </div>
          ) : (
            <div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4'>
              {allCategories.map((cat, index) => (
                <motion.div key={cat.slug}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}>
                  <Link to={`/categories/${cat.slug}`}>
                    <div className='relative overflow-hidden transition-all duration-300 bg-white border border-gray-100 shadow-sm cursor-pointer group rounded-2xl hover:shadow-xl hover:-translate-y-1'>
                      <div className='relative h-40 overflow-hidden'>
                        <img src={cat.image} alt={cat.name}
                          className='object-cover w-full h-full transition-transform duration-500 group-hover:scale-110' />
                        <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-70`} />
                        <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent' />
                        <div className='absolute bottom-3 left-3 right-3'>
                          <h3 className='text-sm font-bold leading-tight text-white'>{cat.name}</h3>
                        </div>
                      </div>
                      <div className='px-3 py-2.5 flex items-center justify-between'>
                        <span className='text-xs font-medium text-gray-400'>{cat.count} équipement(s)</span>
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${cat.bgLight}`}>
                          <ArrowRight className={`w-3 h-3 ${cat.textColor}`} />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <Footer />
      </div>
    );
  }

  // ── Catégorie introuvable ──
  const categorieName = slugToCategorie[slug];
  const meta = categoryMeta[categorieName];

  if (!meta) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <Header />
        <div className='flex flex-col items-center justify-center py-32 text-center'>
          <Filter className='w-12 h-12 mx-auto mb-4 text-gray-300' />
          <p className='mb-4 text-xl font-bold text-gray-700'>Catégorie introuvable</p>
          <Link to='/categories'>
            <button className='px-6 py-3 bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white font-semibold rounded-xl'>
              Retour aux catégories
            </button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // ── PAGE : Équipements d'une catégorie ──
  return (
    <div className='min-h-screen bg-gray-50'>
      <Header />

      {/* Bannière */}
      <div className='relative overflow-hidden h-60'>
        <img src={meta.image} alt={meta.name} className='object-cover w-full h-full' />
        <div className={`absolute inset-0 bg-gradient-to-br ${meta.color} opacity-80`} />
        <div className='absolute inset-0 bg-gradient-to-t from-black/50 to-transparent' />
        <div className='container relative z-10 flex flex-col justify-end h-full max-w-6xl px-4 pb-8 mx-auto'>
          <Link to='/categories'>
            <motion.div whileHover={{ x: -4 }}
              className='inline-flex items-center gap-2 mb-4 text-sm font-medium transition-colors text-white/70 hover:text-white'>
              <ArrowLeft className='w-4 h-4' />
              Toutes les catégories
            </motion.div>
          </Link>
          <div className='flex items-end justify-between'>
            <div>
              <h1 className='mb-1 text-4xl font-black text-white'>{categorieName}</h1>
              <p className='max-w-lg text-sm text-white/70'>{meta.description}</p>
            </div>
            <div className='hidden px-5 py-3 text-center border md:block bg-white/15 backdrop-blur-sm border-white/20 rounded-2xl'>
              <p className='text-3xl font-black text-white'>{annonces.length}</p>
              <p className='text-xs text-white/70 mt-0.5'>équipement(s)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Équipements */}
      <div className='container max-w-6xl px-4 py-10 mx-auto'>
        {loading ? (
          <div className='flex justify-center py-20'>
            <div className='w-10 h-10 border-4 border-[#1DBF73] rounded-full border-t-transparent animate-spin' />
          </div>
        ) : annonces.length > 0 ? (
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {annonces.map((item, index) => (
              <motion.div key={item.id}
                initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}>
                <Link to={`/equipment/${item.id}`}>
                  <div className='overflow-hidden transition-all duration-300 bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-xl group hover:-translate-y-1'>

                    {/* Image */}
                    <div className='relative overflow-hidden bg-gray-100 h-52'>
                      {item.images?.[0] ? (
                        <img
                          src={`http://localhost:8000/storage/${item.images[0].image_url}`}
                          alt={item.titre}
                          className='object-cover w-full h-full transition-transform duration-500 group-hover:scale-105'
                        />
                      ) : (
                        <div className='flex items-center justify-center w-full h-full'>
                          <span className='text-5xl'>🏥</span>
                        </div>
                      )}
                      <span className={`absolute top-3 left-3 px-2.5 py-1 text-xs font-bold rounded-lg ${conditionStyle(item.etat)}`}>
                        {item.etat}
                      </span>
                    </div>

                    <div className='p-5'>
                      <h3 className='font-bold text-gray-900 text-base line-clamp-2 group-hover:text-[#1DBF73] transition-colors leading-snug mb-3'>
                        {item.titre}
                      </h3>
                      <div className='flex items-center justify-between mb-4'>
                        <div className='flex items-center gap-1 text-xs text-gray-400'>
                          <MapPin className='w-3.5 h-3.5 text-[#1DBF73]' />
                          {item.pays_expedition || 'Bénin'}
                        </div>
                        <span className='text-xs text-gray-400'>
                          {item.vendeur?.nom || 'Vendeur'}
                        </span>
                      </div>
                      <div className='flex items-center justify-between pt-3 border-t border-gray-100'>
                        <p className='text-xl font-black text-[#1DBF73]'>
                          {Number(item.prix_vendeur).toLocaleString()}
                          <span className='ml-1 text-sm font-medium text-gray-400'>FCFA</span>
                        </p>
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                          className='w-10 h-10 bg-gradient-to-br from-[#1DBF73] to-[#09B1BA] rounded-xl flex items-center justify-center shadow-md'>
                          <ArrowRight className='w-4 h-4 text-white' />
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className='text-center bg-white border border-gray-100 shadow-sm py-28 rounded-3xl'>
            <div className='flex items-center justify-center w-20 h-20 mx-auto mb-5 border border-gray-100 bg-gray-50 rounded-3xl'>
              <Filter className='text-gray-300 w-9 h-9' />
            </div>
            <p className='mb-2 text-xl font-bold text-gray-700'>Aucun équipement disponible</p>
            <p className='max-w-xs mx-auto mb-8 text-sm text-gray-400'>Cette catégorie sera bientôt alimentée par nos vendeurs</p>
            <Link to='/explore'>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className='px-8 py-3.5 bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] text-white font-semibold rounded-xl shadow-lg'>
                Explorer tous les équipements
              </motion.button>
            </Link>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Categories;