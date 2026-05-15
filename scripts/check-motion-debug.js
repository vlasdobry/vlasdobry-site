import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import puppeteer from 'puppeteer';

const PREVIEW_PORT = 4174;
const PREVIEW_URL = `http://127.0.0.1:${PREVIEW_PORT}/`;
const STATIC_SERVER = `
  const http = require('node:http');
  const fs = require('node:fs');
  const path = require('node:path');
  const root = path.join(process.cwd(), 'dist');
  const types = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp'
  };
  http.createServer((request, response) => {
    const url = new URL(request.url, 'http://127.0.0.1');
    let pathname = decodeURIComponent(url.pathname);
    if (pathname.endsWith('/')) pathname += 'index.html';
    let filePath = path.join(root, pathname);
    if (!filePath.startsWith(root)) {
      response.writeHead(403);
      response.end('Forbidden');
      return;
    }
    if (!fs.existsSync(filePath)) filePath = path.join(root, 'index.html');
    const extension = path.extname(filePath);
    response.writeHead(200, { 'Content-Type': types[extension] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(response);
  }).listen(${PREVIEW_PORT}, '127.0.0.1');
`;

function fail(message) {
  throw new Error(`MOTION DEBUG CHECK FAIL: ${message}`);
}

async function waitForPreview(url, attempts = 40) {
  for (let index = 0; index < attempts; index += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Wait until preview is ready.
    }
    await sleep(500);
  }

  fail(`preview did not start at ${url}`);
}

async function run() {
  const preview = spawn(process.execPath, ['-e', STATIC_SERVER], {
    cwd: process.cwd(),
    stdio: 'ignore',
    windowsHide: true,
  });

  let browser;

  try {
    await waitForPreview(PREVIEW_URL);

    browser = await puppeteer.launch({
      headless: 'new',
      defaultViewport: {
        width: 390,
        height: 844,
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 3,
      },
    });

    const page = await browser.newPage();
    await page.goto(PREVIEW_URL, { waitUntil: 'networkidle0', timeout: 60000 });

    const regularText = await page.evaluate(() => document.body.textContent || '');
    if (regularText.includes('Motion Debug')) {
      fail('debug panel is visible without motionDebug query parameter');
    }

    await page.goto(`${PREVIEW_URL}?motionDebug=1`, { waitUntil: 'networkidle0', timeout: 60000 });
    await page.waitForSelector('[data-motion-debug-panel]', { timeout: 10000 });

    const debugText = await page.evaluate(() => document.body.textContent || '');
    if (!debugText.includes('Motion Debug')) {
      fail('debug panel is missing with motionDebug query parameter');
    }

    const lazyChunkLoaded = await page.evaluate(() => {
      const resourceNames = performance
        .getEntriesByType('resource')
        .map(entry => entry.name);

      return resourceNames.some(name => name.includes('MotionDebug'));
    });

    if (!lazyChunkLoaded) {
      fail('motion debug lazy chunk was not loaded with motionDebug query parameter');
    }

    console.log('MOTION DEBUG CHECK PASS');
  } finally {
    await browser?.close();
    preview.kill();
    await sleep(300);
  }
}

run().catch(error => {
  console.error(error.message);
  process.exit(1);
});
