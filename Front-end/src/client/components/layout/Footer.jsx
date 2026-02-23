    import React from 'react';
    import { Link } from 'react-router-dom';
    import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { useLang } from '../../context/LangContext';

    const Footer = () => {
  const { t } = useLang();
    return (
        <footer className='bg-white border-t border-gray-200'>
        <div className='container mx-auto px-4 py-8'>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
            {/* Logo & Description */}
            <div>
                <div className='flex items-center gap-2 mb-3'>
                <div className='w-8 h-8 bg-gradient-to-br from-[#1DBF73] to-[#09B1BA] rounded-lg flex items-center justify-center'>
                    <span className='text-white font-bold text-lg'>D</span>
                </div>
                <span className='text-xl font-bold bg-gradient-to-r from-[#1DBF73] to-[#09B1BA] bg-clip-text text-transparent'>
                    DocSpace
                </span>
                </div>
                <p className='text-gray-600 text-sm mb-3'>
                Marketplace d'équipements médicaux d'occasion certifiés.
                </p>
                {/* Réseaux sociaux */}
                <div className='flex items-center gap-2'>
                <button className='w-8 h-8 bg-gray-100 hover:bg-[#1DBF73] hover:text-white rounded-full flex items-center justify-center transition-all'>
                    <Facebook className='w-4 h-4' />
                </button>
                <button className='w-8 h-8 bg-gray-100 hover:bg-[#1DBF73] hover:text-white rounded-full flex items-center justify-center transition-all'>
                    <Twitter className='w-4 h-4' />
                </button>
                <button className='w-8 h-8 bg-gray-100 hover:bg-[#1DBF73] hover:text-white rounded-full flex items-center justify-center transition-all'>
                    <Instagram className='w-4 h-4' />
                </button>
                <button className='w-8 h-8 bg-gray-100 hover:bg-[#1DBF73] hover:text-white rounded-full flex items-center justify-center transition-all'>
                    <Linkedin className='w-4 h-4' />
                </button>
                </div>
            </div>

            {/* Liens rapides */}
            <div>
                <h3 className='font-bold text-gray-900 mb-3'>Liens Rapides</h3>
                <ul className='space-y-2 text-sm'>
                <li><Link to='/explore' className='text-gray-600 hover:text-[#1DBF73] transition-colors'>Explorer</Link></li>
                <li><Link to='/categories' className='text-gray-600 hover:text-[#1DBF73] transition-colors'>Catégories</Link></li>
                <li><Link to='/how-it-works' className='text-gray-600 hover:text-[#1DBF73] transition-colors'>Comment ça marche</Link></li>
                <li><Link to='/about' className='text-gray-600 hover:text-[#1DBF73] transition-colors'>À propos</Link></li>
                </ul>
            </div>

            {/* Support */}
            <div>
                <h3 className='font-bold text-gray-900 mb-3'>Support</h3>
                <ul className='space-y-2 text-sm'>
                <li><Link to='/faq' className='text-gray-600 hover:text-[#1DBF73] transition-colors'>FAQ</Link></li>
                <li><Link to='/contact' className='text-gray-600 hover:text-[#1DBF73] transition-colors'>Contact</Link></li>
                <li><Link to='/terms' className='text-gray-600 hover:text-[#1DBF73] transition-colors'>CGU</Link></li>
                <li><Link to='/privacy' className='text-gray-600 hover:text-[#1DBF73] transition-colors'>Confidentialité</Link></li>
                </ul>
            </div>

            {/* Contact */}
            <div>
                <h3 className='font-bold text-gray-900 mb-3'>Contact</h3>
                <ul className='space-y-2 text-sm'>
                <li className='flex items-center gap-2 text-gray-600'>
                    <Mail className='w-4 h-4 text-[#1DBF73]' />
                    <span>contact@docspace.com</span>
                </li>
                <li className='flex items-center gap-2 text-gray-600'>
                    <Phone className='w-4 h-4 text-[#1DBF73]' />
                    <span>+229 XX XX XX XX</span>
                </li>
                <li className='flex items-center gap-2 text-gray-600'>
                    <MapPin className='w-4 h-4 text-[#1DBF73]' />
                    <span>Cotonou, Bénin</span>
                </li>
                </ul>
            </div>
            </div>

            {/* Bottom bar */}
            <div className='border-t border-gray-200 mt-6 pt-6 flex flex-col md:flex-row justify-between items-center text-sm'>
            <p className='text-gray-600'>
                &copy; 2026 DocSpace. Tous droits réservés.
            </p>
            <p className='text-gray-600 flex items-center gap-1'>
                DocSpace <Heart className='w-4 h-4 text-red-500 fill-red-500' /> au Bénin
            </p>
            </div>
        </div>
        </footer>
    );
    };

    export default Footer;