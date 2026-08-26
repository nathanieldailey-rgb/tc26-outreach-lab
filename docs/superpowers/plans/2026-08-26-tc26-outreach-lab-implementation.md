# TC26 Outreach Lab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build, verify, publish as a preview, and prepare for public GitHub collaboration a clean-room TC26 outreach demonstrator with original editorial content, DOI pathways, source-bounded Q&A, and an explainer storyboard.

**Architecture:** A Vite/React/TypeScript client reads committed publication and editorial modules. A Vercel-compatible `/api/ask` function performs deterministic retrieval over site-owned knowledge and optionally calls the OpenAI Responses API server-side with `store:false`; without a key it returns a visibly labeled deterministic preview answer.

**Tech Stack:** React 19, Vite 8, TypeScript 7, Vitest 4, Testing Library, Playwright, Vercel Functions, OpenAI Responses REST API, GitHub Actions.

---

## File map

- `package.json` — scripts, runtime dependencies, coverage gate.
- `src/content/publications.ts` — 20 verified publication records and DOI links.
- `src/content/articles.ts` — original public-facing article copy.
- `src/content/knowledge.ts` — public-safe retrieval entries.
- `src/lib/retrieval.ts` — deterministic ranking and preview answer composition.
- `api/ask.ts` — input validation, throttling, optional OpenAI call, response contract.
- `src/components/*` — editorial interface, library, Q&A, and storyboard.
- `src/styles.css` — tokens, responsive layout, accessible states, reduced motion.
- `tests/*` and `e2e/*` — unit, component, integration, and browser journeys.
- `.github/*` — CI and contributor workflows.
- `README.md`, `CONTRIBUTING.md`, `CONTENT_POLICY.md` — public project and rights boundaries.

### Task 1: Establish the public-safe content and retrieval core

**Files:**
- Create: `package.json`, TypeScript/Vite/Vitest configuration, `index.html`
- Create: `src/content/publications.ts`
- Create: `src/content/articles.ts`
- Create: `src/content/knowledge.ts`
- Create: `src/lib/retrieval.ts`
- Test: `tests/content.test.ts`, `tests/retrieval.test.ts`

- [ ] **Step 1: Write failing content-integrity tests**

Test that the publication library contains 20 unique DOI records, the 19 topic reports plus synthesis are represented, DOI URLs use HTTPS, every article links to existing publication slugs, and no banned corpus markers or employer references occur.

- [ ] **Step 2: Write failing retrieval tests**

Test empty-query rejection, relevant ranking for `outreach`, `reentry`, `large constellations`, and `Moon to Mars`, source de-duplication, and deterministic preview output.

- [ ] **Step 3: Run RED gate**

Run: `npm test -- --run tests/content.test.ts tests/retrieval.test.ts`

Expected: FAIL because the content and retrieval modules do not exist.

- [ ] **Step 4: Implement minimal content and retrieval**

Use these core interfaces:

```ts
export type Publication = {
  slug: string
  sequence: number | 'S'
  title: string
  journal: 'Acta Astronautica' | 'Journal of Space Safety Engineering'
  volume: string
  year: number
  pages: string
  doi: string
  cluster: TopicCluster
  kind: 'topic-report' | 'synthesis'
}

export type KnowledgeEntry = {
  slug: string
  title: string
  text: string
  keywords: string[]
  sourceSlugs: string[]
}
```

`retrieveKnowledge(question, limit)` normalizes Unicode, removes stopwords, scores weighted title/keyword/text overlap, and returns stable score-descending results. `composePreviewAnswer` uses only returned entries and labels its limits.

- [ ] **Step 5: Run GREEN and coverage gates**

Run: `npm test -- --run tests/content.test.ts tests/retrieval.test.ts`

Expected: all tests pass.

Run: `npm run test:coverage`

Expected: at least 80% statements, branches, functions, and lines for the tested core.

- [ ] **Step 6: Commit**

Commit the verified RED test checkpoint, then the GREEN content/retrieval checkpoint with exact test evidence in the messages.

### Task 2: Build the editorial interface and explainer

**Files:**
- Create: `src/main.tsx`, `src/App.tsx`, `src/styles.css`
- Create: `src/components/Header.tsx`
- Create: `src/components/ResearchDesk.tsx`
- Create: `src/components/ArticleFeature.tsx`
- Create: `src/components/AskCommittee.tsx`
- Create: `src/components/PublicationLibrary.tsx`
- Create: `src/components/ExplainerStudio.tsx`
- Create: `src/components/Contribute.tsx`
- Test: `tests/app.test.tsx`, `tests/storyboard.test.ts`

- [ ] **Step 1: Write failing interface tests**

Test semantic page landmarks, prototype notice, featured article/DOI path, publication query/filter behavior, Ask input validation/status region, and storyboard play/pause/previous/next/range controls.

- [ ] **Step 2: Run RED gate**

Run: `npm test -- --run tests/app.test.tsx tests/storyboard.test.ts`

Expected: FAIL because the components do not exist.

- [ ] **Step 3: Implement the accessible interface**

The Ask contract is:

```ts
export type AskResponse = {
  answer: string
  mode: 'preview' | 'openai'
  sources: Array<{ title: string; href: string }>
  notice: string
}
```

Use native navigation, form, button, link, and range elements. Results update through `role="status"`/`aria-live="polite"`. The storyboard never auto-plays and respects reduced motion.

- [ ] **Step 4: Run GREEN and coverage gates**

Run: `npm test -- --run tests/app.test.tsx tests/storyboard.test.ts`

Expected: all tests pass.

Run: `npm run test:coverage`

Expected: global 80% thresholds pass.

- [ ] **Step 5: Commit**

Commit the RED interface checkpoint, then the GREEN UI checkpoint.

### Task 3: Add the source-bounded API and operational controls

**Files:**
- Create: `api/ask.ts`
- Create: `tests/ask-api.test.ts`
- Create: `.env.example`
- Create: `vercel.json`

- [ ] **Step 1: Write failing API tests**

Test method restrictions, JSON parsing, empty/oversized questions, preview mode without a key, live-mode request body with `store:false`, bounded output, server-only key use, upstream error fallback, source return, origin validation, and throttling.

- [ ] **Step 2: Run RED gate**

Run: `npm test -- --run tests/ask-api.test.ts`

Expected: FAIL because the API handler does not exist.

- [ ] **Step 3: Implement the function**

Call `https://api.openai.com/v1/responses` only on the server. The request body is:

```ts
{
  model: process.env.OPENAI_MODEL ?? 'gpt-5.6-luna',
  store: false,
  max_output_tokens: 450,
  instructions: SYSTEM_INSTRUCTIONS,
  input: boundedGroundedPrompt
}
```

Use `response.output_text` when present and otherwise collect output-text blocks. Never return environment values. If the key is absent or the upstream call fails, return a transparent preview response instead of breaking the demo.

- [ ] **Step 4: Run GREEN and coverage gates**

Run: `npm test -- --run tests/ask-api.test.ts`

Expected: all tests pass.

Run: `npm run test:coverage`

Expected: global 80% thresholds pass.

- [ ] **Step 5: Commit**

Commit the RED API checkpoint, then the GREEN API checkpoint.

### Task 4: Add collaboration, policy, CI, and demo documentation

**Files:**
- Create: `README.md`, `CONTRIBUTING.md`, `CONTENT_POLICY.md`, `LICENSE`
- Create: `docs/demo-runbook.md`, `docs/video-briefs.md`
- Create: `.github/ISSUE_TEMPLATE/article_pitch.yml`
- Create: `.github/ISSUE_TEMPLATE/feature_request.yml`
- Create: `.github/ISSUE_TEMPLATE/config.yml`
- Create: `.github/pull_request_template.md`
- Create: `.github/workflows/ci.yml`
- Create: `tests/repository-policy.test.ts`

- [ ] **Step 1: Write failing repository-policy tests**

Test that contributor and content-rights guidance exists, issue templates expose article/feature lanes, CI invokes tests/coverage/build/e2e, `.env.example` names but does not contain secrets, and no disallowed organization reference appears in public files.

- [ ] **Step 2: Run RED gate**

Run: `npm test -- --run tests/repository-policy.test.ts`

Expected: FAIL because collaboration files are missing.

- [ ] **Step 3: Implement collaboration and policy artifacts**

Document code licensing separately from content rights. Require contributors to identify source version, DOI, license/permission, and whether AI assistance was used. Make the article-pitch template collect audience, question, source links, author, and rights confirmation.

- [ ] **Step 4: Run GREEN gate**

Run: `npm test -- --run tests/repository-policy.test.ts`

Expected: all tests pass.

- [ ] **Step 5: Commit**

Commit the RED policy checkpoint, then the GREEN collaboration checkpoint.

### Task 5: Full verification, preview deployment, and GitHub handoff

**Files:**
- Create: `playwright.config.ts`, `e2e/demo.spec.ts`
- Update: `README.md` with verified preview/repository URLs only after creation

- [ ] **Step 1: Write and run browser journeys**

Test the landing view, article DOI path, library search, Ask preview response, storyboard controls, mobile reflow, keyboard focus, and absence of browser console errors.

Run: `npm run test:e2e`

Expected: all browser journeys pass.

- [ ] **Step 2: Run full local gates**

Run: `npm test -- --run`

Run: `npm run test:coverage`

Run: `npm run build`

Run: `npm run test:e2e`

Expected: zero failures and coverage at or above 80%.

- [ ] **Step 3: Audit clean-room boundary**

Run repository-wide searches for restricted corpus paths, employer identity, private hosts, secrets, local absolute paths, and publisher full text. Confirm the Git remote is absent or points only to the personal public repository.

- [ ] **Step 4: Deploy preview**

Create a Vercel preview deployment, not production. Record the preview and claim URL. Per deployment-skill guidance, do not independently fetch the Vercel preview URL.

- [ ] **Step 5: Create public GitHub repository when authentication is valid**

Create `nathanieldailey-rgb/tc26-outreach-lab` as public, add it as `origin`, push the verified branch to `main`, enable issues, and confirm repository visibility and CI status. If authentication remains expired, report this as the single external handoff action without exposing credentials.

- [ ] **Step 6: Final review and branch completion**

Dispatch final spec and code-quality reviews, address findings, rerun all gates, and use the finishing-a-development-branch workflow. Do not describe the prototype as officially adopted.
