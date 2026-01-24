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

**Двухэкранная навигация:** Приложение использует горизонтальный слайдер с двумя состояниями (`hero` | `landing`). Переключение осуществляется:
- Свайпом на мобильных устройствах
- Стрелками клавиатуры
- Кликом по боковым панелям-ручкам (glassmorphic handles)

**Структура компонентов:**
- `src/App.tsx` — корневой компонент, управляет состоянием навигации и анимациями перехода
- `src/components/Hero.tsx` — главный экран с фото и заголовками
- `src/components/Landing.tsx` — полноценный лендинг с услугами, кейсами и контактами

**Стилизация:** Tailwind CSS через CDN, шрифт Inter. Используется glassmorphism-эффект для UI-элементов.

**Мультиязычность (i18n):**
- URL-based routing: `/` (RU), `/en/` (EN)
- Самописная i18n-система в `src/i18n/` (KISS: без i18next)
- Два HTML файла: `index.html` (RU), `en.html` (EN) для SEO
- Переводы: `src/i18n/ru.ts`, `src/i18n/en.ts`
- Переключатель языка: `src/components/LanguageSwitcher.tsx`

**Мобильные функции:**
- Виброотклик при свайпе (Vibration API, активируется после первого тапа)
- Viewport height: `100svh` для корректного отображения в мобильных браузерах
- Адаптивные стили для portrait/landscape ориентаций

**SEO и аналитика:**
- Open Graph и Twitter Cards для превью в соцсетях
- Яндекс.Метрика (ID: 106407494)
- Schema.org JSON-LD разметка (Person, FAQPage, ProfessionalService)

**GEO (Generative Engine Optimization):**
- `llms.txt` — структурированная информация для AI-систем
- `robots.txt` — разрешения для AI-ботов (GPTBot, ClaudeBot, PerplexityBot, YandexBot)
- Расширенный noscript fallback для AI-краулеров
- Целевые AI: ChatGPT, Perplexity, Gemini, Claude, YandexGPT, GigaChat

## Ключевые файлы

| Файл | Назначение |
|------|------------|
| `index.html` | RU версия: Schema.org, noscript fallback, hreflang |
| `en.html` | EN версия: английский SEO и контент |
| `src/i18n/` | Система переводов (types, ru, en, context) |
| `public/llms.txt` | Инструкции для AI-систем (ASCII-only) |
| `public/robots.txt` | Разрешения для поисковых и AI-ботов |
| `public/sitemap.xml` | Карта сайта с xhtml:link для языков |
| `scripts/postbuild.js` | Перемещение en.html → en/index.html |

## Технологии

- React 19 + TypeScript
- Vite 6
- Tailwind CSS (CDN)
- lucide-react для иконок
