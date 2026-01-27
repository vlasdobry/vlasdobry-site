import React, { useState } from 'react';
import { useI18n } from '../i18n';
import { LanguageSwitcher } from './LanguageSwitcher';
import { OffersMenu } from './OffersMenu';

interface LandingProps {
  onBack?: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onBack }) => {
  const [graceExpanded, setGraceExpanded] = useState(false);
  const { t } = useI18n();

  return (
    <main className="max-w-5xl mx-auto px-6 sm:px-12 py-16 bg-white text-[#121212]">
      {/* Top Navigation */}
      <nav className="flex justify-between items-center mb-32">
        <div className="flex items-center gap-6">
          <div className="text-2xl font-black tracking-tighter">VD.</div>
          <LanguageSwitcher />
        </div>
        <OffersMenu />
      </nav>

      {/* Header Section */}
      <header className="mb-40">
        <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-300 mb-10">{t.landing.intro.label}</h2>
        <p className="text-4xl sm:text-6xl md:text-7xl font-light leading-[1.05]">
          {t.landing.intro.text}<span className="font-medium italic underline underline-offset-8 decoration-zinc-100">{t.landing.intro.highlight}</span>.
        </p>
      </header>

      {/* Stats Section */}
      <section className="mb-40" aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-300 mb-16">{t.landing.stats.label}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {t.landing.stats.items.map((item, i) => (
            <div key={i}>
              <div className="text-5xl md:text-7xl font-black tracking-tighter">{item.value}</div>
              <p className="text-zinc-400 text-sm md:text-base mt-2">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services List */}
      <section className="mb-40" aria-labelledby="services-heading">
        <h2 id="services-heading" className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-300 mb-16">{t.landing.services.label}</h2>
        <div className="space-y-16">
          {t.landing.services.items.map((item, i) => (
            <div key={i} className="max-w-3xl">
              <h3 className="text-2xl md:text-4xl font-bold mb-4">{item.title}</h3>
              <p className="text-zinc-500 text-lg md:text-xl font-light leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Projects */}
      <section className="mb-40" aria-labelledby="cases-heading">
        <h2 id="cases-heading" className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-300 mb-20">{t.landing.cases.label}</h2>
        <div className="space-y-32">
          {/* Grace Group - with accordion */}
          <article className="border-t border-zinc-100 pt-16">
            <div className="flex flex-wrap gap-4 mb-8">
              {t.landing.cases.grace.tags.map(tag => (
                <span key={tag} className="text-[10px] tracking-widest uppercase text-zinc-400 font-bold">{tag}</span>
              ))}
            </div>
            <h3 className="text-4xl md:text-6xl font-bold mb-4">{t.landing.cases.grace.title}</h3>
            <p className="text-lg text-zinc-400 font-light mb-4">{t.landing.cases.grace.subtitle}</p>
            <p className="text-xl md:text-3xl text-zinc-500 font-light mb-8 leading-tight max-w-4xl">
              {t.landing.cases.grace.desc}
            </p>
            <button
              onClick={() => setGraceExpanded(!graceExpanded)}
              className="text-[10px] uppercase tracking-[0.4em] font-bold border-b border-black pb-2 hover:text-zinc-400 hover:border-zinc-400 transition-colors"
            >
              {graceExpanded ? t.landing.cases.grace.hideDetails : t.landing.cases.grace.showDetails}
            </button>
            {graceExpanded && (
              <div className="mt-8 space-y-6 pl-4 border-l-2 border-zinc-100">
                {t.landing.cases.grace.details.map((detail, i) => (
                  <div key={i}>
                    <span className="text-zinc-400 text-sm font-bold">{detail.name}</span>
                    <p className="text-lg text-zinc-600 mt-1">{detail.result}</p>
                  </div>
                ))}
              </div>
            )}
          </article>

          {/* Other cases */}
          {t.landing.cases.other.map((project, idx) => (
            <article key={idx} className="border-t border-zinc-100 pt-16">
              <div className="flex flex-wrap gap-4 mb-8">
                {project.tags.map(tag => (
                  <span key={tag} className="text-[10px] tracking-widest uppercase text-zinc-400 font-bold">{tag}</span>
                ))}
              </div>
              <h3 className="text-4xl md:text-6xl font-bold mb-4">{project.title}</h3>
              <p className="text-lg text-zinc-400 font-light mb-4">{project.subtitle}</p>
              <p className="text-xl md:text-3xl text-zinc-500 font-light mb-4 leading-tight max-w-4xl">
                {project.desc}
              </p>
              <p className="text-lg text-zinc-400 font-light">
                {project.details}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Process Section */}
      <section className="mb-40" aria-labelledby="process-heading">
        <h2 id="process-heading" className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-300 mb-6">{t.landing.process.label}</h2>
        <p className="text-zinc-400 font-light mb-16">{t.landing.process.methodology}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {t.landing.process.steps.map((item) => (
            <div key={item.step} className="flex gap-6">
              <span className="text-zinc-200 text-4xl font-black">{item.step}</span>
              <div>
                <h3 className="text-xl md:text-2xl font-bold mb-2">{item.title}</h3>
                <p className="text-zinc-500 font-light">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-40 text-center border-t border-zinc-100" aria-labelledby="contact-heading">
          <h2 id="contact-heading" className="text-5xl md:text-8xl font-black mb-16 tracking-tighter uppercase">{t.landing.contact.heading}</h2>
          <a
            href="https://t.me/vlasdobry"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-xl md:text-3xl font-bold uppercase tracking-[0.3em] border-2 border-black px-12 py-6 hover:bg-black hover:text-white transition-all"
          >
              {t.landing.contact.cta}
          </a>
          <p className="mt-8 text-zinc-400 text-lg">
            {t.landing.contact.alternative} <a href={`mailto:${t.landing.contact.email}`} className="underline hover:text-black transition-colors">{t.landing.contact.email}</a>
          </p>
      </section>

      {/* Footer */}
      <footer className="pt-16 pb-24 flex flex-col md:flex-row justify-between items-center gap-12 border-t border-zinc-100">
        <div className="text-center md:text-left">
          <h4 className="text-2xl font-bold">{t.landing.footer.name}</h4>
          <p className="text-zinc-400 text-sm font-light mt-1">{t.landing.footer.role}</p>
        </div>
        <div className="flex gap-10 text-[11px] font-bold tracking-[0.4em] uppercase text-zinc-400">
          <a href="https://t.me/vlasdobry" target="_blank" rel="noopener noreferrer" className="hover:text-black">{t.landing.footer.links.telegram}</a>
          <a href="https://wa.me/79068972037" target="_blank" rel="noopener noreferrer" className="hover:text-black">{t.landing.footer.links.whatsapp}</a>
          <a href="mailto:vlasdobry@gmail.com" target="_blank" rel="noopener noreferrer" className="hover:text-black">{t.landing.footer.links.email}</a>
        </div>
      </footer>
    </main>
  );
};
