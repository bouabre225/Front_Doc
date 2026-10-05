import { useEffect } from 'react';

const getVisitorId = () => {
  try {
    let id = localStorage.getItem('docspace_visitor');
    if (!id) {
      id = (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2));
      localStorage.setItem('docspace_visitor', id);
    }
    return id;
  } catch { return null; }
};

export const isTrackingAllowed = () => {
  try { return localStorage.getItem('docspace_tracking') !== 'refuse'; } catch { return false; }
};

// Envoie une vue (fire-and-forget, jamais bloquant)
export const trackView = (payload = {}) => {
  try {
    if (!isTrackingAllowed()) return;
    const visitor_id = getVisitorId();
    if (!visitor_id) return;
    fetch(`${import.meta.env.VITE_API_URL || 'https://docspace.bj/api'}/visites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      keepalive: true,
      body: JSON.stringify({ visitor_id, page: window.location.pathname, ...payload }),
    }).catch(() => {});
  } catch { /* ignore */ }
};

// À monter sur une page : trackView({ annonce_id }) ou trackView() pour page simple
export const useTracking = (payload) => {
  useEffect(() => {
    const t = setTimeout(() => trackView(payload || {}), 800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload?.annonce_id, payload?.page]);
};

export default useTracking;
