# План SEO и GEO оптимизации сайта vlasdobry.ru

## Статус: ВЫПОЛНЕНО

**Последнее обновление:** 2026-01-25

---

## Контекст

Веб-визитка маркетолога на React/Vite. Основная проблема — SPA рендерится на клиенте, контент невидим для поисковых роботов и AI-краулеров. Выполнена комплексная SEO и GEO (Generative Engine Optimization) оптимизация.

**Продакшен:**
- https://vlasdobry.ru (главная RU)
- https://vlasdobry.ru/en/ (главная EN)
- https://vlasdobry.ru/for-hotels (лендинг для отелей RU)
- https://vlasdobry.ru/en/for-hotels (лендинг для отелей EN)

---

## Часть 1: SEO-оптимизация (ВЫПОЛНЕНО)

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
- Статический SEO контент в `<noscript>` для краулеров
- Содержит все ключевые услуги, кейсы, контакты

### ✅ Задача 9: Оптимизировать изображения
**Файлы:** `public/vlas-photo.webp`, `src/components/Hero.tsx`
- Создана WebP версия (172KB vs 729KB — сжатие 76%)
- Добавлен `<picture>` с fallback

### ✅ Задача 10: Open Graph изображение
**Файл:** `index.html`
- Добавлены og:image:width и og:image:height

---

## Часть 2: GEO-оптимизация (ВЫПОЛНЕНО)

### ✅ Задача 11: Создать llms.txt
**Файл:** `public/llms.txt`
- Структурированная информация для AI-систем
- ASCII-only (без проблем с кодировкой)
- Содержит: контакты, экспертиза, результаты, клиенты, услуги

### ✅ Задача 12: Обновить robots.txt для AI-ботов
**Файл:** `public/robots.txt`
- GPTBot, ChatGPT-User (OpenAI)
- ClaudeBot, Claude-Web (Anthropic)
- Google-Extended
- PerplexityBot
- YandexBot
- И другие AI-краулеры

### ✅ Задача 13: Добавить FAQPage Schema.org
**Файл:** `index.html`
- 4 частых вопроса для AI-ответов
- Услуги, ниши, результаты, контакты

### ✅ Задача 14: Добавить ProfessionalService Schema.org
**Файл:** `index.html`
- areaServed: Russia, Kazakhstan, Belarus, Germany, USA
- serviceType: Performance Marketing, Growth Marketing, Digital Advertising, Analytics

### ✅ Задача 15: Расширить Person Schema.org
**Файл:** `index.html`
- alternateName (для EN-запросов)
- hasCredential (опыт)
- Расширенный knowsAbout (11 компетенций)
- availableLanguage в contactPoint

### ✅ Задача 16: Улучшить noscript fallback для GEO
**Файл:** `index.html`
- Добавлена методология (SOSTAC + PDCA)
- Добавлен FAQ раздел
- Больше цифр и фактов
- Расширенные описания кейсов

### ✅ Задача 17: Добавить ссылку на llms.txt
**Файл:** `index.html`
- `<link rel="alternate" type="text/plain" href="llms.txt">`

---

## Часть 3: Лендинг для отелей (ВЫПОЛНЕНО)

### ✅ Задача 18: Создать лендинг для отелей
**Файлы:** `for-hotels.html`, `for-hotels-en.html`, `src/components/HotelsLanding.tsx`
- Отдельные HTML-страницы для SEO
- Sticky header с плавным сжатием при скролле
- Hysteresis для предотвращения дёргания навигации

### ✅ Задача 19: Кросс-браузерная совместимость
**Файлы:** все HTML файлы
- Добавлен `<meta name="color-scheme" content="light only">`
- Предотвращает авто-затемнение в Яндекс Браузере

---

## Проверка после деплоя

### SEO
- [x] robots.txt доступен по https://vlasdobry.ru/robots.txt
- [x] sitemap.xml доступен по https://vlasdobry.ru/sitemap.xml
- [x] Яндекс.Вебмастер — верификация добавлена
- [ ] Google Search Console — подтвердить владение, отправить sitemap
- [ ] Lighthouse SEO score > 90
- [ ] Rich Results Test (Google) — проверить Schema.org
- [ ] Mobile-Friendly Test (Google)

### GEO
- [x] llms.txt доступен по https://vlasdobry.ru/llms.txt
- [x] AI-боты разрешены в robots.txt
- [ ] Тестирование в ChatGPT (20-30 промптов)
- [ ] Тестирование в Perplexity
- [ ] Тестирование в YandexGPT/Алиса
- [ ] Тестирование в GigaChat

---

## Целевые AI-системы

| AI | Статус | Приоритет |
|----|--------|-----------|
| ChatGPT | Разрешён | Высокий |
| Perplexity | Разрешён | Высокий |
| Google Gemini | Разрешён | Высокий |
| Claude | Разрешён | Средний |
| YandexGPT | Разрешён | Высокий (RU) |
| GigaChat | Разрешён | Высокий (RU) |

---

## Промпты для тестирования GEO

### ChatGPT / Perplexity / Claude
```
- "performance маркетолог фрилансер Россия"
- "настройка Яндекс Директ специалист"
- "growth маркетинг консультант"
- "fractional CMO for startups Russia"
- "маркетинг для отелей специалист"
```

### YandexGPT / Алиса
```
- "найди performance маркетолога"
- "кто настраивает контекстную рекламу"
- "специалист по Яндекс Директ"
- "маркетолог для гостиницы"
```

### GigaChat
```
- "посоветуй маркетолога для стартапа"
- "эксперт по performance маркетингу"
- "маркетинг для отелей"
```
