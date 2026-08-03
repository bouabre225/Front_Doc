import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import { getAnnonces } from '../../../services/api';

const CATEGORIES = [
    {
        slug: 'cardiologie',
        name: 'Cardiologie',
        image: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=400&h=300&fit=crop',
        color: 'from-red-500/80 to-pink-500/80',
    },
    {
        slug: 'stomatologie',
        name: 'Stomatologie',
        image: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=400&h=300&fit=crop',
        color: 'from-purple-500/80 to-indigo-500/80',
    },
    {
        slug: 'medecine_generale',
        name: 'Médecine Générale',
        image: 'https://images.unsplash.com/photo-1584362917165-526a968579e8?w=400&h=300&fit=crop',
        color: 'from-blue-500/80 to-cyan-500/80',
    },
    {
        slug: 'monitoring',
        name: 'Monitoring',
        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=300&fit=crop',
        color: 'from-green-500/80 to-emerald-500/80',
    },
    {
        slug: 'laboratoire',
        name: 'Laboratoire',
        image: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=400&h=300&fit=crop',
        color: 'from-yellow-500/80 to-orange-500/80',
    },
    {
        slug: 'chirurgie',
        name: 'Chirurgie',
        image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&h=300&fit=crop',
        color: 'from-teal-500/80 to-cyan-500/80',
    },
    {
        slug: 'imagerie',
        name: 'Imagerie',
        image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=400&h=300&fit=crop',
        color: 'from-indigo-500/80 to-purple-500/80',
    },
    {
        slug: 'ophtalmologie',
        name: 'Ophtalmologie',
        image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=800',
        color: 'from-pink-500/80 to-rose-500/80',
    },
    {
        slug: 'pieces_rechange',
        name: 'Pièces de rechange',
        image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop',
        color: 'from-gray-500/80 to-slate-500/80',
    },
    {
        slug: 'autres',
        name: 'Autres',
        image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=800',
        color: 'from-gray-500/80 to-slate-500/80',
    },
];

// Mapping slug → nom exact backend
const SLUG_TO_CATEGORIE = {
    cardiologie: 'Cardiologie',
    stomatologie: 'Stomatologie',
    medecine_generale: 'Médecine Générale',
    monitoring: 'Monitoring',
    laboratoire: 'Laboratoire',
    chirurgie: 'Chirurgie',
    imagerie: 'Imagerie Médicale',
    ophtalmologie: 'Ophtalmologie',
    pieces_rechange: 'Pièces de rechange',
    autres: 'Autres',
};

const CategoryCards = () => {
    const [counts, setCounts] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCounts = async () => {
            setLoading(true);
            try {
                // Récupère toutes les pages pour avoir les vrais totaux
                const first = await getAnnonces(1);
                const lastPage = first.last_page || 1;
                const items = [...(first.data || [])];

                // Si plusieurs pages, charger les suivantes en parallèle
                if (lastPage > 1) {
                    const pages = await Promise.all(
                        Array.from({ length: lastPage - 1 }, (_, i) => getAnnonces(i + 2)),
                    );
                    pages.forEach((p) => items.push(...(p.data || [])));
                }

                // Compter par catégorie
                const c = {};
                items.forEach((a) => {
                    if (a.categorie) c[a.categorie] = (c[a.categorie] || 0) + 1;
                });
                setCounts(c);
            } catch {
                // Silencieux — les cards s'affichent sans compteur
            } finally {
                setLoading(false);
            }
        };
        fetchCounts();
    }, []);

    return (
        <section className="py-20 bg-white">
            <div className="container px-4 mx-auto">
                {/* Titre */}
                <motion.div
                    className="mb-12 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="mb-4 text-4xl font-bold">
                        Parcourir par
                        <span className="bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] bg-clip-text text-transparent">
                            {' '}
                            Spécialité
                        </span>
                    </h2>
                    <p className="text-lg text-gray-600">
                        Trouvez l'équipement médical dont vous avez besoin
                    </p>
                </motion.div>

                {/* Grille */}
                <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                    {CATEGORIES.map((category, index) => {
                        const backendName = SLUG_TO_CATEGORIE[category.slug];
                        const count = counts[backendName] ?? null;

                        return (
                            <motion.div
                                key={category.slug}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.07 }}
                            >
                                <Link to={`/categories/${category.slug}`}>
                                    <Card
                                        hover={true}
                                        className="h-48 overflow-hidden cursor-pointer group"
                                    >
                                        <div className="relative h-full">
                                            <img
                                                src={category.image}
                                                alt={category.name}
                                                className="absolute inset-0 object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <div
                                                className={`absolute inset-0 bg-gradient-to-br ${category.color} transition-opacity duration-300`}
                                            />
                                            <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-t from-black/40 to-transparent group-hover:opacity-100" />

                                            <div className="relative z-10 flex flex-col justify-end h-full p-4 text-white">
                                                <h3 className="text-lg font-bold leading-tight">
                                                    {category.name}
                                                </h3>

                                                {/* Compteur */}
                                                <div className="mt-1 h-4">
                                                    {loading ? (
                                                        <div className="w-16 h-3 bg-white/30 rounded animate-pulse" />
                                                    ) : count !== null && count > 0 ? (
                                                        <p className="text-xs text-white/80">
                                                            {count} équipement{count > 1 ? 's' : ''}
                                                        </p>
                                                    ) : (
                                                        <p className="text-xs text-white/50">
                                                            Bientôt disponible
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>

                {/* CTA */}
                <motion.div
                    className="mt-12 text-center"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                >
                    <Link to="/categories">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-8 py-3 border-2 border-[#1DBF73] text-[#1DBF73] rounded-xl font-semibold hover:bg-[#1DBF73] hover:text-white transition-all"
                        >
                            Voir toutes les catégories
                        </motion.button>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
};

export default CategoryCards;
