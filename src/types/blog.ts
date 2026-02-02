export interface BlogArticle {
  slug: string;
  title: string;
  description: string;
  date: string;
  dateModified: string;
  category: 'seo' | 'geo' | 'marketing';
  tags: string[];
  relatedService?: string;
  cover: string;
  series?: string;
  readingTime: number;
  toc: TocItem[];
  hasFaq: boolean;
  content?: string;
  faq?: FaqItem[];
  tldr?: string;
}

export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface BlogData {
  ru: BlogArticle[];
  en: BlogArticle[];
}
