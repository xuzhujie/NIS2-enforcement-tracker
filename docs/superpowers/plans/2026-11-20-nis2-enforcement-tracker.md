# NIS2 Enforcement Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a bilingual NIS2 enforcement tracker that makes Member State transposition status and official Commission decisions easy to compare, filter, inspect, and export.

**Architecture:** React + Vite with a small application shell in `src/App.tsx`, domain data and derived metrics separated under `src/data/`, focused display components under `src/components/`, and export/monitoring helpers kept outside the view layer. The first release is a static, source-first registry with an official-updates feed; current state and historical decision events remain separate objects so the same country is never counted as multiple cases.

**Tech Stack:** React, TypeScript, Vite, `lucide-react`, Node `tsx` test runner, Python standard library for the optional official-update monitor, CSS media queries for responsive behavior.

**Spec:** `docs/superpowers/specs/2026-11-20-nis2-enforcement-tracker-design.md`

## Global Constraints

- Use React + Vite; keep the curated registry in `src/data/` and the dynamic feed in `public/data/updates.json`.
- Default to Chinese with an English toggle persisted in `localStorage`; every user-facing status and evidence summary has a bilingual value.
- `current_status` is only `notified | referred_to_cjeu | unknown`; `reasoned_opinion` is a historical decision/event stage, not a current state in the 2026-11-20 snapshot.
- Treat “notified” as “已通知 / 欧委会状态页显示”; never label it “完全合规”.
- Seed three public decision batches: 2024-11-28 formal notices to 23 Member States, 2025-05-07 reasoned opinions to 19 Member States, and 2026-07-08 CJEU referrals for Ireland, Spain, France, and the Netherlands.
- Use one shared filtering model across the matrix, registry, decisions, timeline, charts, and exports; a decision-stage filter matches historical membership in that decision batch.
- Use concise bilingual evidence summaries plus official URLs; do not ship copied long excerpts or archive attachments.
- `DATA_AS_OF` and `last_verified_at` use the real verification date; the initial release target is `2026-11-20`.
- The first acceptance scope is local development and `npm run build`; no hosting target is assumed.
- Do not add a map library; the Member State matrix is a keyboard-accessible CSS grid.

## Review Focus

- Historical decision filters must include a referred country in the “reasoned opinion” view without changing its current status; test the distinction in the metrics and UI data helpers.
- A country can appear in multiple decision batches but must remain one country row and one matrix cell; test deduplication and counts.
- Missing national authority, CSIRT, SPOC, or measure data must render as an explicit unavailable value and never as an invented placeholder; test an incomplete fixture.
- Language switching and reload must preserve the selected language and current filters; exercise this in browser QA.
- Exports must represent the same filtered country and decision sets as the active UI, with escaped CSV values and bilingual evidence links; test each format.

---

### Task 1: Create the visual concept and project scaffold

**Files:**
- Create: `docs/superpowers/specs/assets/nis2-enforcement-tracker-concept.png`
- Create: `index.html`
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `src/main.tsx`
- Create: `src/index.css`
- Create: `src/App.css`

**Interfaces:**
- Produces: a React/Vite entry point at `src/main.tsx`, a buildable package with `dev`, `test`, `build`, and `lint` scripts, and the accepted visual reference used by later UI tasks.

- [ ] **Step 1: Generate the complete dashboard concept**

  Use the frontend visual concept workflow to create one readable desktop dashboard concept showing the dark-blue hero, KPI strip, filter bar, Member State matrix, public-decision rail, and compact source-first density. Preserve the selected design's colors, copy hierarchy, and component rhythm; do not generate a marketing landing page.

- [ ] **Step 2: Save the selected concept as a project reference**

  Place the accepted concept at `docs/superpowers/specs/assets/nis2-enforcement-tracker-concept.png`; record its native dimensions and the extracted design tokens in the implementation notes or task commentary so the browser screenshot can be compared at the same size.

- [ ] **Step 3: Write the minimal package and Vite scaffold**

  Create a package using React, React DOM, TypeScript, Vite, `@vitejs/plugin-react`, `lucide-react`, and `tsx`. Provide `npm run dev`, `npm test`, `npm run build`, and `npm run lint` scripts without adding a routing dependency.

- [ ] **Step 4: Add the root document and entry point**

  Set the document title to `NIS2 Enforcement Tracker`, load the React root, import `src/index.css` then `src/App.css`, and render `App` under `StrictMode`.

- [ ] **Step 5: Verify the empty shell builds**

  Run: `npm install && npm run build`

  Expected: TypeScript and Vite exit with code 0 and produce `dist/`.

### Task 2: Model the 27 Member States and three official decision batches

**Files:**
- Create: `src/data/nis2.ts`
- Create: `src/data/dashboardMetrics.ts`
- Create: `tests/dashboard_metrics.test.ts`

**Interfaces:**
- Consumes: the official source URLs and status semantics in the design spec.
- Produces: `Bilingual`, `EventItem`, `MemberStateRecord`, `PublicDecisionRecord`, `OfficialSource`, `UpdatesData`, `memberStates`, `publicDecisions`, `officialSources`, `DATA_AS_OF`, `getDashboardMetrics()`, `filterMemberStates()`, and `filterPublicDecisions()`.

- [ ] **Step 1: Write failing metric and filter tests**

  Add tests asserting:

  ```ts
  assert.equal(memberStates.length, 27)
  assert.equal(publicDecisions.length, 3)
  assert.equal(getDashboardMetrics(memberStates, publicDecisions).currentStatus.notified, 23)
  assert.equal(getDashboardMetrics(memberStates, publicDecisions).currentStatus.referred_to_cjeu, 4)
  assert.equal(filterPublicDecisions(publicDecisions, { decisionType: 'reasoned_opinion' }).length, 1)
  assert.equal(filterMemberStates(memberStates, publicDecisions, { decisionType: 'reasoned_opinion' }).length, 19)
  assert.equal(filterMemberStates(memberStates, publicDecisions, { currentStatus: 'referred_to_cjeu' }).length, 4)
  ```

  Include a fixture with missing `competent_authority`, `csirt`, and `spoc` and assert the helper preserves `undefined` so the UI can render an explicit unavailable label.

- [ ] **Step 2: Run the focused test to confirm it fails**

  Run: `npx tsx --test tests/dashboard_metrics.test.ts`

  Expected: FAIL because the data module and derived functions do not exist yet.

- [ ] **Step 3: Add shared bilingual types and source metadata**

  Define the exact record types from the spec, including `current_status: 'notified' | 'referred_to_cjeu' | 'unknown'`, the three decision types, event kinds, source refs, and the `Bilingual` helper. Store all official URLs in one source registry.

- [ ] **Step 4: Seed the 27 country records**

  Add one record per EU Member State. Mark Ireland, Spain, France, and the Netherlands as `referred_to_cjeu`; mark the other 23 as `notified` with the UI label “已通知 / 欧委会状态页显示”. Include national measure and authority details only when supported by an official country page; use empty optional fields otherwise. Attach the formal notice, reasoned opinion, and referral events by country code, with `evidence_snapshot` as a concise bilingual fact summary and `last_verified_at: '2026-11-20'`.

- [ ] **Step 5: Seed the three public decision batches**

  Create one record for each batch with date, type, country codes, source URL, legal basis, summary, and source metadata. Store the four public INFR references returned by the July 2026 public package for Ireland, Spain, France, and the Netherlands; do not invent references for the earlier batch records when the public source does not expose them.

- [ ] **Step 6: Implement shared filters and derived metrics**

  Implement current-status filtering separately from historical decision-stage filtering. `getDashboardMetrics()` must derive matrix counts, decision coverage, attention records, stage counts, timeline events, and chart lists from the supplied arrays without mutating them or double-counting countries.

- [ ] **Step 7: Run the focused tests to confirm they pass**

  Run: `npx tsx --test tests/dashboard_metrics.test.ts`

  Expected: PASS with all count, historical-stage, deduplication, and missing-metadata assertions green.

### Task 3: Implement the export contract

**Files:**
- Create: `src/lib/export.ts`
- Create: `tests/export.test.ts`

**Interfaces:**
- Consumes: filtered `MemberStateRecord[]`, filtered `PublicDecisionRecord[]`, `Language`, and the active filter state.
- Produces: `buildExportMarkdown()`, `buildExportJson()`, `buildExportCsv()`, and `triggerDownload()` with the formats defined in the spec.

- [ ] **Step 1: Write failing export tests**

  Assert that Markdown includes the export timestamp, active filters, country and decision sections; JSON includes `{ exported_at, language, filters, member_states, public_decisions }`; and CSV contains one row per country with `decision_ids` and `decision_stages`. Include quotes, commas, and line breaks in a fixture value and assert correct CSV escaping.

- [ ] **Step 2: Run the export tests to confirm they fail**

  Run: `npx tsx --test tests/export.test.ts`

  Expected: FAIL because the export helpers do not exist yet.

- [ ] **Step 3: Implement the three serializers**

  Keep the output deterministic except for `exported_at`; use the selected language for visible labels while preserving canonical codes, URLs, dates, and source metadata. Keep browser-only download behavior in `triggerDownload()` so pure serializers remain testable under Node.

- [ ] **Step 4: Run the export tests to confirm they pass**

  Run: `npx tsx --test tests/export.test.ts`

  Expected: PASS with stable field order and escaped values.

### Task 4: Build the dashboard shell, matrix, registry, decisions, timeline, and charts

**Files:**
- Create: `src/components/MemberStateMatrix.tsx`
- Create: `src/components/MemberStateRow.tsx`
- Create: `src/components/PublicDecisionCard.tsx`
- Create: `src/components/DashboardOverview.tsx`
- Create: `src/components/Timeline.tsx`
- Create: `src/components/Charts.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: data types and filters from `src/data/nis2.ts`, metrics from `src/data/dashboardMetrics.ts`, and export helpers from `src/lib/export.ts`.
- Produces: a semantic single-page app with tabs for dashboard, member states, public decisions, timeline, and charts; working local state for language, filters, tab selection, expanded country details, and export actions.

- [ ] **Step 1: Add the app state model in `App.tsx`**

  Define tab keys, `ALL` sentinel values, language initialization from `localStorage`, current-status and decision-stage filter state, and a single `useMemo` pipeline that returns `filteredMemberStates`, `filteredDecisions`, and `metrics`.

- [ ] **Step 2: Implement the hero, KPI strip, and filter bar**

  Render the NIS2 title, directive link, data-as-of text, bilingual switch, KPI cards, status filters, decision filters, country selector, clear action, and Markdown/JSON/CSV export controls. The KPI values must come from `getDashboardMetrics()`, not hardcoded JSX.

- [ ] **Step 3: Implement the country matrix and expandable detail**

  Build a keyboard-accessible grid with one cell per filtered country. Each cell shows code, country name, current status, latest stage, and an explicit attention marker when applicable. Expanding a cell reveals national measure, authority/CSIRT/SPOC fields, event history, evidence snapshot, and official source links.

- [ ] **Step 4: Implement the registry and decision views**

  Render the full 27-country registry with stable columns at desktop and stacked rows on mobile. Render the three public decisions as source-first cards/rows with date, stage, covered country count, INFR references, summary, evidence snapshot, and external links.

- [ ] **Step 5: Implement dashboard overview, timeline, and charts**

  Add the attention queue, freshness panel, official updates panel, unified event timeline, CSS bar charts for current status and decision-stage coverage, and rule/source sections. Ensure the decision-stage filter visibly states that it is filtering historical participation.

- [ ] **Step 6: Add accessible and resilient empty states**

  Render “没有符合条件的记录 / No records match the filters” for empty country or decision results, keep missing authority fields explicit, and set focus-visible styles on all interactive controls.

- [ ] **Step 7: Run type checking/build verification**

  Run: `npm run lint && npm run build`

  Expected: TypeScript and Vite exit with code 0 with no unresolved imports or JSX errors.

### Task 5: Apply the accepted visual system and responsive layout

**Files:**
- Modify: `src/App.css`
- Modify: `src/index.css`
- Modify: `index.html`

**Interfaces:**
- Consumes: the accepted concept at `docs/superpowers/specs/assets/nis2-enforcement-tracker-concept.png` and the component class names from Task 4.
- Produces: a visually faithful desktop and mobile implementation with no unapproved major component families.

- [ ] **Step 1: Extract and record design tokens**

  Set the concept's background temperature, deep-blue hero gradient, text/muted/border colors, semantic status colors, spacing scale, radii, shadows, typography, and icon sizing as CSS variables or shared rules.

- [ ] **Step 2: Style the first viewport**

  Match the concept's hero height, title scale, metric rhythm, filter density, container width, and matrix entrance. Keep real controls code-native and use Lucide icons for navigation, filters, dates, sources, and status cues.

- [ ] **Step 3: Style secondary surfaces**

  Implement tabs, registry rows, decision cards, timeline rail, charts, update feed, rule callouts, sources, and footer using shared surface rules instead of one-off styles.

- [ ] **Step 4: Add responsive behavior**

  Verify the 27-cell matrix, registry, filter bar, hero KPI strip, and source grid at 1440px and 390px. Use wrapping/stacking rather than horizontal page overflow; keep source links and detail controls reachable.

- [ ] **Step 5: Run the build again**

  Run: `npm run build`

  Expected: PASS after all style changes.

### Task 6: Add the official-updates feed and monitor helper

**Files:**
- Create: `public/data/updates.json`
- Create: `scripts/check_updates.py`
- Create: `tests/test_check_updates.py`

**Interfaces:**
- Consumes: official EU Commission feed/page URLs and NIS2 keyword filters.
- Produces: a deterministic `updates.json` shape with `updated_at` and `items`, plus a monitor script that only writes when the normalized item set changes.

- [ ] **Step 1: Write parser tests against an inline RSS/HTML fixture**

  Assert that a relevant NIS2 item is retained, unrelated cybersecurity items are ignored, dates are normalized, duplicate links are removed, and a no-change run leaves the existing JSON content unchanged.

- [ ] **Step 2: Run the Python tests to confirm they fail**

  Run: `python3 -m unittest discover -s tests -p 'test_check_updates.py' -v`

  Expected: FAIL because the script and fixture helpers do not exist yet.

- [ ] **Step 3: Implement the standard-library monitor**

  Use `urllib.request`, `xml.etree.ElementTree`, `json`, and `hashlib` or stable JSON comparison. Keep network fetching isolated behind a function that accepts a URL/open function so tests do not require network access. Filter official NIS2 / transposition / infringement terms and write only changed normalized content.

- [ ] **Step 4: Seed the static feed**

  Add a small source-first `updates.json` with the currently relevant official NIS2 policy, transposition, and CJEU-referral links; include concise summaries and the last refresh date.

- [ ] **Step 5: Run the Python tests and frontend build**

  Run: `python3 -m unittest discover -s tests -p 'test_check_updates.py' -v && npm run build`

  Expected: PASS for parser behavior and frontend build.

### Task 7: Execute the browser QA loop and repair visual/interaction issues

**Files:**
- Modify: any implementation file that fails the checks above.
- Create outside the repo: temporary Playwright script and screenshots under `/private/tmp` or the system temporary directory.

**Interfaces:**
- Consumes: the running Vite app, accepted concept screenshot, and all completed UI/data tasks.
- Produces: verified desktop/mobile screenshots and a concise mismatch ledger for the final handoff.

- [ ] **Step 1: Start the dev server on the repo's exact host/port**

  Run the package's dev script and record the URL used for QA. If the Browser plugin is unavailable, use Playwright and record that fallback reason.

- [ ] **Step 2: Verify page identity and first viewport**

  Confirm title, URL, meaningful DOM content, no framework overlay, no console errors, and a screenshot at desktop size. Compare against the accepted concept using `view_image` on both images in the same QA pass.

- [ ] **Step 3: Exercise the target interaction flow**

  Flow under test: app loads → select `CJEU 转交` → matrix and decision summary reduce to four countries → expand Ireland → evidence/source details appear → switch to `reasoned opinion` historical decision filter → 19 countries appear → export JSON → output contains the same filtered sets.

- [ ] **Step 4: Verify mobile behavior**

  Capture a 390px-wide screenshot, confirm no page-level horizontal overflow, and verify filter controls, matrix cells, country details, decision links, and language toggle remain usable.

- [ ] **Step 5: Repair all fixable visual or interaction mismatches**

  Keep a short ledger with concept evidence, rendered evidence, mismatch, and fix. Re-run the relevant browser checks after each repair; do not stop at a build-only pass.

- [ ] **Step 6: Run the final verification commands**

  Run: `npm test && python3 -m unittest discover -s tests -v && npm run lint && npm run build`

  Expected: all tests pass, lint/type check passes, and Vite build exits 0 before claiming completion.

