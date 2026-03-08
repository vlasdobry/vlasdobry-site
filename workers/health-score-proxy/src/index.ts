import { isWhitelisted, stripHtmlEntities } from './compliance-whitelist';

export interface Env {
  ALLOWED_ORIGINS: string;
  RATE_LIMIT_REQUESTS?: string;
  RATE_LIMIT_WINDOW_SEC?: string;
}

interface FetchResult {
  url: string;
  status: number;
  content: string | null;
  error: string | null;
  responseTime: number;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// --- Compliance types ---

type ComplianceSeverity = 'critical' | 'important' | 'medium' | 'info';

interface ComplianceFinding {
  text: string;
  element: string;
  severity: ComplianceSeverity;
  category: string;
}

interface ComplianceResult {
  url: string;
  findings: ComplianceFinding[];
  isSPA: boolean;
  error: string | null;
}

const RATE_LIMIT_STORE = new Map<string, RateLimitEntry>();

const DEFAULT_RATE_LIMIT_REQUESTS = 20;
const DEFAULT_RATE_LIMIT_WINDOW_SEC = 60;
const MAX_CONTENT_SIZE = 50_000;
const REQUEST_TIMEOUT_MS = 10_000;
const MAX_REDIRECTS = 3;

// Latin detection: 2+ consecutive Latin characters
const LATIN_RE = /[a-zA-Z]{2,}/;

// Policy-related keywords for footer link classification
const POLICY_KEYWORDS = /policy|terms|privacy|conditions|cookie/i;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const allowedOrigins = parseAllowedOrigins(env.ALLOWED_ORIGINS);
    const origin = request.headers.get('Origin') || '';
    const isAllowedOrigin = origin !== '' && allowedOrigins.includes(origin);

    const corsHeaders = buildCorsHeaders({
      allowedOrigins,
      origin,
      isAllowedOrigin,
    });

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    if (!isAllowedOrigin) {
      return Response.json(
        { error: 'Origin not allowed' },
        { status: 403, headers: corsHeaders }
      );
    }

    const maxRequests = parsePositiveInt(env.RATE_LIMIT_REQUESTS, DEFAULT_RATE_LIMIT_REQUESTS, 1, 200);
    const windowSec = parsePositiveInt(env.RATE_LIMIT_WINDOW_SEC, DEFAULT_RATE_LIMIT_WINDOW_SEC, 10, 600);
    const clientIp = request.headers.get('CF-Connecting-IP') || 'unknown';

    if (isRateLimited(clientIp, maxRequests, windowSec * 1000)) {
      return Response.json(
        { error: 'Too many requests' },
        { status: 429, headers: corsHeaders }
      );
    }

    // --- URL-based routing ---
    const requestUrl = new URL(request.url);

    if (requestUrl.pathname === '/api/compliance') {
      return handleCompliance(request, corsHeaders);
    }

    // Default: existing health-score logic
    return handleHealthScore(request, corsHeaders);
  },
};

// --- Compliance endpoint ---

async function handleCompliance(
  request: Request,
  corsHeaders: Record<string, string>,
): Promise<Response> {
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

    const rawUrl = typeof (body as { url?: unknown }).url === 'string'
      ? (body as { url: string }).url
      : '';

    if (!rawUrl.trim()) {
      return Response.json(
        { error: 'URL required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const cleanDomain = normalizeDomain(rawUrl);
    if (!cleanDomain) {
      return Response.json(
        { error: 'Domain not allowed' },
        { status: 400, headers: corsHeaders }
      );
    }

    const result = await analyzeCompliance(cleanDomain);

    return Response.json(result, { headers: corsHeaders });
  } catch {
    return Response.json(
      { error: 'Internal error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

async function analyzeCompliance(domain: string): Promise<ComplianceResult> {
  const targetUrl = `https://${domain}/`;

  let response: Response;
  try {
    response = await fetchWithSafeRedirects(targetUrl, domain);
  } catch (error) {
    return {
      url: domain,
      findings: [],
      isSPA: false,
      error: error instanceof Error ? error.message : 'Fetch failed',
    };
  }

  if (!response.ok) {
    return {
      url: domain,
      findings: [],
      isSPA: false,
      error: `HTTP ${response.status}`,
    };
  }

  const findings: ComplianceFinding[] = [];
  const seenTexts = new Set<string>();
  let textElementCount = 0;

  function addFinding(text: string, element: string, severity: ComplianceSeverity, category: string): void {
    // Strip HTML entities (&nbsp; &mdash; etc.) before analysis
    const cleaned = stripHtmlEntities(text);
    if (!cleaned) return;
    if (!LATIN_RE.test(cleaned)) return;
    if (isWhitelisted(cleaned)) return;

    const key = `${cleaned}|${element}|${category}`;
    if (seenTexts.has(key)) return;
    seenTexts.add(key);

    findings.push({ text: cleaned, element, severity, category });
  }

  function countTextElement(): void {
    textElementCount += 1;
  }

  // --- HTMLRewriter text buffer handler ---
  // Text comes in chunks; we accumulate and process on last chunk.

  class TextBufferHandler {
    private buffer = '';
    private elementTag = '';
    private severity: ComplianceSeverity;
    private category: string;

    constructor(severity: ComplianceSeverity, category: string) {
      this.severity = severity;
      this.category = category;
    }

    element(el: Element): void {
      this.buffer = '';
      this.elementTag = el.tagName;
    }

    text(chunk: Text): void {
      this.buffer += chunk.text;
      if (chunk.lastInTextNode) {
        const content = this.buffer.trim();
        if (content) {
          countTextElement();
          addFinding(content, this.elementTag, this.severity, this.category);
        }
        this.buffer = '';
      }
    }
  }

  // Handler for attribute-based findings (no text accumulation needed)
  class AttrHandler {
    private attr: string;
    private elementTag: string;
    private severity: ComplianceSeverity;
    private category: string;

    constructor(attr: string, elementTag: string, severity: ComplianceSeverity, category: string) {
      this.attr = attr;
      this.elementTag = elementTag;
      this.severity = severity;
      this.category = category;
    }

    element(el: Element): void {
      const value = el.getAttribute(this.attr);
      if (value) {
        countTextElement();
        addFinding(value, this.elementTag, this.severity, this.category);
      }
    }
  }

  // Handler for footer links: classify as policies/medium or navigation/important
  class FooterLinkHandler {
    private buffer = '';

    element(): void {
      this.buffer = '';
    }

    text(chunk: Text): void {
      this.buffer += chunk.text;
      if (chunk.lastInTextNode) {
        const content = this.buffer.trim();
        if (content) {
          countTextElement();
          if (POLICY_KEYWORDS.test(content)) {
            addFinding(content, 'a', 'medium', 'policies');
          } else {
            addFinding(content, 'a', 'important', 'navigation');
          }
        }
        this.buffer = '';
      }
    }
  }

  // Handler for <title> — text accumulation across chunks
  class TitleHandler {
    private buffer = '';

    element(): void {
      this.buffer = '';
    }

    text(chunk: Text): void {
      this.buffer += chunk.text;
      if (chunk.lastInTextNode) {
        const content = this.buffer.trim();
        if (content) {
          countTextElement();
          addFinding(content, 'title', 'info', 'meta');
        }
        this.buffer = '';
      }
    }
  }

  // Handler for button-like links (a.btn, a[class*="btn"], a[class*="button"])
  class ButtonLinkHandler {
    private buffer = '';

    element(): void {
      this.buffer = '';
    }

    text(chunk: Text): void {
      this.buffer += chunk.text;
      if (chunk.lastInTextNode) {
        const content = this.buffer.trim();
        if (content) {
          countTextElement();
          addFinding(content, 'a', 'critical', 'buttons');
        }
        this.buffer = '';
      }
    }
  }

  // Handler for <select> <option> elements
  class OptionHandler {
    private buffer = '';

    element(): void {
      this.buffer = '';
    }

    text(chunk: Text): void {
      this.buffer += chunk.text;
      if (chunk.lastInTextNode) {
        const content = this.buffer.trim();
        if (content) {
          countTextElement();
          addFinding(content, 'option', 'important', 'forms');
        }
        this.buffer = '';
      }
    }
  }

  // SPA framework detection
  let hasFrameworkMarker = false;
  let scriptCount = 0;

  class SpaDetector {
    element(el: Element): void {
      const tag = el.tagName.toLowerCase();
      if (tag === 'script') {
        scriptCount++;
        const src = el.getAttribute('src') || '';
        if (/react|vue|angular|next|nuxt|svelte|gatsby/i.test(src)) {
          hasFrameworkMarker = true;
        }
      }
      if (tag === 'div' || tag === 'main') {
        const id = el.getAttribute('id') || '';
        if (['root', 'app', '__next', '__nuxt', '__svelte'].includes(id)) {
          hasFrameworkMarker = true;
        }
      }
      if (tag === 'app-root') {
        hasFrameworkMarker = true;
      }
    }
  }

  const spaDetector = new SpaDetector();

  const rewriter = new HTMLRewriter()
    // SPA detection
    .on('script', spaDetector)
    .on('div', spaDetector)
    .on('main', spaDetector)
    .on('app-root', spaDetector)
    // Buttons — critical
    .on('button', new TextBufferHandler('critical', 'buttons'))
    .on('input[type="submit"]', new AttrHandler('value', 'input', 'critical', 'buttons'))
    .on('input[type="button"]', new AttrHandler('value', 'input', 'critical', 'buttons'))
    .on('a.btn', new ButtonLinkHandler())
    .on('a[class*="btn"]', new ButtonLinkHandler())
    .on('a[class*="button"]', new ButtonLinkHandler())
    // Headings — critical
    .on('h1', new TextBufferHandler('critical', 'headings'))
    .on('h2', new TextBufferHandler('critical', 'headings'))
    .on('h3', new TextBufferHandler('critical', 'headings'))
    // Subheadings — medium
    .on('h4', new TextBufferHandler('medium', 'subheadings'))
    .on('h5', new TextBufferHandler('medium', 'subheadings'))
    .on('h6', new TextBufferHandler('medium', 'subheadings'))
    // Navigation — important
    .on('nav a', new TextBufferHandler('important', 'navigation'))
    .on('header a', new TextBufferHandler('important', 'navigation'))
    // Forms — important
    .on('label', new TextBufferHandler('important', 'forms'))
    .on('input[placeholder]', new AttrHandler('placeholder', 'input', 'important', 'forms'))
    .on('select option', new OptionHandler())
    // Footer — mixed
    .on('footer a', new FooterLinkHandler())
    // Meta — info
    .on('title', new TitleHandler())
    .on('meta[name="description"]', new AttrHandler('content', 'meta', 'info', 'meta'));

  // Transform the response to extract text (we don't need the output body)
  const transformed = rewriter.transform(response);
  // Consume the body to trigger HTMLRewriter processing
  await transformed.text();

  // SPA detection:
  // 1. Framework marker + few visible elements → definitely SPA
  // 2. Very few text elements overall → likely SPA
  const isSPA = (hasFrameworkMarker && textElementCount < 10)
    || (textElementCount < 5 && findings.length < 3)
    || (scriptCount > 5 && textElementCount < 8);

  return {
    url: domain,
    findings,
    isSPA,
    error: null,
  };
}

// --- Health Score endpoint (existing logic) ---

async function handleHealthScore(
  request: Request,
  corsHeaders: Record<string, string>,
): Promise<Response> {
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

    const domain = typeof (body as { domain?: unknown }).domain === 'string'
      ? (body as { domain: string }).domain
      : '';

    if (!domain.trim()) {
      return Response.json(
        { error: 'Domain required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const cleanDomain = normalizeDomain(domain);
    if (!cleanDomain) {
      return Response.json(
        { error: 'Domain not allowed' },
        { status: 400, headers: corsHeaders }
      );
    }

    const results = await Promise.all([
      fetchResource(`https://${cleanDomain}/llms.txt`, cleanDomain),
      fetchResource(`https://${cleanDomain}/llms-full.txt`, cleanDomain),
      fetchResource(`https://${cleanDomain}/robots.txt`, cleanDomain),
      fetchResource(`https://${cleanDomain}/sitemap.xml`, cleanDomain),
      fetchResource(`https://${cleanDomain}/`, cleanDomain),
    ]);

    return Response.json({
      domain: cleanDomain,
      llmsTxt: results[0],
      llmsFullTxt: results[1],
      robotsTxt: results[2],
      sitemapXml: results[3],
      homepage: results[4],
    }, { headers: corsHeaders });
  } catch {
    return Response.json(
      { error: 'Internal error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

function parseAllowedOrigins(raw: string): string[] {
  return raw
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);
}

function buildCorsHeaders(params: {
  allowedOrigins: string[];
  origin: string;
  isAllowedOrigin: boolean;
}): Record<string, string> {
  const defaultOrigin = params.allowedOrigins[0] || 'https://vlasdobry.ru';

  return {
    'Access-Control-Allow-Origin': params.isAllowedOrigin ? params.origin : defaultOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

function parsePositiveInt(
  value: string | undefined,
  fallback: number,
  min: number,
  max: number
): number {
  const parsed = Number.parseInt(value || '', 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

function isRateLimited(ip: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();

  // Opportunistic cleanup to keep memory bounded in long-lived isolates.
  if (RATE_LIMIT_STORE.size > 5000) {
    for (const [key, entry] of RATE_LIMIT_STORE.entries()) {
      if (entry.resetAt <= now) {
        RATE_LIMIT_STORE.delete(key);
      }
    }
  }

  const current = RATE_LIMIT_STORE.get(ip);

  if (!current || current.resetAt <= now) {
    RATE_LIMIT_STORE.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }

  if (current.count >= maxRequests) {
    return true;
  }

  current.count += 1;
  RATE_LIMIT_STORE.set(ip, current);
  return false;
}

function normalizeDomain(input: string): string | null {
  let candidate = input.trim();
  if (!candidate) return null;

  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(candidate)) {
    candidate = `https://${candidate}`;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(candidate);
  } catch {
    return null;
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return null;
  }

  if (parsedUrl.username || parsedUrl.password) {
    return null;
  }

  if (parsedUrl.port) {
    return null;
  }

  const hostname = parsedUrl.hostname.toLowerCase().replace(/\.$/, '');

  if (!hostname || hostname.length > 253) {
    return null;
  }

  if (hostname.includes('..')) {
    return null;
  }

  if (!/^[a-z0-9.-]+$/.test(hostname)) {
    return null;
  }

  if (!hostname.includes('.')) {
    return null;
  }

  if (isBlockedHostname(hostname)) {
    return null;
  }

  return hostname;
}

function isBlockedHostname(hostname: string): boolean {
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.localhost')
  ) {
    return true;
  }

  if (isPrivateIpv4(hostname)) {
    return true;
  }

  // Hostnames that start with a dash or contain invalid labels are rejected.
  const labels = hostname.split('.');
  for (const label of labels) {
    if (!label || label.startsWith('-') || label.endsWith('-')) {
      return true;
    }
  }

  return false;
}

function isPrivateIpv4(hostname: string): boolean {
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
    return false;
  }

  const parts = hostname.split('.').map(part => Number.parseInt(part, 10));

  if (parts.some(part => Number.isNaN(part) || part < 0 || part > 255)) {
    return true;
  }

  const [a, b] = parts;

  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a === 198 && (b === 18 || b === 19)) return true;

  return false;
}

function isAllowedRedirectHost(baseHost: string, nextHost: string): boolean {
  if (nextHost === baseHost) return true;
  if (nextHost === `www.${baseHost}`) return true;
  if (baseHost === `www.${nextHost}`) return true;
  return false;
}

async function fetchWithSafeRedirects(url: string, expectedHost: string): Promise<Response> {
  let currentUrl = url;

  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(currentUrl, {
        signal: controller.signal,
        headers: { 'User-Agent': 'HealthScoreBot/1.0 (+https://vlasdobry.ru)' },
        redirect: 'manual',
      });

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('Location');
        if (!location) {
          return response;
        }

        const nextUrl = new URL(location, currentUrl);
        const nextHost = nextUrl.hostname.toLowerCase();

        if (nextUrl.protocol !== 'https:' || isBlockedHostname(nextHost) || !isAllowedRedirectHost(expectedHost, nextHost)) {
          throw new Error('Unsafe redirect blocked');
        }

        currentUrl = nextUrl.toString();
        continue;
      }

      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw new Error('Too many redirects');
}

async function fetchResource(url: string, expectedHost: string): Promise<FetchResult> {
  const startTime = Date.now();

  try {
    const response = await fetchWithSafeRedirects(url, expectedHost);
    const responseTime = Date.now() - startTime;

    const finalHost = new URL(response.url).hostname.toLowerCase();
    if (isBlockedHostname(finalHost) || !isAllowedRedirectHost(expectedHost, finalHost)) {
      return {
        url,
        status: 0,
        content: null,
        error: 'Unsafe final host',
        responseTime,
      };
    }

    const content = response.ok ? (await response.text()).slice(0, MAX_CONTENT_SIZE) : null;

    return {
      url,
      status: response.status,
      content,
      error: null,
      responseTime,
    };
  } catch (error) {
    return {
      url,
      status: 0,
      content: null,
      error: error instanceof Error ? error.message : 'Fetch failed',
      responseTime: Date.now() - startTime,
    };
  }
}
