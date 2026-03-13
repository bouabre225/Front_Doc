import { createContext, useContext, useState } from 'react';
import { translations } from '../i18n/translate';

const LangContext = createContext();

export const LangProvider = ({ children }) => {
  const [currentLang, setCurrentLang] = useState('fr');
  const t = translations[currentLang];
  const langList = Object.values(translations);

  return (
    <LangContext.Provider value={{ currentLang, setCurrentLang, t, langList }}>
      {children}
    </LangContext.Provider>
  );
};

export const useLang = () => useContext(LangContext);