import React, { useState, useEffect } from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { useI18n } from '../i18n';
import { LanguageSwitcher } from './LanguageSwitcher';

export const ProjectsLanding: React.FC = () => {
  const { t, lang } = useI18n();
  const [isScrolled, setIsScrolled] = useState(false);

  const landingUrl = lang === 'ru' ? '/#landing' : '/en/#landing';

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (!isScrolled && scrollY > 80) {
        setIsScrolled(true);
      } else if (isScrolled && scrollY < 20) {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isScrolled]);

  return (
    <main className="min-h-screen bg-white text-[#121212]">
      {/* Sticky Navigation */}
      <nav className={`sticky top-0 z-50 border-b transition-all duration-500 ease-out ${
        isScrolled
          ? 'bg-white/80 backdrop-blur-lg border-zinc-100'
          : 'bg-white border-transparent'
      }`}>
        <div className={`max-w-5xl mx-auto px-6 sm:px-12 flex justify-between items-center transition-all duration-500 ease-out ${
          isScrolled ? 'py-3' : 'py-16 md:py-32'
        }`}>
          <div className="flex items-center gap-6">
            <a href={landingUrl} className="text-2xl font-black tracking-tighter hover:opacity-70 transition-opacity">
              VD.
            </a>
            <LanguageSwitcher basePath="/projects" />
          </div>
          <a
            href={landingUrl}
            className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-400 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            {t.projects.nav.backToMain}
          </a>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 sm:px-12 py-16 md:py-24">
        {/* Hero Section */}
        <header className="pb-16 md:pb-24">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-8">
            {t.projects.hero.title}
          </h1>
          <p className="text-xl md:text-2xl text-zinc-500 font-light max-w-3xl">
            {t.projects.hero.subtitle}
          </p>
        </header>

        {/* Projects List */}
        <section className="py-16 border-t border-zinc-100" aria-label={t.projects.hero.title}>
          <div className="space-y-8">
            {t.projects.items.map((project, i) => (
              <div key={i} className="bg-zinc-50 rounded-2xl p-8 md:p-10">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <h2 className="text-2xl md:text-3xl font-black">{project.name}</h2>
                  <span className={`text-[10px] tracking-widest uppercase font-bold px-3 py-1 rounded-full ${
                    project.statusKey === 'live'
                      ? 'bg-emerald-100 text-emerald-700'
                      : project.statusKey === 'mvp'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-zinc-200 text-zinc-600'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <p className="text-zinc-600 text-lg font-light mb-6 max-w-3xl">
                  {project.description}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  {project.tags.map(tag => (
                    <span key={tag} className="text-[10px] tracking-widest uppercase text-zinc-400 font-bold bg-white px-3 py-1.5 rounded-lg">
                      {tag}
                    </span>
                  ))}
                  {project.url && (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto flex items-center gap-1.5 text-sm font-bold text-zinc-400 hover:text-black transition-colors"
                    >
                      {project.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Also Built Section */}
        <section className="py-16 border-t border-zinc-100" aria-labelledby="also-heading">
          <h2 id="also-heading" className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-300 mb-12">
            {t.projects.alsoBuilt.label}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {t.projects.alsoBuilt.items.map((item, i) => (
              <div key={i}>
                <h3 className="text-lg font-bold mb-2">{item.name}</h3>
                <p className="text-zinc-500 font-light text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 text-center border-t border-zinc-100" aria-labelledby="cta-heading">
          <h2 id="cta-heading" className="text-4xl md:text-6xl lg:text-7xl font-black mb-8 tracking-tight">
            {t.projects.cta.heading}
          </h2>

          <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-zinc-100 overflow-hidden">
            <img
              src="/vlas-photo.jpg"
              alt="Vlas Fedorov"
              className="w-full h-full object-cover"
            />
          </div>

          <a
            href="https://t.me/vlasdobry"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-lg md:text-xl font-bold uppercase tracking-[0.2em] border-2 border-black px-10 py-5 hover:bg-black hover:text-white transition-all"
          >
            {t.projects.cta.button}
          </a>

          <p className="mt-6 text-zinc-400">
            {t.projects.cta.alternative}{' '}
            <a href={`mailto:${t.projects.cta.email}`} className="underline hover:text-black transition-colors">
              {t.projects.cta.email}
            </a>
          </p>
        </section>

        {/* Footer */}
        <footer className="py-16 flex flex-col md:flex-row justify-between items-center gap-8 border-t border-zinc-100">
          <div className="text-center md:text-left">
            <h4 className="text-xl font-bold">{t.projects.footer.name}</h4>
            <p className="text-zinc-400 text-sm font-light mt-1">{t.projects.footer.role}</p>
          </div>
          <div className="flex gap-8 text-[11px] font-bold tracking-[0.4em] uppercase text-zinc-400">
            <a href="https://t.me/vlasdobry" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">
              {t.projects.footer.links.telegram}
            </a>
            <a href="https://wa.me/79068972037" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">
              {t.projects.footer.links.whatsapp}
            </a>
            <a href="mailto:vlasdobry@gmail.com" className="hover:text-black transition-colors">
              {t.projects.footer.links.email}
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
};
