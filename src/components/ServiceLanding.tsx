import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp, Check, X } from 'lucide-react';
import { useI18n, ServiceKey } from '../i18n';
import { LanguageSwitcher } from './LanguageSwitcher';
import { HealthScoreChecker } from './HealthScoreChecker';
import { analytics } from '../utils/analytics';
import type { GeoServiceSection } from '../i18n/types';

interface Props {
  serviceKey: ServiceKey;
  basePath: string;
}

export const ServiceLanding: React.FC<Props> = ({ serviceKey, basePath }) => {
  const { t, lang } = useI18n();
  const section = t.services[serviceKey];
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const landingUrl = lang === 'ru' ? '/#landing' : '/en/#landing';

  // Check if this is the GEO service (has education block)
  const isGeo = serviceKey === 'geo';
  const geoSection = section as GeoServiceSection;

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

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('критично') || statusLower.includes('critical') || statusLower.includes('отсутств') || statusLower.includes('missing')) {
      return 'bg-red-100 text-red-700';
    }
    if (statusLower.includes('требует') || statusLower.includes('needs') || statusLower.includes('низк') || statusLower.includes('low') || statusLower.includes('проблем') || statusLower.includes('issue') || statusLower.includes('слабо')) {
      return 'bg-amber-100 text-amber-700';
    }
    if (statusLower.includes('хорошо') || statusLower.includes('good')) {
      return 'bg-green-100 text-green-700';
    }
    return 'bg-zinc-100 text-zinc-700';
  };

  return (
    <main className="min-h-screen bg-white text-[#121212]">
      {/* Sticky Navigation */}
      <nav className={`sticky top-0 z-50 border-b transition-all duration-500 ease-out ${
        isScrolled
          ? 'bg-white/80 backdrop-blur-lg border-zinc-100'
          : 'bg-white border-transparent'
      }`}>
        <div className={`max-w-5xl mx-auto px-6 sm:px-12 flex justify-between items-center transition-all duration-500 ease-out ${
          isScrolled ? 'py-3' : 'py-6'
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

      <div className="max-w-5xl mx-auto px-6 sm:px-12 py-8 md:py-12">
        {/* Hero Section */}
        <header className="pb-8 md:pb-10">
          <div className="flex flex-wrap gap-3 mb-8">
            {section.hero.badges.map(badge => (
              <span key={badge} className="text-xs tracking-widest uppercase text-zinc-500 font-bold bg-zinc-100 px-3 py-1.5 rounded-full">
                {badge}
              </span>
            ))}
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-8">
            {section.hero.title}
          </h1>
          <p className="text-xl md:text-2xl text-zinc-500 font-light max-w-3xl mb-6">
            {section.hero.subtitle}
          </p>

          {/* Health Score Checker — for SEO/GEO pages */}
          {(serviceKey === 'seo' || serviceKey === 'geo') && (
            <HealthScoreChecker
              lang={lang}
              primary={serviceKey}
              ctaUrl="https://t.me/vlasdobry"
            />
          )}

          {/* miniCta — only for non-SEO/GEO pages */}
          {serviceKey !== 'seo' && serviceKey !== 'geo' && (
            <a
              href={section.hero.miniCta.anchor}
              className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-black transition-colors"
            >
              {section.hero.miniCta.text}
            </a>
          )}
        </header>

        {/* Education Section (GEO only) */}
        {isGeo && geoSection.education && (
          <section className="py-16 border-t border-zinc-100" id="что-такое-geo" aria-labelledby="education-heading">
            <h2 id="education-heading" className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-300 mb-12">
              {geoSection.education.title}
            </h2>

            <div className="max-w-3xl">
              <p className="text-2xl md:text-3xl font-bold mb-4">
                {geoSection.education.definition}
              </p>
              <p className="text-lg text-zinc-600 font-light leading-relaxed mb-10">
                {geoSection.education.explanation}
              </p>

              {/* Comparison Table */}
              <div className="overflow-hidden">
                <table className="w-full border-collapse text-sm md:text-base">
                  <thead>
                    <tr>
                      {geoSection.education.comparison.headers.map((header, i) => (
                        <th key={i} className="text-left py-3 px-3 md:py-4 md:px-6 bg-zinc-100 font-bold first:rounded-tl-lg last:rounded-tr-lg">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {geoSection.education.comparison.rows.map((row, i) => (
                      <tr key={i} className="border-b border-zinc-100">
                        {row.map((cell, j) => (
                          <td key={j} className="py-3 px-3 md:py-4 md:px-6 text-zinc-600">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* Methodology Section */}
        <section className="py-16 border-t border-zinc-100" aria-labelledby="methodology-heading">
          <h2 id="methodology-heading" className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-300 mb-12">
            {section.methodology.title}
          </h2>

          <div className="space-y-0">
            {section.methodology.categories.map((category, i) => (
              <div key={i} className="border-b border-zinc-100 last:border-0 py-4 md:py-5 md:flex md:gap-6">
                <div className="font-bold text-base md:text-lg md:w-1/3 md:flex-shrink-0 mb-1 md:mb-0">
                  {category.name}
                </div>
                <div className="text-zinc-600 font-light text-sm md:text-base">
                  {category.description}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Example Section - Solid style for contrast */}
        <section className="py-16 bg-slate-50 border-y border-slate-200 -mx-6 sm:-mx-12 px-6 sm:px-12" id="пример-аудита" aria-labelledby="example-heading">
          <div className="max-w-5xl mx-auto">
            <h2 id="example-heading" className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-400 mb-4">
              {section.example.title}
            </h2>
            <p className="text-zinc-500 text-sm mb-10">{section.example.subtitle}</p>

            {/* Scores Table */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden mb-10">
              <table className="w-full text-sm md:text-base">
                <thead className="bg-slate-100 border-b border-slate-200">
                  <tr>
                    <th className="text-left py-2 px-2 md:py-3 md:px-5 font-bold text-xs md:text-sm">{lang === 'ru' ? 'Категория' : 'Category'}</th>
                    <th className="text-left py-2 px-2 md:py-3 md:px-5 font-bold text-xs md:text-sm">{lang === 'ru' ? 'Оценка' : 'Score'}</th>
                    <th className="text-left py-2 px-2 md:py-3 md:px-5 font-bold text-xs md:text-sm">{lang === 'ru' ? 'Статус' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {section.example.scores.map((score, i) => (
                    <tr key={i}>
                      <td className="py-2 px-2 md:py-3 md:px-5 text-zinc-700 text-xs md:text-sm">{score.category}</td>
                      <td className="py-2 px-2 md:py-3 md:px-5 font-bold text-xs md:text-sm">{score.score}</td>
                      <td className="py-2 px-2 md:py-3 md:px-5">
                        <span className={`inline-block text-[10px] md:text-xs font-bold px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-full whitespace-nowrap ${getStatusColor(score.status)}`}>
                          {score.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Findings and Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-lg mb-4">{lang === 'ru' ? 'Что найдено' : 'Findings'}</h3>
                <ul className="space-y-2">
                  {section.example.findings.map((finding, i) => (
                    <li key={i} className="flex items-start gap-2 text-zinc-600 text-sm">
                      <span className="text-red-400 mt-0.5">×</span>
                      {finding}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-4">{lang === 'ru' ? 'Рекомендации' : 'Recommendations'}</h3>
                <ul className="space-y-2">
                  {section.example.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-zinc-600 text-sm">
                      <span className="text-green-500 mt-0.5">→</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        </section>

        {/* Deliverables Section */}
        <section className="py-16 border-b border-zinc-100" aria-labelledby="deliverables-heading">
          <h2 id="deliverables-heading" className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-300 mb-12">
            {section.deliverables.title}
          </h2>

          <ul className="space-y-3 md:space-y-4">
            {section.deliverables.items.map((item, i) => (
              <li key={i} className="flex items-start gap-3 md:gap-4 text-base md:text-lg">
                <Check className="w-4 h-4 md:w-5 md:h-5 text-green-500 mt-1 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Pricing Section */}
        <section className="py-16 border-b border-zinc-100" aria-labelledby="pricing-heading">
          <h2 id="pricing-heading" className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-300 mb-12">
            {section.pricing.title}
          </h2>

          <div className={`grid gap-6 items-stretch ${
            section.pricing.packages.length === 1
              ? 'grid-cols-1 max-w-md mx-auto'
              : section.pricing.packages.length === 2
              ? 'grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto'
              : 'grid-cols-1 md:grid-cols-3'
          }`}>
            {section.pricing.packages.map((pkg, i) => (
              <div
                key={i}
                className={`rounded-xl p-6 border-2 flex flex-col ${
                  pkg.recommended
                    ? 'border-black bg-zinc-50'
                    : 'border-zinc-100'
                }`}
              >
                <div className="h-8 mb-2">
                  {pkg.recommended && (
                    <span className="inline-block text-[10px] font-bold uppercase tracking-widest bg-black text-white px-3 py-1 rounded-full">
                      {lang === 'ru' ? 'Рекомендую' : 'Recommended'}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
                <div className="text-3xl font-black mb-4">{pkg.price}</div>
                <ul className="space-y-2 flex-grow">
                  {section.pricing.allFeatures.map((feature, j) => (
                    <li
                      key={j}
                      className={`flex items-start gap-2 text-sm ${
                        pkg.features[j] ? 'text-zinc-600' : 'text-zinc-300'
                      }`}
                    >
                      {pkg.features[j] ? (
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-zinc-300 mt-0.5 flex-shrink-0" />
                      )}
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {section.pricing.deliveryTime && (
            <p className="text-sm text-zinc-400 mt-6">{section.pricing.deliveryTime}</p>
          )}
        </section>

        {/* Related Services Section */}
        <section className="py-16 border-b border-zinc-100" aria-labelledby="related-heading">
          <h2 id="related-heading" className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-300 mb-8">
            {section.relatedServices.title}
          </h2>

          <div className="flex flex-wrap gap-4">
            {section.relatedServices.links.map((link, i) => (
              <a
                key={i}
                href={link.url}
                className="text-sm font-medium text-zinc-600 hover:text-black border-b border-zinc-300 hover:border-black transition-colors pb-0.5"
              >
                {link.text}
              </a>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 border-b border-zinc-100" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-300 mb-12">
            {section.faq.label}
          </h2>

          <div className="space-y-3 md:space-y-4">
            {section.faq.items.map((item, i) => (
              <div key={i} className="border border-zinc-100 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full px-4 py-4 md:px-6 md:py-5 flex justify-between items-center text-left hover:bg-zinc-50 transition-colors gap-3"
                >
                  <span className="font-bold text-base md:text-lg">{item.question}</span>
                  {expandedFaq === i ? (
                    <ChevronUp className="w-5 h-5 text-zinc-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-zinc-400 flex-shrink-0" />
                  )}
                </button>
                {expandedFaq === i && (
                  <div className="px-4 pb-4 md:px-6 md:pb-5 text-zinc-600 font-light text-sm md:text-base">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 text-center" aria-labelledby="cta-heading">
          <h2 id="cta-heading" className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 tracking-tight">
            {section.cta.title}
          </h2>
          <p className="text-lg text-zinc-500 font-light mb-10 max-w-2xl mx-auto">
            {section.cta.subtitle}
          </p>

          <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-zinc-100 overflow-hidden">
            <img
              src="/vlas-photo.jpg"
              alt={section.footer.name}
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
            <a
              href="https://t.me/vlasdobry"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => analytics.clickTelegram(serviceKey)}
              className="inline-block text-lg md:text-xl font-bold uppercase tracking-[0.2em] border-2 border-black px-10 py-5 hover:bg-black hover:text-white transition-all"
            >
              {section.cta.primaryButton}
            </a>
            {section.cta.secondaryButton && (
              <a
                href="https://t.me/vlasdobry"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => analytics.clickTelegram(`${serviceKey}_secondary`)}
                className="inline-block text-base md:text-lg font-bold uppercase tracking-[0.15em] border-2 border-black px-8 py-4 hover:bg-black hover:text-white transition-all"
              >
                {section.cta.secondaryButton}
              </a>
            )}
          </div>

          {section.cta.tertiaryButton && (
            <a
              href="https://t.me/vlasdobry"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => analytics.clickTelegram(`${serviceKey}_tertiary`)}
              className="text-sm text-zinc-500 hover:text-black transition-colors underline"
            >
              {section.cta.tertiaryButton}
            </a>
          )}
        </section>

        {/* Footer */}
        <footer className="pt-16 pb-24 border-t border-zinc-100">
          <div className="flex flex-col md:flex-row justify-between gap-12">
            {/* Left: Name, role, contacts */}
            <div>
              <h4 className="text-2xl font-bold">{section.footer.name}</h4>
              <p className="text-zinc-400 text-sm font-light mt-1">{section.footer.role}</p>
              <a href="tel:+79068972037" onClick={() => analytics.clickPhone(serviceKey)} className="block mt-4 text-2xl font-bold hover:text-zinc-500 transition-colors">+7 906 897-20-37</a>
              <div className="flex gap-6 mt-4 text-[11px] font-bold tracking-[0.4em] uppercase text-zinc-400">
                <a href="https://t.me/vlasdobry" target="_blank" rel="noopener noreferrer" onClick={() => analytics.clickTelegram(`${serviceKey}_footer`)} className="hover:text-black">{section.footer.links.telegram}</a>
                <a href="https://wa.me/79068972037" target="_blank" rel="noopener noreferrer" onClick={() => analytics.clickWhatsapp(`${serviceKey}_footer`)} className="hover:text-black">{section.footer.links.whatsapp}</a>
                <a href="mailto:vlasdobry@gmail.com" onClick={() => analytics.clickEmail(`${serviceKey}_footer`)} className="hover:text-black">{section.footer.links.email}</a>
              </div>
            </div>
            {/* Right: Offers & Services */}
            <div className="flex flex-col sm:flex-row gap-8 md:gap-12">
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
