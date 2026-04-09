// src/hooks/useImageViewer.js
import { useState } from 'react';

export const useImageViewer = () => {
  const [viewer, setViewer] = useState({ open: false, images: [], index: 0, titre: '' });

  const openViewer = (images, index = 0, titre = '') => {
    if (!images?.length) return;
    setViewer({ open: true, images, index, titre });
  };

  const closeViewer = () => setViewer(prev => ({ ...prev, open: false }));

  return { viewer, openViewer, closeViewer };
};