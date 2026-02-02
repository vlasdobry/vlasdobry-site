---
title: "How to Check Your Website's SEO: 8-Point Checklist"
description: "Free tools and a simple checklist for quick SEO audit. Find critical errors in 10 minutes."
date: 2026-02-02
dateModified: 2026-02-02
slug: kak-proverit-seo-sayta
category: seo
tags:
  - seo
  - audit
  - checklist
  - tools
relatedService: /en/services/seo
cover: cover.jpg
---

**TL;DR:** Check 8 basic parameters: Title, Description, H1, robots.txt, sitemap.xml, HTTPS, mobile version, and page speed. Takes 10 minutes and reveals critical issues. For deeper analysis, you need a full audit.

Clients often ask: "How do I know if my website's SEO is okay?" The answer is simple — you can check the basics yourself, no specialist needed. Here's how.

## What to Check

Eight parameters that affect indexing and ranking. If even one is broken, your site loses positions.

### 1. Title Tag

**What it is:** The text in the browser tab and search results.

**How to check:** Open your site, look at the tab. Or find `<title>` in the page source.

**What it should be:**
- 50-60 characters
- Keyword at the beginning
- Unique for each page

**Common mistakes:**
- "Home" or "Welcome" instead of description
- Same Title on all pages
- Too long (gets cut off in search results)

### 2. Meta Description

**What it is:** Page description in search results (gray text under the title).

**How to check:** Find `<meta name="description">` in page source.

**What it should be:**
- 120-160 characters
- Contains keyword
- Call to action or benefit

**Common mistakes:**
- Missing entirely
- Same on all pages
- First paragraph copied verbatim

### 3. H1 Heading

**What it is:** The main heading on the page.

**How to check:** Find `<h1>` in page source. Should be exactly one.

**What it should be:**
- One H1 per page
- Contains keyword
- Different from Title

**Common mistakes:**
- Multiple H1s on the page
- H1 missing
- Logo wrapped in H1

### 4. robots.txt

**What it is:** Instructions file for search engine bots.

**How to check:** Open `yoursite.com/robots.txt`

**What it should be:**
- File exists (not 404)
- Allows indexing of important pages
- Points to sitemap.xml

**Common mistakes:**
- File missing
- Blocks entire site (`Disallow: /`)
- Blocks important sections

### 5. sitemap.xml

**What it is:** Site map for search engines — list of all pages.

**How to check:** Open `yoursite.com/sitemap.xml`

**What it should be:**
- File exists
- Contains all important pages
- URLs are current (not 404)

**Common mistakes:**
- File missing
- Contains outdated URLs
- Doesn't update when pages are added

### 6. HTTPS

**What it is:** Secure connection (lock icon in address bar).

**How to check:** Look at the address bar — should be `https://`, not `http://`.

**What it should be:**
- Entire site on HTTPS
- No "mixed content" (images over HTTP)
- Redirect from HTTP to HTTPS

**Common mistakes:**
- Site on HTTP
- Some resources load over HTTP
- No redirect

### 7. Mobile Version

**What it is:** How the site looks on a phone.

**How to check:** Open the site on your phone or use [Google Mobile-Friendly Test](https://search.google.com/test/mobile-friendly).

**What it should be:**
- Text readable without zooming
- Buttons large enough to tap
- No horizontal scrolling

**Common mistakes:**
- Desktop version on mobile
- Text too small
- Elements overlapping

### 8. Page Speed

**What it is:** Time until page fully loads.

**How to check:** [PageSpeed Insights](https://pagespeed.web.dev/) from Google.

**What it should be:**
- Score 50+ for mobile
- LCP (main content load) < 2.5 sec
- No critical errors

**Common mistakes:**
- Heavy images without compression
- Too many external scripts
- No caching

## Free Tools

| What to check | Tool |
|---------------|------|
| Title, Description, H1 | [Screaming Frog](https://www.screamingfrog.co.uk/) (free up to 500 URLs) |
| robots.txt, sitemap.xml | Browser (just open the URL) |
| HTTPS | Browser (lock in address bar) |
| Mobile version | [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly) |
| Speed | [PageSpeed Insights](https://pagespeed.web.dev/) |
| Everything at once | [Ahrefs Webmaster Tools](https://ahrefs.com/webmaster-tools) (free) |

## What's Next

This checklist covers the basics. But SEO is more than 8 points. A full audit includes:

- Schema.org markup
- Internal linking
- Competitor analysis
- Backlink profile
- E-E-A-T signals
- Local SEO

On the [SEO Audit page](/en/services/seo/) there's a free Health Score — automatic check of these 8 parameters in 30 seconds.

## FAQ

**Can I rank my site with just this checklist?**
No. This is the minimum for indexing. To grow rankings, you need content, links, and user engagement work.

**How often should I check?**
After every major site update. Or monthly for maintenance.

**What if I find errors?**
Fix by priority: robots.txt and sitemap.xml first (affect indexing), then Title and Description (affect CTR), then everything else.
