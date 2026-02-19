// src/utils/healthScore/geoScoring.ts
import type { ResourceResult, Issue, GeoHealthScore } from './types';

type Lang = 'ru' | 'en';

const AI_BOTS = [
  'GPTBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-Web',
  'PerplexityBot', 'YandexGPT', 'GigaChatBot', 'Google-Extended',
];

function tr(lang: Lang, ru: string, en: string): string {
  return lang === 'ru' ? ru : en;
}

// LLM Files: llms.txt (10) + llms-full.txt (20) = 30 points
function scoreLlmFiles(
  llmsTxt: ResourceResult,
  llmsFullTxt: ResourceResult,
  lang: Lang
): { score: number; issues: Issue[] } {
  const issues: Issue[] = [];
  let score = 0;

  if (llmsFullTxt.status === 200 && llmsFullTxt.content) {
    const length = llmsFullTxt.content.length;
    if (length >= 2000) {
      score += 20;
      issues.push({
        severity: 'success',
        title: tr(lang, 'llms-full.txt отличный', 'llms-full.txt is excellent'),
        description: tr(lang, `${length} символов — AI получает полный контент`, `${length} chars - AI gets full context`),
      });
    } else if (length >= 500) {
      score += 12;
      issues.push({
        severity: 'info',
        title: tr(lang, 'llms-full.txt можно расширить', 'llms-full.txt can be expanded'),
        description: tr(lang, `${length} символов. Рекомендуется 2000+`, `${length} chars. Recommended: 2000+`),
      });
    } else {
      score += 5;
      issues.push({
        severity: 'warning',
        title: tr(lang, 'llms-full.txt слишком короткий', 'llms-full.txt is too short'),
        description: tr(lang, `${length} символов. Добавьте больше контента`, `${length} chars. Add more content`),
      });
    }
  } else {
    issues.push({
      severity: 'critical',
      title: tr(lang, 'llms-full.txt отсутствует', 'llms-full.txt is missing'),
      description: tr(lang, 'Главная рекомендация! AI не получает полный контент сайта', 'Main recommendation: AI cannot access the full site content'),
    });
  }

  if (llmsTxt.status === 200 && llmsTxt.content) {
    const length = llmsTxt.content.length;
    if (length >= 500) {
      score += 10;
      issues.push({
        severity: 'success',
        title: tr(lang, 'llms.txt присутствует', 'llms.txt is present'),
        description: tr(lang, `${length} символов — базовая информация доступна`, `${length} chars - base information is available`),
      });
    } else if (length >= 200) {
      score += 6;
      issues.push({
        severity: 'info',
        title: tr(lang, 'llms.txt короткий', 'llms.txt is short'),
        description: tr(lang, `${length} символов. Рекомендуется 500+`, `${length} chars. Recommended: 500+`),
      });
    } else {
      score += 3;
      issues.push({
        severity: 'warning',
        title: tr(lang, 'llms.txt минимальный', 'llms.txt is minimal'),
        description: tr(lang, `Только ${length} символов`, `Only ${length} chars`),
      });
    }
  } else if (llmsFullTxt.status !== 200) {
    issues.push({
      severity: 'warning',
      title: tr(lang, 'llms.txt отсутствует', 'llms.txt is missing'),
      description: tr(lang, 'Базовый файл для AI-систем не найден', 'Base AI discovery file was not found'),
    });
  }

  return { score, issues };
}

// Schema.org (25 points)
function scoreSchemaOrg(html: string, lang: Lang): { score: number; issues: Issue[] } {
  const issues: Issue[] = [];

  const hasJsonLd = html.includes('application/ld+json');

  if (!hasJsonLd) {
    issues.push({
      severity: 'critical',
      title: tr(lang, 'Schema.org отсутствует', 'Schema.org is missing'),
      description: tr(lang, 'Добавьте JSON-LD разметку для AI', 'Add JSON-LD structured data for AI systems'),
    });
    return { score: 0, issues };
  }

  const importantTypes = [
    'Organization', 'LocalBusiness', 'Service', 'Product',
    'FAQPage', 'Person', 'WebSite', 'Hotel', 'Restaurant',
    'ProfessionalService', 'Article', 'HowTo',
  ];

  const foundTypes = importantTypes.filter(type =>
    html.includes(`"@type":"${type}"`) ||
    html.includes(`"@type": "${type}"`) ||
    html.includes(`'@type':'${type}'`)
  );

  if (foundTypes.length >= 3) {
    issues.push({
      severity: 'success',
      title: tr(lang, `Schema.org: ${foundTypes.length} типа`, `Schema.org: ${foundTypes.length} types`),
      description: tr(lang, `${foundTypes.slice(0, 3).join(', ')} — отлично для AI`, `${foundTypes.slice(0, 3).join(', ')} - great for AI`),
    });
    return { score: 25, issues };
  }

  if (foundTypes.length === 2) {
    issues.push({
      severity: 'info',
      title: tr(lang, `Schema.org: ${foundTypes.length} типа`, `Schema.org: ${foundTypes.length} types`),
      description: tr(lang, `${foundTypes.join(', ')}. Добавьте ещё типы`, `${foundTypes.join(', ')}. Add more types`),
    });
    return { score: 18, issues };
  }

  if (foundTypes.length === 1) {
    issues.push({
      severity: 'warning',
      title: tr(lang, 'Schema.org: 1 тип', 'Schema.org: 1 type'),
      description: tr(lang, `${foundTypes[0]}. Рекомендуется 3+ типа`, `${foundTypes[0]}. Recommended: 3+ types`),
    });
    return { score: 12, issues };
  }

  issues.push({
    severity: 'warning',
    title: tr(lang, 'Schema.org неполный', 'Schema.org is incomplete'),
    description: tr(lang, 'JSON-LD есть, но типы не распознаны', 'JSON-LD exists, but types were not recognized'),
  });
  return { score: 6, issues };
}

// FAQ / Q&A (20 points)
function scoreFaqQa(html: string, lang: Lang): { score: number; issues: Issue[] } {
  const issues: Issue[] = [];
  let score = 0;

  const hasFaqSchema =
    html.includes('"@type":"FAQPage"') ||
    html.includes('"@type": "FAQPage"') ||
    html.includes('"@type":"Question"') ||
    html.includes('"@type": "Question"');

  if (hasFaqSchema) {
    score += 15;
    issues.push({
      severity: 'success',
      title: tr(lang, 'FAQPage Schema найден', 'FAQPage schema found'),
      description: tr(lang, 'AI легко извлекает вопросы и ответы', 'AI can easily extract Q&A content'),
    });
  }

  const hasHowTo =
    html.includes('"@type":"HowTo"') ||
    html.includes('"@type": "HowTo"');

  if (hasHowTo) {
    score += 5;
    issues.push({
      severity: 'success',
      title: tr(lang, 'HowTo Schema найден', 'HowTo schema found'),
      description: tr(lang, 'Пошаговые инструкции структурированы', 'Step-by-step instructions are structured'),
    });
  }

  if (!hasFaqSchema) {
    const qaPatterns = [
      /вопрос[:\s]/gi,
      /ответ[:\s]/gi,
      /question[:\s]/gi,
      /answer[:\s]/gi,
      /FAQ/gi,
      /Q&A/gi,
      /Q:\s/g,
      /A:\s/g,
    ];

    const matchCount = qaPatterns.reduce((count, pattern) => {
      const matches = html.match(pattern);
      return count + (matches ? matches.length : 0);
    }, 0);

    if (matchCount >= 4) {
      score += 5;
      issues.push({
        severity: 'info',
        title: tr(lang, 'Q&A контент обнаружен', 'Q&A content detected'),
        description: tr(lang, 'Добавьте FAQPage Schema для лучшей видимости', 'Add FAQPage schema for better visibility'),
      });
    } else {
      issues.push({
        severity: 'warning',
        title: tr(lang, 'FAQ/Q&A не найден', 'FAQ/Q&A not found'),
        description: tr(lang, 'Добавьте раздел вопросов-ответов с FAQPage Schema', 'Add a FAQ section with FAQPage schema'),
      });
    }
  }

  return { score, issues };
}

// E-E-A-T signals (15 points)
function scoreEeat(html: string, lang: Lang): { score: number; issues: Issue[] } {
  const issues: Issue[] = [];
  let score = 0;
  const signals: string[] = [];

  const hasAuthor =
    html.includes('"author"') ||
    html.includes('name="author"') ||
    html.includes('rel="author"') ||
    html.includes('class="author"');

  if (hasAuthor) {
    score += 4;
    signals.push(tr(lang, 'автор', 'author'));
  }

  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const phonePattern = /(\+7|8)[\s-]?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}|\+1[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{4}/;

  const hasEmail = emailPattern.test(html);
  const hasPhone = phonePattern.test(html);

  if (hasEmail || hasPhone) {
    score += 4;
    signals.push(tr(lang, 'контакты', 'contacts'));
  }

  const socialPatterns = [
    /linkedin\.com/i,
    /facebook\.com/i,
    /twitter\.com|x\.com/i,
    /t\.me|telegram/i,
    /instagram\.com/i,
  ];

  const hasSocial = socialPatterns.some(pattern => pattern.test(html));
  if (hasSocial) {
    score += 4;
    signals.push(tr(lang, 'соцсети', 'social links'));
  }

  const aboutPatterns = [
    /href="[^"]*\/about/i,
    /href="[^"]*\/o-nas/i,
    /href="[^"]*\/company/i,
    /href="[^"]*\/o-kompanii/i,
    /href="[^"]*\/team/i,
  ];

  const hasAboutLink = aboutPatterns.some(pattern => pattern.test(html));
  if (hasAboutLink) {
    score += 3;
    signals.push(tr(lang, 'о нас', 'about page'));
  }

  if (score >= 12) {
    issues.push({
      severity: 'success',
      title: tr(lang, 'E-E-A-T сигналы сильные', 'E-E-A-T signals are strong'),
      description: tr(lang, `Найдено: ${signals.join(', ')}`, `Found: ${signals.join(', ')}`),
    });
  } else if (score >= 8) {
    issues.push({
      severity: 'info',
      title: tr(lang, 'E-E-A-T сигналы есть', 'E-E-A-T signals are present'),
      description: tr(lang, `Найдено: ${signals.join(', ')}. Добавьте больше`, `Found: ${signals.join(', ')}. Add more signals`),
    });
  } else if (score >= 4) {
    issues.push({
      severity: 'warning',
      title: tr(lang, 'E-E-A-T сигналы слабые', 'E-E-A-T signals are weak'),
      description: signals.length > 0
        ? tr(lang, `Только: ${signals.join(', ')}`, `Only: ${signals.join(', ')}`)
        : tr(lang, 'Добавьте автора, контакты, соцсети', 'Add author data, contacts, and social links'),
    });
  } else {
    issues.push({
      severity: 'critical',
      title: tr(lang, 'E-E-A-T сигналы отсутствуют', 'E-E-A-T signals are missing'),
      description: tr(lang, 'Нет автора, контактов, соцсетей — AI не доверяет', 'No author, contacts, or social links - AI trust will be low'),
    });
  }

  return { score, issues };
}

// AI accessibility via robots.txt (10 points)
function scoreAiAccess(data: ResourceResult, lang: Lang): { score: number; issues: Issue[] } {
  const issues: Issue[] = [];

  if (data.status !== 200 || !data.content) {
    issues.push({
      severity: 'success',
      title: tr(lang, 'AI-боты разрешены', 'AI bots are allowed'),
      description: tr(lang, 'Нет robots.txt — все боты могут индексировать', 'No robots.txt - all bots can index'),
    });
    return { score: 10, issues };
  }

  const content = data.content.toLowerCase();
  const blockedBots: string[] = [];

  for (const bot of AI_BOTS) {
    const botLower = bot.toLowerCase();

    if (content.includes(`user-agent: ${botLower}`)) {
      const afterBot = content.split(`user-agent: ${botLower}`)[1]?.split('user-agent:')[0] || '';
      if (afterBot.includes('disallow: /')) {
        blockedBots.push(bot);
      }
    }
  }

  if (content.includes('user-agent: *')) {
    const wildcardSection = content.split('user-agent: *')[1]?.split('user-agent:')[0] || '';
    if (wildcardSection.includes('disallow: /') && !wildcardSection.includes('allow:')) {
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
      title: tr(lang, 'AI-боты разрешены', 'AI bots are allowed'),
      description: tr(lang, 'Все основные AI-системы могут индексировать', 'All major AI systems can index this site'),
    });
    return { score: 10, issues };
  }

  const penalty = Math.min(uniqueBlocked.length * 2, 8);

  issues.push({
    severity: uniqueBlocked.length >= 3 ? 'critical' : 'warning',
    title: tr(lang, `${uniqueBlocked.length} AI-бот(а) заблокированы`, `${uniqueBlocked.length} AI bot(s) are blocked`),
    description: uniqueBlocked.slice(0, 3).join(', ') + (uniqueBlocked.length > 3 ? '...' : ''),
  });

  return { score: 10 - penalty, issues };
}

export function calculateGeoScore(data: {
  llmsTxt: ResourceResult;
  llmsFullTxt: ResourceResult;
  robotsTxt: ResourceResult;
  homepage: ResourceResult;
}, lang: Lang = 'ru'): GeoHealthScore {
  const issues: Issue[] = [];
  const breakdown = {
    llmFiles: 0,
    schemaOrg: 0,
    faqQa: 0,
    eeat: 0,
    aiAccess: 0,
  };

  const llmResult = scoreLlmFiles(data.llmsTxt, data.llmsFullTxt, lang);
  breakdown.llmFiles = llmResult.score;
  issues.push(...llmResult.issues);

  if (data.homepage.content) {
    const html = data.homepage.content;

    const schemaResult = scoreSchemaOrg(html, lang);
    breakdown.schemaOrg = schemaResult.score;
    issues.push(...schemaResult.issues);

    const faqResult = scoreFaqQa(html, lang);
    breakdown.faqQa = faqResult.score;
    issues.push(...faqResult.issues);

    const eeatResult = scoreEeat(html, lang);
    breakdown.eeat = eeatResult.score;
    issues.push(...eeatResult.issues);
  } else {
    issues.push({
      severity: 'critical',
      title: tr(lang, 'Сайт недоступен', 'Site is unavailable'),
      description: tr(lang, 'Не удалось проверить страницу', 'Could not validate the page'),
    });
  }

  const aiResult = scoreAiAccess(data.robotsTxt, lang);
  breakdown.aiAccess = aiResult.score;
  issues.push(...aiResult.issues);

  const total = breakdown.llmFiles + breakdown.schemaOrg + breakdown.faqQa + breakdown.eeat + breakdown.aiAccess;

  let status: GeoHealthScore['status'];
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
    issues: issues.slice(0, 6),
    status,
    statusLabel,
  };
}
