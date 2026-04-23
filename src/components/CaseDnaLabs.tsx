import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { useI18n } from '../i18n';
import { LanguageSwitcher } from './LanguageSwitcher';
import { analytics } from '../utils/analytics';

interface Props {
  basePath: string;
}

export const CaseDnaLabs: React.FC<Props> = ({ basePath }) => {
  const { t, lang } = useI18n();
  const section = t.caseDnaLabs;
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const landingUrl = lang === 'ru' ? '/#landing' : '/en/#landing';
  const sectionKey = 'case-dna-labs';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        {/* Hero */}
        <header className="pb-16 md:pb-24">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight mb-8">
            {section.hero.h1}
          </h1>
          <h2 className="text-xl md:text-2xl font-bold text-zinc-700 mb-6">
            {section.hero.subheading}
          </h2>
          <p className="text-lg md:text-xl text-zinc-500 font-light max-w-3xl mb-6">
            {section.hero.lead}
          </p>
          <p className="text-base md:text-lg text-zinc-600 font-medium max-w-3xl">
            {section.hero.note}
          </p>
        </header>

        {/* Numbers table */}
        <section className="py-16 border-t border-zinc-100" aria-labelledby="numbers-heading">
          <h2 id="numbers-heading" className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-300 mb-12">
            {section.numbers.label}
          </h2>
          <div className="max-w-2xl">
            <table className="w-full">
              <tbody>
                {section.numbers.rows.map((row, i) => (
                  <tr key={i} className="border-b border-zinc-100">
                    <td className="py-4 text-zinc-600">{row.metric}</td>
                    <td className="py-4 text-right text-lg font-bold">
                      {row.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-6 text-sm text-zinc-500 font-light">{section.numbers.footnote}</p>
          </div>
        </section>

        {/* By campaign type */}
        <section className="py-16 border-t border-zinc-100" aria-labelledby="bytype-heading">
          <h2 id="bytype-heading" className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-300 mb-12">
            {section.byType.label}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full max-w-3xl">
              <thead>
                <tr className="border-b border-zinc-200">
                  <th className="py-3 text-left text-[10px] uppercase tracking-widest font-bold text-zinc-400">{section.byType.headers.type}</th>
                  <th className="py-3 text-right text-[10px] uppercase tracking-widest font-bold text-zinc-400">{section.byType.headers.cpc}</th>
                  <th className="py-3 text-right text-[10px] uppercase tracking-widest font-bold text-zinc-400">{section.byType.headers.ctr}</th>
                  <th className="py-3 text-right text-[10px] uppercase tracking-widest font-bold text-zinc-400">{section.byType.headers.cpa}</th>
                </tr>
              </thead>
              <tbody>
                {section.byType.rows.map((row, i) => (
                  <tr key={i} className="border-b border-zinc-100">
                    <td className="py-4 font-bold">{row.type}</td>
                    <td className="py-4 text-right">{row.cpc}</td>
                    <td className="py-4 text-right font-bold">{row.ctr}</td>
                    <td className="py-4 text-right">{row.cpa}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-6 text-sm text-zinc-500 font-light max-w-2xl">{section.byType.note}</p>
        </section>

        {/* Global benchmarks */}
        <section className="py-16 border-t border-zinc-100" aria-labelledby="benchmarks-heading">
          <h2 id="benchmarks-heading" className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-300 mb-12">
            {section.benchmarks.label}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200">
                  <th className="py-3 text-left text-[10px] uppercase tracking-widest font-bold text-zinc-400">{section.benchmarks.headers.metric}</th>
                  <th className="py-3 text-left text-[10px] uppercase tracking-widest font-bold text-zinc-400">{section.benchmarks.headers.result}</th>
                  <th className="py-3 text-left text-[10px] uppercase tracking-widest font-bold text-zinc-400">{section.benchmarks.headers.benchmark}</th>
                  <th className="py-3 text-left text-[10px] uppercase tracking-widest font-bold text-zinc-400">{section.benchmarks.headers.gap}</th>
                </tr>
              </thead>
              <tbody>
                {section.benchmarks.rows.map((row, i) => (
                  <tr key={i} className="border-b border-zinc-100">
                    <td className="py-4 font-bold pr-4">{row.metric}</td>
                    <td className="py-4 pr-4">{row.result}</td>
                    <td className="py-4 pr-4 text-sm text-zinc-600">
                      {row.benchmark.includes('LocaliQ') ? (
                        <a href="https://localiq.com/blog/healthcare-search-advertising-benchmarks/" target="_blank" rel="noopener noreferrer" className="underline hover:text-black">
                          {row.benchmark}
                        </a>
                      ) : row.benchmark.includes('Lebesgue') ? (
                        <a href="https://lebesgue.io/google-ads/performance-max-campaign-pros-cons-and-benchmarks" target="_blank" rel="noopener noreferrer" className="underline hover:text-black">
                          {row.benchmark}
                        </a>
                      ) : (
                        row.benchmark
                      )}
                    </td>
                    <td className="py-4 font-bold text-sm">{row.gap}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-10 max-w-3xl">
            <p className="font-bold mb-4">{section.benchmarks.captionsLabel}</p>
            <ul className="space-y-4 text-sm text-zinc-600 font-light">
              {section.benchmarks.captions.map((caption, i) => (
                <li key={i}>• {caption}</li>
              ))}
            </ul>
            <p className="mt-8 text-sm text-zinc-600 font-light">{section.benchmarks.honestNote}</p>
          </div>
        </section>

        {/* Dynamics */}
        <section className="py-16 border-t border-zinc-100" aria-labelledby="dynamics-heading">
          <h2 id="dynamics-heading" className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-300 mb-12">
            {section.dynamics.label}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full max-w-3xl">
              <thead>
                <tr className="border-b border-zinc-200">
                  <th className="py-3 text-left text-[10px] uppercase tracking-widest font-bold text-zinc-400">{section.dynamics.headers.month}</th>
                  <th className="py-3 text-right text-[10px] uppercase tracking-widest font-bold text-zinc-400">{section.dynamics.headers.spend}</th>
                  <th className="py-3 text-right text-[10px] uppercase tracking-widest font-bold text-zinc-400">{section.dynamics.headers.conversions}</th>
                  <th className="py-3 text-right text-[10px] uppercase tracking-widest font-bold text-zinc-400">{section.dynamics.headers.cpa}</th>
                </tr>
              </thead>
              <tbody>
                {section.dynamics.rows.map((row, i) => (
                  <tr key={i} className="border-b border-zinc-100">
                    <td className="py-3 font-medium">{row.month}</td>
                    <td className="py-3 text-right">{row.spend}</td>
                    <td className="py-3 text-right">{row.conversions}</td>
                    <td className="py-3 text-right font-bold">{row.cpa}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-6 text-sm text-zinc-600 font-light max-w-3xl">{section.dynamics.summary}</p>
        </section>

        {/* By country */}
        <section className="py-16 border-t border-zinc-100" aria-labelledby="bycountry-heading">
          <h2 id="bycountry-heading" className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-300 mb-12">
            {section.byCountry.label}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full max-w-2xl">
              <thead>
                <tr className="border-b border-zinc-200">
                  <th className="py-3 text-left text-[10px] uppercase tracking-widest font-bold text-zinc-400">{section.byCountry.headers.country}</th>
                  <th className="py-3 text-right text-[10px] uppercase tracking-widest font-bold text-zinc-400">{section.byCountry.headers.conversions}</th>
                  <th className="py-3 text-right text-[10px] uppercase tracking-widest font-bold text-zinc-400">{section.byCountry.headers.cpa}</th>
                </tr>
              </thead>
              <tbody>
                {section.byCountry.rows.map((row, i) => (
                  <tr key={i} className="border-b border-zinc-100">
                    <td className="py-3 font-medium">{row.country}</td>
                    <td className="py-3 text-right">{row.conversions}</td>
                    <td className="py-3 text-right font-bold">{row.cpa}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-6 text-sm text-zinc-600 font-light max-w-3xl">{section.byCountry.note}</p>
        </section>

        {/* Auction share */}
        <section className="py-16 border-t border-zinc-100" aria-labelledby="auction-heading">
          <h2 id="auction-heading" className="text-2xl md:text-3xl font-black mb-8">
            {section.auction.label}
          </h2>
          <p className="text-zinc-600 font-light mb-8 max-w-3xl">{section.auction.intro}</p>
          <ul className="space-y-3 max-w-md">
            {section.auction.items.map((item, i) => (
              <li key={i} className="flex justify-between items-baseline gap-4 pb-2 border-b border-zinc-100">
                <span className="text-zinc-700">{item.country}</span>
                <span className="font-bold">{item.share}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* What I did */}
        <section className="py-16 border-t border-zinc-100" aria-labelledby="whatidid-heading">
          <h2 id="whatidid-heading" className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-300 mb-8">
            {section.whatIDid.label}
          </h2>
          <p className="text-zinc-600 font-light mb-8 max-w-3xl">{section.whatIDid.intro}</p>
          <p className="text-zinc-500 font-light mb-6">{section.whatIDid.subIntro}</p>
          <ul className="space-y-4 max-w-3xl mb-8">
            {section.whatIDid.items.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-zinc-700">
                <span className="text-zinc-300 mt-1">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-zinc-600 font-medium max-w-3xl">{section.whatIDid.outro}</p>
        </section>

        {/* What I reworked */}
        <section className="py-16 border-t border-zinc-100" aria-labelledby="whatireworked-heading">
          <h2 id="whatireworked-heading" className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-300 mb-8">
            {section.whatIReworked.label}
          </h2>
          <p className="text-zinc-600 font-light max-w-3xl leading-relaxed">{section.whatIReworked.body}</p>
        </section>

        {/* FAQ */}
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
                  <div className="px-6 pb-5 text-zinc-600 font-light leading-relaxed">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Offer */}
        <section className="py-16 border-t border-zinc-100" aria-labelledby="offer-heading">
          <h2 id="offer-heading" className="text-2xl md:text-3xl font-black mb-8">
            {section.offer.label}
          </h2>
          <p className="text-xl font-bold mb-6">{section.offer.title}</p>
          <ul className="space-y-3 max-w-3xl mb-8">
            {section.offer.items.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-zinc-700">
                <span className="text-zinc-300 mt-1">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-zinc-600 font-medium max-w-3xl mb-6">{section.offer.nda}</p>
          <p className="text-zinc-500 font-light max-w-3xl">{section.offer.pricing}</p>
        </section>

        {/* CTA */}
        <section className="py-24 text-center border-t border-zinc-100" aria-labelledby="cta-heading">
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
            <div className="flex flex-col sm:flex-row gap-8 md:gap-12">
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
