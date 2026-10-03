# TC26 Outreach Lab

TC26 Outreach Lab is a **co-chair-led prototype** prepared for discussion by the Outreach Working Group and then the full committee. It is not an official committee publication, is not endorsed by the participating organizations, and does not claim committee adoption.

The demonstrator explores a public discovery layer for the IAF-IAA-IISL Space Traffic Management publication program. It gives a general audience an understandable starting point, then sends readers to canonical DOI landing pages for the complete papers.

## What the prototype demonstrates

- A searchable, cross-volume **20-record** public metadata collection: 19 topic reports plus one synthesis paper.
- **Three original outreach features** written for this project, each with a clear path to relevant DOI records.
- “Ask the Committee” in three transparent states: direct **catalog count**, deterministic **preview mode**, and server-side **live mode** powered by the OpenAI Responses API.
- Three short explainer-video concepts and a non-autoplay interactive storyboard.
- Public article-pitch, feature-request, and pull-request paths for working-group collaboration.

This is a cross-volume collection, not a single bound journal issue. Eighteen topic reports appear across several volumes of *Acta Astronautica*, one terminology report appears in the *Journal of Space Safety Engineering*, and the synthesis is an additional *Acta Astronautica* paper. The site contains bibliographic metadata and original interpretation—not publisher full text.

## Run the interface locally (UI-only)

Requirements: Node.js 24 and npm.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Open the local URL printed by Vite to review the editorial interface. This plain Vite server is UI-only: its `/api/ask` function is not available, so Ask submissions cannot complete in this mode.

Run the **full demonstration from a deployed preview** that includes the serverless function. On that preview, leaving `OPENAI_API_KEY` empty is intentional: the endpoint returns a visibly labeled deterministic preview mode answer. Verify the preview and its Ask response before a meeting.

### Ask modes on a deployed preview

Unqualified count questions such as “How many publications currently exist?” are answered directly from the publication records, with a **Catalog count** label and DOI links. Counts update with the catalog and do not spend OpenAI credit or use the paid-call allowance. Normal request validation, origin checks, and request-rate limits still apply. Topic-, year-, or journal-qualified questions are not treated as whole-catalog totals. This is the website's collection count, not a claim about all TC26 publications.

Set secrets only in the hosting provider or an ignored `.env.local` file. Never put an API key in source code, browser variables, screenshots, issues, or pull requests.

| Variable | Purpose |
| --- | --- |
| `ASK_LIVE_ENABLED` | Must be exactly `true` before the server will consider a live model call. It defaults to `false`. |
| `OPENAI_API_KEY` | Server-only project key required for live mode. Empty selects preview mode. |
| `OPENAI_MODEL` | Optional server-side model override; defaults to `gpt-4.1-mini`, which supports the structured Responses API output used here. |
| `ALLOWED_ORIGIN` | Required exact, comma-separated browser-origin allowlist for live mode. |
| `UPSTASH_REDIS_REST_URL` | Server-only durable Redis endpoint required for shared rate limiting. |
| `UPSTASH_REDIS_REST_TOKEN` | Server-only durable Redis credential required for shared rate limiting. |

When Redis is provisioned through Vercel Marketplace, the server also accepts its
`KV_REST_API_URL` and `KV_REST_API_TOKEN` pair. No secret copying or renaming is
needed. Explicit `UPSTASH_REDIS_REST_*` settings take precedence as a pair; a
partial pair keeps live mode disabled.

Live mode **fails closed** to a labeled deterministic preview unless every required setting is present and both durable limits succeed. The shared limits allow no more than **8 live calls per IP per minute** and **60 live calls in any 24-hour window** across serverless instances. A Redis timeout, rejection, or configuration error cannot fall through to a paid model call. Use a dedicated OpenAI project and set its own budget alert or spend limit as an independent backstop.

When live mode is enabled, the server sends the visitor's question, bounded site-owned public context, and a pseudonymous safety identifier to OpenAI. It sets `store: false`, but that setting is not a promise of zero abuse-monitoring retention. The form warns visitors before submission not to enter personal, confidential, controlled, or proprietary information. The API never sends journal PDFs, publisher abstracts, subscription text, or conversation history, and it falls back visibly if the model or validated structured output is unavailable.

Live Ask interprets ordinary questions against all eight site-owned summaries and all 20 publication records, rather than requiring exact-word retrieval matches. The complete JSON context remains capped at 12,000 characters. The strict keyword retriever is used only for the no-model preview/fallback. Out-of-scope responses with no supporting source receive a fixed limitation message, not unsourced model claims. DOI allowlisting, output validation, and both durable spending limits still apply. Full-paper findings are unavailable unless separately added through an authorized content workflow.

## Verify a change

```bash
npm test -- --run
npm run test:coverage
npm run build
```

Install Playwright's bundled Chromium once, then run the nine browser journeys:

```bash
npx playwright install chromium
npm run test:e2e
```

If a compatible Chromium installation is already available, `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` may optionally point to that executable for `npm run test:e2e`. Keep the machine-specific value in the shell; do not commit a local path.

The GitHub workflow repeats installation, the full test suite, coverage, the production build, Chromium installation, and the browser journeys on Node 24.

## Collaborate

Repository: [nathanieldailey-rgb/tc26-outreach-lab](https://github.com/nathanieldailey-rgb/tc26-outreach-lab)

- [Pitch an outreach article](https://github.com/nathanieldailey-rgb/tc26-outreach-lab/issues/new?template=article_pitch.yml)
- [Propose a feature](https://github.com/nathanieldailey-rgb/tc26-outreach-lab/issues/new?template=feature_request.yml)
- Submit a pull request after reading [CONTRIBUTING.md](CONTRIBUTING.md) and [CONTENT_POLICY.md](CONTENT_POLICY.md).

Source code is available under the MIT License. Editorial prose, scripts, storyboards, and media are not covered by that code license; their rights remain reserved pending a committee decision. Contributions require the explicit grant described in the content policy.

## Decisions requested from the committee

The demonstration is intended to support decisions about sponsorship and public naming, use of organizational marks, editorial review and maintainers, the first invited article series, publisher guidance, ownership of hosting and an LLM key, and priorities for narrated, captioned explainers.

See [the seven-minute demo runbook](docs/demo-runbook.md) and [the three video briefs](docs/video-briefs.md).
