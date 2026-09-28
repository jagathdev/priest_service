"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { en } from "@/locales/en";
import { hi } from "@/locales/hi";
import { ta } from "@/locales/ta";
import { te } from "@/locales/te";
import { kn } from "@/locales/kn";

type SupportedLanguages = "en" | "hi" | "ta" | "te" | "kn";

const translations: Record<SupportedLanguages, any> = {
  en, hi, ta, te, kn
};

interface LanguageContextType {
  language: SupportedLanguages;
  setLanguage: (lang: SupportedLanguages) => void;
  t: any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<SupportedLanguages>("en");

  // Load language from localStorage on mount
  useEffect(() => {
    const storedLang = localStorage.getItem("AstroVed_lang") as SupportedLanguages;
    if (storedLang && Object.keys(translations).includes(storedLang)) {
      setLanguageState(storedLang);
    }
  }, []);

  const setLanguage = (lang: SupportedLanguages) => {
    setLanguageState(lang);
    localStorage.setItem("AstroVed_lang", lang);
  };

  // Basic translation function using dot notation (e.g., 'nav.home')
  const tFunction = (key: string): string => {
    const keys = key.split(".");
    let current: any = translations[language];
    for (const k of keys) {
      if (current[k] === undefined) {
        // Fallback to English if translation is missing
        let fallback: any = translations["en"];
        for (const fk of keys) {
           fallback = fallback?.[fk];
        }
        return fallback || key;
      }
      current = current[k];
    }
    return current;
  };

  const t: any = Object.assign(tFunction, translations[language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
};
