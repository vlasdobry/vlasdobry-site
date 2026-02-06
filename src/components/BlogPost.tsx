import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import DOMPurify from 'dompurify';
import { useI18n } from '../i18n';
import { LanguageSwitcher } from './LanguageSwitcher';
import { analytics } from '../utils/analytics';
import type { BlogArticle } from '../types/blog';

interface Props {
  basePath: string;
}

export const BlogPost: React.FC<Props> = ({ basePath }) => {
  const { t, lang } = useI18n();
  const [article, setArticle] = useState<BlogArticle | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<BlogArticle[]>([]);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [loading, setLoading] = useState(true);

  const blogUrl = lang === 'ru' ? '/blog/' : '/en/blog/';
  const landingUrl = lang === 'ru' ? '/#landing' : '/en/#landing';

  // Extract slug from URL
  const slug = (() => {
    const path = window.location.pathname;
    const match = path.match(/\/blog\/([^/]+)/);
    return match ? match[1] : null;
  })();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    fetch('/blog-data.json', { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        const articles = data[lang] || [];
        const found = articles.find((a: BlogArticle) => a.slug === slug);
        setArticle(found || null);

        if (found) {
          const related = articles
            .filter((a: BlogArticle) => a.slug !== slug && a.category === found.category)
            .slice(0, 3);
          setRelatedArticles(related);
          analytics.blogView(found.slug);
        }

        setLoading(false);
      })
      .catch(e => { if (e.name !== 'AbortError') setLoading(false); });

    return () => controller.abort();
  }, [lang, slug]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-zinc-400">{t.blog.loading}</p>
      </main>
    );
  }

  if (!article) {
    return (
      <main className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <p className="text-zinc-600 text-xl">{t.blog.notFound}</p>
        <a href={blogUrl} className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-black">
          ← {t.blog.backToBlog}
        </a>
      </main>
    );
  }

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
            href={blogUrl}
            className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-400 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            {t.blog.backToBlog}
          </a>
        </div>
      </nav>

      <article className="max-w-5xl mx-auto px-6 sm:px-12 py-8 md:py-12">
        {/* Breadcrumbs */}
        <nav className="text-sm text-zinc-400 mb-8">
          <a href={lang === 'ru' ? '/' : '/en/'} className="hover:text-black">{t.blog.home}</a>
          <span className="mx-2">→</span>
          <a href={blogUrl} className="hover:text-black">{t.blog.title}</a>
          <span className="mx-2">→</span>
          <span className="text-zinc-600">{article.title}</span>
        </nav>

        {/* Header */}
        <header className="pb-8 md:pb-12 border-b border-zinc-100">
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-400">
              {t.blog.categories[article.category as keyof typeof t.blog.categories]}
            </span>
            {article.tags.map(tag => (
              <span key={tag} className="text-[10px] uppercase tracking-[0.2em] text-zinc-300">
                {tag}
              </span>
            ))}
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight tracking-tight mb-6">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-400">
            <span>{t.blog.publishedOn}: <time dateTime={article.date}>{formatDate(article.date)}</time></span>
            {article.dateModified !== article.date && (
              <>
                <span>·</span>
                <span>{t.blog.updatedOn}: <time dateTime={article.dateModified}>{formatDate(article.dateModified)}</time></span>
              </>
            )}
            <span>·</span>
            <span>{article.readingTime} {t.blog.readingTime}</span>
          </div>
        </header>

        {/* TL;DR */}
        {article.tldr && (
          <div className="bg-zinc-50 p-6 rounded-lg my-8 md:my-12">
            <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-400 mb-3">
              {t.blog.tldr}
            </h2>
            <p className="text-lg text-zinc-700 font-light leading-relaxed">
              {article.tldr}
            </p>
          </div>
        )}

        {/* Table of Contents */}
        {article.toc && article.toc.length > 3 && (
          <nav className="my-8 md:my-12 p-6 border border-zinc-100 rounded-lg">
            <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-400 mb-4">
              {t.blog.tableOfContents}
            </h2>
            <ul className="space-y-2">
              {article.toc.map(item => (
                <li key={item.id} className={item.level === 3 ? 'ml-4' : ''}>
                  <a
                    href={`#${item.id}`}
                    className="text-zinc-600 hover:text-black transition-colors"
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {/* Content */}
        <div
          className="blog-content max-w-[720px] mx-auto my-8 md:my-12"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content || '') }}
        />

        {/* FAQ */}
        {article.faq && article.faq.length > 0 && (
          <section className="py-12 md:py-16 border-t border-zinc-100">
            <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-300 mb-8">
              {t.blog.faq}
            </h2>
            <div className="space-y-3 md:space-y-4">
              {article.faq.map((item, i) => (
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
        )}

        {/* Related Service */}
        {article.relatedService && (
          <section className="py-12 md:py-16 border-t border-zinc-100">
            <a
              href={article.relatedService}
              className="block p-6 border border-zinc-100 rounded-lg hover:border-zinc-300 transition-colors"
            >
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-400 mb-2 block">
                {t.blog.relatedService}
              </span>
              <span className="text-lg font-bold">
                {t.blog.relatedServiceLink}
              </span>
            </a>
          </section>
        )}

        {/* CTA */}
        <section className="py-16 md:py-24 text-center border-t border-zinc-100">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4 tracking-tight">
            {t.blog.cta}
          </h2>
          <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-zinc-100 overflow-hidden">
            <img
              src="/vlas-photo.jpg"
              alt={t.blog.footer.name}
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          </div>
          <a
            href="https://t.me/vlasdobry"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => analytics.blogCtaClick(article.slug)}
            className="inline-block text-lg md:text-xl font-bold uppercase tracking-[0.2em] border-2 border-black px-10 py-5 hover:bg-black hover:text-white transition-all"
          >
            {t.blog.ctaButton}
          </a>
        </section>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="py-12 md:py-16 border-t border-zinc-100">
            <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-300 mb-8">
              {t.blog.relatedArticles}
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {relatedArticles.map(related => (
                <a
                  key={related.slug}
                  href={lang === 'ru' ? `/blog/${related.slug}/` : `/en/blog/${related.slug}/`}
                  className="block p-6 border border-zinc-100 rounded-lg hover:border-zinc-300 transition-colors"
                >
                  <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 mb-2 block">
                    {related.readingTime} {t.blog.readingTime}
                  </span>
                  <h3 className="font-bold text-lg mb-2">{related.title}</h3>
                  <p className="text-sm text-zinc-500 font-light line-clamp-2">{related.description}</p>
                </a>
              ))}
            </div>
          </section>
        )}
      </article>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-6 sm:px-12 pt-16 pb-24 border-t border-zinc-100">
        <div className="flex flex-col md:flex-row justify-between gap-12">
          <div>
            <h4 className="text-2xl font-bold">{t.blog.footer.name}</h4>
            <p className="text-zinc-400 text-sm font-light mt-1">{t.blog.footer.role}</p>
            <a href="tel:+79068972037" onClick={() => analytics.clickPhone('blog_post')} className="block mt-4 text-2xl font-bold hover:text-zinc-500 transition-colors">+7 906 897-20-37</a>
            <div className="flex gap-6 mt-4 text-[11px] font-bold tracking-[0.4em] uppercase text-zinc-400">
              <a href="https://t.me/vlasdobry" target="_blank" rel="noopener noreferrer" onClick={() => analytics.clickTelegram('blog_post_footer')} className="hover:text-black">{t.blog.footer.links.telegram}</a>
              <a href="https://wa.me/79068972037" target="_blank" rel="noopener noreferrer" onClick={() => analytics.clickWhatsapp('blog_post_footer')} className="hover:text-black">{t.blog.footer.links.whatsapp}</a>
              <a href="mailto:vlasdobry@gmail.com" onClick={() => analytics.clickEmail('blog_post_footer')} className="hover:text-black">{t.blog.footer.links.email}</a>
            </div>
          </div>
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
          </div>
        </div>
        <p className="text-zinc-300 text-sm mt-12">&copy; {new Date().getFullYear()} {t.blog.footer.name}</p>
      </footer>
    </main>
  );
};
