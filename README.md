# TC26 Outreach Lab

TC26 Outreach Lab is a **co-chair-led prototype** prepared for discussion by the Outreach Working Group and then the full committee. It is not an official committee publication, is not endorsed by the participating organizations, and does not claim committee adoption.

The demonstrator explores a public discovery layer for the IAF-IAA-IISL Space Traffic Management publication program. It gives a general audience an understandable starting point, then sends readers to canonical DOI landing pages for the complete papers.

## What the prototype demonstrates

- A searchable, cross-volume **20-record** public metadata collection: 19 topic reports plus one synthesis paper.
- **Three original outreach features** written for this project, each with a clear path to relevant DOI records.
- “Ask the Committee” in two transparent states: deterministic **preview mode** and server-side **live mode** powered by the OpenAI Responses API.
- Three short explainer-video concepts and a non-autoplay interactive storyboard.
- Public article-pitch, feature-request, and pull-request paths for working-group collaboration.

This is a cross-volume collection, not a single bound journal issue. Eighteen topic reports appear across several volumes of *Acta Astronautica*, one terminology report appears in the *Journal of Space Safety Engineering*, and the synthesis is an additional *Acta Astronautica* paper. The site contains bibliographic metadata and original interpretation—not publisher full text.

## Run the demonstrator locally

Requirements: Node.js 24 and npm.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Open the local URL printed by Vite. Leaving `OPENAI_API_KEY` empty is intentional and keeps the full demonstration available in preview mode.

### Live Ask mode

Set secrets only in the hosting provider or an ignored `.env.local` file. Never put an API key in source code, browser variables, screenshots, issues, or pull requests.

| Variable | Purpose |
| --- | --- |
| `OPENAI_API_KEY` | Optional server-only project key. Empty selects preview mode. |
| `OPENAI_MODEL` | Optional server-side model override; the example uses `gpt-5.6-luna`. |
| `ALLOWED_ORIGIN` | Optional comma-separated list of exact browser origins allowed to call the endpoint. |

The current request throttle is deliberately **per-instance** and protects only a committee demonstration. A public release with sustained traffic needs a durable rate limit shared across serverless instances. No durable-store environment variables are supported yet; they should be named in `.env.example` only after a reviewed implementation actually consumes them.

The API sends bounded site-owned context, sets `store: false`, and falls back visibly to preview mode if no key is configured or the upstream model is unavailable. It does not send journal PDFs, publisher abstracts, subscription text, or conversation history.

## Verify a change

```bash
npm test -- --run
npm run test:coverage
npm run build
```

The GitHub workflow repeats installation, the full test suite, coverage, and the production build on Node 24. Browser journeys join the workflow when the Playwright configuration is present.

## Collaborate

Repository: [nathanieldailey-rgb/tc26-outreach-lab](https://github.com/nathanieldailey-rgb/tc26-outreach-lab)

- [Pitch an outreach article](https://github.com/nathanieldailey-rgb/tc26-outreach-lab/issues/new?template=article_pitch.yml)
- [Propose a feature](https://github.com/nathanieldailey-rgb/tc26-outreach-lab/issues/new?template=feature_request.yml)
- Submit a pull request after reading [CONTRIBUTING.md](CONTRIBUTING.md) and [CONTENT_POLICY.md](CONTENT_POLICY.md).

Source code is available under the MIT License. Editorial prose, scripts, storyboards, and media are not covered by that code license; their rights remain reserved pending a committee decision. Contributions require the explicit grant described in the content policy.

## Decisions requested from the committee

The demonstration is intended to support decisions about sponsorship and public naming, use of organizational marks, editorial review and maintainers, the first invited article series, publisher guidance, ownership of hosting and an LLM key, and priorities for narrated, captioned explainers.

See [the seven-minute demo runbook](docs/demo-runbook.md) and [the three video briefs](docs/video-briefs.md).
