import React from 'react';
import ReactDOM from 'react-dom/client';
import { ProjectsLanding } from './components/ProjectsLanding';
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
      <ProjectsLanding />
    </I18nProvider>
  </React.StrictMode>
);
