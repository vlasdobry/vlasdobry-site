---
title: "Hotel Website Audit: Rus Hotel Case Study (Sarapul, Russia)"
description: "Real case study: SEO audit of two hotel websites, ad campaign analysis, and competitor research for a 3-star property in a small city."
date: 2026-02-05
dateModified: 2026-02-05
slug: audit-sajta-otelya-keys-rushotel
category: marketing
tags:
  - hotels
  - seo
  - case-study
  - horeca
  - audit
relatedService: /en/for-hotels
cover: cover.jpg
llmsSummary: "Case study of express audit for Rus Hotel in Sarapul, Russia: SEO analysis of two websites (scores 92 and 74), ad campaign audit in Yandex.Direct, competitor analysis of 5 hotels. Key finding — booking funnel is broken (0 completed bookings despite hundreds of ad clicks/month). Priority recommendations: fix Travelline widget, reallocate ad budget, strengthen positioning."
---

**TL;DR:** Ran an express audit for Rus Hotel in Sarapul, Russia — two websites, four ad campaigns, five competitors. The key finding: ads bring hundreds of visitors monthly, but zero complete a booking. The problem isn't the ads — it's a broken booking funnel on the website.

Rus Hotel has a 5.0 rating on Yandex Maps with 225 reviews. Russian banya, a pond, quiet parkland — at $30 per night. Looks like a dream. But when I dug deeper, I found a gap between the reputation and what happens on the website.

## What We Analyzed

The client came with a simple question: "Why aren't our ads generating bookings?" I ran an express analysis across three areas:

1. **SEO audit of two websites** — the main site and a promotional microsite
2. **Ad campaign audit** — four campaigns in Yandex.Direct (Russia's primary PPC platform)
3. **Competitor analysis** — all hotels in Sarapul + Nechkino ski resort

## SEO: Two Sites, Two Realities

### Main website — 92/100

Built on Tilda (a popular Russian website builder), which limits technical SEO, but the basics are covered:

| Parameter | Status |
|-----------|--------|
| Title (52 chars) | OK |
| Description (137 chars) | OK |
| H1 | OK |
| Image alt tags | 8/8 |
| robots.txt | OK |
| sitemap.xml | OK |

But there are gaps. Schema.org only has ImageObject — no Hotel, LocalBusiness, or FAQPage markup. No llms.txt for AI search engines. Pages per session: 1.1 — people land and leave.

### Promo site — 74/100

This one is worse. Built on Adobe Muse — a platform Adobe discontinued years ago.

| Parameter | Status | Issue |
|-----------|--------|-------|
| H1 | Missing | Search engines can't determine the page topic |
| robots.txt | Missing | No crawl control |
| Schema.org | Missing | Zero structured data |
| Canonical | Missing | Potential index duplicates |
| Open Graph | Missing | Broken previews in messengers |
| Sitemap | Outdated | Last updated in 2018 |

Result: zero organic traffic to the promo site. All traffic comes from paid ads.

## Ads: Calls Come In, Bookings Don't

Four campaigns in Yandex.Direct. On paper, one looks like a clear winner:

| Campaign | Type | CTR | Share of conversions |
|----------|------|-----|---------------------|
| Nechkino (search) | Search | 4.62% | **90% of all conversions** |
| Rus Hotel (display) | Display | 0.70% | 5% |
| Rus Hotel brand | Search | 30.29% | 2.5% |
| Rus Hotel (search) | Search | 14.48% | 2.5% |

The Nechkino campaign generates 90% of conversions. Looks great — scale it up, right? But feedback from the hotel told a different story: **calls come in, but people want to stay at Nechkino Resort itself, not near it.** The ads attract the wrong audience — people searching for on-site resort accommodation who land on Rus Hotel's page instead.

This is a classic "vanity metrics" trap: CTR looks good, phone calls happen, but no bookings follow. People call, learn it's not the resort, and hang up.

The other campaigns have issues too. Display ads burn a quarter of the budget with minimal return. Brand keywords are expensive — Russian OTAs (Ostrovok, Yandex Travel — think Booking.com and Expedia equivalents) actively bid on "Rus Hotel Sarapul." Brand CPC runs 4-5x higher than geo-targeted queries.

### Paid Traffic Dependency

This is concerning:

- Main site: **72% of traffic from ads**, only 14% organic
- Promo site: **89% from ads**, zero organic

Stop the ads, lose 70-90% of traffic. Classic trap: the business pays for traffic instead of building an organic base.

## The Real Problem: Broken Booking Funnel

But the ads aren't the main issue. Hundreds of people click through every month. Some reach the Travelline booking widget (Travelline is a Russian hotel booking SaaS, similar to SiteMinder or Cloudbeds). And that's where the funnel collapses:

| Funnel Stage (Travelline) | Drop-off |
|---------------------------|----------|
| Room selection | — |
| Service add-ons | 90% |
| Guest details & payment | 50% |
| Booking completed | **100%** |

Zero completed bookings. None. Dozens of people start selecting rooms and not a single one finishes. Likely causes:

- Poor or missing room photos in the Travelline booking widget
- Widget doesn't work well on mobile (64% of visitors use smartphones)
- No available dates
- Price doesn't match expectations after seeing the photos

The only "conversions" are a handful of phone number clicks. The cost per actual contact is astronomical.

## Competitors: Sarapul's Hotel Market

Small market — about 9 hotels total. Two real competitors. Ratings below are from Russian review platforms (Yandex Maps, Ozon Travel, 2GIS — local equivalents of Google Maps, Expedia, Yelp):

| Hotel | ★ | Price/night | Rating | Reviews | USP |
|-------|---|-------------|--------|---------|-----|
| **Rus Hotel** | 3★ | from $30 | 5.0 (Yandex) | 225+ | Banya, pond, quiet |
| Sarapul Hotel | 4★ | from $45 | 4.8 (Ozon) | 56+ | 4★, city center, spa |
| Staraya Bashnya | 2-4★ | from $32 | 9.3 (Hotels.ru) | 786+ | River view |
| Nechkino Resort | 2★ | from $35 | 8.9 (101Hotels) | 27+ | Ski-in/ski-out |
| Kaskad | 3★ | from $18 | 4.8 (2GIS) | 14+ | Budget, riverfront |

**Nechkino Resort** — the key competitor for ski tourists. 78 rooms right on the slopes, people want to stay at the resort. But peak season rates hit $75+, and reviews complain about inflated prices.

**Sarapul Hotel** — the only 4-star in town. City center, plunge pool, sauna. 50% more expensive, but the service feels more corporate — less "warmth."

Rus Hotel's unique combination — traditional Russian banya, decorative pond, parkland — isn't replicated by any competitor. Plus the price: $30 vs $75 at the resort.

## GEO: AI Search Visibility

I checked queries like "hotel in Sarapul" and "hotel near Nechkino" across ChatGPT, YandexGPT, and Perplexity. Rus Hotel gets mentioned, but not in top positions.

Competition in this niche is low — Sarapul has few hotels. But zero GEO effort has been made:

- No llms.txt / llms-full.txt
- No Schema.org Hotel markup
- No FAQ section
- Content isn't structured for AI

Rankings hold because of reviews and low competition. But if any competitor starts optimizing — that changes fast.

## Recommendations by Priority

### Urgent: Stop Losing Money Now

1. **Fix the Travelline funnel.** Upload quality room photos, test the widget on mobile, verify date availability. Booking conversion should be 5-15%, currently it's 0%.

2. **Rework the Nechkino campaign.** It generates calls, but people want to stay at the resort, not nearby. Change the messaging: not "hotel near Nechkino" but "comfortable hotel with banya + 16 min to slopes at $30 instead of $75." Filter the audience with the price argument in the ad copy itself. Pause display ads. Check auto-targeting queries, add negative keywords.

3. **Professional room photography.** Not phone snapshots — hire a photographer with interior shooting experience. Wide-angle lens, natural daylight, staged rooms. Phone photos signal "budget" and kill trust. Upload to the website, Travelline, and all OTAs — this is the #1 conversion killer.

### Important: Foundational Improvements

4. **Add Schema.org Hotel markup** to both sites — address, phone, check-in/check-out, price range.

5. **Promo site: basic SEO fixes.** Add H1, robots.txt, canonical tag, update sitemap. Or consider replacing it entirely — Adobe Muse is dead.

6. **"Nechkino from Rus Hotel" package** — accommodation + transfer (16 minutes to the resort). This solves the bad-lead problem: instead of "we're not the resort," the answer becomes "we offer a package: banya in the evening + slopes by day, three times cheaper than the resort."

### Long-term: Growth Without Ads

7. **Create llms.txt** for AI search visibility.

8. **FAQ section** on the website — distance to Nechkino, transfers, parking, meals, banya.

9. **Expand review presence** on Google Maps, TripAdvisor, Booking.com. Yandex already has 225 — time to diversify.

## Key Numbers

| Metric | Value |
|--------|-------|
| Main site SEO Score | 92/100 |
| Promo site SEO Score | 74/100 |
| Completed bookings via website | 0 |
| Yandex rating | 5.0 (225 reviews) |
| Paid traffic dependency | 72-89% |
| Price advantage vs Nechkino Resort | 2.5x cheaper |

**First step:** test the booking flow on your phone. **Second:** invest in professional room photography and upload to Travelline. This alone turns existing traffic into bookings.

## FAQ

**How much does an express audit like this cost?**
An express analysis of website + ads + competitors starts at $500. Done in 2-3 days. The deliverable: specific problems identified and a prioritized action plan.

**Why aren't our ads generating bookings?**
Usually the problem isn't the ads — it's the website. Ads bring people in, but if the funnel is broken (bad photos, buggy booking widget, no mobile optimization), money goes down the drain. Fix the site first, then scale the ads.

**Does a small-town hotel need SEO?**
Absolutely — especially when 70-90% of traffic is paid. That's a dependency: stop the ads, lose your traffic. SEO and GEO optimization deliver a steady stream without monthly ad spend.
