// Locale courante pour Intl (nombres/dates). Lit la langue persistée.
export const getLocale = () => {
  try {
    return localStorage.getItem('docspace_lang') === 'en' ? 'en-US' : 'fr-FR';
  } catch {
    return 'fr-FR';
  }
};

export const fmtNum = (n) => Number(n || 0).toLocaleString(getLocale());
export const fmtDate = (d, opts) => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString(getLocale(), opts);
  } catch {
    return String(d);
  }
};
