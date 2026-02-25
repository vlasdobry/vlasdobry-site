# 168-FZ Compliance Checker — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a free tool at `/168-fz` that checks websites for Latin-script elements that may need Russian translation under Federal Law 168-FZ.

**Architecture:** Cloudflare Worker (new route in existing `health-score-proxy`) fetches target HTML and uses HTMLRewriter to extract text from UI elements (buttons, headings, nav, forms, footers). Frontend React component scores findings by severity (critical/important/medium) and displays collapsible results with pre-filled Telegram CTA.

**Tech Stack:** Cloudflare Workers (HTMLRewriter), React 19 + TypeScript, Tailwind CSS v4, existing i18n system, Yandex.Metrika analytics

**Design document:** `docs/plans/2026-02-25-168fz-compliance-checker.md`

---

## Task 1: Worker — Whitelist Config

**Files:**
- Create: `workers/health-score-proxy/src/compliance-whitelist.ts`

**Step 1: Create whitelist config**

```typescript
// workers/health-score-proxy/src/compliance-whitelist.ts

// Common abbreviations accepted in Russian (per normative dictionaries / widely adopted)
export const WHITELIST_WORDS = new Set([
  // Technology
  'wifi', 'wi-fi', 'sms', 'gps', 'qr', 'pdf', 'usb', 'id', 'tv', 'vip',
  'dj', 'pr', 'it', 'hr', 'kpi', 'ceo', 'spa', 'ok', 'vs', 'faq',
  'url', 'http', 'https', 'www', 'html', 'css', 'api',
  // Common borrowed words in normative dictionaries
  'bar', 'fitness', 'lobby', 'junior', 'senior',
]);

// Regex patterns for things to skip entirely
export const WHITELIST_PATTERNS: RegExp[] = [
  // URLs and emails
  /^https?:\/\//i,
  /^www\./i,
  /\S+@\S+\.\S+/,
  // Domain-like strings
  /^[a-z0-9-]+\.[a-z]{2,}$/i,
  // Numbers with units (24h, 5km, 100m2)
  /^\d+[a-z]{1,3}$/i,
  // Single Latin character
  /^[a-zA-Z]$/,
  // Pure numbers
  /^\d+$/,
];

/**
 * Check if a text string should be excluded from compliance findings.
 * Returns true if the text is whitelisted (acceptable in Latin script).
 */
export function isWhitelisted(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return true;

  // Check pattern matches
  for (const pattern of WHITELIST_PATTERNS) {
    if (pattern.test(trimmed)) return true;
  }

  // Check if ALL Latin words in text are whitelisted
  const latinWords = trimmed.match(/[a-zA-Z]{2,}/g);
  if (!latinWords) return true; // No Latin words found

  return latinWords.every(word => WHITELIST_WORDS.has(word.toLowerCase()));
}
```

**Step 2: Commit**

```bash
git add workers/health-score-proxy/src/compliance-whitelist.ts
git commit -m "feat(compliance): add whitelist config for acceptable Latin terms"
```

---

## Task 2: Worker — Compliance Endpoint

**Files:**
- Modify: `workers/health-score-proxy/src/index.ts` (add `/api/compliance` route)

**Step 1: Add types and HTMLRewriter handler at the top of the file**

After the existing imports and before `export default`, add:

```typescript
import { isWhitelisted } from './compliance-whitelist';

interface ComplianceFinding {
  text: string;
  category: 'buttons' | 'headings' | 'navigation' | 'forms' | 'subheadings' | 'policies' | 'meta';
  severity: 'critical' | 'important' | 'medium' | 'info';
  element: string; // e.g. "button", "h1", "nav a"
}

interface ComplianceResult {
  url: string;
  findings: ComplianceFinding[];
  isSPA: boolean;
  error: string | null;
}

// Latin detection: 2+ consecutive Latin characters
const LATIN_REGEX = /[a-zA-Z]{2,}/;

function hasLatin(text: string): boolean {
  return LATIN_REGEX.test(text);
}

// Category mapping: element selector → { category, severity }
const ELEMENT_MAP: Record<string, { category: ComplianceFinding['category']; severity: ComplianceFinding['severity'] }> = {
  'button': { category: 'buttons', severity: 'critical' },
  'input[type=submit]': { category: 'buttons', severity: 'critical' },
  'input[type=button]': { category: 'buttons', severity: 'critical' },
  'h1': { category: 'headings', severity: 'critical' },
  'h2': { category: 'headings', severity: 'critical' },
  'h3': { category: 'headings', severity: 'critical' },
  'h4': { category: 'subheadings', severity: 'medium' },
  'h5': { category: 'subheadings', severity: 'medium' },
  'h6': { category: 'subheadings', severity: 'medium' },
};
```

**Step 2: Add the compliance handler function**

```typescript
async function handleCompliance(
  body: { url: string },
  corsHeaders: Record<string, string>
): Promise<Response> {
  const domain = normalizeDomain(body.url);
  if (!domain) {
    return Response.json(
      { error: 'Invalid URL' },
      { status: 400, headers: corsHeaders }
    );
  }

  try {
    const response = await fetchWithSafeRedirects(
      `https://${domain}/`,
      domain
    );

    if (!response.ok) {
      return Response.json(
        { url: domain, findings: [], isSPA: false, error: `HTTP ${response.status}` },
        { headers: corsHeaders }
      );
    }

    const findings: ComplianceFinding[] = [];
    const seenTexts = new Set<string>();

    // Helper to add finding if it contains Latin and not whitelisted
    const addFinding = (
      text: string,
      category: ComplianceFinding['category'],
      severity: ComplianceFinding['severity'],
      element: string
    ) => {
      const trimmed = text.trim();
      if (!trimmed || trimmed.length > 500) return;
      if (seenTexts.has(trimmed.toLowerCase())) return;
      if (!hasLatin(trimmed)) return;
      if (isWhitelisted(trimmed)) return;

      seenTexts.add(trimmed.toLowerCase());
      findings.push({ text: trimmed, category, severity, element });
    };

    // Use HTMLRewriter for streaming HTML parsing
    const rewriter = new HTMLRewriter()
      // Buttons
      .on('button', {
        text(chunk) {
          if (chunk.text.trim()) addFinding(chunk.text, 'buttons', 'critical', 'button');
        }
      })
      .on('input[type="submit"], input[type="button"]', {
        element(el) {
          const val = el.getAttribute('value');
          if (val) addFinding(val, 'buttons', 'critical', 'input[type=submit]');
        }
      })
      .on('a.btn, a[class*="btn"], a[class*="button"]', {
        text(chunk) {
          if (chunk.text.trim()) addFinding(chunk.text, 'buttons', 'critical', 'a.btn');
        }
      })
      // Headings
      .on('h1, h2, h3', {
        text(chunk) {
          if (chunk.text.trim()) addFinding(chunk.text, 'headings', 'critical', 'h1-h3');
        }
      })
      .on('h4, h5, h6', {
        text(chunk) {
          if (chunk.text.trim()) addFinding(chunk.text, 'subheadings', 'medium', 'h4-h6');
        }
      })
      // Navigation
      .on('nav a, header a', {
        text(chunk) {
          if (chunk.text.trim()) addFinding(chunk.text, 'navigation', 'important', 'nav a');
        }
      })
      // Forms
      .on('label', {
        text(chunk) {
          if (chunk.text.trim()) addFinding(chunk.text, 'forms', 'important', 'label');
        }
      })
      .on('input[placeholder]', {
        element(el) {
          const ph = el.getAttribute('placeholder');
          if (ph) addFinding(ph, 'forms', 'important', 'input[placeholder]');
        }
      })
      .on('select option', {
        text(chunk) {
          if (chunk.text.trim()) addFinding(chunk.text, 'forms', 'important', 'select option');
        }
      })
      // Footer policies
      .on('footer a', {
        text(chunk) {
          const t = chunk.text.trim();
          if (t && /policy|terms|privacy|conditions|cookie/i.test(t)) {
            addFinding(t, 'policies', 'medium', 'footer a');
          } else if (t) {
            addFinding(t, 'navigation', 'important', 'footer a');
          }
        }
      })
      // Meta (informational)
      .on('title', {
        text(chunk) {
          if (chunk.text.trim()) addFinding(chunk.text, 'meta', 'info', 'title');
        }
      })
      .on('meta[name="description"]', {
        element(el) {
          const content = el.getAttribute('content');
          if (content) addFinding(content, 'meta', 'info', 'meta[description]');
        }
      });

    // Transform (consumes) the response body
    const transformed = rewriter.transform(response);
    await transformed.text(); // drain the stream

    // SPA detection
    const isSPA = findings.length < 3 && seenTexts.size < 5;

    return Response.json(
      { url: domain, findings, isSPA, error: null },
      { headers: corsHeaders }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Fetch failed';
    return Response.json(
      { url: domain, findings: [], isSPA: false, error: message },
      { headers: corsHeaders }
    );
  }
}
```

**Step 3: Add routing in the main fetch handler**

In the `fetch()` handler, after the `POST` check and origin validation, add URL-based routing:

```typescript
// After rate limiting check, before the existing try block:
const url = new URL(request.url);

if (url.pathname === '/api/compliance') {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json(
        { error: 'Invalid JSON' },
        { status: 400, headers: corsHeaders }
      );
    }

    const reqUrl = typeof (body as { url?: unknown }).url === 'string'
      ? (body as { url: string }).url
      : '';

    if (!reqUrl.trim()) {
      return Response.json(
        { error: 'URL required' },
        { status: 400, headers: corsHeaders }
      );
    }

    return handleCompliance({ url: reqUrl }, corsHeaders);
  } catch {
    return Response.json(
      { error: 'Internal error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Existing health-score logic (default route)...
```

**Step 4: Verify the worker builds**

Run: `cd workers/health-score-proxy && npx wrangler deploy --dry-run`
Expected: Build succeeds without errors

**Step 5: Commit**

```bash
git add workers/health-score-proxy/src/index.ts
git commit -m "feat(compliance): add /api/compliance endpoint with HTMLRewriter parsing"
```

---

## Task 3: Frontend — Compliance Types

**Files:**
- Create: `src/utils/compliance/types.ts`

**Step 1: Create types**

```typescript
// src/utils/compliance/types.ts

export interface ComplianceFinding {
  text: string;
  category: 'buttons' | 'headings' | 'navigation' | 'forms' | 'subheadings' | 'policies' | 'meta';
  severity: 'critical' | 'important' | 'medium' | 'info';
  element: string;
}

export interface ComplianceApiResponse {
  url: string;
  findings: ComplianceFinding[];
  isSPA: boolean;
  error: string | null;
}

export interface ComplianceScore {
  total: number; // 0-100
  findings: ComplianceFinding[];
  isSPA: boolean;
  categoryCounts: Record<ComplianceFinding['category'], number>;
  status: 'compliant' | 'warnings' | 'non-compliant';
  statusLabel: string;
}
```

**Step 2: Commit**

```bash
git add src/utils/compliance/types.ts
git commit -m "feat(compliance): add TypeScript types for compliance checker"
```

---

## Task 4: Frontend — Scoring Logic

**Files:**
- Create: `src/utils/compliance/scoring.ts`

**Step 1: Create scoring function**

```typescript
// src/utils/compliance/scoring.ts

import type { ComplianceApiResponse, ComplianceScore, ComplianceFinding } from './types';

const SEVERITY_WEIGHTS: Record<ComplianceFinding['severity'], number> = {
  critical: 10,
  important: 7,
  medium: 5,
  info: 0,
};

export function calculateComplianceScore(
  data: ComplianceApiResponse,
  lang: 'ru' | 'en'
): ComplianceScore {
  let score = 100;

  for (const finding of data.findings) {
    score -= SEVERITY_WEIGHTS[finding.severity];
  }

  score = Math.max(0, score);

  // Count by category
  const categoryCounts: Record<ComplianceFinding['category'], number> = {
    buttons: 0,
    headings: 0,
    navigation: 0,
    forms: 0,
    subheadings: 0,
    policies: 0,
    meta: 0,
  };

  for (const finding of data.findings) {
    categoryCounts[finding.category]++;
  }

  // Status
  let status: ComplianceScore['status'];
  let statusLabel: string;

  if (score >= 80) {
    status = 'compliant';
    statusLabel = lang === 'ru' ? 'Соответствует' : 'Compliant';
  } else if (score >= 40) {
    status = 'warnings';
    statusLabel = lang === 'ru' ? 'Есть замечания' : 'Has warnings';
  } else {
    status = 'non-compliant';
    statusLabel = lang === 'ru' ? 'Не соответствует' : 'Non-compliant';
  }

  return {
    total: score,
    findings: data.findings,
    isSPA: data.isSPA,
    categoryCounts,
    status,
    statusLabel,
  };
}
```

**Step 2: Create index.ts barrel export**

```typescript
// src/utils/compliance/index.ts
export { calculateComplianceScore } from './scoring';
export type { ComplianceScore, ComplianceFinding, ComplianceApiResponse } from './types';
```

**Step 3: Commit**

```bash
git add src/utils/compliance/
git commit -m "feat(compliance): add scoring logic (critical -10, important -7, medium -5)"
```

---

## Task 5: Analytics — Compliance Events

**Files:**
- Modify: `src/utils/analytics.ts`

**Step 1: Add compliance events**

After the `// Blog` section, add:

```typescript
  // Compliance Checker (168-FZ)
  complianceStart: (domain: string) =>
    trackGoal('compliance_start', { domain }),
  complianceComplete: (domain: string, score: number, findingsCount: number) =>
    trackGoal('compliance_complete', { domain, score, findings_count: findingsCount }),
  complianceError: (error: string) =>
    trackGoal('compliance_error', { error }),
  complianceCta: (domain: string, score: number) =>
    trackGoal('compliance_cta_click', { domain, score }),
```

**Step 2: Commit**

```bash
git add src/utils/analytics.ts
git commit -m "feat(compliance): add Yandex.Metrika tracking events"
```

---

## Task 6: i18n — Compliance Texts

**Files:**
- Modify: `src/i18n/types.ts` — add `ComplianceSection` interface
- Modify: `src/i18n/ru.ts` — add `compliance` section
- Modify: `src/i18n/en.ts` — add `compliance` section

**Step 1: Add type definition**

In `src/i18n/types.ts`, add before `export interface Translations`:

```typescript
export interface ComplianceSection {
  meta: { title: string; description: string };
  nav: { backToMain: string };
  hero: {
    title: string;
    subtitle: string;
    description: string;
  };
  input: {
    placeholder: string;
    button: string;
    checking: string;
  };
  scanning: {
    steps: string[];
    slow: string;
  };
  results: {
    score: string;
    found: string;
    disclaimer: string;
    categories: {
      buttons: string;
      headings: string;
      navigation: string;
      forms: string;
      subheadings: string;
      policies: string;
      meta: string;
    };
    severities: {
      critical: string;
      important: string;
      medium: string;
      info: string;
    };
    spa: string;
    noIssues: string;
    recommendation: string;
  };
  cta: {
    compliant: { text: string; action: string };
    warnings: { text: string; action: string };
    nonCompliant: { text: string; action: string };
  };
  about: {
    title: string;
    text: string;
    blogLink: string;
    seoLink: string;
  };
  footer: {
    name: string;
    role: string;
    links: { telegram: string; whatsapp: string; email: string };
  };
}
```

Add `compliance: ComplianceSection;` to the `Translations` interface.

**Step 2: Add Russian texts in `ru.ts`**

```typescript
compliance: {
  meta: {
    title: '168-ФЗ: проверка сайта на соответствие закону о русском языке',
    description: 'Бесплатная проверка сайта на соответствие закону 168-ФЗ. Находит кнопки, заголовки и навигацию на иностранном языке.',
  },
  nav: { backToMain: 'Главная' },
  hero: {
    title: 'Проверка сайта на 168-ФЗ',
    subtitle: 'Закон о защите русского языка',
    description: 'Закон 168-ФЗ обязывает бизнес давать потребителю информацию на русском языке. Проверьте, есть ли на вашем сайте элементы, которые могут потребовать перевода.',
  },
  input: {
    placeholder: 'Введите адрес сайта',
    button: 'Проверить',
    checking: 'Проверяем...',
  },
  scanning: {
    steps: [
      'Загружаем страницу...',
      'Анализируем кнопки и заголовки...',
      'Проверяем навигацию...',
      'Анализируем формы...',
      'Формируем отчёт...',
    ],
    slow: 'Сайт отвечает медленно...',
  },
  results: {
    score: 'Ваш сайт',
    found: 'элементов, возможно требующих перевода',
    disclaimer: 'Экспресс-проверка на наличие иностранных слов. Не является юридической экспертизой. Инструмент не проверяет наличие слов в нормативных словарях и регистрацию товарных знаков — эти исключения могут быть допустимы по закону 168-ФЗ. Для полной проверки обратитесь к юристу.',
    categories: {
      buttons: 'Кнопки',
      headings: 'Заголовки',
      navigation: 'Навигация',
      forms: 'Формы',
      subheadings: 'Подзаголовки',
      policies: 'Политики и условия',
      meta: 'Мета-информация',
    },
    severities: {
      critical: 'критично',
      important: 'важно',
      medium: 'незначительно',
      info: 'рекомендация',
    },
    spa: 'Сайт использует JavaScript-рендеринг. Автоматическая проверка ограничена. Попробуйте проверить конкретные страницы или напишите мне для ручной проверки.',
    noIssues: 'Отлично! Иностранных слов в ключевых элементах не обнаружено.',
    recommendation: 'Рассмотрите перевод',
  },
  cta: {
    compliant: {
      text: 'Ваш сайт в порядке! Проверьте техническое SEO',
      action: 'Проверить SEO',
    },
    warnings: {
      text: 'Есть что исправить. Нужна помощь?',
      action: 'Написать в Telegram',
    },
    nonCompliant: {
      text: 'Сайт не соответствует 168-ФЗ. Исправим?',
      action: 'Написать в Telegram',
    },
  },
  about: {
    title: 'О законе 168-ФЗ',
    text: 'Федеральный закон № 168-ФЗ вступает в силу 1 марта 2026 года. Обязывает бизнес предоставлять потребительскую информацию на русском языке: сайты, вывески, меню, формы бронирования.',
    blogLink: 'Подробнее о законе 168-ФЗ →',
    seoLink: 'Полный SEO-аудит →',
  },
  footer: {
    name: 'Влас Фёдоров',
    role: 'Performance-маркетолог',
    links: { telegram: 'Telegram', whatsapp: 'WhatsApp', email: 'Email' },
  },
},
```

**Step 3: Add English texts in `en.ts`**

```typescript
compliance: {
  meta: {
    title: '168-FZ Compliance Check: Is Your Russian Website Ready?',
    description: 'Free compliance checker for Russia\'s Federal Law 168-FZ. Finds buttons, headings, and navigation in foreign languages that may need Russian translation.',
  },
  nav: { backToMain: 'Home' },
  hero: {
    title: '168-FZ Website Compliance Check',
    subtitle: 'Russia\'s Language Protection Law',
    description: 'Federal Law 168-FZ requires businesses to provide consumer information in Russian. Check if your website has elements that may need translation.',
  },
  input: {
    placeholder: 'Enter website URL',
    button: 'Check',
    checking: 'Checking...',
  },
  scanning: {
    steps: [
      'Loading page...',
      'Analyzing buttons and headings...',
      'Checking navigation...',
      'Analyzing forms...',
      'Generating report...',
    ],
    slow: 'Website is responding slowly...',
  },
  results: {
    score: 'Your website',
    found: 'elements that may need translation',
    disclaimer: 'This is an automated scan for foreign-language text. It is not a legal assessment. The tool does not check normative dictionaries or trademark registrations — these exceptions may be permissible under Law 168-FZ. Consult a lawyer for a complete review.',
    categories: {
      buttons: 'Buttons',
      headings: 'Headings',
      navigation: 'Navigation',
      forms: 'Forms',
      subheadings: 'Subheadings',
      policies: 'Policies & Terms',
      meta: 'Meta Information',
    },
    severities: {
      critical: 'critical',
      important: 'important',
      medium: 'minor',
      info: 'recommendation',
    },
    spa: 'This website uses JavaScript rendering. Automated checking is limited. Try checking specific pages or contact me for a manual review.',
    noIssues: 'Great! No foreign-language text found in key elements.',
    recommendation: 'Consider translating',
  },
  cta: {
    compliant: {
      text: 'Your website looks good! Check your technical SEO',
      action: 'Check SEO',
    },
    warnings: {
      text: 'There are things to fix. Need help?',
      action: 'Message on Telegram',
    },
    nonCompliant: {
      text: 'Website doesn\'t comply with 168-FZ. Let\'s fix it?',
      action: 'Message on Telegram',
    },
  },
  about: {
    title: 'About Law 168-FZ',
    text: 'Federal Law No. 168-FZ takes effect March 1, 2026. It requires businesses to provide consumer information in Russian: websites, signs, menus, booking forms.',
    blogLink: 'Learn more about Law 168-FZ →',
    seoLink: 'Full SEO Audit →',
  },
  footer: {
    name: 'Vlas Fedorov',
    role: 'Performance Marketer',
    links: { telegram: 'Telegram', whatsapp: 'WhatsApp', email: 'Email' },
  },
},
```

**Step 4: Commit**

```bash
git add src/i18n/types.ts src/i18n/ru.ts src/i18n/en.ts
git commit -m "feat(compliance): add i18n texts for RU and EN"
```

---

## Task 7: Frontend — ComplianceChecker Component

**Files:**
- Create: `src/components/ComplianceChecker.tsx`

This is the largest task. The component follows the same state machine pattern as `HealthScoreChecker.tsx`:
`idle → loading → result | error`

**Step 1: Create the component**

```typescript
// src/components/ComplianceChecker.tsx

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useI18n, Lang } from '../i18n';
import { LanguageSwitcher } from './LanguageSwitcher';
import { analytics } from '../utils/analytics';
import { calculateComplianceScore } from '../utils/compliance';
import type { ComplianceApiResponse, ComplianceScore, ComplianceFinding } from '../utils/compliance/types';

type CheckerState = 'idle' | 'loading' | 'result' | 'error';

interface ScanStep {
  label: string;
  status: 'pending' | 'active' | 'done';
}

const WORKER_URL = import.meta.env.DEV
  ? '/api/compliance'
  : 'https://health-score-proxy.vlasdobry.workers.dev/api/compliance';

const HISTORY_KEY = 'compliance_checked_urls';
const HISTORY_MAX = 5;
const TIMEOUT_MS = 25_000;
const SLOW_THRESHOLD_MS = 10_000;
```

The full component implementation follows the `HealthScoreChecker.tsx` pattern:

1. **URL input** with `<datalist>` history from localStorage
2. **Scanning animation** with 5 steps (1.6s each)
3. **Score circle** (SVG) with color by status (green/yellow/red)
4. **Findings list** — collapsible sections grouped by category
5. **SPA warning** if `isSPA === true`
6. **CTA section** — dynamic text by score:
   - 80-100: link to `/services/seo/` (or `/en/services/seo/`)
   - 40-79: pre-filled Telegram link
   - 0-39: pre-filled Telegram link
7. **About section** — links to blog article and SEO page
8. **Disclaimer** text
9. **Footer** — same pattern as other pages

Key implementation details:

```typescript
// URL history
function getHistory(): string[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveToHistory(url: string) {
  const history = getHistory().filter(h => h !== url);
  history.unshift(url);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, HISTORY_MAX)));
}

// Pre-filled Telegram message
function getTelegramUrl(domain: string, score: number, count: number, lang: Lang): string {
  const text = lang === 'ru'
    ? `Привет! Проверил сайт ${domain} на 168-ФЗ — ${count} элементов на латинице (${score}/100). Поможете с исправлениями?`
    : `Hi! Checked ${domain} for 168-FZ compliance — ${count} Latin-script elements (${score}/100). Can you help fix this?`;
  return `https://t.me/vlasdobry?text=${encodeURIComponent(text)}`;
}

// Score color
function getScoreColor(score: number): string {
  if (score >= 80) return '#22c55e'; // green
  if (score >= 40) return '#eab308'; // yellow
  return '#ef4444'; // red
}

// Category severity label
const CATEGORY_SEVERITY: Record<ComplianceFinding['category'], ComplianceFinding['severity']> = {
  buttons: 'critical',
  headings: 'critical',
  navigation: 'important',
  forms: 'important',
  subheadings: 'medium',
  policies: 'medium',
  meta: 'info',
};
```

The component renders:
- Sticky nav (same as BlogPost/ServiceLanding pattern)
- Hero section with title, subtitle, description
- URL input form
- Scanning animation OR results
- Score circle + summary
- Collapsible findings by category (sorted: critical → important → medium → info)
- CTA block
- About section with links
- Footer

**Step 2: Commit**

```bash
git add src/components/ComplianceChecker.tsx
git commit -m "feat(compliance): add ComplianceChecker React component"
```

---

## Task 8: Entry Points — HTML + Mount + Vite + Postbuild

**Files:**
- Create: `168-fz.html` — RU HTML entry point
- Create: `168-fz-en.html` — EN HTML entry point
- Create: `src/compliance-index.tsx` — React mount
- Modify: `vite.config.ts` — add to rollupOptions.input + dev routes
- Modify: `scripts/postbuild.js` — add moves

**Step 1: Create `src/compliance-index.tsx`**

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ComplianceChecker } from './components/ComplianceChecker';
import { I18nProvider, Lang } from './i18n';

const lang: Lang = window.location.pathname.startsWith('/en') ? 'en' : 'ru';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <I18nProvider lang={lang}>
      <ComplianceChecker basePath="/168-fz" />
    </I18nProvider>
  </React.StrictMode>
);
```

**Step 2: Create `168-fz.html`**

Copy structure from `seo.html` and adapt:
- `<title>` → `168-ФЗ: проверка сайта | Влас Фёдоров`
- `<meta name="description">` → compliance description
- Open Graph tags → adapted for 168-FZ
- `<link rel="canonical" href="https://vlasdobry.ru/168-fz/">`
- `<link rel="alternate" hreflang="en" href="https://vlasdobry.ru/en/168-fz/">`
- `<link rel="alternate" hreflang="ru" href="https://vlasdobry.ru/168-fz/">`
- Schema.org JSON-LD: `WebApplication` type
- Yandex.Metrika counter (same as all pages)
- `<script type="module" src="/src/compliance-index.tsx"></script>`
- Noscript fallback text about 168-FZ compliance tool

**Step 3: Create `168-fz-en.html`**

Same as RU but with English meta, OG, canonical pointing to `/en/168-fz/`, alternate to `/168-fz/`.

**Step 4: Update `vite.config.ts`**

Add to `rollupOptions.input`:
```typescript
'168-fz': path.resolve(__dirname, '168-fz.html'),
'168-fz-en': path.resolve(__dirname, '168-fz-en.html'),
```

Add to `routes` array in dev server middleware (before `{ prefix: '/en', ...}`):
```typescript
{ prefix: '/en/168-fz', file: '/168-fz-en.html' },
{ prefix: '/168-fz', file: '/168-fz.html' },
```

**Step 5: Update `scripts/postbuild.js`**

Add to `moves` array:
```javascript
{ src: '168-fz.html', dest: '168-fz/index.html' },
{ src: '168-fz-en.html', dest: 'en/168-fz/index.html' },
```

**Step 6: Add dev proxy for compliance endpoint**

In `vite.config.ts` server.proxy, add:
```typescript
'/api/compliance': {
  target: 'https://health-score-proxy.vlasdobry.workers.dev',
  changeOrigin: true,
  headers: {
    Origin: 'https://vlasdobry.ru',
  },
},
```

**Step 7: Commit**

```bash
git add 168-fz.html 168-fz-en.html src/compliance-index.tsx vite.config.ts scripts/postbuild.js
git commit -m "feat(compliance): add HTML entry points, Vite config, postbuild moves"
```

---

## Task 9: Cross-linking

**Files:**
- Modify: `content/blog/168-fz-zakon-o-russkom-yazyke-sayt/ru.md` — add link to `/168-fz`
- Modify: `content/blog/168-fz-zakon-o-russkom-yazyke-sayt/en.md` — add link to `/en/168-fz`
- Modify: `public/sitemap.xml` — add `/168-fz/` and `/en/168-fz/`
- Modify: `public/llms.txt` — add compliance checker mention

**Step 1: Add CTA link in blog article (RU)**

At the end of the TL;DR paragraph, add:
```markdown
[Проверьте свой сайт бесплатно →](/168-fz)
```

**Step 2: Add CTA link in blog article (EN)**

```markdown
[Check your website for free →](/en/168-fz)
```

**Step 3: Update `sitemap.xml`**

Add new entries (follow existing pattern with `xhtml:link` for language alternates):
```xml
<url>
  <loc>https://vlasdobry.ru/168-fz/</loc>
  <xhtml:link rel="alternate" hreflang="ru" href="https://vlasdobry.ru/168-fz/" />
  <xhtml:link rel="alternate" hreflang="en" href="https://vlasdobry.ru/en/168-fz/" />
</url>
<url>
  <loc>https://vlasdobry.ru/en/168-fz/</loc>
  <xhtml:link rel="alternate" hreflang="ru" href="https://vlasdobry.ru/168-fz/" />
  <xhtml:link rel="alternate" hreflang="en" href="https://vlasdobry.ru/en/168-fz/" />
</url>
```

**Step 4: Update `llms.txt`**

Add line about the compliance checker tool to the appropriate section.

**Step 5: Regenerate blog data**

Run: `node scripts/generate-blog.js`
Expected: 14 RU + 14 EN articles, updated `blog-data.json`

**Step 6: Commit**

```bash
git add content/blog/168-fz-zakon-o-russkom-yazyke-sayt/ public/sitemap.xml public/llms.txt public/llms-full.txt public/blog-data.json
git commit -m "feat(compliance): add cross-links between article and checker tool"
```

---

## Task 10: Smoke Test + Deploy

**Step 1: Run dev server and test**

Run: `npm run dev`

Test URLs:
- `http://localhost:3000/168-fz` — RU page loads
- `http://localhost:3000/en/168-fz` — EN page loads
- Enter `vlasdobry.ru` → submit → see results

**Step 2: Run build**

Run: `npm run build`
Expected: Build succeeds, `dist/168-fz/index.html` and `dist/en/168-fz/index.html` exist

**Step 3: Push to production**

```bash
git push origin master
```
Expected: GitHub Actions deploys both site and Worker

**Step 4: Verify production**

```bash
curl -s -o /dev/null -w "%{http_code}" https://vlasdobry.ru/168-fz/
curl -s -o /dev/null -w "%{http_code}" https://vlasdobry.ru/en/168-fz/
```
Expected: Both return 200

---

## Task 11: Update CLAUDE.md and Memory

**Files:**
- Modify: `CLAUDE.md` — add `/168-fz` pages to structure, update key files
- Modify: `MEMORY.md` — note compliance checker architecture

**Step 1: Update CLAUDE.md**

Add to page structure:
```
- `/168-fz` — проверка 168-ФЗ (RU)
- `/en/168-fz` — 168-FZ check (EN)
```

Add to components:
```
- `src/components/ComplianceChecker.tsx` — виджет проверки на 168-ФЗ
```

Add to key files:
```
| `168-fz.html` | RU страница проверки 168-ФЗ |
| `168-fz-en.html` | EN страница проверки 168-FZ |
| `src/utils/compliance/` | Логика скоринга 168-ФЗ (scoring, types) |
```

Add Metrika goals:
```
- `compliance_start`, `compliance_complete`, `compliance_error` — проверка 168-ФЗ
- `compliance_cta_click` — переход к заказу после проверки
```

**Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md with 168-FZ compliance checker"
```
