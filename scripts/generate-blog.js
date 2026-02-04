import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import { marked } from 'marked';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.join(__dirname, '..', 'content', 'blog');
const publicDir = path.join(__dirname, '..', 'public');
const distDir = path.join(__dirname, '..', 'dist');

// Extract built asset paths from compiled blog-post.html
function getBuiltAssets() {
  const blogPostHtmlPath = path.join(distDir, 'blog-post.html');
  if (!fs.existsSync(blogPostHtmlPath)) {
    // Pre-build: return dev paths
    return {
      css: '<link rel="stylesheet" href="/index.css">',
      scripts: '<script type="module" src="/src/blog-post-index.tsx"></script>'
    };
  }

  const html = fs.readFileSync(blogPostHtmlPath, 'utf-8');

  // Extract CSS link (with crossorigin attribute)
  const cssMatch = html.match(/<link rel="stylesheet"[^>]*href="[^"]+assets[^"]+\.css"[^>]*>/);
  const css = cssMatch ? cssMatch[0] : '<link rel="stylesheet" href="/index.css">';

  // Extract all script tags for assets
  const scriptMatches = html.match(/<script type="module"[^>]*src="\/assets\/[^"]+"><\/script>/g) || [];
  const scripts = scriptMatches.join('\n  ');

  return { css, scripts };
}

// Configure marked for GFM
marked.use({ gfm: true });

function calculateReadingTime(content) {
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / 200);
}

function generateSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\sа-яё-]/gi, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function generateToc(content) {
  const toc = [];
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    // Skip FAQ heading
    if (text.toLowerCase() === 'faq' || text === 'Частые вопросы') continue;

    toc.push({ id: generateSlug(text), text, level });
  }

  return toc;
}

function extractTldr(content) {
  const match = content.match(/\*\*TL;DR:\*\*\s*(.+?)(?=\n\n|\n#)/s);
  if (match) {
    return match[1].trim();
  }
  return null;
}

function extractFaq(content) {
  const faqSection = content.match(/##\s*(?:FAQ|Частые вопросы)\s*\n([\s\S]*?)(?=\n##\s|$)/);
  if (!faqSection) return [];

  const faq = [];
  const faqContent = faqSection[1];
  const questionRegex = /\*\*(.+?)\?\*\*\s*\n(.+?)(?=\n\*\*|\n\n##|$)/gs;
  let match;

  while ((match = questionRegex.exec(faqContent)) !== null) {
    faq.push({
      question: match[1].trim() + '?',
      answer: match[2].trim(),
    });
  }

  return faq;
}

function addHeaderIds(html) {
  // Add id attributes to h2 and h3 tags
  return html.replace(/<(h[23])>(.+?)<\/h[23]>/g, (match, tag, text) => {
    const id = generateSlug(text.replace(/<[^>]+>/g, '')); // Remove any HTML tags
    return `<${tag} id="${id}">${text}</${tag}>`;
  });
}

function wrapTables(html) {
  // Wrap tables in scrollable container for mobile
  return html.replace(/<table>/g, '<div class="table-wrapper"><table>')
             .replace(/<\/table>/g, '</table></div>');
}

function processArticle(slug, lang) {
  const mdPath = path.join(contentDir, slug, `${lang}.md`);
  if (!fs.existsSync(mdPath)) return null;

  const fileContent = fs.readFileSync(mdPath, 'utf-8');
  const { data, content } = matter(fileContent);

  // Remove TL;DR from content (it's displayed separately)
  let cleanedContent = content.replace(/\*\*TL;DR:\*\*\s*.+?(?=\n\n|\n#)/s, '').trim();

  // Remove FAQ section from content (it's displayed as interactive accordion)
  cleanedContent = cleanedContent.replace(/##\s*(?:FAQ|Частые вопросы)\s*\n[\s\S]*?(?=\n##\s|$)/, '').trim();

  let html = marked.parse(cleanedContent);
  html = addHeaderIds(html);
  html = wrapTables(html);

  return {
    slug: data.slug || slug,
    title: data.title,
    description: data.description,
    date: data.date instanceof Date ? data.date.toISOString().split('T')[0] : data.date,
    dateModified: data.dateModified instanceof Date
      ? data.dateModified.toISOString().split('T')[0]
      : (data.dateModified || data.date),
    category: data.category,
    tags: data.tags || [],
    relatedService: data.relatedService,
    cover: data.cover || 'cover.jpg',
    series: data.series || null,
    readingTime: calculateReadingTime(content),
    toc: generateToc(content),
    hasFaq: extractFaq(content).length > 0,
    content: html,
    faq: extractFaq(content),
    tldr: extractTldr(content),
    llmsSummary: data.llmsSummary || null,
  };
}

function generateArticleSchema(article, lang) {
  const baseUrl = 'https://vlasdobry.ru';
  const articleUrl = lang === 'ru'
    ? `${baseUrl}/blog/${article.slug}/`
    : `${baseUrl}/en/blog/${article.slug}/`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.description,
    "image": `${baseUrl}/blog/${article.slug}/${article.cover}`,
    "author": {
      "@type": "Person",
      "name": lang === 'ru' ? "Влас Фёдоров" : "Vlas Fedorov",
      "url": baseUrl
    },
    "publisher": {
      "@type": "Person",
      "name": lang === 'ru' ? "Влас Фёдоров" : "Vlas Fedorov",
      "url": baseUrl
    },
    "datePublished": article.date,
    "dateModified": article.dateModified,
    "mainEntityOfPage": articleUrl,
    "articleSection": article.category.toUpperCase(),
    "keywords": article.tags
  };

  return JSON.stringify(schema, null, 2);
}

function generateBreadcrumbSchema(article, lang) {
  const baseUrl = 'https://vlasdobry.ru';
  const blogUrl = lang === 'ru' ? `${baseUrl}/blog/` : `${baseUrl}/en/blog/`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": lang === 'ru' ? "Главная" : "Home", "item": lang === 'ru' ? baseUrl : `${baseUrl}/en/` },
      { "@type": "ListItem", "position": 2, "name": lang === 'ru' ? "Блог" : "Blog", "item": blogUrl },
      { "@type": "ListItem", "position": 3, "name": article.title }
    ]
  };

  return JSON.stringify(schema, null, 2);
}

function generateFaqSchema(article) {
  if (!article.faq || article.faq.length === 0) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": article.faq.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };

  return JSON.stringify(schema, null, 2);
}

function generateNoscriptContent(article, lang) {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  let faqHtml = '';
  if (article.faq && article.faq.length > 0) {
    faqHtml = `
            <h2>${lang === 'ru' ? 'Частые вопросы' : 'FAQ'}</h2>
            <dl>
              ${article.faq.map(item => `
                <dt><strong>${item.question}</strong></dt>
                <dd>${item.answer}</dd>
              `).join('')}
            </dl>`;
  }

  return `
        <main style="max-width: 800px; margin: 0 auto; padding: 40px 20px; font-family: Inter, sans-serif;">
            <article>
                <h1>${article.title}</h1>
                <p>${lang === 'ru' ? 'Опубликовано' : 'Published'}: ${formatDate(article.date)} · ${article.readingTime} ${lang === 'ru' ? 'мин' : 'min'}</p>
                ${article.tldr ? `<p><strong>${lang === 'ru' ? 'Кратко' : 'TL;DR'}:</strong> ${article.tldr}</p>` : ''}

                ${article.content}

                ${faqHtml}

                <p>${lang === 'ru' ? 'Автор' : 'Author'}: ${lang === 'ru' ? 'Влас Фёдоров' : 'Vlas Fedorov'} · <a href="https://vlasdobry.ru">vlasdobry.ru</a></p>
            </article>
            <nav>
                <p><a href="${lang === 'ru' ? '/blog/' : '/en/blog/'}">${lang === 'ru' ? '← Все статьи' : '← All articles'}</a></p>
            </nav>
        </main>`;
}

function generateArticleHtml(article, lang) {
  const assets = getBuiltAssets();
  const baseUrl = 'https://vlasdobry.ru';
  const articleUrl = lang === 'ru'
    ? `${baseUrl}/blog/${article.slug}/`
    : `${baseUrl}/en/blog/${article.slug}/`;
  const altLangUrl = lang === 'ru'
    ? `${baseUrl}/en/blog/${article.slug}/`
    : `${baseUrl}/blog/${article.slug}/`;

  const faqSchema = generateFaqSchema(article);

  return `<!DOCTYPE html>
<html lang="${lang === 'ru' ? 'ru' : 'en'}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light only">
    <title>${article.title} | ${lang === 'ru' ? 'Влас Фёдоров' : 'Vlas Fedorov'}</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">

    <!-- Yandex.Metrika counter -->
    <script type="text/javascript">
        (function(m,e,t,r,i,k,a){
            m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();
            for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
            k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
        })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=106407494', 'ym');
        ym(106407494, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});
    </script>
    <!-- /Yandex.Metrika counter -->

    <!-- SEO -->
    <meta name="description" content="${article.description}">
    <meta name="author" content="${lang === 'ru' ? 'Влас Фёдоров' : 'Vlas Fedorov'}">
    <meta name="keywords" content="${article.tags.join(', ')}">

    <!-- Canonical & Hreflang -->
    <link rel="canonical" href="${articleUrl}">
    <link rel="alternate" hreflang="ru" href="${lang === 'ru' ? articleUrl : altLangUrl}">
    <link rel="alternate" hreflang="en" href="${lang === 'en' ? articleUrl : altLangUrl}">
    <link rel="alternate" hreflang="x-default" href="${baseUrl}/blog/${article.slug}/">

    <!-- LLMs instructions file -->
    <link rel="alternate" type="text/plain" href="${baseUrl}/llms.txt" title="LLMs Information">

    <!-- Open Graph -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="${articleUrl}">
    <meta property="og:title" content="${article.title}">
    <meta property="og:description" content="${article.description}">
    <meta property="og:image" content="${baseUrl}/blog/${article.slug}/${article.cover}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:locale" content="${lang === 'ru' ? 'ru_RU' : 'en_US'}">
    <meta property="article:published_time" content="${article.date}">
    <meta property="article:modified_time" content="${article.dateModified}">
    <meta property="article:author" content="${lang === 'ru' ? 'Влас Фёдоров' : 'Vlas Fedorov'}">
    <meta property="article:section" content="${article.category.toUpperCase()}">
    ${article.tags.map(tag => `<meta property="article:tag" content="${tag}">`).join('\n    ')}

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${article.title}">
    <meta name="twitter:description" content="${article.description}">
    <meta name="twitter:image" content="${baseUrl}/blog/${article.slug}/${article.cover}">

    <!-- Schema.org JSON-LD: Article -->
    <script type="application/ld+json">
    ${generateArticleSchema(article, lang)}
    </script>

    <!-- Schema.org JSON-LD: BreadcrumbList -->
    <script type="application/ld+json">
    ${generateBreadcrumbSchema(article, lang)}
    </script>

    ${faqSchema ? `<!-- Schema.org JSON-LD: FAQPage -->
    <script type="application/ld+json">
    ${faqSchema}
    </script>` : ''}

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;700;900&display=swap" rel="stylesheet">

    <style>
        body {
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 0;
            overflow-x: hidden;
            background-color: #FFFFFF;
            color: #121212;
        }
    </style>
<script type="importmap">
{
  "imports": {
    "lucide-react": "https://esm.sh/lucide-react@^0.562.0",
    "react/": "https://esm.sh/react@^19.2.3/",
    "react": "https://esm.sh/react@^19.2.3",
    "react-dom/": "https://esm.sh/react-dom@^19.2.3/"
  }
}
</script>
  ${assets.scripts}
  ${assets.css}
</head>
<body>
    <noscript>
        <div><img src="https://mc.yandex.ru/watch/106407494" style="position:absolute; left:-9999px;" alt="" /></div>
        ${generateNoscriptContent(article, lang)}
    </noscript>
    <div id="root"></div>
</body>
</html>`;
}

// ============================================
// AUTO-UPDATE: sitemap.xml, llms.txt, llms-full.txt
// ============================================

function generateSitemapBlogSection(articles) {
  const baseUrl = 'https://vlasdobry.ru';
  const today = new Date().toISOString().split('T')[0];

  let xml = '';

  // Blog index pages
  xml += `  <!-- BLOG_START -->
  <url>
    <loc>${baseUrl}/blog/</loc>
    <lastmod>${today}</lastmod>
    <xhtml:link rel="alternate" hreflang="ru" href="${baseUrl}/blog/"/>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/en/blog/"/>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/en/blog/</loc>
    <lastmod>${today}</lastmod>
    <xhtml:link rel="alternate" hreflang="ru" href="${baseUrl}/blog/"/>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/en/blog/"/>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>\n`;

  // Individual articles
  for (const article of articles) {
    xml += `  <url>
    <loc>${baseUrl}/blog/${article.slug}/</loc>
    <lastmod>${article.dateModified}</lastmod>
    <xhtml:link rel="alternate" hreflang="ru" href="${baseUrl}/blog/${article.slug}/"/>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/en/blog/${article.slug}/"/>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${baseUrl}/en/blog/${article.slug}/</loc>
    <lastmod>${article.dateModified}</lastmod>
    <xhtml:link rel="alternate" hreflang="ru" href="${baseUrl}/blog/${article.slug}/"/>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/en/blog/${article.slug}/"/>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>\n`;
  }

  xml += '  <!-- BLOG_END -->';
  return xml;
}

function updateSitemap(articles) {
  const sitemapPath = path.join(publicDir, 'sitemap.xml');
  let sitemap = fs.readFileSync(sitemapPath, 'utf-8');

  const blogSection = generateSitemapBlogSection(articles);

  // Check if markers exist
  if (sitemap.includes('<!-- BLOG_START -->')) {
    // Replace existing blog section
    sitemap = sitemap.replace(
      /\s*<!-- BLOG_START -->[\s\S]*<!-- BLOG_END -->/,
      '\n' + blogSection
    );
  } else {
    // Add before </urlset>
    sitemap = sitemap.replace('</urlset>', blogSection + '\n</urlset>');
  }

  fs.writeFileSync(sitemapPath, sitemap);
  console.log(`Updated sitemap.xml with ${articles.length} blog articles`);
}

function generateLlmsTxtBlogSection(articles) {
  let section = '### Recent Articles\n';

  for (const article of articles) {
    // Use EN title/description for llms.txt
    section += `- /blog/${article.slug}/ - ${article.description}\n`;
  }

  section += `
### Topics Covered
- Technical SEO and on-page optimization
- GEO (Generative Engine Optimization) for AI search
- Industry-specific marketing (hotels, labs, SPA)
- Local SEO for Russian and international markets

Browse all: /blog/
Browse all (EN): /en/blog/`;

  return section;
}

function updateLlmsTxt(enArticles) {
  const llmsPath = path.join(publicDir, 'llms.txt');
  let llms = fs.readFileSync(llmsPath, 'utf-8');

  const blogSection = generateLlmsTxtBlogSection(enArticles);

  // Replace section from "### Recent Articles" to next "##" or "Browse all (EN)"
  llms = llms.replace(
    /### Recent Articles[\s\S]*?Browse all \(EN\): \/en\/blog\//,
    blogSection
  );

  fs.writeFileSync(llmsPath, llms);
  console.log(`Updated llms.txt with ${enArticles.length} blog articles`);
}

function generateLlmsFullArticleEntry(article) {
  let entry = `### ${article.title}
**URL:** /blog/${article.slug}/
**Category:** ${article.category.toUpperCase()}
**Date:** ${article.date}

`;

  // Use llmsSummary if available, otherwise generate from description + TL;DR + FAQ
  if (article.llmsSummary) {
    entry += article.llmsSummary;
  } else {
    entry += article.description + '\n';

    if (article.tldr) {
      entry += `\nKey insight: ${article.tldr}\n`;
    }

    if (article.faq && article.faq.length > 0) {
      entry += '\nFAQ:\n';
      for (const item of article.faq) {
        entry += `- ${item.question} ${item.answer}\n`;
      }
    }
  }

  return entry;
}

function updateLlmsFullTxt(enArticles) {
  const llmsFullPath = path.join(publicDir, 'llms-full.txt');
  let llmsFull = fs.readFileSync(llmsFullPath, 'utf-8');

  // Update header with current date and article count
  const today = new Date().toISOString().split('T')[0];
  llmsFull = llmsFull.replace(
    /> Last updated: .+/,
    `> Last updated: ${today} (${enArticles.length} articles)`
  );

  // Generate blog articles section
  let blogSection = '## 6. Blog Articles\n\n';
  for (const article of enArticles) {
    blogSection += generateLlmsFullArticleEntry(article) + '\n';
  }
  blogSection += `**Blog page:** https://vlasdobry.ru/blog/`;

  // Replace section from "## 6. Blog Articles" to "## 7." or "---" followed by "## 7"
  llmsFull = llmsFull.replace(
    /## 6\. Blog Articles[\s\S]*?\*\*Blog page:\*\* https:\/\/vlasdobry\.ru\/blog\//,
    blogSection
  );

  fs.writeFileSync(llmsFullPath, llmsFull);
  console.log(`Updated llms-full.txt with ${enArticles.length} blog articles`);
}

function generateBlogData() {
  if (!fs.existsSync(contentDir)) {
    console.log('No blog content directory found, skipping blog generation');
    // Create empty blog-data.json
    const emptyData = { ru: [], en: [] };
    fs.writeFileSync(path.join(publicDir, 'blog-data.json'), JSON.stringify(emptyData, null, 2));
    return;
  }

  const slugs = fs.readdirSync(contentDir).filter(f =>
    fs.statSync(path.join(contentDir, f)).isDirectory()
  );

  const ruArticles = [];
  const enArticles = [];

  for (const slug of slugs) {
    const ruArticle = processArticle(slug, 'ru');
    const enArticle = processArticle(slug, 'en');

    if (ruArticle) ruArticles.push(ruArticle);
    if (enArticle) enArticles.push(enArticle);
  }

  // Sort by date descending
  ruArticles.sort((a, b) => new Date(b.date) - new Date(a.date));
  enArticles.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Write blog data JSON to public/ (for dev server)
  fs.writeFileSync(
    path.join(publicDir, 'blog-data.json'),
    JSON.stringify({ ru: ruArticles, en: enArticles }, null, 2)
  );

  console.log(`Generated blog data: ${ruArticles.length} RU, ${enArticles.length} EN articles`);

  // Generate individual HTML files for each article (only during build)
  if (fs.existsSync(distDir)) {
    for (const article of ruArticles) {
      const articleDir = path.join(distDir, 'blog', article.slug);
      fs.mkdirSync(articleDir, { recursive: true });
      fs.writeFileSync(path.join(articleDir, 'index.html'), generateArticleHtml(article, 'ru'));
      console.log(`Generated: /blog/${article.slug}/index.html`);
    }

    for (const article of enArticles) {
      const articleDir = path.join(distDir, 'en', 'blog', article.slug);
      fs.mkdirSync(articleDir, { recursive: true });
      fs.writeFileSync(path.join(articleDir, 'index.html'), generateArticleHtml(article, 'en'));
      console.log(`Generated: /en/blog/${article.slug}/index.html`);
    }

    // Copy blog-data.json to dist as well
    fs.copyFileSync(
      path.join(publicDir, 'blog-data.json'),
      path.join(distDir, 'blog-data.json')
    );
  }

  // Update sitemap.xml, llms.txt, llms-full.txt
  updateSitemap(ruArticles);
  updateLlmsTxt(enArticles);
  updateLlmsFullTxt(enArticles);
}

generateBlogData();
