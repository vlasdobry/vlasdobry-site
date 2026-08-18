import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { build } from 'esbuild';
import { mkdir, rm } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';

const outputDir = new URL('./.generated/', import.meta.url);
const outputFile = new URL('resource-fetch.mjs', outputDir);
const workerOutputFile = new URL('health-worker.mjs', outputDir);
let fetchTextResource;
let consumeResponseWithRetry;
let healthWorker;

before(async () => {
  await mkdir(outputDir, { recursive: true });
  await build({
    entryPoints: [fileURLToPath(new URL('../src/resource-fetch.ts', import.meta.url))],
    outfile: fileURLToPath(outputFile),
    bundle: true,
    format: 'esm',
    platform: 'browser',
    target: 'es2022',
  });
  await build({
    entryPoints: [fileURLToPath(new URL('../src/index.ts', import.meta.url))],
    outfile: fileURLToPath(workerOutputFile),
    bundle: true,
    format: 'esm',
    platform: 'browser',
    target: 'es2022',
  });

  ({ fetchTextResource, consumeResponseWithRetry } = await import(`${pathToFileURL(fileURLToPath(outputFile)).href}?t=${Date.now()}`));
  ({ default: healthWorker } = await import(`${pathToFileURL(fileURLToPath(workerOutputFile)).href}?t=${Date.now()}`));
});

after(async () => {
  await rm(outputDir, { recursive: true, force: true });
});

test('retries a timed out body twice and returns unavailable', async () => {
  let attempts = 0;
  const fetchImpl = async (_url, { signal }) => {
    attempts += 1;
    return new Response(new ReadableStream({
      start(controller) {
        signal.addEventListener('abort', () => controller.error(signal.reason), { once: true });
      },
    }), { status: 200 });
  };

  const result = await fetchTextResource('https://example.com/', 'example.com', {
    fetchImpl,
    timeoutMs: 10,
    maxAttempts: 3,
    retryDelayMs: 0,
  });

  assert.equal(attempts, 3);
  assert.equal(result.availability, 'unavailable');
  assert.equal(result.status, 0);
  assert.equal(result.attempts, 3);
});

test('returns found when a timed out body succeeds on the next attempt', async () => {
  let attempts = 0;
  const fetchImpl = async (_url, { signal }) => {
    attempts += 1;
    if (attempts === 2) return new Response('ok', { status: 200 });

    return new Response(new ReadableStream({
      start(controller) {
        signal.addEventListener('abort', () => controller.error(signal.reason), { once: true });
      },
    }), { status: 200 });
  };

  const result = await fetchTextResource('https://example.com/', 'example.com', {
    fetchImpl,
    timeoutMs: 10,
    maxAttempts: 3,
    retryDelayMs: 0,
  });

  assert.equal(result.availability, 'found');
  assert.equal(result.content, 'ok');
  assert.equal(result.attempts, 2);
});

test('returns missing for HTTP 404 without retrying', async () => {
  let attempts = 0;
  const result = await fetchTextResource('https://example.com/robots.txt', 'example.com', {
    fetchImpl: async () => {
      attempts += 1;
      return new Response('not found', { status: 404 });
    },
    retryDelayMs: 0,
  });

  assert.equal(attempts, 1);
  assert.equal(result.availability, 'missing');
  assert.equal(result.status, 404);
  assert.equal(result.content, null);
});

test('limits successful text responses to 50,000 characters', async () => {
  const result = await fetchTextResource('https://example.com/llms-full.txt', 'example.com', {
    fetchImpl: async () => new Response('x'.repeat(60_000), { status: 200 }),
  });

  assert.equal(result.availability, 'found');
  assert.equal(result.content?.length, 50_000);
});

test('retries HTTP 503 and returns unavailable after the last attempt', async () => {
  let attempts = 0;
  const result = await fetchTextResource('https://example.com/', 'example.com', {
    fetchImpl: async () => {
      attempts += 1;
      return new Response('busy', { status: 503 });
    },
    maxAttempts: 3,
    retryDelayMs: 0,
  });

  assert.equal(attempts, 3);
  assert.equal(result.availability, 'unavailable');
  assert.equal(result.status, 503);
  assert.equal(result.attempts, 3);
});

test('blocks redirects to an unrelated host', async () => {
  const result = await fetchTextResource('https://example.com/', 'example.com', {
    fetchImpl: async () => new Response(null, {
      status: 302,
      headers: { Location: 'https://evil.test/' },
    }),
    maxAttempts: 1,
  });

  assert.equal(result.availability, 'unavailable');
  assert.equal(result.status, 0);
  assert.match(result.error ?? '', /unsafe redirect/i);
});

test('health payload preserves found resources and marks a timeout as unavailable', async () => {
  const originalFetch = globalThis.fetch;
  const originalCaches = globalThis.caches;
  let cacheWrites = 0;

  globalThis.caches = {
    default: {
      match: async () => undefined,
      put: async () => { cacheWrites += 1; },
    },
  };
  globalThis.fetch = async input => {
    if (String(input).includes('/sitemap.xml')) throw new Error('Body read timeout');
    return new Response('<html lang="ru"><title>OK</title></html>', { status: 200 });
  };

  try {
    const response = await healthWorker.fetch(new Request('https://worker.test/', {
      method: 'POST',
      headers: {
        Origin: 'https://vlasdobry.ru',
        'Content-Type': 'application/json',
        'CF-Connecting-IP': '203.0.113.42',
      },
      body: JSON.stringify({ domain: 'example.com' }),
    }), {
      ALLOWED_ORIGINS: 'https://vlasdobry.ru',
    });
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(response.headers.get('X-Partial-Result'), 'true');
    assert.equal(payload.sitemapXml.availability, 'unavailable');
    assert.equal(payload.homepage.availability, 'found');
    assert.equal(cacheWrites, 0);
  } finally {
    globalThis.fetch = originalFetch;
    globalThis.caches = originalCaches;
  }
});

test('keeps the timeout active while a custom response consumer reads the body', async () => {
  let attempts = 0;
  const result = await consumeResponseWithRetry(
    'https://example.com/',
    'example.com',
    response => response.text(),
    {
      fetchImpl: async (_url, { signal }) => {
        attempts += 1;
        if (attempts === 2) return new Response('processed', { status: 200 });
        return new Response(new ReadableStream({
          start(controller) {
            signal.addEventListener('abort', () => controller.error(signal.reason), { once: true });
          },
        }), { status: 200 });
      },
      timeoutMs: 10,
      maxAttempts: 3,
      retryDelayMs: 0,
    },
  );

  assert.equal(attempts, 2);
  assert.equal(result.availability, 'found');
  assert.equal(result.value, 'processed');
});

test('compliance returns temporarily_unavailable after retryable fetch failures', async () => {
  const originalFetch = globalThis.fetch;
  let attempts = 0;
  globalThis.fetch = async () => {
    attempts += 1;
    throw new Error('network unavailable');
  };

  try {
    const response = await healthWorker.fetch(new Request('https://worker.test/api/compliance', {
      method: 'POST',
      headers: {
        Origin: 'https://vlasdobry.ru',
        'Content-Type': 'application/json',
        'CF-Connecting-IP': '203.0.113.43',
      },
      body: JSON.stringify({ url: 'https://example.com/' }),
    }), {
      ALLOWED_ORIGINS: 'https://vlasdobry.ru',
    });
    const payload = await response.json();

    assert.equal(attempts, 3);
    assert.equal(payload.errorCode, 'temporarily_unavailable');
    assert.equal(payload.error, 'Temporarily unavailable');
  } finally {
    globalThis.fetch = originalFetch;
  }
});
