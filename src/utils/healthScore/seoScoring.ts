// src/utils/healthScore/seoScoring.ts
import type { ResourceResult, Issue, SeoHealthScore } from './types';
import { extractJsonLdTypes, hasJsonLd } from './jsonLd';

type Lang = 'ru' | 'en';

// Weights for SEO scoring (total = 100)
const WEIGHTS = {
  title: 12,
  description: 12,
  h1: 10,
  viewport: 10,
  indexability: 10,
  robotsTxt: 15,
  sitemap: 12,
  schemaOrg: 19,
};

function tr(lang: Lang, ru: string, en: string): string {
  return lang === 'ru' ? ru : en;
}

function scoreTitle(html: string, lang: Lang): { score: number; issues: Issue[] } {
  const issues: Issue[] = [];
  const maxScore = WEIGHTS.title;

  const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
  const title = titleMatch?.[1]?.trim() || '';

  if (!title) {
    issues.push({
      severity: 'critical',
      title: tr(lang, 'Title отсутствует', 'Title is missing'),
      description: tr(lang, 'Добавьте заголовок страницы в тег <title>', 'Add a page title in the <title> tag'),
    });
    return { score: 0, issues };
  }

  if (title.length < 20) {
    issues.push({
      severity: 'warning',
      title: tr(lang, 'Title слишком короткий', 'Title is too short'),
      description: tr(lang, `${title.length} символов. Рекомендуется 50-60`, `${title.length} chars. Recommended: 50-60`),
    });
    return { score: Math.round(maxScore * 0.4), issues };
  }

  if (title.length > 70) {
    issues.push({
      severity: 'info',
      title: tr(lang, 'Title слишком длинный', 'Title is too long'),
      description: tr(lang, `${title.length} символов. Будет обрезан в поиске`, `${title.length} chars. Likely truncated in search`),
    });
    return { score: Math.round(maxScore * 0.75), issues };
  }

  if (title.length >= 40 && title.length <= 60) {
    issues.push({
      severity: 'success',
      title: tr(lang, 'Title оптимальный', 'Title is optimal'),
      description: tr(lang, `${title.length} символов — идеально для поисковиков`, `${title.length} chars - ideal for search engines`),
    });
    return { score: maxScore, issues };
  }

  return { score: Math.round(maxScore * 0.8), issues };
}

function scoreDescription(html: string, lang: Lang): { score: number; issues: Issue[] } {
  const issues: Issue[] = [];
  const maxScore = WEIGHTS.description;

  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
                    html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i);
  const description = descMatch?.[1]?.trim() || '';

  if (!description) {
    issues.push({
      severity: 'critical',
      title: tr(lang, 'Description отсутствует', 'Description is missing'),
      description: tr(lang, 'Добавьте мета-описание страницы', 'Add a meta description'),
    });
    return { score: 0, issues };
  }

  if (description.length < 50) {
    issues.push({
      severity: 'warning',
      title: tr(lang, 'Description слишком короткий', 'Description is too short'),
      description: tr(lang, `${description.length} символов. Рекомендуется 150-160`, `${description.length} chars. Recommended: 150-160`),
    });
    return { score: Math.round(maxScore * 0.4), issues };
  }

  if (description.length > 170) {
    issues.push({
      severity: 'info',
      title: tr(lang, 'Description слишком длинный', 'Description is too long'),
      description: tr(lang, `${description.length} символов. Будет обрезан`, `${description.length} chars. Likely truncated`),
    });
    return { score: Math.round(maxScore * 0.75), issues };
  }

  if (description.length >= 120 && description.length <= 160) {
    issues.push({
      severity: 'success',
      title: tr(lang, 'Description оптимальный', 'Description is optimal'),
      description: tr(lang, `${description.length} символов — идеально`, `${description.length} chars - ideal`),
    });
    return { score: maxScore, issues };
  }

  return { score: Math.round(maxScore * 0.8), issues };
}

function scoreViewport(html: string, lang: Lang): { score: number; issues: Issue[] } {
  const issues: Issue[] = [];
  const maxScore = WEIGHTS.viewport;

  const hasViewport = html.includes('name="viewport"') || html.includes("name='viewport'");

  if (!hasViewport) {
    issues.push({
      severity: 'critical',
      title: tr(lang, 'Viewport не настроен', 'Viewport is missing'),
      description: tr(lang, 'Сайт не адаптирован для мобильных устройств', 'Site is not optimized for mobile devices'),
    });
    return { score: 0, issues };
  }

  const viewportMatch = html.match(/<meta[^>]*name=["']viewport["'][^>]*content=["']([^"']*)["']/i);
  const viewport = viewportMatch?.[1] || '';

  if (viewport.includes('width=device-width')) {
    issues.push({
      severity: 'success',
      title: tr(lang, 'Viewport настроен', 'Viewport is configured'),
      description: tr(lang, 'Сайт адаптирован для мобильных устройств', 'Site is mobile-friendly'),
    });
    return { score: maxScore, issues };
  }

  issues.push({
    severity: 'warning',
    title: tr(lang, 'Viewport неоптимальный', 'Viewport is suboptimal'),
    description: tr(lang, 'Рекомендуется width=device-width, initial-scale=1', 'Recommended: width=device-width, initial-scale=1'),
  });
  return { score: Math.round(maxScore * 0.5), issues };
}

function scoreH1(html: string, lang: Lang): { score: number; issues: Issue[] } {
  const issues: Issue[] = [];
  const maxScore = WEIGHTS.h1;

  const h1Matches = html.match(/<h1[^>]*>[\s\S]*?<\/h1>/gi) || [];

  if (h1Matches.length === 0) {
    issues.push({
      severity: 'critical',
      title: tr(lang, 'H1 отсутствует', 'H1 is missing'),
      description: tr(lang, 'Добавьте главный заголовок страницы', 'Add a main page heading'),
    });
    return { score: 0, issues };
  }

  if (h1Matches.length > 1) {
    issues.push({
      severity: 'warning',
      title: tr(lang, `Несколько H1 (${h1Matches.length})`, `Multiple H1 tags (${h1Matches.length})`),
      description: tr(lang, 'Рекомендуется один H1 на страницу', 'One H1 per page is recommended'),
    });
    return { score: Math.round(maxScore * 0.5), issues };
  }

  const h1Text = h1Matches[0].replace(/<[^>]*>/g, '').trim();

  if (h1Text.length < 10) {
    issues.push({
      severity: 'warning',
      title: tr(lang, 'H1 слишком короткий', 'H1 is too short'),
      description: tr(lang, `${h1Text.length} символов. Добавьте описательный заголовок`, `${h1Text.length} chars. Add a more descriptive heading`),
    });
    return { score: Math.round(maxScore * 0.6), issues };
  }

  issues.push({
    severity: 'success',
    title: tr(lang, 'H1 в порядке', 'H1 is valid'),
    description: tr(lang, 'Главный заголовок страницы настроен правильно', 'Main page heading is configured correctly'),
  });
  return { score: maxScore, issues };
}

function scoreIndexability(
  html: string,
  homepageHeaders: Record<string, string> | undefined,
  lang: Lang
): { score: number; issues: Issue[] } {
  const issues: Issue[] = [];
  const maxScore = WEIGHTS.indexability;

  // 1. Meta robots noindex
  const noindexMatch = html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["']/i);
  const robotsContent = noindexMatch?.[1]?.toLowerCase() || '';

  if (robotsContent.includes('noindex')) {
    issues.push({
      severity: 'critical',
      title: tr(lang, 'Страница закрыта от индексации', 'Page is blocked from indexing'),
      description: tr(lang, 'Мета-тег robots содержит noindex', 'robots meta tag contains noindex'),
    });
    return { score: 0, issues };
  }

  // 2. HTTP заголовок X-Robots-Tag (может быть установлен на уровне сервера).
  // Проверяем только если Worker передал заголовки — иначе деградация тихая.
  const xRobotsTag = homepageHeaders?.['x-robots-tag']?.toLowerCase() || '';
  if (xRobotsTag.includes('noindex')) {
    issues.push({
      severity: 'critical',
      title: tr(lang, 'X-Robots-Tag: noindex', 'X-Robots-Tag: noindex'),
      description: tr(
        lang,
        'HTTP-заголовок запрещает индексацию на уровне сервера',
        'HTTP header blocks indexing at the server level'
      ),
    });
    return { score: 0, issues };
  }

  // 3. Canonical — отсутствие не критично, но это info-замечание.
  const hasCanonical = /<link[^>]*rel=["']canonical["']/i.test(html);

  if (!hasCanonical) {
    issues.push({
      severity: 'info',
      title: tr(lang, 'Canonical URL не указан', 'Canonical URL is missing'),
      description: tr(
        lang,
        'Добавьте <link rel="canonical"> для защиты от дублей',
        'Add <link rel="canonical"> to prevent duplicate content'
      ),
    });
    return { score: Math.round(maxScore * 0.8), issues };
  }

  issues.push({
    severity: 'success',
    title: tr(lang, 'Индексация разрешена', 'Indexing is allowed'),
    description: tr(lang, 'Страница открыта для поисковиков', 'The page is open for search engines'),
  });

  return { score: maxScore, issues };
}

function scoreRobotsTxt(robotsTxt: ResourceResult, lang: Lang): { score: number; issues: Issue[] } {
  const issues: Issue[] = [];
  const maxScore = WEIGHTS.robotsTxt;

  if (robotsTxt.status !== 200 || !robotsTxt.content) {
    issues.push({
      severity: 'critical',
      title: tr(lang, 'robots.txt отсутствует', 'robots.txt is missing'),
      description: tr(lang, 'Поисковые боты не получают инструкций по индексации', 'Search bots do not receive crawl/indexing instructions'),
    });
    return { score: 0, issues };
  }

  const content = robotsTxt.content.toLowerCase();

  if (content.includes('disallow: /') && content.includes('user-agent: *')) {
    const wildcardSection = content.split('user-agent: *')[1]?.split('user-agent:')[0] || '';
    if (wildcardSection.includes('disallow: /') && !wildcardSection.includes('allow:')) {
      issues.push({
        severity: 'critical',
        title: tr(lang, 'robots.txt блокирует индексацию', 'robots.txt blocks indexing'),
        description: tr(lang, 'Disallow: / запрещает доступ ко всему сайту', 'Disallow: / blocks access to the whole site'),
      });
      return { score: Math.round(maxScore * 0.2), issues };
    }
  }

  const searchBots = ['yandexbot', 'googlebot'];
  let penalty = 0;
  for (const bot of searchBots) {
    if (content.includes(`user-agent: ${bot}`)) {
      const sections = content.split('user-agent:');
      for (const section of sections) {
        if (section.trim().startsWith(bot) && section.includes('disallow: /')) {
          issues.push({
            severity: 'warning',
            title: tr(lang, `${bot} ограничен в robots.txt`, `${bot} is restricted in robots.txt`),
            description: tr(lang, 'Поисковый бот имеет ограничения', 'Search bot has restrictive rules'),
          });
          penalty += maxScore * 0.2;
        }
      }
    }
  }

  if (penalty === 0) {
    issues.push({
      severity: 'success',
      title: tr(lang, 'robots.txt настроен', 'robots.txt is configured'),
      description: tr(lang, 'Поисковые боты получают корректные инструкции', 'Search bots receive correct instructions'),
    });
  }

  return { score: Math.max(0, Math.round(maxScore - penalty)), issues };
}

function scoreSitemap(sitemapXml: ResourceResult, lang: Lang): { score: number; issues: Issue[] } {
  const issues: Issue[] = [];
  const maxScore = WEIGHTS.sitemap;

  if (sitemapXml.status !== 200 || !sitemapXml.content) {
    issues.push({
      severity: 'critical',
      title: tr(lang, 'sitemap.xml отсутствует', 'sitemap.xml is missing'),
      description: tr(lang, 'Поисковики не видят структуру сайта', 'Search engines cannot discover the site structure'),
    });
    return { score: 0, issues };
  }

  const content = sitemapXml.content;

  // Валидность XML (грубо: есть <urlset> или <sitemapindex>).
  const hasUrlset = /<urlset\b/i.test(content);
  const hasSitemapIndex = /<sitemapindex\b/i.test(content);

  if (!hasUrlset && !hasSitemapIndex) {
    issues.push({
      severity: 'warning',
      title: tr(lang, 'sitemap.xml невалиден', 'sitemap.xml is invalid'),
      description: tr(lang, 'Нет корневого элемента urlset/sitemapindex', 'Missing root urlset/sitemapindex element'),
    });
    return { score: Math.round(maxScore * 0.3), issues };
  }

  const urlCount = (content.match(/<loc>/gi) || []).length;

  if (urlCount === 0) {
    issues.push({
      severity: 'warning',
      title: tr(lang, 'sitemap.xml пустой', 'sitemap.xml is empty'),
      description: tr(lang, 'Файл есть, но URL не найдены', 'File exists but URLs were not found'),
    });
    return { score: Math.round(maxScore * 0.3), issues };
  }

  // lastmod — опциональный, но желательный. Без него поисковики не знают о свежести.
  // Мы проверяем только urlset (у sitemapindex структура другая).
  if (hasUrlset) {
    const lastmodCount = (content.match(/<lastmod>/gi) || []).length;
    const lastmodCoverage = lastmodCount / urlCount;

    if (lastmodCoverage < 0.5) {
      issues.push({
        severity: 'info',
        title: tr(lang, `sitemap.xml: ${urlCount} URL, мало lastmod`, `sitemap.xml: ${urlCount} URLs, few lastmod`),
        description: tr(
          lang,
          'Добавьте <lastmod> для каждой записи — поисковики быстрее переиндексируют обновления',
          'Add <lastmod> to each entry so search engines reindex updates faster'
        ),
      });
      return { score: Math.round(maxScore * 0.85), issues };
    }
  }

  issues.push({
    severity: 'success',
    title: tr(lang, `sitemap.xml: ${urlCount} URL`, `sitemap.xml: ${urlCount} URLs`),
    description: tr(lang, 'Карта сайта настроена', 'Sitemap is configured'),
  });
  return { score: maxScore, issues };
}

function scoreSchemaOrg(html: string, lang: Lang): { score: number; issues: Issue[] } {
  const issues: Issue[] = [];
  const maxScore = WEIGHTS.schemaOrg;

  if (!hasJsonLd(html)) {
    issues.push({
      severity: 'critical',
      title: tr(lang, 'Schema.org отсутствует', 'Schema.org is missing'),
      description: tr(lang, 'Нет структурированных данных для поисковиков', 'No structured data for search engines'),
    });
    return { score: 0, issues };
  }

  const allTypes = extractJsonLdTypes(html);

  if (allTypes.length === 0) {
    issues.push({
      severity: 'warning',
      title: tr(lang, 'Schema.org битый', 'Schema.org is broken'),
      description: tr(lang, 'JSON-LD блоки найдены, но JSON невалиден', 'JSON-LD blocks found but JSON is invalid'),
    });
    return { score: Math.round(maxScore * 0.3), issues };
  }

  const importantTypes = ['Organization', 'LocalBusiness', 'WebSite', 'Product', 'FAQPage', 'Person', 'Hotel', 'Restaurant', 'Service'];
  const foundImportant = importantTypes.filter(t => allTypes.includes(t));

  if (foundImportant.length >= 3) {
    issues.push({
      severity: 'success',
      title: tr(lang, `Schema.org: ${foundImportant.length} типа`, `Schema.org: ${foundImportant.length} types`),
      description: tr(lang, `${foundImportant.join(', ')} — отлично`, `${foundImportant.join(', ')} - great`),
    });
    return { score: maxScore, issues };
  }

  if (foundImportant.length === 2) {
    issues.push({
      severity: 'info',
      title: tr(lang, `Schema.org: ${foundImportant.length} типа`, `Schema.org: ${foundImportant.length} types`),
      description: tr(lang, `${foundImportant.join(', ')}. Добавьте FAQPage`, `${foundImportant.join(', ')}. Add FAQPage`),
    });
    return { score: Math.round(maxScore * 0.7), issues };
  }

  if (foundImportant.length === 1) {
    issues.push({
      severity: 'warning',
      title: tr(lang, 'Schema.org: 1 тип', 'Schema.org: 1 type'),
      description: tr(lang, `${foundImportant[0]}. Рекомендуется 3+ типа`, `${foundImportant[0]}. Recommended: 3+ types`),
    });
    return { score: Math.round(maxScore * 0.5), issues };
  }

  issues.push({
    severity: 'warning',
    title: tr(lang, 'Schema.org неполный', 'Schema.org is incomplete'),
    description: tr(lang, 'JSON-LD есть, но ключевые типы не распознаны', 'JSON-LD exists, but key types were not recognized'),
  });
  return { score: Math.round(maxScore * 0.3), issues };
}

export function calculateSeoScore(data: {
  homepage: ResourceResult;
  robotsTxt: ResourceResult;
  sitemapXml: ResourceResult;
}, lang: Lang = 'ru'): SeoHealthScore {
  const issues: Issue[] = [];
  const breakdown = {
    title: 0,
    description: 0,
    h1: 0,
    viewport: 0,
    indexability: 0,
    robotsTxt: 0,
    sitemap: 0,
    schemaOrg: 0,
  };

  if (!data.homepage.content) {
    return {
      total: 0,
      breakdown,
      issues: [{
        severity: 'critical',
        title: tr(lang, 'Сайт недоступен', 'Site is unavailable'),
        description: tr(lang, 'Не удалось загрузить страницу', 'Could not load the page')
      }],
      status: 'critical',
      statusLabel: tr(lang, 'Недоступен', 'Unavailable'),
    };
  }

  const html = data.homepage.content;

  const titleResult = scoreTitle(html, lang);
  breakdown.title = titleResult.score;
  issues.push(...titleResult.issues);

  const descResult = scoreDescription(html, lang);
  breakdown.description = descResult.score;
  issues.push(...descResult.issues);

  const h1Result = scoreH1(html, lang);
  breakdown.h1 = h1Result.score;
  issues.push(...h1Result.issues);

  const viewportResult = scoreViewport(html, lang);
  breakdown.viewport = viewportResult.score;
  issues.push(...viewportResult.issues);

  const indexResult = scoreIndexability(html, data.homepage.headers, lang);
  breakdown.indexability = indexResult.score;
  issues.push(...indexResult.issues);

  const robotsResult = scoreRobotsTxt(data.robotsTxt, lang);
  breakdown.robotsTxt = robotsResult.score;
  issues.push(...robotsResult.issues);

  const sitemapResult = scoreSitemap(data.sitemapXml, lang);
  breakdown.sitemap = sitemapResult.score;
  issues.push(...sitemapResult.issues);

  const schemaResult = scoreSchemaOrg(html, lang);
  breakdown.schemaOrg = schemaResult.score;
  issues.push(...schemaResult.issues);

  const total = Object.values(breakdown).reduce((sum, val) => sum + val, 0);

  let status: SeoHealthScore['status'];
  let statusLabel: string;

  if (total <= 30) {
    status = 'critical';
    statusLabel = tr(lang, 'Критично', 'Critical');
  } else if (total <= 50) {
    status = 'warning';
    statusLabel = tr(lang, 'Требует внимания', 'Needs attention');
  } else if (total <= 70) {
    status = 'good';
    statusLabel = tr(lang, 'Есть потенциал', 'Has potential');
  } else {
    status = 'excellent';
    statusLabel = tr(lang, 'Хорошо', 'Good');
  }

  const severityOrder: Record<string, number> = { critical: 0, warning: 1, info: 2, success: 3 };
  issues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return {
    total,
    breakdown,
    issues: issues.slice(0, 8),
    status,
    statusLabel,
  };
}
