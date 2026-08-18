import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { build } from 'esbuild';
import { mkdir, rm } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';

const outputDir = new URL('./.generated/', import.meta.url);
const outputFile = new URL('health-scoring.mjs', outputDir);
let calculateSeoScore;
let calculateGeoScore;

const HOME_HTML = `<!doctype html><html><head>
  <title>Проверенный заголовок страницы для поисковых систем</title>
  <meta name="description" content="Подробное описание страницы достаточной длины для поисковых систем и пользователей, которое раскрывает содержание предложения и его преимущества.">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="canonical" href="https://example.com/">
  <script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"Organization"},{"@type":"WebSite"},{"@type":"FAQPage"}]}</script>
</head><body><h1>Главный заголовок проверяемой страницы</h1><main><p>${'Полезный текст для цитирования. '.repeat(80)}</p></main></body></html>`;
const ROBOTS = 'User-agent: *\nAllow: /\nSitemap: https://example.com/sitemap.xml';
const SITEMAP = '<?xml version="1.0"?><urlset><url><loc>https://example.com/</loc><lastmod>2026-08-18</lastmod></url></urlset>';
const LLMS = '# Example\n> Description\n## Pages\n' + Array.from({ length: 5 }, (_, index) => `- [Page ${index}](https://example.com/${index})`).join('\n');

const found = (content, url = 'https://example.com/') => ({
  url,
  status: 200,
  content,
  error: null,
  responseTime: 10,
  availability: 'found',
});
const missing = (url) => ({
  url,
  status: 404,
  content: null,
  error: null,
  responseTime: 10,
  availability: 'missing',
});
const unavailable = (url, error = 'Body read timeout') => ({
  url,
  status: 0,
  content: null,
  error,
  responseTime: 30_000,
  availability: 'unavailable',
});

before(async () => {
  await mkdir(outputDir, { recursive: true });
  await build({
    entryPoints: [fileURLToPath(new URL('./index.ts', import.meta.url))],
    outfile: fileURLToPath(outputFile),
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'node20',
  });
  ({ calculateSeoScore, calculateGeoScore } = await import(`${pathToFileURL(fileURLToPath(outputFile)).href}?t=${Date.now()}`));
});

after(async () => {
  await rm(outputDir, { recursive: true, force: true });
});

test('does not penalize an unavailable sitemap', () => {
  const result = calculateSeoScore({
    homepage: found(HOME_HTML),
    robotsTxt: found(ROBOTS, 'https://example.com/robots.txt'),
    sitemapXml: unavailable('https://example.com/sitemap.xml'),
  });

  assert.equal(result.availableWeight, 88);
  assert.equal(result.unavailableChecks, 1);
  assert.equal(result.checkedCount, 7);
  assert.equal(result.total, Math.round(result.rawScore / 88 * 100));
  assert.ok(result.issues.some(issue => issue.title === 'sitemap.xml не удалось проверить'));
  assert.ok(!result.issues.some(issue => issue.title === 'sitemap.xml отсутствует'));
});

test('keeps a real sitemap 404 as a scored failure', () => {
  const result = calculateSeoScore({
    homepage: found(HOME_HTML),
    robotsTxt: found(ROBOTS, 'https://example.com/robots.txt'),
    sitemapXml: missing('https://example.com/sitemap.xml'),
  });

  assert.equal(result.availableWeight, 100);
  assert.equal(result.unavailableChecks, 0);
  assert.ok(result.issues.some(issue => issue.title === 'sitemap.xml отсутствует'));
});

test('scores robots and sitemap when the homepage is temporarily unavailable', () => {
  const result = calculateSeoScore({
    homepage: unavailable('https://example.com/'),
    robotsTxt: found(ROBOTS, 'https://example.com/robots.txt'),
    sitemapXml: found(SITEMAP, 'https://example.com/sitemap.xml'),
  });

  assert.equal(result.availableWeight, 27);
  assert.equal(result.unavailableChecks, 6);
  assert.equal(result.checkedCount, 2);
  assert.equal(result.total, 100);
  assert.ok(result.issues.some(issue => issue.title === 'Главную страницу не удалось проверить'));
  assert.ok(!result.issues.some(issue => issue.title === 'Сайт недоступен'));
});

test('excludes only unavailable llms-full weight from GEO score', () => {
  const result = calculateGeoScore({
    homepage: found(HOME_HTML),
    llmsTxt: found(LLMS, 'https://example.com/llms.txt'),
    llmsFullTxt: unavailable('https://example.com/llms-full.txt'),
    robotsTxt: found(ROBOTS, 'https://example.com/robots.txt'),
  });

  assert.equal(result.availableWeight, 80);
  assert.equal(result.unavailableChecks, 1);
  assert.equal(result.checkedCount, 7);
  assert.equal(result.total, Math.round(result.rawScore / 80 * 100));
  assert.ok(result.issues.some(issue => issue.title === 'llms-full.txt не удалось проверить'));
  assert.ok(!result.issues.some(issue => issue.title === 'llms-full.txt отсутствует'));
});

test('excludes homepage-dependent GEO checks when homepage is unavailable', () => {
  const result = calculateGeoScore({
    homepage: unavailable('https://example.com/'),
    llmsTxt: found(LLMS, 'https://example.com/llms.txt'),
    llmsFullTxt: found('Полный контент '.repeat(200), 'https://example.com/llms-full.txt'),
    robotsTxt: found(ROBOTS, 'https://example.com/robots.txt'),
  });

  assert.equal(result.availableWeight, 40);
  assert.equal(result.unavailableChecks, 5);
  assert.equal(result.checkedCount, 3);
  assert.ok(result.issues.some(issue => issue.title === 'Главную страницу не удалось проверить'));
  assert.ok(!result.issues.some(issue => /Schema\.org отсутствует/.test(issue.title)));
});

test('excludes AI access when robots.txt is unavailable', () => {
  const result = calculateGeoScore({
    homepage: found(HOME_HTML),
    llmsTxt: found(LLMS, 'https://example.com/llms.txt'),
    llmsFullTxt: found('Полный контент '.repeat(200), 'https://example.com/llms-full.txt'),
    robotsTxt: unavailable('https://example.com/robots.txt'),
  });

  assert.equal(result.availableWeight, 90);
  assert.equal(result.unavailableChecks, 1);
  assert.ok(result.issues.some(issue => issue.title === 'robots.txt не удалось проверить'));
  assert.ok(!result.issues.some(issue => issue.title === 'AI-боты разрешены'));
});
