import React from 'react';

// Petit spinner circulaire réutilisable
export const Spinner = ({ size = 'w-5 h-5', color = 'border-white' }) => (
  <div className={`${size} border-2 ${color} rounded-full border-t-transparent animate-spin`} />
);

// Loader pleine page (header/footer gérés par la page appelante si besoin)
export const PageLoader = ({ label = 'Chargement...' }) => (
  <div className='flex flex-col items-center justify-center gap-3 py-24'>
    <div className='w-12 h-12 border-4 border-[#1DBF73] rounded-full border-t-transparent animate-spin' />
    {label && <p className='text-sm text-gray-500'>{label}</p>}
  </div>
);

// Carte équipement (grilles Explore / accueil / admin)
export const SkeletonCard = () => (
  <div className='overflow-hidden bg-white border border-gray-100 rounded-2xl animate-pulse'>
    <div className='h-48 bg-gray-200' />
    <div className='p-4 space-y-3'>
      <div className='h-3 bg-gray-200 rounded w-1/3' />
      <div className='h-4 bg-gray-200 rounded w-full' />
      <div className='h-4 bg-gray-200 rounded w-3/4' />
      <div className='h-6 bg-gray-200 rounded w-1/3 mt-2' />
      <div className='h-9 bg-gray-200 rounded-xl mt-3' />
    </div>
  </div>
);

export const SkeletonGrid = ({ count = 6 }) => (
  <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

// Détail équipement / commande (2 colonnes)
export const SkeletonDetail = () => (
  <div className='container max-w-5xl px-4 py-10 mx-auto'>
    <div className='grid grid-cols-1 gap-8 lg:grid-cols-2 animate-pulse'>
      <div className='h-80 bg-gray-200 rounded-2xl' />
      <div className='space-y-4'>
        <div className='h-4 bg-gray-200 rounded w-1/3' />
        <div className='h-7 bg-gray-200 rounded w-3/4' />
        <div className='h-4 bg-gray-200 rounded w-full' />
        <div className='h-4 bg-gray-200 rounded w-5/6' />
        <div className='h-8 bg-gray-200 rounded w-1/2' />
        <div className='h-11 bg-gray-200 rounded-xl' />
      </div>
    </div>
  </div>
);

// Lignes de tableau (admin)
export const SkeletonTable = ({ rows = 5 }) => (
  <div className='space-y-3 animate-pulse'>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className='flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl'>
        <div className='w-10 h-10 bg-gray-200 rounded-xl shrink-0' />
        <div className='flex-1 space-y-2'>
          <div className='h-4 bg-gray-200 rounded w-2/5' />
          <div className='h-3 bg-gray-100 rounded w-3/5' />
        </div>
        <div className='w-20 h-8 bg-gray-200 rounded-xl shrink-0' />
      </div>
    ))}
  </div>
);

// Conversations (liste gauche messagerie)
export const SkeletonConversations = ({ count = 4 }) => (
  <div className='p-4 space-y-3 animate-pulse'>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className='flex items-center gap-3 p-3'>
        <div className='w-10 h-10 bg-gray-200 rounded-full shrink-0' />
        <div className='flex-1 space-y-2'>
          <div className='h-3 bg-gray-200 rounded w-3/4' />
          <div className='h-3 bg-gray-100 rounded w-1/2' />
        </div>
      </div>
    ))}
  </div>
);

// Bulles de messages (zone de conversation)
export const SkeletonChat = ({ count = 5 }) => (
  <div className='p-4 space-y-3 animate-pulse'>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={`flex ${i % 2 ? 'justify-start' : 'justify-end'}`}>
        <div className={`h-10 bg-gray-200 rounded-2xl ${i % 2 ? 'w-2/5 rounded-tl-md' : 'w-1/3 rounded-tr-md'}`} />
      </div>
    ))}
  </div>
);

// Profil utilisateur
export const SkeletonProfile = () => (
  <div className='container max-w-4xl px-4 py-8 mx-auto animate-pulse'>
    <div className='p-6 bg-white border border-gray-100 rounded-2xl'>
      <div className='flex items-center gap-4 mb-6'>
        <div className='w-20 h-20 bg-gray-200 rounded-full' />
        <div className='flex-1 space-y-2'>
          <div className='h-5 bg-gray-200 rounded w-1/3' />
          <div className='h-3 bg-gray-100 rounded w-1/4' />
        </div>
      </div>
      <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className='h-16 bg-gray-100 rounded-xl' />
        ))}
      </div>
      <div className='mt-6 space-y-3'>
        {[1, 2, 3].map((i) => (
          <div key={i} className='h-14 bg-gray-100 rounded-xl' />
        ))}
      </div>
    </div>
  </div>
);

export default { Spinner, PageLoader, SkeletonCard, SkeletonGrid, SkeletonDetail, SkeletonTable, SkeletonConversations, SkeletonChat, SkeletonProfile };
