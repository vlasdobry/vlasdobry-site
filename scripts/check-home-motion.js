import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import puppeteer from 'puppeteer';

const PREVIEW_PORT = 4173;
const PREVIEW_URL = `http://127.0.0.1:${PREVIEW_PORT}/`;

function fail(message) {
  throw new Error(`MOTION CHECK FAIL: ${message}`);
}

async function waitForPreview(url, attempts = 40) {
  for (let index = 0; index < attempts; index += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Ignore until preview is ready.
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
      const track = document.querySelector('#root > div > div');
      if (!track) {
        return { elapsedMs, missing: true };
      }

      const rect = track.getBoundingClientRect();
      return {
        elapsedMs,
        left: Number(rect.left.toFixed(2)),
      };
    }, currentMs);

    samples.push(snapshot);
  }

  return samples;
}

async function run() {
  const preview = spawn('cmd.exe', ['/c', 'npm', 'run', 'preview', '--', '--host', '127.0.0.1', '--port', String(PREVIEW_PORT)], {
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
    await page.goto(`${PREVIEW_URL}?motionDebug=1`, { waitUntil: 'networkidle0', timeout: 60000 });

    const hasMotionDebugPanel = await page.evaluate(() => {
      return document.body.textContent?.includes('Motion Debug') ?? false;
    });

    if (hasMotionDebugPanel) {
      fail('debug overlay is rendered for ?motionDebug=1');
    }

    await page.click('#root button');
    const samples = await collectTrackPositions(page);

    const missingSample = samples.find(sample => 'missing' in sample);
    if (missingSample) {
      fail('track element is missing during transition');
    }

    const distinctPositions = new Set(samples.map(sample => sample.left.toFixed(2)));
    if (distinctPositions.size < 4) {
      fail(`transition looks static, only ${distinctPositions.size} distinct positions recorded`);
    }

    const finalSample = samples.at(-1);
    if (!finalSample || Math.abs(finalSample.left + 390) > 8) {
      fail(`final landing position is unexpected: ${finalSample?.left ?? 'missing'}`);
    }

    const currentHash = await page.evaluate(() => window.location.hash);
    if (currentHash !== '#landing') {
      fail(`hash did not switch to landing, got "${currentHash}"`);
    }

    console.log(`MOTION CHECK PASS: ${distinctPositions.size} distinct positions, final left ${finalSample.left}`);
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
