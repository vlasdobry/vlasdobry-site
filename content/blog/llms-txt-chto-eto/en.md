---
title: "llms.txt: What It Is and Why Your Website Needs One"
description: "What is llms.txt, how to create it, and where to place it. Examples for different industries, specification, common mistakes."
date: 2026-02-22
dateModified: 2026-02-22
slug: llms-txt-chto-eto
category: geo
tags:
  - geo
  - llms-txt
  - chatgpt
  - ai
  - guide
relatedService: /en/services/geo
cover: cover.jpg
---

**TL;DR:** llms.txt is a text file at your site root that tells AI systems about your business. It works like robots.txt, but instead of restricting access, it helps neural networks understand what you do. Takes about 15 minutes to create.

When ChatGPT or Perplexity answers a question about your niche, they crawl dozens of websites for information. The problem: without clear guidance, the AI might misunderstand your business. Or skip you entirely.

The llms.txt file solves this. It tells AI: "Here's who we are, what we do, and the facts."

## What Is llms.txt

llms.txt is a Markdown text file placed at `https://yoursite.com/llms.txt`. The specification was proposed in 2024 as a standard for website-to-LLM communication.

The idea is simple: if robots.txt tells bots where they can and can't go, llms.txt tells them what matters on your site. It's a voluntary "business card" for neural networks.

The format is already supported by ChatGPT, Claude, Perplexity, and other AI systems. The file doesn't guarantee you'll be quoted. But without it, your chances are lower.

## Format Specification

The llms.txt file follows a simple Markdown structure:

```
# Company Name

> Brief description (1-2 sentences)

## Section 1
- Item: description
- Item: description

## Section 2
- Item: description
```

Required elements:
- **H1 heading** — company or project name
- **Blockquote** — brief description of what you do
- **H2 sections** — services, contacts, facts, links to key pages

### Rules

1. **ASCII characters only.** No emojis, special characters, or Unicode decorations. AI parsers can choke on them.
2. **Facts, not marketing.** "200+ clients served" is good. "Industry leader" is useless. Neural networks detect marketing fluff.
3. **Keep it current.** Added a service or changed contact info? Update the file.

## Examples for Different Industries

### For a Hotel

```
# Grand Hotel Miami

> Four-star beachfront hotel in Miami Beach. 120 rooms, restaurant, full-service spa.

## Accommodation
- Standard: from $250/night, 270 sq ft, city view
- Suite: from $500/night, 480 sq ft, ocean view
- Family: from $350/night, 375 sq ft, extra bed available

## Amenities
- Restaurant: breakfast included, buffet style
- Spa: pool, sauna, massage therapy
- Airport transfer: MIA, 25 minutes

## Contact
- Website: https://grand-hotel-miami.com
- Phone: +1 (305) XXX-XXXX
- Address: 123 Ocean Drive, Miami Beach, FL 33139

## Key Facts
- Operating since 2015
- 4.7 rating on Google Maps
- 3-minute walk to the beach
```

### For a Marketing Agency

```
# Digital Agency Pro

> Performance marketing agency. SEO, paid advertising, analytics.

## Services
- SEO Audit: comprehensive analysis across 7 areas
- GEO Optimization: visibility in AI search engines
- Paid Advertising: Google Ads, Meta Ads
- Analytics: end-to-end tracking, custom dashboards

## Results
- Average organic traffic growth: +150% in 6 months
- 50+ projects in hospitality, healthcare, EdTech
- Client ROAS: 2x to 10x

## Contact
- Website: https://agency-pro.com
- Email: hello@agency-pro.com
- LinkedIn: /company/agencypro
```

### For a Medical Practice

```
# Wellness Medical Center

> Multi-specialty clinic in Austin, TX. Diagnostics, treatment, preventive care.

## Specialties
- Primary Care: visits from $150
- Dentistry: from $200
- MRI Diagnostics: from $500
- Lab Tests: from $50

## Providers
- 30+ specialists
- Average experience: 15 years
- Board-certified physicians

## Contact
- Address: 456 Health Ave, Austin, TX 78701
- Phone: +1 (512) XXX-XXXX
- Online scheduling: https://wellness-center.com/book

## Key Facts
- Licensed and accredited
- Serving patients since 2010
- 50,000+ patients annually
```

## llms-full.txt — The Extended Version

The specification recommends creating two files:

- **llms.txt** — a brief business card (what we covered above)
- **llms-full.txt** — your full site content in Markdown

llms-full.txt is for deep analysis. Include all service descriptions, blog articles, case studies, FAQ. If llms.txt is a resume, llms-full.txt is the full dossier.

In practice, I recommend starting with llms.txt. If AI systems are already driving traffic and you want to strengthen your position, add llms-full.txt.

## Common Mistakes

**Marketing slogans instead of facts.** "We're the best in the market" is useless. AI can't verify this and ignores it. Write verifiable facts: "10 years in business," "200+ clients," "4.8 rating."

**Outdated information.** Changed your phone number, removed a service, relocated? If llms.txt isn't updated, AI will quote old information. Worse than having no file at all.

**File too long.** llms.txt is a business card, not a novel. 30-50 lines is enough. Use llms-full.txt for details.

**Using HTML or formatting.** The file must be clean Markdown. No HTML tags, CSS, or JavaScript. Just text, headings, lists, and blockquotes.

## How to Check If It Works

Three ways:

1. **Open in your browser** `https://yoursite.com/llms.txt` — it should display as plain text
2. **Ask ChatGPT** about your company — if the file is indexed, answers become more accurate
3. **Check automatically** — the [GEO optimization](/en/services/geo/) page has a Health Score that verifies your llms.txt in 30 seconds

## FAQ

**Is llms.txt mandatory?**
No, it's a voluntary standard. But without it, AI systems gather information on their own and can get things wrong. The file improves accuracy and citation chances.

**How often should I update llms.txt?**
With every significant change: new service, updated contacts, new case studies. At minimum, review it quarterly.

**Does llms.txt replace Schema.org?**
No. These are different [GEO optimization](/en/blog/geo-optimizaciya-sajta-gajd/) tools. Schema.org is markup inside HTML pages. llms.txt is a separate file for AI. Best results come from using both.
