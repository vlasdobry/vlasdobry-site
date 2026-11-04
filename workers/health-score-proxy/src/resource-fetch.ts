export type ResourceAvailability = 'found' | 'missing' | 'unavailable';

export interface FetchResult {
  url: string;
  status: number;
  content: string | null;
  error: string | null;
  responseTime: number;
  availability: ResourceAvailability;
  attempts: number;
  headers?: Record<string, string>;
}

export interface ConsumedResponse<T> {
  url: string;
  status: number;
  value: T | null;
  error: string | null;
  responseTime: number;
  availability: ResourceAvailability;
  attempts: number;
  headers: Headers;
}

export interface FetchOptions {
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  maxAttempts?: number;
  retryDelayMs?: number;
  maxRedirects?: number;
  maxBodyBytes?: number;
}

const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_RETRY_DELAY_MS = 150;
const DEFAULT_MAX_REDIRECTS = 5;
const MAX_CONTENT_SIZE = 50_000;
const DEFAULT_MAX_BODY_BYTES = 2 * 1024 * 1024;
const RETRYABLE_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504]);

class FetchAttemptError extends Error {
  constructor(
    message: string,
    readonly retryable: boolean,
    readonly status = 0,
  ) {
    super(message);
  }
}

export class ResourceLimitError extends FetchAttemptError {
  constructor(message = 'Response exceeds size limit') {
    super(message, false);
  }
}

// Bound the body before passing it to either text() or HTMLRewriter.
// Fetch exposes decoded body bytes; Content-Length is not trusted.
async function boundedResponse(response: Response, maxBytes: number): Promise<Response> {
  if (!Number.isSafeInteger(maxBytes) || maxBytes <= 0) throw new ResourceLimitError();
  const reader = response.body?.getReader();
  let buffer = new Uint8Array(Math.min(65536, maxBytes));
  let length = 0;
  if (reader) {
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const nextLength = length + value.byteLength;
        if (nextLength > maxBytes) throw new ResourceLimitError();
        if (nextLength > buffer.length) {
          const grown = new Uint8Array(Math.min(maxBytes, Math.max(nextLength, buffer.length * 2)));
          grown.set(buffer.subarray(0, length));
          buffer = grown;
        }
        buffer.set(value, length);
        length = nextLength;
      }
    } catch (error) {
      void reader.cancel(error).catch(() => undefined);
      throw error;
    } finally {
      reader.releaseLock();
    }
  }
  const headers = new Headers(response.headers);
  headers.delete('Content-Length');
  headers.delete('Content-Encoding');
  return new Response(length ? buffer.subarray(0, length) : null,
    { status: response.status, statusText: response.statusText, headers });
}

const wait = (delayMs: number) => new Promise(resolve => setTimeout(resolve, delayMs));

function isAllowedRedirectHost(baseHost: string, nextHost: string): boolean {
  if (nextHost === baseHost) return true;
  if (nextHost === `www.${baseHost}`) return true;
  return baseHost === `www.${nextHost}`;
}

function isBlockedHostname(hostname: string): boolean {
  if (
    hostname === 'localhost'
    || hostname.endsWith('.local')
    || hostname.endsWith('.internal')
    || hostname.endsWith('.localhost')
  ) {
    return true;
  }

  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
    const [a, b, c, d] = hostname.split('.').map(part => Number.parseInt(part, 10));
    if ([a, b, c, d].some(part => Number.isNaN(part) || part < 0 || part > 255)) return true;
    if (a === 0 || a === 10 || a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
    if (a === 198 && (b === 18 || b === 19)) return true;
  }

  return hostname.split('.').some(label => !label || label.startsWith('-') || label.endsWith('-'));
}

async function fetchWithSafeRedirects(
  initialUrl: string,
  expectedHost: string,
  fetchImpl: typeof fetch,
  signal: AbortSignal,
  maxRedirects: number,
): Promise<{ response: Response; finalUrl: string }> {
  let currentUrl = initialUrl;
  const baseHost = expectedHost.toLowerCase();

  for (let redirectCount = 0; redirectCount <= maxRedirects; redirectCount += 1) {
    const response = await fetchImpl(currentUrl, {
      signal,
      redirect: 'manual',
      headers: { 'User-Agent': 'HealthScoreBot/1.0 (+https://vlasdobry.ru)' },
    });

    if (response.status < 300 || response.status >= 400) {
      const responseUrl = response.url || currentUrl;
      const finalUrl = new URL(responseUrl);
      const finalHost = finalUrl.hostname.toLowerCase();
      if (
        finalUrl.protocol !== 'https:'
        || isBlockedHostname(finalHost)
        || !isAllowedRedirectHost(baseHost, finalHost)
      ) {
        throw new FetchAttemptError('Unsafe final host', false);
      }
      return { response, finalUrl: finalUrl.toString() };
    }

    const location = response.headers.get('Location');
    if (!location) throw new FetchAttemptError('Redirect without Location', false);

    const nextUrl = new URL(location, currentUrl);
    const nextHost = nextUrl.hostname.toLowerCase();
    if (
      nextUrl.protocol !== 'https:'
      || isBlockedHostname(nextHost)
      || !isAllowedRedirectHost(baseHost, nextHost)
    ) {
      throw new FetchAttemptError('Unsafe redirect blocked', false);
    }

    await response.body?.cancel().catch(() => undefined);
    currentUrl = nextUrl.toString();
  }

  throw new FetchAttemptError('Too many redirects', false);
}

export async function consumeResponseWithRetry<T>(
  url: string,
  _expectedHost: string,
  consume: (response: Response) => Promise<T>,
  options: FetchOptions = {},
): Promise<ConsumedResponse<T>> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxAttempts = options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const retryDelayMs = options.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS;
  const maxRedirects = options.maxRedirects ?? DEFAULT_MAX_REDIRECTS;
  const startedAt = Date.now();
  let lastError = 'Fetch failed';
  let lastStatus = 0;
  let lastHeaders = new Headers();
  let attempts = 0;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    attempts = attempt;
    const controller = new AbortController();
    let response: Response | null = null;
    const timeoutId = setTimeout(() => {
      lastError = 'Request timeout';
      controller.abort(new Error(lastError));
      void response?.body?.cancel().catch(() => undefined);
    }, timeoutMs);

    try {
      const fetched = await fetchWithSafeRedirects(
        url,
        _expectedHost,
        fetchImpl,
        controller.signal,
        maxRedirects,
      );
      response = fetched.response;
      lastStatus = response.status;
      lastHeaders = response.headers;

      if (RETRYABLE_STATUSES.has(response.status)) {
        await response.body?.cancel().catch(() => undefined);
        throw new FetchAttemptError(`HTTP ${response.status}`, true, response.status);
      }

      if (!response.ok && response.status !== 404) {
        return {
          url: fetched.finalUrl,
          status: response.status,
          value: null,
          error: `HTTP ${response.status}`,
          responseTime: Date.now() - startedAt,
          availability: 'unavailable',
          attempts: attempt,
          headers: response.headers,
        };
      }

      const value = response.ok
        ? await consume(await boundedResponse(response, options.maxBodyBytes ?? DEFAULT_MAX_BODY_BYTES))
        : null;

      return {
        url: fetched.finalUrl,
        status: response.status,
        value,
        error: null,
        responseTime: Date.now() - startedAt,
        availability: response.status === 404 ? 'missing' : 'found',
        attempts: attempt,
        headers: response.headers,
      };
    } catch (error) {
      if (controller.signal.aborted) lastStatus = 0;
      lastError = controller.signal.aborted
        ? 'Request timeout'
        : error instanceof Error ? error.message : 'Fetch failed';

      const retryable = controller.signal.aborted
        || !(error instanceof FetchAttemptError)
        || error.retryable;

      if (!retryable || attempt === maxAttempts) break;
      if (attempt < maxAttempts) {
        await wait(retryDelayMs);
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }

  return {
    url,
    status: lastStatus,
    value: null,
    error: lastError,
    responseTime: Date.now() - startedAt,
    availability: 'unavailable',
    attempts,
    headers: lastHeaders,
  };
}

export async function fetchTextResource(
  url: string,
  expectedHost: string,
  options: FetchOptions = {},
): Promise<FetchResult> {
  const result = await consumeResponseWithRetry(
    url,
    expectedHost,
    async response => (await response.text()).slice(0, MAX_CONTENT_SIZE),
    options,
  );
  const headers: Record<string, string> = {};
  const xRobotsTag = result.headers.get('x-robots-tag');
  if (xRobotsTag) headers['x-robots-tag'] = xRobotsTag;

  return {
    url: result.url,
    status: result.status,
    content: result.value,
    error: result.error,
    responseTime: result.responseTime,
    availability: result.availability,
    attempts: result.attempts,
    headers,
  };
}
