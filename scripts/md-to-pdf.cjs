const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Simple markdown to HTML converter
function mdToHtml(md) {
  let html = md;

  // Code blocks with language
  html = html.replace(/```(\w+)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>');
  // Code blocks without language
  html = html.replace(/```\n?([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Bold and italic
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr>');

  // Tables
  const tableRegex = /\|(.+)\|\n\|[-:| ]+\|\n((?:\|.+\|\n?)+)/g;
  html = html.replace(tableRegex, (match, header, body) => {
    const headers = header.split('|').filter(h => h.trim()).map(h => `<th>${h.trim()}</th>`).join('');
    const rows = body.trim().split('\n').map(row => {
      const cells = row.split('|').filter(c => c.trim()).map(c => `<td>${c.trim()}</td>`).join('');
      return `<tr>${cells}</tr>`;
    }).join('');
    return `<table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
  });

  // Checkbox lists
  html = html.replace(/^- \[ \] (.+)$/gm, '<li class="todo">☐ $1</li>');
  html = html.replace(/^- \[x\] (.+)$/gm, '<li class="todo done">☑ $1</li>');

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');

  // Wrap consecutive li elements in ul
  html = html.replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ul>$&</ul>');

  // Paragraphs (lines that aren't already wrapped)
  const lines = html.split('\n');
  const result = [];
  for (const line of lines) {
    if (line.trim() &&
        !line.startsWith('<') &&
        !line.match(/^\s*$/) &&
        !line.includes('|')) {
      result.push(`<p>${line}</p>`);
    } else {
      result.push(line);
    }
  }

  return result.join('\n');
}

async function convertToPdf(mdPath, pdfPath) {
  const md = fs.readFileSync(mdPath, 'utf-8');
  const htmlContent = mdToHtml(md);

  const fullHtml = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <style>
    @page { margin: 2cm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #333;
      max-width: 100%;
    }
    h1 { font-size: 24pt; color: #1a1a1a; border-bottom: 2px solid #333; padding-bottom: 10px; margin-top: 0; }
    h2 { font-size: 16pt; color: #2a2a2a; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-top: 25px; }
    h3 { font-size: 13pt; color: #3a3a3a; margin-top: 20px; }
    table { border-collapse: collapse; width: 100%; margin: 15px 0; font-size: 10pt; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background: #f5f5f5; font-weight: 600; }
    tr:nth-child(even) { background: #fafafa; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-family: Consolas, monospace; font-size: 10pt; }
    pre { background: #f8f8f8; padding: 15px; border-radius: 5px; overflow-x: auto; border: 1px solid #e0e0e0; }
    pre code { background: none; padding: 0; font-size: 9pt; }
    blockquote { border-left: 4px solid #ddd; margin: 15px 0; padding: 10px 20px; background: #f9f9f9; font-style: italic; }
    ul { padding-left: 25px; }
    li { margin: 5px 0; }
    li.todo { list-style: none; margin-left: -20px; }
    hr { border: none; border-top: 1px solid #ddd; margin: 30px 0; }
    a { color: #0066cc; }
    .emoji { font-family: "Segoe UI Emoji", "Apple Color Emoji", sans-serif; }
    strong { color: #1a1a1a; }
  </style>
</head>
<body>
${htmlContent}
</body>
</html>`;

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '2cm', right: '2cm', bottom: '2cm', left: '2cm' }
  });
  await browser.close();

  console.log(`PDF created: ${pdfPath}`);
}

const mdPath = process.argv[2] || 'docs/audit-grace-lazure-full-2026-01-31.md';
const pdfPath = process.argv[3] || mdPath.replace('.md', '.pdf');

convertToPdf(mdPath, pdfPath).catch(console.error);
