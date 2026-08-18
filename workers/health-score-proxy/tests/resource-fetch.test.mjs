import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { build } from 'esbuild';
import { mkdir, rm } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';

const outputDir = new URL('./.generated/', import.meta.url);
const outputFile = new URL('resource-fetch.mjs', outputDir);
let fetchTextResource;

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

  ({ fetchTextResource } = await import(`${pathToFileURL(fileURLToPath(outputFile)).href}?t=${Date.now()}`));
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
