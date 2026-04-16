// Thin wrapper вокруг @vlasdobry/geo-checker — общая библиотека используется
// и виджетом на сайте, и Chrome-расширением AI Visibility Checker.
// Это гарантирует одинаковый скор для одного и того же сайта.

import { calculateGeoScore as libCalculateGeoScore } from '@vlasdobry/geo-checker';
import type { ResourceResult, GeoHealthScore } from './types';

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

  // Маппим библиотечный статус 'warning'/'good'/'excellent' → типы виджета.
  const statusMap: Record<typeof result.status, GeoHealthScore['status']> = {
    critical: 'critical',
    warning: 'warning',
    good: 'good',
    excellent: 'excellent',
  };

  return {
    total: result.total,
    breakdown: {
      llmFiles: result.breakdown.llmFiles,
      schemaOrg: result.breakdown.schemaOrg,
      faqQa: result.breakdown.faqQa,
      eeat: result.breakdown.eeat,
      citability: result.breakdown.citability,
      aiAccess: result.breakdown.aiAccess,
    },
    issues: result.issues.slice(0, 8), // виджет показывает до 8 issues
    status: statusMap[result.status],
    statusLabel: result.statusLabel,
  };
}
