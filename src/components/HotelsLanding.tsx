import React, { useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { useI18n } from '../i18n';
import { LanguageSwitcher } from './LanguageSwitcher';

export const HotelsLanding: React.FC = () => {
  const { t, lang } = useI18n();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const landingUrl = lang === 'ru' ? '/#landing' : '/en/#landing';

  return (
    <main className="min-h-screen bg-white text-[#121212]">
      {/* Navigation */}
      <nav className="max-w-5xl mx-auto px-6 sm:px-12 py-8 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <a href={landingUrl} className="text-2xl font-black tracking-tighter hover:opacity-70 transition-opacity">
            VD.
          </a>
          <LanguageSwitcher basePath="/for-hotels" />
        </div>
        <a
          href={landingUrl}
          className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-400 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          {t.hotels.nav.backToMain}
        </a>
      </nav>

      <div className="max-w-5xl mx-auto px-6 sm:px-12">
        {/* Hero Section */}
        <header className="py-16 md:py-24">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-8">
            {t.hotels.hero.title}
          </h1>
          <p className="text-xl md:text-2xl text-zinc-500 font-light max-w-3xl mb-8">
            {t.hotels.hero.subtitle}
          </p>
          <p className="text-sm md:text-base text-zinc-400 font-medium tracking-wide">
            {t.hotels.hero.stats}
          </p>
        </header>

        {/* Problems Section */}
        <section className="py-16 border-t border-zinc-100" aria-labelledby="problems-heading">
          <h2 id="problems-heading" className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-300 mb-12">
            {t.hotels.problems.label}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {t.hotels.problems.items.map((item, i) => (
              <div key={i} className="space-y-2">
                <h3 className="text-xl md:text-2xl font-bold">{item.title}</h3>
                <p className="text-zinc-500 font-light">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Services Section */}
        <section className="py-16 border-t border-zinc-100" aria-labelledby="services-heading">
          <h2 id="services-heading" className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-300 mb-12">
            {t.hotels.services.label}
          </h2>
          <div className="space-y-12">
            {t.hotels.services.items.map((item, i) => (
              <div key={i} className="max-w-3xl">
                <h3 className="text-2xl md:text-3xl font-bold mb-3">{item.title}</h3>
                <p className="text-zinc-500 text-lg font-light leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Case Study Section */}
        <section className="py-16 border-t border-zinc-100" aria-labelledby="case-heading">
          <h2 id="case-heading" className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-300 mb-12">
            {t.hotels.caseStudy.label}
          </h2>

          <div className="bg-zinc-50 rounded-2xl p-8 md:p-12">
            <div className="flex flex-wrap gap-3 mb-6">
              {t.hotels.caseStudy.tags.map(tag => (
                <span key={tag} className="text-[10px] tracking-widest uppercase text-zinc-400 font-bold">
                  {tag}
                </span>
              ))}
            </div>

            <h3 className="text-3xl md:text-5xl font-black mb-2">{t.hotels.caseStudy.title}</h3>
            <p className="text-lg text-zinc-400 font-light mb-6">{t.hotels.caseStudy.subtitle}</p>

            <p className="text-zinc-600 mb-8 max-w-2xl">{t.hotels.caseStudy.challenge}</p>

            <ul className="space-y-3 mb-10">
              {t.hotels.caseStudy.done.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-zinc-600">
                  <span className="text-zinc-300 mt-1">•</span>
                  {item}
                </li>
              ))}
            </ul>

            <div className="flex gap-8 md:gap-16">
              {t.hotels.caseStudy.results.map((result, i) => (
                <div key={i}>
                  <div className="text-4xl md:text-5xl font-black">{result.value}</div>
                  <div className="text-zinc-400 text-sm mt-1">{result.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-16 border-t border-zinc-100" aria-labelledby="process-heading">
          <h2 id="process-heading" className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-300 mb-4">
            {t.hotels.process.label}
          </h2>
          <p className="text-zinc-400 font-light mb-12">{t.hotels.process.methodology}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {t.hotels.process.steps.map((item) => (
              <div key={item.step} className="flex gap-5">
                <span className="text-zinc-200 text-4xl font-black">{item.step}</span>
                <div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-zinc-500 font-light">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 border-t border-zinc-100" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-300 mb-12">
            {t.hotels.faq.label}
          </h2>

          <div className="space-y-4">
            {t.hotels.faq.items.map((item, i) => (
              <div key={i} className="border border-zinc-100 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full px-6 py-5 flex justify-between items-center text-left hover:bg-zinc-50 transition-colors"
                >
                  <span className="font-bold text-lg">{item.question}</span>
                  {expandedFaq === i ? (
                    <ChevronUp className="w-5 h-5 text-zinc-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-zinc-400 flex-shrink-0" />
                  )}
                </button>
                {expandedFaq === i && (
                  <div className="px-6 pb-5 text-zinc-600 font-light">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Not For Section */}
        <section className="py-16 border-t border-zinc-100" aria-labelledby="notfor-heading">
          <h2 id="notfor-heading" className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-300 mb-8">
            {t.hotels.notFor.label}
          </h2>

          <ul className="space-y-3">
            {t.hotels.notFor.items.map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-zinc-500">
                <span className="text-zinc-300">×</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* CTA Section */}
        <section className="py-24 text-center border-t border-zinc-100" aria-labelledby="cta-heading">
          {/* Free Audit Badge */}
          <div className="inline-block bg-zinc-100 text-zinc-600 text-sm font-medium px-4 py-2 rounded-full mb-8">
            {t.hotels.socialProof.freeAudit}
          </div>

          <h2 id="cta-heading" className="text-4xl md:text-6xl lg:text-7xl font-black mb-8 tracking-tight">
            {t.hotels.cta.heading}
          </h2>

          {/* Photo placeholder - можно добавить реальное фото */}
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
            {t.hotels.cta.button}
          </a>

          <p className="mt-6 text-zinc-400">
            {t.hotels.cta.alternative}{' '}
            <a href={`mailto:${t.hotels.cta.email}`} className="underline hover:text-black transition-colors">
              {t.hotels.cta.email}
            </a>
          </p>
        </section>

        {/* Footer */}
        <footer className="py-16 flex flex-col md:flex-row justify-between items-center gap-8 border-t border-zinc-100">
          <div className="text-center md:text-left">
            <h4 className="text-xl font-bold">{t.hotels.footer.name}</h4>
            <p className="text-zinc-400 text-sm font-light mt-1">{t.hotels.footer.role}</p>
          </div>
          <div className="flex gap-8 text-[11px] font-bold tracking-[0.4em] uppercase text-zinc-400">
            <a href="https://t.me/vlasdobry" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">
              {t.hotels.footer.links.telegram}
            </a>
            <a href="https://wa.me/79068972037" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">
              {t.hotels.footer.links.whatsapp}
            </a>
            <a href="mailto:vlasdobry@gmail.com" className="hover:text-black transition-colors">
              {t.hotels.footer.links.email}
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
};
