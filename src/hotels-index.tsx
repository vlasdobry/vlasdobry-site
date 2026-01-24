import React from 'react';
import ReactDOM from 'react-dom/client';
import { HotelsLanding } from './components/HotelsLanding';
import { I18nProvider, Lang } from './i18n';

const lang: Lang = window.location.pathname.startsWith('/en') ? 'en' : 'ru';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <I18nProvider lang={lang}>
      <HotelsLanding />
    </I18nProvider>
  </React.StrictMode>
);
