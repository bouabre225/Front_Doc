import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n/translate';

const LangContext = createContext();
const STORAGE_KEY = 'docspace_lang';

const getInitialLang = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && translations[saved]) return saved;
    const nav = (navigator.language || 'fr').toLowerCase();
    if (nav.startsWith('en')) return 'en';
  } catch { /* ignore */ }
  return 'fr';
};

export const LangProvider = ({ children }) => {
  const [currentLang, setCurrentLang] = useState(getInitialLang);
  const t = translations[currentLang] ?? translations.fr;
  const langList = Object.values(translations);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, currentLang);
      document.documentElement.lang = currentLang;
    } catch { /* ignore */ }
  }, [currentLang]);

  return (
    <LangContext.Provider value={{ currentLang, setCurrentLang, t, langList }}>
      {children}
    </LangContext.Provider>
  );
};

export const useLang = () => useContext(LangContext) ?? { currentLang: 'fr', setCurrentLang: () => {}, t: translations.fr, langList: Object.values(translations) };
