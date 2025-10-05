import React, { createContext, useContext, useState, useEffect } from "react";
import frTranslations from "../locales/fr.json";
import enTranslations from "../locales/en.json";

const LanguageContext = createContext();

const translations = {
  fr: frTranslations,
  en: enTranslations,
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return localStorage.getItem("language") || "fr";
  });

  useEffect(() => {
    localStorage.setItem("language", currentLanguage);
  }, [currentLanguage]);

  const changeLanguage = (language) => {
    if (translations[language]) {
      setCurrentLanguage(language);
    }
  };

  const t = (key, variables = {}) => {
    const keys = key.split(".");
    let value = translations[currentLanguage];

    const findTranslation = (lang, keysToFind) => {
      let result = translations[lang];
      for (const k of keysToFind) {
        if (result && typeof result === "object" && k in result) {
          result = result[k];
        } else {
          return null;
        }
      }
      return result;
    };

    value = findTranslation(currentLanguage, keys);

    if (value === null) {
      value = findTranslation("fr", keys);
    }

    if (value === null) {
      return key;
    }

    let translation = value;

    if (
      typeof translation === "string" &&
      variables &&
      Object.keys(variables).length > 0
    ) {
      Object.entries(variables).forEach(([varKey, varValue]) => {
        const regexDouble = new RegExp(`\\{\\{${varKey}\\}\\}`, "g");
        const regexSingle = new RegExp(`\\{${varKey}\\}`, "g");

        translation = translation.replace(regexDouble, String(varValue));
        translation = translation.replace(regexSingle, String(varValue));
      });
    }

    return translation;
  };

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    availableLanguages: Object.keys(translations),
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
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
