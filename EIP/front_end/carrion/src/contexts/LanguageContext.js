import React, { createContext, useContext, useState, useEffect } from 'react';
import frTranslations from '../locales/fr.json';
import enTranslations from '../locales/en.json';

const LanguageContext = createContext();

const translations = {
  fr: frTranslations,
  en: enTranslations
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    // Get language from localStorage or default to French
    return localStorage.getItem('language') || 'fr';
  });

  useEffect(() => {
    // Save language preference to localStorage
    localStorage.setItem('language', currentLanguage);
  }, [currentLanguage]);

  const changeLanguage = (language) => {
    if (translations[language]) {
      setCurrentLanguage(language);
    }
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[currentLanguage];
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        // Fallback to French if key not found
        value = translations.fr;
        for (const k of keys) {
          if (value && typeof value === 'object') {
            value = value[k];
          } else {
            return key; // Return key if translation not found
          }
        }
        break;
      }
    }
    
    return value || key;
  };

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    availableLanguages: Object.keys(translations)
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 