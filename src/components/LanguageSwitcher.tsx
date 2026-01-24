import React from 'react';
import { useI18n } from '../i18n';

export const LanguageSwitcher: React.FC = () => {
  const { lang } = useI18n();

  return (
    <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase">
      <a
        href="/"
        className={`transition-colors ${
          lang === 'ru' ? 'text-black' : 'text-zinc-400 hover:text-black'
        }`}
      >
        RU
      </a>
      <span className="text-zinc-300">|</span>
      <a
        href="/en/"
        className={`transition-colors ${
          lang === 'en' ? 'text-black' : 'text-zinc-400 hover:text-black'
        }`}
      >
        EN
      </a>
    </div>
  );
};
