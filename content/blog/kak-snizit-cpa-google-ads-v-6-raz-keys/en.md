---
title: "How to Lower Google Ads CPA by 8x: An Appliance Repair Case Study"
description: "How I reduced Google Ads CPA from $210 to $27 for an appliance repair business in the Bay Area. PMax delivered $7.30 CPA vs $147 in Search. Full rebuild: tracking, micro-intents, Performance Max."
date: 2026-05-16
dateModified: 2026-05-16
slug: kak-snizit-cpa-google-ads-v-6-raz-keys
category: marketing
tags:
  - google ads
  - ppc
  - case study
  - CPA
  - performance max
relatedService: /en/services/ppc
cover: cover.jpg
---

**TL;DR:** I rebuilt a Google Ads account for an appliance repair business in the Bay Area. CPA dropped from $210 to $27 — nearly 8x lower. PMax turned out to be the main driver: $7.30 CPA vs $147 in Search (20x difference). The client now has 63 conversions in 33 days — the old campaigns had 4 in 25 days.

The client came to me with an account that was already running campaigns — the owner had set them up himself. On the surface, everything looked fine: campaigns were active, budget was spending. But the numbers told a different story.

## Where We Started: $210 per Lead vs a $50–90 Benchmark

An appliance repair and HVAC service in the Bay Area. They cover 13 cities: San Jose, Palo Alto, Cupertino, Mountain View, and surrounding areas. Their site is built on Lovable — a no-code platform that produces a React SPA.

When I took over, the account had campaigns the business owner had set up himself — he knew the basics of Google Ads but not the deeper mechanics. They had been running for 25 days (March 20 – April 13). Here's what they delivered:

- **$839** spent
- **4 conversions**
- **CPA: $210**

For context, the industry benchmark for appliance repair in the Bay Area is $50–90 per lead. The client was paying 2–4x more.

Here's the chain of problems I found:

```
Low Quality Score (1–3) → CPC $22–98 → 53 clicks in 25 days
→ not enough data for Smart Bidding → algorithm can't learn → CPA $210
```

The core issue: **Quality Score of 1–3 on 59% of keywords**. Landing Page Experience was "Below Average" across nearly all keywords. The Lovable site — a CSR-only SPA — served identical HTML for every page. Googlebot saw an empty shell.

On top of that, **88% of keywords had zero impressions**. The account had 275 keywords, and 242 of them were dead weight.

I broke the rebuild into four stages.

## Stage 1: Tracking

When I started, the site had hardcoded gtag.js snippets. GA4 wasn't linked to Google Ads. Google Signals was off. The "Book Online" button sent users to an external domain and wasn't tracked at all.

First thing: I installed Google Tag Manager. Created a container with 11 tags:

- GA4 Config + Google Tag Ads
- Conversion Linker + Remarketing + GCLID Capture
- 3 GA4 Events (form_submit, call_click, book_online)
- 3 Ads Conversion Actions with matching triggers

Set up Enhanced Conversions via dataLayer — name and phone number are passed as hashed user data. Linked GA4 to Google Ads, enabled Google Signals. Removed all hardcoded tags.

Result: 100% coverage in Diagnostics, "Excellent" rating. But more importantly — **we finally had data**. Without this, every next step would be guesswork.

## Stage 2: Micro-Intents — Grouping by Search Intent

The old account had 275 keywords spread across a handful of large ad groups. The "Washer Repair" group, for example, contained 30+ keywords: "washer repair near me," "maytag washer repair," "washer not draining," "lg washer repair san jose." Different intents, different brands — all dumped together.

I switched to micro-intents. The principle: **all keywords in a group share the same intent**. Some groups have 1 keyword, some have 2, some have 6 — but the ad is written around their common meaning, not a random mix.

- 275 keywords → **125 Exact match**
- 6 campaigns, **29 ad groups**, 1–6 keywords per group
- Each RSA written for the group's micro-intent: H1 contains the main keyword, description is adapted
- Budget: $10–15/day per campaign, $25 CPC cap

Here's the difference from "broad" groups: "samsung refrigerator repair," "lg refrigerator repair," and "ge refrigerator repair" are three different micro-intents — the user is looking for a specific brand. I split these. But "samsung refrigerator repair," "samsung fridge repair," and "samsung refrigerator repair near me" share one micro-intent — they can stay together.

Negative keywords — 82 account-level plus cross-negatives between ad groups. Excluded "free," "salary," "training," "manual," "parts only."

The result: CTR jumped from 4–6% to **11–12%**. Quality Score climbed from 2.43 to **3.72**, with top keywords (GE Oven, Bosch Oven, Samsung Refrigerator) hitting QS 7.

Impression Share went from **20% to 50%**. Lost impression share shifted from "Lost by Rank" to "Lost by Budget" — which is a good problem to have. Budget scales; rank without quality doesn't.

## Stage 3: Keyword-Based RSAs

I built the RSAs around micro-intents from the start, following best practices: the query → ad → landing page pipeline needs to be as tight as possible. H1 = the main keyword of the group. H2–H9 = repeating USPs. H10–H15 = the remaining group keywords, each as its own headline. All 54 descriptions include the main keyword verbatim.

After the initial upload, some ads came back with "Low" Ad Strength. I reviewed each one, rebuilt it, and pushed everything to "Good"–"Excellent." CTR gained another 2–3 percentage points.

## Stage 4: Performance Max

Two weeks after launching the Search campaigns, I added Performance Max. Started with one PMax campaign for refrigerator repair at $10/day.

**Day one:** 2,625 impressions, 27 clicks, 1 conversion. For comparison — all Search campaigns combined had produced 2 conversions in the previous two weeks.

Over 19 days, PMax Refrigerator delivered:

- **37 conversions**, CPA **$6.17**
- 11,365 impressions, 422 clicks
- Best day: 13 conversions, CPA $2.39

PMax was so effective that I launched two more:

- **Luxury Refrigerator PMax** — dedicated landing page at `/services/luxury-refrigerator-repair`, targeting owners of Sub-Zero, Viking, and Thermador. Launched May 12.
- **Washer/Dryer PMax** — landing page optimized for PMax traffic: symptom blocks, brand line, expanded FAQ. Launched May 13.

PMax is now the main conversion driver. Out of 63 total conversions across all new campaigns, 54 came from the three PMax campaigns. Overall PMax CPA: **$7.30**.

## The Numbers

Before vs after the rebuild. "Before" = campaigns the owner set up himself (March 20 – April 13). "After" = my campaigns (April 13 – May 15).

| Metric | Old Campaigns | New Campaigns |
|--------|--------------|---------------|
| Period | Mar 20 – Apr 13 (25 days) | Apr 13 – May 15 (33 days) |
| Spend | $839 | $1,718 |
| Conversions | 4 | **63** |
| CPA (blended) | $210 | **$27** |
| CPA (Search) | — | $147 |
| CPA (PMax) | — | **$7.30** |
| Quality Score | 2.43 | **3.72** |
| Impression Share | 20% | **50.6%** |

The gap between Search and PMax is massive: CPA $147 vs $7.30 — a 20x difference. PMax delivered 54 of 63 conversions on $394 spend, while Search produced 9 conversions on $1,323.

Why is Search CPA so high? Some Search campaigns (washer-dryer, dishwasher, appliance) spent budget with zero conversions and were later paused. This is normal during the testing phase — not every micro-intent performs equally.

I'll be straight: not everything is fixed. The main bottleneck remains — **Landing Page Experience**. The Lovable site is a CSR-only SPA. The server returns identical HTML for all 78 pages. Googlebot doesn't see the content, and QS loses 3–4 points because of it.

The fix is either Prerender.io (~$15/month) or a static HTML fallback. That's the next step.

## Three Takeaways for Anyone Running Google Ads

**1. Tracking isn't optional — it's the foundation.** Until Enhanced Conversions work and GA4 is linked to Google Ads, every optimization is blind. Setting up GTM took one day; without proper tracking, the next stages would've been useless.

**2. Micro-intents are about meaning, not keyword count.** When "washer repair," "maytag washer repair," and "washer not draining" sit in the same ad group, the system has no idea which ad to serve. Keywords in a group should be about the same thing. Two keywords or six — doesn't matter if they share the same intent.

**3. Performance Max can be an order of magnitude cheaper than Search.** In this case, PMax delivered CPA $7.30 vs $147 in Search — a 20x difference. If you run a local service business with a clear offer, try PMax with a small budget. It might surprise you the way it surprised me here.

*Read also: [Performance Max vs Search: What Works Better for Local Business](/en/blog/pmax-vs-search-local-business/) — PMax vs Search data from the same case study.*

## FAQ

**Why was CPA so high to begin with?**
Low Quality Score (1–3) → high CPC ($22–98) → few clicks → Smart Bidding can't learn → CPA $210. Plus 88% of keywords had zero impressions, and broken tracking missed some conversions entirely.

**How long did the rebuild take?**
Tracking — 1 day. Micro-intents and RSAs — 3 days. PMax launch — 1 day per campaign. Full cycle from audit to first results — 2 weeks.

**Why is PMax so much cheaper than Search?**
PMax uses all formats (Search, Display, YouTube, Discovery) and automatically finds the right audience. Search is limited to the search results page only. Plus PMax learns faster from conversion data — it needs fewer conversions to exit the learning phase.

**Does PMax work for any local business?**
Not every one. You need at least basic conversion tracking and landing pages with unique content. If your site is a no-code SPA serving identical HTML for every page, fix Landing Page Experience first.

If your Google Ads account is showing CPA 2–4x above industry benchmarks — [reach out](https://t.me/vlasdobry). I'll take a look.
