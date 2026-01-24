import React from 'react';
import { useI18n } from '../i18n';

interface LanguageSwitcherProps {
  variant?: 'light' | 'dark';
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ variant = 'light' }) => {
  const { lang } = useI18n();

  const styles = {
    light: {
      active: 'text-black',
      inactive: 'text-zinc-400 hover:text-black',
      separator: 'text-zinc-300',
    },
    dark: {
      active: 'text-white/80',
      inactive: 'text-white/40 hover:text-white/80',
      separator: 'text-white/20',
    },
  };

  const s = styles[variant];

  return (
    <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase">
      <a
        href="/"
        className={`transition-colors ${lang === 'ru' ? s.active : s.inactive}`}
      >
        RU
      </a>
      <span className={s.separator}>|</span>
      <a
        href="/en/"
        className={`transition-colors ${lang === 'en' ? s.active : s.inactive}`}
      >
        EN
      </a>
    </div>
  );
};
