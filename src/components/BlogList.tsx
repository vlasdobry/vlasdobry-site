import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useI18n } from '../i18n';
import { LanguageSwitcher } from './LanguageSwitcher';
import { BlogCard } from './BlogCard';
import { analytics } from '../utils/analytics';
import type { BlogArticle } from '../types/blog';

interface Props {
  basePath: string;
}

type Category = 'all' | 'seo' | 'geo' | 'marketing';

export const BlogList: React.FC<Props> = ({ basePath }) => {
  const { t, lang } = useI18n();
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [isScrolled, setIsScrolled] = useState(false);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetch('/blog-data.json')
      .then(res => res.json())
      .then(data => {
        setArticles(data[lang] || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [lang]);

  const filteredArticles = activeCategory === 'all'
    ? articles
    : articles.filter(a => a.category === activeCategory);

  const categories: Category[] = ['all', 'seo', 'geo', 'marketing'];

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
            {lang === 'ru' ? 'Назад' : 'Back'}
          </a>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 sm:px-12 py-8 md:py-12">
        {/* Header */}
        <header className="pb-8 md:pb-12">
          <h1 className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-300 mb-8">
            {t.blog.title}
          </h1>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-4">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-sm font-bold uppercase tracking-[0.15em] pb-1 border-b-2 transition-colors ${
                  activeCategory === cat
                    ? 'text-black border-black'
                    : 'text-zinc-400 border-transparent hover:text-zinc-600'
                }`}
              >
                {t.blog.categories[cat]}
              </button>
            ))}
          </div>
        </header>

        {/* Articles List */}
        <section>
          {loading ? (
            <div className="py-20 text-center text-zinc-400">
              {lang === 'ru' ? 'Загрузка...' : 'Loading...'}
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="py-20 text-center text-zinc-400">
              {lang === 'ru' ? 'Статей пока нет' : 'No articles yet'}
            </div>
          ) : (
            filteredArticles.map(article => (
              <BlogCard key={article.slug} article={article} />
            ))
          )}
        </section>

        {/* Footer */}
        <footer className="pt-16 pb-24 border-t border-zinc-100 mt-16">
          <div className="flex flex-col md:flex-row justify-between gap-12">
            <div>
              <h4 className="text-2xl font-bold">{t.blog.footer.name}</h4>
              <p className="text-zinc-400 text-sm font-light mt-1">{t.blog.footer.role}</p>
              <a href="tel:+79068972037" onClick={() => analytics.clickPhone('blog')} className="block mt-4 text-2xl font-bold hover:text-zinc-500 transition-colors">+7 906 897-20-37</a>
              <div className="flex gap-6 mt-4 text-[11px] font-bold tracking-[0.4em] uppercase text-zinc-400">
                <a href="https://t.me/vlasdobry" target="_blank" rel="noopener noreferrer" onClick={() => analytics.clickTelegram('blog_footer')} className="hover:text-black">{t.blog.footer.links.telegram}</a>
                <a href="https://wa.me/79068972037" target="_blank" rel="noopener noreferrer" onClick={() => analytics.clickWhatsapp('blog_footer')} className="hover:text-black">{t.blog.footer.links.whatsapp}</a>
                <a href="mailto:vlasdobry@gmail.com" onClick={() => analytics.clickEmail('blog_footer')} className="hover:text-black">{t.blog.footer.links.email}</a>
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
      </div>
    </main>
  );
};
