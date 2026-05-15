import React, { useEffect, useState } from 'react';
import { Lang } from '../i18n';

const COOKIE_NOTICE_KEY = 'cookie_notice_accepted';

interface CookieNoticeProps {
  lang: Lang;
}

export const CookieNotice: React.FC<CookieNoticeProps> = ({ lang }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      setIsVisible(localStorage.getItem(COOKIE_NOTICE_KEY) !== 'true');
    } catch {
      setIsVisible(true);
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(COOKIE_NOTICE_KEY, 'true');
    } catch {
      // If storage is unavailable, hide the notice for the current session.
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const text = lang === 'ru'
    ? 'Сайт использует cookies, Яндекс.Метрику и localStorage для аналитики, улучшения сервиса и работы инструментов проверки. Продолжая пользоваться сайтом или нажимая «Согласен», вы подтверждаете, что ознакомились с политикой обработки данных.'
    : 'This site uses cookies, Yandex Metrica, and localStorage for analytics, service improvement, and website check tools. By continuing to use the site or clicking “I agree”, you confirm that you have read the privacy policy.';
  const linkText = lang === 'ru' ? 'Политика обработки данных' : 'Privacy policy';
  const linkHref = lang === 'ru' ? '/privacy/' : '/en/privacy/';
  const buttonText = lang === 'ru' ? 'Согласен' : 'I agree';

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] px-4 pb-4 sm:px-6 sm:pb-6 pointer-events-none">
      <div className="pointer-events-auto max-w-5xl mx-auto rounded-lg border border-zinc-200 bg-white/95 backdrop-blur-xl shadow-2xl shadow-black/10 px-4 py-4 sm:px-5 sm:py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-relaxed text-zinc-600">
            {text}{' '}
            <a href={linkHref} className="font-medium text-black underline underline-offset-4">
              {linkText}
            </a>
          </p>
          <button
            type="button"
            onClick={accept}
            className="shrink-0 rounded-md bg-black px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-zinc-800"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};
