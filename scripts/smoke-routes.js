import { existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const distDir = join(rootDir, 'dist');

function fail(message) {
  console.error(`SMOKE FAIL: ${message}`);
}

function ok(message) {
  console.log(`SMOKE OK: ${message}`);
}

function mustExist(relativePath) {
  const fullPath = join(distDir, relativePath);
  if (!existsSync(fullPath)) {
    fail(`missing file ${relativePath}`);
    return false;
  }
  ok(`exists ${relativePath}`);
  return true;
}

function mustContain(relativePath, pattern) {
  const fullPath = join(distDir, relativePath);
  if (!existsSync(fullPath)) {
    fail(`missing file ${relativePath}`);
    return false;
  }

  const content = readFileSync(fullPath, 'utf-8');
  if (!content.includes(pattern)) {
    fail(`file ${relativePath} does not contain "${pattern}"`);
    return false;
  }
  ok(`content check ${relativePath}`);
  return true;
}

function loadBlogSlugs(lang) {
  const blogDataPath = join(distDir, 'blog-data.json');
  if (!existsSync(blogDataPath)) {
    return [];
  }

  const data = JSON.parse(readFileSync(blogDataPath, 'utf-8'));
  const articles = Array.isArray(data[lang]) ? data[lang] : [];
  return articles.map(a => a.slug).filter(Boolean);
}

function run() {
  if (!existsSync(distDir)) {
    fail('dist directory not found, run "npm run build" first');
    process.exit(1);
  }

  let hasErrors = false;

  const coreRoutes = [
    'index.html',
    'en/index.html',
    'services/seo/index.html',
    'en/services/seo/index.html',
    'services/geo/index.html',
    'en/services/geo/index.html',
    'blog/index.html',
    'en/blog/index.html',
    'for-hotels/index.html',
    'en/for-hotels/index.html',
    'for-labs/index.html',
    'en/for-labs/index.html',
    'for-spa/index.html',
    'en/for-spa/index.html',
    'projects/index.html',
    'en/projects/index.html',
  ];

  for (const route of coreRoutes) {
    if (!mustExist(route)) hasErrors = true;
    if (!mustContain(route, '<div id="root"></div>')) hasErrors = true;
  }

  // Статические страницы (без React) — проверяем существование и ключевое содержимое
  const staticRoutes = [
    { route: 'extension/privacy/index.html', marker: 'AI Visibility Checker' },
    { route: 'en/extension/privacy/index.html', marker: 'AI Visibility Checker' },
  ];

  for (const { route, marker } of staticRoutes) {
    if (!mustExist(route)) hasErrors = true;
    if (!mustContain(route, marker)) hasErrors = true;
  }

  const ruSlugs = loadBlogSlugs('ru');
  const enSlugs = loadBlogSlugs('en');

  if (ruSlugs.length === 0 || enSlugs.length === 0) {
    fail('blog slugs not found in dist/blog-data.json');
    hasErrors = true;
  } else {
    const ruRoute = `blog/${ruSlugs[0]}/index.html`;
    const enRoute = `en/blog/${enSlugs[0]}/index.html`;
    if (!mustExist(ruRoute)) hasErrors = true;
    if (!mustExist(enRoute)) hasErrors = true;
    if (!mustContain(ruRoute, '<div id="root"></div>')) hasErrors = true;
    if (!mustContain(enRoute, '<div id="root"></div>')) hasErrors = true;
  }

  if (hasErrors) {
    process.exit(1);
  }

  console.log('SMOKE PASS: all route checks succeeded');
}

run();
