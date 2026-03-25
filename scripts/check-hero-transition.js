import { createReadStream, existsSync, readdirSync } from 'fs';
import { createServer } from 'http';
import { extname, join, normalize } from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const rootDir = normalize(join(__dirname, '..'));
const distDir = join(rootDir, 'dist');

const CONTENT_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.xml': 'application/xml; charset=utf-8',
};

function fail(message) {
  console.error(`TRANSITION CHECK FAIL: ${message}`);
  process.exit(1);
}

function getFilePath(urlPath) {
  if (urlPath === '/') {
    return join(distDir, 'index.html');
  }

  const cleanPath = urlPath.replace(/^\/+/, '');
  const candidate = join(distDir, cleanPath);
  if (existsSync(candidate)) {
    return candidate;
  }

  return join(distDir, 'index.html');
}

async function withServer() {
  return await new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      const filePath = getFilePath(req.url || '/');
      const extension = extname(filePath);
      const contentType = CONTENT_TYPES[extension] || 'application/octet-stream';

      res.setHeader('Content-Type', contentType);

      if (!existsSync(filePath)) {
        res.statusCode = 404;
        res.end('Not found');
        return;
      }

      createReadStream(filePath)
        .on('error', (error) => {
          res.statusCode = 500;
          res.end(String(error));
        })
        .pipe(res);
    });

    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        reject(new Error('Server did not return a TCP address'));
        return;
      }

      resolve({
        close: () =>
          new Promise((closeResolve, closeReject) => {
            server.close((error) => {
              if (error) {
                closeReject(error);
                return;
              }
              closeResolve();
            });
          }),
        port: address.port,
      });
    });

    server.on('error', reject);
  });
}

async function run() {
  if (!existsSync(join(distDir, 'index.html'))) {
    fail('dist/index.html not found, run "npm run build" first');
  }

  const assetsDir = join(distDir, 'assets');
  const landingChunk = readdirSync(assetsDir).find((fileName) =>
    /^Landing-.*\.js$/.test(fileName)
  );

  if (!landingChunk) {
    fail('Landing chunk not found in build manifest');
  }

  const server = await withServer();
  const browser = await puppeteer.launch({ headless: true });

  try {
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      const url = request.url();
      if (url.startsWith('http://127.0.0.1:')) {
        request.continue();
        return;
      }

      request.abort();
    });

    await page.goto(`http://127.0.0.1:${server.port}/`, {
      waitUntil: 'domcontentloaded',
    });
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const checks = await page.evaluate((landingFile) => {
      const requestedResources = performance
        .getEntriesByType('resource')
        .map((entry) => entry.name);

      const track = document.querySelector('[data-transition-track]');
      const swipeGuide = document.querySelector('[data-swipe-guide]');

      return {
        landingPreloaded: requestedResources.some((name) => name.includes(landingFile)),
        swipeGuideAnimationName: swipeGuide ? getComputedStyle(swipeGuide).animationName : null,
        swipeGuideWillChange: swipeGuide ? getComputedStyle(swipeGuide).willChange : null,
        trackWillChange: track ? getComputedStyle(track).willChange : null,
      };
    }, landingChunk);

    if (!checks.landingPreloaded) {
      fail('Landing chunk was not preloaded on the hero screen');
    }

    if (checks.trackWillChange !== 'transform') {
      fail(`Transition track will-change is "${checks.trackWillChange}" instead of "transform"`);
    }

    if (checks.swipeGuideAnimationName === 'none') {
      fail('Swipe guide animation is not active');
    }

    if (checks.swipeGuideWillChange !== 'transform') {
      fail(`Swipe guide will-change is "${checks.swipeGuideWillChange}" instead of "transform"`);
    }

    console.log('TRANSITION CHECK PASS: hero preloads landing chunk and exposes transform hints');
  } finally {
    await browser.close();
    await server.close();
  }
}

run().catch((error) => {
  fail(error instanceof Error ? error.message : String(error));
});
