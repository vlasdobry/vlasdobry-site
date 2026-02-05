# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Описание проекта

Веб-визитка маркетолога Власа Федорова — минималистичное портфолио с интерактивной навигацией между двумя основными экранами.

**Продакшен:** https://vlasdobry.ru (RU), https://vlasdobry.ru/en/ (EN)

## Правила

- Dev-сервер запускать только на порту 3000. Если занят — убить процесс и перезапустить.
- Чем проще тем лучше — оставлять только нужные фичи, надёжность важнее фишек.
- UX/UI: интерфейс должен быть интуитивно понятным.
- При поиске ошибок использовать скилл `superpowers:systematic-debugging`.

**Принципы кода:**
- **KISS** — простой линейный код
- **YAGNI** — только то, что нужно сейчас
- **DRY** — выносить при 3+ повторениях
- **SRP** — одна функция = одно действие

## Команды

```bash
npm install      # Установка зависимостей
npm run dev      # Запуск dev-сервера на порту 3000
npm run build    # Сборка для продакшена
npm run preview  # Просмотр сборки
git push origin master  # Деплой на продакшен (автоматически через GitHub Actions)
```

## Деплой

**Автоматический деплой через GitHub Actions:**
1. Push в `master` запускает два параллельных job'а:
   - **Сайт:** Docker-образ → GitHub Container Registry → SSH на сервер → `docker compose up -d`
   - **Worker:** Cloudflare Worker деплоится через wrangler

**Конфигурация:** `.github/workflows/deploy.yml`

**Секреты GitHub:**
- `SERVER_HOST` — IP сервера
- `SERVER_USER` — пользователь SSH
- `SERVER_SSH_KEY` — приватный SSH-ключ
- `CLOUDFLARE_API_TOKEN` — токен для деплоя Worker'а

## Архитектура

**Двухэкранная навигация:** Главная страница использует горизонтальный слайдер с двумя состояниями (`hero` | `landing`). Переключение осуществляется:
- Свайпом на мобильных устройствах
- Стрелками клавиатуры
- Кликом по боковым панелям-ручкам (glassmorphic handles)

**Структура страниц:**
- `/` — главная (RU): Hero + Landing
- `/en/` — главная (EN): Hero + Landing
- `/for-hotels` — лендинг для отелей (RU)
- `/en/for-hotels` — лендинг для отелей (EN)
- `/for-labs` — лендинг для ДНК-лабораторий (RU)
- `/en/for-labs` — лендинг для ДНК-лабораторий (EN)
- `/for-spa` — лендинг для СПА-комплексов (RU)
- `/en/for-spa` — лендинг для СПА-комплексов (EN)
- `/projects` — страница проектов (RU)
- `/en/projects` — страница проектов (EN)
- `/services/seo` — SEO-аудит (RU)
- `/en/services/seo` — SEO Audit (EN)
- `/services/geo` — GEO-оптимизация (RU)
- `/en/services/geo` — GEO Optimization (EN)
- `/blog` — блог со статьями (RU)
- `/en/blog` — блог со статьями (EN)
- `/blog/[slug]` — отдельная статья (RU)
- `/en/blog/[slug]` — отдельная статья (EN)

**Структура компонентов:**
- `src/App.tsx` — корневой компонент, управляет навигацией hero↔landing, свайпы, виброотклик
- `src/components/Hero.tsx` — главный экран с фото и заголовками
- `src/components/Landing.tsx` — лендинг с услугами, кейсами и контактами
- `src/components/IndustryLanding.tsx` — универсальный лендинг для отраслей (hotels, labs, spa)
- `src/components/ServiceLanding.tsx` — универсальный лендинг для услуг (SEO, GEO)
- `src/components/HealthScoreChecker.tsx` — виджет экспресс-диагностики сайта (8 параметров)
- `src/components/LanguageSwitcher.tsx` — переключатель языка
- `src/components/ProjectsLanding.tsx` — лендинг проектов (sticky header, карточки проектов)
- `src/components/BlogList.tsx` — список статей блога с карточками
- `src/components/BlogPost.tsx` — страница отдельной статьи
- `src/components/BlogCard.tsx` — карточка статьи для списка

**Health Score виджет:**
- Бесплатная экспресс-диагностика сайта (SEO: 8 параметров, GEO: 5 параметров)
- SEO проверяет: Title, Description, H1, Viewport, Indexability, robots.txt, sitemap.xml, Schema.org
- GEO проверяет: LLM Files (llms.txt + llms-full.txt), Schema.org, FAQ/Q&A, E-E-A-T сигналы, AI-доступность
- Использует Cloudflare Worker (`health-score-proxy.vlasdobry.workers.dev`) как CORS-прокси
- Таймаут 15 секунд с понятными сообщениями об ошибках
- Анимированный процесс сканирования с разными этапами для SEO и GEO
- Интегрирован в ServiceLanding для SEO и GEO страниц
- Трекинг в Яндекс.Метрику: старт, завершение, ошибки, клик по CTA

**Блог:**
- Markdown-статьи в `content/blog/[slug]/ru.md` и `en.md`
- Генерация HTML при сборке через `scripts/generate-blog.js`
- Entry point: `blog-post.html` (добавлен в vite.config.ts rollupOptions.input)
- Зависимости: `gray-matter` (frontmatter), `marked` (Markdown → HTML)
- Данные статей: `public/blog-data.json` (генерируется при билде)
- TL;DR и FAQ извлекаются из контента и отображаются отдельными блоками
- Schema.org Article + FAQPage разметка для каждой статьи
- Ссылка на блог только в футере всех страниц
- Авторинг: Claude пишет статьи, владелец утверждает

**Текущие статьи блога (7 шт):**
- `audit-sajta-otelya-keys-rushotel` — Экспресс-аудит сайта отеля: кейс Русь Отель (Сарапул)
- `prioritizaciya-gorodov-seo-otelya` — Как приоритизировать города для SEO-продвижения отеля
- `analiz-konkurentov-otelya-keys` — Анализ конкурентов для отеля: кейс Grace Luxor
- `chto-takoe-geo-optimizaciya` — GEO-оптимизация: как попасть в ответы ChatGPT
- `kak-proverit-seo-sayta` — Как проверить SEO сайта: чеклист из 8 пунктов
- `schema-org-dlya-biznesa` — Schema.org для локального бизнеса
- `seo-dlya-oteley` — SEO для отелей: с чего начать

**Стилизация:** Tailwind CSS v4 (через Vite plugin), шрифт Inter. Используется glassmorphism-эффект для UI-элементов.

**Мультиязычность (i18n):**
- URL-based routing: `/` (RU), `/en/` (EN)
- Самописная i18n-система в `src/i18n/` (KISS: без i18next)
- HTML файлы: `index.html`, `en.html`, `for-hotels.html`, `for-hotels-en.html`, `for-labs.html`, `for-labs-en.html`, `for-spa.html`, `for-spa-en.html`, `projects.html`, `projects-en.html`, `seo.html`, `seo-en.html`, `geo.html`, `geo-en.html`, `blog.html`, `blog-en.html`
- Переводы: `src/i18n/ru.ts`, `src/i18n/en.ts`

**Мобильные функции:**
- Виброотклик при свайпе (Vibration API, активируется через onTouchStart)
- Viewport height: `100svh` для корректного отображения в мобильных браузерах
- Адаптивные стили для portrait/landscape ориентаций

**Кросс-браузерная совместимость:**
- `<meta name="color-scheme" content="light only">` — предотвращает авто-затемнение в Яндекс Браузере
- Тонкие декоративные элементы (1-3px) могут плохо рендериться в некоторых браузерах

**SEO и аналитика:**
- Open Graph и Twitter Cards для превью в соцсетях
- Яндекс.Метрика (ID: 106407494) — счётчик в начале `<head>` на всех страницах
- Schema.org JSON-LD разметка (Person, FAQPage, ProfessionalService, ItemList)
- Централизованный трекинг целей через `src/utils/analytics.ts`

**Цели Яндекс.Метрики:**
- `click_telegram`, `click_whatsapp`, `click_email`, `click_phone` — клики по контактам
- `health_score_start`, `health_score_complete`, `health_score_error` — использование виджета
- `health_score_cta_click` — переход к заказу после диагностики
- `blog_view` — просмотр статьи блога
- `blog_cta_click` — клик по CTA в статье

**GEO (Generative Engine Optimization):**
- `llms.txt` — базовая информация для AI-систем
- `llms-full.txt` — полный контент сайта в Markdown (главная рекомендация)
- `robots.txt` — разрешения для AI-ботов (GPTBot, ClaudeBot, PerplexityBot, YandexBot)
- Целевые AI: ChatGPT, Perplexity, Gemini, Claude, YandexGPT, GigaChat
- **Гео-теги:** намеренно не используются — проект ориентирован на международный рынок (Россия, СНГ, Европа, США). Привязка к конкретной локации снизит видимость для зарубежных запросов.

**Консистентность данных:**
При изменении контента страниц-лендингов (проекты, отели, лаборатории, СПА, SEO, GEO) необходимо синхронизировать 6 источников: i18n (ru.ts, en.ts), Schema.org JSON-LD (HTML), noscript fallback (HTML), meta/OG/Twitter (HTML), `llms.txt`. Для проверки — систематический аудит всех источников.

**Блог — добавление статьи:**
1. Создать `content/blog/[slug]/ru.md` и `en.md`
2. Frontmatter: title, description, date, dateModified, slug, category, tags, relatedService, cover
3. Опционально: `llmsSummary` — кастомное описание для AI (если не указано, генерируется из description + TL;DR + FAQ)
4. Запустить `node scripts/generate-blog.js` или `npm run build`
5. Автоматически обновляются: `blog-data.json`, `sitemap.xml`, `llms.txt`, `llms-full.txt`

Цены в EN версии должны соответствовать западному рынку (выше чем RU).

**Терминология услуг:**
- "8 параметров" (SEO) — технические проверки в бесплатном SEO Health Score
- "5 параметров" (GEO) — проверки в бесплатном GEO Health Score (LLM Files, Schema.org, FAQ/Q&A, E-E-A-T, AI-доступность)
- "7 разделов аудита" — направления анализа в платном полном аудите (Technical SEO, On-Page, Content, Schema.org, Local SEO, Yandex-specific, E-E-A-T)

## Ключевые файлы

| Файл | Назначение |
|------|------------|
| `index.html` | RU версия: Schema.org, noscript fallback, hreflang |
| `en.html` | EN версия: английский SEO и контент |
| `for-hotels.html` | RU лендинг для отелей |
| `for-hotels-en.html` | EN лендинг для отелей |
| `for-labs.html` | RU лендинг для ДНК-лабораторий |
| `for-labs-en.html` | EN лендинг для ДНК-лабораторий |
| `for-spa.html` | RU лендинг для СПА-комплексов |
| `for-spa-en.html` | EN лендинг для СПА-комплексов |
| `projects.html` | RU лендинг проектов |
| `projects-en.html` | EN лендинг проектов |
| `seo.html` | RU страница SEO-аудита |
| `seo-en.html` | EN страница SEO Audit |
| `geo.html` | RU страница GEO-оптимизации |
| `geo-en.html` | EN страница GEO Optimization |
| `blog.html` | RU список статей блога |
| `blog-en.html` | EN список статей блога |
| `blog-post.html` | Entry point для страниц статей (vite build) |
| `content/blog/` | Markdown-статьи (ru.md, en.md для каждой) |
| `scripts/generate-blog.js` | Генерация HTML статей и blog-data.json |
| `src/i18n/` | Система переводов (types, ru, en, context) |
| `src/utils/analytics.ts` | Централизованный трекинг Яндекс.Метрики |
| `src/utils/healthScore/` | Логика расчёта Health Score (scoring, types, index) |
| `.github/workflows/deploy.yml` | CI/CD: сборка Docker + деплой на сервер |
| `public/llms.txt` | Инструкции для AI-систем (ASCII-only) |
| `public/robots.txt` | Разрешения для поисковых и AI-ботов |
| `public/sitemap.xml` | Карта сайта с xhtml:link для языков |
| `scripts/postbuild.js` | Постобработка: en.html → en/index.html и т.д. |

## Технологии

- React 19 + TypeScript
- Vite 6
- Tailwind CSS v4 (@tailwindcss/vite)
- lucide-react для иконок
- gray-matter + marked (парсинг Markdown для блога)
- Cloudflare Worker (CORS-прокси для Health Score)
- Docker + GitHub Actions (CI/CD)
- Хостинг: VPS (185.65.200.201) через Docker Compose
