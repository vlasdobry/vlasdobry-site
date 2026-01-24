import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useI18n } from '../i18n';

interface OffersMenuProps {
  variant?: 'light' | 'dark';
}

export const OffersMenu: React.FC<OffersMenuProps> = ({ variant = 'light' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { t } = useI18n();

  const styles = {
    light: {
      button: 'text-zinc-400 hover:text-black',
      dropdown: 'bg-white border border-zinc-200 shadow-lg',
      item: 'text-zinc-600 hover:text-black hover:bg-zinc-50',
    },
    dark: {
      button: 'text-white/60 hover:text-white',
      dropdown: 'bg-zinc-900 border border-white/10 shadow-lg',
      item: 'text-white/70 hover:text-white hover:bg-white/10',
    },
  };

  const s = styles[variant];

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1 text-[10px] font-bold tracking-[0.2em] uppercase transition-colors ${s.button}`}
      >
        {t.offersMenu.label}
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute top-full left-0 mt-2 min-w-[160px] rounded-lg overflow-hidden z-50 ${s.dropdown}`}>
          {t.offersMenu.items.map((item, i) => (
            <a
              key={i}
              href={item.href}
              className={`block px-4 py-3 text-sm transition-colors ${s.item}`}
              onClick={() => setIsOpen(false)}
            >
              {item.title}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};
