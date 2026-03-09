import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { useLang } from '../../context/LangContext';

const Footer = () => {
  const { t } = useLang();
  return (
    <footer className='bg-white border-t border-gray-200'>
      <div className='container px-4 py-8 mx-auto'>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-4'>
          <div>
            <div className='flex items-center h-10 mb-3 overflow-hidden'>
              <img
                src='\images\docspace.png'
                alt='DocSpace Logo'
                className='object-contain h-20 w-36'
              />
            </div>
            <p className='mb-3 text-sm text-gray-600'>
              Marketplace d'équipements médicaux d'occasion certifiés.
            </p>
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

          <div>
            <h3 className='mb-3 font-bold text-gray-900'>Liens Rapides</h3>
            <ul className='space-y-2 text-sm'>
              <li><Link to='/explore' className='text-gray-600 hover:text-[#1DBF73] transition-colors'>Explorer</Link></li>
              <li><Link to='/categories' className='text-gray-600 hover:text-[#1DBF73] transition-colors'>Catégories</Link></li>
            </ul>
          </div>

          <div>
            <h3 className='mb-3 font-bold text-gray-900'>Support</h3>
            <ul className='space-y-2 text-sm'>
              <li><Link to='/faq' className='text-gray-600 hover:text-[#1DBF73] transition-colors'>FAQ</Link></li>
              <li><Link to='/contact' className='text-gray-600 hover:text-[#1DBF73] transition-colors'>Contact</Link></li>
              <li><Link to='/terms' className='text-gray-600 hover:text-[#1DBF73] transition-colors'>CGU</Link></li>
              <li><Link to='/privacy' className='text-gray-600 hover:text-[#1DBF73] transition-colors'>Confidentialité</Link></li>
            </ul>
          </div>

          <div>
            <h3 className='mb-3 font-bold text-gray-900'>Contact</h3>
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

        <div className='flex flex-col items-center justify-between pt-6 mt-6 text-sm border-t border-gray-200 md:flex-row'>
          <p className='text-gray-600'>
            &copy; 2026 DocSpace. Tous droits réservés.
          </p>
          <p className='flex items-center gap-1 text-gray-600'>
            DocSpace <Heart className='w-4 h-4 text-red-500 fill-red-500' /> au Bénin
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;