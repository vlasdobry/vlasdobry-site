import { createReadStream, existsSync } from 'fs';
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

  const server = await withServer();
  const browser = await puppeteer.launch({ headless: true });

  try {
    const page = await browser.newPage();
    await page.setViewport({
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      hasTouch: true,
      isMobile: true,
    });

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

    const sampleBefore = await page.evaluate(async () => {
      const sampleNode = async (selector, timestamps) => {
        const node = document.querySelector(selector);
        if (!node) {
          return null;
        }

        const samples = [];
        const start = performance.now();

        for (const timestamp of timestamps) {
          const remaining = timestamp - (performance.now() - start);
          if (remaining > 0) {
            await new Promise((resolve) => setTimeout(resolve, remaining));
          }

          const rect = node.getBoundingClientRect();
          const computed = getComputedStyle(node);
          samples.push({
            left: Number(rect.left.toFixed(2)),
            time: timestamp,
            transform: computed.transform,
          });
        }

        return samples;
      };

      return {
        arrow: await sampleNode('button svg', [0, 250, 500, 750, 1000]),
        swipeGuide: await sampleNode('[data-swipe-guide]', [0, 250, 500, 750, 1000]),
      };
    });

    if (!sampleBefore.arrow || !sampleBefore.swipeGuide) {
      fail('Could not find arrow or swipe guide on the hero screen');
    }

    const arrowPositions = sampleBefore.arrow.map((sample) => sample.left);
    const arrowTravel = Math.max(...arrowPositions) - Math.min(...arrowPositions);
    if (arrowTravel < 1.5) {
      fail(`Arrow animation moved only ${arrowTravel.toFixed(2)}px`);
    }

    const swipePositions = sampleBefore.swipeGuide.map((sample) => sample.left);
    const swipeTravel = Math.max(...swipePositions) - Math.min(...swipePositions);
    if (swipeTravel < 15) {
      fail(`Swipe guide moved only ${swipeTravel.toFixed(2)}px`);
    }

    await page.click('button');

    const transitionSamples = await page.evaluate(async () => {
      const track = document.querySelector('[data-transition-track]');
      if (!track) {
        return null;
      }

      const timestamps = [0, 150, 300, 450, 600, 750];
      const samples = [];
      const start = performance.now();

      for (const timestamp of timestamps) {
        const remaining = timestamp - (performance.now() - start);
        if (remaining > 0) {
          await new Promise((resolve) => setTimeout(resolve, remaining));
        }

        const rect = track.getBoundingClientRect();
        samples.push({
          left: Number(rect.left.toFixed(2)),
          time: timestamp,
        });
      }

      return samples;
    });

    if (!transitionSamples) {
      fail('Transition track not found');
    }

    if (transitionSamples[1].left > -5) {
      fail(`Transition barely started by 150ms: ${transitionSamples[1].left}px`);
    }

    if (transitionSamples[2].left > -150) {
      fail(`Transition did not reach the mid-flight zone by 300ms: ${transitionSamples[2].left}px`);
    }

    if (transitionSamples.at(-1).left > -380) {
      fail(`Transition did not finish near the landing viewport: ${transitionSamples.at(-1).left}px`);
    }

    console.log('TRANSITION CHECK PASS: hero animations are active and landing transition crosses the viewport');
  } finally {
    await browser.close();
    await server.close();
  }
}

run().catch((error) => {
  fail(error instanceof Error ? error.message : String(error));
});
