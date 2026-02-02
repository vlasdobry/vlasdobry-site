import React from 'react';
import type { BlogArticle } from '../types/blog';
import { useI18n } from '../i18n';

interface Props {
  article: BlogArticle;
}

export const BlogCard: React.FC<Props> = ({ article }) => {
  const { t, lang } = useI18n();
  const articleUrl = lang === 'ru' ? `/blog/${article.slug}/` : `/en/blog/${article.slug}/`;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <article className="border-t border-zinc-100 py-10 md:py-14">
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-400">
          {t.blog.categories[article.category as keyof typeof t.blog.categories] || article.category}
        </span>
        {article.tags.slice(0, 2).map(tag => (
          <span key={tag} className="text-[10px] uppercase tracking-[0.2em] text-zinc-300">
            {tag}
          </span>
        ))}
      </div>

      <a href={articleUrl} className="group block">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4 group-hover:text-zinc-600 transition-colors">
          {article.title}
        </h2>
      </a>

      <div className="flex items-center gap-3 text-sm text-zinc-400 mb-4">
        <time dateTime={article.date}>{formatDate(article.date)}</time>
        <span>·</span>
        <span>{article.readingTime} {t.blog.readingTime}</span>
      </div>

      <p className="text-lg md:text-xl text-zinc-500 font-light leading-relaxed mb-6 max-w-3xl">
        {article.description}
      </p>

      <a
        href={articleUrl}
        className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-zinc-600 hover:text-black transition-colors"
      >
        {t.blog.readMore} →
      </a>
    </article>
  );
};
