# Empire Hotel LinkedIn Audit Implementation Plan

> **For the agent:** REQUIRED SUB-SKILL: Use $executing-plans to implement this plan task-by-task.

**Goal:** Produce a fact-checked LinkedIn post and five-slide carousel about the heading hierarchy on the Empire Hotel rooms page.

**Architecture:** Store all source notes and publication assets in one audit directory under `docs/content/linkedin-audits/empire-hotel-nyc/`. Use the official website as the primary source, a self-contained HTML carousel as the visual source, and render the final PDF and PNG/JPG slides from that HTML.

**Tech Stack:** Markdown, plain text, HTML/CSS, Chromium/Playwright or browser print-to-PDF, PDF image rendering.

---

### Task 1: Capture and validate evidence

**Files:**
- Create: `docs/content/linkedin-audits/empire-hotel-nyc/audit-notes.md`

1. Fetch the homepage, rooms page, robots.txt, sitemap.xml, and llms.txt from the official domain.
2. Record HTTP status, title, meta description, canonical, heading counts, Schema.org types, room names, and booking links.
3. Save only claims that can be reproduced from the fetched HTML.
4. Verify that the rooms page contains zero H1, zero H2, and nine room-name H3 headings.

### Task 2: Write and localize the LinkedIn copy

**Files:**
- Create: `docs/content/linkedin-audits/empire-hotel-nyc/post.md`
- Create: `docs/content/linkedin-audits/empire-hotel-nyc/linkedin-ready.txt`

1. Write an English post using the single-problem structure.
2. Keep the body free of external links and hashtags.
3. Add the UTM-tagged Health Score link as the first comment.
4. Run the copy through `$localizer` and remove translation-like phrasing, AI filler, unsupported causality, and inflated claims.

### Task 3: Build the five-slide carousel

**Files:**
- Create: `docs/content/linkedin-audits/empire-hotel-nyc/carousel.html`

1. Reuse the established light LinkedIn carousel visual system.
2. Build five fixed 1080x1080 slides.
3. Put evidence on slides 1-3, the corrected hierarchy on slide 4, and CTA on slide 5.
4. Ensure every number has a matching source in `audit-notes.md`.

### Task 4: Render publication assets

**Files:**
- Create: `docs/content/linkedin-audits/empire-hotel-nyc/carousel.pdf`
- Create: `docs/content/linkedin-audits/empire-hotel-nyc/slides/slide-01.jpg` through `slide-05.jpg`

1. Render the HTML to a five-page PDF with backgrounds enabled.
2. Convert each PDF page to a separate 1080x1080 image.
3. Verify page count, image dimensions, and visual legibility.

### Task 5: Final verification

1. Compare every claim in the post and carousel against `audit-notes.md`.
2. Check that no body link or hashtag is present.
3. Check that the first-comment link contains LinkedIn UTM parameters.
4. Confirm that all five slides fit without clipping and the PDF opens correctly.
5. Update `docs/content/pipeline-tracker.md` only after publication, not during preparation.