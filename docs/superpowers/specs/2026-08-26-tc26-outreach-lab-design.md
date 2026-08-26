# TC26 Outreach Lab Design

**Status:** Co-chair-led prototype for Outreach Working Group and TC26 committee review

**Decision owner:** TC26 committee; this repository demonstrates a proposal and does not claim formal endorsement.

## Purpose

Build a public, collaborative outreach experience that makes Space Traffic Management (STM) understandable, provides a navigable path into the IAF-IAA-IISL TC26 publication program, and sends readers to publisher landing pages for the full papers.

The prototype must be useful in a live committee demonstration and structured so working-group members can immediately pitch articles, user-interface improvements, and future capabilities through GitHub.

## Evidence recovered

The publisher recognizes **IAF-IAA-IISL Space Traffic Management** as an Acta Astronautica special issue/article collection. It is a virtual, cross-volume collection rather than one conventional numbered issue. The 2025 synthesis report gathers 19 topical executive summaries and cites the 19 underlying working-group reports:

- 18 working-group reports in Acta Astronautica;
- one terminology report in the Journal of Space Safety Engineering; and
- one additional Acta Astronautica synthesis/capstone paper.

The public library therefore contains 20 records: 19 topic reports plus the capstone. Each record links to its DOI. The interface must explain the cross-volume structure plainly so users do not search for a nonexistent single bound issue.

## Product direction

The first viewport is an editorial research desk, not a marketing splash page. It immediately exposes:

1. the featured outreach article;
2. the publication library and its cross-volume structure;
3. the “Ask the Committee” question box; and
4. a visible prototype-status statement.

The tone is calm, international, technically literate, and readable by policy, operator, student, and public audiences. The memorable detail is an orbital “traffic line” that connects topic clusters and reappears as a restrained motion motif. No institutional logos are used until permission is documented.

## Primary user journeys

### Public reader

1. Understand what STM is and why it matters.
2. Open an original outreach article written for a general audience.
3. See which committee paper supports or extends the topic.
4. Follow the DOI link to the publisher’s read/purchase page.

### Curious questioner

1. Ask a plain-language STM question.
2. Receive a concise answer grounded only in site-owned editorial material, committee-approved Q&A, and bibliographic metadata.
3. See the sources used and follow their DOI links.
4. See an explicit limitation when the available public corpus does not support an answer.

### Working-group contributor

1. Open the public repository.
2. Use an article-pitch or feature-request template.
3. Submit editorial copy or code through a pull request.
4. Pass automated content-integrity, unit, accessibility, build, and end-to-end checks.

### Committee reviewer

1. Understand what is live, what is proposed, and what is not yet official.
2. Review the public-content and AI boundaries.
3. Decide whether to adopt the prototype, rename it, authorize marks, nominate maintainers, and approve a publication cadence.

## Scope for the demonstrator

### Included

- Responsive single-page editorial experience.
- Searchable/filterable 20-record publication library.
- Three original outreach articles or article prototypes, each linking to relevant DOI records.
- “Ask the Committee” question-and-answer experience.
- Server-side OpenAI Responses API integration when a project key is configured.
- Deterministic source-bounded preview mode when no API key is configured.
- Three explainer-video briefs and one interactive storyboard player.
- Public contribution workflow, issue templates, pull-request template, CI, and content policy.
- Clear prototype, copyright, AI, and non-endorsement notices.

### Excluded from this prototype

- Publisher PDFs, subscription abstracts, full text, or embeddings.
- Any previously harvested subscription corpus.
- Publisher scraping.
- Official IAF, IAA, IISL, or journal marks without permission.
- User accounts, saved chat history, analytics, payments, or mailing lists.
- Claims that AI output is an official committee position.
- Production launch or formal committee adoption.

## Content and rights model

The repository contains only:

- factual bibliographic metadata;
- links to DOI/publisher pages;
- original outreach prose created for this project;
- committee-approved material contributed with documented rights; and
- short source descriptions written independently for navigation.

No publisher-owned article text enters the repository or the question-answer context unless its exact license has been reviewed and recorded. Open access alone is not treated as blanket permission; the specific license and source version must be documented.

The call to action is **Read the full paper**, which opens the DOI landing page in a new tab. The site is a discovery and interpretation layer, not a substitute for the papers.

## Ask the Committee design

### Retrieval

Retrieval is local and transparent. The server ranks site-owned knowledge entries by normalized token overlap and supplies the top entries to the model. Each entry carries a stable slug, title, short public-safe text, and one or more DOI or official sources.

### Generation

When `OPENAI_API_KEY` is available, a server-only function calls the OpenAI Responses API with:

- an environment-selectable model, defaulting to `gpt-5.6-luna`;
- `store: false`;
- a small output-token ceiling;
- the retrieved context only;
- instructions to distinguish evidence from interpretation;
- a refusal to invent committee positions; and
- a requirement to say when the context is insufficient.

The browser never receives the API key. The function returns the answer, retrieval sources, and mode. The application does not send publisher full text to OpenAI.

### Preview mode

Without an API key, the same endpoint returns a concise, deterministic answer composed from the strongest retrieved site-owned entries. This keeps the committee demonstration functional while making the mode visible. Preview mode is not represented as live model output.

### Abuse and cost controls

- Question length limit.
- Per-instance request throttling.
- Optional allowed-origin check.
- Bounded context and output.
- No tools, web search, file search, persistent vector stores, or conversation storage.
- Generic public-user safety identifier derived from a one-way hash of request data when live generation is enabled.

## Information architecture

1. **Header:** prototype identity, section navigation, GitHub link.
2. **Research desk:** one-sentence value proposition, cross-volume fact, direct paths to Articles, Ask, Library, and Videos.
3. **Featured article:** complete original outreach story with publisher pathway.
4. **Ask the Committee:** question input, sample questions, answer, citations, mode, limitations.
5. **Topic map:** five editorial clusters—Foundations, Orbital Knowledge, Operations, Governance, and Future Domains.
6. **Publication library:** query, cluster filter, 20 DOI cards.
7. **Explainer studio:** one playable storyboard and two additional briefs.
8. **Contribute:** issue/PR pathways and requested committee decisions.
9. **Footer:** prototype, rights, and AI notices.

## Visual and interaction system

- Ink/navy text on warm paper with signal orange and cyan accents.
- Editorial serif display face with a neutral sans-serif interface face, using system-safe fallbacks.
- Fine rules, numbered references, and margin-note styling rather than nested cards.
- Responsive two-column research desk collapsing to one column.
- High-contrast visible focus rings, semantic headings, labeled controls, and minimum 24px targets.
- Motion only for orientation: orbit-line drift, answer reveal, and storyboard progression; all disabled by `prefers-reduced-motion`.

## Technical architecture

- Vite + React + TypeScript.
- Static content modules committed to the repository.
- Vercel-compatible serverless function at `/api/ask`.
- Vitest + Testing Library for unit/component/integration tests.
- Playwright for critical browser journeys.
- GitHub Actions for test, coverage, build, and end-to-end smoke checks.
- Preview deployment first; production publication requires a separate committee decision.

## Accessibility acceptance criteria

- WCAG 2.2 AA-oriented implementation.
- Complete keyboard access.
- Visible focus appearance.
- Semantic native controls.
- `aria-live` answer status.
- Text does not depend on color alone.
- Reflow works at narrow mobile widths and enlarged text.
- Storyboard has play/pause, previous/next, and a labeled range control; it never auto-plays.
- Reduced-motion preference is honored.

## Demonstration script

The default seven-minute demonstration is:

1. Explain the cross-volume collection (45 seconds).
2. Open the featured Outreach article and follow its DOI path (75 seconds).
3. Ask “Why is outreach part of space traffic management?” (90 seconds).
4. Search the library for “reentry” and “Moon to Mars” (60 seconds).
5. Play and scrub the explainer storyboard (60 seconds).
6. Open the GitHub contribution path and ask for committee decisions (90 seconds).

## Adoption decisions requested from the committee

1. Sponsor and final public name.
2. Permission to use organizational marks.
3. Editorial board and approval workflow.
4. Author invitations for the first derivative-article series.
5. Written publisher guidance for any future use beyond metadata and links.
6. Owner and budget for the LLM project key and hosting.
7. Video priorities, narrators, and accessibility review.

## Success criteria

- The prototype can be demonstrated without secrets.
- A live key can be added without changing client code.
- Every publication record resolves through a DOI.
- The repository and rendered site contain no employer branding, remotes, credentials, or restricted corpus content.
- A new contributor can pitch an article or feature from the repository landing page.
- Automated checks pass with at least 80% unit/integration coverage.
