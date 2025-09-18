import React, { createContext, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation();
  
  const [language, setLanguage] = useState(() => {
    const savedLang = localStorage.getItem("agro_lang") || "en";
    return savedLang;
  });

  useEffect(() => {
    localStorage.setItem("agro_lang", language);
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);

  const value = { language, setLanguage };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider> 
  );
};

export const useLanguage = () => useContext(LanguageContext);

