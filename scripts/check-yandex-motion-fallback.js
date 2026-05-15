import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import puppeteer from 'puppeteer';

const PREVIEW_PORT = 4175;
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
  throw new Error(`YANDEX MOTION FALLBACK CHECK FAIL: ${message}`);
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

async function collectTrackPositions(page) {
  const samples = [];
  const checkpointMs = [0, 80, 160, 260, 380, 520, 760];
  let previousMs = 0;

  for (const currentMs of checkpointMs) {
    await sleep(Math.max(0, currentMs - previousMs));
    previousMs = currentMs;

    const snapshot = await page.evaluate((elapsedMs) => {
      const track = document.querySelector('[data-motion-track]');
      if (!track) return { elapsedMs, missing: true };

      const rect = track.getBoundingClientRect();
      const style = window.getComputedStyle(track);
      return {
        elapsedMs,
        left: Number(rect.left.toFixed(2)),
        transitionProperty: style.transitionProperty,
      };
    }, currentMs);

    samples.push(snapshot);
  }

  return samples;
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
    await page.goto(`${PREVIEW_URL}?forceMotionFallback=1`, { waitUntil: 'networkidle0', timeout: 60000 });

    const mode = await page.evaluate(() => {
      return document.querySelector('[data-motion-track]')?.getAttribute('data-motion-mode');
    });

    if (mode !== 'manual') {
      fail(`expected manual motion mode, got "${mode || 'missing'}"`);
    }

    await page.click('#root button');
    const samples = await collectTrackPositions(page);
    const missingSample = samples.find(sample => 'missing' in sample);
    if (missingSample) fail('track element is missing during manual transition');

    const distinctPositions = new Set(samples.map(sample => sample.left.toFixed(2)));
    if (distinctPositions.size < 4) {
      fail(`manual transition looks static, only ${distinctPositions.size} distinct positions recorded`);
    }

    const finalSample = samples.at(-1);
    if (!finalSample || Math.abs(finalSample.left + 390) > 8) {
      fail(`final landing position is unexpected: ${finalSample?.left ?? 'missing'}`);
    }

    const transitionProperties = new Set(samples.map(sample => sample.transitionProperty));
    if (![...transitionProperties].every(value => value === 'none' || value === 'all')) {
      fail(`manual mode still uses CSS transition: ${[...transitionProperties].join(', ')}`);
    }

    console.log(`YANDEX MOTION FALLBACK CHECK PASS: ${distinctPositions.size} distinct positions, final left ${finalSample.left}`);
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
