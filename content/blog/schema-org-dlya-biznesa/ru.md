---
title: "Schema.org для локального бизнеса: какие типы разметки нужны"
description: "Практическое руководство по Schema.org для отелей, СПА, клиник. Готовые примеры кода LocalBusiness, Hotel, FAQPage."
date: 2026-02-02
dateModified: 2026-02-02
slug: schema-org-dlya-biznesa
category: seo
tags:
  - schema.org
  - localseo
  - разметка
  - техническое seo
relatedService: /services/seo
cover: cover.jpg
---

**TL;DR:** Локальному бизнесу нужны минимум три типа разметки: LocalBusiness (или Hotel/MedicalBusiness), FAQPage и BreadcrumbList. Это даёт расширенные сниппеты в поиске и помогает AI-системам понять ваш бизнес.

Когда я делаю SEO-аудит для отелей или клиник, в 80% случаев Schema.org либо отсутствует, либо настроена неправильно. При этом правильная разметка — один из самых быстрых способов улучшить видимость в поиске.

## Что такое Schema.org

Schema.org — это словарь для описания данных на сайте в формате, понятном поисковикам. Вместо того чтобы угадывать, что означает текст на странице, Google и Яндекс читают структурированные данные напрямую.

Практический результат — расширенные сниппеты в выдаче: звёздочки рейтинга, цены, часы работы, ответы на вопросы.

## Какие типы нужны локальному бизнесу

### LocalBusiness (базовый)

Подходит для любого бизнеса с физическим адресом: магазины, салоны, кафе.

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Название компании",
  "description": "Краткое описание (150-200 символов)",
  "url": "https://example.com",
  "telephone": "+7 999 123-45-67",
  "email": "info@example.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "ул. Примерная, 1",
    "addressLocality": "Москва",
    "postalCode": "123456",
    "addressCountry": "RU"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "55.7558",
    "longitude": "37.6173"
  },
  "openingHours": "Mo-Fr 09:00-18:00",
  "priceRange": "$$"
}
```

### Hotel (для гостиниц)

Расширяет LocalBusiness специфичными для отелей полями.

```json
{
  "@context": "https://schema.org",
  "@type": "Hotel",
  "name": "Отель Примерный",
  "description": "4-звёздочный отель в центре города",
  "url": "https://hotel-example.com",
  "telephone": "+7 999 123-45-67",
  "starRating": {
    "@type": "Rating",
    "ratingValue": "4"
  },
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "ул. Центральная, 10",
    "addressLocality": "Сочи",
    "postalCode": "354000",
    "addressCountry": "RU"
  },
  "amenityFeature": [
    { "@type": "LocationFeatureSpecification", "name": "Wi-Fi", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Парковка", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Бассейн", "value": true }
  ],
  "checkinTime": "14:00",
  "checkoutTime": "12:00"
}
```

### MedicalBusiness (для клиник и лабораторий)

```json
{
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  "name": "ДНК-Лаборатория",
  "description": "Генетические исследования и ДНК-тесты",
  "url": "https://dna-lab.example.com",
  "telephone": "+7 999 123-45-67",
  "medicalSpecialty": "Genetic",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "ул. Медицинская, 5",
    "addressLocality": "Москва",
    "postalCode": "123456",
    "addressCountry": "RU"
  }
}
```

### FAQPage (для всех)

Показывает вопросы и ответы прямо в выдаче. Работает для любого бизнеса.

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Как забронировать номер?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Через форму на сайте, по телефону или в мессенджере."
      }
    },
    {
      "@type": "Question",
      "name": "Есть ли парковка?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Да, бесплатная парковка для гостей на 50 мест."
      }
    }
  ]
}
```

### BreadcrumbList (навигация)

Показывает путь к странице в выдаче: Главная > Номера > Люкс

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Главная",
      "item": "https://example.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Номера",
      "item": "https://example.com/rooms/"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Люкс"
    }
  ]
}
```

## Как добавить разметку на сайт

**Способ 1: JSON-LD в head (рекомендуется)**

Добавьте код в секцию `<head>` страницы:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  ...
}
</script>
```

**Способ 2: Плагины для CMS**

- WordPress: Yoast SEO, Rank Math
- Tilda: встроенный блок Schema.org
- Wix: встроенные настройки SEO

## Как проверить разметку

1. [Google Rich Results Test](https://search.google.com/test/rich-results) — показывает, какие расширенные сниппеты доступны
2. [Schema Markup Validator](https://validator.schema.org/) — проверяет синтаксис
3. Google Search Console → Улучшения — показывает ошибки на всём сайте

## Частые ошибки

**Неправильный тип**
Используют LocalBusiness для отеля вместо Hotel. Работает, но теряются специфичные поля (звёзды, удобства).

**Несоответствие данных**
Адрес в разметке не совпадает с адресом на странице. Google это видит и игнорирует разметку.

**Отсутствие обязательных полей**
Минимум для LocalBusiness: name, address. Без них разметка не валидна.

**Разметка на неправильной странице**
FAQPage должен быть на странице с FAQ, а не на главной. Hotel — на странице отеля, не на странице номера.

## Schema.org и GEO

Структурированные данные важны не только для Google. AI-системы (ChatGPT, Perplexity) тоже читают Schema.org, чтобы понять, что представляет собой бизнес.

Если хотите, чтобы AI рекомендовал вас — разметка обязательна. Подробнее в статье про [GEO-оптимизацию](/blog/chto-takoe-geo-optimizaciya/).

## FAQ

**Сколько типов разметки можно на одной странице?**
Сколько угодно. На главной странице отеля обычно: Hotel + FAQPage + BreadcrumbList. Главное — каждый тип должен соответствовать контенту страницы.

**Как быстро Google увидит разметку?**
После индексации страницы. Обычно 1-2 недели. Можно ускорить через "Запросить индексирование" в Search Console.

**Обязательно ли нанимать разработчика?**
Для простых случаев — нет. JSON-LD можно добавить через CMS или вручную в HTML. Для сложных сайтов с сотнями страниц лучше автоматизировать.
