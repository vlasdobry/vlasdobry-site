// src/utils/healthScore/seoScoring.ts
import type { ResourceResult, Issue, SeoHealthScore } from './types';

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

function scoreTitle(html: string): { score: number; issues: Issue[] } {
  const issues: Issue[] = [];
  const maxScore = WEIGHTS.title;

  const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
  const title = titleMatch?.[1]?.trim() || '';

  if (!title) {
    issues.push({
      severity: 'critical',
      title: 'Title отсутствует',
      description: 'Добавьте заголовок страницы в тег <title>',
    });
    return { score: 0, issues };
  }

  if (title.length < 20) {
    issues.push({
      severity: 'warning',
      title: 'Title слишком короткий',
      description: `${title.length} символов. Рекомендуется 50-60`,
    });
    return { score: Math.round(maxScore * 0.4), issues };
  }

  if (title.length > 70) {
    issues.push({
      severity: 'info',
      title: 'Title слишком длинный',
      description: `${title.length} символов. Будет обрезан в поиске`,
    });
    return { score: Math.round(maxScore * 0.75), issues };
  }

  if (title.length >= 40 && title.length <= 60) {
    issues.push({
      severity: 'success',
      title: 'Title оптимальный',
      description: `${title.length} символов — идеально для поисковиков`,
    });
    return { score: maxScore, issues };
  }

  return { score: Math.round(maxScore * 0.8), issues };
}

function scoreDescription(html: string): { score: number; issues: Issue[] } {
  const issues: Issue[] = [];
  const maxScore = WEIGHTS.description;

  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
                    html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i);
  const description = descMatch?.[1]?.trim() || '';

  if (!description) {
    issues.push({
      severity: 'critical',
      title: 'Description отсутствует',
      description: 'Добавьте мета-описание страницы',
    });
    return { score: 0, issues };
  }

  if (description.length < 50) {
    issues.push({
      severity: 'warning',
      title: 'Description слишком короткий',
      description: `${description.length} символов. Рекомендуется 150-160`,
    });
    return { score: Math.round(maxScore * 0.4), issues };
  }

  if (description.length > 170) {
    issues.push({
      severity: 'info',
      title: 'Description слишком длинный',
      description: `${description.length} символов. Будет обрезан`,
    });
    return { score: Math.round(maxScore * 0.75), issues };
  }

  if (description.length >= 120 && description.length <= 160) {
    issues.push({
      severity: 'success',
      title: 'Description оптимальный',
      description: `${description.length} символов — идеально`,
    });
    return { score: maxScore, issues };
  }

  return { score: Math.round(maxScore * 0.8), issues };
}

function scoreViewport(html: string): { score: number; issues: Issue[] } {
  const issues: Issue[] = [];
  const maxScore = WEIGHTS.viewport;

  const hasViewport = html.includes('name="viewport"') || html.includes("name='viewport'");

  if (!hasViewport) {
    issues.push({
      severity: 'critical',
      title: 'Viewport не настроен',
      description: 'Сайт не адаптирован для мобильных устройств',
    });
    return { score: 0, issues };
  }

  const viewportMatch = html.match(/<meta[^>]*name=["']viewport["'][^>]*content=["']([^"']*)["']/i);
  const viewport = viewportMatch?.[1] || '';

  if (viewport.includes('width=device-width')) {
    issues.push({
      severity: 'success',
      title: 'Viewport настроен',
      description: 'Сайт адаптирован для мобильных устройств',
    });
    return { score: maxScore, issues };
  }

  issues.push({
    severity: 'warning',
    title: 'Viewport неоптимальный',
    description: 'Рекомендуется width=device-width, initial-scale=1',
  });
  return { score: Math.round(maxScore * 0.5), issues };
}

function scoreH1(html: string): { score: number; issues: Issue[] } {
  const issues: Issue[] = [];
  const maxScore = WEIGHTS.h1;

  const h1Matches = html.match(/<h1[^>]*>[\s\S]*?<\/h1>/gi) || [];

  if (h1Matches.length === 0) {
    issues.push({
      severity: 'critical',
      title: 'H1 отсутствует',
      description: 'Добавьте главный заголовок страницы',
    });
    return { score: 0, issues };
  }

  if (h1Matches.length > 1) {
    issues.push({
      severity: 'warning',
      title: `Несколько H1 (${h1Matches.length})`,
      description: 'Рекомендуется один H1 на страницу',
    });
    return { score: Math.round(maxScore * 0.5), issues };
  }

  // Extract text from H1
  const h1Text = h1Matches[0].replace(/<[^>]*>/g, '').trim();

  if (h1Text.length < 10) {
    issues.push({
      severity: 'warning',
      title: 'H1 слишком короткий',
      description: `${h1Text.length} символов. Добавьте описательный заголовок`,
    });
    return { score: Math.round(maxScore * 0.6), issues };
  }

  issues.push({
    severity: 'success',
    title: 'H1 в порядке',
    description: 'Главный заголовок страницы настроен правильно',
  });
  return { score: maxScore, issues };
}

function scoreIndexability(html: string): { score: number; issues: Issue[] } {
  const issues: Issue[] = [];
  const maxScore = WEIGHTS.indexability;

  // Check robots meta tag
  const noindexMatch = html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["']/i);
  const robotsContent = noindexMatch?.[1]?.toLowerCase() || '';

  if (robotsContent.includes('noindex')) {
    issues.push({
      severity: 'critical',
      title: 'Страница закрыта от индексации',
      description: 'Мета-тег robots содержит noindex',
    });
    return { score: 0, issues };
  }

  issues.push({
    severity: 'success',
    title: 'Индексация разрешена',
    description: 'Страница открыта для поисковиков',
  });

  return { score: maxScore, issues };
}

function scoreRobotsTxt(robotsTxt: ResourceResult): { score: number; issues: Issue[] } {
  const issues: Issue[] = [];
  const maxScore = WEIGHTS.robotsTxt;

  if (robotsTxt.status !== 200 || !robotsTxt.content) {
    issues.push({
      severity: 'critical',
      title: 'robots.txt отсутствует',
      description: 'Поисковые боты не получают инструкций по индексации',
    });
    return { score: 0, issues };
  }

  const content = robotsTxt.content.toLowerCase();

  // Check for blocking all
  if (content.includes('disallow: /') && content.includes('user-agent: *')) {
    const wildcardSection = content.split('user-agent: *')[1]?.split('user-agent:')[0] || '';
    if (wildcardSection.includes('disallow: /') && !wildcardSection.includes('allow:')) {
      issues.push({
        severity: 'critical',
        title: 'robots.txt блокирует индексацию',
        description: 'Disallow: / запрещает доступ ко всему сайту',
      });
      return { score: Math.round(maxScore * 0.2), issues };
    }
  }

  // Check for Yandex/Google blocks
  const searchBots = ['yandexbot', 'googlebot'];
  let penalty = 0;
  for (const bot of searchBots) {
    if (content.includes(`user-agent: ${bot}`)) {
      const sections = content.split('user-agent:');
      for (const section of sections) {
        if (section.trim().startsWith(bot) && section.includes('disallow: /')) {
          issues.push({
            severity: 'warning',
            title: `${bot} ограничен в robots.txt`,
            description: 'Поисковый бот имеет ограничения',
          });
          penalty += maxScore * 0.2;
        }
      }
    }
  }

  if (penalty === 0) {
    issues.push({
      severity: 'success',
      title: 'robots.txt настроен',
      description: 'Поисковые боты получают корректные инструкции',
    });
  }

  return { score: Math.max(0, Math.round(maxScore - penalty)), issues };
}

function scoreSitemap(sitemapXml: ResourceResult): { score: number; issues: Issue[] } {
  const issues: Issue[] = [];
  const maxScore = WEIGHTS.sitemap;

  if (sitemapXml.status !== 200 || !sitemapXml.content) {
    issues.push({
      severity: 'critical',
      title: 'sitemap.xml отсутствует',
      description: 'Поисковики не видят структуру сайта',
    });
    return { score: 0, issues };
  }

  const urlCount = (sitemapXml.content.match(/<loc>/gi) || []).length;

  if (urlCount === 0) {
    issues.push({
      severity: 'warning',
      title: 'sitemap.xml пустой',
      description: 'Файл есть, но URL не найдены',
    });
    return { score: Math.round(maxScore * 0.3), issues };
  }

  issues.push({
    severity: 'success',
    title: `sitemap.xml: ${urlCount} URL`,
    description: 'Карта сайта настроена',
  });
  return { score: maxScore, issues };
}

function scoreSchemaOrg(html: string): { score: number; issues: Issue[] } {
  const issues: Issue[] = [];
  const maxScore = WEIGHTS.schemaOrg;

  const hasJsonLd = html.includes('application/ld+json');

  if (!hasJsonLd) {
    issues.push({
      severity: 'critical',
      title: 'Schema.org отсутствует',
      description: 'Нет структурированных данных для поисковиков',
    });
    return { score: 0, issues };
  }

  const importantTypes = ['Organization', 'LocalBusiness', 'WebSite', 'Product', 'FAQPage', 'Person', 'Hotel', 'Restaurant', 'Service'];
  const foundTypes = importantTypes.filter(type =>
    html.includes(`"@type":"${type}"`) ||
    html.includes(`"@type": "${type}"`) ||
    html.includes(`'@type':'${type}'`)
  );

  if (foundTypes.length >= 3) {
    issues.push({
      severity: 'success',
      title: `Schema.org: ${foundTypes.length} типа`,
      description: `${foundTypes.join(', ')} — отлично`,
    });
    return { score: maxScore, issues };
  }

  if (foundTypes.length === 2) {
    issues.push({
      severity: 'info',
      title: `Schema.org: ${foundTypes.length} типа`,
      description: `${foundTypes.join(', ')}. Добавьте FAQPage`,
    });
    return { score: Math.round(maxScore * 0.7), issues };
  }

  if (foundTypes.length === 1) {
    issues.push({
      severity: 'warning',
      title: 'Schema.org: 1 тип',
      description: `${foundTypes[0]}. Рекомендуется 3+ типа`,
    });
    return { score: Math.round(maxScore * 0.5), issues };
  }

  issues.push({
    severity: 'warning',
    title: 'Schema.org неполный',
    description: 'JSON-LD есть, но типы не распознаны',
  });
  return { score: Math.round(maxScore * 0.3), issues };
}

export function calculateSeoScore(data: {
  homepage: ResourceResult;
  robotsTxt: ResourceResult;
  sitemapXml: ResourceResult;
}): SeoHealthScore {
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
      issues: [{ severity: 'critical', title: 'Сайт недоступен', description: 'Не удалось загрузить страницу' }],
      status: 'critical',
      statusLabel: 'Недоступен',
    };
  }

  const html = data.homepage.content;

  // Calculate each component
  const titleResult = scoreTitle(html);
  breakdown.title = titleResult.score;
  issues.push(...titleResult.issues);

  const descResult = scoreDescription(html);
  breakdown.description = descResult.score;
  issues.push(...descResult.issues);

  const h1Result = scoreH1(html);
  breakdown.h1 = h1Result.score;
  issues.push(...h1Result.issues);

  const viewportResult = scoreViewport(html);
  breakdown.viewport = viewportResult.score;
  issues.push(...viewportResult.issues);

  const indexResult = scoreIndexability(html);
  breakdown.indexability = indexResult.score;
  issues.push(...indexResult.issues);

  const robotsResult = scoreRobotsTxt(data.robotsTxt);
  breakdown.robotsTxt = robotsResult.score;
  issues.push(...robotsResult.issues);

  const sitemapResult = scoreSitemap(data.sitemapXml);
  breakdown.sitemap = sitemapResult.score;
  issues.push(...sitemapResult.issues);

  const schemaResult = scoreSchemaOrg(html);
  breakdown.schemaOrg = schemaResult.score;
  issues.push(...schemaResult.issues);

  // Total (max 100)
  const total = Object.values(breakdown).reduce((sum, val) => sum + val, 0);

  // Status
  let status: SeoHealthScore['status'];
  let statusLabel: string;

  if (total <= 30) {
    status = 'critical';
    statusLabel = 'Критично';
  } else if (total <= 50) {
    status = 'warning';
    statusLabel = 'Требует внимания';
  } else if (total <= 70) {
    status = 'good';
    statusLabel = 'Есть потенциал';
  } else {
    status = 'excellent';
    statusLabel = 'Хорошо';
  }

  // Sort issues by severity (success last)
  const severityOrder: Record<string, number> = { critical: 0, warning: 1, info: 2, success: 3 };
  issues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return {
    total,
    breakdown,
    issues: issues.slice(0, 6),
    status,
    statusLabel,
  };
}
