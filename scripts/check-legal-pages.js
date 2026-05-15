import { readFileSync, existsSync } from 'fs';

const read = (path) => readFileSync(path, 'utf8');
const failures = [];

const expectFile = (path) => {
  if (!existsSync(path)) failures.push(`Missing file: ${path}`);
};

const expectIncludes = (path, text) => {
  if (!read(path).includes(text)) failures.push(`${path} must include: ${text}`);
};

const expectExcludes = (path, text) => {
  if (read(path).includes(text)) failures.push(`${path} must not include: ${text}`);
};

const files = ['about.html', 'privacy.html', 'terms.html', 'about-en.html', 'privacy-en.html', 'terms-en.html'];

for (const file of files) expectFile(file);
expectFile('src/components/CookieNotice.tsx');
expectFile('public/cookie-notice.js');

// about
expectIncludes('about.html', 'Влас Фёдоров');
expectIncludes('about.html', 'vlas@vlasdobry.ru');
expectIncludes('about-en.html', 'Vlas Fedorov');
expectIncludes('about-en.html', 'vlas@vlasdobry.ru');

// privacy RU
expectIncludes('privacy.html', 'Политика обработки персональных данных');
expectIncludes('privacy.html', 'Фёдоров Влас Павлович');
expectIncludes('privacy.html', 'Яндекс.Метрика');
expectIncludes('privacy.html', 'cookies');
expectIncludes('privacy.html', 'localStorage');
expectIncludes('privacy.html', 'Правовые основания обработки');
expectIncludes('privacy.html', 'Категории субъектов');
expectIncludes('privacy.html', 'Меры защиты');
expectIncludes('privacy.html', 'Локализация');
expectIncludes('privacy.html', 'Трансграничная передача');
expectIncludes('privacy.html', 'Яндекс.Метрика загружается при посещении сайта');

// privacy EN
expectIncludes('privacy-en.html', 'Privacy Policy');
expectIncludes('privacy-en.html', 'Vlas Pavlovich Fedorov');
expectIncludes('privacy-en.html', 'Yandex Metrica');
expectIncludes('privacy-en.html', 'cookies');
expectIncludes('privacy-en.html', 'localStorage');
expectIncludes('privacy-en.html', 'Legal Basis');
expectIncludes('privacy-en.html', 'Categories of Data Subjects');
expectIncludes('privacy-en.html', 'Security Measures');
expectIncludes('privacy-en.html', 'Localization');
expectIncludes('privacy-en.html', 'Cross-Border Transfer');
expectIncludes('privacy-en.html', 'Yandex Metrica loads when the site is visited');

// cookie banner
expectIncludes('public/cookie-notice.js', 'Согласен');
expectIncludes('public/cookie-notice.js', 'I agree');
expectIncludes('public/cookie-notice.js', "isEnglish ? '/en/privacy/' : '/privacy/'");
expectIncludes('public/cookie-notice.js', 'This site uses cookies');
expectIncludes('public/cookie-notice.js', 'Сайт использует cookies');
expectIncludes('src/components/CookieNotice.tsx', 'CookieNotice');

// cookie-notice.js on every static page
for (const file of files) {
  expectIncludes(file, '/cookie-notice.js');
}

// forbidden strings on all legal pages
for (const file of files) {
  expectExcludes(file, 'Google Ads API');
  expectExcludes(file, 'Google API Services User Data Policy');
  expectExcludes(file, 'Limited Use');
  expectExcludes(file, 'OAuth');
  expectExcludes(file, 'самозанят');
  expectExcludes(file, 'Самозанят');
  expectExcludes(file, 'налога на профессиональный доход');
  expectExcludes(file, 'self-employed');
  expectExcludes(file, 'professional income');
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('Legal pages check passed');
