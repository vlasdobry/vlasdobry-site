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

**Принцип фактов:** Все цифры, утверждения и описания на сайте должны опираться на реальные данные (аудиты, отчёты, код). Никогда не выдумывать цифры «для убедительности». Если нет точных данных — не указывать число или уточнить у Власа.

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
- `/services/ppc` — Контекстная реклама (RU)
- `/en/services/ppc` — PPC Advertising (EN)
- `/168-fz` — проверка на 168-ФЗ (RU)
- `/en/168-fz` — 168-FZ Compliance Check (EN)
- `/blog` — блог со статьями (RU)
- `/en/blog` — блог со статьями (EN)
- `/blog/[slug]` — отдельная статья (RU)
- `/en/blog/[slug]` — отдельная статья (EN)

**Структура компонентов:**
- `src/App.tsx` — корневой компонент, управляет навигацией hero↔landing, свайпы, виброотклик
- `src/components/Hero.tsx` — главный экран с фото и заголовками
- `src/components/Landing.tsx` — лендинг с услугами, кейсами и контактами
- `src/components/IndustryLanding.tsx` — универсальный лендинг для отраслей (hotels, labs, spa)
- `src/components/ServiceLanding.tsx` — универсальный лендинг для услуг (SEO, GEO, PPC). Поддерживает опциональную секцию `checklist` (между Pricing и Related Services)
- `src/components/HealthScoreChecker.tsx` — виджет экспресс-диагностики сайта (8 параметров)
- `src/components/LanguageSwitcher.tsx` — переключатель языка
- `src/components/ProjectsLanding.tsx` — лендинг проектов (sticky header, карточки проектов)
- `src/components/BlogList.tsx` — список статей блога с карточками
- `src/components/BlogPost.tsx` — страница отдельной статьи (включает CTA блок Health Score между контентом и FAQ)
- `src/components/BlogCard.tsx` — карточка статьи для списка
- `src/components/ComplianceChecker.tsx` — виджет проверки на 168-ФЗ (латиница в UI-элементах)

**Health Score виджет:**
- Бесплатная экспресс-диагностика сайта (SEO: 8 параметров, GEO: 5 параметров)
- SEO проверяет: Title, Description, H1, Viewport, Indexability, robots.txt, sitemap.xml, Schema.org
- GEO проверяет: LLM Files (llms.txt + llms-full.txt), Schema.org, FAQ/Q&A, E-E-A-T сигналы, AI-доступность
- Использует Cloudflare Worker (`health-score-proxy.vlasdobry.workers.dev`) как CORS-прокси
- Клиентская валидация URL: блокирует localhost, приватные IP, домены без TLD
- Таймаут 25 секунд: при превышении показывает «Проблема с производительностью» (amber) с контекстом TTFB и CTA в Telegram (вместо generic ошибки)
- Предупреждение «сайт отвечает медленно» после 10 сек ожидания
- Персонализированный CTA после результата: динамический текст по баллам (4 уровня) + pre-filled Telegram deep link с доменом и скором
- URL-история: последние 5 проверенных сайтов (localStorage + `<datalist>`, полный URL с протоколом)
- Анимированный процесс сканирования с разными этапами для SEO и GEO
- Интегрирован в ServiceLanding для SEO и GEO страниц
- Трекинг в Яндекс.Метрику: старт, завершение, ошибки, клик по CTA

**168-ФЗ Compliance Checker:**
- Бесплатная проверка сайта на соответствие закону 168-ФЗ о защите русского языка
- Использует HTMLRewriter (Cloudflare Worker) для потокового парсинга целевых элементов
- Endpoint: `POST /api/compliance` в существующем `health-score-proxy` Worker
- Категории: кнопки, заголовки (h1-h3), навигация, формы, подзаголовки (h4-h6), политики, мета
- Скоринг: critical (-10), important (-7), medium (-5), info (0)
- Whitelist: Wi-Fi, SPA, IT, URL, email, числа с единицами и др.
- SPA-детекция: маркеры фреймворков (React/Vue/Angular/Next) + количество скриптов + мало текстовых элементов. SPA показывает "Анализ ограничен" (amber) вместо скора
- Обработка ошибок: таймаут (25с), blocked (HTTP 403/WAF), server error — все с CTA в Telegram
- CTA: при ≥80 → SEO-аудит, при <80 → pre-filled Telegram с доменом и скором
- Перелинковка: статья 168-ФЗ ↔ инструмент
- Трекинг: compliance_start, compliance_complete, compliance_error, compliance_cta_click

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

**Текущие статьи блога (15 шт):**
- `brendovyy-trafik-otelya-keys` — Брендовый трафик отеля: кейс потерь без рекламы в Директе
- `kak-ocenit-potencial-google-ads` — Как оценить потенциал Google Ads: кейс из Лос-Анджелеса
- `odnostranichnyj-sajt-otelya-teryaet-trafik` — Как одностраничный сайт отеля теряет 80 000 запросов
- `audit-sajta-otelya-keys-rushotel` — Экспресс-аудит сайта отеля: кейс Русь Отель (Сарапул)
- `prioritizaciya-gorodov-seo-otelya` — Как приоритизировать города для SEO-продвижения отеля
- `analiz-konkurentov-otelya-keys` — Анализ конкурентов для отеля: кейс Grace Luxor
- `chto-takoe-geo-optimizaciya` — GEO-оптимизация: как попасть в ответы ChatGPT
- `kak-proverit-seo-sayta` — Как проверить SEO сайта: чеклист из 8 пунктов
- `schema-org-dlya-biznesa` — Schema.org для локального бизнеса
- `seo-dlya-oteley` — SEO для отелей: с чего начать
- `geo-optimizaciya-sajta-gajd` — GEO-оптимизация сайта: пошаговый гайд с примерами кода
- `prodvizhenie-v-nejrosetyah` — Продвижение в нейросетях: как AI-поиск меняет правила
- `llms-txt-chto-eto` — llms.txt: что это и зачем нужен файл для AI
- `geo-prodvizhenie-sajta` — GEO-продвижение сайта: зачем бизнесу новый канал трафика
- `168-fz-zakon-o-russkom-yazyke-sayt` — 168-ФЗ и сайт бизнеса: что менять до 1 марта 2026

**Стилизация:** Tailwind CSS v4 (через Vite plugin), шрифт Inter. Используется glassmorphism-эффект для UI-элементов.

**Мультиязычность (i18n):**
- URL-based routing: `/` (RU), `/en/` (EN)
- Самописная i18n-система в `src/i18n/` (KISS: без i18next)
- HTML файлы: `index.html`, `en.html`, `for-hotels.html`, `for-hotels-en.html`, `for-labs.html`, `for-labs-en.html`, `for-spa.html`, `for-spa-en.html`, `projects.html`, `projects-en.html`, `seo.html`, `seo-en.html`, `geo.html`, `geo-en.html`, `ppc.html`, `ppc-en.html`, `blog.html`, `blog-en.html`
- Переводы: `src/i18n/ru.ts`, `src/i18n/en.ts`

**Мобильные функции:**
- Виброотклик при свайпе (Vibration API, активируется через onTouchStart)
- Viewport height: `100svh` для корректного отображения в мобильных браузерах
- Адаптивные стили для portrait/landscape ориентаций

**404 страница (Easter eggs):**
- Кастомная HTML-страница `public/404.html` с 15 сезонными темами
- JS-логика вынесена в `public/404.js` (CSP: `script-src 'self'` запрещает inline-скрипты)
- Темы: default, halloween, newyear, valentine, aprilfools, friday13, march8, muertos, feb23, piday, programmer, starwars, cosmo, solstice, russia
- Автоматический выбор темы по дате, тестирование: `?theme=название`
- Замена "0" в "404": Дарт Вейдер (starwars), калавера PNG (muertos), хоккейная маска (friday13), π (piday)
- JS-эффекты: гиперпространство, бинарный дождь, мерцающие звёзды, летающие цифры π
- `public/calavera.png` — PNG калаверы для Día de los Muertos (174 KB)

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
- `compliance_start`, `compliance_complete`, `compliance_error` — использование 168-ФЗ виджета
- `compliance_cta_click` — переход к заказу после проверки 168-ФЗ
- `blog_view` — просмотр статьи блога
- `blog_cta_click` — клик по CTA в статье
- `blog_hs_cta_click` — клик по CTA Health Score в статье блога (Эксперимент #2)

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
- "7 разделов аудита" — направления анализа в платном полном аудите (Technical SEO, On-Page, Content, Schema.org, Local SEO, Reputation, E-E-A-T)

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
| `ppc.html` | RU страница контекстной рекламы |
| `ppc-en.html` | EN страница PPC Advertising |
| `blog.html` | RU список статей блога |
| `blog-en.html` | EN список статей блога |
| `blog-post.html` | Entry point для страниц статей (vite build) |
| `content/blog/` | Markdown-статьи (ru.md, en.md для каждой) |
| `scripts/generate-blog.js` | Генерация HTML статей и blog-data.json |
| `src/i18n/` | Система переводов (types, ru, en, context) |
| `src/utils/analytics.ts` | Централизованный трекинг Яндекс.Метрики |
| `src/utils/healthScore/` | Логика расчёта Health Score (scoring, types, index) |
| `nginx.conf` | Конфиг nginx: security headers, CSP, кэширование |
| `workers/health-score-proxy/` | Cloudflare Worker: CORS-прокси с SSRF-защитой |
| `.github/workflows/deploy.yml` | CI/CD: сборка Docker + деплой на сервер |
| `public/llms.txt` | Инструкции для AI-систем (ASCII-only) |
| `public/robots.txt` | Разрешения для поисковых и AI-ботов |
| `public/sitemap.xml` | Карта сайта с xhtml:link для языков |
| `public/404.html` | Кастомная 404-страница с 15 сезонными темами |
| `public/404.js` | JS-логика 404-страницы (вынесена из inline для CSP) |
| `public/calavera.png` | PNG калаверы для Día de los Muertos темы |
| `scripts/postbuild.js` | Постобработка: en.html → en/index.html и т.д. |
| `docs/hotel-outreach-summary.md` | Стратегия outreach: скрипты, шаблоны, ценообразование |
| `docs/hotel-outreach-leads.md` | Лиды: 8 Черноморье + 10 Крым + 16 Геленджик + 12 Новороссийск |
| `docs/abhazia-hotel-outreach-leads.md` | Лиды: 14 отелей Абхазии |

## Технологии

- React 19 + TypeScript
- Vite 6
- Tailwind CSS v4 (@tailwindcss/vite)
- lucide-react для иконок
- gray-matter + marked (парсинг Markdown для блога)
- Cloudflare Worker (CORS-прокси для Health Score)
- Docker + GitHub Actions (CI/CD)
- Хостинг: VPS (185.65.200.201) через Docker Compose + Traefik v2 (reverse proxy, TLS)

**Безопасность:**
- nginx: security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, CSP) дублированы в каждом `location` блоке (nginx inheritance fix)
- CSP разрешает: `esm.sh` (import map), `fonts.googleapis.com`, `fonts.gstatic.com`, `mc.yandex.ru`, `yastatic.net`, `avatars.githubusercontent.com`, `health-score-proxy.vlasdobry.workers.dev`
- Cloudflare Worker: CORS strict match (`===`), SSRF-защита (блокировка приватных IP, localhost, .local, .internal)
- Health Score: клиентская валидация URL перед отправкой на Worker
- **НЕ добавлять HEALTHCHECK в Dockerfile** — Traefik v2 фильтрует unhealthy/starting контейнеры и убирает роутеры → 404

## Метрики роста (обновлено 06.03.2026)

**North Star Metric:** Health Score completions / неделю (текущее: ~4-5, цель: 15)

**Трафик (06.03):** 100 визитов/мес, 59 уников, 31% отказов, 4:18 среднее время, 2.3 стр/визит
**Источники:** Direct 61% (61), Link 19% (19), Search 10% (10), Internal 7% (7), Social 2% (2)
**Тренд:** уники +34%, но качество упало (отказы ×2, время -42%) — нецелевой поисковый трафик из Google
**Яндекс:** 26 URL в поиске (+2), 5 исключено (-4), ИКС 10. 1 клик по «168-фз проверка англицизмов сервис»
**Google:** 14 кликов (×7), 3252 показа (×33), 18 страниц в индексе. 168-ФЗ EN-статья: 2636 показов, позиция 4.4

**Воронка Health Score:**
- 26 запусков → 19 завершений (73%) → 7 ошибок (27%) → **0 CTA кликов** (6 недель)
- Эксперимент #1 (редизайн CTA) реализован 06.03: залитая кнопка, текст по скору, убрана gap line, подтекст Telegram. Проверка 13.03
- Эксперимент #2 (CTA Health Score в блоге) реализован 08.03: CTA-блок между контентом и FAQ, маршрутизация SEO→/services/seo/, GEO→/services/geo/. Цель Метрики: blog_hs_cta_click (ID 518737104). Проверка 15.03

**Воронка 168-ФЗ:**
- 5 запусков → 3 завершения → 2 ошибки → **1 CTA клик** (первый!)
- CTA обновлён аналогично Health Score (06.03)

**Стратегическое направление:** отельная ниша + PPC (Яндекс.Директ, Google Ads)
- `/services/ppc` — лендинг PPC с отельными кейсами, чеклистом готовности сайта к рекламе (8 пунктов) и CTA на Health Score
- Content loop: статья → Health Score → CTA → лид (168-ФЗ content loop работает — Google даёт показы)
- Outreach: холодные касания + HH вакансии → экспресс-аудит → звонок → аудит/ведение

**Growth Experiments:** [Google Sheets](https://docs.google.com/spreadsheets/d/1aQaJVTt8cOTR5J7kHbs9NLf0tt8ydK7k6RWYsRHzuRA/edit)
