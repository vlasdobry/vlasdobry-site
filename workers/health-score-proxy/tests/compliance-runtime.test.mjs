import assert from 'node:assert/strict';
import { test, before, after } from 'node:test';
import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { Miniflare, createFetchMock } from 'miniflare';

let directory;
let scriptPath;
before(async () => {
  directory = await mkdtemp(join(tmpdir(), 'vlas-worker-security-'));
  scriptPath = join(directory, 'worker.mjs');
  await build({ entryPoints: [fileURLToPath(new URL('../src/index.ts', import.meta.url))],
    outfile: scriptPath, bundle: true, format: 'esm', platform: 'browser', target: 'es2022' });
});
after(async () => { await rm(directory, { recursive: true, force: true }); });

async function checkHtml(html, { compressed = false } = {}) {
  const mock = createFetchMock();
  mock.disableNetConnect();
  let fetches = 0;
  mock.get('https://example.com').intercept({ path: '/', method: 'GET' })
    .reply(200, () => { fetches++; return compressed ? gzipSync(html) : html; }, {
      headers: { 'content-type': 'text/html; charset=utf-8', ...(compressed ? { 'content-encoding': 'gzip' } : {}) },
    }).persist();
  const worker = new Miniflare({ modules: true, scriptPath, compatibilityDate: '2026-07-01',
    fetchMock: mock, bindings: { ALLOWED_ORIGINS: 'https://vlasdobry.ru' } });
  try {
    const response = await worker.dispatchFetch('https://worker.test/api/compliance', {
      method: 'POST', headers: { Origin: 'https://vlasdobry.ru', 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://example.com/' }),
    });
    return { status: response.status, payload: await response.json(), fetches };
  } finally { await worker.dispose(); await mock.close(); }
}

test('real HTMLRewriter preserves normal findings, including compressed HTML', async () => {
  const html = '<html><title>Demo page</title><h1>Try our offer</h1><button>Buy now</button></html>';
  const plain = await checkHtml(html);
  const compressed = await checkHtml(html, { compressed: true });
  assert.equal(plain.status, 200);
  assert.equal(plain.payload.error, null);
  assert.ok(plain.payload.findings.length > 0);
  assert.deepEqual(compressed.payload, plain.payload);
  assert.equal(plain.fetches, 1);
});

for (const [name, html, options] of [
  ['oversized upstream', '<html>' + 'x'.repeat(2 * 1024 * 1024) + '</html>', {}],
  ['compressed oversized upstream', '<html>' + 'x'.repeat(2 * 1024 * 1024) + '</html>', { compressed: true }],
  ['oversized text node', '<h1>' + 'x'.repeat(50_001) + '</h1>', {}],
  ['oversized attribute', '<input placeholder="' + 'x'.repeat(50_001) + '">', {}],
  ['too many findings', Array.from({ length: 501 }, (_, i) => `<h1>Unlistedword ${i}</h1>`).join(''), {}],
]) {
  test('real HTMLRewriter rejects ' + name + ' without retry or partial success', async () => {
    const result = await checkHtml(html, options);
    assert.equal(result.payload.errorCode, 'temporarily_unavailable');
    assert.deepEqual(result.payload.findings, []);
    assert.equal(result.fetches, 1);
  });
}
