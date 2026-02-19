// src/components/HealthScoreChecker.tsx
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { Lang } from '../i18n';
import { calculateCombinedScore, type FetchedData, type CombinedHealthScore } from '../utils/healthScore';
import { analytics } from '../utils/analytics';

const WORKER_URL = 'https://health-score-proxy.vlasdobry.workers.dev';

interface Props {
  lang: Lang;
  primary: 'seo' | 'geo';
  ctaUrl: string;
}

type CheckerState = 'idle' | 'loading' | 'result' | 'error';

interface ScanStep {
  label: string;
  status: 'pending' | 'active' | 'done';
}

// Tooltips for technical terms
const tooltips: Record<string, Record<string, string>> = {
  ru: {
    'llms.txt': 'Файл с информацией о сайте для AI-систем (ChatGPT, Claude, Perplexity)',
    'llms-full.txt': 'Расширенный файл с полным контентом сайта для AI',
    'Schema.org': 'Структурированные данные, помогающие AI понять контент сайта',
    'FAQPage': 'Разметка вопросов-ответов, которую AI легко цитирует',
    'E-E-A-T': 'Сигналы доверия: авторство, контакты, соцсети',
    'robots.txt': 'Файл с правилами для поисковых ботов и AI-краулеров',
    'sitemap.xml': 'Карта сайта со списком всех страниц',
    'Title': 'Заголовок страницы, отображаемый в поиске',
    'Description': 'Описание страницы для поисковой выдачи',
    'H1': 'Главный заголовок на странице',
    'Viewport': 'Настройка адаптивности для мобильных устройств',
  },
  en: {
    'llms.txt': 'File with site info for AI systems (ChatGPT, Claude, Perplexity)',
    'llms-full.txt': 'Extended file with full site content for AI',
    'Schema.org': 'Structured data helping AI understand site content',
    'FAQPage': 'Q&A markup that AI can easily cite',
    'E-E-A-T': 'Trust signals: authorship, contacts, social links',
    'robots.txt': 'File with rules for search bots and AI crawlers',
    'sitemap.xml': 'Site map with list of all pages',
    'Title': 'Page title shown in search results',
    'Description': 'Page description for search snippets',
    'H1': 'Main heading on the page',
    'Viewport': 'Mobile responsiveness setting',
  },
};

// Translations hardcoded for widget isolation
const translations = {
  ru: {
    title: 'Проверьте свой сайт',
    subtitleSeo: 'Бесплатная проверка SEO. Узнайте, как вас видят поисковики.',
    subtitleGeo: 'Бесплатная проверка GEO. Узнайте, как вас видит AI.',
    placeholder: 'https://myhotel.ru',
    button: 'Проверить',
    free: 'Бесплатно · Без регистрации',
    scanning: 'Сканирование',
    seoSteps: {
      connect: 'Подключение',
      robots: 'robots.txt',
      sitemap: 'sitemap.xml',
      schema: 'Schema.org',
      meta: 'Мета-теги',
    },
    geoSteps: {
      connect: 'Подключение',
      llms: 'LLM Files',
      schema: 'Schema.org',
      faq: 'FAQ / Q&A',
      eeat: 'E-E-A-T сигналы',
    },
    seoScore: 'SEO Score',
    geoScore: 'GEO Score',
    seoProblems: 'Что улучшить в SEO',
    geoProblems: 'Что улучшить в GEO',
    seoBonus: 'Бонус: проверили SEO',
    geoBonus: 'Бонус: проверили GEO',
    seoExpressLabel: 'Экспресс-диагностика · 8 параметров',
    geoExpressLabel: 'Экспресс-диагностика · 5 параметров',
    issues: 'проблем',
    getFullAudit: 'Получить полный аудит',
    tryAnother: 'Проверить другой сайт',
    errorTitle: 'Ошибка проверки',
    errorTimeout: 'Сайт не отвечает. Проверьте URL или попробуйте позже.',
    errorServer: 'Сервер временно недоступен. Попробуйте позже.',
    errorNetwork: 'Не удалось подключиться. Проверьте интернет-соединение.',
    tryAgain: 'Попробовать снова',
    slowSite: 'Сайт отвечает медленно, ждём...',
    invalidUrl: 'Введите корректный адрес сайта (например, https://myhotel.ru)',
  },
  en: {
    title: 'Check your website',
    subtitleSeo: 'Free SEO check. See how search engines see you.',
    subtitleGeo: 'Free GEO check. See how AI sees you.',
    placeholder: 'https://myhotel.com',
    button: 'Check',
    free: 'Free · No registration',
    scanning: 'Scanning',
    seoSteps: {
      connect: 'Connecting',
      robots: 'robots.txt',
      sitemap: 'sitemap.xml',
      schema: 'Schema.org',
      meta: 'Meta tags',
    },
    geoSteps: {
      connect: 'Connecting',
      llms: 'LLM Files',
      schema: 'Schema.org',
      faq: 'FAQ / Q&A',
      eeat: 'E-E-A-T signals',
    },
    seoScore: 'SEO Score',
    geoScore: 'GEO Score',
    seoProblems: 'How to improve SEO',
    geoProblems: 'How to improve GEO',
    seoBonus: 'Bonus: checked SEO',
    geoBonus: 'Bonus: checked GEO',
    seoExpressLabel: 'Express check · 8 parameters',
    geoExpressLabel: 'Express check · 5 parameters',
    issues: 'issues',
    getFullAudit: 'Get full audit',
    tryAnother: 'Check another site',
    errorTitle: 'Check failed',
    errorTimeout: 'Site not responding. Check URL or try later.',
    errorServer: 'Server temporarily unavailable. Try later.',
    errorNetwork: 'Connection failed. Check your internet.',
    tryAgain: 'Try again',
    slowSite: 'Site is responding slowly, please wait...',
    invalidUrl: 'Enter a valid website address (e.g., https://myhotel.com)',
  },
};

function isValidDomain(input: string): boolean {
  try {
    const normalized = input.includes('://') ? input : `https://${input}`;
    const parsed = new URL(normalized);
    if (!['http:', 'https:'].includes(parsed.protocol)) return false;
    if (['localhost', '127.0.0.1', '0.0.0.0'].includes(parsed.hostname)) return false;
    if (/^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/.test(parsed.hostname)) return false;
    if (!/\./.test(parsed.hostname)) return false;
    return true;
  } catch {
    return false;
  }
}

// Circular score indicator
const CircularScore: React.FC<{
  score: number;
  status: 'critical' | 'warning' | 'good' | 'excellent';
  size: 'large' | 'small';
  label: string;
  statusLabel: string;
}> = ({ score, status, size, label, statusLabel }) => {
  const radius = size === 'large' ? 54 : 40;
  const strokeWidth = size === 'large' ? 6 : 5;
  const viewBox = size === 'large' ? 120 : 90;
  const center = viewBox / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const statusColors = {
    critical: '#dc2626',
    warning: '#d97706',
    good: '#16a34a',
    excellent: '#15803d',
  };

  return (
    <div className={`flex flex-col items-center ${size === 'large' ? '' : 'opacity-90'}`}>
      <div className={`relative ${size === 'large' ? 'w-28 h-28 sm:w-32 sm:h-32' : 'w-20 h-20 sm:w-24 sm:h-24'}`}>
        <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${viewBox} ${viewBox}`}>
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#e4e4e7"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke={statusColors[status]}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-black ${size === 'large' ? 'text-3xl sm:text-4xl' : 'text-xl sm:text-2xl'}`}>{score}</span>
          <span className={`text-zinc-400 ${size === 'large' ? 'text-xs sm:text-sm' : 'text-[10px] sm:text-xs'}`}>/100</span>
        </div>
      </div>
      <p className={`mt-2 font-bold ${size === 'large' ? 'text-base' : 'text-sm'}`}>{label}</p>
      <p className={`text-sm ${
        status === 'critical' ? 'text-red-600' :
        status === 'warning' ? 'text-amber-600' :
        'text-green-600'
      }`}>{statusLabel}</p>
    </div>
  );
};

// Helper to add tooltip to technical terms
const addTooltips = (text: string, lang: Lang): React.ReactNode => {
  const langTooltips = tooltips[lang];
  const terms = Object.keys(langTooltips);

  for (const term of terms) {
    if (text.includes(term)) {
      const parts = text.split(term);
      return (
        <>
          {parts[0]}
          <span
            className="underline decoration-dotted cursor-help"
            title={langTooltips[term]}
          >
            {term}
          </span>
          {parts.slice(1).join(term)}
        </>
      );
    }
  }
  return text;
};

// Collapsible issues list
const IssuesList: React.FC<{
  title: string;
  issues: { severity: string; title: string; description: string }[];
  defaultExpanded: boolean;
  lang: Lang;
}> = ({ title, issues, defaultExpanded, lang }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const severityIcons: Record<string, string> = {
    critical: '🔴',
    warning: '🟡',
    info: '💡',
    success: '✅',
  };

  if (issues.length === 0) return null;

  return (
    <div className="border border-zinc-100 rounded-lg overflow-hidden bg-white">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex justify-between items-center text-left hover:bg-zinc-50 transition-colors"
      >
        <span className="font-bold text-sm">{title}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400">{issues.length}</span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-zinc-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-zinc-400" />
          )}
        </div>
      </button>
      {expanded && (
        <div className="border-t border-zinc-100 divide-y divide-zinc-100">
          {issues.map((issue, i) => (
            <div key={i} className="px-4 py-3">
              <div className="flex items-start gap-2">
                <span>{severityIcons[issue.severity] || '💡'}</span>
                <div>
                  <p className="font-medium text-sm">{addTooltips(issue.title, lang)}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{issue.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Main component
export const HealthScoreChecker: React.FC<Props> = ({ lang, primary, ctaUrl }) => {
  const [state, setState] = useState<CheckerState>('idle');
  const [url, setUrl] = useState('');
  const [checkedDomain, setCheckedDomain] = useState('');
  const [result, setResult] = useState<CombinedHealthScore | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanSteps, setScanSteps] = useState<ScanStep[]>([]);
  const [progress, setProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [isSlow, setIsSlow] = useState(false);

  const t = translations[lang];

  const handleScan = async () => {
    if (!url.trim() || isScanning) return;
    if (!isValidDomain(url)) {
      setState('error');
      setError('invalid_url');
      return;
    }
    setIsScanning(true);

    setState('loading');
    setError(null);
    setIsSlow(false);

    // Track scan start
    analytics.healthScoreStart(primary, url);
    setProgress(0);

    const stepLabels = primary === 'seo' ? t.seoSteps : t.geoSteps;
    const steps: ScanStep[] = [
      { label: stepLabels.connect, status: 'active' },
      { label: primary === 'seo' ? stepLabels.robots : stepLabels.llms, status: 'pending' },
      { label: primary === 'seo' ? stepLabels.sitemap : stepLabels.schema, status: 'pending' },
      { label: primary === 'seo' ? stepLabels.schema : stepLabels.faq, status: 'pending' },
      { label: primary === 'seo' ? stepLabels.meta : stepLabels.eeat, status: 'pending' },
    ];
    setScanSteps(steps);

    const updateStep = (index: number) => {
      setScanSteps(prev => prev.map((step, i) => ({
        ...step,
        status: i < index ? 'done' : i === index ? 'active' : 'pending',
      })));
      setProgress(Math.round((index / steps.length) * 100));
    };

    // Fetch with 25s timeout (increased for slow sites)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    // Show "slow site" message after 10s
    const slowTimeoutId = setTimeout(() => setIsSlow(true), 10000);

    try {
      const stepDelay = (ms: number) => new Promise(r => setTimeout(r, ms));

      const fetchPromise = fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: url }),
        signal: controller.signal,
      });

      await stepDelay(1600); updateStep(1);
      await stepDelay(1600); updateStep(2);
      await stepDelay(1600); updateStep(3);
      await stepDelay(1600); updateStep(4);

      const response = await fetchPromise;

      if (!response.ok) throw new Error('server_error');

      const data: FetchedData = await response.json();

      updateStep(5);
      setProgress(100);
      await stepDelay(1200);

      setCheckedDomain(data.domain);
      const scoreResult = calculateCombinedScore(data, lang);
      setResult(scoreResult);
      setState('result');

      // Track successful completion
      analytics.healthScoreComplete(primary, data.domain, scoreResult.seo.total, scoreResult.geo.total);

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'unknown';
      let errorType = 'network_error';
      if (errorMsg === 'AbortError' || err instanceof DOMException) {
        errorType = 'timeout';
        setError('timeout');
      } else if (errorMsg === 'server_error') {
        errorType = 'server_error';
        setError('server_error');
      } else {
        setError('network_error');
      }
      setState('error');

      // Track error
      analytics.healthScoreError(primary, errorType);
    } finally {
      clearTimeout(timeoutId);
      clearTimeout(slowTimeoutId);
      setIsScanning(false);
    }
  };

  const handleReset = () => {
    setState('idle');
    setUrl('');
    setResult(null);
    setError(null);
  };

  // Determine which score is primary/secondary
  const primaryScore = primary === 'seo' ? result?.seo : result?.geo;
  const secondaryScore = primary === 'seo' ? result?.geo : result?.seo;
  const primaryLabel = primary === 'seo' ? t.seoScore : t.geoScore;
  const secondaryLabel = primary === 'seo' ? t.geoScore : t.seoScore;
  const primaryProblems = primary === 'seo' ? t.seoProblems : t.geoProblems;
  const secondaryProblems = primary === 'seo' ? t.geoProblems : t.seoProblems;
  const secondaryBonus = primary === 'seo' ? t.geoBonus : t.seoBonus;

  // Render IDLE state
  const renderIdle = () => (
    <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-6 md:p-8">
      <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-300 mb-4">
        Health Score
      </p>
      <h3 className="text-2xl md:text-3xl font-black tracking-tight mb-3">
        {t.title}
      </h3>
      <p className="text-base md:text-lg text-zinc-500 font-light mb-6">
        {primary === 'seo' ? t.subtitleSeo : t.subtitleGeo}
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={t.placeholder}
          className="flex-1 px-4 py-3 border border-zinc-200 rounded-lg focus:outline-none focus:border-black transition-colors"
          onKeyDown={(e) => e.key === 'Enter' && handleScan()}
        />
        <button
          onClick={handleScan}
          disabled={!url.trim() || isScanning}
          className="px-6 py-3 border-2 border-black font-bold uppercase tracking-wide hover:bg-black hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isScanning ? '...' : t.button}
        </button>
      </div>
      <p className="text-sm text-zinc-400 mt-4 text-center sm:text-left">
        {t.free}
      </p>
    </div>
  );

  // Render LOADING state
  const renderLoading = () => (
    <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-6 md:p-8">
      <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-300 mb-4">
        {t.scanning}
      </p>
      <h3 className="text-xl font-black tracking-tight mb-6">
        {url.replace(/^https?:\/\//, '').split('/')[0]}
      </h3>
      <div className="space-y-2 mb-6">
        {scanSteps.map((step, i) => (
          <div key={i} className="flex items-center gap-3">
            {step.status === 'done' && <span className="text-green-500 text-sm">✓</span>}
            {step.status === 'active' && (
              <span className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
            )}
            {step.status === 'pending' && (
              <span className="w-3 h-3 rounded-full border border-zinc-200" />
            )}
            <span className={`text-sm ${
              step.status === 'done' ? 'text-zinc-400' :
              step.status === 'active' ? 'text-black font-medium' :
              'text-zinc-300'
            }`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
      <div className="h-1 bg-zinc-200 rounded-full overflow-hidden">
        <div className="h-full bg-black transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>
      {isSlow && (
        <p className="text-sm text-amber-600 mt-4 text-center animate-pulse">
          {t.slowSite}
        </p>
      )}
    </div>
  );

  // Render RESULT state
  const renderResult = () => {
    if (!result || !primaryScore || !secondaryScore) return null;

    return (
      <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-6 md:p-8">
        <div className="flex justify-between items-start mb-2">
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-300">
            Health Score
          </p>
          <p className="text-sm font-medium text-zinc-600 truncate max-w-[200px]">
            {checkedDomain}
          </p>
        </div>
        <p className="text-xs text-zinc-400 mb-6">{primary === 'seo' ? t.seoExpressLabel : t.geoExpressLabel}</p>

        {/* Two circles */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 sm:gap-6 md:gap-12 mb-6 sm:mb-8">
          <CircularScore
            score={primaryScore.total}
            status={primaryScore.status}
            size="large"
            label={primaryLabel}
            statusLabel={primaryScore.statusLabel}
          />
          <div className="hidden md:block w-px h-24 bg-zinc-200" />
          <div className="md:hidden w-24 h-px bg-zinc-200" />
          <div className="text-center md:text-left">
            <p className="text-xs text-zinc-400 mb-2">{secondaryBonus}</p>
            <CircularScore
              score={secondaryScore.total}
              status={secondaryScore.status}
              size="small"
              label={secondaryLabel}
              statusLabel={secondaryScore.statusLabel}
            />
          </div>
        </div>

        {/* Issues lists */}
        <div className="space-y-3 mb-6">
          <IssuesList
            title={primaryProblems}
            issues={primaryScore.issues}
            defaultExpanded={true}
            lang={lang}
          />
          <IssuesList
            title={secondaryProblems}
            issues={secondaryScore.issues}
            defaultExpanded={false}
            lang={lang}
          />
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <a
            href={ctaUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => analytics.healthScoreCta(primary, checkedDomain, result?.seo.total, result?.geo.total)}
            className="block w-full text-center py-3 sm:py-4 border-2 border-black font-bold uppercase tracking-wide hover:bg-black hover:text-white transition-all text-xs sm:text-sm"
          >
            {t.getFullAudit} →
          </a>
          <button
            onClick={handleReset}
            className="w-full text-sm text-zinc-400 hover:text-black transition-colors"
          >
            {t.tryAnother}
          </button>
        </div>
      </div>
    );
  };

  // Render ERROR state
  const renderError = () => {
    const errorMessage = error === 'invalid_url' ? t.invalidUrl
      : error === 'timeout' ? t.errorTimeout
      : error === 'server_error' ? t.errorServer
      : t.errorNetwork;

    return (
      <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-6 md:p-8 text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-red-400 mb-4">
          {t.errorTitle}
        </p>
        <p className="text-zinc-500 mb-6">{errorMessage}</p>
        <button
          onClick={handleReset}
          className="px-6 py-3 border-2 border-black font-bold uppercase tracking-wide hover:bg-black hover:text-white transition-all"
        >
          {t.tryAgain}
        </button>
      </div>
    );
  };

  return (
    <div id="health-score" className="mb-12 scroll-mt-24">
      {state === 'idle' && renderIdle()}
      {state === 'loading' && renderLoading()}
      {state === 'result' && renderResult()}
      {state === 'error' && renderError()}
    </div>
  );
};
