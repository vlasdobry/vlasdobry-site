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
```

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

**Структура компонентов:**
- `src/App.tsx` — корневой компонент, управляет навигацией hero↔landing, свайпы, виброотклик
- `src/components/Hero.tsx` — главный экран с фото и заголовками
- `src/components/Landing.tsx` — лендинг с услугами, кейсами и контактами
- `src/components/HotelsLanding.tsx` — лендинг для отелей (sticky header)
- `src/components/LabsLanding.tsx` — лендинг для ДНК-лабораторий (sticky header)
- `src/components/SpaLanding.tsx` — лендинг для СПА-комплексов (sticky header)
- `src/components/LanguageSwitcher.tsx` — переключатель языка
- `src/components/OffersMenu.tsx` — раскрывающееся меню «Предложения» (отраслевые лендинги)
- `src/components/ProjectsLanding.tsx` — лендинг проектов (sticky header, карточки проектов)

**Стилизация:** Tailwind CSS v4 (через Vite plugin), шрифт Inter. Используется glassmorphism-эффект для UI-элементов.

**Мультиязычность (i18n):**
- URL-based routing: `/` (RU), `/en/` (EN)
- Самописная i18n-система в `src/i18n/` (KISS: без i18next)
- HTML файлы: `index.html`, `en.html`, `for-hotels.html`, `for-hotels-en.html`, `for-labs.html`, `for-labs-en.html`, `for-spa.html`, `for-spa-en.html`, `projects.html`, `projects-en.html`
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
- Яндекс.Метрика (ID: 106407494)
- Schema.org JSON-LD разметка (Person, FAQPage, ProfessionalService, ItemList)

**GEO (Generative Engine Optimization):**
- `llms.txt` — структурированная информация для AI-систем
- `robots.txt` — разрешения для AI-ботов (GPTBot, ClaudeBot, PerplexityBot, YandexBot)
- Расширенный noscript fallback для AI-краулеров
- Целевые AI: ChatGPT, Perplexity, Gemini, Claude, YandexGPT, GigaChat
- **Гео-теги:** намеренно не используются — проект ориентирован на международный рынок (Россия, СНГ, Европа, США). Привязка к конкретной локации снизит видимость для зарубежных запросов.

**Консистентность данных:**
При изменении контента страниц-лендингов (проекты, отели, лаборатории, СПА) необходимо синхронизировать 6 источников: i18n (ru.ts, en.ts), Schema.org JSON-LD (HTML), noscript fallback (HTML), meta/OG/Twitter (HTML), `llms.txt`. Для проверки — систематический аудит всех источников.

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
| `src/i18n/` | Система переводов (types, ru, en, context) |
| `public/llms.txt` | Инструкции для AI-систем (ASCII-only) |
| `public/robots.txt` | Разрешения для поисковых и AI-ботов |
| `public/sitemap.xml` | Карта сайта с xhtml:link для языков |
| `scripts/postbuild.js` | Постобработка: en.html → en/index.html и т.д. |

## Технологии

- React 19 + TypeScript
- Vite 6
- Tailwind CSS v4 (@tailwindcss/vite)
- lucide-react для иконок
