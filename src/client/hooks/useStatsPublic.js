import { useState, useEffect } from 'react';
import { getStatsPublic } from '../../services/api';

let cache = null;
let cacheAt = 0;
const TTL = 5 * 60 * 1000;

// Stats publiques partagées (1 seul appel pour toute la home, cache 5 min)
export const useStatsPublic = () => {
  const [stats, setStats] = useState(cache);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    let alive = true;
    if (cache && Date.now() - cacheAt < TTL) {
      setStats(cache);
      setLoading(false);
      return;
    }
    setLoading(true);
    getStatsPublic()
      .then((data) => {
        cache = data;
        cacheAt = Date.now();
        if (alive) setStats(data);
      })
      .catch(() => {})
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  return { stats, loading };
};

export default useStatsPublic;
