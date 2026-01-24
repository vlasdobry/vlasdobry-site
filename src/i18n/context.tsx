import React, { createContext, useContext, ReactNode } from 'react';
import { Lang, Translations } from './types';
import { ru } from './ru';
import { en } from './en';

interface I18nContextValue {
  lang: Lang;
  t: Translations;
}

const translations: Record<Lang, Translations> = { ru, en };

const I18nContext = createContext<I18nContextValue | null>(null);

interface I18nProviderProps {
  lang: Lang;
  children: ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ lang, children }) => {
  const value: I18nContextValue = {
    lang,
    t: translations[lang],
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = (): I18nContextValue => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
};
