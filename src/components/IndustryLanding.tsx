import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { useI18n, IndustryKey } from '../i18n';
import { LanguageSwitcher } from './LanguageSwitcher';
import { analytics } from '../utils/analytics';

interface Props {
  sectionKey: IndustryKey;
  basePath: string;
}

export const IndustryLanding: React.FC<Props> = ({ sectionKey, basePath }) => {
  const { t, lang } = useI18n();
  const section = t[sectionKey];
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
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
            <LanguageSwitcher basePath={basePath} />
          </div>
          <a
            href={landingUrl}
            className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-400 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            {section.nav.backToMain}
          </a>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 sm:px-12 py-16 md:py-24">
        {/* Hero Section */}
        <header className="pb-16 md:pb-24">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-8">
            {section.hero.title}
          </h1>
          <p className="text-xl md:text-2xl text-zinc-500 font-light max-w-3xl mb-8">
            {section.hero.subtitle}
          </p>
          <p className="text-sm md:text-base text-zinc-400 font-medium tracking-wide">
            {section.hero.stats}
          </p>
        </header>

        {/* Problems Section */}
        <section className="py-16 border-t border-zinc-100" aria-labelledby="problems-heading">
          <h2 id="problems-heading" className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-300 mb-12">
            {section.problems.label}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {section.problems.items.map((item, i) => (
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
            {section.services.label}
          </h2>
          <div className="space-y-12">
            {section.services.items.map((item, i) => (
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
            {section.caseStudy.label}
          </h2>

          <div className="bg-zinc-50 rounded-2xl p-8 md:p-12">
            <div className="flex flex-wrap gap-3 mb-6">
              {section.caseStudy.tags.map(tag => (
                <span key={tag} className="text-[10px] tracking-widest uppercase text-zinc-400 font-bold">
                  {tag}
                </span>
              ))}
            </div>

            <h3 className="text-3xl md:text-5xl font-black mb-2">{section.caseStudy.title}</h3>
            <p className="text-lg text-zinc-400 font-light mb-6">{section.caseStudy.subtitle}</p>

            <p className="text-zinc-600 mb-8 max-w-2xl">{section.caseStudy.challenge}</p>

            <ul className="space-y-3 mb-10">
              {section.caseStudy.done.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-zinc-600">
                  <span className="text-zinc-300 mt-1">•</span>
                  {item}
                </li>
              ))}
            </ul>

            <div className="flex gap-8 md:gap-16">
              {section.caseStudy.results.map((result, i) => (
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
            {section.process.label}
          </h2>
          <p className="text-zinc-400 font-light mb-12">{section.process.methodology}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {section.process.steps.map((item) => (
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
            {section.faq.label}
          </h2>

          <div className="space-y-4">
            {section.faq.items.map((item, i) => (
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
            {section.notFor.label}
          </h2>

          <ul className="space-y-3">
            {section.notFor.items.map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-zinc-500">
                <span className="text-zinc-300">×</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* CTA Section */}
        <section className="py-24 text-center border-t border-zinc-100" aria-labelledby="cta-heading">
          <div className="inline-block bg-zinc-100 text-zinc-600 text-sm font-medium px-4 py-2 rounded-full mb-8">
            {section.socialProof.freeAudit}
          </div>

          <h2 id="cta-heading" className="text-4xl md:text-6xl lg:text-7xl font-black mb-8 tracking-tight">
            {section.cta.heading}
          </h2>

          <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-zinc-100 overflow-hidden">
            <img
              src="/vlas-photo.jpg"
              alt={section.footer.name}
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          </div>

          <a
            href="https://t.me/vlasdobry"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => analytics.clickTelegram(sectionKey)}
            className="inline-block text-lg md:text-xl font-bold uppercase tracking-[0.2em] border-2 border-black px-10 py-5 hover:bg-black hover:text-white transition-all"
          >
            {section.cta.button}
          </a>

          <p className="mt-6 text-zinc-400">
            {section.cta.alternative}{' '}
            <a href={`mailto:${section.cta.email}`} onClick={() => analytics.clickEmail(sectionKey)} className="underline hover:text-black transition-colors">
              {section.cta.email}
            </a>
          </p>
        </section>

        {/* Footer */}
        <footer className="pt-16 pb-24 border-t border-zinc-100">
          <div className="flex flex-col md:flex-row justify-between gap-12">
            {/* Left: Name, role, contacts */}
            <div>
              <h4 className="text-2xl font-bold">{section.footer.name}</h4>
              <p className="text-zinc-400 text-sm font-light mt-1">{section.footer.role}</p>
              {section.footer.experience && (
                <p className="text-zinc-300 text-xs font-light mt-0.5">{section.footer.experience}</p>
              )}
              <a href="tel:+79068972037" onClick={() => analytics.clickPhone(sectionKey)} className="block mt-4 text-2xl font-bold hover:text-zinc-500 transition-colors">+7 906 897-20-37</a>
              <div className="flex gap-6 mt-4 text-[11px] font-bold tracking-[0.4em] uppercase text-zinc-400">
                <a href="https://t.me/vlasdobry" target="_blank" rel="noopener noreferrer" onClick={() => analytics.clickTelegram(`${sectionKey}_footer`)} className="hover:text-black">{section.footer.links.telegram}</a>
                <a href="https://wa.me/79068972037" target="_blank" rel="noopener noreferrer" onClick={() => analytics.clickWhatsapp(`${sectionKey}_footer`)} className="hover:text-black">{section.footer.links.whatsapp}</a>
                <a href="mailto:vlasdobry@gmail.com" onClick={() => analytics.clickEmail(`${sectionKey}_footer`)} className="hover:text-black">{section.footer.links.email}</a>
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
          <p className="text-zinc-300 text-sm mt-12">&copy; {new Date().getFullYear()} {section.footer.name}</p>
        </footer>
      </div>
    </main>
  );
};
