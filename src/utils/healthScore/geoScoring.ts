// Thin wrapper вокруг @vlasdobry/geo-checker — общая библиотека используется
// и виджетом на сайте, и Chrome-расширением AI Visibility Checker.
// Это гарантирует одинаковый скор для одного и того же сайта.

import { calculateGeoScore as libCalculateGeoScore } from '@vlasdobry/geo-checker';
import type { ResourceResult, GeoHealthScore, Issue } from './types';

type Lang = 'ru' | 'en';

export function calculateGeoScore(
  data: {
    llmsTxt: ResourceResult;
    llmsFullTxt: ResourceResult;
    robotsTxt: ResourceResult;
    homepage: ResourceResult;
  },
  lang: Lang = 'ru',
): GeoHealthScore {
  const result = libCalculateGeoScore(
    {
      homepage: { content: data.homepage.content, status: data.homepage.status },
      llmsTxt: { content: data.llmsTxt.content, status: data.llmsTxt.status },
      llmsFullTxt: { content: data.llmsFullTxt.content, status: data.llmsFullTxt.status },
      robotsTxt: { content: data.robotsTxt.content, status: data.robotsTxt.status },
      // Виджет получает только pre-JS HTML через Cloudflare Worker (нет браузера для рендеринга).
      // renderedHtml не передаём → rendered-vs-source даёт полный балл (5/5) — нет возможности сравнить.
      renderedHtml: null,
    },
    { lang },
  );

  const availability = (resource: ResourceResult) => {
    if (resource.availability) return resource.availability;
    if (resource.status === 0) return 'unavailable';
    if (resource.status === 404) return 'missing';
    return 'found';
  };
  const homepageUnavailable = availability(data.homepage) === 'unavailable';
  const robotsUnavailable = availability(data.robotsTxt) === 'unavailable';
  const llmsTxtUnavailable = availability(data.llmsTxt) === 'unavailable';
  const llmsFullUnavailable = availability(data.llmsFullTxt) === 'unavailable';
  const excludedChecks = new Set<string>();
  let availableWeight = 100;
  let unavailableChecks = 0;

  if (homepageUnavailable) {
    for (const id of ['schemaOrg', 'faqQa', 'eeat', 'citability', 'renderedVsSource']) {
      excludedChecks.add(id);
    }
    availableWeight -= 60;
    unavailableChecks += 5;
  }
  if (robotsUnavailable) {
    excludedChecks.add('aiAccess');
    availableWeight -= 10;
    unavailableChecks += 1;
  }
  if (llmsTxtUnavailable) {
    availableWeight -= 10;
    unavailableChecks += 1;
  }
  if (llmsFullUnavailable) {
    availableWeight -= 20;
    unavailableChecks += 1;
  }

  const visibleIssues: Issue[] = result.checks.flatMap(check => {
    if (excludedChecks.has(check.id)) return [];
    if (check.id !== 'llmFiles') return check.issues;

    return check.issues.filter(issue => {
      const title = issue.title.toLowerCase();
      if (llmsFullUnavailable && title.includes('llms-full.txt')) return false;
      if (llmsTxtUnavailable && title.includes('llms.txt')) return false;
      return true;
    });
  });
  const addUnavailableIssue = (titleRu: string, titleEn: string) => {
    visibleIssues.push({
      severity: 'info',
      title: lang === 'ru' ? titleRu : titleEn,
      description: lang === 'ru'
        ? 'Временная ошибка проверки. Параметр не влияет на оценку.'
        : 'Temporary check error. This parameter does not affect the score.',
    });
  };
  if (homepageUnavailable) {
    addUnavailableIssue('Главную страницу не удалось проверить', 'Homepage could not be checked');
  }
  if (robotsUnavailable) {
    addUnavailableIssue('robots.txt не удалось проверить', 'robots.txt could not be checked');
  }
  if (llmsTxtUnavailable) {
    addUnavailableIssue('llms.txt не удалось проверить', 'llms.txt could not be checked');
  }
  if (llmsFullUnavailable) {
    addUnavailableIssue('llms-full.txt не удалось проверить', 'llms-full.txt could not be checked');
  }

  const checkScore = (id: string) => {
    if (excludedChecks.has(id)) return 0;
    return result.checks.find(check => check.id === id)?.score ?? 0;
  };
  const rawScore = result.checks.reduce(
    (sum, check) => sum + (excludedChecks.has(check.id) ? 0 : check.score),
    0,
  );
  const total = availableWeight > 0 ? Math.round(rawScore / availableWeight * 100) : 0;
  let status: GeoHealthScore['status'];
  let statusLabel: string;
  if (total <= 30) {
    status = 'critical';
    statusLabel = lang === 'ru' ? 'Критично' : 'Critical';
  } else if (total <= 50) {
    status = 'warning';
    statusLabel = lang === 'ru' ? 'Требует внимания' : 'Needs attention';
  } else if (total <= 70) {
    status = 'good';
    statusLabel = lang === 'ru' ? 'Есть потенциал' : 'Has potential';
  } else {
    status = 'excellent';
    statusLabel = lang === 'ru' ? 'Хорошо' : 'Good';
  }
  const severityOrder: Record<Issue['severity'], number> = {
    critical: 0,
    warning: 1,
    info: 2,
    success: 3,
  };
  visibleIssues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return {
    total,
    rawScore,
    availableWeight,
    totalWeight: 100,
    checkedCount: 8 - unavailableChecks,
    totalChecks: 8,
    unavailableChecks,
    breakdown: {
      llmFiles: checkScore('llmFiles'),
      schemaOrg: checkScore('schemaOrg'),
      faqQa: checkScore('faqQa'),
      eeat: checkScore('eeat'),
      citability: checkScore('citability'),
      aiAccess: checkScore('aiAccess'),
    },
    issues: visibleIssues.slice(0, 8),
    status,
    statusLabel,
  };
}
