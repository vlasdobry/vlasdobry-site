# Widget Reliability Implementation Plan

> **For the agent:** REQUIRED SUB-SKILL: Use $executing-plans to implement this plan task-by-task.

**Goal:** Устранить ложные сообщения об отсутствующих файлах и таймауты SEO/GEO/168-ФЗ, сохранив частичный результат без штрафа за непроверенные параметры.

**Architecture:** Вынести полный жизненный цикл `fetch + redirects + body consume` в тестируемый Worker-модуль с единым `AbortController`, двумя повторами временных ошибок и явным `availability`. Скоринг нормализует результат только по доступному весу, а UI показывает покрытие проверки. Compliance использует тот же механизм для `HTMLRewriter`.

**Tech Stack:** Cloudflare Workers, TypeScript, React 19, Node `node:test`, esbuild, Vite.

---

### Task 1: Тестовый контур Worker и отменяемое чтение

**Files:**
- Create: `workers/health-score-proxy/tests/resource-fetch.test.mjs`
- Create: `workers/health-score-proxy/src/resource-fetch.ts`
- Modify: `package.json`

**Step 1: Write the failing test**

Создать Node-тест, который через esbuild импортирует реальный TypeScript-модуль и проверяет желаемый API:

```js
test('retries a timed out body twice and returns unavailable', async () => {
  let attempts = 0;
  const fetchImpl = async (_url, { signal }) => {
    attempts += 1;
    return new Response(new ReadableStream({
      start(controller) {
        signal.addEventListener('abort', () => controller.error(signal.reason));
      },
    }), { status: 200 });
  };

  const result = await fetchTextResource('https://example.com/', 'example.com', {
    fetchImpl,
    timeoutMs: 10,
    maxAttempts: 3,
    retryDelayMs: 0,
  });

  assert.equal(attempts, 3);
  assert.equal(result.availability, 'unavailable');
  assert.equal(result.status, 0);
});
```

Добавить отдельные тесты:

- первый timeout, второй успех → `found`, 2 попытки;
- HTTP 404 → `missing`, без повторов;
- HTTP 200 → `found` и ограничение `MAX_CONTENT_SIZE`;
- временный HTTP 503 → повторы и затем `unavailable`;
- запрещённый redirect → `unavailable`.

**Step 2: Run test to verify it fails**

Run: `node --test workers/health-score-proxy/tests/resource-fetch.test.mjs`

Expected: FAIL, модуль `resource-fetch.ts` отсутствует.

**Step 3: Write minimal implementation**

Создать экспортируемые типы и функции:

```ts
export type ResourceAvailability = 'found' | 'missing' | 'unavailable';

export interface FetchResult {
  url: string;
  status: number;
  content: string | null;
  error: string | null;
  responseTime: number;
  availability: ResourceAvailability;
  attempts: number;
  headers?: Record<string, string>;
}

export async function consumeResponseWithRetry<T>(
  url: string,
  expectedHost: string,
  consume: (response: Response) => Promise<T>,
  options?: FetchOptions,
): Promise<ConsumedResponse<T>>;

export async function fetchTextResource(
  url: string,
  expectedHost: string,
  options?: FetchOptions,
): Promise<FetchResult>;
```

Каждая попытка создаёт один `AbortController`; таймер очищается только после завершения `consume(response)`. При таймауте вызываются `controller.abort()` и `response.body?.cancel()`. Повторять timeout/network/408/425/429/500/502/503/504 максимум два раза после первой попытки. 404 не повторять.

**Step 4: Run test to verify it passes**

Run: `node --test workers/health-score-proxy/tests/resource-fetch.test.mjs`

Expected: PASS, все сценарии зелёные.

**Step 5: Add test command**

В `package.json` добавить:

```json
"test:worker": "node --test workers/health-score-proxy/tests/*.test.mjs"
```

**Step 6: Commit**

```bash
git add workers/health-score-proxy/src/resource-fetch.ts workers/health-score-proxy/tests/resource-fetch.test.mjs package.json
git commit -m "test(worker): cover resource retries and timeouts"
```

### Task 2: Подключение Health Score Worker к новому fetch-модулю

**Files:**
- Modify: `workers/health-score-proxy/src/index.ts:1-50, 470-510, 680-790`
- Test: `workers/health-score-proxy/tests/resource-fetch.test.mjs`

**Step 1: Write the failing test**

Добавить тест сериализации частичного результата: один ресурс `unavailable`, остальные `found`; общий payload сохраняет успешные ресурсы и не выдаёт `missing` для таймаута.

**Step 2: Run test to verify it fails**

Run: `npm run test:worker`

Expected: FAIL — старый результат не содержит `availability`/`attempts`.

**Step 3: Write minimal implementation**

- Импортировать `fetchTextResource` и тип `FetchResult`.
- Удалить старые `fetchWithSafeRedirects`, `readBodyWithTimeout`, `fetchResource`.
- Сохранить параллельную проверку пяти ресурсов, но каждый ресурс повторяется независимо.
- Кешировать payload только когда нет `availability === 'unavailable'`.
- Добавить `X-Partial-Result: true|false`.

**Step 4: Run tests**

Run: `npm run test:worker`

Expected: PASS.

**Step 5: Commit**

```bash
git add workers/health-score-proxy/src/index.ts workers/health-score-proxy/tests/resource-fetch.test.mjs
git commit -m "fix(worker): retry incomplete resource reads"
```

### Task 3: Частичный SEO/GEO скоринг без штрафа

**Files:**
- Modify: `src/utils/healthScore/types.ts`
- Modify: `src/utils/healthScore/seoScoring.ts`
- Modify: `src/utils/healthScore/geoScoring.ts`
- Modify: `src/utils/healthScore/index.ts`
- Create: `src/utils/healthScore/partialScoring.test.mjs`

**Step 1: Write the failing tests**

Через esbuild импортировать production scoring и проверить:

```js
test('does not penalize an unavailable sitemap', () => {
  const result = calculateSeoScore({
    homepage: found(HOME_HTML),
    robotsTxt: found(ROBOTS),
    sitemapXml: unavailable('Body read timeout'),
  });

  assert.equal(result.availableWeight, 88);
  assert.equal(result.unavailableChecks, 1);
  assert.ok(result.issues.some(issue => issue.title === 'sitemap.xml не удалось проверить'));
  assert.ok(!result.issues.some(issue => issue.title === 'sitemap.xml отсутствует'));
});
```

Добавить сценарии:

- настоящий 404 остаётся штрафом;
- недоступная homepage исключает шесть SEO-проверок, но robots/sitemap считаются;
- недоступная homepage исключает зависимые GEO-проверки;
- недоступный `robots.txt` исключает AI Access;
- частично недоступные LLM Files исключают только соответствующий вес 10/20;
- статус рассчитывается по нормализованному баллу, coverage сохраняется отдельно.

**Step 2: Run test to verify it fails**

Run: `node --test src/utils/healthScore/partialScoring.test.mjs`

Expected: FAIL — типов покрытия и логики исключения ещё нет.

**Step 3: Write minimal implementation**

Добавить `availability?: ResourceAvailability` с обратной совместимостью: отсутствие поля выводится из `status` (`404 → missing`, `0 → unavailable`, остальное по текущей логике).

Расширить `SeoHealthScore`/`GeoHealthScore`:

```ts
rawScore: number;
availableWeight: number;
totalWeight: 100;
checkedCount: number;
totalChecks: number;
unavailableChecks: number;
```

`total` остаётся нормализованным `Math.round(rawScore / availableWeight * 100)`, чтобы сохранить текущий круг `/100`. В issues добавлять `info` с текстом «не удалось проверить»; исключить ложные critical issues библиотеки для зависимостей недоступного ресурса.

**Step 4: Run scoring tests**

Run: `node --test src/utils/healthScore/partialScoring.test.mjs`

Expected: PASS.

**Step 5: Commit**

```bash
git add src/utils/healthScore
git commit -m "fix(score): exclude unavailable checks from score"
```

### Task 4: UI частичного результата и повтор Health Score

**Files:**
- Modify: `src/components/HealthScoreChecker.tsx:170-235, 380-490, 590-655`
- Modify: `src/i18n/types.ts`
- Modify: `src/i18n/ru.ts`
- Modify: `src/i18n/en.ts`
- Modify: `scripts/smoke-routes.js`

**Step 1: Write the failing smoke assertion**

Добавить проверку production bundle/source на тексты покрытия RU/EN и отсутствие старой логики «status 0 = отсутствует».

**Step 2: Run smoke to verify it fails**

Run: `npm run build && npm run smoke`

Expected: FAIL — UI покрытия отсутствует.

**Step 3: Write minimal implementation**

- Показывать «Проверено N из M параметров» рядом со Score.
- Для partial result показывать нейтральное уведомление «Некоторые параметры не удалось проверить; они не повлияли на оценку».
- Если Worker вернул partial HTTP 200, выполнить один фоновый повтор только недоступных ресурсов через повторный вызов Worker; после повтора всё равно показать частичный результат.
- Не показывать «Сайт недоступен» для временной ошибки homepage.

**Step 4: Run checks**

Run: `npm run typecheck && npm run build && npm run smoke`

Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/HealthScoreChecker.tsx src/i18n scripts/smoke-routes.js
git commit -m "fix(widget): explain partial health score results"
```

### Task 5: Контролируемый Compliance timeout и повтор

**Files:**
- Modify: `workers/health-score-proxy/src/index.ts:98-420`
- Modify: `src/components/ComplianceChecker.tsx:200-305, 600-650`
- Modify: `src/i18n/types.ts`
- Modify: `src/i18n/ru.ts`
- Modify: `src/i18n/en.ts`
- Test: `workers/health-score-proxy/tests/resource-fetch.test.mjs`

**Step 1: Write the failing test**

Проверить, что `consumeResponseWithRetry` держит timeout активным во время consumer (`response.text()`/аналог HTMLRewriter), отменяет зависший body и успешно возвращает результат после второго вызова.

**Step 2: Run test to verify it fails**

Run: `npm run test:worker`

Expected: FAIL на consumer lifecycle.

**Step 3: Write minimal implementation**

- Запускать `HTMLRewriter.transform(response).text()` внутри callback `consumeResponseWithRetry`.
- После исчерпания повторов возвращать `errorCode: 'temporarily_unavailable'`, а не неоднозначный текст исключения.
- Клиент показывает «Не удалось проверить сейчас» без утверждения о медленном сайте и предлагает повтор.
- Убрать ложный performance-вывод из client timeout.

**Step 4: Run tests and checks**

Run: `npm run test:worker && npm run typecheck && npm run build && npm run smoke`

Expected: PASS.

**Step 5: Commit**

```bash
git add workers/health-score-proxy src/components/ComplianceChecker.tsx src/i18n
git commit -m "fix(compliance): bound body processing and retry"
```

### Task 6: Финальная проверка

**Files:**
- Modify: `CLAUDE.md`
- Modify: `.agents/rules/project-status.md`

**Step 1: Update documentation**

Описать `availability`, независимые повторы, coverage и новый текст временной ошибки.

**Step 2: Run full local gate**

Run: `npm run test:worker && npm run check`

Expected: exit 0, все тесты и quality gate проходят.

**Step 3: Review diff**

Run: `git diff --check && git status --short`

Expected: нет whitespace errors; в коммиты попали только файлы задачи, чужие изменения сохранены.

**Step 4: Deploy through existing workflow**

После явного подтверждения пользователя выполнить push в `master`; дождаться успешных `quality-gate`, `deploy-worker`, `build-and-push`, `deploy`.

**Step 5: Production verification**

Запустить не менее трёх последовательных проверок:

- `/services/seo/` → `vlasdobry.ru`;
- `/services/geo/` → `vlasdobry.ru`;
- `/168-fz/` → `vlasdobry.ru`.

Проверить, что временный сбой отображается как «не удалось проверить» без штрафа, настоящий 404 остаётся отсутствующим ресурсом, а успешные повторы завершаются полным результатом.

**Step 6: Commit docs**

```bash
git add -f CLAUDE.md .agents/rules/project-status.md
git commit -m "docs: document reliable widget checks"
```
