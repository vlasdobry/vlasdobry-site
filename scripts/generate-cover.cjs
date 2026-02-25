/**
 * Blog cover generator — matches existing vlasdobry.ru cover pattern.
 * Usage: node scripts/generate-cover.cjs [options]
 *
 * Example:
 *   node scripts/generate-cover.cjs \
 *     --badge "CHECKLIST" \
 *     --title1 "Law 168-FZ:" \
 *     --title2 "Website Checklist" \
 *     --subtitle "What to change before March 1, 2026." \
 *     --keyword "168-FZ" \
 *     --stat1-value "500K₽" --stat1-label "MAX FINE" \
 *     --stat2-value "Mar 1" --stat2-label "DEADLINE" \
 *     --accent "#ef4444" \
 *     --output "content/blog/168-fz-zakon-o-russkom-yazyke-sajt/cover.jpg"
 */

const puppeteer = require('puppeteer');
const path = require('path');

// Parse CLI args
const args = process.argv.slice(2);
function getArg(name, fallback) {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : fallback;
}

const badge = getArg('badge', 'GUIDE');
const title1 = getArg('title1', 'Title Line 1');
const title2 = getArg('title2', 'Accent Line');
const subtitle = getArg('subtitle', 'Subtitle text goes here.');
const keyword = getArg('keyword', 'SEO');
const stat1Value = getArg('stat1-value', '8');
const stat1Label = getArg('stat1-label', 'CHECKS');
const stat2Value = getArg('stat2-value', '10m');
const stat2Label = getArg('stat2-label', 'TIME');
const accent = getArg('accent', '#8b5cf6');
const output = getArg('output', 'cover.jpg');

const WIDTH = 2400;
const HEIGHT = 1260;

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    background: linear-gradient(135deg, #0c1220 0%, #111b2e 40%, #0f1729 70%, #141e33 100%);
    font-family: 'Inter', -apple-system, sans-serif;
    color: white;
    display: flex;
    overflow: hidden;
    position: relative;
  }

  /* Subtle noise/grain overlay */
  body::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 70% 30%, rgba(100,140,200,0.06) 0%, transparent 60%),
                radial-gradient(ellipse at 20% 80%, rgba(80,120,180,0.04) 0%, transparent 50%);
    pointer-events: none;
  }

  .left {
    flex: 1;
    padding: 120px 80px 80px 120px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    max-width: 58%;
  }

  .badge {
    display: inline-block;
    padding: 10px 28px;
    border: 2px solid ${accent};
    border-radius: 30px;
    font-size: 22px;
    font-weight: 700;
    letter-spacing: 2px;
    color: ${accent};
    margin-bottom: 48px;
    width: fit-content;
  }

  .title1 {
    font-size: 82px;
    font-weight: 800;
    line-height: 1.1;
    color: #ffffff;
    letter-spacing: -1px;
  }

  .title2 {
    font-size: 82px;
    font-weight: 800;
    line-height: 1.1;
    color: ${accent};
    letter-spacing: -1px;
    margin-bottom: 36px;
  }

  .subtitle {
    font-size: 30px;
    font-weight: 400;
    color: rgba(255,255,255,0.5);
    line-height: 1.5;
    max-width: 600px;
  }

  .right {
    width: 42%;
    padding: 120px 120px 80px 40px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 24px;
  }

  .glass-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 24px;
    backdrop-filter: blur(10px);
  }

  .main-card {
    width: 480px;
    height: 240px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
  }

  .brace {
    font-size: 120px;
    font-weight: 300;
    color: ${accent};
    opacity: 0.7;
    line-height: 1;
  }

  .keyword-text {
    font-size: 56px;
    font-weight: 700;
    color: ${accent};
    letter-spacing: 6px;
    opacity: 0.9;
  }

  .stats-row {
    display: flex;
    gap: 24px;
    width: 480px;
  }

  .stat-card {
    flex: 1;
    height: 160px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }

  .stat-value {
    font-size: 52px;
    font-weight: 800;
    color: ${accent};
  }

  .stat-label {
    font-size: 18px;
    font-weight: 600;
    color: rgba(255,255,255,0.4);
    letter-spacing: 2px;
    text-align: center;
  }

  .footer {
    position: absolute;
    bottom: 60px;
    left: 120px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .footer-dot {
    width: 12px;
    height: 12px;
    background: #10b981;
    border-radius: 50%;
  }

  .footer-text {
    font-size: 24px;
    font-weight: 400;
    color: rgba(255,255,255,0.35);
  }
</style>
</head>
<body>
  <div class="left">
    <div class="badge">${badge}</div>
    <div class="title1">${title1}</div>
    <div class="title2">${title2}</div>
    <div class="subtitle">${subtitle}</div>
  </div>
  <div class="right">
    <div class="glass-card main-card">
      <span class="brace">{</span>
      <span class="keyword-text">${keyword}</span>
      <span class="brace">}</span>
    </div>
    <div class="stats-row">
      <div class="glass-card stat-card">
        <div class="stat-value">${stat1Value}</div>
        <div class="stat-label">${stat1Label}</div>
      </div>
      <div class="glass-card stat-card">
        <div class="stat-value">${stat2Value}</div>
        <div class="stat-label">${stat2Label}</div>
      </div>
    </div>
  </div>
  <div class="footer">
    <div class="footer-dot"></div>
    <div class="footer-text">vlasdobry.ru</div>
  </div>
</body>
</html>`;

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const outputPath = path.resolve(output);

  if (outputPath.endsWith('.png')) {
    await page.screenshot({ path: outputPath, type: 'png' });
  } else {
    await page.screenshot({ path: outputPath, type: 'jpeg', quality: 90 });
  }

  await browser.close();
  console.log(`Cover generated: ${outputPath}`);
})();
