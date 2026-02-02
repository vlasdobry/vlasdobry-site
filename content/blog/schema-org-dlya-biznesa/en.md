---
title: "Schema.org for Local Business: Which Markup Types You Need"
description: "Practical guide to Schema.org for hotels, spas, clinics. Ready-to-use code examples for LocalBusiness, Hotel, FAQPage."
date: 2026-02-02
dateModified: 2026-02-02
slug: schema-org-dlya-biznesa
category: seo
tags:
  - schema.org
  - localseo
  - markup
  - technical seo
relatedService: /en/services/seo
cover: cover.jpg
---

**TL;DR:** Local businesses need at least three markup types: LocalBusiness (or Hotel/MedicalBusiness), FAQPage, and BreadcrumbList. This enables rich snippets in search and helps AI systems understand your business.

When I do SEO audits for hotels or clinics, 80% of the time Schema.org is either missing or configured incorrectly. Yet proper markup is one of the fastest ways to improve search visibility.

## What is Schema.org

Schema.org is a vocabulary for describing data on your website in a format search engines understand. Instead of guessing what text on a page means, Google and Bing read structured data directly.

The practical result — rich snippets in search results: star ratings, prices, business hours, FAQ answers.

## Which Types Local Businesses Need

### LocalBusiness (basic)

Works for any business with a physical address: stores, salons, cafes.

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Company Name",
  "description": "Brief description (150-200 characters)",
  "url": "https://example.com",
  "telephone": "+1 555 123-4567",
  "email": "info@example.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Main Street",
    "addressLocality": "New York",
    "postalCode": "10001",
    "addressRegion": "NY",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "40.7128",
    "longitude": "-74.0060"
  },
  "openingHours": "Mo-Fr 09:00-18:00",
  "priceRange": "$$"
}
```

### Hotel (for accommodations)

Extends LocalBusiness with hotel-specific fields.

```json
{
  "@context": "https://schema.org",
  "@type": "Hotel",
  "name": "Example Hotel",
  "description": "4-star hotel in the city center",
  "url": "https://hotel-example.com",
  "telephone": "+1 555 123-4567",
  "starRating": {
    "@type": "Rating",
    "ratingValue": "4"
  },
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "100 Beach Road",
    "addressLocality": "Miami",
    "postalCode": "33101",
    "addressRegion": "FL",
    "addressCountry": "US"
  },
  "amenityFeature": [
    { "@type": "LocationFeatureSpecification", "name": "Wi-Fi", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Parking", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Pool", "value": true }
  ],
  "checkinTime": "14:00",
  "checkoutTime": "12:00"
}
```

### MedicalBusiness (for clinics and labs)

```json
{
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  "name": "DNA Laboratory",
  "description": "Genetic testing and DNA analysis",
  "url": "https://dna-lab.example.com",
  "telephone": "+1 555 123-4567",
  "medicalSpecialty": "Genetic",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "500 Medical Drive",
    "addressLocality": "Boston",
    "postalCode": "02101",
    "addressRegion": "MA",
    "addressCountry": "US"
  }
}
```

### FAQPage (for everyone)

Shows questions and answers directly in search results. Works for any business.

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How do I book a room?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Through the website form, by phone, or via messenger."
      }
    },
    {
      "@type": "Question",
      "name": "Is there parking?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, free parking for guests with 50 spaces."
      }
    }
  ]
}
```

### BreadcrumbList (navigation)

Shows page path in search results: Home > Rooms > Suite

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://example.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Rooms",
      "item": "https://example.com/rooms/"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Suite"
    }
  ]
}
```

## How to Add Markup to Your Site

**Method 1: JSON-LD in head (recommended)**

Add code to the `<head>` section:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  ...
}
</script>
```

**Method 2: CMS plugins**

- WordPress: Yoast SEO, Rank Math
- Squarespace: built-in SEO settings
- Wix: built-in SEO settings

## How to Validate Markup

1. [Google Rich Results Test](https://search.google.com/test/rich-results) — shows available rich snippets
2. [Schema Markup Validator](https://validator.schema.org/) — checks syntax
3. Google Search Console → Enhancements — shows errors site-wide

## Common Mistakes

**Wrong type**
Using LocalBusiness for a hotel instead of Hotel. It works, but you lose specific fields (stars, amenities).

**Data mismatch**
Address in markup doesn't match address on page. Google sees this and ignores the markup.

**Missing required fields**
Minimum for LocalBusiness: name, address. Without them, markup is invalid.

**Markup on wrong page**
FAQPage should be on the FAQ page, not homepage. Hotel — on hotel page, not room page.

## Schema.org and GEO

Structured data matters not just for Google. AI systems (ChatGPT, Perplexity) also read Schema.org to understand what a business is.

If you want AI to recommend you — markup is mandatory. More details in the [GEO optimization article](/en/blog/chto-takoe-geo-optimizaciya/).

## FAQ

**How many markup types can I have on one page?**
As many as needed. A hotel homepage typically has: Hotel + FAQPage + BreadcrumbList. Just make sure each type matches the page content.

**How quickly will Google see the markup?**
After page indexing. Usually 1-2 weeks. You can speed it up via "Request Indexing" in Search Console.

**Do I need to hire a developer?**
For simple cases — no. JSON-LD can be added through CMS or manually in HTML. For complex sites with hundreds of pages, automation is better.
