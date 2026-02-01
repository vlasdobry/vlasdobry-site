// src/utils/healthScore/geoScoring.ts
import type { ResourceResult, Issue, GeoHealthScore } from './types';

const AI_BOTS = [
  'GPTBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-Web',
  'PerplexityBot', 'YandexGPT', 'GigaChatBot', 'Google-Extended',
];

function scoreLlmsTxt(data: ResourceResult): { score: number; issues: Issue[] } {
  const issues: Issue[] = [];

  if (data.status !== 200 || !data.content) {
    issues.push({
      severity: 'critical',
      title: 'llms.txt отсутствует',
      description: 'AI-системы не получают структурированную информацию',
    });
    return { score: 0, issues };
  }

  const length = data.content.length;

  if (length >= 800) {
    issues.push({
      severity: 'success',
      title: 'llms.txt отличный',
      description: `${length} символов — AI получает полную информацию`,
    });
    return { score: 30, issues };
  }

  if (length >= 500) {
    issues.push({
      severity: 'info',
      title: 'llms.txt можно расширить',
      description: `${length} символов. Рекомендуется 800+`,
    });
    return { score: 22, issues };
  }

  if (length >= 200) {
    issues.push({
      severity: 'warning',
      title: 'llms.txt слишком короткий',
      description: `${length} символов. Добавьте больше информации`,
    });
    return { score: 12, issues };
  }

  issues.push({
    severity: 'critical',
    title: 'llms.txt критически мал',
    description: `Только ${length} символов`,
  });
  return { score: 5, issues };
}

function scoreRobotsTxtForAI(data: ResourceResult): { score: number; issues: Issue[] } {
  const issues: Issue[] = [];

  if (data.status !== 200 || !data.content) {
    return { score: 20, issues }; // No robots.txt = allow all
  }

  const content = data.content.toLowerCase();
  const blockedBots: string[] = [];

  for (const bot of AI_BOTS) {
    const botLower = bot.toLowerCase();

    // Check explicit block
    if (content.includes(`user-agent: ${botLower}`)) {
      const afterBot = content.split(`user-agent: ${botLower}`)[1]?.split('user-agent:')[0] || '';
      if (afterBot.includes('disallow: /')) {
        blockedBots.push(bot);
      }
    }
  }

  // Check wildcard block
  if (content.includes('user-agent: *')) {
    const wildcardSection = content.split('user-agent: *')[1]?.split('user-agent:')[0] || '';
    if (wildcardSection.includes('disallow: /') && !wildcardSection.includes('allow:')) {
      // All bots might be blocked
      for (const bot of AI_BOTS) {
        if (!content.includes(`user-agent: ${bot.toLowerCase()}`)) {
          blockedBots.push(bot);
        }
      }
    }
  }

  const uniqueBlocked = [...new Set(blockedBots)];

  if (uniqueBlocked.length === 0) {
    issues.push({
      severity: 'success',
      title: 'AI-боты разрешены',
      description: 'Все основные AI-системы могут индексировать сайт',
    });
    return { score: 25, issues };
  }

  const penalty = Math.min(uniqueBlocked.length * 4, 20);

  issues.push({
    severity: uniqueBlocked.length >= 3 ? 'critical' : 'warning',
    title: `${uniqueBlocked.length} AI-бот(а) заблокированы`,
    description: uniqueBlocked.slice(0, 3).join(', ') + (uniqueBlocked.length > 3 ? '...' : ''),
  });

  return { score: 25 - penalty, issues };
}

function scoreSitemap(data: ResourceResult): { score: number; issues: Issue[] } {
  const issues: Issue[] = [];

  if (data.status !== 200 || !data.content) {
    issues.push({
      severity: 'warning',
      title: 'sitemap.xml отсутствует',
      description: 'AI не видит структуру сайта',
    });
    return { score: 0, issues };
  }

  const urlCount = (data.content.match(/<loc>/gi) || []).length;

  if (urlCount === 0) {
    issues.push({
      severity: 'warning',
      title: 'sitemap.xml пустой',
      description: 'Файл есть, но URL не найдены',
    });
    return { score: 5, issues };
  }

  if (urlCount > 20) {
    issues.push({
      severity: 'success',
      title: `sitemap.xml: ${urlCount} URL`,
      description: 'AI видит полную структуру сайта',
    });
    return { score: 15, issues };
  }
  if (urlCount >= 5) {
    issues.push({
      severity: 'success',
      title: `sitemap.xml: ${urlCount} URL`,
      description: 'Структура сайта доступна для AI',
    });
    return { score: 12, issues };
  }

  issues.push({
    severity: 'info',
    title: `sitemap.xml: ${urlCount} URL`,
    description: 'Небольшой сайт',
  });
  return { score: 8, issues };
}

function scoreSchemaOrg(html: string): { score: number; issues: Issue[] } {
  const issues: Issue[] = [];

  const hasJsonLd = html.includes('application/ld+json');

  if (!hasJsonLd) {
    issues.push({
      severity: 'critical',
      title: 'Schema.org отсутствует',
      description: 'Добавьте JSON-LD разметку для AI',
    });
    return { score: 0, issues };
  }

  const importantTypes = ['Organization', 'LocalBusiness', 'Service', 'Product', 'FAQPage', 'Person', 'WebSite', 'Hotel', 'Restaurant'];
  const foundTypes = importantTypes.filter(type =>
    html.includes(`"@type":"${type}"`) ||
    html.includes(`"@type": "${type}"`) ||
    html.includes(`'@type':'${type}'`)
  );

  if (foundTypes.length >= 3) {
    issues.push({
      severity: 'success',
      title: `Schema.org: ${foundTypes.length} типа`,
      description: `${foundTypes.join(', ')} — отлично для AI`,
    });
    return { score: 30, issues };
  }

  if (foundTypes.length === 2) {
    issues.push({
      severity: 'info',
      title: `Schema.org: ${foundTypes.length} типа`,
      description: `${foundTypes.join(', ')}. Добавьте FAQPage`,
    });
    return { score: 22, issues };
  }

  if (foundTypes.length === 1) {
    issues.push({
      severity: 'warning',
      title: 'Schema.org: 1 тип',
      description: `${foundTypes[0]}. Рекомендуется 3+ типа`,
    });
    return { score: 15, issues };
  }

  issues.push({
    severity: 'warning',
    title: 'Schema.org неполный',
    description: 'JSON-LD есть, но типы не распознаны',
  });
  return { score: 8, issues };
}

export function calculateGeoScore(data: {
  llmsTxt: ResourceResult;
  robotsTxt: ResourceResult;
  sitemapXml: ResourceResult;
  homepage: ResourceResult;
}): GeoHealthScore {
  const issues: Issue[] = [];
  const breakdown = {
    llmsTxt: 0,
    robotsTxt: 0,
    sitemap: 0,
    schemaOrg: 0,
  };

  // llms.txt (30 points)
  const llmsResult = scoreLlmsTxt(data.llmsTxt);
  breakdown.llmsTxt = llmsResult.score;
  issues.push(...llmsResult.issues);

  // robots.txt for AI (25 points)
  const robotsResult = scoreRobotsTxtForAI(data.robotsTxt);
  breakdown.robotsTxt = robotsResult.score;
  issues.push(...robotsResult.issues);

  // sitemap (15 points)
  const sitemapResult = scoreSitemap(data.sitemapXml);
  breakdown.sitemap = sitemapResult.score;
  issues.push(...sitemapResult.issues);

  // Schema.org (30 points)
  if (data.homepage.content) {
    const schemaResult = scoreSchemaOrg(data.homepage.content);
    breakdown.schemaOrg = schemaResult.score;
    issues.push(...schemaResult.issues);
  } else {
    issues.push({
      severity: 'critical',
      title: 'Сайт недоступен',
      description: 'Не удалось проверить Schema.org',
    });
  }

  // Total (max 100)
  const total = breakdown.llmsTxt + breakdown.robotsTxt + breakdown.sitemap + breakdown.schemaOrg;

  // Status
  let status: GeoHealthScore['status'];
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

  // Sort issues (success last)
  const severityOrder: Record<string, number> = { critical: 0, warning: 1, info: 2, success: 3 };
  issues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return {
    total,
    breakdown,
    issues: issues.slice(0, 5),
    status,
    statusLabel,
  };
}
