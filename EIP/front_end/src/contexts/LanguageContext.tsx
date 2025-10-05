"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import frTranslations from "../locales/fr.json";
import enTranslations from "../locales/en.json";

type TranslationValue = string | string[] | { [key: string]: TranslationValue };

interface Translations {
  [key: string]: TranslationValue;
}

interface LanguageContextType {
  currentLanguage: string;
  changeLanguage: (language: string) => void;
  t: (
    key: string,
    variables?: Record<string, string | number>
  ) => string | string[];
  availableLanguages: string[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

const translations: { [key: string]: Translations } = {
  fr: frTranslations as Translations,
  en: enTranslations as Translations,
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [currentLanguage, setCurrentLanguage] = useState<string>("fr");

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage && translations[savedLanguage]) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("language", currentLanguage);
  }, [currentLanguage]);

  const changeLanguage = (language: string) => {
    if (translations[language]) {
      setCurrentLanguage(language);
    }
  };

  const t = (
    key: string,
    variables: Record<string, string | number> = {}
  ): string | string[] => {
    const keys = key.split(".");

    const findTranslation = (
      lang: string,
      keysToFind: string[]
    ): TranslationValue | null => {
      let result: TranslationValue = translations[lang];
      for (const k of keysToFind) {
        if (
          result &&
          typeof result === "object" &&
          !Array.isArray(result) &&
          k in result
        ) {
          result = result[k];
        } else {
          return null;
        }
      }
      return result;
    };

    const translationValue =
      findTranslation(currentLanguage, keys) ?? findTranslation("fr", keys);

    if (translationValue === null) {
      return key;
    }

    if (typeof translationValue === "string") {
      let templatedString = translationValue;
      Object.entries(variables).forEach(([varKey, varValue]) => {
        const regex = new RegExp(`\\{\\{?${varKey}\\}?\}`, "g");
        templatedString = templatedString.replace(regex, String(varValue));
      });
      return templatedString;
    }

    if (Array.isArray(translationValue)) {
      return translationValue;
    }

    return key;
  };

  const value: LanguageContextType = {
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

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
