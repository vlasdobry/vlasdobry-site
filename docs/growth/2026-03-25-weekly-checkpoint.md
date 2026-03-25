# Weekly Product Review — vlasdobry.ru

Date: 2026-03-25
Framework: Product Growth (`$product-growth`)
Stage: Early -> Growth transition

## Sources

- Yandex Metrika (`106407494`) — fresh traffic, sources, goals, devices as of 2026-03-25
- Yandex Webmaster (`https:vlasdobry.ru:443`) — fresh indexation snapshot as of 2026-03-25
- `AGENTS.md` — last confirmed site metrics snapshot as of 2026-03-15
- Google Search Console (`sc-domain:vlasdobry.ru`) — fresh data for 2026-03-15..2026-03-24
- Google Sheet `Growth Experiments — vlasdobry.ru`
- Google Tasks list `vlasdobry.ru`

## Metrics

### North Star Metric

- NSM: Health Score completions / week
- Last confirmed level: about `2/week`
- Goal: `15/week`
- Status: not growing yet

### Acquisition

- Fresh Yandex Metrika, last 7 days:
  - `9 visits`, `9 users`
  - bounce rate: `33.33%`
  - avg time: `3m 32s`
  - depth: `1.4 pages/visit`
- Fresh Yandex Metrika, last 30 days:
  - `90 visits`, `70 users`
  - bounce rate: `38.89%`
  - avg time: `2m 20s`
  - depth: `1.9 pages/visit`
- Fresh Yandex Metrika sources, last 30 days:
  - `Direct`: `57 visits`
  - `Search`: `17 visits`
  - `Link`: `14 visits`
  - `Internal`: `2 visits`
- Fresh Google Search Console trend:
  - 2026-03-05..2026-03-14: `6 clicks`, `359 impressions`
  - 2026-03-15..2026-03-24: `3 clicks`, `213 impressions`
- Interpretation: search visibility is still present, but the last 10-day window is weaker than the previous one in both impressions and clicks

### Activation

- Fresh Yandex Metrika funnel, last 30 days:
  - Health Score: `13 starts -> 10 completions -> 3 errors -> 0 CTA clicks`
  - completion rate: `76.9%`
  - error rate: `23.1%`
  - 168-FZ: `9 starts -> 5 completions -> 3 errors -> 2 CTA clicks`
  - blog Health Score CTA: `1 click`
- Interpretation: activation is acceptable for Health Score, and 168-FZ is already producing stronger post-result intent than the main Health Score offer

### Retention

- No reliable fresh retention dataset is currently stored in the project docs
- Proxy signal: repeated experiments on the same funnel are still possible because traffic exists, but there is no proof of meaningful return usage yet

### Revenue

- No direct revenue signal recorded for the current weekly checkpoint
- Current business objective remains first qualified inbound lead from content / tools

### Main Drop-Off

- Health Score CTA conversion remains the core bottleneck:
  - `0 CTA clicks` after `10 completions` in the fresh 30-day Metrika snapshot
- Error rate is still too high:
  - `23.1%` in the fresh 30-day Metrika snapshot

## Product

### Main User Problem

The product can generate curiosity and some completions, but it still does not convert that attention into a clear next action for service demand.

### Magic Moment

Current best candidate for magic moment:

- user runs a site check and receives a concrete score/result

Current issue:

- this moment creates information value, but not enough buying intent

### What Can Be Removed

- No need to add more CTA design iterations right now
- No need to expand Health Score surface area until the offer and post-result path are clearer

### Growth Loop Status

- Health Score loop: weak
  - traffic -> tool start -> completion works
  - completion -> CTA -> lead does not work
- Content loop around 168-FZ: promising
  - the EN 168-FZ blog page is the strongest page in the fresh GSC page breakdown (`167 impressions`, `1 click`, avg position `5.5`)
  - Yandex Webmaster also shows direct evidence of demand: `168-фз проверка англицизмов сервис` generated `1 click` with average position `32.0`

## Search Visibility

- Fresh Yandex Webmaster summary:
  - SQI: `10`
  - pages in search: `41`
  - excluded: `0`
- Fresh Yandex Webmaster indexing trend, last 30 days:
  - pages in search: `41` (`+20`)
  - downloaded `2xx` pages: `1` (`-28`)
- Interpretation: index coverage has grown, but crawl/download activity is weak and should be watched together with mobile performance and internal linking

## Experiment Review

### Experiment 1: CTA redesign in Health Score

- Status: `FAIL`
- Result: `0` Health Score CTA clicks after redesign
- Learning: the bottleneck is not button styling; the offer and intent mismatch are deeper

### Experiment 2: Blog CTA to Health Score

- Status: `INCONCLUSIVE`
- Result: `0` clicks, but traffic volume was too low
- Learning: do not kill this experiment yet; reassess only after blog traffic grows

### Experiment 3: Lower Health Score error rate

- Status: `FAIL`
- Result: error rate improved only from `27%` to `25%`
- Learning: retry logic alone is not enough; likely the issue is target-site timeout / UX around slow scans

## What Accelerates Growth Most

The fastest path to growth is to double down on the content angle that already shows search demand and align the offer with that intent, instead of trying more cosmetic CTA changes inside Health Score.

## Top 3 Priorities

1. `📈 EN-first GEO контент: отслеживание индексации и трафика`
Reason: this is the only growth path with fresh external signal and visible search traction.

2. `🏨 Итерация 4: PPC для отелей — страница + контент`
Reason: it aligns with the strategic direction and creates a clearer commercial intent than generic tool traffic.

3. `🚀 Mobile Performance: LCP 7с -> <2.5с`
Reason: faster first load improves both acquisition efficiency and tool starts, especially on mobile.

## Hypothesis For Next Iteration

If we shift effort from CTA cosmetics to intent-aligned content and commercial paths, then we will get a better lead-generation signal than from additional Health Score CTA experiments.

## Success Metric

For the next iteration, success is:

- at least `1 qualified lead signal` from content or service pages
or
- at least `5 Health Score completions/week` as an intermediate step

## Decisions

- Keep blog CTA in place
- Stop prioritizing new cosmetic CTA tests for Health Score
- Treat 168-FZ / EN-first content as the strongest evidence-backed acquisition wedge
- Prioritize commercial-intent content for hotels and PPC over generic funnel polish

## Data Gaps

- Fresh retention / repeat-usage data is not yet tracked in a stable weekly format
- Weekly checkpoint storage should continue in repo docs plus the `Growth Experiments` sheet
