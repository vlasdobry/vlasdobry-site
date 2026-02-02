// src/utils/healthScore/geoScoring.ts
import type { ResourceResult, Issue, GeoHealthScore } from './types';

const AI_BOTS = [
  'GPTBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-Web',
  'PerplexityBot', 'YandexGPT', 'GigaChatBot', 'Google-Extended',
];

// LLM Files: llms.txt (10) + llms-full.txt (20) = 30 points
function scoreLlmFiles(
  llmsTxt: ResourceResult,
  llmsFullTxt: ResourceResult
): { score: number; issues: Issue[] } {
  const issues: Issue[] = [];
  let score = 0;

  // llms-full.txt (20 points) - main recommendation
  if (llmsFullTxt.status === 200 && llmsFullTxt.content) {
    const length = llmsFullTxt.content.length;
    if (length >= 2000) {
      score += 20;
      issues.push({
        severity: 'success',
        title: 'llms-full.txt отличный',
        description: `${length} символов — AI получает полный контент`,
      });
    } else if (length >= 500) {
      score += 12;
      issues.push({
        severity: 'info',
        title: 'llms-full.txt можно расширить',
        description: `${length} символов. Рекомендуется 2000+`,
      });
    } else {
      score += 5;
      issues.push({
        severity: 'warning',
        title: 'llms-full.txt слишком короткий',
        description: `${length} символов. Добавьте больше контента`,
      });
    }
  } else {
    issues.push({
      severity: 'critical',
      title: 'llms-full.txt отсутствует',
      description: 'Главная рекомендация! AI не получает полный контент сайта',
    });
  }

  // llms.txt (10 points) - basic version
  if (llmsTxt.status === 200 && llmsTxt.content) {
    const length = llmsTxt.content.length;
    if (length >= 500) {
      score += 10;
      issues.push({
        severity: 'success',
        title: 'llms.txt присутствует',
        description: `${length} символов — базовая информация доступна`,
      });
    } else if (length >= 200) {
      score += 6;
      issues.push({
        severity: 'info',
        title: 'llms.txt короткий',
        description: `${length} символов. Рекомендуется 500+`,
      });
    } else {
      score += 3;
      issues.push({
        severity: 'warning',
        title: 'llms.txt минимальный',
        description: `Только ${length} символов`,
      });
    }
  } else if (llmsFullTxt.status !== 200) {
    // Only show error if llms-full.txt also missing
    issues.push({
      severity: 'warning',
      title: 'llms.txt отсутствует',
      description: 'Базовый файл для AI-систем не найден',
    });
  }

  return { score, issues };
}

// Schema.org (25 points)
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
      title: `Schema.org: ${foundTypes.length} типа`,
      description: `${foundTypes.slice(0, 3).join(', ')} — отлично для AI`,
    });
    return { score: 25, issues };
  }

  if (foundTypes.length === 2) {
    issues.push({
      severity: 'info',
      title: `Schema.org: ${foundTypes.length} типа`,
      description: `${foundTypes.join(', ')}. Добавьте ещё типы`,
    });
    return { score: 18, issues };
  }

  if (foundTypes.length === 1) {
    issues.push({
      severity: 'warning',
      title: 'Schema.org: 1 тип',
      description: `${foundTypes[0]}. Рекомендуется 3+ типа`,
    });
    return { score: 12, issues };
  }

  issues.push({
    severity: 'warning',
    title: 'Schema.org неполный',
    description: 'JSON-LD есть, но типы не распознаны',
  });
  return { score: 6, issues };
}

// FAQ / Q&A (20 points)
function scoreFaqQa(html: string): { score: number; issues: Issue[] } {
  const issues: Issue[] = [];
  let score = 0;

  // Check FAQPage in Schema.org (15 points)
  const hasFaqSchema =
    html.includes('"@type":"FAQPage"') ||
    html.includes('"@type": "FAQPage"') ||
    html.includes('"@type":"Question"') ||
    html.includes('"@type": "Question"');

  if (hasFaqSchema) {
    score += 15;
    issues.push({
      severity: 'success',
      title: 'FAQPage Schema найден',
      description: 'AI легко извлекает вопросы и ответы',
    });
  }

  // Check HowTo schema (5 points)
  const hasHowTo =
    html.includes('"@type":"HowTo"') ||
    html.includes('"@type": "HowTo"');

  if (hasHowTo) {
    score += 5;
    issues.push({
      severity: 'success',
      title: 'HowTo Schema найден',
      description: 'Пошаговые инструкции структурированы',
    });
  }

  // Check Q&A patterns in content (5 points if no schema)
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
        title: 'Q&A контент обнаружен',
        description: 'Добавьте FAQPage Schema для лучшей видимости',
      });
    } else {
      issues.push({
        severity: 'warning',
        title: 'FAQ/Q&A не найден',
        description: 'Добавьте раздел вопросов-ответов с FAQPage Schema',
      });
    }
  }

  return { score, issues };
}

// E-E-A-T signals (15 points)
function scoreEeat(html: string): { score: number; issues: Issue[] } {
  const issues: Issue[] = [];
  let score = 0;
  const signals: string[] = [];

  // Author (4 points)
  const hasAuthor =
    html.includes('"author"') ||
    html.includes('name="author"') ||
    html.includes('rel="author"') ||
    html.includes('class="author"');

  if (hasAuthor) {
    score += 4;
    signals.push('автор');
  }

  // Contact info (4 points)
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const phonePattern = /(\+7|8)[\s-]?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}|\+1[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{4}/;

  const hasEmail = emailPattern.test(html);
  const hasPhone = phonePattern.test(html);

  if (hasEmail || hasPhone) {
    score += 4;
    signals.push('контакты');
  }

  // Social links (4 points)
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
    signals.push('соцсети');
  }

  // About page link (3 points)
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
    signals.push('о нас');
  }

  // Generate issue based on score
  if (score >= 12) {
    issues.push({
      severity: 'success',
      title: 'E-E-A-T сигналы сильные',
      description: `Найдено: ${signals.join(', ')}`,
    });
  } else if (score >= 8) {
    issues.push({
      severity: 'info',
      title: 'E-E-A-T сигналы есть',
      description: `Найдено: ${signals.join(', ')}. Добавьте больше`,
    });
  } else if (score >= 4) {
    issues.push({
      severity: 'warning',
      title: 'E-E-A-T сигналы слабые',
      description: signals.length > 0
        ? `Только: ${signals.join(', ')}`
        : 'Добавьте автора, контакты, соцсети',
    });
  } else {
    issues.push({
      severity: 'critical',
      title: 'E-E-A-T сигналы отсутствуют',
      description: 'Нет автора, контактов, соцсетей — AI не доверяет',
    });
  }

  return { score, issues };
}

// AI accessibility via robots.txt (10 points)
function scoreAiAccess(data: ResourceResult): { score: number; issues: Issue[] } {
  const issues: Issue[] = [];

  if (data.status !== 200 || !data.content) {
    issues.push({
      severity: 'success',
      title: 'AI-боты разрешены',
      description: 'Нет robots.txt — все боты могут индексировать',
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

  // Check wildcard block
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
      title: 'AI-боты разрешены',
      description: 'Все основные AI-системы могут индексировать',
    });
    return { score: 10, issues };
  }

  const penalty = Math.min(uniqueBlocked.length * 2, 8);

  issues.push({
    severity: uniqueBlocked.length >= 3 ? 'critical' : 'warning',
    title: `${uniqueBlocked.length} AI-бот(а) заблокированы`,
    description: uniqueBlocked.slice(0, 3).join(', ') + (uniqueBlocked.length > 3 ? '...' : ''),
  });

  return { score: 10 - penalty, issues };
}

export function calculateGeoScore(data: {
  llmsTxt: ResourceResult;
  llmsFullTxt: ResourceResult;
  robotsTxt: ResourceResult;
  homepage: ResourceResult;
}): GeoHealthScore {
  const issues: Issue[] = [];
  const breakdown = {
    llmFiles: 0,
    schemaOrg: 0,
    faqQa: 0,
    eeat: 0,
    aiAccess: 0,
  };

  // LLM Files (30 points)
  const llmResult = scoreLlmFiles(data.llmsTxt, data.llmsFullTxt);
  breakdown.llmFiles = llmResult.score;
  issues.push(...llmResult.issues);

  // Check homepage content
  if (data.homepage.content) {
    const html = data.homepage.content;

    // Schema.org (25 points)
    const schemaResult = scoreSchemaOrg(html);
    breakdown.schemaOrg = schemaResult.score;
    issues.push(...schemaResult.issues);

    // FAQ/Q&A (20 points)
    const faqResult = scoreFaqQa(html);
    breakdown.faqQa = faqResult.score;
    issues.push(...faqResult.issues);

    // E-E-A-T (15 points)
    const eeatResult = scoreEeat(html);
    breakdown.eeat = eeatResult.score;
    issues.push(...eeatResult.issues);
  } else {
    issues.push({
      severity: 'critical',
      title: 'Сайт недоступен',
      description: 'Не удалось проверить страницу',
    });
  }

  // AI accessibility (10 points)
  const aiResult = scoreAiAccess(data.robotsTxt);
  breakdown.aiAccess = aiResult.score;
  issues.push(...aiResult.issues);

  // Total (max 100)
  const total = breakdown.llmFiles + breakdown.schemaOrg + breakdown.faqQa + breakdown.eeat + breakdown.aiAccess;

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

  // Sort issues (critical first, success last)
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
