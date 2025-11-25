'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, Translations, getTranslations } from '@/lib/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'minka-language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Initialize with safe defaults
  const [language, setLanguageState] = useState<Language>('en');
  const [translations, setTranslations] = useState<Translations>(() => {
    try {
      const defaultTranslations = getTranslations('en');
      // Ensure translations object is valid
      if (!defaultTranslations || typeof defaultTranslations !== 'object') {
        console.warn('Invalid translations object, using fallback');
        return getTranslations('en');
      }
      return defaultTranslations;
    } catch (error) {
      console.error('Error initializing translations:', error);
      // Return a minimal fallback
      try {
        return getTranslations('en');
      } catch (fallbackError) {
        console.error('Critical: Could not load fallback translations', fallbackError);
        // Return a minimal object to prevent crashes
        return {} as Translations;
      }
    }
  });

  // Load language from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY) as Language;
        if (saved === 'en' || saved === 'bg') {
          const loadedTranslations = getTranslations(saved);
          // Validate loaded translations
          if (loadedTranslations && typeof loadedTranslations === 'object') {
            setLanguageState(saved);
            setTranslations(loadedTranslations);
          }
        }
      } catch (error) {
        console.error('Error loading language from localStorage:', error);
        // Keep default 'en' language
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    try {
      const newTranslations = getTranslations(lang);
      // Validate translations before setting
      if (newTranslations && typeof newTranslations === 'object') {
        setLanguageState(lang);
        setTranslations(newTranslations);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, lang);
        }
      } else {
        console.warn('Invalid translations for language:', lang);
      }
    } catch (error) {
      console.error('Error setting language:', error);
    }
  };

  // Ensure translations is always defined
  const safeTranslations = translations && typeof translations === 'object' 
    ? translations 
    : getTranslations('en');

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: safeTranslations }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

