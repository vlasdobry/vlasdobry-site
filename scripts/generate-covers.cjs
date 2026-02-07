const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const articles = [
  {
    slug: 'audit-sajta-otelya-keys-rushotel',
    badge: 'Case Study',
    title: 'Hotel Website Audit:<br><span>Rus Hotel</span> (Sarapul)',
    subtitle: 'SEO audit of two websites, ad campaign analysis, and competitor research for a 3-star property.',
    stats: [
      { value: '3★', label: 'Hotel<br>Rating', color: '#fbbf24' },
      { value: '2', label: 'Sites<br>Audited', color: '#60a5fa' }
    ],
    accent: '#3b82f6',
    scoreLabel: null,
    category: 'marketing'
  },
  {
    slug: 'analiz-konkurentov-otelya-keys',
    badge: 'Case Study',
    title: 'Hotel Competitor<br>Analysis: <span>4★ Property</span>',
    subtitle: 'How to analyze hotel competitors, which metrics matter, and what to do with the findings.',
    stats: [
      { value: '4★', label: 'Hotel<br>Rating', color: '#fbbf24' },
      { value: '12', label: 'Competitors<br>Analyzed', color: '#60a5fa' }
    ],
    accent: '#8b5cf6',
    scoreLabel: null,
    category: 'marketing'
  },
  {
    slug: 'prioritizaciya-gorodov-seo-otelya',
    badge: 'Methodology',
    title: 'How to Prioritize<br>Cities for <span>Hotel SEO</span>',
    subtitle: 'A 4-tier prioritization framework using traffic quality metrics from real analytics data.',
    stats: [
      { value: '4', label: 'Priority<br>Tiers', color: '#fbbf24' },
      { value: '6', label: 'Quality<br>Metrics', color: '#60a5fa' }
    ],
    accent: '#10b981',
    scoreLabel: null,
    category: 'seo'
  },
  {
    slug: 'chto-takoe-geo-optimizaciya',
    badge: 'Guide',
    title: 'GEO Optimization:<br>Get Into <span>AI Answers</span>',
    subtitle: 'How to make ChatGPT, Perplexity, Gemini, and Claude recommend your business.',
    stats: [
      { value: '6', label: 'AI<br>Systems', color: '#a78bfa' },
      { value: '7', label: 'GEO<br>Factors', color: '#60a5fa' }
    ],
    accent: '#8b5cf6',
    scoreLabel: null,
    category: 'geo'
  },
  {
    slug: 'kak-proverit-seo-sayta',
    badge: 'Checklist',
    title: 'How to Check<br>Your <span>Website SEO</span>',
    subtitle: 'Free tools and a simple checklist. Find critical errors in 10 minutes.',
    stats: [
      { value: '8', label: 'Check<br>Points', color: '#fbbf24' },
      { value: '10m', label: 'Time<br>Needed', color: '#34d399' }
    ],
    accent: '#f59e0b',
    scoreLabel: null,
    category: 'seo'
  },
  {
    slug: 'schema-org-dlya-biznesa',
    badge: 'Technical Guide',
    title: '<span>Schema.org</span> for<br>Local Business',
    subtitle: 'Ready-to-use code examples for Hotel, LocalBusiness, FAQPage, and more.',
    stats: [
      { value: '6', label: 'Schema<br>Types', color: '#60a5fa' },
      { value: '✓', label: 'Copy-Paste<br>Code', color: '#34d399' }
    ],
    accent: '#06b6d4',
    scoreLabel: null,
    category: 'seo'
  },
  {
    slug: 'seo-dlya-oteley',
    badge: 'Step-by-Step',
    title: 'SEO for Hotels:<br><span>Where to Start</span> in 2026',
    subtitle: 'Technical SEO, local search, reputation management — the complete starting guide.',
    stats: [
      { value: '5', label: 'Key<br>Areas', color: '#fbbf24' },
      { value: '2026', label: 'Updated<br>For', color: '#60a5fa' }
    ],
    accent: '#10b981',
    scoreLabel: null,
    category: 'seo'
  }
];

const categoryColors = {
  seo: { bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.3)', text: '#93c5fd' },
  geo: { bg: 'rgba(139, 92, 246, 0.15)', border: 'rgba(139, 92, 246, 0.3)', text: '#c4b5fd' },
  marketing: { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)', text: '#fcd34d' }
};

function generateHtml(article) {
  const cat = categoryColors[article.category] || categoryColors.seo;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; overflow: hidden; font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; }
  .cover {
    width: 1200px; height: 630px;
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
    position: relative; display: flex; align-items: center;
    padding: 60px 80px; gap: 60px;
  }
  .cover::before {
    content: ''; position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px);
    background-size: 40px 40px;
  }
  .cover::after {
    content: ''; position: absolute; top: -100px; right: -100px;
    width: 500px; height: 500px;
    background: radial-gradient(circle, ${article.accent}14 0%, transparent 70%);
    border-radius: 50%;
  }
  .left { flex: 1; z-index: 1; }
  .badge {
    display: inline-block;
    background: ${cat.bg}; border: 1px solid ${cat.border}; color: ${cat.text};
    font-size: 14px; font-weight: 600; letter-spacing: 1.5px;
    text-transform: uppercase; padding: 6px 16px; border-radius: 6px;
    margin-bottom: 28px;
  }
  .title {
    color: #f1f5f9; font-size: 44px; font-weight: 700;
    line-height: 1.2; margin-bottom: 24px; max-width: 600px;
  }
  .title span { color: ${article.accent}; }
  .subtitle {
    color: #94a3b8; font-size: 18px; line-height: 1.5; max-width: 520px;
  }
  .right { width: 340px; z-index: 1; display: flex; flex-direction: column; gap: 16px; }
  .icon-area {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px; padding: 40px 32px; text-align: center;
    display: flex; align-items: center; justify-content: center; gap: 12px;
  }
  .icon-area .bracket { font-size: 64px; color: ${article.accent}; font-weight: 300; opacity: 0.6; }
  .icon-area .category-text {
    font-size: 28px; font-weight: 700; color: ${article.accent};
    text-transform: uppercase; letter-spacing: 3px;
  }
  .stats { display: flex; gap: 12px; }
  .stat {
    flex: 1; background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px; padding: 18px 16px; text-align: center;
  }
  .stat-value { font-size: 28px; font-weight: 700; line-height: 1; margin-bottom: 6px; }
  .stat-label { color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; line-height: 1.3; }
  .brand {
    position: absolute; bottom: 28px; left: 80px;
    display: flex; align-items: center; gap: 10px; z-index: 1;
  }
  .brand-dot { width: 8px; height: 8px; background: #3b82f6; border-radius: 50%; }
  .brand-text { color: #475569; font-size: 14px; font-weight: 500; letter-spacing: 0.5px; }
</style>
</head>
<body>
  <div class="cover">
    <div class="left">
      <div class="badge">${article.badge}</div>
      <div class="title">${article.title}</div>
      <div class="subtitle">${article.subtitle}</div>
    </div>
    <div class="right">
      <div class="icon-area">
        <span class="bracket">{</span>
        <span class="category-text">${article.category}</span>
        <span class="bracket">}</span>
      </div>
      <div class="stats">
        <div class="stat">
          <div class="stat-value" style="color:${article.stats[0].color}">${article.stats[0].value}</div>
          <div class="stat-label">${article.stats[0].label}</div>
        </div>
        <div class="stat">
          <div class="stat-value" style="color:${article.stats[1].color}">${article.stats[1].value}</div>
          <div class="stat-label">${article.stats[1].label}</div>
        </div>
      </div>
    </div>
    <div class="brand">
      <div class="brand-dot"></div>
      <div class="brand-text">vlasdobry.ru</div>
    </div>
  </div>
</body>
</html>`;
}

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });

  const contentDir = path.join(__dirname, '..', 'content', 'blog');
  const publicDir = path.join(__dirname, '..', 'public', 'blog');

  for (const article of articles) {
    const html = generateHtml(article);
    await page.setContent(html, { waitUntil: 'load', timeout: 10000 });

    // Save to content/blog/[slug]/
    const contentPath = path.join(contentDir, article.slug, 'cover.jpg');
    await page.screenshot({
      path: contentPath, type: 'jpeg', quality: 92,
      clip: { x: 0, y: 0, width: 1200, height: 630 }
    });

    // Copy to public/blog/[slug]/
    const publicArticleDir = path.join(publicDir, article.slug);
    fs.mkdirSync(publicArticleDir, { recursive: true });
    fs.copyFileSync(contentPath, path.join(publicArticleDir, 'cover.jpg'));

    console.log(`✓ ${article.slug}`);
  }

  await browser.close();
  console.log(`\nDone: ${articles.length} covers generated`);
})();
