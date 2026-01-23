# План SEO-оптимизации сайта vlasdobry.ru

## Статус: ВЫПОЛНЕНО

**Дата выполнения:** 2026-01-23

---

## Контекст

Веб-визитка маркетолога на React/Vite. Основная проблема — SPA рендерится на клиенте, контент невидим для поисковых роботов. Требуется комплексная SEO-оптимизация для улучшения видимости в поисковых системах.

**Продакшен:** https://vlasdobry.ru

---

## Выполненные задачи

### ✅ Задача 1: Создать robots.txt
**Файл:** `public/robots.txt`

### ✅ Задача 2: Создать sitemap.xml
**Файл:** `public/sitemap.xml`

### ✅ Задача 3: Добавить canonical и hreflang в index.html
**Файл:** `index.html`

### ✅ Задача 4: Расширить Schema.org разметку
**Файл:** `index.html`
- Добавлены: url, image, sameAs, contactPoint

### ✅ Задача 5: Улучшить alt-тег изображения
**Файл:** `src/components/Hero.tsx`
- Было: `alt="Влас Федоров"`
- Стало: `alt="Влас Федоров — performance-маркетолог, специалист по платному трафику и growth-аналитике"`

### ✅ Задача 6: Добавить семантические HTML5 теги в Hero.tsx
**Файл:** `src/components/Hero.tsx`
- Корневой `<div>` → `<section aria-label="Главный экран">`
- Добавлен `role="img" aria-hidden="true"` к декоративным элементам

### ✅ Задача 7: Добавить семантические HTML5 теги в Landing.tsx
**Файл:** `src/components/Landing.tsx`
- Корневой `<div>` → `<main>`
- Добавлены `aria-labelledby` к секциям
- Кейсы обёрнуты в `<article>`

### ✅ Задача 8: SEO fallback контент
**Файл:** `index.html`
- Вместо prerender добавлен статический SEO контент в `<noscript>` для краулеров
- Содержит все ключевые услуги, кейсы, контакты

### ✅ Задача 9: Оптимизировать изображения
**Файлы:** `public/vlas-photo.webp`, `src/components/Hero.tsx`
- Создана WebP версия (172KB vs 729KB — сжатие 76%)
- Добавлен `<picture>` с fallback

### ✅ Задача 10: Open Graph изображение
**Файл:** `index.html`
- Добавлены og:image:width и og:image:height

---

## Проверка после деплоя

- [ ] robots.txt доступен по https://vlasdobry.ru/robots.txt
- [ ] sitemap.xml доступен по https://vlasdobry.ru/sitemap.xml
- [ ] Google Search Console — подтвердить владение, отправить sitemap
- [ ] Яндекс.Вебмастер — подтвердить владение, отправить sitemap
- [ ] Lighthouse SEO score > 90
- [ ] Rich Results Test (Google) — проверить Schema.org
- [ ] Проверить индексацию через `site:vlasdobry.ru` (через 1-2 недели)
- [ ] Mobile-Friendly Test (Google)
- [ ] PageSpeed Insights — Core Web Vitals

---

## Дополнительные рекомендации

После деплоя:
1. Зарегистрировать сайт в Google Search Console
2. Зарегистрировать сайт в Яндекс.Вебмастер
3. Настроить отслеживание целей в метрике (клики по контактам)
