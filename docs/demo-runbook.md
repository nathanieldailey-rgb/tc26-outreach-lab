# Seven-Minute Committee Demo Runbook

## Purpose and posture

Use this 7:00 demonstration first with the Outreach Working Group and then with the committee. Introduce it as a co-chair-led prototype that is ready for collaboration—not an official site, adopted program, or endorsed committee position.

The full run works from a **verified deployed preview** without an API key. In that state, Ask visibly returns deterministic preview mode answers from the same site-owned knowledge entries and DOI metadata used by live mode.

`npm run dev` starts plain Vite for a UI-only rehearsal. Plain Vite does not serve `/api/ask`, so the local Vite URL cannot support the Ask segment. Do not present that local interface as a full-stack demonstration.

## Before the room joins

1. Run `npm ci`, `npm test -- --run`, and `npm run build` on the demo branch.
2. Open the verified deployed preview URL created during Task 5 and confirm that the Ask endpoint returns preview mode.
3. Leave `ASK_LIVE_ENABLED=false` and `OPENAI_API_KEY` empty for the safest repeatable path. If live mode has already been configured on that preview, confirm the exact-origin allowlist, durable Redis limits, dedicated project key and budget control before the meeting; never weaken those controls just for the demonstration.
4. Open the repository contribution page in a second tab.
5. Keep a static screenshot of the research desk available in case the display connection fails.

Never paste a key during the meeting. Do not improvise an answer as an official position if the public corpus says it is insufficient.

## The 7:00 flow

### 0:00–0:45 — Orient the room (45 seconds)

Say: “This is a discovery and interpretation layer for the committee's publication program. The 20-record library is cross-volume: 19 topic reports plus the synthesis, not one conventional bound issue.” Point to the prototype notice, article, Ask, Library, and Videos paths in the first view.

### 0:45–2:00 — Read, then reach the paper (75 seconds)

Open the featured article, “Outreach is part of the safety architecture.” Show that the prose is project-original, select one supporting source, and use **Read the full paper** to demonstrate the DOI path. Return to the prototype without dwelling on the publisher page.

### 2:00–3:30 — Ask a public question (90 seconds)

Submit: **“Why is outreach part of space traffic management?”**

Call out four trust cues: the pre-submit privacy warning, the visible preview mode or live mode label, the source list with DOI links, and the limitation notice. With live mode disabled, explain that the deterministic answer keeps the demo useful without disguising itself as model output. With live mode enabled, note that the server sends the question, bounded site-owned public context, and a pseudonymous safety identifier to OpenAI; `store: false` does not promise zero abuse-monitoring retention.

### 3:30–4:30 — Navigate the research (60 seconds)

Search the library for **reentry**, clear it, then search **Moon to Mars**. Explain the five editorial clusters and the reason each result links outward instead of reproducing the paper.

### 4:30–5:30 — Show the explainer storyboard (60 seconds)

Open the explainer studio. Press Play, Pause, Next, and Previous, then scrub the labeled range control. Point out that it never starts automatically and that reduced-motion preferences keep progression manual.

### 5:30–7:00 — Invite collaboration and decisions (90 seconds)

Open the GitHub contribution path. Show the article-pitch lane, feature-request lane, pull-request review checklist, and content-rights boundary. Close by asking for the committee decisions below rather than implying they have already been made.

## Committee decisions to request

1. Sponsor and final public name.
2. Permission, if any, to use organizational marks.
3. Editorial board, maintainers, and approval workflow.
4. Authors and topics for the first outreach series.
5. Written publisher guidance for future uses beyond metadata and links.
6. Owner and budget for hosting, a dedicated project LLM key, its spend controls, and ongoing operation of the durable rate limit.
7. Video priorities, narrators, captions, transcripts, and accessibility review.

## Fallbacks

- **No API key:** proceed normally; the Ask panel labels preview mode.
- **Model unavailable:** identify the transparent preview fallback and continue.
- **Network unavailable:** use the UI-only local site, describe DOI links without opening them, and skip the Ask submission rather than implying the local interface has an API.
- **Shortened agenda:** show the research desk, one Ask response, and the contribution page in three minutes.
- **Rights question:** open `CONTENT_POLICY.md`; do not speculate about permission.
