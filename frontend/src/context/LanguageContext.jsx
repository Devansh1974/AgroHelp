import React, { createContext, useContext, useEffect, useState } from "react";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  // This now defaults to the saved language in localStorage, or 'en'
  const [language, setLanguage] = useState(() => localStorage.getItem("agro_lang") || "en");

  // This effect automatically saves the language to the browser's storage whenever it changes
  useEffect(() => {
    localStorage.setItem("agro_lang", language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
