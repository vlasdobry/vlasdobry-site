import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp, AlertTriangle, Info } from 'lucide-react';
import { useI18n } from '../i18n';
import { LanguageSwitcher } from './LanguageSwitcher';
import { analytics } from '../utils/analytics';
import { calculateComplianceScore } from '../utils/compliance';
import type { ComplianceScore, ComplianceCategory } from '../utils/compliance/types';

interface Props {
  basePath: string;
}

const WORKER_URL = import.meta.env.DEV
  ? '/api/compliance'
  : 'https://health-score-proxy.vlasdobry.workers.dev/api/compliance';

type CheckerState = 'idle' | 'loading' | 'result' | 'error';

interface ScanStep {
  label: string;
  status: 'pending' | 'active' | 'done';
}

const CATEGORY_ORDER: ComplianceCategory[] = [
  'buttons', 'headings', 'navigation', 'forms', 'subheadings', 'policies', 'meta',
];

const CATEGORY_SEVERITY: Record<ComplianceCategory, string> = {
  buttons: 'critical',
  headings: 'critical',
  navigation: 'important',
  forms: 'important',
  subheadings: 'medium',
  policies: 'medium',
  meta: 'info',
};

const ELEMENT_LABELS: Record<string, Record<string, string>> = {
  button: { ru: 'Кнопка', en: 'Button' },
  input: { ru: 'Поле ввода', en: 'Input field' },
  a: { ru: 'Ссылка', en: 'Link' },
  h1: { ru: 'Заголовок H1', en: 'H1 heading' },
  h2: { ru: 'Заголовок H2', en: 'H2 heading' },
  h3: { ru: 'Заголовок H3', en: 'H3 heading' },
  h4: { ru: 'Подзаголовок', en: 'Subheading' },
  h5: { ru: 'Подзаголовок', en: 'Subheading' },
  h6: { ru: 'Подзаголовок', en: 'Subheading' },
  label: { ru: 'Подпись формы', en: 'Form label' },
  option: { ru: 'Вариант выбора', en: 'Select option' },
  title: { ru: 'Заголовок страницы', en: 'Page title' },
  meta: { ru: 'Мета-описание', en: 'Meta description' },
};

function getElementLabel(element: string, lang: 'ru' | 'en'): string {
  return ELEMENT_LABELS[element]?.[lang] || element;
}

const HISTORY_KEY = 'compliance_checked_urls';
const HISTORY_MAX = 5;

function getHistory(): string[] {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); }
  catch { return []; }
}

function saveToHistory(url: string) {
  const history = getHistory().filter(u => u !== url);
  history.unshift(url);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, HISTORY_MAX)));
}

function normalizeUrl(input: string): string {
  let url = input.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

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

// Score circle (same pattern as HealthScoreChecker)
const ScoreCircle: React.FC<{
  score: number;
  status: 'compliant' | 'warnings' | 'non-compliant';
  statusLabel: string;
  label: string;
}> = ({ score, status, statusLabel, label }) => {
  const radius = 54;
  const strokeWidth = 6;
  const viewBox = 120;
  const center = viewBox / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color = status === 'compliant' ? '#22c55e'
    : status === 'warnings' ? '#eab308'
    : '#ef4444';

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28 sm:w-32 sm:h-32">
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
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-black text-3xl sm:text-4xl">{score}</span>
          <span className="text-zinc-400 text-xs sm:text-sm">/100</span>
        </div>
      </div>
      <p className="mt-2 font-bold text-base">{label}</p>
      <p className={`text-sm ${
        status === 'compliant' ? 'text-green-600'
        : status === 'warnings' ? 'text-amber-600'
        : 'text-red-600'
      }`}>{statusLabel}</p>
    </div>
  );
};

export const ComplianceChecker: React.FC<Props> = ({ basePath }) => {
  const { t, lang } = useI18n();
  const [state, setState] = useState<CheckerState>('idle');
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<ComplianceScore | null>(null);
  const [checkedDomain, setCheckedDomain] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [scanSteps, setScanSteps] = useState<ScanStep[]>([]);
  const [progress, setProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [isSlow, setIsSlow] = useState(false);
  const [history, setHistory] = useState(getHistory);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [isScrolled, setIsScrolled] = useState(false);

  const controllerRef = useRef<AbortController | null>(null);

  const ct = t.compliance;
  const landingUrl = lang === 'ru' ? '/#landing' : '/en/#landing';
  const blogUrl = lang === 'ru'
    ? '/blog/168-fz-zakon-o-russkom-yazyke-sayt/'
    : '/en/blog/168-fz-zakon-o-russkom-yazyke-sayt/';
  const seoUrl = lang === 'ru' ? '/services/seo/' : '/en/services/seo/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

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

    const domain = normalizeUrl(url);
    analytics.complianceStart(domain);
    setProgress(0);

    const steps: ScanStep[] = ct.scanning.steps.map((label, i) => ({
      label,
      status: i === 0 ? 'active' as const : 'pending' as const,
    }));
    setScanSteps(steps);

    const updateStep = (index: number) => {
      setScanSteps(prev => prev.map((step, i) => ({
        ...step,
        status: i < index ? 'done' : i === index ? 'active' : 'pending',
      })));
      setProgress(Math.round((index / steps.length) * 100));
    };

    const controller = new AbortController();
    controllerRef.current = controller;
    const timeoutId = setTimeout(() => controller.abort(), 25000);
    const slowTimeoutId = setTimeout(() => setIsSlow(true), 10000);

    try {
      const stepDelay = (ms: number) => new Promise(r => setTimeout(r, ms));

      const inputUrl = url.trim().match(/^https?:\/\//) ? url.trim() : `https://${url.trim()}`;

      const fetchPromise = fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: inputUrl }),
        signal: controller.signal,
      });

      await stepDelay(1600); updateStep(1);
      await stepDelay(1600); updateStep(2);
      await stepDelay(1600); updateStep(3);
      await stepDelay(1600); updateStep(4);

      const response = await fetchPromise;
      if (!response.ok) throw new Error('server_error');

      const data = await response.json();

      // Worker returned an error from the target site (HTTP 403, redirect loop, etc.)
      if (data.error) {
        throw new Error(data.error.includes('403') ? 'blocked' : 'server_error');
      }

      updateStep(5);
      setProgress(100);
      await stepDelay(1200);

      const fullUrl = url.trim().match(/^https?:\/\//) ? url.trim() : `https://${url.trim()}`;
      saveToHistory(fullUrl);
      setHistory(getHistory());

      const scoreResult = calculateComplianceScore(data, lang);
      setResult(scoreResult);
      setCheckedDomain(domain);
      setState('result');

      // Expand first category with findings by default
      const firstCat = CATEGORY_ORDER.find(cat => scoreResult.categoryCounts[cat] > 0);
      if (firstCat) setExpandedCategories(new Set([firstCat]));

      analytics.complianceComplete(domain, scoreResult.total, scoreResult.findings.length);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'unknown';
      let errorType = 'network_error';
      if (err instanceof DOMException && err.name === 'AbortError') {
        errorType = 'timeout';
        setError('timeout');
      } else if (errorMsg === 'blocked') {
        errorType = 'blocked';
        setError('blocked');
      } else if (errorMsg === 'server_error') {
        errorType = 'server_error';
        setError('server_error');
      } else {
        setError('network_error');
      }
      setState('error');

      const fullUrl = url.trim().match(/^https?:\/\//) ? url.trim() : `https://${url.trim()}`;
      saveToHistory(fullUrl);
      setHistory(getHistory());

      analytics.complianceError(errorType);
    } finally {
      clearTimeout(timeoutId);
      clearTimeout(slowTimeoutId);
      setIsScanning(false);
      controllerRef.current = null;
    }
  };

  const handleReset = () => {
    setState('idle');
    setUrl('');
    setResult(null);
    setError(null);
    setExpandedCategories(new Set());
  };

  const totalFindings = result?.findings.length ?? 0;

  // Build Telegram pre-filled message
  const tgMessage = result ? (
    lang === 'ru'
      ? `Привет! Проверил сайт ${checkedDomain} на 168-ФЗ — ${totalFindings} элементов на латинице (${result.total}/100). Поможете с исправлениями?`
      : `Hi! Checked ${checkedDomain} for 168-FZ compliance — ${totalFindings} Latin-script elements (${result.total}/100). Can you help fix this?`
  ) : '';

  // ==================== IDLE ====================
  const renderIdle = () => (
    <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-6 md:p-8">
      <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-300 mb-4">
        168-FZ
      </p>
      <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-3">
        {ct.hero.title}
      </h2>
      <p className="text-base md:text-lg text-zinc-500 font-light mb-2">
        {ct.hero.subtitle}
      </p>
      <p className="text-sm text-zinc-400 font-light mb-6">
        {ct.hero.description}
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          name="compliance-url"
          list="compliance-history"
          autoComplete="on"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={ct.input.placeholder}
          className="flex-1 px-4 py-3 border border-zinc-200 rounded-lg focus:outline-none focus:border-black transition-colors"
          onKeyDown={(e) => e.key === 'Enter' && handleScan()}
        />
        <datalist id="compliance-history">
          {history.map(u => <option key={u} value={u} />)}
        </datalist>
        <button
          onClick={handleScan}
          disabled={!url.trim() || isScanning}
          className="px-6 py-3 border-2 border-black font-bold uppercase tracking-wide hover:bg-black hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isScanning ? ct.input.checking : ct.input.button}
        </button>
      </div>
    </div>
  );

  // ==================== LOADING ====================
  const renderLoading = () => (
    <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-6 md:p-8">
      <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-300 mb-4">
        168-FZ
      </p>
      <h3 className="text-xl font-black tracking-tight mb-6">
        {url.replace(/^https?:\/\//, '').split('/')[0]}
      </h3>
      <div className="space-y-2 mb-6">
        {scanSteps.map((step, i) => (
          <div key={i} className="flex items-center gap-3">
            {step.status === 'done' && <span className="text-green-500 text-sm">&#10003;</span>}
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
          {ct.scanning.slow}
        </p>
      )}
    </div>
  );

  // ==================== RESULT ====================
  const renderResult = () => {
    if (!result) return null;

    // SPA: limited analysis — show different UI
    if (result.isSPA) {
      const tgSpaMessage = lang === 'ru'
        ? `Привет! Проверил ${checkedDomain} на 168-ФЗ, но сайт использует JS-рендеринг. Нужна ручная проверка.`
        : `Hi! Checked ${checkedDomain} for 168-FZ, but the site uses JS rendering. Need a manual review.`;
      const tgSpaHref = `https://t.me/vlasdobry?text=${encodeURIComponent(tgSpaMessage)}`;

      return (
        <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-6 md:p-8">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-300">
              168-FZ
            </p>
            <p className="text-sm font-medium text-zinc-600 truncate max-w-[200px]">
              {checkedDomain}
            </p>
          </div>

          {/* Amber status instead of score circle */}
          <div className="flex justify-center my-6 sm:my-8">
            <div className="flex flex-col items-center">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-[6px] border-amber-300 flex items-center justify-center">
                <AlertTriangle className="w-12 h-12 text-amber-500" />
              </div>
              <p className="mt-2 font-bold text-base">{ct.results.spaTitle}</p>
              <p className="text-sm text-amber-600">JavaScript-rendered</p>
            </div>
          </div>

          {/* Explanation */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-amber-700 mb-2">{ct.results.spa}</p>
            <p className="text-sm text-amber-800 font-medium">{ct.results.spaAction}</p>
          </div>

          {/* Show any findings that were found (even partial) */}
          {totalFindings > 0 && (
            <p className="text-center text-sm text-zinc-500 mb-4">
              {ct.results.found} {totalFindings} {ct.results.elements}
            </p>
          )}

          {/* CTA — always lead to Telegram for SPA */}
          <div className="space-y-3">
            <a
              href={tgSpaHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => analytics.complianceCta(checkedDomain, -1)}
              className="block w-full text-center py-3 sm:py-4 border-2 border-black font-bold uppercase tracking-wide hover:bg-black hover:text-white transition-all text-xs sm:text-sm"
            >
              {ct.cta.warnings.action} &rarr;
            </a>
            <button
              onClick={handleReset}
              className="w-full text-sm text-zinc-400 hover:text-black transition-colors"
            >
              {ct.errors.checkAnother}
            </button>
          </div>

          <p className="text-xs text-zinc-400 mt-6 leading-relaxed">
            {ct.results.disclaimer}
          </p>
        </div>
      );
    }

    const findingsByCategory = CATEGORY_ORDER
      .filter(cat => result.categoryCounts[cat] > 0)
      .map(cat => ({
        category: cat,
        findings: result.findings.filter(f => f.category === cat),
        count: result.categoryCounts[cat],
        severity: CATEGORY_SEVERITY[cat],
        label: ct.results.categories[cat],
        severityLabel: ct.results.severities[CATEGORY_SEVERITY[cat] as keyof typeof ct.results.severities],
      }));

    const ctaConfig = result.total >= 80 ? ct.cta.compliant
      : result.total >= 40 ? ct.cta.warnings
      : ct.cta.nonCompliant;

    const ctaHref = result.total >= 80
      ? seoUrl
      : `https://t.me/vlasdobry?text=${encodeURIComponent(tgMessage)}`;

    return (
      <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-6 md:p-8">
        <div className="flex justify-between items-start mb-2">
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-300">
            168-FZ
          </p>
          <p className="text-sm font-medium text-zinc-600 truncate max-w-[200px]">
            {checkedDomain}
          </p>
        </div>

        {/* Score circle */}
        <div className="flex justify-center my-6 sm:my-8">
          <ScoreCircle
            score={result.total}
            status={result.status}
            statusLabel={result.statusLabel}
            label={`${ct.results.score}: ${result.total}/100`}
          />
        </div>

        {/* Found count */}
        {totalFindings > 0 ? (
          <p className="text-center text-sm text-zinc-500 mb-4">
            {ct.results.found} {totalFindings} {ct.results.elements}
          </p>
        ) : (
          <p className="text-center text-sm text-green-600 mb-4">
            {ct.results.noIssues}
          </p>
        )}

        {/* Categories */}
        {findingsByCategory.length > 0 && (
          <div className="space-y-3 mb-6">
            {findingsByCategory.map(({ category, findings, count, severity, label, severityLabel }) => {
              const isExpanded = expandedCategories.has(category);
              const severityColor = severity === 'critical' ? 'text-red-600'
                : severity === 'important' ? 'text-amber-600'
                : severity === 'medium' ? 'text-zinc-500'
                : 'text-blue-500';

              return (
                <div key={category} className="border border-zinc-100 rounded-lg overflow-hidden bg-white">
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full px-4 py-3 flex justify-between items-center text-left hover:bg-zinc-50 transition-colors"
                  >
                    <span className="font-bold text-sm">
                      {label} ({count}) <span className={`font-normal ${severityColor}`}>&mdash; {severityLabel}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-zinc-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-zinc-400" />
                      )}
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="border-t border-zinc-100 divide-y divide-zinc-100">
                      {findings.map((finding, i) => (
                        <div key={i} className="px-4 py-3">
                          <div className="flex items-start gap-2">
                            {category === 'meta'
                              ? <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                              : <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                            }
                            <div>
                              <p className="font-medium text-sm">{finding.text}</p>
                              <p className="text-xs text-zinc-500 mt-0.5">
                                {category === 'meta' ? ct.results.recommendation : getElementLabel(finding.element, lang)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* CTA */}
        <div className="space-y-3">
          <a
            href={ctaHref}
            target={result.total >= 80 ? undefined : '_blank'}
            rel={result.total >= 80 ? undefined : 'noopener noreferrer'}
            onClick={() => analytics.complianceCta(checkedDomain, result.total)}
            className="block w-full text-center py-3 sm:py-4 border-2 border-black font-bold uppercase tracking-wide hover:bg-black hover:text-white transition-all text-xs sm:text-sm"
          >
            {ctaConfig.text} &rarr;
          </a>
          <a
            href={ctaHref}
            target={result.total >= 80 ? undefined : '_blank'}
            rel={result.total >= 80 ? undefined : 'noopener noreferrer'}
            onClick={() => analytics.complianceCta(checkedDomain, result.total)}
            className="block w-full text-center py-2 text-sm font-bold text-zinc-500 hover:text-black transition-colors"
          >
            {ctaConfig.action}
          </a>
          <button
            onClick={handleReset}
            className="w-full text-sm text-zinc-400 hover:text-black transition-colors"
          >
            {ct.errors.checkAnother}
          </button>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-zinc-400 mt-6 leading-relaxed">
          {ct.results.disclaimer}
        </p>
      </div>
    );
  };

  // ==================== ERROR ====================
  const renderError = () => {
    const errorMessage = error === 'invalid_url' ? ct.errors.invalidUrl
      : error === 'timeout' ? ct.errors.timeout
      : error === 'blocked' ? ct.errors.blocked
      : error === 'server_error' ? ct.errors.serverError
      : ct.errors.networkError;

    const showTgCta = error !== 'invalid_url';
    const domain = normalizeUrl(url);
    const tgErrorMessage = lang === 'ru'
      ? `Привет! Хочу проверить сайт ${domain} на 168-ФЗ, но автоматическая проверка не сработала. Можете проверить вручную?`
      : `Hi! Want to check ${domain} for 168-FZ compliance, but the automated check failed. Can you do a manual review?`;

    return (
      <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-6 md:p-8 text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-red-400 mb-4">
          {ct.errors.title}
        </p>
        <p className="text-zinc-500 mb-6">{errorMessage}</p>
        <div className="space-y-3">
          <button
            onClick={handleReset}
            className="w-full px-6 py-3 border-2 border-black font-bold uppercase tracking-wide hover:bg-black hover:text-white transition-all"
          >
            {ct.errors.tryAgain}
          </button>
          {showTgCta && (
            <a
              href={`https://t.me/vlasdobry?text=${encodeURIComponent(tgErrorMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => analytics.complianceCta(domain, -1)}
              className="block w-full text-center py-2 text-sm font-bold text-zinc-500 hover:text-black transition-colors"
            >
              {ct.cta.warnings.action} &rarr;
            </a>
          )}
        </div>
      </div>
    );
  };

  // ==================== ABOUT SECTION ====================
  const renderAbout = () => (
    <div className="mt-12 border border-zinc-100 rounded-lg p-6">
      <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-300 mb-4">
        {ct.about.title}
      </h3>
      <p className="text-sm text-zinc-600 font-light leading-relaxed mb-4">
        {ct.about.text}
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <a
          href={blogUrl}
          className="text-sm font-bold text-zinc-500 hover:text-black transition-colors"
        >
          {ct.about.blogLink}
        </a>
        <a
          href={seoUrl}
          className="text-sm font-bold text-zinc-500 hover:text-black transition-colors"
        >
          {ct.about.seoLink}
        </a>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-white text-[#121212]">
      {/* Sticky Navigation */}
      <nav className={`sticky top-0 z-50 border-b transition-all duration-500 ease-out ${
        isScrolled
          ? 'bg-white/80 backdrop-blur-lg border-zinc-100'
          : 'bg-white border-transparent'
      }`}>
        <div className={`max-w-5xl mx-auto px-6 sm:px-12 flex justify-between items-center transition-all duration-500 ease-out ${
          isScrolled ? 'py-3' : 'py-6'
        }`}>
          <div className="flex items-center gap-6">
            <a href={landingUrl} className="text-2xl font-black tracking-tighter hover:opacity-70 transition-opacity">
              VD.
            </a>
            <LanguageSwitcher basePath={basePath} />
          </div>
          <a
            href={landingUrl}
            className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-400 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            {ct.nav.backToMain}
          </a>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 sm:px-12 py-8 md:py-12">
        {/* Checker widget */}
        <div className="mb-12 scroll-mt-24">
          {state === 'idle' && renderIdle()}
          {state === 'loading' && renderLoading()}
          {state === 'result' && renderResult()}
          {state === 'error' && renderError()}
        </div>

        {/* About section */}
        {renderAbout()}
      </div>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-6 sm:px-12 pt-16 pb-24 border-t border-zinc-100">
        <div className="flex flex-col md:flex-row justify-between gap-12">
          <div>
            <h4 className="text-2xl font-bold">{ct.footer.name}</h4>
            <p className="text-zinc-400 text-sm font-light mt-1">{ct.footer.role}</p>
            <a href="tel:+79068972037" onClick={() => analytics.clickPhone('compliance')} className="block mt-4 text-2xl font-bold hover:text-zinc-500 transition-colors">+7 906 897-20-37</a>
            <div className="flex gap-6 mt-4 text-[11px] font-bold tracking-[0.4em] uppercase text-zinc-400">
              <a href="https://t.me/vlasdobry" target="_blank" rel="noopener noreferrer" onClick={() => analytics.clickTelegram('compliance_footer')} className="hover:text-black">{ct.footer.links.telegram}</a>
              <a href="https://wa.me/79068972037" target="_blank" rel="noopener noreferrer" onClick={() => analytics.clickWhatsapp('compliance_footer')} className="hover:text-black">{ct.footer.links.whatsapp}</a>
              <a href="mailto:vlasdobry@gmail.com" onClick={() => analytics.clickEmail('compliance_footer')} className="hover:text-black">{ct.footer.links.email}</a>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-8 md:gap-12">
            <div>
              <h5 className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-300 mb-3">{t.landing.footer.nav.offers.label}</h5>
              <div className="border-t border-zinc-100 mb-3"></div>
              <ul className="space-y-2">
                {t.landing.footer.nav.offers.items.map((item) => (
                  <li key={item.url}>
                    <a href={item.url} className="text-sm text-zinc-500 hover:text-black transition-colors">{item.name}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-300 mb-3">{t.landing.footer.nav.services.label}</h5>
              <div className="border-t border-zinc-100 mb-3"></div>
              <ul className="space-y-2">
                {t.landing.footer.nav.services.items.map((item) => (
                  <li key={item.url}>
                    <a href={item.url} className="text-sm text-zinc-500 hover:text-black transition-colors">{item.name}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <p className="text-zinc-300 text-sm mt-12">&copy; {new Date().getFullYear()} {ct.footer.name}</p>
      </footer>
    </main>
  );
};
