import React, { useState, useEffect } from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { useI18n } from '../i18n';
import { LanguageSwitcher } from './LanguageSwitcher';
import { analytics } from '../utils/analytics';

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
          isScrolled ? 'py-3' : 'py-16'
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
              <article key={i} aria-label={project.name} className="bg-zinc-50 rounded-2xl p-8 md:p-10">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <h2 className="text-2xl md:text-3xl font-black">{project.name}</h2>
                  <span className="text-[10px] tracking-widest uppercase font-bold px-3 py-1 rounded-full bg-zinc-200 text-zinc-600">
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
              </article>
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
              loading="lazy"
            />
          </div>

          <a
            href="https://t.me/vlasdobry"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => analytics.clickTelegram('projects')}
            className="inline-block text-lg md:text-xl font-bold uppercase tracking-[0.2em] border-2 border-black px-10 py-5 hover:bg-black hover:text-white transition-all"
          >
            {t.projects.cta.button}
          </a>

          <p className="mt-6 text-zinc-400">
            {t.projects.cta.alternative}{' '}
            <a href={`mailto:${t.projects.cta.email}`} onClick={() => analytics.clickEmail('projects')} className="underline hover:text-black transition-colors">
              {t.projects.cta.email}
            </a>
          </p>
        </section>

        {/* Footer */}
        <footer className="pt-16 pb-24 border-t border-zinc-100">
          <div className="flex flex-col md:flex-row justify-between gap-12">
            {/* Left: Name, role, contacts */}
            <div>
              <h4 className="text-2xl font-bold">{t.projects.footer.name}</h4>
              <p className="text-zinc-400 text-sm font-light mt-1">{t.projects.footer.role}</p>
              <a href="tel:+79068972037" onClick={() => analytics.clickPhone('projects')} className="block mt-4 text-2xl font-bold hover:text-zinc-500 transition-colors">+7 906 897-20-37</a>
              <div className="flex gap-6 mt-4 text-[11px] font-bold tracking-[0.4em] uppercase text-zinc-400">
                <a href="https://t.me/vlasdobry" target="_blank" rel="noopener noreferrer" onClick={() => analytics.clickTelegram('projects_footer')} className="hover:text-black">{t.projects.footer.links.telegram}</a>
                <a href="https://wa.me/79068972037" target="_blank" rel="noopener noreferrer" onClick={() => analytics.clickWhatsapp('projects_footer')} className="hover:text-black">{t.projects.footer.links.whatsapp}</a>
                <a href="mailto:vlasdobry@gmail.com" onClick={() => analytics.clickEmail('projects_footer')} className="hover:text-black">{t.projects.footer.links.email}</a>
              </div>
            </div>
            {/* Right: Offers & Services */}
            <div className="flex gap-12">
              <div>
                <h5 className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-300 mb-3">{t.landing.footer.nav.offers.label}</h5>
                <div className="border-t border-zinc-100 mb-3"></div>
                <ul className="space-y-2">
                  {t.landing.footer.nav.offers.items.map((item) => (
                    <li key={item.url}>
                      <a href={item.url} className="text-sm text-zinc-500 hover:text-black transition-colors">{item.name}</a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-300 mb-3">{t.landing.footer.nav.services.label}</h5>
                <div className="border-t border-zinc-100 mb-3"></div>
                <ul className="space-y-2">
                  {t.landing.footer.nav.services.items.map((item) => (
                    <li key={item.url}>
                      <a href={item.url} className="text-sm text-zinc-500 hover:text-black transition-colors">{item.name}</a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-300 mb-3">{t.landing.footer.nav.blog.label}</h5>
                <div className="border-t border-zinc-100 mb-3"></div>
                <ul className="space-y-2">
                  {t.landing.footer.nav.blog.items.map((item) => (
                    <li key={item.url}>
                      <a href={item.url} className="text-sm text-zinc-500 hover:text-black transition-colors">{item.name}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <p className="text-zinc-300 text-sm mt-12">&copy; {new Date().getFullYear()} {t.projects.footer.name}</p>
        </footer>
      </div>
    </main>
  );
};
