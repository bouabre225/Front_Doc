import { useState, useEffect, useCallback } from 'react';
import { toggleFavori, syncFavoris } from '../../services/api';
import { safeParse } from '../../services/api';

const readLocal = () => safeParse('favorites', []).map(String);

// Cœur connecté : serveur si connecté, local sinon.
// Au login, les favoris locaux sont poussés au serveur (sync).
export const useFavoris = () => {
  const [favorites, setFavorites] = useState(readLocal);
  const [syncing, setSyncing] = useState(false);

  const isLogged = useCallback(() => {
    try { return !!localStorage.getItem('auth_token'); } catch { return false; }
  }, []);

  // Sync local → serveur (appelée après login / au montage si connecté)
  const pushLocal = useCallback(async () => {
    if (!isLogged()) return;
    const local = readLocal().filter(Boolean);
    if (!local.length) return;
    setSyncing(true);
    try {
      const res = await syncFavoris(local);
      const ids = (res?.data ?? res ?? []).map(String);
      setFavorites(ids);
      localStorage.setItem('favorites', JSON.stringify(ids));
    } catch { /* offline : on garde le local */ }
    finally { setSyncing(false); }
  }, [isLogged]);

  useEffect(() => {
    pushLocal();
    const onStorage = () => { setFavorites(readLocal()); pushLocal(); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [pushLocal]);

  const toggle = useCallback(async (id) => {
    const sid = String(id);
    if (!isLogged()) {
      setFavorites((prev) => {
        const updated = prev.includes(sid) ? prev.filter((f) => f !== sid) : [...prev, sid];
        try { localStorage.setItem('favorites', JSON.stringify(updated)); } catch { /* ignore */ }
        return updated;
      });
      return;
    }
    // Optimiste + serveur
    setFavorites((prev) => {
      const updated = prev.includes(sid) ? prev.filter((f) => f !== sid) : [...prev, sid];
      try { localStorage.setItem('favorites', JSON.stringify(updated)); } catch { /* ignore */ }
      return updated;
    });
    try {
      const res = await toggleFavori(sid);
      const on = res?.favori;
      setFavorites((prev) => {
        const updated = on ? [...new Set([...prev, sid])] : prev.filter((f) => f !== sid);
        try { localStorage.setItem('favorites', JSON.stringify(updated)); } catch { /* ignore */ }
        return updated;
      });
    } catch {
      // rollback si 401/erreur : on recharge le local
      setFavorites(readLocal());
    }
  }, [isLogged]);

  const isFavorite = useCallback((id) => favorites.includes(String(id)), [favorites]);

  return { favorites, isFavorite, toggle, syncing, refresh: pushLocal };
};

export default useFavoris;
