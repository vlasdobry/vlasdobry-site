// src/utils/healthScore/seoScoring.ts
import type { ResourceResult, Issue, SeoHealthScore } from './types';

function scoreTitle(html: string): { score: number; issues: Issue[] } {
  const issues: Issue[] = [];

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
    return { score: 8, issues };
  }

  if (title.length > 70) {
    issues.push({
      severity: 'info',
      title: 'Title слишком длинный',
      description: `${title.length} символов. Будет обрезан в поиске`,
    });
    return { score: 15, issues };
  }

  if (title.length >= 40 && title.length <= 60) {
    return { score: 20, issues };
  }

  return { score: 16, issues };
}

function scoreDescription(html: string): { score: number; issues: Issue[] } {
  const issues: Issue[] = [];

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
    return { score: 8, issues };
  }

  if (description.length > 170) {
    issues.push({
      severity: 'info',
      title: 'Description слишком длинный',
      description: `${description.length} символов. Будет обрезан`,
    });
    return { score: 15, issues };
  }

  if (description.length >= 120 && description.length <= 160) {
    return { score: 20, issues };
  }

  return { score: 16, issues };
}

function scoreViewport(html: string): { score: number; issues: Issue[] } {
  const issues: Issue[] = [];

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
    return { score: 20, issues };
  }

  issues.push({
    severity: 'warning',
    title: 'Viewport неоптимальный',
    description: 'Рекомендуется width=device-width, initial-scale=1',
  });
  return { score: 10, issues };
}

function scoreSpeed(responseTime: number): { score: number; issues: Issue[] } {
  const issues: Issue[] = [];

  if (responseTime <= 500) {
    return { score: 20, issues };
  }

  if (responseTime <= 1000) {
    return { score: 16, issues };
  }

  if (responseTime <= 2000) {
    issues.push({
      severity: 'warning',
      title: 'Медленный ответ сервера',
      description: `${responseTime}ms. Рекомендуется менее 500ms`,
    });
    return { score: 10, issues };
  }

  issues.push({
    severity: 'critical',
    title: 'Очень медленный сайт',
    description: `${responseTime}ms. Критически влияет на SEO`,
  });
  return { score: 5, issues };
}

function scoreIndexability(robotsTxt: ResourceResult, html: string): { score: number; issues: Issue[] } {
  const issues: Issue[] = [];
  let score = 20;

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

  // Check robots.txt
  if (robotsTxt.status === 200 && robotsTxt.content) {
    const content = robotsTxt.content.toLowerCase();

    // Check for Yandex/Google blocks
    const searchBots = ['yandexbot', 'googlebot'];
    for (const bot of searchBots) {
      if (content.includes(`user-agent: ${bot}`)) {
        const sections = content.split('user-agent:');
        for (const section of sections) {
          if (section.trim().startsWith(bot) && section.includes('disallow: /')) {
            issues.push({
              severity: 'critical',
              title: `${bot} заблокирован`,
              description: 'Поисковый бот не может индексировать сайт',
            });
            score -= 10;
          }
        }
      }
    }
  }

  return { score: Math.max(0, score), issues };
}

export function calculateSeoScore(data: { homepage: ResourceResult; robotsTxt: ResourceResult }): SeoHealthScore {
  const issues: Issue[] = [];
  const breakdown = {
    title: 0,
    description: 0,
    viewport: 0,
    speed: 0,
    indexability: 0,
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

  const viewportResult = scoreViewport(html);
  breakdown.viewport = viewportResult.score;
  issues.push(...viewportResult.issues);

  const speedResult = scoreSpeed(data.homepage.responseTime);
  breakdown.speed = speedResult.score;
  issues.push(...speedResult.issues);

  const indexResult = scoreIndexability(data.robotsTxt, html);
  breakdown.indexability = indexResult.score;
  issues.push(...indexResult.issues);

  // Total (max 100)
  const total = breakdown.title + breakdown.description + breakdown.viewport + breakdown.speed + breakdown.indexability;

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

  // Sort issues by severity
  const severityOrder = { critical: 0, warning: 1, info: 2 };
  issues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return {
    total,
    breakdown,
    issues: issues.slice(0, 5),
    status,
    statusLabel,
  };
}
