import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const SOCIAL_LINKS = [
  { icon: Facebook,  href: 'https://facebook.com/docspace',  label: 'Facebook' },
  { icon: Twitter,   href: 'https://twitter.com/docspace',   label: 'Twitter' },
  { icon: Instagram, href: 'https://instagram.com/docspace', label: 'Instagram' },
  { icon: Linkedin,  href: 'https://linkedin.com/company/docspace', label: 'LinkedIn' },
];

const Footer = () => {
  return (
    <footer className='bg-white border-t border-gray-200'>
      <div className='container px-4 py-8 mx-auto'>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-4'>

          {/* Logo + description + réseaux */}
          <div>
            <div className='flex items-center h-10 mb-3 overflow-hidden'>
              <img
                src='/images/docspace.png'
                alt='DocSpace Logo'
                className='object-contain h-20 w-36'
              />
            </div>
            <p className='mb-3 text-sm text-gray-600'>
              Marketplace d'équipements médicaux d'occasion certifiés.
            </p>
            <div className='flex items-center gap-2'>
              {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target='_blank'
                  rel='noopener noreferrer'
                  aria-label={label}
                  className='w-8 h-8 bg-gray-100 hover:bg-[#1DBF73] hover:text-white text-gray-600 rounded-full flex items-center justify-center transition-all'
                >
                  <Icon className='w-4 h-4' />
                </a>
              ))}
            </div>  
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className='mb-3 font-bold text-gray-900'>Liens Rapides</h3>
            <ul className='space-y-2 text-sm'>
              <li><Link to='/explore'    className='text-gray-600 hover:text-[#1DBF73] transition-colors'>Explorer</Link></li>
              <li><Link to='/categories' className='text-gray-600 hover:text-[#1DBF73] transition-colors'>Catégories</Link></li>
              <li><Link to='/publish-equipment' className='text-gray-600 hover:text-[#1DBF73] transition-colors'>Vendre</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className='mb-3 font-bold text-gray-900'>Support</h3>
            <ul className='space-y-2 text-sm'>
              <li><Link to='/faq'     className='text-gray-600 hover:text-[#1DBF73] transition-colors'>FAQ</Link></li>
              <li><Link to='/contact' className='text-gray-600 hover:text-[#1DBF73] transition-colors'>Contact</Link></li>
              <li><Link to='/terms'   className='text-gray-600 hover:text-[#1DBF73] transition-colors'>CGU</Link></li>
              <li><Link to='/privacy' className='text-gray-600 hover:text-[#1DBF73] transition-colors'>Confidentialité</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className='mb-3 font-bold text-gray-900'>Contact</h3>
            <ul className='space-y-2 text-sm'>
              <li>
                <a href='mailto:contact@docspace.com' className='flex items-center gap-2 text-gray-600 hover:text-[#1DBF73] transition-colors'>
                  <Mail className='w-4 h-4 text-[#1DBF73]' />
                  contact@docspace.com
                </a>
              </li>
              <li>
                <a href='tel:+22900000000' className='flex items-center gap-2 text-gray-600 hover:text-[#1DBF73] transition-colors'>
                  <Phone className='w-4 h-4 text-[#1DBF73]' />
                  +229 XX XX XX XX
                </a>
              </li>
              <li className='flex items-center gap-2 text-gray-600'>
                <MapPin className='w-4 h-4 text-[#1DBF73]' />
                Cotonou, Bénin
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className='flex flex-col items-center justify-between pt-6 mt-6 text-sm border-t border-gray-200 md:flex-row'>
          <p className='text-gray-600'>
            &copy; {new Date().getFullYear()} DocSpace. Tous droits réservés.
          </p>
          <p className='flex items-center gap-1 text-gray-600'>
            Fait avec <Heart className='w-4 h-4 text-red-500 fill-red-500 mx-1' /> au Bénin
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;